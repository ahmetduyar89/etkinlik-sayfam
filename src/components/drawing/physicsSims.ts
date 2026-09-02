// src/components/drawing/physicsSims.ts
// Fizik simülasyonları: ışığın kırılması ve hareket grafikleri.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    path,
    simValue,
    withAlpha,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── Işığın kırılması (Işığın Madde ile Etkileşimi) ───────────────────
//
// Kilit fikir: ışık yoğun ortama geçerken normale yaklaşır, az yoğun
// ortama geçerken normalden uzaklaşır. Az yoğun ortama geçişte belli bir
// açıdan sonra ışık hiç çıkamaz — tam yansıma.

interface MediumPair {
    top: string;
    bottom: string;
    n1: number;
    n2: number;
}

const REFRACTION_PAIRS: ReadonlyArray<MediumPair> = [
    { top: 'Hava', bottom: 'Su', n1: 1, n2: 1.33 },
    { top: 'Hava', bottom: 'Cam', n1: 1, n2: 1.5 },
    { top: 'Su', bottom: 'Hava', n1: 1.33, n2: 1 },
    { top: 'Cam', bottom: 'Hava', n1: 1.5, n2: 1 },
];

const refractionState = (o: MathObject) => {
    const pair = REFRACTION_PAIRS[clampInt(simValue(o, 'pair', 0), 0, REFRACTION_PAIRS.length - 1, 0)];
    const angle = clamp(simValue(o, 'angle', 40), 1, 88);
    const ratio = (pair.n1 * Math.sin((angle * Math.PI) / 180)) / pair.n2;
    // |sin θ₂| > 1 ise kırılan ışın yoktur: tam yansıma.
    const total = Math.abs(ratio) > 1;
    return {
        pair,
        angle,
        total,
        refracted: total ? 0 : (Math.asin(ratio) * 180) / Math.PI,
        critical: pair.n1 > pair.n2 ? (Math.asin(pair.n2 / pair.n1) * 180) / Math.PI : null,
    };
};

function refractionGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    return {
        fs,
        ox: r.x + r.w / 2,
        oy: r.y + r.h * 0.5,
        len: Math.min(r.w * 0.38, r.h * 0.4),
    };
}

export const refractionRender: Renderer = (k) => {
    const r = k.r;
    const s = refractionState(k.o);
    const g = refractionGeom(r);
    const icon = isIconSize(r);
    const rad = (deg: number) => (deg * Math.PI) / 180;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Ortam sınırı ve alttaki ortamın gölgesi
    line(k, r.x + r.w * 0.06, g.oy, r.x + r.w * 0.94, g.oy, Math.max(1.6, k.lw));
    k.c.save();
    k.c.globalAlpha = 0.08;
    k.c.fillRect(r.x + r.w * 0.06, g.oy, r.w * 0.88, r.y + r.h - g.oy - 2);
    k.c.restore();

    // Normal
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    k.c.setLineDash([6, 4]);
    line(k, g.ox, g.oy - g.len * 1.05, g.ox, g.oy + g.len * 1.05, 1);
    k.c.restore();

    // Gelen ışın (sol üstten) ve yansıyan ışın (sağ üste)
    const inX = g.ox - g.len * Math.sin(rad(s.angle));
    const inY = g.oy - g.len * Math.cos(rad(s.angle));
    arrow(k, inX, inY, g.ox, g.oy, g.fs * 0.5, Math.max(1.6, k.lw));
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, s.total ? 1 : 0.45);
    arrow(
        k,
        g.ox,
        g.oy,
        g.ox + g.len * 0.8 * Math.sin(rad(s.angle)),
        g.oy - g.len * 0.8 * Math.cos(rad(s.angle)),
        g.fs * 0.45,
        s.total ? Math.max(1.6, k.lw) : 1.2,
    );
    k.c.restore();

    // Kırılan ışın
    if (!s.total) {
        arrow(
            k,
            g.ox,
            g.oy,
            g.ox + g.len * Math.sin(rad(s.refracted)),
            g.oy + g.len * Math.cos(rad(s.refracted)),
            g.fs * 0.5,
            Math.max(1.6, k.lw),
        );
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Açı yayları
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    k.c.beginPath();
    k.c.lineWidth = 1.2;
    k.c.arc(g.ox, g.oy, g.len * 0.3, -Math.PI / 2 - rad(s.angle), -Math.PI / 2);
    k.c.stroke();
    if (!s.total) {
        k.c.beginPath();
        k.c.arc(g.ox, g.oy, g.len * 0.3, Math.PI / 2 - rad(s.refracted), Math.PI / 2);
        k.c.stroke();
    }
    k.c.restore();

    label(
        k,
        `${fmtNum(s.angle, 0)}°`,
        g.ox - g.len * 0.42 * Math.sin(rad(s.angle / 2)) - g.fs * 0.5,
        g.oy - g.len * 0.42 * Math.cos(rad(s.angle / 2)),
        'center',
        'middle',
        0.72,
    );
    if (!s.total) {
        label(
            k,
            `${fmtNum(s.refracted, 0)}°`,
            g.ox + g.len * 0.42 * Math.sin(rad(s.refracted / 2)) + g.fs * 0.6,
            g.oy + g.len * 0.42 * Math.cos(rad(s.refracted / 2)),
            'center',
            'middle',
            0.72,
        );
    }

    label(k, `${s.pair.top} (n = ${fmtNum(s.pair.n1, 2)})`, r.x + 4, g.oy - g.fs * 0.4, 'left', 'bottom', 0.7);
    label(k, `${s.pair.bottom} (n = ${fmtNum(s.pair.n2, 2)})`, r.x + 4, g.oy + g.fs * 0.4, 'left', 'top', 0.7);
    label(k, 'normal', g.ox + g.fs * 0.3, r.y + g.fs * 1.9, 'left', 'top', 0.62);

    const note = s.total
        ? 'Tam yansıma — ışık alt ortama geçemez'
        : s.pair.n2 > s.pair.n1
          ? 'Yoğun ortama geçiş: ışın normale yaklaşır'
          : 'Az yoğun ortama geçiş: ışın normalden uzaklaşır';
    label(k, fitText(k, [note], r.w - g.fs * 4, 0.82), r.x + 4, r.y + 1, 'left', 'top', 0.82);
    label(
        k,
        s.critical !== null
            ? `Sınır açı ${fmtNum(s.critical, 0)}° · gelme açısı ${fmtNum(s.angle, 0)}°`
            : `Gelme açısı ${fmtNum(s.angle, 0)}° · kırılma açısı ${fmtNum(s.refracted, 0)}°`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.78,
    );
    k.c.restore();
};

