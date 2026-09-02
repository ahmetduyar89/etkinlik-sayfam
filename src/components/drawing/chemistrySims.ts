// src/components/drawing/chemistrySims.ts
// Kimya simülasyonları: elektron dizilimi ve denklem denkleştirme.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    fitText,
    isIconSize,
    fmtNum,
    label,
    line,
    path,
    simValue,
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

// ── Kayıt ────────────────────────────────────────────────────────────

export const CHEMISTRY_SIM_RENDERERS: Record<string, Renderer> = {
    electron_config_sim: electronRender,
    balance_eq_sim: balanceRender,
    solubility_sim: solubilityRender,
    ion_bond_sim: ionBondRender,
};

export const CHEMISTRY_SIM_SPECS: Record<string, SimSpec> = {
    electron_config_sim: electronSpec,
    balance_eq_sim: balanceSpec,
    solubility_sim: solubilitySpec,
    ion_bond_sim: ionBondSpec,
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
];
