// src/components/drawing/chemistrySims.ts
// Kimya simülasyonları: elektron dizilimi ve denklem denkleştirme.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    fillShape,
    fitText,
    isIconSize,
    fmtNum,
    label,
    line,
    panel,
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

// ── Elektron dizilimi (Periyodik Sistem) ─────────────────────────────
//
// Kilit fikir: katmanlar 2 – 8 – 8 – 2 sırasıyla dolar. Son katmandaki
// elektron sayısı grubu, katman sayısı periyodu verir; bu yüzden ikisi de
// dizilimden okunur, ezberlenmez.

interface ElementInfo {
    symbol: string;
    name: string;
    /** Yaygın izotopun kütle numarası (nötron sayısı için). */
    mass: number;
}

const ELEMENTS: ReadonlyArray<ElementInfo> = [
    { symbol: 'H', name: 'Hidrojen', mass: 1 },
    { symbol: 'He', name: 'Helyum', mass: 4 },
    { symbol: 'Li', name: 'Lityum', mass: 7 },
    { symbol: 'Be', name: 'Berilyum', mass: 9 },
    { symbol: 'B', name: 'Bor', mass: 11 },
    { symbol: 'C', name: 'Karbon', mass: 12 },
    { symbol: 'N', name: 'Azot', mass: 14 },
    { symbol: 'O', name: 'Oksijen', mass: 16 },
    { symbol: 'F', name: 'Flor', mass: 19 },
    { symbol: 'Ne', name: 'Neon', mass: 20 },
    { symbol: 'Na', name: 'Sodyum', mass: 23 },
    { symbol: 'Mg', name: 'Magnezyum', mass: 24 },
    { symbol: 'Al', name: 'Alüminyum', mass: 27 },
    { symbol: 'Si', name: 'Silisyum', mass: 28 },
    { symbol: 'P', name: 'Fosfor', mass: 31 },
    { symbol: 'S', name: 'Kükürt', mass: 32 },
    { symbol: 'Cl', name: 'Klor', mass: 35 },
    { symbol: 'Ar', name: 'Argon', mass: 40 },
    { symbol: 'K', name: 'Potasyum', mass: 39 },
    { symbol: 'Ca', name: 'Kalsiyum', mass: 40 },
];

/** Katman kapasiteleri: 8. sınıf düzeyinde 2 – 8 – 8 – 2 kuralı. */
const SHELL_CAPACITY = [2, 8, 8, 2];

function electronState(o: MathObject) {
    const z = clampInt(simValue(o, 'z', 11), 1, ELEMENTS.length, 11);
    const element = ELEMENTS[z - 1];
    const shells: number[] = [];
    let left = z;
    for (const cap of SHELL_CAPACITY) {
        if (left <= 0) break;
        const put = Math.min(cap, left);
        shells.push(put);
        left -= put;
    }
    const valence = shells[shells.length - 1];
    // Helyum tek katmanını doldurduğu için 8A'dadır; diğerlerinde son
    // katmandaki elektron sayısı grubu verir.
    const group = z === 2 ? 8 : valence;
    return {
        z,
        element,
        shells,
        valence,
        group,
        period: shells.length,
        neutrons: element.mass - z,
    };
}

export const electronRender: Renderer = (k) => {
    const r = k.r;
    const s = electronState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const cx = r.x + r.w * (icon ? 0.5 : 0.36);
    const cy = r.y + r.h * (icon ? 0.5 : 0.5);
    // Katmanlar alttaki düğme başlıklarının üstünde kalmalı.
    const maxR = Math.min(r.w * (icon ? 0.44 : 0.3), r.h * (icon ? 0.44 : 0.34));
    const step = maxR / (s.shells.length + 0.35);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Çekirdek
    k.c.beginPath();
    k.c.arc(cx, cy, step * 0.6, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.14;
    k.c.fill();
    k.c.restore();

    // Katmanlar ve elektronlar
    s.shells.forEach((count, i) => {
        const rad = step * (i + 1);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        k.c.beginPath();
        k.c.lineWidth = 1;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        for (let j = 0; j < count; j++) {
            const a = (j / count) * Math.PI * 2 - Math.PI / 2;
            k.c.beginPath();
            k.c.arc(cx + rad * Math.cos(a), cy + rad * Math.sin(a), Math.max(2, step * 0.11), 0, Math.PI * 2);
            k.c.fill();
        }
    });

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Okuma sütunu
    const tx = r.x + r.w * 0.68;
    const lines = [
        `${s.element.symbol} — ${s.element.name}`,
        `Atom numarası: ${s.z}`,
        `Kütle numarası: ${s.element.mass}`,
        `Çekirdek: ${s.z}p + ${s.neutrons}n`,
        `Dizilim: ${s.shells.join(' – ')}`,
        `Periyot: ${s.period}`,
        `Grup: ${s.group}A`,
        `Değerlik e⁻: ${s.valence}`,
    ];
    lines.forEach((text, i) => {
        label(k, text, tx, r.y + fs * (2.4 + i * 1.4), 'left', 'middle', 0.72);
    });

    label(
        k,
        fitText(
            k,
            ['Katmanlar 2 – 8 – 8 – 2 sırasıyla dolar', 'Elektron dizilimi'],
            r.w * 0.62,
            0.82,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.82,
    );
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.75);
    label(k, '−', r.x + r.w * 0.18, r.y + r.h - fs * 1.6, 'center', 'bottom', 0.8);
    label(k, '+', r.x + r.w * 0.5, r.y + r.h - fs * 1.6, 'center', 'bottom', 0.8);
    k.c.restore();
    k.c.restore();
};

export const electronSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = electronState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            {
                id: 'minus',
                x: r.x + r.w * 0.18,
                y: r.y + r.h - fs * 0.7,
                type: 'toggle',
                label: 'Bir önceki element',
                on: s.z === 1,
            },
            {
                id: 'plus',
                x: r.x + r.w * 0.5,
                y: r.y + r.h - fs * 0.7,
                type: 'toggle',
                label: 'Bir sonraki element',
                on: s.z === ELEMENTS.length,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = electronState(o);
        if (id === 'plus') return { z: Math.min(ELEMENTS.length, s.z + 1) };
        if (id === 'minus') return { z: Math.max(1, s.z - 1) };
        return {};
    },
    params: [{ key: 'z', label: 'Atom numarası', min: 1, max: ELEMENTS.length, step: 1 }],
};

// ── Denklem denkleştirme (Kimyasal Tepkimeler) ───────────────────────
//
// Kilit fikir: tepkimede atomlar yoktan var olmaz. Katsayılar değişir,
// formüller değişmez; iki taraftaki her elementin atom sayısı eşitlenene
// dek katsayılar denenir.

interface EqTerm {
    formula: string;
    /** Formüldeki atom sayıları. */
    atoms: Record<string, number>;
    /** 0: girenler, 1: ürünler. */
    side: number;
}

interface Reaction {
    title: string;
    terms: EqTerm[];
    /** Doğru katsayılar (ipucu ve kontrol için değil, yalnız sıfırlama). */
    solution: number[];
}

const REACTIONS: ReadonlyArray<Reaction> = [
    {
        title: 'Suyun oluşumu',
        terms: [
            { formula: 'H₂', atoms: { H: 2 }, side: 0 },
            { formula: 'O₂', atoms: { O: 2 }, side: 0 },
            { formula: 'H₂O', atoms: { H: 2, O: 1 }, side: 1 },
        ],
        solution: [2, 1, 2],
    },
    {
        title: 'Metanın yanması',
        terms: [
            { formula: 'CH₄', atoms: { C: 1, H: 4 }, side: 0 },
            { formula: 'O₂', atoms: { O: 2 }, side: 0 },
            { formula: 'CO₂', atoms: { C: 1, O: 2 }, side: 1 },
            { formula: 'H₂O', atoms: { H: 2, O: 1 }, side: 1 },
        ],
        solution: [1, 2, 1, 2],
    },
    {
        title: 'Demirin paslanması',
        terms: [
            { formula: 'Fe', atoms: { Fe: 1 }, side: 0 },
            { formula: 'O₂', atoms: { O: 2 }, side: 0 },
            { formula: 'Fe₂O₃', atoms: { Fe: 2, O: 3 }, side: 1 },
        ],
        solution: [4, 3, 2],
    },
];

