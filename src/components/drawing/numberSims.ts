// src/components/drawing/numberSims.ts
// Sayılarla ilgili simülasyonlar: kesirlerde toplama-çıkarma ve
// onun kuvvetleriyle büyüklük ölçeği.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    fitText,
    isIconSize,
    label,
    line,
    path,
    roundRect,
    simValue,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── Kesirlerde toplama ve çıkarma ────────────────────────────────────
//
// Kilit fikir: farklı paydalı kesirler doğrudan toplanamaz, çünkü
// parçaların büyüklüğü farklıdır. Ortak paydaya genişletmek, iki çubuğu
// AYNI büyüklükte parçalara bölmektir; bu yüzden üç satır alt alta durur.

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number): number => Math.abs(a * b) / (gcd(a, b) || 1);

interface FractionState {
    n1: number;
    d1: number;
    n2: number;
    d2: number;
    /** 0: toplama, 1: çıkarma. */
    op: number;
    common: number;
    e1: number;
    e2: number;
    total: number;
    /** Sadeleşmiş sonuç. */
    rn: number;
    rd: number;
}

function fractionState(o: MathObject): FractionState {
    const n1 = clampInt(simValue(o, 'n1', 1), 0, 12, 1);
    const d1 = clampInt(simValue(o, 'd1', 2), 1, 12, 2);
    const n2 = clampInt(simValue(o, 'n2', 1), 0, 12, 1);
    const d2 = clampInt(simValue(o, 'd2', 3), 1, 12, 3);
    const op = clampInt(simValue(o, 'op', 0), 0, 1, 0);
    const common = lcm(d1, d2);
    const e1 = n1 * (common / d1);
    const e2 = n2 * (common / d2);
    const total = op === 0 ? e1 + e2 : e1 - e2;
    const g = gcd(Math.abs(total), common) || 1;
    return { n1, d1, n2, d2, op, common, e1, e2, total, rn: total / g, rd: common / g };
}

/** Bir kesir çubuğu: `parts` parçaya bölünür, `filled` tanesi taranır. */
function fractionBar(
    k: Ctx,
    x: number,
    y: number,
    w: number,
    h: number,
    parts: number,
    filled: number,
    hatched = 0
) {
    const step = w / parts;
    for (let i = 0; i < parts; i++) {
        if (i < filled) {
            k.c.save();
            k.c.globalAlpha = 0.24;
            k.c.fillRect(x + i * step, y, step, h);
            k.c.restore();
        } else if (i < filled + hatched) {
            // Çıkarılan parçalar: dolu değil, çizgili. Çizgiler komşu parçaya
            // taşmasın diye hücreye kırpılır.
            k.c.save();
            k.c.beginPath();
            k.c.rect(x + i * step, y, step, h);
            k.c.clip();
            k.c.strokeStyle = withAlpha(k.color, 0.6);
            for (let d = -h; d < step; d += Math.max(4, h * 0.28)) {
                line(k, x + i * step + d, y + h, x + i * step + d + h, y, 1);
            }
            k.c.restore();
        }
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, i === 0 ? 0.9 : 0.45);
        line(k, x + i * step, y, x + i * step, y + h, 1);
        k.c.restore();
    }
    k.c.lineWidth = k.lw;
    k.c.strokeRect(x, y, w, h);
}

/** "3/4" biçiminde kesir metni. */
const fracText = (n: number, d: number): string => (d === 1 ? String(n) : `${n}/${d}`);

