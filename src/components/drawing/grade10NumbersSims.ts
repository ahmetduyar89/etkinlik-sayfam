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
   GÖRSEL YARDIMCILAR
   ───────────────────────────────────────────────────────────────────────────── */

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
    } = {}
) {
    const {
        align = 'center',
        baseline = 'middle',
        scale = 1,
        color = '#0f172a',
        halo = true,
        bold = true,
    } = options;

    const fs = Math.round(k.fs * scale);
    k.c.save();
    k.c.font = `${bold ? '700' : '600'} ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
    k.c.textAlign = align;
    k.c.textBaseline = baseline;

    if (halo) {
        k.c.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        k.c.lineWidth = Math.max(3, fs * 0.28);
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
    } = {}
) {
    const {
        bgColor = '#ffffff',
        textColor = '#0f172a',
        borderColor = '#cbd5e1',
        scale = 0.80,
    } = options;

    const fs = Math.round(k.fs * scale);
    k.c.save();
    k.c.font = `700 ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
    const m = k.c.measureText(text);
    const padX = fs * 0.85;
    const padY = fs * 0.35;
    const bw = m.width + padX * 2;
    const bh = fs * 1.4 + padY * 2;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;
    const rad = bh / 2;

    k.c.fillStyle = bgColor;
    k.c.strokeStyle = borderColor;
    k.c.lineWidth = 1.3;
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

// Asal çarpanlara ayırma yardımcı fonksiyonu
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

    const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
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
        // Üst Başlık Rozeti
        drawBadge(k, `Asal Çarpanlar ve Bölen Sayısı (N = ${N})`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
        });
    }

    // ── Sol Panel: Asal Çarpan Bölen Algoritması Çizgisi ──
    const algoX = r.x + (icon ? 12 : r.w * 0.12);
    const algoY = r.y + (icon ? 10 : fs * 2.8);
    const lineX = algoX + fs * 3.5;

    // Adımları hesapla
    const steps: { val: number; prime: number }[] = [];
    let curVal = N;
    factors.forEach((f) => {
        for (let i = 0; i < f.exp; i++) {
            steps.push({ val: curVal, prime: f.p });
            curVal /= f.p;
        }
    });

    const maxStepsShow = Math.min(steps.length, 7);
    const stepH = Math.min(fs * 1.6, (r.h * 0.55) / (maxStepsShow + 1));

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
            drawText(k, `${st.val}`, lineX - fs * 0.8, y, { align: 'right', color: '#0f172a', scale: 0.85 });
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
    const cardX = r.x + (icon ? 6 : r.w * 0.38);
    const cardY = r.y + (icon ? 6 : fs * 2.8);
    const cardW = icon ? r.w - 12 : r.w * 0.58;
    const cardH = icon ? r.h - 12 : r.h * 0.54;

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
        // 1. Asal Üslü Gösterim: N = p1^a * p2^b...
        const expStr = factors.map((f) => `${f.p}${f.exp > 1 ? `^${f.exp}` : ''}`).join(' · ');
        drawText(k, `Asal Çarpan Açılımı: ${N} = ${expStr}`, cardX + cardW / 2, cardY + fs * 1.2, {
            color: '#1e40af',
            scale: 0.85,
        });

        // 2. Pozitif Bölen Sayısı (PBS) Formülü
        const pbsFormula = factors.map((f) => `(${f.exp}+1)`).join(' · ');
        const pbsValues = factors.map((f) => `${f.exp + 1}`).join(' · ');
        drawText(k, `PBS = ${pbsFormula} = ${pbsValues} = ${pbs} adet`, cardX + cardW / 2, cardY + fs * 2.6, {
            color: '#059669',
            scale: 0.85,
        });

        // 3. Tam Sayı Bölen Sayısı
        drawText(k, `Tam Sayı Bölenleri (TBS) = 2 · PBS = ${2 * pbs} adet (Negatifler dahil)`, cardX + cardW / 2, cardY + fs * 3.8, {
            color: '#64748b',
            scale: 0.74,
        });

        // 4. Pozitif Bölenler Listesi (İlk 14 tanesi)
        const divListStr = divisors.slice(0, 14).join(', ') + (divisors.length > 14 ? '...' : '');
        drawText(k, `Bölenler: { ${divListStr} }`, cardX + cardW / 2, cardY + fs * 5.1, {
            color: '#334155',
            scale: 0.72,
        });
    }
    c.restore();

    if (!icon) {
        // Alt Bilgi & İbni Fellûs (Mardini) Rozeti
        const perfectText = isPerfect
            ? `✦ Mükemmel Sayı! Kendisi hariç bölenleri toplamı kendisine eşit (${properSum} = ${N}) [İbni Fellûs]`
            : `Kendisi hariç bölenler toplamı: ${properSum} (${properSum > N ? 'Zengin Sayı' : 'Eksik Sayı'}) · Aritmetiğin Temel Teoremi`;

        drawBadge(k, perfectText, r.x + r.w / 2, cardY + cardH + fs * 1.6, {
            bgColor: isPerfect ? '#fef3c7' : '#ede9fe',
            textColor: isPerfect ? '#92400e' : '#5b21b6',
            borderColor: isPerfect ? '#fde68a' : '#c4b5fd',
            scale: 0.78,
        });
    }

    c.restore();
};

