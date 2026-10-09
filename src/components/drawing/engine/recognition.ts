import { clamp, distance, type Point, type RecognizedShape, type ShapeRecognizer } from './models';
import { resample, segmentDistance, simplifyRDP, snapLineEnd, transformShape } from './geometry';

export const RECOGNITION = Object.freeze({ epsilon: 4, lineError: 8, closure: 25, minSpan: 32, radialVariation: .18 });
const length = (points: readonly Point[]) => points.reduce((sum, p, i) => sum + (i ? distance(points[i - 1], p) : 0), 0);
const turn = (a: Point, b: Point, c: Point) => Math.acos(clamp(((b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y)) / (distance(a, b) * distance(b, c) || 1), -1, 1));

function cornersOf(points: Point[]): Point[] {
    const start = points[0];
    let far = 1;
    for (let i = 2; i < points.length; i++) if (distance(start, points[i]) > distance(start, points[far])) far = i;
    const corners = [...simplifyRDP(points.slice(0, far + 1), RECOGNITION.epsilon).slice(0, -1),
        ...simplifyRDP([...points.slice(far), start], RECOGNITION.epsilon).slice(0, -1)];
    // A stroke can start midway along an edge. Remove that seam and small redundant corners.
    let changed = true;
    while (changed && corners.length > 3) {
        changed = false;
        for (let i = 0; i < corners.length; i++) {
            const a = corners[(i + corners.length - 1) % corners.length], b = corners[i], c = corners[(i + 1) % corners.length];
            if (distance(a, b) < 5 || turn(a, b, c) < 40 * Math.PI / 180) {
                corners.splice(i, 1); changed = true; break;
            }
        }
    }
    return corners;
}

