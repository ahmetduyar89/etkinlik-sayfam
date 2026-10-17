// src/components/drawing/labelSets.ts
// "Şema Etiketleme" nesnesinin diyagram kütüphanesi.
//
// Her şema bir çizim fonksiyonu ve yuva listesinden oluşur; sim mantığı
// scienceSims.ts'tedir. Yeni bir şema eklemek için buraya bir kayıt yazmak
// yeterlidir — kontrol, kılavuz çizgisi ve puanlama ortaktır.

import { line, path, roundRect, withAlpha, type Ctx, type Rect } from './objectDrawing';

export interface LabelSlot {
    /** Şemadaki hedef nokta (çizim kutusuna göre 0..1). */
    px: number;
    py: number;
    /** Rozetin oturacağı yer (şema alanına göre 0..1). */
    lx: number;
    ly: number;
    text: string;
}

export interface LabelSet {
    title: string;
    draw: (k: Ctx, b: Rect) => void;
    slots: ReadonlyArray<LabelSlot>;
}

/** Çizim kutusuna göre 0..1 koordinatı ekran noktasına çevirir. */
export const rel = (b: Rect, x: number, y: number) => ({ x: b.x + b.w * x, y: b.y + b.h * y });

/** Dolu ama saydam bir bölge: organ ve katman gövdeleri için. */
function fill(k: Ctx, build: () => void, alpha = 0.12) {
    k.c.save();
    k.c.globalAlpha = alpha;
    k.c.beginPath();
    build();
    k.c.fill();
    k.c.restore();
}

