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

export const BIO_SIM_RENDERERS: Record<string, Renderer> = {
    photosynthesis_sim: photosynthesisRender,
    dna_pair_sim: dnaRender,
    selection_sim: selectionRender,
    circulation_sim: circulationRender,
    food_web_sim: foodWebRender,
    breathing_sim: breathingRender,
};

export const BIO_SIM_SPECS: Record<string, SimSpec> = {
    photosynthesis_sim: photosynthesisSpec,
    dna_pair_sim: dnaSpec,
    selection_sim: selectionSpec,
    circulation_sim: circulationSpec,
    food_web_sim: foodWebSpec,
    breathing_sim: breathingSpec,
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
];
