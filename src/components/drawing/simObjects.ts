// src/components/drawing/simObjects.ts
// Defter sayfasına gömülen CANLI nesneler: dokunup sürükleyince tepki veren,
// gerektiğinde kendi kendine hareket eden simülasyonlar.
//
// Kalıcı olarak yalnızca kullanıcının ayarladığı değerler saklanır
// (`MathObject.sim`). Animasyonun anlık evresi saklanmaz; her karede
// zamandan (Ctx.t) yeniden üretilir. Böylece hem kayıt küçük kalır hem de
// geri al yığını animasyon yüzünden şişmez.

import type { MathObject, MathObjectKind } from '../../types';
import {
    arrow,
    clampInt,
    fillShape,
    label,
    line,
    simValue,
    textWidth,
    withAlpha,
    type Ctx,
    type ObjectCategory,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Aynı girdiye hep aynı sonucu veren küçük karıştırıcı (tanecik dağılımı). */
const hash = (i: number, salt = 1) => {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

// ── Optik düzeneği ───────────────────────────────────────────────────
//
// İnce mercek bağıntısı:  1/f = 1/a + 1/b
//   a: cismin merceğe uzaklığı (daima pozitif)
//   b: görüntünün uzaklığı; negatifse görüntü sanaldır (cisim tarafında)
//   Büyütme: -b / a  (işaret negatifse görüntü terstir)

interface OpticsGeom {
    cx: number;
    cy: number;
    /** 1 birim = kaç piksel. */
    unit: number;
    f: number;
    a: number;
    h: number;
    b: number | null;
    imageH: number;
}

function opticsGeom(r: Rect, o: MathObject): OpticsGeom {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    // Kutuya göre ölçek: yatayda ±10 birim görünsün.
    const unit = r.w / 20;
    const f = simValue(o, 'f', 4);
    const a = clamp(simValue(o, 'a', 7), 0.6, 9.5);
    const h = clamp(simValue(o, 'h', 2), 0.4, 3.5);
    // f ile a eşitse görüntü sonsuzda oluşur; çizilemez.
    const denom = 1 / f - 1 / a;
    const b = Math.abs(denom) < 1e-3 ? null : 1 / denom;
    const imageH = b === null ? 0 : (-b / a) * h;
    return { cx, cy, unit, f, a, h, b, imageH };
}

const opticsRender: Renderer = (k) => {
    const r = k.r;
    // Işınlar nesnenin kutusundan taşmasın; aksi halde sayfadaki başka
    // içeriğin üstüne uzanıyorlar.
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    const g = opticsGeom(r, k.o);
    const { cx, cy, unit } = g;
    const converging = g.f > 0;
    const lensH = Math.min(r.h * 0.62, unit * 7);

    // Ana eksen
    line(k, r.x, cy, r.x + r.w, cy, 1);

    // Mercek gövdesi
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    if (converging) {
        const bulge = unit * 0.5;
        k.c.moveTo(cx, cy - lensH / 2);
        k.c.quadraticCurveTo(cx + bulge, cy, cx, cy + lensH / 2);
        k.c.quadraticCurveTo(cx - bulge, cy, cx, cy - lensH / 2);
    } else {
        const edge = unit * 0.28;
        const dip = unit * 0.3;
        k.c.moveTo(cx - edge, cy - lensH / 2);
        k.c.lineTo(cx + edge, cy - lensH / 2);
        k.c.quadraticCurveTo(cx + edge - dip, cy, cx + edge, cy + lensH / 2);
        k.c.lineTo(cx - edge, cy + lensH / 2);
        k.c.quadraticCurveTo(cx - edge + dip, cy, cx - edge, cy - lensH / 2);
    }
    k.c.closePath();
    k.c.stroke();

    // Odak noktaları
    [-1, 1].forEach((sign) => {
        const x = cx + sign * Math.abs(g.f) * unit;
        line(k, x, cy - 5, x, cy + 5, 1);
        if (k.o.labels !== false) label(k, 'F', x, cy + k.fs * 0.9, 'center', 'middle', 0.8);
    });

    // Cisim: soldaki dik ok
    const objX = cx - g.a * unit;
    const objTop = cy - g.h * unit;
    arrow(k, objX, cy, objX, objTop, 9, Math.max(2, k.lw * 1.3));

    // Ana ışınlar
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.75);
    const right = r.x + r.w;
    // 1) Eksene paralel gelen ışın
    line(k, objX, objTop, cx, objTop, 1);
    if (g.b !== null) {
        const imgX = cx + g.b * unit;
        // Ekran y'si aşağı arttığı için işaret çevrilir: pozitif görüntü boyu
        // eksenin ÜSTÜNE, negatif (ters görüntü) ALTINA düşer.
        const imgTop = cy - g.imageH * unit;
        if (converging) {
            line(k, cx, objTop, right, objTop + ((right - cx) / (imgX - cx)) * (imgTop - objTop), 1);
        } else {
            // Iraksak mercekte kırılan ışın odaktan geliyormuş gibi uzar.
            const fx = cx - Math.abs(g.f) * unit;
            const slope = (objTop - cy) / (cx - fx);
            line(k, cx, objTop, right, objTop + (right - cx) * slope, 1);
        }
        // 2) Merkezden geçen ışın
        const slope2 = (cy - objTop) / (cx - objX);
        line(k, objX, objTop, right, objTop + (right - objX) * slope2, 1);

        // Sanal görüntüde ışınların geri uzantısı kesikli çizilir.
        if (g.b < 0) {
            k.c.setLineDash([6, 5]);
            line(k, cx, objTop, imgX, imgTop, 1);
            line(k, cx, cy, imgX, imgTop, 1);
            k.c.setLineDash([]);
        }
        k.c.restore();

        // Görüntü
        k.c.save();
        if (g.b < 0) k.c.setLineDash([7, 4]);
        arrow(k, imgX, cy, imgX, imgTop, 9, Math.max(2, k.lw * 1.3));
        k.c.restore();
    } else {
        k.c.restore();
    }

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    const magnification = g.b === null ? null : -g.b / g.a;
    const kind = converging ? 'İnce kenarlı' : 'Kalın kenarlı';
    const info =
        g.b === null
            ? 'Cisim odakta — görüntü oluşmaz'
            : `${g.b > 0 ? 'gerçek' : 'sanal'} · ${
                  (magnification as number) < 0 ? 'ters' : 'düz'
              } · ${Math.abs(magnification as number).toFixed(2)}×`;
    label(k, `${kind} · f = ${g.f.toFixed(1)}`, r.x, r.y, 'left', 'top', 0.78);
    label(k, info, r.x + r.w, r.y, 'right', 'top', 0.78);
    k.c.restore();
};

const opticsSpec: SimSpec = {
    controls: (r, o) => {
        const g = opticsGeom(r, o);
        return [
            {
                id: 'obj',
                x: g.cx - g.a * g.unit,
                y: g.cy - g.h * g.unit,
                type: 'drag',
                label: 'Cismi sürükle',
            },
            {
                id: 'focus',
                x: g.cx + Math.abs(g.f) * g.unit,
                y: g.cy,
                type: 'drag',
                label: 'Odağı sürükle',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const g = opticsGeom(r, o);
        if (id === 'obj') {
            return {
                a: clamp((g.cx - p.x) / g.unit, 0.6, 9.5),
                h: clamp((g.cy - p.y) / g.unit, 0.4, 3.5),
            };
        }
        const f = clamp(Math.abs(p.x - g.cx) / g.unit, 1, 8);
        return { f: g.f < 0 ? -f : f };
    },
    params: [
        { key: 'f', label: 'Odak uzaklığı', min: -8, max: 8, step: 0.5, unit: 'br' },
        { key: 'a', label: 'Cisim uzaklığı', min: 0.6, max: 9.5, step: 0.1, unit: 'br' },
        { key: 'h', label: 'Cisim boyu', min: 0.4, max: 3.5, step: 0.1, unit: 'br' },
    ],
};

// ── Canlı devre ──────────────────────────────────────────────────────

interface CircuitGeom {
    r: Rect;
    parallel: boolean;
    count: number;
    closed: boolean;
    cells: number;
    broken: number[];
    /** Her ampulün merkezi. */
    bulbs: Array<{ x: number; y: number }>;
    switchAt: { x: number; y: number };
    s: number;
    /** Ampul başına parlaklık (0..1). */
    brightness: number[];
}

function circuitGeom(rect: Rect, o: MathObject): CircuitGeom {
    const pad = Math.min(rect.w, rect.h) * 0.14;
    const r: Rect = { x: rect.x + pad, y: rect.y + pad, w: rect.w - pad * 2, h: rect.h - pad * 2 };
    const parallel = simValue(o, 'parallel', 0) > 0.5;
    const count = clampInt(simValue(o, 'n', 2), 1, 3, 2);
    const closed = simValue(o, 'sw', 1) > 0.5;
    const cells = clampInt(simValue(o, 'v', 1), 1, 3, 1);
    const broken = [0, 1, 2].map((i) => (simValue(o, `b${i}`, 0) > 0.5 ? 1 : 0));
    const s = Math.min(r.w / (count + 2), r.h) * 0.3;

    const bulbs: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
        const x = r.x + (r.w * (i + 1)) / (count + 1);
        bulbs.push({ x, y: parallel ? r.y + r.h / 2 : r.y });
    }
    const switchAt = { x: r.x + r.w * 0.72, y: r.y + r.h };

    // Akım: seri devrede tek kol, paralelde her kol bağımsız.
    const brightness = bulbs.map((_, i) => {
        if (!closed) return 0;
        if (parallel) return broken[i] ? 0 : Math.min(1, cells / 1);
        const anyBroken = broken.slice(0, count).some(Boolean);
        if (anyBroken) return 0;
        return Math.min(1, cells / count);
    });
    return { r, parallel, count, closed, cells, broken, bulbs, switchAt, s, brightness };
}

/** Işıyan ampul. `glow` 0 ise sadece sembol çizilir. */
function drawBulb(k: Ctx, x: number, y: number, s: number, glow: number, broken: boolean) {
    if (glow > 0.02) {
        k.c.save();
        const grad = k.c.createRadialGradient(x, y, s * 0.3, x, y, s * 2.4);
        grad.addColorStop(0, withAlpha(k.color, 0.35 * glow));
        grad.addColorStop(1, withAlpha(k.color, 0));
        k.c.fillStyle = grad;
        k.c.beginPath();
        k.c.arc(x, y, s * 2.4, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();
    }
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(x, y, s * 0.6, 0, Math.PI * 2);
    k.c.stroke();
    const d = s * 0.42;
    if (broken) {
        // Patlak ampul: filamanın ortasında belirgin bir kopukluk bırakılır.
        line(k, x - d, y - d, x - d * 0.42, y - d * 0.42);
        line(k, x + d * 0.42, y + d * 0.42, x + d, y + d);
        line(k, x - d, y + d, x - d * 0.42, y + d * 0.42);
        line(k, x + d * 0.42, y - d * 0.42, x + d, y - d);
    } else {
        line(k, x - d, y - d, x + d, y + d);
        line(k, x - d, y + d, x + d, y - d);
    }
}

/** Tel üzerinde akan akım noktaları. */
function currentDots(k: Ctx, pts: Array<[number, number]>, phase: number, on: boolean) {
    if (!on) return;
    let total = 0;
    const seg: number[] = [];
    for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        seg.push(d);
        total += d;
    }
    if (total < 1) return;
    const gap = Math.max(26, total / 14);
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.65);
    for (let d = (phase % gap); d < total; d += gap) {
        let rest = d;
        for (let i = 0; i < seg.length; i++) {
            if (rest <= seg[i]) {
                const t = seg[i] === 0 ? 0 : rest / seg[i];
                const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
                const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
                k.c.beginPath();
                k.c.arc(x, y, Math.max(2, k.lw * 1.2), 0, Math.PI * 2);
                k.c.fill();
                break;
            }
            rest -= seg[i];
        }
    }
    k.c.restore();
}

const circuitRender: Renderer = (k) => {
    const g = circuitGeom(k.r, k.o);
    const { r, s } = g;
    const left = r.x;
    const right = r.x + r.w;
    const top = r.y;
    const bottom = r.y + r.h;
    const midY = (top + bottom) / 2;
    k.c.lineWidth = k.lw;

    /** Sembollerin oturduğu boşlukları atlayarak yatay tel çizer. */
    const hWire = (xa: number, xb: number, y: number, gaps: Array<[number, number]>) => {
        let x = xa;
        for (const [g0, g1] of [...gaps].sort((a, b) => a[0] - b[0])) {
            if (g0 > x) line(k, x, y, Math.min(g0, xb), y);
            x = Math.max(x, g1);
        }
        if (x < xb) line(k, x, y, xb, y);
    };

    const batY = g.parallel ? midY : bottom;
    const batX = g.parallel ? left : left + r.w * 0.3;

    // Pil (sarımlı gösterim: hücre sayısı kadar uzun/kısa çizgi çifti)
    const drawBattery = (cx: number, cy: number, vertical: boolean) => {
        k.c.save();
        k.c.translate(cx, cy);
        if (vertical) k.c.rotate(Math.PI / 2);
        const w = s * 0.5;
        for (let i = 0; i < g.cells; i++) {
            const x = (i - (g.cells - 1) / 2) * w;
            line(k, x - w * 0.18, -s * 0.6, x - w * 0.18, s * 0.6);
            line(k, x + w * 0.18, -s * 0.3, x + w * 0.18, s * 0.3);
        }
        k.c.restore();
    };
    const batHalf = (g.cells * s * 0.5) / 2 + s * 0.25;

    if (g.parallel) {
        line(k, left, top, right, top);
        line(k, left, bottom, right, bottom);
        line(k, right, top, right, bottom);
        line(k, left, top, left, midY - batHalf);
        line(k, left, midY + batHalf, left, bottom);
        drawBattery(left, midY, true);
        g.bulbs.forEach((b, i) => {
            line(k, b.x, top, b.x, b.y - s * 1.2);
            line(k, b.x, b.y + s * 1.2, b.x, bottom);
            drawBulb(k, b.x, b.y, s, g.brightness[i], !!g.broken[i]);
            currentDots(
                k,
                [
                    [b.x, top],
                    [b.x, bottom],
                ],
                k.t * 40,
                g.brightness[i] > 0
            );
        });
        // Anahtar alt telde
        hWire(left, right, bottom, [[g.switchAt.x - s * 1.2, g.switchAt.x + s * 1.2]]);
    } else {
        line(k, left, top, left, bottom);
        line(k, right, top, right, bottom);
        hWire(
            left,
            right,
            top,
            g.bulbs.map((b) => [b.x - s * 1.2, b.x + s * 1.2] as [number, number])
        );
        g.bulbs.forEach((b, i) => {
            line(k, b.x - s * 1.2, b.y, b.x - s * 0.6, b.y);
            line(k, b.x + s * 0.6, b.y, b.x + s * 1.2, b.y);
            drawBulb(k, b.x, b.y, s, g.brightness[i], !!g.broken[i]);
        });
        hWire(left, right, batY, [
            [batX - batHalf, batX + batHalf],
            [g.switchAt.x - s * 1.2, g.switchAt.x + s * 1.2],
        ]);
        drawBattery(batX, batY, false);
        currentDots(
            k,
            [
                [left, bottom],
                [left, top],
                [right, top],
                [right, bottom],
            ],
            k.t * 40,
            g.brightness[0] > 0
        );
    }

    // Anahtar
    const sw = g.switchAt;
    line(k, sw.x - s * 1.2, sw.y, sw.x - s * 0.6, sw.y);
    line(k, sw.x + s * 0.6, sw.y, sw.x + s * 1.2, sw.y);
    [-1, 1].forEach((sign) => {
        k.c.beginPath();
        k.c.arc(sw.x + sign * s * 0.6, sw.y, Math.max(1.8, s * 0.13), 0, Math.PI * 2);
        k.c.fill();
    });
    if (g.closed) {
        line(k, sw.x - s * 0.6, sw.y, sw.x, sw.y - s * 0.26);
        line(k, sw.x, sw.y - s * 0.26, sw.x + s * 0.6, sw.y);
    } else {
        line(k, sw.x - s * 0.6, sw.y, sw.x + s * 0.45, sw.y - s * 0.8);
    }

    if (k.o.labels === false) return;
    const state = !g.closed
        ? 'anahtar açık — devre tamamlanmadı'
        : g.brightness.every((b) => b === 0)
        ? g.parallel
            ? 'kollar patlak'
            : 'seri devrede bir ampul patlayınca hepsi söner'
        : `${g.parallel ? 'paralel' : 'seri'} bağlı · parlaklık ${Math.round(
              Math.max(...g.brightness) * 100
          )}%`;
    label(k, state, k.r.x + k.r.w / 2, k.r.y + k.r.h, 'center', 'bottom', 0.8);
};

const circuitSpec: SimSpec = {
    animated: true,
    controls: (rect, o) => {
        const g = circuitGeom(rect, o);
        return [
            {
                id: 'sw',
                x: g.switchAt.x,
                y: g.switchAt.y,
                type: 'toggle',
                label: 'Anahtar',
                on: g.closed,
            },
            ...g.bulbs.map((b, i) => ({
                id: `b${i}`,
                x: b.x,
                y: b.y - g.s * 1.1,
                type: 'toggle' as const,
                label: 'Ampulü patlat',
                on: !g.broken[i],
            })),
        ];
    },
    onControl: (rect, o, id): Record<string, number> => {
        if (id === 'sw') return { sw: simValue(o, 'sw', 1) > 0.5 ? 0 : 1 };
        if (/^b\d$/.test(id)) return { [id]: simValue(o, id, 0) > 0.5 ? 0 : 1 };
        return {};
    },
    params: [
        { key: 'parallel', label: 'Bağlantı (0 seri / 1 paralel)', min: 0, max: 1, step: 1 },
        { key: 'n', label: 'Ampul sayısı', min: 1, max: 3, step: 1 },
        { key: 'v', label: 'Pil sayısı', min: 1, max: 3, step: 1 },
    ],
};

// ── Maddenin halleri ─────────────────────────────────────────────────

const matterRender: Renderer = (k) => {
    const temp = clamp(simValue(k.o, 'temp', 20), 0, 100);
    const pad = k.fs * 0.4;
    const box: Rect = {
        x: k.r.x + pad,
        y: k.r.y + pad,
        w: k.r.w - pad * 2,
        h: k.r.h - pad * 2 - k.fs * 1.4,
    };
    k.c.lineWidth = k.lw;
    k.c.strokeRect(box.x, box.y, box.w, box.h);

    const state = temp < 34 ? 'katı' : temp < 68 ? 'sıvı' : 'gaz';
    const count = 24;
    const dot = Math.max(2.5, Math.min(box.w, box.h) * 0.028);
    // Enerji arttıkça tanecikler hem daha çok titreşir hem daha geniş yayılır.
    const energy = temp / 100;

    for (let i = 0; i < count; i++) {
        let x: number;
        let y: number;
        if (state === 'katı') {
            // Düzenli örgü, yerinde titreşim
            const col = i % 6;
            const row = Math.floor(i / 6);
            const jitter = dot * 0.5 * energy * 3;
            x = box.x + box.w * (0.14 + col * 0.145) + Math.sin(k.t * 6 + i) * jitter;
            y = box.y + box.h * (0.2 + row * 0.2) + Math.cos(k.t * 7 + i * 1.7) * jitter;
        } else if (state === 'sıvı') {
            // Alt yarıda birbirine değerek akar
            const drift = (k.t * 0.06 * (0.4 + hash(i, 3))) % 1;
            x = box.x + box.w * (0.08 + ((hash(i) + drift) % 1) * 0.84);
            y =
                box.y +
                box.h * (0.45 + hash(i, 2) * 0.48) +
                Math.sin(k.t * 2.4 + i) * dot * 1.4;
        } else {
            // Kabın her yerinde serbest hareket
            const vx = (hash(i, 4) - 0.5) * 2;
            const vy = (hash(i, 5) - 0.5) * 2;
            const wrap = (v: number) => ((v % 1) + 1) % 1;
            x = box.x + box.w * (0.05 + wrap(hash(i) + vx * k.t * 0.14) * 0.9);
            y = box.y + box.h * (0.05 + wrap(hash(i, 2) + vy * k.t * 0.14) * 0.9);
        }
        k.c.beginPath();
        k.c.arc(x, y, dot, 0, Math.PI * 2);
        k.c.fill();
    }

    // Sıvıda yüzey çizgisi
    if (state === 'sıvı') {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        line(k, box.x, box.y + box.h * 0.42, box.x + box.w, box.y + box.h * 0.42, 1);
        k.c.restore();
    }

    if (k.o.labels === false) return;
    label(
        k,
        `${state.toUpperCase()} · ${Math.round(temp)} °C`,
        k.r.x + k.r.w / 2,
        k.r.y + k.r.h,
        'center',
        'bottom',
        0.9
    );
};

const matterSpec: SimSpec = {
    animated: true,
    params: [{ key: 'temp', label: 'Sıcaklık', min: 0, max: 100, step: 1, unit: '°C' }],
};

// ── Mevsimlerin oluşumu (Mevsimler ve İklim) ─────────────────────────
//
// Kilit fikir: Dünya'nın ekseni UZAYDA hep aynı yöne bakar. Bu yüzden
// yörüngenin bir yanında kuzey yarım küre Güneş'e dönük, karşı yanında
// dönük değildir. Mevsimin sebebi uzaklık değil, ışınların geliş açısıdır.

const SEASON_TILT = (23.5 * Math.PI) / 180;

interface SeasonInfo {
    north: string;
    south: string;
}

/** Yörüngenin dört özel noktası. Yalnızca o noktalara yakınken yazılır. */
const SEASON_DATES: Record<number, string> = {
    0: '21 Aralık',
    90: '21 Mart',
    180: '21 Haziran',
    270: '23 Eylül',
};

/**
 * Kuzey kutbunun Güneş'e dönüklüğü. Eksen 3 boyutta sabittir; yörünge
 * düzlemi ekranda elips olarak göründüğü için bu değer EKRAN koordinatından
 * değil, yörünge açısından hesaplanmalıdır: −sin(eğiklik)·cos(açı).
 * Açı 0'da Dünya Güneş'in sağındadır ve kuzey kutbu Güneş'ten uzaktır.
 */
const northTowardSun = (angleDeg: number): number =>
    -Math.sin(SEASON_TILT) * Math.cos((angleDeg * Math.PI) / 180);

/**
 * Dört özel tarih mevsimlerin ORTASI değil BAŞLANGICIDIR: 21 Aralık kış
 * gündönümü kışı başlatır, 21 Mart ilkbaharı. Bu yüzden çeyrekler açının
 * kendisiyle başlar, açının ±45° çevresiyle değil.
 */
function seasonAt(angleDeg: number): SeasonInfo {
    const a = ((angleDeg % 360) + 360) % 360;
    // 0° → kuzey kutbu Güneş'ten uzak → kuzeyde kış başlar.
    if (a < 90) return { north: 'Kış', south: 'Yaz' };
    if (a < 180) return { north: 'İlkbahar', south: 'Sonbahar' };
    if (a < 270) return { north: 'Yaz', south: 'Kış' };
    return { north: 'Sonbahar', south: 'İlkbahar' };
}

const seasonsAngle = (o: MathObject, t: number): number => {
    const pos = simValue(o, 'pos', 0);
    const playing = simValue(o, 'play', 0) > 0.5;
    return playing ? pos + t * 24 : pos;
};

function seasonsGeom(r: Rect, o: MathObject, t: number) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.52;
    const rx = r.w * 0.34;
    const ry = Math.min(r.h * 0.3, rx * 0.62);
    const angle = seasonsAngle(o, t);
    const rad = (angle * Math.PI) / 180;
    return {
        cx,
        cy,
        rx,
        ry,
        angle,
        earth: { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) },
        earthR: Math.min(r.w, r.h) * 0.075,
        sunR: Math.min(r.w, r.h) * 0.062,
    };
}

const seasonsRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = seasonsGeom(r, k.o, k.t);
    const info = seasonAt(g.angle);

    // Yörünge
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.35);
    k.c.setLineDash([7, 5]);
    k.c.beginPath();
    k.c.lineWidth = 1;
    k.c.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();

    // Güneş
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(g.cx, g.cy, g.sunR, 0, Math.PI * 2);
    k.c.stroke();
    for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        line(
            k,
            g.cx + g.sunR * 1.25 * Math.cos(a),
            g.cy + g.sunR * 1.25 * Math.sin(a),
            g.cx + g.sunR * 1.6 * Math.cos(a),
            g.cy + g.sunR * 1.6 * Math.sin(a),
            1
        );
    }

    // Güneş'ten Dünya'ya paralel ışınlar
    const dx = g.earth.x - g.cx;
    const dy = g.earth.y - g.cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    for (let i = -2; i <= 2; i++) {
        const off = i * g.earthR * 0.55;
        arrow(
            k,
            g.cx + ux * g.sunR * 1.8 + px * off,
            g.cy + uy * g.sunR * 1.8 + py * off,
            g.earth.x - ux * g.earthR * 1.15 + px * off,
            g.earth.y - uy * g.earthR * 1.15 + py * off,
            6,
            1
        );
    }
    k.c.restore();

    // Dünya: gece yarısı gölgeli, ekseni HEP aynı yöne eğik
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(g.earth.x, g.earth.y, g.earthR, 0, Math.PI * 2);
    k.c.stroke();
    const nightStart = Math.atan2(uy, ux) - Math.PI / 2;
    k.c.save();
    k.c.globalAlpha = 0.18;
    k.c.beginPath();
    k.c.moveTo(g.earth.x, g.earth.y);
    k.c.arc(g.earth.x, g.earth.y, g.earthR, nightStart, nightStart + Math.PI);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    // Eksen ve ekvator
    // Eksen birim vektörü ekranda yukarı-sağa bakar; kuzey ucu ARTI yöndedir.
    const ax = Math.sin(SEASON_TILT);
    const ay = -Math.cos(SEASON_TILT);
    const axisLen = g.earthR * 1.42;
    line(k, g.earth.x - ax * axisLen, g.earth.y - ay * axisLen, g.earth.x + ax * axisLen, g.earth.y + ay * axisLen, Math.max(1.5, k.lw));
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.55);
    line(k, g.earth.x + ay * g.earthR, g.earth.y - ax * g.earthR, g.earth.x - ay * g.earthR, g.earth.y + ax * g.earthR, 1);
    k.c.restore();
    // Kuzey kutbu işareti
    k.c.beginPath();
    k.c.arc(g.earth.x + ax * axisLen, g.earth.y + ay * axisLen, Math.max(2, g.earthR * 0.16), 0, Math.PI * 2);
    k.c.fill();

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    label(k, 'K', g.earth.x + ax * axisLen * 1.3, g.earth.y + ay * axisLen * 1.3, 'center', 'middle', 0.75);

    // Tarih yalnızca dört özel noktanın yakınında yazılır; aksi halde
    // "21 Mart" etiketi bütün bir çeyreğe yayılıp eksen notuyla çelişiyordu.
    const deg = ((g.angle % 360) + 360) % 360;
    const nearest = (Math.round(deg / 90) * 90) % 360;
    const atCardinal = Math.abs(deg - Math.round(deg / 90) * 90) <= 12;
    const towardSun = northTowardSun(deg);
    const pole = atCardinal ? 'Kuzey kutbu' : 'Kuzey yarım küre';
    const tiltNote =
        towardSun > 0.12
            ? `${pole} Güneş’e dönük`
            : towardSun < -0.12
            ? `${pole} Güneş’ten uzak`
            : 'Işınlar ekvatora dik';
    label(
        k,
        atCardinal ? `${SEASON_DATES[nearest]} · ${tiltNote}` : tiltNote,
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.78
    );
    label(k, `Kuzey: ${info.north}`, r.x, r.y + r.h, 'left', 'bottom', 0.9);
    label(k, `Güney: ${info.south}`, r.x + r.w, r.y + r.h, 'right', 'bottom', 0.9);
    k.c.restore();
};

const seasonsSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o) => {
        const playing = simValue(o, 'play', 0) > 0.5;
        const play: SimControl = {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: playing ? 'Döndürmeyi duraklat' : 'Yörüngede döndür',
            on: playing,
        };
        // Dönerken Dünya'nın yeri her karede değişir; tutamak ise kayıtlı
        // konuma göre hesaplandığından ikisi ayrışır. Bu yüzden sürükleme
        // tutamağı yalnızca duraklatılmışken gösterilir.
        if (playing) return [play];
        const g = seasonsGeom(r, o, 0);
        return [
            { id: 'earth', x: g.earth.x, y: g.earth.y, type: 'drag', label: 'Dünya’yı yörüngede sürükle' },
            play,
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        const g = seasonsGeom(r, o, 0);
        // Elips üzerinde açıyı bul: eksenlere bölerek daireye indirge.
        const deg = (Math.atan2((p.y - g.cy) / g.ry, (p.x - g.cx) / g.rx) * 180) / Math.PI;
        return { pos: ((deg % 360) + 360) % 360 };
    },
    params: [{ key: 'pos', label: 'Yörünge konumu', min: 0, max: 359, step: 1, unit: '°' }],
};

// ── Punnett karesi (DNA ve Genetik Kod) ──────────────────────────────

