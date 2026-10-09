// src/components/drawing/grade10NumbersSims.ts
// 10. Sınıf Matematik — Yeni Maarif Modeli "Sayılar" Ünitesi Canlı Çizim Simülasyonları
// Tema 3: Asal Çarpanlar, EBOB-EKOK Geometrisi, Dişli Çarklar, Bölünebilme İspatları ve Kalanlar

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    isIconSize,
    simValue,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

/* ─────────────────────────────────────────────────────────────────────────────
   GÖRSEL YARDIMCILAR & MATEMATİKSEL DÖNÜŞTÜRÜCÜLER
   ───────────────────────────────────────────────────────────────────────────── */

function toSuperscript(num: number): string {
    const sups: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    };
    return String(num).split('').map((d) => sups[d] || d).join('');
}

function drawText(
    k: Ctx,
    text: string,
    x: number,
    y: number,
    options: {
        align?: CanvasTextAlign;
        baseline?: CanvasTextBaseline;
        scale?: number;
        color?: string;
        halo?: boolean;
        bold?: boolean;
        maxW?: number;
    } = {}
) {
    const {
        align = 'center',
        baseline = 'middle',
        scale = 1,
        color = '#0f172a',
        halo = true,
        bold = true,
        maxW,
    } = options;

    let fs = Math.round(k.fs * scale);
    k.c.save();
    k.c.font = `${bold ? '700' : '600'} ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;

    if (maxW && maxW > 30) {
        const m = k.c.measureText(text);
        if (m.width > maxW) {
            const ratio = maxW / m.width;
            fs = Math.max(7, Math.floor(fs * ratio));
            k.c.font = `${bold ? '700' : '600'} ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
        }
    }

    k.c.textAlign = align;
    k.c.textBaseline = baseline;

    if (halo) {
        k.c.strokeStyle = 'rgba(255, 255, 255, 0.96)';
        k.c.lineWidth = Math.max(2.5, fs * 0.28);
        k.c.lineJoin = 'round';
        k.c.strokeText(text, x, y);
    }

    k.c.fillStyle = color;
    k.c.fillText(text, x, y);
    k.c.restore();
}

function drawBadge(
    k: Ctx,
    text: string,
    cx: number,
    cy: number,
    options: {
        bgColor?: string;
        textColor?: string;
        borderColor?: string;
        scale?: number;
        maxW?: number;
    } = {}
) {
    const {
        bgColor = '#ffffff',
        textColor = '#0f172a',
        borderColor = '#cbd5e1',
        scale = 0.80,
        maxW,
    } = options;

    let fs = Math.round(k.fs * scale);
    k.c.save();
    k.c.font = `700 ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
    let m = k.c.measureText(text);

    const limitW = maxW ?? (k.r.w * 0.92);
    if (m.width + fs * 1.6 > limitW && limitW > 40) {
        const ratio = (limitW - fs * 1.2) / m.width;
        fs = Math.max(7, Math.floor(fs * ratio));
        k.c.font = `700 ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
        m = k.c.measureText(text);
    }

    const padX = fs * 0.75;
    const padY = fs * 0.30;
    const bw = m.width + padX * 2;
    const bh = fs * 1.35 + padY * 2;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;
    const rad = bh / 2;

    k.c.fillStyle = bgColor;
    k.c.strokeStyle = borderColor;
    k.c.lineWidth = 1.2;
    k.c.beginPath();
    if (typeof k.c.roundRect === 'function') {
        k.c.roundRect(bx, by, bw, bh, rad);
    } else {
        k.c.rect(bx, by, bw, bh);
    }
    k.c.fill();
    k.c.stroke();

    k.c.fillStyle = textColor;
    k.c.textAlign = 'center';
    k.c.textBaseline = 'middle';
    k.c.fillText(text, cx, cy);
    k.c.restore();
}

function getPrimeFactors(n: number): { p: number; exp: number }[] {
    const res: { p: number; exp: number }[] = [];
    let rem = n;
    let d = 2;
    while (d * d <= rem) {
        if (rem % d === 0) {
            let count = 0;
            while (rem % d === 0) {
                count++;
                rem /= d;
            }
            res.push({ p: d, exp: count });
        }
        d = d === 2 ? 3 : d + 2;
    }
    if (rem > 1) {
        res.push({ p: rem, exp: 1 });
    }
    return res;
}

function getAllDivisors(n: number): number[] {
    const divs: number[] = [];
    for (let i = 1; i * i <= n; i++) {
        if (n % i === 0) {
            divs.push(i);
            if (i * i !== n) divs.push(n / i);
        }
    }
    return divs.sort((a, b) => a - b);
}

function gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x;
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. ASAL ÇARPANLAR & POZİTİF BÖLEN SAYISI (prime_factors_sim)
   ───────────────────────────────────────────────────────────────────────────── */

const PRIME_NUM_SAMPLES = [28, 48, 60, 72, 120, 180, 240, 360, 496];

interface PrimeFactorsState {
    num: number; // 12..720
}

const primeFactorsState = (o: MathObject): PrimeFactorsState => ({
    num: clampInt(simValue(o, 'num', 72), 12, 720, 72),
});

