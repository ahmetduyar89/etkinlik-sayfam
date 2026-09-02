// src/components/drawing/mathSims.ts
// Matematik için canlı simülasyonlar: cebir terazisi ve alan-çevre kâşifi.
//
// Ortak çizim altyapısı objectDrawing.ts'te, kayıt (renderer/spec/katalog)
// simObjects.ts'in sonundadır. Kalıcı olarak yalnızca kullanıcının ayarladığı
// değerler saklanır (MathObject.sim); türetilen her şey her karede hesaplanır.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    path,
    roundRect,
    simValue,
    textWidth,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── Cebir terazisi (Denklemler) ──────────────────────────────────────
//
// Kilit fikir: denklem bir dengedir. Eşitliği bozmayan tek şey, İKİ TARAFA
// birden uygulanan aynı işlemdir. Bu yüzden düğmeler tek tarafı değil daima
// iki tarafı birden değiştirir; kiriş de hep yatay kalır.

interface EqState {
    /** Sol kefedeki x sayısı ve birim sayısı. */
    lx: number;
    lc: number;
    /** Sağ kefedeki x sayısı ve birim sayısı. */
    rx: number;
    rc: number;
}

const eqState = (o: MathObject): EqState => ({
    lx: simValue(o, 'lx', 3),
    lc: simValue(o, 'lc', 2),
    rx: simValue(o, 'rx', 0),
    rc: simValue(o, 'rc', 11),
});

/** Denklem çözülmüş mü: bir tarafta yalnız 1x, diğerinde yalnız sayı. */
const eqSolved = (s: EqState): boolean =>
    (s.lx === 1 && s.lc === 0 && s.rx === 0) || (s.rx === 1 && s.rc === 0 && s.lx === 0);

/** "3x + 2" gibi bir tarafın metni. */
function eqSide(xs: number, c: number): string {
    const terms: string[] = [];
    if (xs !== 0) {
        const coef = Math.abs(xs) === 1 ? '' : fmtNum(Math.abs(xs));
        terms.push(`${xs < 0 ? '−' : ''}${coef}x`);
    }
    if (c !== 0 || xs === 0) {
        const value = fmtNum(Math.abs(c));
        terms.push(terms.length === 0 ? `${c < 0 ? '−' : ''}${value}` : `${c < 0 ? '−' : '+'} ${value}`);
    }
    return terms.join(' ');
}

function eqGeom(r: Rect) {
    // Yazı boyu `drawLibraryObject` ile aynı formülden gelir; küçük kutularda
    // metinler üst üste binmesin diye alt satırlar buna göre yerleşir.
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const ctrlY = r.y + r.h * 0.965;
    const captionY = ctrlY - fs * 2.1;
    const cx = r.x + r.w / 2;
    // Kefeler kutuya sığmalı: kefe merkezleri ±half, genişlikleri panW.
    const half = r.w * 0.27;
    const beamY = r.y + r.h * 0.22;
    return {
        cx,
        half,
        beamY,
        leftX: cx - half,
        rightX: cx + half,
        panW: Math.min(r.w * 0.36, half * 1.35),
        panTop: r.y + r.h * 0.28,
        panH: r.h * 0.38,
        // Küçük kutuda zemin çizgisi çözüm yazısının üstünde kalmalı.
        groundY: Math.min(r.y + r.h * 0.74, captionY - fs * 1.1),
        captionY,
        ctrlY,
    };
}

/** Kefedeki miktarlar tek tek nesne olarak çizilemeyecek kadar büyük/ondalık mı? */
const eqAsCard = (xs: number, c: number): boolean =>
    !Number.isInteger(xs) || !Number.isInteger(c) || Math.abs(xs) > 8 || Math.abs(c) > 12;

