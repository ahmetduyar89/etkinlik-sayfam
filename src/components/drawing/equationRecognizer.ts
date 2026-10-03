// src/components/drawing/equationRecognizer.ts
// El yazısı matematik ifadelerini cihaz üstünde okuma.
//
// Sunucu ya da model dosyası kullanmaz: her sembol normalleştirilmiş bir
// bitmap'e çevrilip tarayıcının kendi yazı tipleriyle üretilen örneklerle
// karşılaştırılır. Rakamlar, temel işlem işaretleri ve sık kullanılan birkaç
// harf için iyi çalışır; integral, matris gibi karmaşık yapılar hedef değil.
//
// Akış:  çizimler → sembollere ayır → her sembolü tanı → düzeni çöz (kesir,
//        üs) → metin ifade.

import type { Point, Stroke } from '../../types';

/** Karşılaştırma bitmap'inin kenar uzunluğu. */
const GRID = 16;

/** Tanınan karakterler. */
const ALPHABET = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '+',
    '×',
    '÷',
    '(',
    ')',
    'x',
    'y',
    '√',
];

/** Örnek bitmap üretilirken kullanılan yazı tipleri. */
const PROTOTYPE_FONTS = ['700 96px serif', '400 96px sans-serif', '400 96px serif'];

interface SymbolBox {
    strokes: Stroke[];
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface Prototype {
    char: string;
    cells: Float32Array;
    aspect: number;
}

let prototypeCache: Prototype[] | null = null;

const bounds = (points: Point[]) => {
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const p of points) {
        if (p.x < x1) x1 = p.x;
        if (p.y < y1) y1 = p.y;
        if (p.x > x2) x2 = p.x;
        if (p.y > y2) y2 = p.y;
    }
    return { x1, y1, x2, y2 };
};

/** Bir çizim kümesini GRID×GRID gri tonlamalı hücrelere indirger. */
function rasterize(
    draw: (ctx: CanvasRenderingContext2D, scale: number, ox: number, oy: number) => void,
    box: { x1: number; y1: number; x2: number; y2: number }
): { cells: Float32Array; aspect: number } {
    const canvas = document.createElement('canvas');
    // Kenar payı: uçlar kırpılmasın.
    const size = GRID * 4;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const cells = new Float32Array(GRID * GRID);
    const w = Math.max(1e-3, box.x2 - box.x1);
    const h = Math.max(1e-3, box.y2 - box.y1);
    const aspect = w / h;
    if (!ctx) return { cells, aspect };

    // En boy oranı korunarak kutuya sığdır (ince çizgiler de görünsün).
    const pad = size * 0.12;
    const scale = Math.min((size - pad * 2) / w, (size - pad * 2) / h);
    const ox = (size - w * scale) / 2 - box.x1 * scale;
    const oy = (size - h * scale) / 2 - box.y1 * scale;

    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';
    draw(ctx, scale, ox, oy);

    const data = ctx.getImageData(0, 0, size, size).data;
    const step = size / GRID;
    for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
            let sum = 0;
            for (let y = 0; y < step; y++) {
                for (let x = 0; x < step; x++) {
                    const px = Math.floor(gx * step + x);
                    const py = Math.floor(gy * step + y);
                    sum += data[(py * size + px) * 4 + 3] / 255;
                }
            }
            cells[gy * GRID + gx] = sum / (step * step);
        }
    }
    return { cells, aspect };
}

/**
 * Elle çizilmiş biçimlere yakın ek örnekler (birim kutuda çoklu çizgi).
 *
 * Yazı tipi örnekleri tek başına yetmiyor: insanlar "1"i çoğu zaman düz bir
 * çizgi, "7"yi iki çizgi olarak yazar. Bu örnekler el yazısıyla aynı yoldan
 * (aynı kalem kalınlığı ve normalleştirme) rasterlenir.
 */
