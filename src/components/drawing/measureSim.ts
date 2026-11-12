// src/components/drawing/measureSim.ts
// Ölçü okuma alıştırması: aletteki değeri oku, şıklardan seç, kontrol et.
//
// Dört alet tek nesnede toplanır; her alet için birkaç hazır ölçüm vardır.
// Yeni alet ya da yeni ölçüm eklemek MEASURE_TOOLS dizisine kayıt yazmaktır.

import type { MathObject } from '../../types';
import {
    clampInt,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
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

interface MeasureTool {
    name: string;
    unit: string;
    /** Ölçek aralığı ve bir bölmenin değeri. */
    min: number;
    max: number;
    tick: number;
    /** Hazır ölçümler; her biri bir soru olur. */
    values: ReadonlyArray<number>;
    /** Aleti çizer; `value` gösterilecek okuma. */
    draw: (k: Ctx, b: Rect, value: number, tool: MeasureTool) => void;
}

/** Ölçekli bir cetvel/termometre gövdesi için ortak bölme çizimi. */
function ticks(
    k: Ctx,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    tool: MeasureTool,
    labelEvery: number,
    fs: number,
    vertical: boolean
) {
    const steps = Math.round((tool.max - tool.min) / tool.tick);
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const value = tool.min + i * tool.tick;
        const big = Math.abs(value / (tool.tick * labelEvery) - Math.round(value / (tool.tick * labelEvery))) < 1e-6;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;
        const len = big ? fs * 0.8 : fs * 0.45;
        if (vertical) line(k, px, py, px + len, py, 1);
        else line(k, px, py, px, py - len, 1);
        // Simge ölçeğinde sayılar okunmaz; yalnız bölmeler kalır.
        if (big && fs >= 6) {
            if (vertical) label(k, fmtNum(value, 0), px + len + fs * 0.25, py, 'left', 'middle', 0.55);
            else label(k, fmtNum(value, 0), px, py - len - fs * 0.2, 'center', 'bottom', 0.55);
        }
    }
}