/** 0 = baskın (A), 1 = çekinik (a). Cinsiyet kipinde 0 = X, 1 = Y. */
function punnettAlleles(o: MathObject) {
    const sex = simValue(o, 'mode', 0) > 0.5;
    const letter = (o.text?.trim() || 'A').charAt(0);
    const sym = (v: number, isMother: boolean) => {
        if (!sex) return v > 0.5 ? letter.toLowerCase() : letter.toUpperCase();
        // Anne yalnızca X taşır; baba X veya Y.
        if (isMother) return 'X';
        return v > 0.5 ? 'Y' : 'X';
    };
    return {
        sex,
        letter,
        p1: [sym(simValue(o, 'p1a', 0), false), sym(simValue(o, 'p1b', 1), false)],
        p2: [sym(simValue(o, 'p2a', 0), true), sym(simValue(o, 'p2b', 1), true)],
    };
}

function punnettGeom(r: Rect) {
    const pad = Math.min(r.w, r.h) * 0.02;
    const size = Math.min(r.w - pad * 2, (r.h - pad * 2) * 0.78);
    const cell = size / 3;
    const x0 = r.x + (r.w - size) / 2;
    const y0 = r.y + pad;
    return { x0, y0, cell, size };
}

const punnettRender: Renderer = (k) => {
    const r = k.r;
    const { sex, p1, p2 } = punnettAlleles(k.o);
    const g = punnettGeom(r);
    const { x0, y0, cell } = g;

    k.c.lineWidth = k.lw;
    // 2×2 tablo (ilk satır/sütun ebeveyn gametleri)
    for (let i = 1; i <= 3; i++) {
        line(k, x0 + cell, y0 + i * cell - cell + cell, x0 + 3 * cell, y0 + i * cell - cell + cell, i === 1 ? k.lw : 1);
    }
    k.c.strokeRect(x0 + cell, y0 + cell, cell * 2, cell * 2);
    line(k, x0 + cell * 2, y0 + cell, x0 + cell * 2, y0 + cell * 3);
    line(k, x0 + cell, y0 + cell * 2, x0 + cell * 3, y0 + cell * 2);

    const fs = cell * 0.42;
    const put = (text: string, cxp: number, cyp: number, weight = 700) => {
        k.c.save();
        k.c.font = `${weight} ${Math.round(fs)}px ui-sans-serif, system-ui, Arial`;
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        k.c.fillText(text, cxp, cyp);
        k.c.restore();
    };

    // Ebeveyn gametleri
    p1.forEach((a, i) => put(a, x0 + cell * (1.5 + i), y0 + cell * 0.5));
    p2.forEach((a, i) => put(a, x0 + cell * 0.5, y0 + cell * (1.5 + i)));

    // Yavru genotipleri
    const kids: string[] = [];
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            // Büyük harf önce yazılır (Aa, aa gibi)
            const pair = [p1[col], p2[row]].sort((a, b) => {
                const rank = (c: string) => (c === c.toUpperCase() ? 0 : 1);
                return rank(a) - rank(b) || a.localeCompare(b);
            });
            const geno = pair.join('');
            kids.push(geno);
            put(geno, x0 + cell * (1.5 + col), y0 + cell * (1.5 + row), 600);
        }
    }

    if (k.o.labels === false) return;
    let summary: string;
    if (sex) {
        const girls = kids.filter((g2) => g2 === 'XX').length;
        summary = `%${(girls / 4) * 100} kız (XX) · %${((4 - girls) / 4) * 100} erkek (XY)`;
    } else {
        const dominant = kids.filter((g2) => /[A-ZĞÜŞİÖÇ]/.test(g2)).length;
        summary = `${dominant}:${4 - dominant} · %${(dominant / 4) * 100} baskın · %${
            ((4 - dominant) / 4) * 100
        } çekinik`;
    }
    label(k, sex ? 'Cinsiyetin belirlenmesi' : 'Çaprazlama', r.x + r.w / 2, r.y + r.h - k.fs * 1.5, 'center', 'middle', 0.8);
    label(k, summary, r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.92);
};

