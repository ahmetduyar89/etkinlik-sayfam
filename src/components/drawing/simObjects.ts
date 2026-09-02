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
    label,
    line,
    simValue,
    withAlpha,
    type Ctx,
    type ObjectCategory,
    type Rect,
    type Renderer,
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

import { GRADE8_ITEMS, GRADE8_RENDERERS, GRADE8_SPECS } from './grade8Sims';
import { MATH_SIM_ITEMS, MATH_SIM_RENDERERS, MATH_SIM_SPECS } from './mathSims';
import { SCIENCE_SIM_ITEMS, SCIENCE_SIM_RENDERERS, SCIENCE_SIM_SPECS } from './scienceSims';

// ── Kayıt ────────────────────────────────────────────────────────────

export const SIM_RENDERERS: Partial<Record<MathObjectKind, Renderer>> = {
    optics_bench: opticsRender,
    circuit_sim: circuitRender,
    matter_sim: matterRender,
    ...(GRADE8_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(MATH_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(SCIENCE_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
};

export const SIM_SPECS: Partial<Record<MathObjectKind, SimSpec>> = {
    optics_bench: opticsSpec,
    circuit_sim: circuitSpec,
    matter_sim: matterSpec,
    ...(GRADE8_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(MATH_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(SCIENCE_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
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
    { label: '8. Sınıf', items: GRADE8_ITEMS },
    { label: 'Canlı Matematik', items: MATH_SIM_ITEMS },
    { label: 'Etkileşimli Fen', items: SCIENCE_SIM_ITEMS },
];
