import type { Point } from '../../../types';
import type { GoodnotesPen } from '../goodnotes/types';
import { brushWidth } from '../goodnotes/InkEngine';

/**
 * Ink v5 geometry.
 *
 * The v3/v4 ribbon offsets a left and right edge from the centreline. On tight
 * turns (small "e", "a", "o") those offsets cross each other and the filled
 * polygon shows notches. v5 avoids offset curves entirely:
 * - constant-width pens stroke the centreline with round caps/joins;
 * - variable-width pens fill a union of capsules (two circles + tangents),
 *   which is convex per segment and therefore cannot self-intersect.
 * The centreline uses centripetal Catmull–Rom, which does not overshoot or form
 * cusps when samples are unevenly spaced (low-rate smart-board input).
 */

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Document-unit spacing of generated centreline samples. */
export const SPLINE_STEP = 1.25;
const MAX_STEPS = 32;

function lerpPoint(b: Point, c: Point, t: number, x: number, y: number): Point {
    return {
        x, y,
        p: (b.p ?? .5) * (1 - t) + (c.p ?? .5) * t,
        velocity: (b.velocity ?? 0) * (1 - t) + (c.velocity ?? 0) * t,
        tiltX: (b.tiltX ?? 0) * (1 - t) + (c.tiltX ?? 0) * t,
        tiltY: (b.tiltY ?? 0) * (1 - t) + (c.tiltY ?? 0) * t,
        twist: b.twist,
        timestamp: (b.timestamp ?? 0) * (1 - t) + (c.timestamp ?? 0) * t,
    };
}

/** Removes zero-length repeats while keeping the newest attributes. */
export function dedupe(points: readonly Point[]): Point[] {
    const result: Point[] = [];
    for (const p of points) {
        const last = result[result.length - 1];
        if (last && dist(last, p) <= 1e-3) result[result.length - 1] = { ...p, x: last.x, y: last.y };
        else result.push(p);
    }
    return result;
}

/** Centripetal (α = 0.5) Catmull–Rom through every sample, Barry–Goldman form. */
export function centripetalSpline(input: readonly Point[], step = SPLINE_STEP): Point[] {
    const points = dedupe(input);
    if (points.length < 3) return points;
    const result: Point[] = [points[0]];
    const knot = (a: Point, b: Point) => Math.max(1e-4, Math.sqrt(dist(a, b)));
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
        const segment = dist(p1, p2);
        const steps = Math.min(MAX_STEPS, Math.max(1, Math.ceil(segment / step)));
        // End segments mirror the missing neighbour so the curve still leaves tangentially.
        const q0 = p0 === p1 ? { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y } : p0;
        const q3 = p3 === p2 ? { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y } : p3;
        const t0 = 0, t1 = t0 + knot(q0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, q3);
        for (let j = 1; j <= steps; j++) {
            const u = j / steps;
            if (j === steps) { result.push(p2); continue; }
            const t = t1 + (t2 - t1) * u;
            const mix = (a: { x: number; y: number }, b: { x: number; y: number }, ta: number, tb: number) => {
                const w = (tb - t) / (tb - ta);
                return { x: a.x * w + b.x * (1 - w), y: a.y * w + b.y * (1 - w) };
            };
            const a1 = mix(q0, p1, t0, t1), a2 = mix(p1, p2, t1, t2), a3 = mix(p2, q3, t2, t3);
            const b1 = mix(a1, a2, t0, t2), b2 = mix(a2, a3, t1, t3);
            const c = mix(b1, b2, t1, t2);
            result.push(lerpPoint(p1, p2, u, c.x, c.y));
        }
    }
    return result;
}

export interface InkV5Config {
    pen: GoodnotesPen;
    width: number;
    sharpness: number;
    sensitivity: number;
    complete: boolean;
}

/** Ballpoint ink is exactly constant; it is rendered as a round-joined line. */
export const isConstantWidth = (pen: GoodnotesPen) => pen === 'ballpoint';

/** Radius per centreline sample with time-based smoothing and brush taper. */
export function inkRadii(points: readonly Point[], config: InkV5Config): number[] {
    const min = config.width * .12, max = config.width * 2.8;
    const lengths = [0];
    for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + dist(points[i - 1], points[i]));
    const total = lengths[lengths.length - 1];
    const radii: number[] = [];
    let previous: number | undefined;
    for (let i = 0; i < points.length; i++) {
        const prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
        const dx = next.x - prev.x, dy = next.y - prev.y, len = Math.hypot(dx, dy) || 1;
        let r = clamp(brushWidth(points[i], { x: dx / len, y: dy / len }, { ...config, settings: undefined }), min, max) / 2;
        // Rate-independent smoothing: identical shape at 60, 120 and 240 Hz.
        const dt = Math.max(.1, (points[i].timestamp ?? i * 8) - (prev.timestamp ?? (i - 1) * 8));
        if (previous !== undefined) r = previous + (1 - Math.exp(-dt / 10)) * (r - previous);
        previous = r;
        if (config.pen === 'brush' && config.complete && total > config.width * 2) {
            const tail = Math.min(total * .3, config.width * 5);
            r *= .08 + .92 * Math.pow(clamp((total - lengths[i]) / tail), .8);
        }
        radii.push(Math.max(r, min / 2));
    }
    return radii;
}

/** Minimal path sink so geometry stays testable without a DOM. */
export interface PathSink {
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arc(x: number, y: number, r: number, start: number, end: number, ccw?: boolean): void;
    closePath(): void;
}

/** Centreline for `ctx.stroke()` with round caps; a single tap becomes a dot. */
export function traceCentreline(sink: PathSink, points: readonly Point[]): void {
    const line = centripetalSpline(points);
    if (!line.length) return;
    sink.moveTo(line[0].x, line[0].y);
    if (line.length === 1) { sink.lineTo(line[0].x + 1e-3, line[0].y); return; }
    for (let i = 1; i < line.length; i++) sink.lineTo(line[i].x, line[i].y);
}

/** Appends one convex capsule per segment; nonzero fill yields their union. */
export function traceCapsules(sink: PathSink, points: readonly Point[], config: InkV5Config): void {
    const line = centripetalSpline(points);
    if (!line.length) return;
    const radii = inkRadii(line, config);
    // Same (counter-clockwise) winding as the capsules, so nonzero fill never cancels overlaps.
    const circle = (p: Point, r: number) => { sink.moveTo(p.x + r, p.y); sink.arc(p.x, p.y, r, 0, -Math.PI * 2, true); sink.closePath(); };
    if (line.length === 1) { circle(line[0], radii[0]); return; }
    for (let i = 0; i < line.length - 1; i++) {
        const a = line[i], b = line[i + 1], ra = radii[i], rb = radii[i + 1];
        const d = dist(a, b);
        if (d <= Math.abs(ra - rb) + 1e-6) { circle(ra >= rb ? a : b, Math.max(ra, rb)); continue; }
        const theta = Math.atan2(b.y - a.y, b.x - a.x);
        const phi = Math.acos(clamp((ra - rb) / d, -1, 1));
        const up = theta + phi, down = theta - phi;
        sink.moveTo(a.x + Math.cos(up) * ra, a.y + Math.sin(up) * ra);
        sink.lineTo(b.x + Math.cos(up) * rb, b.y + Math.sin(up) * rb);
        sink.arc(b.x, b.y, rb, up, down, true);
        sink.lineTo(a.x + Math.cos(down) * ra, a.y + Math.sin(down) * ra);
        sink.arc(a.x, a.y, ra, down, up - Math.PI * 2, true);
        sink.closePath();
    }
}