export const primeFactorsRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = primeFactorsState(k.o);
    const N = s.num;

    const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const factors = getPrimeFactors(N);
    const divisors = getAllDivisors(N);
    const pbs = factors.reduce((acc, f) => acc * (f.exp + 1), 1);
    const properSum = divisors.reduce((acc, d) => (d !== N ? acc + d : acc), 0);
    const isPerfect = properSum === N;

    if (!icon) {
        // Üst Başlık Rozeti (Sol/Orta)
        drawBadge(k, `Asal Çarpanlar & Bölen Sayısı (N = ${N})`, r.x + r.w * 0.40, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
            maxW: r.w * 0.62,
        });

        // Üst Sağ: Buton Rozeti
        drawBadge(k, '⟳ Sayı Seç', r.x + r.w * 0.85, r.y + fs * 1.2, {
            bgColor: '#eff6ff',
            textColor: '#1d4ed8',
            borderColor: '#bfdbfe',
            scale: 0.76,
            maxW: r.w * 0.24,
        });
    }

    // ── Sol Panel: Asal Çarpan Bölen Algoritması Çizgisi ──
    const lineX = r.x + (icon ? 24 : r.w * 0.16);
    const algoY = r.y + (icon ? 10 : fs * 2.8);

    // Adımları hesapla
    const steps: { val: number; prime: number }[] = [];
    let curVal = N;
    factors.forEach((f) => {
        for (let i = 0; i < f.exp; i++) {
            steps.push({ val: curVal, prime: f.p });
            curVal /= f.p;
        }
    });

    const maxStepsShow = Math.min(steps.length, 6);
    const stepH = Math.min(fs * 1.7, (r.h * 0.52) / (maxStepsShow + 1));

    if (!icon) {
        c.save();
        // Dikey bölme çizgisi
        c.strokeStyle = '#2563eb';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(lineX, algoY);
        c.lineTo(lineX, algoY + (maxStepsShow + 1) * stepH);
        c.stroke();
        c.restore();

        steps.slice(0, maxStepsShow).forEach((st, idx) => {
            const y = algoY + (idx + 0.6) * stepH;
            // Sol: Bölünen sayı
            drawText(k, `${st.val}`, lineX - fs * 0.8, y, { align: 'right', color: '#0f172a', scale: 0.86 });
            // Sağ: Asal bölen
            drawText(k, `${st.prime}`, lineX + fs * 0.8, y, { align: 'left', color: '#2563eb', scale: 0.88 });
        });
        // Son 1
        drawText(k, '1', lineX - fs * 0.8, algoY + (maxStepsShow + 0.6) * stepH, {
            align: 'right',
            color: '#10b981',
            scale: 0.88,
        });
    }

    // ── Sağ Panel: Formül Kartı & Bölenler ──
    const cardX = r.x + (icon ? 6 : r.w * 0.32);
    const cardY = r.y + (icon ? 6 : fs * 2.8);
    const cardW = icon ? r.w - 12 : r.w * 0.64;
    const cardH = icon ? r.h - 12 : r.h * 0.55;

    c.save();
    c.fillStyle = '#ffffff';
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 1.2;
    c.beginPath();
    if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
    else c.rect(cardX, cardY, cardW, cardH);
    c.fill();
    c.stroke();

    if (!icon) {
        const innerMaxW = cardW - fs * 1.5;

        // 1. Asal Üslü Gösterim: N = p1^a * p2^b... (Üst simgelerle temiz)
        const expStr = factors.map((f) => `${f.p}${f.exp > 1 ? toSuperscript(f.exp) : ''}`).join(' · ');
        drawText(k, `Asal Çarpan Açılımı: ${N} = ${expStr}`, cardX + cardW / 2, cardY + fs * 1.2, {
            color: '#1e40af',
            scale: 0.86,
            maxW: innerMaxW,
        });

        // 2. Pozitif Bölen Sayısı (PBS) Formülü
        const pbsFormula = factors.map((f) => `(${f.exp}+1)`).join(' · ');
        drawText(k, `PBS = ${pbsFormula} = ${pbs} adet pozitif bölen`, cardX + cardW / 2, cardY + fs * 2.5, {
            color: '#059669',
            scale: 0.85,
            maxW: innerMaxW,
        });

        // 3. Tam Sayı Bölen Sayısı
        drawText(k, `TBS = 2 · PBS = ${2 * pbs} adet tam sayı bölen (±)`, cardX + cardW / 2, cardY + fs * 3.7, {
            color: '#64748b',
            scale: 0.78,
            maxW: innerMaxW,
        });

        // 4. Pozitif Bölenler Listesi (Taşmayacak şekilde ilk 9-10 tanesi)
        const showCount = cardW < 300 ? 6 : 10;
        const divListStr = divisors.slice(0, showCount).join(', ') + (divisors.length > showCount ? ', ...' : '');
        drawText(k, `Bölenler: { ${divListStr} }`, cardX + cardW / 2, cardY + fs * 4.9, {
            color: '#334155',
            scale: 0.75,
            maxW: innerMaxW,
        });
    }
    c.restore();

    if (!icon) {
        // Alt Bilgi Rozeti (Oto-ölçeklenen, asla taşmayan)
        const perfectText = isPerfect
            ? `✦ İbni Fellûs: ${N} Mükemmel Sayıdır! (Bölenler toplamı = ${properSum})`
            : `✦ İbni Fellûs: Kendisi hariç bölenler toplamı = ${properSum} (${properSum > N ? 'Zengin Sayı' : 'Eksik Sayı'})`;

        drawBadge(k, perfectText, r.x + r.w / 2, r.y + r.h - fs * 1.1, {
            bgColor: isPerfect ? '#fef3c7' : '#ede9fe',
            textColor: isPerfect ? '#92400e' : '#5b21b6',
            borderColor: isPerfect ? '#fde68a' : '#c4b5fd',
            scale: 0.78,
            maxW: r.w * 0.94,
        });
    }

    c.restore();
};

