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
        min: 0.35,
        max: 1.75,
        alpha: 1,
        smoothing: 0.55,
        hint: 'Hız ve baskıya göre incelir/kalınlaşır',
    },
    brush: {
        id: 'brush',
        label: 'Fırça',
        min: 0.2,
        max: 3,
        alpha: 0.92,
        smoothing: 0.45,
        hint: 'Geniş kontrast, kaligrafi hissi',
    },
    marker: {
        id: 'marker',
        label: 'Keçeli',
        min: 1.55,
        max: 1.75,
        alpha: 0.72,
        smoothing: 0.3,
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
 * Elle çizerken "yavaş" ve "hızlı" sayılan uç değerler (ekran pikseli / ms).
 * Normal el yazısı yaklaşık 0.15–1.2 px/ms aralığında gezer.
 */
const SLOW_SPEED = 0.15;
const FAST_SPEED = 1.2;

/**
 * Yeni bir nokta için baskı değeri üretir.
 *
 * Hız, iki nokta arasındaki mesafenin GEÇEN SÜREYE bölünmesiyle bulunur.
 * Sadece mesafeye bakmak yanlış olur: işaretçi olaylarının sıklığı cihaza
 * göre değişir (60 Hz'de aralıklar iki katı büyük olur), bu yüzden aynı el
 * hareketi farklı cihazlarda farklı kalınlık üretirdi — ve gerçek hız
 * aralığı o kadar daralırdı ki bütün kalem uçları aynı görünürdü.
 *
 * @param pressure    PointerEvent.pressure (stylus yoksa 0 veya 0.5 gelir)
 * @param pointerType PointerEvent.pointerType
 * @param speed       Ekran pikseli / milisaniye
 * @param previous    Bir önceki noktanın baskısı (yumuşatma için)
 */
export function samplePressure(
    pressure: number,
    pointerType: string,
    speed: number,
    previous: number | undefined,
    pen: PenType | undefined
): number {
    const profile = getPenProfile(pen);
    // Stylus gerçek basınç bildirir; parmak/fare için hızı baskıya çeviriyoruz.
    const hasStylusPressure =
        pointerType === 'pen' && pressure > 0 && Math.abs(pressure - 0.5) > 0.001;
    const raw = hasStylusPressure
        ? clamp(pressure, 0.02, 1)
        : 1 - clamp((speed - SLOW_SPEED) / (FAST_SPEED - SLOW_SPEED), 0, 1);
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
 * Değişken kalınlıklı serbest çizgi.
 *
 * Çizgi, tek bir kapalı şerit olarak DOLDURULUR: her noktanın iki yanına
 * kalınlığın yarısı kadar açılıp sol kenar ileri, sağ kenar geri dolaşılır.
 * Parça parça `stroke()` çağırmak daha basit olurdu ama komşu parçaların
 * kalınlıkları farklı olduğunda yuvarlak uçlar birbirinin üstüne taşar ve
 * çizgi boncuklu görünür.
 */
export function drawVariableStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    base: number
): void {
    const widthAt = (pt: Point) => pressureToWidth(base, pt.p, stroke.penType);

    // Üst üste binen noktalar yön hesabını bozar; ayıkla.
    const pts: Point[] = [];
    for (const q of stroke.points) {
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(q.x - last.x, q.y - last.y) > 0.01) pts.push(q);
    }

    const dot = (pt: Point) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.3, widthAt(pt) / 2), 0, Math.PI * 2);
        ctx.fill();
    };

    if (pts.length === 0) return;
    if (pts.length === 1) {
        dot(pts[0]);
        return;
    }

    const n = pts.length;
    // Her noktada, komşularının yönüne dik birim vektör.
    const left: Point[] = [];
    const right: Point[] = [];
    for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(n - 1, i + 1)];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const half = widthAt(pts[i]) / 2;
        const nx = (-dy / len) * half;
        const ny = (dx / len) * half;
        left.push({ x: pts[i].x + nx, y: pts[i].y + ny });
        right.push({ x: pts[i].x - nx, y: pts[i].y - ny });
    }

    const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    /**
     * Uçtaki yarım daire. Ayrı bir daire olarak doldurulsaydı yarı saydam
     * uçlarda (keçeli, fırça) şeritle üst üste binip koyu benek bırakırdı;
     * bu yüzden aynı yolun parçası olarak çizilir.
     */
    const cap = (center: Point, from: Point) => {
        const angle = Math.atan2(from.y - center.y, from.x - center.x);
        ctx.arc(center.x, center.y, widthAt(center) / 2, angle, angle - Math.PI, true);
    };

    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < n - 1; i++) {
        const to = mid(left[i], left[i + 1]);
        ctx.quadraticCurveTo(left[i].x, left[i].y, to.x, to.y);
    }
    ctx.lineTo(left[n - 1].x, left[n - 1].y);
    cap(pts[n - 1], left[n - 1]);
    for (let i = n - 2; i > 0; i--) {
        const to = mid(right[i], right[i - 1]);
        ctx.quadraticCurveTo(right[i].x, right[i].y, to.x, to.y);
    }
    ctx.lineTo(right[0].x, right[0].y);
    cap(pts[0], right[0]);
    ctx.closePath();
    ctx.fill();
}