export const fractionAddRender: Renderer = (k) => {
    const r = k.r;
    const s = fractionState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    // Sol boşluk kesir etiketini ("19/12") tam alacak kadar geniş olmalı.
    const barX = r.x + (icon ? r.w * 0.06 : fs * 3.4);
    const barW = r.w - (barX - r.x) - (icon ? r.w * 0.06 : fs * 1.2);
    const top = r.y + (icon ? r.h * 0.12 : fs * 2.4);
    const rowH = Math.min(fs * 2.2, (r.y + r.h - top - (icon ? r.h * 0.1 : fs * 3.4)) / 3.6);
    const gap = rowH * 0.55;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // 1. satır: birinci kesir · 2. satır: ikinci kesir
    fractionBar(k, barX, top, barW, rowH, s.d1, s.n1);
    fractionBar(k, barX, top + rowH + gap, barW, rowH, s.d2, s.n2);

    // 3. satır: ortak paydada sonuç; 1'i aşarsa yan yana tam çubuklar
    const wholes = Math.max(1, Math.ceil(Math.max(s.total, 0) / s.common) || 1);
    const resultY = top + (rowH + gap) * 2;
    const resultW = wholes > 1 ? (barW - gap * (wholes - 1)) / wholes : barW;
    let left = Math.max(0, s.total);
    for (let i = 0; i < wholes; i++) {
        const filled = Math.min(s.common, left);
        left -= filled;
        fractionBar(
            k,
            barX + i * (resultW + gap),
            resultY,
            resultW,
            rowH,
            s.common,
            filled,
            // Çıkarmada sonuçtan sonraki parçalar tarandı olarak gösterilir.
            i === 0 && s.op === 1 ? Math.max(0, s.e2) : 0
        );
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Satır başlarındaki kesirler
    label(k, fracText(s.n1, s.d1), barX - fs * 0.5, top + rowH / 2, 'right', 'middle', 0.85);
    label(k, fracText(s.n2, s.d2), barX - fs * 0.5, top + rowH + gap + rowH / 2, 'right', 'middle', 0.85);
    label(k, fracText(s.total, s.common), barX - fs * 0.5, resultY + rowH / 2, 'right', 'middle', 0.85);
    label(k, s.op === 0 ? '+' : '−', barX - fs * 0.5, top + rowH + gap * 0.5, 'right', 'middle', 0.9);

    const sign = s.op === 0 ? '+' : '−';
    const steps = `${fracText(s.n1, s.d1)} ${sign} ${fracText(s.n2, s.d2)} = ${fracText(s.e1, s.common)} ${sign} ${fracText(s.e2, s.common)} = ${fracText(s.total, s.common)}`;
    const reduced = s.rd !== s.common ? ` = ${fracText(s.rn, s.rd)}` : '';
    label(
        k,
        fitText(k, [steps + reduced, steps], r.w - 8, 0.85),
        r.x + r.w / 2,
        r.y + r.h - fs * 0.2,
        'center',
        'bottom',
        0.85,
    );
    label(
        k,
        fitText(
            k,
            [
                `Ortak payda ${s.common}: iki çubuk da aynı büyüklükte parçalara bölünür`,
                `Ortak payda ${s.common}`,
            ],
            r.w - fs * 4,
            0.78,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.78,
    );
    k.c.restore();
};

export const fractionAddSpec: SimSpec = {
    controls: (r, o): SimControl[] => [
        {
            id: 'op',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: fractionState(o).op === 0 ? 'Çıkarmaya geç' : 'Toplamaya geç',
            on: fractionState(o).op === 1,
        },
    ],
    onControl: (_r, o, id): Record<string, number> =>
        id === 'op' ? { op: fractionState(o).op === 0 ? 1 : 0 } : {},
    params: [
        { key: 'n1', label: '1. kesir payı', min: 0, max: 12, step: 1 },
        { key: 'd1', label: '1. kesir paydası', min: 1, max: 12, step: 1 },
        { key: 'n2', label: '2. kesir payı', min: 0, max: 12, step: 1 },
        { key: 'd2', label: '2. kesir paydası', min: 1, max: 12, step: 1 },
        { key: 'op', label: 'İşlem (0 + / 1 −)', min: 0, max: 1, step: 1 },
    ],
};

// ── Ölçek gezgini (Üslü sayılar / bilimsel gösterim) ─────────────────
//
// Kilit fikir: her basamak ONLA çarpar. Atomdan galaksiye giderken
// üs birer birer artar; iki nesne arasındaki fark üslerin FARKI kadardır.

interface ScaleStop {
    /** Büyüklüğün onluk üssü (metre). */
    exp: number;
    name: string;
    draw: (k: Ctx, cx: number, cy: number, R: number) => void;
}

const glyphAtom = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.18, 0, Math.PI * 2);
    k.c.fill();
    for (const rot of [0, Math.PI / 3, -Math.PI / 3]) {
        k.c.save();
        k.c.translate(cx, cy);
        k.c.rotate(rot);
        k.c.beginPath();
        k.c.ellipse(0, 0, R * 0.9, R * 0.32, 0, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
    }
};

const glyphMolecule = (k: Ctx, cx: number, cy: number, R: number) => {
    const pts: Array<[number, number]> = [
        [cx, cy - R * 0.35],
        [cx - R * 0.7, cy + R * 0.4],
        [cx + R * 0.7, cy + R * 0.4],
    ];
    line(k, pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
    line(k, pts[0][0], pts[0][1], pts[2][0], pts[2][1]);
    pts.forEach(([x, y], i) => {
        k.c.beginPath();
        k.c.arc(x, y, R * (i === 0 ? 0.34 : 0.24), 0, Math.PI * 2);
        k.c.stroke();
    });
};

const glyphVirus = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
    k.c.stroke();
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        line(k, cx + R * 0.55 * Math.cos(a), cy + R * 0.55 * Math.sin(a), cx + R * 0.8 * Math.cos(a), cy + R * 0.8 * Math.sin(a), 1);
        k.c.beginPath();
        k.c.arc(cx + R * 0.85 * Math.cos(a), cy + R * 0.85 * Math.sin(a), R * 0.07, 0, Math.PI * 2);
        k.c.fill();
    }
};

