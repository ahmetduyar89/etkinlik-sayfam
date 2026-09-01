// src/components/drawing/scienceObjects.ts
// Yazma alanına tek dokunuşla eklenebilen hazır fen nesneleri:
// laboratuvar malzemeleri, devre elemanları, optik düzenekler, kuvvet
// şemaları, atom/hücre modelleri.
//
// Çizim altyapısı matematik kütüphanesiyle ortaktır (objectDrawing.ts):
// her nesne kendisine verilen dikdörtgenin içine çizilir.

import type { MathObjectKind } from '../../types';
import {
    arrow,
    clampInt,
    ellipse,
    fillShape,
    inset,
    label,
    line,
    path,
    withAlpha,
    type Ctx,
    type ObjectCategory,
    type Renderer,
} from './objectDrawing';

/** Cam malzemelerde sıvı seviyesi ve ölçek çizgileri için ortak yardımcı. */
function graduations(k: Ctx, x: number, top: number, bottom: number, width: number, count = 5) {
    const step = (bottom - top) / count;
    for (let i = 1; i < count; i++) {
        const y = bottom - i * step;
        line(k, x, y, x + width * (i % 2 === 0 ? 1 : 0.6), y, 1);
    }
}

// ── Laboratuvar ──────────────────────────────────────────────────────

const beaker: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.5);
    const fill = clampInt(k.o.k, 0, 100, 60) / 100;
    const lipH = r.h * 0.08;
    const top = r.y + lipH;
    const bottom = r.y + r.h;
    const left = r.x + r.w * 0.12;
    const right = r.x + r.w * 0.88;
    // Ağız ve akıtacak
    path(k, [
        [left - r.w * 0.06, r.y],
        [left, top],
        [left, bottom],
        [right, bottom],
        [right, top],
        [right + r.w * 0.06, r.y],
    ]);
    const level = bottom - (bottom - top) * fill;
    fillShape(k, () => {
        k.c.rect(left, level, right - left, bottom - level);
    });
    line(k, left, level, right, level, Math.max(1, k.lw));
    graduations(k, right - r.w * 0.16, top + (bottom - top) * 0.1, bottom - 4, r.w * 0.1);
    if (k.o.labels !== false) label(k, `${clampInt(k.o.k, 0, 100, 60)} mL`, (left + right) / 2, level + k.fs, 'center', 'middle', 0.8);
};

const flask: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.4);
    const fill = clampInt(k.o.k, 0, 100, 55) / 100;
    const neckW = r.w * 0.22;
    const cx = r.x + r.w / 2;
    const neckTop = r.y;
    const neckBottom = r.y + r.h * 0.3;
    const bottom = r.y + r.h;
    const left = r.x + r.w * 0.06;
    const right = r.x + r.w * 0.94;
    path(k, [
        [cx - neckW / 2, neckTop],
        [cx - neckW / 2, neckBottom],
        [left, bottom],
        [right, bottom],
        [cx + neckW / 2, neckBottom],
        [cx + neckW / 2, neckTop],
    ]);
    line(k, left, bottom, right, bottom);
    // Sıvı, koni gövdenin içini doldurur.
    const level = bottom - (bottom - neckBottom) * fill;
    const halfAt = (y: number) =>
        (neckW / 2) + ((right - left) / 2 - neckW / 2) * ((y - neckBottom) / (bottom - neckBottom));
    fillShape(k, () => {
        k.c.moveTo(cx - halfAt(level), level);
        k.c.lineTo(cx + halfAt(level), level);
        k.c.lineTo(right, bottom);
        k.c.lineTo(left, bottom);
        k.c.closePath();
    });
    line(k, cx - halfAt(level), level, cx + halfAt(level), level, Math.max(1, k.lw));
    if (k.o.labels !== false) label(k, 'erlen', cx, bottom - k.fs * 0.9, 'center', 'middle', 0.75);
};

const graduated_cylinder: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.4);
    const fill = clampInt(k.o.k, 0, 100, 65) / 100;
    const w = Math.min(r.w * 0.5, r.h * 0.28);
    const cx = r.x + r.w / 2;
    const left = cx - w / 2;
    const right = cx + w / 2;
    const top = r.y + r.h * 0.06;
    const bottom = r.y + r.h * 0.9;
    k.c.lineWidth = k.lw;
    k.c.strokeRect(left, top, w, bottom - top);
    // Taban ayağı
    path(k, [
        [cx - w * 0.9, r.y + r.h],
        [cx - w * 0.35, bottom],
        [cx + w * 0.35, bottom],
        [cx + w * 0.9, r.y + r.h],
    ]);
    line(k, cx - w * 0.9, r.y + r.h, cx + w * 0.9, r.y + r.h);
    const level = bottom - (bottom - top) * fill;
    fillShape(k, () => k.c.rect(left, level, w, bottom - level));
    line(k, left, level, right, level, Math.max(1, k.lw));
    graduations(k, left, top, bottom, w * 0.45, 10);
    if (k.o.labels !== false) label(k, 'mL', right + k.fs * 0.5, top + k.fs * 0.6, 'left', 'middle', 0.75);
};

const test_tube: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.3, k.fs * 0.3);
    const fill = clampInt(k.o.k, 0, 100, 55) / 100;
    const w = Math.min(r.w * 0.42, r.h * 0.22);
    const cx = r.x + r.w / 2;
    const left = cx - w / 2;
    const right = cx + w / 2;
    const top = r.y;
    const bottom = r.y + r.h - w / 2;
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.moveTo(left, top);
    k.c.lineTo(left, bottom);
    k.c.arc(cx, bottom, w / 2, Math.PI, 0, true);
    k.c.lineTo(right, top);
    k.c.stroke();
    // Ağız halkası
    ellipse(k, cx, top, w / 2, w * 0.16);
    const level = bottom - (bottom - top) * fill * 0.9;
    fillShape(k, () => {
        k.c.moveTo(left, level);
        k.c.lineTo(left, bottom);
        k.c.arc(cx, bottom, w / 2, Math.PI, 0, true);
        k.c.lineTo(right, level);
        k.c.closePath();
    });
    line(k, left, level, right, level, Math.max(1, k.lw));
};