export const primeFactorsSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = primeFactorsState(o);
        const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));

        return [
            {
                id: 'nextNum',
                x: r.x + r.w * 0.88,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Örnek Sayıları Değiştir',
                on: s.num === 28 || s.num === 72,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'nextNum') {
            const list = [28, 48, 60, 72, 120, 180, 240, 360, 496];
            const cur = primeFactorsState(o).num;
            const nextIdx = (list.indexOf(cur) + 1) % list.length;
            return { num: list[nextIdx] };
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

    const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
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
        // Üst Başlık Rozeti
        drawBadge(k, `EBOB(${A}, ${B}) = ${g}  ·  EKOK(${A}, ${B}) = ${l}`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#eff6ff',
            textColor: '#1d4ed8',
            borderColor: '#bfdbfe',
            scale: 0.82,
        });
    }

    // ── Geometrik Zemin (Dikdörtgen Fayans Döşeme Alanı) ──
    const roomAreaW = icon ? r.w - 12 : r.w * 0.48;
    const roomAreaH = icon ? r.h - 12 : r.h * 0.54;
    const roomX = r.x + (icon ? 6 : r.w * 0.06);
    const roomY = r.y + (icon ? 6 : fs * 2.8);

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
    c.lineWidth = 2;
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
            // Satranç vari hafif renk tonu
            c.fillStyle = (ix + iy) % 2 === 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.22)';
            c.fillRect(tx, ty, tilePx, tilePx);
            c.strokeRect(tx, ty, tilePx, tilePx);
        }
    }
    c.restore();

    if (!icon) {
        // Zemin Boyut Etiketleri
        drawText(k, `A = ${A} br`, startX + drawW / 2, startY - fs * 0.7, { color: '#0f172a', scale: 0.82 });
        drawText(k, `B = ${B} br`, startX - fs * 0.8, startY + drawH / 2, { align: 'right', color: '#0f172a', scale: 0.82 });

        // Fayans Bilgisi
        drawText(k, `Fayans: ${g}×${g} br`, startX + drawW / 2, startY + drawH + fs * 0.9, { color: '#2563eb', scale: 0.8 });

        // ── Sağ Panel: Formül ve Kanıt Kartı ──
        const cardX = r.x + r.w * 0.57;
        const cardY = r.y + fs * 2.8;
        const cardW = r.w * 0.38;
        const cardH = r.h * 0.54;

        c.save();
        c.fillStyle = '#ffffff';
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1.2;
        c.beginPath();
        if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
        else c.rect(cardX, cardY, cardW, cardH);
        c.fill();
        c.stroke();

        // 1. Fayans hesabı
        drawText(k, 'ÖKLİD ALGORİTMASI & EBOB', cardX + cardW / 2, cardY + fs * 1.1, { color: '#0f172a', scale: 0.76 });
        drawText(k, `En Büyük Eş Kare Karo: ${g}×${g}`, cardX + cardW / 2, cardY + fs * 2.2, { color: '#2563eb', scale: 0.82 });
        drawText(k, `Gereken En Az Karo: ${tilesX} · ${tilesY} = ${totalTiles}`, cardX + cardW / 2, cardY + fs * 3.3, {
            color: '#059669',
            scale: 0.82,
        });

        // 2. a * b = EBOB * EKOK bağıntısı
        c.strokeStyle = '#e2e8f0';
        c.beginPath();
        c.moveTo(cardX + fs * 0.8, cardY + fs * 4.2);
        c.lineTo(cardX + cardW - fs * 0.8, cardY + fs * 4.2);
        c.stroke();

        drawText(k, 'Temel EBOB-EKOK Bağıntısı:', cardX + cardW / 2, cardY + fs * 5.1, { color: '#475569', scale: 0.74 });
        drawText(k, `A · B = EBOB · EKOK`, cardX + cardW / 2, cardY + fs * 6.2, { color: '#9333ea', scale: 0.85 });
        drawText(k, `${A} · ${B} = ${g} · ${l} = ${A * B} ✓`, cardX + cardW / 2, cardY + fs * 7.3, { color: '#0f172a', scale: 0.82 });
        c.restore();

        // Alt Bilgi Rozeti
        const bottomMsg = areCoprime
            ? `✦ ${A} ve ${B} Aralarında Asal! (EBOB = 1, EKOK = ${A * B})`
            : `Fayans kenarı (${g}), her iki kenarı (${A} ve ${B}) kalansız bölen en büyük sayıdır.`;

        drawBadge(k, bottomMsg, r.x + r.w / 2, r.y + r.h - fs * 1.0, {
            bgColor: areCoprime ? '#fef3c7' : '#f1f5f9',
            textColor: areCoprime ? '#92400e' : '#334155',
            borderColor: areCoprime ? '#fde68a' : '#cbd5e1',
            scale: 0.76,
        });
    }

    c.restore();
};

