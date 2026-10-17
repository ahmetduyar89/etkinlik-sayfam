import { clamp, distance, type Point, type RecognizedShape } from './models';

export function segmentDistance(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1));
    return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
}

/** Iterative RDP: preserves original sample objects, avoids recursion/slice allocations. */
export function simplifyRDP<T extends Point>(points: readonly T[], epsilon = 4): T[] {
    if (points.length <= 2) return [...points];
    const keep = new Uint8Array(points.length);
    keep[0] = keep[points.length - 1] = 1;
    const stack = [0, points.length - 1];
    while (stack.length) {
        const end = stack.pop()!, start = stack.pop()!;
        let max = Math.max(0, epsilon), index = -1;
        for (let i = start + 1; i < end; i++) {
            const d = segmentDistance(points[i], points[start], points[end]);
            if (d > max) { max = d; index = i; }
        }
        if (index >= 0) { keep[index] = 1; stack.push(start, index, index, end); }
    }
    return points.filter((_, i) => keep[i]);
}

/** Uniform arc-length sampling removes sensor-rate/dwell bias from geometric fitting. */
export function resample(points: readonly Point[], count = 96): Point[] {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
    const total = lengths[lengths.length - 1];
    if (!total) return points.length ? [{ ...points[0] }] : [];
    const result: Point[] = [];
    let j = 1;
    for (let i = 0; i < count; i++) {
        const target = total * i / (count - 1);
        while (j < points.length - 1 && lengths[j] < target) j++;
        const a = points[j - 1], b = points[j], t = (target - lengths[j - 1]) / (lengths[j] - lengths[j - 1] || 1);
        result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return result;
}

export function snapLineEnd(start: Point, end: Point, tolerance = 5): Point {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const target = Math.round(angle / (Math.PI / 4)) * Math.PI / 4;
    if (Math.abs(angle - target) > tolerance * Math.PI / 180) return { ...end };
    const r = distance(start, end);
    return { x: start.x + r * Math.cos(target), y: start.y + r * Math.sin(target) };
}

export function shapeCenter(shape: RecognizedShape): Point {
    if (shape.kind === 'circle' || shape.kind === 'ellipse') return shape.center;
    if (shape.kind === 'line' || shape.kind === 'arrow') return shape.start;
    return shape.points.reduce((s, p) => ({ x: s.x + p.x / shape.points.length, y: s.y + p.y / shape.points.length }), { x: 0, y: 0 });
}

/** Similarity transform of the ORIGINAL fitted geometry; repeated drags never accumulate error. */
export function transformShape(shape: RecognizedShape, anchor: Point, from: Point, to: Point, snap = false): RecognizedShape {
    const initial = distance(anchor, from);
    if (initial < 1e-6) return shape;
    const end = snap ? snapLineEnd(anchor, to, 22.5) : to;
    const scale = clamp(distance(anchor, end) / initial, .02, 100);
    const angle = Math.atan2(end.y - anchor.y, end.x - anchor.x) - Math.atan2(from.y - anchor.y, from.x - anchor.x);
    const c = Math.cos(angle), s = Math.sin(angle);
    const map = (p: Point) => ({ x: anchor.x + scale * ((p.x - anchor.x) * c - (p.y - anchor.y) * s), y: anchor.y + scale * ((p.x - anchor.x) * s + (p.y - anchor.y) * c) });
    switch (shape.kind) {
        case 'line': case 'arrow': return { ...shape, start: map(shape.start), end: snapLineEnd(map(shape.start), map(shape.end)) };
        case 'circle': return { ...shape, center: map(shape.center), radius: shape.radius * scale };
        case 'ellipse': return { ...shape, center: map(shape.center), radiusX: shape.radiusX * scale, radiusY: shape.radiusY * scale, rotation: shape.rotation + angle };
        case 'polygon': return { ...shape, points: shape.points.map(map) };
    }
}

/** Exact vector output; Path2D is allocated only at the presentation boundary. */
export function shapePath(shape: RecognizedShape): Path2D {
    const path = new Path2D();
    switch (shape.kind) {
        case 'line': case 'arrow': {
            path.moveTo(shape.start.x, shape.start.y); path.lineTo(shape.end.x, shape.end.y);
            if (shape.kind === 'arrow') {
                const a = Math.atan2(shape.end.y - shape.start.y, shape.end.x - shape.start.x), h = Math.min(26, distance(shape.start, shape.end) * .2);
                for (const sign of [-1, 1]) { path.moveTo(shape.end.x, shape.end.y); path.lineTo(shape.end.x - h * Math.cos(a + sign * shape.headAngle), shape.end.y - h * Math.sin(a + sign * shape.headAngle)); }
            }
            break;
        }
        case 'circle': path.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2); path.closePath(); break;
        case 'ellipse': path.ellipse(shape.center.x, shape.center.y, shape.radiusX, shape.radiusY, shape.rotation, 0, Math.PI * 2); path.closePath(); break;
        case 'polygon': shape.points.forEach((p, i) => i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y)); if (shape.isClosed) path.closePath();
    }
    return path;
}
