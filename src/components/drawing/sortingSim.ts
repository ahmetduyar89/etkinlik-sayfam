// src/components/drawing/sortingSim.ts
// Sınıflandırma kutuları: kartları doğru kutuya sürükle, kontrol et.
//
// Tek nesne birçok konuya hizmet eder; yeni bir konu eklemek SORTING_SETS
// dizisine bir kayıt yazmaktan ibarettir.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    fitText,
    isIconSize,
    label,
    roundRect,
    simValue,
    withAlpha,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

interface SortingSet {
    title: string;
    bins: [string, string];
    /** Kart metni ve ait olduğu kutu (0 ya da 1). */
    items: ReadonlyArray<[string, number]>;
}

const SORTING_SETS: ReadonlyArray<SortingSet> = [
    {
        title: 'Fiziksel mi, kimyasal mı?',
        bins: ['Fiziksel değişim', 'Kimyasal değişim'],
        items: [
            ['Kâğıdın yırtılması', 0],
            ['Odunun yanması', 1],
            ['Suyun donması', 0],
            ['Sütün ekşimesi', 1],
            ['Şekerin çözünmesi', 0],
            ['Demirin paslanması', 1],
        ],
    },
    {
        title: 'Metal mi, ametal mi?',
        bins: ['Metal', 'Ametal'],
        items: [
            ['Bakır', 0],
            ['Kükürt', 1],
            ['Demir', 0],
            ['Oksijen', 1],
            ['Alüminyum', 0],
            ['Klor', 1],
        ],
    },
    {
        title: 'Saf madde mi, karışım mı?',
        bins: ['Saf madde', 'Karışım'],
        items: [
            ['Saf su', 0],
            ['Tuzlu su', 1],
            ['Oksijen gazı', 0],
            ['Hava', 1],
            ['Demir tozu', 0],
            ['Ayran', 1],
        ],
    },
    {
        title: 'Kuvvet temas gerektirir mi?',
        bins: ['Temas gerektirir', 'Temas gerektirmez'],
        items: [
            ['Sürtünme kuvveti', 0],
            ['Yer çekimi', 1],
            ['Kas kuvveti', 0],
            ['Mıknatıs kuvveti', 1],
            ['İtme - çekme', 0],
            ['Elektriksel çekim', 1],
        ],
    },
];

const MAX_ITEMS = Math.max(...SORTING_SETS.map((s) => s.items.length));

function sortingLayout(r: Rect, o: MathObject) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const mode = clampInt(simValue(o, 'mode', 0), 0, SORTING_SETS.length - 1, 0);
    const set = SORTING_SETS[mode];
    // 0: havuz, 1: sol kutu, 2: sağ kutu
    const placed = set.items.map((_, i) => clampInt(simValue(o, `p${i}`, 0), 0, 2, 0));

    const chipH = fs * 1.6;
    const trayTop = r.y + fs * 1.9;
    const trayRows = 2;
    const trayH = chipH * trayRows + fs * 0.6;
    const binTop = trayTop + trayH + fs * 0.4;
    const binH = r.y + r.h - binTop - fs * 1.4;
    const binW = (r.w - fs * 1.6) / 2;

    const bins = [0, 1].map((i) => ({
        x: r.x + fs * 0.5 + i * (binW + fs * 0.6),
        y: binTop,
        w: binW,
        h: binH,
    }));

    // Havuzdaki kartlar iki satıra yayılır, kutudakiler kutu içinde dizilir.
    const pos = set.items.map(() => ({ x: 0, y: 0, w: binW * 0.92, h: chipH }));
    const trayIdx = placed.map((p, i) => (p === 0 ? i : -1)).filter((i) => i >= 0);
    trayIdx.forEach((idx, n) => {
        const row = Math.floor(n / 2);
        const col = n % 2;
        pos[idx].w = (r.w - fs * 1.8) / 2;
        pos[idx].x = r.x + fs * 0.6 + pos[idx].w / 2 + col * (pos[idx].w + fs * 0.6);
        pos[idx].y = trayTop + chipH / 2 + row * chipH;
    });
    [1, 2].forEach((bin) => {
        const inBin = placed.map((p, i) => (p === bin ? i : -1)).filter((i) => i >= 0);
        inBin.forEach((idx, n) => {
            const b = bins[bin - 1];
            pos[idx].w = b.w * 0.9;
            pos[idx].x = b.x + b.w / 2;
            pos[idx].y = b.y + fs * 1.8 + chipH / 2 + n * (chipH + fs * 0.25);
        });
    });

    const correct = placed.filter((p, i) => p === set.items[i][1] + 1).length;
    return { fs, icon, mode, set, placed, pos, bins, trayTop, trayH, chipH, correct };
}

