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

// ── Kayıt ────────────────────────────────────────────────────────────

export const PHYSICS_SIM_RENDERERS: Record<string, Renderer> = {
    refraction_sim: refractionRender,
    motion_graph_sim: motionRender,
};

export const PHYSICS_SIM_SPECS: Record<string, SimSpec> = {
    refraction_sim: refractionSpec,
    motion_graph_sim: motionSpec,
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
];
