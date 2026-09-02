// src/components/drawing/objectDrawing.ts
// Hazır nesne kütüphanelerinin (matematik ve fen) ortak çizim altyapısı.
//
// Her nesne, `Stroke.points[0]` ve `points[1]` ile verilen dikdörtgenin içine
// çizilir; böylece mevcut seç/taşı/ölçekle/renklendir mantığı hiç değişmeden
// bu nesneler için de çalışır.

import type { MathObject, MathObjectKind } from '../../types';

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface MathField {
    key: 'n' | 'k' | 'm' | 'expr' | 'text';
    label: string;
    type: 'number' | 'text';
    min?: number;
    max?: number;
}

export interface MathCatalogItem {
    kind: MathObjectKind;
    label: string;
    hint: string;
    /** Sayfaya eklenirken kullanılacak varsayılan boyut (CSS px). */
    size: { w: number; h: number };
    defaults?: Partial<MathObject>;
    /** Eklemeden önce sorulacak parametreler. */
    fields?: MathField[];
}

export interface ObjectCategory {
    label: string;
    items: ReadonlyArray<MathCatalogItem>;
}

/** Çizim bağlamı: hedef kutu, parametreler, renk, kalınlık ve yazı boyu. */
export interface Ctx {
    c: CanvasRenderingContext2D;
    r: Rect;
    o: MathObject;
    color: string;
    lw: number;
    /** Kutuya göre ölçeklenen yazı boyutu. */
    fs: number;
    /** Animasyon için saniye cinsinden zaman. Durağan nesneler kullanmaz. */
    t: number;
}

/**
 * Simülasyon nesnesinin üzerindeki etkileşim noktası.
 * `drag` olanlar sürüklenir, `toggle` olanlar dokununca 0/1 arası değişir.
 */
export interface SimControl {
    id: string;
    x: number;
    y: number;
    type: 'drag' | 'toggle';
    label?: string;
    /** Toggle kontrollerde şu anki durum (dolu/boş gösterimi için). */
    on?: boolean;
}

/** Seçili simülasyon için gösterilen kaydırıcı tanımı. */
export interface SimParam {
    key: string;
    label: string;
    min: number;
    max: number;
    step?: number;
    /** Değerin yanında gösterilecek birim. */
    unit?: string;
}

export interface SimSpec {
    /**
     * Her karede yeniden çizilmeli mi. Fonksiyon verilirse nesnenin o anki
     * ayarına bakılır — duraklatılmış bir simülasyon boşuna kare harcamaz.
     */
    animated?: boolean | ((o: MathObject) => boolean);
    /** Nesnenin üzerindeki etkileşim noktaları. */
    controls?: (r: Rect, o: MathObject) => SimControl[];
    /** Bir kontrol sürüklendiğinde/dokunulduğunda uygulanacak değişiklik. */
    onControl?: (
        r: Rect,
        o: MathObject,
        id: string,
        point: { x: number; y: number }
    ) => Record<string, number>;
    /** Seçiliyken gösterilecek kaydırıcılar. */
    params?: SimParam[];
}

/** Simülasyon değerini varsayılanıyla birlikte okur. */
export const simValue = (o: MathObject, key: string, fallback: number): number => {
    const v = o.sim?.[key];
    return Number.isFinite(v as number) ? (v as number) : fallback;
};

export type Renderer = (k: Ctx) => void;

/** #rgb / #rrggbb rengini verilen saydamlıkta rgba'ya çevirir. */
export function withAlpha(color: string, a: number): string {
    let hex = color.trim();
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6 || /[^0-9a-f]/i.test(hex)) return color;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Değeri [lo, hi] aralığına sıkıştırır. */
export const clamp = (v: number, lo: number, hi: number): number =>
    Math.min(hi, Math.max(lo, v));

export const clampInt = (
    v: number | undefined,
    lo: number,
    hi: number,
    fallback: number
): number => {
    const n = Math.round(Number.isFinite(v as number) ? (v as number) : fallback);
    return Math.min(hi, Math.max(lo, n));
};

/** Etiketlerin taşmaması için çizim kutusunu içeri alır. */
export const inset = (r: Rect, px: number, py: number): Rect => ({
    x: r.x + px,
    y: r.y + py,
    w: Math.max(10, r.w - px * 2),
    h: Math.max(10, r.h - py * 2),
});

export const line = (
    k: Ctx,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width?: number
) => {
    k.c.beginPath();
    k.c.lineWidth = width ?? k.lw;
    k.c.moveTo(x1, y1);
    k.c.lineTo(x2, y2);
    k.c.stroke();
};