function drawAnimalCell(k: Ctx, b: Rect) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    k.c.lineWidth = k.lw;
    // Hücre zarı
    k.c.beginPath();
    k.c.ellipse(cx, cy, b.w * 0.44, b.h * 0.4, 0, 0, Math.PI * 2);
    k.c.stroke();
    fill(k, () => k.c.ellipse(cx, cy, b.w * 0.44, b.h * 0.4, 0, 0, Math.PI * 2), 0.07);
    // Çekirdek ve çekirdekçik
    const nR = Math.min(b.w, b.h) * 0.15;
    k.c.beginPath();
    k.c.arc(cx - b.w * 0.04, cy, nR, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(cx - b.w * 0.04, cy, nR * 0.35, 0, Math.PI * 2);
    k.c.fill();
    // Mitokondri
    k.c.save();
    k.c.translate(cx + b.w * 0.2, cy - b.h * 0.2);
    k.c.rotate(-0.5);
    k.c.beginPath();
    k.c.ellipse(0, 0, b.w * 0.12, b.h * 0.06, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    for (let i = -2; i <= 2; i++) {
        k.c.moveTo(i * b.w * 0.04, -b.h * 0.05);
        k.c.lineTo(i * b.w * 0.04 + b.w * 0.02, b.h * 0.05);
    }
    k.c.stroke();
    k.c.restore();
    // Ribozomlar
    for (const [rx, ry] of [
        [0.28, 0.62],
        [0.34, 0.7],
        [0.24, 0.72],
        [0.66, 0.66],
    ]) {
        const p = rel(b, rx, ry);
        k.c.beginPath();
        k.c.arc(p.x, p.y, Math.min(b.w, b.h) * 0.018, 0, Math.PI * 2);
        k.c.fill();
    }
}

function drawPlantCell(k: Ctx, b: Rect) {
    k.c.lineWidth = k.lw;
    // Hücre çeperi ve içindeki hücre zarı
    roundRect(k, b.x + b.w * 0.05, b.y + b.h * 0.1, b.w * 0.9, b.h * 0.8, Math.min(b.w, b.h) * 0.08);
    k.c.stroke();
    roundRect(k, b.x + b.w * 0.09, b.y + b.h * 0.15, b.w * 0.82, b.h * 0.7, Math.min(b.w, b.h) * 0.07);
    k.c.stroke();
    fill(k, () => roundRect(k, b.x + b.w * 0.09, b.y + b.h * 0.15, b.w * 0.82, b.h * 0.7, 8), 0.06);
    // Koful
    k.c.beginPath();
    k.c.ellipse(b.x + b.w * 0.42, b.y + b.h * 0.52, b.w * 0.2, b.h * 0.24, 0, 0, Math.PI * 2);
    k.c.stroke();
    // Çekirdek
    k.c.beginPath();
    k.c.arc(b.x + b.w * 0.72, b.y + b.h * 0.35, Math.min(b.w, b.h) * 0.11, 0, Math.PI * 2);
    k.c.stroke();
    // Kloroplastlar
    for (const [rx, ry] of [
        [0.22, 0.3],
        [0.7, 0.68],
        [0.28, 0.74],
    ]) {
        const p = rel(b, rx, ry);
        k.c.save();
        k.c.translate(p.x, p.y);
        k.c.rotate(0.6);
        k.c.beginPath();
        k.c.ellipse(0, 0, b.w * 0.07, b.h * 0.04, 0, 0, Math.PI * 2);
        k.c.stroke();
        fill(k, () => k.c.ellipse(0, 0, b.w * 0.07, b.h * 0.04, 0, 0, Math.PI * 2), 0.25);
        k.c.restore();
    }
}

function drawCircuit(k: Ctx, b: Rect) {
    const x1 = b.x + b.w * 0.14;
    const x2 = b.x + b.w * 0.86;
    const y1 = b.y + b.h * 0.22;
    const y2 = b.y + b.h * 0.78;
    k.c.lineWidth = k.lw;
    // Tel: ampul üstte, pil altta, anahtar sağda olacak şekilde kesikli çerçeve
    line(k, x1, y1, b.x + b.w * 0.42, y1);
    line(k, b.x + b.w * 0.58, y1, x2, y1);
    line(k, x1, y1, x1, y2);
    line(k, x1, y2, b.x + b.w * 0.4, y2);
    line(k, b.x + b.w * 0.6, y2, x2, y2);
    line(k, x2, y1, x2, b.y + b.h * 0.42);
    line(k, x2, b.y + b.h * 0.62, x2, y2);
    // Ampul
    const bx = b.x + b.w * 0.5;
    const br = Math.min(b.w, b.h) * 0.09;
    k.c.beginPath();
    k.c.arc(bx, y1, br, 0, Math.PI * 2);
    k.c.stroke();
    line(k, bx - br * 0.7, y1 - br * 0.7, bx + br * 0.7, y1 + br * 0.7);
    line(k, bx - br * 0.7, y1 + br * 0.7, bx + br * 0.7, y1 - br * 0.7);
    // Pil (uzun-kısa çizgi çifti)
    const gap = b.w * 0.03;
    line(k, bx - gap, y2 - b.h * 0.09, bx - gap, y2 + b.h * 0.09);
    line(k, bx + gap, y2 - b.h * 0.045, bx + gap, y2 + b.h * 0.045);
    // Anahtar (açık)
    for (const y of [0.42, 0.62]) {
        const p = rel(b, 0.86, y);
        k.c.beginPath();
        k.c.arc(p.x, p.y, Math.min(b.w, b.h) * 0.012, 0, Math.PI * 2);
        k.c.fill();
    }
    path(k, [
        [x2, b.y + b.h * 0.42],
        [x2 + b.w * 0.08, b.y + b.h * 0.58],
    ]);
}

function drawDigestive(k: Ctx, b: Rect) {
    k.c.lineWidth = k.lw;
    // Gövde
    roundRect(k, b.x + b.w * 0.14, b.y + b.h * 0.04, b.w * 0.72, b.h * 0.92, b.w * 0.16);
    k.c.stroke();
    const cx = b.x + b.w * 0.5;
    // Yemek borusu: yukarıdan mideye inen çift çizgi
    line(k, cx - b.w * 0.035, b.y + b.h * 0.08, cx - b.w * 0.035, b.y + b.h * 0.33);
    line(k, cx + b.w * 0.005, b.y + b.h * 0.08, cx + b.w * 0.005, b.y + b.h * 0.33);
    // Mide (fasulye), gövdenin sol yarısında
    k.c.save();
    k.c.translate(cx - b.w * 0.1, b.y + b.h * 0.42);
    k.c.rotate(0.4);
    k.c.beginPath();
    k.c.ellipse(0, 0, b.w * 0.15, b.h * 0.11, 0, 0, Math.PI * 2);
    k.c.stroke();
    fill(k, () => k.c.ellipse(0, 0, b.w * 0.15, b.h * 0.11, 0, 0, Math.PI * 2), 0.14);
    k.c.restore();
    // Karaciğer: sağ üstte, mideye komşu
    path(
        k,
        [
            [cx + b.w * 0.06, b.y + b.h * 0.28],
            [cx + b.w * 0.3, b.y + b.h * 0.3],
            [cx + b.w * 0.22, b.y + b.h * 0.44],
            [cx + b.w * 0.06, b.y + b.h * 0.4],
        ],
        true,
    );
    fill(
        k,
        () => {
            k.c.moveTo(cx + b.w * 0.06, b.y + b.h * 0.28);
            k.c.lineTo(cx + b.w * 0.3, b.y + b.h * 0.3);
            k.c.lineTo(cx + b.w * 0.22, b.y + b.h * 0.44);
            k.c.lineTo(cx + b.w * 0.06, b.y + b.h * 0.4);
        },
        0.1,
    );
    // Kalın bağırsak: ince bağırsağı saran ters U
    path(k, [
        [cx - b.w * 0.28, b.y + b.h * 0.9],
        [cx - b.w * 0.28, b.y + b.h * 0.58],
        [cx + b.w * 0.28, b.y + b.h * 0.58],
        [cx + b.w * 0.28, b.y + b.h * 0.9],
    ]);
    // İnce bağırsak: çerçevenin içinde kıvrımlar
    const coil: Array<[number, number]> = [];
    for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        coil.push([
            cx - b.w * 0.18 + b.w * 0.36 * t,
            b.y + b.h * (0.72 + 0.11 * Math.sin(t * Math.PI * 4)),
        ]);
    }
    path(k, coil);
}