const heating_setup: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.4);
    const cx = r.x + r.w / 2;
    const base = r.y + r.h;
    // Üçayak
    const tripodTop = r.y + r.h * 0.52;
    const legSpread = r.w * 0.32;
    line(k, cx - legSpread, tripodTop, cx + legSpread, tripodTop);
    line(k, cx - legSpread * 0.85, tripodTop, cx - legSpread, base);
    line(k, cx + legSpread * 0.85, tripodTop, cx + legSpread, base);
    // Tel kafes
    line(k, cx - legSpread * 0.75, tripodTop - 3, cx + legSpread * 0.75, tripodTop - 3, Math.max(1, k.lw * 0.8));
    // Beher
    const bw = r.w * 0.4;
    const bh = r.h * 0.34;
    const bx = cx - bw / 2;
    const by = tripodTop - 4 - bh;
    path(k, [
        [bx - bw * 0.06, by],
        [bx, by + bh * 0.1],
        [bx, by + bh],
        [bx + bw, by + bh],
        [bx + bw, by + bh * 0.1],
        [bx + bw * 1.06, by],
    ]);
    fillShape(k, () => k.c.rect(bx, by + bh * 0.45, bw, bh * 0.55));
    // Bek: gövde ve alev
    const burnerTop = tripodTop + r.h * 0.16;
    path(k, [
        [cx - r.w * 0.05, base - 4],
        [cx - r.w * 0.05, burnerTop],
        [cx + r.w * 0.05, burnerTop],
        [cx + r.w * 0.05, base - 4],
    ]);
    line(k, cx - r.w * 0.14, base - 4, cx + r.w * 0.14, base - 4);
    // Alev: damla biçimli, hafif dolgulu.
    const flameH = r.h * 0.2;
    k.c.save();
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.moveTo(cx - r.w * 0.048, burnerTop);
    k.c.quadraticCurveTo(cx - r.w * 0.055, burnerTop - flameH * 0.7, cx, burnerTop - flameH);
    k.c.quadraticCurveTo(cx + r.w * 0.055, burnerTop - flameH * 0.7, cx + r.w * 0.048, burnerTop);
    k.c.closePath();
    k.c.globalAlpha = 0.18;
    k.c.fill();
    k.c.globalAlpha = 1;
    k.c.stroke();
    k.c.restore();
};

const thermometer: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 0.4);
    const value = clampInt(k.o.k, -20, 120, 40);
    const cx = r.x + r.w * 0.4;
    const w = Math.min(r.w * 0.22, 16);
    const bulbR = w * 0.95;
    const top = r.y;
    const bottom = r.y + r.h - bulbR * 2;
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.moveTo(cx - w / 2, bottom);
    k.c.lineTo(cx - w / 2, top + w / 2);
    k.c.arc(cx, top + w / 2, w / 2, Math.PI, 0);
    k.c.lineTo(cx + w / 2, bottom);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(cx, bottom + bulbR, bulbR, 0, Math.PI * 2);
    k.c.stroke();
    // Cıva sütunu
    const t = (value + 20) / 140;
    const level = bottom - (bottom - top - w) * t;
    fillShape(
        k,
        () => {
            k.c.rect(cx - w * 0.28, level, w * 0.56, bottom - level);
            k.c.moveTo(cx + bulbR, bottom + bulbR);
            k.c.arc(cx, bottom + bulbR, bulbR * 0.8, 0, Math.PI * 2);
        },
        0.55
    );
    // Ölçek
    for (let i = 0; i <= 7; i++) {
        const y = bottom - ((bottom - top - w) * i) / 7;
        line(k, cx + w / 2, y, cx + w * (i % 2 === 0 ? 1.1 : 0.85), y, 1);
    }
    if (k.o.labels !== false) label(k, `${value} °C`, cx + w * 1.3, level, 'left', 'middle', 0.85);
};

// ── Elektrik ve devre ────────────────────────────────────────────────

/**
 * Yatay tel parçası; `gaps` içindeki aralıklar atlanır. Semboller kendi
 * bağlantı uçlarını çizdiği için tel onların üstünden geçmemeli.
 */
function hWire(k: Ctx, xa: number, xb: number, y: number, gaps: Array<[number, number]>) {
    const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
    let x = xa;
    for (const [g0, g1] of sorted) {
        if (g0 > x) line(k, x, y, Math.min(g0, xb), y);
        x = Math.max(x, g1);
    }
    if (x < xb) line(k, x, y, xb, y);
}

/** Devre sembollerini ortak ölçekte çizen küçük yardımcılar. */
const symBattery = (k: Ctx, cx: number, cy: number, s: number, showLabels: boolean) => {
    line(k, cx - s * 1.1, cy, cx - s * 0.25, cy);
    line(k, cx + s * 0.25, cy, cx + s * 1.1, cy);
    line(k, cx - s * 0.25, cy - s * 0.65, cx - s * 0.25, cy + s * 0.65); // uzun (+)
    line(k, cx + s * 0.25, cy - s * 0.32, cx + s * 0.25, cy + s * 0.32); // kısa (−)
    if (showLabels) {
        label(k, '+', cx - s * 0.5, cy - s * 0.95, 'center', 'middle', 0.85);
        label(k, '−', cx + s * 0.55, cy - s * 0.95, 'center', 'middle', 0.85);
    }
};

const symBulb = (k: Ctx, cx: number, cy: number, s: number) => {
    line(k, cx - s * 1.2, cy, cx - s * 0.6, cy);
    line(k, cx + s * 0.6, cy, cx + s * 1.2, cy);
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(cx, cy, s * 0.6, 0, Math.PI * 2);
    k.c.stroke();
    const d = s * 0.42;
    line(k, cx - d, cy - d, cx + d, cy + d);
    line(k, cx - d, cy + d, cx + d, cy - d);
};

const symResistor = (k: Ctx, cx: number, cy: number, s: number) => {
    line(k, cx - s * 1.2, cy, cx - s * 0.7, cy);
    line(k, cx + s * 0.7, cy, cx + s * 1.2, cy);
    k.c.lineWidth = k.lw;
    k.c.strokeRect(cx - s * 0.7, cy - s * 0.4, s * 1.4, s * 0.8);
};

const symSwitch = (k: Ctx, cx: number, cy: number, s: number, closed: boolean) => {
    line(k, cx - s * 1.2, cy, cx - s * 0.6, cy);
    line(k, cx + s * 0.6, cy, cx + s * 1.2, cy);
    k.c.beginPath();
    k.c.arc(cx - s * 0.6, cy, Math.max(1.5, s * 0.13), 0, Math.PI * 2);
    k.c.fill();
    k.c.beginPath();
    k.c.arc(cx + s * 0.6, cy, Math.max(1.5, s * 0.13), 0, Math.PI * 2);
    k.c.fill();
    // Kapalıyken bile hafif kırık çizilir; düz olsaydı telden ayırt edilemezdi.
    if (closed) {
        line(k, cx - s * 0.6, cy, cx, cy - s * 0.28);
        line(k, cx, cy - s * 0.28, cx + s * 0.6, cy);
    } else {
        line(k, cx - s * 0.6, cy, cx + s * 0.45, cy - s * 0.7);
    }
};