const glyphCell = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.ellipse(cx, cy, R * 0.85, R * 0.62, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(cx - R * 0.1, cy, R * 0.24, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(cx + R * 0.38, cy - R * 0.2, R * 0.1, 0, Math.PI * 2);
    k.c.fill();
};

const glyphGrain = (k: Ctx, cx: number, cy: number, R: number) => {
    for (const [dx, dy, f] of [
        [-0.3, 0.2, 0.3],
        [0.25, -0.1, 0.36],
        [0.05, 0.4, 0.22],
    ] as const) {
        k.c.beginPath();
        k.c.ellipse(cx + dx * R, cy + dy * R, R * f, R * f * 0.75, 0.4, 0, Math.PI * 2);
        k.c.stroke();
    }
};

const glyphAnt = (k: Ctx, cx: number, cy: number, R: number) => {
    for (const [dx, f] of [
        [-0.55, 0.22],
        [0, 0.18],
        [0.5, 0.3],
    ] as const) {
        k.c.beginPath();
        k.c.ellipse(cx + dx * R, cy, R * f, R * f * 0.8, 0, 0, Math.PI * 2);
        k.c.stroke();
    }
    for (const s of [-1, 1]) {
        for (const dx of [-0.1, 0.15, 0.4]) {
            line(k, cx + dx * R, cy, cx + dx * R + s * R * 0.25, cy + s * R * 0.4, 1);
        }
    }
    line(k, cx - R * 0.7, cy - R * 0.1, cx - R * 0.95, cy - R * 0.45, 1);
    line(k, cx - R * 0.7, cy - R * 0.1, cx - R * 0.8, cy - R * 0.5, 1);
};

const glyphHuman = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy - R * 0.6, R * 0.22, 0, Math.PI * 2);
    k.c.stroke();
    line(k, cx, cy - R * 0.38, cx, cy + R * 0.25);
    line(k, cx - R * 0.4, cy - R * 0.1, cx + R * 0.4, cy - R * 0.1);
    line(k, cx, cy + R * 0.25, cx - R * 0.3, cy + R * 0.8);
    line(k, cx, cy + R * 0.25, cx + R * 0.3, cy + R * 0.8);
};

const glyphStadium = (k: Ctx, cx: number, cy: number, R: number) => {
    roundRect(k, cx - R * 0.9, cy - R * 0.5, R * 1.8, R, R * 0.3);
    k.c.stroke();
    line(k, cx, cy - R * 0.5, cx, cy + R * 0.5, 1);
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.2, 0, Math.PI * 2);
    k.c.stroke();
};

const glyphCity = (k: Ctx, cx: number, cy: number, R: number) => {
    const heights = [0.5, 0.85, 0.35, 0.7, 0.45];
    heights.forEach((h, i) => {
        const w = R * 0.3;
        const x = cx - R * 0.85 + i * R * 0.37;
        k.c.strokeRect(x, cy + R * 0.5 - R * h, w, R * h);
    });
};

const glyphEarth = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.75, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    k.c.beginPath();
    k.c.ellipse(cx, cy, R * 0.75, R * 0.28, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.ellipse(cx, cy, R * 0.28, R * 0.75, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
};

const glyphSun = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
    k.c.stroke();
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        line(k, cx + R * 0.68 * Math.cos(a), cy + R * 0.68 * Math.sin(a), cx + R * 0.95 * Math.cos(a), cy + R * 0.95 * Math.sin(a), 1);
    }
};