function drawFlower(k: Ctx, b: Rect) {
    const cx = b.x + b.w * 0.5;
    const baseY = b.y + b.h * 0.78;
    const unit = Math.min(b.w, b.h);
    k.c.lineWidth = k.lw;

    // Taç yapraklar: tabandan yukarı-dışa açılan iki büyük yaprak
    for (const s2 of [-1, 1]) {
        k.c.save();
        k.c.translate(cx + s2 * b.w * 0.19, baseY - b.h * 0.24);
        k.c.rotate(s2 * 0.85);
        k.c.beginPath();
        k.c.ellipse(0, 0, unit * 0.24, unit * 0.085, 0, 0, Math.PI * 2);
        k.c.stroke();
        fill(k, () => k.c.ellipse(0, 0, unit * 0.24, unit * 0.085, 0, 0, Math.PI * 2), 0.1);
        k.c.restore();
    }

    // Erkek organ: ince sap ve ucundaki başçık
    for (const s2 of [-1, 1]) {
        const tipX = cx + s2 * b.w * 0.11;
        const tipY = baseY - b.h * 0.3;
        line(k, cx + s2 * b.w * 0.02, baseY - b.h * 0.06, tipX, tipY, 1.2);
        k.c.save();
        k.c.translate(tipX, tipY);
        k.c.rotate(s2 * 0.6);
        k.c.beginPath();
        k.c.ellipse(0, 0, unit * 0.055, unit * 0.028, 0, 0, Math.PI * 2);
        k.c.stroke();
        fill(k, () => k.c.ellipse(0, 0, unit * 0.055, unit * 0.028, 0, 0, Math.PI * 2), 0.3);
        k.c.restore();
    }

    // Dişi organ: yumurtalık, boyun ve tepecik
    k.c.beginPath();
    k.c.ellipse(cx, baseY - b.h * 0.04, unit * 0.055, unit * 0.05, 0, 0, Math.PI * 2);
    k.c.stroke();
    line(k, cx, baseY - b.h * 0.08, cx, baseY - b.h * 0.42, Math.max(1.5, k.lw));
    k.c.beginPath();
    k.c.ellipse(cx, baseY - b.h * 0.45, unit * 0.05, unit * 0.03, 0, 0, Math.PI * 2);
    k.c.stroke();
    fill(k, () => k.c.ellipse(cx, baseY - b.h * 0.45, unit * 0.05, unit * 0.03, 0, 0, Math.PI * 2), 0.25);

    // Çanak yapraklar: tabandan aşağı-dışa uzanan iki küçük yaprak
    for (const s2 of [-1, 1]) {
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.moveTo(cx + s2 * b.w * 0.02, baseY - b.h * 0.01);
        k.c.quadraticCurveTo(
            cx + s2 * b.w * 0.2,
            baseY + b.h * 0.01,
            cx + s2 * b.w * 0.12,
            baseY + b.h * 0.09,
        );
        k.c.quadraticCurveTo(
            cx + s2 * b.w * 0.06,
            baseY + b.h * 0.05,
            cx + s2 * b.w * 0.02,
            baseY - b.h * 0.01,
        );
        k.c.stroke();
    }
    // Sap
    line(k, cx, baseY + b.h * 0.03, cx, b.y + b.h * 0.98, Math.max(1.6, k.lw));
}