const symMeter = (k: Ctx, cx: number, cy: number, s: number, text: string) => {
    line(k, cx - s * 1.2, cy, cx - s * 0.6, cy);
    line(k, cx + s * 0.6, cy, cx + s * 1.2, cy);
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(cx, cy, s * 0.6, 0, Math.PI * 2);
    k.c.stroke();
    label(k, text, cx, cy, 'center', 'middle', 0.95);
};

const centerScale = (k: Ctx) => Math.min(k.r.w, k.r.h * 2) * 0.28;

const battery: Renderer = (k) =>
    symBattery(k, k.r.x + k.r.w / 2, k.r.y + k.r.h / 2, centerScale(k), k.o.labels !== false);
const bulb: Renderer = (k) => symBulb(k, k.r.x + k.r.w / 2, k.r.y + k.r.h / 2, centerScale(k));
const resistor: Renderer = (k) => symResistor(k, k.r.x + k.r.w / 2, k.r.y + k.r.h / 2, centerScale(k));
const switchSym: Renderer = (k) =>
    symSwitch(k, k.r.x + k.r.w / 2, k.r.y + k.r.h / 2, centerScale(k), (k.o.n ?? 0) > 0);
const meter: Renderer = (k) =>
    symMeter(k, k.r.x + k.r.w / 2, k.r.y + k.r.h / 2, centerScale(k), k.o.text?.trim() || 'A');

const circuit_series: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.6, k.fs * 0.6);
    const count = clampInt(k.o.n, 1, 3, 2);
    const s = Math.min(r.w / (count + 2), r.h) * 0.34;
    const left = r.x;
    const right = r.x + r.w;
    const top = r.y;
    const bottom = r.y + r.h;
    k.c.lineWidth = k.lw;
    line(k, left, top, left, bottom);
    line(k, right, top, right, bottom);

    // Üst kenar: ampuller
    const bulbX = Array.from({ length: count }, (_, i) => left + (r.w * (i + 1)) / (count + 1));
    hWire(k, left, right, top, bulbX.map((x) => [x - s * 1.2, x + s * 1.2] as [number, number]));
    bulbX.forEach((x) => symBulb(k, x, top, s));

    // Alt kenar: pil ve anahtar
    const batX = left + r.w * 0.32;
    const swX = left + r.w * 0.72;
    hWire(k, left, right, bottom, [
        [batX - s * 1.1, batX + s * 1.1],
        [swX - s * 1.2, swX + s * 1.2],
    ]);
    symBattery(k, batX, bottom, s, false);
    symSwitch(k, swX, bottom, s, true);
    if (k.o.labels !== false)
        label(k, 'seri bağlı', (left + right) / 2, (top + bottom) / 2, 'center', 'middle', 0.9);
};

const circuit_parallel: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.6, k.fs * 1.4);
    const count = clampInt(k.o.n, 2, 3, 2);
    const s = Math.min(r.w / (count + 3), r.h) * 0.3;
    const left = r.x;
    const right = r.x + r.w;
    const top = r.y;
    const bottom = r.y + r.h;
    const midY = (top + bottom) / 2;
    k.c.lineWidth = k.lw;

    // Ana çerçeve; pil sol dikey kolda.
    line(k, left, top, right, top);
    line(k, left, bottom, right, bottom);
    line(k, right, top, right, bottom);
    line(k, left, top, left, midY - s * 1.1);
    line(k, left, midY + s * 1.1, left, bottom);
    k.c.save();
    k.c.translate(left, midY);
    k.c.rotate(Math.PI / 2);
    symBattery(k, 0, 0, s, false);
    k.c.restore();

    // Paralel kollar: her biri dikey, ortasında ampul.
    const branchX = Array.from({ length: count }, (_, i) => left + (r.w * (i + 1)) / (count + 1));
    branchX.forEach((x) => {
        line(k, x, top, x, midY - s * 1.2);
        line(k, x, midY + s * 1.2, x, bottom);
        // Semboller yatay çizildiği için kolun yönüne döndürülür.
        k.c.save();
        k.c.translate(x, midY);
        k.c.rotate(Math.PI / 2);
        symBulb(k, 0, 0, s);
        k.c.restore();
    });
    if (k.o.labels !== false)
        label(k, 'paralel bağlı', (left + right) / 2, k.r.y + k.r.h, 'center', 'bottom', 0.9);
};

// ── Optik ────────────────────────────────────────────────────────────

/** Merceğin/aynanın ana ekseni ve odak noktaları. */
function opticalAxis(k: Ctx, cx: number, cy: number, half: number, focal: number, labels: boolean) {
    line(k, cx - half, cy, cx + half, cy, 1);
    [-1, 1].forEach((sign) => {
        const x = cx + sign * focal;
        line(k, x, cy - 4, x, cy + 4, 1);
        if (labels) label(k, 'F', x, cy + k.fs * 0.85, 'center', 'middle', 0.8);
    });
}

const convex_lens: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 1.0);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const lensH = r.h * 0.62;
    const bulge = r.w * 0.06;
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.moveTo(cx, cy - lensH / 2);
    k.c.quadraticCurveTo(cx + bulge * 2, cy, cx, cy + lensH / 2);
    k.c.quadraticCurveTo(cx - bulge * 2, cy, cx, cy - lensH / 2);
    k.c.stroke();
    opticalAxis(k, cx, cy, r.w / 2, r.w * 0.28, k.o.labels !== false);
    // Eksene paralel gelen ışın odaktan geçer.
    const rayY = cy - lensH * 0.3;
    arrow(k, r.x, rayY, cx, rayY, 7, 1);
    arrow(k, cx, rayY, cx + r.w * 0.42, cy + (cy - rayY) * 0.55, 7, 1);
    const rayY2 = cy + lensH * 0.3;
    arrow(k, r.x, rayY2, cx, rayY2, 7, 1);
    arrow(k, cx, rayY2, cx + r.w * 0.42, cy - (rayY2 - cy) * 0.55, 7, 1);
    if (k.o.labels !== false) label(k, 'ince kenarlı', cx, r.y, 'center', 'top', 0.75);
};

