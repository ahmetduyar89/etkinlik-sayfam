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

// ── Işık Kırılması & Tam Yansıma ──────────────────────────────────────

interface RefractionGeom {
    cx: number;
    cy: number;
    rRay: number;
    theta1Deg: number;
    theta1Rad: number;
    n1: number;
    n2: number;
    isTir: boolean;
    thetaCritDeg: number;
    theta2Rad: number;
    theta2Deg: number;
    laserX: number;
    laserY: number;
    reflX: number;
    reflY: number;
    refrX: number;
    refrY: number;
}

function refractionGeom(r: Rect, o: MathObject): RefractionGeom {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const rRay = Math.min(r.w * 0.42, r.h * 0.42);
    const theta1Deg = clamp(simValue(o, 'theta1', 45), 0, 85);
    const theta1Rad = (theta1Deg * Math.PI) / 180;
    const n1 = clamp(simValue(o, 'n1', 1.5), 1.0, 2.5);
    const n2 = clamp(simValue(o, 'n2', 1.0), 1.0, 2.5);

    const laserX = cx - rRay * Math.sin(theta1Rad);
    const laserY = cy - rRay * Math.cos(theta1Rad);
    const reflX = cx + rRay * Math.sin(theta1Rad);
    const reflY = cy - rRay * Math.cos(theta1Rad);

    const sinTh2 = (n1 / n2) * Math.sin(theta1Rad);
    const isTir = sinTh2 > 1.0;
    const thetaCritDeg = n1 > n2 ? Math.asin(n2 / n1) * (180 / Math.PI) : 90;

    let theta2Rad = 0;
    let theta2Deg = 0;
    let refrX = cx;
    let refrY = cy + rRay;

    if (!isTir) {
        theta2Rad = Math.asin(sinTh2);
        theta2Deg = (theta2Rad * 180) / Math.PI;
        refrX = cx + rRay * Math.sin(theta2Rad);
        refrY = cy + rRay * Math.cos(theta2Rad);
    }

    return {
        cx,
        cy,
        rRay,
        theta1Deg,
        theta1Rad,
        n1,
        n2,
        isTir,
        thetaCritDeg,
        theta2Rad,
        theta2Deg,
        laserX,
        laserY,
        reflX,
        reflY,
        refrX,
        refrY,
    };
}

const refractionRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = refractionGeom(r, k.o);
    const { cx, cy } = g;

    // 2. Ortam arka planı
    k.c.save();
    k.c.fillStyle = withAlpha('#0284c7', Math.min(0.24, (g.n2 - 0.9) * 0.16));
    k.c.fillRect(r.x, cy, r.w, r.y + r.h - cy);
    k.c.restore();

    // Sınır yüzeyi
    line(k, r.x, cy, r.x + r.w, cy, Math.max(1.5, k.lw));

    // Normal çizgisi
    k.c.save();
    k.c.setLineDash([5, 4]);
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    line(k, cx, r.y + 10, cx, r.y + r.h - 10, 1);
    k.c.restore();

    label(k, 'Normal (N)', cx + 6, r.y + 16, 'left', 'top', 0.65);
    label(k, `1. Ortam (n₁ = ${g.n1.toFixed(2)})`, r.x + 12, cy - 14, 'left', 'bottom', 0.72);
    label(k, `2. Ortam (n₂ = ${g.n2.toFixed(2)})`, r.x + 12, cy + 14, 'left', 'top', 0.72);

    // Gelen ışın
    k.c.save();
    k.c.strokeStyle = '#ef4444';
    k.c.lineWidth = Math.max(2.5, k.lw * 1.4);
    line(k, g.laserX, g.laserY, cx, cy, k.c.lineWidth);

    // Lazer başlığı
    k.c.fillStyle = '#dc2626';
    k.c.beginPath();
    k.c.arc(g.laserX, g.laserY, 7, 0, Math.PI * 2);
    k.c.fill();
    k.c.restore();

    // Geliş açısı yayı
    k.c.save();
    k.c.beginPath();
    k.c.strokeStyle = withAlpha('#ef4444', 0.8);
    k.c.lineWidth = 1.5;
    k.c.arc(cx, cy, 32, -Math.PI / 2 - g.theta1Rad, -Math.PI / 2);
    k.c.stroke();
    label(k, `θ₁ = ${Math.round(g.theta1Deg)}°`, cx - 22, cy - 36, 'right', 'bottom', 0.72);
    k.c.restore();

    // Yansıyan ışın
    k.c.save();
    const reflAlpha = g.isTir ? 1.0 : 0.35;
    k.c.strokeStyle = withAlpha('#ef4444', reflAlpha);
    k.c.lineWidth = g.isTir ? Math.max(2.5, k.lw * 1.4) : 1.5;
    line(k, cx, cy, g.reflX, g.reflY, k.c.lineWidth);
    k.c.restore();

    if (g.isTir) {
        k.c.save();
        k.c.fillStyle = '#f59e0b';
        label(
            k,
            `⚡ TAM YANSIMA (θ₁ = ${Math.round(g.theta1Deg)}° > θ_c = ${Math.round(g.thetaCritDeg)}°)`,
            cx,
            cy + 26,
            'center',
            'top',
            0.82
        );
        label(k, 'Işın 2. ortama geçemez, %100 geri yansır', cx, cy + 46, 'center', 'top', 0.68);
        k.c.restore();
    } else {
        k.c.save();
        k.c.strokeStyle = '#ef4444';
        k.c.lineWidth = Math.max(2.2, k.lw * 1.2);
        line(k, cx, cy, g.refrX, g.refrY, k.c.lineWidth);

        k.c.beginPath();
        k.c.strokeStyle = withAlpha('#0284c7', 0.85);
        k.c.lineWidth = 1.5;
        k.c.arc(cx, cy, 34, Math.PI / 2 - g.theta2Rad, Math.PI / 2);
        k.c.stroke();
        label(k, `θ₂ = ${Math.round(g.theta2Deg)}°`, cx + 22, cy + 36, 'left', 'top', 0.72);
        k.c.restore();

        if (g.n1 > g.n2) {
            label(k, `Sınır Açısı: θ_c = ${Math.round(g.thetaCritDeg)}°`, cx, r.y + r.h - 12, 'center', 'bottom', 0.7);
        }
    }

    // Lazer foton akışı animasyonu
    const dotPhase = (k.t * 65) % 24;
    k.c.save();
    k.c.fillStyle = '#fef08a';
    for (let d = dotPhase; d < g.rRay; d += 24) {
        const t = d / g.rRay;
        const px = g.laserX + (cx - g.laserX) * t;
        const py = g.laserY + (cy - g.laserY) * t;
        k.c.beginPath();
        k.c.arc(px, py, 2, 0, Math.PI * 2);
        k.c.fill();
    }
    k.c.restore();

    k.c.restore();
};