/** Bir kefenin içeriğini çizer. */
function eqDrawPan(k: Ctx, px: number, top: number, w: number, h: number, xs: number, c: number) {
    // Kefe kabı
    k.c.save();
    k.c.lineWidth = k.lw;
    roundRect(k, px - w / 2, top, w, h, Math.min(10, w * 0.08));
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.06;
    k.c.fill();
    k.c.restore();
    k.c.restore();

    // Kutu küçüldüğünde (panel önizlemesi) yazılar okunmaz ve iç içe geçer;
    // bu ölçekte yalnızca şekiller çizilir.
    const showText = Math.min(w, h) > k.fs * 3.6;

    if (xs === 0 && c === 0) {
        if (showText) label(k, '0', px, top + h / 2, 'center', 'middle', 1.1);
        return;
    }

    if (eqAsCard(xs, c)) {
        const text = eqSide(xs, c);
        const tw = textWidth(k, text, 1.05) + k.fs * 1.2;
        const th = k.fs * 2;
        k.c.save();
        k.c.lineWidth = k.lw;
        roundRect(k, px - tw / 2, top + h / 2 - th / 2, tw, th, 6);
        k.c.stroke();
        k.c.restore();
        if (showText) label(k, text, px, top + h / 2, 'center', 'middle', 1.05);
        return;
    }

    // Tek tek nesneler: x kutuları ve birim daireler, kefenin dibinden yukarı.
    const items: Array<{ x: boolean; neg: boolean }> = [];
    for (let i = 0; i < Math.abs(xs); i++) items.push({ x: true, neg: xs < 0 });
    for (let i = 0; i < Math.abs(c); i++) items.push({ x: false, neg: c < 0 });

    const cols = 4;
    const cell = Math.min(w / (cols + 0.4), h / 3.4);
    // Nesneler tanınamayacak kadar küçülürse kefe boş bırakılır: önizlemede
    // üst üste binen onlarca daire lekeye dönüşüyordu.
    if (cell < k.fs * 0.6) return;
    const rows = Math.ceil(items.length / cols);
    const firstRowY = top + h - cell * 0.62 - (rows - 1) * cell;

    for (let row = 0; row < rows; row++) {
        const rowItems = items.slice(row * cols, row * cols + cols);
        const startX = px - ((rowItems.length - 1) * cell) / 2;
        const cy = firstRowY + row * cell;
        rowItems.forEach((it, i) => {
            const ix = startX + i * cell;
            k.c.save();
            k.c.lineWidth = k.lw;
            if (it.neg) k.c.setLineDash([4, 3]);
            if (it.x) {
                const side = cell * 0.7;
                k.c.strokeRect(ix - side / 2, cy - side / 2, side, side);
                if (!it.neg) {
                    k.c.save();
                    k.c.globalAlpha = 0.14;
                    k.c.fillRect(ix - side / 2, cy - side / 2, side, side);
                    k.c.restore();
                }
            } else {
                k.c.beginPath();
                k.c.arc(ix, cy, cell * 0.3, 0, Math.PI * 2);
                k.c.stroke();
                if (!it.neg) {
                    k.c.save();
                    k.c.globalAlpha = 0.2;
                    k.c.fill();
                    k.c.restore();
                }
            }
            k.c.restore();
            // Eksi birim yalnızca '−' ile yazılır: küçük dairede '−1' sığmıyor.
            if (cell >= k.fs * 1.15) {
                label(k, it.x ? (it.neg ? '−x' : 'x') : it.neg ? '−' : '1', ix, cy, 'center', 'middle', 0.68);
            }
        });
    }
}

