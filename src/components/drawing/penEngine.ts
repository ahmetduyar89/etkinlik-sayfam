// src/components/drawing/penEngine.ts
// GoodNotes ve Notability kalitesinde akıcı, kaligrafik ve pürüzsüz tahta kalem motoru.
//
// GoodNotes ve Notability uygulamalarında el yazısının olağanüstü görünmesini sağlayan 4 temel unsur:
// 1. Akıllı Giriş Sabitleyici (Streamline & Stabilizer): El titremelerini ve tahtanın sinyal gürültüsünü süzer.
// 2. Organik Basınç ve Hız Dinamiği: Kalem hızlandıkça incelir, virajlarda ve duraklarda dolgunlaşır.
// 3. Dinamik Sivriltme (Tapering): Harflerin küt kesilmesini önler; doğal el yazısı gibi zarifçe başlayıp biter.
// 4. Kesintisiz Kontur Poligonu (Outline Mesh): Dönüşlerde kırılmayan, delik açmayan, tek parça pürüzsüz dolgu.

import type { PenType, Point, Stroke } from '../../types';

export interface PenProfile {
    id: PenType;
    label: string;
    /** Taban kalınlığın minimum katı (hızlı savurmalarda). */
    min: number;
    /** Taban kalınlığın maksimum katı (yavaş baskılı duraklarda). */
    max: number;
    /** Çizginin saydamlığı (0..1). */
    alpha: number;
    /** Basınç/hız geçişlerinin yumuşatma katsayısı. */
    smoothing: number;
    /** Hız/basınç incelme kontrastı (0 = sabit hat, 1 = maksimum dinamizm). */
    thinning: number;
    /** Titreme önleyici sabitleyici ağırlığı (0..1). */
    streamline: number;
    /** Başlangıç sivriltme mesafesi (taban kalınlığın katı cinsinden). */
    taperStart: number;
    /** Bitiş sivriltme mesafesi (taban kalınlığın katı cinsinden). */
    taperEnd: number;
    /** Başlangıç ucu yuvarlak mı (true) yoksa sivri mi (false). */
    capStart: boolean;
    /** Bitiş ucu yuvarlak mı (true) yoksa sivri mi (false). */
    capEnd: boolean;
    hint: string;
}