const punnettSpec: SimSpec = {
    controls: (r, o) => {
        const g = punnettGeom(r);
        const sex = simValue(o, 'mode', 0) > 0.5;
        const list = [
            { id: 'p1a', x: g.x0 + g.cell * 1.5, y: g.y0 + g.cell * 0.12 },
            { id: 'p1b', x: g.x0 + g.cell * 2.5, y: g.y0 + g.cell * 0.12 },
            { id: 'p2a', x: g.x0 + g.cell * 0.12, y: g.y0 + g.cell * 1.5 },
            { id: 'p2b', x: g.x0 + g.cell * 0.12, y: g.y0 + g.cell * 2.5 },
        ];
        return list
            // Cinsiyet kipinde anne hep XX olduğundan onun alelleri kilitli.
            .filter((c) => !sex || c.id.startsWith('p1'))
            .map((c) => ({
                ...c,
                type: 'toggle' as const,
                label: 'Aleli değiştir',
                on: simValue(o, c.id, c.id.endsWith('b') ? 1 : 0) > 0.5,
            }));
    },
    onControl: (r, o, id): Record<string, number> => {
        const current = simValue(o, id, id.endsWith('b') ? 1 : 0);
        return { [id]: current > 0.5 ? 0 : 1 };
    },
    params: [{ key: 'mode', label: 'Kip (0 kalıtım / 1 cinsiyet)', min: 0, max: 1, step: 1 }],
};