export const arrowHead = (k: Ctx, x: number, y: number, angle: number, size = 8) => {
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.moveTo(x, y);
    k.c.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    k.c.moveTo(x, y);
    k.c.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    k.c.stroke();
};

/** Uçları oklu doğru parçası. */
export const arrow = (
    k: Ctx,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    size = 8,
    width?: number
) => {
    line(k, x1, y1, x2, y2, width);
    arrowHead(k, x2, y2, Math.atan2(y2 - y1, x2 - x1), size);
};

/** Etiketin `label` ile aynı fontta kaplayacağı genişlik (px). */
export const textWidth = (k: Ctx, text: string, scale = 1): number => {
    k.c.save();
    k.c.font = `600 ${Math.round(k.fs * scale)}px ui-sans-serif, system-ui, Arial`;
    const w = k.c.measureText(text).width;
    k.c.restore();
    return w;
};

export const label = (
    k: Ctx,
    text: string,
    x: number,
    y: number,
    align: CanvasTextAlign = 'center',
    baseline: CanvasTextBaseline = 'middle',
    scale = 1
) => {
    k.c.save();
    k.c.font = `600 ${Math.round(k.fs * scale)}px ui-sans-serif, system-ui, Arial`;
    k.c.textAlign = align;
    k.c.textBaseline = baseline;
    k.c.fillText(text, x, y);
    k.c.restore();
};

export const ellipse = (
    k: Ctx,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    dashed = false
) => {
    k.c.save();
    k.c.lineWidth = k.lw;
    if (dashed) k.c.setLineDash([6, 5]);
    k.c.beginPath();
    k.c.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
};

/** Yarı saydam dolgu (sıvı, gölge, vurgulanan bölge). */
export const fillShape = (k: Ctx, build: () => void, alpha = 0.22) => {
    k.c.save();
    k.c.globalAlpha = alpha;
    k.c.beginPath();
    build();
    k.c.fill();
    k.c.restore();
};

/** Çokgen/serbest yol çizer; `close` verilirse kapatır. */
export const path = (k: Ctx, points: ReadonlyArray<[number, number]>, close = false) => {
    if (points.length === 0) return;
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) k.c.lineTo(points[i][0], points[i][1]);
    if (close) k.c.closePath();
    k.c.stroke();
};

/**
 * Yuvarlatılmış dikdörtgen YOLU kurar (çizmez). Çağıran `stroke()` ya da
 * `fill()` ile bitirir; etiket rozetleri ve kutucuklar bunu kullanır.
 */
export const roundRect = (
    k: Ctx,
    x: number,
    y: number,
    w: number,
    h: number,
    rad = 6
) => {
    const rr = Math.max(0, Math.min(rad, w / 2, h / 2));
    k.c.beginPath();
    k.c.moveTo(x + rr, y);
    k.c.arcTo(x + w, y, x + w, y + h, rr);
    k.c.arcTo(x + w, y + h, x, y + h, rr);
    k.c.arcTo(x, y + h, x, y, rr);
    k.c.arcTo(x, y, x + w, y, rr);
    k.c.closePath();
};

/**
 * Nesne, panel önizlemesi gibi simge ölçeğinde mi çiziliyor?
 * Bu boyutta eksen, etiket ve okuma sütunu okunmaz; çizimler sadeleşir.
 */
export const isIconSize = (r: Rect): boolean => Math.min(r.w, r.h) < 90;

/**
 * Verilen genişliğe sığan ilk metni seçer (adaylar uzundan kısaya).
 * Nesne küçültüldüğünde yazı boyu tabanlı olduğundan uzun başlıklar kutudan
 * taşıyordu; kısaltma bu yüzden çizim anında yapılır.
 */
export const fitText = (k: Ctx, candidates: string[], maxWidth: number, scale = 1): string => {
    for (const text of candidates) if (textWidth(k, text, scale) <= maxWidth) return text;
    return candidates[candidates.length - 1];
};

/** Türkçe biçimli sayı: tam sayıysa düz, değilse virgüllü ve eksi işaretli. */
export const fmtNum = (v: number, digits = 2): string => {
    const p = 10 ** digits;
    const rounded = Math.round(v * p) / p;
    const text = Number.isInteger(rounded)
        ? String(Math.abs(rounded))
        : String(Math.abs(rounded)).replace('.', ',');
    return (rounded < 0 ? '−' : '') + text;
};
