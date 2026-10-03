// src/components/drawing/opticsSims.ts
// Işığın kırılması ve mercekler ünitesi: göz kusurları ve görünen derinlik.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    fillShape,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    panel,
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

// ── Göz kusurları ────────────────────────────────────────────────────
//
// Kilit fikir: net görüntü ancak ışınlar TAM retina üzerinde birleşince
// oluşur. Göz küresi uzunsa (miyop) odak retinanın önünde, kısaysa
// (hipermetrop) arkasında kalır. Kalın kenarlı mercek ışınları ıraksatıp
// odağı geriye, ince kenarlı mercek yakınsatıp odağı öne taşır.

interface EyeState {
    /** 0: sağlam göz, 1: miyop, 2: hipermetrop */
    defect: number;
    /** Gözlük camı takılı mı? */
    glasses: boolean;
    name: string;
    cause: string;
    fix: string;
    /** Göz küresinin normale göre uzunluk çarpanı. */
    lengthK: number;
}

const EYE_DEFECTS: ReadonlyArray<Omit<EyeState, 'defect' | 'glasses'>> = [
    {
        name: 'Sağlam göz',
        cause: 'Göz küresinin boyu ile göz merceğinin odağı uyumlu',
        fix: 'Düzeltmeye gerek yok',
        lengthK: 1,
    },
    {
        name: 'Miyopluk',
        cause: 'Göz küresi uzun; odak retinanın ÖNÜNDE oluşur',
        fix: 'Kalın kenarlı (ıraksak) mercek odağı geriye taşır',
        lengthK: 1.38,
    },
    {
        name: 'Hipermetropluk',
        cause: 'Göz küresi kısa; odak retinanın ARKASINDA oluşur',
        fix: 'İnce kenarlı (yakınsak) mercek odağı öne taşır',
        lengthK: 0.74,
    },
];

const eyeState = (o: MathObject): EyeState => {
    const defect = clampInt(simValue(o, 'defect', 1), 0, 2, 1);
    return { defect, glasses: simValue(o, 'glass', 0) > 0.5, ...EYE_DEFECTS[defect] };
};

/** Göz küresini (kornea çıkıntısı, iris, mercek, retina) çizer. */
function drawEyeball(k: Ctx, ex: number, ey: number, rx: number, ry: number, lensX: number, icon: boolean) {
    // Küre: önde kornea çıkıntısı olan kapalı eğri
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 28; i++) {
        const a = Math.PI / 2 + (i / 28) * Math.PI * 2;
        let x = ex + rx * Math.cos(a);
        const y = ey + ry * Math.sin(a);
        // Ön yüzde (x < ex) kornea kabartısı
        const front = (ex - x) / rx;
        if (front > 0.55) x -= rx * 0.1 * (front - 0.55) * 2.4;
        pts.push([x, y]);
    }
    fillShape(k, () => smoothPath(k, pts), 0.06);
    smooth(k, pts, true, Math.max(1.6, k.lw));

    const corneaX = ex - rx;
    if (!icon) {
        // Kornea: ön yüzün üstüne ikinci, daha kalın yay
        k.c.save();
        k.c.beginPath();
        k.c.lineWidth = Math.max(2, k.lw * 1.3);
        k.c.moveTo(corneaX + rx * 0.14, ey - ry * 0.52);
        k.c.quadraticCurveTo(corneaX - rx * 0.1, ey, corneaX + rx * 0.14, ey + ry * 0.52);
        k.c.stroke();
        k.c.restore();
    }

    // İris ve göz merceği
    for (const side of [-1, 1]) {
        line(k, lensX, ey + side * ry * 0.34, lensX, ey + side * ry * 0.66, Math.max(2, k.lw * 1.2));
    }
    const lh = ry * 0.4;
    const lensPts: Array<[number, number]> = [
        [lensX, ey - lh],
        [lensX + ry * 0.13, ey],
        [lensX, ey + lh],
        [lensX - ry * 0.13, ey],
    ];
    fillShape(k, () => smoothPath(k, lensPts), 0.14);
    smooth(k, lensPts, true, Math.max(1.5, k.lw));

    // Retina: arka iç yüzey
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.75);
    k.c.beginPath();
    k.c.lineWidth = Math.max(2.4, k.lw * 1.6);
    k.c.ellipse(ex, ey, rx * 0.9, ry * 0.9, 0, -Math.PI * 0.44, Math.PI * 0.44);
    k.c.stroke();
    k.c.restore();

    if (!icon) {
        // Göz siniri
        k.c.save();
        k.c.beginPath();
        k.c.lineWidth = Math.max(1.6, k.lw);
        k.c.moveTo(ex + rx * 0.92, ey + ry * 0.28);
        k.c.quadraticCurveTo(ex + rx * 1.24, ey + ry * 0.5, ex + rx * 1.3, ey + ry * 0.86);
        k.c.stroke();
        k.c.restore();
    }
}