export const ebobEkokSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        return [];
    },
    onControl: (): Record<string, number> => ({}),
    params: [
        { key: 'numA', label: 'Kenar A (Genişlik)', min: 12, max: 60, step: 2 },
        { key: 'numB', label: 'Kenar B (Yükseklik)', min: 8, max: 48, step: 2 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. DİŞLİ ÇARKLAR & PERİYODİK EKOK SİMÜLATÖRÜ (periodic_ekok_sim)
   ───────────────────────────────────────────────────────────────────────────── */

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

    const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
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
        // Üst Başlık Rozeti
        drawBadge(k, `Dişli Çarklar & Periyodik Buluşma (EKOK)`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
        });
    }

    // ── Çark Geometrisi ──
    const toothPitch = 12; // Diş aralığı
    const rA = (TA * toothPitch) / (2 * Math.PI);
    const rB = (TB * toothPitch) / (2 * Math.PI);

    const cxA = r.x + r.w * 0.26;
    const cxB = cxA + rA + rB;
    const cy = r.y + fs * 2.8 + r.h * 0.28;

    // Dönme açısı (k.t ile dinamik)
    const speed = s.running ? (k.t || 0) * 0.0015 : 0;
    const angA = speed;
    const angB = -speed * (TA / TB); // Karşı dişli ters döner

    // Dişli çizici
    const drawGear = (cx: number, cy: number, radius: number, teeth: number, angle: number, color: string, name: string) => {
        c.save();
        c.translate(cx, cy);
        c.rotate(angle);

        c.fillStyle = withAlpha(color, 0.15);
        c.strokeStyle = color;
        c.lineWidth = 2;

        c.beginPath();
        for (let i = 0; i < teeth; i++) {
            const a0 = (i * 2 * Math.PI) / teeth;
            const a1 = ((i + 0.4) * 2 * Math.PI) / teeth;
            const a2 = ((i + 0.6) * 2 * Math.PI) / teeth;
            const a3 = ((i + 1.0) * 2 * Math.PI) / teeth;

            const rInner = radius - 6;
            const rOuter = radius + 6;

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
        c.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.fill();
        c.stroke();

        // Başlangıç temas noktası belirteci (kırmızı işaret)
        c.beginPath();
        c.arc(radius, 0, 4.5, 0, Math.PI * 2);
        c.fillStyle = '#ef4444';
        c.fill();
        c.stroke();

        c.restore();

        // İsim etiketi
        drawText(k, `${name} (${teeth} Diş)`, cx, cy, { color: color, scale: 0.78 });
    };

    drawGear(cxA, cy, rA, TA, angA, '#2563eb', 'Çark A');
    drawGear(cxB, cy, rB, TB, angB, '#f59e0b', 'Çark B');

    if (!icon) {
        // Sağ Bilgi Kartı
        const cardX = r.x + r.w * 0.64;
        const cardY = r.y + fs * 2.8;
        const cardW = r.w * 0.32;
        const cardH = r.h * 0.54;

        c.save();
        c.fillStyle = '#ffffff';
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1.2;
        c.beginPath();
        if (typeof c.roundRect === 'function') c.roundRect(cardX, cardY, cardW, cardH, 10);
        else c.rect(cardX, cardY, cardW, cardH);
        c.fill();
        c.stroke();

        drawText(k, 'PERİYODİK BULUŞMA', cardX + cardW / 2, cardY + fs * 1.1, { color: '#0f172a', scale: 0.76 });
        drawText(k, `EKOK(${TA}, ${TB}) = ${l} Diş`, cardX + cardW / 2, cardY + fs * 2.3, { color: '#9333ea', scale: 0.85 });

        c.strokeStyle = '#e2e8f0';
        c.beginPath();
        c.moveTo(cardX + fs * 0.6, cardY + fs * 3.3);
        c.lineTo(cardX + cardW - fs * 0.6, cardY + fs * 3.3);
        c.stroke();

        drawText(k, 'İlk Buluşma Tur Sayıları:', cardX + cardW / 2, cardY + fs * 4.2, { color: '#64748b', scale: 0.72 });
        drawText(k, `Çark A: ${l} / ${TA} = ${lapsA} Tur`, cardX + cardW / 2, cardY + fs * 5.4, { color: '#2563eb', scale: 0.82 });
        drawText(k, `Çark B: ${l} / ${TB} = ${lapsB} Tur`, cardX + cardW / 2, cardY + fs * 6.6, { color: '#d97706', scale: 0.82 });
        c.restore();

        // Alt Maarif Bağlantı Rozeti
        drawBadge(
            k,
            `💡 Gerçek Yaşam: Nöbet günleri, sefer saatleri ve sinyal lambaları periyotları EKOK ile modellenir.`,
            r.x + r.w / 2,
            r.y + r.h - fs * 1.0,
            { bgColor: '#f0fdf4', textColor: '#166534', borderColor: '#bbf7d0', scale: 0.76 }
        );
    }

    c.restore();
};

