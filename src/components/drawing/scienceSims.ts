// src/components/drawing/scienceSims.ts
// Etkileşimli fen içerikleri: Ay'ın evreleri ve şema etiketleme.
//
// Ortak çizim altyapısı objectDrawing.ts'te, kayıt (renderer/spec/katalog)
// simObjects.ts'in sonundadır. Kalıcı olarak yalnızca kullanıcının ayarladığı
// değerler saklanır (MathObject.sim); animasyon evresi zamandan türetilir.

import type { MathObject } from '../../types';
import { LABEL_SETS, MAX_SLOTS, rel } from './labelSets';
import {
    arrow,
    clamp,
    clampInt,
    fitText,
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

// ── Ay'ın evreleri (Güneş Sistemi ve Tutulmalar) ─────────────────────
//
// Kilit fikir: Ay'ın Güneş'e bakan yarısı HER ZAMAN aydınlıktır; evre,
// bu aydınlık yarının Dünya'dan ne kadarını görebildiğimizdir. Bu yüzden
// yörünge görünümünde Ay'ın aydınlık yanı hep Güneş'e döner, evre dairesi
// ise yörünge açısından hesaplanır.

/** Bir tam evre döngüsü (kavuşum ayı). */
const MOON_CYCLE_DAYS = 29.5;

const MOON_PHASES: ReadonlyArray<string> = [
    'Yeni Ay',
    'Büyüyen Hilal',
    'İlk Dördün',
    'Büyüyen Şişkin Ay',
    'Dolunay',
    'Küçülen Şişkin Ay',
    'Son Dördün',
    'Küçülen Hilal',
];

/** Yörünge açısı → evre adı. 0° = Yeni Ay, 180° = Dolunay. */
function moonPhaseName(deg: number): string {
    const a = ((deg % 360) + 360) % 360;
    return MOON_PHASES[Math.round(a / 45) % 8];
}

const moonAngle = (o: MathObject, t: number): number => {
    const pos = simValue(o, 'pos', 90);
    const playing = simValue(o, 'play', 0) > 0.5;
    return playing ? pos + t * 20 : pos;
};

function moonGeom(r: Rect, o: MathObject, t: number) {
    const ex = r.x + r.w * 0.4;
    const ey = r.y + r.h * 0.52;
    const orbit = Math.min(r.w * 0.22, r.h * 0.3);
    const deg = moonAngle(o, t);
    // Güneş solda olduğundan 0° (Yeni Ay) Dünya'nın solundadır; Ay yörüngede
    // kuzeyden bakıldığı gibi saat yönünün tersine ilerler.
    const a = ((180 - deg) * Math.PI) / 180;
    return {
        ex,
        ey,
        orbit,
        deg,
        earthR: Math.min(r.w, r.h) * 0.075,
        moonR: Math.min(r.w, r.h) * 0.042,
        moon: { x: ex + orbit * Math.cos(a), y: ey - orbit * Math.sin(a) },
        sun: { x: r.x + r.w * 0.05, y: ey, r: Math.min(r.w, r.h) * 0.075 },
        view: { x: r.x + r.w * 0.85, y: r.y + r.h * 0.42, r: Math.min(r.w * 0.12, r.h * 0.18) },
    };
}

/**
 * Evre dairesinin KARANLIK bölgesini yol olarak kurar (çizim mürekkeple
 * yapıldığından dolu alan gölge okunur; aydınlık taraf boş bırakılır).
 * Sınır çizgisi (terminatör) bir elipstir: yükseklik y'de disk yarı genişliği
 * s ise sınır x = cos(θ)·s noktasındadır. Büyürken sağ yarı, küçülürken sol
 * yarı aydınlıktır (kuzey yarım küreden bakış).
 */
function moonDarkPath(k: Ctx, cx: number, cy: number, R: number, deg: number) {
    const a = ((deg % 360) + 360) % 360;
    const kf = Math.cos((a * Math.PI) / 180);
    // Aydınlık bölge büyürken [kf·s, s], küçülürken [−s, −kf·s]; karanlık
    // bölge bunun tümleyenidir.
    const [from, to] = a < 180 ? [-1, kf] : [-kf, 1];
    const N = 44;
    k.c.beginPath();
    for (let i = 0; i <= N; i++) {
        const y = -R + (2 * R * i) / N;
        const s = Math.sqrt(Math.max(0, R * R - y * y));
        if (i === 0) k.c.moveTo(cx + from * s, cy + y);
        else k.c.lineTo(cx + from * s, cy + y);
    }
    for (let i = N; i >= 0; i--) {
        const y = -R + (2 * R * i) / N;
        const s = Math.sqrt(Math.max(0, R * R - y * y));
        k.c.lineTo(cx + to * s, cy + y);
    }
    k.c.closePath();
}

export const moonRender: Renderer = (k) => {
    const r = k.r;
    const g = moonGeom(r, k.o, k.t);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Güneş ve paralel ışınlar (soldan sağa)
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(g.sun.x, g.sun.y, g.sun.r, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    for (let i = -2; i <= 2; i++) {
        const y = g.ey + i * g.orbit * 0.5;
        arrow(k, g.sun.x + g.sun.r * 1.4, y, g.ex - g.orbit * 1.25, y, 6, 1);
    }
    k.c.restore();

    // Yörünge
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.35);
    k.c.setLineDash([7, 5]);
    k.c.beginPath();
    k.c.lineWidth = 1;
    k.c.arc(g.ex, g.ey, g.orbit, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();

    // Dünya: Güneş'e bakan yarısı gündüz, arkası gece
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(g.ex, g.ey, g.earthR, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.18;
    k.c.beginPath();
    k.c.moveTo(g.ex, g.ey);
    k.c.arc(g.ex, g.ey, g.earthR, -Math.PI / 2, Math.PI / 2);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    // Ay: aydınlık yarısı her konumda Güneş'e (sola) döner
    k.c.beginPath();
    k.c.arc(g.moon.x, g.moon.y, g.moonR, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.22;
    k.c.beginPath();
    k.c.moveTo(g.moon.x, g.moon.y);
    k.c.arc(g.moon.x, g.moon.y, g.moonR, -Math.PI / 2, Math.PI / 2);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    // Dünya'dan görünüş
    k.c.beginPath();
    k.c.arc(g.view.x, g.view.y, g.view.r, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.72;
    moonDarkPath(k, g.view.x, g.view.y, g.view.r, g.deg);
    k.c.fill();
    k.c.restore();
    // Ay'dan Dünya'ya bakış çizgisi: sağdaki dairenin neyi gösterdiği belli olsun.
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    k.c.setLineDash([4, 4]);
    line(k, g.moon.x, g.moon.y, g.view.x - g.view.r, g.view.y, 1);
    k.c.restore();

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    const a = ((g.deg % 360) + 360) % 360;
    const litPct = Math.round(((1 - Math.cos((a * Math.PI) / 180)) / 2) * 100);
    const day = ((a / 360) * MOON_CYCLE_DAYS).toFixed(1).replace('.', ',');

    label(k, 'Güneş', g.sun.x, g.sun.y + g.sun.r + k.fs * 0.4, 'center', 'top', 0.7);
    label(k, 'Dünya', g.ex, g.ey + g.earthR + k.fs * 0.4, 'center', 'top', 0.7);
    label(k, 'Ay', g.moon.x, g.moon.y - g.moonR - k.fs * 0.35, 'center', 'bottom', 0.7);
    label(
        k,
        fitText(k, ['Dünya’dan görünüm', 'Görünüm'], (r.x + r.w - g.view.x) * 2, 0.62),
        g.view.x,
        g.view.y - g.view.r - k.fs * 0.4,
        'center',
        'bottom',
        0.62,
    );

    // Dört ana konum yalnızca çizgiyle işaretlenir; metin yörüngeye sığmıyor.
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    for (const deg of [0, 90, 180, 270]) {
        const ang = ((180 - deg) * Math.PI) / 180;
        const c = Math.cos(ang);
        const sn = Math.sin(ang);
        line(k, g.ex + g.orbit * 0.9 * c, g.ey - g.orbit * 0.9 * sn, g.ex + g.orbit * 1.1 * c, g.ey - g.orbit * 1.1 * sn, 1);
    }
    k.c.restore();

    label(
        k,
        fitText(
            k,
            [
                `${moonPhaseName(a)} · %${litPct} aydınlık · ${day}. gün`,
                `${moonPhaseName(a)} · %${litPct} · ${day}. gün`,
                `${moonPhaseName(a)} · %${litPct}`,
            ],
            r.w - 6,
            0.95,
        ),
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.95,
    );
    k.c.restore();
};

export const moonSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const playing = simValue(o, 'play', 0) > 0.5;
        const play: SimControl = {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: playing ? 'Döngüyü duraklat' : 'Ay’ı yörüngede döndür',
            on: playing,
        };
        // Dönerken Ay'ın yeri her karede değişir; tutamak kayıtlı konuma göre
        // durduğundan ikisi ayrışır. Bu yüzden tutamak yalnızca duraklatılmışken.
        if (playing) return [play];
        const g = moonGeom(r, o, 0);
        return [
            { id: 'moon', x: g.moon.x, y: g.moon.y, type: 'drag', label: 'Ay’ı yörüngede sürükle' },
            play,
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        const g = moonGeom(r, o, 0);
        const a = (Math.atan2(g.ey - p.y, p.x - g.ex) * 180) / Math.PI;
        return { pos: ((180 - a) % 360 + 360) % 360 };
    },
    params: [
        { key: 'pos', label: 'Yörünge konumu', min: 0, max: 359, step: 1, unit: '°' },
        { key: 'play', label: 'Döndür (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Şema etiketleme (sürükle-bırak) ──────────────────────────────────
//
// Şemalar ve yuvaları labelSets.ts'te durur; burada yalnızca yerleşim,
// çizim ve sürükleme mantığı vardır. Rozetler havuzdan çekilip şemadaki
// çıkıntılara bırakılır, "Kontrol et" düğmesi doğruları işaretler.
// Yerleşim renderer ile kontrol noktaları arasında ortak olmalı; bu yüzden
// tüm konumlar tek bir yerleşim fonksiyonundan gelir.

/** Rozet ölçüsü ölçüm yapmadan kestirilir: kontroller Ctx görmez. */
const chipSize = (text: string, fs: number) => ({
    // Sağ uçtaki paya doğru/yanlış işareti oturur; genişlik sabit kalsın diye
    // pay kontrol kapalıyken de ayrılır.
    w: text.length * fs * 0.56 + fs * 1.9,
    h: fs * 1.7,
});

/**
 * Şema, rozetler ve havuz için ortak yerleşim.
 * `drawLibraryObject` ile aynı yazı boyu formülü kullanılır ki kontrol
 * noktaları çizilen rozetlerin tam ortasına otursun.
 */
function labelLayout(r: Rect, o: MathObject) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const chipFs = fs * 0.72;
    const mode = clampInt(simValue(o, 'mode', 0), 0, LABEL_SETS.length - 1, 0);
    const set = LABEL_SETS[mode];
    const sizes = set.slots.map((slot) => chipSize(slot.text, chipFs));
    const chipH = chipFs * 1.7;
    const placed = set.slots.map((_, i) => clampInt(simValue(o, `l${i}`, 0), 0, set.slots.length, 0));

    // Havuz: sığmayan rozetler bir alt satıra iner.
    const gap = fs * 0.45;
    const maxRowW = r.w - fs;
    const rows: number[][] = [];
    let row: number[] = [];
    let rowW = 0;
    placed.forEach((slotNo, i) => {
        if (slotNo !== 0) return;
        if (row.length && rowW + gap + sizes[i].w > maxRowW) {
            rows.push(row);
            row = [];
            rowW = 0;
        }
        rowW += (row.length ? gap : 0) + sizes[i].w;
        row.push(i);
    });
    if (row.length) rows.push(row);

    const rowH = chipH + fs * 0.3;
    const trayH = Math.max(1, rows.length) * rowH + fs * 0.3;
    const area: Rect = {
        x: r.x,
        y: r.y + fs * 1.7,
        w: r.w,
        h: Math.max(20, r.h - fs * 1.9 - trayH),
    };
    // Şema ortada; rozetler iki yandaki sütunlara yerleşir.
    const fig: Rect = {
        x: area.x + area.w * 0.27,
        y: area.y + area.h * 0.04,
        w: area.w * 0.46,
        h: area.h * 0.92,
    };

    /** Rozet kutunun dışına taşmasın. */
    const fit = (x: number, w: number) => clamp(x, r.x + w / 2 + 3, r.x + r.w - w / 2 - 3);
    const pos = sizes.map((size) => ({ x: 0, y: 0, w: size.w, h: chipH }));
    rows.forEach((rowIdx, rowNo) => {
        const total = rowIdx.reduce((sum, i) => sum + sizes[i].w + gap, -gap);
        let cursor = r.x + (r.w - total) / 2;
        const y = r.y + r.h - trayH + fs * 0.3 + rowNo * rowH + chipH / 2;
        for (const i of rowIdx) {
            pos[i].x = cursor + sizes[i].w / 2;
            pos[i].y = y;
            cursor += sizes[i].w + gap;
        }
    });
    placed.forEach((slotNo, i) => {
        if (slotNo === 0) return;
        const slot = set.slots[slotNo - 1];
        const anchor = rel(area, slot.lx, slot.ly);
        pos[i].x = fit(anchor.x, pos[i].w);
        pos[i].y = anchor.y;
    });

    // Boş yuvalar hepsi aynı genişlikte çizilir: kutu boyu cevabı ele vermesin.
    const slotW = Math.max(...sizes.map((size) => size.w));
    const slotAnchor = (idx: number) => {
        const a = rel(area, set.slots[idx].lx, set.slots[idx].ly);
        return { x: fit(a.x, slotW), y: a.y, w: slotW, h: chipH };
    };

    return { fs, chipFs, chipH, mode, set, area, fig, placed, pos, slotAnchor, trayH, trayRows: rows.length };
}

export const labelDragRender: Renderer = (k) => {
    const r = k.r;
    const L = labelLayout(r, k.o);
    const show = simValue(k.o, 'show', 0) > 0.5;
    // Panel önizlemesi gibi küçük ölçeklerde rozet yazısı kutusuna sığmaz;
    // o boyutta yalnızca boş rozetler çizilir.
    const showChipText = L.chipFs >= 8;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    if (!showChipText) {
        // Simge ölçeği: rozetler okunmadığından yalnızca şema çizilir.
        L.set.draw(k, { x: r.x + r.w * 0.06, y: r.y + r.h * 0.06, w: r.w * 0.88, h: r.h * 0.88 });
        k.c.restore();
        return;
    }

    L.set.draw(k, L.fig);

    // Havuz şeridi (boşsa çizilmez)
    if (L.trayRows > 0) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.3);
        k.c.setLineDash([6, 4]);
        roundRect(k, r.x + 2, r.y + r.h - L.trayH, r.w - 4, L.trayH - 2, 8);
        k.c.stroke();
        k.c.restore();
    }

    // Boş yuvalar: nereye bırakılacağı ve hangi noktayı gösterdiği görünsün
    L.set.slots.forEach((slot, idx) => {
        if (L.placed.includes(idx + 1)) return;
        const a = L.slotAnchor(idx);
        const target = rel(L.fig, slot.px, slot.py);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.35);
        k.c.setLineDash([4, 4]);
        line(k, a.x + (target.x > a.x ? a.w / 2 : -a.w / 2), a.y, target.x, target.y, 1);
        roundRect(k, a.x - a.w / 2, a.y - a.h / 2, a.w, a.h, a.h * 0.35);
        k.c.stroke();
        k.c.restore();
        k.c.save();
        k.c.fillStyle = withAlpha(k.color, 0.55);
        k.c.beginPath();
        k.c.arc(target.x, target.y, Math.max(2, L.fs * 0.14), 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();
    });

    let correct = 0;
    L.set.slots.forEach((slot, i) => {
        const box = L.pos[i];
        const slotNo = L.placed[i];
        const ok = slotNo === i + 1;
        if (ok) correct++;

        // Yerleştirilmiş rozetten şemadaki noktaya kılavuz çizgi
        if (slotNo > 0) {
            const target = rel(L.fig, L.set.slots[slotNo - 1].px, L.set.slots[slotNo - 1].py);
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.55);
            line(k, box.x + (target.x > box.x ? box.w / 2 : -box.w / 2), box.y, target.x, target.y, 1);
            k.c.beginPath();
            k.c.arc(target.x, target.y, Math.max(2, L.fs * 0.16), 0, Math.PI * 2);
            k.c.fill();
            k.c.restore();
        }

        k.c.save();
        k.c.lineWidth = k.lw;
        // Kontrol açıkken yanlış yerleştirmeler kesikli çerçeveyle ayrılır.
        if (show && slotNo > 0 && !ok) k.c.setLineDash([5, 3]);
        roundRect(k, box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, box.h * 0.35);
        k.c.stroke();
        k.c.save();
        k.c.globalAlpha = slotNo > 0 ? 0.1 : 0.04;
        k.c.fill();
        k.c.restore();
        k.c.restore();
        const markPad = show && slotNo > 0 ? L.chipFs * 0.8 : 0;
        if (showChipText) label(k, slot.text, box.x - markPad / 2, box.y, 'center', 'middle', 0.72);
        if (show && slotNo > 0) {
            label(k, ok ? '✓' : '✕', box.x + box.w / 2 - L.chipFs * 0.62, box.y, 'center', 'middle', 0.78);
        }
    });

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Sağ üstteki üç düğmeye pay bırakılır; sığmayan başlık kısalır.
    const titles = show
        ? [`${L.set.title} · ${correct} / ${L.set.slots.length} doğru`, `${correct} / ${L.set.slots.length} doğru`]
        : [`${L.set.title} — etiketleri sürükleyip bırak`, L.set.title];
    label(
        k,
        fitText(k, titles, r.w - L.fs * 5.5, 0.8),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8,
    );
    k.c.restore();
};

export const labelDragSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const L = labelLayout(r, o);
        const show = simValue(o, 'show', 0) > 0.5;
        const out: SimControl[] = L.set.slots.map((slot, i) => ({
            id: `chip${i}`,
            x: L.pos[i].x,
            y: L.pos[i].y,
            type: 'drag' as const,
            label: `${slot.text} etiketini sürükle`,
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
            {
                id: 'reset',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: 'Etiketleri havuza döndür',
                on: false,
            },
            {
                id: 'mode',
                x: r.x + r.w - 66,
                y: r.y + 14,
                type: 'toggle',
                label: 'Şemayı değiştir',
                on: L.mode > 0,
            },
        );
        return out;
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const L = labelLayout(r, o);
        const clearAll = (): Record<string, number> => {
            const patch: Record<string, number> = {};
            for (let i = 0; i < MAX_SLOTS; i++) patch[`l${i}`] = 0;
            return patch;
        };
        if (id === 'check') return { show: simValue(o, 'show', 0) > 0.5 ? 0 : 1 };
        if (id === 'reset') return { ...clearAll(), show: 0 };
        if (id === 'mode') {
            return { ...clearAll(), show: 0, mode: (L.mode + 1) % LABEL_SETS.length };
        }
        if (!id.startsWith('chip')) return {};
        const me = Number(id.slice(4));
        if (!Number.isInteger(me) || me < 0 || me >= L.set.slots.length) return {};

        // En yakın hedef: bırakma noktası hangi rozet yuvasına düşüyor?
        let best = -1;
        let bestDist = Infinity;
        L.set.slots.forEach((_slot, idx) => {
            const anchor = L.slotAnchor(idx);
            const d = Math.hypot(anchor.x - p.x, anchor.y - p.y);
            if (d < bestDist) {
                bestDist = d;
                best = idx;
            }
        });
        const reach = Math.max(L.fs * 3.4, L.area.h * 0.18);
        if (best < 0 || bestDist > reach) return { [`l${me}`]: 0 };

        const patch: Record<string, number> = { [`l${me}`]: best + 1 };
        // Yuva doluysa oradaki rozetle yer değiştirilir; etiket kaybolmasın.
        const occupant = L.placed.findIndex((v, i) => v === best + 1 && i !== me);
        if (occupant >= 0) patch[`l${occupant}`] = L.placed[me];
        return patch;
    },
    params: [
        {
            key: 'mode',
            label: `Şema (0-${LABEL_SETS.length - 1})`,
            min: 0,
            max: LABEL_SETS.length - 1,
            step: 1,
        },
        { key: 'show', label: 'Cevaplar (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const SCIENCE_SIM_RENDERERS: Record<string, Renderer> = {
    moon_phase_sim: moonRender,
    label_drag_sim: labelDragRender,
};

export const SCIENCE_SIM_SPECS: Record<string, SimSpec> = {
    moon_phase_sim: moonSpec,
    label_drag_sim: labelDragSpec,
};

/** Kütüphane panelindeki "Etkileşimli Fen" kategorisinin içeriği. */
export const SCIENCE_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'moon_phase_sim',
        label: 'Ay’ın Evreleri',
        hint: 'Ay’ı yörüngede sürükle; Dünya’dan görünen evreyi izle',
        size: { w: 520, h: 320 },
        defaults: { labels: true, sim: { pos: 90, play: 0 } },
    },
    {
        kind: 'label_drag_sim',
        label: 'Şema Etiketleme',
        hint: `Etiketleri sürükleyip bırak, kontrol et (${LABEL_SETS.length} şema)`,
        size: { w: 540, h: 360 },
        defaults: { labels: true, sim: { mode: 0, show: 0 } },
    },
];