/** Düzeltici gözlük camı: kalın kenarlı (d<0) ya da ince kenarlı (d>0). */
function drawGlass(k: Ctx, x: number, ey: number, h: number, converging: boolean) {
    const w = h * 0.16;
    const edge = converging ? w * 0.16 : w * 0.8;
    const mid = converging ? w * 0.8 : w * 0.12;
    const pts: Array<[number, number]> = [
        [x - edge, ey - h / 2],
        [x - mid, ey],
        [x - edge, ey + h / 2],
        [x + edge, ey + h / 2],
        [x + mid, ey],
        [x + edge, ey - h / 2],
    ];
    fillShape(k, () => {
        k.c.beginPath();
        k.c.moveTo(pts[0][0], pts[0][1]);
        k.c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
        k.c.lineTo(pts[3][0], pts[3][1]);
        k.c.quadraticCurveTo(pts[4][0], pts[4][1], pts[5][0], pts[5][1]);
        k.c.closePath();
    }, 0.16);
    k.c.save();
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.6, k.lw);
    k.c.moveTo(pts[0][0], pts[0][1]);
    k.c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
    k.c.lineTo(pts[3][0], pts[3][1]);
    k.c.quadraticCurveTo(pts[4][0], pts[4][1], pts[5][0], pts[5][1]);
    k.c.closePath();
    k.c.stroke();
    k.c.restore();
}