function drawEye(k: Ctx, b: Rect) {
    const cx = b.x + b.w * 0.55;
    const cy = b.y + b.h * 0.5;
    const R = Math.min(b.w * 0.3, b.h * 0.4);
    k.c.lineWidth = k.lw;
    // Göz küresi (kornea tarafı solda açık bırakılır)
    k.c.beginPath();
    k.c.arc(cx, cy, R, -Math.PI * 0.78, Math.PI * 0.78);
    k.c.stroke();
    // Kornea: öndeki şeffaf kubbe
    k.c.beginPath();
    k.c.arc(cx - R * 0.72, cy, R * 0.55, Math.PI * 0.62, Math.PI * 1.38);
    k.c.stroke();
    // İris ve gözbebeği
    for (const s of [-1, 1]) {
        line(k, cx - R * 0.55, cy + s * R * 0.52, cx - R * 0.42, cy + s * R * 0.26, 1.4);
    }
    // Mercek
    k.c.beginPath();
    k.c.ellipse(cx - R * 0.42, cy, R * 0.13, R * 0.26, 0, 0, Math.PI * 2);
    k.c.stroke();
    fill(k, () => k.c.ellipse(cx - R * 0.42, cy, R * 0.13, R * 0.26, 0, 0, Math.PI * 2), 0.14);
    // Retina: arka iç yüzey
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.75);
    k.c.beginPath();
    k.c.arc(cx, cy, R * 0.86, -Math.PI * 0.42, Math.PI * 0.42);
    k.c.stroke();
    k.c.restore();
    // Göz siniri
    line(k, cx + R * 0.95, cy + R * 0.2, cx + R * 1.5, cy + R * 0.42, Math.max(1.5, k.lw));
    line(k, cx + R * 0.98, cy - R * 0.05, cx + R * 1.5, cy + R * 0.2, Math.max(1.5, k.lw));
}

function drawEarthLayers(k: Ctx, b: Rect) {
    const cx = b.x + b.w * 0.5;
    const cy = b.y + b.h * 0.52;
    const R = Math.min(b.w * 0.42, b.h * 0.46);
    k.c.lineWidth = k.lw;
    // İçten dışa dört katman
    // Yarıçaplar gerçek oranları kabaca yansıtır: kabuk ince, manto kalın.
    for (const f of [1, 0.96, 0.55, 0.25]) {
        k.c.beginPath();
        k.c.arc(cx, cy, R * f, 0, Math.PI * 2);
        k.c.stroke();
    }
    fill(k, () => k.c.arc(cx, cy, R * 0.25, 0, Math.PI * 2), 0.3);
    fill(k, () => k.c.arc(cx, cy, R * 0.55, 0, Math.PI * 2), 0.1);
}

