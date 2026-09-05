// src/components/drawing/grade10GeomSims.ts
// 10. Sınıf Matematik — Yeni Maarif Modeli "Geometrik Şekiller" Canlı Çizim Simülasyonları
// Kalem modu (beyaz tahta / çizim tuvali) üzerinde dokunmatik ve interaktif nesneler.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    isIconSize,
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

/* ─────────────────────────────────────────────────────────────────────────────
   1. DİK ÜÇGENDE TRİGONOMETRİK ORANLAR & ÖZDEŞLİKLER (trig_ratio_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface TrigRatioState {
    angle: number; // 15..75 derece
    scale: number; // 0.8..1.4
}

const trigRatioState = (o: MathObject): TrigRatioState => ({
    angle: clamp(simValue(o, 'angle', 37), 15, 75),
    scale: clamp(simValue(o, 'scale', 1.0), 0.7, 1.4),
});

export const trigRatioRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = trigRatioState(k.o);
    const rad = (s.angle * Math.PI) / 180;
    const sinV = Math.sin(rad);
    const cosV = Math.cos(rad);
    const tanV = Math.tan(rad);
    const cotV = 1 / tanV;

    const fs = Math.max(9, Math.min(18, Math.min(r.w, r.h) / 14));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Üçgen koordinatları
    const padX = icon ? 6 : r.w * 0.08;
    const baseLen = Math.min(r.w * 0.52, (r.w - padX * 2) * 0.7) * s.scale * (cosV / 0.8);
    const heightLen = baseLen * Math.tan(rad);

    const ox = r.x + padX;
    const oy = r.y + r.h - (icon ? 6 : r.h * 0.18);

    const B = { x: ox, y: oy };
    const C = { x: ox + baseLen, y: oy };
    const A = { x: ox + baseLen, y: oy - heightLen };

    // Dik üçgen gövdesi
    c.fillStyle = withAlpha(k.color, 0.08);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(1.8, k.lw);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(C.x, C.y);
    c.lineTo(A.x, A.y);
    c.closePath();
    c.fill();
    c.stroke();

    // Dik açı sembolü (C köşesinde)
    const sq = Math.min(14, baseLen * 0.15);
    line(k, C.x - sq, C.y, C.x - sq, C.y - sq, 1.5);
    line(k, C.x - sq, C.y - sq, C.x, C.y - sq, 1.5);
    c.beginPath();
    c.arc(C.x - sq / 2, C.y - sq / 2, 1.8, 0, Math.PI * 2);
    c.fillStyle = k.color;
    c.fill();

    // Açı yayı (B köşesinde α)
    const arcR = Math.min(28, baseLen * 0.35);
    c.beginPath();
    c.arc(B.x, B.y, arcR, -rad, 0);
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 2;
    c.stroke();

    if (!icon) {
        // Köşe ve açı etiketleri
        label(k, `α = ${s.angle.toFixed(0)}°`, B.x + arcR + fs * 0.6, B.y - fs * 0.5, 'left', 'middle', 0.85);
        label(k, 'B', B.x - fs * 0.7, B.y + fs * 0.5, 'right', 'middle', 0.9);
        label(k, 'C (90°)', C.x + fs * 0.5, C.y + fs * 0.6, 'left', 'middle', 0.85);
        label(k, 'A', A.x + fs * 0.3, A.y - fs * 0.6, 'left', 'middle', 0.95);

        // Kenar etiketleri
        const hyp = Math.hypot(baseLen, heightLen) / 30;
        const opp = heightLen / 30;
        const adj = baseLen / 30;

        label(k, `Karşı: ${opp.toFixed(1)}`, C.x + fs * 0.5, (A.y + C.y) / 2, 'left', 'middle', 0.8);
        label(k, `Komşu: ${adj.toFixed(1)}`, (B.x + C.x) / 2, B.y + fs * 1.1, 'center', 'middle', 0.8);
        label(k, `Hipotenüs: ${hyp.toFixed(1)}`, (B.x + A.x) / 2 - fs * 0.8, (B.y + A.y) / 2 - fs * 0.5, 'right', 'middle', 0.8);

        // Sağdaki Trigonometrik Oran Kartı
        const cardX = r.x + r.w * 0.66;
        const cardY = r.y + fs * 1.2;
        const cardW = r.w * 0.31;
        const cardH = r.h * 0.75;

        c.fillStyle = withAlpha('#1e293b', 0.75);
        c.strokeStyle = withAlpha(k.color, 0.25);
        c.lineWidth = 1;
        c.beginPath();
        c.roundRect(cardX, cardY, cardW, cardH, 8);
        c.fill();
        c.stroke();

        label(k, 'ORANLAR', cardX + cardW / 2, cardY + fs * 1.1, 'center', 'middle', 0.8);
        label(k, `sin α = ${sinV.toFixed(3)}`, cardX + fs * 0.8, cardY + fs * 2.5, 'left', 'middle', 0.8);
        label(k, `cos α = ${cosV.toFixed(3)}`, cardX + fs * 0.8, cardY + fs * 3.7, 'left', 'middle', 0.8);
        label(k, `tan α = ${tanV.toFixed(3)}`, cardX + fs * 0.8, cardY + fs * 4.9, 'left', 'middle', 0.8);
        label(k, `cot α = ${cotV.toFixed(3)}`, cardX + fs * 0.8, cardY + fs * 6.1, 'left', 'middle', 0.8);

        // Özdeşlik satırı
        c.strokeStyle = withAlpha('#a855f7', 0.4);
        line(k, cardX + fs * 0.6, cardY + fs * 7.0, cardX + cardW - fs * 0.6, cardY + fs * 7.0, 1);
        label(k, 'sin²α + cos²α = 1.000 ✓', cardX + cardW / 2, cardY + fs * 8.2, 'center', 'middle', 0.75);
    }

    c.restore();
};

export const trigRatioSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = trigRatioState(o);
        const rad = (s.angle * Math.PI) / 180;
        const cosV = Math.cos(rad);
        const padX = r.w * 0.08;
        const baseLen = Math.min(r.w * 0.52, (r.w - padX * 2) * 0.7) * s.scale * (cosV / 0.8);
        const heightLen = baseLen * Math.tan(rad);
        const ox = r.x + padX;
        const oy = r.y + r.h - r.h * 0.18;

        return [
            {
                id: 'apex',
                x: ox + baseLen,
                y: oy - heightLen,
                type: 'drag',
                label: 'Açı ve boyutu değiştirmek için A köşesini sürükleyin',
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string, p: { x: number; y: number }): Record<string, number> => {
        if (id === 'apex') {
            const padX = r.w * 0.08;
            const ox = r.x + padX;
            const oy = r.y + r.h - r.h * 0.18;
            const dx = Math.max(40, p.x - ox);
            const dy = Math.max(30, oy - p.y);
            const deg = clamp((Math.atan2(dy, dx) * 180) / Math.PI, 15, 75);
            return { angle: deg };
        }
        return {};
    },
    params: [
        { key: 'angle', label: 'Dar Açı (α)', min: 15, max: 75, step: 1, unit: '°' },
        { key: 'scale', label: 'Ölçek', min: 0.7, max: 1.4, step: 0.1, unit: 'x' },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   2. SİNÜS VE KOSİNÜS TEOREMLERİ & ÇEVREL ÇEMBER (sine_cosine_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface SineCosineState {
    ax: number; // 0.2..0.8
    ay: number; // 0.15..0.6
}

const sineCosineState = (o: MathObject): SineCosineState => ({
    ax: clamp(simValue(o, 'ax', 0.48), 0.2, 0.8),
    ay: clamp(simValue(o, 'ay', 0.22), 0.15, 0.55),
});

export const sineCosineRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = sineCosineState(k.o);
    const fs = Math.max(9, Math.min(18, Math.min(r.w, r.h) / 14));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const A = { x: r.x + r.w * s.ax, y: r.y + r.h * s.ay };
    const B = { x: r.x + r.w * 0.18, y: r.y + r.h * 0.76 };
    const C_pt = { x: r.x + r.w * 0.78, y: r.y + r.h * 0.76 };

    // Kenar uzunlukları (piksel ve normalize birim)
    const dBC = Math.hypot(C_pt.x - B.x, C_pt.y - B.y);
    const dAC = Math.hypot(C_pt.x - A.x, C_pt.y - A.y);
    const dAB = Math.hypot(A.x - B.x, A.y - B.y);

    const unitScale = dBC / 8;
    const a = dBC / unitScale;
    const b = dAC / unitScale;
    const cSide = dAB / unitScale;

    // A açısı kosinüsü
    const cosA = clamp((b * b + cSide * cSide - a * a) / (2 * b * cSide), -1, 1);
    const angA = Math.acos(cosA);
    const degA = (angA * 180) / Math.PI;

    // Çevrel Çember Merkezi (O)
    const d2 = 2 * (A.x * (B.y - C_pt.y) + B.x * (C_pt.y - A.y) + C_pt.x * (A.y - B.y));
    let O: { x: number; y: number; r: number } | null = null;
    if (Math.abs(d2) > 1e-4) {
        const ux = ((A.x ** 2 + A.y ** 2) * (B.y - C_pt.y) + (B.x ** 2 + B.y ** 2) * (C_pt.y - A.y) + (C_pt.x ** 2 + C_pt.y ** 2) * (A.y - B.y)) / d2;
        const uy = ((A.x ** 2 + A.y ** 2) * (C_pt.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C_pt.x) + (C_pt.x ** 2 + C_pt.y ** 2) * (B.x - A.x)) / d2;
        O = { x: ux, y: uy, r: Math.hypot(A.x - ux, A.y - uy) };
    }

    // Çevrel çember çizimi
    if (O && O.r < r.w * 0.9 && !icon) {
        c.beginPath();
        c.arc(O.x, O.y, O.r, 0, Math.PI * 2);
        c.strokeStyle = withAlpha('#10b981', 0.35);
        c.lineWidth = 1.2;
        c.setLineDash([4, 4]);
        c.stroke();
        c.setLineDash([]);

        c.beginPath();
        c.arc(O.x, O.y, 3, 0, Math.PI * 2);
        c.fillStyle = '#10b981';
        c.fill();
        label(k, 'O (Çevrel Merkez)', O.x + fs * 0.6, O.y - fs * 0.4, 'left', 'middle', 0.75);
    }

    // Üçgen gövdesi
    c.fillStyle = withAlpha(k.color, 0.08);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(1.8, k.lw);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();
    c.stroke();

    // Köşe etiketleri
    label(k, `A (${degA.toFixed(0)}°)`, A.x, A.y - fs * 0.8, 'center', 'middle', 0.9);
    label(k, 'B', B.x - fs * 0.7, B.y + fs * 0.5, 'right', 'middle', 0.9);
    label(k, 'C', C_pt.x + fs * 0.7, C_pt.y + fs * 0.5, 'left', 'middle', 0.9);

    if (!icon) {
        // Kenarlar
        label(k, `a = ${a.toFixed(1)}`, (B.x + C_pt.x) / 2, B.y + fs * 1.1, 'center', 'middle', 0.8);
        label(k, `b = ${b.toFixed(1)}`, (A.x + C_pt.x) / 2 + fs * 0.6, (A.y + C_pt.y) / 2, 'left', 'middle', 0.8);
        label(k, `c = ${cSide.toFixed(1)}`, (A.x + B.x) / 2 - fs * 0.6, (A.y + B.y) / 2, 'right', 'middle', 0.8);

        // Kosinüs Teoremi rozeti
        const a2 = (a * a).toFixed(1);
        const b2c2 = (b * b + cSide * cSide).toFixed(1);
        const stateText = Math.abs(degA - 90) < 2
            ? 'A = 90° (Tam Pisagor: a² = b² + c²)'
            : degA < 90
            ? `Dar Açı: a² (${a2}) < b²+c² (${b2c2})`
            : `Geniş Açı: a² (${a2}) > b²+c² (${b2c2})`;

        label(k, stateText, r.x + r.w / 2, r.y + fs * 1.2, 'center', 'middle', 0.85);

        // Sinüs Teoremi 2R bilgisi
        const sinA = Math.sin(angA);
        const R = sinA > 0.05 ? a / (2 * sinA) : 0;
        label(k, `a / sin A = 2R = ${(2 * R).toFixed(1)} br`, r.x + r.w / 2, r.y + r.h - fs * 1.2, 'center', 'middle', 0.8);
    }

    c.restore();
};

export const sineCosineSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = sineCosineState(o);
        return [
            {
                id: 'A',
                x: r.x + r.w * s.ax,
                y: r.y + r.h * s.ay,
                type: 'drag',
                label: 'A açısını ve tepe noktasını serbestçe hareket ettirin',
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string, p: { x: number; y: number }): Record<string, number> => {
        if (id === 'A') {
            const ax = clamp((p.x - r.x) / r.w, 0.2, 0.8);
            const ay = clamp((p.y - r.y) / r.h, 0.15, 0.55);
            return { ax, ay };
        }
        return {};
    },
    params: [
        { key: 'ax', label: 'A X Konumu', min: 0.2, max: 0.8, step: 0.05 },
        { key: 'ay', label: 'A Y Konumu', min: 0.15, max: 0.55, step: 0.05 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. ÜÇGENDE YARDIMCI ELEMANLAR & EULER DOĞRUSU (triangle_centers_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface CentersState {
    apexX: number; // 0.25..0.75
    apexY: number; // 0.15..0.5
    showEuler: number; // 0: kapalı, 1: açık
}

const centersState = (o: MathObject): CentersState => ({
    apexX: clamp(simValue(o, 'apexX', 0.44), 0.25, 0.75),
    apexY: clamp(simValue(o, 'apexY', 0.22), 0.15, 0.5),
    showEuler: clampInt(simValue(o, 'showEuler', 1), 0, 1, 1),
});

export const triangleCentersRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = centersState(k.o);
    const fs = Math.max(9, Math.min(18, Math.min(r.w, r.h) / 14));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const A = { x: r.x + r.w * s.apexX, y: r.y + r.h * s.apexY };
    const B = { x: r.x + r.w * 0.18, y: r.y + r.h * 0.78 };
    const C_pt = { x: r.x + r.w * 0.82, y: r.y + r.h * 0.78 };

    // Üçgen
    c.fillStyle = withAlpha(k.color, 0.06);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(1.8, k.lw);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();
    c.stroke();

    // 1. Ağırlık Merkezi (G)
    const G = { x: (A.x + B.x + C_pt.x) / 3, y: (A.y + B.y + C_pt.y) / 3 };
    const M_BC = { x: (B.x + C_pt.x) / 2, y: (B.y + C_pt.y) / 2 };
    line(k, A.x, A.y, M_BC.x, M_BC.y, 1.2);

    // 2. Çevrel Çember Merkezi (O)
    const d = 2 * (A.x * (B.y - C_pt.y) + B.x * (C_pt.y - A.y) + C_pt.x * (A.y - B.y));
    let O: { x: number; y: number } | null = null;
    if (Math.abs(d) > 1e-4) {
        const ux = ((A.x ** 2 + A.y ** 2) * (B.y - C_pt.y) + (B.x ** 2 + B.y ** 2) * (C_pt.y - A.y) + (C_pt.x ** 2 + C_pt.y ** 2) * (A.y - B.y)) / d;
        const uy = ((A.x ** 2 + A.y ** 2) * (C_pt.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C_pt.x) + (C_pt.x ** 2 + C_pt.y ** 2) * (B.x - A.x)) / d;
        O = { x: ux, y: uy };
    }

    // 3. Diklik Merkezi (H = 3G - 2O)
    const H = O ? { x: 3 * G.x - 2 * O.x, y: 3 * G.y - 2 * O.y } : null;

    if (H && O && s.showEuler === 1 && !icon) {
        // Euler Doğrusu
        const dx = O.x - H.x;
        const dy = O.y - H.y;
        c.beginPath();
        c.moveTo(H.x - dx * 0.3, H.y - dy * 0.3);
        c.lineTo(O.x + dx * 0.3, O.y + dy * 0.3);
        c.strokeStyle = '#eab308';
        c.lineWidth = 2.2;
        c.setLineDash([6, 3]);
        c.stroke();
        c.setLineDash([]);
        label(k, 'Euler Doğrusu (H - G - O)', (H.x + O.x) / 2, (H.y + O.y) / 2 - fs * 0.8, 'center', 'middle', 0.8);
    }

    // Merkez Noktaları
    const drawDot = (pt: { x: number; y: number }, color: string, txt: string) => {
        c.beginPath();
        c.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        c.fillStyle = color;
        c.fill();
        c.strokeStyle = '#fff';
        c.lineWidth = 1.5;
        c.stroke();
        if (!icon) label(k, txt, pt.x + fs * 0.6, pt.y - fs * 0.4, 'left', 'middle', 0.8);
    };

    drawDot(G, '#38bdf8', 'G (Ağırlık M.)');
    if (O) drawDot(O, '#10b981', 'O (Çevrel M.)');
    if (H) drawDot(H, '#f43f5e', 'H (Diklik M.)');

    label(k, 'A', A.x, A.y - fs * 0.8, 'center', 'middle', 0.9);
    label(k, 'B', B.x - fs * 0.7, B.y + fs * 0.5, 'right', 'middle', 0.9);
    label(k, 'C', C_pt.x + fs * 0.7, C_pt.y + fs * 0.5, 'left', 'middle', 0.9);

    if (!icon) {
        label(k, 'HG = 2 · GO Bağıntısı (Doğrusal Merkezler)', r.x + r.w / 2, r.y + fs * 1.1, 'center', 'middle', 0.85);
    }

    c.restore();
};

export const triangleCentersSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = centersState(o);
        return [
            {
                id: 'apex',
                x: r.x + r.w * s.apexX,
                y: r.y + r.h * s.apexY,
                type: 'drag',
                label: 'Tepe noktasını kaydırarak merkezlerin hareketini inceleyin',
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string, p: { x: number; y: number }): Record<string, number> => {
        if (id === 'apex') {
            const apexX = clamp((p.x - r.x) / r.w, 0.25, 0.75);
            const apexY = clamp((p.y - r.y) / r.h, 0.15, 0.5);
            return { apexX, apexY };
        }
        return {};
    },
    params: [
        { key: 'apexX', label: 'Tepe X', min: 0.25, max: 0.75, step: 0.05 },
        { key: 'apexY', label: 'Tepe Y', min: 0.15, max: 0.5, step: 0.05 },
        { key: 'showEuler', label: 'Euler Doğrusu', min: 0, max: 1, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   4. ÜÇGENİN ALANI & CAVALIERI İLKESİ (triangle_area_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface AreaState {
    apexX: number; // 0.2..0.8
    hRatio: number; // 0.3..0.6
}

const areaState = (o: MathObject): AreaState => ({
    apexX: clamp(simValue(o, 'apexX', 0.45), 0.2, 0.8),
    hRatio: clamp(simValue(o, 'hRatio', 0.45), 0.3, 0.65),
});

export const triangleAreaRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = areaState(k.o);
    const fs = Math.max(9, Math.min(18, Math.min(r.w, r.h) / 14));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    const B = { x: r.x + r.w * 0.2, y: r.y + r.h * 0.78 };
    const C_pt = { x: r.x + r.w * 0.8, y: r.y + r.h * 0.78 };
    const apexY = r.y + r.h * (0.78 - s.hRatio);
    const A = { x: r.x + r.w * s.apexX, y: apexY };

    // Taban doğrusu
    line(k, r.x + r.w * 0.1, B.y, r.x + r.w * 0.9, B.y, 1);

    // Tabana paralel tepe kılavuz doğrusu (Cavalieri)
    if (!icon) {
        c.beginPath();
        c.moveTo(r.x + r.w * 0.1, apexY);
        c.lineTo(r.x + r.w * 0.9, apexY);
        c.strokeStyle = '#f59e0b';
        c.lineWidth = 1.5;
        c.setLineDash([5, 4]);
        c.stroke();
        c.setLineDash([]);
        label(k, 'd // BC (Cavalieri Doğrusu)', r.x + r.w * 0.9, apexY - fs * 0.5, 'right', 'middle', 0.75);
    }

    // Üçgen
    c.fillStyle = withAlpha(k.color, 0.12);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(1.8, k.lw);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();
    c.stroke();

    // Yükseklik dikmesi (h)
    line(k, A.x, A.y, A.x, B.y, 1.8);
    // Yükseklik diklik karesi
    const sq = 10;
    line(k, A.x, B.y - sq, A.x + sq, B.y - sq, 1.2);
    line(k, A.x + sq, B.y - sq, A.x + sq, B.y, 1.2);

    label(k, 'A', A.x, A.y - fs * 0.8, 'center', 'middle', 0.9);
    label(k, 'B', B.x - fs * 0.7, B.y + fs * 0.5, 'right', 'middle', 0.9);
    label(k, 'C', C_pt.x + fs * 0.7, C_pt.y + fs * 0.5, 'left', 'middle', 0.9);

    if (!icon) {
        const baseLen = ((C_pt.x - B.x) / 35).toFixed(1);
        const hLen = ((B.y - A.y) / 35).toFixed(1);
        const areaVal = (parseFloat(baseLen) * parseFloat(hLen) * 0.5).toFixed(1);

        label(k, `h = ${hLen}`, A.x + fs * 0.6, (A.y + B.y) / 2, 'left', 'middle', 0.85);
        label(k, `Taban = ${baseLen}`, (B.x + C_pt.x) / 2, B.y + fs * 1.1, 'center', 'middle', 0.85);

        // Canlı alan rozeti
        const badgeText = `Alan(ABC) = (Taban · h) / 2 = ${areaVal} br² (SABİT)`;
        label(k, badgeText, r.x + r.w / 2, r.y + fs * 1.2, 'center', 'middle', 0.85);
    }

    c.restore();
};

export const triangleAreaSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = areaState(o);
        const apexY = r.y + r.h * (0.78 - s.hRatio);
        return [
            {
                id: 'apex',
                x: r.x + r.w * s.apexX,
                y: apexY,
                type: 'drag',
                label: 'A noktasını paralel hat boyunca sağa/sola kaydırın; alanın değişmediğini görün',
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string, p: { x: number; y: number }): Record<string, number> => {
        if (id === 'apex') {
            const apexX = clamp((p.x - r.x) / r.w, 0.2, 0.8);
            const hRatio = clamp(0.78 - (p.y - r.y) / r.h, 0.3, 0.65);
            return { apexX, hRatio };
        }
        return {};
    },
    params: [
        { key: 'apexX', label: 'Tepe X Konumu', min: 0.2, max: 0.8, step: 0.05 },
        { key: 'hRatio', label: 'Yükseklik (h)', min: 0.3, max: 0.65, step: 0.05 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   KATALOG LİSTESİ VE KAYIT
   ───────────────────────────────────────────────────────────────────────────── */