const HAND_PROTOTYPES: { char: string; strokes: [number, number][][] }[] = [
    { char: '1', strokes: [[[0.5, 0], [0.5, 1]]] },
    { char: '1', strokes: [[[0.2, 0.2], [0.5, 0], [0.5, 1]]] },
    { char: '1', strokes: [[[0.35, 0.2], [0.6, 0], [0.6, 1]]] },
    { char: '1', strokes: [[[0.45, 0.15], [0.62, 0], [0.62, 1]]] },
    { char: '1', strokes: [[[0.3, 0.25], [0.5, 0], [0.5, 1]], [[0.2, 1], [0.8, 1]]] },
    { char: '7', strokes: [[[0, 0], [1, 0], [0.35, 1]]] },
    { char: '4', strokes: [[[0.7, 0], [0.05, 0.68], [1, 0.68]], [[0.7, 0], [0.7, 1]]] },
    { char: '+', strokes: [[[0, 0.5], [1, 0.5]], [[0.5, 0], [0.5, 1]]] },
    { char: '×', strokes: [[[0, 0], [1, 1]], [[1, 0], [0, 1]]] },
    { char: 'x', strokes: [[[0, 0], [1, 1]], [[1, 0], [0, 1]]] },
    { char: '(', strokes: [[[0.8, 0], [0.2, 0.5], [0.8, 1]]] },
    { char: ')', strokes: [[[0.2, 0], [0.8, 0.5], [0.2, 1]]] },
    { char: '√', strokes: [[[0, 0.55], [0.25, 1], [0.6, 0], [1, 0]]] },
];

/** Çizim kümesini örnek bitmap'ine çevirirken kullanılan ortak çizim. */
function strokePainter(
    polylines: { x: number; y: number }[][]
): (ctx: CanvasRenderingContext2D, scale: number, ox: number, oy: number) => void {
    return (ctx, scale, ox, oy) => {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(scale, scale);
        ctx.lineWidth = Math.max(1.5, 2.2 / scale);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const line of polylines) {
            ctx.beginPath();
            line.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
            if (line.length === 1) {
                ctx.arc(line[0].x, line[0].y, 1.5 / scale, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.stroke();
        }
        ctx.restore();
    };
}

/** Yazı tipinden üretilmiş karşılaştırma örnekleri (bir kez hesaplanır). */
function prototypes(): Prototype[] {
    if (prototypeCache) return prototypeCache;
    const out: Prototype[] = [];
    const measure = document.createElement('canvas');
    measure.width = 220;
    measure.height = 220;
    const mctx = measure.getContext('2d');
    if (!mctx) return [];

    for (const font of PROTOTYPE_FONTS) {
        for (const char of ALPHABET) {
            mctx.clearRect(0, 0, measure.width, measure.height);
            mctx.font = font;
            mctx.textAlign = 'center';
            mctx.textBaseline = 'middle';
            mctx.fillStyle = '#000';
            mctx.fillText(char, 110, 110);
            const data = mctx.getImageData(0, 0, measure.width, measure.height).data;
            let x1 = Infinity;
            let y1 = Infinity;
            let x2 = -Infinity;
            let y2 = -Infinity;
            for (let y = 0; y < measure.height; y++) {
                for (let x = 0; x < measure.width; x++) {
                    if (data[(y * measure.width + x) * 4 + 3] > 40) {
                        if (x < x1) x1 = x;
                        if (y < y1) y1 = y;
                        if (x > x2) x2 = x;
                        if (y > y2) y2 = y;
                    }
                }
            }
            if (!Number.isFinite(x1)) continue;
            const { cells, aspect } = rasterize(
                (ctx, scale, ox, oy) => {
                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.scale(scale, scale);
                    ctx.font = font;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(char, 110, 110);
                    ctx.restore();
                },
                { x1, y1, x2, y2 }
            );
            out.push({ char, cells: blur(cells), aspect });
        }
    }
    // Elle çizilmiş biçimler.
    for (const proto of HAND_PROTOTYPES) {
        const polylines = proto.strokes.map((line) =>
            line.map(([x, y]) => ({ x, y }))
        );
        const all = polylines.flat();
        const box = {
            x1: Math.min(...all.map((p) => p.x)),
            y1: Math.min(...all.map((p) => p.y)),
            x2: Math.max(...all.map((p) => p.x)),
            y2: Math.max(...all.map((p) => p.y)),
        };
        const { cells, aspect } = rasterize(strokePainter(polylines), box);
        out.push({ char: proto.char, cells: blur(cells), aspect });
    }

    prototypeCache = out;
    return out;
}

/**
 * Bitmap'i hafifçe bulanıklaştırır.
 *
 * El yazısı ile yazı tipi örneği aynı harfte bile birkaç piksel kayar;
 * bulanıklık bu kaymayı bağışlar ve eşleşmeyi belirgin biçimde düzeltir.
 */
function blur(cells: Float32Array): Float32Array {
    const out = new Float32Array(cells.length);
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            let sum = 0;
            let n = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
                    sum += cells[ny * GRID + nx];
                    n++;
                }
            }
            out[y * GRID + x] = sum / n;
        }
    }
    return out;
}

/** İki bitmap arasındaki uzaklık (0 = aynı). Kosinüs benzerliğine dayanır. */
function distance(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if (na === 0 || nb === 0) return 1;
    return 1 - dot / Math.sqrt(na * nb);
}