const drawThermometer: MeasureTool['draw'] = (k, b, value, tool) => {
    const cx = b.x + b.w * 0.3;
    const top = b.y + b.h * 0.08;
    const bottom = b.y + b.h * 0.82;
    const w = Math.min(b.w * 0.08, 18);
    k.c.lineWidth = k.lw;
    roundRect(k, cx - w / 2, top, w, bottom - top, w / 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(cx, bottom + w * 0.7, w * 0.9, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.55;
    k.c.fill();
    const f = (value - tool.min) / (tool.max - tool.min);
    k.c.fillRect(cx - w * 0.28, bottom - (bottom - top) * f, w * 0.56, (bottom - top) * f);
    k.c.restore();
    ticks(k, cx + w * 0.5, bottom, cx + w * 0.5, top, tool, 2, Math.min(16, b.h * 0.05), true);
};

const drawCylinder: MeasureTool['draw'] = (k, b, value, tool) => {
    const cx = b.x + b.w * 0.3;
    const w = Math.min(b.w * 0.22, b.h * 0.4);
    const top = b.y + b.h * 0.08;
    const bottom = b.y + b.h * 0.9;
    k.c.lineWidth = k.lw;
    line(k, cx - w / 2, top, cx - w / 2, bottom);
    line(k, cx + w / 2, top, cx + w / 2, bottom);
    line(k, cx - w / 2, bottom, cx + w / 2, bottom);
    const f = (value - tool.min) / (tool.max - tool.min);
    const level = bottom - (bottom - top) * f;
    k.c.save();
    k.c.globalAlpha = 0.16;
    k.c.fillRect(cx - w / 2, level, w, bottom - level);
    k.c.restore();
    // Sıvı yüzeyi hafif içbükey görünür
    k.c.beginPath();
    k.c.moveTo(cx - w / 2, level);
    k.c.quadraticCurveTo(cx, level + w * 0.12, cx + w / 2, level);
    k.c.stroke();
    ticks(k, cx + w * 0.5, bottom, cx + w * 0.5, top, tool, 2, Math.min(16, b.h * 0.05), true);
};

const drawDynamometer: MeasureTool['draw'] = (k, b, value, tool) => {
    const cx = b.x + b.w * 0.3;
    const top = b.y + b.h * 0.08;
    const bottom = b.y + b.h * 0.78;
    const w = Math.min(b.w * 0.12, 26);
    k.c.lineWidth = k.lw;
    roundRect(k, cx - w / 2, top, w, bottom - top, 4);
    k.c.stroke();
    // Yay
    const f = (value - tool.min) / (tool.max - tool.min);
    const hookY = top + (bottom - top) * (0.2 + f * 0.7);
    // Yay: az sayıda geniş halka, okuma çizgisini kapatmasın
    const coils = 6;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.65);
    k.c.beginPath();
    for (let i = 0; i <= coils * 2; i++) {
        const t = i / (coils * 2);
        const x = cx + (i % 2 === 0 ? -w * 0.26 : w * 0.26);
        const y = top + (hookY - top) * t;
        if (i === 0) k.c.moveTo(x, y);
        else k.c.lineTo(x, y);
    }
    k.c.stroke();
    k.c.restore();
    // Gösterge çizgisi ve ucundaki ibre
    line(k, cx - w * 0.5, hookY, cx + w * 0.62, hookY, Math.max(2, k.lw * 1.4));
    k.c.beginPath();
    k.c.moveTo(cx + w * 0.62, hookY);
    k.c.lineTo(cx + w * 0.3, hookY - w * 0.2);
    k.c.lineTo(cx + w * 0.3, hookY + w * 0.2);
    k.c.closePath();
    k.c.fill();
    line(k, cx, hookY, cx, hookY + w * 0.5);
    k.c.beginPath();
    k.c.arc(cx, hookY + w * 0.8, w * 0.3, Math.PI * 0.2, Math.PI * 1.6);
    k.c.stroke();
    ticks(k, cx + w * 0.5, top + (bottom - top) * 0.2, cx + w * 0.5, bottom, tool, 2, Math.min(16, b.h * 0.05), true);
};

const drawRuler: MeasureTool['draw'] = (k, b, value, tool) => {
    const x0 = b.x + b.w * 0.06;
    const x1 = b.x + b.w * 0.94;
    const y = b.y + b.h * 0.6;
    const h = Math.min(b.h * 0.22, 44);
    k.c.lineWidth = k.lw;
    k.c.strokeRect(x0, y, x1 - x0, h);
    ticks(k, x0, y, x1, y, tool, 2, Math.min(16, b.h * 0.06), false);
    // Ölçülen cisim
    const f = (value - tool.min) / (tool.max - tool.min);
    k.c.save();
    k.c.globalAlpha = 0.18;
    k.c.fillRect(x0, y - h * 0.9, (x1 - x0) * f, h * 0.7);
    k.c.restore();
    k.c.strokeRect(x0, y - h * 0.9, (x1 - x0) * f, h * 0.7);
};

const MEASURE_TOOLS: ReadonlyArray<MeasureTool> = [
    {
        name: 'Termometre',
        unit: '°C',
        min: -10,
        max: 50,
        tick: 2,
        values: [24, 36, -4, 12],
        draw: drawThermometer,
    },
    {
        name: 'Dereceli silindir',
        unit: 'mL',
        min: 0,
        max: 100,
        tick: 5,
        values: [45, 70, 25, 90],
        draw: drawCylinder,
    },
    {
        name: 'Dinamometre',
        unit: 'N',
        min: 0,
        max: 20,
        tick: 1,
        values: [7, 12, 3, 16],
        draw: drawDynamometer,
    },
    {
        name: 'Cetvel',
        unit: 'cm',
        min: 0,
        max: 20,
        tick: 1,
        values: [8, 13, 5, 17],
        draw: drawRuler,
    },
];

function measureState(o: MathObject) {
    const mode = clampInt(simValue(o, 'mode', 0), 0, MEASURE_TOOLS.length - 1, 0);
    const tool = MEASURE_TOOLS[mode];
    const idx = clampInt(simValue(o, 'q', 0), 0, tool.values.length - 1, 0);
    const value = tool.values[idx];
    // Şıklar: doğru değer ve yakın çeldiriciler, soruya göre sabit sırada.
    const step = tool.tick;
    const offsets = [0, step, -step, step * 2];
    const options = offsets.map((d, i) => value + offsets[(i + idx) % offsets.length] * (i === 0 ? 0 : 1));
    const unique = Array.from(new Set(options));
    while (unique.length < 4) unique.push(value + step * (unique.length + 1));
    const shuffled = unique.slice(0, 4);
    // Doğru şıkkın yeri soruya göre değişsin diye döndürülür.
    const rot = idx % 4;
    const rotated = shuffled.slice(rot).concat(shuffled.slice(0, rot));
    return {
        mode,
        tool,
        idx,
        value,
        options: rotated,
        answer: rotated.indexOf(value),
        pick: clampInt(simValue(o, 'pick', -1), -1, 3, -1),
        show: simValue(o, 'show', 0) > 0.5,
    };
}

function measureGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const optionH = fs * 1.9;
    const optionsY = r.y + r.h - fs * 1.6 - optionH / 2;
    return {
        fs,
        icon,
        optionH,
        optionsY,
        optionW: (r.w - fs * 2) / 4 - fs * 0.4,
        panel: {
            x: r.x,
            y: r.y + (icon ? 0 : fs * 2.2),
            w: r.w,
            h: (icon ? r.h : optionsY - optionH - r.y - fs * 2.4),
        },
        optionX: (i: number) => r.x + fs + ((r.w - fs * 2) / 4) * (i + 0.5),
    };
}