const MAX_COEF = 6;

function balanceState(o: MathObject) {
    const mode = clampInt(simValue(o, 'mode', 0), 0, REACTIONS.length - 1, 0);
    const reaction = REACTIONS[mode];
    const coefs = reaction.terms.map((_, i) => clampInt(simValue(o, `c${i}`, 1), 1, MAX_COEF, 1));
    const elements = Array.from(new Set(reaction.terms.flatMap((t) => Object.keys(t.atoms))));
    const counts = elements.map((el) => {
        const side = [0, 0];
        reaction.terms.forEach((term, i) => {
            side[term.side] += (term.atoms[el] ?? 0) * coefs[i];
        });
        return { element: el, left: side[0], right: side[1] };
    });
    return {
        mode,
        reaction,
        coefs,
        counts,
        balanced: counts.every((c) => c.left === c.right),
    };
}

function balanceGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    return { fs, eqY: r.y + r.h * 0.3, tableY: r.y + r.h * 0.52, ctrlY: r.y + r.h * 0.44 };
}

export const balanceRender: Renderer = (k) => {
    const r = k.r;
    const s = balanceState(k.o);
    const g = balanceGeom(r);
    const icon = isIconSize(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    if (icon) {
        // Simge ölçeğinde formüller okunmaz; iki kefeli denge simgesi çizilir.
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h * 0.5;
        const arm = r.w * 0.3;
        line(k, cx - arm, cy, cx + arm, cy, Math.max(1.6, k.lw));
        line(k, cx, cy, cx, cy + r.h * 0.28);
        for (const dx of [-arm, arm]) {
            k.c.beginPath();
            k.c.arc(cx + dx, cy - r.h * 0.14, r.h * 0.14, 0, Math.PI);
            k.c.stroke();
            line(k, cx + dx, cy, cx + dx, cy - r.h * 0.14, 1);
        }
        k.c.restore();
        return;
    }

    // Denklem: katsayı + formül, terimler eşit aralıklı
    const slots = termSlots(r, s.reaction.terms.length);
    s.reaction.terms.forEach((term, i) => {
        const x = slots[i];
        const text = `${s.coefs[i] === 1 ? '' : s.coefs[i]}${term.formula}`;
        label(k, text, x, g.eqY, 'center', 'middle', 1.15);
        const next = s.reaction.terms[i + 1];
        if (!next) return;
        const mid = (x + slots[i + 1]) / 2;
        label(k, next.side !== term.side ? '→' : '+', mid, g.eqY, 'center', 'middle', 1.1);
    });

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Atom sayısı tablosu: hangi element eşit değil, görünsün
    const colW = Math.min(r.w * 0.26, g.fs * 7);
    const tableX = r.x + r.w / 2 - (colW * 3) / 2;
    const rowH = g.fs * 1.5;
    const header = ['Element', 'Girenler', 'Ürünler'];
    header.forEach((text, c) => {
        label(k, text, tableX + colW * (c + 0.5), g.tableY, 'center', 'middle', 0.7);
    });
    line(k, tableX, g.tableY + rowH * 0.45, tableX + colW * 3, g.tableY + rowH * 0.45, 1);
    s.counts.forEach((row, i) => {
        const y = g.tableY + rowH * (i + 1);
        const ok = row.left === row.right;
        label(k, row.element, tableX + colW * 0.5, y, 'center', 'middle', 0.75);
        label(k, String(row.left), tableX + colW * 1.5, y, 'center', 'middle', 0.75);
        label(k, `${row.right}  ${ok ? '✓' : '✕'}`, tableX + colW * 2.5, y, 'center', 'middle', 0.75);
    });

    label(
        k,
        fitText(
            k,
            [`${s.reaction.title} · katsayıları değiştirerek denkleştir`, s.reaction.title],
            r.w - g.fs * 4,
            0.82,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.82,
    );
    label(
        k,
        s.balanced ? 'Denklem denk ✓' : 'Henüz denk değil',
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.95,
    );
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.7);
    slots.forEach((x) => label(k, 'katsayı +1', x, g.ctrlY - g.fs * 0.9, 'center', 'bottom', 0.6));
    k.c.restore();
    k.c.restore();
};

/** Terimlerin yatay konumları; kontrol noktaları da bunları kullanır. */
function termSlots(r: Rect, count: number): number[] {
    const usable = r.w * 0.86;
    const start = r.x + r.w * 0.07;
    return Array.from({ length: count }, (_, i) => start + (usable * (i + 0.5)) / count);
}

export const balanceSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = balanceState(o);
        const g = balanceGeom(r);
        const slots = termSlots(r, s.reaction.terms.length);
        const out: SimControl[] = slots.map((x, i) => ({
            id: `coef${i}`,
            x,
            y: g.ctrlY,
            type: 'toggle' as const,
            label: `${s.reaction.terms[i].formula} katsayısı (${s.coefs[i]})`,
            on: false,
        }));
        out.push(
            {
                id: 'reset',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Katsayıları sıfırla',
                on: false,
            },
            {
                id: 'mode',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: 'Tepkimeyi değiştir',
                on: s.mode > 0,
            },
        );
        return out;
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = balanceState(o);
        const clear = (): Record<string, number> => {
            const patch: Record<string, number> = {};
            for (let i = 0; i < 4; i++) patch[`c${i}`] = 1;
            return patch;
        };
        if (id === 'reset') return clear();
        if (id === 'mode') return { ...clear(), mode: (s.mode + 1) % REACTIONS.length };
        if (!id.startsWith('coef')) return {};
        const i = Number(id.slice(4));
        if (!Number.isInteger(i) || i < 0 || i >= s.coefs.length) return {};
        // Katsayı 1'den MAX_COEF'e artar, sonra başa döner.
        return { [`c${i}`]: (s.coefs[i] % MAX_COEF) + 1 };
    },
    params: [
        { key: 'mode', label: 'Tepkime (0-2)', min: 0, max: REACTIONS.length - 1, step: 1 },
        { key: 'c0', label: '1. katsayı', min: 1, max: MAX_COEF, step: 1 },
        { key: 'c1', label: '2. katsayı', min: 1, max: MAX_COEF, step: 1 },
        { key: 'c2', label: '3. katsayı', min: 1, max: MAX_COEF, step: 1 },
        { key: 'c3', label: '4. katsayı', min: 1, max: MAX_COEF, step: 1 },
    ],
};

// ── Çözünürlük (Maddenin Yapısı ve Özellikleri) ──────────────────────
//
// Kilit fikir: belli sıcaklıkta 100 mL suda ancak belli miktar madde
// çözünür. Fazlası dipte çökelti olarak kalır; sıcaklık artınca katıların
// çözünürlüğü genelde artar ama her maddede aynı hızda artmaz.

interface Solute {
    name: string;
    /** Verilen sıcaklıkta 100 mL sudaki çözünürlük (g). */
    curve: (t: number) => number;
}

const SOLUTES: ReadonlyArray<Solute> = [
    // Potasyum nitrat sıcaklıkla hızla artar, tuz neredeyse sabittir.
    { name: 'Potasyum nitrat', curve: (t) => 13 + 0.35 * t + 0.021 * t * t },
    { name: 'Yemek tuzu', curve: (t) => 35.7 + 0.023 * t },
];

const SOLUBILITY_MAX = 260;