export const periodicEkokSpec: SimSpec = {
    animated: (o: MathObject) => simValue(o, 'running', 1) === 1,
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = periodicEkokState(o);
        const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
        return [
            {
                id: 'toggleRun',
                x: r.x + r.w * 0.88,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Döndür / Durdur',
                on: s.running === 1,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'toggleRun') {
            const cur = periodicEkokState(o).running;
            return { running: cur === 1 ? 0 : 1 };
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

    const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const rem = N % rData.div;
    const digits = String(N).split('').map(Number);
    const digitsSum = digits.reduce((a, b) => a + b, 0);

    if (!icon) {
        // Üst Başlık Rozeti
        drawBadge(k, `${rData.name} & Kalan Muhakemesi (N = ${N})`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
        });
    }

    // ── Basamak Çözümleme Kartı ──
    const cardX = r.x + (icon ? 6 : r.w * 0.08);
    const cardY = r.y + (icon ? 6 : fs * 2.8);
    const cardW = icon ? r.w - 12 : r.w * 0.84;
    const cardH = icon ? r.h - 12 : r.h * 0.54;

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
        // Basamak Kutucukları
        const boxSize = fs * 2.2;
        const totalBoxesW = digits.length * boxSize + (digits.length - 1) * 8;
        const boxStartX = cardX + (cardW - totalBoxesW) / 2;
        const boxY = cardY + fs * 1.0;

        digits.forEach((d, i) => {
            const bx = boxStartX + i * (boxSize + 8);
            // Kritik basamakları vurgula
            let isKey = false;
            if (rData.div === 2 || rData.div === 5 || rData.div === 10) isKey = i === digits.length - 1;
            else if (rData.div === 4) isKey = i >= digits.length - 2;
            else if (rData.div === 8) isKey = i >= digits.length - 3;
            else isKey = true; // 3 ve 9 için hepsi

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
        drawText(k, `Cebirsel İspat: ${rData.reason}`, cardX + cardW / 2, cardY + fs * 4.2, {
            color: '#1e40af',
            scale: 0.82,
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

        drawText(k, calcStr, cardX + cardW / 2, cardY + fs * 5.6, { color: '#059669', scale: 0.85 });

        // Sonuç Rozeti
        const resultText = rem === 0 ? `✓ ${N}, ${rData.div} ile KALANSIZ bölünür!` : `✦ ${N}'nin ${rData.div} ile bölümünden KALAN = ${rem}`;

        drawBadge(k, resultText, cardX + cardW / 2, cardY + fs * 7.0, {
            bgColor: rem === 0 ? '#dcfce7' : '#fee2e2',
            textColor: rem === 0 ? '#166534' : '#991b1b',
            borderColor: rem === 0 ? '#86efac' : '#fca5a5',
            scale: 0.82,
        });
    }
    c.restore();

    if (!icon) {
        // Alt Maarif Miras Notu
        drawText(
            k,
            '📜 Kültürel Miras: Basamak çözümlemesiyle bölünebilme teoremleri Mehmed Nâdir’in "Hesâb-ı Nazarî" eserinde ayrıntılı incelenmiştir.',
            r.x + r.w / 2,
            r.y + r.h - fs * 1.0,
            { align: 'center', color: '#64748b', halo: true, scale: 0.72 }
        );
    }

    c.restore();
};

export const divisibilitySpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = divisibilityState(o);
        const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
        return [
            {
                id: 'nextRule',
                x: r.x + r.w * 0.88,
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

    const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Çarpanlara göre kalanlar
    const rem1 = rem % data.f1;
    const rem2 = rem % data.f2;

    if (!icon) {
        // Üst Başlık Rozeti
        drawBadge(k, `Bileşik Kalan Teoremi: ${data.name}`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.82,
        });
    }

    // ── Ana Gövde Kartı ──
    const cardX = r.x + (icon ? 6 : r.w * 0.08);
    const cardY = r.y + (icon ? 6 : fs * 2.8);
    const cardW = icon ? r.w - 12 : r.w * 0.84;
    const cardH = icon ? r.h - 12 : r.h * 0.54;

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
        // Teorem İfadesi
        drawText(k, `Sayı Modeli: X = ${data.mod}k + ${rem}`, cardX + cardW / 2, cardY + fs * 1.2, {
            color: '#1e40af',
            scale: 0.9,
            bold: true,
        });

        // Ayrıştırma Adımları
        const q1 = Math.floor(rem / data.f1);
        const q2 = Math.floor(rem / data.f2);

        drawText(
            k,
            `1) ${data.f1} ile Bölümünden Kalan: ${rem} = ${data.f1} · ${q1} + ${rem1}  ⇒  Kalan = ${rem1}`,
            cardX + cardW / 2,
            cardY + fs * 2.6,
            { color: '#2563eb', scale: 0.84 }
        );

        drawText(
            k,
            `2) ${data.f2} ile Bölümünden Kalan: ${rem} = ${data.f2} · ${q2} + ${rem2}  ⇒  Kalan = ${rem2}`,
            cardX + cardW / 2,
            cardY + fs * 3.8,
            { color: '#d97706', scale: 0.84 }
        );

        // Örnek Değerler
        const ex1 = rem;
        const ex2 = data.mod + rem;
        const ex3 = data.mod * 2 + rem;
        drawText(k, `Örnek X Sayıları: { ${ex1}, ${ex2}, ${ex3}, ... } (Hepsi bu kalanları sağlar)`, cardX + cardW / 2, cardY + fs * 5.1, {
            color: '#059669',
            scale: 0.8,
        });

        // Rozet
        drawBadge(
            k,
            `✦ Çarpanlar Aralarında Asal Olmalıdır: EBOB(${data.f1}, ${data.f2}) = 1`,
            cardX + cardW / 2,
            cardY + fs * 6.5,
            { bgColor: '#fef3c7', textColor: '#92400e', borderColor: '#fde68a', scale: 0.78 }
        );
    }
    c.restore();

    if (!icon) {
        // Alt Maarif Modeli Açıklaması
        drawText(
            k,
            `💡 Müfredat İlkesi: X'in ${data.mod} ile bölümünden kalan c ise; ${data.f1} ve ${data.f2} ile kalanlar c'nin bu sayılara bölümünden kalandır.`,
            r.x + r.w / 2,
            r.y + r.h - fs * 1.0,
            { align: 'center', color: '#64748b', halo: true, scale: 0.72 }
        );
    }

    c.restore();
};

export const compoundRemainderSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = compoundState(o);
        const fs = Math.max(9, Math.min(16, Math.min(r.w, r.h) / 16));
        return [
            {
                id: 'nextCompound',
                x: r.x + r.w * 0.88,
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
