// src/components/drawing/grade10GeomSims.ts
// 10. Sınıf Matematik — Yeni Maarif Modeli "Geometrik Şekiller" Canlı Çizim Simülasyonları
// Kalem modu (beyaz tahta / çizim tuvali) üzerinde dokunmatik ve interaktif nesneler.

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
        size?: number;
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

    const fs = options.size ? Math.round(options.size) : Math.round(k.fs * scale);
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
    scale: number; // 0.7..1.4
    showIdentities: number; // 0: kapalı, 1: açık
}

const trigRatioState = (o: MathObject): TrigRatioState => ({
    angle: clamp(simValue(o, 'angle', 37), 15, 75),
    scale: clamp(simValue(o, 'scale', 1.0), 0.7, 1.4),
    showIdentities: clampInt(simValue(o, 'showIdentities', 1), 0, 1, 1),
});

export const trigRatioRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = trigRatioState(k.o);
    const rad = (s.angle * Math.PI) / 180;
    const sinV = Math.sin(rad);
    const cosV = Math.cos(rad);
    const tanV = Math.tan(rad);
    const cotV = 1 / tanV;
    const betaDeg = 90 - s.angle;

    const fs = Math.max(9, Math.min(18, Math.min(r.w, r.h) / 14));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Sağdaki Kart Boyutları (Geniş, ferah ve asla metin çakışması yapmaz)
    const cardW = icon ? 0 : Math.min(285, Math.max(240, r.w * 0.45));
    const cardX = r.x + r.w - cardW - 12;
    const cardY = r.y + 10;

    // Üçgen koordinatları:
    // C köşesi ve "Karşı" etiketi ile kart arasında güvenli boşluk
    const padLeft = icon ? 10 : Math.max(28, r.w * 0.08);
    const padBottom = icon ? 10 : Math.max(34, r.h * 0.14);
    const ox = r.x + padLeft;
    const oy = r.y + r.h - padBottom;

    const safeRightGap = icon ? 10 : 72;
    const maxBaseAllowed = icon ? r.w * 0.75 : Math.max(65, cardX - ox - safeRightGap);
    const maxH = oy - r.y - 32;

    let baseLen = Math.max(65, Math.min(maxBaseAllowed, (r.w * 0.38) * s.scale * (cosV / 0.82)));
    let heightLen = baseLen * Math.tan(rad);

    // Tavan kontrolü
    if (heightLen > maxH) {
        const factor = maxH / heightLen;
        heightLen = maxH;
        baseLen *= factor;
    }

    const B = { x: ox, y: oy };
    const C = { x: ox + baseLen, y: oy };
    const A = { x: ox + baseLen, y: oy - heightLen };

    // Kenar uzunlukları (anlaşılır, temiz sayılar)
    const unitDiv = 26;
    const hyp = Math.hypot(baseLen, heightLen) / unitDiv;
    const opp = heightLen / unitDiv; // b (Karşı)
    const adj = baseLen / unitDiv;   // a (Komşu)

    // ─────────────────────────────────────────────────────────────────────────
    // 1. SAĞDAKİ DETAYLI FORMÜL VE BİLGİ KARTI
    // ─────────────────────────────────────────────────────────────────────────
    if (!icon) {
        // Kart içeriğinin dikey bütçesini hesaplayalım
        const maxAllowedCardH = r.h - 20;
        const headH = 30;
        const showId = s.showIdentities === 1;

        // 4 Oran satırı yüksekliği
        const itemH = maxAllowedCardH < 265 ? 32 : 36;
        const itemGap = 3;
        const ratiosTotalH = 4 * itemH + 3 * itemGap; // 137..153px

        // Özdeşlikler bölümü alanı
        const canShowIdentities = showId && maxAllowedCardH >= 240;
        const identitiesH = canShowIdentities ? (maxAllowedCardH < 280 ? 44 : 60) : 0;

        // Kartın gerçek içeriğe tam oturan yüksekliği
        const neededCardH = headH + 6 + ratiosTotalH + (canShowIdentities ? (6 + identitiesH) : 0) + 8;
        const cardH = Math.min(maxAllowedCardH, neededCardH);

        c.save();
        // Kart Ana Gövdesi
        c.fillStyle = '#0f172a';
        c.strokeStyle = '#334155';
        c.lineWidth = 1.5;
        c.beginPath();
        if (typeof c.roundRect === 'function') {
            c.roundRect(cardX, cardY, cardW, cardH, 12);
        } else {
            c.rect(cardX, cardY, cardW, cardH);
        }
        c.fill();
        c.stroke();
        // Kart içine klipleme: hiçbir metin kart sınırını ASLA aşamaz!
        c.clip();

        // Kart Üst Başlık Şeridi
        c.fillStyle = '#1e293b';
        c.fillRect(cardX, cardY, cardW, headH);
        c.strokeStyle = '#334155';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(cardX, cardY + headH);
        c.lineTo(cardX + cardW, cardY + headH);
        c.stroke();

        // Başlık: Sol tarafta "TRİGONOMETRİK ORANLAR", sağ tarafta açının rozeti
        drawText(k, 'TRİGONOMETRİK ORANLAR', cardX + 12, cardY + headH / 2, {
            align: 'left',
            color: '#38bdf8',
            halo: false,
            size: 11,
            bold: true,
        });

        drawText(k, `α = ${s.angle.toFixed(0)}°`, cardX + cardW - 12, cardY + headH / 2, {
            align: 'right',
            color: '#f59e0b',
            halo: false,
            size: 11.5,
            bold: true,
        });

        // 4 Temel Oran Veri Yapısı
        const ratioRows = [
            {
                name: 'sin α',
                def: 'Karşı / Hip',
                formula: `b / c = ${opp.toFixed(1)} / ${hyp.toFixed(1)}`,
                val: sinV.toFixed(3),
                col: '#38bdf8',
                bg: 'rgba(56, 189, 248, 0.08)',
                bdr: 'rgba(56, 189, 248, 0.22)',
            },
            {
                name: 'cos α',
                def: 'Komşu / Hip',
                formula: `a / c = ${adj.toFixed(1)} / ${hyp.toFixed(1)}`,
                val: cosV.toFixed(3),
                col: '#fb7185',
                bg: 'rgba(251, 113, 133, 0.08)',
                bdr: 'rgba(251, 113, 133, 0.22)',
            },
            {
                name: 'tan α',
                def: 'Karşı / Komşu',
                formula: `b / a = ${opp.toFixed(1)} / ${adj.toFixed(1)}`,
                val: tanV.toFixed(3),
                col: '#fbbf24',
                bg: 'rgba(251, 191, 36, 0.08)',
                bdr: 'rgba(251, 191, 36, 0.22)',
            },
            {
                name: 'cot α',
                def: 'Komşu / Karşı',
                formula: `a / b = ${adj.toFixed(1)} / ${opp.toFixed(1)}`,
                val: cotV.toFixed(3),
                col: '#34d399',
                bg: 'rgba(52, 211, 153, 0.08)',
                bdr: 'rgba(52, 211, 153, 0.22)',
            },
        ];

        // 2 Satırlı, asla çakışmayan ferah oran kutucukları
        const startY = cardY + headH + 6;
        const itemPadX = 8;
        const innerW = cardW - itemPadX * 2;

        ratioRows.forEach((item, idx) => {
            const itemY = startY + idx * (itemH + itemGap);
            const itemX = cardX + itemPadX;

            c.fillStyle = item.bg;
            c.strokeStyle = item.bdr;
            c.lineWidth = 1;
            c.beginPath();
            if (typeof c.roundRect === 'function') {
                c.roundRect(itemX, itemY, innerW, itemH, 6);
            } else {
                c.rect(itemX, itemY, innerW, itemH);
            }
            c.fill();
            c.stroke();

            // 1. Satır: Fonksiyon Adı & Tanım (Solda), Sonuç Değeri (Sağda)
            const row1Y = itemY + itemH * 0.33;
            drawText(k, `${item.name} = ${item.def}`, itemX + 8, row1Y, {
                align: 'left',
                color: item.col,
                halo: false,
                size: 11,
                bold: true,
            });
            drawText(k, `= ${item.val}`, itemX + innerW - 8, row1Y, {
                align: 'right',
                color: '#ffffff',
                halo: false,
                size: 11.5,
                bold: true,
            });

            // 2. Satır: Sembolik & Sayısal Kesir Gösterimi (Solda, hafif soluk)
            const row2Y = itemY + itemH * 0.74;
            drawText(k, `(${item.formula})`, itemX + 8, row2Y, {
                align: 'left',
                color: '#94a3b8',
                halo: false,
                size: 9.5,
                bold: false,
            });
        });

        // Özdeşlikler ve Tümler Açı Bölümü
        if (canShowIdentities) {
            const sepY = startY + ratiosTotalH + 4;
            c.strokeStyle = '#334155';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(cardX + 10, sepY);
            c.lineTo(cardX + cardW - 10, sepY);
            c.stroke();

            if (identitiesH >= 55) {
                // Ferah mod: Başlık + 3 net satır
                const titleY = sepY + 11;
                drawText(k, 'TEMEL ÖZDEŞLİKLER (Maarif Modeli)', cardX + cardW / 2, titleY, {
                    align: 'center',
                    color: '#64748b',
                    halo: false,
                    size: 9,
                    bold: true,
                });

                const id1Y = titleY + 14;
                drawText(k, 'sin²α + cos²α = 1.000 ✓', cardX + cardW / 2, id1Y, {
                    align: 'center',
                    color: '#a7f3d0',
                    halo: false,
                    size: 10.5,
                    bold: true,
                });

                const id2Y = id1Y + 13;
                drawText(k, 'tan α · cot α = 1.000 ✓', cardX + cardW / 2, id2Y, {
                    align: 'center',
                    color: '#fde68a',
                    halo: false,
                    size: 10.5,
                    bold: true,
                });

                const id3Y = id2Y + 13;
                drawText(k, `β = ${betaDeg.toFixed(0)}° (Tümler) ⇒ sin α = cos β`, cardX + cardW / 2, id3Y, {
                    align: 'center',
                    color: '#c084fc',
                    halo: false,
                    size: 9.5,
                    bold: true,
                });
            } else {
                // Kompakt mod: 2 satır
                const id1Y = sepY + 13;
                drawText(k, 'sin²α + cos²α = 1.000 ✓   |   tan α · cot α = 1', cardX + cardW / 2, id1Y, {
                    align: 'center',
                    color: '#a7f3d0',
                    halo: false,
                    size: 9.5,
                    bold: true,
                });

                const id2Y = id1Y + 14;
                drawText(k, `β = ${betaDeg.toFixed(0)}° (Tümler) ⇒ sin α = cos β = ${sinV.toFixed(3)}`, cardX + cardW / 2, id2Y, {
                    align: 'center',
                    color: '#c084fc',
                    halo: false,
                    size: 9.5,
                    bold: true,
                });
            }
        }
        c.restore();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DİK ÜÇGENİN ÇİZİMİ (Pedagojik Renk Kodlu ve Estetik)
    // ─────────────────────────────────────────────────────────────────────────
    // Üçgen iç dolgusu (Yumuşak mavi ton)
    c.fillStyle = 'rgba(56, 189, 248, 0.08)';
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(C.x, C.y);
    c.lineTo(A.x, A.y);
    c.closePath();
    c.fill();

    // Kenarları renk kodlu çizelim:
    // Komşu Dik Kenar (BC): Zümrüt Yeşili (#10b981)
    c.strokeStyle = '#10b981';
    c.lineWidth = Math.max(3, k.lw + 1);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(C.x, C.y);
    c.stroke();

    // Karşı Dik Kenar (CA): Gül / Mercan Pembe (#f43f5e)
    c.strokeStyle = '#f43f5e';
    c.lineWidth = Math.max(3, k.lw + 1);
    c.beginPath();
    c.moveTo(C.x, C.y);
    c.lineTo(A.x, A.y);
    c.stroke();

    // Hipotenüs (AB): Parlak Mavi (#2563eb / #38bdf8)
    c.strokeStyle = '#2563eb';
    c.lineWidth = Math.max(3.5, k.lw + 1.5);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(A.x, A.y);
    c.stroke();

    // Dik açı sembolü (C köşesinde)
    const sq = Math.min(14, baseLen * 0.13);
    c.strokeStyle = '#64748b';
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(C.x - sq, C.y);
    c.lineTo(C.x - sq, C.y - sq);
    c.lineTo(C.x, C.y - sq);
    c.stroke();
    // Dik açı iç noktası
    c.beginPath();
    c.arc(C.x - sq / 2, C.y - sq / 2, 2, 0, Math.PI * 2);
    c.fillStyle = '#64748b';
    c.fill();

    // Açı yayı ve dolgusu (B köşesinde α)
    const arcR = Math.min(36, baseLen * 0.35);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.arc(B.x, B.y, arcR, -rad, 0);
    c.closePath();
    c.fillStyle = 'rgba(245, 158, 11, 0.16)';
    c.fill();

    c.beginPath();
    c.arc(B.x, B.y, arcR, -rad, 0);
    c.strokeStyle = '#d97706';
    c.lineWidth = 2.4;
    c.stroke();

    // Tümler Açı yayı (A köşesinde β = 90 - α)
    const betaRad = (betaDeg * Math.PI) / 180;
    const arcRb = Math.min(30, Math.min(baseLen, heightLen) * 0.36);
    if (arcRb >= 14 && !icon) {
        c.beginPath();
        c.moveTo(A.x, A.y);
        c.arc(A.x, A.y, arcRb, Math.PI / 2, Math.PI / 2 + betaRad);
        c.closePath();
        c.fillStyle = 'rgba(168, 85, 247, 0.15)';
        c.fill();

        c.beginPath();
        c.arc(A.x, A.y, arcRb, Math.PI / 2, Math.PI / 2 + betaRad);
        c.strokeStyle = '#9333ea';
        c.lineWidth = 2.2;
        c.stroke();

        drawText(k, `β = ${betaDeg.toFixed(0)}°`, A.x - arcRb - fs * 0.4, A.y + arcRb * 0.8, {
            align: 'right',
            color: '#9333ea',
            halo: true,
            scale: 0.84,
        });
    }

    if (!icon) {
        // Köşe ve açı etiketleri
        drawText(k, `α = ${s.angle.toFixed(0)}°`, B.x + arcR + fs * 0.6, B.y - fs * 0.55, {
            align: 'left',
            color: '#d97706',
            scale: 0.92,
        });
        drawText(k, 'B', B.x - fs * 0.7, B.y + fs * 0.4, { align: 'right', halo: true, scale: 0.95 });
        drawText(k, 'C (90°)', C.x, C.y + fs * 0.95, { align: 'center', halo: true, scale: 0.85 });
        drawText(k, 'A', A.x, A.y - fs * 0.8, { align: 'center', halo: true, scale: 1.0 });

        // Kenar etiketleri (Renk kodlu ve açıkça formüle referans veren)
        // Karşı Dik Kenar etiketi
        drawText(k, `Karşı (b): ${opp.toFixed(1)}`, C.x + fs * 0.5, (A.y + C.y) / 2, {
            align: 'left',
            color: '#e11d48',
            halo: true,
            scale: 0.86,
        });
        // Komşu Dik Kenar etiketi
        drawText(k, `Komşu (a): ${adj.toFixed(1)}`, (B.x + C.x) / 2, B.y + fs * 1.15, {
            align: 'center',
            color: '#059669',
            halo: true,
            scale: 0.86,
        });
        // Hipotenüs etiketi
        drawText(k, `Hipotenüs (c): ${hyp.toFixed(1)}`, (B.x + A.x) / 2 - fs * 0.8, (B.y + A.y) / 2 - fs * 0.55, {
            align: 'right',
            color: '#1d4ed8',
            halo: true,
            scale: 0.88,
        });
    }

    c.restore();
};