export const equationRender: Renderer = (k) => {
    const r = k.r;
    const g = eqGeom(r);
    const s = eqState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Zemin ve destek üçgeni
    line(k, g.cx - r.w * 0.15, g.groundY, g.cx + r.w * 0.15, g.groundY);
    path(
        k,
        [
            [g.cx - r.w * 0.04, g.groundY],
            [g.cx, g.beamY],
            [g.cx + r.w * 0.04, g.groundY],
        ],
        true,
    );

    // Kiriş: eşitlik korunduğu için daima yatay
    line(k, g.leftX, g.beamY, g.rightX, g.beamY, Math.max(2, k.lw));
    for (const px of [g.leftX, g.rightX]) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        line(k, px, g.beamY, px - g.panW * 0.42, g.panTop, 1);
        line(k, px, g.beamY, px + g.panW * 0.42, g.panTop, 1);
        k.c.restore();
    }

    eqDrawPan(k, g.leftX, g.panTop, g.panW, g.panH, s.lx, s.lc);
    eqDrawPan(k, g.rightX, g.panTop, g.panW, g.panH, s.rx, s.rc);

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(k, `${eqSide(s.lx, s.lc)} = ${eqSide(s.rx, s.rc)}`, g.cx, r.y + 2, 'center', 'top', 1.15);

    // Çözüm: katsayılar eşitse denklem ya hep doğrudur ya hiç.
    const denom = s.lx - s.rx;
    const num = s.rc - s.lc;
    const solution =
        denom !== 0
            ? `x = ${fmtNum(num / denom)}`
            : num === 0
              ? 'Her x değeri sağlar'
              : 'Çözüm yok';
    label(k, eqSolved(s) ? `Çözüldü · ${solution}` : `Çözüm: ${solution}`, g.cx, g.captionY, 'center', 'middle', 0.92);

    // Düğme başlıkları: nokta tek başına ne yaptığını anlatmıyor.
    const caps: Array<[number, string]> = [
        [g.cx - r.w * 0.27, 'sabiti sil'],
        [g.cx, 'x sadeleştir'],
        [g.cx + r.w * 0.27, 'katsayıya böl'],
    ];
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.75);
    for (const [x, text] of caps) label(k, text, x, g.ctrlY - k.fs * 0.95, 'center', 'bottom', 0.68);
    k.c.restore();
    k.c.restore();
};

export const equationSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const g = eqGeom(r);
        const s = eqState(o);
        return [
            {
                id: 'const',
                x: g.cx - r.w * 0.27,
                y: g.ctrlY,
                type: 'toggle',
                label: 'Her iki taraftan aynı sayıyı çıkar',
                on: s.lc === 0 && s.rc !== 0,
            },
            {
                id: 'xs',
                x: g.cx,
                y: g.ctrlY,
                type: 'toggle',
                label: 'Her iki taraftan aynı sayıda x çıkar',
                on: s.lx === 0 || s.rx === 0,
            },
            {
                id: 'div',
                x: g.cx + r.w * 0.27,
                y: g.ctrlY,
                type: 'toggle',
                label: 'Her iki tarafı x katsayısına böl',
                on: eqSolved(s),
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = eqState(o);
        if (id === 'const') {
            // x'in bulunduğu taraftaki sabit sıfırlanır; iki taraftan da çıkar.
            const m = s.lc !== 0 ? s.lc : s.rc;
            if (m === 0) return {};
            return { lc: s.lc - m, rc: s.rc - m };
        }
        if (id === 'xs') {
            // Küçük olan x sayısı iki taraftan çıkarılır; x tek tarafta kalır.
            const m = Math.abs(s.lx) <= Math.abs(s.rx) ? s.lx : s.rx;
            if (m === 0) return {};
            return { lx: s.lx - m, rx: s.rx - m };
        }
        if (id === 'div') {
            // Yalnızca x yalnız kaldığında bölünür; aksi halde önce sadeleşme.
            if (s.rx === 0 && s.lc === 0 && s.lx !== 0 && s.lx !== 1) {
                return { lx: 1, rc: s.rc / s.lx };
            }
            if (s.lx === 0 && s.rc === 0 && s.rx !== 0 && s.rx !== 1) {
                return { rx: 1, lc: s.lc / s.rx };
            }
            return {};
        }
        return {};
    },
    params: [
        { key: 'lx', label: 'Sol: x sayısı', min: -6, max: 8, step: 1 },
        { key: 'lc', label: 'Sol: birim', min: -12, max: 20, step: 1 },
        { key: 'rx', label: 'Sağ: x sayısı', min: -6, max: 8, step: 1 },
        { key: 'rc', label: 'Sağ: birim', min: -12, max: 30, step: 1 },
    ],
};

// ── Alan – Çevre kâşifi (Ölçme) ──────────────────────────────────────
//
// Şekil birim kareli ızgaraya oturur: alan "kaç birim kare kapladı",
// çevre "kenar boyunca kaç birim yürüdük" olarak görülebilsin diye.

