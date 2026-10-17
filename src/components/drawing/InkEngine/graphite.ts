import type { Point, Stroke } from '../../../types';
import { widthFactor } from './physics';

export const GRAPHITE_CONFIG = Object.freeze({ spacing: 0.65, grainsPerStamp: 3, maxStamps: 8000, baseDensity: 0.18 });
const random = (index: number) => {
    let n = Math.imul(index + 1, 374761393);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
export function graphiteDensity(pressure: number): number {
    return 0.15 + 0.7 * Math.pow(Math.max(0, Math.min(1, pressure)), 0.7);
}

/** Arc-length sampling gives repeatable grain independent of redraw frequency. */
export function forEachGraphiteStamp(points: Point[], visit: (point: Point, index: number) => void): void {
    if (!points.length) return;
    visit(points[0], 0);
    let distance = GRAPHITE_CONFIG.spacing, index = 1;
    for (let i = 1; i < points.length && index < GRAPHITE_CONFIG.maxStamps; i++) {
        const a = points[i - 1], b = points[i];
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        if (!Number.isFinite(length) || length === 0) continue;
        while (distance <= length && index < GRAPHITE_CONFIG.maxStamps) {
            const t = distance / length;
            const interpolate = (key: 'p' | 'velocity' | 'tiltX' | 'tiltY') =>
                (a[key] ?? (key === 'p' ? 0.5 : 0)) * (1 - t) + (b[key] ?? (key === 'p' ? 0.5 : 0)) * t;
            visit({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t,
                p: interpolate('p'), velocity: interpolate('velocity'), tiltX: interpolate('tiltX'), tiltY: interpolate('tiltY') }, index++);
            distance += GRAPHITE_CONFIG.spacing;
        }
        distance -= length;
    }
}

/** Caller supplies the cached outline path. No bitmap flattening or random redraw shimmer. */
export function renderGraphite(ctx: CanvasRenderingContext2D, stroke: Stroke, width: number, outline: Path2D): void {
    ctx.save();
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha * GRAPHITE_CONFIG.baseDensity;
    ctx.fill(outline);
    ctx.clip(outline);
    forEachGraphiteStamp(stroke.points, (point, index) => {
        const radius = width * widthFactor(point, 'graphite', stroke.pressureSensitivity) / 2;
        ctx.globalAlpha = alpha * graphiteDensity(point.p ?? 0.5);
        ctx.beginPath();
        for (let grain = 0; grain < GRAPHITE_CONFIG.grainsPerStamp; grain++) {
            const seed = index * 13 + grain * 3;
            const angle = random(seed) * Math.PI * 2;
            const offset = Math.sqrt(random(seed + 1)) * radius;
            const x = point.x + Math.cos(angle) * offset, y = point.y + Math.sin(angle) * offset;
            const size = Math.max(0.12, Math.min(0.55, width * 0.08)) * (0.5 + random(seed + 2));
            ctx.moveTo(x + size, y);
            ctx.arc(x, y, size, 0, Math.PI * 2);
        }
        ctx.fill();
    });
    ctx.restore();
}
