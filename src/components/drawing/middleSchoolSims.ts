// src/components/drawing/middleSchoolSims.ts
// Ortaokul (5, 6 ve 7. Sınıf) Fen Bilimleri ve Matematik Canlı Simülasyonları.
// Akıllı tahtada doğrudan tuval üzerinde çalışan tam profesyonel etkileşimli nesneler.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    ellipse,
    fillShape,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    panel,
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

function styledPanel(
    k: Ctx,
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: { fill?: string; border?: string; radius?: number }
) {
    k.c.save();
    const rad = opts?.radius ?? Math.min(10, h * 0.28);
    if (opts?.fill) {
        k.c.fillStyle = opts.fill;
        roundRect(k, x, y, w, h, rad);
        k.c.fill();
    }
    if (opts?.border) {
        k.c.strokeStyle = opts.border;
        k.c.lineWidth = 1.2;
        roundRect(k, x, y, w, h, rad);
        k.c.stroke();
    }
    k.c.restore();
}

// ══════════════════════════════════════════════════════════════════════
// 1. TAM SAYILARDA SAYMA PULLARI MODELLERİ (7. Sınıf Matematik)
// ══════════════════════════════════════════════════════════════════════
interface CountersState {
    op: number;    // 0: Toplama (a + b), 1: Çıkarma (a - b)
    a: number;     // -6 .. +6
    b: number;     // -6 .. +6
    step: number;  // 0: Gruplar, 1: Nötr / Sıfır Çiftleri, 2: Sonuç
}

function countersState(o: MathObject): CountersState {
    const op = clampInt(simValue(o, 'op', 0), 0, 1, 0);
    const a = clampInt(simValue(o, 'a', 3), -6, 6, 3);
    const b = clampInt(simValue(o, 'b', -4), -6, 6, -4);
    const step = clampInt(simValue(o, 'step', 1), 0, 2, 1);
    return { op, a, b, step };
}

export const integerCountersRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = countersState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Başlık
    const result = s.op === 0 ? s.a + s.b : s.a - s.b;
    const opSign = s.op === 0 ? '+' : '−';
    const aStr = s.a >= 0 ? `(+${s.a})` : `(${s.a})`;
    const bStr = s.b >= 0 ? `(+${s.b})` : `(${s.b})`;
    const resStr = result >= 0 ? `(+${result})` : `(${result})`;

    styledPanel(k, r.x + fs * 0.5, r.y + fs * 0.4, r.w - fs, fs * 2.2, {
        fill: withAlpha('#1e1b4b', 0.8),
        border: '#6366f1',
    });
    label(
        k,
        fitText(k, [`Sayma Pulları Lab: ${aStr} ${opSign} ${bStr} = ${resStr}`, 'Sayma Pulları'], r.w - fs * 3, 0.78),
        r.x + fs * 1.0,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Çizim Alanı
    const boxW = r.w - fs * 2.0;
    const boxH = r.h - fs * 4.6;
    const boxX = r.x + fs * 1.0;
    const boxY = r.y + fs * 3.2;

    k.c.fillStyle = withAlpha('#0f172a', 0.6);
    k.c.strokeStyle = withAlpha('#94a3b8', 0.4);
    roundRect(k, boxX, boxY, boxW, boxH, 8);
    k.c.fill();
    k.c.stroke();

    const pullR = Math.max(8, Math.min(18, fs * 0.95));

    // Pul Çizme Yardımcısı
    const drawCounter = (cx: number, cy: number, isPos: boolean, ghost = false) => {
        k.c.save();
        k.c.beginPath();
        k.c.arc(cx, cy, pullR, 0, Math.PI * 2);
        k.c.fillStyle = ghost
            ? (isPos ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)')
            : (isPos ? '#ef4444' : '#3b82f6');
        k.c.strokeStyle = isPos ? '#fca5a5' : '#93c5fd';
        k.c.lineWidth = ghost ? 1 : 2;
        if (ghost) k.c.setLineDash([3, 2]);
        k.c.fill();
        k.c.stroke();

        k.c.fillStyle = '#ffffff';
        k.c.font = `bold ${pullR * 1.25}px sans-serif`;
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        k.c.fillText(isPos ? '+' : '−', cx, cy + 1);
        k.c.restore();
    };

    if (s.op === 0) {
        // TOPLAMA İŞLEMİ
        const numA = Math.abs(s.a);
        const numB = Math.abs(s.b);
        const aPos = s.a >= 0;
        const bPos = s.b >= 0;

        // 1. Grup (a)
        const g1X = boxX + boxW * 0.24;
        const g2X = boxX + boxW * 0.58;
        const cy0 = boxY + boxH * 0.46;

        label(k, `1. Sayı: ${aStr}`, g1X, boxY + fs * 1.0, 'center', 'middle', 0.58);
        for (let i = 0; i < numA; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const px = g1X - pullR * 2.2 + col * pullR * 2.2;
            const py = cy0 - pullR * 2.0 + row * pullR * 2.4;
            drawCounter(px, py, aPos);
        }

        label(k, `2. Sayı: ${bStr}`, g2X, boxY + fs * 1.0, 'center', 'middle', 0.58);
        for (let i = 0; i < numB; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const px = g2X - pullR * 2.2 + col * pullR * 2.2;
            const py = cy0 - pullR * 2.0 + row * pullR * 2.4;
            drawCounter(px, py, bPos);
        }

        // Zıt işaretli nötr çiftler
        if (aPos !== bPos && numA > 0 && numB > 0) {
            const cancelCount = Math.min(numA, numB);
            const badgeY = boxY + boxH - fs * 1.6;
            styledPanel(k, boxX + fs, badgeY, boxW - fs * 2, fs * 1.4, {
                fill: withAlpha('#f59e0b', 0.2),
                border: '#f59e0b',
            });
            label(k, `⚡ ${cancelCount} adet (+, −) Sıfır Çifti birbirini nötrler. Kalan: ${resStr}`, boxX + boxW / 2, badgeY + fs * 0.7, 'center', 'middle', 0.55);
        }
    } else {
        // ÇIKARMA İŞLEMİ
        const numA = Math.abs(s.a);
        const aPos = s.a >= 0;
        const bPos = s.b >= 0;
        const numB = Math.abs(s.b);

        const needZeroPairs = (aPos !== bPos) || (numA < numB);
        const cx = boxX + boxW * 0.35;
        const cy = boxY + boxH * 0.44;

        label(k, `Mevcut Pul: ${aStr} — Çıkarılacak: ${bStr}`, cx, boxY + fs * 1.0, 'center', 'middle', 0.58);

        // Mevcut pullar
        for (let i = 0; i < numA; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const px = cx - pullR * 3.0 + col * pullR * 2.0;
            const py = cy - pullR * 1.8 + row * pullR * 2.2;
            drawCounter(px, py, aPos);
        }

        // Sıfır Çifti Modeli
        if (needZeroPairs) {
            const zx = boxX + boxW * 0.75;
            label(k, `Eklenen Sıfır Çifti: ${numB} adet`, zx, boxY + fs * 1.0, 'center', 'middle', 0.55);
            for (let i = 0; i < numB; i++) {
                const py = cy - pullR * 2.2 + i * pullR * 2.3;
                // Nötr kapsül
                k.c.save();
                k.c.setLineDash([3, 2]);
                k.c.strokeStyle = '#f59e0b';
                roundRect(k, zx - pullR * 2.4, py - pullR * 1.1, pullR * 4.8, pullR * 2.2, pullR);
                k.c.stroke();
                k.c.restore();

                drawCounter(zx - pullR * 1.1, py, true);
                drawCounter(zx + pullR * 1.1, py, false);
            }

            const badgeY = boxY + boxH - fs * 1.6;
            styledPanel(k, boxX + fs, badgeY, boxW - fs * 2, fs * 1.4, {
                fill: withAlpha('#10b981', 0.2),
                border: '#10b981',
            });
            label(k, `Kutuda yeterli pul yok; ${numB} sıfır çifti eklenip ${bStr} dışarı atılır. Sonuç: ${resStr}`, boxX + boxW / 2, badgeY + fs * 0.7, 'center', 'middle', 0.52);
        }
    }

    k.c.restore();
};

