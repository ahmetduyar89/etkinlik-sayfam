import type { Point } from '../../../types';
import type { RecognizedShape } from '../shapeRecognizer';
export { HOLD_DELAY_MS, HOLD_SLOP_PX } from '../engine/DrawHold';
import { GeometricShapeRecognizer } from '../engine/recognition';
import { shapeToStroke } from '../engine/adapter';
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
const geometricRecognizer = new GeometricShapeRecognizer();
/** Compatibility entry point for existing callers; the canvas uses the state machine. */
export function recognizeShape(raw: Point[], scale = 1): RecognizedShape | null {
    const shape = geometricRecognizer.recognize(raw, scale);
    return shape ? shapeToStroke(shape) : null;
}
