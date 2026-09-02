// src/components/drawing/bioSims.ts
// Biyoloji simülasyonları: fotosentez hızı ve DNA baz eşleşmesi.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    roundRect,
    simValue,
    withAlpha,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── Fotosentez hızı (Bitkilerde Üreme, Büyüme ve Gelişme) ────────────
//
// Kilit fikir: fotosentez hızını en YETERSİZ etmen belirler. Işık bol
// olsa da karbondioksit azsa hız artmaz; sıcaklık optimumdan uzaklaştıkça
// enzimler yavaşladığı için hız düşer.

interface PhotoState {
    light: number;
    co2: number;
    temp: number;
    /** Etmenlerin 0–1 arası katkıları. */
    fLight: number;
    fCo2: number;
    fTemp: number;
    rate: number;
    limiting: string;
}

function photoState(o: MathObject): PhotoState {
    const light = clamp(simValue(o, 'light', 60), 0, 100);
    const co2 = clamp(simValue(o, 'co2', 60), 0, 100);
    const temp = clamp(simValue(o, 'temp', 25), 0, 40);
    // Işık ve CO₂ doygunluk eğrisi izler: arttıkça katkısı azalarak artar.
    const fLight = light / (light + 25);
    const fCo2 = co2 / (co2 + 20);
    // Sıcaklık 25 °C civarında en verimli; uzaklaştıkça hızla düşer.
    const fTemp = Math.exp(-((temp - 25) ** 2) / 120);
    const factors: Array<[string, number]> = [
        ['ışık şiddeti', fLight],
        ['karbondioksit', fCo2],
        ['sıcaklık', fTemp],
    ];
    factors.sort((a, b) => a[1] - b[1]);
    return {
        light,
        co2,
        temp,
        fLight,
        fCo2,
        fTemp,
        rate: fLight * fCo2 * fTemp,
        limiting: factors[0][0],
    };
}