// ── Sıvı basıncı (Basınç) ────────────────────────────────────────────
//
// P = h · d · g  →  basınç yalnızca derinliğe ve sıvının yoğunluğuna bağlı.
// Fışkırma menzili çıkış hızıyla orantılıdır (v = √(2gh)), yani derindeki
// delikten çıkan su daha uzağa gider.

const G = 10;

function liquidGeom(r: Rect, o: MathObject) {
    const pad = Math.min(r.w, r.h) * 0.08;
    const tankW = r.w * 0.34;
    const tankX = r.x + pad;
    const tankTop = r.y + pad;
    const tankBottom = r.y + r.h - pad * 1.4;
    const fillPct = clamp(simValue(o, 'h', 80), 10, 100) / 100;
    const surface = tankBottom - (tankBottom - tankTop) * fillPct;
    // Delikler tankın altından yukarı doğru üç seviyede.
    const holes = [0.18, 0.45, 0.72].map((f) => tankBottom - (tankBottom - tankTop) * f);
    return { tankX, tankW, tankTop, tankBottom, surface, holes, fillPct };
}

const liquidRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = liquidGeom(r, k.o);
    const density = clamp(simValue(k.o, 'd', 1), 0.5, 2.5);
    // 1 birim yükseklik = kaç cm sayılsın (etiketler anlamlı çıksın diye)
    const unit = 40 / (g.tankBottom - g.tankTop);

    k.c.lineWidth = k.lw;
    // Kap (üstü açık)
    line(k, g.tankX, g.tankTop, g.tankX, g.tankBottom);
    line(k, g.tankX + g.tankW, g.tankTop, g.tankX + g.tankW, g.tankBottom);
    line(k, g.tankX, g.tankBottom, g.tankX + g.tankW, g.tankBottom);

    // Sıvı
    fillShape(k, () => k.c.rect(g.tankX, g.surface, g.tankW, g.tankBottom - g.surface), 0.2);
    line(k, g.tankX, g.surface, g.tankX + g.tankW, g.surface, Math.max(1, k.lw));

    const ground = g.tankBottom;
    g.holes.forEach((hy, i) => {
        if (hy < g.surface) {
            // Sıvı seviyesinin üstündeki delikten su akmaz.
            line(k, g.tankX + g.tankW - 3, hy, g.tankX + g.tankW + 3, hy, 1);
            return;
        }
        const depth = (hy - g.surface) * unit; // cm
        const pressure = depth * density * G; // ~Pa ölçeğinde göreli değer
        const speed = Math.sqrt(Math.max(0, 2 * G * depth));
        // Menzil: yatay hız × düşme süresi
        const fallH = (ground - hy) * unit;
        const range = speed * Math.sqrt((2 * Math.max(fallH, 0.1)) / G);
        const rangePx = (range / unit) * 0.9;

        // Fışkıran su: eğik atış eğrisi
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.75);
        k.c.beginPath();
        k.c.lineWidth = Math.max(1.4, k.lw);
        const x0 = g.tankX + g.tankW;
        for (let s = 0; s <= 24; s++) {
            const tt = s / 24;
            const x = x0 + rangePx * tt;
            const y = hy + (ground - hy) * tt * tt;
            if (s === 0) k.c.moveTo(x, y);
            else k.c.lineTo(x, y);
        }
        k.c.stroke();
        // Akan damlalar
        const phase = (k.t * 0.7 + i * 0.33) % 1;
        const dx2 = x0 + rangePx * phase;
        const dy2 = hy + (ground - hy) * phase * phase;
        k.c.beginPath();
        k.c.arc(dx2, dy2, Math.max(2, k.lw * 1.3), 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();

        if (k.o.labels !== false) {
            // Etiket kutunun sağ kenarını aşarsa sağa yaslanıp içeride kalır.
            // Genişlik tahmin edilmez, gerçek metin ölçülür — yoksa uzun
            // değerlerde (P=140 gibi) son karakter kırpılıyordu.
            const text = `h=${depth.toFixed(0)} · P=${Math.round(pressure)}`;
            const wanted = x0 + rangePx + 6;
            const maxX = r.x + r.w - 4;
            const inside = wanted + textWidth(k, text, 0.68) < maxX;
            label(
                k,
                text,
                inside ? wanted : maxX,
                hy - k.fs * 0.35,
                inside ? 'left' : 'right',
                'middle',
                0.68
            );
        }
    });

    line(k, r.x, ground, r.x + r.w, ground, 1);

    if (k.o.labels !== false) {
        label(k, `P = h · d · g   (d = ${density.toFixed(1)} g/cm³)`, r.x, r.y, 'left', 'top', 0.8);
        label(k, 'Derindeki delik daha uzağa fışkırır', r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.8);
    }
    k.c.restore();
};