function solubilityState(o: MathObject) {
    const sub = clampInt(simValue(o, 'sub', 0), 0, SOLUTES.length - 1, 0);
    const temp = clamp(simValue(o, 'temp', 20), 0, 100);
    const amount = clamp(simValue(o, 'amount', 60), 0, 200);
    const capacity = SOLUTES[sub].curve(temp);
    const dissolved = Math.min(amount, capacity);
    return {
        sub,
        solute: SOLUTES[sub],
        temp,
        amount,
        capacity,
        dissolved,
        excess: Math.max(0, amount - capacity),
        state:
            amount > capacity + 0.01
                ? 'Doymuş çözelti + çökelti'
                : Math.abs(amount - capacity) < 2
                  ? 'Doymuş çözelti'
                  : 'Doymamış çözelti',
    };
}

function solubilityGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const tank = {
        x: r.x + r.w * (icon ? 0.24 : 0.06),
        y: r.y + (icon ? r.h * 0.14 : fs * 2.8),
        w: r.w * (icon ? 0.52 : 0.26),
        h: r.h - (icon ? r.h * 0.28 : fs * 5),
    };
    const chart = {
        x: r.x + r.w * 0.42,
        y: r.y + fs * 3,
        w: r.w * 0.5,
        h: r.h - fs * 5.6,
    };
    return { fs, icon, tank, chart };
}