const AREA_COLS = 12;
const AREA_ROWS = 9;
/** 0 dikdörtgen, 1 üçgen, 2 paralelkenar. */
const AREA_MODES = ['Dikdörtgen', 'Üçgen', 'Paralelkenar'];

interface AreaState {
    mode: number;
    w: number;
    h: number;
    /** Üçgende tepe noktasının, paralelkenarda üst kenarın yatay kayması. */
    skew: number;
}

function areaState(o: MathObject): AreaState {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 2, 0);
    const w = clampInt(simValue(o, 'w', 6), 1, AREA_COLS, 6);
    const h = clampInt(simValue(o, 'h', 4), 1, AREA_ROWS, 4);
    // Paralelkenar ızgaradan taşmasın diye kayma genişliğe bağlı sınırlanır.
    const maxSkew = mode === 2 ? AREA_COLS - w : AREA_COLS;
    return { mode, w, h, skew: clampInt(simValue(o, 'skew', 2), 0, Math.max(0, maxSkew), 2) };
}

function areaGeom(r: Rect) {
    const u = Math.min((r.w * 0.9) / AREA_COLS, (r.h * 0.76) / AREA_ROWS);
    const gw = u * AREA_COLS;
    const gh = u * AREA_ROWS;
    const ox = r.x + (r.w - gw) / 2;
    const oy = r.y + (r.h * 0.80 - gh) / 2;
    return {
        u,
        gw,
        gh,
        ox,
        oy,
        /** Izgara koordinatını (birim) ekran noktasına çevirir. */
        p: (gx: number, gy: number) => ({ x: ox + gx * u, y: oy + gh - gy * u }),
    };
}

/** Şeklin ızgara koordinatındaki köşeleri. */
function areaPoints(s: AreaState): Array<[number, number]> {
    if (s.mode === 1) {
        return [
            [0, 0],
            [s.w, 0],
            [s.skew, s.h],
        ];
    }
    if (s.mode === 2) {
        return [
            [0, 0],
            [s.w, 0],
            [s.w + s.skew, s.h],
            [s.skew, s.h],
        ];
    }
    return [
        [0, 0],
        [s.w, 0],
        [s.w, s.h],
        [0, s.h],
    ];
}

function areaMetrics(s: AreaState) {
    if (s.mode === 1) {
        const left = Math.hypot(s.skew, s.h);
        const right = Math.hypot(s.w - s.skew, s.h);
        return { area: (s.w * s.h) / 2, perimeter: s.w + left + right, formula: 'Alan = (taban · yükseklik) / 2' };
    }
    if (s.mode === 2) {
        const side = Math.hypot(s.skew, s.h);
        return { area: s.w * s.h, perimeter: 2 * (s.w + side), formula: 'Alan = taban · yükseklik' };
    }
    return { area: s.w * s.h, perimeter: 2 * (s.w + s.h), formula: 'Alan = kısa kenar · uzun kenar' };
}