const concave_lens: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 1.0);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const half = r.h * 0.3;
    const edge = r.w * 0.045;
    const dip = r.w * 0.035;
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.moveTo(cx - edge, cy - half);
    k.c.lineTo(cx + edge, cy - half);
    k.c.quadraticCurveTo(cx + edge - dip * 2, cy, cx + edge, cy + half);
    k.c.lineTo(cx - edge, cy + half);
    k.c.quadraticCurveTo(cx - edge + dip * 2, cy, cx - edge, cy - half);
    k.c.closePath();
    k.c.stroke();

    opticalAxis(k, cx, cy, r.w / 2, r.w * 0.28, k.o.labels !== false);
    [-1, 1].forEach((sign) => {
        const rayY = cy + sign * half * 0.55;
        arrow(k, r.x, rayY, cx - edge, rayY, 7, 1);
        arrow(k, cx + edge, rayY, cx + r.w * 0.42, rayY + sign * r.h * 0.22, 7, 1);
    });
    if (k.o.labels !== false) label(k, 'kalın kenarlı', cx, r.y, 'center', 'top', 0.75);
};

const plane_mirror: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.6, k.fs * 0.6);
    const y = r.y + r.h * 0.78;
    const cx = r.x + r.w / 2;
    line(k, r.x, y, r.x + r.w, y);
    // Ayna taraması
    for (let x = r.x; x < r.x + r.w; x += Math.max(8, r.w / 14)) {
        line(k, x, y, x - r.w * 0.035, y + r.h * 0.1, 1);
    }
    // Normal
    k.c.save();
    k.c.setLineDash([5, 4]);
    line(k, cx, y, cx, r.y, 1);
    k.c.restore();
    const dx = r.w * 0.34;
    const dy = r.h * 0.62;
    arrow(k, cx - dx, y - dy, cx, y, 8);
    arrow(k, cx, y, cx + dx, y - dy, 8);
    if (k.o.labels === false) return;
    label(k, 'gelen', cx - dx * 0.75, y - dy * 0.85, 'center', 'middle', 0.75);
    label(k, 'yansıyan', cx + dx * 0.8, y - dy * 0.85, 'center', 'middle', 0.75);
    label(k, 'N', cx + k.fs * 0.5, r.y + k.fs * 0.5, 'left', 'middle', 0.8);
};

const concave_mirror: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.6, k.fs * 1.1);
    const cy = r.y + r.h / 2;
    const span = (40 * Math.PI) / 180;
    // Yay kutuya sığacak yarıçapla kurulur: tepe noktası sağda,
    // eğrilik merkezi (M) solda kalır.
    const rad = Math.min(r.w * 0.52, (r.h * 0.46) / Math.sin(span));
    const vertexX = r.x + r.w * 0.96;
    const centerX = vertexX - rad;
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(centerX, cy, rad, -span, span);
    k.c.stroke();

    const focusX = vertexX - rad / 2;
    line(k, r.x, cy, vertexX, cy, 1);
    [[focusX, 'F'], [centerX, 'M']].forEach(([x, name]) => {
        line(k, x as number, cy - 4, x as number, cy + 4, 1);
        if (k.o.labels !== false)
            label(k, name as string, x as number, cy + k.fs * 0.9, 'center', 'middle', 0.8);
    });

    // Eksene paralel gelen ışın, yansıdıktan sonra odaktan geçer.
    const rayY = cy - rad * Math.sin(span) * 0.62;
    const hitX = centerX + Math.sqrt(Math.max(0, rad * rad - (rayY - cy) ** 2));
    arrow(k, r.x, rayY, hitX, rayY, 7, 1);
    arrow(k, hitX, rayY, focusX, cy, 7, 1);
    if (k.o.labels !== false)
        label(k, 'çukur ayna', r.x, r.y, 'left', 'top', 0.75);
};

const prism: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 0.6);
    const cx = r.x + r.w * 0.45;
    const size = Math.min(r.w * 0.44, r.h * 0.72);
    const top = r.y + r.h * 0.5 - size * 0.55;
    const bottom = top + size;
    path(
        k,
        [
            [cx, top],
            [cx + size * 0.55, bottom],
            [cx - size * 0.55, bottom],
        ],
        true
    );
    // Beyaz ışık girer
    const inY = top + size * 0.55;
    arrow(k, r.x, inY - size * 0.18, cx - size * 0.28, inY, 7);
    // Ayrışan tayf
    const outX = cx + size * 0.3;
    for (let i = 0; i < 5; i++) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.4 + i * 0.14);
        line(k, outX, inY + size * 0.1, r.x + r.w, inY + size * 0.1 + (i - 2) * (r.h * 0.09), 1);
        k.c.restore();
    }
    if (k.o.labels === false) return;
    label(k, 'beyaz ışık', r.x, r.y, 'left', 'top', 0.72);
    label(k, 'tayf', r.x + r.w, inY + size * 0.1 - r.h * 0.3, 'right', 'middle', 0.72);
};

// ── Kuvvet ve hareket ────────────────────────────────────────────────

const force_arrows: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.6);
    const leftF = clampInt(k.o.n, 0, 99, 20);
    const rightF = clampInt(k.o.k, 0, 99, 30);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.5;
    const box = Math.min(r.w * 0.2, r.h * 0.42);
    k.c.lineWidth = k.lw;
    k.c.strokeRect(cx - box / 2, cy - box / 2, box, box);
    const maxLen = r.w * 0.3;
    const unit = maxLen / Math.max(leftF, rightF, 1);
    if (leftF > 0) arrow(k, cx - box / 2, cy, cx - box / 2 - leftF * unit, cy, 9);
    if (rightF > 0) arrow(k, cx + box / 2, cy, cx + box / 2 + rightF * unit, cy, 9);
    if (k.o.labels === false) return;
    if (leftF > 0) label(k, `${leftF} N`, cx - box / 2 - leftF * unit * 0.55, cy - k.fs * 0.8, 'center', 'middle', 0.8);
    if (rightF > 0) label(k, `${rightF} N`, cx + box / 2 + rightF * unit * 0.55, cy - k.fs * 0.8, 'center', 'middle', 0.8);
    const net = Math.abs(rightF - leftF);
    label(
        k,
        net === 0 ? 'dengelenmiş kuvvet' : `bileşke: ${net} N ${rightF > leftF ? '→' : '←'}`,
        cx,
        r.y + r.h - k.fs * 0.2,
        'center',
        'bottom',
        0.8
    );
};