export const GRADE10_GEOM_RENDERERS: Record<string, Renderer> = {
    trig_ratio_sim: trigRatioRender,
    sine_cosine_sim: sineCosineRender,
    triangle_centers_sim: triangleCentersRender,
    triangle_area_sim: triangleAreaRender,
};

export const GRADE10_GEOM_SPECS: Record<string, SimSpec> = {
    trig_ratio_sim: trigRatioSpec,
    sine_cosine_sim: sineCosineSpec,
    triangle_centers_sim: triangleCentersSpec,
    triangle_area_sim: triangleAreaSpec,
};

export const GRADE10_GEOM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'trig_ratio_sim',
        label: 'Trigonometrik Oranlar & Özdeşlikler',
        hint: 'Dik üçgenin açısını sürükle; sin, cos, tan, cot ve sin²α+cos²α=1 özdeşliğini keşfet',
        size: { w: 520, h: 360 },
        defaults: { labels: true, sim: { angle: 37, scale: 1.0 } },
    },
    {
        kind: 'sine_cosine_sim',
        label: 'Sinüs & Kosinüs Teoremleri',
        hint: 'Kosinüs Teoremi ile Pisagor kıyası ve Çevrel Çember çapı (2R) oranı',
        size: { w: 520, h: 360 },
        defaults: { labels: true, sim: { ax: 0.48, ay: 0.22 } },
    },
    {
        kind: 'triangle_centers_sim',
        label: 'Özel Merkezler & Euler Doğrusu',
        hint: 'Ağırlık M. (G), Diklik M. (H), Çevrel M. (O) ve H-G-O Euler Doğrusu',
        size: { w: 520, h: 360 },
        defaults: { labels: true, sim: { apexX: 0.44, apexY: 0.22, showEuler: 1 } },
    },
    {
        kind: 'triangle_area_sim',
        label: 'Üçgenin Alanı & Cavalieri İlkesi',
        hint: 'Tepe noktasını paralel hatta kaydır; taban ve h sabit kaldıkça alanın korunduğunu gör',
        size: { w: 520, h: 360 },
        defaults: { labels: true, sim: { apexX: 0.45, hRatio: 0.45 } },
    },
];