function drawSolarSystem(k: Ctx, b: Rect) {
    const sunX = b.x + b.w * 0.08;
    const cy = b.y + b.h * 0.5;
    const sunR = Math.min(b.w * 0.07, b.h * 0.16);
    k.c.lineWidth = k.lw;
    // Güneş
    k.c.beginPath();
    k.c.arc(sunX, cy, sunR, -Math.PI / 2, Math.PI / 2);
    k.c.stroke();
    for (let i = -2; i <= 2; i++) {
        const a = (i * Math.PI) / 7;
        line(k, sunX + sunR * 1.15 * Math.cos(a), cy + sunR * 1.15 * Math.sin(a), sunX + sunR * 1.5 * Math.cos(a), cy + sunR * 1.5 * Math.sin(a), 1);
    }
    // Gezegenler: dördü iç, dördü dış; aralarında asteroit kuşağı
    const inner = [0.2, 0.28, 0.36, 0.44];
    const outer = [0.62, 0.72, 0.82, 0.92];
    inner.forEach((f, i) => {
        const p = rel(b, f, 0.5);
        k.c.beginPath();
        k.c.arc(p.x, p.y, Math.min(b.w, b.h) * (0.022 + i * 0.004), 0, Math.PI * 2);
        k.c.stroke();
    });
    outer.forEach((f, i) => {
        const p = rel(b, f, 0.5);
        k.c.beginPath();
        k.c.arc(p.x, p.y, Math.min(b.w, b.h) * (0.06 - i * 0.008), 0, Math.PI * 2);
        k.c.stroke();
    });
    // Asteroit kuşağı
    k.c.save();
    k.c.fillStyle = withAlpha(k.color, 0.7);
    for (let i = 0; i < 26; i++) {
        const f = 0.5 + ((i * 7) % 5) * 0.012;
        const p = rel(b, f, 0.5 + Math.sin(i * 1.7) * 0.2);
        k.c.beginPath();
        k.c.arc(p.x, p.y, Math.min(b.w, b.h) * 0.007, 0, Math.PI * 2);
        k.c.fill();
    }
    k.c.restore();
}