export const areaRender: Renderer = (k) => {
    const r = k.r;
    const s = areaState(k.o);
    const g = areaGeom(r);
    const m = areaMetrics(s);
    const pts = areaPoints(s).map(([gx, gy]) => g.p(gx, gy));

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Birim kareli ızgara
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.22);
    for (let i = 0; i <= AREA_COLS; i++) {
        line(k, g.ox + i * g.u, g.oy, g.ox + i * g.u, g.oy + g.gh, 1);
    }
    for (let j = 0; j <= AREA_ROWS; j++) {
        line(k, g.ox, g.oy + j * g.u, g.ox + g.gw, g.oy + j * g.u, 1);
    }
    k.c.restore();

    // Şeklin içindeki birim kareler koyulaştırılır: alan sayılabilsin.
    k.c.save();
    k.c.beginPath();
    pts.forEach((p, i) => (i === 0 ? k.c.moveTo(p.x, p.y) : k.c.lineTo(p.x, p.y)));
    k.c.closePath();
    k.c.clip();
    k.c.save();
    k.c.globalAlpha = 0.14;
    k.c.fill();
    k.c.restore();
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    for (let i = 0; i <= AREA_COLS; i++) line(k, g.ox + i * g.u, g.oy, g.ox + i * g.u, g.oy + g.gh, 1);
    for (let j = 0; j <= AREA_ROWS; j++) line(k, g.ox, g.oy + j * g.u, g.ox + g.gw, g.oy + j * g.u, 1);
    k.c.restore();

    // Şeklin kenarları
    k.c.lineWidth = Math.max(1.6, k.lw);
    k.c.beginPath();
    pts.forEach((p, i) => (i === 0 ? k.c.moveTo(p.x, p.y) : k.c.lineTo(p.x, p.y)));
    k.c.closePath();
    k.c.stroke();

    // Eğik şekillerde yükseklik kesikli çizilir: çevre ile karışmasın.
    if (s.mode !== 0) {
        // Yüksekliğin ayağı: üçgende tepe, paralelkenarda üst kenar kayması.
        const a = g.p(s.skew, 0);
        const b = g.p(s.skew, s.h);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.7);
        k.c.setLineDash([5, 4]);
        line(k, a.x, a.y, b.x, b.y, 1.2);
        k.c.restore();
    }

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Kenar ve yükseklik etiketleri
    const base = g.p(s.w / 2, 0);
    label(k, `${s.w} br`, base.x, base.y + k.fs * 0.5, 'center', 'top', 0.82);
    // Yükseklik etiketi eğik şekillerde sağa yazılır; sol kenarla çakışıyordu.
    const hx = s.mode === 0 ? g.p(0, s.h / 2) : g.p(s.skew, s.h / 2);
    if (s.mode === 0) label(k, `${s.h} br`, hx.x - k.fs * 0.35, hx.y, 'right', 'middle', 0.82);
    else label(k, `${s.h} br`, hx.x + k.fs * 0.35, hx.y, 'left', 'middle', 0.82);
    if (s.mode === 2) {
        const side = g.p(s.w + s.skew / 2, s.h / 2);
        label(k, `${fmtNum(Math.hypot(s.skew, s.h), 1)} br`, side.x + k.fs * 0.4, side.y, 'left', 'middle', 0.78);
    }

    label(
        k,
        fitText(k, [`${AREA_MODES[s.mode]} · ${m.formula}`, AREA_MODES[s.mode]], r.w - k.fs * 3.5, 0.8),
        r.x + r.w / 2,
        r.y + 1,
        'center',
        'top',
        0.8,
    );
    label(
        k,
        fitText(
            k,
            [
                `Alan = ${fmtNum(m.area, 1)} birim²  ·  Çevre = ${fmtNum(m.perimeter, 1)} birim`,
                `A = ${fmtNum(m.area, 1)} br²  ·  Ç = ${fmtNum(m.perimeter, 1)} br`,
            ],
            r.w - 6,
            0.85,
        ),
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.85,
    );
    k.c.restore();
};

