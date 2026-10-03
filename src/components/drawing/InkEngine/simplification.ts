import type { Point } from '../../../types';

/** Calculates perpendicular distance from point p to line segment (a, b). */
function perpendicularDistance(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
    const num = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x);
    return num / Math.sqrt(lenSq);
}

/** Recursive Ramer-Douglas-Peucker on an index range [start, end]. */
function rdpIndices(points: Point[], start: number, end: number, epsilon: number, out: Set<number>): void {
    if (end <= start + 1) return;
    let maxDist = 0;
    let maxIdx = start;
    const a = points[start];
    const b = points[end];

    for (let i = start + 1; i < end; i++) {
        const d = perpendicularDistance(points[i], a, b);
        if (d > maxDist) {
            maxDist = d;
            maxIdx = i;
        }
    }

    if (maxDist > epsilon) {
        out.add(maxIdx);
        rdpIndices(points, start, maxIdx, epsilon, out);
        rdpIndices(points, maxIdx, end, epsilon, out);
    }
}

/**
 * Offline stroke simplification for completed strokes.
 * Preserves high curvature (sharp corners) and pressure extrema while
 * eliminating redundant collinear jitter points.
 */
export function simplifyStroke(points: Point[], epsilon = 0.45): Point[] {
    const n = points.length;
    if (n <= 4) return points;

    const keep = new Set<number>([0, n - 1]);

    // 1. Identify critical feature points (corners & pressure inflections)
    for (let i = 1; i < n - 1; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        const next = points[i + 1];

        // Pressure inflection check
        if (typeof cur.p === 'number' && typeof prev.p === 'number' && typeof next.p === 'number') {
            const dp1 = cur.p - prev.p;
            const dp2 = next.p - cur.p;
            if (dp1 * dp2 < -0.04 || Math.abs(dp1) > 0.2) {
                keep.add(i);
                continue;
            }
        }

        // Direction / corner check: cos(angle)
        const v1x = cur.x - prev.x;
        const v1y = cur.y - prev.y;
        const v2x = next.x - cur.x;
        const v2y = next.y - cur.y;
        const nextDist = Math.hypot(v2x, v2y);
        const prevDist = Math.hypot(v1x, v1y);

        if (prevDist > 1 && nextDist > 1) {
            const dot = (v1x * v2x + v1y * v2y) / (prevDist * nextDist);
            // Sharp angle change (> ~40 degrees) -> preserve corner
            if (dot < 0.75) {
                keep.add(i);
            }
        }
    }

    // 2. Run RDP between consecutive kept critical points
    const critical = Array.from(keep).sort((a, b) => a - b);
    for (let c = 0; c < critical.length - 1; c++) {
        const from = critical[c];
        const to = critical[c + 1];
        rdpIndices(points, from, to, epsilon, keep);
    }

    const sortedIndices = Array.from(keep).sort((a, b) => a - b);
    return sortedIndices.map(i => points[i]);
}