export const refractionSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = refractionState(o);
        const g = refractionGeom(r);
        const rad = (s.angle * Math.PI) / 180;
        return [
            {
                id: 'ray',
                x: g.ox - g.len * Math.sin(rad),
                y: g.oy - g.len * Math.cos(rad),
                type: 'drag',
                label: 'Gelen ışını sürükle',
            },
            {
                id: 'pair',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Ortamları değiştir (şimdi: ${s.pair.top} → ${s.pair.bottom})`,
                on: true,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = refractionState(o);
        if (id === 'pair') {
            const i = REFRACTION_PAIRS.indexOf(s.pair);
            return { pair: (i + 1) % REFRACTION_PAIRS.length };
        }
        const g = refractionGeom(r);
        // Açı normalden ölçülür; ışın hep sol üstten gelir.
        const deg = (Math.atan2(g.ox - p.x, g.oy - p.y) * 180) / Math.PI;
        return { angle: clamp(deg, 1, 88) };
    },
    params: [
        { key: 'angle', label: 'Gelme açısı', min: 1, max: 88, step: 1, unit: '°' },
        { key: 'pair', label: 'Ortam çifti (0-3)', min: 0, max: 3, step: 1 },
    ],
};

// ── Hareket grafikleri (Kuvvet ve Hareket) ───────────────────────────
//
// Kilit fikir: konum-zaman grafiğinin EĞİMİ hızı, hız-zaman grafiğinin
// ALTINDAKİ ALAN yolu verir. Aynı hareket üç yerde birden izlenir:
// yolda araba, iki grafikte hareketli işaret.

const MOTION_MAX_T = 10;

const motionState = (o: MathObject, t: number) => {
    const v0 = clamp(simValue(o, 'v0', 4), 0, 20);
    const a = clamp(simValue(o, 'a', 0), -2, 4);
    const playing = simValue(o, 'play', 0) > 0.5;
    const stored = clamp(simValue(o, 'time', 4), 0, MOTION_MAX_T);
    const time = playing ? (t * 1.2) % MOTION_MAX_T : stored;
    return {
        v0,
        a,
        playing,
        time,
        pos: (tt: number) => v0 * tt + (a * tt * tt) / 2,
        vel: (tt: number) => v0 + a * tt,
    };
};

function motionGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const roadY = r.y + fs * 3.4;
    const top = roadY + fs * 1.6;
    const gap = r.w * 0.06;
    const w = (r.w - gap * 3) / 2;
    return {
        fs,
        roadY,
        roadX0: r.x + fs,
        roadX1: r.x + r.w - fs,
        charts: [
            { x: r.x + gap, y: top, w, h: r.y + r.h - top - fs * 1.6 },
            { x: r.x + gap * 2 + w, y: top, w, h: r.y + r.h - top - fs * 1.6 },
        ],
    };
}

export const motionRender: Renderer = (k) => {
    const r = k.r;
    const s = motionState(k.o, k.t);
    const g = motionGeom(r);
    const icon = isIconSize(r);

    // Ölçekler tüm hareketi kapsar: işaret grafikten taşmasın.
    const maxPos = Math.max(1, ...Array.from({ length: 21 }, (_, i) => s.pos((i * MOTION_MAX_T) / 20)));
    const minVel = Math.min(0, s.vel(MOTION_MAX_T), s.v0);
    const maxVel = Math.max(1, s.v0, s.vel(MOTION_MAX_T));

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    if (icon) {
        // Simge ölçeğinde yol ve grafikler okunmaz; konum eğrisi tek başına
        // hareketi anlatır.
        const bx = r.x + r.w * 0.12;
        const by = r.y + r.h * 0.12;
        const bw = r.w * 0.76;
        const bh = r.h * 0.76;
        line(k, bx, by, bx, by + bh);
        line(k, bx, by + bh, bx + bw, by + bh);
        const pts: Array<[number, number]> = [];
        for (let j = 0; j <= 24; j++) {
            const tt = (j * MOTION_MAX_T) / 24;
            pts.push([bx + (bw * tt) / MOTION_MAX_T, by + bh - (bh * s.pos(tt)) / maxPos]);
        }
        k.c.lineWidth = Math.max(1.6, k.lw);
        path(k, pts, false);
        k.c.restore();
        return;
    }

    // Yol ve araba
    line(k, g.roadX0, g.roadY, g.roadX1, g.roadY);
    const carX = g.roadX0 + ((g.roadX1 - g.roadX0) * clamp(s.pos(s.time), 0, maxPos)) / maxPos;
    const carW = Math.min(g.fs * 2.2, (g.roadX1 - g.roadX0) * 0.12);
    const carH = carW * 0.45;
    k.c.strokeRect(carX - carW / 2, g.roadY - carH - 2, carW, carH);
    for (const dx of [-0.28, 0.28]) {
        k.c.beginPath();
        k.c.arc(carX + carW * dx, g.roadY - 2, carH * 0.22, 0, Math.PI * 2);
        k.c.stroke();
    }

    // İki grafik: konum-zaman ve hız-zaman
    const charts: Array<{
        title: string;
        value: (tt: number) => number;
        min: number;
        max: number;
    }> = [
        { title: 'konum – zaman', value: s.pos, min: 0, max: maxPos },
        { title: 'hız – zaman', value: s.vel, min: minVel, max: maxVel },
    ];

    charts.forEach((chart, i) => {
        const box = g.charts[i];
        const px = (tt: number) => box.x + (box.w * tt) / MOTION_MAX_T;
        const py = (v: number) =>
            box.y + box.h - (box.h * (v - chart.min)) / Math.max(0.001, chart.max - chart.min);
        line(k, box.x, box.y, box.x, box.y + box.h);
        line(k, box.x, box.y + box.h, box.x + box.w, box.y + box.h);
        // Sıfır çizgisi (hız negatif olabilir)
        if (chart.min < 0) {
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.35);
            k.c.setLineDash([4, 3]);
            line(k, box.x, py(0), box.x + box.w, py(0), 1);
            k.c.restore();
        }
        const pts: Array<[number, number]> = [];
        for (let j = 0; j <= 40; j++) {
            const tt = (j * MOTION_MAX_T) / 40;
            pts.push([px(tt), py(chart.value(tt))]);
        }
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.3);
        path(k, pts, false);
        k.c.restore();
        const walked = pts.filter((_, j) => (j * MOTION_MAX_T) / 40 <= s.time);
        walked.push([px(s.time), py(chart.value(s.time))]);
        k.c.lineWidth = Math.max(1.8, k.lw);
        path(k, walked, false);
        k.c.beginPath();
        k.c.arc(px(s.time), py(chart.value(s.time)), Math.max(2.5, g.fs * 0.22), 0, Math.PI * 2);
        k.c.fill();
        if (k.o.labels !== false) {
            label(k, chart.title, box.x + box.w / 2, box.y + box.h + g.fs * 0.3, 'center', 'top', 0.66);
            // Eksen uçlarındaki değerler: grafiğin ölçeği okunabilsin.
            label(k, fmtNum(chart.max, 0), box.x - g.fs * 0.25, box.y, 'right', 'middle', 0.58);
            label(k, `${MOTION_MAX_T} s`, box.x + box.w, box.y + box.h + g.fs * 0.3, 'right', 'top', 0.58);
        }
    });

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(
        k,
        fitText(
            k,
            [
                `${s.a === 0 ? 'Sabit hızlı hareket' : s.a > 0 ? 'Hızlanan hareket' : 'Yavaşlayan hareket'} · v₀ = ${fmtNum(s.v0, 1)} m/s · a = ${fmtNum(s.a, 1)} m/s²`,
                `v₀ = ${fmtNum(s.v0, 1)} m/s · a = ${fmtNum(s.a, 1)} m/s²`,
            ],
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
        `t = ${fmtNum(s.time, 1)} s · x = ${fmtNum(s.pos(s.time), 1)} m · v = ${fmtNum(s.vel(s.time), 1)} m/s`,
        r.x + r.w / 2,
        r.y + g.fs * 1.6,
        'center',
        'middle',
        0.78,
    );
    k.c.restore();
};

export const motionSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = motionState(o, 0);
        const g = motionGeom(r);
        const play: SimControl = {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: s.playing ? 'Hareketi duraklat' : 'Hareketi başlat',
            on: s.playing,
        };
        if (s.playing) return [play];
        // Tutamak eğrinin üzerindeki işaretin yerinde durur; eksen yazılarının
        // üstünde durduğunda etiketleri kapatıyordu.
        const box = g.charts[0];
        const maxPos = Math.max(1, ...Array.from({ length: 21 }, (_, i) => s.pos((i * MOTION_MAX_T) / 20)));
        return [
            {
                id: 'time',
                x: box.x + (box.w * s.time) / MOTION_MAX_T,
                y: box.y + box.h - (box.h * s.pos(s.time)) / maxPos,
                type: 'drag',
                label: 'Zamanı sürükle',
            },
            play,
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        const box = motionGeom(r).charts[0];
        return { time: clamp(((p.x - box.x) / box.w) * MOTION_MAX_T, 0, MOTION_MAX_T) };
    },
    params: [
        { key: 'v0', label: 'İlk hız', min: 0, max: 20, step: 1, unit: 'm/s' },
        { key: 'a', label: 'İvme', min: -2, max: 4, step: 0.5, unit: 'm/s²' },
        { key: 'time', label: 'Zaman', min: 0, max: MOTION_MAX_T, step: 0.5, unit: 's' },
        { key: 'play', label: 'Oynat (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Bileşke kuvvet (Kuvvet ve Hareket) ───────────────────────────────
//
// Kilit fikir: kuvvetler sayı gibi değil, ok gibi toplanır. Aynı yöndeyse
// büyür, zıt yöndeyse birbirini götürür; açılıysa paralelkenar kuralıyla
// bulunur. Bileşke sıfırsa cisim dengededir.

const FORCE_MAX = 50;

const forceState = (o: MathObject) => {
    const f1 = clamp(simValue(o, 'f1', 30), 0, FORCE_MAX);
    const a1 = clamp(simValue(o, 'a1', 0), 0, 359);
    const f2 = clamp(simValue(o, 'f2', 20), 0, FORCE_MAX);
    const a2 = clamp(simValue(o, 'a2', 90), 0, 359);
    const rad = (deg: number) => (deg * Math.PI) / 180;
    // Ekranda y aşağı arttığı için bileşen hesabında y ters işaretlidir.
    const x = f1 * Math.cos(rad(a1)) + f2 * Math.cos(rad(a2));
    const y = f1 * Math.sin(rad(a1)) + f2 * Math.sin(rad(a2));
    const mag = Math.hypot(x, y);
    return {
        f1,
        a1,
        f2,
        a2,
        x,
        y,
        mag,
        angle: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360,
        balanced: mag < 0.5,
    };
};

/**
 * Ölçek 40 N'a göre kurulur: tipik değerlerde oklar kutuyu doldurur, en
 * büyük değer (50 N) kenara yaklaşır. Simge ölçeğinde ise oklar kutuya
 * sığacak şekilde o anki en büyük kuvvete göre küçültülür.
 */
function forceGeom(r: Rect, s: { f1: number; f2: number; mag: number }) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const reference = icon ? Math.max(s.f1, s.f2, s.mag, 1) : 40;
    return {
        fs,
        cx: r.x + r.w * (icon ? 0.5 : 0.44),
        cy: r.y + r.h * 0.5,
        scale: Math.min(r.w * (icon ? 0.45 : 0.38), r.h * (icon ? 0.45 : 0.4)) / reference,
    };
}

/** Kuvvet vektörünün uç noktası (ekran koordinatı). */
const forceTip = (g: { cx: number; cy: number; scale: number }, mag: number, deg: number) => ({
    x: g.cx + mag * g.scale * Math.cos((deg * Math.PI) / 180),
    y: g.cy - mag * g.scale * Math.sin((deg * Math.PI) / 180),
});

export const netForceRender: Renderer = (k) => {
    const r = k.r;
    const s = forceState(k.o);
    const g = forceGeom(r, s);
    const icon = isIconSize(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    if (icon) {
        // Simge ölçeğinde cisim kutusu ve paralelkenar leke oluşturuyor;
        // yalnızca üç ok çizilir.
        const t1i = forceTip(g, s.f1, s.a1);
        const t2i = forceTip(g, s.f2, s.a2);
        const tri = forceTip(g, s.mag, s.angle);
        arrow(k, g.cx, g.cy, t1i.x, t1i.y, Math.min(r.w, r.h) * 0.12, 1.4);
        arrow(k, g.cx, g.cy, t2i.x, t2i.y, Math.min(r.w, r.h) * 0.12, 1.4);
        if (!s.balanced) {
            arrow(k, g.cx, g.cy, tri.x, tri.y, Math.min(r.w, r.h) * 0.16, 2.6);
        }
        k.c.restore();
        return;
    }

    // Cisim
    const box = Math.min(g.fs * 2.2, Math.min(r.w, r.h) * 0.12);
    k.c.strokeRect(g.cx - box / 2, g.cy - box / 2, box, box);
    k.c.save();
    k.c.globalAlpha = 0.12;
    k.c.fillRect(g.cx - box / 2, g.cy - box / 2, box, box);
    k.c.restore();

    const t1 = forceTip(g, s.f1, s.a1);
    const t2 = forceTip(g, s.f2, s.a2);
    const tr = forceTip(g, s.mag, s.angle);

    // Paralelkenar kuralı: uçlardan bileşkenin ucuna kesikli tamamlama
    if (!icon && !s.balanced && s.f1 > 0 && s.f2 > 0) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.35);
        k.c.setLineDash([5, 4]);
        line(k, t1.x, t1.y, tr.x, tr.y, 1);
        line(k, t2.x, t2.y, tr.x, tr.y, 1);
        k.c.restore();
    }

    if (s.f1 > 0) arrow(k, g.cx, g.cy, t1.x, t1.y, g.fs * 0.5, Math.max(1.5, k.lw));
    if (s.f2 > 0) arrow(k, g.cx, g.cy, t2.x, t2.y, g.fs * 0.5, Math.max(1.5, k.lw));
    if (!s.balanced) {
        k.c.save();
        k.c.lineWidth = Math.max(2.4, k.lw * 1.8);
        arrow(k, g.cx, g.cy, tr.x, tr.y, g.fs * 0.7, Math.max(2.4, k.lw * 1.8));
        k.c.restore();
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Etiketler okun UCUNDAN dışarı doğru kaydırılır; merkezde üst üste
    // binmesinler.
    const outward = (tip: { x: number; y: number }, deg: number, d: number) => ({
        x: tip.x + d * Math.cos((deg * Math.PI) / 180),
        y: tip.y - d * Math.sin((deg * Math.PI) / 180),
    });
    if (s.f1 > 0) {
        const p1 = outward(t1, s.a1, g.fs * 1.4);
        label(k, `F₁ ${fmtNum(s.f1, 0)} N`, p1.x, p1.y, 'center', 'middle', 0.7);
    }
    if (s.f2 > 0) {
        const p2 = outward(t2, s.a2, g.fs * 1.4);
        label(k, `F₂ ${fmtNum(s.f2, 0)} N`, p2.x, p2.y, 'center', 'middle', 0.7);
    }
    if (!s.balanced) {
        const pr = outward(tr, s.angle, g.fs * 1.6);
        label(k, `R ${fmtNum(s.mag, 1)} N`, pr.x, pr.y, 'center', 'middle', 0.8);
    }

    label(
        k,
        fitText(
            k,
            ['Kuvvetler ok gibi toplanır — uçları sürükle', 'Kuvvet oklarını sürükle'],
            r.w - g.fs * 3,
            0.8,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8,
    );
    const verdict = s.balanced
        ? 'Bileşke sıfır · kuvvetler dengelenmiş, cisim hareket etmez'
        : `Bileşke ${fmtNum(s.mag, 1)} N · ${fmtNum(s.angle, 0)}° yönünde · dengelenmemiş`;
    label(k, fitText(k, [verdict, `R = ${fmtNum(s.mag, 1)} N`], r.w - 8, 0.8), r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.8);
    k.c.restore();
};

export const netForceSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = forceState(o);
        const g = forceGeom(r, s);
        const t1 = forceTip(g, s.f1, s.a1);
        const t2 = forceTip(g, s.f2, s.a2);
        return [
            { id: 'f1', x: t1.x, y: t1.y, type: 'drag', label: 'Birinci kuvveti sürükle' },
            { id: 'f2', x: t2.x, y: t2.y, type: 'drag', label: 'İkinci kuvveti sürükle' },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const g = forceGeom(r, forceState(o));
        const dx = p.x - g.cx;
        const dy = g.cy - p.y;
        const mag = clamp(Math.hypot(dx, dy) / g.scale, 0, FORCE_MAX);
        const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        // Değerler tam sayıya yuvarlanır; okuma ve hesap kolay kalsın.
        return id === 'f1'
            ? { f1: Math.round(mag), a1: Math.round(deg) }
            : { f2: Math.round(mag), a2: Math.round(deg) };
    },
    params: [
        { key: 'f1', label: '1. kuvvet', min: 0, max: FORCE_MAX, step: 1, unit: 'N' },
        { key: 'a1', label: '1. kuvvetin açısı', min: 0, max: 359, step: 5, unit: '°' },
        { key: 'f2', label: '2. kuvvet', min: 0, max: FORCE_MAX, step: 1, unit: 'N' },
        { key: 'a2', label: '2. kuvvetin açısı', min: 0, max: 359, step: 5, unit: '°' },
    ],
};

// ── Enerji dönüşümü (Enerji Dönüşümleri) ─────────────────────────────
//
// Kilit fikir: sarkaç yükseldikçe potansiyel, alçaldıkça kinetik enerji
// artar; toplam sabittir. Sürtünme açıkken toplam azalmaz — enerjinin bir
// kısmı ısıya dönüşür, yani kaybolmaz, biçim değiştirir.

/** Sarkaç: 1 kg kütle, 1 m ip, g = 10 N/kg. */
const PEND_M = 1;
const PEND_L = 1;
const PEND_G = 10;
/** Sürtünme açıkken sönüm katsayısı. */
const PEND_DAMP = 0.08;
/** Sönümlü gösterim bu sürede bir başa döner. */
const PEND_CYCLE = 24;

function energyState(o: MathObject, t: number) {
    const amp = (clamp(simValue(o, 'amp', 40), 5, 70) * Math.PI) / 180;
    const playing = simValue(o, 'play', 0) > 0.5;
    const damped = simValue(o, 'damp', 0) > 0.5;
    const w = Math.sqrt(PEND_G / PEND_L);
    const elapsed = playing ? t % PEND_CYCLE : 0;
    // Sönüm genliği azaltır; duraklatılmışken sarkaç en uçta bekler.
    const current = damped && playing ? amp * Math.exp(-PEND_DAMP * elapsed) : amp;
    const theta = playing ? current * Math.cos(w * elapsed) : amp;
    const height = (a: number) => PEND_L * (1 - Math.cos(a));
    const total0 = PEND_M * PEND_G * height(amp);
    const total = PEND_M * PEND_G * height(current);
    const pe = PEND_M * PEND_G * height(Math.abs(theta));
    return {
        amp,
        theta,
        playing,
        damped,
        pe,
        ke: Math.max(0, total - pe),
        total,
        lost: Math.max(0, total0 - total),
        max: total0,
    };
}

function energyGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const pivotX = r.x + r.w * (icon ? 0.5 : 0.34);
    const pivotY = r.y + (icon ? r.h * 0.12 : fs * 2.6);
    const len = Math.min(r.w * (icon ? 0.34 : 0.26), r.h * (icon ? 0.6 : 0.52));
    return { fs, icon, pivotX, pivotY, len, bobR: Math.max(5, len * 0.13) };
}

export const energyRender: Renderer = (k) => {
    const r = k.r;
    const s = energyState(k.o, k.t);
    const g = energyGeom(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Askı ve yörünge yayı
    line(k, g.pivotX - g.fs, g.pivotY, g.pivotX + g.fs, g.pivotY);
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    k.c.setLineDash([5, 4]);
    k.c.beginPath();
    k.c.lineWidth = 1;
    k.c.arc(g.pivotX, g.pivotY, g.len, Math.PI / 2 - s.amp, Math.PI / 2 + s.amp);
    k.c.stroke();
    k.c.restore();

    // İp ve top
    const bx = g.pivotX + g.len * Math.sin(s.theta);
    const by = g.pivotY + g.len * Math.cos(s.theta);
    line(k, g.pivotX, g.pivotY, bx, by, Math.max(1.4, k.lw));
    k.c.beginPath();
    k.c.arc(bx, by, g.bobR, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.25;
    k.c.fill();
    k.c.restore();

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // En alçak nokta: potansiyel enerjinin sıfır kabul edildiği yer
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.35);
    k.c.setLineDash([4, 4]);
    line(k, g.pivotX - g.len, g.pivotY + g.len, g.pivotX + g.len, g.pivotY + g.len, 1);
    k.c.restore();
    label(k, 'referans (Ep = 0)', g.pivotX - g.len, g.pivotY + g.len + g.fs * 0.3, 'left', 'top', 0.6);

    // Enerji çubukları
    const barsX = r.x + r.w * 0.68;
    const barW = r.w * 0.075;
    const barTop = r.y + g.fs * 3;
    const barH = r.h - g.fs * 6;
    const bars: Array<[string, number]> = [
        ['Ek', s.ke],
        ['Ep', s.pe],
        ['ısı', s.lost],
    ];
    bars.forEach(([name, value], i) => {
        const x = barsX + i * barW * 1.6;
        const h = s.max > 0 ? (value / s.max) * barH : 0;
        k.c.lineWidth = k.lw;
        k.c.strokeRect(x, barTop, barW, barH);
        k.c.save();
        k.c.globalAlpha = 0.26;
        k.c.fillRect(x, barTop + barH - h, barW, h);
        k.c.restore();
        label(k, name, x + barW / 2, barTop + barH + g.fs * 0.3, 'center', 'top', 0.66);
        // Birim her sayının yanında yazılır; ayrı bir "joule" etiketi
        // çubukların üstüne biniyordu.
        label(k, `${fmtNum(value, 1)} J`, x + barW / 2, barTop - g.fs * 0.3, 'center', 'bottom', 0.62);
    });

    label(
        k,
        fitText(
            k,
            [
                s.damped
                    ? 'Sürtünmeli: toplam enerji azalmaz, bir kısmı ısıya dönüşür'
                    : 'Sürtünmesiz: Ek + Ep toplamı sabit kalır',
                s.damped ? 'Sürtünmeli sarkaç' : 'Sürtünmesiz sarkaç',
            ],
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
        `Ek ${fmtNum(s.ke, 1)} J + Ep ${fmtNum(s.pe, 1)} J = ${fmtNum(s.ke + s.pe, 1)} J`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.8,
    );
    k.c.restore();
};

export const energySpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = energyState(o, 0);
        const g = energyGeom(r);
        const play: SimControl = {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: s.playing ? 'Sarkacı durdur' : 'Sarkacı bırak',
            on: s.playing,
        };
        const damp: SimControl = {
            id: 'damp',
            x: r.x + r.w - 40,
            y: r.y + 14,
            type: 'toggle',
            label: s.damped ? 'Sürtünmeyi kaldır' : 'Sürtünme ekle',
            on: s.damped,
        };
        if (s.playing) return [play, damp];
        return [
            {
                id: 'bob',
                x: g.pivotX + g.len * Math.sin(s.amp),
                y: g.pivotY + g.len * Math.cos(s.amp),
                type: 'drag',
                label: 'Topu kaldır (genliği belirler)',
            },
            play,
            damp,
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        if (id === 'damp') return { damp: simValue(o, 'damp', 0) > 0.5 ? 0 : 1 };
        const g = energyGeom(r);
        const deg = (Math.atan2(p.x - g.pivotX, Math.max(1, p.y - g.pivotY)) * 180) / Math.PI;
        return { amp: clamp(Math.abs(deg), 5, 70) };
    },
    params: [
        { key: 'amp', label: 'Bırakma açısı', min: 5, max: 70, step: 5, unit: '°' },
        { key: 'play', label: 'Salla (0/1)', min: 0, max: 1, step: 1 },
        { key: 'damp', label: 'Sürtünme (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Ohm yasası (Elektrik Akımı) ──────────────────────────────────────
//
// Kilit fikir: aynı direnç için gerilim ile akım DOĞRU orantılıdır;
// gerilim-akım grafiği orijinden geçen bir doğrudur ve o doğrunun EĞİMİ
// direncin kendisidir.

const OHM_MAX_V = 12;
const OHM_MAX_I = 6;

const ohmState = (o: MathObject) => {
    const res = clamp(simValue(o, 'r', 3), 1, 12);
    const volt = clamp(simValue(o, 'v', 6), 0, OHM_MAX_V);
    return { res, volt, current: volt / res };
};

function ohmGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    return {
        fs,
        icon,
        circuit: {
            x: r.x + r.w * (icon ? 0.12 : 0.06),
            y: r.y + (icon ? r.h * 0.16 : fs * 3),
            w: r.w * (icon ? 0.76 : 0.34),
            h: r.h - (icon ? r.h * 0.32 : fs * 5),
        },
        chart: {
            x: r.x + r.w * 0.52,
            y: r.y + fs * 3,
            w: r.w * 0.4,
            h: r.h - fs * 5.4,
        },
    };
}

export const ohmRender: Renderer = (k) => {
    const r = k.r;
    const s = ohmState(k.o);
    const g = ohmGeom(r);
    const c = g.circuit;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Devre: üstte direnç, solda pil, sağda ampermetre
    line(k, c.x, c.y, c.x + c.w * 0.3, c.y);
    line(k, c.x + c.w * 0.7, c.y, c.x + c.w, c.y);
    line(k, c.x, c.y, c.x, c.y + c.h);
    line(k, c.x + c.w, c.y, c.x + c.w, c.y + c.h * 0.34);
    line(k, c.x + c.w, c.y + c.h * 0.66, c.x + c.w, c.y + c.h);
    line(k, c.x, c.y + c.h, c.x + c.w * 0.34, c.y + c.h);
    line(k, c.x + c.w * 0.66, c.y + c.h, c.x + c.w, c.y + c.h);

    // Direnç (dikdörtgen sembol)
    k.c.strokeRect(c.x + c.w * 0.3, c.y - c.h * 0.06, c.w * 0.4, c.h * 0.12);
    // Pil
    const bx = c.x + c.w * 0.5;
    line(k, bx - c.w * 0.05, c.y + c.h - c.h * 0.09, bx - c.w * 0.05, c.y + c.h + c.h * 0.09);
    line(k, bx + c.w * 0.05, c.y + c.h - c.h * 0.05, bx + c.w * 0.05, c.y + c.h + c.h * 0.05);
    // Ampermetre
    const ax = c.x + c.w;
    const ay = c.y + c.h * 0.5;
    const arad = Math.min(c.w * 0.13, c.h * 0.13);
    k.c.beginPath();
    k.c.arc(ax, ay, arad, 0, Math.PI * 2);
    k.c.stroke();

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }
    label(k, 'A', ax, ay, 'center', 'middle', 0.75);
    label(k, `${fmtNum(s.res, 0)} Ω`, c.x + c.w * 0.5, c.y - c.h * 0.1, 'center', 'bottom', 0.72);
    // Pil ve ampermetre okumaları devrenin İÇİNE yazılır; dışarıda alt
    // satırdaki özetle ve tellerle çakışıyordu.
    label(k, `${fmtNum(s.volt, 1)} V`, bx + c.w * 0.1, c.y + c.h, 'left', 'middle', 0.72);
    label(k, `${fmtNum(s.current, 2)} A`, ax - arad - g.fs * 0.35, ay, 'right', 'middle', 0.7);

    // Gerilim–akım grafiği: eğim direnci verir
    const ch = g.chart;
    const px = (i: number) => ch.x + (ch.w * i) / OHM_MAX_I;
    const py = (v: number) => ch.y + ch.h - (ch.h * v) / OHM_MAX_V;
    line(k, ch.x, ch.y, ch.x, ch.y + ch.h);
    line(k, ch.x, ch.y + ch.h, ch.x + ch.w, ch.y + ch.h);
    // Doğrunun kutu içinde kalan ucu
    const iEnd = Math.min(OHM_MAX_I, OHM_MAX_V / s.res);
    line(k, px(0), py(0), px(iEnd), py(iEnd * s.res), Math.max(1.6, k.lw));
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    k.c.setLineDash([4, 3]);
    line(k, px(s.current), py(s.volt), px(s.current), py(0), 1);
    line(k, ch.x, py(s.volt), px(s.current), py(s.volt), 1);
    k.c.restore();
    k.c.beginPath();
    k.c.arc(px(s.current), py(s.volt), Math.max(3, g.fs * 0.26), 0, Math.PI * 2);
    k.c.fill();
    label(k, 'V', ch.x - g.fs * 0.3, ch.y, 'right', 'middle', 0.62);
    label(k, `${OHM_MAX_I} A`, ch.x + ch.w, ch.y + ch.h + g.fs * 0.3, 'right', 'top', 0.6);
    label(k, '0', ch.x - g.fs * 0.3, ch.y + ch.h, 'right', 'middle', 0.6);
    label(k, `${OHM_MAX_V}`, ch.x - g.fs * 0.3, ch.y + g.fs * 0.6, 'right', 'middle', 0.6);

    label(
        k,
        fitText(
            k,
            ['Gerilim–akım grafiğinin eğimi direnci verir', 'Ohm yasası'],
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
        `V = ${fmtNum(s.volt, 1)} V · I = ${fmtNum(s.current, 2)} A · R = V / I = ${fmtNum(s.res, 0)} Ω`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.82,
    );
    k.c.restore();
};

export const ohmSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = ohmState(o);
        const g = ohmGeom(r);
        const ch = g.chart;
        return [
            {
                id: 'point',
                x: ch.x + (ch.w * s.current) / OHM_MAX_I,
                y: ch.y + ch.h - (ch.h * s.volt) / OHM_MAX_V,
                type: 'drag',
                label: 'Gerilimi değiştir',
            },
            {
                id: 'res',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Direnci değiştir (şimdi: ${fmtNum(s.res, 0)} Ω)`,
                on: s.res > 1,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = ohmState(o);
        // Direnç okunması kolay değerler arasında döner.
        if (id === 'res') {
            const steps = [1, 2, 3, 4, 6, 12];
            const i = steps.indexOf(Math.round(s.res));
            return { r: steps[(i + 1) % steps.length] };
        }
        const g = ohmGeom(r);
        const volt = clamp(((g.chart.y + g.chart.h - p.y) / g.chart.h) * OHM_MAX_V, 0, OHM_MAX_V);
        return { v: Math.round(volt * 2) / 2 };
    },
    params: [
        { key: 'v', label: 'Gerilim', min: 0, max: OHM_MAX_V, step: 0.5, unit: 'V' },
        { key: 'r', label: 'Direnç', min: 1, max: 12, step: 1, unit: 'Ω' },
    ],
};

