// src/components/drawing/grade10StatsSims.ts
// 10. Sınıf Matematik — Yeni Maarif Modeli "İstatistiksel Araştırma Süreci" Canlı Çizim Simülasyonları
// Tema 2: İki Kategorik Değişkenli Veriler, İki Yönlü Tablolar ve Kümeli Sütun Grafikleri

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
        scale = 0.82,
    } = options;

    const fs = Math.round(k.fs * scale);
    k.c.save();
    k.c.font = `700 ${fs}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
    const m = k.c.measureText(text);
    const padX = fs * 0.85;
    const padY = fs * 0.4;
    const bw = m.width + padX * 2;
    const bh = fs * 1.45 + padY * 2;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;
    const rad = bh / 2;

    k.c.fillStyle = bgColor;
    k.c.strokeStyle = borderColor;
    k.c.lineWidth = 1.4;
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
   1. İKİ YÖNLÜ TABLO & KOŞULLU SIKLIK ARACI (two_way_table_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface TableContext {
    title: string;
    rowName: string;
    r1: string;
    r2: string;
    colName: string;
    c1: string;
    c2: string;
    base: [number, number, number, number]; // a, b, c, d
}

const TABLE_CONTEXTS: TableContext[] = [
    {
        title: 'Güneş Enerjisi & Fatura Durumu',
        rowName: 'Güneş Enerjisi',
        r1: 'Kullanan',
        r2: 'Kullanmayan',
        colName: 'Elektrik Faturası',
        c1: 'Düşük (<A TL)',
        c2: 'Yüksek (≥A TL)',
        base: [70, 10, 20, 60],
    },
    {
        title: 'Konut Türü & Evcil Hayvan',
        rowName: 'Konut Türü',
        r1: 'Apartman',
        r2: 'Müstakil Ev',
        colName: 'Evcil Hayvan',
        c1: 'Var',
        c2: 'Yok',
        base: [30, 90, 50, 30],
    },
    {
        title: 'Sınıf Seviyesi & Ayakkabı Türü',
        rowName: 'Sınıf Seviyesi',
        r1: '9. Sınıf',
        r2: '12. Sınıf',
        colName: 'Ayakkabı',
        c1: 'Bağcıklı',
        c2: 'Bağcıksız',
        base: [55, 25, 30, 50],
    },
    {
        title: 'Kitap Okuma & Spor Alışkanlığı',
        rowName: 'Kitap Okuma',
        r1: 'Düzenli',
        r2: 'Az / Yok',
        colName: 'Düzenli Spor',
        c1: 'Yapar',
        c2: 'Yapmaz',
        base: [60, 40, 30, 70],
    },
];

interface TwoWayTableState {
    contextIdx: number; // 0..3
    mode: number; // 0: Sıklık, 1: Toplam Göreli %, 2: Satır Koşullu %, 3: Sütun Koşullu %
    shift: number; // -30..30 (ilişki gücünü değiştirmek için)
}

const twoWayTableState = (o: MathObject): TwoWayTableState => ({
    contextIdx: clampInt(simValue(o, 'contextIdx', 0), 0, 3, 0),
    mode: clampInt(simValue(o, 'mode', 0), 0, 3, 0),
    shift: clamp(simValue(o, 'shift', 0), -30, 30),
});

export const twoWayTableRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = twoWayTableState(k.o);
    const ctxData = TABLE_CONTEXTS[s.contextIdx] || TABLE_CONTEXTS[0];

    const fs = Math.max(9, Math.min(17, Math.min(r.w, r.h) / 15));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Frekansları hesapla (shift ile ilişki gücü dinamik artırılıp azaltılabilir)
    const rawA = Math.max(5, Math.round(ctxData.base[0] + s.shift));
    const rawB = Math.max(5, Math.round(ctxData.base[1] - s.shift * 0.7));
    const rawC = Math.max(5, Math.round(ctxData.base[2] - s.shift * 0.7));
    const rawD = Math.max(5, Math.round(ctxData.base[3] + s.shift));

    const r1Sum = rawA + rawB;
    const r2Sum = rawC + rawD;
    const c1Sum = rawA + rawC;
    const c2Sum = rawB + rawD;
    const totalN = rawA + rawB + rawC + rawD;

    // Satır koşullu oranları
    const p1 = rawA / r1Sum; // 1. satırın 1. sütun oranı
    const p2 = rawC / r2Sum; // 2. satırın 1. sütun oranı
    const diff = Math.abs(p1 - p2);

    // Mod metni
    const modeNames = [
        'Mutlak Sıklık (Frekans)',
        'Toplamdaki Göreli Sıklık (%)',
        'Satır Koşullu Göreli Sıklık (%)',
        'Sütun Koşullu Göreli Sıklık (%)',
    ];

    if (!icon) {
        // Üst Başlık ve Mod Rozeti
        drawBadge(k, `${ctxData.title} · ${modeNames[s.mode]}`, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#1e293b',
            borderColor: '#cbd5e1',
            scale: 0.82,
        });
    }

    // Tablo Çizim Alanı
    const tableX = r.x + (icon ? 6 : r.w * 0.05);
    const tableY = r.y + (icon ? 6 : fs * 2.5);
    const tableW = icon ? r.w - 12 : r.w * 0.90;
    const tableH = icon ? r.h - 12 : r.h * 0.58;

    const cols = 4; // [Değişken, c1, c2, Toplam]
    const rows = 4; // [Başlık, r1, r2, Toplam]

    const colW0 = tableW * 0.31;
    const colWRest = (tableW - colW0) / 3;
    const rowH = tableH / rows;

    const colX = [tableX, tableX + colW0, tableX + colW0 + colWRest, tableX + colW0 + colWRest * 2, tableX + tableW];

    // Tablo Zemin ve Hücreleri
    c.save();
    c.fillStyle = '#ffffff';
    c.fillRect(tableX, tableY, tableW, tableH);

    // Başlık satırı zemini
    c.fillStyle = '#f1f5f9';
    c.fillRect(tableX, tableY, tableW, rowH);
    // İlk sütun zemini
    c.fillRect(tableX, tableY, colW0, tableH);
    // Toplam satırı ve sütunu zemini
    c.fillStyle = '#e2e8f0';
    c.fillRect(colX[3], tableY, colWRest, tableH);
    c.fillRect(tableX, tableY + rowH * 3, tableW, rowH);

    // Hücre Çerçeveleri
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 1.2;

    for (let i = 0; i <= rows; i++) {
        const y = tableY + i * rowH;
        c.beginPath();
        c.moveTo(tableX, y);
        c.lineTo(tableX + tableW, y);
        c.stroke();
    }
    for (let j = 0; j <= cols; j++) {
        const x = colX[j];
        c.beginPath();
        c.moveTo(x, tableY);
        c.lineTo(x, tableY + tableH);
        c.stroke();
    }
    c.restore();

    // Hücre Metinlerini Biçimlendirme
    const fmt = (val: number, rowTot: number, colTot: number) => {
        if (s.mode === 0) return `${val}`;
        if (s.mode === 1) return `%${((val / totalN) * 100).toFixed(1)}`;
        if (s.mode === 2) return `%${((val / rowTot) * 100).toFixed(1)}`;
        return `%${((val / colTot) * 100).toFixed(1)}`;
    };

    const cyAt = (rIdx: number) => tableY + (rIdx + 0.5) * rowH;
    const cxAt = (cIdx: number) => (cIdx === 0 ? tableX + colW0 / 2 : colX[cIdx] + colWRest / 2);

    // 1. Satır: Başlıklar
    drawText(k, `${ctxData.rowName} \\ ${ctxData.colName}`, cxAt(0), cyAt(0), {
        scale: 0.74,
        color: '#475569',
        halo: false,
    });
    drawText(k, ctxData.c1, cxAt(1), cyAt(0), { scale: 0.82, color: '#1e40af', halo: false });
    drawText(k, ctxData.c2, cxAt(2), cyAt(0), { scale: 0.82, color: '#9d174d', halo: false });
    drawText(k, 'Toplam', cxAt(3), cyAt(0), { scale: 0.82, color: '#0f172a', halo: false });

    // 2. Satır: r1
    drawText(k, ctxData.r1, cxAt(0), cyAt(1), { scale: 0.82, color: '#0f172a', halo: false });
    drawText(k, fmt(rawA, r1Sum, c1Sum), cxAt(1), cyAt(1), { scale: 0.88, color: '#1e40af', halo: false });
    drawText(k, fmt(rawB, r1Sum, c2Sum), cxAt(2), cyAt(1), { scale: 0.88, color: '#9d174d', halo: false });
    drawText(k, s.mode === 2 ? '%100' : s.mode === 1 ? `%${((r1Sum / totalN) * 100).toFixed(1)}` : `${r1Sum}`, cxAt(3), cyAt(1), {
        scale: 0.85,
        color: '#0f172a',
        halo: false,
    });

    // 3. Satır: r2
    drawText(k, ctxData.r2, cxAt(0), cyAt(2), { scale: 0.82, color: '#0f172a', halo: false });
    drawText(k, fmt(rawC, r2Sum, c1Sum), cxAt(1), cyAt(2), { scale: 0.88, color: '#1e40af', halo: false });
    drawText(k, fmt(rawD, r2Sum, c2Sum), cxAt(2), cyAt(2), { scale: 0.88, color: '#9d174d', halo: false });
    drawText(k, s.mode === 2 ? '%100' : s.mode === 1 ? `%${((r2Sum / totalN) * 100).toFixed(1)}` : `${r2Sum}`, cxAt(3), cyAt(2), {
        scale: 0.85,
        color: '#0f172a',
        halo: false,
    });

    // 4. Satır: Sütun Toplamları
    drawText(k, 'Toplam', cxAt(0), cyAt(3), { scale: 0.82, color: '#0f172a', halo: false });
    drawText(k, s.mode === 3 ? '%100' : s.mode === 1 ? `%${((c1Sum / totalN) * 100).toFixed(1)}` : `${c1Sum}`, cxAt(1), cyAt(3), {
        scale: 0.85,
        color: '#0f172a',
        halo: false,
    });
    drawText(k, s.mode === 3 ? '%100' : s.mode === 1 ? `%${((c2Sum / totalN) * 100).toFixed(1)}` : `${c2Sum}`, cxAt(2), cyAt(3), {
        scale: 0.85,
        color: '#0f172a',
        halo: false,
    });
    drawText(k, s.mode === 0 ? `N = ${totalN}` : '%100.0', cxAt(3), cyAt(3), {
        scale: 0.88,
        color: '#0f172a',
        halo: false,
    });

    if (!icon) {
        // İstatistiksel İlişkililik Analiz Kartı (Alt Rozet)
        const isAssociated = diff >= 0.12;
        const analysisText = isAssociated
            ? `✦ Koşullu Oran Farkı: %${(diff * 100).toFixed(1)} ⇒ Değişkenler Arasında İlişkililik Var!`
            : `✓ Koşullu Oran Farkı: %${(diff * 100).toFixed(1)} ⇒ Değişkenler Birbirinden Bağımsız Görünüyor`;

        const badgeBg = isAssociated ? '#fef3c7' : '#dcfce7';
        const badgeCol = isAssociated ? '#92400e' : '#166534';
        const badgeBdr = isAssociated ? '#fde68a' : '#86efac';

        drawBadge(k, analysisText, r.x + r.w / 2, tableY + tableH + fs * 1.5, {
            bgColor: badgeBg,
            textColor: badgeCol,
            borderColor: badgeBdr,
            scale: 0.8,
        });

        // Maarif Modeli Hayati Uyarısı: "İlişkililik ≠ Neden-Sonuç"
        drawText(
            k,
            '⚠️ Önemli (Maarif Modeli): İki değişkenin ilişkili olması, aralarında bir "Neden-Sonuç" olduğu anlamına gelmez!',
            r.x + r.w / 2,
            r.y + r.h - fs * 0.9,
            { align: 'center', color: '#dc2626', halo: true, scale: 0.74 }
        );
    }

    c.restore();
};

export const twoWayTableSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = twoWayTableState(o);
        const fs = Math.max(9, Math.min(17, Math.min(r.w, r.h) / 15));
        const tableY = r.y + fs * 2.5;
        const tableH = r.h * 0.58;

        // Mod değiştirici hızlı tıklama butonu (Tablonun hemen üstü sağında)
        return [
            {
                id: 'nextMode',
                x: r.x + r.w * 0.90,
                y: tableY - fs * 0.8,
                type: 'toggle',
                label: 'Gösterim Modunu Değiştir (Sıklık ⟷ Yüzde)',
                on: s.mode > 0,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'nextMode') {
            const cur = twoWayTableState(o).mode;
            return { mode: (cur + 1) % 4 };
        }
        return {};
    },
    params: [
        { key: 'contextIdx', label: 'Senaryo Seçimi', min: 0, max: 3, step: 1 },
        { key: 'mode', label: 'Tablo Modu (0:Sıklık, 1:Toplam%, 2:Satır%, 3:Sütun%)', min: 0, max: 3, step: 1 },
        { key: 'shift', label: 'İlişki Gücü (Değişebilirlik)', min: -30, max: 30, step: 5 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   2. KÜMELİ SÜTUN GRAFİĞİ LABORATUVARI (clustered_bar_sim)
   ───────────────────────────────────────────────────────────────────────────── */

interface ClusteredContext {
    title: string;
    varA: string; // 1. Değişken adı
    catA: [string, string]; // [Burada Doğan, Dışarıdan Gelen]
    varB: string; // 2. Değişken adı
    catB: [string, string]; // [Mutlu, Mutsuz]
    // Veriler: [A1_B1, A1_B2, A2_B1, A2_B2]
    counts: [number, number, number, number];
}

const CLUSTERED_CONTEXTS: ClusteredContext[] = [
    {
        title: 'Doğum Yeri & Mutluluk Düzeyi (A İli Araştırması)',
        varA: 'Doğum Yeri',
        catA: ['Burada Doğan', 'Dışarıdan Gelen'],
        varB: 'Mutluluk',
        catB: ['Mutlu', 'Mutsuz / Nötr'],
        counts: [65, 35, 40, 60],
    },
    {
        title: 'Düzenli Spor & Vücut Kitle İndeksi (VKİ)',
        varA: 'Spor Alışkanlığı',
        catA: ['Düzenli Spor Yapar', 'Spor Yapmaz'],
        varB: 'VKİ Durumu',
        catB: ['Normal (<25)', 'Yüksek (≥25)'],
        counts: [75, 25, 30, 70],
    },
    {
        title: 'Güneş Enerjisi Sistemi & Fatura Tutarı',
        varA: 'Güneş Enerjisi',
        catA: ['Sistem Var', 'Sistem Yok'],
        varB: 'Fatura',
        catB: ['Düşük Fatura', 'Yüksek Fatura'],
        counts: [70, 15, 25, 65],
    },
];

interface ClusteredBarState {
    contextIdx: number; // 0..2
    axisMode: number; // 0: X Ekseni Değişken A, 1: X Ekseni Değişken B (Eksen Değiştirme)
    chartType: number; // 0: Kümeli Sütun Grafiği, 1: %100 Yığılmış (Segmented) Sütun Grafiği
}

const clusteredBarState = (o: MathObject): ClusteredBarState => ({
    contextIdx: clampInt(simValue(o, 'contextIdx', 0), 0, 2, 0),
    axisMode: clampInt(simValue(o, 'axisMode', 0), 0, 1, 0),
    chartType: clampInt(simValue(o, 'chartType', 0), 0, 1, 0),
});

export const clusteredBarRender: Renderer = (k: Ctx) => {
    const { r, c } = k;
    const s = clusteredBarState(k.o);
    const ctx = CLUSTERED_CONTEXTS[s.contextIdx] || CLUSTERED_CONTEXTS[0];

    const fs = Math.max(9, Math.min(17, Math.min(r.w, r.h) / 15));
    const icon = isIconSize(r);

    c.save();
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();

    // Eksen moduna göre grupları ve alt kategorileri ayarla
    // axisMode === 0 : X ekseninde varA (Örn. Doğum Yeri), renkler varB (Mutluluk)
    // axisMode === 1 : X ekseninde varB (Örn. Mutluluk), renkler varA (Doğum Yeri)
    const isSwapped = s.axisMode === 1;
    const groupVar = isSwapped ? ctx.varB : ctx.varA;
    const groupLabels = isSwapped ? ctx.catB : ctx.catA;
    const legendVar = isSwapped ? ctx.varA : ctx.varB;
    const legendLabels = isSwapped ? ctx.catA : ctx.catB;

    // Veri matrisi: [grup0_alt0, grup0_alt1, grup1_alt0, grup1_alt1]
    const d00 = isSwapped ? ctx.counts[0] : ctx.counts[0];
    const d01 = isSwapped ? ctx.counts[2] : ctx.counts[1];
    const d10 = isSwapped ? ctx.counts[1] : ctx.counts[2];
    const d11 = isSwapped ? ctx.counts[3] : ctx.counts[3];

    const g0Total = d00 + d01;
    const g1Total = d10 + d11;

    // Renkler
    const col0 = '#2563eb'; // Mavi
    const col1 = '#f59e0b'; // Kehribar/Turuncu

    if (!icon) {
        // Üst Başlık Rozeti
        const titleText = `${ctx.title} · ${s.chartType === 0 ? 'Kümeli Sütun Grafiği' : '%100 Yığılmış Sütun Grafiği'}`;
        drawBadge(k, titleText, r.x + r.w / 2, r.y + fs * 1.2, {
            bgColor: '#f8fafc',
            textColor: '#0f172a',
            borderColor: '#cbd5e1',
            scale: 0.8,
        });
    }

    // Grafik Alanı Boyutları
    const chartX = r.x + (icon ? 6 : r.w * 0.12);
    const chartY = r.y + (icon ? 6 : fs * 2.8);
    const chartW = icon ? r.w - 12 : r.w * 0.65;
    const chartH = icon ? r.h - 12 : r.h * 0.58;

    // Y Ekseni ve Izgara Çizgileri
    c.save();
    c.strokeStyle = '#e2e8f0';
    c.lineWidth = 1;

    const yMax = s.chartType === 1 ? 100 : Math.max(80, Math.ceil(Math.max(d00, d01, d10, d11) / 20) * 20);
    const yTicks = 4;

    for (let t = 0; t <= yTicks; t++) {
        const val = Math.round((yMax / yTicks) * t);
        const y = chartY + chartH - (t / yTicks) * chartH;
        c.beginPath();
        c.moveTo(chartX, y);
        c.lineTo(chartX + chartW, y);
        c.stroke();

        if (!icon) {
            drawText(k, s.chartType === 1 ? `%${val}` : `${val}`, chartX - fs * 0.6, y, {
                align: 'right',
                color: '#64748b',
                halo: false,
                scale: 0.75,
            });
        }
    }

    // Ana Eksen Çizgileri
    c.strokeStyle = '#64748b';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(chartX, chartY);
    c.lineTo(chartX, chartY + chartH);
    c.lineTo(chartX + chartW, chartY + chartH);
    c.stroke();
    c.restore();

    // Sütunların Çizimi
    const groupCount = 2;
    const clusterW = chartW / groupCount;

    const drawBarsForGroup = (gIdx: number, v0: number, v1: number, tot: number) => {
        const clusterCenterX = chartX + (gIdx + 0.5) * clusterW;

        if (s.chartType === 0) {
            // ── Kümeli Sütun (Yan Yana) ─────────────────────────────
            const barW = Math.min(42, clusterW * 0.28);
            const gap = barW * 0.15;

            // 1. Sütun (v0)
            const h0 = (v0 / yMax) * chartH;
            const x0 = clusterCenterX - barW - gap / 2;
            const y0 = chartY + chartH - h0;

            c.save();
            c.fillStyle = col0;
            c.beginPath();
            if (typeof c.roundRect === 'function') c.roundRect(x0, y0, barW, h0, [4, 4, 0, 0]);
            else c.rect(x0, y0, barW, h0);
            c.fill();
            c.restore();

            // 2. Sütun (v1)
            const h1 = (v1 / yMax) * chartH;
            const x1 = clusterCenterX + gap / 2;
            const y1 = chartY + chartH - h1;

            c.save();
            c.fillStyle = col1;
            c.beginPath();
            if (typeof c.roundRect === 'function') c.roundRect(x1, y1, barW, h1, [4, 4, 0, 0]);
            else c.rect(x1, y1, barW, h1);
            c.fill();
            c.restore();

            if (!icon) {
                // Sütun tepelerine değer ve yüzde etiketleri
                const pct0 = ((v0 / tot) * 100).toFixed(0);
                const pct1 = ((v1 / tot) * 100).toFixed(0);
                drawText(k, `${v0}`, x0 + barW / 2, y0 - fs * 0.7, { color: col0, scale: 0.82 });
                drawText(k, `(%${pct0})`, x0 + barW / 2, y0 - fs * 1.5, { color: '#64748b', scale: 0.68 });

                drawText(k, `${v1}`, x1 + barW / 2, y1 - fs * 0.7, { color: col1, scale: 0.82 });
                drawText(k, `(%${pct1})`, x1 + barW / 2, y1 - fs * 1.5, { color: '#64748b', scale: 0.68 });
            }
        } else {
            // ── %100 Yığılmış Sütun (Segmented) ─────────────────────
            const barW = Math.min(52, clusterW * 0.35);
            const pct0 = (v0 / tot) * 100;
            const pct1 = (v1 / tot) * 100;

            const h0 = (pct0 / 100) * chartH;
            const h1 = (pct1 / 100) * chartH;

            const x = clusterCenterX - barW / 2;
            const yBottom = chartY + chartH - h0;
            const yTop = yBottom - h1;

            c.save();
            // Alt segment (col0)
            c.fillStyle = col0;
            c.fillRect(x, yBottom, barW, h0);

            // Üst segment (col1)
            c.fillStyle = col1;
            c.beginPath();
            if (typeof c.roundRect === 'function') c.roundRect(x, yTop, barW, h1, [4, 4, 0, 0]);
            else c.rect(x, yTop, barW, h1);
            c.fill();
            c.restore();

            if (!icon) {
                // Segment içi yüzde etiketleri
                if (h0 > 20) drawText(k, `%${pct0.toFixed(0)}`, x + barW / 2, yBottom + h0 / 2, { color: '#ffffff', scale: 0.8 });
                if (h1 > 20) drawText(k, `%${pct1.toFixed(0)}`, x + barW / 2, yTop + h1 / 2, { color: '#ffffff', scale: 0.8 });
            }
        }

        if (!icon) {
            // Grup eksen etiketi
            drawText(k, groupLabels[gIdx], clusterCenterX, chartY + chartH + fs * 1.0, {
                scale: 0.85,
                color: '#0f172a',
                halo: true,
            });
            drawText(k, `(N = ${tot})`, clusterCenterX, chartY + chartH + fs * 1.8, {
                scale: 0.72,
                color: '#64748b',
                halo: true,
            });
        }
    };

    drawBarsForGroup(0, d00, d01, g0Total);
    drawBarsForGroup(1, d10, d11, g1Total);

    if (!icon) {
        // Sağdaki Lejant / Gösterge Kutusu
        const legX = chartX + chartW + fs * 1.2;
        const legY = chartY + fs * 1.0;
        const legW = r.x + r.w - legX - fs * 0.8;
        const legH = fs * 5.8;

        c.save();
        c.fillStyle = '#ffffff';
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1;
        c.beginPath();
        if (typeof c.roundRect === 'function') c.roundRect(legX, legY, legW, legH, 8);
        else c.rect(legX, legY, legW, legH);
        c.fill();
        c.stroke();

        // Lejant Başlığı
        drawText(k, legendVar, legX + legW / 2, legY + fs * 0.9, {
            scale: 0.78,
            color: '#0f172a',
            halo: false,
        });

        // 1. Öğe
        c.fillStyle = col0;
        c.fillRect(legX + fs * 0.8, legY + fs * 2.0, fs * 0.9, fs * 0.9);
        drawText(k, legendLabels[0], legX + fs * 2.2, legY + fs * 2.45, {
            align: 'left',
            scale: 0.75,
            color: '#1e293b',
            halo: false,
        });

        // 2. Öğe
        c.fillStyle = col1;
        c.fillRect(legX + fs * 0.8, legY + fs * 3.6, fs * 0.9, fs * 0.9);
        drawText(k, legendLabels[1], legX + fs * 2.2, legY + fs * 4.05, {
            align: 'left',
            scale: 0.75,
            color: '#1e293b',
            halo: false,
        });
        c.restore();

        // Alt Analitik Çıkarım Rozeti
        const pctG0 = (d00 / g0Total) * 100;
        const pctG1 = (d10 / g1Total) * 100;
        const diff = Math.abs(pctG0 - pctG1);

        const inferText = diff > 10
            ? `${groupLabels[0]} grubunda ${legendLabels[0]} oranı (%${pctG0.toFixed(0)}), ${groupLabels[1]} grubuna (%${pctG1.toFixed(0)}) göre belirgin yüksek!`
            : `Her iki grupta da ${legendLabels[0]} oranları birbirine yakın (%${pctG0.toFixed(0)} vs %${pctG1.toFixed(0)}).`;

        drawBadge(k, inferText, r.x + r.w / 2, chartY + chartH + fs * 2.8, {
            bgColor: '#ede9fe',
            textColor: '#5b21b6',
            borderColor: '#c4b5fd',
            scale: 0.78,
        });

        // Alt Maarif İlkesi
        drawText(
            k,
            '💡 Bağımsız değişkeni (X eksenini) değiştirmek, verilerin birlikte değişebilirliğini iki yönlü değerlendirmenizi sağlar.',
            r.x + r.w / 2,
            r.y + r.h - fs * 0.8,
            { align: 'center', color: '#64748b', halo: true, scale: 0.72 }
        );
    }

    c.restore();
};

export const clusteredBarSpec: SimSpec = {
    controls: (r: Rect, o: MathObject): SimControl[] => {
        const s = clusteredBarState(o);
        const fs = Math.max(9, Math.min(17, Math.min(r.w, r.h) / 15));

        return [
            {
                id: 'swapAxis',
                x: r.x + r.w * 0.88,
                y: r.y + fs * 1.2,
                type: 'toggle',
                label: 'Eksenleri Ters Yüz Et (Bağımsız Değişkeni Değiştir)',
                on: s.axisMode === 1,
            },
        ];
    },
    onControl: (r: Rect, o: MathObject, id: string): Record<string, number> => {
        if (id === 'swapAxis') {
            const cur = clusteredBarState(o).axisMode;
            return { axisMode: cur === 0 ? 1 : 0 };
        }
        return {};
    },
    params: [
        { key: 'contextIdx', label: 'Senaryo (0:Doğum Yeri, 1:Spor, 2:Güneş)', min: 0, max: 2, step: 1 },
        { key: 'axisMode', label: 'X Ekseni Bağımsız Değişkeni (0:Grup A, 1:Grup B)', min: 0, max: 1, step: 1 },
        { key: 'chartType', label: 'Grafik Türü (0:Kümeli Sütun, 1:%100 Yığılmış)', min: 0, max: 1, step: 1 },
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   KATALOG LİSTESİ VE KAYIT
   ───────────────────────────────────────────────────────────────────────────── */

export const GRADE10_STATS_RENDERERS: Record<string, Renderer> = {
    two_way_table_sim: twoWayTableRender,
    clustered_bar_sim: clusteredBarRender,
};

export const GRADE10_STATS_SPECS: Record<string, SimSpec> = {
    two_way_table_sim: twoWayTableSpec,
    clustered_bar_sim: clusteredBarSpec,
};

export const GRADE10_STATS_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'two_way_table_sim',
        label: 'İki Yönlü Tablo & Koşullu Sıklık',
        hint: 'İki kategorik değişkenin frekanslarını, satır/sütun koşullu yüzdelerini ve ilişkililik durumunu analiz et',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { contextIdx: 0, mode: 0, shift: 0 } },
    },
    {
        kind: 'clustered_bar_sim',
        label: 'Kümeli & Yığılmış Sütun Grafiği',
        hint: 'Kümeli sütun ve %100 yığılmış grafikler; bağımsız değişken eksenini tek tuşla ters yüz et',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { contextIdx: 0, axisMode: 0, chartType: 0 } },
    },
];
