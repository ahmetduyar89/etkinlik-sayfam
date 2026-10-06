import type { Point } from '../../../types';
import type { RecognizedShape } from '../shapeRecognizer';
export const HOLD_DELAY_MS = 500;
export const HOLD_SLOP_PX = 4;
/** Fast, substantial alternating reversals; sample rate independent spatial thinning. */
export function isScribble(points: Point[]): boolean {
    if (points.length < 8)
        return false;
    const duration = (points[points.length - 1].timestamp ?? 0) - (points[0].timestamp ?? 0);
    if (duration < 80 || duration > 1600)
        return false;
    const thinned: Point[] = [points[0]];
    for (const p of points)
        if (Math.hypot(p.x - thinned[thinned.length - 1].x, p.y - thinned[thinned.length - 1].y) >= 8)
            thinned.push(p);
    let reversals = 0, length = 0, lastTurn = 0;
    for (let i = 1; i < thinned.length; i++) {
        const a = thinned[i - 1], b = thinned[i], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy);
        length += l;
        if (i < 2)
            continue;
        const prev = thinned[i - 2], vx = a.x - prev.x, vy = a.y - prev.y;
        const dot = (vx * dx + vy * dy) / (Math.hypot(vx, vy) * l || 1);
        const sign = Math.sign(vx * dy - vy * dx);
        if (dot < -.35 && (!lastTurn || sign !== lastTurn)) {
            reversals++;
            lastTurn = sign;
        }
    }
    const x = thinned.map(p => p.x), y = thinned.map(p => p.y);
    const span = Math.hypot(Math.max(...x) - Math.min(...x), Math.max(...y) - Math.min(...y));
    return reversals >= 4 && reversals / (duration / 1000) >= 3 && span >= 30 && length > span * 2.8 && length / duration > .16;
}
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
function deviation(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
function simplify(points: Point[], epsilon: number): Point[] {
    if (points.length < 3)
        return points;
    let at = 0, max = 0;
    for (let i = 1; i < points.length - 1; i++) {
        const d = deviation(points[i], points[0], points[points.length - 1]);
        if (d > max) {
            max = d;
            at = i;
        }
    }
    return max <= epsilon ? [points[0], points[points.length - 1]] : [...simplify(points.slice(0, at + 1), epsilon).slice(0, -1), ...simplify(points.slice(at), epsilon)];
}
/** Conservative geometric fitting. Polygon corners are checked before round shapes. */
export function recognizeShape(raw: Point[]): RecognizedShape | null {
    if (raw.length < 5)
        return null;
    const pts: Point[] = [raw[0]];
    for (const p of raw)
        if (dist(p, pts[pts.length - 1]) >= 2)
            pts.push(p);
    if (pts.length < 4)
        return null;
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y), x1 = Math.min(...xs), x2 = Math.max(...xs), y1 = Math.min(...ys), y2 = Math.max(...ys);
    const w = x2 - x1, h = y2 - y1, diag = Math.hypot(w, h), start = pts[0], end = pts[pts.length - 1];
    if (diag < 32)
        return null;
    let length = 0;
    for (let i = 1; i < pts.length; i++)
        length += dist(pts[i - 1], pts[i]);
    const gap = dist(start, end);
    if (gap > diag * .18) {
        if (gap > 24 && length < gap * 1.2 && pts.every(p => deviation(p, start, end) < Math.max(3, gap * .06)))
            return { tool: 'line', points: [start, end] };
        return null;
    }
    // Split the closed curve at the farthest point to avoid a degenerate RDP baseline.
    let far = 1;
    for (let i = 2; i < pts.length; i++)
        if (dist(start, pts[i]) > dist(start, pts[far]))
            far = i;
    const corners = [...simplify(pts.slice(0, far + 1), diag * .035).slice(0, -1), ...simplify([...pts.slice(far), start], diag * .035).slice(0, -1)];
    let changed = true;
    while (changed && corners.length > 3) {
        changed = false;
        for (let i = 0; i < corners.length; i++) {
            if (deviation(corners[i], corners[(i + corners.length - 1) % corners.length], corners[(i + 1) % corners.length]) < diag * .04) {
                corners.splice(i, 1);
                changed = true;
                break;
            }
        }
    }
    if (corners.length === 3)
        return { tool: 'polygon', points: corners };
    if (corners.length === 4) {
        const right = corners.every((b, i) => { const a = corners[(i + 3) % 4], c = corners[(i + 1) % 4]; return Math.abs(((a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y)) / (dist(a, b) * dist(b, c) || 1)) < .25; });
        if (right) {
            const dx = corners[1].x - corners[0].x, dy = corners[1].y - corners[0].y, l = Math.hypot(dx, dy), u = { x: dx / l, y: dy / l }, v = { x: -dy / l, y: dx / l };
            const us = corners.map(p => p.x * u.x + p.y * u.y), vs = corners.map(p => p.x * v.x + p.y * v.y);
            const loU = Math.min(...us), hiU = Math.max(...us), loV = Math.min(...vs), hiV = Math.max(...vs);
            return { tool: 'polygon', points: [[loU, loV], [hiU, loV], [hiU, hiV], [loU, hiV]].map(([a, b]) => ({ x: a * u.x + b * v.x, y: a * u.y + b * v.y })) };
        }
    }
    if (w < 20 || h < 20)
        return null;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rx = w / 2, ry = h / 2;
    const error = Math.sqrt(pts.reduce((sum, p) => sum + (Math.hypot((p.x - cx) / rx, (p.y - cy) / ry) - 1) ** 2, 0) / pts.length);
    if (error > .065)
        return null;
    if (Math.abs(w - h) / Math.max(w, h) < .1) {
        const radius = (rx + ry) / 2;
        return { tool: 'circle', points: [{ x: cx, y: cy }, { x: cx + radius, y: cy }] };
    }
    return { tool: 'ellipse', points: [{ x: x1, y: y1 }, { x: x2, y: y2 }] };
}