export const photosynthesisRender: Renderer = (k) => {
    const r = k.r;
    const s = photoState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    // Güneş beherin soluna sığsın diye kap biraz sağa alınır.
    const tank = {
        x: r.x + r.w * (icon ? 0.2 : 0.17),
        y: r.y + (icon ? r.h * 0.12 : fs * 2.6),
        w: r.w * (icon ? 0.6 : 0.3),
        h: r.h - (icon ? r.h * 0.24 : fs * 4.4),
    };

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Beher ve su
    line(k, tank.x, tank.y, tank.x, tank.y + tank.h);
    line(k, tank.x, tank.y + tank.h, tank.x + tank.w, tank.y + tank.h);
    line(k, tank.x + tank.w, tank.y, tank.x + tank.w, tank.y + tank.h);
    const waterY = tank.y + tank.h * 0.16;
    k.c.save();
    k.c.globalAlpha = 0.1;
    k.c.fillRect(tank.x, waterY, tank.w, tank.y + tank.h - waterY);
    k.c.restore();
    line(k, tank.x, waterY, tank.x + tank.w, waterY, 1.2);

    // Su bitkisi: gövde ve yapraklar
    const stemX = tank.x + tank.w * 0.42;
    line(k, stemX, tank.y + tank.h, stemX, waterY + tank.h * 0.14, Math.max(1.6, k.lw));
    for (let i = 0; i < 3; i++) {
        const ly = waterY + tank.h * (0.24 + i * 0.22);
        const dir = i % 2 === 0 ? 1 : -1;
        k.c.save();
        k.c.translate(stemX, ly);
        k.c.rotate(dir * 0.6);
        k.c.beginPath();
        k.c.ellipse(dir * tank.w * 0.12, 0, tank.w * 0.13, tank.h * 0.045, 0, 0, Math.PI * 2);
        k.c.stroke();
        k.c.save();
        k.c.globalAlpha = 0.18;
        k.c.fill();
        k.c.restore();
        k.c.restore();
    }

    // Oksijen kabarcıkları: sayısı ve hızı fotosentez hızıyla artar
    const bubbles = Math.round(s.rate * 14);
    for (let i = 0; i < bubbles; i++) {
        const phase = (k.t * (0.25 + s.rate * 0.7) + i / Math.max(1, bubbles)) % 1;
        const by = tank.y + tank.h - phase * (tank.y + tank.h - waterY);
        const bx = stemX + Math.sin(phase * 6 + i) * tank.w * 0.12;
        k.c.beginPath();
        k.c.arc(bx, by, Math.max(1.5, tank.w * 0.022), 0, Math.PI * 2);
        k.c.stroke();
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Güneş: ışın sayısı ışık şiddetini gösterir
    const sun = { x: r.x + fs * 2, y: tank.y + tank.h * 0.12, r: fs * 0.8 };
    k.c.beginPath();
    k.c.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
    k.c.stroke();
    const rays = Math.round(2 + (s.light / 100) * 8);
    for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2;
        line(k, sun.x + sun.r * 1.3 * Math.cos(a), sun.y + sun.r * 1.3 * Math.sin(a), sun.x + sun.r * 1.9 * Math.cos(a), sun.y + sun.r * 1.9 * Math.sin(a), 1);
    }

    // Hız göstergesi
    const gauge = {
        x: tank.x + tank.w + r.w * 0.05,
        y: tank.y + tank.h * 0.1,
        w: fs * 1.6,
        h: tank.h * 0.8,
    };
    roundRect(k, gauge.x, gauge.y, gauge.w, gauge.h, 4);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.28;
    k.c.fillRect(gauge.x, gauge.y + gauge.h * (1 - s.rate), gauge.w, gauge.h * s.rate);
    k.c.restore();
    label(k, `%${fmtNum(s.rate * 100, 0)}`, gauge.x + gauge.w / 2, gauge.y - fs * 0.3, 'center', 'bottom', 0.72);
    label(k, 'fotosentez hızı', gauge.x + gauge.w / 2, gauge.y + gauge.h + fs * 0.3, 'center', 'top', 0.62);

    // Etmen okumaları
    const tx = gauge.x + gauge.w + r.w * 0.04;
    const room = r.x + r.w - tx - 4;
    const lines: Array<[string, string]> = [
        [`Işık: ${fmtNum(s.light, 0)} · katkı %${fmtNum(s.fLight * 100, 0)}`, `Işık %${fmtNum(s.fLight * 100, 0)}`],
        [`CO₂: ${fmtNum(s.co2, 0)} · katkı %${fmtNum(s.fCo2 * 100, 0)}`, `CO₂ %${fmtNum(s.fCo2 * 100, 0)}`],
        [
            `Sıcaklık: ${fmtNum(s.temp, 0)} °C · katkı %${fmtNum(s.fTemp * 100, 0)}`,
            `${fmtNum(s.temp, 0)} °C · %${fmtNum(s.fTemp * 100, 0)}`,
        ],
        [`Sınırlayıcı: ${s.limiting}`, s.limiting],
    ];
    lines.forEach(([long, short], i) => {
        label(k, fitText(k, [long, short], room, 0.68), tx, gauge.y + fs * (0.8 + i * 1.6), 'left', 'middle', 0.68);
    });

    label(
        k,
        fitText(
            k,
            ['Hızı en yetersiz etmen belirler', 'Fotosentez hızı'],
            r.w - fs * 3,
            0.82,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.82,
    );
    k.c.restore();
};

export const photosynthesisSpec: SimSpec = {
    // Kabarcıklar akarken kare gerekir; hız sıfırsa boşuna çizim yapılmaz.
    animated: (o) => photoState(o).rate > 0.02,
    params: [
        { key: 'light', label: 'Işık şiddeti', min: 0, max: 100, step: 5 },
        { key: 'co2', label: 'Karbondioksit', min: 0, max: 100, step: 5 },
        { key: 'temp', label: 'Sıcaklık', min: 0, max: 40, step: 1, unit: '°C' },
    ],
};

// ── DNA baz eşleşmesi (DNA ve Genetik Kod) ───────────────────────────
//
// Kilit fikir: bazlar rastgele değil, hep aynı ikilileri kurar:
// A karşısına T, G karşısına C. Karşı zinciri kurmak bu kuralı uygulamaktır.

const BASES = ['A', 'T', 'G', 'C'];
/** A↔T ve G↔C: her bazın eşi. */
const BASE_PAIR = [1, 0, 3, 2];
const DNA_RUNGS = 6;

function dnaState(o: MathObject) {
    const left = Array.from({ length: DNA_RUNGS }, (_, i) =>
        clampInt(simValue(o, `l${i}`, [0, 2, 1, 3, 0, 1][i]), 0, 3, 0)
    );
    // 0 boş demektir; seçilen baz 1..4 olarak saklanır.
    const right = Array.from({ length: DNA_RUNGS }, (_, i) => clampInt(simValue(o, `r${i}`, 0), 0, 4, 0));
    const correct = left.filter((b, i) => right[i] - 1 === BASE_PAIR[b]).length;
    return { left, right, correct, show: simValue(o, 'show', 0) > 0.5 };
}

function dnaGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const top = r.y + (icon ? r.h * 0.08 : fs * 2.6);
    const bottom = r.y + r.h - (icon ? r.h * 0.08 : fs * 2.2);
    const step = (bottom - top) / (DNA_RUNGS - 1);
    return {
        fs,
        icon,
        top,
        step,
        leftX: r.x + r.w * 0.34,
        rightX: r.x + r.w * 0.66,
        box: Math.min(fs * 1.7, step * 0.7),
        rungY: (i: number) => top + step * i,
    };
}

