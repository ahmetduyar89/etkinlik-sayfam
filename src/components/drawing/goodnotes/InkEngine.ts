import type { InkPoint, BrushConfig } from './types';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const distance = (a: InkPoint, b: InkPoint) => Math.hypot(a.x - b.x, a.y - b.y);
const cubic = (a: number, b: number, c: number, d: number, t: number) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
/** Catmull–Rom centreline, including pressure, time and stylus orientation. */
export function interpolate(points: InkPoint[], interpolateRotation = false): InkPoint[] {
    if (points.length < 3)
        return points;
    const result: InkPoint[] = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)];
        // Bound tessellation work for very long tablet samples.
        const steps = Math.min(24, Math.max(1, Math.ceil(distance(b, c) / 2)));
        for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            result.push({ ...b, x: cubic(a.x, b.x, c.x, d.x, t), y: cubic(a.y, b.y, c.y, d.y, t),
                p: clamp((b.p ?? .5) * (1 - t) + (c.p ?? .5) * t),
                velocity: (b.velocity ?? 0) * (1 - t) + (c.velocity ?? 0) * t,
                tiltX: (b.tiltX ?? 0) * (1 - t) + (c.tiltX ?? 0) * t,
                tiltY: (b.tiltY ?? 0) * (1 - t) + (c.tiltY ?? 0) * t,
                ...(interpolateRotation ? { twist: ((b.twist ?? 0) + (((c.twist ?? 0) - (b.twist ?? 0) + 540) % 360 - 180) * t + 360) % 360 } : {}),
                timestamp: (b.timestamp ?? 0) * (1 - t) + (c.timestamp ?? 0) * t });
        }
    }
    return result;
}
/** Width is exactly constant for the ballpoint, independent of all sensor input. */
function unboundedBrushWidth(point: InkPoint, tangent: InkPoint, config: BrushConfig): number {
    if (config.pen === 'ballpoint')
        return config.width;
    const p = clamp(point.p ?? .5), response = clamp(config.sensitivity);
    if (config.pen === 'brush')
        return config.width * (1 - response + response * (.12 + 2.55 * Math.pow(p, 1.8))) *
            (config.settings ? 1 - .18 * clamp((point.velocity ?? 0) / 1800) : 1);
    const speed = clamp((point.velocity ?? 0) / 1800);
    const tilt = Math.hypot(point.tiltX ?? 0, point.tiltY ?? 0);
    const hasRotation = config.settings ? point.twist !== undefined : !!point.twist;
    const angle = hasRotation ? (point.twist ?? 0) * Math.PI / 180 : tilt > 5 ? Math.atan2(point.tiltY ?? 0, point.tiltX ?? 0) : Math.PI / 4;
    const nx = -tangent.y, ny = tangent.x;
    const major = nx * Math.cos(angle) + ny * Math.sin(angle), minor = -nx * Math.sin(angle) + ny * Math.cos(angle);
    const nib = Math.hypot(major, minor * (.72 - .48 * clamp(config.sharpness)));
    return config.width * (1 + response * (p - .5) * 1.3) * (1 - .35 * speed) * nib;
}
export function brushWidth(point: InkPoint, tangent: InkPoint, config: BrushConfig): number {
    const width = unboundedBrushWidth(point, tangent, config);
    return config.settings ? clamp(width, config.settings.minWidth, config.settings.maxWidth) : width;
}
/** Filled left/right ribbon with round caps; live brush tails never retract. */
export function ribbonOutline(raw: InkPoint[], config: BrushConfig): InkPoint[] {
    const filtered: InkPoint[] = [];
    for (const p of raw) {
        const last = filtered[filtered.length - 1];
        if (last && distance(last, p) <= .001)
            filtered[filtered.length - 1] = p;
        else
            filtered.push(p);
    }
    if (!filtered.length)
        return [];
    const points = interpolate(filtered, !!config.settings);
    if (points.length === 1) {
        const p = points[0], r = brushWidth(p, { x: 1, y: 0 }, config) / 2;
        return Array.from({ length: 24 }, (_, i) => ({ x: p.x + Math.cos(i * Math.PI / 12) * r, y: p.y + Math.sin(i * Math.PI / 12) * r }));
    }
    const lengths = [0];
    for (let i = 1; i < points.length; i++)
        lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
    const total = lengths[lengths.length - 1], left: InkPoint[] = [], right: InkPoint[] = [], radii: number[] = [], angles: number[] = [];
    let previousRadius: number | undefined;
    for (let i = 0; i < points.length; i++) {
        const prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
        const dx = next.x - prev.x, dy = next.y - prev.y, len = Math.hypot(dx, dy) || 1;
        const tangent = { x: dx / len, y: dy / len };
        let r = brushWidth(points[i], tangent, config) / 2;
        if (config.settings) {
            r = clamp(r, config.settings.minWidth / 2, config.settings.maxWidth / 2);
            // Time-based lerp stays consistent across 60/120/240 Hz input rates.
            const dt = Math.max(.1, (points[i].timestamp ?? i * 8) - (points[Math.max(0, i - 1)].timestamp ?? (i - 1) * 8));
            const factor = clamp(config.settings.smoothingFactor);
            const alpha = factor === 0 ? 1 : 1 - Math.exp(-dt / (2 + 22 * factor));
            r = previousRadius === undefined ? r : previousRadius + alpha * (r - previousRadius);
            previousRadius = r;
        }
        if (config.pen === 'brush' && config.complete && total > config.width * 2) {
            const tail = Math.min(total * .3, config.width * 5);
            r *= .04 + .96 * Math.pow(clamp((total - lengths[i]) / tail), .8);
        }
        radii.push(r);
        angles.push(Math.atan2(dy, dx));
        left.push({ x: points[i].x - tangent.y * r, y: points[i].y + tangent.x * r });
        right.push({ x: points[i].x + tangent.y * r, y: points[i].y - tangent.x * r });
    }
    const arc = (p: InkPoint, r: number, start: number) => Array.from({ length: 11 }, (_, i) => ({ x: p.x + Math.cos(start - (i + 1) * Math.PI / 12) * r, y: p.y + Math.sin(start - (i + 1) * Math.PI / 12) * r }));
    const last = points.length - 1;
    return [...left, ...arc(points[last], radii[last], angles[last] + Math.PI / 2), ...right.reverse(), ...arc(points[0], radii[0], angles[0] - Math.PI / 2)];
}
export function outlinePath(outline: InkPoint[]): Path2D {
    const path = new Path2D();
    if (outline.length) {
        path.moveTo(outline[0].x, outline[0].y);
        for (const p of outline.slice(1))
            path.lineTo(p.x, p.y);
        path.closePath();
    }
    return path;
}
