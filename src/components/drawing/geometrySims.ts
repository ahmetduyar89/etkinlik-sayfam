// src/components/drawing/geometrySims.ts
// Geometri simülasyonları: dönüşüm geometrisi ve cisim açınımı.
//
// Ortak çizim altyapısı objectDrawing.ts'te, kayıt simObjects.ts'in
// sonundadır. Kalıcı olarak yalnızca kullanıcının ayarladığı değerler
// saklanır (MathObject.sim).

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    path,
    simValue,
    withAlpha,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── Dönüşüm geometrisi (Öteleme, yansıma, döndürme) ──────────────────
//
// Kilit fikir: üç dönüşüm de şeklin boyutunu değiştirmez, yerini ve
// yönünü değiştirir. Yansımada yön TERSİNE döner; bu yüzden şekil
// bilerek asimetrik (dik üçgen) seçildi, aksi hâlde fark görünmez.

const TRANSFORM_MODES = ['Öteleme', 'Yansıma', 'Döndürme'];
const TRANSFORM_SHAPE: ReadonlyArray<[number, number]> = [
    [1, 1],
    [4, 1],
    [1, 3],
];
const TRANSFORM_NAMES = ['A', 'B', 'C'];
const TR_COLS = 7;
const TR_ROWS = 5;

interface TransformState {
    mode: number;
    dx: number;
    dy: number;
    /** 0: y ekseninde (dikey), 1: x ekseninde (yatay) yansıma. */
    axis: number;
    /** Saat yönünün tersine döndürme açısı: 90, 180 ya da 270. */
    angle: number;
}

const transformState = (o: MathObject): TransformState => ({
    mode: clampInt(simValue(o, 'mode', 0), 0, 2, 0),
    dx: clampInt(simValue(o, 'dx', 2), -TR_COLS, TR_COLS, 2),
    dy: clampInt(simValue(o, 'dy', -3), -TR_ROWS, TR_ROWS, -3),
    axis: clampInt(simValue(o, 'axis', 0), 0, 1, 0),
    angle: [90, 180, 270][clampInt(simValue(o, 'angle', 90) / 90 - 1, 0, 2, 0)],
});

/** Bir noktanın seçili dönüşüm altındaki görüntüsü. */
function transformPoint(s: TransformState, [x, y]: [number, number]): [number, number] {
    if (s.mode === 0) return [x + s.dx, y + s.dy];
    if (s.mode === 1) return s.axis === 0 ? [-x, y] : [x, -y];
    if (s.angle === 90) return [-y, x];
    if (s.angle === 180) return [-x, -y];
    return [y, -x];
}

/** Dönüşümün kuralı: "(x, y) → (x + 3, y − 2)" gibi. */
function transformRule(s: TransformState): string {
    if (s.mode === 0) {
        const sx = s.dx === 0 ? 'x' : `x ${s.dx > 0 ? '+' : '−'} ${Math.abs(s.dx)}`;
        const sy = s.dy === 0 ? 'y' : `y ${s.dy > 0 ? '+' : '−'} ${Math.abs(s.dy)}`;
        return `(x, y) → (${sx}, ${sy})`;
    }
    if (s.mode === 1) return s.axis === 0 ? '(x, y) → (−x, y)' : '(x, y) → (x, −y)';
    if (s.angle === 90) return '(x, y) → (−y, x)';
    if (s.angle === 180) return '(x, y) → (−x, −y)';
    return '(x, y) → (y, −x)';
}

function transformGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const top = r.y + (icon ? 2 : fs * 1.9);
    const bottom = r.y + r.h - (icon ? 2 : fs * 1.6);
    const u = Math.min((r.w - (icon ? 4 : fs)) / (TR_COLS * 2 + 1), (bottom - top) / (TR_ROWS * 2 + 1));
    const cx = r.x + r.w / 2;
    const cy = (top + bottom) / 2;
    return {
        fs,
        icon,
        u,
        cx,
        cy,
        p: (gx: number, gy: number) => ({ x: cx + gx * u, y: cy - gy * u }),
        ctrlY: r.y + r.h - 12,
    };
}

export const transformRender: Renderer = (k) => {
    const r = k.r;
    const s = transformState(k.o);
    const g = transformGeom(r);
    const image = TRANSFORM_SHAPE.map((p) => transformPoint(s, p));

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Izgara
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.18);
    for (let i = -TR_COLS; i <= TR_COLS; i++) {
        line(k, g.p(i, -TR_ROWS).x, g.p(i, -TR_ROWS).y, g.p(i, TR_ROWS).x, g.p(i, TR_ROWS).y, 1);
    }
    for (let j = -TR_ROWS; j <= TR_ROWS; j++) {
        line(k, g.p(-TR_COLS, j).x, g.p(-TR_COLS, j).y, g.p(TR_COLS, j).x, g.p(TR_COLS, j).y, 1);
    }
    k.c.restore();

    // Eksenler
    k.c.lineWidth = k.lw;
    line(k, g.p(-TR_COLS, 0).x, g.cy, g.p(TR_COLS, 0).x, g.cy);
    line(k, g.cx, g.p(0, TR_ROWS).y, g.cx, g.p(0, -TR_ROWS).y);

    // Yansıma ekseni ya da dönme merkezi vurgulanır
    if (s.mode === 1) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.85);
        k.c.setLineDash([7, 4]);
        if (s.axis === 0) line(k, g.cx, g.p(0, TR_ROWS).y, g.cx, g.p(0, -TR_ROWS).y, Math.max(2, k.lw));
        else line(k, g.p(-TR_COLS, 0).x, g.cy, g.p(TR_COLS, 0).x, g.cy, Math.max(2, k.lw));
        k.c.restore();
    }
    if (s.mode === 2) {
        k.c.beginPath();
        k.c.arc(g.cx, g.cy, Math.max(2.5, g.u * 0.16), 0, Math.PI * 2);
        k.c.fill();
    }

    // Şekil ve görüntüsü
    const toScreen = (pts: ReadonlyArray<[number, number]>): Array<[number, number]> =>
        pts.map(([x, y]) => {
            const p = g.p(x, y);
            return [p.x, p.y] as [number, number];
        });

    k.c.lineWidth = Math.max(1.6, k.lw);
    path(k, toScreen(TRANSFORM_SHAPE), true);
    k.c.save();
    k.c.globalAlpha = 0.12;
    k.c.beginPath();
    toScreen(TRANSFORM_SHAPE).forEach(([x, y], i) => (i === 0 ? k.c.moveTo(x, y) : k.c.lineTo(x, y)));
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    k.c.save();
    k.c.setLineDash([6, 4]);
    path(k, toScreen(image), true);
    k.c.restore();
    k.c.save();
    k.c.globalAlpha = 0.24;
    k.c.beginPath();
    toScreen(image).forEach(([x, y], i) => (i === 0 ? k.c.moveTo(x, y) : k.c.lineTo(x, y)));
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Köşe adları: eşleşme görünsün diye A ↔ A′
    TRANSFORM_SHAPE.forEach(([x, y], i) => {
        const p = g.p(x, y);
        label(k, TRANSFORM_NAMES[i], p.x - g.fs * 0.5, p.y - g.fs * 0.4, 'center', 'middle', 0.7);
    });
    image.forEach(([x, y], i) => {
        const p = g.p(x, y);
        label(k, `${TRANSFORM_NAMES[i]}′`, p.x + g.fs * 0.55, p.y - g.fs * 0.4, 'center', 'middle', 0.7);
    });

    label(
        k,
        fitText(
            k,
            [`${TRANSFORM_MODES[s.mode]} · ${transformRule(s)}`, transformRule(s)],
            r.w - g.fs * 5,
            0.85,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.85,
    );
    const detail =
        s.mode === 0
            ? 'Şekil kayar; yönü ve boyutu değişmez'
            : s.mode === 1
              ? `${s.axis === 0 ? 'y' : 'x'} ekseninde yansıma — yön tersine döner`
              : `Orijin çevresinde ${s.angle}° döndürme`;
    label(k, detail, r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.75);
    k.c.restore();
};