export const dnaRender: Renderer = (k) => {
    const r = k.r;
    const s = dnaState(k.o);
    const g = dnaGeom(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.6, k.lw);

    // Şeker-fosfat omurgaları: baz kutularının dışından geçer
    const topY = g.top - g.step * 0.4;
    const botY = g.rungY(DNA_RUNGS - 1) + g.step * 0.4;
    line(k, g.leftX - g.box * 1.2, topY, g.leftX - g.box * 1.2, botY);
    line(k, g.rightX + g.box * 1.15, topY, g.rightX + g.box * 1.15, botY);

    // Simge ölçeğinde altı basamak lekeye dönüşüyor; ikisi atlanır.
    const stepBy = g.icon ? 2 : 1;
    for (let i = 0; i < DNA_RUNGS; i += stepBy) {
        const y = g.rungY(i);
        const chosen = s.right[i];
        const ok = chosen - 1 === BASE_PAIR[s.left[i]];
        // Basamak: doğru eşleşmede sürekli, boş ya da yanlışta kesikli
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, chosen === 0 ? 0.35 : 0.8);
        if (chosen === 0 || (s.show && !ok)) k.c.setLineDash([4, 3]);
        line(k, g.leftX + g.box * 0.5, y, g.rightX - g.box * 0.5, y, 1.4);
        k.c.restore();

        // Sol (verilen) baz
        k.c.lineWidth = k.lw;
        roundRect(k, g.leftX - g.box, y - g.box / 2, g.box * 2 * 0.75, g.box, 4);
        k.c.stroke();
        k.c.save();
        k.c.globalAlpha = 0.12;
        k.c.fill();
        k.c.restore();
        if (!g.icon) {
            label(k, BASES[s.left[i]], g.leftX - g.box * 0.25, y, 'center', 'middle', 0.85);
        }

        // Sağ (öğrencinin seçtiği) baz
        k.c.save();
        if (chosen === 0) k.c.setLineDash([4, 3]);
        roundRect(k, g.rightX - g.box * 0.5, y - g.box / 2, g.box * 2 * 0.75, g.box, 4);
        k.c.stroke();
        k.c.restore();
        if (!g.icon) {
            label(
                k,
                chosen === 0 ? '?' : BASES[chosen - 1],
                g.rightX + g.box * 0.25,
                y,
                'center',
                'middle',
                0.85,
            );
            if (s.show && chosen !== 0) {
                label(k, ok ? '✓' : '✕', g.rightX + g.box * 1.65, y, 'center', 'middle', 0.8);
            }
        }
    }

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(
        k,
        fitText(
            k,
            [
                s.show
                    ? `Baz eşleşmesi · ${s.correct} / ${DNA_RUNGS} doğru`
                    : 'Karşı zinciri kur: A–T, G–C',
                s.show ? `${s.correct} / ${DNA_RUNGS} doğru` : 'A–T, G–C',
            ],
            r.w - g.fs * 5.5,
            0.85,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.85,
    );
    label(k, 'verilen zincir', g.leftX - g.box * 0.25, r.y + r.h, 'center', 'bottom', 0.65);
    label(k, 'karşı zincir', g.rightX + g.box * 0.25, r.y + r.h, 'center', 'bottom', 0.65);
    k.c.restore();
};

