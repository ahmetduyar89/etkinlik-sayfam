// src/components/drawing/bioSims.ts
// Biyoloji simülasyonları: fotosentez hızı ve DNA baz eşleşmesi.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    fillShape,
    clampInt,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    panel,
    path,
    roundRect,
    simValue,
    smooth,
    textWidth,
    smoothPath,
    withAlpha,
    type Ctx,
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

// ── Doğal seçilim (Adaptasyon ve Evrim) ──────────────────────────────
//
// Kilit fikir: çevreye daha uygun olan birey daha çok yaşar ve daha çok
// yavru bırakır. Zemin koyulaştıkça koyu bireyler avcıdan gizlenir ve
// nesiller boyunca oranları artar; bireyler değişmez, POPÜLASYON değişir.

const SELECTION_POP = 40;
const SELECTION_MAX_GEN = 12;

function selectionState(o: MathObject) {
    const bg = clamp(simValue(o, 'bg', 20), 0, 100);
    const gen = clampInt(simValue(o, 'gen', 0), 0, SELECTION_MAX_GEN, 0);
    // Zemin ne kadar koyuysa koyu bireylerin ulaşacağı oran o kadar yüksek.
    const target = 0.05 + 0.9 * (bg / 100);
    // Başlangıçta yarı yarıya; her nesilde hedefe biraz daha yaklaşır.
    const dark = 0.5 + (target - 0.5) * (1 - Math.exp(-0.45 * gen));
    const darkCount = Math.round(dark * SELECTION_POP);
    return {
        bg,
        gen,
        dark,
        darkCount,
        lightCount: SELECTION_POP - darkCount,
        favored: bg >= 50 ? 'koyu' : 'açık',
    };
}

