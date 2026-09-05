// src/components/drawing/grade10GeomSims.ts
// 10. Sınıf Matematik — Yeni Maarif Modeli "Geometrik Şekiller" Canlı Çizim Simülasyonları
// Kalem modu (beyaz tahta / çizim tuvali) üzerinde dokunmatik ve interaktif nesneler.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    isIconSize,
    line,
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
   GÖRSEL YARDIMCILAR (Okunabilir, yüksek kontrastlı metin ve rozet çiziciler)
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * Yüksek kontrastlı metin çizici:
 * Arka plana beyaz gölge (halo) atarak çizgi veya renkli zeminlerle çakışmayı önler.
 */
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

/**
 * Şık bilgi rozeti / hap (banner) çizer:
 * Formülleri ve teorem durumlarını öne çıkarır.
 */
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
        scale = 0.84,
    } = options;

    const fs = Math.round(k.fs * scale);
    k.c.save();
    k.c.font = `700 ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
    const m = k.c.measureText(text);
    const padX = fs * 0.9;
    const padY = fs * 0.45;
    const bw = m.width + padX * 2;
    const bh = fs * 1.5 + padY * 2;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;
    const rad = bh / 2;

    k.c.fillStyle = bgColor;
    k.c.strokeStyle = borderColor;
    k.c.lineWidth = 1.5;
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

    // Üçgen koordinatları (Sol tarafa yerleştirip sağdaki kartla çakışmayı önleyelim)
    const padX = icon ? 8 : r.w * 0.07;
    const maxBase = icon ? r.w * 0.75 : r.w * 0.46;
    const baseLen = maxBase * s.scale * (cosV / 0.8);
    const heightLen = baseLen * Math.tan(rad);

    const ox = r.x + padX;
    const oy = r.y + r.h - (icon ? 8 : r.h * 0.16);

    const B = { x: ox, y: oy };
    const C = { x: ox + baseLen, y: oy };
    const A = { x: ox + baseLen, y: oy - heightLen };

    // Dik üçgen gövdesi
    c.fillStyle = withAlpha(k.color, 0.09);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(2, k.lw);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(C.x, C.y);
    c.lineTo(A.x, A.y);
    c.closePath();
    c.fill();
    c.stroke();

    // Dik açı sembolü (C köşesinde)
    const sq = Math.min(14, baseLen * 0.14);
    c.strokeStyle = k.color;
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(C.x - sq, C.y);
    c.lineTo(C.x - sq, C.y - sq);
    c.lineTo(C.x, C.y - sq);
    c.stroke();
    // Dik açı iç noktası
    c.beginPath();
    c.arc(C.x - sq / 2, C.y - sq / 2, 1.8, 0, Math.PI * 2);
    c.fillStyle = k.color;
    c.fill();

    // Açı yayı (B köşesinde α)
    const arcR = Math.min(32, baseLen * 0.35);
    c.beginPath();
    c.arc(B.x, B.y, arcR, -rad, 0);
    c.strokeStyle = '#d97706';
    c.lineWidth = 2.2;
    c.stroke();

    if (!icon) {
        // Köşe ve açı etiketleri
        drawText(k, `α = ${s.angle.toFixed(0)}°`, B.x + arcR + fs * 0.6, B.y - fs * 0.55, {
            align: 'left',
            color: '#d97706',
            scale: 0.9,
        });
        drawText(k, 'B', B.x - fs * 0.7, B.y + fs * 0.5, { align: 'right', scale: 0.95 });
        drawText(k, 'C (90°)', C.x + fs * 0.4, C.y + fs * 0.7, { align: 'left', scale: 0.85 });
        drawText(k, 'A', A.x + fs * 0.3, A.y - fs * 0.6, { align: 'left', scale: 1.0 });

        // Kenar etiketleri
        const hyp = Math.hypot(baseLen, heightLen) / 28;
        const opp = heightLen / 28;
        const adj = baseLen / 28;

        drawText(k, `Karşı: ${opp.toFixed(1)}`, C.x + fs * 0.5, (A.y + C.y) / 2, {
            align: 'left',
            color: '#334155',
            scale: 0.85,
        });
        drawText(k, `Komşu: ${adj.toFixed(1)}`, (B.x + C.x) / 2, B.y + fs * 1.1, {
            align: 'center',
            color: '#334155',
            scale: 0.85,
        });
        drawText(k, `Hipotenüs: ${hyp.toFixed(1)}`, (B.x + A.x) / 2 - fs * 0.8, (B.y + A.y) / 2 - fs * 0.5, {
            align: 'right',
            color: '#2563eb',
            scale: 0.88,
        });

        // Sağdaki Trigonometrik Oran Kartı (Yüksek kontrastlı, net ve şık)
        const cardX = r.x + r.w * 0.60;
        const cardY = r.y + r.h * 0.08;
        const cardW = r.w * 0.37;
        const cardH = r.h * 0.84;

        c.save();
        // Kart arka planı (Koyu cam efekti)
        c.fillStyle = '#1e293b';
        c.strokeStyle = '#475569';
        c.lineWidth = 1.5;
        c.beginPath();
        if (typeof c.roundRect === 'function') {
            c.roundRect(cardX, cardY, cardW, cardH, 12);
        } else {
            c.rect(cardX, cardY, cardW, cardH);
        }
        c.fill();
        c.stroke();

        // Kart Başlığı
        drawText(k, 'TRİGONOMETRİK ORANLAR', cardX + cardW / 2, cardY + fs * 1.3, {
            align: 'center',
            color: '#f8fafc',
            halo: false,
            scale: 0.8,
        });

        // Değerler (Canlı, parlak, yüksek kontrastlı renkler)
        const startY = cardY + fs * 2.8;
        const lineSpacing = Math.min(fs * 1.4, (cardH - fs * 4.5) / 5);

        const rows = [
            { txt: `sin α = Karşı / Hip = ${sinV.toFixed(3)}`, col: '#38bdf8' },
            { txt: `cos α = Komşu / Hip = ${cosV.toFixed(3)}`, col: '#fb7185' },
            { txt: `tan α = Karşı / Komşu = ${tanV.toFixed(3)}`, col: '#fbbf24' },
            { txt: `cot α = Komşu / Karşı = ${cotV.toFixed(3)}`, col: '#34d399' },
        ];

        rows.forEach((row, idx) => {
            drawText(k, row.txt, cardX + fs * 0.8, startY + idx * lineSpacing, {
                align: 'left',
                color: row.col,
                halo: false,
                scale: 0.78,
            });
        });

        // Ayırıcı çizgi
        const sepY = startY + 4 * lineSpacing + fs * 0.2;
        c.strokeStyle = '#334155';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(cardX + fs * 0.7, sepY);
        c.lineTo(cardX + cardW - fs * 0.7, sepY);
        c.stroke();

        // Özdeşlik satırı
        drawText(k, 'sin²α + cos²α = 1.000 ✓', cardX + cardW / 2, sepY + fs * 1.1, {
            align: 'center',
            color: '#a7f3d0',
            halo: false,
            scale: 0.82,
        });

        c.restore();
    }

    c.restore();
};

export const trigRatioSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = trigRatioState(o);
        const rad = (s.angle * Math.PI) / 180;
        const cosV = Math.cos(rad);
        const padX = r.w * 0.07;
        const maxBase = r.w * 0.46;
        const baseLen = maxBase * s.scale * (cosV / 0.8);
        const heightLen = baseLen * Math.tan(rad);
        const ox = r.x + padX;
        const oy = r.y + r.h - r.h * 0.16;

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
            const padX = r.w * 0.07;
            const ox = r.x + padX;
            const oy = r.y + r.h - r.h * 0.16;
            const dx = Math.max(40, p.x - ox);
            const dy = Math.max(30, oy - p.y);
            const deg = Math.round(clamp((Math.atan2(dy, dx) * 180) / Math.PI, 15, 75));
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
    ax: number; // 0.24..0.76
    ay: number; // 0.16..0.48
}

const sineCosineState = (o: MathObject): SineCosineState => ({
    ax: clamp(simValue(o, 'ax', 0.50), 0.24, 0.76),
    ay: clamp(simValue(o, 'ay', 0.20), 0.16, 0.48),
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

    // Üçgen köşeleri (Çevrel çemberin alt tarafta taşmasını engellemek için tabanı 0.68'e çektik)
    const A = { x: r.x + r.w * s.ax, y: r.y + r.h * s.ay };
    const B = { x: r.x + r.w * 0.20, y: r.y + r.h * 0.68 };
    const C_pt = { x: r.x + r.w * 0.80, y: r.y + r.h * 0.68 };

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
    if (O && O.r < r.w * 0.85 && !icon) {
        c.beginPath();
        c.arc(O.x, O.y, O.r, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        c.lineWidth = 1.6;
        c.setLineDash([5, 4]);
        c.stroke();
        c.setLineDash([]);

        // Çevrel merkez noktası
        c.beginPath();
        c.arc(O.x, O.y, 4, 0, Math.PI * 2);
        c.fillStyle = '#10b981';
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();

        drawText(k, 'O (Çevrel Merkez)', O.x + fs * 0.6, O.y - fs * 0.4, {
            align: 'left',
            color: '#059669',
            halo: true,
            scale: 0.8,
        });
    }

    // Üçgen gövdesi
    c.fillStyle = withAlpha(k.color, 0.09);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(2, k.lw);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();
    c.stroke();

    // Köşe etiketleri
    drawText(k, `A (${degA.toFixed(0)}°)`, A.x, A.y - fs * 0.9, {
        align: 'center',
        color: '#b45309',
        halo: true,
        scale: 0.95,
    });
    drawText(k, 'B', B.x - fs * 0.7, B.y + fs * 0.4, { align: 'right', halo: true, scale: 0.95 });
    drawText(k, 'C', C_pt.x + fs * 0.7, C_pt.y + fs * 0.4, { align: 'left', halo: true, scale: 0.95 });

    if (!icon) {
        // Kenarlar
        drawText(k, `a = ${a.toFixed(1)}`, (B.x + C_pt.x) / 2, B.y + fs * 1.1, {
            align: 'center',
            color: '#0f172a',
            halo: true,
            scale: 0.88,
        });
        drawText(k, `b = ${b.toFixed(1)}`, (A.x + C_pt.x) / 2 + fs * 0.7, (A.y + C_pt.y) / 2, {
            align: 'left',
            color: '#0f172a',
            halo: true,
            scale: 0.88,
        });
        drawText(k, `c = ${cSide.toFixed(1)}`, (A.x + B.x) / 2 - fs * 0.7, (A.y + B.y) / 2, {
            align: 'right',
            color: '#0f172a',
            halo: true,
            scale: 0.88,
        });

        // Üst rozet: Kosinüs Teoremi durumu
        const a2 = (a * a).toFixed(1);
        const b2c2 = (b * b + cSide * cSide).toFixed(1);

        let badgeText = '';
        let badgeBg = '#f1f5f9';
        let badgeCol = '#0f172a';
        let badgeBdr = '#cbd5e1';

        if (Math.abs(degA - 90) < 1.5) {
            badgeText = `A = 90° (Tam Pisagor) ⇒ a² (${a2}) = b² + c² (${b2c2})`;
            badgeBg = '#dbeafe';
            badgeCol = '#1e40af';
            badgeBdr = '#93c5fd';
        } else if (degA < 90) {
            badgeText = `Dar Açı (A = ${degA.toFixed(0)}°) ⇒ a² (${a2}) < b² + c² (${b2c2}) [Kosinüs Teoremi]`;
            badgeBg = '#dcfce7';
            badgeCol = '#166534';
            badgeBdr = '#86efac';
        } else {
            badgeText = `Geniş Açı (A = ${degA.toFixed(0)}°) ⇒ a² (${a2}) > b² + c² (${b2c2}) [Kosinüs Teoremi]`;
            badgeBg = '#fee2e2';
            badgeCol = '#991b1b';
            badgeBdr = '#fca5a5';
        }

        drawBadge(k, badgeText, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: badgeBg,
            textColor: badgeCol,
            borderColor: badgeBdr,
            scale: 0.82,
        });

        // Alt rozet: Sinüs Teoremi ve Çevrel Çap 2R
        const sinA = Math.sin(angA);
        const R = sinA > 0.05 ? a / (2 * sinA) : 0;
        drawBadge(k, `Sinüs Teoremi: a / sin(A) = 2R = ${(2 * R).toFixed(1)} br (Çap)`, r.x + r.w / 2, r.y + r.h - fs * 1.2, {
            bgColor: '#ede9fe',
            textColor: '#5b21b6',
            borderColor: '#c4b5fd',
            scale: 0.82,
        });
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
            const ax = Math.round(clamp((p.x - r.x) / r.w, 0.24, 0.76) * 100) / 100;
            const ay = Math.round(clamp((p.y - r.y) / r.h, 0.16, 0.48) * 100) / 100;
            return { ax, ay };
        }
        return {};
    },
    params: [
        { key: 'ax', label: 'A X Konumu', min: 0.24, max: 0.76, step: 0.05 },
        { key: 'ay', label: 'A Y Konumu', min: 0.16, max: 0.48, step: 0.05 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. ÜÇGENDE YARDIMCI ELEMANLAR & EULER DOĞRUSU (triangle_centers_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface CentersState {
    apexX: number; // 0.25..0.75
    apexY: number; // 0.16..0.48
    showEuler: number; // 0: kapalı, 1: açık
}

const centersState = (o: MathObject): CentersState => ({
    apexX: clamp(simValue(o, 'apexX', 0.45), 0.25, 0.75),
    apexY: clamp(simValue(o, 'apexY', 0.22), 0.16, 0.48),
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
    const B = { x: r.x + r.w * 0.20, y: r.y + r.h * 0.76 };
    const C_pt = { x: r.x + r.w * 0.80, y: r.y + r.h * 0.76 };

    // Üçgen gövdesi
    c.fillStyle = withAlpha(k.color, 0.08);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(2, k.lw);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();
    c.stroke();

    // 1. Ağırlık Merkezi (G) ve Kenarortay Çizgisi
    const G = { x: (A.x + B.x + C_pt.x) / 3, y: (A.y + B.y + C_pt.y) / 3 };
    const M_BC = { x: (B.x + C_pt.x) / 2, y: (B.y + C_pt.y) / 2 };

    // Kenarortay çizgisini daha yumuşak ve kesikli yaparak Euler doğrusuyla karışmasını önlüyoruz
    c.save();
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 1.4;
    c.setLineDash([4, 4]);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(M_BC.x, M_BC.y);
    c.stroke();
    c.restore();

    // 2. Çevrel Çember Merkezi (O)
    const d = 2 * (A.x * (B.y - C_pt.y) + B.x * (C_pt.y - A.y) + C_pt.x * (A.y - B.y));
    let O: { x: number; y: number } | null = null;
    if (Math.abs(d) > 1e-4) {
        const ux = ((A.x ** 2 + A.y ** 2) * (B.y - C_pt.y) + (B.x ** 2 + B.y ** 2) * (C_pt.y - A.y) + (C_pt.x ** 2 + C_pt.y ** 2) * (A.y - B.y)) / d;
        const uy = ((A.x ** 2 + A.y ** 2) * (C_pt.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C_pt.x) + (C_pt.x ** 2 + C_pt.y ** 2) * (B.x - A.x)) / d;
        O = { x: ux, y: uy };
    }

    // 3. Diklik Merkezi (H = 3G - 2O bağıntısı)
    const H = O ? { x: 3 * G.x - 2 * O.x, y: 3 * G.y - 2 * O.y } : null;

    if (H && O && s.showEuler === 1 && !icon) {
        // Euler Doğrusu (Canlı, belirgin altın/kehribar çizgi)
        const dx = O.x - H.x;
        const dy = O.y - H.y;
        c.save();
        c.beginPath();
        c.moveTo(H.x - dx * 0.35, H.y - dy * 0.35);
        c.lineTo(O.x + dx * 0.35, O.y + dy * 0.35);
        c.strokeStyle = '#d97706';
        c.lineWidth = 2.4;
        c.setLineDash([7, 4]);
        c.stroke();
        c.restore();

        // Euler Doğrusu Rozeti (Beyaz zeminli hap şeklinde, çizgilerle asla çakışmaz)
        const midEulerX = (H.x + O.x) / 2;
        const midEulerY = (H.y + O.y) / 2;
        const offX = Math.abs(midEulerX - G.x) < 25 ? 40 : 0;
        drawBadge(k, 'Euler Doğrusu (H - G - O)', midEulerX + offX, midEulerY - fs * 1.3, {
            bgColor: '#ffffff',
            textColor: '#b45309',
            borderColor: '#f59e0b',
            scale: 0.76,
        });
    }

    // Merkez Noktaları Çizimi (Belirgin yuvarlaklar, beyaz halka ve etiketler)
    const drawCenterDot = (pt: { x: number; y: number }, dotColor: string, txt: string) => {
        c.beginPath();
        c.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        c.fillStyle = dotColor;
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.8;
        c.stroke();
        if (!icon) {
            drawText(k, txt, pt.x + fs * 0.7, pt.y - fs * 0.4, {
                align: 'left',
                color: dotColor,
                halo: true,
                scale: 0.84,
            });
        }
    };

    drawCenterDot(G, '#0284c7', 'G (Ağırlık M.)');
    if (O) drawCenterDot(O, '#059669', 'O (Çevrel M.)');
    if (H) drawCenterDot(H, '#e11d48', 'H (Diklik M.)');

    // Köşe etiketleri
    drawText(k, 'A', A.x, A.y - fs * 0.9, { align: 'center', halo: true, scale: 0.95 });
    drawText(k, 'B', B.x - fs * 0.7, B.y + fs * 0.4, { align: 'right', halo: true, scale: 0.95 });
    drawText(k, 'C', C_pt.x + fs * 0.7, C_pt.y + fs * 0.4, { align: 'left', halo: true, scale: 0.95 });

    if (!icon) {
        // Üst Başlık Rozeti
        drawBadge(k, 'Euler Doğrusu: HG = 2 · GO (H, G, O Merkezleri Daima Doğrusaldır)', r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#fef3c7',
            textColor: '#92400e',
            borderColor: '#fde68a',
            scale: 0.82,
        });
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
            const apexX = Math.round(clamp((p.x - r.x) / r.w, 0.25, 0.75) * 100) / 100;
            const apexY = Math.round(clamp((p.y - r.y) / r.h, 0.16, 0.48) * 100) / 100;
            return { apexX, apexY };
        }
        return {};
    },
    params: [
        { key: 'apexX', label: 'Tepe X', min: 0.25, max: 0.75, step: 0.05 },
        { key: 'apexY', label: 'Tepe Y', min: 0.16, max: 0.48, step: 0.05 },
        { key: 'showEuler', label: 'Euler Doğrusu', min: 0, max: 1, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   4. ÜÇGENİN ALANI & CAVALIERI İLKESİ (triangle_area_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface AreaState {
    apexX: number; // 0.20..0.80
    hRatio: number; // 0.28..0.62
}

const areaState = (o: MathObject): AreaState => ({
    apexX: clamp(simValue(o, 'apexX', 0.45), 0.20, 0.80),
    hRatio: clamp(simValue(o, 'hRatio', 0.45), 0.28, 0.62),
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

    const B = { x: r.x + r.w * 0.22, y: r.y + r.h * 0.76 };
    const C_pt = { x: r.x + r.w * 0.78, y: r.y + r.h * 0.76 };
    const apexY = r.y + r.h * (0.76 - s.hRatio);
    const A = { x: r.x + r.w * s.apexX, y: apexY };

    // Taban uzantı kılavuz doğrusu
    c.save();
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(r.x + r.w * 0.08, B.y);
    c.lineTo(r.x + r.w * 0.92, B.y);
    c.stroke();
    c.restore();

    // Tabana paralel tepe kılavuz doğrusu (Cavalieri Doğrusu)
    if (!icon) {
        c.save();
        c.beginPath();
        c.moveTo(r.x + r.w * 0.08, apexY);
        c.lineTo(r.x + r.w * 0.92, apexY);
        c.strokeStyle = '#d97706';
        c.lineWidth = 1.8;
        c.setLineDash([6, 4]);
        c.stroke();
        c.restore();

        drawText(k, 'd // BC (Cavalieri Doğrusu)', r.x + r.w * 0.90, apexY - fs * 0.6, {
            align: 'right',
            color: '#b45309',
            halo: true,
            scale: 0.8,
        });
    }

    // Üçgen gövdesi
    c.fillStyle = withAlpha(k.color, 0.12);
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(2, k.lw);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();
    c.stroke();

    // Taban kenarı (BC) - Belirginleştirilmiş
    c.save();
    c.strokeStyle = k.color;
    c.lineWidth = Math.max(2.4, k.lw + 0.5);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.stroke();
    c.restore();

    // Yükseklik dikmesi (h) - Kırmızı kesikli çizgi
    c.save();
    c.strokeStyle = '#dc2626';
    c.lineWidth = 1.8;
    c.setLineDash([5, 3]);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(A.x, B.y);
    c.stroke();
    c.restore();

    // Eğer tepe A tabanın dışına taştıysa (geniş açılı üçgen hali), taban uzantısını da gösterelim
    if (A.x < B.x || A.x > C_pt.x) {
        c.save();
        c.strokeStyle = '#dc2626';
        c.lineWidth = 1.2;
        c.setLineDash([3, 3]);
        c.beginPath();
        c.moveTo(A.x < B.x ? B.x : C_pt.x, B.y);
        c.lineTo(A.x, B.y);
        c.stroke();
        c.restore();
    }

    // Yükseklik diklik sembolü
    const sq = 9;
    const dir = A.x > (B.x + C_pt.x) / 2 ? -1 : 1;
    c.strokeStyle = '#dc2626';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(A.x, B.y - sq);
    c.lineTo(A.x + sq * dir, B.y - sq);
    c.lineTo(A.x + sq * dir, B.y);
    c.stroke();

    // Köşe etiketleri
    drawText(k, 'A', A.x, A.y - fs * 0.9, { align: 'center', halo: true, scale: 0.95 });
    drawText(k, 'B', B.x - fs * 0.7, B.y + fs * 0.4, { align: 'right', halo: true, scale: 0.95 });
    drawText(k, 'C', C_pt.x + fs * 0.7, C_pt.y + fs * 0.4, { align: 'left', halo: true, scale: 0.95 });

    if (!icon) {
        const baseLen = ((C_pt.x - B.x) / 32).toFixed(1);
        const hLen = ((B.y - A.y) / 32).toFixed(1);
        const areaVal = (parseFloat(baseLen) * parseFloat(hLen) * 0.5).toFixed(1);

        // Yükseklik ve taban etiketleri
        drawText(k, `h = ${hLen}`, A.x + (dir === 1 ? fs * 0.6 : -fs * 0.6), (A.y + B.y) / 2, {
            align: dir === 1 ? 'left' : 'right',
            color: '#dc2626',
            halo: true,
            scale: 0.88,
        });
        drawText(k, `Taban = ${baseLen}`, (B.x + C_pt.x) / 2, B.y + fs * 1.1, {
            align: 'center',
            color: '#2563eb',
            halo: true,
            scale: 0.88,
        });

        // Üst Alan Rozeti
        drawBadge(k, `Alan(ABC) = (Taban · h) / 2 = ${areaVal} br² (SABİT ALAN)`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#e0e7ff',
            textColor: '#3730a3',
            borderColor: '#a5b4fc',
            scale: 0.84,
        });
    }

    c.restore();
};

export const triangleAreaSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = areaState(o);
        const apexY = r.y + r.h * (0.76 - s.hRatio);
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
            const apexX = Math.round(clamp((p.x - r.x) / r.w, 0.20, 0.80) * 100) / 100;
            const hRatio = Math.round(clamp(0.76 - (p.y - r.y) / r.h, 0.28, 0.62) * 100) / 100;
            return { apexX, hRatio };
        }
        return {};
    },
    params: [
        { key: 'apexX', label: 'Tepe X Konumu', min: 0.20, max: 0.80, step: 0.05 },
        { key: 'hRatio', label: 'Yükseklik (h)', min: 0.28, max: 0.62, step: 0.05 },
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
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { angle: 37, scale: 1.0 } },
    },
    {
        kind: 'sine_cosine_sim',
        label: 'Sinüs & Kosinüs Teoremleri',
        hint: 'Kosinüs Teoremi ile Pisagor kıyası ve Çevrel Çember çapı (2R) oranı',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { ax: 0.50, ay: 0.20 } },
    },
    {
        kind: 'triangle_centers_sim',
        label: 'Özel Merkezler & Euler Doğrusu',
        hint: 'Ağırlık M. (G), Diklik M. (H), Çevrel M. (O) ve H-G-O Euler Doğrusu',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { apexX: 0.45, apexY: 0.22, showEuler: 1 } },
    },
    {
        kind: 'triangle_area_sim',
        label: 'Üçgenin Alanı & Cavalieri İlkesi',
        hint: 'Tepe noktasını paralel hatta kaydır; taban ve h sabit kaldıkça alanın korunduğunu gör',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { apexX: 0.45, hRatio: 0.45 } },
    },
];