export const transformSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = transformState(o);
        const g = transformGeom(r);
        const out: SimControl[] = [
            {
                id: 'mode',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Dönüşümü değiştir (şimdi: ${TRANSFORM_MODES[s.mode]})`,
                on: s.mode > 0,
            },
        ];
        if (s.mode === 0) {
            // Tutamak görüntünün ilk köşesinde durur; sürüklemek öteleme
            // vektörünü değiştirir.
            const [x, y] = transformPoint(s, TRANSFORM_SHAPE[0]);
            const p = g.p(x, y);
            out.push({ id: 'move', x: p.x, y: p.y, type: 'drag', label: 'Görüntüyü sürükle' });
        } else if (s.mode === 1) {
            out.push({
                id: 'axis',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.axis === 0 ? 'x ekseninde yansıt' : 'y ekseninde yansıt',
                on: s.axis === 1,
            });
        } else {
            out.push({
                id: 'angle',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: `Açıyı değiştir (şimdi: ${s.angle}°)`,
                on: s.angle !== 90,
            });
        }
        return out;
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = transformState(o);
        if (id === 'mode') return { mode: (s.mode + 1) % 3 };
        if (id === 'axis') return { axis: s.axis === 0 ? 1 : 0 };
        if (id === 'angle') return { angle: s.angle === 270 ? 90 : s.angle + 90 };
        const g = transformGeom(r);
        const gx = Math.round((p.x - g.cx) / g.u);
        const gy = Math.round((g.cy - p.y) / g.u);
        return {
            dx: clamp(gx - TRANSFORM_SHAPE[0][0], -TR_COLS, TR_COLS),
            dy: clamp(gy - TRANSFORM_SHAPE[0][1], -TR_ROWS, TR_ROWS),
        };
    },
    params: [
        { key: 'mode', label: 'Dönüşüm (0-1-2)', min: 0, max: 2, step: 1 },
        { key: 'dx', label: 'Yatay öteleme', min: -TR_COLS, max: TR_COLS, step: 1, unit: 'br' },
        { key: 'dy', label: 'Dikey öteleme', min: -TR_ROWS, max: TR_ROWS, step: 1, unit: 'br' },
        { key: 'angle', label: 'Döndürme', min: 90, max: 270, step: 90, unit: '°' },
        { key: 'axis', label: 'Yansıma ekseni (0 y / 1 x)', min: 0, max: 1, step: 1 },
    ],
};

// ── Cisim açınımı (Geometrik cisimler) ───────────────────────────────
//
// Açınım gerçekten katlanır: her yüzey bir menteşeye bağlıdır ve
// menteşesi çevresinde döndürülür. Çocuk yüzeyler önce kendi
// menteşelerinde, sonra ebeveynlerininkinde döner — kâğıt katlamanın
// aynısı. Ekrana izometrik izdüşümle çizilir.

type V3 = [number, number, number];

interface FoldFace {
    pts: V3[];
    /** Menteşe doğrusu; kök yüzeyde yoktur. */
    hinge: [V3, V3] | null;
    parent: number;
    /** Bu yüzeyin tam katlanmış hâldeki açısı (radyan). */
    maxAngle: number;
}

const HALF_PI = Math.PI / 2;

/** Bir noktayı, a–b ekseni çevresinde açı kadar döndürür (Rodrigues). */
function rotateAbout(p: V3, a: V3, b: V3, angle: number): V3 {
    const ax = b[0] - a[0];
    const ay = b[1] - a[1];
    const az = b[2] - a[2];
    const len = Math.hypot(ax, ay, az) || 1;
    const ux = ax / len;
    const uy = ay / len;
    const uz = az / len;
    const px = p[0] - a[0];
    const py = p[1] - a[1];
    const pz = p[2] - a[2];
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const dot = px * ux + py * uy + pz * uz;
    return [
        a[0] + px * c + (uy * pz - uz * py) * s + ux * dot * (1 - c),
        a[1] + py * c + (uz * px - ux * pz) * s + uy * dot * (1 - c),
        a[2] + pz * c + (ux * py - uy * px) * s + uz * dot * (1 - c),
    ];
}

/** Küp ve dikdörtgen prizma için haç biçimli açınım. */
function boxNet(a: number, b: number, c: number): FoldFace[] {
    return [
        { pts: [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0]], hinge: null, parent: -1, maxAngle: 0 },
        {
            pts: [[0, 0, 0], [a, 0, 0], [a, -c, 0], [0, -c, 0]],
            hinge: [[0, 0, 0], [a, 0, 0]],
            parent: 0,
            maxAngle: HALF_PI,
        },
        {
            pts: [[a, 0, 0], [a + c, 0, 0], [a + c, b, 0], [a, b, 0]],
            hinge: [[a, 0, 0], [a, b, 0]],
            parent: 0,
            maxAngle: HALF_PI,
        },
        {
            pts: [[0, b, 0], [a, b, 0], [a, b + c, 0], [0, b + c, 0]],
            hinge: [[0, b, 0], [a, b, 0]],
            parent: 0,
            maxAngle: HALF_PI,
        },
        {
            pts: [[-c, 0, 0], [0, 0, 0], [0, b, 0], [-c, b, 0]],
            hinge: [[0, 0, 0], [0, b, 0]],
            parent: 0,
            maxAngle: HALF_PI,
        },
        {
            pts: [[0, b + c, 0], [a, b + c, 0], [a, b + c + b, 0], [0, b + c + b, 0]],
            hinge: [[0, b + c, 0], [a, b + c, 0]],
            parent: 3,
            maxAngle: HALF_PI,
        },
    ];
}

/** Kare piramit açınımı: taban ve dört üçgen. */
function pyramidNet(a: number, h: number): FoldFace[] {
    const m = Math.hypot(h, a / 2);
    // Tepe noktaları tam katlandığında tabanın ORTASINDA birleşmeli. Üçgen
    // menteşenin dış tarafında durduğundan apeksin dikeyi geçmesi gerekir:
    // cos α = −(a/2) / m, yani α = 180° − arccos((a/2)/m).
    const maxAngle = Math.acos(clamp(-(a / 2) / m, -1, 1));
    return [
        { pts: [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]], hinge: null, parent: -1, maxAngle: 0 },
        {
            pts: [[0, 0, 0], [a, 0, 0], [a / 2, -m, 0]],
            hinge: [[0, 0, 0], [a, 0, 0]],
            parent: 0,
            maxAngle,
        },
        {
            pts: [[a, 0, 0], [a, a, 0], [a + m, a / 2, 0]],
            hinge: [[a, 0, 0], [a, a, 0]],
            parent: 0,
            maxAngle,
        },
        {
            pts: [[0, a, 0], [a, a, 0], [a / 2, a + m, 0]],
            hinge: [[0, a, 0], [a, a, 0]],
            parent: 0,
            maxAngle,
        },
        {
            pts: [[0, 0, 0], [0, a, 0], [-m, a / 2, 0]],
            hinge: [[0, 0, 0], [0, a, 0]],
            parent: 0,
            maxAngle,
        },
    ];
}

const NET_SHAPES = ['Küp', 'Dikdörtgen Prizma', 'Kare Piramit'];

const netFaces = (shape: number): FoldFace[] =>
    shape === 0 ? boxNet(1, 1, 1) : shape === 1 ? boxNet(1.6, 1, 0.7) : pyramidNet(1.2, 1);

/**
 * Yüzeyin katlanma yönü: menteşe ekseninin yönü rastgele olduğundan
 * pozitif açı bazı yüzeyleri aşağı katlardı. Menteşeye EN UZAK nokta
 * denenir (menteşe üzerindeki bir nokta hiç hareket etmediğinden yönü
 * belirleyemez) ve onu yukarı kaldıran işaret seçilir.
 */
function foldSign(face: FoldFace): number {
    if (!face.hinge) return 1;
    const [a, b] = face.hinge;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    let far = face.pts[0];
    let best = -1;
    for (const p of face.pts) {
        const vx = p[0] - a[0];
        const vy = p[1] - a[1];
        const vz = p[2] - a[2];
        // Noktanın menteşe doğrusuna uzaklığı: |v × d| / |d|
        const d = Math.hypot(vy * dz - vz * dy, vz * dx - vx * dz, vx * dy - vy * dx) / len;
        if (d > best) {
            best = d;
            far = p;
        }
    }
    const test = rotateAbout(far, a, b, 0.15);
    return test[2] >= far[2] ? 1 : -1;
}

/** Yüzeyin katlanma oranına göre 3B köşeleri (ebeveynler dâhil). */
function foldedFace(faces: FoldFace[], index: number, ratio: number): V3[] {
    let pts = faces[index].pts;
    let i = index;
    while (faces[i].hinge) {
        const face = faces[i];
        const angle = face.maxAngle * ratio * foldSign(face);
        pts = pts.map((p) => rotateAbout(p, face.hinge![0], face.hinge![1], angle));
        i = face.parent;
    }
    return pts;
}

const ISO_COS = Math.cos(Math.PI / 6);
const ISO_SIN = Math.sin(Math.PI / 6);
/** İzometrik izdüşüm: z yukarı, x ve y 30°'lik eksenler. */
const project = (p: V3): [number, number] => [
    (p[0] - p[1]) * ISO_COS,
    (p[0] + p[1]) * ISO_SIN - p[2],
];

const netState = (o: MathObject) => ({
    shape: clampInt(simValue(o, 'shape', 0), 0, 2, 0),
    fold: clamp(simValue(o, 'fold', 0), 0, 100),
    playing: simValue(o, 'play', 0) > 0.5,
});

/** Oynatırken katlanma ileri geri gider; duraklatıldığında kayıtlı değer. */
function netRatio(o: MathObject, t: number): number {
    const s = netState(o);
    if (!s.playing) return s.fold / 100;
    return (1 - Math.cos(t * 1.1)) / 2;
}

export const netFoldRender: Renderer = (k) => {
    const r = k.r;
    const s = netState(k.o);
    const ratio = netRatio(k.o, k.t);
    const faces = netFaces(s.shape);
    const icon = isIconSize(r);
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));

    // Ölçek açık açınıma göre belirlenir; katlanırken şekil yerinde kalsın.
    const flat = faces.map((_, i) => foldedFace(faces, i, 0).map(project));
    const xs = flat.flat().map((p) => p[0]);
    const ys = flat.flat().map((p) => p[1]);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    const box = {
        x: r.x + (icon ? r.w * 0.06 : fs),
        y: r.y + (icon ? r.h * 0.06 : fs * 2),
        w: r.w - (icon ? r.w * 0.12 : fs * 2),
        h: r.h - (icon ? r.h * 0.12 : fs * 3.4),
    };
    const scale = Math.min(box.w / spanX, box.h / spanY);
    const ox = box.x + box.w / 2 - ((Math.max(...xs) + Math.min(...xs)) / 2) * scale;
    const oy = box.y + box.h / 2 - ((Math.max(...ys) + Math.min(...ys)) / 2) * scale;
    const toScreen = (p: V3): [number, number] => {
        const [px, py] = project(p);
        return [ox + px * scale, oy + py * scale];
    };

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.4, k.lw);

    // Ressam algoritması: uzaktaki yüzey önce çizilir.
    const drawn = faces
        .map((_, i) => foldedFace(faces, i, ratio))
        .map((pts, i) => ({
            i,
            pts,
            depth: pts.reduce((sum, p) => sum + p[0] + p[1] + p[2], 0) / pts.length,
        }))
        .sort((a, b) => a.depth - b.depth);

    for (const face of drawn) {
        const screen = face.pts.map(toScreen);
        k.c.save();
        k.c.globalAlpha = 0.1;
        k.c.beginPath();
        screen.forEach(([x, y], i) => (i === 0 ? k.c.moveTo(x, y) : k.c.lineTo(x, y)));
        k.c.closePath();
        k.c.fill();
        k.c.restore();
        path(k, screen, true);
    }

    if (icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(
        k,
        `${NET_SHAPES[s.shape]} · ${ratio < 0.02 ? 'açınım' : ratio > 0.98 ? 'kapalı cisim' : `katlanıyor %${fmtNum(ratio * 100, 0)}`}`,
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.85,
    );
    label(
        k,
        `${faces.length} yüzey · açınım katlanınca yüzey sayısı değişmez`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.72,
    );
    k.c.restore();
};

export const netFoldSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o): SimControl[] => {
        const s = netState(o);
        return [
            {
                id: 'shape',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: `Cismi değiştir (şimdi: ${NET_SHAPES[s.shape]})`,
                on: s.shape > 0,
            },
            {
                id: 'play',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: s.playing ? 'Katlamayı duraklat' : 'Katlanmayı oynat',
                on: s.playing,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = netState(o);
        if (id === 'shape') return { shape: (s.shape + 1) % NET_SHAPES.length };
        return { play: s.playing ? 0 : 1 };
    },
    params: [
        { key: 'shape', label: 'Cisim (0-1-2)', min: 0, max: 2, step: 1 },
        { key: 'fold', label: 'Katlanma', min: 0, max: 100, step: 1, unit: '%' },
        { key: 'play', label: 'Oynat (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Açı ilişkileri (Paralel doğrular ve kesen) ───────────────────────
//
// Kilit fikir: iki paralel doğruyu bir kesen kestiğinde oluşan sekiz
// açının hepsi ya birbirine EŞİT ya da BÜTÜNLERDİR. Keseni döndürdükçe
// değerler değişir ama ilişki bozulmaz.

const ANGLE_PAIRS = [
    { name: 'Yöndeş açılar', rule: 'eşittir' },
    { name: 'Ters açılar', rule: 'eşittir' },
    { name: 'İç ters açılar', rule: 'eşittir' },
    { name: 'İç yan açılar', rule: 'bütünlerdir' },
];

const anglesState = (o: MathObject) => ({
    theta: clamp(simValue(o, 'theta', 55), 20, 80),
    pair: clampInt(simValue(o, 'pair', 0), 0, ANGLE_PAIRS.length - 1, 0),
});

function anglesGeom(r: Rect, theta: number) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const y1 = r.y + r.h * (icon ? 0.3 : 0.38);
    const y2 = r.y + r.h * (icon ? 0.72 : 0.74);
    const cx = r.x + r.w * 0.5;
    const cy = (y1 + y2) / 2;
    const rad = (theta * Math.PI) / 180;
    // Kesen, iki doğrunun ortasındaki noktadan geçer; kesişimler oradan
    // yukarı ve aşağı doğru yürünerek bulunur.
    const t1 = (cy - y1) / Math.sin(rad);
    const a = { x: cx + t1 * Math.cos(rad), y: y1 };
    const b = { x: cx - t1 * Math.cos(rad), y: y2 };
    return {
        fs,
        icon,
        y1,
        y2,
        a,
        b,
        rad,
        arcR: Math.min(r.w, r.h) * 0.11,
        /** Kesenin uçları (kutu dışına taşacak kadar uzun). */
        tip: { x: cx + r.h * 0.9 * Math.cos(rad), y: cy - r.h * 0.9 * Math.sin(rad) },
        tail: { x: cx - r.h * 0.9 * Math.cos(rad), y: cy + r.h * 0.9 * Math.sin(rad) },
    };
}

/** Bir kesişimdeki dört açının yay sınırları (radyan). */
function anglePositions(rad: number) {
    return {
        ustSag: [-rad, 0],
        altSag: [0, Math.PI - rad],
        altSol: [Math.PI - rad, Math.PI],
        ustSol: [Math.PI, Math.PI * 2 - rad],
    } as const;
}

export const anglesRender: Renderer = (k) => {
    const r = k.r;
    const s = anglesState(k.o);
    const g = anglesGeom(r, s.theta);
    const pos = anglePositions(g.rad);
    const acute = s.theta;
    const obtuse = 180 - s.theta;

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.5, k.lw);

    // Paralel doğrular ve kesen
    line(k, r.x + 4, g.y1, r.x + r.w - 4, g.y1);
    line(k, r.x + 4, g.y2, r.x + r.w - 4, g.y2);
    line(k, g.tail.x, g.tail.y, g.tip.x, g.tip.y);
    // Paralellik işaretleri
    for (const y of [g.y1, g.y2]) {
        const mx = r.x + r.w * 0.12;
        arrow(k, mx - g.fs * 0.5, y, mx + g.fs * 0.5, y, g.fs * 0.4, 1.2);
    }

    // Seçili açı çifti: hangi iki açı olduğu vurgulanır
    const highlights: Array<{ p: { x: number; y: number }; span: readonly [number, number]; value: number }> =
        s.pair === 0
            ? [
                  { p: g.a, span: pos.ustSag, value: acute },
                  { p: g.b, span: pos.ustSag, value: acute },
              ]
            : s.pair === 1
              ? [
                    { p: g.a, span: pos.ustSag, value: acute },
                    { p: g.a, span: pos.altSol, value: acute },
                ]
              : s.pair === 2
                ? [
                      { p: g.a, span: pos.altSol, value: acute },
                      { p: g.b, span: pos.ustSag, value: acute },
                  ]
                : [
                      { p: g.a, span: pos.altSag, value: obtuse },
                      { p: g.b, span: pos.ustSag, value: acute },
                  ];

    for (const h of highlights) {
        k.c.save();
        k.c.globalAlpha = 0.16;
        k.c.beginPath();
        k.c.moveTo(h.p.x, h.p.y);
        k.c.arc(h.p.x, h.p.y, g.arcR, h.span[0], h.span[1]);
        k.c.closePath();
        k.c.fill();
        k.c.restore();
        k.c.beginPath();
        k.c.lineWidth = Math.max(1.6, k.lw);
        k.c.arc(h.p.x, h.p.y, g.arcR, h.span[0], h.span[1]);
        k.c.stroke();
        if (g.icon) continue;
        const mid = (h.span[0] + h.span[1]) / 2;
        label(
            k,
            `${fmtNum(h.value, 0)}°`,
            h.p.x + g.arcR * 1.45 * Math.cos(mid),
            h.p.y + g.arcR * 1.45 * Math.sin(mid),
            'center',
            'middle',
            0.75,
        );
    }

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    const pair = ANGLE_PAIRS[s.pair];
    label(
        k,
        fitText(k, [`${pair.name} — keseni sürükle`, pair.name], r.w - g.fs * 4, 0.85),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.85,
    );
    const detail =
        s.pair === 3
            ? `${pair.name} ${pair.rule}: ${fmtNum(obtuse, 0)}° + ${fmtNum(acute, 0)}° = 180°`
            : `${pair.name} ${pair.rule}: ${fmtNum(acute, 0)}° = ${fmtNum(acute, 0)}°`;
    label(k, detail, r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.85);
    k.c.restore();
};

export const anglesSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = anglesState(o);
        const g = anglesGeom(r, s.theta);
        return [
            {
                id: 'line',
                // Tutamak kesenin üst kesişiminin biraz ötesinde durur.
                x: g.a.x + g.arcR * 1.6 * Math.cos(-g.rad),
                y: g.a.y + g.arcR * 1.6 * Math.sin(-g.rad),
                type: 'drag',
                label: 'Keseni döndür',
            },
            {
                id: 'pair',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: `Açı çiftini değiştir (şimdi: ${ANGLE_PAIRS[s.pair].name})`,
                on: s.pair > 0,
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = anglesState(o);
        if (id === 'pair') return { pair: (s.pair + 1) % ANGLE_PAIRS.length };
        const g = anglesGeom(r, s.theta);
        const cx = r.x + r.w * 0.5;
        const cy = (g.y1 + g.y2) / 2;
        const deg = (Math.atan2(cy - p.y, p.x - cx) * 180) / Math.PI;
        return { theta: clamp(Math.abs(deg), 20, 80) };
    },
    params: [
        { key: 'theta', label: 'Kesenin açısı', min: 20, max: 80, step: 1, unit: '°' },
        { key: 'pair', label: 'Açı çifti (0-3)', min: 0, max: ANGLE_PAIRS.length - 1, step: 1 },
    ],
};

// ── Pisagor bağıntısı (Üçgende kenar bağıntıları) ────────────────────
//
// Kilit fikir: dik üçgende dik kenarların kareleri toplamı hipotenüsün
// karesine eşittir. Kareler gerçekten çizilir ve birim kareleri sayılır;
// eşitlik ezber değil, alan karşılaştırması olarak görünür.

const pythState = (o: MathObject) => {
    const a = clampInt(simValue(o, 'a', 3), 1, 8, 3);
    const b = clampInt(simValue(o, 'b', 4), 1, 8, 4);
    return { a, b, c: Math.hypot(a, b) };
};

function pythGeom(r: Rect, s: { a: number; b: number; c: number }) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    // Şeklin kapladığı alan: solda b karesi, altta a karesi, üstte hipotenüs
    // karesi. Ölçek bu kutuya göre seçilir.
    const spanX = s.b + s.a + s.c * 0.9;
    const spanY = s.a + s.b + s.c * 0.9;
    const u = Math.min(
        (r.w - (icon ? 6 : fs * 2)) / spanX,
        (r.h - (icon ? 6 : fs * 4)) / spanY
    );
    // Dik köşe: sol altta, dik kenarlar sağa ve yukarı gider.
    const ox = r.x + (icon ? r.w * 0.5 - (s.a - s.b) * u * 0.5 : fs + s.b * u);
    const oy = r.y + (icon ? r.h * 0.5 + (s.b - s.a) * u * 0.5 : fs * 2.4 + s.c * 0.9 * u + s.b * u);
    return { fs, icon, u, ox, oy };
}

export const pythagorasRender: Renderer = (k) => {
    const r = k.r;
    const s = pythState(k.o);
    const g = pythGeom(r, s);
    const A = { x: g.ox, y: g.oy };
    const B = { x: g.ox + s.a * g.u, y: g.oy };
    const C = { x: g.ox, y: g.oy - s.b * g.u };

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = Math.max(1.6, k.lw);

    /** Bir kenarın dışına, birim kareleriyle birlikte kare çizer. */
    const squareOn = (
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        n: number,
        away: { x: number; y: number }
    ) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        // Dik yön iki taraftan biri; üçgenden UZAK olan seçilir.
        let nx = -dy;
        let ny = dx;
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        if ((mid.x + nx - away.x) ** 2 + (mid.y + ny - away.y) ** 2 < (mid.x - away.x) ** 2 + (mid.y - away.y) ** 2) {
            nx = -nx;
            ny = -ny;
        }
        const p3 = { x: p2.x + nx, y: p2.y + ny };
        const p4 = { x: p1.x + nx, y: p1.y + ny };
        path(k, [
            [p1.x, p1.y],
            [p2.x, p2.y],
            [p3.x, p3.y],
            [p4.x, p4.y],
        ], true);
        k.c.save();
        k.c.globalAlpha = 0.1;
        k.c.beginPath();
        k.c.moveTo(p1.x, p1.y);
        k.c.lineTo(p2.x, p2.y);
        k.c.lineTo(p3.x, p3.y);
        k.c.lineTo(p4.x, p4.y);
        k.c.closePath();
        k.c.fill();
        k.c.restore();
        // Birim kareler
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.35);
        for (let i = 1; i < n; i++) {
            const t = i / n;
            line(k, p1.x + dx * t, p1.y + dy * t, p4.x + dx * t, p4.y + dy * t, 1);
            line(k, p1.x + nx * t, p1.y + ny * t, p2.x + nx * t, p2.y + ny * t, 1);
        }
        k.c.restore();
        return { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 };
    };

    const centerA = squareOn(A, B, s.a, C);
    const centerB = squareOn(C, A, s.b, B);
    const centerC = squareOn(B, C, Math.round(s.c) === s.c ? s.c : 0, A);

    // Üçgen ve dik açı işareti
    k.c.lineWidth = Math.max(2, k.lw * 1.4);
    path(k, [
        [A.x, A.y],
        [B.x, B.y],
        [C.x, C.y],
    ], true);
    const m = Math.min(g.u * 0.35, 12);
    path(k, [
        [A.x + m, A.y],
        [A.x + m, A.y - m],
        [A.x, A.y - m],
    ]);

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    label(k, `a² = ${s.a * s.a}`, centerA.x, centerA.y, 'center', 'middle', 0.8);
    label(k, `b² = ${s.b * s.b}`, centerB.x, centerB.y, 'center', 'middle', 0.8);
    label(k, `c² = ${s.a * s.a + s.b * s.b}`, centerC.x, centerC.y, 'center', 'middle', 0.8);
    label(k, `a = ${s.a}`, (A.x + B.x) / 2, A.y - g.fs * 0.4, 'center', 'bottom', 0.68);
    label(k, `b = ${s.b}`, A.x + g.fs * 0.4, (A.y + C.y) / 2, 'left', 'middle', 0.68);
    label(k, `c = ${fmtNum(s.c, 2)}`, (B.x + C.x) / 2 + g.fs * 0.5, (B.y + C.y) / 2 - g.fs * 0.4, 'left', 'bottom', 0.68);

    label(
        k,
        fitText(
            k,
            ['Dik kenarların kareleri toplamı = hipotenüsün karesi', 'Pisagor bağıntısı'],
            r.w - g.fs * 2,
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
        `${s.a}² + ${s.b}² = ${s.a * s.a} + ${s.b * s.b} = ${s.a * s.a + s.b * s.b} = c²`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.85,
    );
    k.c.restore();
};

export const pythagorasSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = pythState(o);
        const g = pythGeom(r, s);
        return [
            {
                id: 'a',
                x: g.ox + s.a * g.u,
                y: g.oy,
                type: 'drag',
                label: 'Yatay dik kenarı değiştir',
            },
            {
                id: 'b',
                x: g.ox,
                y: g.oy - s.b * g.u,
                type: 'drag',
                label: 'Dikey dik kenarı değiştir',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = pythState(o);
        const g = pythGeom(r, s);
        if (id === 'a') return { a: clamp(Math.round((p.x - g.ox) / g.u), 1, 8) };
        return { b: clamp(Math.round((g.oy - p.y) / g.u), 1, 8) };
    },
    params: [
        { key: 'a', label: 'Dik kenar a', min: 1, max: 8, step: 1, unit: 'br' },
        { key: 'b', label: 'Dik kenar b', min: 1, max: 8, step: 1, unit: 'br' },
    ],
};

// ── Koordinat Düzleminde Dörtgenler Simülasyonu ───────────────────────
//
// Visnos "Quadrilaterals on a Coordinate Grid" etkinliğinin tahtaya gömülü
// canlı nesne karşılığı. 4 bölge / 1. bölge koordinat ızgarası, A, B, C, D
// köşelerinin sürüklenmesi, anlık geometrik sınıflandırma (kare, dikdörtgen,
// eşkenar dörtgen, paralelkenar, deltoid, yamuk…), eşit kenar çentikleri,
// paralel okları, köşegenler ve eksik köşe bulmaca (challenge) modu.

const QUAD_CHALLENGES = [
    {
        targetName: 'Dikdörtgen',
        targetType: 'rectangle',
        a: [-4, 3],
        b: [2, 3],
        c: [2, -1],
        targetD: [-4, -1],
        hint: 'Karşılıklı kenarlar eşit ve paraleldir, açılar 90° olmalıdır.',
    },
    {
        targetName: 'Paralelkenar',
        targetType: 'parallelogram',
        a: [-3, 2],
        b: [3, 2],
        c: [1, -2],
        targetD: [-5, -2],
        hint: 'AB kenarının uzunluğu ve eğimi DC kenarı için de geçerlidir.',
    },
    {
        targetName: 'Kare',
        targetType: 'square',
        a: [-2, 2],
        b: [2, 2],
        c: [2, -2],
        targetD: [-2, -2],
        hint: 'Tüm kenarlar eşit (4 birim) ve köşeler 90° dik olmalıdır.',
    },
    {
        targetName: 'Eşkenar Dörtgen',
        targetType: 'rhombus',
        a: [0, 3],
        b: [4, 0],
        c: [0, -3],
        targetD: [-4, 0],
        hint: '4 kenarı eşit uzunlukta ve köşegenleri dik kesişmelidir.',
    },
    {
        targetName: 'İkizkenar Yamuk',
        targetType: 'isosceles_trapezoid',
        a: [-2, 3],
        b: [2, 3],
        c: [4, -2],
        targetD: [-4, -2],
        hint: 'Alt ve üst kenar paralel olmalı, yan kenar boyları eşit olmalıdır.',
    },
    {
        targetName: 'Deltoid (Uçurtma)',
        targetType: 'kite',
        a: [0, 3],
        b: [3, 1],
        c: [0, -3],
        targetD: [-3, 1],
        hint: 'Ardışık kenar çiftleri eşit ve tepe noktası simetriktir.',
    },
];

const QUAD_RANDOM_PRESETS = [
    { a: [-3, 3], b: [3, 3], c: [3, -1], d: [-3, -1] }, // Dikdörtgen
    { a: [-2, 2], b: [2, 2], c: [2, -2], d: [-2, -2] }, // Kare
    { a: [-4, 2], b: [2, 2], c: [0, -2], d: [-6, -2] }, // Paralelkenar
    { a: [0, 4], b: [3, 0], c: [0, -4], d: [-3, 0] }, // Eşkenar Dörtgen
    { a: [-2, 3], b: [2, 3], c: [4, -2], d: [-4, -2] }, // İkizkenar Yamuk
    { a: [-3, 3], b: [3, 3], c: [3, -2], d: [-5, -2] }, // Dik Yamuk
    { a: [0, 4], b: [3, 1], c: [0, -3], d: [-3, 1] }, // Deltoid
    { a: [0, 3], b: [3, -1], c: [0, 1], d: [-3, -1] }, // Dart
    { a: [-4, 3], b: [3, 2], c: [2, -3], d: [-3, -1] }, // Çeşitkenar
];

interface QuadrilateralState {
    ax: number;
    ay: number;
    bx: number;
    by: number;
    cx: number;
    cy: number;
    dx: number;
    dy: number;
    quadrant: number; // 0: 4 Bölge (-7..7, -5..5), 1: 1. Bölge (0..10, 0..8)
    showName: number; // 0: ?, 1: açık
    showCoords: number; // 0: ?, 1: açık
    showEqualSides: number; // 0: kapalı, 1: açık
    showParallel: number; // 0: kapalı, 1: açık
    showDiagonals: number; // 0: kapalı, 1: açık
    mode: number; // 0: Serbest Keşif, 1: Eksik Köşe Görevi
    challengeIdx: number;
}

const quadState = (o: MathObject): QuadrilateralState => {
    const quadrant = clampInt(simValue(o, 'quadrant', 0), 0, 1, 0);
    const minX = quadrant === 0 ? -7 : 0;
    const maxX = quadrant === 0 ? 7 : 10;
    const minY = quadrant === 0 ? -5 : 0;
    const maxY = quadrant === 0 ? 5 : 8;

    return {
        ax: clampInt(simValue(o, 'ax', quadrant === 0 ? -3 : 2), minX, maxX, -3),
        ay: clampInt(simValue(o, 'ay', quadrant === 0 ? 3 : 6), minY, maxY, 3),
        bx: clampInt(simValue(o, 'bx', quadrant === 0 ? 3 : 8), minX, maxX, 3),
        by: clampInt(simValue(o, 'by', quadrant === 0 ? 3 : 6), minY, maxY, 3),
        cx: clampInt(simValue(o, 'cx', quadrant === 0 ? 3 : 8), minX, maxX, 3),
        cy: clampInt(simValue(o, 'cy', quadrant === 0 ? -2 : 2), minY, maxY, -2),
        dx: clampInt(simValue(o, 'dx', quadrant === 0 ? -3 : 2), minX, maxX, -3),
        dy: clampInt(simValue(o, 'dy', quadrant === 0 ? -2 : 2), minY, maxY, -2),
        quadrant,
        showName: clampInt(simValue(o, 'showName', 1), 0, 1, 1),
        showCoords: clampInt(simValue(o, 'showCoords', 1), 0, 1, 1),
        showEqualSides: clampInt(simValue(o, 'showEqualSides', 1), 0, 1, 1),
        showParallel: clampInt(simValue(o, 'showParallel', 1), 0, 1, 1),
        showDiagonals: clampInt(simValue(o, 'showDiagonals', 0), 0, 1, 0),
        mode: clampInt(simValue(o, 'mode', 0), 0, 1, 0),
        challengeIdx: clampInt(simValue(o, 'challengeIdx', 0), 0, QUAD_CHALLENGES.length - 1, 0),
    };
};

function quadGeom(r: Rect, s: QuadrilateralState) {
    const isQ1 = s.quadrant === 1;
    const minX = isQ1 ? 0 : -7;
    const maxX = isQ1 ? 10 : 7;
    const minY = isQ1 ? 0 : -5;
    const maxY = isQ1 ? 8 : 5;

    // Üstte renk paleti araç çubuğunun (color picker) başlığı kapatmaması için
    // yeterli boşluk (topBarH) ve altta 2 sıra buton için boşluk (bottomBarH).
    const topBarH = 74;
    const bottomBarH = 68;
    const padX = 28;

    const plotW = r.w - padX * 2;
    const plotH = r.h - topBarH - bottomBarH;

    const u = Math.min(plotW / (maxX - minX), plotH / (maxY - minY));

    const totalGridW = (maxX - minX) * u;
    const totalGridH = (maxY - minY) * u;

    const ox = r.x + padX + (plotW - totalGridW) / 2 + (isQ1 ? 0 : 7 * u);
    const oy = r.y + topBarH + (plotH - totalGridH) / 2 + (isQ1 ? 8 * u : 5 * u);

    const p = (x: number, y: number) => ({
        x: ox + x * u,
        y: oy - y * u,
    });

    const toGrid = (sx: number, sy: number) => ({
        x: clampInt(Math.round((sx - ox) / u), minX, maxX, 0),
        y: clampInt(Math.round((oy - sy) / u), minY, maxY, 0),
    });

    return { ox, oy, u, minX, maxX, minY, maxY, topBarH, bottomBarH, p, toGrid };
}

function detectQuadrilateral(A: [number, number], B: [number, number], C: [number, number], D: [number, number]) {
    const v1 = [B[0] - A[0], B[1] - A[1]];
    const v2 = [C[0] - B[0], C[1] - B[1]];
    const v3 = [D[0] - C[0], D[1] - C[1]];
    const v4 = [A[0] - D[0], A[1] - D[1]];

    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const l3 = Math.hypot(v3[0], v3[1]);
    const l4 = Math.hypot(v4[0], v4[1]);

    const eq = (a: number, b: number) => Math.abs(a - b) < 0.05;

    // Kesişim / Çapraz kontrolü (Segments intersection)
    const ccw = (p1: [number, number], p2: [number, number], p3: [number, number]) =>
        (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
    const intersect = (p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number]) =>
        ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);

    const isCrossed = intersect(A, B, C, D) || intersect(B, C, D, A);

    // Paralellik kontrolü: AB || CD (v1 ve -v3), BC || DA (v2 ve -v4)
    const cross13 = v1[0] * v3[1] - v1[1] * v3[0];
    const cross24 = v2[0] * v4[1] - v2[1] * v4[0];
    const par13 = Math.abs(cross13) < 0.001 && l1 > 0 && l3 > 0;
    const par24 = Math.abs(cross24) < 0.001 && l2 > 0 && l4 > 0;

    // Diklik / Açılar kontrolü (Köşelerdeki iç çarpımlar)
    // A açısı: AB (v1) ile AD (-v4)
    const dpA = v1[0] * -v4[0] + v1[1] * -v4[1];
    // B açısı: BA (-v1) ile BC (v2)
    const dpB = -v1[0] * v2[0] + -v1[1] * v2[1];
    // C açısı: CB (-v2) ile CD (v3)
    const dpC = -v2[0] * v3[0] + -v2[1] * v3[1];
    // D açısı: DC (-v3) ile DA (v4)
    const dpD = -v3[0] * v4[0] + -v3[1] * v4[1];

    const isRightA = Math.abs(dpA) < 0.001;
    const isRightB = Math.abs(dpB) < 0.001;
    const isRightC = Math.abs(dpC) < 0.001;
    const isRightD = Math.abs(dpD) < 0.001;
    const allRight = isRightA && isRightB && isRightC && isRightD;

    // Dışbükeylik / İçbükeylik (Cross products)
    const cp1 = v1[0] * v2[1] - v1[1] * v2[0];
    const cp2 = v2[0] * v3[1] - v2[1] * v3[0];
    const cp3 = v3[0] * v4[1] - v3[1] * v4[0];
    const cp4 = v4[0] * v1[1] - v4[1] * v1[0];
    const signs = [cp1, cp2, cp3, cp4].map((s) => (s > 0.001 ? 1 : s < -0.001 ? -1 : 0));
    const posCount = signs.filter((s) => s === 1).length;
    const negCount = signs.filter((s) => s === -1).length;
    const isConvex = posCount === 4 || negCount === 4;
    const isConcave = (posCount === 3 && negCount === 1) || (posCount === 1 && negCount === 3);

    // Alan (Shoelace formülü)
    const area =
        Math.abs(
            A[0] * B[1] -
                A[1] * B[0] +
                (B[0] * C[1] - B[1] * C[0]) +
                (C[0] * D[1] - C[1] * D[0]) +
                (D[0] * A[1] - D[1] * A[0])
        ) / 2;
    const perimeter = l1 + l2 + l3 + l4;

    // Köşegenler: AC ve BD
    const ac = [C[0] - A[0], C[1] - A[1]];
    const bd = [D[0] - B[0], D[1] - B[1]];
    const diagPerp = Math.abs(ac[0] * bd[0] + ac[1] * bd[1]) < 0.001;

    let type = 'general';
    let name = 'Çeşitkenar Dörtgen';

    if (l1 === 0 || l2 === 0 || l3 === 0 || l4 === 0 || area < 0.01) {
        type = 'degenerate';
        name = 'Geçersiz / Doğrusal';
    } else if (isCrossed) {
        type = 'crossed';
        name = 'Kendini Kesen (Çapraz)';
    } else if (par13 && par24) {
        const allSidesEq = eq(l1, l2) && eq(l2, l3) && eq(l3, l4);
        if (allSidesEq) {
            if (allRight) {
                type = 'square';
                name = 'Kare';
            } else {
                type = 'rhombus';
                name = 'Eşkenar Dörtgen';
            }
        } else if (allRight) {
            type = 'rectangle';
            name = 'Dikdörtgen';
        } else {
            type = 'parallelogram';
            name = 'Paralelkenar';
        }
    } else if (par13 || par24) {
        const nonParSidesEq = par13 ? eq(l2, l4) : eq(l1, l3);
        const rightAnglesCount = [isRightA, isRightB, isRightC, isRightD].filter(Boolean).length;
        if (rightAnglesCount >= 2) {
            type = 'right_trapezoid';
            name = 'Dik Yamuk';
        } else if (nonParSidesEq) {
            type = 'isosceles_trapezoid';
            name = 'İkizkenar Yamuk';
        } else {
            type = 'trapezoid';
            name = 'Yamuk';
        }
    } else {
        const adjPair1 = eq(l1, l2) && eq(l3, l4);
        const adjPair2 = eq(l2, l3) && eq(l4, l1);
        if (adjPair1 || adjPair2) {
            if (isConcave) {
                type = 'dart';
                name = 'Dart (İçbükey Deltoid)';
            } else {
                type = 'kite';
                name = 'Deltoid (Uçurtma)';
            }
        }
    }

    return {
        type,
        name,
        l1,
        l2,
        l3,
        l4,
        area,
        perimeter,
        par13,
        par24,
        isRightA,
        isRightB,
        isRightC,
        isRightD,
        isCrossed,
        diagPerp,
    };
}

export const quadrilateralGridRender: Renderer = (k) => {
    const { r } = k;
    const s = quadState(k.o);
    const g = quadGeom(r, s);

    k.c.save();

    // ── 1. Arka Plan & Çerçeve ───────────────────────────────────────
    k.c.fillStyle = '#0f1422';
    k.c.beginPath();
    k.c.roundRect(r.x, r.y, r.w, r.h, 12);
    k.c.fill();
    k.c.strokeStyle = '#2d3748';
    k.c.lineWidth = 1.5;
    k.c.stroke();

    // ── 2. Koordinat Izgarası ─────────────────────────────────────────
    k.c.strokeStyle = '#1a2236';
    k.c.lineWidth = 1;

    for (let x = g.minX; x <= g.maxX; x++) {
        const top = g.p(x, g.maxY);
        const bot = g.p(x, g.minY);
        k.c.beginPath();
        k.c.moveTo(top.x, top.y);
        k.c.lineTo(bot.x, bot.y);
        k.c.stroke();
    }
    for (let y = g.minY; y <= g.maxY; y++) {
        const left = g.p(g.minX, y);
        const right = g.p(g.maxX, y);
        k.c.beginPath();
        k.c.moveTo(left.x, left.y);
        k.c.lineTo(right.x, right.y);
        k.c.stroke();
    }

    // ── 3. Ana Eksenler (X ve Y) ─────────────────────────────────────
    k.c.strokeStyle = '#4a5568';
    k.c.lineWidth = 2;

    // X Ekseni
    const xStart = g.p(g.minX, 0);
    const xEnd = g.p(g.maxX, 0);
    line(k, xStart.x - 4, xStart.y, xEnd.x + 8, xEnd.y, 2);
    arrow(k, xEnd.x, xEnd.y, xEnd.x + 8, xEnd.y, 6);

    // Y Ekseni
    const yStart = g.p(0, g.minY);
    const yEnd = g.p(0, g.maxY);
    line(k, yStart.x, yStart.y + 4, yEnd.x, yEnd.y - 8, 2);
    arrow(k, yEnd.x, yEnd.y, yEnd.x, yEnd.y - 8, 6);

    // Sayı etiketleri (x ve y eksenleri)
    if (!isIconSize(r)) {
        k.c.fillStyle = '#718096';
        k.c.font = `9px sans-serif`;
        k.c.textAlign = 'center';
        k.c.textBaseline = 'top';
        for (let x = g.minX; x <= g.maxX; x += 2) {
            if (x === 0) continue;
            const pt = g.p(x, 0);
            k.c.fillText(String(x), pt.x, pt.y + 3);
        }
        k.c.textAlign = 'right';
        k.c.textBaseline = 'middle';
        for (let y = g.minY; y <= g.maxY; y += 2) {
            if (y === 0) continue;
            const pt = g.p(0, y);
            k.c.fillText(String(y), pt.x - 4, pt.y);
        }
    }

    // ── 4. Noktalar ve Geometri Tespiti ──────────────────────────────
    const A: [number, number] = [s.ax, s.ay];
    const B: [number, number] = [s.bx, s.by];
    const C: [number, number] = [s.cx, s.cy];
    const D: [number, number] = [s.dx, s.dy];

    const pA = g.p(A[0], A[1]);
    const pB = g.p(B[0], B[1]);
    const pC = g.p(C[0], C[1]);
    const pD = g.p(D[0], D[1]);

    const quadInfo = detectQuadrilateral(A, B, C, D);

    // Challenge (Görev) kontrolü
    const challenge = QUAD_CHALLENGES[s.challengeIdx];
    const isChallengeMode = s.mode === 1;
    const isChallengeSuccess = isChallengeMode && quadInfo.type === challenge.targetType;

    // ── 5. Köşegenler ────────────────────────────────────────────────
    if (s.showDiagonals === 1 && !isIconSize(r)) {
        k.c.save();
        k.c.setLineDash([4, 4]);
        k.c.strokeStyle = '#eab308';
        k.c.lineWidth = 1.4;
        k.c.beginPath();
        k.c.moveTo(pA.x, pA.y);
        k.c.lineTo(pC.x, pC.y);
        k.c.moveTo(pB.x, pB.y);
        k.c.lineTo(pD.x, pD.y);
        k.c.stroke();
        k.c.restore();
    }

    // ── 6. Dörtgen Gövdesi (Dolgu & Kenarlar) ─────────────────────────
    k.c.save();
    k.c.beginPath();
    k.c.moveTo(pA.x, pA.y);
    k.c.lineTo(pB.x, pB.y);
    k.c.lineTo(pC.x, pC.y);
    k.c.lineTo(pD.x, pD.y);
    k.c.closePath();

    if (isChallengeSuccess) {
        k.c.fillStyle = 'rgba(16, 185, 129, 0.28)';
        k.c.strokeStyle = '#10b981';
        k.c.lineWidth = 3;
    } else {
        k.c.fillStyle = 'rgba(99, 102, 241, 0.22)';
        k.c.strokeStyle = '#6366f1';
        k.c.lineWidth = 2.5;
    }
    k.c.fill();
    k.c.stroke();
    k.c.restore();

    // ── 7. Dik Açı Sembolleri ─────────────────────────────────────────
    if (!isIconSize(r)) {
        const drawSquareAngle = (p: { x: number; y: number }, v1: [number, number], v2: [number, number]) => {
            const sz = 9;
            const l1 = Math.hypot(v1[0], v1[1]);
            const l2 = Math.hypot(v2[0], v2[1]);
            if (l1 === 0 || l2 === 0) return;
            const u1 = { x: (v1[0] / l1) * sz, y: (-v1[1] / l1) * sz };
            const u2 = { x: (v2[0] / l2) * sz, y: (-v2[1] / l2) * sz };
            k.c.strokeStyle = '#38bdf8';
            k.c.lineWidth = 1.3;
            k.c.beginPath();
            k.c.moveTo(p.x + u1.x, p.y + u1.y);
            k.c.lineTo(p.x + u1.x + u2.x, p.y + u1.y + u2.y);
            k.c.lineTo(p.x + u2.x, p.y + u2.y);
            k.c.stroke();
        };

        if (quadInfo.isRightA) drawSquareAngle(pA, [B[0] - A[0], B[1] - A[1]], [D[0] - A[0], D[1] - A[1]]);
        if (quadInfo.isRightB) drawSquareAngle(pB, [A[0] - B[0], A[1] - B[1]], [C[0] - B[0], C[1] - B[1]]);
        if (quadInfo.isRightC) drawSquareAngle(pC, [B[0] - C[0], B[1] - C[1]], [D[0] - C[0], D[1] - C[1]]);
        if (quadInfo.isRightD) drawSquareAngle(pD, [C[0] - D[0], C[1] - D[1]], [A[0] - D[0], A[1] - D[1]]);
    }

    // ── 8. Eşit Kenar Çentikleri & Paralel Okları ─────────────────────
    if (s.showEqualSides === 1 && !isIconSize(r)) {
        const drawTick = (p1: { x: number; y: number }, p2: { x: number; y: number }, count = 1) => {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy);
            if (len === 0) return;
            const nx = (-dy / len) * 5;
            const ny = (dx / len) * 5;
            k.c.strokeStyle = '#f43f5e';
            k.c.lineWidth = 2;
            if (count === 1) {
                k.c.beginPath();
                k.c.moveTo(mx - nx, my - ny);
                k.c.lineTo(mx + nx, my + ny);
                k.c.stroke();
            } else {
                const offX = (dx / len) * 3;
                const offY = (dy / len) * 3;
                k.c.beginPath();
                k.c.moveTo(mx - offX - nx, my - offY - ny);
                k.c.lineTo(mx - offX + nx, my - offY + ny);
                k.c.moveTo(mx + offX - nx, my + offY - ny);
                k.c.lineTo(mx + offX + nx, my + offY + ny);
                k.c.stroke();
            }
        };

        const eq = (a: number, b: number) => Math.abs(a - b) < 0.05;
        const allEq = eq(quadInfo.l1, quadInfo.l2) && eq(quadInfo.l2, quadInfo.l3) && eq(quadInfo.l3, quadInfo.l4);
        if (allEq) {
            drawTick(pA, pB, 1);
            drawTick(pB, pC, 1);
            drawTick(pC, pD, 1);
            drawTick(pD, pA, 1);
        } else {
            if (eq(quadInfo.l1, quadInfo.l3)) {
                drawTick(pA, pB, 1);
                drawTick(pC, pD, 1);
            }
            if (eq(quadInfo.l2, quadInfo.l4)) {
                drawTick(pB, pC, 2);
                drawTick(pD, pA, 2);
            }
        }
    }

    if (s.showParallel === 1 && !isIconSize(r)) {
        const drawArrowMark = (p1: { x: number; y: number }, p2: { x: number; y: number }, count = 1) => {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            k.c.save();
            k.c.translate(mx, my);
            k.c.rotate(ang);
            k.c.strokeStyle = '#f59e0b';
            k.c.lineWidth = 2;
            if (count === 1) {
                k.c.beginPath();
                k.c.moveTo(-4, -4);
                k.c.lineTo(2, 0);
                k.c.lineTo(-4, 4);
                k.c.stroke();
            } else {
                k.c.beginPath();
                k.c.moveTo(-7, -4);
                k.c.lineTo(-1, 0);
                k.c.lineTo(-7, 4);
                k.c.moveTo(-1, -4);
                k.c.lineTo(5, 0);
                k.c.lineTo(-1, 4);
                k.c.stroke();
            }
            k.c.restore();
        };

        if (quadInfo.par13) {
            drawArrowMark(pA, pB, 1);
            drawArrowMark(pD, pC, 1);
        }
        if (quadInfo.par24) {
            drawArrowMark(pB, pC, 2);
            drawArrowMark(pA, pD, 2);
        }
    }

    // ── 9. Köşe Noktaları & Etiketleri ───────────────────────────────
    const pointsData = [
        { pt: pA, name: 'A', coord: A, color: '#38bdf8' },
        { pt: pB, name: 'B', coord: B, color: '#10b981' },
        { pt: pC, name: 'C', coord: C, color: '#f59e0b' },
        { pt: pD, name: 'D', coord: D, color: '#ec4899' },
    ];

    const cX = (pA.x + pB.x + pC.x + pD.x) / 4;
    const cY = (pA.y + pB.y + pC.y + pD.y) / 4;

    pointsData.forEach(({ pt, name, coord, color }) => {
        k.c.fillStyle = color;
        k.c.beginPath();
        k.c.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        k.c.fill();
        k.c.strokeStyle = '#ffffff';
        k.c.lineWidth = 1.5;
        k.c.stroke();

        if (!isIconSize(r)) {
            const coordStr = s.showCoords === 1 ? `(${coord[0]}, ${coord[1]})` : `(?, ?)`;
            const labelStr = `${name} ${coordStr}`;

            // Köşeden dışarı doğru yön vektörü (sürükleme tutamağının üstüne binmesin)
            const vX = pt.x - cX;
            const vY = pt.y - cY;
            const dist = Math.hypot(vX, vY) || 1;
            const labelX = pt.x + (vX / dist) * 26;
            const labelY = pt.y + (vY / dist) * 26;

            k.c.font = 'bold 10px sans-serif';
            const tw = k.c.measureText(labelStr).width;
            const th = 14;

            // Koyu mini rozet arka planı
            k.c.fillStyle = 'rgba(15, 20, 34, 0.88)';
            k.c.beginPath();
            k.c.roundRect(labelX - tw / 2 - 4, labelY - th / 2, tw + 8, th, 4);
            k.c.fill();
            k.c.strokeStyle = color;
            k.c.lineWidth = 1;
            k.c.stroke();

            k.c.fillStyle = '#ffffff';
            k.c.textAlign = 'center';
            k.c.textBaseline = 'middle';
            k.c.fillText(labelStr, labelX, labelY);
        }
    });

    // ── 10. Üst Bilgi Başlığı (Header) ────────────────────────────────
    // Renk paleti araç çubuğunun başlığın üstünü kapatmaması için y + 34'ten başlar.
    if (!isIconSize(r)) {
        k.c.fillStyle = 'rgba(15, 20, 34, 0.92)';
        k.c.beginPath();
        k.c.roundRect(r.x + 8, r.y + 34, r.w - 16, 32, 8);
        k.c.fill();
        k.c.strokeStyle = '#2d3748';
        k.c.lineWidth = 1;
        k.c.stroke();

        // Sol Rozet: Mod
        const modeLabel = isChallengeMode ? '🎯 GÖREV MODU' : '📍 SERBEST KEŞİF';
        k.c.fillStyle = isChallengeMode ? '#f59e0b' : '#38bdf8';
        k.c.font = 'bold 11px sans-serif';
        k.c.textAlign = 'left';
        k.c.textBaseline = 'middle';
        k.c.fillText(modeLabel, r.x + 18, r.y + 50);

        // Orta: Şekil Tanımı / Görev Hedefi
        if (isChallengeMode) {
            const targetStr = `Hedef: ${challenge.targetName}`;
            k.c.fillStyle = isChallengeSuccess ? '#10b981' : '#ffffff';
            k.c.font = 'bold 12px sans-serif';
            k.c.textAlign = 'center';
            k.c.fillText(
                isChallengeSuccess ? `🎉 Harika! ${targetStr} Tamamlandı!` : `${targetStr} (D Köşesini Taşı)`,
                r.x + r.w / 2,
                r.y + 50
            );
        } else {
            const shapeStr = s.showName === 1 ? quadInfo.name : 'Şekil: ? (Gizli)';
            k.c.fillStyle = s.showName === 1 ? '#a78bfa' : '#94a3b8';
            k.c.font = 'bold 12px sans-serif';
            k.c.textAlign = 'center';
            k.c.fillText(shapeStr, r.x + r.w / 2, r.y + 50);
        }

        // Sağ: Alan & Çevre
        k.c.fillStyle = '#94a3b8';
        k.c.font = '11px sans-serif';
        k.c.textAlign = 'right';
        const areaStr = `Alan: ${fmtNum(quadInfo.area, 1)} br² · Çevre: ${fmtNum(quadInfo.perimeter, 1)} br`;
        k.c.fillText(areaStr, r.x + r.w - 18, r.y + 50);
    }

    k.c.restore();
};

export const quadrilateralGridSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = quadState(o);
        const g = quadGeom(r, s);
        const isChallenge = s.mode === 1;

        const pA = g.p(s.ax, s.ay);
        const pB = g.p(s.bx, s.by);
        const pC = g.p(s.cx, s.cy);
        const pD = g.p(s.dx, s.dy);

        const out: SimControl[] = [];

        // Sürüklenebilir Köşe Kontrolleri
        if (!isChallenge) {
            out.push(
                { id: 'pt_a', x: pA.x, y: pA.y, type: 'drag', label: 'A' },
                { id: 'pt_b', x: pB.x, y: pB.y, type: 'drag', label: 'B' },
                { id: 'pt_c', x: pC.x, y: pC.y, type: 'drag', label: 'C' }
            );
        }
        // D noktası her iki modda da sürüklenebilir (görevde aranacak nokta)
        out.push({ id: 'pt_d', x: pD.x, y: pD.y, type: 'drag', label: 'D' });

        // Alt Araç Çubuğu Butonları — İki muntazam satıra bölünür, üst üste binmez
        const colW = (r.w - 28) / 4;
        const colX = (idx: number) => r.x + 14 + colW * (idx + 0.5);

        const by1 = r.y + r.h - 44; // 1. Satır
        const by2 = r.y + r.h - 16; // 2. Satır

        out.push(
            // ── 1. Satır: Temel Mod & Bilgi Kontrolleri ──
            {
                id: 'toggle_mode',
                x: colX(0),
                y: by1,
                type: 'toggle',
                label: s.mode === 0 ? '📍 Serbest' : '🎯 Görev',
                on: s.mode === 1,
            },
            {
                id: 'toggle_name',
                x: colX(1),
                y: by1,
                type: 'toggle',
                label: s.showName === 1 ? 'Şekil: Açık' : 'Şekil: ?',
                on: s.showName === 1,
            },
            {
                id: 'toggle_coords',
                x: colX(2),
                y: by1,
                type: 'toggle',
                label: s.showCoords === 1 ? 'Koord: Açık' : 'Koord: ?',
                on: s.showCoords === 1,
            },
            {
                id: 'btn_action',
                x: colX(3),
                y: by1,
                type: 'toggle',
                label: isChallenge ? 'Sonraki ➔' : '🎲 Rastgele',
                on: false,
            },

            // ── 2. Satır: Geometrik Özellik İşaretleri ──
            {
                id: 'toggle_equal',
                x: colX(0),
                y: by2,
                type: 'toggle',
                label: 'Eşit Kenar',
                on: s.showEqualSides === 1,
            },
            {
                id: 'toggle_parallel',
                x: colX(1),
                y: by2,
                type: 'toggle',
                label: 'Paralel Ok',
                on: s.showParallel === 1,
            },
            {
                id: 'toggle_diag',
                x: colX(2),
                y: by2,
                type: 'toggle',
                label: 'Köşegen',
                on: s.showDiagonals === 1,
            },
            {
                id: 'toggle_quadrant',
                x: colX(3),
                y: by2,
                type: 'toggle',
                label: s.quadrant === 0 ? '4 Bölge' : '1. Bölge',
                on: s.quadrant === 1,
            }
        );

        return out;
    },

    onControl: (r, o, id, p): Record<string, number> => {
        const s = quadState(o);
        const g = quadGeom(r, s);

        if (id.startsWith('pt_')) {
            const grid = g.toGrid(p.x, p.y);
            if (id === 'pt_a') return { ax: grid.x, ay: grid.y };
            if (id === 'pt_b') return { bx: grid.x, by: grid.y };
            if (id === 'pt_c') return { cx: grid.x, cy: grid.y };
            if (id === 'pt_d') return { dx: grid.x, dy: grid.y };
        }

        if (id === 'toggle_mode') {
            const nextMode = s.mode === 0 ? 1 : 0;
            if (nextMode === 1) {
                // Göreve geçerken o görevin başlangıç koordinatlarını yükle
                const ch = QUAD_CHALLENGES[s.challengeIdx];
                return {
                    mode: 1,
                    ax: ch.a[0],
                    ay: ch.a[1],
                    bx: ch.b[0],
                    by: ch.b[1],
                    cx: ch.c[0],
                    cy: ch.c[1],
                    dx: 0,
                    dy: 0,
                    showName: 1,
                };
            }
            return { mode: 0 };
        }

        if (id === 'toggle_name') return { showName: s.showName === 1 ? 0 : 1 };
        if (id === 'toggle_coords') return { showCoords: s.showCoords === 1 ? 0 : 1 };
        if (id === 'toggle_equal') return { showEqualSides: s.showEqualSides === 1 ? 0 : 1 };
        if (id === 'toggle_parallel') return { showParallel: s.showParallel === 1 ? 0 : 1 };
        if (id === 'toggle_diag') return { showDiagonals: s.showDiagonals === 1 ? 0 : 1 };
        if (id === 'toggle_quadrant') return { quadrant: s.quadrant === 0 ? 1 : 0 };

        if (id === 'btn_action') {
            if (s.mode === 1) {
                const nextIdx = (s.challengeIdx + 1) % QUAD_CHALLENGES.length;
                const ch = QUAD_CHALLENGES[nextIdx];
                return {
                    challengeIdx: nextIdx,
                    ax: ch.a[0],
                    ay: ch.a[1],
                    bx: ch.b[0],
                    by: ch.b[1],
                    cx: ch.c[0],
                    cy: ch.c[1],
                    dx: 0,
                    dy: 0,
                };
            } else {
                const rand = QUAD_RANDOM_PRESETS[Math.floor(Math.random() * QUAD_RANDOM_PRESETS.length)];
                return {
                    ax: rand.a[0],
                    ay: rand.a[1],
                    bx: rand.b[0],
                    by: rand.b[1],
                    cx: rand.c[0],
                    cy: rand.c[1],
                    dx: rand.d[0],
                    dy: rand.d[1],
                    showName: 0,
                };
            }
        }

        return {};
    },
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const GEOMETRY_SIM_RENDERERS: Record<string, Renderer> = {
    transform_sim: transformRender,
    net_fold_sim: netFoldRender,
    angles_sim: anglesRender,
    pythagoras_sim: pythagorasRender,
    quadrilateral_grid_sim: quadrilateralGridRender,
};

export const GEOMETRY_SIM_SPECS: Record<string, SimSpec> = {
    transform_sim: transformSpec,
    net_fold_sim: netFoldSpec,
    angles_sim: anglesSpec,
    pythagoras_sim: pythagorasSpec,
    quadrilateral_grid_sim: quadrilateralGridSpec,
};

export const GEOMETRY_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'quadrilateral_grid_sim',
        label: 'Koordinat Düzleminde Dörtgenler',
        hint: 'Köşeleri sürükle, dörtgen türünü tanı ve eksik köşe görevlerini çöz',
        size: { w: 640, h: 480 },
        defaults: {
            labels: true,
            sim: {
                ax: -3,
                ay: 3,
                bx: 3,
                by: 3,
                cx: 3,
                cy: -2,
                dx: -3,
                dy: -2,
                quadrant: 0,
                showName: 1,
                showCoords: 1,
                showEqualSides: 1,
                showParallel: 1,
                showDiagonals: 0,
                mode: 0,
                challengeIdx: 0,
            },
        },
    },
    {
        kind: 'transform_sim',
        label: 'Dönüşüm Geometrisi',
        hint: 'Öteleme, yansıma ve döndürmeyi koordinat düzleminde karşılaştır',
        size: { w: 520, h: 360 },
        defaults: { labels: true, sim: { mode: 0, dx: 2, dy: -3, axis: 0, angle: 90 } },
    },
    {
        kind: 'net_fold_sim',
        label: 'Cisim Açınımı',
        hint: 'Açınımı katla; küp, prizma ve piramit oluşsun',
        size: { w: 460, h: 360 },
        defaults: { labels: true, sim: { shape: 0, fold: 0, play: 0 } },
    },
    {
        kind: 'angles_sim',
        label: 'Açı İlişkileri',
        hint: 'Paralel doğrular ve kesen: yöndeş, ters, iç ters ve iç yan açılar',
        size: { w: 500, h: 340 },
        defaults: { labels: true, sim: { theta: 55, pair: 0 } },
    },
    {
        kind: 'pythagoras_sim',
        label: 'Pisagor Bağıntısı',
        hint: 'Dik kenarları sürükle; kare alanlarının eşitliğini gör',
        size: { w: 480, h: 400 },
        defaults: { labels: true, sim: { a: 3, b: 4 } },
    },
];