const inclined_plane: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 0.5);
    const bx = r.x;
    const by = r.y + r.h;
    const tipX = r.x + r.w * 0.92;
    path(k, [
        [bx, by],
        [tipX, by],
        [tipX, r.y + r.h * 0.18],
    ], true);
    // Eğik yüzeydeki blok
    const t = 0.55;
    const px = bx + (tipX - bx) * t;
    const py = by + (r.y + r.h * 0.18 - by) * t;
    const angle = Math.atan2(r.y + r.h * 0.18 - by, tipX - bx);
    k.c.save();
    k.c.translate(px, py);
    k.c.rotate(angle);
    k.c.lineWidth = k.lw;
    const bs = Math.min(r.w, r.h) * 0.16;
    k.c.strokeRect(-bs / 2, -bs, bs, bs);
    k.c.restore();
    // Ağırlık oku
    arrow(k, px, py - Math.min(r.w, r.h) * 0.08, px, py + r.h * 0.22, 8);
    // Açı yayı
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(bx, by, Math.min(r.w, r.h) * 0.2, angle, 0);
    k.c.stroke();
    if (k.o.labels === false) return;
    label(k, 'α', bx + Math.min(r.w, r.h) * 0.28, by - Math.min(r.w, r.h) * 0.08, 'center', 'middle', 0.9);
    label(k, 'G', px + k.fs * 0.6, py + r.h * 0.16, 'left', 'middle', 0.85);
};

const pulley: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 0.5);
    const cx = r.x + r.w / 2;
    const rad = Math.min(r.w, r.h) * 0.17;
    const cy = r.y + rad + r.h * 0.12;
    // Tavan
    line(k, cx - r.w * 0.3, r.y, cx + r.w * 0.3, r.y);
    for (let x = cx - r.w * 0.3; x < cx + r.w * 0.3; x += Math.max(8, r.w / 12)) {
        line(k, x, r.y, x - r.w * 0.03, r.y - r.h * 0.05, 1);
    }
    line(k, cx, r.y, cx, cy - rad);
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(cx, cy, rad, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(cx, cy, Math.max(2, rad * 0.16), 0, Math.PI * 2);
    k.c.fill();
    // İpler
    const bottom = r.y + r.h;
    line(k, cx - rad, cy, cx - rad, bottom - r.h * 0.14);
    line(k, cx + rad, cy, cx + rad, bottom - r.h * 0.2);
    // Yük
    const wSize = Math.min(r.w, r.h) * 0.16;
    k.c.strokeRect(cx - rad - wSize / 2, bottom - r.h * 0.14, wSize, wSize);
    // Çekme kuvveti
    arrow(k, cx + rad, bottom - r.h * 0.2, cx + rad, bottom, 8);
    if (k.o.labels === false) return;
    label(k, 'yük', cx - rad, bottom - r.h * 0.14 + wSize / 2, 'center', 'middle', 0.7);
    label(k, 'F', cx + rad + k.fs * 0.6, bottom - r.h * 0.08, 'left', 'middle', 0.85);
};

const lever: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 0.6);
    const cy = r.y + r.h * 0.45;
    const fx = r.x + r.w * (clampInt(k.o.n, 20, 80, 40) / 100);
    line(k, r.x, cy, r.x + r.w, cy, Math.max(2, k.lw * 1.4));
    // Destek
    const fh = r.h * 0.28;
    path(k, [
        [fx, cy],
        [fx - fh * 0.55, cy + fh],
        [fx + fh * 0.55, cy + fh],
    ], true);
    line(k, fx - fh * 0.85, cy + fh, fx + fh * 0.85, cy + fh);
    // Yük ve kuvvet
    const ls = Math.min(r.w, r.h) * 0.15;
    k.c.lineWidth = k.lw;
    k.c.strokeRect(r.x + r.w * 0.04, cy - ls, ls, ls);
    arrow(k, r.x + r.w * 0.9, cy - r.h * 0.3, r.x + r.w * 0.9, cy - 2, 8);
    if (k.o.labels === false) return;
    label(k, 'yük', r.x + r.w * 0.04 + ls / 2, cy - ls - k.fs * 0.5, 'center', 'middle', 0.75);
    label(k, 'kuvvet', r.x + r.w * 0.9, cy - r.h * 0.3 - k.fs * 0.5, 'center', 'middle', 0.75);
    label(k, 'destek', fx, cy + fh + k.fs * 0.8, 'center', 'middle', 0.75);
};

const spring_scale: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.5, k.fs * 0.4);
    const value = clampInt(k.o.k, 0, 100, 15);
    const cx = r.x + r.w / 2;
    const w = Math.min(r.w * 0.4, r.h * 0.3);
    const top = r.y + r.h * 0.1;
    const bottom = r.y + r.h * 0.82;
    // Askı halkası
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(cx, r.y + r.h * 0.05, r.h * 0.05, 0, Math.PI * 2);
    k.c.stroke();
    k.c.strokeRect(cx - w / 2, top, w, bottom - top);
    // Yay
    const coils = 6;
    k.c.beginPath();
    k.c.lineWidth = Math.max(1, k.lw * 0.8);
    for (let i = 0; i <= coils * 2; i++) {
        const y = top + ((bottom - top) * 0.55 * i) / (coils * 2) + (bottom - top) * 0.08;
        const x = cx + (i % 2 === 0 ? -w * 0.22 : w * 0.22);
        if (i === 0) k.c.moveTo(x, y);
        else k.c.lineTo(x, y);
    }
    k.c.stroke();
    // Ölçek ve gösterge
    for (let i = 0; i <= 5; i++) {
        const y = top + ((bottom - top) * i) / 5;
        line(k, cx + w / 2, y, cx + w * (i % 2 === 0 ? 0.75 : 0.62), y, 1);
    }
    const pointerY = top + (bottom - top) * (value / 100);
    line(k, cx - w * 0.32, pointerY, cx + w / 2, pointerY, Math.max(2, k.lw * 1.4));
    // Kanca
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.moveTo(cx, bottom);
    k.c.lineTo(cx, bottom + r.h * 0.08);
    k.c.arc(cx, bottom + r.h * 0.12, r.h * 0.04, -Math.PI / 2, Math.PI);
    k.c.stroke();
    if (k.o.labels !== false) label(k, `${value} N`, cx + w * 0.9, pointerY, 'left', 'middle', 0.85);
};

// ── Madde ve canlılar ────────────────────────────────────────────────

