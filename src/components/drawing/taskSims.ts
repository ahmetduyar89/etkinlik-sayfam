// src/components/drawing/taskSims.ts
// Genel alıştırma nesneleri: sıralama şeridi ve kart eşleştirme.
//
// İkisi de veriyle çoğalır; yeni bir konu eklemek listeye bir kayıt
// yazmaktan ibarettir. Yerleşim, renderer ile kontrol noktaları arasında
// ortak olmalı; bu yüzden tüm konumlar tek bir yerleşim fonksiyonundan gelir.

import type { MathObject } from '../../types';
import {
    clampInt,
    fitText,
    isIconSize,
    label,
    line,
    roundRect,
    simValue,
    textWidth,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

/** Kart kutusu çizer; yanlış yerleştirmede kesikli çerçeve kullanılır. */
function card(k: Ctx, x: number, y: number, w: number, h: number, filled: boolean, dashed = false) {
    k.c.save();
    k.c.lineWidth = k.lw;
    if (dashed) k.c.setLineDash([5, 3]);
    roundRect(k, x, y, w, h, h * 0.32);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = filled ? 0.1 : 0.04;
    k.c.fill();
    k.c.restore();
    k.c.restore();
}

// ── Sıralama şeridi ──────────────────────────────────────────────────
//
// Kilit fikir: adımların sırası bilginin kendisidir. Kartlar sürüklenip
// yer değiştirir; kontrol edilince doğru basamakta duranlar işaretlenir.

interface SequenceSet {
    title: string;
    /** Doğru sıradaki adımlar. */
    items: ReadonlyArray<string>;
    /** Başlangıçtaki karışık dizilim (slot → öğe numarası). */
    scramble: ReadonlyArray<number>;
}

const SEQUENCE_SETS: ReadonlyArray<SequenceSet> = [
    {
        title: 'Bilimsel yöntemin basamakları',
        items: [
            'Problemi belirle',
            'Hipotez kur',
            'Deney tasarla',
            'Veri topla',
            'Sonuca ulaş',
        ],
        scramble: [2, 0, 4, 1, 3],
    },
    {
        title: 'Besinler sindirim yolunda',
        items: ['Ağız', 'Yemek borusu', 'Mide', 'İnce bağırsak', 'Kalın bağırsak'],
        scramble: [3, 1, 4, 0, 2],
    },
    {
        title: 'Gezegenler: Güneş’e yakından uzağa',
        items: ['Merkür', 'Venüs', 'Dünya', 'Mars', 'Jüpiter', 'Satürn'],
        scramble: [4, 0, 5, 2, 1, 3],
    },
    {
        title: 'Evren: küçükten büyüğe',
        items: ['Gezegen', 'Yıldız sistemi', 'Takımyıldız', 'Galaksi', 'Evren'],
        scramble: [4, 1, 3, 0, 2],
    },
    {
        title: 'Yıldızın yaşam evreleri',
        items: ['Bulutsu', 'Yıldız', 'Kızıl dev', 'Süpernova', 'Kara delik'],
        scramble: [2, 4, 0, 3, 1],
    },
    {
        title: 'Sayıları küçükten büyüğe sırala',
        items: ['1/3', '0,4', '2/5 + 0,05', '0,5', '3/5'],
        scramble: [3, 4, 0, 2, 1],
    },
];

const SEQ_MAX = Math.max(...SEQUENCE_SETS.map((s) => s.items.length));

function sequenceLayout(r: Rect, o: MathObject) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const mode = clampInt(simValue(o, 'mode', 0), 0, SEQUENCE_SETS.length - 1, 0);
    const set = SEQUENCE_SETS[mode];
    const n = set.items.length;
    // Her yuvada hangi öğe duruyor; 0 kayıtlı değer yok demektir.
    const order = set.items.map((_, i) => {
        const v = clampInt(simValue(o, `s${i}`, 0), 0, n, 0);
        return v === 0 ? set.scramble[i] : v - 1;
    });
    const top = r.y + (icon ? r.h * 0.08 : fs * 2.4);
    const rowH = (r.y + r.h - top - (icon ? r.h * 0.08 : fs * 1.6)) / n;
    const cardH = Math.min(rowH * 0.78, fs * 2.1);
    const cardX = r.x + (icon ? r.w * 0.12 : fs * 2.6);
    const cardW = r.w - (cardX - r.x) - (icon ? r.w * 0.12 : fs * 1.4);
    const correct = order.filter((item, slot) => item === slot).length;
    return {
        fs,
        icon,
        mode,
        set,
        order,
        correct,
        cardX,
        cardW,
        cardH,
        rowY: (i: number) => top + rowH * i + rowH / 2,
    };
}

