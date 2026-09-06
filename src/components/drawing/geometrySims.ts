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

// ── Kayıt ────────────────────────────────────────────────────────────

export const GEOMETRY_SIM_RENDERERS: Record<string, Renderer> = {
    transform_sim: transformRender,
    net_fold_sim: netFoldRender,
    angles_sim: anglesRender,
    pythagoras_sim: pythagorasRender,
};

export const GEOMETRY_SIM_SPECS: Record<string, SimSpec> = {
    transform_sim: transformSpec,
    net_fold_sim: netFoldSpec,
    angles_sim: anglesSpec,
    pythagoras_sim: pythagorasSpec,
};

export const GEOMETRY_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
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