export const LABEL_SETS: ReadonlyArray<LabelSet> = [
    {
        title: 'Hayvan Hücresi',
        draw: drawAnimalCell,
        slots: [
            { px: 0.7, py: 0.3, lx: 0.88, ly: 0.14, text: 'Mitokondri' },
            { px: 0.94, py: 0.5, lx: 0.88, ly: 0.5, text: 'Hücre zarı' },
            { px: 0.3, py: 0.35, lx: 0.12, ly: 0.14, text: 'Sitoplazma' },
            { px: 0.46, py: 0.5, lx: 0.12, ly: 0.5, text: 'Çekirdek' },
            { px: 0.3, py: 0.7, lx: 0.12, ly: 0.85, text: 'Ribozom' },
        ],
    },
    {
        title: 'Bitki Hücresi',
        draw: drawPlantCell,
        slots: [
            { px: 0.05, py: 0.35, lx: 0.12, ly: 0.14, text: 'Hücre çeperi' },
            { px: 0.42, py: 0.52, lx: 0.12, ly: 0.5, text: 'Koful' },
            { px: 0.09, py: 0.72, lx: 0.12, ly: 0.85, text: 'Hücre zarı' },
            { px: 0.72, py: 0.35, lx: 0.88, ly: 0.14, text: 'Çekirdek' },
            { px: 0.7, py: 0.68, lx: 0.88, ly: 0.6, text: 'Kloroplast' },
        ],
    },
    {
        title: 'Basit Elektrik Devresi',
        draw: drawCircuit,
        slots: [
            { px: 0.5, py: 0.22, lx: 0.12, ly: 0.14, text: 'Ampul' },
            { px: 0.14, py: 0.5, lx: 0.12, ly: 0.5, text: 'İletken tel' },
            { px: 0.5, py: 0.78, lx: 0.12, ly: 0.85, text: 'Pil' },
            { px: 0.9, py: 0.52, lx: 0.88, ly: 0.45, text: 'Anahtar' },
        ],
    },
    {
        title: 'Sindirim Sistemi',
        draw: drawDigestive,
        slots: [
            { px: 0.485, py: 0.2, lx: 0.12, ly: 0.14, text: 'Yemek borusu' },
            { px: 0.4, py: 0.42, lx: 0.12, ly: 0.5, text: 'Mide' },
            { px: 0.5, py: 0.76, lx: 0.12, ly: 0.85, text: 'İnce bağırsak' },
            { px: 0.66, py: 0.34, lx: 0.88, ly: 0.14, text: 'Karaciğer' },
            { px: 0.78, py: 0.62, lx: 0.88, ly: 0.6, text: 'Kalın bağırsak' },
        ],
    },
    {
        title: 'Çiçeğin Kısımları',
        draw: drawFlower,
        slots: [
            { px: 0.5, py: 0.33, lx: 0.12, ly: 0.14, text: 'Dişi organ' },
            { px: 0.39, py: 0.48, lx: 0.12, ly: 0.5, text: 'Erkek organ' },
            { px: 0.26, py: 0.52, lx: 0.12, ly: 0.85, text: 'Taç yaprak' },
            { px: 0.66, py: 0.82, lx: 0.88, ly: 0.4, text: 'Çanak yaprak' },
            { px: 0.5, py: 0.94, lx: 0.88, ly: 0.76, text: 'Sap' },
        ],
    },
    {
        title: 'Göz',
        draw: drawEye,
        slots: [
            { px: 0.22, py: 0.5, lx: 0.12, ly: 0.14, text: 'Kornea' },
            { px: 0.37, py: 0.5, lx: 0.12, ly: 0.5, text: 'Göz merceği' },
            { px: 0.42, py: 0.68, lx: 0.12, ly: 0.85, text: 'İris' },
            { px: 0.78, py: 0.5, lx: 0.88, ly: 0.3, text: 'Retina' },
            { px: 0.93, py: 0.62, lx: 0.88, ly: 0.72, text: 'Göz siniri' },
        ],
    },
    {
        title: 'Dünya’nın Katmanları',
        draw: drawEarthLayers,
        slots: [
            { px: 0.5, py: 0.14, lx: 0.12, ly: 0.16, text: 'Yer kabuğu' },
            { px: 0.5, py: 0.23, lx: 0.12, ly: 0.62, text: 'Manto' },
            { px: 0.5, py: 0.36, lx: 0.88, ly: 0.16, text: 'Dış çekirdek' },
            { px: 0.5, py: 0.49, lx: 0.88, ly: 0.62, text: 'İç çekirdek' },
        ],
    },
    {
        title: 'Güneş Sistemi',
        draw: drawSolarSystem,
        slots: [
            { px: 0.08, py: 0.5, lx: 0.12, ly: 0.16, text: 'Güneş' },
            { px: 0.32, py: 0.5, lx: 0.12, ly: 0.62, text: 'İç gezegenler' },
            { px: 0.51, py: 0.3, lx: 0.88, ly: 0.16, text: 'Asteroit kuşağı' },
            { px: 0.82, py: 0.5, lx: 0.88, ly: 0.62, text: 'Dış gezegenler' },
        ],
    },
];

/** En çok yuvası olan şema; sıfırlama her şemayı kapsamalı. */
export const MAX_SLOTS = Math.max(...LABEL_SETS.map((set) => set.slots.length));