const liquidSpec: SimSpec = {
    animated: true,
    controls: (r, o) => {
        const g = liquidGeom(r, o);
        return [
            {
                id: 'level',
                x: g.tankX + g.tankW / 2,
                y: g.surface,
                type: 'drag',
                label: 'Sıvı seviyesini sürükle',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const g = liquidGeom(r, o);
        const pct = ((g.tankBottom - p.y) / (g.tankBottom - g.tankTop)) * 100;
        return { h: clamp(pct, 10, 100) };
    },
    params: [
        { key: 'h', label: 'Sıvı yüksekliği', min: 10, max: 100, step: 1, unit: '%' },
        { key: 'd', label: 'Yoğunluk', min: 0.5, max: 2.5, step: 0.1, unit: 'g/cm³' },
    ],
};

// ── Katı basıncı (Basınç) ────────────────────────────────────────────
//
// P = F / A → aynı cisim, temas yüzeyi küçüldükçe zemine daha çok batar.

/** Blok ayrıtları (birim). Yüz seçimi hangi ikisinin zemine değdiğini belirler. */
const BLOCK = { a: 2, b: 3, c: 4 };
const BLOCK_FACES: Array<{ w: number; d: number; label: string }> = [
    { w: BLOCK.b, d: BLOCK.c, label: '3 × 4' },
    { w: BLOCK.a, d: BLOCK.c, label: '2 × 4' },
    { w: BLOCK.a, d: BLOCK.b, label: '2 × 3' },
];

const solidRender: Renderer = (k) => {
    const r = k.r;
    const faceIdx = clampInt(simValue(k.o, 'face', 0), 0, 2, 0);
    const force = clamp(simValue(k.o, 'f', 60), 10, 200);
    const face = BLOCK_FACES[faceIdx];
    const area = face.w * face.d;
    const pressure = force / area;

    const unit = Math.min(r.w * 0.1, r.h * 0.12);
    const ground = r.y + r.h * 0.68;
    const cx = r.x + r.w * 0.42;
    const boxW = face.w * unit;
    // Yüksekliği hacim sabit kalacak biçimde türet.
    const height = (BLOCK.a * BLOCK.b * BLOCK.c) / area;
    const boxH = height * unit;
    // Batma: basınçla orantılı, kutunun altına doğru.
    const sink = Math.min(r.h * 0.16, (pressure / 20) * unit * 0.9);

    k.c.lineWidth = k.lw;
    // Zemin ve batma çukuru
    line(k, r.x, ground, cx - boxW / 2, ground);
    line(k, cx + boxW / 2, ground, r.x + r.w, ground);
    line(k, cx - boxW / 2, ground, cx - boxW / 2, ground + sink);
    line(k, cx - boxW / 2, ground + sink, cx + boxW / 2, ground + sink);
    line(k, cx + boxW / 2, ground + sink, cx + boxW / 2, ground);
    for (let x = r.x; x < r.x + r.w; x += Math.max(9, r.w / 26)) {
        if (x > cx - boxW / 2 - 4 && x < cx + boxW / 2 + 4) continue;
        line(k, x, ground, x - r.w * 0.022, ground + r.h * 0.05, 1);
    }

    // Blok
    const top = ground + sink - boxH;
    k.c.strokeRect(cx - boxW / 2, top, boxW, boxH);
    const dep = unit * 0.5;
    line(k, cx - boxW / 2, top, cx - boxW / 2 + dep, top - dep);
    line(k, cx + boxW / 2, top, cx + boxW / 2 + dep, top - dep);
    line(k, cx - boxW / 2 + dep, top - dep, cx + boxW / 2 + dep, top - dep);
    line(k, cx + boxW / 2 + dep, top - dep, cx + boxW / 2 + dep, ground + sink - dep);

    // Ağırlık oku
    arrow(k, cx, top - dep - r.h * 0.14, cx, top - 4, 9, Math.max(2, k.lw * 1.2));

    if (k.o.labels === false) return;
    // İnce yüz seçilince blok uzar ve ok başlık satırlarının hizasına çıkar;
    // etiket formülün üstüne binmesin diye aşağıya sıkıştırılır.
    const forceLabelY = Math.max(r.y + k.fs * 2.5, top - dep - r.h * 0.08);
    label(k, `F = ${Math.round(force)} N`, cx + k.fs * 0.5, forceLabelY, 'left', 'middle', 0.85);
    label(k, `Temas yüzeyi: ${face.label} = ${area} br²`, r.x, r.y, 'left', 'top', 0.8);
    label(
        k,
        `P = F / A = ${Math.round(force)} / ${area} = ${pressure.toFixed(1)}`,
        r.x,
        r.y + k.fs * 1.15,
        'left',
        'top',
        0.85
    );
    label(k, 'Yüzey küçüldükçe basınç artar, cisim daha çok batar', r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.75);
};

const solidSpec: SimSpec = {
    controls: (r, o) => [
        {
            id: 'face',
            x: r.x + r.w * 0.42,
            y: r.y + r.h * 0.86,
            type: 'toggle',
            label: 'Yüzü değiştir',
            on: simValue(o, 'face', 0) > 0,
        },
    ],
    onControl: (r, o, id): Record<string, number> =>
        id === 'face' ? { face: (clampInt(simValue(o, 'face', 0), 0, 2, 0) + 1) % 3 } : {},
    params: [
        { key: 'face', label: 'Temas yüzeyi', min: 0, max: 2, step: 1 },
        { key: 'f', label: 'Ağırlık', min: 10, max: 200, step: 5, unit: 'N' },
    ],
};

// ── Kaldıraç dengesi (Basit Makineler) ───────────────────────────────
//
// Denge şartı: F1 · d1 = F2 · d2

function leverGeom(r: Rect, o: MathObject) {
    const barY = r.y + r.h * 0.44;
    const left = r.x + r.w * 0.06;
    const right = r.x + r.w * 0.94;
    const span = right - left;
    const pos = (key: string, fallback: number) =>
        left + (clamp(simValue(o, key, fallback), 0, 100) / 100) * span;
    const fulcrumX = pos('fulcrum', 50);
    const loadX = pos('loadPos', 15);
    const effortX = pos('effortPos', 85);
    const load = clamp(simValue(o, 'load', 40), 5, 200);
    const effort = clamp(simValue(o, 'effort', 40), 5, 200);
    // Birim: yüzdelik konum farkını "birim kol" say.
    const d1 = Math.abs(loadX - fulcrumX) / (span / 10);
    const d2 = Math.abs(effortX - fulcrumX) / (span / 10);
    const torqueLoad = load * d1;
    const torqueEffort = effort * d2;
    const diff = torqueEffort - torqueLoad;
    const total = Math.max(torqueLoad, torqueEffort, 1);
    const tilt = clamp(diff / total, -1, 1) * 0.2; // radyan
    return {
        barY,
        left,
        right,
        span,
        fulcrumX,
        loadX,
        effortX,
        load,
        effort,
        d1,
        d2,
        torqueLoad,
        torqueEffort,
        tilt,
        balanced: Math.abs(diff) < Math.max(1, total * 0.02),
    };
}

/** Kolun eğimi hesaba katılarak bir noktanın ekrandaki yeri. */
const onBar = (g: ReturnType<typeof leverGeom>, x: number) => ({
    x,
    y: g.barY + (x - g.fulcrumX) * Math.tan(g.tilt),
});

const leverRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    const g = leverGeom(r, k.o);
    k.c.lineWidth = k.lw;

    // Kol
    const a = onBar(g, g.left);
    const b = onBar(g, g.right);
    line(k, a.x, a.y, b.x, b.y, Math.max(2.5, k.lw * 1.6));

    // Destek
    const fh = r.h * 0.2;
    k.c.beginPath();
    k.c.moveTo(g.fulcrumX, g.barY + 2);
    k.c.lineTo(g.fulcrumX - fh * 0.5, g.barY + fh);
    k.c.lineTo(g.fulcrumX + fh * 0.5, g.barY + fh);
    k.c.closePath();
    k.c.stroke();
    line(k, g.fulcrumX - fh * 0.8, g.barY + fh, g.fulcrumX + fh * 0.8, g.barY + fh);

    // Yük (kutu) ve kuvvet (ok)
    const loadPt = onBar(g, g.loadX);
    const boxSize = Math.min(r.w, r.h) * 0.11 * Math.min(1.6, 0.6 + g.load / 100);
    k.c.strokeRect(loadPt.x - boxSize / 2, loadPt.y - boxSize, boxSize, boxSize);
    const effortPt = onBar(g, g.effortX);
    const arrowLen = r.h * 0.16 * Math.min(1.8, 0.6 + g.effort / 100);
    arrow(k, effortPt.x, effortPt.y - arrowLen, effortPt.x, effortPt.y - 3, 9, Math.max(2, k.lw * 1.2));

    const d1Text = `d₁ = ${g.d1.toFixed(1)}`;
    const d2Text = `d₂ = ${g.d2.toFixed(1)}`;
    const d1Y = g.barY + fh * 1.25;
    const d2Y = g.barY + fh * 1.6;
    const showLabels = k.o.labels !== false;

    // Kol uzunluğu çizgileri. Etiket tam çizginin üstünde durduğu için
    // çizgi metnin bulunduğu yerde kesilir — aksi halde yazının içinden geçer.
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.4);
    k.c.setLineDash([5, 4]);
    const gapped = (x1: number, x2: number, y: number, text: string) => {
        const mid = (x1 + x2) / 2;
        const half = textWidth(k, text, 0.7) / 2 + 4;
        const lo = Math.min(x1, x2);
        const hi = Math.max(x1, x2);
        if (mid - half > lo) line(k, lo, y, mid - half, y, 1);
        if (mid + half < hi) line(k, mid + half, y, hi, y, 1);
    };
    if (showLabels) {
        gapped(g.fulcrumX, loadPt.x, d1Y, d1Text);
        gapped(g.fulcrumX, effortPt.x, d2Y, d2Text);
    } else {
        line(k, g.fulcrumX, d1Y, loadPt.x, d1Y, 1);
        line(k, g.fulcrumX, d2Y, effortPt.x, d2Y, 1);
    }
    k.c.restore();

    if (!showLabels) {
        k.c.restore();
        return;
    }
    label(k, `${Math.round(g.load)} N`, loadPt.x, loadPt.y - boxSize - k.fs * 0.5, 'center', 'middle', 0.8);
    label(k, `${Math.round(g.effort)} N`, effortPt.x, effortPt.y - arrowLen - k.fs * 0.5, 'center', 'middle', 0.8);
    label(k, d1Text, (g.fulcrumX + loadPt.x) / 2, d1Y, 'center', 'middle', 0.7);
    label(k, d2Text, (g.fulcrumX + effortPt.x) / 2, d2Y, 'center', 'middle', 0.7);
    label(
        k,
        `F₁·d₁ = ${g.torqueLoad.toFixed(0)}   |   F₂·d₂ = ${g.torqueEffort.toFixed(0)}`,
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.8
    );
    label(
        k,
        g.balanced ? 'DENGEDE' : g.torqueEffort > g.torqueLoad ? 'Kuvvet tarafı ağır basıyor' : 'Yük tarafı ağır basıyor',
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.9
    );
    k.c.restore();
};