export const primeFactorsSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = primeFactorsState(o);
        const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));

        return [
            {
                id: 'nextNum',
                x: r.x + r.w * 0.85,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Sayıyı Değiştir',
                on: s.num === 28 || s.num === 72,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'nextNum') {
            const cur = primeFactorsState(o).num;
            const nextIdx = (PRIME_NUM_SAMPLES.indexOf(cur) + 1) % PRIME_NUM_SAMPLES.length;
            return { num: PRIME_NUM_SAMPLES[nextIdx] };
        }
        return {};
    },
    params: [
        { key: 'num', label: 'Doğal Sayı (N)', min: 12, max: 720, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   2. GEOMETRİK EBOB-EKOK & ÖKLİD KARO DÖŞEME (ebob_ekok_tiling_sim)
   ───────────────────────────────────────────────────────────────────────────── */

const EBOB_SAMPLES = [
    { a: 36, b: 24 },
    { a: 48, b: 18 },
    { a: 40, b: 25 },
    { a: 60, b: 45 },
    { a: 28, b: 21 },
    { a: 15, b: 8 },
];

interface EbobEkokState {
    numA: number; // 12..60
    numB: number; // 8..48
}

const ebobEkokState = (o: MathObject): EbobEkokState => ({
    numA: clampInt(simValue(o, 'numA', 36), 12, 60, 36),
    numB: clampInt(simValue(o, 'numB', 24), 8, 48, 24),
});

export const ebobEkokRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = ebobEkokState(k.o);
    const A = s.numA;
    const B = s.numB;

    const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const g = gcd(A, B);
    const l = (A * B) / g;
    const tilesX = A / g;
    const tilesY = B / g;
    const totalTiles = tilesX * tilesY;
    const areCoprime = g === 1;

    if (!icon) {
        // Üst Başlık Rozeti (Sol/Orta)
        drawBadge(k, `EBOB(${A}, ${B}) = ${g}  ·  EKOK(${A}, ${B}) = ${l}`, r.x + r.w * 0.40, r.y + fs * 1.2, {
            bgColor: '#eff6ff',
            textColor: '#1d4ed8',
            borderColor: '#bfdbfe',
            scale: 0.82,
            maxW: r.w * 0.62,
        });

        // Üst Sağ: Buton Rozeti
        drawBadge(k, '⟳ Örnek Seç', r.x + r.w * 0.85, r.y + fs * 1.2, {
            bgColor: '#f0fdf4',
            textColor: '#15803d',
            borderColor: '#bbf7d0',
            scale: 0.76,
            maxW: r.w * 0.24,
        });
    }

    // ── Geometrik Zemin (Dikdörtgen Fayans Döşeme Alanı) ──
    const roomAreaW = icon ? r.w - 12 : r.w * 0.44;
    const roomAreaH = icon ? r.h - 12 : r.h * 0.50;
    const roomX = r.x + (icon ? 6 : r.w * 0.06);
    const roomY = r.y + (icon ? 6 : fs * 3.0);

    // Orantılı çizim
    const scaleFactor = Math.min(roomAreaW / A, roomAreaH / B);
    const drawW = A * scaleFactor;
    const drawH = B * scaleFactor;
    const startX = roomX + (roomAreaW - drawW) / 2;
    const startY = roomY + (roomAreaH - drawH) / 2;

    c.save();
    // Zemin çerçevesi
    c.fillStyle = '#f8fafc';
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1.8;
    c.fillRect(startX, startY, drawW, drawH);
    c.strokeRect(startX, startY, drawW, drawH);

    // EBOB Kare Fayans Izgarası
    const tilePx = g * scaleFactor;
    c.strokeStyle = '#3b82f6';
    c.lineWidth = 1;

    for (let ix = 0; ix < tilesX; ix++) {
        for (let iy = 0; iy < tilesY; iy++) {
            const tx = startX + ix * tilePx;
            const ty = startY + iy * tilePx;
            c.fillStyle = (ix + iy) % 2 === 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.24)';
            c.fillRect(tx, ty, tilePx, tilePx);
            c.strokeRect(tx, ty, tilePx, tilePx);
        }
    }
    c.restore();

    if (!icon) {
        // Zemin Boyut Etiketleri
        drawText(k, `A = ${A} br`, startX + drawW / 2, startY - fs * 0.8, { color: '#0f172a', scale: 0.82 });
        drawText(k, `B = ${B} br`, startX - fs * 1.0, startY + drawH / 2, { align: 'right', color: '#0f172a', scale: 0.82 });

        // Fayans Bilgisi
        drawText(k, `Karo: ${g}×${g} br`, startX + drawW / 2, startY + drawH + fs * 0.9, { color: '#2563eb', scale: 0.80 });

        // ── Sağ Panel: Formül ve Kanıt Kartı ──
        const cardX = r.x + r.w * 0.54;
        const cardY = r.y + fs * 2.8;
        const cardW = r.w * 0.42;
        const cardH = r.h * 0.55;

        c.save();
        c.fillStyle = '#ffffff';
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1.2;
        c.beginPath();
        if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
        else c.rect(cardX, cardY, cardW, cardH);
        c.fill();
        c.stroke();

        const innerMaxW = cardW - fs * 1.2;

        // 1. Fayans hesabı
        drawText(k, 'ÖKLİD ALGORİTMASI & EBOB', cardX + cardW / 2, cardY + fs * 1.1, { color: '#0f172a', scale: 0.76, maxW: innerMaxW });
        drawText(k, `Eş Kare Karo: ${g} × ${g}`, cardX + cardW / 2, cardY + fs * 2.2, { color: '#2563eb', scale: 0.82, maxW: innerMaxW });
        drawText(k, `En Az Karo: ${tilesX} · ${tilesY} = ${totalTiles} adet`, cardX + cardW / 2, cardY + fs * 3.3, {
            color: '#059669',
            scale: 0.82,
            maxW: innerMaxW,
        });

        // 2. a * b = EBOB * EKOK bağıntısı
        c.strokeStyle = '#e2e8f0';
        c.beginPath();
        c.moveTo(cardX + fs * 0.8, cardY + fs * 4.1);
        c.lineTo(cardX + cardW - fs * 0.8, cardY + fs * 4.1);
        c.stroke();

        drawText(k, 'Temel EBOB-EKOK Bağıntısı:', cardX + cardW / 2, cardY + fs * 4.9, { color: '#475569', scale: 0.74, maxW: innerMaxW });
        drawText(k, `A · B = EBOB · EKOK`, cardX + cardW / 2, cardY + fs * 5.9, { color: '#9333ea', scale: 0.84, maxW: innerMaxW });
        drawText(k, `${A} · ${B} = ${g} · ${l} = ${A * B} ✓`, cardX + cardW / 2, cardY + fs * 6.9, { color: '#0f172a', scale: 0.80, maxW: innerMaxW });
        c.restore();

        // Alt Bilgi Rozeti
        const bottomMsg = areCoprime
            ? `✦ ${A} ve ${B} Aralarında Asal! (EBOB = 1, EKOK = ${A * B})`
            : `✦ Geometrik Kural: Dikdörtgenin alanı (${A * B}), ${totalTiles} adet (${g}×${g}) karonun alanına eşittir.`;

        drawBadge(k, bottomMsg, r.x + r.w / 2, r.y + r.h - fs * 1.1, {
            bgColor: areCoprime ? '#fef3c7' : '#f1f5f9',
            textColor: areCoprime ? '#92400e' : '#334155',
            borderColor: areCoprime ? '#fde68a' : '#cbd5e1',
            scale: 0.76,
            maxW: r.w * 0.94,
        });
    }

    c.restore();
};