export const selectionRender: Renderer = (k) => {
    const r = k.r;
    const s = selectionState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    // Alt bölge sırasıyla oran çubuğu, düğme başlıkları, düğmeler ve özet
    // satırına ayrılır; yükseklikler yazı boyuna göre hesaplanır.
    const ctrlY = r.y + r.h - fs * 2.3;
    const capY = ctrlY - fs * 0.9;
    const barH = fs * 0.9;
    const barY = capY - fs * 1.5 - barH;
    const field = {
        x: r.x + (icon ? r.w * 0.06 : fs),
        y: r.y + (icon ? r.h * 0.06 : fs * 2.6),
        w: r.w - (icon ? r.w * 0.12 : fs * 2),
        h: (icon ? r.h * 0.88 : barY - fs * 0.5 - (r.y + fs * 2.6)),
    };

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Zemin
    k.c.strokeRect(field.x, field.y, field.w, field.h);
    k.c.save();
    k.c.globalAlpha = 0.05 + (s.bg / 100) * 0.3;
    k.c.fillRect(field.x, field.y, field.w, field.h);
    k.c.restore();

    // Bireyler: koyu olanlar dolu, açık olanlar boş daire
    const cols = 8;
    const rows = Math.ceil(SELECTION_POP / cols);
    const cw = field.w / (cols + 1);
    const chh = field.h / (rows + 1);
    const dotR = Math.min(cw, chh) * 0.3;
    for (let i = 0; i < SELECTION_POP; i++) {
        const cx = field.x + cw * (0.9 + (i % cols));
        const cy = field.y + chh * (0.9 + Math.floor(i / cols));
        k.c.beginPath();
        k.c.arc(cx, cy, dotR, 0, Math.PI * 2);
        if (i < s.darkCount) {
            k.c.save();
            k.c.globalAlpha = 0.85;
            k.c.fill();
            k.c.restore();
        } else {
            k.c.save();
            k.c.globalAlpha = 0.9;
            k.c.fillStyle = '#ffffff';
            k.c.fill();
            k.c.restore();
            k.c.stroke();
        }
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Oran çubuğu
    k.c.strokeRect(field.x, barY, field.w, barH);
    k.c.save();
    k.c.globalAlpha = 0.75;
    k.c.fillRect(field.x, barY, field.w * s.dark, barH);
    k.c.restore();
    label(k, `koyu %${fmtNum(s.dark * 100, 0)}`, field.x + 4, barY + barH / 2, 'left', 'middle', 0.62);
    label(
        k,
        `açık %${fmtNum((1 - s.dark) * 100, 0)}`,
        field.x + field.w - 4,
        barY + barH / 2,
        'right',
        'middle',
        0.62,
    );

    label(
        k,
        fitText(
            k,
            [
                `${s.gen}. nesil · zemin ${s.bg < 35 ? 'açık' : s.bg > 65 ? 'koyu' : 'orta'} · avantajlı olan ${s.favored} bireyler`,
                `${s.gen}. nesil · avantajlı: ${s.favored}`,
            ],
            r.w - fs * 5,
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
        fitText(
            k,
            [
                `${s.darkCount} koyu · ${s.lightCount} açık birey — bireyler değişmez, popülasyonun oranı değişir`,
                `${s.darkCount} koyu · ${s.lightCount} açık birey — popülasyonun oranı değişir`,
                `${s.darkCount} koyu · ${s.lightCount} açık birey`,
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
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.75);
    label(k, 'sonraki nesil', r.x + r.w * 0.3, capY, 'center', 'bottom', 0.66);
    label(k, 'başa dön', r.x + r.w * 0.62, capY, 'center', 'bottom', 0.66);
    k.c.restore();
    k.c.restore();
};

export const selectionSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = selectionState(o);
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            {
                id: 'next',
                x: r.x + r.w * 0.3,
                y: r.y + r.h - fs * 2.3,
                type: 'toggle',
                label: 'Bir nesil ilerlet',
                on: s.gen > 0,
            },
            {
                id: 'reset',
                x: r.x + r.w * 0.62,
                y: r.y + r.h - fs * 2.3,
                type: 'toggle',
                label: 'İlk nesle dön',
                on: s.gen === 0,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = selectionState(o);
        if (id === 'next') return { gen: Math.min(SELECTION_MAX_GEN, s.gen + 1) };
        if (id === 'reset') return { gen: 0 };
        return {};
    },
    params: [
        { key: 'bg', label: 'Zeminin koyuluğu', min: 0, max: 100, step: 5 },
        { key: 'gen', label: 'Nesil', min: 0, max: SELECTION_MAX_GEN, step: 1 },
    ],
};

// ── Kan dolaşımı (Sistemler) ─────────────────────────────────────────
//
// Kilit fikir: kan iki turda dolaşır. KÜÇÜK dolaşım kalp–akciğer–kalp
// (kan burada oksijen alır), BÜYÜK dolaşım kalp–vücut–kalp (oksijen
// burada dokulara bırakılır). İkisi de kalpte başlar, kalpte biter.

/** Dolaşım yolları: her biri kapalı bir çokgen (oransal koordinat). */
const PULMONARY: ReadonlyArray<[number, number]> = [
    [0.5, 0.42],
    [0.34, 0.36],
    [0.34, 0.16],
    [0.42, 0.08],
    [0.58, 0.08],
    [0.66, 0.16],
    [0.66, 0.36],
    [0.5, 0.42],
];
const SYSTEMIC: ReadonlyArray<[number, number]> = [
    [0.5, 0.58],
    [0.66, 0.64],
    [0.66, 0.86],
    [0.58, 0.94],
    [0.42, 0.94],
    [0.34, 0.86],
    [0.34, 0.64],
    [0.5, 0.58],
];

const circulationState = (o: MathObject) => ({
    playing: simValue(o, 'play', 0) > 0.5,
    // 0: ikisi de, 1: yalnız küçük dolaşım, 2: yalnız büyük dolaşım
    focus: clampInt(simValue(o, 'focus', 0), 0, 2, 0),
});

/** Kapalı yol üzerinde 0–1 arası konumun noktası. */
function pathPoint(pts: ReadonlyArray<[number, number]>, t: number, r: Rect) {
    const segs = pts.length - 1;
    const total = t * segs;
    const i = Math.min(segs - 1, Math.floor(total));
    const f = total - i;
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    return { x: r.x + r.w * (x1 + (x2 - x1) * f), y: r.y + r.h * (y1 + (y2 - y1) * f) };
}

export const circulationRender: Renderer = (k) => {
    const r = k.r;
    const s = circulationState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.5, k.lw);

    const drawLoop = (pts: ReadonlyArray<[number, number]>, active: boolean) => {
        k.c.save();
        if (!active) k.c.strokeStyle = withAlpha(k.color, 0.25);
        path(k, pts.map(([x, y]) => [r.x + r.w * x, r.y + r.h * y] as [number, number]), false);
        k.c.restore();
    };
    const smallActive = s.focus !== 2;
    const bigActive = s.focus !== 1;
    drawLoop(PULMONARY, smallActive);
    drawLoop(SYSTEMIC, bigActive);

    // Akciğerler ve vücut: ikisi de dolaşım halkasının İÇİNDE durur
    const lungY = r.y + r.h * 0.2;
    for (const dx of [0.43, 0.57]) {
        k.c.save();
        if (!smallActive) k.c.strokeStyle = withAlpha(k.color, 0.3);
        k.c.beginPath();
        k.c.ellipse(r.x + r.w * dx, lungY, r.w * 0.055, r.h * 0.075, 0, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
    }
    k.c.save();
    if (!bigActive) k.c.strokeStyle = withAlpha(k.color, 0.3);
    roundRect(k, r.x + r.w * 0.38, r.y + r.h * 0.72, r.w * 0.24, r.h * 0.14, 8);
    k.c.stroke();
    k.c.restore();

    // Kalp: iki karıncık iki kulakçık
    const hx = r.x + r.w * 0.5;
    const hy = r.y + r.h * 0.5;
    const hw = r.w * 0.16;
    const hh = r.h * 0.18;
    roundRect(k, hx - hw / 2, hy - hh / 2, hw, hh, hw * 0.28);
    k.c.stroke();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    line(k, hx, hy - hh / 2, hx, hy + hh / 2, 1);
    line(k, hx - hw / 2, hy, hx + hw / 2, hy, 1);
    k.c.restore();

    // Kan hücreleri: oksijence zengin olanlar dolu, kirli kan boş çizilir
    const phase = s.playing ? k.t * 0.35 : 0;
    const dots = 6;
    for (let i = 0; i < dots; i++) {
        const t = ((i / dots + phase) % 1 + 1) % 1;
        if (smallActive) {
            const p = pathPoint(PULMONARY, t, r);
            k.c.beginPath();
            k.c.arc(p.x, p.y, Math.max(2.2, fs * 0.2), 0, Math.PI * 2);
            // Akciğerden döndükten sonra temiz kan
            if (t > 0.5) k.c.fill();
            else k.c.stroke();
        }
        if (bigActive) {
            const p = pathPoint(SYSTEMIC, t, r);
            k.c.beginPath();
            k.c.arc(p.x, p.y, Math.max(2.2, fs * 0.2), 0, Math.PI * 2);
            // Vücuda gitmeden önce temiz, döndükten sonra kirli kan
            if (t < 0.5) k.c.fill();
            else k.c.stroke();
        }
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Akciğer yazısı halkanın üst kenarına biniyordu; ciğerlerin altına alındı.
    label(k, 'Akciğer', r.x + r.w * 0.5, lungY + r.h * 0.1, 'center', 'top', 0.62);
    label(k, 'Kalp', hx + hw * 0.75, hy, 'left', 'middle', 0.64);
    label(k, 'Vücut', r.x + r.w * 0.5, r.y + r.h * 0.79, 'center', 'middle', 0.68);
    // Halka adları halkanın solunda, çizgilerin dışında durur.
    if (smallActive) label(k, 'küçük dolaşım', r.x + r.w * 0.32, r.y + r.h * 0.26, 'right', 'middle', 0.62);
    if (bigActive) label(k, 'büyük dolaşım', r.x + r.w * 0.32, r.y + r.h * 0.76, 'right', 'middle', 0.62);

    const title =
        s.focus === 1
            ? 'Küçük dolaşım: kalp → akciğer → kalp'
            : s.focus === 2
              ? 'Büyük dolaşım: kalp → vücut → kalp'
              : 'Kan iki turda dolaşır: küçük ve büyük dolaşım';
    label(k, fitText(k, [title, 'Kan dolaşımı'], r.w - fs * 5, 0.8), r.x + 4, r.y + 1, 'left', 'top', 0.8);
    label(
        k,
        fitText(
            k,
            [
                'Dolu daire: oksijence zengin kan · boş daire: oksijence fakir kan',
                'Dolu daire: temiz kan · boş daire: kirli kan',
            ],
            r.w - 8,
            0.68,
        ),
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.68,
    );
    k.c.restore();
};

export const circulationSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = circulationState(o);
        return [
            {
                id: 'play',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.playing ? 'Akışı durdur' : 'Kanı dolaştır',
                on: s.playing,
            },
            {
                id: 'focus',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: ['Yalnız küçük dolaşım', 'Yalnız büyük dolaşım', 'İkisini birden göster'][s.focus],
                on: s.focus > 0,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = circulationState(o);
        if (id === 'play') return { play: s.playing ? 0 : 1 };
        if (id === 'focus') return { focus: (s.focus + 1) % 3 };
        return {};
    },
    params: [
        { key: 'focus', label: 'Görünüm (0-2)', min: 0, max: 2, step: 1 },
        { key: 'play', label: 'Akış (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Besin ağı (Canlılar ve Enerji İlişkileri) ────────────────────────
//
// Kilit fikir: besin ağındaki bir tür yok olursa etki yalnız komşusunda
// kalmaz, ağ boyunca yayılır. Avı azalan tür azalır, avcısı azalan tür
// çoğalır; etki uzaklaştıkça zayıflar.

interface WebNode {
    name: string;
    x: number;
    y: number;
}

/** Ağdaki türler ve "kim kimi yer" bağları (avdan avcıya). */
const WEB_NODES: ReadonlyArray<WebNode> = [
    { name: 'Ot', x: 0.5, y: 0.9 },
    { name: 'Çekirge', x: 0.26, y: 0.66 },
    { name: 'Fare', x: 0.72, y: 0.66 },
    { name: 'Kurbağa', x: 0.26, y: 0.42 },
    { name: 'Yılan', x: 0.6, y: 0.42 },
    { name: 'Kartal', x: 0.5, y: 0.16 },
];
/** [av, avcı] çiftleri. */
const WEB_EDGES: ReadonlyArray<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
    [2, 5],
];

function webState(o: MathObject) {
    const removed = clampInt(simValue(o, 'removed', -1), -1, WEB_NODES.length - 1, -1);
    // Popülasyonlar 1.0'dan başlar; etki iki basamak yayılır ve zayıflar.
    const pop = WEB_NODES.map(() => 1);
    if (removed >= 0) {
        pop[removed] = 0;
        // `effect` işareti yönü taşır: pozitif = tür azaldı, negatif = çoğaldı.
        // Çoğalan bir tür avını AZALTIR; bu yüzden yayılırken işaret döner.
        const apply = (node: number, effect: number, depth: number) => {
            if (depth > 2) return;
            for (const [prey, pred] of WEB_EDGES) {
                // Avcısı azalan av çoğalır.
                if (pred === node) {
                    pop[prey] *= 1 + 0.5 * effect;
                    if (depth < 2) apply(prey, -effect * 0.5, depth + 1);
                }
                // Avı azalan avcı azalır.
                if (prey === node) {
                    pop[pred] *= 1 - 0.5 * effect;
                    if (depth < 2) apply(pred, effect * 0.5, depth + 1);
                }
            }
        };
        apply(removed, 1, 1);
        pop[removed] = 0;
    }
    return { removed, pop };
}

export const foodWebRender: Renderer = (k) => {
    const r = k.r;
    const s = webState(k.o);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const box = {
        x: r.x + fs,
        y: r.y + (icon ? 0 : fs * 2),
        w: r.w - fs * 2,
        h: r.h - (icon ? 0 : fs * 3.6),
    };
    const pos = (i: number) => ({
        x: box.x + box.w * WEB_NODES[i].x,
        y: box.y + box.h * WEB_NODES[i].y,
    });
    const nodeR = Math.min(box.w * 0.075, box.h * 0.075);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Bağlar: avdan avcıya ok
    for (const [prey, pred] of WEB_EDGES) {
        const a = pos(prey);
        const b = pos(pred);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const gone = s.removed === prey || s.removed === pred;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, gone ? 0.2 : 0.55);
        arrow(
            k,
            a.x + (dx / len) * nodeR,
            a.y + (dy / len) * nodeR,
            b.x - (dx / len) * nodeR * 1.1,
            b.y - (dy / len) * nodeR * 1.1,
            fs * 0.4,
            1.2,
        );
        k.c.restore();
    }

    // Düğümler: popülasyon çemberin dolgusuyla gösterilir
    WEB_NODES.forEach((node, i) => {
        const p = pos(i);
        const removed = s.removed === i;
        k.c.save();
        k.c.lineWidth = Math.max(1.5, k.lw);
        if (removed) k.c.setLineDash([4, 3]);
        k.c.beginPath();
        k.c.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        if (!removed) {
            k.c.save();
            k.c.globalAlpha = 0.1 + Math.min(0.35, s.pop[i] * 0.22);
            k.c.beginPath();
            k.c.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
            k.c.fill();
            k.c.restore();
        } else {
            line(k, p.x - nodeR * 0.6, p.y - nodeR * 0.6, p.x + nodeR * 0.6, p.y + nodeR * 0.6, 1.4);
            line(k, p.x - nodeR * 0.6, p.y + nodeR * 0.6, p.x + nodeR * 0.6, p.y - nodeR * 0.6, 1.4);
        }
        if (icon) return;
        label(k, node.name, p.x, p.y + nodeR + fs * 0.3, 'center', 'top', 0.66);
        if (!removed && s.removed >= 0) {
            const change = s.pop[i] - 1;
            if (Math.abs(change) > 0.02) {
                label(
                    k,
                    `${change > 0 ? '↑' : '↓'} %${fmtNum(Math.abs(change) * 100, 0)}`,
                    p.x + nodeR + fs * 0.3,
                    p.y,
                    'left',
                    'middle',
                    0.62,
                );
            }
        }
    });

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(
        k,
        fitText(
            k,
            [
                s.removed < 0
                    ? 'Bir türü çıkar: etki ağ boyunca yayılsın'
                    : `${WEB_NODES[s.removed].name} yok oldu · ok yönü avdan avcıya`,
                s.removed < 0 ? 'Besin ağı' : `${WEB_NODES[s.removed].name} yok`,
            ],
            r.w - fs * 5,
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
        s.removed < 0
            ? 'Oklar avdan avcıya gider; her tür dengeyi paylaşır'
            : 'Avcısı azalan tür çoğalır, avı azalan tür azalır',
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.72,
    );
    k.c.restore();
};

export const foodWebSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = webState(o);
        return [
            {
                id: 'next',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label:
                    s.removed < 0
                        ? 'Bir türü ağdan çıkar'
                        : `Sıradaki türü çıkar (şimdi: ${WEB_NODES[s.removed].name})`,
                on: s.removed >= 0,
            },
            {
                id: 'reset',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: 'Ağı eski hâline getir',
                on: s.removed < 0,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = webState(o);
        if (id === 'reset') return { removed: -1 };
        if (id === 'next') return { removed: (s.removed + 1) % WEB_NODES.length };
        return {};
    },
    params: [
        {
            key: 'removed',
            label: 'Çıkarılan tür (-1 yok)',
            min: -1,
            max: WEB_NODES.length - 1,
            step: 1,
        },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

// ── Solunum mekaniği (Vücudumuzdaki Sistemler) ───────────────────────
//
// Kilit fikir: soluk alıp verme kas hareketiyle olur. Diyafram kasılıp
// düzleşince göğüs boşluğunun hacmi artar, akciğer içi basınç dış
// basıncın altına düşer ve hava içeri girer. Gevşeyip kubbeleşince tam
// tersi olur.

interface BreathState {
    /** 0 = tam soluk verme, 1 = tam soluk alma. */
    p: number;
    playing: boolean;
    inhaling: boolean;
}

const breathState = (o: MathObject, t: number): BreathState => {
    const playing = simValue(o, 'play', 0) > 0.5;
    if (playing) {
        const phase = (t * 0.28) % 1;
        return { p: 0.5 - 0.5 * Math.cos(phase * Math.PI * 2), playing, inhaling: phase < 0.5 };
    }
    const p = clamp(simValue(o, 'p', 0), 0, 1);
    return { p, playing, inhaling: p > 0.5 };
};

/** Akciğer dış hattı: birim ölçekte, sağ akciğer (izleyene göre solda). */
const LUNG_R: ReadonlyArray<[number, number]> = [
    [-0.14, -0.98],
    [-0.52, -0.82],
    [-0.82, -0.34],
    [-0.92, 0.28],
    [-0.78, 0.86],
    [-0.36, 1.0],
    [-0.14, 0.62],
    [-0.06, 0.1],
    [-0.05, -0.5],
];

/** Sol akciğer: kalp çentiği (medial kenarda girinti) vardır. */
const LUNG_L: ReadonlyArray<[number, number]> = [
    [0.14, -0.98],
    [0.52, -0.82],
    [0.82, -0.34],
    [0.9, 0.28],
    [0.74, 0.86],
    [0.34, 1.0],
    [0.16, 0.66],
    [0.3, 0.24],
    [0.1, 0.02],
    [0.05, -0.5],
];

/** Akciğer içi hava yollarını (bronşçuklar) çizer. */
function bronchioles(k: Ctx, hx: number, hy: number, dir: number, lx: number, ly: number) {
    const seg = (
        x1: number,
        y1: number,
        dx: number,
        dy: number,
        depth: number,
        w: number
    ) => {
        const x2 = x1 + dx;
        const y2 = y1 + dy;
        line(k, x1, y1, x2, y2, w);
        if (depth === 0) return;
        seg(x2, y2, dx * 0.62 + dir * lx * 0.05, dy * 0.55 - ly * 0.12, depth - 1, w * 0.7);
        seg(x2, y2, dx * 0.55, dy * 0.5 + ly * 0.14, depth - 1, w * 0.7);
    };
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.55);
    k.c.lineCap = 'round';
    seg(hx, hy, dir * lx * 0.3, ly * 0.12, 2, Math.max(1.2, k.lw * 0.8));
    k.c.restore();
}

export const breathingRender: Renderer = (k) => {
    const r = k.r;
    const s = breathState(k.o, k.t);
    const icon = isIconSize(r);
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const stage: Rect = icon
        ? r
        : { x: r.x + fs * 0.3, y: r.y + fs * 2.1, w: r.w * 0.58, h: r.h - fs * 2.6 };
    const W = stage.w;
    const H = stage.h;
    const cx = stage.x + W / 2;

    // Ölçüler: soluk alırken göğüs kafesi yükselir, akciğerler genişler.
    const lungCy = stage.y + H * (icon ? 0.44 : 0.47) - s.p * H * 0.02;
    const lx = Math.min(W * 0.3, H * 0.3) * (1 + s.p * 0.1);
    const ly = Math.min(W * 0.34, H * 0.3) * (1 + s.p * 0.14);
    const offX = lx * 0.32;
    const baseY = stage.y + H * (icon ? 0.86 : 0.9);
    const domeH = H * 0.13;
    const apexY = baseY - domeH * (0.12 + 0.88 * (1 - s.p));
    const halfW = W * 0.42;

    // Akciğerler
    for (const [pts, dir] of [
        [LUNG_R, -1],
        [LUNG_L, 1],
    ] as ReadonlyArray<[ReadonlyArray<[number, number]>, number]>) {
        const g = dir < 0 ? 1.05 : 1;
        const abs = pts.map(
            ([ux, uy]) => [cx + dir * offX + ux * lx * g, lungCy + uy * ly * g] as [number, number]
        );
        fillShape(k, () => smoothPath(k, abs), 0.1 + s.p * 0.09);
        smooth(k, abs, true, Math.max(1.6, k.lw));
        if (!icon) bronchioles(k, cx + dir * offX * 1.1, lungCy - ly * 0.32, dir, lx, ly);
    }

    // Göğüs kafesi (akciğerlerin önünde)
    if (!icon) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.42);
        for (let i = 0; i < 6; i++) {
            const y = stage.y + H * 0.2 + i * H * 0.11 - s.p * fs * 0.32;
            const out = W * (0.28 + i * 0.03) * (1 + s.p * 0.07);
            const drop = H * (0.05 + i * 0.012);
            for (const side of [-1, 1]) {
                k.c.beginPath();
                k.c.lineWidth = Math.max(1.4, k.lw * 0.9);
                k.c.moveTo(cx + side * W * 0.045, y);
                k.c.quadraticCurveTo(cx + side * out * 0.86, y - drop * 0.34, cx + side * out, y + drop);
                k.c.stroke();
            }
        }
        k.c.restore();
    }

    // Soluk borusu ve ana bronşlar
    const trTop = stage.y + H * (icon ? 0.04 : 0.06);
    const bifY = lungCy - ly * 0.72;
    const tw = Math.max(2.5, fs * 0.3);
    line(k, cx - tw, trTop, cx - tw, bifY - fs * 0.2, Math.max(1.6, k.lw));
    line(k, cx + tw, trTop, cx + tw, bifY - fs * 0.2, Math.max(1.6, k.lw));
    if (!icon) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        for (let y = trTop + fs * 0.35; y < bifY - fs * 0.4; y += fs * 0.42) {
            line(k, cx - tw, y, cx + tw, y, 1);
        }
        k.c.restore();
    }
    for (const dir of [-1, 1]) {
        k.c.beginPath();
        k.c.lineWidth = Math.max(1.6, k.lw);
        k.c.moveTo(cx + dir * tw, bifY - fs * 0.2);
        k.c.quadraticCurveTo(
            cx + dir * offX * 0.7,
            bifY + fs * 0.1,
            cx + dir * offX * 1.1,
            lungCy - ly * 0.32
        );
        k.c.stroke();
    }

    // Diyafram: kasılınca düzleşir, gevşeyince kubbeleşir
    k.c.save();
    k.c.strokeStyle = k.color;
    k.c.beginPath();
    k.c.lineWidth = Math.max(2.4, k.lw * 1.5);
    k.c.moveTo(cx - halfW, baseY);
    k.c.quadraticCurveTo(cx, apexY - domeH * (1 - s.p), cx + halfW, baseY);
    k.c.stroke();
    k.c.restore();

    if (icon) {
        k.c.restore();
        return;
    }

    // Hava akış oku
    const flowY = trTop + fs * 0.2;
    k.c.save();
    k.c.strokeStyle = k.color;
    if (s.inhaling) arrow(k, cx, flowY - fs * 1.5, cx, flowY + fs * 0.2, fs * 0.5, Math.max(1.6, k.lw));
    else arrow(k, cx, flowY + fs * 0.2, cx, flowY - fs * 1.5, fs * 0.5, Math.max(1.6, k.lw));
    k.c.restore();
    label(k, s.inhaling ? 'hava girer' : 'hava çıkar', cx + fs * 0.6, flowY - fs * 0.7, 'left', 'middle', 0.6);
    label(k, 'diyafram', cx - halfW, baseY + fs * 0.25, 'left', 'top', 0.58);

    if (k.o.labels !== false) {
        const px = r.x + r.w * 0.62;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.2;
        const rows: ReadonlyArray<[string, string]> = [
            ['Diyafram', s.inhaling ? 'kasılır, düzleşir' : 'gevşer, kubbeleşir'],
            ['Kaburgalar', s.inhaling ? 'yukarı ve dışa' : 'aşağı ve içe'],
            ['Göğüs hacmi', s.inhaling ? 'artar' : 'azalır'],
            ['Akciğer basıncı', s.inhaling ? 'azalır (dış basınçtan düşük)' : 'artar (dış basınçtan yüksek)'],
            ['Hava', s.inhaling ? 'dışarıdan içeri' : 'içeriden dışarı'],
        ];
        const ph = fs * (2.6 + rows.length * 1.55);
        panel(k, px, py, pw, ph);
        label(k, s.inhaling ? 'SOLUK ALMA' : 'SOLUK VERME', px + fs * 0.6, py + fs * 1.05, 'left', 'middle', 0.72);
        rows.forEach(([a, b], i) => {
            const y = py + fs * (2.3 + i * 1.55);
            label(k, a, px + fs * 0.6, y, 'left', 'middle', 0.54);
            label(
                k,
                fitText(k, [b, b.split(' (')[0]], pw - fs * 1.2, 0.6),
                px + fs * 0.6,
                y + fs * 0.75,
                'left',
                'middle',
                0.6
            );
        });
        // Hacim çubuğu
        const barY = py + ph + fs * 0.9;
        const barW = pw - fs * 0.6;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.4);
        roundRect(k, px + fs * 0.3, barY, barW, fs * 0.7, fs * 0.35);
        k.c.lineWidth = 1;
        k.c.stroke();
        k.c.restore();
        fillShape(
            k,
            () => roundRect(k, px + fs * 0.3, barY, Math.max(fs * 0.7, barW * (0.35 + s.p * 0.65)), fs * 0.7, fs * 0.35),
            0.3
        );
        label(k, `Göğüs boşluğu hacmi · %${Math.round(35 + s.p * 65)}`, px + fs * 0.3, barY + fs * 1.05, 'left', 'top', 0.54);
    }

    label(
        k,
        fitText(
            k,
            [
                'Solunum mekaniği: hacim artar, basınç düşer, hava girer',
                'Solunum mekaniği: hacim–basınç ilişkisi',
                'Solunum mekaniği',
            ],
            r.w - fs * 3,
            0.8
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8
    );
    k.c.restore();
};

export const breathingSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);
        const s = breathState(o, 0);
        const stage: Rect = { x: r.x + fs * 0.3, y: r.y + fs * 2.1, w: r.w * 0.58, h: r.h - fs * 2.6 };
        const baseY = stage.y + stage.h * 0.9;
        const domeH = stage.h * 0.13;
        return [
            {
                id: 'play',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.playing ? 'Durdur' : 'Soluk alıp vermeyi oynat',
                on: s.playing,
            },
            {
                id: 'dia',
                x: stage.x + stage.w / 2 + stage.w * 0.42 + fs * 0.6,
                y: baseY - domeH * (0.12 + 0.88 * (1 - s.p)),
                type: 'drag',
                label: 'Diyaframı aşağı çek: soluk al',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        if (id === 'dia' && p) {
            const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);
            const stage: Rect = { x: r.x + fs * 0.3, y: r.y + fs * 2.1, w: r.w * 0.58, h: r.h - fs * 2.6 };
            const baseY = stage.y + stage.h * 0.9;
            const domeH = stage.h * 0.13;
            return { p: clamp((p.y - (baseY - domeH)) / (domeH * 0.88), 0, 1), play: 0 };
        }
        return {};
    },
    params: [{ key: 'p', label: 'Soluk (0 ver – 1 al)', min: 0, max: 1, step: 0.05 }],
};

// ── Sindirim yolculuğu (Vücudumuzdaki Sistemler) ─────────────────────
//
// Kilit fikir: sindirim yalnız midede olmaz. Her durakta ya MEKANİK
// (besini küçültme) ya KİMYASAL (enzimlerle yapı taşlarına ayırma) ya da
// ikisi birden gerçekleşir; yemek borusu ile kalın bağırsakta sindirim
// yoktur. Emilim ise büyük ölçüde ince bağırsakta olur.

interface DigestStop {
    organ: string;
    mechanical: boolean;
    chemical: boolean;
    /** Salgı ve etkilediği besin. */
    detail: string;
    note: string;
}

const DIGEST_STOPS: ReadonlyArray<DigestStop> = [
    {
        organ: 'Ağız',
        mechanical: true,
        chemical: true,
        detail: 'Tükürük amilazı · nişasta',
        note: 'Dişler besini küçültür (mekanik), tükürükteki amilaz nişastayı kimyasal olarak parçalamaya başlar.',
    },
    {
        organ: 'Yemek borusu',
        mechanical: false,
        chemical: false,
        detail: 'Salgı yok · yalnız iletim',
        note: 'Sindirim olmaz. Kasların dalga hareketi (peristaltik) besini mideye iletir.',
    },
    {
        organ: 'Mide',
        mechanical: true,
        chemical: true,
        detail: 'Mide öz suyu, pepsin · protein',
        note: 'Mide kasları besini karıştırır (mekanik); mide öz suyundaki pepsin proteinleri parçalar (kimyasal).',
    },
    {
        organ: 'İnce bağırsak',
        mechanical: false,
        chemical: true,
        detail: 'Safra, pankreas ve bağırsak öz suyu',
        note: 'Sindirim burada tamamlanır. Safra yağları küçük damlacıklara ayırır; villuslarla emilim yapılır.',
    },
    {
        organ: 'Kalın bağırsak',
        mechanical: false,
        chemical: false,
        detail: 'Su ve mineral emilimi',
        note: 'Sindirim olmaz. Sindirilemeyen atıklardan su ve mineraller emilir, kalanı dışkı olarak atılır.',
    },
];

const digestState = (o: MathObject, t: number) => {
    const playing = simValue(o, 'play', 0) > 0.5;
    const stop = playing
        ? Math.floor((t * 0.4) % DIGEST_STOPS.length)
        : clampInt(simValue(o, 'stop', 0), 0, DIGEST_STOPS.length - 1, 0);
    return { stop, playing };
};

interface DigestGeom {
    cx: number;
    mouth: [number, number];
    esoTop: [number, number];
    esoBottom: [number, number];
    stomach: [number, number];
    smallInt: [number, number];
    largeInt: [number, number];
    bw: number;
    bh: number;
    bx: number;
    by: number;
}

const digestGeom = (b: Rect): DigestGeom => {
    const cx = b.x + b.w * 0.5;
    return {
        cx,
        bx: b.x,
        by: b.y,
        bw: b.w,
        bh: b.h,
        mouth: [cx, b.y + b.h * 0.06],
        esoTop: [cx, b.y + b.h * 0.13],
        esoBottom: [cx, b.y + b.h * 0.34],
        stomach: [cx + b.w * 0.15, b.y + b.h * 0.43],
        smallInt: [cx, b.y + b.h * 0.72],
        largeInt: [cx - b.w * 0.3, b.y + b.h * 0.66],
    };
};

/** Etkin organ tam, ötekiler soluk çizilir. */
function organ(k: Ctx, active: boolean, draw: () => void) {
    k.c.save();
    k.c.globalAlpha = active ? 1 : 0.26;
    k.c.lineWidth = active ? Math.max(2.2, k.lw * 1.4) : Math.max(1.4, k.lw * 0.9);
    draw();
    k.c.restore();
}

export const digestionRender: Renderer = (k) => {
    const r = k.r;
    const s = digestState(k.o, k.t);
    const icon = isIconSize(r);
    const fs = clamp(Math.min(r.w, r.h) / 15, 9, 19);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const body: Rect = icon
        ? { x: r.x + r.w * 0.14, y: r.y + r.h * 0.04, w: r.w * 0.72, h: r.h * 0.92 }
        : { x: r.x + fs * 0.4, y: r.y + fs * 2.3, w: r.w * 0.44, h: r.h - fs * 3.4 };
    const g = digestGeom(body);
    const bw = body.w;
    const bh = body.h;

    // Gövde hattı
    if (!icon) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.18);
        const torso: Array<[number, number]> = [
            [g.cx - bw * 0.42, body.y + bh * 0.12],
            [g.cx - bw * 0.46, body.y + bh * 0.5],
            [g.cx - bw * 0.38, body.y + bh * 0.94],
            [g.cx + bw * 0.38, body.y + bh * 0.94],
            [g.cx + bw * 0.46, body.y + bh * 0.5],
            [g.cx + bw * 0.42, body.y + bh * 0.12],
        ];
        smooth(k, torso, false, 1.4);
        k.c.restore();
    }

    // Karaciğer ve pankreas (yardımcı organlar, sindirim durağı değil)
    if (!icon) {
        k.c.save();
        k.c.globalAlpha = s.stop === 3 ? 0.85 : 0.22;
        const liver: Array<[number, number]> = [
            [g.cx - bw * 0.36, body.y + bh * 0.34],
            [g.cx - bw * 0.02, body.y + bh * 0.32],
            [g.cx - bw * 0.06, body.y + bh * 0.45],
            [g.cx - bw * 0.32, body.y + bh * 0.46],
        ];
        fillShape(k, () => smoothPath(k, liver), 0.16);
        smooth(k, liver, true, Math.max(1.4, k.lw));
        label(k, 'karaciğer', g.cx - bw * 0.34, body.y + bh * 0.39, 'left', 'middle', 0.5);
        // Pankreas
        const panc: Array<[number, number]> = [
            [g.cx - bw * 0.04, body.y + bh * 0.555],
            [g.cx + bw * 0.24, body.y + bh * 0.545],
            [g.cx + bw * 0.22, body.y + bh * 0.59],
            [g.cx - bw * 0.04, body.y + bh * 0.595],
        ];
        fillShape(k, () => smoothPath(k, panc), 0.16);
        smooth(k, panc, true, Math.max(1.4, k.lw));
        k.c.restore();
    }

    // Kalın bağırsak: ince bağırsağı çerçeveleyen kalın boru
    organ(k, icon || s.stop === 4, () => {
        const colon: Array<[number, number]> = [
            [g.cx - bw * 0.3, body.y + bh * 0.89],
            [g.cx - bw * 0.32, body.y + bh * 0.72],
            [g.cx - bw * 0.3, body.y + bh * 0.65],
            [g.cx, body.y + bh * 0.635],
            [g.cx + bw * 0.3, body.y + bh * 0.65],
            [g.cx + bw * 0.32, body.y + bh * 0.74],
            [g.cx + bw * 0.28, body.y + bh * 0.89],
            [g.cx + bw * 0.06, body.y + bh * 0.95],
        ];
        smooth(k, colon, false);
    });

    // İnce bağırsak: kıvrımlı ilmekler
    organ(k, icon || s.stop === 3, () => {
        const loops: Array<[number, number]> = [];
        for (let i = 0; i <= 72; i++) {
            const u = i / 72;
            const x = g.cx + Math.sin(u * Math.PI * 2.5) * bw * 0.17;
            const y = body.y + bh * (0.685 + u * 0.195);
            loops.push([x, y]);
        }
        smooth(k, loops, false);
    });

    // Mide: J biçimli kese
    organ(k, icon || s.stop === 2, () => {
        const st: Array<[number, number]> = [
            [g.cx + bw * 0.02, body.y + bh * 0.35],
            [g.cx + bw * 0.24, body.y + bh * 0.36],
            [g.cx + bw * 0.3, body.y + bh * 0.46],
            [g.cx + bw * 0.18, body.y + bh * 0.55],
            [g.cx + bw * 0.04, body.y + bh * 0.5],
            [g.cx + bw * 0.08, body.y + bh * 0.42],
        ];
        fillShape(k, () => smoothPath(k, st), 0.12);
        smooth(k, st, true);
    });

    // Yemek borusu
    organ(k, icon || s.stop === 1, () => {
        line(k, g.cx - bw * 0.03, g.esoTop[1], g.cx - bw * 0.03, body.y + bh * 0.37);
        line(k, g.cx + bw * 0.03, g.esoTop[1], g.cx + bw * 0.03, body.y + bh * 0.36);
    });

    // Ağız
    organ(k, icon || s.stop === 0, () => {
        k.c.beginPath();
        k.c.ellipse(g.cx, g.mouth[1], bw * 0.12, bh * 0.045, 0, 0, Math.PI * 2);
        k.c.stroke();
        if (!icon) {
            for (let i = -2; i <= 2; i++) {
                const tx = g.cx + i * bw * 0.035;
                line(k, tx, g.mouth[1] - bh * 0.032, tx, g.mouth[1] - bh * 0.008, 1.2);
            }
        }
    });

    if (icon) {
        k.c.restore();
        return;
    }

    // Besin lokması: etkin durakta
    const bolus: ReadonlyArray<[number, number]> = [
        [g.cx, g.mouth[1]],
        [g.cx, body.y + bh * 0.25],
        [g.cx + bw * 0.17, body.y + bh * 0.45],
        [g.cx, body.y + bh * 0.78],
        [g.cx - bw * 0.31, body.y + bh * 0.78],
    ];
    const [bxp, byp] = bolus[s.stop];
    k.c.save();
    k.c.fillStyle = k.color;
    k.c.beginPath();
    k.c.arc(bxp, byp, fs * 0.3, 0, Math.PI * 2);
    k.c.fill();
    k.c.restore();

    if (k.o.labels !== false) {
        const st = DIGEST_STOPS[s.stop];
        const px = r.x + r.w * 0.5;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.3;
        const ph = fs * 10.4;
        panel(k, px, py, pw, ph);
        label(k, `${s.stop + 1}. ${st.organ}`, px + fs * 0.7, py + fs * 1.1, 'left', 'middle', 0.82);

        // Sindirim türü rozetleri
        const badges: ReadonlyArray<[string, boolean]> = [
            ['Mekanik sindirim', st.mechanical],
            ['Kimyasal sindirim', st.chemical],
        ];
        badges.forEach(([txt, on], i) => {
            const y = py + fs * (2.5 + i * 1.5);
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, on ? 0.8 : 0.3);
            roundRect(k, px + fs * 0.7, y - fs * 0.55, pw - fs * 1.4, fs * 1.15, 5);
            k.c.lineWidth = 1;
            k.c.stroke();
            if (on) {
                k.c.globalAlpha = 0.1;
                k.c.fill();
            }
            k.c.restore();
            label(k, `${on ? '✓' : '✕'}  ${txt}`, px + fs * 1.1, y, 'left', 'middle', 0.58);
        });

        label(k, 'Salgı', px + fs * 0.7, py + fs * 5.4, 'left', 'middle', 0.52);
        label(k, fitText(k, [st.detail], pw - fs * 1.4, 0.58), px + fs * 0.7, py + fs * 6.2, 'left', 'middle', 0.58);

        // Açıklama
        let buf = '';
        let row = 0;
        for (const w of st.note.split(' ')) {
            const next = buf ? `${buf} ${w}` : w;
            if (textWidth(k, next, 0.55) > pw - fs * 1.4 && buf) {
                label(k, buf, px + fs * 0.7, py + fs * 7.5 + row * fs * 0.8, 'left', 'top', 0.55);
                buf = w;
                row++;
            } else buf = next;
        }
        if (buf) label(k, buf, px + fs * 0.7, py + fs * 7.5 + row * fs * 0.8, 'left', 'top', 0.55);

        // Durak şeridi
        const sy = py + ph + fs * 1.2;
        DIGEST_STOPS.forEach((d, i) => {
            const x = px + fs * 0.7 + i * fs * 1.5;
            k.c.save();
            k.c.strokeStyle = i === s.stop ? k.color : withAlpha(k.color, 0.4);
            k.c.beginPath();
            k.c.lineWidth = i === s.stop ? 2 : 1;
            k.c.arc(x, sy, fs * 0.42, 0, Math.PI * 2);
            if (i === s.stop) k.c.fill();
            else k.c.stroke();
            k.c.restore();
            k.c.save();
            if (i === s.stop) k.c.globalCompositeOperation = 'destination-out';
            label(k, String(i + 1), x, sy, 'center', 'middle', 0.55);
            k.c.restore();
            if (i < DIGEST_STOPS.length - 1) {
                k.c.save();
                k.c.strokeStyle = withAlpha(k.color, 0.35);
                line(k, x + fs * 0.5, sy, x + fs * 1.08, sy, 1.2);
                k.c.restore();
            }
        });
        label(k, DIGEST_STOPS[s.stop].organ, px + fs * 0.7, sy + fs * 0.9, 'left', 'top', 0.52);
    }

    label(
        k,
        fitText(
            k,
            [
                'Sindirim yolculuğu: her durakta ne oluyor?',
                'Sindirim yolculuğu',
            ],
            r.w - fs * 3,
            0.8
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8
    );
    k.c.restore();
};

