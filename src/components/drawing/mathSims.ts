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

// ── Kayıt ────────────────────────────────────────────────────────────

export const MATH_SIM_RENDERERS: Record<string, Renderer> = {
    equation_sim: equationRender,
    area_perimeter_sim: areaRender,
};

export const MATH_SIM_SPECS: Record<string, SimSpec> = {
    equation_sim: equationSpec,
    area_perimeter_sim: areaSpec,
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
];