export const dnaSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = dnaState(o);
        const g = dnaGeom(r);
        const out: SimControl[] = Array.from({ length: DNA_RUNGS }, (_, i) => ({
            id: `base${i}`,
            // Düğme kutunun sağında durur; üstünde olsaydı harfi kapatırdı.
            x: g.rightX + g.box * 2.35,
            y: g.rungY(i),
            type: 'toggle' as const,
            label: `${i + 1}. basamak — bazı değiştir (${s.right[i] === 0 ? 'boş' : BASES[s.right[i] - 1]})`,
            on: s.right[i] !== 0,
        }));
        out.push(
            {
                id: 'check',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.show ? 'Cevapları gizle' : 'Kontrol et',
                on: s.show,
            },
            {
                id: 'new',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: 'Yeni zincir üret',
                on: false,
            },
        );
        return out;
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = dnaState(o);
        if (id === 'check') return { show: s.show ? 0 : 1 };
        if (id === 'new') {
            const patch: Record<string, number> = { show: 0 };
            for (let i = 0; i < DNA_RUNGS; i++) {
                patch[`l${i}`] = Math.floor(Math.random() * 4);
                patch[`r${i}`] = 0;
            }
            return patch;
        }
        if (!id.startsWith('base')) return {};
        const i = Number(id.slice(4));
        if (!Number.isInteger(i) || i < 0 || i >= DNA_RUNGS) return {};
        // Boş → A → T → G → C → boş
        return { [`r${i}`]: (s.right[i] + 1) % 5 };
    },
    params: [{ key: 'show', label: 'Cevaplar (0/1)', min: 0, max: 1, step: 1 }],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const BIO_SIM_RENDERERS: Record<string, Renderer> = {
    photosynthesis_sim: photosynthesisRender,
    dna_pair_sim: dnaRender,
};

export const BIO_SIM_SPECS: Record<string, SimSpec> = {
    photosynthesis_sim: photosynthesisSpec,
    dna_pair_sim: dnaSpec,
};

export const BIO_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'photosynthesis_sim',
        label: 'Fotosentez Hızı',
        hint: 'Işık, CO₂ ve sıcaklığı değiştir; kabarcık hızını izle',
        size: { w: 540, h: 340 },
        defaults: { labels: true, sim: { light: 60, co2: 60, temp: 25 } },
    },
    {
        kind: 'dna_pair_sim',
        label: 'DNA Baz Eşleşmesi',
        hint: 'Karşı zinciri kur (A–T, G–C) ve kontrol et',
        size: { w: 440, h: 360 },
        defaults: { labels: true, sim: { show: 0 } },
    },
];