const glyphSystem = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.14, 0, Math.PI * 2);
    k.c.fill();
    [0.4, 0.62, 0.85].forEach((f, i) => {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.5);
        k.c.beginPath();
        k.c.ellipse(cx, cy, R * f, R * f * 0.42, 0, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        const a = i * 2.2;
        k.c.beginPath();
        k.c.arc(cx + R * f * Math.cos(a), cy + R * f * 0.42 * Math.sin(a), R * 0.07, 0, Math.PI * 2);
        k.c.fill();
    });
};

const glyphGalaxy = (k: Ctx, cx: number, cy: number, R: number) => {
    for (const dir of [1, -1]) {
        const pts: Array<[number, number]> = [];
        for (let i = 0; i <= 26; i++) {
            const t = (i / 26) * Math.PI * 1.6;
            const rad = R * 0.12 + (R * 0.8 * i) / 26;
            pts.push([cx + dir * rad * Math.cos(t), cy + dir * rad * 0.45 * Math.sin(t)]);
        }
        path(k, pts, false);
    }
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.13, 0, Math.PI * 2);
    k.c.fill();
};

const SCALE_STOPS: ReadonlyArray<ScaleStop> = [
    { exp: -10, name: 'Atom', draw: glyphAtom },
    { exp: -9, name: 'Molekül', draw: glyphMolecule },
    { exp: -7, name: 'Virüs', draw: glyphVirus },
    { exp: -5, name: 'Hücre', draw: glyphCell },
    { exp: -3, name: 'Toz tanesi', draw: glyphGrain },
    { exp: -2, name: 'Karınca', draw: glyphAnt },
    { exp: 0, name: 'İnsan', draw: glyphHuman },
    { exp: 2, name: 'Futbol sahası', draw: glyphStadium },
    { exp: 4, name: 'Şehir', draw: glyphCity },
    { exp: 7, name: 'Dünya', draw: glyphEarth },
    { exp: 9, name: 'Güneş', draw: glyphSun },
    { exp: 13, name: 'Güneş sistemi', draw: glyphSystem },
    { exp: 21, name: 'Samanyolu', draw: glyphGalaxy },
];

/** İnsan ölçeği karşılaştırmanın sıfır noktasıdır. */
const HUMAN_INDEX = SCALE_STOPS.findIndex((s) => s.name === 'İnsan');

/** Metre cinsinden büyüklüğün günlük birimle okunuşu. */
function scaleUnit(exp: number): string {
    const v = (e: number) => (10 ** e).toLocaleString('tr-TR');
    if (exp < -6) return `${v(exp + 9)} nanometre`;
    if (exp < -3) return `${v(exp + 6)} mikrometre`;
    if (exp === -2) return '1 santimetre';
    if (exp < 0) return `${v(exp + 3)} milimetre`;
    if (exp < 3) return `${v(exp)} metre`;
    // 1 ışık yılı ≈ 10¹⁶ m alınır.
    if (exp < 16) return `${v(exp - 3)} kilometre`;
    return `${v(exp - 16)} ışık yılı`;
}

const scaleIndex = (o: MathObject): number =>
    clampInt(simValue(o, 'i', HUMAN_INDEX), 0, SCALE_STOPS.length - 1, HUMAN_INDEX);

function scaleGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const axisY = r.y + r.h - fs * 3.2;
    const x0 = r.x + fs * 1.5;
    const x1 = r.x + r.w - fs * 1.5;
    const minExp = SCALE_STOPS[0].exp;
    const maxExp = SCALE_STOPS[SCALE_STOPS.length - 1].exp;
    return {
        fs,
        axisY,
        x0,
        x1,
        px: (exp: number) => x0 + ((x1 - x0) * (exp - minExp)) / (maxExp - minExp),
    };
}