export const areaSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = areaState(o);
        const g = areaGeom(r);
        const apex =
            s.mode === 1 ? g.p(s.skew, s.h) : s.mode === 2 ? g.p(s.w + s.skew, s.h) : g.p(s.w, s.h);
        const out: SimControl[] = [
            {
                id: 'mode',
                x: r.x + 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Şekli değiştir (şimdi: ${AREA_MODES[s.mode]})`,
                on: s.mode > 0,
            },
            {
                id: 'apex',
                x: apex.x,
                y: apex.y,
                type: 'drag',
                label: s.mode === 0 ? 'Köşeyi sürükle' : 'Tepe noktasını sürükle',
            },
        ];
        if (s.mode !== 0) {
            const b = g.p(s.w, 0);
            out.push({ id: 'base', x: b.x, y: b.y, type: 'drag', label: 'Tabanı uzat-kısalt' });
        }
        return out;
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = areaState(o);
        const g = areaGeom(r);
        if (id === 'mode') {
            const mode = (s.mode + 1) % 3;
            // Paralelkenar ızgaradan taşmasın diye kayma yeniden sınırlanır.
            return { mode, skew: clamp(s.skew, 0, mode === 2 ? AREA_COLS - s.w : AREA_COLS) };
        }
        const gx = Math.round((p.x - g.ox) / g.u);
        const gy = Math.round((g.oy + g.gh - p.y) / g.u);
        if (id === 'base') {
            const maxW = s.mode === 2 ? AREA_COLS - s.skew : AREA_COLS;
            return { w: clamp(gx, 1, maxW) };
        }
        const h = clamp(gy, 1, AREA_ROWS);
        if (s.mode === 0) return { w: clamp(gx, 1, AREA_COLS), h };
        if (s.mode === 1) return { skew: clamp(gx, 0, AREA_COLS), h };
        return { skew: clamp(gx - s.w, 0, AREA_COLS - s.w), h };
    },
    params: [
        { key: 'mode', label: 'Şekil (0-1-2)', min: 0, max: 2, step: 1 },
        { key: 'w', label: 'Taban', min: 1, max: AREA_COLS, step: 1, unit: 'br' },
        { key: 'h', label: 'Yükseklik', min: 1, max: AREA_ROWS, step: 1, unit: 'br' },
        { key: 'skew', label: 'Eğim (kayma)', min: 0, max: 8, step: 1, unit: 'br' },
    ],
};

// ── Olasılık deneyi (Veri ve Olasılık) ───────────────────────────────
//
// Kilit fikir: tek tek atışlar rastgeledir, ama atış sayısı arttıkça
// deneysel olasılık teorik olasılığa yaklaşır. Bu yüzden çubukların yanında
// beklenen değer çizgisi durur; öğrenci yaklaşmayı gözle görür.

/** 0: madeni para (2 sonuç), 1: zar (6 sonuç). */
const PROB_FACE_LABELS = [
    ['Yazı', 'Tura'],
    ['1', '2', '3', '4', '5', '6'],
];

interface ProbState {
    mode: number;
    faces: number;
    counts: number[];
    total: number;
    /** Son atışın sonucu; hiç atılmadıysa -1. */
    last: number;
}

function probState(o: MathObject): ProbState {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
    const faces = PROB_FACE_LABELS[mode].length;
    const counts = Array.from({ length: faces }, (_, i) =>
        Math.max(0, Math.round(simValue(o, `c${i}`, 0)))
    );
    return {
        mode,
        faces,
        counts,
        total: counts.reduce((a, b) => a + b, 0),
        last: clampInt(simValue(o, 'last', -1), -1, faces - 1, -1),
    };
}

function probGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const ctrlY = r.y + r.h * 0.96;
    // Eksenin altında yüz adı ve yüzde satırı var; düğme başlıklarıyla
    // çakışmasın diye taban çizgisi yazı boyuna göre yukarı çekilir.
    const baseY = Math.min(r.y + r.h * 0.72, ctrlY - fs * 3.9);
    return {
        fs,
        objX: r.x + r.w * 0.13,
        objY: r.y + r.h * 0.42,
        objR: Math.min(r.w * 0.09, r.h * 0.14),
        chartX: r.x + r.w * 0.3,
        chartW: r.w * 0.66,
        baseY,
        topY: r.y + r.h * 0.2,
        ctrlY,
    };
}

/** Zarın bir yüzündeki nokta düzeni (0 tabanlı yüz numarası). */
const DIE_PIPS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
    [[0, 0]],
    [
        [-0.5, -0.5],
        [0.5, 0.5],
    ],
    [
        [-0.5, -0.5],
        [0, 0],
        [0.5, 0.5],
    ],
    [
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
    ],
    [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0, 0],
        [-0.5, 0.5],
        [0.5, 0.5],
    ],
    [
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0],
        [0.5, 0],
        [-0.5, 0.5],
        [0.5, 0.5],
    ],
];

export const probabilityRender: Renderer = (k) => {
    const r = k.r;
    const g = probGeom(r);
    const s = probState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Simge ölçeğinde grafik okunmaz; yalnızca atılan nesne çizilir.
    const icon = isIconSize(r);
    const objX = icon ? r.x + r.w / 2 : g.objX;
    const objY = icon ? r.y + r.h / 2 : g.objY;
    const objR = icon ? Math.min(r.w, r.h) * 0.3 : g.objR;

    // Atılan nesne: para ya da zar, son sonucu gösterir
    if (s.mode === 0) {
        k.c.beginPath();
        k.c.arc(objX, objY, objR, 0, Math.PI * 2);
        k.c.stroke();
        k.c.beginPath();
        k.c.arc(objX, objY, objR * 0.82, 0, Math.PI * 2);
        k.c.stroke();
        if (objR > k.fs * 0.8) {
            label(k, s.last < 0 ? '?' : s.last === 0 ? 'Y' : 'T', objX, objY, 'center', 'middle', 1.3);
        }
    } else {
        const side = objR * 1.7;
        roundRect(k, objX - side / 2, objY - side / 2, side, side, side * 0.18);
        k.c.stroke();
        if (s.last < 0) {
            if (objR > k.fs * 0.8) label(k, '?', objX, objY, 'center', 'middle', 1.3);
        } else {
            for (const [dx, dy] of DIE_PIPS[s.last]) {
                k.c.beginPath();
                k.c.arc(objX + dx * side * 0.3, objY + dy * side * 0.3, side * 0.07, 0, Math.PI * 2);
                k.c.fill();
            }
        }
    }

    if (icon) {
        k.c.restore();
        return;
    }

    // Çubuk grafik: her sonuç için bir çubuk, beklenen değer çizgisi
    const expected = s.total / s.faces;
    const maxCount = Math.max(1, ...s.counts, expected * 1.4);
    const slot = g.chartW / s.faces;
    const barW = slot * 0.56;
    const chartH = g.baseY - g.topY;
    line(k, g.chartX, g.baseY, g.chartX + g.chartW, g.baseY);

    s.counts.forEach((count, i) => {
        const cx = g.chartX + slot * (i + 0.5);
        const h = (count / maxCount) * chartH;
        k.c.save();
        k.c.lineWidth = k.lw;
        k.c.strokeRect(cx - barW / 2, g.baseY - h, barW, h);
        k.c.save();
        k.c.globalAlpha = 0.16;
        k.c.fillRect(cx - barW / 2, g.baseY - h, barW, h);
        k.c.restore();
        k.c.restore();
        if (k.o.labels === false) return;
        label(k, PROB_FACE_LABELS[s.mode][i], cx, g.baseY + k.fs * 0.3, 'center', 'top', 0.72);
        // Yüzde altta, sayı çubuğun içinde: altı yüzlü zarda ikisi yan yana
        // sığmıyor ve etiketler birbirine giriyordu.
        const pct = s.total ? Math.round((count / s.total) * 100) : 0;
        label(k, `%${pct}`, cx, g.baseY + k.fs * 1.25, 'center', 'top', 0.66);
        if (h > k.fs * 1.4) label(k, String(count), cx, g.baseY - h + k.fs * 0.25, 'center', 'top', 0.7);
        else if (count > 0) label(k, String(count), cx, g.baseY - h - k.fs * 0.2, 'center', 'bottom', 0.7);
    });

    // Teorik beklenti: her sonuç için toplam / yüz sayısı
    if (s.total > 0) {
        const y = g.baseY - (expected / maxCount) * chartH;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.6);
        k.c.setLineDash([6, 4]);
        line(k, g.chartX, y, g.chartX + g.chartW, y, 1.4);
        k.c.restore();
    }

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    const theoretical = 1 / s.faces;
    label(
        k,
        fitText(
            k,
            [
                `${s.mode === 0 ? 'Madeni para' : 'Zar'} · ${s.total} atış · teorik ${fmtNum(theoretical, 3)} · beklenen ${fmtNum(expected, 1)} (kesikli çizgi)`,
                `${s.total} atış · teorik ${fmtNum(theoretical, 3)} · beklenen ${fmtNum(expected, 1)}`,
                `${s.total} atış · beklenen ${fmtNum(expected, 1)}`,
            ],
            r.w - 6,
            0.85,
        ),
        r.x + r.w / 2,
        r.y + 1,
        'center',
        'top',
        0.85,
    );

    const caps: Array<[number, string]> = [
        [r.x + r.w * 0.16, '1 at'],
        [r.x + r.w * 0.38, '10 at'],
        [r.x + r.w * 0.6, 'sıfırla'],
        [r.x + r.w * 0.84, s.mode === 0 ? 'zara geç' : 'paraya geç'],
    ];
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.75);
    for (const [x, text] of caps) label(k, text, x, g.ctrlY - k.fs * 0.95, 'center', 'bottom', 0.68);
    k.c.restore();
    k.c.restore();
};

/** `n` atış yapar ve sayaç yamasını döndürür. */
function probRoll(s: ProbState, n: number): Record<string, number> {
    const counts = [...s.counts];
    let last = s.last;
    for (let i = 0; i < n; i++) {
        last = Math.floor(Math.random() * s.faces);
        counts[last]++;
    }
    const patch: Record<string, number> = { last };
    counts.forEach((c, i) => (patch[`c${i}`] = c));
    return patch;
}

export const probabilitySpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const g = probGeom(r);
        const s = probState(o);
        return [
            { id: 'roll1', x: r.x + r.w * 0.16, y: g.ctrlY, type: 'toggle', label: 'Bir kez at', on: false },
            { id: 'roll10', x: r.x + r.w * 0.38, y: g.ctrlY, type: 'toggle', label: '10 kez at', on: false },
            {
                id: 'reset',
                x: r.x + r.w * 0.6,
                y: g.ctrlY,
                type: 'toggle',
                label: 'Sayaçları sıfırla',
                on: s.total === 0,
            },
            {
                id: 'mode',
                x: r.x + r.w * 0.84,
                y: g.ctrlY,
                type: 'toggle',
                label: s.mode === 0 ? 'Zar at' : 'Madeni para at',
                on: s.mode === 1,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = probState(o);
        // Sayaçlar altı yüz için sıfırlanır: zardan paraya dönerken artık
        // kullanılmayan c2..c5 geride kalmasın.
        const clear = (): Record<string, number> => {
            const patch: Record<string, number> = { last: -1 };
            for (let i = 0; i < 6; i++) patch[`c${i}`] = 0;
            return patch;
        };
        if (id === 'roll1') return probRoll(s, 1);
        if (id === 'roll10') return probRoll(s, 10);
        if (id === 'reset') return clear();
        if (id === 'mode') return { ...clear(), mode: s.mode === 0 ? 1 : 0 };
        return {};
    },
    params: [{ key: 'mode', label: 'Deney (0 para / 1 zar)', min: 0, max: 1, step: 1 }],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const MATH_SIM_RENDERERS: Record<string, Renderer> = {
    equation_sim: equationRender,
    area_perimeter_sim: areaRender,
    probability_sim: probabilityRender,
};

export const MATH_SIM_SPECS: Record<string, SimSpec> = {
    equation_sim: equationSpec,
    area_perimeter_sim: areaSpec,
    probability_sim: probabilitySpec,
};

/** Kütüphane panelindeki "Canlı Matematik" kategorisinin içeriği. */
export const MATH_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'equation_sim',
        label: 'Cebir Terazisi',
        hint: 'Denklemi kefelerde kur; iki tarafa aynı işlemi uygulayarak çöz',
        size: { w: 480, h: 360 },
        defaults: { labels: true, sim: { lx: 3, lc: 2, rx: 0, rc: 11 } },
    },
    {
        kind: 'area_perimeter_sim',
        label: 'Alan – Çevre Kâşifi',
        hint: 'Köşeyi sürükle; birim karelerle alan ve çevre canlı değişsin',
        size: { w: 480, h: 340 },
        defaults: { labels: true, sim: { mode: 0, w: 6, h: 4, skew: 2 } },
    },
    {
        kind: 'probability_sim',
        label: 'Olasılık Deneyi',
        hint: 'Para ya da zar at; deneysel olasılık teoriğe yaklaşsın',
        size: { w: 500, h: 340 },
        defaults: { labels: true, sim: { mode: 0, last: -1 } },
    },
];
