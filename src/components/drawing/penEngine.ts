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

/**
 * Ham işaretçi noktasını bir önceki noktaya doğru yumuşatır.
 *
 * Kızılötesi/rezistif akıllı tahtalar birkaç piksellik gürültü üretir; yavaş
 * çizerken bu gürültü çizgiyi titrek gösterir. Yumuşatma yalnızca yavaş
 * hareketlerde devreye girer: hızlı çizgide katsayı 1'e çıkar, yani nokta
 * olduğu gibi kullanılır ve kalem elin gerisinde kalmaz.
 *
 * @param screenStep Ham nokta ile önceki nokta arasındaki EKRAN mesafesi (px)
 */
export function smoothTowards(prev: Point, raw: Point, screenStep: number): Point {
    // Gürültünün kendisi adımı büyüttüğü için eşik geniş tutulur: yaklaşık
    // 10 px'lik gerçek bir hareketten sonra süzgeç tamamen devre dışı kalır.
    const alpha = clamp(0.35 + screenStep / 14, 0.35, 1);
    if (alpha >= 1) return { x: raw.x, y: raw.y };
    return {
        x: prev.x + (raw.x - prev.x) * alpha,
        y: prev.y + (raw.y - prev.y) * alpha,
    };
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
 * Çizgi, kapalı şeritler olarak DOLDURULUR: her noktanın iki yanına
 * kalınlığın yarısı kadar açılıp sol kenar ileri, sağ kenar geri dolaşılır.
 * Parça parça `stroke()` çağırmak daha basit olurdu ama komşu parçaların
 * kalınlıkları farklı olduğunda yuvarlak uçlar birbirinin üstüne taşar ve
 * çizgi boncuklu görünür.
 *
 * Şerit KESKİN DÖNÜŞLERDE bölünür. Kalem geri döndüğünde (karalama, keskin
 * köşe, kalın uçla dar viraj) iç kenar kendi üstünden geçer; tek bir kapalı
 * yol olarak doldurulduğunda bu bölgenin sarım sayısı sıfıra düşer ve
 * çizginin ortasında beyaz yarıklar açılırdı. Her parça kendi içinde
 * dönüşsüz olduğu için hepsi aynı yönde sarar; üst üste binmeleri sorun
 * çıkarmaz. Parçalar tek bir yolda toplanıp bir kez doldurulur: yarı saydam
 * uçlarda (keçeli, fırça) kesişmeler koyu benek bırakmaz.
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

    if (pts.length === 0) return;

    /**
     * Tam daire. Şeritlerle aynı yönde (saat yönünün tersi kapalı) sarar;
     * ters sararsa şeritle kesiştiği yerde dolgu birbirini götürürdü.
     */
    const disc = (pt: Point) => {
        const r = Math.max(0.3, widthAt(pt) / 2);
        ctx.moveTo(pt.x + r, pt.y);
        // Bitiş açısı EKSİ 2π: tarayıcı tam daireyi ancak bu yönde ister,
        // `0 → 2π` ters yönde istendiğinde boş yay çizilir.
        ctx.arc(pt.x, pt.y, r, 0, -Math.PI * 2, true);
    };

    ctx.beginPath();

    if (pts.length === 1) {
        disc(pts[0]);
        ctx.fill();
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

    /**
     * Şeridin bölünmesi gereken köşeler.
     *
     * İki ölçüt var:
     *  1. Dönüş 90°'den keskinse (kalem geri dönüyorsa) kenarlar yer değiştirir.
     *  2. Dönüş daha yumuşak olsa bile iç kenar, komşu adımdan uzun bir yay
     *     çizmek zorunda kalıyorsa (kalın uçla dar viraj) yine kendini keser.
     */
    const breakAt: boolean[] = new Array(n).fill(false);
    for (let i = 1; i < n - 1; i++) {
        const inX = pts[i].x - pts[i - 1].x;
        const inY = pts[i].y - pts[i - 1].y;
        const outX = pts[i + 1].x - pts[i].x;
        const outY = pts[i + 1].y - pts[i].y;
        const inLen = Math.hypot(inX, inY) || 1;
        const outLen = Math.hypot(outX, outY) || 1;
        const cos = (inX * outX + inY * outY) / (inLen * outLen);
        if (cos <= 0) {
            breakAt[i] = true;
            continue;
        }
        // tan(θ/2): dönüş açısının yarısı. İç kenarın geri gittiği mesafe
        // yarı kalınlığın bu katı kadardır; komşu adımı aşıyorsa şerit katlanır.
        const half = pressureToWidth(base, pts[i].p, stroke.penType) / 2;
        const sin = Math.abs((inX * outY - inY * outX) / (inLen * outLen));
        if (half * (sin / (1 + cos)) > Math.min(inLen, outLen)) breakAt[i] = true;
    }

    // İkinci güvence: kenarlardan biri, çizginin gittiği yönün TERSİNE
    // ilerliyorsa o adımda şerit zaten katlanmıştır. Köşe ölçütü kaçırırsa
    // (kalınlık noktadan noktaya çok değiştiğinde olur) bu yakalar.
    for (let i = 0; i < n - 1; i++) {
        if (breakAt[i] && breakAt[i + 1]) continue;
        const dx = pts[i + 1].x - pts[i].x;
        const dy = pts[i + 1].y - pts[i].y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const lFwd = (left[i + 1].x - left[i].x) * ux + (left[i + 1].y - left[i].y) * uy;
        const rFwd = (right[i + 1].x - right[i].x) * ux + (right[i + 1].y - right[i].y) * uy;
        if (lFwd <= 0 || rFwd <= 0) {
            // Adımın iki ucu da kırılırsa bu parça tek başına kalır ve
            // katlanma parçanın içinde değil, parçalar arasında olur.
            breakAt[i] = true;
            breakAt[i + 1] = true;
        }
    }

    // Parçalar ayrıca uzunlukça sınırlanır: uzun bir şerit keskin dönüş
    // olmadan da (geniş bir ilmek çizerken) kendi üstünden geçebilir ve aynı
    // sıfır sarım sorununu yaşar. Ayrı parçalar birbirini götürmez; kısa
    // tutmak bu ihtimali ortadan kaldırır, görünüşe etkisi yoktur.
    const MAX_PIECE_POINTS = 24;
    const breaks: number[] = [];
    let sinceBreak = 0;
    for (let i = 1; i < n - 1; i++) {
        sinceBreak++;
        if (breakAt[i] || sinceBreak >= MAX_PIECE_POINTS) {
            breaks.push(i);
            sinceBreak = 0;
        }
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

    /** [a, b] aralığındaki noktaları tek bir kapalı şerit olarak ekler. */
    const ribbon = (a: number, b: number) => {
        if (a === b) {
            disc(pts[a]);
            return;
        }
        ctx.moveTo(left[a].x, left[a].y);
        for (let i = a + 1; i < b; i++) {
            const to = mid(left[i], left[i + 1]);
            ctx.quadraticCurveTo(left[i].x, left[i].y, to.x, to.y);
        }
        ctx.lineTo(left[b].x, left[b].y);
        cap(pts[b], left[b]);
        for (let i = b - 1; i > a; i--) {
            const to = mid(right[i], right[i - 1]);
            ctx.quadraticCurveTo(right[i].x, right[i].y, to.x, to.y);
        }
        ctx.lineTo(right[a].x, right[a].y);
        cap(pts[a], right[a]);
        ctx.closePath();
    };

    // Parçalar kırılma noktasını PAYLAŞIR; aralarında boşluk kalmaz.
    let start = 0;
    for (const i of breaks) {
        ribbon(start, i);
        start = i;
    }
    ribbon(start, n - 1);

    ctx.fill();
}