export const ebobEkokSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
        return [
            {
                id: 'nextSample',
                x: r.x + r.w * 0.85,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Örnek Boyutları Değiştir',
                on: false,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'nextSample') {
            const s = ebobEkokState(o);
            const curIdx = EBOB_SAMPLES.findIndex((p) => p.a === s.numA && p.b === s.numB);
            const nextIdx = (curIdx + 1) % EBOB_SAMPLES.length;
            return { numA: EBOB_SAMPLES[nextIdx].a, numB: EBOB_SAMPLES[nextIdx].b };
        }
        return {};
    },
    params: [
        { key: 'numA', label: 'Kenar A (Genişlik)', min: 12, max: 60, step: 2 },
        { key: 'numB', label: 'Kenar B (Yükseklik)', min: 8, max: 48, step: 2 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. DİŞLİ ÇARKLAR & PERİYODİK EKOK SİMÜLATÖRÜ (periodic_ekok_sim)
   ───────────────────────────────────────────────────────────────────────────── */

const GEAR_SAMPLES = [
    { a: 12, b: 18 },
    { a: 8, b: 12 },
    { a: 10, b: 15 },
    { a: 16, b: 24 },
    { a: 14, b: 21 },
];

interface PeriodicEkokState {
    teethA: number; // 6..24
    teethB: number; // 6..24
    running: number; // 0..1
}

const periodicEkokState = (o: MathObject): PeriodicEkokState => ({
    teethA: clampInt(simValue(o, 'teethA', 12), 6, 24, 12),
    teethB: clampInt(simValue(o, 'teethB', 18), 6, 24, 18),
    running: clampInt(simValue(o, 'running', 1), 0, 1, 1),
});

export const periodicEkokRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = periodicEkokState(k.o);
    const TA = s.teethA;
    const TB = s.teethB;

    const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const g = gcd(TA, TB);
    const l = (TA * TB) / g;
    const lapsA = l / TA;
    const lapsB = l / TB;

    if (!icon) {
        // Üst Başlık Rozeti (Sol)
        drawBadge(k, `Dişli Çarklar & Periyodik EKOK`, r.x + r.w * 0.35, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
            maxW: r.w * 0.50,
        });

        // Üst Sağ Buton 1: Başlat / Durdur
        drawBadge(k, s.running ? '⏸ Durdur' : '▶ Başlat', r.x + r.w * 0.74, r.y + fs * 1.2, {
            bgColor: s.running ? '#fef2f2' : '#f0fdf4',
            textColor: s.running ? '#b91c1c' : '#15803d',
            borderColor: s.running ? '#fecaca' : '#bbf7d0',
            scale: 0.74,
            maxW: r.w * 0.22,
        });

        // Üst Sağ Buton 2: Örnek Seç
        drawBadge(k, '⟳ Örnek', r.x + r.w * 0.90, r.y + fs * 1.2, {
            bgColor: '#eff6ff',
            textColor: '#1d4ed8',
            borderColor: '#bfdbfe',
            scale: 0.74,
            maxW: r.w * 0.16,
        });
    }

    // ── Çark Geometrisi (Ferah ve orantılı) ──
    const totalTeeth = TA + TB;
    const maxGearAreaW = r.w * 0.48;
    const maxGearAreaH = r.h * 0.52;
    const targetSpan = Math.min(maxGearAreaW, maxGearAreaH * 1.6);

    const rA = Math.max(26, (TA / totalTeeth) * targetSpan * 0.85);
    const rB = Math.max(26, (TB / totalTeeth) * targetSpan * 0.85);

    const cxA = r.x + r.w * 0.07 + rA;
    const cxB = cxA + rA + rB;
    const cy = r.y + fs * 2.8 + (r.h * 0.54) / 2;

    // Dönme açısı (k.t ile dinamik)
    const speed = s.running ? (k.t || 0) * 0.0016 : 0;
    const angA = speed;
    const angB = -speed * (TA / TB); // Karşı dişli ters döner

    // Dişli çizici
    const drawGear = (cx: number, cy: number, radius: number, teeth: number, angle: number, color: string, name: string) => {
        c.save();
        c.translate(cx, cy);
        c.rotate(angle);

        c.fillStyle = withAlpha(color, 0.16);
        c.strokeStyle = color;
        c.lineWidth = 1.8;

        c.beginPath();
        for (let i = 0; i < teeth; i++) {
            const a0 = (i * 2 * Math.PI) / teeth;
            const a1 = ((i + 0.35) * 2 * Math.PI) / teeth;
            const a2 = ((i + 0.65) * 2 * Math.PI) / teeth;
            const a3 = ((i + 1.0) * 2 * Math.PI) / teeth;

            const rInner = radius - 5;
            const rOuter = radius + 5;

            if (i === 0) c.moveTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
            c.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
            c.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
            c.lineTo(Math.cos(a3) * rInner, Math.sin(a3) * rInner);
        }
        c.closePath();
        c.fill();
        c.stroke();

        // İç göbek çemberi
        c.beginPath();
        c.arc(0, 0, Math.max(10, radius * 0.34), 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.fill();
        c.stroke();

        // Başlangıç temas noktası belirteci (kırmızı işaret)
        c.beginPath();
        c.arc(radius, 0, 4.0, 0, Math.PI * 2);
        c.fillStyle = '#ef4444';
        c.fill();
        c.stroke();

        c.restore();

        // Göbekte kısa harf, üstte/altta başlık ve diş sayısı (ASLA ÇAKIŞMAZ)
        drawText(k, name.slice(-1), cx, cy, { color: color, scale: 0.9, bold: true });
        drawText(k, name, cx, cy - radius - fs * 0.9, { color: color, scale: 0.80 });
        drawText(k, `${teeth} Diş`, cx, cy + radius + fs * 0.9, { color: '#334155', scale: 0.76 });
    };

    drawGear(cxA, cy, rA, TA, angA, '#2563eb', 'Çark A');
    drawGear(cxB, cy, rB, TB, angB, '#d97706', 'Çark B');

    if (!icon) {
        // Sağ Bilgi Kartı
        const cardX = r.x + r.w * 0.60;
        const cardY = r.y + fs * 2.8;
        const cardW = r.w * 0.36;
        const cardH = r.h * 0.55;

        c.save();
        c.fillStyle = '#ffffff';
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1.2;
        c.beginPath();
        if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
        else c.rect(cardX, cardY, cardW, cardH);
        c.fill();
        c.stroke();

        const innerMaxW = cardW - fs * 1.2;

        drawText(k, 'PERİYODİK BULUŞMA', cardX + cardW / 2, cardY + fs * 1.1, { color: '#0f172a', scale: 0.76, maxW: innerMaxW });
        drawText(k, `EKOK(${TA}, ${TB}) = ${l} Diş`, cardX + cardW / 2, cardY + fs * 2.3, { color: '#9333ea', scale: 0.86, maxW: innerMaxW });

        c.strokeStyle = '#e2e8f0';
        c.beginPath();
        c.moveTo(cardX + fs * 0.6, cardY + fs * 3.3);
        c.lineTo(cardX + cardW - fs * 0.6, cardY + fs * 3.3);
        c.stroke();

        drawText(k, 'İlk Buluşma Tur Sayıları:', cardX + cardW / 2, cardY + fs * 4.2, { color: '#64748b', scale: 0.74, maxW: innerMaxW });
        drawText(k, `Çark A: ${l} / ${TA} = ${lapsA} Tur`, cardX + cardW / 2, cardY + fs * 5.3, { color: '#2563eb', scale: 0.82, maxW: innerMaxW });
        drawText(k, `Çark B: ${l} / ${TB} = ${lapsB} Tur`, cardX + cardW / 2, cardY + fs * 6.4, { color: '#d97706', scale: 0.82, maxW: innerMaxW });
        c.restore();

        // Alt Maarif Bağlantı Rozeti
        drawBadge(
            k,
            `💡 Periyodik EKOK: İki çark ${l} diş geçişinde (A: ${lapsA} tur, B: ${lapsB} tur) ilk temas noktasına döner.`,
            r.x + r.w / 2,
            r.y + r.h - fs * 1.1,
            { bgColor: '#f0fdf4', textColor: '#166534', borderColor: '#bbf7d0', scale: 0.76, maxW: r.w * 0.94 }
        );
    }

    c.restore();
};

export const periodicEkokSpec: SimSpec = {
    animated: (o: MathObject) => simValue(o, 'running', 1) === 1,
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = periodicEkokState(o);
        const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
        return [
            {
                id: 'toggleRun',
                x: r.x + r.w * 0.74,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Döndür / Durdur',
                on: s.running === 1,
            },
            {
                id: 'nextGears',
                x: r.x + r.w * 0.90,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Örnek Dişlileri Değiştir',
                on: false,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'toggleRun') {
            const cur = periodicEkokState(o).running;
            return { running: cur === 1 ? 0 : 1 };
        }
        if (id === 'nextGears') {
            const s = periodicEkokState(o);
            const curIdx = GEAR_SAMPLES.findIndex((p) => p.a === s.teethA && p.b === s.teethB);
            const nextIdx = (curIdx + 1) % GEAR_SAMPLES.length;
            return { teethA: GEAR_SAMPLES[nextIdx].a, teethB: GEAR_SAMPLES[nextIdx].b };
        }
        return {};
    },
    params: [
        { key: 'teethA', label: 'Çark A Diş Sayısı', min: 6, max: 24, step: 2 },
        { key: 'teethB', label: 'Çark B Diş Sayısı', min: 6, max: 24, step: 2 },
        { key: 'running', label: 'Animasyon (1:Açık, 0:Kapalı)', min: 0, max: 1, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   4. BASAMAK ÇÖZÜMLEME İLE BÖLÜNEBİLME İSPATLARI (divisibility_proof_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface DivisibilityState {
    num: number; // 100..9999
    rule: number; // 0:2, 1:3, 2:4, 3:5, 4:8, 5:9, 6:10
}

const divisibilityState = (o: MathObject): DivisibilityState => ({
    num: clampInt(simValue(o, 'num', 2478), 100, 9999, 2478),
    rule: clampInt(simValue(o, 'rule', 2), 0, 6, 2),
});

const RULES_DATA = [
    { div: 2, name: '2 ile Bölünebilme', focus: 'Son 1 Basamak', reason: '10 = 2 · 5 (Onlar basamağı tam bölünür)' },
    { div: 3, name: '3 ile Bölünebilme', focus: 'Rakamlar Toplamı', reason: '10^k = 99...9 + 1 (9k kısmı 3’e tam bölünür)' },
    { div: 4, name: '4 ile Bölünebilme', focus: 'Son 2 Basamak', reason: '100 = 4 · 25 (Yüzler basamağı tam bölünür)' },
    { div: 5, name: '5 ile Bölünebilme', focus: 'Son 1 Basamak', reason: '10 = 5 · 2 (Onlar basamağı tam bölünür)' },
    { div: 8, name: '8 ile Bölünebilme', focus: 'Son 3 Basamak', reason: '1000 = 8 · 125 (Binler basamağı tam bölünür)' },
    { div: 9, name: '9 ile Bölünebilme', focus: 'Rakamlar Toplamı', reason: '10^k = 99...9 + 1 (9k kısmı 9’a tam bölünür)' },
    { div: 10, name: '10 ile Bölünebilme', focus: 'Birler Basamağı', reason: '10 = 10 · 1 (Tüm onlar basamakları tam bölünür)' },
];

export const divisibilityRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = divisibilityState(k.o);
    const N = s.num;
    const rData = RULES_DATA[s.rule] || RULES_DATA[2];

    const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const rem = N % rData.div;
    const digits = String(N).split('').map(Number);
    const digitsSum = digits.reduce((a, b) => a + b, 0);

    if (!icon) {
        // Üst Başlık Rozeti (Sol/Orta)
        drawBadge(k, `${rData.name} & Kalan (N = ${N})`, r.x + r.w * 0.40, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
            maxW: r.w * 0.62,
        });

        // Üst Sağ Buton: Kural Seç
        drawBadge(k, '⟳ Kural Seç', r.x + r.w * 0.85, r.y + fs * 1.2, {
            bgColor: '#eff6ff',
            textColor: '#1d4ed8',
            borderColor: '#bfdbfe',
            scale: 0.76,
            maxW: r.w * 0.24,
        });
    }

    // ── Basamak Çözümleme Kartı ──
    const cardX = r.x + (icon ? 6 : r.w * 0.06);
    const cardY = r.y + (icon ? 6 : fs * 2.8);
    const cardW = icon ? r.w - 12 : r.w * 0.88;
    const cardH = icon ? r.h - 12 : r.h * 0.55;

    c.save();
    c.fillStyle = '#ffffff';
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 1.2;
    c.beginPath();
    if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
    else c.rect(cardX, cardY, cardW, cardH);
    c.fill();
    c.stroke();

    if (!icon) {
        const innerMaxW = cardW - fs * 1.5;

        // Basamak Kutucukları (Kutunun üstünde basamak adı)
        const boxSize = Math.min(fs * 2.1, 38);
        const gap = 10;
        const totalBoxesW = digits.length * boxSize + (digits.length - 1) * gap;
        const boxStartX = cardX + (cardW - totalBoxesW) / 2;
        const boxY = cardY + fs * 1.4;

        const placeNames = ['Birler', 'Onlar', 'Yüzler', 'Binler'];

        digits.forEach((d, i) => {
            const bx = boxStartX + i * (boxSize + gap);
            // Kritik basamakları belirle
            let isKey = false;
            if (rData.div === 2 || rData.div === 5 || rData.div === 10) isKey = i === digits.length - 1;
            else if (rData.div === 4) isKey = i >= digits.length - 2;
            else if (rData.div === 8) isKey = i >= digits.length - 3;
            else isKey = true; // 3 ve 9 için hepsi

            // Basamak basamak adı etiketi
            const placeIdx = digits.length - 1 - i;
            drawText(k, placeNames[placeIdx] || `${Math.pow(10, placeIdx)}`, bx + boxSize / 2, boxY - fs * 0.6, {
                color: isKey ? '#2563eb' : '#94a3b8',
                scale: 0.68,
                bold: isKey,
            });

            c.fillStyle = isKey ? '#eff6ff' : '#f8fafc';
            c.strokeStyle = isKey ? '#2563eb' : '#cbd5e1';
            c.lineWidth = isKey ? 2 : 1;
            c.beginPath();
            if (typeof c.roundRect === 'function') c.roundRect(bx, boxY, boxSize, boxSize, 6);
            else c.rect(bx, boxY, boxSize, boxSize);
            c.fill();
            c.stroke();

            drawText(k, String(d), bx + boxSize / 2, boxY + boxSize / 2, {
                color: isKey ? '#1d4ed8' : '#64748b',
                scale: 1.05,
                halo: false,
            });
        });

        // Cebirsel Açıklama
        drawText(k, `Cebirsel İspat: ${rData.reason}`, cardX + cardW / 2, cardY + fs * 4.3, {
            color: '#1e40af',
            scale: 0.82,
            maxW: innerMaxW,
        });

        // Kalan Hesabı
        let calcStr = '';
        if (rData.div === 3 || rData.div === 9) {
            calcStr = `Rakamlar Toplamı = ${digits.join('+')} = ${digitsSum} ⇒ ${digitsSum} ≡ ${rem} (mod ${rData.div})`;
        } else if (rData.div === 4) {
            const last2 = N % 100;
            calcStr = `Son İki Basamak = ${last2} ⇒ ${last2} = 4 · ${Math.floor(last2 / 4)} + ${rem}`;
        } else if (rData.div === 8) {
            const last3 = N % 1000;
            calcStr = `Son Üç Basamak = ${last3} ⇒ ${last3} = 8 · ${Math.floor(last3 / 8)} + ${rem}`;
        } else {
            const last1 = N % 10;
            calcStr = `Birler Basamağı = ${last1} ⇒ Kalan = ${rem}`;
        }

        drawText(k, calcStr, cardX + cardW / 2, cardY + fs * 5.6, { color: '#059669', scale: 0.84, maxW: innerMaxW });

        // Sonuç Rozeti
        const resultText = rem === 0 ? `✓ ${N}, ${rData.div} ile KALANSIZ bölünür!` : `✦ ${N}'nin ${rData.div} ile bölümünden KALAN = ${rem}`;

        drawBadge(k, resultText, cardX + cardW / 2, cardY + fs * 7.0, {
            bgColor: rem === 0 ? '#dcfce7' : '#fee2e2',
            textColor: rem === 0 ? '#166534' : '#991b1b',
            borderColor: rem === 0 ? '#86efac' : '#fca5a5',
            scale: 0.80,
            maxW: innerMaxW,
        });
    }
    c.restore();

    if (!icon) {
        // Alt Maarif Miras Notu (Oto-ölçeklenen, asla taşmayan)
        drawBadge(
            k,
            '📜 Mehmed Nâdir (Hesâb-ı Nazarî): Bölünebilme kuralları basamak çözümleme teoremine dayanır.',
            r.x + r.w / 2,
            r.y + r.h - fs * 1.1,
            { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', scale: 0.75, maxW: r.w * 0.94 }
        );
    }

    c.restore();
};

export const divisibilitySpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = divisibilityState(o);
        const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
        return [
            {
                id: 'nextRule',
                x: r.x + r.w * 0.85,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Bölünebilme Kuralını Değiştir',
                on: s.rule > 0,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'nextRule') {
            const cur = divisibilityState(o).rule;
            return { rule: (cur + 1) % RULES_DATA.length };
        }
        return {};
    },
    params: [
        { key: 'num', label: 'Doğal Sayı (N)', min: 100, max: 9999, step: 1 },
        { key: 'rule', label: 'Kural (0:2, 1:3, 2:4, 3:5, 4:8, 5:9, 6:10)', min: 0, max: 6, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   5. BİLEŞİK BÖLÜNEBİLME & KALANLAR BULMACASI (compound_remainder_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface CompoundState {
    choice: number; // 0: 12 (3·4), 1: 15 (3·5), 2: 30 (3·10), 3: 45 (5·9)
    rem: number; // Kalan
}

const compoundState = (o: MathObject): CompoundState => ({
    choice: clampInt(simValue(o, 'choice', 0), 0, 3, 0),
    rem: clampInt(simValue(o, 'rem', 11), 0, 44, 11),
});

const COMPOUNDS = [
    { mod: 12, f1: 3, f2: 4, name: '12 ile Bölünme (3 · 4)' },
    { mod: 15, f1: 3, f2: 5, name: '15 ile Bölünme (3 · 5)' },
    { mod: 30, f1: 3, f2: 10, name: '30 ile Bölünme (3 · 10)' },
    { mod: 45, f1: 5, f2: 9, name: '45 ile Bölünme (5 · 9)' },
];

export const compoundRemainderRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = compoundState(k.o);
    const data = COMPOUNDS[s.choice] || COMPOUNDS[0];
    const rem = Math.min(s.rem, data.mod - 1);

    const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Çarpanlara göre kalanlar
    const rem1 = rem % data.f1;
    const rem2 = rem % data.f2;

    if (!icon) {
        // Üst Başlık Rozeti (Sol/Orta)
        drawBadge(k, `Bileşik Kalan Teoremi: ${data.name}`, r.x + r.w * 0.40, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
            maxW: r.w * 0.62,
        });

        // Üst Sağ Buton: Bölen Seç
        drawBadge(k, '⟳ Bölen Seç', r.x + r.w * 0.85, r.y + fs * 1.2, {
            bgColor: '#eff6ff',
            textColor: '#1d4ed8',
            borderColor: '#bfdbfe',
            scale: 0.76,
            maxW: r.w * 0.24,
        });
    }

    // ── Ana Gövde Kartı ──
    const cardX = r.x + (icon ? 6 : r.w * 0.06);
    const cardY = r.y + (icon ? 6 : fs * 2.8);
    const cardW = icon ? r.w - 12 : r.w * 0.88;
    const cardH = icon ? r.h - 12 : r.h * 0.55;

    c.save();
    c.fillStyle = '#ffffff';
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 1.2;
    c.beginPath();
    if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
    else c.rect(cardX, cardY, cardW, cardH);
    c.fill();
    c.stroke();

    if (!icon) {
        const innerMaxW = cardW - fs * 1.5;

        // Teorem İfadesi
        drawText(k, `Sayı Modeli: X = ${data.mod} · k + ${rem}`, cardX + cardW / 2, cardY + fs * 1.2, {
            color: '#1e40af',
            scale: 0.90,
            bold: true,
            maxW: innerMaxW,
        });

        // Ayrıştırma Adımları
        const q1 = Math.floor(rem / data.f1);
        const q2 = Math.floor(rem / data.f2);

        drawText(
            k,
            `1) ${data.f1} ile Kalan: ${rem} = ${data.f1} · ${q1} + ${rem1}  ⇒  Kalan = ${rem1}`,
            cardX + cardW / 2,
            cardY + fs * 2.5,
            { color: '#2563eb', scale: 0.84, maxW: innerMaxW }
        );

        drawText(
            k,
            `2) ${data.f2} ile Kalan: ${rem} = ${data.f2} · ${q2} + ${rem2}  ⇒  Kalan = ${rem2}`,
            cardX + cardW / 2,
            cardY + fs * 3.7,
            { color: '#d97706', scale: 0.84, maxW: innerMaxW }
        );

        // Örnek Değerler
        const ex1 = rem;
        const ex2 = data.mod + rem;
        const ex3 = data.mod * 2 + rem;

        drawText(k, `Örnek X Sayıları: { ${ex1}, ${ex2}, ${ex3}, ... } (Hepsi bu kalanları sağlar)`, cardX + cardW / 2, cardY + fs * 4.9, {
            color: '#059669',
            scale: 0.80,
            maxW: innerMaxW,
        });

        // Rozet
        drawBadge(
            k,
            `✦ Çarpanlar Aralarında Asal: EBOB(${data.f1}, ${data.f2}) = 1`,
            cardX + cardW / 2,
            cardY + fs * 6.3,
            { bgColor: '#fef3c7', textColor: '#92400e', borderColor: '#fde68a', scale: 0.78, maxW: innerMaxW }
        );
    }
    c.restore();

    if (!icon) {
        // Alt Maarif Modeli Açıklaması (Oto-ölçeklenen rozet)
        drawBadge(
            k,
            `💡 İlke: X mod ${data.mod} = ${rem} ise; ${data.f1} ile kalan ${rem1}, ${data.f2} ile kalan ${rem2}'dir.`,
            r.x + r.w / 2,
            r.y + r.h - fs * 1.1,
            { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', scale: 0.75, maxW: r.w * 0.94 }
        );
    }

    c.restore();
};

export const compoundRemainderSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = compoundState(o);
        const fs = Math.max(9, Math.min(15, Math.min(r.w, r.h) / 18));
        return [
            {
                id: 'nextCompound',
                x: r.x + r.w * 0.85,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Bileşik Sayıyı Değiştir (12, 15, 30, 45)',
                on: s.choice > 0,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'nextCompound') {
            const cur = compoundState(o).choice;
            return { choice: (cur + 1) % COMPOUNDS.length };
        }
        return {};
    },
    params: [
        { key: 'choice', label: 'Bileşik Sayı (0:12, 1:15, 2:30, 3:45)', min: 0, max: 3, step: 1 },
        { key: 'rem', label: 'Kalan Değeri (c)', min: 0, max: 44, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   KATALOG LİSTESİ VE KAYIT
   ───────────────────────────────────────────────────────────────────────────── */

export const GRADE10_NUMBERS_RENDERERS: Record<string, Renderer> = {
    prime_factors_sim: primeFactorsRender,
    ebob_ekok_tiling_sim: ebobEkokRender,
    periodic_ekok_sim: periodicEkokRender,
    divisibility_proof_sim: divisibilityRender,
    compound_remainder_sim: compoundRemainderRender,
};

export const GRADE10_NUMBERS_SPECS: Record<string, SimSpec> = {
    prime_factors_sim: primeFactorsSpec,
    ebob_ekok_tiling_sim: ebobEkokSpec,
    periodic_ekok_sim: periodicEkokSpec,
    divisibility_proof_sim: divisibilitySpec,
    compound_remainder_sim: compoundRemainderSpec,
};

export const GRADE10_NUMBERS_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'prime_factors_sim',
        label: 'Asal Çarpanlar & Bölen Sayısı (PBS)',
        hint: 'Asal çarpan algoritması, (a+1)(b+1) PBS formülü ve İbni Fellûs mükemmel sayı testi',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { num: 72 } },
    },
    {
        kind: 'ebob_ekok_tiling_sim',
        label: 'Geometrik EBOB-EKOK & Karo Döşeme',
        hint: 'Öklid algoritması ile kare fayans döşeme ve a·b = EBOB·EKOK geometrik kanıtı',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { numA: 36, numB: 24 } },
    },
    {
        kind: 'periodic_ekok_sim',
        label: 'Dişli Çarklar & Periyodik EKOK',
        hint: 'İki çarkın ilk kez ne zaman ve kaç turda buluştuğunu gösteren EKOK modeli',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { teethA: 12, teethB: 18, running: 1 } },
    },
    {
        kind: 'divisibility_proof_sim',
        label: 'Basamak Çözümleme ile Bölünebilme',
        hint: '2, 3, 4, 5, 8, 9, 10 kurallarının cebirsel ispatı ve bölme yapmadan kalan bulma (Mehmed Nâdir)',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { num: 2478, rule: 2 } },
    },
    {
        kind: 'compound_remainder_sim',
        label: 'Bileşik Kalan Teoremi (12, 15, 30, 45)',
        hint: 'Aralarında asal çarpanlara göre kalan bulma bağıntısı ve muhakemesi',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { choice: 0, rem: 11 } },
    },
];