/**
 * Çizimleri sembollere ayırır.
 *
 * İki iz, kutuları arasındaki boşluk sembol yüksekliğine göre küçükse aynı
 * sembole girer. Yalnızca yatay örtüşmeye bakmak yetmiyordu: artı işaretinin
 * dikey çizgisinin genişliği sıfır olduğu için hiçbir zaman örtüşmüyordu.
 */
function segment(strokes: Stroke[]): SymbolBox[] {
    const items = strokes
        .filter((s) => s.points.length > 0)
        .map((s) => ({ stroke: s, ...bounds(s.points) }));
    if (items.length === 0) return [];

    // Ölçek: izlerin ortanca yüksekliği bir sembolün kabaca boyudur.
    const heights = items.map((i) => Math.max(i.y2 - i.y1, i.x2 - i.x1)).sort((a, b) => a - b);
    const unit = Math.max(8, heights[Math.floor(heights.length / 2)]);
    const maxGapX = unit * 0.22;

    // Birleştirme-bul: yakın izler aynı kümeye girer.
    const parent = items.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (a: number, b: number) => {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[rb] = ra;
    };
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const a = items[i];
            const b = items[j];
            const gapX = Math.max(0, Math.max(a.x1, b.x1) - Math.min(a.x2, b.x2));
            const gapY = Math.max(0, Math.max(a.y1, b.y1) - Math.min(a.y2, b.y2));
            if (gapX > maxGapX) continue;
            // Dikeyde ancak birlikte tek bir sembol boyunda kalıyorlarsa
            // birleşirler: eşittir çizgileri ve i'nin noktası böyle toplanır,
            // kesrin payı ile paydası ayrı kalır.
            const unionH = Math.max(a.y2, b.y2) - Math.min(a.y1, b.y1);
            if (gapY <= unit * 0.05 || unionH <= unit * 0.9) union(i, j);
        }
    }

    const byRoot = new Map<number, SymbolBox>();
    items.forEach((item, i) => {
        const root = find(i);
        const group = byRoot.get(root);
        if (group) {
            group.strokes.push(item.stroke);
            group.x1 = Math.min(group.x1, item.x1);
            group.y1 = Math.min(group.y1, item.y1);
            group.x2 = Math.max(group.x2, item.x2);
            group.y2 = Math.max(group.y2, item.y2);
        } else {
            byRoot.set(root, {
                strokes: [item.stroke],
                x1: item.x1,
                y1: item.y1,
                x2: item.x2,
                y2: item.y2,
            });
        }
    });
    return [...byRoot.values()].sort((a, b) => a.x1 - b.x1);
}

/** Bir sembolü tanır. */
function classify(sym: SymbolBox, medianHeight: number): string {
    const w = sym.x2 - sym.x1;
    const h = sym.y2 - sym.y1;

    // Yassı ve yatay şekiller yazı tipi örnekleriyle ayırt edilemez;
    // eşittir, bölü ve eksi yapılarına bakarak karar verilir.
    const rows = sym.strokes.map((st) => bounds(st.points));
    const flat = (r: { x1: number; y1: number; x2: number; y2: number }) =>
        r.y2 - r.y1 <= Math.max(4, (r.x2 - r.x1) * 0.28) && r.x2 - r.x1 > medianHeight * 0.25;
    const flatBars = rows.filter(flat);
    const dots = rows.filter(
        (r) =>
            r.x2 - r.x1 < medianHeight * 0.3 &&
            r.y2 - r.y1 < medianHeight * 0.3 &&
            !flat(r)
    );
    if (flatBars.length >= 2) return '=';
    if (flatBars.length === 1 && dots.length >= 2) return '÷';
    if (flatBars.length === 1 && sym.strokes.length === 1) return '-';

    // Dar ve neredeyse düz tek bir iz "1"dir. Bu ölçüde bitmap karşılaştırması
    // ayırt edemiyor: parantez de birer dikey leke hâline geliyor. Kirişten
    // sapma ise ikisini net biçimde ayırır (parantez belirgin yay çizer).
    if (sym.strokes.length === 1 && w / h < 0.45) {
        const pts = sym.strokes[0].points;
        const a = pts[0];
        const b = pts[pts.length - 1];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        // Kapalı izlerde (8, 0) uçlar birleşir; kiriş ölçüsü anlamsız olur.
        if (len < h * 0.6) return classifyByBitmap(sym, w, h, medianHeight);
        let maxDev = 0;
        for (const q of pts) {
            const dev =
                Math.abs((b.x - a.x) * (a.y - q.y) - (a.x - q.x) * (b.y - a.y)) / len;
            if (dev > maxDev) maxDev = dev;
        }
        if (maxDev / h < 0.28) return '1';
    }

    return classifyByBitmap(sym, w, h, medianHeight);
}

