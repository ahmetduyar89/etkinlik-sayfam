// src/components/drawing/penEngine.ts
// Kalem uçlarının karakteri ve değişken kalınlıklı çizgi çizimi.
//
// GoodNotes benzeri uygulamalarda yazının "canlı" durmasının sebebi, çizgi
// kalınlığının sabit olmaması: kalem hızlandıkça incelir, bastırdıkça kalınlaşır.
// Burada her nokta için 0..1 arası bir "baskı" değeri (Point.p) üretiyoruz.
// Stylus varsa donanımın bildirdiği basınç, yoksa hareket hızı kullanılıyor.

import type { PenType, Point, Stroke } from '../../types';

export interface PenProfile {
    id: PenType;
    label: string;
    /** Baskı 0 iken taban kalınlığın kaç katı. */
    min: number;
    /** Baskı 1 iken taban kalınlığın kaç katı. */
    max: number;
    /** Çizginin saydamlığı. */
    alpha: number;
    /** Baskı değişimini yumuşatma katsayısı (0 = anında, 1 = hiç değişmez). */
    smoothing: number;
    hint: string;
}

export const PEN_PROFILES: Record<PenType, PenProfile> = {
    ballpoint: {
        id: 'ballpoint',
        label: 'Tükenmez',
        min: 1,
        max: 1,
        alpha: 1,
        smoothing: 0.5,
        hint: 'Sabit kalınlık, net çizgi',
    },
    fountain: {
        id: 'fountain',
        label: 'Dolma Kalem',
        min: 0.45,
        max: 1.45,
        alpha: 1,
        smoothing: 0.72,
        hint: 'Hız ve baskıya göre incelir/kalınlaşır',
    },
    brush: {
        id: 'brush',
        label: 'Fırça',
        min: 0.25,
        max: 2.3,
        alpha: 0.95,
        smoothing: 0.6,
        hint: 'Geniş kontrast, kaligrafi hissi',
    },
    marker: {
        id: 'marker',
        label: 'Keçeli',
        min: 1.15,
        max: 1.35,
        alpha: 0.9,
        smoothing: 0.4,
        hint: 'Kalın ve yarı saydam',
    },
};

export const PEN_TYPES: ReadonlyArray<PenProfile> = [
    PEN_PROFILES.ballpoint,
    PEN_PROFILES.fountain,
    PEN_PROFILES.brush,
    PEN_PROFILES.marker,
];

export const getPenProfile = (pen?: PenType): PenProfile =>
    PEN_PROFILES[pen ?? 'ballpoint'] ?? PEN_PROFILES.ballpoint;

/** Serbest çizim yapan (dolayısıyla kalem ucu uygulanan) araçlar. */
export const FREEHAND_TOOLS = ['pencil', 'highlighter', 'eraser'] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Yeni bir nokta için baskı değeri üretir.
 *
 * @param pressure  PointerEvent.pressure (stylus yoksa 0 veya 0.5 gelir)
 * @param pointerType PointerEvent.pointerType
 * @param distance  Bir önceki noktaya uzaklık (px) — hız göstergesi
 * @param previous  Bir önceki noktanın baskısı (yumuşatma için)
 */
export function samplePressure(
    pressure: number,
    pointerType: string,
    distance: number,
    previous: number | undefined,
    pen: PenType | undefined
): number {
    const profile = getPenProfile(pen);
    // Stylus gerçek basınç bildirir; parmak/fare için hızı baskıya çeviriyoruz.
    const hasStylusPressure =
        pointerType === 'pen' && pressure > 0 && Math.abs(pressure - 0.5) > 0.001;
    const raw = hasStylusPressure
        ? clamp(pressure, 0.02, 1)
        : clamp(1 - distance / 34, 0.12, 1);
    const prev = previous ?? raw;
    const s = profile.smoothing;
    return clamp(prev * s + raw * (1 - s), 0.02, 1);
}

/** Baskı değerini gerçek piksel kalınlığına çevirir. */
export function pressureToWidth(base: number, p: number | undefined, pen?: PenType): number {
    const profile = getPenProfile(pen);
    const t = p ?? 0.6;
    return Math.max(0.4, base * (profile.min + (profile.max - profile.min) * t));
}

/** Çizgide baskı bilgisi var mı (eski kayıtlarda yok). */
export const hasPressure = (points: Point[]): boolean =>
    points.some((pt) => typeof pt.p === 'number');

/**
 * Değişken kalınlıklı serbest çizgi. Her segment kendi kalınlığıyla ayrı
 * çizilir; uçlar yuvarlak olduğu için birleşim yerleri görünmez.
 */
export function drawVariableStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    base: number
): void {
    const pts = stroke.points;
    const widthAt = (pt: Point) => pressureToWidth(base, pt.p, stroke.penType);

    if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, widthAt(pts[0]) / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    if (pts.length === 2) {
        ctx.beginPath();
        ctx.lineWidth = (widthAt(pts[0]) + widthAt(pts[1])) / 2;
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.stroke();
        return;
    }

    // İlk parça: başlangıç noktasından ilk orta noktaya.
    let from = mid(pts[0], pts[1]);
    ctx.beginPath();
    ctx.lineWidth = (widthAt(pts[0]) + widthAt(pts[1])) / 2;
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(from.x, from.y);
    ctx.stroke();

    // Orta parçalar: her nokta kontrol noktası, komşu orta noktalar uç.
    for (let i = 1; i < pts.length - 1; i++) {
        const to = mid(pts[i], pts[i + 1]);
        ctx.beginPath();
        ctx.lineWidth = widthAt(pts[i]);
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, to.x, to.y);
        ctx.stroke();
        from = to;
    }

    // Son parça: son orta noktadan bitiş noktasına.
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.lineWidth = widthAt(last);
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
}