function fitPolygon(points: Point[], corners: Point[]): RecognizedShape | null {
    if (corners.length !== 3 && corners.length !== 4) return null;
    // Prevent curved loops being forced into triangles by RDP corner reduction.
    const error = Math.sqrt(points.reduce((sum, p) => sum + Math.min(...corners.map((a, i) => segmentDistance(p, a, corners[(i + 1) % corners.length]))) ** 2, 0) / points.length);
    if (error > 5 || !corners.every((p, i) => turn(corners[(i + corners.length - 1) % corners.length], p, corners[(i + 1) % corners.length]) > 40 * Math.PI / 180)) return null;
    const area = Math.abs(corners.reduce((sum, p, i) => { const q = corners[(i + 1) % corners.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
    if (area < 100) return null;
    if (corners.length === 3) return { kind: 'polygon', points: corners, isClosed: true };
    if (!corners.every((b, i) => Math.abs(turn(corners[(i + 3) % 4], b, corners[(i + 1) % 4]) - Math.PI / 2) < 15 * Math.PI / 180)) return null;
    // Average opposing directions before projecting onto an orthogonal basis.
    const dx = corners[1].x - corners[0].x + corners[2].x - corners[3].x;
    const dy = corners[1].y - corners[0].y + corners[2].y - corners[3].y;
    const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    const us = corners.map(p => p.x * ux + p.y * uy), vs = corners.map(p => -p.x * uy + p.y * ux);
    const a = Math.min(...us), b = Math.max(...us), c = Math.min(...vs), d = Math.max(...vs);
    return { kind: 'polygon', isClosed: true, points: [[a, c], [b, c], [b, d], [a, d]].map(([u, v]) => ({ x: u * ux - v * uy, y: u * uy + v * ux })) };
}

function fitRound(points: Point[]): RecognizedShape | null {
    const samples = resample([...points, points[0]], 97).slice(0, -1);
    const center = samples.reduce((s, p) => ({ x: s.x + p.x / samples.length, y: s.y + p.y / samples.length }), { x: 0, y: 0 });
    let xx = 0, yy = 0, xy = 0;
    for (const p of samples) { const x = p.x - center.x, y = p.y - center.y; xx += x * x; yy += y * y; xy += x * y; }
    const rotation = .5 * Math.atan2(2 * xy, xx - yy), c = Math.cos(rotation), s = Math.sin(rotation);
    const projected = samples.map(p => ({ x: (p.x - center.x) * c + (p.y - center.y) * s, y: -(p.x - center.x) * s + (p.y - center.y) * c }));
    const xs = projected.map(p => p.x), ys = projected.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const rx = (x1 - x0) / 2, ry = (y1 - y0) / 2, ox = (x0 + x1) / 2, oy = (y0 + y1) / 2;
    const fittedCenter = { x: center.x + ox * c - oy * s, y: center.y + ox * s + oy * c };
    if (Math.min(rx, ry) < 10 || Math.max(rx, ry) / Math.min(rx, ry) > 8) return null;
    const radii = samples.map(p => distance(p, fittedCenter)), radius = radii.reduce((a, b) => a + b, 0) / radii.length;
    const cv = Math.sqrt(radii.reduce((sum, r) => sum + (r - radius) ** 2, 0) / radii.length) / radius;
    const normalizedError = Math.sqrt(projected.reduce((sum, p) => sum + (Math.hypot((p.x - ox) / rx, (p.y - oy) / ry) - 1) ** 2, 0) / projected.length);
    // Validate angular coverage and monotonic winding: reject scribbles and partial arcs.
    let winding = 0, travel = 0;
    for (let i = 1; i <= projected.length; i++) {
        const a = projected[i - 1], b = projected[i % projected.length];
        let delta = Math.atan2((b.y - oy) / ry, (b.x - ox) / rx) - Math.atan2((a.y - oy) / ry, (a.x - ox) / rx);
        delta = Math.atan2(Math.sin(delta), Math.cos(delta)); winding += delta; travel += Math.abs(delta);
    }
    if (Math.abs(winding) < 5.7 || travel > 7.6 || normalizedError > .09) return null;
    if (cv < RECOGNITION.radialVariation && Math.abs(rx - ry) / Math.max(rx, ry) < .15)
        return { kind: 'circle', center: fittedCenter, radius };
    // Normalized radius fitting is equivalent to an ellipse's constant two-focus sum.
    return { kind: 'ellipse', center: fittedCenter, radiusX: rx, radiusY: ry, rotation };
}

function fitArrow(points: Point[]): RecognizedShape | null {
    const start = points[0];
    let tip = 1;
    for (let i = 2; i < points.length; i++) if (distance(start, points[i]) > distance(start, points[tip])) tip = i;
    const end = points[tip], shaft = distance(start, end);
    if (shaft < 32 || tip >= points.length - 2 || length(points.slice(0, tip + 1)) > shaft * 1.2 ||
        !points.slice(0, tip + 1).every(p => segmentDistance(p, start, end) < 8)) return null;
    const ux = (end.x - start.x) / shaft, uy = (end.y - start.y) / shaft;
    const tail = points.slice(tip + 1);
    let left = 0, right = 0;
    for (const p of tail) {
        const back = -(p.x - end.x) * ux - (p.y - end.y) * uy;
        const side = -(p.x - end.x) * uy + (p.y - end.y) * ux;
        if (back < -4 || back > shaft * .5) return null;
        if (back > 4) { left = Math.max(left, side); right = Math.max(right, -side); }
    }
    if (left < 5 || right < 5 || length(tail) > shaft * 1.2) return null;
    const wing = tail.reduce((a, b) => distance(a, end) > distance(b, end) ? a : b);
    const headAngle = clamp(Math.atan2(Math.abs(-(wing.x - end.x) * uy + (wing.y - end.y) * ux), -(wing.x - end.x) * ux - (wing.y - end.y) * uy), Math.PI / 12, Math.PI / 3);
    return { kind: 'arrow', start, end: snapLineEnd(start, end), headAngle };
}

/** Stateless classifier; all thresholds are screen pixels, never zoom-dependent page units. */
export class GeometricShapeRecognizer implements ShapeRecognizer {
    recognize(raw: readonly Point[], scale = 1): RecognizedShape | null {
        if (!Number.isFinite(scale) || scale <= 0 || raw.length < 2 || raw.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
        const points: Point[] = [];
        for (const p of raw) {
            const q = { x: p.x * scale, y: p.y * scale };
            if (!points.length || distance(points[points.length - 1], q) >= 1) points.push(q);
        }
        const endpoint = { x: raw[raw.length - 1].x * scale, y: raw[raw.length - 1].y * scale };
        if (points.length && distance(points[points.length - 1], endpoint) > .01) points.push(endpoint);
        if (points.length < 2) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of points) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
        if (Math.hypot(maxX - minX, maxY - minY) < RECOGNITION.minSpan) return null;
        const reduced = simplifyRDP(points, RECOGNITION.epsilon), start = points[0], end = points[points.length - 1], gap = distance(start, end);
        let shape: RecognizedShape | null = null;
        if (gap >= 24 && length(reduced) <= gap * 1.2 && points.every(p => segmentDistance(p, start, end) < RECOGNITION.lineError))
            shape = { kind: 'line', start, end: snapLineEnd(start, end) };
        else if (points.length < 4) return null;
        else if (gap < RECOGNITION.closure) {
            const corners = cornersOf(points);
            // Curvature gate prevents a square's low radial variance from masquerading as a circle.
            shape = fitPolygon(points, corners) ?? fitRound(points);
        } else shape = fitArrow(points);
        return shape ? transformShape(shape, { x: 0, y: 0 }, { x: scale, y: 0 }, { x: 1, y: 0 }) : null;
    }
}
