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
    arrowHead,
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

// ── Isınma eğrisi (Madde ve Isı) ─────────────────────────────────────
//
// Kilit fikir: hâl değişimi sırasında verilen ısı sıcaklığı artırmaz,
// hâli değiştirir. Bu yüzden grafikte erime ve kaynama düz platolardır;
// platoların uzunluğu gizli ısının büyüklüğünü kabaca yansıtır.

interface HeatSegment {
    dur: number;
    from: number;
    to: number;
    phase: string;
    note: string;
}

const HEAT_SEGMENTS: ReadonlyArray<HeatSegment> = [
    { dur: 12, from: -20, to: 0, phase: 'Katı — buz ısınıyor', note: 'ısı sıcaklığı artırır' },
    { dur: 22, from: 0, to: 0, phase: 'Erime', note: 'sıcaklık sabit, hâl değişir' },
    { dur: 26, from: 0, to: 100, phase: 'Sıvı — su ısınıyor', note: 'ısı sıcaklığı artırır' },
    { dur: 30, from: 100, to: 100, phase: 'Kaynama', note: 'sıcaklık sabit, hâl değişir' },
    { dur: 10, from: 100, to: 120, phase: 'Gaz — su buharı ısınıyor', note: 'ısı sıcaklığı artırır' },
];

const HEAT_TOTAL = HEAT_SEGMENTS.reduce((sum, seg) => sum + seg.dur, 0);
const HEAT_MIN = -30;
const HEAT_MAX = 130;

const heatTime = (o: MathObject, t: number): number => {
    const pos = clamp(simValue(o, 'time', 30), 0, HEAT_TOTAL);
    // Oynatırken döngüye girer: eğri bitince baştan ısıtmaya başlar.
    return simValue(o, 'play', 0) > 0.5 ? (pos + t * 9) % HEAT_TOTAL : pos;
};

/** Verilen ana ait sıcaklık ve içinde bulunulan aşama. */
function heatAt(time: number): { temp: number; seg: HeatSegment } {
    let left = clamp(time, 0, HEAT_TOTAL);
    for (const seg of HEAT_SEGMENTS) {
        if (left <= seg.dur) {
            return { temp: seg.from + ((seg.to - seg.from) * left) / seg.dur, seg };
        }
        left -= seg.dur;
    }
    const last = HEAT_SEGMENTS[HEAT_SEGMENTS.length - 1];
    return { temp: last.to, seg: last };
}

function heatGeom(r: Rect, o: MathObject, t: number) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    // Simge ölçeğinde eksen yazıları çizilmediği için kenar payı da gerekmez.
    const icon = isIconSize(r);
    const x0 = r.x + (icon ? r.w * 0.08 : fs * 2.8);
    const x1 = r.x + r.w - (icon ? r.w * 0.08 : fs * 0.8);
    const y0 = r.y + (icon ? r.h * 0.12 : fs * 2.6);
    const y1 = r.y + r.h - (icon ? r.h * 0.12 : fs * 2.8);
    const time = heatTime(o, t);
    const px = (tm: number) => x0 + ((x1 - x0) * tm) / HEAT_TOTAL;
    const py = (temp: number) => y1 - ((y1 - y0) * (temp - HEAT_MIN)) / (HEAT_MAX - HEAT_MIN);
    return { fs, x0, x1, y0, y1, time, px, py, ...heatAt(time) };
}

export const heatingRender: Renderer = (k) => {
    const r = k.r;
    const g = heatGeom(r, k.o, k.t);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;
    const icon = isIconSize(r);

    if (!icon) {
        // Eksenler
        line(k, g.x0, g.y0 - g.fs * 0.4, g.x0, g.y1);
        line(k, g.x0, g.y1, g.x1, g.y1);

        // 0 °C ve 100 °C kılavuzları: platoların nerede olduğu okunsun
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.3);
        k.c.setLineDash([5, 4]);
        for (const temp of [0, 100]) line(k, g.x0, g.py(temp), g.x1, g.py(temp), 1);
        k.c.restore();
    }

    // Eğrinin tamamı soluk, geçilen kısmı koyu
    const points: Array<[number, number]> = [];
    let acc = 0;
    points.push([g.px(0), g.py(HEAT_SEGMENTS[0].from)]);
    for (const seg of HEAT_SEGMENTS) {
        acc += seg.dur;
        points.push([g.px(acc), g.py(seg.to)]);
    }
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    path(k, points, false);
    k.c.restore();

    const walked: Array<[number, number]> = [[g.px(0), g.py(HEAT_SEGMENTS[0].from)]];
    let used = 0;
    for (const seg of HEAT_SEGMENTS) {
        if (g.time <= used) break;
        const part = Math.min(seg.dur, g.time - used);
        used += part;
        walked.push([g.px(used), g.py(seg.from + ((seg.to - seg.from) * part) / seg.dur)]);
    }
    k.c.lineWidth = Math.max(1.8, k.lw);
    path(k, walked, false);

    // Şu anki nokta ve eksenlere kılavuz
    const mx = g.px(g.time);
    const my = g.py(g.temp);
    if (icon) {
        k.c.restore();
        return;
    }
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    k.c.setLineDash([4, 3]);
    line(k, g.x0, my, mx, my, 1);
    line(k, mx, my, mx, g.y1, 1);
    k.c.restore();
    k.c.beginPath();
    k.c.arc(mx, my, Math.max(3, g.fs * 0.28), 0, Math.PI * 2);
    k.c.fill();

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Eksen değerleri
    for (const temp of [-20, 0, 50, 100, 120]) {
        label(k, String(temp), g.x0 - g.fs * 0.35, g.py(temp), 'right', 'middle', 0.62);
    }
    label(k, '°C', g.x0 - g.fs * 0.35, g.y0 - g.fs * 0.6, 'right', 'middle', 0.62);
    label(k, 'verilen ısı (süre) →', g.x1, g.y1 + g.fs * 0.4, 'right', 'top', 0.62);

    label(
        k,
        fitText(
            k,
            [`${g.seg.phase} · ${g.seg.note}`, g.seg.phase],
            r.w - g.fs * 5.5,
            0.85,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.85,
    );
    label(k, `${fmtNum(g.temp, 0)} °C`, mx, my - g.fs * 0.6, 'center', 'bottom', 0.8);
    k.c.restore();
};