export const trigRatioSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = trigRatioState(o);
        const rad = (s.angle * Math.PI) / 180;
        const cosV = Math.cos(rad);

        const cardW = isIconSize(r) ? 0 : Math.min(285, Math.max(240, r.w * 0.45));
        const cardX = r.x + r.w - cardW - 12;

        const padLeft = isIconSize(r) ? 10 : Math.max(28, r.w * 0.08);
        const padBottom = isIconSize(r) ? 10 : Math.max(34, r.h * 0.14);
        const ox = r.x + padLeft;
        const oy = r.y + r.h - padBottom;

        const safeRightGap = isIconSize(r) ? 10 : 72;
        const maxBaseAllowed = isIconSize(r) ? r.w * 0.75 : Math.max(65, cardX - ox - safeRightGap);
        let baseLen = Math.max(65, Math.min(maxBaseAllowed, (r.w * 0.38) * s.scale * (cosV / 0.82)));
        let heightLen = baseLen * Math.tan(rad);

        const maxH = oy - r.y - 32;
        if (heightLen > maxH) {
            const factor = maxH / heightLen;
            heightLen = maxH;
            baseLen *= factor;
        }

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
            const padLeft = isIconSize(r) ? 10 : Math.max(28, r.w * 0.08);
            const padBottom = isIconSize(r) ? 10 : Math.max(34, r.h * 0.14);
            const ox = r.x + padLeft;
            const oy = r.y + r.h - padBottom;
            const dx = Math.max(25, p.x - ox);
            const dy = Math.max(20, oy - p.y);
            const deg = Math.round(clamp((Math.atan2(dy, dx) * 180) / Math.PI, 15, 75));
            return { angle: deg };
        }
        return {};
    },
    params: [
        { key: 'angle', label: 'Dar Açı (α)', min: 15, max: 75, step: 1, unit: '°' },
        { key: 'scale', label: 'Ölçek', min: 0.7, max: 1.4, step: 0.1, unit: 'x' },
        { key: 'showIdentities', label: 'Özdeşlikler & Tümler Açı', min: 0, max: 1, step: 1 },
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
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Üçgen köşeleri (Çevrel çemberin ve alt kartın ferah kalması için tabanı 0.63'e çektik)
    const A = { x: r.x + r.w * s.ax, y: r.y + r.h * Math.max(0.22, s.ay) };
    const B = { x: r.x + r.w * 0.22, y: r.y + r.h * 0.63 };
    const C_pt = { x: r.x + r.w * 0.78, y: r.y + r.h * 0.63 };

    // Kenar uzunlukları (piksel ve normalize birim)
    const dBC = Math.hypot(C_pt.x - B.x, C_pt.y - B.y);
    const dAC = Math.hypot(C_pt.x - A.x, C_pt.y - A.y);
    const dAB = Math.hypot(A.x - B.x, A.y - B.y);

    const unitScale = dBC / 8;
    const a = dBC / unitScale;
    const b = dAC / unitScale;
    const cSide = dAB / unitScale;

    // 3 Açının kosinüs ve derece hesaplamaları
    const cosA = clamp((b * b + cSide * cSide - a * a) / (2 * b * cSide), -1, 1);
    const angA = Math.acos(cosA);
    const degA = (angA * 180) / Math.PI;

    const cosB = clamp((a * a + cSide * cSide - b * b) / (2 * a * cSide), -1, 1);
    const angB = Math.acos(cosB);
    const degB = (angB * 180) / Math.PI;

    const cosC = clamp((a * a + b * b - cSide * cSide) / (2 * a * b), -1, 1);
    const angC = Math.acos(cosC);
    const degC = (angC * 180) / Math.PI;

    // Çevrel Çember Merkezi (O)
    const d2 = 2 * (A.x * (B.y - C_pt.y) + B.x * (C_pt.y - A.y) + C_pt.x * (A.y - B.y));
    let O: { x: number; y: number; r: number } | null = null;
    if (Math.abs(d2) > 1e-4) {
        const ux = ((A.x ** 2 + A.y ** 2) * (B.y - C_pt.y) + (B.x ** 2 + B.y ** 2) * (C_pt.y - A.y) + (C_pt.x ** 2 + C_pt.y ** 2) * (A.y - B.y)) / d2;
        const uy = ((A.x ** 2 + A.y ** 2) * (C_pt.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C_pt.x) + (C_pt.x ** 2 + C_pt.y ** 2) * (B.x - A.x)) / d2;
        O = { x: ux, y: uy, r: Math.hypot(A.x - ux, A.y - uy) };
    }

    // Sinüs değerleri ve Çevrel Çap (2R)
    const sinA = Math.sin(angA);
    const sinB = Math.sin(angB);
    const sinC = Math.sin(angC);
    const R = sinA > 0.05 ? a / (2 * sinA) : 0;
    const diameter2R = 2 * R;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ÇEVREL ÇEMBER VE YARIÇAP ÇİZİMİ
    // ─────────────────────────────────────────────────────────────────────────
    if (O && O.r < r.w * 0.75 && !icon) {
        c.beginPath();
        c.arc(O.x, O.y, O.r, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(16, 185, 129, 0.40)';
        c.lineWidth = 1.5;
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

        // O noktasından C köşesine yarıçap (R) kesikli çizgisi
        c.beginPath();
        c.moveTo(O.x, O.y);
        c.lineTo(C_pt.x, C_pt.y);
        c.strokeStyle = 'rgba(16, 185, 129, 0.65)';
        c.lineWidth = 1.4;
        c.setLineDash([3, 3]);
        c.stroke();
        c.setLineDash([]);

        drawText(k, `R = ${R.toFixed(1)}`, (O.x + C_pt.x) / 2 + 6, (O.y + C_pt.y) / 2 - 4, {
            align: 'left',
            color: '#059669',
            halo: true,
            size: 10,
            bold: true,
        });

        drawText(k, 'O (Çevrel M.)', O.x + 8, O.y + 4, {
            align: 'left',
            color: '#059669',
            halo: true,
            size: 10,
            bold: true,
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. ÜÇGEN GÖVDESİ VE KENARLAR (Renk Kodlu)
    // ─────────────────────────────────────────────────────────────────────────
    c.fillStyle = 'rgba(56, 189, 248, 0.08)';
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.closePath();
    c.fill();

    // a kenarı (BC) - Zümrüt Yeşili (#10b981)
    c.strokeStyle = '#10b981';
    c.lineWidth = Math.max(3, k.lw + 1);
    c.beginPath();
    c.moveTo(B.x, B.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.stroke();

    // b kenarı (AC) - Gül / Mercan Pembe (#f43f5e)
    c.strokeStyle = '#f43f5e';
    c.lineWidth = Math.max(3, k.lw + 1);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(C_pt.x, C_pt.y);
    c.stroke();

    // c kenarı (AB) - Parlak Mavi (#2563eb)
    c.strokeStyle = '#2563eb';
    c.lineWidth = Math.max(3, k.lw + 1);
    c.beginPath();
    c.moveTo(A.x, A.y);
    c.lineTo(B.x, B.y);
    c.stroke();

    // 3 Açının yayları ve etiketleri
    const arcRad = 26;
    // A açısı yayı (Tepe - Turuncu/Kehribar)
    c.beginPath();
    c.arc(A.x, A.y, arcRad, Math.atan2(B.y - A.y, B.x - A.x), Math.atan2(C_pt.y - A.y, C_pt.x - A.x));
    c.strokeStyle = '#f59e0b';
    c.lineWidth = 2.2;
    c.stroke();

    // B açısı yayı (Mavi)
    c.beginPath();
    c.arc(B.x, B.y, arcRad, -Math.atan2(B.y - A.y, A.x - B.x), 0);
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 2.0;
    c.stroke();

    // C açısı yayı (Gül Pembe)
    c.beginPath();
    c.arc(C_pt.x, C_pt.y, arcRad, Math.PI - Math.atan2(C_pt.y - A.y, C_pt.x - A.x), Math.PI);
    c.strokeStyle = '#fb7185';
    c.lineWidth = 2.0;
    c.stroke();

    // Köşe etiketleri
    drawText(k, `A (${degA.toFixed(0)}°)`, A.x, A.y - 14, { align: 'center', color: '#b45309', halo: true, size: 12, bold: true });
    drawText(k, `B (${degB.toFixed(0)}°)`, B.x - 12, B.y + 12, { align: 'right', color: '#0284c7', halo: true, size: 11, bold: true });
    drawText(k, `C (${degC.toFixed(0)}°)`, C_pt.x + 12, C_pt.y + 12, { align: 'left', color: '#e11d48', halo: true, size: 11, bold: true });

    if (!icon) {
        // Kenar etiketleri
        drawText(k, `a = ${a.toFixed(1)}`, (B.x + C_pt.x) / 2, B.y + 16, { align: 'center', color: '#059669', halo: true, size: 11.5, bold: true });
        drawText(k, `b = ${b.toFixed(1)}`, (A.x + C_pt.x) / 2 + 14, (A.y + C_pt.y) / 2, { align: 'left', color: '#e11d48', halo: true, size: 11.5, bold: true });
        drawText(k, `c = ${cSide.toFixed(1)}`, (A.x + B.x) / 2 - 14, (A.y + B.y) / 2, { align: 'right', color: '#1d4ed8', halo: true, size: 11.5, bold: true });

        // ─────────────────────────────────────────────────────────────────────
        // 3. ÜST PANEL: KOSİNÜS TEOREMİ (Açık, Net, Sayısal Doğrulamalı)
        // ─────────────────────────────────────────────────────────────────────
        const topW = Math.min(540, r.w - 24);
        const topH = 58;
        const topX = r.x + (r.w - topW) / 2;
        const topY = r.y + 6;

        c.save();
        c.fillStyle = '#0f172a';
        c.strokeStyle = '#334155';
        c.lineWidth = 1.5;
        c.beginPath();
        if (typeof c.roundRect === 'function') {
            c.roundRect(topX, topY, topW, topH, 10);
        } else {
            c.rect(topX, topY, topW, topH);
        }
        c.fill();
        c.stroke();
        c.clip();

        // 1. Satır: Formül ve Durum
        const a2 = (a * a).toFixed(1);
        const b2c2 = (b * b + cSide * cSide).toFixed(1);
        const cosTerm = (2 * b * cSide * cosA).toFixed(1);

        drawText(k, '📐 KOSİNÜS TEOREMİ: a² = b² + c² − 2·b·c·cos(A)', topX + 12, topY + 12, {
            align: 'left',
            color: '#38bdf8',
            halo: false,
            size: 11,
            bold: true,
        });

        // Sağ köşe durum etiketi
        let stateTag = '';
        let stateCol = '#a7f3d0';
        if (Math.abs(degA - 90) < 1.5) {
            stateTag = 'A = 90° (Tam Pisagor) ✓';
            stateCol = '#93c5fd';
        } else if (degA < 90) {
            stateTag = `Dar Açı (A = ${degA.toFixed(0)}°) ⇒ a² < b² + c²`;
            stateCol = '#a7f3d0';
        } else {
            stateTag = `Geniş Açı (A = ${degA.toFixed(0)}°) ⇒ a² > b² + c²`;
            stateCol = '#fca5a5';
        }

        drawText(k, stateTag, topX + topW - 12, topY + 12, {
            align: 'right',
            color: stateCol,
            halo: false,
            size: 10.5,
            bold: true,
        });

        // 2. Satır: Tam Sayısal Açılım
        const formulaCalc = `${a2} = (${b.toFixed(1)})² + (${cSide.toFixed(1)})² − 2·(${b.toFixed(1)})·(${cSide.toFixed(1)})·cos(${degA.toFixed(0)}°)`;
        drawText(k, formulaCalc, topX + 12, topY + 29, {
            align: 'left',
            color: '#cbd5e1',
            halo: false,
            size: 10,
            bold: false,
        });

        // 3. Satır: Sonuç Değer Doğrulaması
        const evalCalc = `= ${b2c2} − (${cosTerm}) = ${a2} ✓  (Teorem Eksiksiz Sağlandı)`;
        drawText(k, evalCalc, topX + 12, topY + 45, {
            align: 'left',
            color: '#34d399',
            halo: false,
            size: 10,
            bold: true,
        });
        c.restore();

        // ─────────────────────────────────────────────────────────────────────
        // 4. ALT PANEL: SİNÜS TEOREMİ VE ÇEVREL ÇAP (2R)
        // ─────────────────────────────────────────────────────────────────────
        const botW = Math.min(540, r.w - 24);
        const botH = 58;
        const botX = r.x + (r.w - botW) / 2;
        const botY = r.y + r.h - botH - 6;

        c.save();
        c.fillStyle = '#0f172a';
        c.strokeStyle = '#334155';
        c.lineWidth = 1.5;
        c.beginPath();
        if (typeof c.roundRect === 'function') {
            c.roundRect(botX, botY, botW, botH, 10);
        } else {
            c.rect(botX, botY, botW, botH);
        }
        c.fill();
        c.stroke();
        c.clip();

        // 1. Satır: Teorem Ana Formülü
        drawText(k, '⭕ SİNÜS TEOREMİ: a / sin(A) = b / sin(B) = c / sin(C) = 2R', botX + 12, botY + 12, {
            align: 'left',
            color: '#c084fc',
            halo: false,
            size: 11,
            bold: true,
        });

        drawText(k, `2R = ${diameter2R.toFixed(1)} br (Çap)`, botX + botW - 12, botY + 12, {
            align: 'right',
            color: '#fbbf24',
            halo: false,
            size: 11,
            bold: true,
        });

        // 2. Satır: 3 Açı ve 3 Kenarın Eşzamanlı Oranları
        const sineRatiosText = `${a.toFixed(1)} / sin(${degA.toFixed(0)}°) = ${b.toFixed(1)} / sin(${degB.toFixed(0)}°) = ${cSide.toFixed(1)} / sin(${degC.toFixed(0)}°) = ${diameter2R.toFixed(1)} ✓`;
        drawText(k, sineRatiosText, botX + 12, botY + 29, {
            align: 'left',
            color: '#f8fafc',
            halo: false,
            size: 10.5,
            bold: true,
        });

        // 3. Satır: Çevrel Çember Yarıçapı ve Çap Açıklaması
        const circumText = `Çevrel Çember Yarıçapı: R = ${R.toFixed(1)} br   |   Çevrel Çap: 2R = ${diameter2R.toFixed(1)} br (Tüm Oranlar Eşittir)`;
        drawText(k, circumText, botX + 12, botY + 45, {
            align: 'left',
            color: '#94a3b8',
            halo: false,
            size: 9.5,
            bold: false,
        });
        c.restore();
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
    const B = { x: r.x + r.w * 0.22, y: r.y + r.h * 0.74 };
    const C_pt = { x: r.x + r.w * 0.78, y: r.y + r.h * 0.74 };

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
        // Euler Doğrusu (Canlı altın/kehribar çizgi)
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

        // Çizginin üst ucuna şık etiket (Noktalarla çakışmaz)
        const endX = H.y < O.y ? H.x - dx * 0.35 : O.x + dx * 0.35;
        const endY = H.y < O.y ? H.y - dy * 0.35 : O.y + dy * 0.35;
        drawText(k, 'Euler Doğrusu', endX, endY - fs * 0.5, {
            align: 'center',
            color: '#b45309',
            halo: true,
            scale: 0.74,
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

    const B = { x: r.x + r.w * 0.22, y: r.y + r.h * 0.74 };
    const C_pt = { x: r.x + r.w * 0.78, y: r.y + r.h * 0.74 };
    const apexY = r.y + r.h * (0.74 - s.hRatio);
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

        // Tepe A noktası sağdaysa etiketi sola, soldaysa sağa yazalım
        const cavX = A.x > r.x + r.w * 0.55 ? r.x + r.w * 0.10 : r.x + r.w * 0.90;
        const cavAlign = A.x > r.x + r.w * 0.55 ? 'left' : 'right';

        drawText(k, 'd // BC (Cavalieri Doğrusu)', cavX, apexY - fs * 0.6, {
            align: cavAlign,
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
        const apexY = r.y + r.h * (0.74 - s.hRatio);
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
            const hRatio = Math.round(clamp(0.74 - (p.y - r.y) / r.h, 0.28, 0.62) * 100) / 100;
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