export const digestionSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = digestState(o, 0);
        return [
            {
                id: 'next',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Sonraki durak',
                on: s.stop > 0,
            },
            {
                id: 'play',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.playing ? 'Durdur' : 'Yolculuğu başlat',
                on: s.playing,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        if (id === 'next') {
            const stop = clampInt(simValue(o, 'stop', 0), 0, DIGEST_STOPS.length - 1, 0);
            return { stop: (stop + 1) % DIGEST_STOPS.length, play: 0 };
        }
        return {};
    },
    params: [
        { key: 'stop', label: `Durak (0-${DIGEST_STOPS.length - 1})`, min: 0, max: DIGEST_STOPS.length - 1, step: 1 },
    ],
};

// ── Soy Ağacı & Kalıtım (Pedigree & Genetik) ────────────────────────
interface PedigreeState {
    mode: number; // 0: Otozomal Çekinik, 1: X'e Bağlı Çekinik
    states: number[]; // 0: Sağlam, 1: Taşıyıcı, 2: Hasta (7 birey için)
}

function pedigreeState(o: MathObject): PedigreeState {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
    // 7 birey: 1(Dede), 2(Nine), 3(Damat/Baba), 4(Anne), 5(Oğul 1), 6(Kız), 7(Oğul 2)
    const defaults = mode === 0 ? [1, 1, 0, 1, 2, 0, 1] : [0, 1, 0, 1, 1, 0, 0];
    const states = [1, 2, 3, 4, 5, 6, 7].map((i, idx) =>
        clampInt(simValue(o, `p${i}`, defaults[idx]), 0, 2, defaults[idx])
    );
    return { mode, states };
}