const refractionSpec: SimSpec = {
    animated: true,
    controls: (r, o) => {
        const g = refractionGeom(r, o);
        return [
            {
                id: 'laser',
                x: g.laserX,
                y: g.laserY,
                type: 'drag',
                label: 'Lazer açısını sürükle',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'laser') {
            const cx = r.x + r.w / 2;
            const cy = r.y + r.h / 2;
            const dx = cx - p.x;
            const dy = cy - p.y;
            if (dy <= 0) return { theta1: 85 };
            const deg = Math.round((Math.atan2(dx, dy) * 180) / Math.PI);
            return { theta1: clamp(deg, 0, 85) };
        }
        return {};
    },
    params: [
        { key: 'theta1', label: 'Geliş açısı (θ₁)', min: 0, max: 85, step: 1, unit: '°' },
        { key: 'n1', label: '1. Ortam (n₁)', min: 1.0, max: 2.4, step: 0.1 },
        { key: 'n2', label: '2. Ortam (n₂)', min: 1.0, max: 2.4, step: 0.1 },
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
    bulbs: Array<{ x: number; y: number }>;
    switchAt: { x: number; y: number };
    s: number;
    brightness: number[];
    res: number;
    volts: number;
    current: number;
}

function circuitGeom(rect: Rect, o: MathObject): CircuitGeom {
    const pad = Math.min(rect.w, rect.h) * 0.14;
    const r: Rect = { x: rect.x + pad, y: rect.y + pad, w: rect.w - pad * 2, h: rect.h - pad * 2 };
    const parallel = simValue(o, 'parallel', 0) > 0.5;
    const count = clampInt(simValue(o, 'n', 2), 1, 3, 2);
    const closed = simValue(o, 'sw', 1) > 0.5;
    const cells = clampInt(simValue(o, 'v', 2), 1, 4, 2);
    const broken = [0, 1, 2].map((i) => (simValue(o, `b${i}`, 0) > 0.5 ? 1 : 0));
    const s = Math.min(r.w / (count + 2), r.h) * 0.3;
    const res = clampInt(simValue(o, 'res', 10), 1, 50, 10);
    const volts = cells * 3;

    const bulbs: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
        const x = r.x + (r.w * (i + 1)) / (count + 1);
        bulbs.push({ x, y: parallel ? r.y + r.h / 2 : r.y });
    }
    const switchAt = { x: r.x + r.w * 0.72, y: r.y + r.h };

    const rTotal = parallel ? res + 6 / count : res + count * 6;
    const current = closed ? volts / rTotal : 0;

    const brightness = bulbs.map((_, i) => {
        if (!closed) return 0;
        if (parallel) return broken[i] ? 0 : Math.min(1, (current * 4) / 1);
        const anyBroken = broken.slice(0, count).some(Boolean);
        if (anyBroken) return 0;
        return Math.min(1, (current * 4) / count);
    });
    return { r, parallel, count, closed, cells, broken, bulbs, switchAt, s, brightness, res, volts, current };
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
    const batX = g.parallel ? left : left + r.w * 0.45;

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

    // Ampermetre (alt telde, sol tarafta)
    const ammeterX = left + r.w * 0.18;

    // Direnç (sağ dikey telde)
    const resY = (top + bottom) / 2;
    const resH = s * 1.3;
    const resW = s * 0.6;

    if (g.parallel) {
        line(k, left, top, right, top);
        line(k, left, bottom, right, bottom);
        // Sağ telde direnç
        line(k, right, top, right, resY - resH / 2);
        line(k, right, resY + resH / 2, right, bottom);
        k.c.strokeRect(right - resW / 2, resY - resH / 2, resW, resH);
        label(k, `${g.res} Ω`, right + resW / 2 + 4, resY, 'left', 'middle', 0.65);

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
                k.t * (30 + g.current * 40),
                g.brightness[i] > 0
            );
        });
        hWire(left, right, bottom, [
            [g.switchAt.x - s * 1.2, g.switchAt.x + s * 1.2],
            [ammeterX - s * 0.7, ammeterX + s * 0.7],
        ]);
    } else {
        line(k, left, top, left, bottom);
        // Sağ dikey telde direnç kutusu
        line(k, right, top, right, resY - resH / 2);
        line(k, right, resY + resH / 2, right, bottom);
        k.c.strokeRect(right - resW / 2, resY - resH / 2, resW, resH);
        label(k, `${g.res} Ω`, right + resW / 2 + 4, resY, 'left', 'middle', 0.65);

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
            [ammeterX - s * 0.7, ammeterX + s * 0.7],
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
            k.t * (30 + g.current * 40),
            g.brightness[0] > 0
        );
    }

    // Ampermetre çizimi
    k.c.save();
    k.c.beginPath();
    k.c.arc(ammeterX, bottom, s * 0.5, 0, Math.PI * 2);
    k.c.stroke();
    label(k, 'A', ammeterX, bottom, 'center', 'middle', 0.75);
    label(k, `${g.current.toFixed(2)} A`, ammeterX, bottom - s * 0.7, 'center', 'bottom', 0.7);
    k.c.restore();

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
        ? 'Anahtar AÇIK — Devreden akım geçmiyor (I = 0.00 A)'
        : `V = ${g.volts} V · R = ${g.res} Ω · Akım: ${g.current.toFixed(2)} A (Ohm Kanunu: I = V/R)`;
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
                label: 'Anahtar (Aç/Kapat)',
                on: g.closed,
            },
            ...g.bulbs.map((b, i) => ({
                id: `b${i}`,
                x: b.x,
                y: b.y - g.s * 1.1,
                type: 'toggle' as const,
                label: 'Ampulü patlat / onar',
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
        { key: 'v', label: 'Pil sayısı (V)', min: 1, max: 4, step: 1, unit: 'pil' },
        { key: 'res', label: 'Direnç (R)', min: 1, max: 50, step: 1, unit: 'Ω' },
        { key: 'parallel', label: 'Bağlantı (0 seri / 1 paralel)', min: 0, max: 1, step: 1 },
        { key: 'n', label: 'Ampul sayısı', min: 1, max: 3, step: 1 },
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
import { BIO_SIM_ITEMS, BIO_SIM_RENDERERS, BIO_SIM_SPECS } from './bioSims';
import { CHEMISTRY_SIM_ITEMS, CHEMISTRY_SIM_RENDERERS, CHEMISTRY_SIM_SPECS } from './chemistrySims';
import { GEOMETRY_SIM_ITEMS, GEOMETRY_SIM_RENDERERS, GEOMETRY_SIM_SPECS } from './geometrySims';
import { MEASURE_SIM_ITEMS, MEASURE_SIM_RENDERERS, MEASURE_SIM_SPECS } from './measureSim';
import { NUMBER_SIM_ITEMS, NUMBER_SIM_RENDERERS, NUMBER_SIM_SPECS } from './numberSims';
import { PHYSICS_SIM_ITEMS, PHYSICS_SIM_RENDERERS, PHYSICS_SIM_SPECS } from './physicsSims';
import { SORTING_SIM_ITEMS, SORTING_SIM_RENDERERS, SORTING_SIM_SPECS } from './sortingSim';
import { TASK_SIM_ITEMS, TASK_SIM_RENDERERS, TASK_SIM_SPECS } from './taskSims';
import { MATH_SIM_ITEMS, MATH_SIM_RENDERERS, MATH_SIM_SPECS } from './mathSims';
import { SCIENCE_SIM_ITEMS, SCIENCE_SIM_RENDERERS, SCIENCE_SIM_SPECS } from './scienceSims';

// ── Kayıt ────────────────────────────────────────────────────────────

export const SIM_RENDERERS: Partial<Record<MathObjectKind, Renderer>> = {
    optics_bench: opticsRender,
    refraction_sim: refractionRender,
    circuit_sim: circuitRender,
    matter_sim: matterRender,
    ...(GRADE8_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(MATH_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(GEOMETRY_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(NUMBER_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(PHYSICS_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(CHEMISTRY_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(BIO_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(SORTING_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(TASK_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(MEASURE_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
    ...(SCIENCE_SIM_RENDERERS as Partial<Record<MathObjectKind, Renderer>>),
};

export const SIM_SPECS: Partial<Record<MathObjectKind, SimSpec>> = {
    optics_bench: opticsSpec,
    refraction_sim: refractionSpec,
    circuit_sim: circuitSpec,
    matter_sim: matterSpec,
    ...(GRADE8_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(MATH_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(GEOMETRY_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(NUMBER_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(PHYSICS_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(CHEMISTRY_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(BIO_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(SORTING_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(TASK_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(MEASURE_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
    ...(SCIENCE_SIM_SPECS as Partial<Record<MathObjectKind, SimSpec>>),
};

export const SIM_CATEGORIES: ReadonlyArray<ObjectCategory> = [
    {
        label: 'Canlı Simülasyonlar',
        items: [
            {
                kind: 'circuit_sim',
                label: 'Canlı Devre (Mini PhET)',
                hint: 'Pil, lamba, anahtar ve direnç; Ohm kanununu canlı izle',
                size: { w: 440, h: 300 },
                defaults: { labels: true, sim: { parallel: 0, n: 2, v: 2, sw: 1, res: 10 } },
            },
            {
                kind: 'refraction_sim',
                label: 'Işık Kırılması & Tam Yansıma',
                hint: 'Lazer açısını sürükle; Snell yasası, sınır açısı ve tam yansıma',
                size: { w: 460, h: 320 },
                defaults: { labels: true, sim: { theta1: 45, n1: 1.5, n2: 1.0 } },
            },
            {
                kind: 'lever_sim',
                label: 'Kaldıraç Dengesi',
                hint: 'Destek, yük ve kuvveti kaydır; F₁·d₁ = F₂·d₂ tork eşitliği',
                size: { w: 480, h: 300 },
                defaults: {
                    labels: true,
                    sim: { fulcrum: 50, loadPos: 15, effortPos: 85, load: 40, effort: 40 },
                },
            },
            {
                kind: 'ph_sim',
                label: 'Asit – Baz ve pH',
                hint: 'Turnusol kağıdını daldır, nötrleşmeyi ve renk değişimini gör',
                size: { w: 500, h: 300 },
                defaults: { labels: true, sim: { acid: 40, base: 40, k: 3 } },
            },
            {
                kind: 'division_sim',
                label: 'Mitoz ve Mayoz',
                hint: 'Evreleri adım adım ilerlet, kromozom hareketlerini izle',
                size: { w: 500, h: 300 },
                defaults: { labels: true, sim: { mode: 0, stage: 0 } },
            },
            {
                kind: 'optics_bench',
                label: 'Optik Düzeneği',
                hint: 'Cismi sürükle, görüntü canlı oluşsun',
                size: { w: 460, h: 300 },
                defaults: { labels: true, sim: { f: 4, a: 7, h: 2 } },
            },
            {
                kind: 'matter_sim',
                label: 'Maddenin Halleri',
                hint: 'Sıcaklığı değiştir, tanecikleri izle',
                size: { w: 380, h: 280 },
                defaults: { labels: true, sim: { temp: 20 } },
            },
            {
                kind: 'light_angle_sim',
                label: 'Işığın Geliş Açısı & Birim Alan',
                hint: 'Geliş açısını ayarla; dik ve eğik açının sıcaklığa ve alana etkisi',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { angle: 60 } },
            },
            {
                kind: 'wind_pressure_sim',
                label: 'Rüzgar ve Basınç Alanları',
                hint: 'Sıcaklık farkı, YAB ve AAB; rüzgarın yönü ve hızı',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { tempA: 14, tempB: 32 } },
            },
            {
                kind: 'shadow_sim',
                label: 'Gölge Boyu & Güneş Açısı',
                hint: 'Güneş yüksekliğini ayarla; öğle ve kış gölge boyu değişimi',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { angle: 45 } },
            },
            {
                kind: 'dna_replication_sim',
                label: 'DNA Eşlenmesi & Hata Onarımı',
                hint: 'Fermuar açılma, serbest nükleotidler ve mutasyon senaryoları',
                size: { w: 480, h: 340 },
                defaults: { labels: true, sim: { stage: 0, err: 0 } },
            },
            {
                kind: 'modification_sim',
                label: 'Modifikasyon Laboratuvarı',
                hint: 'Himalaya tavşanı buz deneyi ve çuha çiçeği sıcaklık deneyi',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { mode: 0, ice: 0, temp: 18 } },
            },
            {
                kind: 'nucleotide_sim',
                label: 'Nükleotid & KeDiGeNi',
                hint: 'Kromozom > DNA > Gen > Nükleotid ve P-D-Baz yapısı',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { base: 0 } },
            },
            {
                kind: 'pascal_sim',
                label: 'Pascal Prensibi & Su Cenderesi',
                hint: 'Küçük pistona bas, ağır yükü kaldır; sıvı basıncı aynen iletir',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { f1: 100, ratio: 4, push: 35 } },
            },
            {
                kind: 'torricelli_sim',
                label: 'Torricelli & Açık Hava Basıncı',
                hint: 'Rakım ve boru eğimi; dağa çıkıldıkça P₀ düşer ve balon şişer',
                size: { w: 480, h: 340 },
                defaults: { labels: true, sim: { alt: 0, tilt: 0, balloon: 1 } },
            },
            {
                kind: 'liquid_paradox_sim',
                label: 'Sıvı Basıncı Paradoksu',
                hint: 'Geniş, düz, daralan kaplar ve bileşik kaplar su dengesi',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { mode: 0, h: 60 } },
            },
            {
                kind: 'reaction_change_sim',
                label: 'Fiziksel & Kimyasal Değişim',
                hint: 'Mum, kağıt ve asit-metal deneyleri; makro ve mikro tanecik yapısı',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { exp: 0, act: 0 } },
            },
            {
                kind: 'specific_heat_sim',
                label: 'Öz Isı & Isınma Yarışı',
                hint: 'Su vs zeytinyağı ısınma yarışı ve buz kalıbı eritme deneyi',
                size: { w: 480, h: 320 },
                defaults: { labels: true, sim: { mode: 0, t: 50 } },
            },
            {
                kind: 'acid_base_lab_sim',
                label: 'Doğal Ayıraçlar & Asit-Baz Lab',
                hint: 'Kırmızı lahana suyu, fenolftalein ve metal/mermer/cam aşınma testi',
                size: { w: 480, h: 340 },
                defaults: { labels: true, sim: { mode: 0, ind: 0 } },
            },
        ],
    },
    { label: '8. Sınıf', items: GRADE8_ITEMS },
    {
        label: 'Canlı Matematik',
        items: [...MATH_SIM_ITEMS, ...GEOMETRY_SIM_ITEMS, ...NUMBER_SIM_ITEMS],
    },
    {
        label: 'Etkileşimli Fen',
        items: [
            ...SCIENCE_SIM_ITEMS,
            ...PHYSICS_SIM_ITEMS,
            ...CHEMISTRY_SIM_ITEMS,
            ...BIO_SIM_ITEMS,
            ...SORTING_SIM_ITEMS,
            ...TASK_SIM_ITEMS,
            ...MEASURE_SIM_ITEMS,
        ],
    },
];
