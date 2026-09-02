// src/components/drawing/chemistrySims.ts
// Kimya simülasyonları: elektron dizilimi ve denklem denkleştirme.

import type { MathObject } from '../../types';
import {
    clampInt,
    fitText,
    isIconSize,
    label,
    line,
    simValue,
    withAlpha,
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

// ── Kayıt ────────────────────────────────────────────────────────────

export const CHEMISTRY_SIM_RENDERERS: Record<string, Renderer> = {
    electron_config_sim: electronRender,
    balance_eq_sim: balanceRender,
};

export const CHEMISTRY_SIM_SPECS: Record<string, SimSpec> = {
    electron_config_sim: electronSpec,
    balance_eq_sim: balanceSpec,
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
];