const leverSpec: SimSpec = {
    controls: (r, o) => {
        const g = leverGeom(r, o);
        return [
            { id: 'fulcrum', x: g.fulcrumX, y: g.barY + r.h * 0.2, type: 'drag', label: 'Destek noktası' },
            { id: 'loadPos', x: onBar(g, g.loadX).x, y: onBar(g, g.loadX).y, type: 'drag', label: 'Yükü kaydır' },
            { id: 'effortPos', x: onBar(g, g.effortX).x, y: onBar(g, g.effortX).y, type: 'drag', label: 'Kuvveti kaydır' },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const g = leverGeom(r, o);
        const pct = clamp(((p.x - g.left) / g.span) * 100, 0, 100);
        return { [id]: pct };
    },
    params: [
        { key: 'load', label: 'Yük (F₁)', min: 5, max: 200, step: 5, unit: 'N' },
        { key: 'effort', label: 'Kuvvet (F₂)', min: 5, max: 200, step: 5, unit: 'N' },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const SIM_RENDERERS: Partial<Record<MathObjectKind, Renderer>> = {
    optics_bench: opticsRender,
    circuit_sim: circuitRender,
    matter_sim: matterRender,
    seasons_sim: seasonsRender,
    punnett_sim: punnettRender,
    liquid_pressure_sim: liquidRender,
    solid_pressure_sim: solidRender,
    lever_sim: leverRender,
};

export const SIM_SPECS: Partial<Record<MathObjectKind, SimSpec>> = {
    optics_bench: opticsSpec,
    circuit_sim: circuitSpec,
    matter_sim: matterSpec,
    seasons_sim: seasonsSpec,
    punnett_sim: punnettSpec,
    liquid_pressure_sim: liquidSpec,
    solid_pressure_sim: solidSpec,
    lever_sim: leverSpec,
};

export const SIM_CATEGORIES: ReadonlyArray<ObjectCategory> = [
    {
        label: 'Canlı Simülasyonlar',
        items: [
            {
                kind: 'optics_bench',
                label: 'Optik Düzeneği',
                hint: 'Cismi sürükle, görüntü canlı oluşsun',
                size: { w: 460, h: 300 },
                defaults: { labels: true, sim: { f: 4, a: 7, h: 2 } },
            },
            {
                kind: 'circuit_sim',
                label: 'Canlı Devre',
                hint: 'Anahtarı aç-kapa, ampulü patlat, parlaklığı gör',
                size: { w: 420, h: 280 },
                defaults: { labels: true, sim: { parallel: 0, n: 2, v: 1, sw: 1 } },
            },
            {
                kind: 'matter_sim',
                label: 'Maddenin Halleri',
                hint: 'Sıcaklığı değiştir, tanecikleri izle',
                size: { w: 380, h: 280 },
                defaults: { labels: true, sim: { temp: 20 } },
            },
        ],
    },
    {
        label: '8. Sınıf',
        items: [
            {
                kind: 'seasons_sim',
                label: 'Mevsimlerin Oluşumu',
                hint: 'Dünya’yı yörüngede sürükle; eksen eğikliği ve mevsim',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { pos: 0, play: 1 } },
            },
            {
                kind: 'punnett_sim',
                label: 'Punnett Karesi',
                hint: 'Ebeveyn alellerini seç, oranları gör',
                size: { w: 320, h: 340 },
                defaults: { labels: true, text: 'A', sim: { p1a: 0, p1b: 1, p2a: 0, p2b: 1, mode: 0 } },
                fields: [{ key: 'text', label: 'Karakter harfi', type: 'text' }],
            },
            {
                kind: 'liquid_pressure_sim',
                label: 'Sıvı Basıncı',
                hint: 'Derinlik arttıkça su daha uzağa fışkırır',
                size: { w: 460, h: 300 },
                defaults: { labels: true, sim: { h: 80, d: 1 } },
            },
            {
                kind: 'solid_pressure_sim',
                label: 'Katı Basıncı',
                hint: 'Yüzü değiştir, batma derinliği değişsin',
                size: { w: 420, h: 300 },
                defaults: { labels: true, sim: { face: 0, f: 60 } },
            },
            {
                kind: 'lever_sim',
                label: 'Kaldıraç Dengesi',
                hint: 'Destek, yük ve kuvveti kaydır; F₁·d₁ = F₂·d₂',
                size: { w: 480, h: 300 },
                defaults: { labels: true, sim: { fulcrum: 50, loadPos: 15, effortPos: 85, load: 40, effort: 40 } },
            },
        ],
    },
];