export const eyeDefectRender: Renderer = (k) => {
    const r = k.r;
    const s = eyeState(k.o);
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
    const ey = stage.y + stage.h * 0.48;
    const ry = Math.min(stage.h * 0.3, stage.w * 0.19);
    const rx = ry * s.lengthK;
    const ex = stage.x + stage.w * 0.66;
    const lensX = ex - rx * 0.62;
    const retinaX = ex + rx * 0.9;

    // Odak: sağlam gözde retina üzerinde. Gözlük camı odağı retinaya taşır.
    // Sağlam gözde odak tam retina üzerinde: retinaX - lensX = 1,52·ry
    const normalF = ry * 1.52;
    const focusX = s.glasses && s.defect > 0 ? retinaX : lensX + normalF;
    const glassX = stage.x + stage.w * 0.16;
    const glassOn = s.glasses && s.defect > 0;

    drawEyeball(k, ex, ey, rx, ry, lensX, icon);
    if (glassOn) drawGlass(k, glassX, ey, ry * 1.9, s.defect === 2);

    // Işınlar: paralel gelir, (varsa) gözlükte, sonra göz merceğinde kırılır
    const rays = icon ? [0.4] : [0.34, 0.62, 0.9];
    let blur = 0;
    k.c.save();
    k.c.strokeStyle = k.color;
    for (const f of rays) {
        for (const side of [-1, 1]) {
            const h0 = side * ry * 0.34 * (f / 0.9);
            // Gözlükte ıraksama (miyop) / yakınsama (hipermetrop)
            const spread = glassOn ? (s.defect === 1 ? 1.24 : 0.74) : 1;
            const h1 = h0 * spread;
            line(k, stage.x, ey + h0, glassX, ey + h0, 1.3);
            line(k, glassX, ey + h0, lensX, ey + h1, 1.3);
            // Mercekten sonra odağa doğru
            const t = (retinaX - lensX) / Math.max(1e-3, focusX - lensX);
            const yAtRetina = ey + h1 * (1 - t);
            line(k, lensX, ey + h1, retinaX, yAtRetina, 1.3);
            if (focusX > retinaX + 1) {
                k.c.save();
                k.c.setLineDash([4, 4]);
                k.c.strokeStyle = withAlpha(k.color, 0.5);
                line(k, retinaX, yAtRetina, focusX, ey, 1);
                k.c.restore();
            }
            blur = Math.max(blur, Math.abs(yAtRetina - ey));
        }
    }
    k.c.restore();

    if (icon) {
        k.c.restore();
        return;
    }

    // Odak noktası ve retina üzerindeki leke
    k.c.save();
    k.c.fillStyle = k.color;
    k.c.beginPath();
    k.c.arc(focusX, ey, fs * 0.22, 0, Math.PI * 2);
    k.c.fill();
    k.c.restore();
    label(k, 'odak', focusX, ey - fs * 0.5, 'center', 'bottom', 0.55);
    label(k, 'retina', ex + rx * 1.02, ey - ry * 0.7, 'left', 'middle', 0.55);
    label(k, 'göz merceği', lensX, ey + ry * 1.06, 'center', 'top', 0.55);

    const sharp = blur < ry * 0.04;
    k.c.save();
    k.c.strokeStyle = k.color;
    k.c.beginPath();
    k.c.lineWidth = 1.8;
    k.c.ellipse(retinaX, ey, Math.max(fs * 0.16, blur * 0.4), Math.max(fs * 0.16, blur), 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
    if (!sharp) {
        const ly = ey + ry * 1.02;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        line(k, retinaX, ey + Math.max(fs * 0.2, blur), retinaX, ly - fs * 0.1, 1);
        k.c.restore();
        label(k, 'bulanık leke', retinaX, ly, 'center', 'top', 0.52);
    }

    // Okuma paneli
    if (k.o.labels !== false) {
        const px = r.x + r.w * 0.66;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.2;
        const ph = fs * 9.6;
        panel(k, px, py, pw, ph);
        label(k, s.name, px + fs * 0.6, py + fs * 1.05, 'left', 'middle', 0.76);
        label(k, 'Nedeni', px + fs * 0.6, py + fs * 2.4, 'left', 'middle', 0.54);
        wrapEye(k, s.cause, px + fs * 0.6, py + fs * 3.3, pw - fs * 1.2, 0.58);
        label(k, 'Düzeltme', px + fs * 0.6, py + fs * 5.9, 'left', 'middle', 0.54);
        wrapEye(k, s.fix, px + fs * 0.6, py + fs * 6.8, pw - fs * 1.2, 0.58);
        const verdict = sharp ? 'Görüntü NET: odak retinada' : 'Görüntü BULANIK: odak retinada değil';
        roundRect(k, px + fs * 0.4, py + ph + fs * 0.5, pw - fs * 0.8, fs * 1.6, 5);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.5);
        k.c.lineWidth = 1;
        k.c.stroke();
        k.c.restore();
        label(
            k,
            fitText(k, [verdict, sharp ? 'Görüntü NET' : 'Görüntü BULANIK'], pw - fs * 1.2, 0.58),
            px + fs * 0.8,
            py + ph + fs * 1.3,
            'left',
            'middle',
            0.58
        );
    }

    label(
        k,
        fitText(
            k,
            [
                'Göz kusurları: net görüntü ancak odak retinaya düşünce oluşur',
                'Göz kusurları: odak nerede oluşuyor?',
                'Göz kusurları',
            ],
            r.w - fs * 4,
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

/** Panel metnini panel genişliğine göre satırlara böler. */
function wrapEye(k: Ctx, text: string, x: number, y: number, maxW: number, scale: number) {
    k.c.save();
    k.c.font = `600 ${k.fs * scale}px system-ui, -apple-system, sans-serif`;
    const out: string[] = [];
    let acc = '';
    for (const w of text.split(' ')) {
        const next = acc ? `${acc} ${w}` : w;
        if (k.c.measureText(next).width > maxW && acc) {
            out.push(acc);
            acc = w;
        } else acc = next;
    }
    if (acc) out.push(acc);
    k.c.restore();
    out.slice(0, 3).forEach((ln, i) => label(k, ln, x, y + i * k.fs * scale * 1.3, 'left', 'middle', scale));
}

export const eyeDefectSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = eyeState(o);
        const out: SimControl[] = [
            {
                id: 'next',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Sonraki durum',
                on: s.defect > 0,
            },
        ];
        if (s.defect > 0) {
            out.push({
                id: 'glass',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.glasses ? 'Gözlüğü çıkar' : 'Gözlük camını tak',
                on: s.glasses,
            });
        }
        return out;
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = eyeState(o);
        if (id === 'next') return { defect: (s.defect + 1) % 3, glass: 0 };
        if (id === 'glass') return { glass: s.glasses ? 0 : 1 };
        return {};
    },
    params: [
        { key: 'defect', label: 'Durum (0 sağlam · 1 miyop · 2 hipermetrop)', min: 0, max: 2, step: 1 },
        { key: 'glass', label: 'Gözlük camı (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Görünen derinlik (Işığın Kırılması ve Mercekler) ─────────────────
//
// Kilit fikir: sudan havaya çıkan ışık normalden UZAKLAŞIR. Gözümüz
// ışığı geldiği doğrultuda gördüğü için, ışınların geriye uzantısı
// gerçek cisimden daha YUKARIDA kesişir. Bu yüzden havuzun dibi olduğundan
// sığ, sudaki balık olduğundan yukarıda görünür. (h' = h / n)

interface Medium {
    name: string;
    n: number;
}

const DEPTH_MEDIA: ReadonlyArray<Medium> = [
    { name: 'Su', n: 1.33 },
    { name: 'Cam', n: 1.5 },
];

const depthState = (o: MathObject) => ({
    h: clamp(simValue(o, 'h', 3), 1, 5),
    medium: clampInt(simValue(o, 'med', 0), 0, DEPTH_MEDIA.length - 1, 0),
});

/**
 * Cisimden çıkıp yüzeyde kırılan ve göz düzleminde hedef noktaya varan
 * ışının su içindeki açısını (normale göre) bulur. f(θ) tek yönlü arttığı
 * için ikili arama yeterlidir.
 */
function solveRay(hPx: number, ox: number, sy: number, ey: number, targetX: number, n: number): number | null {
    const reach = (t1: number) => {
        const s2 = n * Math.sin(t1);
        if (s2 >= 1) return Number.POSITIVE_INFINITY;
        const t2 = Math.asin(s2);
        return ox + hPx * Math.tan(t1) + (sy - ey) * Math.tan(t2);
    };
    let lo = 0;
    let hi = Math.asin(Math.min(0.999, 1 / n)) * 0.995;
    if (reach(hi) < targetX) return null;
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (reach(mid) < targetX) lo = mid;
        else hi = mid;
    }
    return (lo + hi) / 2;
}

/** Basit balık: gövde, kuyruk ve göz. */
function drawFish(k: Ctx, x: number, y: number, size: number, ghost: boolean) {
    const body: Array<[number, number]> = [
        [x - size, y],
        [x - size * 0.25, y - size * 0.5],
        [x + size * 0.55, y - size * 0.3],
        [x + size * 0.85, y],
        [x + size * 0.55, y + size * 0.3],
        [x - size * 0.25, y + size * 0.5],
    ];
    k.c.save();
    if (ghost) {
        k.c.setLineDash([4, 3]);
        k.c.strokeStyle = withAlpha(k.color, 0.75);
    } else {
        fillShape(k, () => smoothPath(k, body), 0.16);
    }
    smooth(k, body, true, Math.max(1.5, k.lw));
    // Kuyruk
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.5, k.lw);
    k.c.moveTo(x - size * 0.95, y);
    k.c.lineTo(x - size * 1.5, y - size * 0.45);
    k.c.lineTo(x - size * 1.5, y + size * 0.45);
    k.c.closePath();
    k.c.stroke();
    if (!ghost) {
        k.c.fillStyle = k.color;
        k.c.beginPath();
        k.c.arc(x + size * 0.45, y - size * 0.12, size * 0.1, 0, Math.PI * 2);
        k.c.fill();
    }
    k.c.restore();
}

/** Bakan göz simgesi. */
function drawEye(k: Ctx, x: number, y: number, size: number) {
    k.c.save();
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.6, k.lw);
    k.c.moveTo(x - size, y);
    k.c.quadraticCurveTo(x, y - size * 0.8, x + size, y);
    k.c.quadraticCurveTo(x, y + size * 0.8, x - size, y);
    k.c.stroke();
    k.c.fillStyle = k.color;
    k.c.beginPath();
    k.c.arc(x, y, size * 0.28, 0, Math.PI * 2);
    k.c.fill();
    k.c.restore();
}

export const apparentDepthRender: Renderer = (k) => {
    const r = k.r;
    const s = depthState(k.o);
    const m = DEPTH_MEDIA[s.medium];
    const icon = isIconSize(r);
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const stage: Rect = icon
        ? r
        : { x: r.x + fs * 0.5, y: r.y + fs * 2.2, w: r.w * 0.62, h: r.h - fs * 3.2 };
    const sy = stage.y + stage.h * (icon ? 0.34 : 0.36);
    const by = stage.y + stage.h * (icon ? 0.94 : 0.96);
    const unit = (by - sy) / 5.4;
    const ox = stage.x + stage.w * 0.28;
    const oy = sy + s.h * unit;

    // Kap ve su
    fillShape(k, () => k.c.rect(stage.x, sy, stage.w, by - sy), 0.12);
    k.c.save();
    k.c.lineWidth = Math.max(1.8, k.lw);
    k.c.beginPath();
    k.c.moveTo(stage.x, sy);
    k.c.lineTo(stage.x, by);
    k.c.lineTo(stage.x + stage.w, by);
    k.c.lineTo(stage.x + stage.w, sy);
    k.c.stroke();
    k.c.restore();
    line(k, stage.x, sy, stage.x + stage.w, sy, Math.max(2, k.lw * 1.3));

    const fishSize = Math.min(unit * 0.55, stage.w * 0.05);
    drawFish(k, ox, oy, fishSize, false);

    // Göz ve ışın çifti
    const ex = stage.x + stage.w * 0.78;
    const ey = stage.y + stage.h * 0.08;
    const pupil = Math.min(stage.w * 0.055, fs * 1.3);
    const hits: Array<{ px: number; t2: number }> = [];
    for (const dx of [-pupil, pupil]) {
        const t1 = solveRay(oy - sy, ox, sy, ey, ex + dx, m.n);
        if (t1 === null) continue;
        const t2 = Math.asin(Math.min(0.999, m.n * Math.sin(t1)));
        const px = ox + (oy - sy) * Math.tan(t1);
        hits.push({ px, t2 });
        line(k, ox, oy, px, sy, Math.max(1.4, k.lw * 0.9));
        line(k, px, sy, ex + dx, ey, Math.max(1.4, k.lw * 0.9));
    }

    // Görünen konum: ışınların geriye uzantılarının kesiştiği derinlik (h / n)
    const hPrime = s.h / m.n;
    const apparentY = sy + hPrime * unit;
    k.c.save();
    k.c.setLineDash([5, 4]);
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    for (const hh of hits) {
        const t = (apparentY - sy) / Math.cos(hh.t2);
        line(k, hh.px, sy, hh.px - t * Math.sin(hh.t2), apparentY, 1.2);
    }
    k.c.restore();

    if (!icon) {
        drawFish(k, ox, apparentY, fishSize, true);
        drawEye(k, ex, ey, fs * 0.95);
    }

    if (icon) {
        k.c.restore();
        return;
    }

    // Derinlik ölçüleri
    const mx = stage.x + fs * 2.9;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    arrow(k, mx, sy, mx, oy, fs * 0.4, 1.3);
    arrow(k, mx, oy, mx, sy, fs * 0.4, 1.3);
    k.c.setLineDash([3, 3]);
    line(k, mx, oy, ox - fishSize * 1.6, oy, 1);
    line(k, mx + fs * 1.5, apparentY, ox - fishSize * 1.6, apparentY, 1);
    k.c.restore();
    label(k, `h = ${fmtNum(s.h, 1)}`, mx - fs * 0.3, (sy + oy) / 2, 'right', 'middle', 0.56);
    const hx = mx + fs * 1.5;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    arrow(k, hx, sy, hx, apparentY, fs * 0.35, 1.3);
    arrow(k, hx, apparentY, hx, sy, fs * 0.35, 1.3);
    k.c.restore();
    label(k, `h′ = ${fmtNum(hPrime, 1)}`, hx, sy - fs * 0.25, 'center', 'bottom', 0.56);
    label(k, 'gerçek', ox, oy + fishSize * 1.1, 'center', 'top', 0.52);
    label(k, 'görünen', ox, apparentY - fishSize * 1.1, 'center', 'bottom', 0.52);
    label(k, `${m.name} (n = ${fmtNum(m.n, 2)})`, stage.x + stage.w - fs * 0.3, by - fs * 0.3, 'right', 'bottom', 0.56);
    label(k, 'hava', stage.x + stage.w - fs * 0.3, sy - fs * 0.3, 'right', 'bottom', 0.56);

    if (k.o.labels !== false) {
        const px = r.x + r.w * 0.65;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.2;
        const ph = fs * 8;
        panel(k, px, py, pw, ph);
        label(k, 'h′ = h / n', px + fs * 0.6, py + fs * 1, 'left', 'middle', 0.66);
        const rows: ReadonlyArray<[string, string]> = [
            ['Ortam', `${m.name} · n = ${fmtNum(m.n, 2)}`],
            ['Gerçek derinlik', `h = ${fmtNum(s.h, 1)} birim`],
            ['Görünen derinlik', `h′ = ${fmtNum(hPrime, 1)} birim`],
        ];
        rows.forEach(([a, b], i) => {
            const y = py + fs * (2.5 + i * 1.5);
            label(k, a, px + fs * 0.6, y, 'left', 'middle', 0.52);
            label(k, fitText(k, [b], pw - fs * 1.1, 0.6), px + fs * 0.6, y + fs * 0.72, 'left', 'middle', 0.6);
        });
        label(k, 'Balık olduğundan yukarıda', px + fs * 0.6, py + fs * 7.2, 'left', 'middle', 0.58);

        const ny = py + ph + fs * 0.8;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.5);
        roundRect(k, px + fs * 0.4, ny, pw - fs * 0.8, fs * 2.5, 5);
        k.c.lineWidth = 1;
        k.c.stroke();
        k.c.restore();
        label(k, 'Sudan havaya geçen ışık', px + fs * 0.8, ny + fs * 0.8, 'left', 'middle', 0.52);
        label(k, 'normalden uzaklaşır', px + fs * 0.8, ny + fs * 1.7, 'left', 'middle', 0.6);
    }

    label(
        k,
        fitText(
            k,
            [
                'Görünen derinlik: balık gerçekte nerede?',
                'Görünen derinlik',
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

const depthGeom = (r: Rect) => {
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);
    const stage: Rect = { x: r.x + fs * 0.5, y: r.y + fs * 2.2, w: r.w * 0.62, h: r.h - fs * 3.2 };
    const sy = stage.y + stage.h * 0.36;
    const by = stage.y + stage.h * 0.96;
    return { fs, stage, sy, unit: (by - sy) / 5.4, ox: stage.x + stage.w * 0.28 };
};

export const apparentDepthSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = depthState(o);
        const g = depthGeom(r);
        return [
            {
                id: 'med',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Ortamı değiştir (şimdi ${DEPTH_MEDIA[s.medium].name.toLowerCase()})`,
                on: s.medium > 0,
            },
            {
                id: 'h',
                x: g.ox,
                y: g.sy + s.h * g.unit,
                type: 'drag',
                label: 'Balığı derine indir ya da yüzeye çıkar',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = depthState(o);
        if (id === 'med') return { med: (s.medium + 1) % DEPTH_MEDIA.length };
        if (id === 'h' && p) {
            const g = depthGeom(r);
            return { h: clamp((p.y - g.sy) / g.unit, 1, 5) };
        }
        return {};
    },
    params: [
        { key: 'h', label: 'Gerçek derinlik h (birim)', min: 1, max: 5, step: 0.5 },
        { key: 'med', label: 'Ortam (0 su · 1 cam)', min: 0, max: 1, step: 1 },
    ],
};

export const OPTICS_SIM_RENDERERS: Record<string, Renderer> = {
    eye_defect_sim: eyeDefectRender,
    apparent_depth_sim: apparentDepthRender,
};

export const OPTICS_SIM_SPECS: Record<string, SimSpec> = {
    eye_defect_sim: eyeDefectSpec,
    apparent_depth_sim: apparentDepthSpec,
};

export const OPTICS_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'eye_defect_sim',
        label: 'Göz Kusurları',
        hint: 'Miyop ve hipermetropta odak nerede? Gözlük camını tak, izle',
        size: { w: 580, h: 360 },
        defaults: { labels: true, sim: { defect: 1, glass: 0 } },
    },
    {
        kind: 'apparent_depth_sim',
        label: 'Görünen Derinlik',
        hint: 'Sudaki balık neden olduğundan yukarıda görünür?',
        size: { w: 600, h: 400 },
        defaults: { labels: true, sim: { h: 3, med: 0 } },
    },
];