const bohr_atom: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.4);
    const z = clampInt(k.o.n, 1, 20, 6);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const maxR = Math.min(r.w, r.h) / 2 - k.fs * 0.6;
    // Katman doluluğu: 2, 8, 8, 2
    const capacity = [2, 8, 8, 2];
    const shells: number[] = [];
    let left = z;
    for (const cap of capacity) {
        if (left <= 0) break;
        shells.push(Math.min(cap, left));
        left -= cap;
    }
    const nucleusR = Math.max(6, maxR * 0.2);
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(cx, cy, nucleusR, 0, Math.PI * 2);
    k.c.stroke();
    if (k.o.labels !== false) {
        label(k, `${z}p`, cx, cy - nucleusR * 0.28, 'center', 'middle', 0.7);
        label(k, `${clampInt(k.o.k, 0, 30, z)}n`, cx, cy + nucleusR * 0.36, 'center', 'middle', 0.7);
    }
    shells.forEach((count, i) => {
        const rad = nucleusR + ((maxR - nucleusR) * (i + 1)) / shells.length;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.45);
        k.c.beginPath();
        k.c.lineWidth = 1;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        for (let e = 0; e < count; e++) {
            const a = (-Math.PI / 2) + (e * 2 * Math.PI) / count;
            k.c.beginPath();
            k.c.arc(cx + rad * Math.cos(a), cy + rad * Math.sin(a), Math.max(2.5, maxR * 0.045), 0, Math.PI * 2);
            k.c.fill();
        }
    });
};

const element_card: Renderer = (k) => {
    const r = inset(k.r, 2, 2);
    const size = Math.min(r.w, r.h);
    const x = r.x + (r.w - size) / 2;
    const y = r.y + (r.h - size) / 2;
    k.c.lineWidth = Math.max(1.5, k.lw);
    k.c.strokeRect(x, y, size, size);
    const symbol = k.o.text?.trim() || 'C';
    k.c.save();
    k.c.font = `700 ${Math.round(size * 0.36)}px ui-sans-serif, system-ui, Arial`;
    k.c.textAlign = 'center';
    k.c.textBaseline = 'middle';
    k.c.fillText(symbol, x + size / 2, y + size * 0.5);
    k.c.restore();
    if (k.o.labels === false) return;
    label(k, String(clampInt(k.o.n, 1, 118, 6)), x + size * 0.1, y + size * 0.14, 'left', 'middle', 0.85);
    label(k, String(clampInt(k.o.k, 1, 300, 12)), x + size * 0.9, y + size * 0.14, 'right', 'middle', 0.85);
    label(k, 'atom no', x + size * 0.1, y + size * 0.87, 'left', 'middle', 0.6);
    label(k, 'kütle', x + size * 0.9, y + size * 0.87, 'right', 'middle', 0.6);
};

const states_of_matter: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.3, k.fs * 0.3);
    const gap = r.w * 0.04;
    const bw = (r.w - gap * 2) / 3;
    const bh = Math.min(r.h - k.fs * 1.6, bw);
    const names = ['katı', 'sıvı', 'gaz'];
    const counts = [16, 11, 6];
    for (let b = 0; b < 3; b++) {
        const x = r.x + b * (bw + gap);
        const y = r.y;
        k.c.lineWidth = k.lw;
        k.c.strokeRect(x, y, bw, bh);
        const dot = Math.max(2.5, bw * 0.055);
        if (b === 0) {
            // Düzenli örgü
            for (let i = 0; i < 4; i++)
                for (let j = 0; j < 4; j++) {
                    k.c.beginPath();
                    k.c.arc(x + bw * (0.2 + i * 0.2), y + bh * (0.2 + j * 0.2), dot, 0, Math.PI * 2);
                    k.c.fill();
                }
        } else {
            // Rastgele ama tekrarlanabilir dağılım
            let seed = b * 97 + 13;
            const rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648;
                return seed / 2147483648;
            };
            for (let i = 0; i < counts[b]; i++) {
                k.c.beginPath();
                k.c.arc(x + bw * (0.12 + rnd() * 0.76), y + bh * (0.12 + rnd() * 0.76), dot, 0, Math.PI * 2);
                k.c.fill();
            }
        }
        if (k.o.labels !== false)
            label(k, names[b], x + bw / 2, y + bh + k.fs * 0.85, 'center', 'middle', 0.85);
    }
};

/** Organelden dışarıdaki etikete uzanan ince kılavuz çizgi. */
function leader(k: Ctx, from: [number, number], to: [number, number]) {
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.55);
    line(k, from[0], from[1], to[0], to[1], 1);
    k.c.restore();
}

const animal_cell: Renderer = (k) => {
    // Etiketler kutunun içinde kalsın diye hücre orta bölgeye sığdırılır.
    const padX = k.r.w * 0.26;
    const r = inset(k.r, padX, k.fs * 0.8);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const rx = r.w / 2;
    const ry = r.h / 2;
    ellipse(k, cx, cy, rx, ry);

    const nucleus: [number, number] = [cx + rx * 0.18, cy - ry * 0.12];
    ellipse(k, nucleus[0], nucleus[1], rx * 0.26, ry * 0.28);
    k.c.beginPath();
    k.c.arc(nucleus[0], nucleus[1], rx * 0.08, 0, Math.PI * 2);
    k.c.fill();

    const mito: [number, number] = [cx - rx * 0.4, cy + ry * 0.42];
    k.c.save();
    k.c.translate(mito[0], mito[1]);
    k.c.rotate(-0.5);
    ellipse(k, 0, 0, rx * 0.17, ry * 0.085);
    k.c.restore();
    k.c.save();
    k.c.translate(cx + rx * 0.48, cy + ry * 0.5);
    k.c.rotate(0.4);
    ellipse(k, 0, 0, rx * 0.15, ry * 0.075);
    k.c.restore();

    ellipse(k, cx - rx * 0.45, cy - ry * 0.38, rx * 0.13, ry * 0.14);

    if (k.o.labels === false) return;
    const outL = k.r.x + padX * 0.12;
    const outR = k.r.x + k.r.w - padX * 0.12;
    leader(k, [cx - rx * 0.92, cy - ry * 0.5], [outL + padX * 0.55, cy - ry * 0.72]);
    label(k, 'hücre zarı', outL, cy - ry * 0.78, 'left', 'middle', 0.72);
    leader(k, [mito[0] - rx * 0.16, mito[1]], [outL + padX * 0.55, cy + ry * 0.75]);
    label(k, 'mitokondri', outL, cy + ry * 0.8, 'left', 'middle', 0.72);
    leader(k, [nucleus[0] + rx * 0.26, nucleus[1]], [outR - padX * 0.55, cy - ry * 0.5]);
    label(k, 'çekirdek', outR, cy - ry * 0.55, 'right', 'middle', 0.72);
    label(k, 'sitoplazma', cx - rx * 0.1, cy + ry * 0.72, 'center', 'middle', 0.68);
};