/** Sembolü örnek bitmap'leriyle karşılaştırarak tanır. */
function classifyByBitmap(
    sym: SymbolBox,
    w: number,
    h: number,
    medianHeight: number
): string {
    const { cells, aspect } = rasterize(
        strokePainter(sym.strokes.map((st) => st.points.map((p) => ({ x: p.x, y: p.y })))),
        sym
    );

    const blurred = blur(cells);
    let best = { char: '?', score: Infinity };
    for (const proto of prototypes()) {
        // En boy oranı farkı da cezalandırılır: 1 ile 0 aynı bitmap'e
        // benzeyebilir ama oranları çok farklıdır.
        const score =
            distance(blurred, proto.cells) +
            Math.abs(Math.log(aspect / proto.aspect)) * 0.22;
        if (score < best.score) best = { char: proto.char, score };
    }

    // Nokta boyutundaki şekil ondalık ayracıdır.
    if (h < medianHeight * 0.25 && w < medianHeight * 0.25) return ',';
    return best.char;
}

/**
 * Sembolleri soldan sağa okuyup ifadeyi kurar; kesir çizgisi ve üs düzenini
 * çözer.
 */
function layout(symbols: { box: SymbolBox; char: string }[]): string {
    if (symbols.length === 0) return '';
    const heights = symbols.map((s) => s.box.y2 - s.box.y1);
    const median = heights.slice().sort((a, b) => a - b)[Math.floor(heights.length / 2)] || 1;

    // Kesir çizgisi: kendi genişliğinde, üstünde ve altında sembol olan '-'.
    const used = new Set<number>();
    const parts: string[] = [];

    symbols.forEach((sym, i) => {
        if (used.has(i)) return;
        const w = sym.box.x2 - sym.box.x1;
        if (sym.char === '-' && w > median * 0.9) {
            const above: typeof symbols = [];
            const below: typeof symbols = [];
            symbols.forEach((other, j) => {
                if (j === i || used.has(j)) return;
                const cx = (other.box.x1 + other.box.x2) / 2;
                const cy = (other.box.y1 + other.box.y2) / 2;
                if (cx < sym.box.x1 - 4 || cx > sym.box.x2 + 4) return;
                if (cy < sym.box.y1) above.push(other);
                else below.push(other);
            });
            if (above.length && below.length) {
                above.forEach((o) => used.add(symbols.indexOf(o)));
                below.forEach((o) => used.add(symbols.indexOf(o)));
                used.add(i);
                const top = above.map((o) => o.char).join('');
                const bottom = below.map((o) => o.char).join('');
                parts.push(`(${top})/(${bottom})`);
                return;
            }
        }

        // Üs: bir öncekine göre belirgin yukarıda ve küçükse.
        const prev = symbols[i - 1];
        if (prev && !used.has(i - 1)) {
            const prevMid = (prev.box.y1 + prev.box.y2) / 2;
            const mid = (sym.box.y1 + sym.box.y2) / 2;
            const small = sym.box.y2 - sym.box.y1 < (prev.box.y2 - prev.box.y1) * 0.75;
            if (small && prevMid - mid > (prev.box.y2 - prev.box.y1) * 0.35) {
                parts.push(`^${sym.char}`);
                used.add(i);
                return;
            }
        }

        parts.push(sym.char);
        used.add(i);
    });

    return parts.join('');
}

/**
 * Seçili el yazısı çizimlerinden matematik ifadesini okur.
 *
 * Yalnızca serbest çizim (kalem) izleri kullanılır; şekiller, metin ve
 * nesneler yok sayılır. Sonuç düzenlenebilir bir metindir — tanıma kusurlu
 * olabileceği için kullanıcıya onaylatılması beklenir.
 */
export function recognizeEquation(strokes: Stroke[]): string {
    const ink = strokes.filter((s) => s.tool === 'pencil' || s.tool === 'highlighter');
    if (ink.length === 0) return '';
    const symbols = segment(ink);
    if (symbols.length === 0) return '';
    const heights = symbols.map((s) => s.y2 - s.y1).sort((a, b) => a - b);
    const median = heights[Math.floor(heights.length / 2)] || 1;
    const classified = symbols.map((box) => ({ box, char: classify(box, median) }));
    return layout(classified);
}