// ── Ses dalgası (Ses ve Özellikleri) ─────────────────────────────────
//
// Kilit fikir: sesin İNCELİĞİNİ frekans, ŞİDDETİNİ genlik belirler.
// Dalga çizimi enine görünse de ses aslında boyuna bir dalgadır; bu
// yüzden altta sıkışma-seyrelme modeli de çizilir.

const soundState = (o: MathObject) => ({
    freq: clamp(simValue(o, 'freq', 3), 1, 8),
    amp: clamp(simValue(o, 'amp', 60), 10, 100),
    playing: simValue(o, 'play', 0) > 0.5,
});

export const soundRender: Renderer = (k) => {
    const r = k.r;
    const s = soundState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const x0 = r.x + (icon ? r.w * 0.06 : fs * 4);
    const x1 = r.x + r.w - (icon ? r.w * 0.06 : fs);
    const waveY = r.y + (icon ? r.h * 0.32 : fs * 4.6);
    const waveH = (icon ? r.h * 0.22 : fs * 3.4) * (s.amp / 100);
    const phase = s.playing ? k.t * 2.2 : 0;
    const waves = s.freq;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Ses kaynağı: hoparlör
    if (!icon) {
        const sx = r.x + fs * 1.2;
        path(k, [
            [sx, waveY - fs * 0.8],
            [sx, waveY + fs * 0.8],
            [sx + fs * 1.2, waveY + fs * 1.6],
            [sx + fs * 1.2, waveY - fs * 1.6],
        ], true);
    }

    // Enine dalga çizimi
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    line(k, x0, waveY, x1, waveY, 1);
    k.c.restore();
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        pts.push([x0 + (x1 - x0) * t, waveY - Math.sin(t * waves * Math.PI * 2 - phase) * waveH]);
    }
    k.c.lineWidth = Math.max(1.8, k.lw);
    path(k, pts, false);

    // Boyuna model: sıkışma ve seyrelmeler
    const partY = r.y + (icon ? r.h * 0.78 : r.h - fs * 3.4);
    const count = 90;
    for (let i = 0; i < count; i++) {
        const t = i / count;
        const shift = Math.sin(t * waves * Math.PI * 2 - phase) * ((x1 - x0) / count) * 2.4;
        k.c.beginPath();
        k.c.arc(x0 + (x1 - x0) * t + shift, partY, Math.max(1.2, fs * 0.1), 0, Math.PI * 2);
        k.c.fill();
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Dalga boyu ve genlik ölçüleri
    const lambda = (x1 - x0) / waves;
    const lx = x0 + lambda * 0.25;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    arrow(k, lx, waveY - waveH - fs * 0.9, lx + lambda, waveY - waveH - fs * 0.9, fs * 0.4, 1.2);
    arrow(k, lx + lambda, waveY - waveH - fs * 0.9, lx, waveY - waveH - fs * 0.9, fs * 0.4, 1.2);
    k.c.restore();
    label(k, 'dalga boyu', lx + lambda / 2, waveY - waveH - fs * 1.2, 'center', 'bottom', 0.6);
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    arrow(k, x0 + lambda * 0.25, waveY, x0 + lambda * 0.25, waveY - waveH, fs * 0.4, 1.2);
    k.c.restore();
    label(k, 'genlik', x0 + lambda * 0.25 + fs * 0.3, waveY - waveH / 2, 'left', 'middle', 0.6);
    label(k, 'sıkışma – seyrelme', (x0 + x1) / 2, partY + fs * 0.9, 'center', 'top', 0.62);

    label(
        k,
        fitText(
            k,
            [
                `Frekans ${fmtNum(s.freq, 0)} birim → ${s.freq >= 5 ? 'ince (tiz)' : s.freq <= 2 ? 'kalın (pes)' : 'orta'} ses`,
                `Frekans ${fmtNum(s.freq, 0)}`,
            ],
            r.w - fs * 4,
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
        fitText(
            k,
            [
                `Genlik ${fmtNum(s.amp, 0)} → ${s.amp >= 70 ? 'şiddetli' : s.amp <= 30 ? 'zayıf' : 'orta şiddette'} ses · frekans inceliği, genlik şiddeti belirler`,
                `Genlik ${fmtNum(s.amp, 0)} → ${s.amp >= 70 ? 'şiddetli' : s.amp <= 30 ? 'zayıf' : 'orta şiddette'} ses`,
            ],
            r.w - 8,
            0.7,
        ),
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.7,
    );
    k.c.restore();
};

export const soundSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => [
        {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: soundState(o).playing ? 'Dalgayı durdur' : 'Dalgayı hareket ettir',
            on: soundState(o).playing,
        },
    ],
    onControl: (_r, o, id): Record<string, number> =>
        id === 'play' ? { play: soundState(o).playing ? 0 : 1 } : {},
    params: [
        { key: 'freq', label: 'Frekans', min: 1, max: 8, step: 1 },
        { key: 'amp', label: 'Genlik', min: 10, max: 100, step: 5 },
        { key: 'play', label: 'Oynat (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Gaz basıncı (Basınç) ─────────────────────────────────────────────
//
// Kilit fikir: kapalı kapta gaz taneciklerinin sayısı değişmez. Hacim
// küçülünce tanecikler duvara daha sık çarpar, basınç artar: P · V sabit.

/** Sabit sıcaklıkta P · V çarpımı (birim). */
const GAS_CONST = 600;

const gasState = (o: MathObject) => {
    const v = clamp(simValue(o, 'v', 60), 20, 100);
    return { v, p: GAS_CONST / v };
};

function gasGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const tube = {
        x: r.x + (icon ? r.w * 0.06 : fs),
        y: r.y + (icon ? r.h * 0.24 : fs * 3.6),
        w: r.w * (icon ? 0.88 : 0.62),
        h: r.h - (icon ? r.h * 0.48 : fs * 6.4),
    };
    return { fs, icon, tube };
}

export const gasRender: Renderer = (k) => {
    const r = k.r;
    const s = gasState(k.o);
    const g = gasGeom(r);
    const t = g.tube;
    const gasW = t.w * (s.v / 100);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.6, k.lw);

    // Silindir: sağ ucu açık, pistonla kapanır
    line(k, t.x, t.y, t.x + t.w, t.y);
    line(k, t.x, t.y + t.h, t.x + t.w, t.y + t.h);
    line(k, t.x, t.y, t.x, t.y + t.h);

    // Gaz tanecikleri: sayı sabit, hacim küçülünce sıklaşır
    const count = 26;
    const scatter = (n: number) => Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1;
    for (let i = 0; i < count; i++) {
        const px = t.x + gasW * (0.04 + scatter(i + 1) * 0.92);
        const py = t.y + t.h * (0.08 + scatter(i + 51) * 0.84);
        k.c.beginPath();
        k.c.arc(px, py, Math.max(1.6, g.fs * 0.16), 0, Math.PI * 2);
        k.c.fill();
    }

    // Piston
    const px = t.x + gasW;
    k.c.save();
    k.c.globalAlpha = 0.18;
    k.c.fillRect(px, t.y, g.fs * 0.7, t.h);
    k.c.restore();
    k.c.strokeRect(px, t.y, g.fs * 0.7, t.h);
    // Piston kolu silindirin ucunda biter; göstergenin üstüne binmesin.
    line(k, px + g.fs * 0.7, t.y + t.h / 2, t.x + t.w, t.y + t.h / 2);

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Basınç göstergesi
    const gx = t.x + t.w + r.w * 0.1;
    const gy = t.y + t.h * 0.5;
    const grad = Math.min(r.w * 0.11, t.h * 0.42);
    k.c.beginPath();
    k.c.arc(gx, gy, grad, Math.PI, Math.PI * 2);
    k.c.stroke();
    line(k, gx - grad, gy, gx + grad, gy, 1);
    // İbre: basınç 6–30 aralığında
    const frac = clamp((s.p - 6) / 24, 0, 1);
    const ang = Math.PI + frac * Math.PI;
    line(k, gx, gy, gx + grad * 0.85 * Math.cos(ang), gy + grad * 0.85 * Math.sin(ang), Math.max(1.6, k.lw));
    label(k, `${fmtNum(s.p, 1)}`, gx, gy + g.fs * 0.8, 'center', 'top', 0.8);
    label(k, 'basınç', gx, gy + g.fs * 2, 'center', 'top', 0.62);

    label(
        k,
        fitText(
            k,
            ['Pistonu it: hacim küçülünce çarpışma sıklaşır', 'Pistonu sürükle'],
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
        `Hacim ${fmtNum(s.v, 0)} birim · basınç ${fmtNum(s.p, 1)} birim · P · V = ${fmtNum(s.p * s.v, 0)} (sabit)`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.78,
    );
    k.c.restore();
};

export const gasSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = gasState(o);
        const g = gasGeom(r);
        return [
            {
                id: 'piston',
                x: g.tube.x + g.tube.w * (s.v / 100) + g.fs * 0.35,
                y: g.tube.y + g.tube.h / 2,
                type: 'drag',
                label: 'Pistonu sürükle',
            },
        ];
    },
    onControl: (r, o, _id, p): Record<string, number> => {
        const g = gasGeom(r);
        return { v: clamp(((p.x - g.tube.x) / g.tube.w) * 100, 20, 100) };
    },
    params: [{ key: 'v', label: 'Hacim', min: 20, max: 100, step: 5, unit: 'birim' }],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const PHYSICS_SIM_RENDERERS: Record<string, Renderer> = {
    refraction_sim: refractionRender,
    motion_graph_sim: motionRender,
    net_force_sim: netForceRender,
    energy_sim: energyRender,
    ohm_sim: ohmRender,
    sound_wave_sim: soundRender,
    gas_pressure_sim: gasRender,
};

export const PHYSICS_SIM_SPECS: Record<string, SimSpec> = {
    refraction_sim: refractionSpec,
    motion_graph_sim: motionSpec,
    net_force_sim: netForceSpec,
    energy_sim: energySpec,
    ohm_sim: ohmSpec,
    sound_wave_sim: soundSpec,
    gas_pressure_sim: gasSpec,
};

export const PHYSICS_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'refraction_sim',
        label: 'Işığın Kırılması',
        hint: 'Gelme açısını sürükle; kırılmayı ve tam yansımayı gör',
        size: { w: 500, h: 340 },
        defaults: { labels: true, sim: { angle: 40, pair: 0 } },
    },
    {
        kind: 'motion_graph_sim',
        label: 'Hareket Grafikleri',
        hint: 'Aracı izle; konum-zaman ve hız-zaman grafiği eşzamanlı çizilsin',
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { v0: 4, a: 0, time: 4, play: 0 } },
    },
    {
        kind: 'net_force_sim',
        label: 'Bileşke Kuvvet',
        hint: 'Kuvvet oklarını sürükle; bileşkeyi ve dengeyi gör',
        size: { w: 500, h: 340 },
        defaults: { labels: true, sim: { f1: 30, a1: 0, f2: 20, a2: 90 } },
    },
    {
        kind: 'energy_sim',
        label: 'Enerji Dönüşümü',
        hint: 'Sarkacı bırak; kinetik ve potansiyel enerji çubuklarını izle',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { amp: 40, play: 0, damp: 0 } },
    },
    {
        kind: 'ohm_sim',
        label: 'Ohm Yasası',
        hint: 'Gerilimi değiştir; akım ve grafiğin eğimi ilişkisini gör',
        size: { w: 540, h: 340 },
        defaults: { labels: true, sim: { v: 6, r: 3 } },
    },
    {
        kind: 'sound_wave_sim',
        label: 'Ses Dalgası',
        hint: 'Frekans ve genliği değiştir; incelik ile şiddeti ayır',
        size: { w: 540, h: 320 },
        defaults: { labels: true, sim: { freq: 3, amp: 60, play: 0 } },
    },
    {
        kind: 'gas_pressure_sim',
        label: 'Gaz Basıncı',
        hint: 'Pistonu it; hacim küçülünce basınç artsın (P · V sabit)',
        size: { w: 540, h: 320 },
        defaults: { labels: true, sim: { v: 60 } },
    },
];