const plant_cell: Renderer = (k) => {
    const padX = k.r.w * 0.28;
    const r = inset(k.r, padX, k.fs * 0.8);
    k.c.lineWidth = k.lw;
    k.c.strokeRect(r.x, r.y, r.w, r.h);
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    k.c.strokeRect(r.x + r.w * 0.05, r.y + r.h * 0.07, r.w * 0.9, r.h * 0.86);
    k.c.restore();

    k.c.strokeRect(r.x + r.w * 0.3, r.y + r.h * 0.26, r.w * 0.42, r.h * 0.48);
    const nucleus: [number, number] = [r.x + r.w * 0.16, r.y + r.h * 0.5];
    k.c.beginPath();
    k.c.arc(nucleus[0], nucleus[1], Math.min(r.w, r.h) * 0.085, 0, Math.PI * 2);
    k.c.stroke();

    const chloro: Array<[number, number]> = [[0.84, 0.3], [0.86, 0.66], [0.5, 0.85]];
    chloro.forEach(([fx, fy]) => {
        k.c.save();
        k.c.translate(r.x + r.w * fx, r.y + r.h * fy);
        k.c.rotate(0.4);
        ellipse(k, 0, 0, Math.min(r.w, r.h) * 0.085, Math.min(r.w, r.h) * 0.042);
        k.c.restore();
    });

    if (k.o.labels === false) return;
    const outL = k.r.x + padX * 0.06;
    const outR = k.r.x + k.r.w - padX * 0.06;
    leader(k, [r.x, r.y + r.h * 0.12], [outL + padX * 0.55, r.y + r.h * 0.06]);
    label(k, 'hücre çeperi', outL, r.y + r.h * 0.04, 'left', 'middle', 0.72);
    leader(k, [nucleus[0] - Math.min(r.w, r.h) * 0.09, nucleus[1]], [outL + padX * 0.55, r.y + r.h * 0.55]);
    label(k, 'çekirdek', outL, r.y + r.h * 0.58, 'left', 'middle', 0.72);
    leader(k, [r.x + r.w * 0.9, r.y + r.h * 0.3], [outR - padX * 0.55, r.y + r.h * 0.22]);
    label(k, 'kloroplast', outR, r.y + r.h * 0.2, 'right', 'middle', 0.72);
    label(k, 'koful', r.x + r.w * 0.51, r.y + r.h * 0.5, 'center', 'middle', 0.75);
};

const sun_earth_moon: Renderer = (k) => {
    const r = inset(k.r, k.fs * 0.4, k.fs * 0.4);
    const sunX = r.x + r.w * 0.16;
    const cy = r.y + r.h / 2;
    const sunR = Math.min(r.w, r.h) * 0.11;
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(sunX, cy, sunR, 0, Math.PI * 2);
    k.c.stroke();
    for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        line(k, sunX + sunR * 1.25 * Math.cos(a), cy + sunR * 1.25 * Math.sin(a),
             sunX + sunR * 1.7 * Math.cos(a), cy + sunR * 1.7 * Math.sin(a), 1);
    }
    // Dünya'nın yörüngesi
    const orbitR = r.w * 0.62;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.4);
    k.c.setLineDash([6, 5]);
    k.c.beginPath();
    k.c.ellipse(sunX, cy, orbitR, Math.min(r.h * 0.42, orbitR * 0.55), 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
    const earthX = sunX + orbitR;
    const earthR = sunR * 0.62;
    k.c.beginPath();
    k.c.arc(earthX, cy, earthR, 0, Math.PI * 2);
    k.c.stroke();
    // Ay'ın yörüngesi
    const moonOrbit = earthR * 2.6;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.4);
    k.c.setLineDash([4, 4]);
    k.c.beginPath();
    k.c.arc(earthX, cy, moonOrbit, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();
    k.c.beginPath();
    k.c.arc(earthX, cy - moonOrbit, earthR * 0.4, 0, Math.PI * 2);
    k.c.fill();
    if (k.o.labels === false) return;
    label(k, 'Güneş', sunX, cy + sunR * 2.2, 'center', 'middle', 0.75);
    label(k, 'Dünya', earthX, cy + moonOrbit + k.fs * 0.9, 'center', 'middle', 0.75);
    label(k, 'Ay', earthX + earthR * 0.9, cy - moonOrbit - k.fs * 0.5, 'left', 'middle', 0.72);
};

// ── Kayıt ────────────────────────────────────────────────────────────

export const SCIENCE_RENDERERS: Partial<Record<MathObjectKind, Renderer>> = {
    beaker,
    flask,
    graduated_cylinder,
    test_tube,
    heating_setup,
    thermometer,
    battery,
    bulb,
    resistor,
    switch: switchSym,
    meter,
    circuit_series,
    circuit_parallel,
    convex_lens,
    concave_lens,
    plane_mirror,
    concave_mirror,
    prism,
    force_arrows,
    inclined_plane,
    pulley,
    lever,
    spring_scale,
    bohr_atom,
    element_card,
    states_of_matter,
    animal_cell,
    plant_cell,
    sun_earth_moon,
};