export const sequenceRender: Renderer = (k) => {
    const r = k.r;
    const L = sequenceLayout(r, k.o);
    const show = simValue(k.o, 'show', 0) > 0.5;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    L.order.forEach((item, slot) => {
        const y = L.rowY(slot);
        const ok = item === slot;
        card(k, L.cardX, y - L.cardH / 2, L.cardW, L.cardH, true, show && !ok);
        if (L.icon) return;
        label(k, `${slot + 1}.`, L.cardX - L.fs * 0.5, y, 'right', 'middle', 0.8);
        const mark = show ? (ok ? ' ✓' : ' ✕') : '';
        label(
            k,
            fitText(k, [L.set.items[item] + mark, L.set.items[item]], L.cardW - L.fs * 1.6, 0.75),
            L.cardX + L.cardW / 2,
            y,
            'center',
            'middle',
            0.75,
        );
    });

    if (L.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(
        k,
        fitText(
            k,
            [`${L.set.title} — kartları sürükleyerek sırala`, L.set.title],
            r.w - L.fs * 5.5,
            0.82,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.82,
    );
    // Puan sağ alta yazılır: dar kutuda başlığa sığmıyordu.
    if (show) {
        label(
            k,
            `${L.correct} / ${L.set.items.length} doğru`,
            r.x + r.w - 4,
            r.y + r.h,
            'right',
            'bottom',
            0.85,
        );
    }
    k.c.restore();
};

export const sequenceSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const L = sequenceLayout(r, o);
        const show = simValue(o, 'show', 0) > 0.5;
        const out: SimControl[] = L.order.map((item, slot) => ({
            id: `row${slot}`,
            // Tutamak kartın solunda durur; ortada olsaydı yazıyı kapatırdı.
            x: L.cardX + L.fs * 0.9,
            y: L.rowY(slot),
            type: 'drag' as const,
            label: `${L.set.items[item]} kartını taşı`,
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
            { id: 'reset', x: r.x + r.w - 40, y: r.y + 14, type: 'toggle', label: 'Baştan karıştır', on: false },
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
        const L = sequenceLayout(r, o);
        const reset = (): Record<string, number> => {
            const patch: Record<string, number> = {};
            for (let i = 0; i < SEQ_MAX; i++) patch[`s${i}`] = 0;
            return patch;
        };
        if (id === 'check') return { show: simValue(o, 'show', 0) > 0.5 ? 0 : 1 };
        if (id === 'reset') return { ...reset(), show: 0 };
        if (id === 'mode') {
            return { ...reset(), show: 0, mode: (L.mode + 1) % SEQUENCE_SETS.length };
        }
        if (!id.startsWith('row')) return {};
        const from = Number(id.slice(3));
        if (!Number.isInteger(from) || from < 0 || from >= L.order.length) return {};
        // Bırakılan yükseklik hangi satıra denk geliyorsa oradaki kartla takas.
        let to = 0;
        let best = Infinity;
        L.order.forEach((_, slot) => {
            const d = Math.abs(L.rowY(slot) - p.y);
            if (d < best) {
                best = d;
                to = slot;
            }
        });
        if (to === from) return {};
        return { [`s${from}`]: L.order[to] + 1, [`s${to}`]: L.order[from] + 1 };
    },
    params: [
        {
            key: 'mode',
            label: `Konu (0-${SEQUENCE_SETS.length - 1})`,
            min: 0,
            max: SEQUENCE_SETS.length - 1,
            step: 1,
        },
        { key: 'show', label: 'Cevaplar (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kart eşleştirme ──────────────────────────────────────────────────
//
// Kilit fikir: iki sütun arasındaki bağı kurmak. Sağdaki kartlar
// sürüklenip soldaki satırlara bırakılır; dolu satıra bırakılırsa kartlar
// yer değiştirir, böylece hiçbir kart kaybolmaz.

interface MatchSet {
    title: string;
    /** [sol öğe, sağ eş] çiftleri. */
    pairs: ReadonlyArray<[string, string]>;
}

const MATCH_SETS: ReadonlyArray<MatchSet> = [
    {
        title: 'Element ve sembolü',
        pairs: [
            ['Demir', 'Fe'],
            ['Oksijen', 'O'],
            ['Sodyum', 'Na'],
            ['Altın', 'Au'],
            ['Karbon', 'C'],
        ],
    },
    {
        title: 'Büyüklük ve birimi',
        pairs: [
            ['Uzunluk', 'metre'],
            ['Kütle', 'kilogram'],
            ['Zaman', 'saniye'],
            ['Kuvvet', 'newton'],
            ['Enerji', 'joule'],
        ],
    },
    {
        title: 'Organ ve görevi',
        pairs: [
            ['Kalp', 'Kanı pompalar'],
            ['Akciğer', 'Gaz değişimi'],
            ['Böbrek', 'Kanı süzer'],
            ['Mide', 'Besini sindirir'],
        ],
    },
    {
        title: 'Mercek ve kullanım alanı',
        pairs: [
            ['Büyüteç', 'Yazıyı büyütür'],
            ['Mikroskop', 'Hücreyi inceler'],
            ['Teleskop', 'Uzak yıldızlar'],
            ['Miyop gözlüğü', 'Kalın kenarlı'],
            ['Hipermetrop gözlüğü', 'İnce kenarlı'],
        ],
    },
    {
        title: 'Uzay teknolojisi ve günlük hayat',
        pairs: [
            ['Uydu', 'Hava tahmini'],
            ['GPS', 'Yol tarifi'],
            ['Isı yalıtım köpüğü', 'Bina yalıtımı'],
            ['Su arıtma sistemi', 'Temiz içme suyu'],
            ['Hafıza köpüğü', 'Yatak ve yastık'],
        ],
    },
    {
        title: 'Şekil ve alan bağıntısı',
        pairs: [
            ['Dikdörtgen', 'a · b'],
            ['Üçgen', '(a · h) / 2'],
            ['Daire', 'π · r²'],
            ['Kare', 'a²'],
        ],
    },
];

const MATCH_MAX = Math.max(...MATCH_SETS.map((s) => s.pairs.length));

/** Yazıyı verilen genişliğe sığdıran en büyük ölçeği bulur. */
function autoScale(k: Ctx, text: string, maxW: number, start = 0.75, min = 0.44): number {
    let sc = start;
    while (sc > min && textWidth(k, text, sc) > maxW) sc -= 0.04;
    return sc;
}

function matchLayout(r: Rect, o: MathObject) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const mode = clampInt(simValue(o, 'mode', 0), 0, MATCH_SETS.length - 1, 0);
    const set = MATCH_SETS[mode];
    const n = set.pairs.length;
    // Satırda hangi eş kartı duruyor; 0 havuzda demektir.
    const placed = set.pairs.map((_, i) => clampInt(simValue(o, `m${i}`, 0), 0, n, 0));

    const cardH = fs * 1.9;
    // Beşten çok eşi olan setlerde havuz iki satıra yayılır; tek satırda
    // kartlar okunamayacak kadar daralıyordu.
    const trayRows = n > 4 ? 2 : 1;
    const trayCols = Math.ceil(n / trayRows);
    const trayH = cardH * trayRows + fs * 0.8;
    const top = r.y + (icon ? r.h * 0.08 : fs * 2.4);
    const bottom = r.y + r.h - (icon ? r.h * 0.08 : trayH + fs * 0.6);
    const rowH = (bottom - top) / n;
    // Satır kartları sıkışmasın: yükseklik satır aralığına göre kısalır.
    const rowCardH = Math.max(fs * 1.2, Math.min(cardH, rowH - fs * 0.35));
    const colW = (r.w - fs * 2) / 2 - fs * 0.5;
    const leftX = r.x + fs * 0.8;
    const rightX = leftX + colW + fs;

    // Havuzdaki kartlar alt şeride yayılır.
    const trayIdx = placed
        .map((_, i) => i)
        .filter((i) => !placed.includes(i + 1));
    const trayW = Math.min(colW, (r.w - fs) / trayCols - fs * 0.4);
    const pos = set.pairs.map(() => ({ x: 0, y: 0, w: colW, h: rowCardH }));
    const trayBottom = r.y + r.h - fs * 0.4;
    trayIdx.forEach((idx, n2) => {
        const row = Math.floor(n2 / trayCols);
        const col = n2 % trayCols;
        const inRow = Math.min(trayCols, trayIdx.length - row * trayCols);
        const total = inRow * (trayW + fs * 0.4) - fs * 0.4;
        pos[idx].w = trayW;
        pos[idx].h = cardH;
        pos[idx].x = r.x + (r.w - total) / 2 + col * (trayW + fs * 0.4) + trayW / 2;
        pos[idx].y = trayBottom - trayH + fs * 0.4 + cardH / 2 + row * cardH;
    });
    placed.forEach((cardNo, row) => {
        if (cardNo === 0) return;
        pos[cardNo - 1].w = colW;
        pos[cardNo - 1].x = rightX + colW / 2;
        pos[cardNo - 1].y = top + rowH * row + rowH / 2;
    });

    const correct = placed.filter((cardNo, row) => cardNo === row + 1).length;
    return {
        fs,
        icon,
        mode,
        set,
        placed,
        pos,
        colW,
        leftX,
        rightX,
        cardH: rowCardH,
        trayH,
        correct,
        rowY: (i: number) => top + rowH * i + rowH / 2,
    };
}

export const matchRender: Renderer = (k) => {
    const r = k.r;
    const L = matchLayout(r, k.o);
    const show = simValue(k.o, 'show', 0) > 0.5;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    if (L.icon) {
        // Simge ölçeğinde kartlar üst üste biniyordu; iki sütun şeması yeter.
        const rows = 3;
        const cw = r.w * 0.36;
        const ch = r.h * 0.18;
        for (let i = 0; i < rows; i++) {
            const y = r.y + r.h * (0.2 + i * 0.28);
            card(k, r.x + r.w * 0.06, y, cw, ch, true);
            card(k, r.x + r.w * 0.58, y, cw, ch, false, i === rows - 1);
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.4);
            line(k, r.x + r.w * 0.06 + cw, y + ch / 2, r.x + r.w * 0.58, y + ch / 2, 1);
            k.c.restore();
        }
        k.c.restore();
        return;
    }

    // Sol sütun ve boş yuvalar
    L.set.pairs.forEach(([left], row) => {
        const y = L.rowY(row);
        card(k, L.leftX, y - L.cardH / 2, L.colW, L.cardH, true);
        if (!L.icon) {
            label(k, left, L.leftX + L.colW / 2, y, 'center', 'middle', autoScale(k, left, L.colW - L.fs));
        }
        if (L.placed[row] === 0) {
            card(k, L.rightX, y - L.cardH / 2, L.colW, L.cardH, false, true);
        }
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.35);
        line(k, L.leftX + L.colW, y, L.rightX, y, 1);
        k.c.restore();
    });

    // Eş kartlar (yerleşmiş ya da havuzda)
    L.set.pairs.forEach(([, right], i) => {
        const box = L.pos[i];
        const row = L.placed.findIndex((cardNo) => cardNo === i + 1);
        const ok = row === i;
        card(k, box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, row >= 0, show && row >= 0 && !ok);
        if (L.icon) return;
        const mark = show && row >= 0 ? (ok ? ' ✓' : ' ✕') : '';
        // Tutamak kartın solunda; yazı sağa kayar ve kutuya sığana dek küçülür.
        label(
            k,
            right + mark,
            box.x + L.fs * 0.45,
            box.y,
            'center',
            'middle',
            autoScale(k, right + mark, box.w - L.fs * 1.9),
        );
    });

    if (L.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(
        k,
        fitText(
            k,
            [
                show
                    ? `${L.set.title} · ${L.correct} / ${L.set.pairs.length} doğru`
                    : `${L.set.title} — kartları eşleştir`,
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

export const matchSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const L = matchLayout(r, o);
        const show = simValue(o, 'show', 0) > 0.5;
        const out: SimControl[] = L.set.pairs.map(([, right], i) => ({
            id: `card${i}`,
            x: L.pos[i].x - L.pos[i].w / 2 + L.fs * 0.85,
            y: L.pos[i].y,
            type: 'drag' as const,
            label: `${right} kartını sürükle`,
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
        const L = matchLayout(r, o);
        const clear = (): Record<string, number> => {
            const patch: Record<string, number> = {};
            for (let i = 0; i < MATCH_MAX; i++) patch[`m${i}`] = 0;
            return patch;
        };
        if (id === 'check') return { show: simValue(o, 'show', 0) > 0.5 ? 0 : 1 };
        if (id === 'reset') return { ...clear(), show: 0 };
        if (id === 'mode') return { ...clear(), show: 0, mode: (L.mode + 1) % MATCH_SETS.length };
        if (!id.startsWith('card')) return {};
        const cardIdx = Number(id.slice(4));
        if (!Number.isInteger(cardIdx) || cardIdx < 0 || cardIdx >= L.set.pairs.length) return {};

        // Sağ sütunun dışına bırakılırsa kart havuza döner.
        const inColumn = p.x > L.rightX - L.fs && p.x < L.rightX + L.colW + L.fs;
        const from = L.placed.findIndex((cardNo) => cardNo === cardIdx + 1);
        if (!inColumn) {
            return from >= 0 ? { [`m${from}`]: 0 } : {};
        }
        let to = 0;
        let best = Infinity;
        L.set.pairs.forEach((_, row) => {
            const d = Math.abs(L.rowY(row) - p.y);
            if (d < best) {
                best = d;
                to = row;
            }
        });
        const patch: Record<string, number> = { [`m${to}`]: cardIdx + 1 };
        // Hedef satır doluysa oradaki kart, sürüklenenin eski yerine geçer.
        if (L.placed[to] !== 0 && L.placed[to] !== cardIdx + 1) {
            if (from >= 0) patch[`m${from}`] = L.placed[to];
        } else if (from >= 0 && from !== to) {
            patch[`m${from}`] = 0;
        }
        return patch;
    },
    params: [
        {
            key: 'mode',
            label: `Konu (0-${MATCH_SETS.length - 1})`,
            min: 0,
            max: MATCH_SETS.length - 1,
            step: 1,
        },
        { key: 'show', label: 'Cevaplar (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const TASK_SIM_RENDERERS: Record<string, Renderer> = {
    sequence_sim: sequenceRender,
    match_sim: matchRender,
};

export const TASK_SIM_SPECS: Record<string, SimSpec> = {
    sequence_sim: sequenceSpec,
    match_sim: matchSpec,
};

export const TASK_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'sequence_sim',
        label: 'Sıralama Şeridi',
        hint: `Kartları doğru sıraya diz, kontrol et (${SEQUENCE_SETS.length} konu)`,
        size: { w: 460, h: 340 },
        defaults: { labels: true, sim: { mode: 0, show: 0 } },
    },
    {
        kind: 'match_sim',
        label: 'Kart Eşleştirme',
        hint: `İki sütunu eşleştir, kontrol et (${MATCH_SETS.length} konu)`,
        size: { w: 560, h: 420 },
        defaults: { labels: true, sim: { mode: 0, show: 0 } },
    },
];
