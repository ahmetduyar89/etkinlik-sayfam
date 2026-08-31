// src/components/drawing/shapeRecognizer.ts
// Serbest elle çizilen bir çizgiyi düzgün geometrik şekle dönüştürür.
//
// GoodNotes/Notability'deki "çiz ve bırak, şekil düzelsin" davranışı.
// Çıktı, mevcut şekil araçlarının veri biçimiyle birebir aynıdır:
//   line/dashed/arrow : [başlangıç, bitiş]
//   rect / triangle    : [sol-üst, sağ-alt]  (drawShape sınırlayıcı kutuyu kullanır)
//   circle             : [merkez, çember üstünde bir nokta]

import type { DrawingTool, Point } from '../../types';

export interface RecognizedShape {
    tool: DrawingTool;
    points: Point[];
}

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

const pathLength = (pts: Point[]): number => {
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
    return total;
};

const bounds = (pts: Point[]) => {
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const x1 = Math.min(...xs);
    const y1 = Math.min(...ys);
    const x2 = Math.max(...xs);
    const y2 = Math.max(...ys);
    return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 };
};

/** Bir noktanın a–b doğrusuna dik uzaklığı. */
const perpendicular = (p: Point, a: Point, b: Point): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return dist(p, a);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
};

/** Ramer–Douglas–Peucker: çizgiyi köşe noktalarına indirger. */
function simplify(pts: Point[], epsilon: number): Point[] {
    if (pts.length < 3) return [...pts];
    let maxDist = 0;
    let index = 0;
    const first = pts[0];
    const last = pts[pts.length - 1];
    for (let i = 1; i < pts.length - 1; i++) {
        const d = perpendicular(pts[i], first, last);
        if (d > maxDist) {
            maxDist = d;
            index = i;
        }
    }
    if (maxDist <= epsilon) return [first, last];
    return [
        ...simplify(pts.slice(0, index + 1), epsilon).slice(0, -1),
        ...simplify(pts.slice(index), epsilon),
    ];
}

/** Çok yakın ardışık noktaları atarak gürültüyü azaltır. */
function thin(pts: Point[], minGap: number): Point[] {
    const out: Point[] = [pts[0]];
    for (const p of pts) {
        if (dist(out[out.length - 1], p) >= minGap) out.push(p);
    }
    const last = pts[pts.length - 1];
    if (dist(out[out.length - 1], last) > 0.5) out.push(last);
    return out;
}

/**
 * Serbest çizimi tanımaya çalışır; emin olunamazsa `null` döner ve
 * çizgi olduğu gibi bırakılır.
 */
export function recognizeShape(rawPoints: Point[]): RecognizedShape | null {
    if (rawPoints.length < 6) return null;

    const pts = thin(rawPoints, 2);
    if (pts.length < 5) return null;

    const bb = bounds(pts);
    const diag = Math.hypot(bb.w, bb.h);
    // Çok küçük çizimler muhtemelen yazıdır — dokunma.
    if (diag < 42) return null;

    const start = pts[0];
    const end = pts[pts.length - 1];
    const len = pathLength(pts);
    if (len < 1e-6) return null;

    const gap = dist(start, end);
    const closed = gap < Math.max(diag * 0.28, 22);

    // ── Düz çizgi ────────────────────────────────────────────────────
    if (!closed) {
        let maxDev = 0;
        for (const p of pts) maxDev = Math.max(maxDev, perpendicular(p, start, end));
        // Yol uzunluğu uçlar arası mesafeye yakınsa ve sapma azsa: doğru parçası.
        if (maxDev < gap * 0.09 && len < gap * 1.16) {
            return { tool: 'line', points: [{ ...start }, { ...end }] };
        }
        return null;
    }

    // ── Kapalı şekiller ──────────────────────────────────────────────
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
    const rMean = radii.reduce((s, r) => s + r, 0) / radii.length;
    const rDev =
        Math.sqrt(radii.reduce((s, r) => s + (r - rMean) ** 2, 0) / radii.length) /
        (rMean || 1);
    const aspect = bb.w && bb.h ? Math.max(bb.w, bb.h) / Math.min(bb.w, bb.h) : 99;

    // Daire: merkeze uzaklık neredeyse sabit ve en–boy oranı dengeli.
    if (rDev < 0.16 && aspect < 1.32) {
        return {
            tool: 'circle',
            points: [
                { x: cx, y: cy },
                { x: cx + rMean, y: cy },
            ],
        };
    }

    // Köşe sayısına bak. Kapalı çizimde başlangıç noktası tekrar edeceği için
    // son nokta atılır.
    const corners = simplify(pts, Math.max(diag * 0.055, 6));
    const cornerCount = Math.max(0, corners.length - 1);

    if (cornerCount === 3) {
        return {
            tool: 'triangle',
            points: [
                { x: bb.x1, y: bb.y1 },
                { x: bb.x2, y: bb.y2 },
            ],
        };
    }
    if (cornerCount === 4 || cornerCount === 5) {
        return {
            tool: 'rect',
            points: [
                { x: bb.x1, y: bb.y1 },
                { x: bb.x2, y: bb.y2 },
            ],
        };
    }
    // Köşesi çok ama daireye de benzemiyorsa elips olarak kabul et.
    if (cornerCount > 5 && rDev < 0.3) {
        return {
            tool: 'circle',
            points: [
                { x: cx, y: cy },
                { x: cx + rMean, y: cy },
            ],
        };
    }
    return null;
}

/** Bir noktayı en yakın ızgara kesişimine oturtur. */
export const snapToGrid = (p: Point, step: number): Point => ({
    ...p,
    x: Math.round(p.x / step) * step,
    y: Math.round(p.y / step) * step,
});

/** Bir doğruyu 15°'nin katlarına kilitler (Shift davranışı). */
export function snapAngle(from: Point, to: Point, stepDeg = 15): Point {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const r = Math.hypot(dx, dy);
    if (r < 1) return to;
    const step = (stepDeg * Math.PI) / 180;
    const a = Math.round(Math.atan2(dy, dx) / step) * step;
    return { ...to, x: from.x + r * Math.cos(a), y: from.y + r * Math.sin(a) };
}