export const integerCountersSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = countersState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            {
                id: 'a_sub',
                x: r.x + fs * 2.0,
                y: by,
                type: 'toggle',
                label: 'A azalt',
            },
            {
                id: 'a_add',
                x: r.x + fs * 4.5,
                y: by,
                type: 'toggle',
                label: 'A artır',
            },
            {
                id: 'op_toggle',
                x: r.x + r.w * 0.5,
                y: by,
                type: 'toggle',
                label: s.op === 0 ? 'İşlem: Toplama (+)' : 'İşlem: Çıkarma (−)',
                on: s.op === 1,
            },
            {
                id: 'b_sub',
                x: r.x + r.w - fs * 4.5,
                y: by,
                type: 'toggle',
                label: 'B azalt',
            },
            {
                id: 'b_add',
                x: r.x + r.w - fs * 2.0,
                y: by,
                type: 'toggle',
                label: 'B artır',
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = countersState(o);
        if (id === 'op_toggle') return { op: s.op === 0 ? 1 : 0 };
        if (id === 'a_sub') return { a: Math.max(-6, s.a - 1) };
        if (id === 'a_add') return { a: Math.min(6, s.a + 1) };
        if (id === 'b_sub') return { b: Math.max(-6, s.b - 1) };
        if (id === 'b_add') return { b: Math.min(6, s.b + 1) };
        return {};
    },
    params: [
        { key: 'op', label: 'İşlem (0: +, 1: −)', min: 0, max: 1, step: 1 },
        { key: 'a', label: '1. Sayı (A)', min: -6, max: 6, step: 1 },
        { key: 'b', label: '2. Sayı (B)', min: -6, max: 6, step: 1 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 2. CEBİR TERAZİSİ İLE DENKLEM ÇÖZÜCÜ (7. Sınıf Matematik)
// ══════════════════════════════════════════════════════════════════════
interface BalanceEqState {
    a: number;    // x katsayısı (1 .. 4)
    b: number;    // sabit sayı (0 .. 8)
    c: number;    // sağ kefe (1 .. 16)
    step: number; // 0: Denklem, 1: Sabiti her iki taraftan at, 2: x'i yalnız bırak
}

function balanceEqState(o: MathObject): BalanceEqState {
    const a = clampInt(simValue(o, 'a', 2), 1, 4, 2);
    const b = clampInt(simValue(o, 'b', 3), 0, 8, 3);
    const c = clampInt(simValue(o, 'c', 11), 1, 16, 11);
    const step = clampInt(simValue(o, 'step', 0), 0, 2, 0);
    return { a, b, c, step };
}

export const algebraBalanceRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = balanceEqState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Terazi Geometrisi
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.44;
    const beamLen = r.w * 0.38;
    const baseY = r.y + r.h - fs * 1.5;

    // Denklem Durumu & Adım Açıklaması
    const solKefe = s.step === 0 ? `${s.a}x + ${s.b}` : s.step === 1 ? `${s.a}x` : 'x';
    const sagKefe = s.step === 0 ? `${s.c}` : s.step === 1 ? `${s.c - s.b}` : `${(s.c - s.b) / s.a}`;

    styledPanel(k, r.x + fs, r.y + fs * 0.5, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#047857', 0.25),
        border: '#10b981',
    });
    label(k, `Cebir Terazisi: ${solKefe} = ${sagKefe}`, cx, r.y + fs * 1.6, 'center', 'middle', 0.85);

    // Denge durumu açısı (adım adım terazi dengelenir)
    const tilt = 0; // Dengede
    const leftX = cx - Math.cos(tilt) * beamLen;
    const leftY = cy - Math.sin(tilt) * beamLen;
    const rightX = cx + Math.cos(tilt) * beamLen;
    const rightY = cy + Math.sin(tilt) * beamLen;

    // Kaide ve Direk
    k.c.strokeStyle = '#94a3b8';
    k.c.lineWidth = Math.max(2, k.lw * 1.4);
    line(k, cx, cy, cx, baseY);
    line(k, cx - fs * 3, baseY, cx + fs * 3, baseY, Math.max(3, k.lw * 2));

    // Döner Kol (Beam)
    k.c.strokeStyle = '#e2e8f0';
    k.c.lineWidth = Math.max(3, k.lw * 1.8);
    line(k, leftX, leftY, rightX, rightY);

    // Merkez Pivot Göstergesi
    k.c.fillStyle = '#f59e0b';
    k.c.beginPath();
    k.c.arc(cx, cy, fs * 0.6, 0, Math.PI * 2);
    k.c.fill();
    k.c.stroke();

    // Kefe İpleri ve Tabakları
    const panDrop = fs * 3.5;
    const panW = fs * 5.0;

    // SOL KEFE
    line(k, leftX, leftY, leftX - panW * 0.4, leftY + panDrop, 1.5);
    line(k, leftX, leftY, leftX + panW * 0.4, leftY + panDrop, 1.5);
    k.c.fillStyle = '#334155';
    roundRect(k, leftX - panW * 0.5, leftY + panDrop, panW, fs * 0.7, 3);
    k.c.fill();
    k.c.stroke();

    // SAĞ KEFE
    line(k, rightX, rightY, rightX - panW * 0.4, rightY + panDrop, 1.5);
    line(k, rightX, rightY, rightX + panW * 0.4, rightY + panDrop, 1.5);
    roundRect(k, rightX - panW * 0.5, rightY + panDrop, panW, fs * 0.7, 3);
    k.c.fill();
    k.c.stroke();

    // Kefelerdeki Nesneler
    const xBoxW = fs * 1.6;
    const ballR = fs * 0.5;

    // Sol kefe nesneleri (x kutuları ve b ağırlıkları)
    const currentA = s.step === 2 ? 1 : s.a;
    const currentB = s.step === 0 ? s.b : 0;

    for (let i = 0; i < currentA; i++) {
        const bx = leftX - panW * 0.35 + i * (xBoxW + 2);
        const by = leftY + panDrop - xBoxW;
        k.c.fillStyle = '#10b981';
        k.c.strokeStyle = '#047857';
        roundRect(k, bx, by, xBoxW, xBoxW, 3);
        k.c.fill();
        k.c.stroke();
        label(k, 'x', bx + xBoxW / 2, by + xBoxW / 2, 'center', 'middle', 0.65);
    }

    for (let i = 0; i < currentB; i++) {
        const px = leftX + panW * 0.15 + (i % 3) * (ballR * 2 + 2);
        const py = leftY + panDrop - ballR * 1.2 - Math.floor(i / 3) * (ballR * 2 + 2);
        k.c.fillStyle = '#f59e0b';
        k.c.beginPath();
        k.c.arc(px, py, ballR, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();
        label(k, '1', px, py, 'center', 'middle', 0.45);
    }

    // Sağ kefe nesneleri (c ağırlıkları)
    const currentC = s.step === 0 ? s.c : s.step === 1 ? s.c - s.b : (s.c - s.b) / s.a;
    for (let i = 0; i < currentC; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const px = rightX - panW * 0.38 + col * (ballR * 2 + 2);
        const py = rightY + panDrop - ballR * 1.2 - row * (ballR * 2 + 2);
        k.c.fillStyle = '#f59e0b';
        k.c.beginPath();
        k.c.arc(px, py, ballR, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();
        label(k, '1', px, py, 'center', 'middle', 0.45);
    }

    // Adım Bilgi Rozeti
    const stepTxt = s.step === 0
        ? `Adım 1: ${s.a}x + ${s.b} = ${s.c} terazide dengededir.`
        : s.step === 1
        ? `Adım 2: Her iki kefeden ${s.b} kg çıkarıldı ➜ ${s.a}x = ${s.c - s.b}`
        : `Adım 3: İki taraf ${s.a}'ya bölündü ➜ x = ${(s.c - s.b) / s.a} kg olarak bulundu! 🎉`;

    styledPanel(k, cx - fs * 12, baseY - fs * 2.2, fs * 24, fs * 1.5, {
        fill: withAlpha('#1e293b', 0.85),
        border: '#3b82f6',
    });
    label(k, stepTxt, cx, baseY - fs * 1.45, 'center', 'middle', 0.58);

    k.c.restore();
};

export const algebraBalanceSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = balanceEqState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            {
                id: 'prev_step',
                x: r.x + fs * 3.0,
                y: by,
                type: 'toggle',
                label: '◀ Önceki Adım',
            },
            {
                id: 'next_step',
                x: r.x + r.w - fs * 3.0,
                y: by,
                type: 'toggle',
                label: 'Sonraki Adım ▶',
            },
            {
                id: 'reset',
                x: r.x + r.w / 2,
                y: by,
                type: 'toggle',
                label: '🔄 Başa Dön',
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = balanceEqState(o);
        if (id === 'next_step') return { step: Math.min(2, s.step + 1) };
        if (id === 'prev_step') return { step: Math.max(0, s.step - 1) };
        if (id === 'reset') return { step: 0 };
        return {};
    },
    params: [
        { key: 'a', label: 'x katsayısı', min: 1, max: 4, step: 1 },
        { key: 'b', label: 'Sabit (sol kefe)', min: 0, max: 8, step: 1 },
        { key: 'c', label: 'Sağ kefe toplam', min: 1, max: 16, step: 1 },
        { key: 'step', label: 'Çözüm Adımı', min: 0, max: 2, step: 1 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 3. ASAL ÇARPAN AĞACI SİMÜLATÖRÜ (6. Sınıf Matematik)
// ══════════════════════════════════════════════════════════════════════
interface FactorTreeState {
    n: number; // 12, 18, 24, 36, 48, 60, 72, 84, 90, 100, 120
}

function factorTreeState(o: MathObject): FactorTreeState {
    const n = clampInt(simValue(o, 'n', 36), 12, 120, 36);
    return { n };
}

interface TreeNode {
    val: number;
    isPrime: boolean;
    left?: TreeNode;
    right?: TreeNode;
}

function buildTree(val: number): TreeNode {
    // 2'den başlayarak ilk asal böleni bul
    let factor = 0;
    for (let d = 2; d * d <= val; d++) {
        if (val % d === 0) {
            factor = d;
            break;
        }
    }
    if (factor === 0 || val <= 3) {
        return { val, isPrime: true };
    }
    return {
        val,
        isPrime: false,
        left: buildTree(factor),
        right: buildTree(val / factor),
    };
}

function getPrimeFactors(val: number): number[] {
    const factors: number[] = [];
    let d = 2;
    let temp = val;
    while (d * d <= temp) {
        if (temp % d === 0) {
            factors.push(d);
            temp /= d;
        } else {
            d++;
        }
    }
    if (temp > 1) factors.push(temp);
    return factors;
}

export const factorTreeRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = factorTreeState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const primes = getPrimeFactors(s.n);
    // Üslü gösterim
    const counts: Record<number, number> = {};
    primes.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
    const expStr = Object.entries(counts)
        .map(([base, pwr]) => (pwr > 1 ? `${base}^${pwr}` : `${base}`))
        .join(' · ');

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#1e1b4b', 0.8),
        border: '#8b5cf6',
    });
    label(
        k,
        fitText(k, [`Asal Çarpan Ağacı: ${s.n} = ${primes.join(' · ')} = ${expStr}`, `Ağaç: ${s.n}`], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Ağacı Çiz
    const root = buildTree(s.n);
    const nodeR = fs * 1.1;

    const drawSubtree = (node: TreeNode, x: number, y: number, span: number, depth: number) => {
        if (node.left && node.right) {
            const nextY = y + fs * 2.8;
            const leftX = x - span / 2;
            const rightX = x + span / 2;

            k.c.strokeStyle = '#64748b';
            k.c.lineWidth = 1.8;
            line(k, x, y, leftX, nextY);
            line(k, x, y, rightX, nextY);

            drawSubtree(node.left, leftX, nextY, span * 0.52, depth + 1);
            drawSubtree(node.right, rightX, nextY, span * 0.52, depth + 1);
        }

        // Düğüm dairesi
        k.c.fillStyle = node.isPrime ? '#10b981' : '#334155';
        k.c.strokeStyle = node.isPrime ? '#34d399' : '#94a3b8';
        k.c.lineWidth = 2;
        k.c.beginPath();
        k.c.arc(x, y, nodeR, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();

        label(k, String(node.val), x, y, 'center', 'middle', 0.68);
        if (node.isPrime) {
            label(k, 'Asal', x, y + nodeR + fs * 0.4, 'center', 'top', 0.45);
        }
    };

    const treeTopX = r.x + r.w / 2;
    const treeTopY = r.y + fs * 4.2;
    drawSubtree(root, treeTopX, treeTopY, r.w * 0.42, 0);

    // Alt özet şerit
    const sumY = r.y + r.h - fs * 1.8;
    styledPanel(k, r.x + fs * 2, sumY, r.w - fs * 4, fs * 1.5, {
        fill: withAlpha('#0f172a', 0.8),
        border: '#38bdf8',
    });
    label(
        k,
        `✦ ${s.n} sayısının asal çarpanları: {${Object.keys(counts).join(', ')}} ✦ Üslü Açılım: ${s.n} = ${expStr}`,
        r.x + r.w / 2,
        sumY + fs * 0.75,
        'center',
        'middle',
        0.58
    );

    k.c.restore();
};

const TREE_PRESETS = [12, 18, 24, 36, 48, 60, 72, 84, 90, 100, 120];

export const factorTreeSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = factorTreeState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            {
                id: 'prev_num',
                x: r.x + fs * 2.5,
                y: r.y + r.h - fs * 1.2,
                type: 'toggle',
                label: '◀ Önceki Sayı',
            },
            {
                id: 'next_num',
                x: r.x + r.w - fs * 2.5,
                y: r.y + r.h - fs * 1.2,
                type: 'toggle',
                label: 'Sonraki Sayı ▶',
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = factorTreeState(o);
        const idx = TREE_PRESETS.indexOf(s.n);
        if (id === 'next_num') {
            const nextIdx = (idx + 1) % TREE_PRESETS.length;
            return { n: TREE_PRESETS[nextIdx] };
        }
        if (id === 'prev_num') {
            const prevIdx = (idx - 1 + TREE_PRESETS.length) % TREE_PRESETS.length;
            return { n: TREE_PRESETS[prevIdx] };
        }
        return {};
    },
    params: [
        { key: 'n', label: 'Sayı (N)', min: 12, max: 120, step: 2 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 4. ÇOKGENLER & İÇ/DIŞ AÇI İSPATI (7. Sınıf Matematik)
// ══════════════════════════════════════════════════════════════════════
interface PolygonState {
    n: number;    // Kenar sayısı (3 .. 10)
    mode: number; // 0: Üçgenlere bölme (İç açılar), 1: Dış açılar (360°)
}

function polygonState(o: MathObject): PolygonState {
    const n = clampInt(simValue(o, 'n', 5), 3, 10, 5);
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
    return { n, mode };
}

export const polygonAnglesRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = polygonState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const n = s.n;
    const interiorSum = (n - 2) * 180;
    const oneInterior = interiorSum / n;
    const oneExterior = 360 / n;

    const names: Record<number, string> = {
        3: 'Üçgen', 4: 'Dörtgen', 5: 'Beşgen', 6: 'Altıgen',
        7: 'Yedigen', 8: 'Sekizgen', 9: 'Dokuzgen', 10: 'On-gen'
    };

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#0284c7', 0.25),
        border: '#38bdf8',
    });
    label(
        k,
        fitText(k, [`Düzgün ${names[n]} (${n} Kenarlı): İç Açılar = (n−2)·180° = ${interiorSum}°`, `${names[n]}`], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Çokgen Köşeleri
    const cx = r.x + r.w * 0.44;
    const cy = r.y + r.h * 0.54;
    const polyR = Math.min(r.w * 0.28, r.h * 0.36);

    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI * 2) / n;
        pts.push({
            x: cx + Math.cos(ang) * polyR,
            y: cy + Math.sin(ang) * polyR,
        });
    }

    if (s.mode === 0) {
        // İÇ AÇILAR & ÜÇGENLERE BÖLME MODU
        // 0. köşeden diğer köşelere köşegenler
        const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];
        for (let i = 1; i < n - 1; i++) {
            k.c.fillStyle = withAlpha(colors[(i - 1) % colors.length], 0.18);
            k.c.beginPath();
            k.c.moveTo(pts[0].x, pts[0].y);
            k.c.lineTo(pts[i].x, pts[i].y);
            k.c.lineTo(pts[i + 1].x, pts[i + 1].y);
            k.c.closePath();
            k.c.fill();

            // Köşegen çizgisi
            k.c.strokeStyle = '#e2e8f0';
            k.c.lineWidth = 1.5;
            k.c.stroke();

            // Üçgen içine 180° etiketi
            const tx = (pts[0].x + pts[i].x + pts[i + 1].x) / 3;
            const ty = (pts[0].y + pts[i].y + pts[i + 1].y) / 3;
            label(k, '180°', tx, ty, 'center', 'middle', 0.55);
        }
    } else {
        // DIŞ AÇILAR MODU (Kenarlar uzatılır)
        k.c.fillStyle = withAlpha('#38bdf8', 0.15);
        k.c.beginPath();
        pts.forEach((p, i) => (i === 0 ? k.c.moveTo(p.x, p.y) : k.c.lineTo(p.x, p.y)));
        k.c.closePath();
        k.c.fill();

        for (let i = 0; i < n; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % n];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            // Uzatma çizgisi
            line(k, p2.x, p2.y, p2.x + dx * 0.45, p2.y + dy * 0.45, 1.5);
            // Dış açı yayı
            k.c.strokeStyle = '#f59e0b';
            k.c.beginPath();
            k.c.arc(p2.x, p2.y, fs * 0.8, 0, Math.PI * 0.5);
            k.c.stroke();
        }
    }

    // Çokgen Çerçevesi
    k.c.strokeStyle = '#ffffff';
    k.c.lineWidth = 2.5;
    k.c.beginPath();
    pts.forEach((p, i) => (i === 0 ? k.c.moveTo(p.x, p.y) : k.c.lineTo(p.x, p.y)));
    k.c.closePath();
    k.c.stroke();

    // Sağ Bilgi Kartı
    const cardX = r.x + r.w * 0.72;
    const cardY = r.y + fs * 3.5;
    const cardW = r.w * 0.26;
    styledPanel(k, cardX, cardY, cardW, r.h - fs * 5.2, {
        fill: withAlpha('#0f172a', 0.8),
        border: '#94a3b8',
    });

    label(k, `✦ Kenar (n): ${n}`, cardX + fs * 0.6, cardY + fs * 1.0, 'left', 'top', 0.55);
    label(k, `✦ Üçgen Sayısı: ${n - 2}`, cardX + fs * 0.6, cardY + fs * 2.2, 'left', 'top', 0.55);
    label(k, `✦ İç Açılar Toplamı:`, cardX + fs * 0.6, cardY + fs * 3.4, 'left', 'top', 0.52);
    label(k, `${n - 2} × 180° = ${interiorSum}°`, cardX + fs * 0.6, cardY + fs * 4.4, 'left', 'top', 0.58);
    label(k, `✦ Bir İç Açı:`, cardX + fs * 0.6, cardY + fs * 5.8, 'left', 'top', 0.52);
    label(k, `${fmtNum(oneInterior, 1)}°`, cardX + fs * 0.6, cardY + fs * 6.8, 'left', 'top', 0.58);
    label(k, `✦ Dış Açılar Toplamı: 360°`, cardX + fs * 0.6, cardY + fs * 8.2, 'left', 'top', 0.52);
    label(k, `✦ Bir Dış Açı: ${fmtNum(oneExterior, 1)}°`, cardX + fs * 0.6, cardY + fs * 9.2, 'left', 'top', 0.52);

    k.c.restore();
};

export const polygonAnglesSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = polygonState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            {
                id: 'n_sub',
                x: r.x + fs * 2.5,
                y: by,
                type: 'toggle',
                label: 'Kenar Azalt',
            },
            {
                id: 'n_add',
                x: r.x + fs * 6.0,
                y: by,
                type: 'toggle',
                label: 'Kenar Artır',
            },
            {
                id: 'mode_toggle',
                x: r.x + r.w * 0.44,
                y: by,
                type: 'toggle',
                label: s.mode === 0 ? 'Mod: İç Açılar (Üçgenler)' : 'Mod: Dış Açılar (360°)',
                on: s.mode === 1,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = polygonState(o);
        if (id === 'n_sub') return { n: Math.max(3, s.n - 1) };
        if (id === 'n_add') return { n: Math.min(10, s.n + 1) };
        if (id === 'mode_toggle') return { mode: s.mode === 0 ? 1 : 0 };
        return {};
    },
    params: [
        { key: 'n', label: 'Kenar sayısı (n)', min: 3, max: 10, step: 1 },
        { key: 'mode', label: 'Mod (0: İç, 1: Dış)', min: 0, max: 1, step: 1 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 5. YÜZDE, ONDALIK VE KESİR 100'LÜK GRID (5. Sınıf Matematik)
// ══════════════════════════════════════════════════════════════════════
interface GridPercentState {
    k: number; // Boyalı kare sayısı (0 .. 100)
}

function gridPercentState(o: MathObject): GridPercentState {
    const kVal = clampInt(simValue(o, 'k', 35), 0, 100, 35);
    return { k: kVal };
}

function simplifyFraction(n: number, d: number): [number, number] {
    let a = n;
    let b = d;
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return [n / a, d / a];
}

export const fractionPercentDecimalRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = gridPercentState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const [sn, sd] = simplifyFraction(s.k, 100);
    const decimalStr = (s.k / 100).toFixed(2).replace('.', ',');

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#c026d3', 0.25),
        border: '#e879f9',
    });
    label(
        k,
        fitText(k, [`100'lük Tablo: Kesir = ${s.k}/100 (${sn}/${sd}) ✦ Ondalık = ${decimalStr} ✦ Yüzde = %${s.k}`, `Grid: %${s.k}`], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // 10x10 Grid Çizimi
    const gridSz = Math.min(r.w * 0.48, r.h * 0.65);
    const gridX = r.x + fs * 2.0;
    const gridY = r.y + fs * 3.4;
    const cell = gridSz / 10;

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const idx = row * 10 + col;
            const filled = idx < s.k;
            const cx = gridX + col * cell;
            const cy = gridY + row * cell;

            k.c.fillStyle = filled ? '#d946ef' : withAlpha('#334155', 0.4);
            k.c.fillRect(cx, cy, cell, cell);
            k.c.strokeStyle = '#1e293b';
            k.c.lineWidth = 1;
            k.c.strokeRect(cx, cy, cell, cell);
        }
    }
    k.c.strokeStyle = '#f0abfc';
    k.c.lineWidth = 2.5;
    k.c.strokeRect(gridX, gridY, gridSz, gridSz);

    // Sağ Gösterge Kartları
    const cardX = gridX + gridSz + fs * 2.0;
    const cardW = r.x + r.w - cardX - fs * 1.5;

    const cards = [
        { title: 'KESİR GÖSTERİMİ', val: `${s.k} / 100`, sub: `En sade hali: ${sn} / ${sd}`, col: '#38bdf8' },
        { title: 'ONDALIK GÖSTERİM', val: decimalStr, sub: `0 tam yüzde ${s.k}`, col: '#34d399' },
        { title: 'YÜZDE GÖSTERİMİ', val: `%${s.k}`, sub: `Yüzde ${s.k}`, col: '#f43f5e' },
    ];

    cards.forEach((cd, i) => {
        const cy = gridY + i * (fs * 3.4);
        styledPanel(k, cardX, cy, cardW, fs * 3.0, {
            fill: withAlpha('#0f172a', 0.8),
            border: cd.col,
        });
        label(k, cd.title, cardX + fs * 0.8, cy + fs * 0.7, 'left', 'middle', 0.45);
        label(k, cd.val, cardX + fs * 0.8, cy + fs * 1.8, 'left', 'middle', 0.82);
        label(k, cd.sub, cardX + cardW - fs * 0.8, cy + fs * 1.8, 'right', 'middle', 0.52);
    });

    k.c.restore();
};