export const solubilityRender: Renderer = (k) => {
    const r = k.r;
    const s = solubilityState(k.o);
    const g = solubilityGeom(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Beher ve su
    const waterY = g.tank.y + g.tank.h * 0.2;
    line(k, g.tank.x, g.tank.y, g.tank.x, g.tank.y + g.tank.h);
    line(k, g.tank.x, g.tank.y + g.tank.h, g.tank.x + g.tank.w, g.tank.y + g.tank.h);
    line(k, g.tank.x + g.tank.w, g.tank.y, g.tank.x + g.tank.w, g.tank.y + g.tank.h);
    k.c.save();
    k.c.globalAlpha = 0.1;
    k.c.fillRect(g.tank.x, waterY, g.tank.w, g.tank.y + g.tank.h - waterY);
    k.c.restore();
    line(k, g.tank.x, waterY, g.tank.x + g.tank.w, waterY, 1.2);

    // Çözünen tanecikler suda dağılır; çözünmeyen dipte birikir
    const dots = Math.round((s.dissolved / SOLUBILITY_MAX) * 90);
    const dotR = Math.max(1.2, g.tank.w * 0.018);
    // Sabit ama düzensiz dağılım: çarpanla modül almak taneciklerimi
    // çapraz şeritlere diziyordu, bu yüzden sinüs tabanlı saçılım kullanılır.
    const scatter = (n: number) => Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1;
    for (let i = 0; i < dots; i++) {
        const fx = scatter(i + 1);
        const fy = scatter(i + 91);
        k.c.beginPath();
        k.c.arc(
            g.tank.x + g.tank.w * (0.08 + fx * 0.84),
            waterY + (g.tank.y + g.tank.h - waterY) * (0.06 + fy * 0.82),
            dotR,
            0,
            Math.PI * 2,
        );
        k.c.fill();
    }
    if (s.excess > 0) {
        const pileH = Math.min(g.tank.h * 0.3, (s.excess / 120) * g.tank.h * 0.3 + g.tank.h * 0.03);
        k.c.save();
        k.c.globalAlpha = 0.45;
        k.c.beginPath();
        k.c.moveTo(g.tank.x + g.tank.w * 0.12, g.tank.y + g.tank.h);
        k.c.lineTo(g.tank.x + g.tank.w * 0.5, g.tank.y + g.tank.h - pileH);
        k.c.lineTo(g.tank.x + g.tank.w * 0.88, g.tank.y + g.tank.h);
        k.c.closePath();
        k.c.fill();
        k.c.restore();
    }

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Çözünürlük grafiği
    const px = (t: number) => g.chart.x + (g.chart.w * t) / 100;
    const py = (v: number) => g.chart.y + g.chart.h - (g.chart.h * v) / SOLUBILITY_MAX;
    line(k, g.chart.x, g.chart.y, g.chart.x, g.chart.y + g.chart.h);
    line(k, g.chart.x, g.chart.y + g.chart.h, g.chart.x + g.chart.w, g.chart.y + g.chart.h);
    SOLUTES.forEach((solute, i) => {
        const pts: Array<[number, number]> = [];
        for (let t = 0; t <= 100; t += 5) pts.push([px(t), py(solute.curve(t))]);
        k.c.save();
        if (i !== s.sub) k.c.strokeStyle = withAlpha(k.color, 0.3);
        k.c.lineWidth = i === s.sub ? Math.max(1.8, k.lw) : 1;
        path(k, pts, false);
        k.c.restore();
        label(
            k,
            solute.name,
            px(100) - 2,
            py(solute.curve(100)) - g.fs * 0.3,
            'right',
            'bottom',
            0.58,
        );
    });
    // Eklenen miktar ve şu anki nokta
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    k.c.setLineDash([5, 4]);
    line(k, g.chart.x, py(Math.min(s.amount, SOLUBILITY_MAX)), g.chart.x + g.chart.w, py(Math.min(s.amount, SOLUBILITY_MAX)), 1);
    k.c.restore();
    k.c.beginPath();
    k.c.arc(px(s.temp), py(Math.min(s.capacity, SOLUBILITY_MAX)), Math.max(3, g.fs * 0.25), 0, Math.PI * 2);
    k.c.fill();
    label(k, '0', g.chart.x - g.fs * 0.3, g.chart.y + g.chart.h, 'right', 'middle', 0.58);
    label(k, String(SOLUBILITY_MAX), g.chart.x - g.fs * 0.3, g.chart.y, 'right', 'middle', 0.58);
    label(k, 'g / 100 mL', g.chart.x, g.chart.y - g.fs * 0.4, 'left', 'bottom', 0.58);
    label(k, '0 °C', g.chart.x, g.chart.y + g.chart.h + g.fs * 0.3, 'left', 'top', 0.58);
    label(k, '100 °C', g.chart.x + g.chart.w, g.chart.y + g.chart.h + g.fs * 0.3, 'right', 'top', 0.58);

    label(
        k,
        fitText(
            k,
            [`${s.solute.name} · ${fmtNum(s.temp, 0)} °C · eklenen ${fmtNum(s.amount, 0)} g`, s.solute.name],
            r.w - g.fs * 5,
            0.8,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8,
    );
    label(
        k,
        fitText(
            k,
            [
                `Çözünürlük ${fmtNum(s.capacity, 0)} g · çözünen ${fmtNum(s.dissolved, 0)} g · dipte ${fmtNum(s.excess, 0)} g · ${s.state}`,
                `${fmtNum(s.dissolved, 0)} g çözündü · ${fmtNum(s.excess, 0)} g dipte · ${s.state}`,
                s.state,
            ],
            r.w - 8,
            0.72,
        ),
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.72,
    );
    k.c.restore();
};

export const solubilitySpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = solubilityState(o);
        const g = solubilityGeom(r);
        const px = g.chart.x + (g.chart.w * s.temp) / 100;
        const py =
            g.chart.y + g.chart.h - (g.chart.h * Math.min(s.capacity, SOLUBILITY_MAX)) / SOLUBILITY_MAX;
        return [
            { id: 'temp', x: px, y: py, type: 'drag', label: 'Sıcaklığı değiştir' },
            {
                id: 'sub',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Maddeyi değiştir (şimdi: ${s.solute.name})`,
                on: s.sub > 0,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = solubilityState(o);
        if (id === 'sub') return { sub: (s.sub + 1) % SOLUTES.length };
        const g = solubilityGeom(r);
        return { temp: clamp(((p.x - g.chart.x) / g.chart.w) * 100, 0, 100) };
    },
    params: [
        { key: 'sub', label: 'Madde (0-1)', min: 0, max: SOLUTES.length - 1, step: 1 },
        { key: 'temp', label: 'Sıcaklık', min: 0, max: 100, step: 1, unit: '°C' },
        { key: 'amount', label: 'Eklenen madde', min: 0, max: 200, step: 5, unit: 'g' },
    ],
};

// ── İyon ve bağ oluşumu (Kimyasal Türler Arası Etkileşim) ────────────
//
// Kilit fikir: atomlar son katmanını sekize (hidrojende ikiye) tamamlamak
// için elektron ALIR, VERİR ya da ORTAKLAŞIR. Vermek-almak iyonik bağı,
// ortaklaşmak kovalent bağı doğurur.

interface BondAtom {
    symbol: string;
    shells: number[];
    /** Bağdan sonra oluşan yük (iyonik bağda). */
    charge: number;
}

interface BondCase {
    title: string;
    /** 0 iyonik, 1 kovalent. */
    kind: number;
    left: BondAtom;
    right: BondAtom;
    product: string;
    note: string;
}

const BOND_CASES: ReadonlyArray<BondCase> = [
    {
        title: 'Sodyum + Klor',
        kind: 0,
        left: { symbol: 'Na', shells: [2, 8, 1], charge: 1 },
        right: { symbol: 'Cl', shells: [2, 8, 7], charge: -1 },
        product: 'NaCl',
        note: 'Sodyum bir elektron verir, klor alır: zıt yüklü iyonlar çekilir',
    },
    {
        title: 'Magnezyum + Oksijen',
        kind: 0,
        left: { symbol: 'Mg', shells: [2, 8, 2], charge: 2 },
        right: { symbol: 'O', shells: [2, 6], charge: -2 },
        product: 'MgO',
        note: 'Magnezyum iki elektron verir, oksijen ikisini de alır',
    },
    {
        title: 'Hidrojen + Hidrojen',
        kind: 1,
        left: { symbol: 'H', shells: [1], charge: 0 },
        right: { symbol: 'H', shells: [1], charge: 0 },
        product: 'H₂',
        note: 'İki hidrojen birer elektronunu ortaklaşa kullanır',
    },
];

const bondState = (o: MathObject) => {
    const mode = clampInt(simValue(o, 'mode', 0), 0, BOND_CASES.length - 1, 0);
    // 0: nötr atomlar, 1: elektron aktarımı/ortaklaşma, 2: oluşan bileşik
    const step = clampInt(simValue(o, 'step', 0), 0, 2, 0);
    return { mode, step, data: BOND_CASES[mode] };
};

/** Katmanlı atom çizer ve son katmandaki elektron konumlarını döndürür. */
function bondAtomDraw(
    k: Ctx,
    cx: number,
    cy: number,
    R: number,
    atom: BondAtom,
    shells: number[],
    charge: number,
    showCharge: boolean
) {
    const step = R / (shells.length + 0.4);
    k.c.beginPath();
    k.c.arc(cx, cy, step * 0.55, 0, Math.PI * 2);
    k.c.stroke();
    label(k, atom.symbol, cx, cy, 'center', 'middle', 0.72);
    shells.forEach((count, i) => {
        const rad = step * (i + 1);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        k.c.beginPath();
        k.c.lineWidth = 1;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        for (let j = 0; j < count; j++) {
            const a = (j / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2;
            k.c.beginPath();
            k.c.arc(cx + rad * Math.cos(a), cy + rad * Math.sin(a), Math.max(2, step * 0.13), 0, Math.PI * 2);
            k.c.fill();
        }
    });
    if (showCharge && charge !== 0) {
        const sign = charge > 0 ? '+' : '−';
        const text = Math.abs(charge) === 1 ? sign : `${Math.abs(charge)}${sign}`;
        label(k, `[${atom.symbol}]${text}`, cx, cy + R + k.fs * 0.6, 'center', 'top', 0.75);
    }
}

export const ionBondRender: Renderer = (k) => {
    const r = k.r;
    const s = bondState(k.o);
    const d = s.data;
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const cy = r.y + r.h * (icon ? 0.5 : 0.48);
    const R = Math.min(r.w * 0.17, r.h * (icon ? 0.4 : 0.3));
    const lx = r.x + r.w * 0.27;
    const rx = r.x + r.w * 0.73;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Aktarımdan sonra son katmanlar değişir
    const transferred = s.step >= 2 && d.kind === 0;
    const leftShells = transferred ? d.left.shells.slice(0, -1) : d.left.shells;
    const rightShells = transferred
        ? d.right.shells.map((c, i) => (i === d.right.shells.length - 1 ? c + Math.abs(d.left.charge) : c))
        : d.right.shells;

    bondAtomDraw(k, lx, cy, R, d.left, leftShells, d.left.charge, transferred);
    bondAtomDraw(k, rx, cy, R, d.right, rightShells, d.right.charge, transferred);

    // Aktarım oku ya da ortak elektron çifti
    if (s.step >= 1) {
        if (d.kind === 0) {
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.8);
            arrow(k, lx + R * 1.05, cy - R * 0.25, rx - R * 1.05, cy - R * 0.25, fs * 0.5, Math.max(1.5, k.lw));
            k.c.restore();
        } else {
            for (const dy of [-fs * 0.35, fs * 0.35]) {
                k.c.beginPath();
                k.c.arc((lx + rx) / 2, cy + dy, Math.max(2.5, fs * 0.16), 0, Math.PI * 2);
                k.c.fill();
            }
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.5);
            k.c.beginPath();
            k.c.ellipse((lx + rx) / 2, cy, fs * 0.9, fs * 1.1, 0, 0, Math.PI * 2);
            k.c.stroke();
            k.c.restore();
        }
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    if (s.step >= 1) {
        label(
            k,
            d.kind === 0 ? 'elektron aktarımı' : 'ortak elektron çifti',
            (lx + rx) / 2,
            cy - R * (d.kind === 0 ? 0.6 : 1.1),
            'center',
            'bottom',
            0.62,
        );
    }
    if (s.step >= 2) {
        // Bileşik adı iki atomun arasında durur; altta not satırıyla
        // çakışıyordu.
        label(k, d.product, (lx + rx) / 2, cy + R * 0.55, 'center', 'middle', 1.1);
    }

    const stepName = ['1. Nötr atomlar', '2. Elektron hareketi', '3. Oluşan bileşik'][s.step];
    label(
        k,
        fitText(
            k,
            [
                `${d.title} · ${stepName} · ${d.kind === 0 ? 'iyonik bağ' : 'kovalent bağ'}`,
                `${d.title} · ${stepName}`,
                d.title,
            ],
            r.w - fs * 5,
            0.82,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.82,
    );
    label(k, fitText(k, [d.note], r.w - 8, 0.72), r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.72);
    k.c.restore();
};

export const ionBondSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = bondState(o);
        return [
            {
                id: 'step',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Sonraki adım',
                on: s.step > 0,
            },
            {
                id: 'mode',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: `Örneği değiştir (şimdi: ${s.data.title})`,
                on: s.mode > 0,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = bondState(o);
        if (id === 'step') return { step: (s.step + 1) % 3 };
        if (id === 'mode') return { mode: (s.mode + 1) % BOND_CASES.length, step: 0 };
        return {};
    },
    params: [
        { key: 'mode', label: `Örnek (0-${BOND_CASES.length - 1})`, min: 0, max: BOND_CASES.length - 1, step: 1 },
        { key: 'step', label: 'Adım (0-2)', min: 0, max: 2, step: 1 },
    ],
};

// ── Kütlenin korunumu (Kimyasal Tepkimeler) ──────────────────────────
//
// Kilit fikir: tepkimede atomlar kaybolmaz, yalnız yeniden düzenlenir.
// KAPALI kapta terazi hiç şaşmaz; AÇIK kapta çıkan gaz kaptan ayrıldığı
// için tartılan kütle azalır — kaybolan kütle değil, kaçan gazdır.

/** Tepkimede açığa çıkan gazın kütlesi (g). */
const ESCAPING_GAS = 2;
const START_MASS = 120;

const massState = (o: MathObject) => {
    const closed = simValue(o, 'closed', 1) > 0.5;
    const after = simValue(o, 'after', 0) > 0.5;
    const mass = after && !closed ? START_MASS - ESCAPING_GAS : START_MASS;
    return { closed, after, mass };
};

export const massConservationRender: Renderer = (k) => {
    const r = k.r;
    const s = massState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const cx = r.x + r.w * 0.42;
    const flask = {
        x: cx - r.w * 0.11,
        y: r.y + r.h * (icon ? 0.16 : 0.24),
        w: r.w * 0.22,
        h: r.h * (icon ? 0.42 : 0.36),
    };

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.5, k.lw);

    // Erlenmeyer: boyun ve gövde
    path(k, [
        [cx - flask.w * 0.16, flask.y],
        [cx - flask.w * 0.16, flask.y + flask.h * 0.3],
        [flask.x, flask.y + flask.h],
        [flask.x + flask.w, flask.y + flask.h],
        [cx + flask.w * 0.16, flask.y + flask.h * 0.3],
        [cx + flask.w * 0.16, flask.y],
    ]);
    // Sıvı
    k.c.save();
    k.c.globalAlpha = 0.14;
    k.c.beginPath();
    k.c.moveTo(flask.x + flask.w * 0.08, flask.y + flask.h * 0.72);
    k.c.lineTo(flask.x + flask.w * 0.92, flask.y + flask.h * 0.72);
    k.c.lineTo(flask.x + flask.w, flask.y + flask.h);
    k.c.lineTo(flask.x, flask.y + flask.h);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    // Tıpa ya da açık ağız
    if (s.closed) {
        k.c.save();
        k.c.globalAlpha = 0.3;
        k.c.fillRect(cx - flask.w * 0.2, flask.y - fs * 0.5, flask.w * 0.4, fs * 0.6);
        k.c.restore();
        k.c.strokeRect(cx - flask.w * 0.2, flask.y - fs * 0.5, flask.w * 0.4, fs * 0.6);
    }

    // Tepkime sonrası kabarcıklar; açık kapta gaz yukarı kaçar
    if (s.after) {
        for (let i = 0; i < 7; i++) {
            const bx = flask.x + flask.w * (0.2 + ((i * 37) % 60) / 100);
            const by = flask.y + flask.h * (0.72 - i * 0.07);
            k.c.beginPath();
            k.c.arc(bx, by, Math.max(1.4, fs * 0.13), 0, Math.PI * 2);
            k.c.stroke();
        }
        if (!s.closed) {
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.6);
            for (let i = 0; i < 3; i++) {
                const bx = cx + (i - 1) * fs * 0.7;
                arrow(k, bx, flask.y - fs * 0.4, bx, flask.y - fs * 2, fs * 0.35, 1.2);
            }
            k.c.restore();
        }
    }

    // Terazi: gövde ve gösterge
    const scaleY = flask.y + flask.h;
    k.c.strokeRect(cx - r.w * 0.19, scaleY, r.w * 0.38, r.h * 0.1);
    line(k, cx - r.w * 0.15, scaleY + r.h * 0.1, cx - r.w * 0.15, scaleY + r.h * 0.14);
    line(k, cx + r.w * 0.15, scaleY + r.h * 0.1, cx + r.w * 0.15, scaleY + r.h * 0.14);

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(k, `${fmtNum(s.mass, 0)} g`, cx, scaleY + r.h * 0.05, 'center', 'middle', 1.05);
    label(k, s.closed ? 'kapalı kap' : 'açık kap', cx, flask.y - fs * 2.4, 'center', 'bottom', 0.7);
    if (s.after && !s.closed) {
        label(k, 'kaçan gaz', cx + fs * 1.6, flask.y - fs * 1.6, 'left', 'middle', 0.62);
    }

    label(
        k,
        fitText(
            k,
            [
                `${s.closed ? 'Kapalı' : 'Açık'} kapta tepkime · ${s.after ? 'tepkimeden sonra' : 'tepkimeden önce'}`,
                s.closed ? 'Kapalı kap' : 'Açık kap',
            ],
            r.w - fs * 5,
            0.82,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.82,
    );
    const note = s.closed
        ? `Kütle değişmez: ${START_MASS} g → ${START_MASS} g · atomlar kapta kalır`
        : s.after
          ? `Tartım azaldı: ${START_MASS} g → ${START_MASS - ESCAPING_GAS} g · ${ESCAPING_GAS} g gaz kaptan çıktı`
          : `Başlangıç kütlesi ${START_MASS} g · kabın ağzı açık`;
    label(k, fitText(k, [note], r.w - 8, 0.75), r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.75);
    k.c.restore();
};

export const massConservationSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = massState(o);
        return [
            {
                id: 'after',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.after ? 'Tepkimeden önceye dön' : 'Tepkimeyi başlat',
                on: s.after,
            },
            {
                id: 'closed',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.closed ? 'Kabın ağzını aç' : 'Kabı kapat',
                on: s.closed,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = massState(o);
        if (id === 'after') return { after: s.after ? 0 : 1 };
        if (id === 'closed') return { closed: s.closed ? 0 : 1 };
        return {};
    },
    params: [
        { key: 'closed', label: 'Kapalı kap (0/1)', min: 0, max: 1, step: 1 },
        { key: 'after', label: 'Tepkime sonrası (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Atom modelleri (Maddenin Tanecikli Yapısı) ───────────────────────
//
// Kilit fikir: her model, kendi döneminin deneylerini açıklamak için
// kuruldu ve yeni bir deney onu yetersiz bıraktığında değişti. Modeller
// "yanlış" değil, giderek daha kapsayıcıdır.

interface AtomModel {
    name: string;
    year: string;
    scientist: string;
    explains: string;
    fails: string;
    draw: (k: Ctx, cx: number, cy: number, R: number) => void;
}

/** Dalton: içi dolu, bölünemez küre. */
const drawDalton = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.16;
    k.c.fill();
    k.c.restore();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    k.c.beginPath();
    k.c.arc(cx - R * 0.3, cy - R * 0.3, R * 0.5, Math.PI * 0.9, Math.PI * 1.5);
    k.c.stroke();
    k.c.restore();
};

/** Thomson: pozitif hamur içine gömülü elektronlar. */
const drawThomson = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.1;
    k.c.fill();
    k.c.restore();
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        const rr = R * (0.3 + ((i * 37) % 50) / 100);
        const ex = cx + rr * Math.cos(a);
        const ey = cy + rr * Math.sin(a);
        k.c.beginPath();
        k.c.arc(ex, ey, R * 0.09, 0, Math.PI * 2);
        k.c.fill();
        k.c.save();
        k.c.strokeStyle = withAlpha('#ffffff', 0.9);
        line(k, ex - R * 0.045, ey, ex + R * 0.045, ey, 1.4);
        k.c.restore();
    }
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.55);
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        label(k, '+', cx + R * 0.62 * Math.cos(a), cy + R * 0.62 * Math.sin(a), 'center', 'middle', 0.6);
    }
    k.c.restore();
};

/** Rutherford: merkezde küçük yoğun çekirdek, çevresinde boşluk. */
const drawRutherford = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.28);
    k.c.setLineDash([4, 4]);
    k.c.beginPath();
    k.c.arc(cx, cy, R, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.16, 0, Math.PI * 2);
    k.c.fill();
    label(k, '+', cx, cy, 'center', 'middle', 0.8);
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.6;
        const rr = R * (0.55 + (i % 2) * 0.28);
        k.c.beginPath();
        k.c.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), R * 0.075, 0, Math.PI * 2);
        k.c.fill();
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.25);
        k.c.beginPath();
        k.c.ellipse(cx, cy, rr, rr * 0.85, a, 0, Math.PI * 2);
        k.c.lineWidth = 1;
        k.c.stroke();
        k.c.restore();
    }
};

/** Bohr: belirli enerji katmanları. */
const drawBohr = (k: Ctx, cx: number, cy: number, R: number) => {
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.15, 0, Math.PI * 2);
    k.c.fill();
    const shells = [0.42, 0.72, 1];
    shells.forEach((f, i) => {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        k.c.beginPath();
        k.c.lineWidth = 1;
        k.c.arc(cx, cy, R * f, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        const count = [2, 8, 4][i];
        for (let j = 0; j < count; j++) {
            const a = (j / count) * Math.PI * 2 - Math.PI / 2 + i * 0.3;
            k.c.beginPath();
            k.c.arc(cx + R * f * Math.cos(a), cy + R * f * Math.sin(a), R * 0.065, 0, Math.PI * 2);
            k.c.fill();
        }
    });
};

const ATOM_MODELS: ReadonlyArray<AtomModel> = [
    {
        name: 'Dalton modeli',
        year: '1803',
        scientist: 'John Dalton',
        explains: 'Maddenin taneciklerden oluşması, sabit oranlar',
        fails: 'Elektriklenme ve atom içi parçacıklar',
        draw: drawDalton,
    },
    {
        name: 'Thomson modeli',
        year: '1897',
        scientist: 'J. J. Thomson',
        explains: 'Elektronun varlığı, atomun nötrlüğü',
        fails: 'Alfa taneciklerinin saçılması, çekirdek',
        draw: drawThomson,
    },
    {
        name: 'Rutherford modeli',
        year: '1911',
        scientist: 'Ernest Rutherford',
        explains: 'Küçük, yoğun ve pozitif çekirdek; boş hacim',
        fails: 'Elektronun neden çekirdeğe düşmediği',
        draw: drawRutherford,
    },
    {
        name: 'Bohr modeli',
        year: '1913',
        scientist: 'Niels Bohr',
        explains: 'Elektronların belirli enerji katmanlarında bulunması',
        fails: 'Çok elektronlu atomların ayrıntılı davranışı',
        draw: drawBohr,
    },
];

const atomState = (o: MathObject) => ({
    model: clampInt(simValue(o, 'model', 0), 0, ATOM_MODELS.length - 1, 0),
    experiment: simValue(o, 'exp', 0) > 0.5,
});

/** Rutherford'un altın levha deneyi: çoğu geçer, azı sapar, çok azı döner. */
function goldFoilExperiment(k: Ctx, b: Rect, fs: number) {
    const foilX = b.x + b.w * 0.54;
    const cy = b.y + b.h * 0.54;
    const R = Math.min(b.w * 0.38, b.h * 0.46);

    // ZnS ekranı: sapmaları görünür kılan halka
    k.c.save();
    k.c.setLineDash([5, 5]);
    k.c.strokeStyle = withAlpha(k.color, 0.32);
    k.c.beginPath();
    k.c.lineWidth = 1.2;
    k.c.arc(foilX, cy, R, -Math.PI * 0.82, Math.PI * 0.82);
    k.c.stroke();
    k.c.restore();
    label(k, 'ZnS ekranı', foilX, cy + R + fs * 0.2, 'center', 'top', 0.55);

    // Kurşun blok içindeki alfa kaynağı
    const bw = fs * 2.6;
    const bh = fs * 2.2;
    const bx = foilX - R - bw * 0.9;
    roundRect(k, bx, cy - bh / 2, bw, bh, 3);
    fillShape(k, () => roundRect(k, bx, cy - bh / 2, bw, bh, 3), 0.14);
    k.c.stroke();
    k.c.save();
    k.c.fillStyle = k.color;
    k.c.beginPath();
    k.c.arc(bx + bw * 0.42, cy, fs * 0.3, 0, Math.PI * 2);
    k.c.fill();
    k.c.restore();
    line(k, bx + bw, cy - fs * 0.28, bx + bw, cy + fs * 0.28, 1);
    label(k, 'α kaynağı', bx + bw / 2, cy - bh / 2 - fs * 0.15, 'center', 'bottom', 0.55);

    // Altın levha
    k.c.save();
    k.c.globalAlpha = 0.22;
    k.c.fillRect(foilX - 2.5, cy - R * 0.86, 5, R * 1.72);
    k.c.restore();
    line(k, foilX, cy - R * 0.86, foilX, cy + R * 0.86, Math.max(2, k.lw));
    for (let i = -3; i <= 3; i++) {
        const y = cy + (i / 3) * R * 0.72;
        line(k, foilX - 4, y + 3, foilX + 4, y - 3, 0.9);
    }
    label(k, 'altın levha', foilX, cy - R - fs * 0.2, 'center', 'bottom', 0.6);

    // Sapmadan geçen ışınlar
    const sx = bx + bw;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    for (const f of [-0.34, -0.16, 0.16, 0.34]) {
        const y = cy + R * f;
        const ex = foilX + Math.sqrt(Math.max(0, R * R - (R * f) ** 2));
        line(k, sx, cy + R * f * 0.18, foilX, y, 1.1);
        arrow(k, foilX, y, ex, y, fs * 0.34, 1.1);
    }
    k.c.restore();

    // Sapan ve geri dönen ışınlar
    const deflect = (angleDeg: number, incomingF: number) => {
        const a = (angleDeg * Math.PI) / 180;
        line(k, sx, cy, foilX, cy + R * incomingF, 1.6);
        arrow(k, foilX, cy + R * incomingF, foilX + R * Math.cos(a), cy + R * Math.sin(a), fs * 0.42, 1.6);
    };
    deflect(-42, -0.04);
    deflect(28, 0.04);
    deflect(-156, 0);

    label(k, 'çoğu sapmadan geçer', foilX + R * 0.6, cy + R * 0.86, 'left', 'middle', 0.56);
    label(k, 'azı sapar', foilX + R * 0.76, cy - R * 0.74, 'left', 'middle', 0.56);
    label(k, 'çok azı geri döner', foilX - R * 0.86, cy - R * 0.62, 'right', 'middle', 0.56);
}

export const atomModelsRender: Renderer = (k) => {
    const r = k.r;
    const s = atomState(k.o);
    const m = ATOM_MODELS[s.model];
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const stage = {
        x: r.x + fs * 0.5,
        y: r.y + (icon ? 0 : fs * 2.4),
        w: r.w * (icon ? 1 : 0.52),
        h: r.h - (icon ? 0 : fs * 5.6),
    };

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const showExp = s.experiment && s.model === 2 && !icon;
    if (showExp) {
        goldFoilExperiment(k, { ...stage, w: r.w - fs }, fs);
    } else {
        m.draw(
            k,
            stage.x + stage.w / 2,
            stage.y + stage.h / 2,
            Math.min(stage.w, stage.h) * (icon ? 0.42 : 0.36)
        );
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Zaman şeridi
    const tlY = r.y + r.h - fs * 1.9;
    const tlX0 = r.x + fs;
    const tlX1 = r.x + r.w - fs;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.4);
    line(k, tlX0, tlY, tlX1, tlY, 1.4);
    k.c.restore();
    ATOM_MODELS.forEach((mm, i) => {
        const x = tlX0 + ((tlX1 - tlX0) * i) / (ATOM_MODELS.length - 1);
        k.c.beginPath();
        k.c.arc(x, tlY, i === s.model ? fs * 0.32 : fs * 0.2, 0, Math.PI * 2);
        if (i === s.model) k.c.fill();
        else k.c.stroke();
        label(k, mm.year, x, tlY + fs * 0.6, 'center', 'top', 0.58);
    });

    if (!showExp) {
        // Okuma paneli
        const px = r.x + r.w * 0.58;
        const pw = r.w - (px - r.x) - fs * 0.5;
        const py = stage.y;
        const ph = fs * 9.4;
        panel(k, px, py, pw, ph);
        label(k, m.name, px + fs * 0.7, py + fs * 1.1, 'left', 'middle', 0.82);
        label(k, `${m.scientist} · ${m.year}`, px + fs * 0.7, py + fs * 2.4, 'left', 'middle', 0.62);
        label(k, 'Açıkladığı', px + fs * 0.7, py + fs * 3.8, 'left', 'middle', 0.56);
        wrapLabel(k, m.explains, px + fs * 0.7, py + fs * 4.8, pw - fs * 1.4, 0.6);
        label(k, 'Açıklayamadığı', px + fs * 0.7, py + fs * 6.9, 'left', 'middle', 0.56);
        wrapLabel(k, m.fails, px + fs * 0.7, py + fs * 7.9, pw - fs * 1.4, 0.6);
    }

    label(
        k,
        showExp ? 'Altın levha deneyi: atomun büyük bölümü boşluktur' : 'Atom modelleri: her deney modeli yeniler',
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8,
    );
    k.c.restore();
};

/** Uzun metni panele iki satır hâlinde sığdırır. */
function wrapLabel(k: Ctx, text: string, x: number, y: number, maxW: number, scale: number) {
    const words = text.split(' ');
    let line1 = '';
    let i = 0;
    while (i < words.length) {
        const next = line1 ? `${line1} ${words[i]}` : words[i];
        if (textWidth(k, next, scale) > maxW && line1) break;
        line1 = next;
        i++;
    }
    const line2 = words.slice(i).join(' ');
    label(k, line1, x, y, 'left', 'middle', scale);
    if (line2) label(k, fitText(k, [line2], maxW, scale), x, y + k.fs * scale * 1.35, 'left', 'middle', scale);
}

export const atomModelsSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = atomState(o);
        const out: SimControl[] = [
            {
                id: 'next',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Sonraki model',
                on: s.model > 0,
            },
        ];
        if (s.model === 2) {
            out.push({
                id: 'exp',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.experiment ? 'Modele dön' : 'Altın levha deneyini göster',
                on: s.experiment,
            });
        }
        return out;
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = atomState(o);
        if (id === 'next') return { model: (s.model + 1) % ATOM_MODELS.length, exp: 0 };
        if (id === 'exp') return { exp: s.experiment ? 0 : 1 };
        return {};
    },
    params: [
        { key: 'model', label: `Model (0-${ATOM_MODELS.length - 1})`, min: 0, max: ATOM_MODELS.length - 1, step: 1 },
        { key: 'exp', label: 'Deney görünümü (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

// ── Molekül kurucu (Maddenin Doğasına Yolculuk) ──────────────────────
//
// Kilit fikir: bir atom kaç bağ yapacağını kendi değerliği belirler.
// Merkez atomun etrafındaki boşluk sayısı onun bağ sayısıdır; uçlara
// ancak TEK bağ yapabilen atomlar (H, Cl) oturur. Bağ sayısı molekülün
// şeklini de belirler.

interface Element {
    sym: string;
    /** Yapabildiği bağ sayısı (değerlik). */
    bonds: number;
    /** Çizim yarıçapı çarpanı. */
    size: number;
}

const MOL_ELEMENTS: ReadonlyArray<Element> = [
    { sym: '', bonds: 0, size: 0.72 },
    { sym: 'H', bonds: 1, size: 0.62 },
    { sym: 'C', bonds: 4, size: 1 },
    { sym: 'N', bonds: 3, size: 0.94 },
    { sym: 'O', bonds: 2, size: 0.9 },
    { sym: 'Cl', bonds: 1, size: 1.06 },
];

interface Molecule {
    formula: string;
    name: string;
    shape: string;
    /** Merkez atomun MOL_ELEMENTS içindeki sırası. */
    center: number;
    /** Uçlardaki doğru atom (MOL_ELEMENTS sırası). */
    outer: number;
    /** Bağ yönleri (derece, 0 = sağ, 90 = aşağı). */
    angles: ReadonlyArray<number>;
}

const MOLECULES: ReadonlyArray<Molecule> = [
    { formula: 'H₂O', name: 'Su', shape: 'Açısal', center: 4, outer: 1, angles: [142, 38] },
    { formula: 'NH₃', name: 'Amonyak', shape: 'Üçgen piramit', center: 3, outer: 1, angles: [90, 210, 330] },
    { formula: 'CH₄', name: 'Metan', shape: 'Düzgün dörtyüzlü', center: 2, outer: 1, angles: [45, 135, 225, 315] },
    { formula: 'CCl₄', name: 'Karbon tetraklorür', shape: 'Düzgün dörtyüzlü', center: 2, outer: 5, angles: [45, 135, 225, 315] },
];

const MOL_MAX_SLOTS = Math.max(...MOLECULES.map((m) => m.angles.length));

const moleculeState = (o: MathObject) => {
    const mol = clampInt(simValue(o, 'mol', 0), 0, MOLECULES.length - 1, 0);
    const m = MOLECULES[mol];
    const slots = m.angles.map((_, i) => clampInt(simValue(o, `s${i}`, 0), 0, MOL_ELEMENTS.length - 1, 0));
    const correct = slots.filter((v) => v === m.outer).length;
    return { mol, m, slots, correct, show: simValue(o, 'show', 0) > 0.5 };
};

/** Atom yuvarlağı; boş yuva kesikli çizilir. */
function atomCircle(k: Ctx, x: number, y: number, rad: number, sym: string, wrong: boolean) {
    k.c.save();
    if (!sym) {
        k.c.setLineDash([4, 3]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
    } else if (wrong) {
        k.c.setLineDash([5, 3]);
    } else {
        fillShape(k, () => k.c.arc(x, y, rad, 0, Math.PI * 2), 0.12);
    }
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.7, k.lw);
    k.c.arc(x, y, rad, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
    label(k, sym || '?', x, y, 'center', 'middle', sym.length > 1 ? 0.62 : 0.72);
}

export const moleculeBuildRender: Renderer = (k) => {
    const r = k.r;
    const s = moleculeState(k.o);
    const icon = isIconSize(r);
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const stage: Rect = icon
        ? r
        : { x: r.x + fs * 0.4, y: r.y + fs * 2.4, w: r.w * 0.55, h: r.h - fs * 3.4 };
    const cx = stage.x + stage.w / 2;
    const cy = stage.y + stage.h * 0.5;
    const base = Math.min(stage.w, stage.h) * 0.13;
    const bond = base * 2.45;
    const c = MOL_ELEMENTS[s.m.center];
    const cRad = base * c.size * 1.12;

    // Bağlar: atom yuvarlaklarının kenarından kenarına
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.75);
    s.m.angles.forEach((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const oRad = base * MOL_ELEMENTS[icon ? s.m.outer : s.slots[i]].size;
        line(
            k,
            cx + Math.cos(a) * cRad,
            cy + Math.sin(a) * cRad,
            cx + Math.cos(a) * (bond - oRad),
            cy + Math.sin(a) * (bond - oRad),
            Math.max(1.8, k.lw)
        );
    });
    k.c.restore();

    // Uç atomlar
    s.m.angles.forEach((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const x = cx + Math.cos(a) * bond;
        const y = cy + Math.sin(a) * bond;
        const el = MOL_ELEMENTS[icon ? s.m.outer : s.slots[i]];
        atomCircle(k, x, y, base * el.size, el.sym, s.show && s.slots[i] !== 0 && s.slots[i] !== s.m.outer);
    });

    // Merkez atom
    atomCircle(k, cx, cy, cRad, c.sym, false);

    if (icon) {
        k.c.restore();
        return;
    }

    if (k.o.labels !== false) {
        const px = r.x + r.w * 0.58;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.4;
        const ph = fs * 8.6;
        panel(k, px, py, pw, ph);
        label(k, `Hedef: ${s.m.formula}`, px + fs * 0.6, py + fs * 1.05, 'left', 'middle', 0.8);
        label(k, s.m.name, px + fs * 0.6, py + fs * 2.1, 'left', 'middle', 0.56);
        const rows: ReadonlyArray<[string, string]> = [
            ['Merkez atom', `${c.sym} · ${c.bonds} bağ yapar`],
            ['Bağ sayısı', `${s.m.angles.length}`],
            ['Şekil', s.m.shape],
        ];
        rows.forEach(([a, b], i) => {
            const y = py + fs * (3.4 + i * 1.4);
            label(k, a, px + fs * 0.6, y, 'left', 'middle', 0.5);
            label(k, fitText(k, [b], pw - fs * 1.1, 0.58), px + fs * 0.6, y + fs * 0.68, 'left', 'middle', 0.58);
        });
        const done = s.correct === s.m.angles.length;
        label(
            k,
            s.show ? (done ? `Doğru — ${s.m.formula} kuruldu` : `${s.correct} / ${s.m.angles.length} doğru`) : 'Boşlukları doldur',
            px + fs * 0.6,
            py + fs * 7.9,
            'left',
            'middle',
            0.62
        );

        // Değerlik şeridi
        const vy = py + ph + fs * 0.8;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.5);
        roundRect(k, px + fs * 0.4, vy, pw - fs * 0.8, fs * 2.5, 5);
        k.c.lineWidth = 1;
        k.c.stroke();
        k.c.restore();
        label(k, 'Kaç bağ yapar?', px + fs * 0.8, vy + fs * 0.8, 'left', 'middle', 0.5);
        label(
            k,
            fitText(k, ['H 1 · Cl 1 · O 2 · N 3 · C 4', 'H1 Cl1 O2 N3 C4'], pw - fs * 1.4, 0.58),
            px + fs * 0.8,
            vy + fs * 1.7,
            'left',
            'middle',
            0.58
        );
    }

    label(
        k,
        fitText(
            k,
            ['Molekül kurucu: bağ sayısı molekülün şeklini belirler', 'Molekül kurucu'],
            r.w - fs * 4,
            0.8
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8
    );
    k.c.restore();
};

const moleculeGeom = (r: Rect, m: Molecule) => {
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);
    const stage: Rect = { x: r.x + fs * 0.4, y: r.y + fs * 2.4, w: r.w * 0.55, h: r.h - fs * 3.4 };
    const base = Math.min(stage.w, stage.h) * 0.13;
    return {
        fs,
        base,
        cx: stage.x + stage.w / 2,
        cy: stage.y + stage.h * 0.5,
        bond: base * 2.45,
        angles: m.angles,
    };
};

export const moleculeBuildSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = moleculeState(o);
        const g = moleculeGeom(r, s.m);
        const out: SimControl[] = s.m.angles.map((deg, i) => {
            const a = (deg * Math.PI) / 180;
            // Tutamak atomun dışında durur; üstünde olsaydı sembolü kapatırdı.
            const d = g.bond + g.base * MOL_ELEMENTS[s.slots[i]].size + g.fs * 0.7;
            return {
                id: `slot${i}`,
                x: g.cx + Math.cos(a) * d,
                y: g.cy + Math.sin(a) * d,
                type: 'toggle' as const,
                label: `${i + 1}. boşluğa atom yerleştir`,
                on: s.slots[i] !== 0,
            };
        });
        out.push(
            {
                id: 'check',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.show ? 'Cevapları gizle' : 'Kontrol et',
                on: s.show,
            },
            { id: 'reset', x: r.x + r.w - 40, y: r.y + 14, type: 'toggle', label: 'Boşlukları temizle', on: false },
            {
                id: 'mol',
                x: r.x + r.w - 66,
                y: r.y + 14,
                type: 'toggle',
                label: 'Başka molekül',
                on: s.mol > 0,
            },
        );
        return out;
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = moleculeState(o);
        const clear = (): Record<string, number> => {
            const patch: Record<string, number> = {};
            for (let i = 0; i < MOL_MAX_SLOTS; i++) patch[`s${i}`] = 0;
            return patch;
        };
        if (id === 'check') return { show: s.show ? 0 : 1 };
        if (id === 'reset') return { ...clear(), show: 0 };
        if (id === 'mol') return { ...clear(), show: 0, mol: (s.mol + 1) % MOLECULES.length };
        if (id.startsWith('slot')) {
            const i = Number(id.slice(4));
            if (!Number.isInteger(i) || i < 0 || i >= s.m.angles.length) return {};
            return { [`s${i}`]: (s.slots[i] + 1) % MOL_ELEMENTS.length, show: 0 };
        }
        return {};
    },
    params: [
        { key: 'mol', label: `Molekül (0-${MOLECULES.length - 1})`, min: 0, max: MOLECULES.length - 1, step: 1 },
        { key: 'show', label: 'Kontrol (0/1)', min: 0, max: 1, step: 1 },
    ],
};

export const CHEMISTRY_SIM_RENDERERS: Record<string, Renderer> = {
    electron_config_sim: electronRender,
    balance_eq_sim: balanceRender,
    solubility_sim: solubilityRender,
    ion_bond_sim: ionBondRender,
    mass_conservation_sim: massConservationRender,
    atom_models_sim: atomModelsRender,
    molecule_build_sim: moleculeBuildRender,
};

export const CHEMISTRY_SIM_SPECS: Record<string, SimSpec> = {
    electron_config_sim: electronSpec,
    balance_eq_sim: balanceSpec,
    solubility_sim: solubilitySpec,
    ion_bond_sim: ionBondSpec,
    mass_conservation_sim: massConservationSpec,
    atom_models_sim: atomModelsSpec,
    molecule_build_sim: moleculeBuildSpec,
};

export const CHEMISTRY_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'electron_config_sim',
        label: 'Elektron Dizilimi',
        hint: 'Atom numarasını değiştir; katmanlar dolsun, grup ve periyot çıksın',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { z: 11 } },
    },
    {
        kind: 'balance_eq_sim',
        label: 'Denklem Denkleştirme',
        hint: 'Katsayıları artır; atom sayıları iki tarafta eşitlensin',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { mode: 0, c0: 1, c1: 1, c2: 1, c3: 1 } },
    },
    {
        kind: 'solubility_sim',
        label: 'Çözünürlük',
        hint: 'Sıcaklığı değiştir; doymuş çözeltiyi ve çökeltiyi gör',
        size: { w: 540, h: 340 },
        defaults: { labels: true, sim: { sub: 0, temp: 20, amount: 60 } },
    },
    {
        kind: 'ion_bond_sim',
        label: 'İyon ve Bağ Oluşumu',
        hint: 'Elektron alışverişi ve ortaklaşma: iyonik ve kovalent bağ',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { mode: 0, step: 0 } },
    },
    {
        kind: 'mass_conservation_sim',
        label: 'Kütlenin Korunumu',
        hint: 'Kapalı ve açık kapta tepkime: terazi neden farklı gösterir',
        size: { w: 480, h: 360 },
        defaults: { labels: true, sim: { closed: 1, after: 0 } },
    },
    {
        kind: 'atom_models_sim',
        label: 'Atom Modelleri',
        hint: 'Dalton’dan Bohr’a: her model neyi açıklar, neyi açıklayamaz',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { model: 0, exp: 0 } },
    },
    {
        kind: 'molecule_build_sim',
        label: 'Molekül Kurucu',
        hint: 'Boşluklara atom yerleştir: H₂O, NH₃, CH₄, CCl₄ kur ve kontrol et',
        size: { w: 600, h: 400 },
        defaults: { labels: true, sim: { mol: 0, show: 0 } },
    },
];