export const measureRender: Renderer = (k) => {
    const r = k.r;
    const s = measureState(k.o);
    const g = measureGeom(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    s.tool.draw(k, g.panel, s.value, s.tool);

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Şıklar
    s.options.forEach((opt, i) => {
        const x = g.optionX(i);
        const picked = s.pick === i;
        const ok = i === s.answer;
        k.c.save();
        k.c.lineWidth = picked ? Math.max(2, k.lw * 1.6) : k.lw;
        if (s.show && picked && !ok) k.c.setLineDash([5, 3]);
        roundRect(k, x - g.optionW / 2, g.optionsY - g.optionH / 2, g.optionW, g.optionH, g.optionH * 0.3);
        k.c.stroke();
        k.c.save();
        k.c.globalAlpha = picked ? 0.14 : 0.04;
        k.c.fill();
        k.c.restore();
        k.c.restore();
        const mark = s.show ? (ok ? ' ✓' : picked ? ' ✕' : '') : '';
        label(k, `${fmtNum(opt, 1)} ${s.tool.unit}${mark}`, x, g.optionsY, 'center', 'middle', 0.72);
    });

    label(
        k,
        fitText(
            k,
            [`${s.tool.name} kaç ${s.tool.unit} gösteriyor?`, s.tool.name],
            r.w - g.fs * 5.5,
            0.85,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.85,
    );
    // Bölme değeri solda, sonuç sağda: ikisi de başlık satırından ayrı durur.
    label(
        k,
        `bir bölme = ${fmtNum(s.tool.tick, 1)} ${s.tool.unit}`,
        r.x + 6,
        g.optionsY - g.optionH * 0.9,
        'left',
        'bottom',
        0.62,
    );
    if (s.show) {
        label(
            k,
            s.pick < 0
                ? `Doğru okuma ${fmtNum(s.value, 1)} ${s.tool.unit}`
                : s.pick === s.answer
                  ? 'Doğru okudun'
                  : `Yanlış · doğrusu ${fmtNum(s.value, 1)} ${s.tool.unit}`,
            r.x + r.w - 6,
            g.optionsY - g.optionH * 0.9,
            'right',
            'bottom',
            0.72,
        );
    }
    k.c.restore();
};

export const measureSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = measureState(o);
        const g = measureGeom(r);
        const out: SimControl[] = s.options.map((opt, i) => ({
            id: `opt${i}`,
            x: g.optionX(i),
            y: g.optionsY,
            type: 'toggle' as const,
            label: `${fmtNum(opt, 1)} ${s.tool.unit} şıkkını seç`,
            on: s.pick === i,
        }));
        out.push(
            {
                id: 'check',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.show ? 'Cevabı gizle' : 'Kontrol et',
                on: s.show,
            },
            { id: 'next', x: r.x + r.w - 40, y: r.y + 14, type: 'toggle', label: 'Yeni ölçüm', on: false },
            {
                id: 'mode',
                x: r.x + r.w - 66,
                y: r.y + 14,
                type: 'toggle',
                label: `Aleti değiştir (şimdi: ${s.tool.name})`,
                on: s.mode > 0,
            },
        );
        return out;
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = measureState(o);
        if (id === 'check') return { show: s.show ? 0 : 1 };
        if (id === 'next') return { q: (s.idx + 1) % s.tool.values.length, pick: -1, show: 0 };
        if (id === 'mode') {
            return { mode: (s.mode + 1) % MEASURE_TOOLS.length, q: 0, pick: -1, show: 0 };
        }
        if (!id.startsWith('opt')) return {};
        const i = Number(id.slice(3));
        return Number.isInteger(i) ? { pick: s.pick === i ? -1 : i } : {};
    },
    params: [
        { key: 'mode', label: `Alet (0-${MEASURE_TOOLS.length - 1})`, min: 0, max: MEASURE_TOOLS.length - 1, step: 1 },
        { key: 'q', label: 'Ölçüm (0-3)', min: 0, max: 3, step: 1 },
        { key: 'show', label: 'Cevap (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const MEASURE_SIM_RENDERERS: Record<string, Renderer> = { measure_read_sim: measureRender };

export const MEASURE_SIM_SPECS: Record<string, SimSpec> = { measure_read_sim: measureSpec };

export const MEASURE_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'measure_read_sim',
        label: 'Ölçü Okuma',
        hint: `Termometre, silindir, dinamometre ve cetvel okuma alıştırması`,
        size: { w: 520, h: 380 },
        defaults: { labels: true, sim: { mode: 0, q: 0, pick: -1, show: 0 } },
    },
];