export const PEN_PROFILES: Record<PenType, PenProfile> = {
    ballpoint: {
        id: 'ballpoint',
        label: 'Tükenmez',
        min: 0.8,
        max: 1.15,
        alpha: 1,
        smoothing: 0.45,
        thinning: 0.22,
        streamline: 0.45,
        taperStart: 0.4,
        taperEnd: 1.2,
        capStart: true,
        capEnd: true,
        hint: 'GoodNotes tükenmez: Net, okunaklı, pürüzsüz ve dengeli hat',
    },
    fountain: {
        id: 'fountain',
        label: 'Dolma Kalem',
        min: 0.25,
        max: 1.85,
        alpha: 1,
        smoothing: 0.55,
        thinning: 0.65,
        streamline: 0.55,
        taperStart: 1.5,
        taperEnd: 2.6,
        capStart: false,
        capEnd: false,
        hint: 'GoodNotes dolma: Kaligrafik zarafet, hız ve baskıya duyarlı incelme',
    },
    brush: {
        id: 'brush',
        label: 'Fırça',
        min: 0.15,
        max: 2.8,
        alpha: 0.95,
        smoothing: 0.48,
        thinning: 0.82,
        streamline: 0.5,
        taperStart: 2.2,
        taperEnd: 3.8,
        capStart: false,
        capEnd: false,
        hint: 'Geniş kontrast, sanatsal kaligrafi ve dolgun başlıklar',
    },
    marker: {
        id: 'marker',
        label: 'Keçeli',
        min: 0.92,
        max: 1.08,
        alpha: 0.8,
        smoothing: 0.35,
        thinning: 0.08,
        streamline: 0.4,
        taperStart: 0.1,
        taperEnd: 0.8,
        capStart: true,
        capEnd: true,
        hint: 'Notability fineliner: Pürüzsüz, yuvarlak uçlu sabit akış',
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
 * Yazma hızı referans aralıkları (ekran pikseli / milisaniye).
 * Doğal el yazısında yavaş dönüşler 0.1 px/ms, hızlı savurmalar 1.4 px/ms civarındadır.
 */
const SLOW_SPEED = 0.12;
const FAST_SPEED = 1.35;

/**
 * Yeni bir nokta için normalize edilmiş baskı (0..1) değeri üretir.
 * Donanım stylus basıncı varsa onu kullanır; yoksa (parmak/fare/akıllı tahta)
 * hareket hızını GoodNotes'un dinamik mürekkep eğrisiyle harmanlar.
 */
export function samplePressure(
    pressure: number,
    pointerType: string,
    speed: number,
    previous: number | undefined,
    pen: PenType | undefined
): number {
    const profile = getPenProfile(pen);
    const hasStylusPressure =
        pointerType === 'pen' && pressure > 0 && Math.abs(pressure - 0.5) > 0.001;

    let raw: number;
    if (hasStylusPressure) {
        // Stylus basıncını yumuşak bir S-eğrisiyle daha hassas hale getir
        const p = clamp(pressure, 0.01, 1);
        raw = p * p * (3 - 2 * p); // smoothstep
    } else {
        // Hız tabanlı baskı: hızlı hareket ederken incelir, yavaşlarken dolgunlaşır
        const normalizedSpeed = clamp((speed - SLOW_SPEED) / (FAST_SPEED - SLOW_SPEED), 0, 1);
        // Hızlı savurmalarda zarif incelme için karesel eğri
        raw = 1 - Math.pow(normalizedSpeed, 1.3);
    }

    const prev = previous ?? raw;
    const s = profile.smoothing;
    return clamp(prev * s + raw * (1 - s), 0.02, 1);
}

/**
 * Akıllı tahtalardaki el titremesini ve dokunmatik gürültüsünü süzen Streamline filtresi.
 *
 * Yavaş yazarken veya küçük harf kıvrımlarında güçlü stabilizasyon uygular,
 * hızlı savurmalarda gecikme (lag) hissettirmeden kalemin parmağı anında takip etmesini sağlar.
 */
export function smoothTowards(
    prev: Point,
    raw: Point,
    screenStep: number,
    streamlineFactor = 0.45
): Point {
    // 0.8px altındaki mikro titreşimleri hemen em, 12px üzeri hareketlerde doğrudan takip et
    const dynamicRate = clamp(0.25 + (screenStep / 14) * (1 - streamlineFactor * 0.5), 0.25, 1);
    if (dynamicRate >= 1) return { x: raw.x, y: raw.y };

    return {
        x: prev.x + (raw.x - prev.x) * dynamicRate,
        y: prev.y + (raw.y - prev.y) * dynamicRate,
    };
}

/**
 * Kalemi tahtadan kaldırırken oluşan son piksel sapmalarını (hook artifact / çengel hatası) temizler.
 * GoodNotes ve Procreate'in uyguladığı kanca önleyici mantık.
 */
export function filterHookArtifact(points: Point[]): Point[] {
    if (points.length < 4) return points;
    const n = points.length;
    const pEnd = points[n - 1];
    const pPrev = points[n - 2];
    const pBefore = points[n - 3];

    const dLast = Math.hypot(pEnd.x - pPrev.x, pEnd.y - pPrev.y);
    const dPrev = Math.hypot(pPrev.x - pBefore.x, pPrev.y - pBefore.y);

    // Son adım çok kısa (< 8px) ve bir önceki doğrultuya göre ani ters açı (> 100°) yapıyorsa
    if (dLast < 8 && dPrev > 2) {
        const v1x = (pPrev.x - pBefore.x) / dPrev;
        const v1y = (pPrev.y - pBefore.y) / dPrev;
        const v2x = (pEnd.x - pPrev.x) / (dLast || 1);
        const v2y = (pEnd.y - pPrev.y) / (dLast || 1);
        const dot = v1x * v2x + v1y * v2y;
        if (dot < -0.15) {
            // Son kanca noktasını kaldır
            return points.slice(0, n - 1);
        }
    }
    return points;
}

/** Baskı değerini gerçek piksel yarıçapına/kalınlığına çevirir. */
export function pressureToWidth(base: number, p: number | undefined, pen?: PenType): number {
    const profile = getPenProfile(pen);
    const t = p ?? 0.6;
    return Math.max(0.4, base * (profile.min + (profile.max - profile.min) * t));
}

/** Çizgide baskı bilgisi var mı (eski kayıtlarda yok). */
export const hasPressure = (points: Point[]): boolean =>
    points.some((pt) => typeof pt.p === 'number');

// ============================================================================
// GOODNOTES / NOTABILITY KONTUR POLİGONU (OUTLINE MESH) ALGORİTMASI
// ============================================================================

interface StrokePoint {
    point: Point;
    pressure: number;
    distance: number;
    vector: { x: number; y: number };
    runningLength: number;
}

/**
 * Ham noktaları normalize edip mesafe, kümülatif uzunluk ve yön vektörleriyle işler.
 */
function getStrokePoints(rawPoints: Point[], penProfile: PenProfile): StrokePoint[] {
    const pts: Point[] = [];
    for (const p of rawPoints) {
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 0.4) {
            pts.push(p);
        }
    }
    if (pts.length === 0) return [];

    const result: StrokePoint[] = [];
    let runningLength = 0;

    for (let i = 0; i < pts.length; i++) {
        const current = pts[i];
        let distance = 0;
        let vector = { x: 1, y: 0 };

        if (i > 0) {
            const prev = pts[i - 1];
            const dx = current.x - prev.x;
            const dy = current.y - prev.y;
            distance = Math.hypot(dx, dy);
            runningLength += distance;
            if (distance > 0.001) {
                vector = { x: dx / distance, y: dy / distance };
            } else {
                vector = result[i - 1]?.vector ?? vector;
            }
        }

        const pressure = typeof current.p === 'number' ? current.p : 0.55;
        result.push({
            point: current,
            pressure,
            distance,
            vector,
            runningLength,
        });
    }

    return result;
}

/**
 * GoodNotes & Notability tarzı kusursuz kontur poligon noktalarını üretir.
 *
 * Her nokta için:
 * - Hız/basınç ve sivriltme (tapering) hesabı yapılır
 * - Teğet vektöre dik normal hesaplanır
 * - Sol ve sağ kenarlar oluşturulur
 * - Dönüş açılarında pürüzsüz yaylar (round joints) eklenir
 * - Başlangıç ve bitiş uçları zarifçe kapatılır
 */
export function getStrokeOutlinePoints(
    rawPoints: Point[],
    baseWidth: number,
    penType?: PenType
): Point[] {
    const profile = getPenProfile(penType);
    const strokePoints = getStrokePoints(rawPoints, profile);
    const count = strokePoints.length;

    if (count === 0) return [];

    // Tek nokta ise tam daire ucu dön
    if (count === 1) {
        const p = strokePoints[0].point;
        const r = (baseWidth * profile.max) / 2;
        const discPoints: Point[] = [];
        const steps = 16;
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            discPoints.push({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r });
        }
        return discPoints;
    }

    const totalLength = strokePoints[count - 1].runningLength;
    const taperStartDist = Math.max(1, baseWidth * profile.taperStart);
    const taperEndDist = Math.max(1, baseWidth * profile.taperEnd);

    // Her noktadaki hedef yarıçap
    const radii: number[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const sp = strokePoints[i];
        // Basınç ve thinning etkisi
        const factor = profile.min + (profile.max - profile.min) * (1 - profile.thinning * (1 - sp.pressure));
        let r = Math.max(0.3, (baseWidth * factor) / 2);

        // Başlangıç sivriltmesi (taper start)
        if (sp.runningLength < taperStartDist) {
            const t = clamp(sp.runningLength / taperStartDist, 0, 1);
            // Yumuşak cubic ease-out sivriltme
            const taper = profile.capStart ? 0.4 + 0.6 * (1 - Math.pow(1 - t, 2)) : 0.05 + 0.95 * Math.pow(t, 1.4);
            r *= taper;
        }

        // Bitiş sivriltmesi (taper end)
        const distFromEnd = totalLength - sp.runningLength;
        if (distFromEnd < taperEndDist) {
            const t = clamp(distFromEnd / taperEndDist, 0, 1);
            const taper = profile.capEnd ? 0.35 + 0.65 * (1 - Math.pow(1 - t, 2)) : 0.04 + 0.96 * Math.pow(t, 1.5);
            r *= taper;
        }

        radii[i] = Math.max(0.2, r);
    }

    const leftPts: Point[] = [];
    const rightPts: Point[] = [];

    // İki komşu nokta arasındaki normal vektörleri çıkar
    for (let i = 0; i < count; i++) {
        const sp = strokePoints[i];
        const r = radii[i];
        let ux = sp.vector.x;
        let uy = sp.vector.y;

        // Ara noktalarda yönü önceki ve sonraki vektörlerin ortalamasıyla yumuşat
        if (i > 0 && i < count - 1) {
            const nextV = strokePoints[i + 1].vector;
            const avgX = ux + nextV.x;
            const avgY = uy + nextV.y;
            const avgLen = Math.hypot(avgX, avgY);
            if (avgLen > 0.001) {
                ux = avgX / avgLen;
                uy = avgY / avgLen;
            }
        }

        // Dik normal: [-uy, ux]
        const nx = -uy * r;
        const ny = ux * r;

        leftPts.push({ x: sp.point.x + nx, y: sp.point.y + ny });
        rightPts.push({ x: sp.point.x - nx, y: sp.point.y - ny });
    }

    // Başlangıç ucu (cap)
    const firstSP = strokePoints[0];
    const firstR = radii[0];
    const startCap: Point[] = [];
    if (profile.capStart) {
        // Yuvarlak başlangıç kapağı (sağdan sola yay)
        const baseAngle = Math.atan2(firstSP.vector.y, firstSP.vector.x) + Math.PI / 2;
        const steps = 8;
        for (let s = 1; s < steps; s++) {
            const a = baseAngle + (s / steps) * Math.PI;
            startCap.push({
                x: firstSP.point.x + Math.cos(a) * firstR,
                y: firstSP.point.y + Math.sin(a) * firstR,
            });
        }
    }

    // Bitiş ucu (cap)
    const lastSP = strokePoints[count - 1];
    const lastR = radii[count - 1];
    const endCap: Point[] = [];
    if (profile.capEnd) {
        // Yuvarlak bitiş kapağı (soldan sağa yay)
        const baseAngle = Math.atan2(lastSP.vector.y, lastSP.vector.x) - Math.PI / 2;
        const steps = 8;
        for (let s = 1; s < steps; s++) {
            const a = baseAngle + (s / steps) * Math.PI;
            endCap.push({
                x: lastSP.point.x + Math.cos(a) * lastR,
                y: lastSP.point.y + Math.sin(a) * lastR,
            });
        }
    }

    // Kontur sırası: Sol kenar (baştan sona) -> Bitiş kapağı -> Sağ kenar (sondan başa) -> Başlangıç kapağı
    return [...leftPts, ...endCap, ...rightPts.reverse(), ...startCap];
}