export const fractionPercentDecimalSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = gridPercentState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            { id: 'sub_10', x: r.x + fs * 2.5, y: by, type: 'toggle', label: '−10' },
            { id: 'add_10', x: r.x + fs * 5.5, y: by, type: 'toggle', label: '+10' },
            { id: 'set_25', x: r.x + r.w * 0.40, y: by, type: 'toggle', label: 'Çeyrek (%25)' },
            { id: 'set_50', x: r.x + r.w * 0.58, y: by, type: 'toggle', label: 'Yarım (%50)' },
            { id: 'set_75', x: r.x + r.w * 0.76, y: by, type: 'toggle', label: '%75' },
            { id: 'set_100', x: r.x + r.w - fs * 2.5, y: by, type: 'toggle', label: 'Tam (%100)' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = gridPercentState(o);
        if (id === 'sub_10') return { k: Math.max(0, s.k - 10) };
        if (id === 'add_10') return { k: Math.min(100, s.k + 10) };
        if (id === 'set_25') return { k: 25 };
        if (id === 'set_50') return { k: 50 };
        if (id === 'set_75') return { k: 75 };
        if (id === 'set_100') return { k: 100 };
        return {};
    },
    params: [
        { key: 'k', label: 'Boyalı Kare (0-100)', min: 0, max: 100, step: 1 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 6. IŞIK ENGELİ & TAM GÖLGE LABORATUVARI (5. Sınıf Fen Bilimleri)
// ══════════════════════════════════════════════════════════════════════
interface ShadowScreenState {
    l1: number; // Işık - Engel mesafesi (30 .. 100 cm)
    l2: number; // Engel - Perde mesafesi (30 .. 120 cm)
    objR: number; // Engel yarıçapı (10 .. 30 cm)
}

function shadowScreenState(o: MathObject): ShadowScreenState {
    const l1 = clamp(simValue(o, 'l1', 50), 30, 100);
    const l2 = clamp(simValue(o, 'l2', 60), 30, 120);
    const objR = clamp(simValue(o, 'objR', 18), 10, 30);
    return { l1, l2, objR };
}

export const shadowScreenRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = shadowScreenState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Gölge yarıçapı hesabı: R_shadow = R_obj * (l1 + l2) / l1
    const ratio = (s.l1 + s.l2) / s.l1;
    const shadowR = s.objR * ratio;

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#78350f', 0.3),
        border: '#f59e0b',
    });
    label(
        k,
        fitText(k, [`Tam Gölge Lab: Engel Işığa Yaklaşırsa Gölge BÜYÜR ✦ Gölge Çapı = ${fmtNum(shadowR * 2, 1)} cm`, 'Tam Gölge Lab'], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Optik Eksen Düzeni
    const axisY = r.y + r.h * 0.52;
    const startX = r.x + fs * 3.0;
    const benchW = r.w * 0.65;

    // Toplam cetvel ölçeği: 0 .. 220 cm
    const totalCm = 220;
    const scaleX = benchW / totalCm;

    const lightX = startX;
    const objX = startX + s.l1 * scaleX;
    const screenX = objX + s.l2 * scaleX;

    // Optik Ray / Masa
    line(k, startX - fs, axisY + fs * 3.5, startX + benchW + fs, axisY + fs * 3.5, 2);
    // Eksen çizgisi (kesikli)
    k.c.save();
    k.c.strokeStyle = withAlpha('#94a3b8', 0.3);
    k.c.setLineDash([4, 4]);
    line(k, lightX, axisY, screenX + fs * 2, axisY, 1);
    k.c.restore();

    // 1. Noktasal Işık Kaynağı
    k.c.fillStyle = '#fef08a';
    k.c.shadowColor = '#facc15';
    k.c.shadowBlur = 15;
    k.c.beginPath();
    k.c.arc(lightX, axisY, fs * 0.7, 0, Math.PI * 2);
    k.c.fill();
    k.c.shadowBlur = 0;
    label(k, '💡 Işık Kaynağı', lightX, axisY + fs * 1.6, 'center', 'top', 0.48);

    // 2. Opak Dairesel Engel
    const objH = s.objR * 1.5;
    k.c.fillStyle = '#334155';
    k.c.strokeStyle = '#94a3b8';
    k.c.lineWidth = 2;
    k.c.beginPath();
    k.c.arc(objX, axisY, objH, 0, Math.PI * 2);
    k.c.fill();
    k.c.stroke();
    label(k, `Opak Engel (r=${s.objR})`, objX, axisY + objH + fs * 0.5, 'center', 'top', 0.48);

    // 3. Işık Işınları (Teğet Sarı Çizgiler)
    const topTanY = axisY - objH;
    const botTanY = axisY + objH;
    const shadowTopY = axisY - objH * ratio;
    const shadowBotY = axisY + objH * ratio;

    k.c.strokeStyle = '#facc15';
    k.c.lineWidth = 1.5;
    line(k, lightX, axisY, screenX, shadowTopY);
    line(k, lightX, axisY, screenX, shadowBotY);

    // Işık konisi şeffaf dolgusu
    k.c.fillStyle = 'rgba(250, 204, 21, 0.08)';
    k.c.beginPath();
    k.c.moveTo(lightX, axisY);
    k.c.lineTo(screenX, shadowTopY);
    k.c.lineTo(screenX, shadowBotY);
    k.c.closePath();
    k.c.fill();

    // 4. Perde (Screen)
    const screenH = r.h * 0.65;
    k.c.fillStyle = '#e2e8f0';
    k.c.strokeStyle = '#cbd5e1';
    roundRect(k, screenX - 4, axisY - screenH / 2, 8, screenH, 2);
    k.c.fill();
    k.c.stroke();
    label(k, 'Perde', screenX, axisY - screenH / 2 - fs * 0.5, 'center', 'bottom', 0.52);

    // Perdedeki Tam Gölge
    const shH = Math.min(screenH * 0.95, (shadowBotY - shadowTopY));
    k.c.fillStyle = '#0f172a';
    roundRect(k, screenX - 5, axisY - shH / 2, 10, shH, 3);
    k.c.fill();

    // Sağ Panel: Perdeden Önden Görünüm
    const viewW = r.w * 0.22;
    const viewX = r.x + r.w - viewW - fs;
    const viewY = r.y + fs * 3.4;
    const viewH = r.h - fs * 5.0;

    styledPanel(k, viewX, viewY, viewW, viewH, {
        fill: withAlpha('#1e293b', 0.9),
        border: '#94a3b8',
    });
    label(k, 'Perdeden Görünüm', viewX + viewW / 2, viewY + fs * 0.9, 'center', 'middle', 0.52);

    // Dairesel Tam Gölge Silüeti
    const frontR = Math.min(viewW * 0.42, (shH / screenH) * (viewW * 0.45));
    k.c.fillStyle = '#020617';
    k.c.strokeStyle = '#e2e8f0';
    k.c.lineWidth = 2;
    k.c.beginPath();
    k.c.arc(viewX + viewW / 2, viewY + viewH * 0.55, frontR, 0, Math.PI * 2);
    k.c.fill();
    k.c.stroke();
    label(k, 'TAM GÖLGE', viewX + viewW / 2, viewY + viewH * 0.55, 'center', 'middle', 0.5);
    label(k, `Çap = ${fmtNum(shadowR * 2, 1)} cm`, viewX + viewW / 2, viewY + viewH - fs * 0.8, 'center', 'middle', 0.5);

    k.c.restore();
};

export const shadowScreenSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            { id: 'obj_near', x: r.x + fs * 3.0, y: by, type: 'toggle', label: 'Engeli Işığa Yaklaştır (Gölge Büyür)' },
            { id: 'obj_far', x: r.x + r.w * 0.38, y: by, type: 'toggle', label: 'Engeli Perdeye Yaklaştır (Küçülür)' },
            { id: 'size_up', x: r.x + r.w * 0.72, y: by, type: 'toggle', label: 'Engel Çapı (+)' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = shadowScreenState(o);
        if (id === 'obj_near') return { l1: Math.max(30, s.l1 - 10), l2: Math.min(120, s.l2 + 10) };
        if (id === 'obj_far') return { l1: Math.min(90, s.l1 + 10), l2: Math.max(30, s.l2 - 10) };
        if (id === 'size_up') return { objR: s.objR >= 26 ? 14 : s.objR + 4 };
        return {};
    },
    params: [
        { key: 'l1', label: 'Işık-Engel (L1 cm)', min: 30, max: 100, step: 5 },
        { key: 'l2', label: 'Engel-Perde (L2 cm)', min: 30, max: 120, step: 5 },
        { key: 'objR', label: 'Engel Yarıçapı (cm)', min: 10, max: 30, step: 2 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 7. LUNAPARK TRENİ: RAYDA ENERJİ DÖNÜŞÜMÜ (7. Sınıf Fen Bilimleri)
// ══════════════════════════════════════════════════════════════════════
interface RollerCoasterState {
    play: number;
    friction: number; // 0: Sürtünmesiz, 1: Sürtünmeli
    h0: number;       // Başlangıç yüksekliği (20 .. 50 m)
}

function rollerCoasterState(o: MathObject): RollerCoasterState {
    const play = clampInt(simValue(o, 'play', 1), 0, 1, 1);
    const friction = clampInt(simValue(o, 'friction', 0), 0, 1, 0);
    const h0 = clamp(simValue(o, 'h0', 40), 20, 50);
    return { play, friction, h0 };
}

export const rollerCoasterRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = rollerCoasterState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#1e1b4b', 0.8),
        border: '#6366f1',
    });
    label(
        k,
        fitText(k, ['Enerji Dönüşümü: Potansiyel (Ep) ⟷ Kinetik (Ek) ✦ Ep + Ek = Mekanik Enerji (Sabit)', 'Enerji Dönüşümü'], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Ray Geometrisi
    const trackX = r.x + fs * 2;
    const trackW = r.w * 0.65;
    const groundY = r.y + r.h * 0.80;
    const maxTrackH = r.h * 0.45;

    // Ray yükseklik fonksiyonu y(x): 0..1 arası parametre
    const getTrackH = (u: number) => {
        // u = 0 (tepe 1), u = 0.35 (çukur), u = 0.70 (tepe 2), u = 1.0 (çukur 2)
        const curve = 0.5 * Math.cos(u * Math.PI * 3) + 0.5;
        return (curve * (s.h0 / 50)) * maxTrackH;
    };

    // Ray eğrisini çiz
    k.c.strokeStyle = '#94a3b8';
    k.c.lineWidth = 4;
    k.c.beginPath();
    for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const px = trackX + u * trackW;
        const py = groundY - getTrackH(u);
        if (i === 0) k.c.moveTo(px, py);
        else k.c.lineTo(px, py);
    }
    k.c.stroke();

    // Vagon konumu (zamana bağlı salınım)
    const speed = s.play ? 0.35 : 0;
    const cycle = (k.t * speed) % 2;
    const u = cycle <= 1 ? cycle : 2 - cycle; // Git-gel
    const cartX = trackX + u * trackW;
    const cartTrackH = getTrackH(u);
    const cartY = groundY - cartTrackH;

    // Vagon çizimi
    const cartW = fs * 2.2;
    const cartH = fs * 1.3;
    k.c.fillStyle = '#ef4444';
    k.c.strokeStyle = '#fca5a5';
    roundRect(k, cartX - cartW / 2, cartY - cartH, cartW, cartH, 4);
    k.c.fill();
    k.c.stroke();

    // Tekerlekler
    k.c.fillStyle = '#334155';
    k.c.beginPath();
    k.c.arc(cartX - cartW * 0.3, cartY, fs * 0.3, 0, Math.PI * 2);
    k.c.arc(cartX + cartW * 0.3, cartY, fs * 0.3, 0, Math.PI * 2);
    k.c.fill();

    // Enerji Hesapları: Ep, Ek
    const totalE = s.h0; // Oransal
    const currentH = (cartTrackH / maxTrackH) * 50;
    const ep = currentH;
    const ek = Math.max(0, totalE - ep);

    // Sağ Enerji Çubuk Grafikleri
    const barX = trackX + trackW + fs * 2;
    const barW = r.x + r.w - barX - fs;
    const barBaseY = groundY;
    const maxBarH = r.h * 0.48;

    styledPanel(k, barX, r.y + fs * 3.4, barW, r.h - fs * 5.0, {
        fill: withAlpha('#0f172a', 0.85),
        border: '#6366f1',
    });
    label(k, 'CANLI ENERJİ GRAFİĞİ', barX + barW / 2, r.y + fs * 4.3, 'center', 'middle', 0.52);

    const colW = barW * 0.22;
    const epH = (ep / 50) * maxBarH;
    const ekH = (ek / 50) * maxBarH;
    const totalH = (totalE / 50) * maxBarH;

    // Ep Bar (Mavi)
    const epX = barX + barW * 0.12;
    k.c.fillStyle = '#38bdf8';
    k.c.fillRect(epX, barBaseY - epH, colW, epH);
    label(k, 'Ep', epX + colW / 2, barBaseY + fs * 0.7, 'center', 'top', 0.52);
    label(k, `${fmtNum(ep, 0)}J`, epX + colW / 2, barBaseY - epH - fs * 0.5, 'center', 'bottom', 0.48);

    // Ek Bar (Yeşil)
    const ekX = barX + barW * 0.42;
    k.c.fillStyle = '#10b981';
    k.c.fillRect(ekX, barBaseY - ekH, colW, ekH);
    label(k, 'Ek', ekX + colW / 2, barBaseY + fs * 0.7, 'center', 'top', 0.52);
    label(k, `${fmtNum(ek, 0)}J`, ekX + colW / 2, barBaseY - ekH - fs * 0.5, 'center', 'bottom', 0.48);

    // Toplam Mekanik (Sarı Çizgi / Bar)
    const emX = barX + barW * 0.72;
    k.c.fillStyle = '#f59e0b';
    k.c.fillRect(emX, barBaseY - totalH, colW, totalH);
    label(k, 'E_top', emX + colW / 2, barBaseY + fs * 0.7, 'center', 'top', 0.52);
    label(k, `${fmtNum(totalE, 0)}J`, emX + colW / 2, barBaseY - totalH - fs * 0.5, 'center', 'bottom', 0.48);

    k.c.restore();
};

export const rollerCoasterSpec: SimSpec = {
    animated: true,
    controls: (r, o): SimControl[] => {
        const s = rollerCoasterState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            {
                id: 'play_toggle',
                x: r.x + fs * 3.0,
                y: by,
                type: 'toggle',
                label: s.play ? '⏸ Duraklat' : '▶ Başlat',
                on: s.play === 1,
            },
            {
                id: 'h0_up',
                x: r.x + fs * 8.5,
                y: by,
                type: 'toggle',
                label: 'Tepe Yüksekliği (+)',
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = rollerCoasterState(o);
        if (id === 'play_toggle') return { play: s.play ? 0 : 1 };
        if (id === 'h0_up') return { h0: s.h0 >= 48 ? 25 : s.h0 + 8 };
        return {};
    },
    params: [
        { key: 'play', label: 'Hareket (0: Dur, 1: Oyna)', min: 0, max: 1, step: 1 },
        { key: 'h0', label: 'Başlangıç Tepe (m)', min: 20, max: 50, step: 5 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 8. SIVI YOĞUNLUK KULESİ & YÜZME-BATMA (6. Sınıf Fen Bilimleri)
// ══════════════════════════════════════════════════════════════════════
interface DensityColumnState {
    dropped: number; // Bitmask: hangi cisimler atıldı (1..31)
}

function densityColumnState(o: MathObject): DensityColumnState {
    const dropped = clampInt(simValue(o, 'dropped', 31), 0, 31, 31);
    return { dropped };
}

export const densityColumnRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = densityColumnState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#0284c7', 0.25),
        border: '#38bdf8',
    });
    label(
        k,
        fitText(k, ['Yoğunluk Kulesi: Yoğunluğu büyük olan sıvı altta, küçük olan üstte toplanır (d = m/V)', 'Yoğunluk Kulesi'], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Silindir Kule Çizimi
    const cylW = r.w * 0.38;
    const cylH = r.h * 0.65;
    const cylX = r.x + fs * 3.0;
    const cylY = r.y + fs * 3.2;

    const liquids = [
        { name: '4. Zeytinyağı', d: 'd = 0.90 g/cm³', col: 'rgba(234, 179, 8, 0.55)' },
        { name: '3. Su (Renkli)', d: 'd = 1.00 g/cm³', col: 'rgba(56, 189, 248, 0.55)' },
        { name: '2. Bulaşık Deterjanı', d: 'd = 1.25 g/cm³', col: 'rgba(16, 185, 129, 0.55)' },
        { name: '1. Bal (En Yoğun)', d: 'd = 1.42 g/cm³', col: 'rgba(217, 119, 6, 0.75)' },
    ];

    const layerH = cylH / 4;
    liquids.forEach((liq, i) => {
        const ly = cylY + i * layerH;
        k.c.fillStyle = liq.col;
        k.c.fillRect(cylX, ly, cylW, layerH);
        label(k, `${liq.name} (${liq.d})`, cylX + fs * 0.6, ly + layerH / 2, 'left', 'middle', 0.5);
    });

    // Cam Silindir Sınırları
    k.c.strokeStyle = '#e2e8f0';
    k.c.lineWidth = 3;
    k.c.strokeRect(cylX, cylY, cylW, cylH);

    // Cisimler ve askıda kaldıkları derinlikler
    const solids = [
        { name: 'Mantar Tıpa', d: '0.24', yNorm: 0.12, col: '#d97706', shape: 'circle' },
        { name: 'Buz Kalıbı', d: '0.92', yNorm: 0.28, col: '#a5f3fc', shape: 'rect' },
        { name: 'Plastik Kapak', d: '1.10', yNorm: 0.52, col: '#f43f5e', shape: 'circle' },
        { name: 'Havuç / Silgi', d: '1.30', yNorm: 0.76, col: '#ea580c', shape: 'rect' },
        { name: 'Demir Bilye', d: '7.80', yNorm: 0.96, col: '#475569', shape: 'circle' },
    ];

    const itemR = fs * 0.65;
    solids.forEach((sol, i) => {
        const active = (s.dropped & (1 << i)) !== 0;
        if (!active) return;
        const px = cylX + cylW * 0.75;
        const py = cylY + sol.yNorm * cylH;

        k.c.fillStyle = sol.col;
        k.c.strokeStyle = '#ffffff';
        k.c.lineWidth = 1.5;
        if (sol.shape === 'circle') {
            k.c.beginPath();
            k.c.arc(px, py, itemR, 0, Math.PI * 2);
            k.c.fill();
            k.c.stroke();
        } else {
            roundRect(k, px - itemR, py - itemR * 0.8, itemR * 2, itemR * 1.6, 2);
            k.c.fill();
            k.c.stroke();
        }
    });

    // Sağ Bilgi Listesi
    const infoX = cylX + cylW + fs * 2;
    const infoW = r.x + r.w - infoX - fs;
    styledPanel(k, infoX, cylY, infoW, cylH, {
        fill: withAlpha('#0f172a', 0.85),
        border: '#94a3b8',
    });
    label(k, 'CİSİMLERİN YOĞUNLUKLARI', infoX + infoW / 2, cylY + fs * 0.9, 'center', 'middle', 0.52);

    solids.forEach((sol, i) => {
        const sy = cylY + fs * (2.2 + i * 1.8);
        label(k, `✦ ${sol.name} (d = ${sol.d} g/cm³)`, infoX + fs * 0.8, sy, 'left', 'middle', 0.52);
    });

    k.c.restore();
};

export const densityColumnSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = densityColumnState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            { id: 'drop_all', x: r.x + fs * 4.0, y: by, type: 'toggle', label: 'Tüm Cisimleri Bırak' },
            { id: 'clear_all', x: r.x + r.w - fs * 4.0, y: by, type: 'toggle', label: 'Kuleyi Boşalt' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'drop_all') return { dropped: 31 };
        if (id === 'clear_all') return { dropped: 0 };
        return {};
    },
    params: [
        { key: 'dropped', label: 'Bırakılan Cisimler', min: 0, max: 31, step: 1 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 9. GRAVESANDE HALKASI & GENLEŞME-BÜZÜLME (5. Sınıf Fen Bilimleri)
// ══════════════════════════════════════════════════════════════════════
interface ExpansionState {
    temp: number; // 20: Oda, 150: Isıtıldı, 0: Soğutuldu
    testing: number; // 0: Havada, 1: Halkadan geçirilmeye çalışılıyor
}

function expansionState(o: MathObject): ExpansionState {
    const temp = clampInt(simValue(o, 'temp', 20), 0, 150, 20);
    const testing = clampInt(simValue(o, 'testing', 0), 0, 1, 0);
    return { temp, testing };
}

export const expansionRingRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = expansionState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#b45309', 0.25),
        border: '#f59e0b',
    });
    label(
        k,
        fitText(k, ['Gravzant Halkası: Katılar Isıtılınca Genleşir (Hacim Artar), Soğuyunca Büzülür', 'Gravzant Halkası'], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // Düzeneğin Çizimi
    const cx = r.x + r.w * 0.38;
    const ringY = r.y + r.h * 0.55;
    const ringInnerR = fs * 2.0;

    // Metal Halka (Sabit çap)
    k.c.strokeStyle = '#eab308';
    k.c.lineWidth = 5;
    k.c.beginPath();
    k.c.arc(cx, ringY, ringInnerR, 0, Math.PI * 2);
    k.c.stroke();
    // Tutamak sapı
    line(k, cx + ringInnerR, ringY, cx + ringInnerR + fs * 4, ringY, 3.5);

    // Küre Çapı (Sıcaklığa göre genleşir)
    // 20°C iken r = 1.95 (geçer), 150°C iken r = 2.25 (takılır, geçemez!), 0°C iken r = 1.85 (kolayca geçer)
    const ballR = ringInnerR * (s.temp === 150 ? 1.15 : s.temp === 0 ? 0.90 : 0.96);
    const passes = ballR < ringInnerR;

    // Kürenin Konumu
    let ballY = ringY - fs * 3.5;
    if (s.testing === 1) {
        if (passes) {
            ballY = ringY + fs * 3.5; // Aşağı geçti!
        } else {
            ballY = ringY - ballR * 0.85; // Üstünde takıldı!
        }
    }

    // Küre ve Asma Zinciri
    line(k, cx, r.y + fs * 2.5, cx, ballY, 1.5);
    k.c.fillStyle = s.temp === 150 ? '#ef4444' : s.temp === 0 ? '#38bdf8' : '#94a3b8';
    k.c.strokeStyle = '#ffffff';
    k.c.lineWidth = 2;
    k.c.beginPath();
    k.c.arc(cx, ballY, ballR, 0, Math.PI * 2);
    k.c.fill();
    k.c.stroke();

    // Isıtıcı / İspirto Alevi
    if (s.temp === 150) {
        k.c.fillStyle = '#f59e0b';
        k.c.beginPath();
        k.c.arc(cx, ballY + ballR + fs * 0.8, fs * 0.6, 0, Math.PI * 2);
        k.c.fill();
        label(k, '🔥 Isıtılıyor', cx, ballY + ballR + fs * 1.8, 'center', 'middle', 0.5);
    }

    // Durum Açıklama Rozeti
    const statusTxt = s.temp === 150
        ? '✦ Isıtıldı (150°C): Küre GENLEŞTİ; çapı halkanın çapından büyük olduğu için HALKADAN GEÇEMEZ! 🚫'
        : s.temp === 0
        ? '✦ Soğutuldu (0°C): Küre BÜZÜLDÜ; çapı küçüldüğü için HALKADAN ÇOK KOLAY GEÇER! ✅'
        : '✦ Oda Sıcaklığı (20°C): Küre halkanın içinden tam geçer. ✅';

    styledPanel(k, r.x + fs * 2, r.y + r.h - fs * 3.0, r.w - fs * 4, fs * 1.6, {
        fill: withAlpha('#0f172a', 0.85),
        border: passes ? '#10b981' : '#ef4444',
    });
    label(k, statusTxt, r.x + r.w / 2, r.y + r.h - fs * 2.2, 'center', 'middle', 0.52);

    k.c.restore();
};

export const expansionRingSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = expansionState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            { id: 'heat', x: r.x + fs * 3.0, y: by, type: 'toggle', label: '🔥 Isıt (150°C)' },
            { id: 'cool', x: r.x + r.w * 0.35, y: by, type: 'toggle', label: '❄️ Soğut (0°C)' },
            { id: 'room', x: r.x + r.w * 0.62, y: by, type: 'toggle', label: 'Oda Sıcaklığı (20°C)' },
            { id: 'try_pass', x: r.x + r.w - fs * 3.0, y: by, type: 'toggle', label: s.testing ? 'Geri Çek' : 'Geçirmeyi Dene' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = expansionState(o);
        if (id === 'heat') return { temp: 150 };
        if (id === 'cool') return { temp: 0 };
        if (id === 'room') return { temp: 20 };
        if (id === 'try_pass') return { testing: s.testing ? 0 : 1 };
        return {};
    },
    params: [
        { key: 'temp', label: 'Sıcaklık (°C)', min: 0, max: 150, step: 10 },
        { key: 'testing', label: 'Geçirme Testi', min: 0, max: 1, step: 1 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// 10. KÜTLE VE AĞIRLIK: FARKLI GEZEGENLER LAB (7. Sınıf Fen Bilimleri)
// ══════════════════════════════════════════════════════════════════════
interface GravityPlanetState {
    planet: number; // 0: Dünya (9.8), 1: Ay (1.6), 2: Mars (3.7), 3: Jüpiter (24.8)
    mass: number;   // 10, 30, 60 kg
}

function gravityPlanetState(o: MathObject): GravityPlanetState {
    const planet = clampInt(simValue(o, 'planet', 0), 0, 3, 0);
    const mass = clamp(simValue(o, 'mass', 60), 10, 100);
    return { planet, mass };
}

const PLANETS = [
    { name: 'Dünya 🌍', g: 9.8, col: '#38bdf8' },
    { name: 'Ay 🌕', g: 1.6, col: '#cbd5e1' },
    { name: 'Mars 🔴', g: 3.7, col: '#f97316' },
    { name: 'Jüpiter 🪐', g: 24.8, col: '#fbbf24' },
];

export const massWeightGravityRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const s = gravityPlanetState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const pl = PLANETS[s.planet];
    const weight = s.mass * pl.g;

    styledPanel(k, r.x + fs, r.y + fs * 0.4, r.w - fs * 2, fs * 2.2, {
        fill: withAlpha('#1e1b4b', 0.8),
        border: pl.col,
    });
    label(
        k,
        fitText(k, [`Kütle vs Ağırlık: ${pl.name} (g = ${pl.g} N/kg) ✦ Kütle = ${s.mass} kg (Değişmez) ✦ Ağırlık G = ${fmtNum(weight, 1)} N`, 'Kütle ve Ağırlık'], r.w - fs * 4, 0.78),
        r.x + fs * 1.5,
        r.y + fs * 1.5,
        'left',
        'middle',
        0.78
    );

    // SOL: Eşit Kollu Terazi (Kütle Ölçer)
    const scaleX = r.x + r.w * 0.28;
    const scaleY = r.y + r.h * 0.48;
    const armW = r.w * 0.18;

    k.c.strokeStyle = '#94a3b8';
    k.c.lineWidth = 2;
    line(k, scaleX - armW, scaleY, scaleX + armW, scaleY);
    line(k, scaleX, scaleY, scaleX, scaleY + fs * 4);
    label(k, 'EŞİT KOLLU TERAZİ (Kütle)', scaleX, scaleY - fs * 1.8, 'center', 'middle', 0.55);
    label(k, `${s.mass} kg (Her Gezegende Aynı)`, scaleX, scaleY + fs * 5.0, 'center', 'middle', 0.52);

    // SAĞ: Dinamometre (Ağırlık Ölçer)
    const dynX = r.x + r.w * 0.72;
    const dynY = r.y + fs * 3.8;
    const dynH = r.h * 0.45;

    styledPanel(k, dynX - fs * 2.5, dynY, fs * 5.0, dynH, {
        fill: withAlpha('#0f172a', 0.8),
        border: '#e2e8f0',
    });

    // Yay Uzaması: Yerçekimine göre yay uzar
    const maxWeight = 100 * 25; // 2500 N
    const stretch = (weight / maxWeight) * (dynH * 0.75);
    const hookY = dynY + fs * 1.5 + stretch;

    // Sarmal yay çizgisi
    k.c.strokeStyle = '#f59e0b';
    k.c.lineWidth = 2;
    k.c.beginPath();
    const springTurns = 8;
    const springStep = (hookY - dynY - fs * 0.8) / springTurns;
    for (let i = 0; i < springTurns; i++) {
        const sy = dynY + fs * 0.8 + i * springStep;
        const sx = dynX + (i % 2 === 0 ? -fs * 0.8 : fs * 0.8);
        if (i === 0) k.c.moveTo(dynX, sy);
        else k.c.lineTo(sx, sy);
    }
    k.c.stroke();

    // Kanca ve Asılı Yük
    k.c.fillStyle = '#ef4444';
    roundRect(k, dynX - fs * 1.8, hookY, fs * 3.6, fs * 2.0, 4);
    k.c.fill();
    k.c.stroke();
    label(k, `${fmtNum(weight, 0)} N`, dynX, hookY + fs * 1.0, 'center', 'middle', 0.65);

    label(k, 'DİNAMOMETRE (Ağırlık)', dynX, dynY + dynH + fs * 1.0, 'center', 'middle', 0.55);
    label(k, `G = m·g = ${fmtNum(weight, 1)} N`, dynX, dynY + dynH + fs * 2.0, 'center', 'middle', 0.52);

    k.c.restore();
};

export const massWeightGravitySpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = gravityPlanetState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const by = r.y + r.h - fs * 1.2;
        return [
            { id: 'p0', x: r.x + fs * 2.5, y: by, type: 'toggle', label: 'Dünya 🌍', on: s.planet === 0 },
            { id: 'p1', x: r.x + r.w * 0.32, y: by, type: 'toggle', label: 'Ay 🌕', on: s.planet === 1 },
            { id: 'p2', x: r.x + r.w * 0.56, y: by, type: 'toggle', label: 'Mars 🔴', on: s.planet === 2 },
            { id: 'p3', x: r.x + r.w - fs * 3.0, y: by, type: 'toggle', label: 'Jüpiter 🪐', on: s.planet === 3 },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'p0') return { planet: 0 };
        if (id === 'p1') return { planet: 1 };
        if (id === 'p2') return { planet: 2 };
        if (id === 'p3') return { planet: 3 };
        return {};
    },
    params: [
        { key: 'planet', label: 'Gezegen (0:Dünya, 1:Ay, 2:Mars, 3:Jüpiter)', min: 0, max: 3, step: 1 },
        { key: 'mass', label: 'Kütle (kg)', min: 10, max: 100, step: 10 },
    ],
};

// ══════════════════════════════════════════════════════════════════════
// KAYIT VE KATALOG LİSTELERİ
// ══════════════════════════════════════════════════════════════════════

export const MIDDLE_SCHOOL_RENDERERS: Record<string, Renderer> = {
    integer_counters_sim: integerCountersRender,
    algebra_balance_sim: algebraBalanceRender,
    factor_tree_sim: factorTreeRender,
    polygon_angles_sim: polygonAnglesRender,
    fraction_percent_decimal_sim: fractionPercentDecimalRender,
    shadow_screen_sim: shadowScreenRender,
    roller_coaster_sim: rollerCoasterRender,
    density_column_sim: densityColumnRender,
    expansion_ring_sim: expansionRingRender,
    mass_weight_gravity_sim: massWeightGravityRender,
};

export const MIDDLE_SCHOOL_SPECS: Record<string, SimSpec> = {
    integer_counters_sim: integerCountersSpec,
    algebra_balance_sim: algebraBalanceSpec,
    factor_tree_sim: factorTreeSpec,
    polygon_angles_sim: polygonAnglesSpec,
    fraction_percent_decimal_sim: fractionPercentDecimalSpec,
    shadow_screen_sim: shadowScreenSpec,
    roller_coaster_sim: rollerCoasterSpec,
    density_column_sim: densityColumnSpec,
    expansion_ring_sim: expansionRingSpec,
    mass_weight_gravity_sim: massWeightGravitySpec,
};

export const MIDDLE_SCHOOL_MATH_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'integer_counters_sim',
        label: 'Sayma Pulları Lab',
        hint: 'Pozitif ve negatif pullarla toplama, çıkarma ve sıfır çifti oluşturma',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { op: 0, a: 3, b: -4, step: 1 } },
    },
    {
        kind: 'algebra_balance_sim',
        label: 'Cebir Terazisi & Denklem',
        hint: 'Eşit kollu terazi ile denklem çözme: ax + b = c denge modeli',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { a: 2, b: 3, c: 11, step: 0 } },
    },
    {
        kind: 'factor_tree_sim',
        label: 'Asal Çarpan Ağacı',
        hint: 'Sayıyı asal yapraklara ayıran çarpan ağacı ve üslü gösterim',
        size: { w: 560, h: 380 },
        defaults: { labels: true, sim: { n: 36 } },
    },
    {
        kind: 'polygon_angles_sim',
        label: 'Çokgenler & Açı İspatı',
        hint: 'Köşegenlerle (n−2) üçgene ayırma ve 360° dış açı modeli',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { n: 5, mode: 0 } },
    },
    {
        kind: 'fraction_percent_decimal_sim',
        label: 'Yüzde & Ondalık 100’lük Grid',
        hint: '100’lük ızgara boyama ⟷ Kesir ⟷ Ondalık ⟷ Yüzde eşzamanlı çevirici',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { k: 35 } },
    },
];