export const sortingRender: Renderer = (k) => {
    const r = k.r;
    const L = sortingLayout(r, k.o);
    const show = simValue(k.o, 'show', 0) > 0.5;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    if (L.icon) {
        // Simge ölçeğinde yazı okunmaz: iki kutu ve birkaç kart yeter.
        L.bins.forEach((b, i) => {
            roundRect(k, r.x + r.w * (0.08 + i * 0.48), r.y + r.h * 0.34, r.w * 0.44, r.h * 0.58, 5);
            k.c.stroke();
            for (let n = 0; n < 2; n++) {
                roundRect(
                    k,
                    r.x + r.w * (0.12 + i * 0.48),
                    r.y + r.h * (0.46 + n * 0.2),
                    r.w * 0.36,
                    r.h * 0.13,
                    3,
                );
                k.c.stroke();
            }
        });
        roundRect(k, r.x + r.w * 0.3, r.y + r.h * 0.08, r.w * 0.4, r.h * 0.16, 4);
        k.c.stroke();
        k.c.restore();
        return;
    }

    // Havuz şeridi
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    k.c.setLineDash([6, 4]);
    roundRect(k, r.x + 2, L.trayTop - L.fs * 0.3, r.w - 4, L.trayH, 8);
    k.c.stroke();
    k.c.restore();

    // Kutular
    L.bins.forEach((b, i) => {
        k.c.lineWidth = Math.max(1.6, k.lw);
        roundRect(k, b.x, b.y, b.w, b.h, 10);
        k.c.stroke();
        k.c.save();
        k.c.globalAlpha = 0.05;
        k.c.fill();
        k.c.restore();
        label(k, L.set.bins[i], b.x + b.w / 2, b.y + L.fs * 0.9, 'center', 'middle', 0.82);
    });

    // Kartlar
    L.set.items.forEach(([text, correctBin], i) => {
        const box = L.pos[i];
        const ok = L.placed[i] === correctBin + 1;
        k.c.save();
        k.c.lineWidth = k.lw;
        if (show && L.placed[i] > 0 && !ok) k.c.setLineDash([5, 3]);
        roundRect(k, box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, box.h * 0.35);
        k.c.stroke();
        k.c.save();
        k.c.globalAlpha = L.placed[i] > 0 ? 0.1 : 0.04;
        k.c.fill();
        k.c.restore();
        k.c.restore();
        const mark = show && L.placed[i] > 0 ? (ok ? ' ✓' : ' ✕') : '';
        label(
            k,
            fitText(k, [text + mark, text], box.w - L.fs * 0.8, 0.7),
            box.x,
            box.y,
            'center',
            'middle',
            0.7,
        );
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
                show
                    ? `${L.set.title} · ${L.correct} / ${L.set.items.length} doğru`
                    : `${L.set.title} — kartları kutulara sürükle`,
                L.set.title,
            ],
            r.w - L.fs * 5.5,
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

export const sortingSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const L = sortingLayout(r, o);
        const show = simValue(o, 'show', 0) > 0.5;
        const out: SimControl[] = L.set.items.map(([text], i) => ({
            id: `card${i}`,
            // Tutamak kartın sol ucunda durur; ortada olsaydı yazıyı kapatırdı.
            x: L.pos[i].x - L.pos[i].w / 2 + L.fs * 0.85,
            y: L.pos[i].y,
            type: 'drag' as const,
            label: `${text} kartını sürükle`,
        }));
        out.push(
            {
                id: 'check',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: show ? 'Cevapları gizle' : 'Kontrol et',
                on: show,
            },
            { id: 'reset', x: r.x + r.w - 40, y: r.y + 14, type: 'toggle', label: 'Kartları havuza döndür', on: false },
            {
                id: 'mode',
                x: r.x + r.w - 66,
                y: r.y + 14,
                type: 'toggle',
                label: 'Konuyu değiştir',
                on: L.mode > 0,
            },
        );
        return out;
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const L = sortingLayout(r, o);
        const clearAll = (): Record<string, number> => {
            const patch: Record<string, number> = {};
            for (let i = 0; i < MAX_ITEMS; i++) patch[`p${i}`] = 0;
            return patch;
        };
        if (id === 'check') return { show: simValue(o, 'show', 0) > 0.5 ? 0 : 1 };
        if (id === 'reset') return { ...clearAll(), show: 0 };
        if (id === 'mode') {
            return { ...clearAll(), show: 0, mode: (L.mode + 1) % SORTING_SETS.length };
        }
        if (!id.startsWith('card')) return {};
        const i = Number(id.slice(4));
        if (!Number.isInteger(i) || i < 0 || i >= L.set.items.length) return {};
        // Bırakma noktası bir kutunun içindeyse o kutuya, değilse havuza gider.
        const bin = L.bins.findIndex(
            (b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h
        );
        return { [`p${i}`]: bin < 0 ? 0 : clamp(bin + 1, 1, 2) };
    },
    params: [
        { key: 'mode', label: `Konu (0-${SORTING_SETS.length - 1})`, min: 0, max: SORTING_SETS.length - 1, step: 1 },
        { key: 'show', label: 'Cevaplar (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const SORTING_SIM_RENDERERS: Record<string, Renderer> = { sorting_sim: sortingRender };

export const SORTING_SIM_SPECS: Record<string, SimSpec> = { sorting_sim: sortingSpec };

export const SORTING_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'sorting_sim',
        label: 'Sınıflandırma Kutuları',
        hint: `Kartları doğru kutuya sürükle, kontrol et (${SORTING_SETS.length} konu)`,
        size: { w: 540, h: 380 },
        defaults: { labels: true, sim: { mode: 0, show: 0 } },
    },
];