export const SCIENCE_CATEGORIES: ReadonlyArray<ObjectCategory> = [
    {
        label: 'Laboratuvar',
        items: [
            {
                kind: 'beaker',
                label: 'Beher',
                hint: 'Ölçekli beher, sıvı seviyesi ayarlanabilir',
                size: { w: 220, h: 250 },
                defaults: { k: 60, labels: true },
                fields: [{ key: 'k', label: 'Doluluk (mL)', type: 'number', min: 0, max: 100 }],
            },
            {
                kind: 'flask',
                label: 'Erlenmeyer',
                hint: 'Koni gövdeli deney kabı',
                size: { w: 220, h: 260 },
                defaults: { k: 55, labels: true },
                fields: [{ key: 'k', label: 'Doluluk (%)', type: 'number', min: 0, max: 100 }],
            },
            {
                kind: 'graduated_cylinder',
                label: 'Mezür',
                hint: 'Hacim ölçme kabı',
                size: { w: 170, h: 300 },
                defaults: { k: 65, labels: true },
                fields: [{ key: 'k', label: 'Doluluk (%)', type: 'number', min: 0, max: 100 }],
            },
            {
                kind: 'test_tube',
                label: 'Deney Tüpü',
                hint: 'Yuvarlak tabanlı tüp',
                size: { w: 130, h: 280 },
                defaults: { k: 55, labels: true },
                fields: [{ key: 'k', label: 'Doluluk (%)', type: 'number', min: 0, max: 100 }],
            },
            {
                kind: 'heating_setup',
                label: 'Isıtma Düzeneği',
                hint: 'Bek, üçayak, tel kafes ve beher',
                size: { w: 280, h: 300 },
                defaults: { labels: true },
            },
            {
                kind: 'thermometer',
                label: 'Termometre',
                hint: 'Ölçekli sıcaklık ölçer',
                size: { w: 150, h: 320 },
                defaults: { k: 40, labels: true },
                fields: [{ key: 'k', label: 'Sıcaklık (°C)', type: 'number', min: -20, max: 120 }],
            },
        ],
    },
    {
        label: 'Elektrik & Devre',
        items: [
            { kind: 'battery', label: 'Pil', hint: 'Devre sembolü', size: { w: 180, h: 110 }, defaults: { labels: true } },
            { kind: 'bulb', label: 'Ampul', hint: 'Devre sembolü', size: { w: 180, h: 130 }, defaults: { labels: true } },
            { kind: 'resistor', label: 'Direnç', hint: 'Devre sembolü', size: { w: 180, h: 110 }, defaults: { labels: true } },
            {
                kind: 'switch',
                label: 'Anahtar',
                hint: 'Açık veya kapalı çizilir',
                size: { w: 180, h: 120 },
                defaults: { n: 0, labels: true },
                fields: [{ key: 'n', label: 'Kapalı (1) / Açık (0)', type: 'number', min: 0, max: 1 }],
            },
            {
                kind: 'meter',
                label: 'Ölçü Aleti',
                hint: 'Ampermetre (A) veya voltmetre (V)',
                size: { w: 180, h: 130 },
                defaults: { text: 'A', labels: true },
                fields: [{ key: 'text', label: 'Sembol', type: 'text' }],
            },
            {
                kind: 'circuit_series',
                label: 'Seri Devre',
                hint: 'Pil, anahtar ve ampuller tek kol üzerinde',
                size: { w: 360, h: 240 },
                defaults: { n: 2, labels: true },
                fields: [{ key: 'n', label: 'Ampul sayısı', type: 'number', min: 1, max: 3 }],
            },
            {
                kind: 'circuit_parallel',
                label: 'Paralel Devre',
                hint: 'Ampuller ayrı kollarda',
                size: { w: 360, h: 240 },
                defaults: { n: 2, labels: true },
                fields: [{ key: 'n', label: 'Kol sayısı', type: 'number', min: 2, max: 3 }],
            },
        ],
    },
    {
        label: 'Optik',
        items: [
            { kind: 'convex_lens', label: 'İnce Kenarlı Mercek', hint: 'Işınları odakta toplar', size: { w: 360, h: 260 }, defaults: { labels: true } },
            { kind: 'concave_lens', label: 'Kalın Kenarlı Mercek', hint: 'Işınları dağıtır', size: { w: 360, h: 260 }, defaults: { labels: true } },
            { kind: 'plane_mirror', label: 'Düz Ayna', hint: 'Gelen ve yansıyan ışın, normal', size: { w: 320, h: 240 }, defaults: { labels: true } },
            { kind: 'concave_mirror', label: 'Çukur Ayna', hint: 'Odak ve merkez noktalı', size: { w: 340, h: 260 }, defaults: { labels: true } },
            { kind: 'prism', label: 'Prizma', hint: 'Beyaz ışığın tayfa ayrışması', size: { w: 340, h: 240 }, defaults: { labels: true } },
        ],
    },
    {
        label: 'Kuvvet & Hareket',
        items: [
            {
                kind: 'force_arrows',
                label: 'Kuvvet Okları',
                hint: 'Dengelenmiş / dengelenmemiş kuvvet',
                size: { w: 380, h: 200 },
                defaults: { n: 20, k: 30, labels: true },
                fields: [
                    { key: 'n', label: 'Sol kuvvet (N)', type: 'number', min: 0, max: 99 },
                    { key: 'k', label: 'Sağ kuvvet (N)', type: 'number', min: 0, max: 99 },
                ],
            },
            { kind: 'inclined_plane', label: 'Eğik Düzlem', hint: 'Blok, ağırlık ve eğim açısı', size: { w: 320, h: 240 }, defaults: { labels: true } },
            { kind: 'pulley', label: 'Sabit Makara', hint: 'İp, yük ve çekme kuvveti', size: { w: 260, h: 300 }, defaults: { labels: true } },
            {
                kind: 'lever',
                label: 'Kaldıraç',
                hint: 'Destek noktası kaydırılabilir',
                size: { w: 360, h: 220 },
                defaults: { n: 40, labels: true },
                fields: [{ key: 'n', label: 'Destek konumu (%)', type: 'number', min: 20, max: 80 }],
            },
            {
                kind: 'spring_scale',
                label: 'Dinamometre',
                hint: 'Yaylı kuvvet ölçer',
                size: { w: 160, h: 320 },
                defaults: { k: 15, labels: true },
                fields: [{ key: 'k', label: 'Gösterge (N)', type: 'number', min: 0, max: 100 }],
            },
        ],
    },
    {
        label: 'Madde & Canlılar',
        items: [
            {
                kind: 'bohr_atom',
                label: 'Atom Modeli',
                hint: 'Katmanlı Bohr modeli',
                size: { w: 300, h: 300 },
                defaults: { n: 6, k: 6, labels: true },
                fields: [
                    { key: 'n', label: 'Proton (atom no)', type: 'number', min: 1, max: 20 },
                    { key: 'k', label: 'Nötron', type: 'number', min: 0, max: 30 },
                ],
            },
            {
                kind: 'element_card',
                label: 'Element Kartı',
                hint: 'Periyodik tablo karesi',
                size: { w: 220, h: 220 },
                defaults: { text: 'C', n: 6, k: 12, labels: true },
                fields: [
                    { key: 'text', label: 'Sembol', type: 'text' },
                    { key: 'n', label: 'Atom no', type: 'number', min: 1, max: 118 },
                    { key: 'k', label: 'Kütle no', type: 'number', min: 1, max: 300 },
                ],
            },
            { kind: 'states_of_matter', label: 'Maddenin Halleri', hint: 'Katı, sıvı, gaz tanecik modeli', size: { w: 400, h: 200 }, defaults: { labels: true } },
            { kind: 'animal_cell', label: 'Hayvan Hücresi', hint: 'Temel organeller etiketli', size: { w: 400, h: 260 }, defaults: { labels: true } },
            { kind: 'plant_cell', label: 'Bitki Hücresi', hint: 'Çeper, koful, kloroplast', size: { w: 400, h: 260 }, defaults: { labels: true } },
            { kind: 'sun_earth_moon', label: 'Güneş-Dünya-Ay', hint: 'Yörüngeli konum şeması', size: { w: 400, h: 240 }, defaults: { labels: true } },
        ],
    },
];