export const MIDDLE_SCHOOL_SCIENCE_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'shadow_screen_sim',
        label: 'Tam Gölge & Perde Lab',
        hint: 'Işık kaynağı, opak engel ve perde arasında oluşan tam gölge',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { l1: 50, l2: 60, objR: 18 } },
    },
    {
        kind: 'roller_coaster_sim',
        label: 'Rayda Enerji Dönüşümü',
        hint: 'İnişli-çıkışlı rayda potansiyel ve kinetik enerji dönüşümü (Ep + Ek)',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { play: 1, friction: 0, h0: 40 } },
    },
    {
        kind: 'density_column_sim',
        label: 'Sıvı Yoğunluk Kulesi',
        hint: 'Bal, gliserin, su, yağ kulesinde cisimlerin yüzme-batma dengesi',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { dropped: 31 } },
    },
    {
        kind: 'expansion_ring_sim',
        label: 'Gravzant Halkası & Genleşme',
        hint: 'Isıtılınca genleşip halkadan geçemeyen küre, soğuyunca büzülme',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { temp: 20, testing: 0 } },
    },
    {
        kind: 'mass_weight_gravity_sim',
        label: 'Kütle vs Ağırlık (Gezegenler)',
        hint: 'Dünya, Ay, Mars ve Jüpiter’de eşit kollu terazi (m) vs dinamometre (G=mg)',
        size: { w: 560, h: 360 },
        defaults: { labels: true, sim: { planet: 0, mass: 60 } },
    },
];

export const MIDDLE_SCHOOL_ITEMS: ReadonlyArray<MathCatalogItem> = [
    ...MIDDLE_SCHOOL_MATH_ITEMS,
    ...MIDDLE_SCHOOL_SCIENCE_ITEMS,
];