export const pedigreeRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = pedigreeState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Ağaç koordinatları
    const treeW = r.w * (icon ? 0.9 : 0.58);
    const startX = r.x + fs * 1.5;
    const y1 = r.y + fs * 3.2; // I. Kuşak
    const y2 = r.y + fs * 7.5; // II. Kuşak
    const y3 = r.y + fs * 12.0; // III. Kuşak
    const indR = fs * 1.2;

    // Birey koordinatları [x, y, isMale]
    const p1 = { x: startX + treeW * 0.22, y: y1, male: true, id: 1 };
    const p2 = { x: startX + treeW * 0.48, y: y1, male: false, id: 2 };
    const p3 = { x: startX + treeW * 0.18, y: y2, male: true, id: 3 };
    const p4 = { x: startX + treeW * 0.48, y: y2, male: false, id: 4 };
    const p5 = { x: startX + treeW * 0.15, y: y3, male: true, id: 5 };
    const p6 = { x: startX + treeW * 0.33, y: y3, male: false, id: 6 };
    const p7 = { x: startX + treeW * 0.51, y: y3, male: true, id: 7 };

    // Soy ağacı bağlantı çizgileri
    // 1-2 Evlilik ve çocuk 4
    line(k, p1.x + indR, p1.y, p2.x - indR, p1.y, 2);
    const mid12X = (p1.x + p2.x) / 2;
    line(k, mid12X, p1.y, mid12X, (p1.y + p2.y) / 2 + fs * 1.8, 1.8);
    line(k, mid12X, (p1.y + p2.y) / 2 + fs * 1.8, p4.x, (p1.y + p2.y) / 2 + fs * 1.8, 1.8);
    line(k, p4.x, (p1.y + p2.y) / 2 + fs * 1.8, p4.x, p4.y - indR, 1.8);

    // 3-4 Evlilik ve çocuklar 5, 6, 7
    line(k, p3.x + indR, p3.y, p4.x - indR, p3.y, 2);
    const mid34X = (p3.x + p4.x) / 2;
    const dropY = p3.y + fs * 2.2;
    line(k, mid34X, p3.y, mid34X, dropY, 1.8);
    line(k, p5.x, dropY, p7.x, dropY, 1.8);
    line(k, p5.x, dropY, p5.x, p5.y - indR, 1.8);
    line(k, p6.x, dropY, p6.x, p6.y - indR, 1.8);
    line(k, p7.x, dropY, p7.x, p7.y - indR, 1.8);

    // Kuşak isimleri
    if (!icon) {
        label(k, 'I', startX - fs * 0.5, y1, 'center', 'middle', 0.7);
        label(k, 'II', startX - fs * 0.5, y2, 'center', 'middle', 0.7);
        label(k, 'III', startX - fs * 0.5, y3, 'center', 'middle', 0.7);
    }

    // Bireyleri çiz
    const individuals = [p1, p2, p3, p4, p5, p6, p7];
    individuals.forEach((ind, i) => {
        const st = s.states[i];
        k.c.save();
        k.c.lineWidth = 2;
        k.c.strokeStyle = k.color;

        if (ind.male) {
            // Kare
            const sz = indR * 1.8;
            const x0 = ind.x - sz / 2;
            const y0 = ind.y - sz / 2;
            if (st === 2) {
                // Hasta: Tam dolu
                k.c.fillStyle = '#dc2626';
                k.c.fillRect(x0, y0, sz, sz);
            } else if (st === 1) {
                // Taşıyıcı: Yarı dolu
                k.c.fillStyle = '#f59e0b';
                k.c.fillRect(x0, y0, sz / 2, sz);
            }
            k.c.strokeRect(x0, y0, sz, sz);
        } else {
            // Daire
            k.c.beginPath();
            k.c.arc(ind.x, ind.y, indR, 0, Math.PI * 2);
            if (st === 2) {
                k.c.fillStyle = '#dc2626';
                k.c.fill();
            } else if (st === 1) {
                k.c.save();
                k.c.beginPath();
                k.c.arc(ind.x, ind.y, indR, Math.PI / 2, (3 * Math.PI) / 2);
                k.c.fillStyle = '#f59e0b';
                k.c.fill();
                k.c.restore();
            }
            k.c.stroke();
        }
        k.c.restore();

        // Birey Numarası ve Olası Genotip
        if (!icon) {
            label(k, `${ind.id}`, ind.x, ind.y, 'center', 'middle', 0.55);
            let geno = '';
            if (s.mode === 0) {
                geno = st === 2 ? 'aa' : st === 1 ? 'Aa' : 'A_';
            } else {
                if (ind.male) geno = st === 1 ? 'XʳY' : 'XᴿY';
                else geno = st === 2 ? 'XʳXʳ' : st === 1 ? 'XᴿXʳ' : 'XᴿXᴿ';
            }
            label(k, geno, ind.x, ind.y + indR + fs * 0.7, 'center', 'top', 0.52);
        }
    });

    // Sağ Bilgi ve İpuçları Paneli
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.36;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        const modeTitle = s.mode === 0 ? 'Otozomal Çekinik Kalıtım' : "X'e Bağlı Çekinik Kalıtım";
        label(k, modeTitle, px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);

        // Lejant
        k.c.save();
        k.c.strokeStyle = k.color;
        k.c.strokeRect(px + fs * 0.6, py + fs * 1.8, fs * 0.9, fs * 0.9);
        label(k, 'Erkek', px + fs * 1.8, py + fs * 2.2, 'left', 'middle', 0.5);

        k.c.beginPath();
        k.c.arc(px + fs * 5.0, py + fs * 2.2, fs * 0.45, 0, Math.PI * 2);
        k.c.stroke();
        label(k, 'Dişi', px + fs * 5.8, py + fs * 2.2, 'left', 'middle', 0.5);

        // Renk anlamları
        k.c.fillStyle = '#dc2626';
        k.c.fillRect(px + fs * 0.6, py + fs * 3.2, fs * 0.8, fs * 0.8);
        label(k, 'Hasta Birey (Koyu)', px + fs * 1.8, py + fs * 3.6, 'left', 'middle', 0.5);

        k.c.fillStyle = '#f59e0b';
        k.c.fillRect(px + fs * 0.6, py + fs * 4.4, fs * 0.4, fs * 0.8);
        k.c.strokeRect(px + fs * 0.6, py + fs * 4.4, fs * 0.8, fs * 0.8);
        label(k, 'Taşıyıcı Birey (Yarı)', px + fs * 1.8, py + fs * 4.8, 'left', 'middle', 0.5);
        k.c.restore();

        // Olasılık / Kural İpuçları
        if (s.mode === 0) {
            label(k, '• Anne ve baba taşıyıcıysa (Aa x Aa):', px + fs * 0.5, py + fs * 6.2, 'left', 'middle', 0.48);
            label(k, '  - %25 Hasta (aa)', px + fs * 0.5, py + fs * 7.0, 'left', 'middle', 0.5);
            label(k, '  - %50 Taşıyıcı (Aa)', px + fs * 0.5, py + fs * 7.8, 'left', 'middle', 0.5);
            label(k, '  - %25 Sağlam (AA)', px + fs * 0.5, py + fs * 8.6, 'left', 'middle', 0.5);
            label(k, '• Hasta kız çocuğunun babası mutlaka', px + fs * 0.5, py + fs * 9.6, 'left', 'middle', 0.46);
            label(k, '  hastalık genini (a) taşır.', px + fs * 0.5, py + fs * 10.3, 'left', 'middle', 0.46);
        } else {
            label(k, "• Anne taşıyıcı (XᴿXʳ) ise:", px + fs * 0.5, py + fs * 6.2, 'left', 'middle', 0.48);
            label(k, '  - Erkek çocukların %50 hasta (XʳY)', px + fs * 0.5, py + fs * 7.0, 'left', 'middle', 0.5);
            label(k, '• Hasta bir dişinin babası MUTLAKA', px + fs * 0.5, py + fs * 8.2, 'left', 'middle', 0.48);
            label(k, '  hastadır (XʳY) ve tüm erkek', px + fs * 0.5, py + fs * 9.0, 'left', 'middle', 0.48);
            label(k, '  çocukları da kesinlikle hastadır.', px + fs * 0.5, py + fs * 9.8, 'left', 'middle', 0.48);
        }

        // Birey tıklama ipucu
        label(k, '💡 Bireylere dokunarak fenotipini değiştir', px + fs * 0.5, py + ph - fs * 0.8, 'left', 'middle', 0.48);
    }

    // Üst Başlık & Mod Butonu
    if (!icon) {
        label(k, 'Soy Ağacı & Kalıtım Analizi', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const pedigreeSpec: SimSpec = {
    controls: (r, o) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const icon = isIconSize(r);
        const treeW = r.w * (icon ? 0.9 : 0.58);
        const startX = r.x + fs * 1.5;
        const y1 = r.y + fs * 3.2;
        const y2 = r.y + fs * 7.5;
        const y3 = r.y + fs * 12.0;

        const coords = [
            { x: startX + treeW * 0.22, y: y1 },
            { x: startX + treeW * 0.48, y: y1 },
            { x: startX + treeW * 0.18, y: y2 },
            { x: startX + treeW * 0.48, y: y2 },
            { x: startX + treeW * 0.15, y: y3 },
            { x: startX + treeW * 0.33, y: y3 },
            { x: startX + treeW * 0.51, y: y3 },
        ];

        const ctrls: SimControl[] = coords.map((c, i) => ({
            id: `ind_${i + 1}`,
            x: c.x,
            y: c.y,
            type: 'toggle',
            label: `${i + 1}. bireyin fenotipini değiştir`,
        }));

        ctrls.push({
            id: 'btn_mode',
            x: r.x + fs * 14.5,
            y: r.y + fs * 1.2,
            type: 'toggle',
            label: 'Kalıtım Modunu Değiştir (Otozomal / X-bağlı)',
        });

        return ctrls;
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_mode') {
            const cur = simValue(o, 'mode', 0);
            return { mode: (cur + 1) % 2 };
        }
        if (id.startsWith('ind_')) {
            const num = id.replace('ind_', '');
            const cur = simValue(o, `p${num}`, 0);
            return { [`p${num}`]: (cur + 1) % 3 };
        }
        return {};
    },
    params: [
        { key: 'mode', label: 'Mod (0: Otozomal, 1: X-bağlı)', min: 0, max: 1, step: 1 },
    ],
};