export const heatingSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const playing = simValue(o, 'play', 0) > 0.5;
        const play: SimControl = {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: playing ? 'Isıtmayı duraklat' : 'Isıtmayı başlat',
            on: playing,
        };
        if (playing) return [play];
        const g = heatGeom(r, o, 0);
        return [
            { id: 'point', x: g.px(g.time), y: g.py(g.temp), type: 'drag', label: 'Eğri üzerinde ilerle' },
            play,
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        const g = heatGeom(r, o, 0);
        return { time: clamp(((p.x - g.x0) / (g.x1 - g.x0)) * HEAT_TOTAL, 0, HEAT_TOTAL) };
    },
    params: [
        { key: 'time', label: 'Verilen ısı', min: 0, max: HEAT_TOTAL, step: 1 },
        { key: 'play', label: 'Isıt (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Yoğunluk ve kaldırma kuvveti (Kuvvet ve Enerji) ──────────────────
//
// Kilit fikir: cisim, ağırlığı kadar sıvı taşırana dek batar. Bu yüzden
// yüzen bir cismin batan kesri, yoğunlukların oranına eşittir (d/dₛ).
// Cismi sürüklemek doğrudan bu oranı — yani cismin yoğunluğunu — değiştirir.

/** Yerçekimi ivmesi; 8. sınıf hesaplarında 10 N/kg alınır. */
const G_FORCE = 10;

const DENSITY_LIQUIDS: ReadonlyArray<{ name: string; d: number }> = [
    { name: 'Zeytinyağı', d: 0.9 },
    { name: 'Su', d: 1 },
    { name: 'Tuzlu su', d: 1.2 },
];

interface DensityState {
    /** Cismin yoğunluğu (g/cm³). */
    d: number;
    /** Sıvının yoğunluğu (g/cm³). */
    dl: number;
    /** Hacim (cm³). */
    v: number;
}

const densityState = (o: MathObject): DensityState => ({
    d: clamp(simValue(o, 'd', 0.6), 0.1, 2.5),
    dl: clamp(simValue(o, 'dl', 1), 0.6, 1.4),
    v: clamp(simValue(o, 'v', 30), 10, 60),
});

function densityGeom(r: Rect, s: DensityState) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    // Simge ölçeğinde başlık ve okuma sütunu çizilmediğinden kap kutuyu doldurur.
    const icon = isIconSize(r);
    const tank = icon
        ? { x: r.x + r.w * 0.16, y: r.y + r.h * 0.1, w: r.w * 0.68, h: r.h * 0.8 }
        : {
              x: r.x + r.w * 0.06,
              y: r.y + fs * 2.4,
              w: r.w * 0.52,
              h: r.h - fs * 2.4 - fs * 2.2,
          };
    const surfaceY = tank.y + tank.h * 0.22;
    const floorY = tank.y + tank.h;
    // Küpün kenarı hacimle büyür; 30 cm³ referans alınır.
    const side = Math.min(tank.w * 0.42, tank.h * 0.3) * Math.cbrt(s.v / 30);
    // Yüzerken batan kesir yoğunlukların oranıdır; ağır cisim dibe oturur.
    const sunk = s.d >= s.dl ? 1 : s.d / s.dl;
    const top = s.d > s.dl ? floorY - side : surfaceY - side * (1 - sunk);
    return { fs, tank, surfaceY, floorY, side, sunk, cubeTop: Math.min(top, floorY - side), cubeX: tank.x + tank.w / 2 - side / 2 };
}

export const densityRender: Renderer = (k) => {
    const r = k.r;
    const s = densityState(k.o);
    const g = densityGeom(r, s);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Kap: üstü açık
    path(k, [
        [g.tank.x, g.tank.y],
        [g.tank.x, g.floorY],
        [g.tank.x + g.tank.w, g.floorY],
        [g.tank.x + g.tank.w, g.tank.y],
    ]);

    // Sıvı ve dalgalı yüzeyi
    k.c.save();
    k.c.globalAlpha = 0.14;
    k.c.fillRect(g.tank.x, g.surfaceY, g.tank.w, g.floorY - g.surfaceY);
    k.c.restore();
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.2, k.lw * 0.8);
    for (let i = 0; i <= 20; i++) {
        const x = g.tank.x + (g.tank.w * i) / 20;
        const y = g.surfaceY + Math.sin((i / 20) * Math.PI * 4) * g.fs * 0.14;
        if (i === 0) k.c.moveTo(x, y);
        else k.c.lineTo(x, y);
    }
    k.c.stroke();

    // Cisim
    k.c.lineWidth = Math.max(1.6, k.lw);
    k.c.strokeRect(g.cubeX, g.cubeTop, g.side, g.side);
    k.c.save();
    k.c.globalAlpha = 0.2;
    k.c.fillRect(g.cubeX, g.cubeTop, g.side, g.side);
    k.c.restore();

    if (isIconSize(r)) {
        k.c.restore();
        return;
    }

    // Kuvvetler: ağırlık aşağı, kaldırma kuvveti yukarı
    const weight = (s.d * s.v * G_FORCE) / 1000;
    const subVolume = s.v * (s.d > s.dl ? 1 : g.sunk);
    const buoyancy = (s.dl * subVolume * G_FORCE) / 1000;
    // Oklar cismin kenarlarından çıkar ve kutunun dışına taşmaz: dibe oturan
    // cisimde aşağı ok kabın altına sarkıyordu.
    const cx = g.cubeX + g.side / 2;
    const cubeBottom = g.cubeTop + g.side;
    const bottomRoom = r.y + r.h - cubeBottom - g.fs * 1.4;
    const topRoom = g.cubeTop - r.y - g.fs * 2.2;
    const maxLen = Math.max(g.fs, Math.min(g.tank.h * 0.26, bottomRoom, topRoom));
    const scale = maxLen / Math.max(weight, buoyancy, 0.01);
    const lenG = weight * scale;
    const lenF = buoyancy * scale;
    arrow(k, cx, cubeBottom, cx, cubeBottom + lenG, g.fs * 0.42, Math.max(1.4, k.lw));
    arrow(k, cx, g.cubeTop, cx, g.cubeTop - lenF, g.fs * 0.42, Math.max(1.4, k.lw));

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    const verdict = s.d < s.dl - 0.001 ? 'Yüzer' : s.d > s.dl + 0.001 ? 'Batar' : 'Askıda kalır';
    label(k, 'G', cx + g.fs * 0.45, cubeBottom + lenG * 0.6, 'left', 'middle', 0.75);
    label(k, 'F', cx + g.fs * 0.45, g.cubeTop - lenF * 0.6, 'left', 'middle', 0.75);

    // Okuma sütunu: kapın sağında
    const tx = g.tank.x + g.tank.w + r.w * 0.05;
    const lines = [
        `Cisim: ${fmtNum(s.d, 2)} g/cm³`,
        `Sıvı: ${fmtNum(s.dl, 2)} g/cm³`,
        `Hacim: ${fmtNum(s.v, 0)} cm³`,
        `G = ${fmtNum(weight, 2)} N`,
        `F = ${fmtNum(buoyancy, 2)} N`,
        s.d < s.dl ? `Batan kesir: %${fmtNum(g.sunk * 100, 0)}` : 'Tamamı batar',
    ];
    lines.forEach((text, i) => {
        label(k, text, tx, g.tank.y + g.fs * (0.6 + i * 1.35), 'left', 'middle', 0.72);
    });
    label(k, verdict, tx, g.tank.y + g.fs * (0.6 + lines.length * 1.35 + 0.4), 'left', 'middle', 0.95);

    label(
        k,
        fitText(
            k,
            ['Batan kesir = cisim yoğunluğu / sıvı yoğunluğu', 'Cismi sürükle'],
            r.w - g.fs * 3,
            0.8,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8,
    );
    k.c.restore();
};

export const densitySpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = densityState(o);
        const g = densityGeom(r, s);
        const liquid = DENSITY_LIQUIDS.findIndex((l) => Math.abs(l.d - s.dl) < 0.05);
        return [
            {
                id: 'cube',
                x: g.cubeX + g.side / 2,
                y: g.cubeTop + g.side / 2,
                type: 'drag',
                label: 'Cismi sürükle (yoğunluğunu değiştirir)',
            },
            {
                id: 'liquid',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Sıvıyı değiştir (şimdi: ${liquid >= 0 ? DENSITY_LIQUIDS[liquid].name : 'özel'})`,
                on: liquid > 0,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = densityState(o);
        if (id === 'liquid') {
            const i = DENSITY_LIQUIDS.findIndex((l) => Math.abs(l.d - s.dl) < 0.05);
            return { dl: DENSITY_LIQUIDS[(i + 1) % DENSITY_LIQUIDS.length].d };
        }
        const g = densityGeom(r, s);
        // Batan kesir, küpün ALT yüzünün yüzeyin ne kadar altında kaldığıdır;
        // kesir de doğrudan yoğunlukların oranını verir.
        const sunk = clamp((p.y + g.side / 2 - g.surfaceY) / g.side, 0, 1);
        // Tamamen batırılınca sıvıdan yoğun kabul edilir; aksi halde oran.
        const d = sunk >= 1 ? Math.max(s.dl + 0.1, s.d) : Math.max(0.1, s.dl * sunk);
        return { d: Math.round(d * 20) / 20 };
    },
    params: [
        { key: 'd', label: 'Cisim yoğunluğu', min: 0.1, max: 2.5, step: 0.05, unit: 'g/cm³' },
        { key: 'dl', label: 'Sıvı yoğunluğu', min: 0.6, max: 1.4, step: 0.05, unit: 'g/cm³' },
        { key: 'v', label: 'Hacim', min: 10, max: 60, step: 5, unit: 'cm³' },
    ],
};

// ── Tutulmalar (Güneş Sistemi ve Tutulmalar) ─────────────────────────
//
// Kilit fikir: tutulma bir GÖLGE olayıdır. Ay, Güneş ile Dünya arasına
// girip gölgesini Dünya'ya düşürürse Güneş tutulması; Dünya'nın gölgesine
// girerse Ay tutulması olur. Ay'ın yörüngesi eğik olduğu için üçü her ay
// aynı hizaya gelmez.

/** Hizalanma bu açı farkından küçükse tutulma olur (derece). */
const ECLIPSE_WINDOW = 9;

const eclipseState = (o: MathObject) => {
    const pos = ((simValue(o, 'pos', 0) % 360) + 360) % 360;
    const tilted = simValue(o, 'tilt', 0) > 0.5;
    const nearNew = Math.min(pos, 360 - pos) < ECLIPSE_WINDOW;
    const nearFull = Math.abs(pos - 180) < ECLIPSE_WINDOW;
    return {
        pos,
        tilted,
        // Eğik yörüngede Ay gölge konisinin dışından geçer.
        solar: nearNew && !tilted,
        lunar: nearFull && !tilted,
        aligned: nearNew || nearFull,
    };
};

function eclipseGeom(r: Rect, o: MathObject) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = eclipseState(o);
    const ex = r.x + r.w * 0.62;
    const ey = r.y + r.h * (icon ? 0.5 : 0.52);
    const orbit = Math.min(r.w * 0.22, r.h * 0.3);
    const rad = (s.pos * Math.PI) / 180;
    return {
        fs,
        icon,
        ex,
        ey,
        orbit,
        earthR: Math.min(r.w, r.h) * 0.085,
        moonR: Math.min(r.w, r.h) * 0.032,
        sun: { x: r.x + r.w * 0.04, y: ey, r: Math.min(r.w, r.h) * 0.13 },
        moon: {
            x: ex - orbit * Math.cos(rad),
            // Eğiklik açıkken Ay yörünge düzleminin dışına çıkar.
            y: ey - orbit * 0.34 * Math.sin(rad) - (s.tilted ? orbit * 0.3 : 0),
        },
    };
}

/** Bir kürenin arkasına uzanan gölge konisi (daralan üçgen). */
function shadowCone(k: Ctx, cx: number, cy: number, radius: number, length: number, alpha: number) {
    k.c.save();
    k.c.globalAlpha = alpha;
    k.c.beginPath();
    k.c.moveTo(cx, cy - radius);
    k.c.lineTo(cx + length, cy - radius * 0.12);
    k.c.lineTo(cx + length, cy + radius * 0.12);
    k.c.lineTo(cx, cy + radius);
    k.c.closePath();
    k.c.fill();
    k.c.restore();
}

export const eclipseRender: Renderer = (k) => {
    const r = k.r;
    const s = eclipseState(k.o);
    const g = eclipseGeom(r, k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Güneş ve ışınları
    k.c.beginPath();
    k.c.arc(g.sun.x, g.sun.y, g.sun.r, -Math.PI / 2, Math.PI / 2);
    k.c.stroke();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.4);
    for (let i = -2; i <= 2; i++) {
        const y = g.ey + i * g.orbit * 0.42;
        line(k, g.sun.x + g.sun.r * 0.6, y, g.ex - g.earthR * 1.6, y, 1);
    }
    k.c.restore();

    // Yörünge
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    k.c.setLineDash([6, 4]);
    k.c.beginPath();
    k.c.lineWidth = 1;
    k.c.ellipse(g.ex, g.ey - (s.tilted ? g.orbit * 0.3 : 0), g.orbit, g.orbit * 0.34, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();

    // Dünya ve gölgesi
    shadowCone(k, g.ex + g.earthR * 0.2, g.ey, g.earthR, g.orbit * 1.5, 0.16);
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

    // Ay ve gölgesi
    shadowCone(k, g.moon.x + g.moonR * 0.2, g.moon.y, g.moonR, g.orbit * 1.1, 0.2);
    k.c.beginPath();
    k.c.arc(g.moon.x, g.moon.y, g.moonR, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.2;
    k.c.beginPath();
    k.c.moveTo(g.moon.x, g.moon.y);
    k.c.arc(g.moon.x, g.moon.y, g.moonR, -Math.PI / 2, Math.PI / 2);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(k, 'Güneş', g.sun.x + g.sun.r * 0.2, g.sun.y + g.sun.r + g.fs * 0.4, 'center', 'top', 0.66);
    label(k, 'Dünya', g.ex, g.ey + g.earthR + g.fs * 0.4, 'center', 'top', 0.66);
    label(k, 'Ay', g.moon.x, g.moon.y - g.moonR - g.fs * 0.35, 'center', 'bottom', 0.66);

    const title = s.solar
        ? 'Güneş tutulması — Ay, Güneş’i perdeler'
        : s.lunar
          ? 'Ay tutulması — Ay, Dünya’nın gölgesinde'
          : 'Tutulma yok';
    label(k, fitText(k, [title, s.solar ? 'Güneş tutulması' : s.lunar ? 'Ay tutulması' : 'Tutulma yok'], r.w - g.fs * 5, 0.85), r.x + 4, r.y + 1, 'left', 'top', 0.85);

    const note = s.tilted
        ? 'Yörünge eğik: Ay gölgenin dışından geçer, her ay tutulma olmaz'
        : s.aligned
          ? 'Üçü aynı hizada: gölge tam düşüyor'
          : 'Gölgeler uzayda kalıyor — hizalanma yok';
    label(k, fitText(k, [note, s.tilted ? 'Yörünge eğik' : 'Hizalanma'], r.w - 8, 0.75), r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.75);
    k.c.restore();
};

export const eclipseSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = eclipseState(o);
        const g = eclipseGeom(r, o);
        return [
            { id: 'moon', x: g.moon.x, y: g.moon.y, type: 'drag', label: 'Ay’ı yörüngede sürükle' },
            {
                id: 'tilt',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.tilted ? 'Yörüngeyi düzleştir' : 'Yörüngeyi eğ (5°)',
                on: s.tilted,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = eclipseState(o);
        if (id === 'tilt') return { tilt: s.tilted ? 0 : 1 };
        const g = eclipseGeom(r, o);
        // Açı, elips yörünge daireye indirgenerek bulunur.
        const dx = (g.ex - p.x) / g.orbit;
        const dy = (g.ey - p.y) / (g.orbit * 0.34);
        return { pos: ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360 };
    },
    params: [
        { key: 'pos', label: 'Ay’ın konumu', min: 0, max: 359, step: 1, unit: '°' },
        { key: 'tilt', label: 'Yörünge eğik (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

// ── Newton'un top güllesi (Uzay Çağı) ────────────────────────────────
//
// Kilit fikir: yörünge, "sürekli düşme"dir. Yatay hız arttıkça gülle
// daha uzağa düşer; belli bir hızda Dünya'nın eğriliği kadar hızlı
// düştüğü için hiç yere değmez — yörüngeye oturur. Kurtulma hızında
// (√2 × dairesel hız) bir daha geri dönmez.
//
// Yol, Dünya merkezine doğru 1/r² çekimle adım adım hesaplanır; şekil
// (parabol / elips / çember / açık yörünge) bu hesaptan kendiliğinden
// çıkar, elle çizilmez.

interface CannonPath {
    pts: Array<[number, number]>;
    /** 'hit' yere düştü · 'orbit' kapalı yörünge · 'escape' kaçtı */
    kind: 'hit' | 'orbit' | 'escape';
    /** Dairesel hıza oranı. */
    ratio: number;
    /** Merkeze en uzak nokta (Dünya yarıçapı cinsinden). */
    apo: number;
}

/**
 * Güllenin yolunu birim sistemde üretir: Dünya yarıçapı 1, GM 1.
 * Fırlatma yarıçapı r0'da dairesel hız √(1/r0) olur.
 */
function cannonPath(ratio: number, r0: number): CannonPath {
    const vc = Math.sqrt(1 / r0);
    const v0 = vc * ratio;
    // Kaçış ölçütü analitiktir: v² ≥ 2GM/r  ⇔  oran ≥ √2
    const escapes = ratio >= Math.SQRT2 - 1e-9;
    // Kapalı yörüngede yarı-büyük eksen ve en uzak nokta
    const a = escapes ? Infinity : 1 / (2 / r0 - v0 * v0);
    const apoAnalytic = escapes ? Infinity : Math.max(r0, 2 * a - r0);

    let x = 0;
    let y = -r0;
    let vx = v0;
    let vy = 0;
    const dt = 0.002;
    const pts: Array<[number, number]> = [[x, y]];
    let kind: CannonPath['kind'] = escapes ? 'escape' : 'orbit';
    for (let i = 0; i < 20000; i++) {
        const r = Math.hypot(x, y);
        const acc = -1 / (r * r * r);
        vx += acc * x * dt;
        vy += acc * y * dt;
        x += vx * dt;
        y += vy * dt;
        const rr = Math.hypot(x, y);
        if (i % 4 === 0) pts.push([x, y]);
        if (rr <= 1) {
            pts.push([x, y]);
            kind = 'hit';
            break;
        }
        // Çizim alanının çok dışına çıkınca yolu kesmek yeter.
        if (rr > 7) {
            pts.push([x, y]);
            break;
        }
        // Fırlatma noktasına döndüyse yörünge kapanmıştır.
        if (i > 400 && Math.hypot(x, y + r0) < 0.03) break;
    }
    return { pts, kind, ratio, apo: apoAnalytic };
}

const cannonState = (o: MathObject) => ({
    ratio: clamp(simValue(o, 'v', 0.7), 0.15, 1.6),
    playing: simValue(o, 'play', 0) > 0.5,
});

/** Dünya: kıyı çizgileri belli belirsiz, tepesinde fırlatma dağı. */
function drawEarth(k: Ctx, cx: number, cy: number, R: number, icon: boolean) {
    fillShape(k, () => k.c.arc(cx, cy, R, 0, Math.PI * 2), 0.1);
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.8, k.lw);
    k.c.arc(cx, cy, R, 0, Math.PI * 2);
    k.c.stroke();
    if (!icon) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.3);
        for (const [a0, a1, f] of [
            [0.4, 1.5, 0.78],
            [2.1, 2.9, 0.62],
            [3.6, 4.6, 0.84],
        ] as ReadonlyArray<[number, number, number]>) {
            k.c.beginPath();
            k.c.lineWidth = 1.2;
            k.c.arc(cx, cy, R * f, a0, a1);
            k.c.stroke();
        }
        k.c.restore();
    }
    // Fırlatma dağı ve top
    const my = cy - R;
    const mw = R * 0.16;
    const mh = R * 0.18;
    fillShape(
        k,
        () => {
            k.c.moveTo(cx - mw, my + mh * 0.15);
            k.c.lineTo(cx, my - mh);
            k.c.lineTo(cx + mw, my + mh * 0.15);
            k.c.closePath();
        },
        0.2
    );
    path(k, [
        [cx - mw, my + mh * 0.15],
        [cx, my - mh],
        [cx + mw, my + mh * 0.15],
    ]);
    if (!icon) {
        k.c.save();
        k.c.lineCap = 'round';
        line(k, cx - mw * 0.1, my - mh * 0.75, cx + mw * 1.5, my - mh * 0.95, Math.max(2.4, k.lw * 1.6));
        k.c.restore();
    }
}

export const newtonCannonRender: Renderer = (k) => {
    const r = k.r;
    const s = cannonState(k.o);
    const icon = isIconSize(r);
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const stage: Rect = icon
        ? r
        : { x: r.x + fs * 0.3, y: r.y + fs * 2.2, w: r.w * 0.62, h: r.h - fs * 3 };
    const r0 = 1.18;
    const P = cannonPath(s.ratio, r0);
    // Görünüm: Dünya (yarıçap 1) ile yolun ortak sınır kutusu çerçeveye
    // oturtulur; böylece hem çarpma hem de geniş elips dengeli görünür.
    let x0 = -1.15;
    let x1 = 1.15;
    let y0 = -1.15;
    let y1 = 1.15;
    for (const [ux, uy] of P.pts) {
        x0 = Math.min(x0, ux);
        x1 = Math.max(x1, ux);
        y0 = Math.min(y0, uy);
        y1 = Math.max(y1, uy);
    }
    const R = Math.min(stage.w / Math.max(0.1, x1 - x0), stage.h / Math.max(0.1, y1 - y0)) * 0.94;
    const cx = stage.x + stage.w / 2 - ((x0 + x1) / 2) * R;
    const cy = stage.y + stage.h / 2 - ((y0 + y1) / 2) * R;

    drawEarth(k, cx, cy, R, icon);

    // Yol
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.85);
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.4, k.lw * 0.9);
    P.pts.forEach(([px, py], i) => {
        const sx = cx + px * R;
        const sy = cy + py * R;
        if (i === 0) k.c.moveTo(sx, sy);
        else k.c.lineTo(sx, sy);
    });
    k.c.stroke();
    k.c.restore();

    // Gülle
    const t = s.playing ? (k.t * 0.5) % 1 : 1;
    const idx = Math.min(P.pts.length - 1, Math.floor(t * (P.pts.length - 1)));
    const [bx, by] = P.pts[idx];
    k.c.save();
    k.c.fillStyle = k.color;
    k.c.beginPath();
    k.c.arc(cx + bx * R, cy + by * R, Math.max(2.5, fs * 0.22), 0, Math.PI * 2);
    k.c.fill();
    k.c.restore();

    if (icon) {
        k.c.restore();
        return;
    }

    if (P.kind === 'hit') {
        const [hx, hy] = P.pts[P.pts.length - 1];
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.7);
        const ang = Math.atan2(hy, hx);
        for (let i = 0; i < 5; i++) {
            const a = ang - 0.5 + i * 0.25;
            line(
                k,
                cx + Math.cos(a) * R * 1.02,
                cy + Math.sin(a) * R * 1.02,
                cx + Math.cos(a) * R * 1.13,
                cy + Math.sin(a) * R * 1.13,
                1.2
            );
        }
        k.c.restore();
    }

    if (k.o.labels !== false) {
        const px = r.x + r.w * 0.64;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.2;
        const ph = fs * 7.6;
        panel(k, px, py, pw, ph);
        const verdict =
            P.kind === 'hit'
                ? 'Yere düşer'
                : P.kind === 'escape'
                  ? 'Kaçar — geri dönmez'
                  : Math.abs(s.ratio - 1) < 0.04
                    ? 'Dairesel yörünge'
                    : 'Eliptik yörünge';
        const rows: ReadonlyArray<[string, string]> = [
            ['Yatay hız', `${fmtNum(s.ratio, 2)} × dairesel hız`],
            ['Kurtulma hızı', `${fmtNum(Math.SQRT2, 2)} × dairesel hız`],
            [
                'En uzak nokta',
                P.kind === 'escape'
                    ? 'sınırsız'
                    : P.kind === 'hit'
                      ? 'yere çarpar'
                      : `${fmtNum(P.apo, 2)} × Dünya yarıçapı`,
            ],
        ];
        rows.forEach(([a, b], i) => {
            const y = py + fs * (1.1 + i * 1.5);
            label(k, a, px + fs * 0.6, y, 'left', 'middle', 0.52);
            label(k, fitText(k, [b], pw - fs * 1.1, 0.6), px + fs * 0.6, y + fs * 0.72, 'left', 'middle', 0.6);
        });
        label(k, verdict, px + fs * 0.6, py + fs * 6.2, 'left', 'middle', 0.72);

        // Hız çubuğu: dairesel ve kurtulma hızı işaretli
        const barY = py + ph + fs * 1.1;
        const barX = px + fs * 0.4;
        const barW = pw - fs * 0.8;
        const at = (v: number) => barX + ((v - 0.15) / (1.6 - 0.15)) * barW;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        line(k, barX, barY, barX + barW, barY, 1.4);
        k.c.restore();
        for (const [v, txt] of [
            [1, 'dairesel'],
            [Math.SQRT2, 'kurtulma'],
        ] as ReadonlyArray<[number, string]>) {
            k.c.save();
            k.c.setLineDash([3, 3]);
            k.c.strokeStyle = withAlpha(k.color, 0.5);
            line(k, at(v), barY - fs * 0.4, at(v), barY + fs * 0.4, 1);
            k.c.restore();
            label(k, txt, at(v), barY + fs * 0.55, 'center', 'top', 0.48);
        }
        k.c.save();
        k.c.fillStyle = k.color;
        k.c.beginPath();
        k.c.arc(at(s.ratio), barY, fs * 0.28, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();
    }

    label(
        k,
        fitText(
            k,
            [
                'Newton’un top güllesi: yörünge, sürekli düşmektir',
                'Newton’un top güllesi',
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

const cannonBar = (r: Rect) => {
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);
    const px = r.x + r.w * 0.64;
    const pw = r.w - (px - r.x) - fs * 0.4;
    return {
        fs,
        x: px + fs * 0.4,
        w: pw - fs * 0.8,
        y: r.y + fs * 2.2 + fs * 7.6 + fs * 1.1,
    };
};

export const newtonCannonSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = cannonState(o);
        const b = cannonBar(r);
        return [
            {
                id: 'play',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.playing ? 'Durdur' : 'Gülleyi fırlat',
                on: s.playing,
            },
            {
                id: 'v',
                x: b.x + ((s.ratio - 0.15) / (1.6 - 0.15)) * b.w,
                y: b.y,
                type: 'drag',
                label: 'Yatay hızı değiştir',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        if (id === 'v' && p) {
            const b = cannonBar(r);
            return { v: clamp(0.15 + ((p.x - b.x) / b.w) * (1.6 - 0.15), 0.15, 1.6) };
        }
        return {};
    },
    params: [{ key: 'v', label: 'Yatay hız (dairesel hızın katı)', min: 0.15, max: 1.6, step: 0.05 }],
};

// ── Su döngüsü (Sürdürülebilir Yaşam ve Geri Dönüşüm) ────────────────
//
// Kilit fikir: yeryüzündeki su miktarı değişmez; su hâl değiştirerek
// dolaşır. Buharlaşma → yoğuşma → yağış → toplanma; sonra baştan.
// Her adımda hangi hâl değişiminin olduğu ayrıca yazılır.

interface CycleStage {
    name: string;
    change: string;
    text: string;
}

const WATER_STAGES: ReadonlyArray<CycleStage> = [
    {
        name: 'Buharlaşma',
        change: 'sıvı → gaz',
        text: 'Güneş’ten gelen ısı ile denizden, gölden ve topraktan su buharlaşır; bitkiler de terleme ile su buharı verir.',
    },
    {
        name: 'Yoğuşma',
        change: 'gaz → sıvı',
        text: 'Yükselen su buharı soğur, küçük su damlacıklarına dönüşür ve bir araya gelerek bulutları oluşturur.',
    },
    {
        name: 'Yağış',
        change: 'sıvı / katı',
        text: 'Damlacıklar birleşip ağırlaşınca yağmur, kar ya da dolu olarak yeryüzüne düşer.',
    },
    {
        name: 'Toplanma',
        change: 'akış ve sızma',
        text: 'Yağan su akarsu ve göllerde toplanır, bir kısmı toprağa sızarak yer altı suyunu besler; sonra döngü yeniden başlar.',
    },
];

const cycleState = (o: MathObject, t: number) => {
    const playing = simValue(o, 'play', 0) > 0.5;
    const step = playing
        ? Math.floor((t * 0.5) % WATER_STAGES.length)
        : clampInt(simValue(o, 'step', 0), 0, WATER_STAGES.length - 1, 0);
    return { step, playing };
};

/** Etkin olmayan aşamalar soluk çizilir; anlatılan adım öne çıkar. */
function stageAlpha(k: Ctx, active: boolean, draw: () => void) {
    k.c.save();
    k.c.globalAlpha = active ? 1 : 0.22;
    draw();
    k.c.restore();
}

export const waterCycleRender: Renderer = (k) => {
    const r = k.r;
    const icon = isIconSize(r);
    const s = cycleState(k.o, k.t);
    const fs = clamp(Math.min(r.w, r.h) / 15, 9, 19);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const scene: Rect = icon
        ? r
        : { x: r.x + fs * 0.3, y: r.y + fs * 2, w: r.w - fs * 0.6, h: r.h - fs * 7.6 };
    const seaY = scene.y + scene.h * 0.62;
    const bottom = scene.y + scene.h;
    const seaX = scene.x + scene.w * 0.46;

    if (icon) {
        // Simge: bulut, yağış ve deniz yeter.
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.3;
        fillShape(k, () => k.c.ellipse(cx, cy, r.w * 0.24, r.h * 0.14, 0, 0, Math.PI * 2), 0.2);
        k.c.beginPath();
        k.c.ellipse(cx, cy, r.w * 0.24, r.h * 0.14, 0, 0, Math.PI * 2);
        k.c.stroke();
        for (let i = -1; i <= 1; i++) {
            line(k, cx + i * r.w * 0.13, cy + r.h * 0.18, cx + i * r.w * 0.13 - r.w * 0.03, cy + r.h * 0.34, 1.4);
        }
        line(k, r.x + r.w * 0.12, r.y + r.h * 0.82, r.x + r.w * 0.88, r.y + r.h * 0.82, Math.max(1.6, k.lw));
        k.c.restore();
        return;
    }

    // Güneş (arka plan)
    const sunX = scene.x + scene.w * 0.86;
    const sunY = scene.y + scene.h * 0.16;
    const sunR = fs * 1.05;
    stageAlpha(k, s.step === 0, () => {
        k.c.beginPath();
        k.c.lineWidth = Math.max(1.6, k.lw);
        k.c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        k.c.stroke();
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            line(
                k,
                sunX + Math.cos(a) * sunR * 1.3,
                sunY + Math.sin(a) * sunR * 1.3,
                sunX + Math.cos(a) * sunR * 1.7,
                sunY + Math.sin(a) * sunR * 1.7,
                1.4
            );
        }
    });

    // Bulut (dağların arkasında)
    const clX = scene.x + scene.w * 0.26;
    const clY = scene.y + scene.h * 0.2;
    const clW = scene.w * 0.085;
    stageAlpha(k, s.step === 1, () => {
        const lobes: ReadonlyArray<[number, number, number]> = [
            [-0.8, 0.16, 0.42],
            [-0.28, -0.24, 0.58],
            [0.26, -0.3, 0.6],
            [0.76, 0.12, 0.44],
        ];
        fillShape(
            k,
            () => {
                for (const [dx, dy, rr] of lobes) {
                    k.c.moveTo(clX + dx * clW + rr * clW, clY + dy * clW);
                    k.c.arc(clX + dx * clW, clY + dy * clW, rr * clW, 0, Math.PI * 2);
                }
                k.c.rect(clX - clW * 0.82, clY, clW * 1.64, clW * 0.4);
            },
            0.16
        );
        for (const [dx, dy, rr] of lobes) {
            k.c.beginPath();
            k.c.lineWidth = Math.max(1.6, k.lw);
            k.c.arc(clX + dx * clW, clY + dy * clW, rr * clW, Math.PI * 0.97, Math.PI * 2.03);
            k.c.stroke();
        }
        line(k, clX - clW * 0.8, clY + clW * 0.38, clX + clW * 0.76, clY + clW * 0.38, Math.max(1.6, k.lw));
        label(k, 'yoğuşma', clX + clW * 1.15, clY - clW * 0.2, 'left', 'middle', 0.55);
    });

    // Deniz
    const wave: Array<[number, number]> = [];
    for (let i = 0; i <= 10; i++) {
        const x = seaX + ((scene.x + scene.w - seaX) * i) / 10;
        wave.push([x, seaY + Math.sin(i * 1.1) * fs * 0.16]);
    }
    fillShape(
        k,
        () => {
            k.c.moveTo(wave[0][0], wave[0][1]);
            for (const [x, y] of wave) k.c.lineTo(x, y);
            k.c.lineTo(scene.x + scene.w, bottom);
            k.c.lineTo(seaX, bottom);
            k.c.closePath();
        },
        0.16
    );
    smooth(k, wave, false, Math.max(1.6, k.lw));

    // Kara ve dağlar (ön planda)
    const peakA = seaY - scene.h * 0.3;
    const peakB = seaY - scene.h * 0.38;
    const land: Array<[number, number]> = [
        [scene.x, bottom],
        [scene.x, seaY - scene.h * 0.04],
        [scene.x + scene.w * 0.11, peakA],
        [scene.x + scene.w * 0.18, seaY - scene.h * 0.18],
        [scene.x + scene.w * 0.27, peakB],
        [scene.x + scene.w * 0.37, seaY - scene.h * 0.08],
        [seaX, seaY + fs * 0.1],
        [seaX, bottom],
    ];
    k.c.save();
    k.c.globalAlpha = 1;
    fillShape(
        k,
        () => {
            k.c.moveTo(land[0][0], land[0][1]);
            for (const [x, y] of land) k.c.lineTo(x, y);
            k.c.closePath();
        },
        0.09
    );
    // Kar örtüsü: zirvelerin ucu
    fillShape(
        k,
        () => {
            k.c.moveTo(scene.x + scene.w * 0.235, peakB + scene.h * 0.07);
            k.c.lineTo(scene.x + scene.w * 0.27, peakB);
            k.c.lineTo(scene.x + scene.w * 0.305, peakB + scene.h * 0.07);
            k.c.closePath();
        },
        0.3
    );
    path(k, land.slice(1, land.length - 1));
    k.c.restore();
    line(k, scene.x, bottom, scene.x + scene.w, bottom, Math.max(1.4, k.lw * 0.8));

    // Buharlaşma okları
    stageAlpha(k, s.step === 0, () => {
        for (let i = 0; i < 3; i++) {
            const x = seaX + (scene.x + scene.w - seaX) * (0.2 + i * 0.26);
            const y0 = seaY;
            const y1 = scene.y + scene.h * 0.3;
            k.c.beginPath();
            k.c.lineWidth = 1.5;
            k.c.moveTo(x, y0);
            k.c.bezierCurveTo(x + fs * 0.6, y0 - fs, x - fs * 0.6, y1 + fs, x, y1);
            k.c.stroke();
            arrowHead(k, x, y1, -Math.PI / 2, fs * 0.45);
        }
        label(k, 'buharlaşma', seaX + fs * 0.3, seaY - fs * 0.5, 'left', 'bottom', 0.55);
    });

    // Yağış: buluttan dağların yamacına
    stageAlpha(k, s.step === 2, () => {
        for (let i = 0; i < 7; i++) {
            const x = clX - clW * 0.72 + i * clW * 0.24;
            const y = clY + clW * 0.55 + (i % 2) * fs * 0.4;
            line(k, x, y, x - fs * 0.28, y + fs * 1.05, 1.5);
        }
        label(k, 'yağış', clX + clW * 1.15, clY + clW * 1.15, 'left', 'middle', 0.55);
    });

    // Toplanma: akarsu ve yer altı suyu
    stageAlpha(k, s.step === 3, () => {
        const river: Array<[number, number]> = [
            [scene.x + scene.w * 0.27, peakB + scene.h * 0.06],
            [scene.x + scene.w * 0.31, seaY - scene.h * 0.2],
            [scene.x + scene.w * 0.36, seaY - scene.h * 0.09],
            [scene.x + scene.w * 0.43, seaY - fs * 0.1],
        ];
        smooth(k, river, false, Math.max(2, k.lw * 1.2));
        arrowHead(k, river[3][0], river[3][1], Math.PI * 0.22, fs * 0.5);
        k.c.save();
        k.c.setLineDash([4, 4]);
        arrow(k, scene.x + scene.w * 0.14, bottom - fs * 1.2, scene.x + scene.w * 0.42, bottom - fs * 0.6, fs * 0.45, 1.3);
        k.c.restore();
        label(k, 'yer altı suyu', scene.x + scene.w * 0.14, bottom - fs * 1.5, 'left', 'bottom', 0.52);
        label(k, 'akarsu', scene.x + scene.w * 0.4, seaY - scene.h * 0.06, 'left', 'middle', 0.52);
    });

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Adım şeridi ve açıklama
    const stepY = scene.y + scene.h + fs * 1.5;
    const chipW = (r.w - fs * 1.4) / WATER_STAGES.length;
    WATER_STAGES.forEach((st, i) => {
        const x = r.x + fs * 0.5 + i * chipW;
        k.c.save();
        k.c.lineWidth = i === s.step ? Math.max(2, k.lw * 1.3) : 1;
        k.c.strokeStyle = i === s.step ? k.color : withAlpha(k.color, 0.4);
        roundRect(k, x, stepY - fs * 0.85, chipW - fs * 0.4, fs * 1.7, 6);
        k.c.stroke();
        if (i === s.step) {
            k.c.globalAlpha = 0.1;
            k.c.fill();
        }
        k.c.restore();
        label(
            k,
            `${i + 1}. ${st.name}`,
            x + (chipW - fs * 0.4) / 2,
            stepY - fs * 0.15,
            'center',
            'middle',
            0.58
        );
        label(k, st.change, x + (chipW - fs * 0.4) / 2, stepY + fs * 0.55, 'center', 'middle', 0.48);
    });

    const st = WATER_STAGES[s.step];
    const textY = stepY + fs * 1.7;
    const words = st.text.split(' ');
    let lineBuf = '';
    let row = 0;
    for (const w of words) {
        const next = lineBuf ? `${lineBuf} ${w}` : w;
        if (textWidth(k, next, 0.58) > r.w - fs * 1.2 && lineBuf) {
            label(k, lineBuf, r.x + fs * 0.5, textY + row * fs * 0.85, 'left', 'top', 0.58);
            lineBuf = w;
            row++;
        } else lineBuf = next;
    }
    if (lineBuf && row < 3) label(k, lineBuf, r.x + fs * 0.5, textY + row * fs * 0.85, 'left', 'top', 0.58);

    label(
        k,
        fitText(
            k,
            ['Su döngüsü: su tükenmez, hâl değiştirerek dolaşır', 'Su döngüsü'],
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

export const waterCycleSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = cycleState(o, 0);
        return [
            {
                id: 'next',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Sonraki adım',
                on: s.step > 0,
            },
            {
                id: 'play',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.playing ? 'Durdur' : 'Döngüyü çalıştır',
                on: s.playing,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        if (id === 'next') {
            const step = clampInt(simValue(o, 'step', 0), 0, WATER_STAGES.length - 1, 0);
            return { step: (step + 1) % WATER_STAGES.length, play: 0 };
        }
        return {};
    },
    params: [{ key: 'step', label: `Adım (0-${WATER_STAGES.length - 1})`, min: 0, max: WATER_STAGES.length - 1, step: 1 }],
};

export const SCIENCE_SIM_RENDERERS: Record<string, Renderer> = {
    moon_phase_sim: moonRender,
    label_drag_sim: labelDragRender,
    heating_curve_sim: heatingRender,
    density_sim: densityRender,
    eclipse_sim: eclipseRender,
    newton_cannon_sim: newtonCannonRender,
    water_cycle_sim: waterCycleRender,
};

export const SCIENCE_SIM_SPECS: Record<string, SimSpec> = {
    moon_phase_sim: moonSpec,
    label_drag_sim: labelDragSpec,
    heating_curve_sim: heatingSpec,
    density_sim: densitySpec,
    eclipse_sim: eclipseSpec,
    newton_cannon_sim: newtonCannonSpec,
    water_cycle_sim: waterCycleSpec,
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
    {
        kind: 'heating_curve_sim',
        label: 'Isınma Eğrisi',
        hint: 'Buzu ısıt; erime ve kaynamada sıcaklık neden sabit kalır',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { time: 30, play: 0 } },
    },
    {
        kind: 'density_sim',
        label: 'Yoğunluk ve Kaldırma Kuvveti',
        hint: 'Cismi sürükle; yüzme, askıda kalma ve batma koşulunu gör',
        size: { w: 520, h: 340 },
        defaults: { labels: true, sim: { d: 0.6, dl: 1, v: 30 } },
    },
    {
        kind: 'eclipse_sim',
        label: 'Tutulmalar',
        hint: 'Ay’ı sürükle; Güneş ve Ay tutulmasının neden her ay olmadığını gör',
        size: { w: 540, h: 320 },
        defaults: { labels: true, sim: { pos: 0, tilt: 0 } },
    },
    {
        kind: 'newton_cannon_sim',
        label: 'Newton’un Top Güllesi',
        hint: 'Yatay hızı artır: düşer, yörüngeye oturur, kaçar',
        size: { w: 580, h: 400 },
        defaults: { labels: true, sim: { v: 0.7, play: 0 } },
    },
    {
        kind: 'water_cycle_sim',
        label: 'Su Döngüsü',
        hint: 'Buharlaşma → yoğuşma → yağış → toplanma; adım adım çalıştır',
        size: { w: 600, h: 420 },
        defaults: { labels: true, sim: { step: 0, play: 0 } },
    },
];