export const scaleZoomRender: Renderer = (k) => {
    const r = k.r;
    const i = scaleIndex(k.o);
    const stop = SCALE_STOPS[i];
    const g = scaleGeom(r);
    const icon = isIconSize(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Nesne
    const cx = r.x + r.w / 2;
    const cy = icon ? r.y + r.h / 2 : r.y + r.h * 0.38;
    const R = icon ? Math.min(r.w, r.h) * 0.36 : Math.min(r.w * 0.16, r.h * 0.26);
    stop.draw(k, cx, cy, R);

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Logaritmik eksen: her çentik bir onluk basamak
    line(k, g.x0, g.axisY, g.x1, g.axisY);
    for (let e = SCALE_STOPS[0].exp; e <= SCALE_STOPS[SCALE_STOPS.length - 1].exp; e++) {
        const x = g.px(e);
        const isStop = SCALE_STOPS.some((s) => s.exp === e);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, isStop ? 0.9 : 0.3);
        line(k, x, g.axisY, x, g.axisY - (isStop ? g.fs * 0.6 : g.fs * 0.3), 1);
        k.c.restore();
    }
    // Şu anki durak
    const mx = g.px(stop.exp);
    k.c.beginPath();
    k.c.arc(mx, g.axisY, Math.max(3, g.fs * 0.28), 0, Math.PI * 2);
    k.c.fill();
    label(
        k,
        `10${supExp(stop.exp)}`,
        clamp(mx, r.x + g.fs * 1.2, r.x + r.w - g.fs * 1.2),
        g.axisY + g.fs * 0.5,
        'center',
        'top',
        0.6,
    );

    // Ad ve büyüklük, nesne ile eksen arasına sığdırılır.
    const nameY = Math.min(cy + R + g.fs * 0.6, g.axisY - g.fs * 3.2);
    label(k, stop.name, cx, nameY, 'center', 'top', 1.05);
    label(
        k,
        `10${supExp(stop.exp)} m  ·  ${scaleUnit(stop.exp)}`,
        cx,
        nameY + g.fs * 1.4,
        'center',
        'top',
        0.8,
    );

    // İnsan ölçeğiyle karşılaştırma
    const diff = stop.exp - SCALE_STOPS[HUMAN_INDEX].exp;
    const compare =
        diff === 0
            ? 'Karşılaştırma ölçeği: insan boyu'
            : `İnsandan 10${supExp(Math.abs(diff))} kat ${diff > 0 ? 'büyük' : 'küçük'}`;
    label(k, compare, cx, r.y + r.h, 'center', 'bottom', 0.8);
    label(
        k,
        fitText(k, ['Her basamak on kat: üs birer birer değişir', 'Her basamak on kat'], r.w - g.fs * 4, 0.78),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.78,
    );
    k.c.restore();
};

/** Üs değerini üst simge karakterlerle yazar (10⁻⁹ gibi). */
function supExp(exp: number): string {
    const digits = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    const sign = exp < 0 ? '⁻' : '';
    return sign + String(Math.abs(exp)).split('').map((d) => digits[Number(d)]).join('');
}

export const scaleZoomSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const i = scaleIndex(o);
        const g = scaleGeom(r);
        return [
            {
                id: 'stop',
                x: g.px(SCALE_STOPS[i].exp),
                y: g.axisY,
                type: 'drag',
                label: 'Ölçekte gez',
            },
            {
                id: 'down',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: 'Bir basamak küçül',
                on: i === 0,
            },
            {
                id: 'up',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Bir basamak büyü',
                on: i === SCALE_STOPS.length - 1,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const i = scaleIndex(o);
        if (id === 'up') return { i: Math.min(SCALE_STOPS.length - 1, i + 1) };
        if (id === 'down') return { i: Math.max(0, i - 1) };
        // Sürüklerken en yakın durağa oturur: aradaki üsler boş kalmasın.
        const g = scaleGeom(r);
        let best = 0;
        let bestDist = Infinity;
        SCALE_STOPS.forEach((stop, idx) => {
            const d = Math.abs(g.px(stop.exp) - p.x);
            if (d < bestDist) {
                bestDist = d;
                best = idx;
            }
        });
        return { i: best };
    },
    params: [
        { key: 'i', label: 'Ölçek basamağı', min: 0, max: SCALE_STOPS.length - 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const NUMBER_SIM_RENDERERS: Record<string, Renderer> = {
    fraction_add_sim: fractionAddRender,
    scale_zoom_sim: scaleZoomRender,
};

export const NUMBER_SIM_SPECS: Record<string, SimSpec> = {
    fraction_add_sim: fractionAddSpec,
    scale_zoom_sim: scaleZoomSpec,
};

export const NUMBER_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'fraction_add_sim',
        label: 'Kesirlerde Toplama',
        hint: 'Ortak paydaya genişletmeyi çubuk modelde gör',
        size: { w: 520, h: 320 },
        defaults: { labels: true, sim: { n1: 1, d1: 2, n2: 1, d2: 3, op: 0 } },
    },
    {
        kind: 'scale_zoom_sim',
        label: 'Ölçek Gezgini',
        hint: 'Atomdan galaksiye: her basamak onun bir kuvveti',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { i: 6 } },
    },
];