// ── Hücre Zarı & Osmoz Laboratuvarı ─────────────────────────────────
interface OsmosisState {
    sol: number;      // 0: Hipotonik, 1: İzotonik, 2: Hipertonik
    cellType: number; // 0: Hayvan (Alyuvar), 1: Bitki (Çeperli)
}

function osmosisState(o: MathObject): OsmosisState {
    const sol = clampInt(simValue(o, 'sol', 0), 0, 2, 0);
    const cellType = clampInt(simValue(o, 'cell', 0), 0, 1, 0);
    return { sol, cellType };
}

export const osmosisCellRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = osmosisState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Beher ve Ortam Çözeltisi
    const bw = r.w * (icon ? 0.9 : 0.52);
    const bh = r.h * 0.65;
    const bx = r.x + fs * 2.0;
    const by = r.y + fs * 3.0;

    // Çözelti rengi: Hipotonik (çok açık mavi), İzotonik (mavi), Hipertonik (koyu mavi/tuzlu)
    const solColors = ['rgba(224, 242, 254, 0.4)', 'rgba(186, 230, 253, 0.55)', 'rgba(125, 211, 252, 0.75)'];
    k.c.save();
    k.c.fillStyle = solColors[s.sol];
    k.c.fillRect(bx, by, bw, bh);
    k.c.strokeStyle = k.color;
    k.c.lineWidth = 2.5;
    line(k, bx, by - fs * 0.5, bx, by + bh, 2.5);
    line(k, bx, by + bh, bx + bw, by + bh, 2.5);
    line(k, bx + bw, by + bh, bx + bw, by - fs * 0.5, 2.5);
    k.c.restore();

    // Ortam tuz tanecikleri
    const saltCount = s.sol === 0 ? 4 : s.sol === 1 ? 16 : 40;
    for (let i = 0; i < saltCount; i++) {
        const sx = bx + fs * 1.0 + ((i * 37) % Math.floor(bw - fs * 2.0));
        const sy = by + fs * 1.0 + ((i * 53) % Math.floor(bh - fs * 2.0));
        // Hücrenin içine düşmesin
        const cx = bx + bw / 2;
        const cy = by + bh / 2;
        if (Math.hypot(sx - cx, sy - cy) > fs * 3.5) {
            k.c.save();
            k.c.fillStyle = '#64748b';
            k.c.beginPath();
            k.c.arc(sx, sy, 2.2, 0, Math.PI * 2);
            k.c.fill();
            k.c.restore();
        }
    }

    // Hücre Çizimi (Merkezde)
    const cx = bx + bw / 2;
    const cy = by + bh / 2;

    if (s.cellType === 0) {
        // Hayvan Hücresi (Alyuvar)
        let cellR = fs * 3.0;
        let note = 'Normal Alyuvar';
        if (s.sol === 0) {
            cellR = fs * 4.4;
            note = 'Şişmiş / Hemoliz Riski (Saf su)';
        } else if (s.sol === 2) {
            cellR = fs * 2.0;
            note = 'Büzüşmüş (Krenasyon)';
        }

        k.c.save();
        k.c.fillStyle = '#ef4444';
        k.c.strokeStyle = '#991b1b';
        k.c.lineWidth = 2;
        k.c.beginPath();
        if (s.sol === 2) {
            // Dikenli büzüşmüş şekil
            for (let i = 0; i < 12; i++) {
                const ang = (i / 12) * Math.PI * 2;
                const rVal = i % 2 === 0 ? cellR : cellR * 0.75;
                const px = cx + Math.cos(ang) * rVal;
                const py = cy + Math.sin(ang) * rVal;
                if (i === 0) k.c.moveTo(px, py);
                else k.c.lineTo(px, py);
            }
            k.c.closePath();
        } else {
            k.c.arc(cx, cy, cellR, 0, Math.PI * 2);
        }
        k.c.fill();
        k.c.stroke();
        k.c.restore();

        if (!icon) {
            label(k, note, cx, cy + cellR + fs * 1.0, 'center', 'top', 0.55);
        }
    } else {
        // Bitki Hücresi (Çeperli)
        const wallW = fs * 7.5;
        const wallH = fs * 6.0;
        // Dış Çeper (Sabit sert kutu)
        k.c.save();
        k.c.strokeStyle = '#15803d';
        k.c.lineWidth = 3.5;
        k.c.strokeRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
        k.c.restore();

        // İç Hücre Zarı
        let shrink = 0.92;
        let note = 'Normal Turgor';
        if (s.sol === 0) {
            shrink = 0.97; // Çepere tam yapışık
            note = 'Maksimum Turgor Basıncı';
        } else if (s.sol === 2) {
            shrink = 0.65; // Plazmoliz!
            note = 'Plazmoliz (Sitoplazma büzüldü)';
        }

        const memW = wallW * shrink;
        const memH = wallH * shrink;
        k.c.save();
        k.c.fillStyle = 'rgba(74, 222, 128, 0.4)';
        k.c.strokeStyle = '#22c55e';
        k.c.lineWidth = 2;
        roundRect(k, cx - memW / 2, cy - memH / 2, memW, memH, 8);
        k.c.fill();
        k.c.stroke();

        // Merkezi Koful (Su deposu)
        const vacFrac = s.sol === 0 ? 0.65 : s.sol === 1 ? 0.45 : 0.2;
        k.c.fillStyle = 'rgba(56, 189, 248, 0.6)';
        roundRect(k, cx - (memW * vacFrac) / 2, cy - (memH * vacFrac) / 2, memW * vacFrac, memH * vacFrac, 6);
        k.c.fill();
        k.c.restore();

        if (!icon) {
            label(k, 'Hücre Çeperi', cx + wallW / 2 + fs * 0.4, cy - wallH / 2 + fs * 0.5, 'left', 'middle', 0.48);
            label(k, note, cx, cy + wallH / 2 + fs * 1.0, 'center', 'top', 0.55);
        }
    }

    // Su Molekülleri Geçiş Okları Animasyonu
    if (!icon) {
        const numArrows = 4;
        for (let i = 0; i < numArrows; i++) {
            const ang = (i / numArrows) * Math.PI * 2;
            const rStart = fs * 5.0;
            const rEnd = fs * 2.8;
            let p1x = cx + Math.cos(ang) * rStart;
            let p1y = cy + Math.sin(ang) * rStart;
            let p2x = cx + Math.cos(ang) * rEnd;
            let p2y = cy + Math.sin(ang) * rEnd;

            if (s.sol === 2) {
                // Su dışarı akar
                const tempX = p1x; const tempY = p1y;
                p1x = p2x; p1y = p2y;
                p2x = tempX; p2y = tempY;
            }

            if (s.sol !== 1) {
                arrow(k, p1x, p1y, p2x, p2y, fs * 0.35, 1.5);
            }
        }
        const dirText = s.sol === 0 ? 'Su Girişi (H₂O) →' : s.sol === 2 ? 'Su Çıkışı (H₂O) ←' : 'Dinamik Denge (Net su geçişi = 0)';
        label(k, dirText, bx + bw / 2, by + fs * 1.0, 'center', 'bottom', 0.55);
    }

    // Sağ Basınç Grafiği & Karşılaştırma Paneli
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.38;
        const ph = r.h * 0.75;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.5;
        panel(k, px, py, pw, ph);

        label(k, 'Ozmotik Olaylar & Basınçlar', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);

        // Bar grafikleri: Turgor Basıncı (TB), Ozmotik Basınç (OB), Emme Kuvveti (EK = OB - TB)
        const tbVal = s.sol === 0 ? 90 : s.sol === 1 ? 45 : 10;
        const obVal = s.sol === 0 ? 20 : s.sol === 1 ? 45 : 95;
        const ekVal = Math.max(0, obVal - tbVal);

        const bars = [
            { name: 'Turgor Basıncı (TB)', val: tbVal, color: '#38bdf8' },
            { name: 'Ozmotik Basınç (OB)', val: obVal, color: '#f59e0b' },
            { name: 'Emme Kuvveti (EK)', val: ekVal, color: '#ec4899' },
        ];

        bars.forEach((b, idx) => {
            const barY = py + fs * (2.2 + idx * 2.3);
            label(k, b.name, px + fs * 0.5, barY, 'left', 'middle', 0.52);
            label(k, `%${b.val}`, px + pw - fs * 0.8, barY, 'right', 'middle', 0.52);

            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.3);
            k.c.strokeRect(px + fs * 0.5, barY + fs * 0.6, pw - fs * 1.3, fs * 0.8);
            k.c.fillStyle = b.color;
            k.c.fillRect(px + fs * 0.5, barY + fs * 0.6, ((pw - fs * 1.3) * b.val) / 100, fs * 0.8);
            k.c.restore();
        });

        // Formül ve İpuçları
        const infoY = py + fs * 9.4;
        line(k, px + fs * 0.5, infoY, px + pw - fs * 0.5, infoY, 1);
        label(k, 'Temel Kural:  EK = OB − TB', px + fs * 0.5, infoY + fs * 0.8, 'left', 'middle', 0.55);
        const expl = s.sol === 0
            ? 'Hipotonik: Hücreye su girer. TB tavan yapar, OB ve EK düşer.'
            : s.sol === 2
              ? 'Hipertonik: Hücre su kaybeder. OB tavan yapar, su alma isteği (EK) artar.'
              : 'İzotonik: Hücre içi ve dışı derişim eşit; net su akışı sıfırdır.';
        label(k, fitText(k, [expl], pw - fs * 1.0, 0.46), px + fs * 0.5, infoY + fs * 1.8, 'left', 'middle', 0.46);
    }

    // Üst Butonlar
    if (!icon) {
        label(k, 'Hücre Zarı & Osmoz Laboratuvarı', r.x + fs * 2.0, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const osmosisCellSpec: SimSpec = {
    animated: true,
    controls: (r) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            { id: 'btn_sol', x: r.x + fs * 12.0, y: r.y + fs * 1.2, type: 'toggle', label: 'Çözelti Ortamını Değiştir (Hipotonik/İzotonik/Hipertonik)' },
            { id: 'btn_cell', x: r.x + fs * 18.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Hücre Tipini Değiştir (Hayvan/Bitki)' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_sol') {
            const cur = simValue(o, 'sol', 0);
            return { sol: (cur + 1) % 3 };
        }
        if (id === 'btn_cell') {
            const cur = simValue(o, 'cell', 0);
            return { cell: (cur + 1) % 2 };
        }
        return {};
    },
    params: [
        { key: 'sol', label: 'Çözelti (0:Hipo, 1:İzo, 2:Hiper)', min: 0, max: 2, step: 1 },
        { key: 'cell', label: 'Hücre Tipi (0:Hayvan, 1:Bitki)', min: 0, max: 1, step: 1 },
    ],
};

// ── Enzim Çalışma Hızı & Kinetik ────────────────────────────────────
interface EnzymeState {
    temp: number;     // 0 - 65 °C
    pH: number;       // 1 - 14
    sub: number;      // 10 - 100
    enzType: number;  // 0: Amilaz (pH 7), 1: Pepsin (pH 2), 2: Tripsin (pH 8.5)
    rate: number;     // 0 - 100
    isDenatured: boolean;
}

function enzymeState(o: MathObject): EnzymeState {
    const temp = clamp(simValue(o, 'temp', 37), 0, 65);
    const pH = clamp(simValue(o, 'pH', 7.0), 1, 14);
    const sub = clamp(simValue(o, 'sub', 60), 10, 100);
    const enzType = clampInt(simValue(o, 'enz', 0), 0, 2, 0);

    const optPH = enzType === 0 ? 7.0 : enzType === 1 ? 2.0 : 8.5;

    // Sıcaklık faktörü
    let fT = 0;
    const isDenatured = temp >= 55;
    if (temp < 37) {
        fT = Math.pow(2, (temp - 37) / 12);
    } else if (temp <= 55) {
        fT = Math.max(0, 1 - Math.pow((temp - 37) / 18, 2));
    } else {
        fT = 0;
    }

    // pH faktörü
    const fPH = Math.exp(-Math.pow(pH - optPH, 2) / 2.5);

    // Substrat faktörü
    const fS = sub / (sub + 25);

    const rate = clamp(fT * fPH * fS * 100, 0, 100);

    return { temp, pH, sub, enzType, rate, isDenatured };
}

export const enzymeRateRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = enzymeState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Sol Taraf: Mikroskobik Reaksiyon Odası
    const chamberW = r.w * (icon ? 0.9 : 0.48);
    const chamberH = r.h * 0.68;
    const cx0 = r.x + fs * 1.5;
    const cy0 = r.y + fs * 2.8;

    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.04);
    k.c.strokeStyle = k.color;
    k.c.lineWidth = 2;
    roundRect(k, cx0, cy0, chamberW, chamberH, 10);
    k.c.fill();
    k.c.stroke();
    k.c.restore();

    // Büyük Enzim Makromolekülü ve Aktif Merkez
    const enzX = cx0 + chamberW / 2;
    const enzY = cy0 + chamberH / 2;
    const enzR = fs * 3.6;

    k.c.save();
    k.c.fillStyle = s.isDenatured ? '#94a3b8' : '#6366f1';
    k.c.strokeStyle = k.color;
    k.c.lineWidth = 2.5;

    k.c.beginPath();
    if (s.isDenatured) {
        // Denatüre olmuş bozuk yumruk şekli
        for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const dist = enzR + Math.sin(a * 4 + k.t * 3) * fs * 0.6;
            const px = enzX + Math.cos(a) * dist;
            const py = enzY + Math.sin(a) * dist;
            if (i === 0) k.c.moveTo(px, py);
            else k.c.lineTo(px, py);
        }
        k.c.closePath();
    } else {
        // Normal enzim + aktif merkez cebi (Anahtar-Kilit Yuvası)
        k.c.arc(enzX, enzY, enzR, 0.25 * Math.PI, 1.75 * Math.PI);
        // Aktif merkez yuvası
        k.c.lineTo(enzX + fs * 0.5, enzY - fs * 1.2);
        k.c.lineTo(enzX - fs * 1.0, enzY);
        k.c.lineTo(enzX + fs * 0.5, enzY + fs * 1.2);
        k.c.closePath();
    }
    k.c.fill();
    k.c.stroke();
    k.c.restore();

    // Substrat ve Ürün Parçacıkları Animasyonu
    if (!icon) {
        if (s.isDenatured) {
            label(k, '⚠️ DENATÜRASYON', enzX, enzY - fs * 0.4, 'center', 'middle', 0.65);
            label(k, '3D protein yapısı geri dönüşsüz bozuldu', enzX, enzY + fs * 0.6, 'center', 'middle', 0.45);
        } else {
            label(k, 'Enzim', enzX - fs * 1.2, enzY, 'center', 'middle', 0.65);
            label(k, 'Aktif Merkez', enzX + fs * 1.8, enzY, 'left', 'middle', 0.48);

            // Substrat yanaşması
            const subFrac = (k.t * (0.5 + s.rate * 0.015)) % 1;
            const subX = enzX + fs * 4.5 - subFrac * fs * 3.5;
            const subY = enzY;
            k.c.save();
            k.c.fillStyle = '#f59e0b';
            roundRect(k, subX - fs * 0.8, subY - fs * 0.8, fs * 1.6, fs * 1.6, 4);
            k.c.fill();
            k.c.restore();
            label(k, 'Substrat', subX, subY - fs * 1.1, 'center', 'bottom', 0.45);
        }
    }

    // Sağ Taraf: Hız Göstergesi ve Optimum Eğrisi
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.44;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        const enzNames = ['Tükürük Amilazı (pH 7)', 'Mide Pepsini (pH 2)', 'Bağırsak Tripsini (pH 8.5)'];
        label(k, enzNames[s.enzType], px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);

        // Canlı Tepkime Hızı Barı
        label(k, `Tepkime Hızı (V): %${fmtNum(s.rate, 0)}`, px + fs * 0.5, py + fs * 2.0, 'left', 'middle', 0.58);
        k.c.save();
        k.c.strokeRect(px + fs * 0.5, py + fs * 2.6, pw - fs * 1.0, fs * 1.0);
        k.c.fillStyle = s.rate > 60 ? '#22c55e' : s.rate > 20 ? '#eab308' : '#ef4444';
        k.c.fillRect(px + fs * 0.5, py + fs * 2.6, ((pw - fs * 1.0) * s.rate) / 100, fs * 1.0);
        k.c.restore();

        // Çan Eğrisi Grafiği (Sıcaklık Grafiği)
        const gx = px + fs * 1.0;
        const gy = py + fs * 4.4;
        const gw = pw - fs * 2.0;
        const gh = fs * 4.2;
        const gbot = gy + gh;

        line(k, gx, gbot, gx + gw, gbot, 1.5);
        line(k, gx, gbot, gx, gy, 1.5);
        label(k, 'T (°C)', gx + gw, gbot + fs * 0.4, 'right', 'top', 0.48);
        label(k, 'Hız', gx - fs * 0.2, gy, 'right', 'middle', 0.48);

        // Çan eğrisi çizimi
        k.c.save();
        k.c.strokeStyle = '#6366f1';
        k.c.lineWidth = 2;
        k.c.beginPath();
        for (let i = 0; i <= 65; i++) {
            const curX = gx + (i / 65) * gw;
            let val = 0;
            if (i < 37) val = Math.pow(2, (i - 37) / 12);
            else if (i <= 55) val = Math.max(0, 1 - Math.pow((i - 37) / 18, 2));
            const curY = gbot - clamp(val, 0, 1) * gh;
            if (i === 0) k.c.moveTo(curX, curY);
            else k.c.lineTo(curX, curY);
        }
        k.c.stroke();

        // Anlık Sıcaklık Noktası
        const ptX = gx + (s.temp / 65) * gw;
        const curFrac = s.temp < 37 ? Math.pow(2, (s.temp - 37) / 12) : s.temp <= 55 ? Math.max(0, 1 - Math.pow((s.temp - 37) / 18, 2)) : 0;
        const ptY = gbot - clamp(curFrac, 0, 1) * gh;
        k.c.fillStyle = '#ef4444';
        k.c.beginPath();
        k.c.arc(ptX, ptY, 4, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();

        label(k, `${fmtNum(s.temp, 0)}°C`, ptX, ptY - fs * 0.5, 'center', 'bottom', 0.52);

        // Parametre Değerleri
        const pValY = gbot + fs * 1.5;
        label(k, `Sıcaklık: ${fmtNum(s.temp, 0)}°C  |  pH: ${fmtNum(s.pH, 1)}  |  [S]: ${fmtNum(s.sub, 0)}`, px + fs * 0.5, pValY, 'left', 'middle', 0.5);
    }

    // Üst Başlık & Butonlar
    if (!icon) {
        label(k, 'Enzim Kinetiği & Çalışma Hızı', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const enzymeRateSpec: SimSpec = {
    animated: true,
    controls: (r, o) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const s = enzymeState(o);
        const pw = r.w * 0.44;
        const px = r.x + r.w - pw - fs * 1.0;
        const gx = px + fs * 1.0;
        const gw = pw - fs * 2.0;
        const gy = r.y + fs * 6.6;

        return [
            { id: 'btn_enz', x: r.x + fs * 14.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Enzim Tipini Değiştir' },
            { id: 'temp_drag', x: gx + (s.temp / 65) * gw, y: gy, type: 'drag', label: 'Sıcaklığı Sürükle (0-65°C)' },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'btn_enz') {
            const cur = simValue(o, 'enz', 0);
            return { enz: (cur + 1) % 3 };
        }
        if (id === 'temp_drag' && p) {
            const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
            const pw = r.w * 0.44;
            const px = r.x + r.w - pw - fs * 1.0;
            const gx = px + fs * 1.0;
            const gw = pw - fs * 2.0;
            const temp = clamp(((p.x - gx) / gw) * 65, 0, 65);
            return { temp: Math.round(temp) };
        }
        return {};
    },
    params: [
        { key: 'temp', label: 'Sıcaklık T', min: 0, max: 65, step: 1, unit: '°C' },
        { key: 'pH', label: 'pH Seviyesi', min: 1, max: 14, step: 0.5 },
        { key: 'sub', label: 'Substrat Derişimi [S]', min: 10, max: 100, step: 5 },
    ],
};

// ── Nöron & Aksiyon Potansiyeli (Sinirsel İletim) ────────────────────
interface ActionPotentialState {
    playing: boolean;
    tProg: number;    // 0.0 - 1.0
    voltage: number;  // -85 ile +40 mV
    phaseName: string;
}

function actionPotentialState(o: MathObject, t = 0): ActionPotentialState {
    const playing = simValue(o, 'play', 0) === 1;
    let tProg = 0;
    if (playing) {
        tProg = (t * 0.35) % 1.0;
    } else {
        tProg = clamp(simValue(o, 'prog', 0), 0, 1);
    }

    // 4 ms'lik döngü:
    // 0.0 - 0.2: Dinlenme (-70 mV)
    // 0.2 - 0.45: Depolarizasyon (-70 -> +40 mV)
    // 0.45 - 0.7: Repolarizasyon (+40 -> -70 mV)
    // 0.7 - 0.85: Hiperpolarizasyon (-70 -> -85 mV)
    // 0.85 - 1.0: Pompalanma (-85 -> -70 mV)

    let voltage = -70;
    let phaseName = 'Polarizasyon (Dinlenme Potansiyeli)';

    if (tProg < 0.2) {
        voltage = -70;
        phaseName = 'Dinlenme Potansiyeli (-70 mV)';
    } else if (tProg < 0.45) {
        const frac = (tProg - 0.2) / 0.25;
        voltage = -70 + frac * 110;
        phaseName = 'Depolarizasyon (Na⁺ Hücumu)';
    } else if (tProg < 0.7) {
        const frac = (tProg - 0.45) / 0.25;
        voltage = 40 - frac * 110;
        phaseName = 'Repolarizasyon (K⁺ Dışarı Çıkışı)';
    } else if (tProg < 0.85) {
        const frac = (tProg - 0.7) / 0.15;
        voltage = -70 - Math.sin(frac * Math.PI) * 15;
        phaseName = 'Hiperpolarizasyon (-85 mV)';
    } else {
        const frac = (tProg - 0.85) / 0.15;
        voltage = -85 + frac * 15;
        phaseName = 'Na⁺/K⁺ Pompası (Denge Kuruluyor)';
    }

    return { playing, tProg, voltage: Math.round(voltage), phaseName };
}

export const actionPotentialRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = actionPotentialState(k.o, k.t);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Sol Taraf: Akson Zarı Enine Kesiti
    const axW = r.w * (icon ? 0.9 : 0.48);
    const axH = r.h * 0.68;
    const axX = r.x + fs * 1.5;
    const axY = r.y + fs * 2.8;

    // Dış Ortam (Hücre Dışı Sıvı)
    k.c.save();
    k.c.fillStyle = 'rgba(239, 246, 255, 0.6)';
    k.c.fillRect(axX, axY, axW, axH);
    k.c.restore();

    // Çift Katlı Fosfolipit Zarı (Ortadan Geçer)
    const memY = axY + axH * 0.5;
    const memThick = fs * 2.4;

    k.c.save();
    k.c.fillStyle = 'rgba(254, 243, 199, 0.8)';
    k.c.fillRect(axX, memY - memThick / 2, axW, memThick);

    // Fosfolipit Baş ve Kuyrukları
    const numLipids = Math.floor(axW / (fs * 0.9));
    k.c.fillStyle = '#f59e0b';
    k.c.strokeStyle = '#d97706';
    k.c.lineWidth = 1;
    for (let i = 0; i < numLipids; i++) {
        const lx = axX + fs * 0.5 + i * fs * 0.9;
        // Üst tabaka
        k.c.beginPath();
        k.c.arc(lx, memY - memThick / 2 + 3, 3, 0, Math.PI * 2);
        k.c.fill();
        // Alt tabaka
        k.c.beginPath();
        k.c.arc(lx, memY + memThick / 2 - 3, 3, 0, Math.PI * 2);
        k.c.fill();
    }
    k.c.restore();

    // Voltaj Kapılı İyon Kanalları
    const naGateX = axX + axW * 0.28;
    const kGateX = axX + axW * 0.68;
    const gateW = fs * 2.4;

    // Na+ Kanalı
    k.c.save();
    const naOpen = s.voltage > -50 && s.voltage < 35 && s.tProg < 0.45;
    k.c.fillStyle = naOpen ? 'rgba(56, 189, 248, 0.3)' : '#0284c7';
    k.c.fillRect(naGateX - gateW / 2, memY - memThick / 2 - 2, gateW, memThick + 4);
    k.c.strokeStyle = k.color;
    k.c.strokeRect(naGateX - gateW / 2, memY - memThick / 2 - 2, gateW, memThick + 4);
    k.c.restore();
    if (!icon) {
        label(k, naOpen ? 'Na⁺ (AÇIK)' : 'Na⁺ Kapalı', naGateX, memY - memThick / 2 - fs * 0.8, 'center', 'bottom', 0.5);
    }

    // K+ Kanalı
    k.c.save();
    const kOpen = s.tProg >= 0.45 && s.tProg < 0.85;
    k.c.fillStyle = kOpen ? 'rgba(168, 85, 247, 0.3)' : '#7c3aed';
    k.c.fillRect(kGateX - gateW / 2, memY - memThick / 2 - 2, gateW, memThick + 4);
    k.c.strokeStyle = k.color;
    k.c.strokeRect(kGateX - gateW / 2, memY - memThick / 2 - 2, gateW, memThick + 4);
    k.c.restore();
    if (!icon) {
        label(k, kOpen ? 'K⁺ (AÇIK)' : 'K⁺ Kapalı', kGateX, memY - memThick / 2 - fs * 0.8, 'center', 'bottom', 0.5);
    }

    // Yük İşaretleri (+ ve -)
    if (!icon) {
        const topSign = s.voltage > 0 ? '−' : '+';
        const botSign = s.voltage > 0 ? '+' : '−';
        for (let i = 0; i < 6; i++) {
            const qx = axX + fs * 1.5 + i * (axW / 6.5);
            label(k, topSign, qx, memY - memThick / 2 - fs * 0.3, 'center', 'middle', 0.65);
            label(k, botSign, qx, memY + memThick / 2 + fs * 0.3, 'center', 'middle', 0.65);
        }
        label(k, 'Hücre Dışı Sıvı (Yüksek Na⁺)', axX + fs * 0.5, axY + fs * 0.7, 'left', 'middle', 0.48);
        label(k, 'Aksoplazma / Hücre İçi (Yüksek K⁺)', axX + fs * 0.5, axY + axH - fs * 0.7, 'left', 'middle', 0.48);
    }

    // Sağ Taraf: Canlı Aksiyon Potansiyeli Grafiği (mV vs t)
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.44;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        label(k, 'Aksiyon Potansiyeli Grafiği', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);

        const gx = px + fs * 2.2;
        const gy = py + fs * 2.5;
        const gw = pw - fs * 3.0;
        const gh = fs * 7.5;
        const gbot = gy + gh;

        // Eksenler
        line(k, gx, gbot, gx + gw, gbot, 1.5);
        line(k, gx, gbot, gx, gy, 1.5);

        // Voltaj seviyeleri (+40, 0, -55 eşik, -70 dinlenme, -85)
        const vToY = (v: number) => gbot - ((v - (-90)) / 140) * gh;

        const y40 = vToY(40);
        const y0 = vToY(0);
        const y55 = vToY(-55);
        const y70 = vToY(-70);

        // Çizgiler
        line(k, gx, y0, gx + gw, y0, 0.8);
        line(k, gx, y70, gx + gw, y70, 1);
        label(k, '+40 mV', gx - fs * 0.2, y40, 'right', 'middle', 0.45);
        label(k, '0 mV', gx - fs * 0.2, y0, 'right', 'middle', 0.45);
        label(k, '-55 (Eşik)', gx - fs * 0.2, y55, 'right', 'middle', 0.45);
        label(k, '-70 mV', gx - fs * 0.2, y70, 'right', 'middle', 0.48);

        // Aksiyon Potansiyeli Dalga Formu
        k.c.save();
        k.c.strokeStyle = '#0284c7';
        k.c.lineWidth = 2.5;
        k.c.beginPath();
        const numSteps = 50;
        for (let i = 0; i <= numSteps; i++) {
            const frac = i / numSteps;
            const curX = gx + frac * gw;
            let vVal = -70;
            if (frac < 0.2) vVal = -70;
            else if (frac < 0.45) vVal = -70 + ((frac - 0.2) / 0.25) * 110;
            else if (frac < 0.7) vVal = 40 - ((frac - 0.45) / 0.25) * 110;
            else if (frac < 0.85) vVal = -70 - Math.sin(((frac - 0.7) / 0.15) * Math.PI) * 15;
            else vVal = -85 + ((frac - 0.85) / 0.15) * 15;

            const curY = vToY(vVal);
            if (i === 0) k.c.moveTo(curX, curY);
            else k.c.lineTo(curX, curY);
        }
        k.c.stroke();

        // Anlık Tarama Noktası
        const scanX = gx + s.tProg * gw;
        const scanY = vToY(s.voltage);
        k.c.fillStyle = '#ef4444';
        k.c.beginPath();
        k.c.arc(scanX, scanY, 5, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();

        // Faz Açıklaması ve Potansiyel Değeri
        const infoY = gbot + fs * 1.5;
        label(k, `Zar Potansiyeli: ${s.voltage} mV`, px + fs * 0.5, infoY, 'left', 'middle', 0.6);
        label(k, s.phaseName, px + fs * 0.5, infoY + fs * 0.9, 'left', 'middle', 0.5);
    }

    // Üst Başlık & Butonlar
    if (!icon) {
        label(k, 'Nöron & Aksiyon Potansiyeli', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const actionPotentialSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) === 1,
    controls: (r, o) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const s = actionPotentialState(o);
        return [
            { id: 'btn_fire', x: r.x + fs * 14.5, y: r.y + fs * 1.2, type: 'toggle', on: s.playing, label: 'İmpuls Ver (Aksiyon Potansiyeli)' },
            { id: 'btn_step', x: r.x + fs * 20.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Adım Adım İlerlet' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_fire') {
            const cur = simValue(o, 'play', 0);
            return { play: cur === 1 ? 0 : 1 };
        }
        if (id === 'btn_step') {
            const cur = simValue(o, 'prog', 0);
            return { prog: (cur + 0.15) % 1.0, play: 0 };
        }
        return {};
    },
    params: [
        { key: 'play', label: 'Animasyon (0/1)', min: 0, max: 1, step: 1 },
        { key: 'prog', label: 'Aşama İlerlemesi', min: 0, max: 1, step: 0.05 },
    ],
};

export const BIO_SIM_RENDERERS: Record<string, Renderer> = {
    photosynthesis_sim: photosynthesisRender,
    dna_pair_sim: dnaRender,
    selection_sim: selectionRender,
    circulation_sim: circulationRender,
    food_web_sim: foodWebRender,
    breathing_sim: breathingRender,
    digestion_sim: digestionRender,
    pedigree_sim: pedigreeRender,
    osmosis_cell_sim: osmosisCellRender,
    enzyme_rate_sim: enzymeRateRender,
    action_potential_sim: actionPotentialRender,
};

export const BIO_SIM_SPECS: Record<string, SimSpec> = {
    photosynthesis_sim: photosynthesisSpec,
    dna_pair_sim: dnaSpec,
    selection_sim: selectionSpec,
    circulation_sim: circulationSpec,
    food_web_sim: foodWebSpec,
    breathing_sim: breathingSpec,
    digestion_sim: digestionSpec,
    pedigree_sim: pedigreeSpec,
    osmosis_cell_sim: osmosisCellSpec,
    enzyme_rate_sim: enzymeRateSpec,
    action_potential_sim: actionPotentialSpec,
};

export const BIO_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'pedigree_sim',
        label: 'Soy Ağacı & Kalıtım',
        hint: "Otozomal ve X'e bağlı çekinik kalıtım; bireylere dokunup genotipleri ve olasılıkları gör",
        size: { w: 620, h: 400 },
        defaults: { labels: true, sim: { mode: 0 } },
    },
    {
        kind: 'osmosis_cell_sim',
        label: 'Hücre Zarı & Osmoz Lab',
        hint: 'Hipotonik, izotonik ve hipertonik ortam; plazmoliz, hemoliz ve turgor basıncını canlı izle',
        size: { w: 620, h: 380 },
        defaults: { labels: true, sim: { sol: 0, cell: 0 } },
    },
    {
        kind: 'enzyme_rate_sim',
        label: 'Enzim Çalışma Hızı',
        hint: 'Sıcaklık ve pH çan eğrisi, optimum 37°C ve denatürasyon; anahtar-kilit modelini izle',
        size: { w: 620, h: 380 },
        defaults: { labels: true, sim: { temp: 37, pH: 7.0, sub: 60, enz: 0 } },
    },
    {
        kind: 'action_potential_sim',
        label: 'Nöron & Aksiyon Potansiyeli',
        hint: 'Akson zarı, voltaj kapılı Na+/K+ kanalları ve mV osiloskop dalgası; impulsu canlı gör',
        size: { w: 620, h: 380 },
        defaults: { labels: true, sim: { play: 1, prog: 0 } },
    },
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
    {
        kind: 'selection_sim',
        label: 'Doğal Seçilim',
        hint: 'Zemini koyulaştır; nesiller boyunca popülasyon oranı değişsin',
        size: { w: 520, h: 360 },
        defaults: { labels: true, sim: { bg: 20, gen: 0 } },
    },
    {
        kind: 'circulation_sim',
        label: 'Kan Dolaşımı',
        hint: 'Kanı dolaştır; küçük ve büyük dolaşımı ayrı ayrı izle',
        size: { w: 460, h: 400 },
        defaults: { labels: true, sim: { focus: 0, play: 0 } },
    },
    {
        kind: 'food_web_sim',
        label: 'Besin Ağı',
        hint: 'Bir türü çıkar; etkinin ağ boyunca yayılmasını izle',
        size: { w: 500, h: 380 },
        defaults: { labels: true, sim: { removed: -1 } },
    },
    {
        kind: 'breathing_sim',
        label: 'Solunum Mekaniği',
        hint: 'Diyaframı çek: hacim–basınç ilişkisini soluk alıp vermede gör',
        size: { w: 540, h: 380 },
        defaults: { labels: true, sim: { p: 0, play: 0 } },
    },
    {
        kind: 'digestion_sim',
        label: 'Sindirim Yolculuğu',
        hint: 'Besini organ organ ilerlet: mekanik mi kimyasal mı, hangi salgı?',
        size: { w: 620, h: 420 },
        defaults: { labels: true, sim: { stop: 0, play: 0 } },
    },
];