/**
 * GoodNotes ve Notability kalitesindeki kontur poligonunu pürüzsüz Bezier eğrileriyle
 * Canvas context'ine tek bir doldurma işlemiyle (`fill()`) çizer.
 *
 * Bu yöntem:
 * - Sıfır sarım hatası (winding number) üretir
 * - Karalamalarda veya kesişimlerde ASLA beyaz delik bırakmaz
 * - Başlangıç ve bitiş uçlarını doğal el yazısı gibi zarifçe sivriltir
 */
export function renderFreehandStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    baseWidth: number
): void {
    if (!stroke.points || stroke.points.length === 0) return;

    const outline = getStrokeOutlinePoints(stroke.points, baseWidth, stroke.penType);
    if (outline.length === 0) return;

    if (outline.length < 3) {
        ctx.beginPath();
        const pt = stroke.points[0];
        const r = Math.max(0.4, (baseWidth * getPenProfile(stroke.penType).max) / 2);
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    ctx.beginPath();
    ctx.moveTo(outline[0].x, outline[0].y);

    const len = outline.length;
    for (let i = 0; i < len; i++) {
        const curr = outline[i];
        const next = outline[(i + 1) % len];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }

    ctx.closePath();
    ctx.fill();
}

/**
 * Geriye dönük tam uyumluluk: drawVariableStroke doğrudan yeni
 * GoodNotes/Notability renderFreehandStroke motoruna yönlendirilir.
 */
export function drawVariableStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    base: number
): void {
    renderFreehandStroke(ctx, stroke, base);
}
