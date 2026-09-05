// src/components/drawing/mathObjects.ts
// Yazma alanına tek dokunuşla eklenebilen hazır matematik/geometri nesneleri.
// Ortak çizim yardımcıları objectDrawing.ts'te; fen nesneleri scienceObjects.ts'te.

import type { MathObjectKind } from '../../types';
import { compileExpression } from './expression';
import {
    arrowHead,
    clampInt,
    ellipse,
    inset,
    label,
    line,
    withAlpha,
    type Ctx,
    type ObjectCategory,
    type Renderer,
} from './objectDrawing';
import { GRADE10_GEOM_ITEMS } from './grade10GeomSims';
import { GRADE10_STATS_ITEMS } from './grade10StatsSims';

/** Ekseni ve ızgarayı çizen ortak yardımcı (koordinat düzlemi türevleri). */
function drawGridAxes(
    k: Ctx,
    opts: {
        unitsX: number;
        unitsY: number;
        quadrantOne: boolean;
        labels: boolean;
        /** Üstte başlık/ifade için ayrılan boşluk. */
        topPad?: number;
    }
) {
    const { r } = k;
    const { unitsX, unitsY, quadrantOne, labels } = opts;
    const padding = labels ? k.fs * 1.4 : 4;
    const left = r.x + padding;
    const right = r.x + r.w - 6;
    const top = r.y + 6 + (opts.topPad ?? 0);
    const bottom = r.y + r.h - padding;
    const originX = quadrantOne ? left : (left + right) / 2;
    const originY = quadrantOne ? bottom : (top + bottom) / 2;
    const stepX = (right - left) / (quadrantOne ? unitsX : unitsX * 2);
    const stepY = (bottom - top) / (quadrantOne ? unitsY : unitsY * 2);

    // Izgara
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.2);
    k.c.lineWidth = 1;
    for (let gx = originX; gx <= right + 0.5; gx += stepX) line(k, gx, top, gx, bottom, 1);
    for (let gx = originX; gx >= left - 0.5; gx -= stepX) line(k, gx, top, gx, bottom, 1);
    for (let gy = originY; gy <= bottom + 0.5; gy += stepY) line(k, left, gy, right, gy, 1);
    for (let gy = originY; gy >= top - 0.5; gy -= stepY) line(k, left, gy, right, gy, 1);
    k.c.restore();

    // Eksenler
    line(k, left, originY, right, originY);
    line(k, originX, bottom, originX, top);
    arrowHead(k, right, originY, 0, Math.max(7, k.fs * 0.6));
    arrowHead(k, originX, top, -Math.PI / 2, Math.max(7, k.fs * 0.6));

    // Bölme çizgileri ve sayılar
    const tick = Math.max(3, k.fs * 0.28);
    const fromX = quadrantOne ? 0 : -unitsX;
    const fromY = quadrantOne ? 0 : -unitsY;
    for (let i = fromX; i <= unitsX; i++) {
        const x = originX + i * stepX;
        if (x < left - 0.5 || x > right + 0.5) continue;
        line(k, x, originY - tick, x, originY + tick, 1);
        if (labels && i !== 0 && (unitsX <= 8 || i % 2 === 0))
            label(k, String(i), x, originY + tick + k.fs * 0.65, 'center', 'middle', 0.8);
    }
    for (let i = fromY; i <= unitsY; i++) {
        const y = originY - i * stepY;
        if (y < top - 0.5 || y > bottom + 0.5) continue;
        line(k, originX - tick, y, originX + tick, y, 1);
        if (labels && i !== 0 && (unitsY <= 8 || i % 2 === 0))
            label(k, String(i), originX - tick - k.fs * 0.5, y, 'right', 'middle', 0.8);
    }
    if (labels) {
        label(k, '0', originX - tick - k.fs * 0.45, originY + k.fs * 0.7, 'right', 'middle', 0.8);
        label(k, 'x', right - k.fs * 0.2, originY - k.fs * 0.85, 'right', 'middle', 0.95);
        label(k, 'y', originX + k.fs * 0.85, top + k.fs * 0.3, 'left', 'middle', 0.95);
    }
    return { left, right, top, bottom, originX, originY, stepX, stepY };
}

// ── Çizim fonksiyonları ──────────────────────────────────────────────

// ── Çizim fonksiyonları ──────────────────────────────────────────────

/** Matematik nesnelerinin çizicileri. */
export const MATH_RENDERERS: Partial<Record<MathObjectKind, Renderer>> = {
    tool_compass: (k) => {
        const { r } = k;
        const cx = r.x + r.w * 0.5;
        const topY = r.y + r.h * 0.15;
        const hingeR = Math.min(r.w, r.h) * 0.08;
        const leftX = r.x + r.w * 0.25;
        const rightX = r.x + r.w * 0.75;
        const botY = r.y + r.h * 0.85;
        line(k, cx, topY, leftX, botY, 2.5);
        line(k, cx, topY, rightX, botY, 2.5);
        ellipse(k, cx, topY, hingeR, hingeR);
        k.c.beginPath();
        k.c.arc(cx, botY, (rightX - leftX) * 0.5, 0, Math.PI);
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.5;
        k.c.stroke();
    },

    tool_number_line: (k) => {
        const { r } = k;
        const cy = r.y + r.h * 0.5;
        const left = r.x + 8;
        const right = r.x + r.w - 8;
        line(k, left, cy, right, cy, 2);
        arrowHead(k, right, cy, 0, 6);
        arrowHead(k, left, cy, Math.PI, 6);
        const steps = 6;
        for (let i = 0; i <= steps; i++) {
            const tx = left + (i * (right - left)) / steps;
            line(k, tx, cy - 5, tx, cy + 5, 1.5);
        }
    },

    tool_calculator: (k) => {
        const { r } = k;
        k.c.save();
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.8;
        k.c.strokeRect(r.x + 6, r.y + 4, r.w - 12, r.h - 8);
        k.c.strokeRect(r.x + 10, r.y + 8, r.w - 20, (r.h - 8) * 0.22);
        const btnTop = r.y + 12 + (r.h - 8) * 0.22;
        const btnH = (r.y + r.h - 8 - btnTop) / 3;
        const btnW = (r.w - 20) / 3;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                k.c.strokeRect(r.x + 10 + col * btnW + 2, btnTop + row * btnH + 2, btnW - 4, btnH - 4);
            }
        }
        k.c.restore();
    },

    axes: (k) =>
        void drawGridAxes(k, {
            unitsX: clampInt(k.o.n, 1, 20, 5),
            unitsY: clampInt(k.o.n, 1, 20, 5),
            quadrantOne: false,
            labels: k.o.labels !== false,
        }),

    axes_q1: (k) =>
        void drawGridAxes(k, {
            unitsX: clampInt(k.o.n, 1, 20, 10),
            unitsY: clampInt(k.o.n, 1, 20, 10),
            quadrantOne: true,
            labels: k.o.labels !== false,
        }),

    function_plot: (k) => {
        const units = clampInt(k.o.n, 2, 20, 5);
        const expr = k.o.expr?.trim();
        const showTitle = k.o.labels !== false && !!expr;
        const g = drawGridAxes(k, {
            unitsX: units,
            unitsY: units,
            quadrantOne: false,
            labels: k.o.labels !== false,
            topPad: showTitle ? k.fs * 1.5 : 0,
        });
        if (!expr) return;
        let f: (x: number) => number;
        try {
            f = compileExpression(expr);
        } catch {
            label(k, 'İfade okunamadı', (g.left + g.right) / 2, g.top + k.fs, 'center', 'middle', 0.85);
            return;
        }
        k.c.save();
        k.c.lineWidth = Math.max(k.lw * 1.4, 2);
        k.c.beginPath();
        let started = false;
        let prevY = NaN;
        for (let px = g.left; px <= g.right; px += 1) {
            const x = (px - g.originX) / g.stepX;
            const y = f(x);
            if (!Number.isFinite(y)) {
                started = false;
                prevY = NaN;
                continue;
            }
            const py = g.originY - y * g.stepY;
            const outside = py < g.top - 4 || py > g.bottom + 4;
            // Asimptotlarda (ör. tan x) sıçramayı kalemi kaldırarak kes.
            const jumped = Number.isFinite(prevY) && Math.abs(py - prevY) > k.r.h;
            if (outside || jumped) {
                started = false;
                prevY = py;
                continue;
            }
            if (!started) {
                k.c.moveTo(px, py);
                started = true;
            } else {
                k.c.lineTo(px, py);
            }
            prevY = py;
        }
        k.c.stroke();
        k.c.restore();
        if (showTitle)
            label(k, `y = ${expr}`, k.r.x + k.r.w / 2, k.r.y + k.fs * 0.8, 'center', 'middle', 0.95);
    },

    number_line: (k) => {
        const { r } = k;
        const start = Math.round(k.o.k ?? 0);
        const count = clampInt(k.o.n, 2, 40, 10);
        const y = r.y + r.h / 2;
        const left = r.x + 14;
        const right = r.x + r.w - 14;
        const step = (right - left) / count;
        line(k, r.x + 2, y, r.x + r.w - 2, y);
        arrowHead(k, r.x + r.w - 2, y, 0, 9);
        arrowHead(k, r.x + 2, y, Math.PI, 9);
        const sub = k.o.m && k.o.m > 1 ? clampInt(k.o.m, 2, 10, 2) : 0;
        for (let i = 0; i <= count; i++) {
            const x = left + i * step;
            line(k, x, y - 9, x, y + 9, Math.max(1, k.lw));
            if (k.o.labels !== false)
                label(k, String(start + i), x, y + 9 + k.fs * 0.85, 'center', 'middle', 0.85);
            if (sub && i < count) {
                for (let j = 1; j < sub; j++) {
                    const sx = x + (step * j) / sub;
                    line(k, sx, y - 4.5, sx, y + 4.5, 1);
                }
            }
        }
    },

    unit_circle: (k) => {
        const { r } = k;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const rad = Math.min(r.w, r.h) / 2 - k.fs * 2.6;
        line(k, cx - rad - 8, cy, cx + rad + 8, cy);
        line(k, cx, cy + rad + 8, cx, cy - rad - 8);
        arrowHead(k, cx + rad + 8, cy, 0, 7);
        arrowHead(k, cx, cy - rad - 8, -Math.PI / 2, 7);
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.35);
        for (const deg of angles) {
            const a = (-deg * Math.PI) / 180;
            line(k, cx, cy, cx + rad * Math.cos(a), cy + rad * Math.sin(a), 1);
        }
        k.c.restore();
        if (k.o.labels !== false) {
            for (const deg of angles) {
                const a = (-deg * Math.PI) / 180;
                const lr = rad + k.fs * 1.3;
                label(k, `${deg}°`, cx + lr * Math.cos(a), cy + lr * Math.sin(a), 'center', 'middle', 0.72);
            }
        }
        // Vurgulanan açı
        const hi = k.o.k;
        if (typeof hi === 'number') {
            const a = (-hi * Math.PI) / 180;
            k.c.save();
            k.c.lineWidth = Math.max(2, k.lw * 1.6);
            line(k, cx, cy, cx + rad * Math.cos(a), cy + rad * Math.sin(a));
            k.c.beginPath();
            k.c.arc(cx, cy, rad * 0.28, 0, a, a > 0);
            k.c.stroke();
            k.c.restore();
        }
    },

    polar_grid: (k) => {
        const { r } = k;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const rad = Math.min(r.w, r.h) / 2 - 6;
        const rings = clampInt(k.o.n, 2, 10, 5);
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.35);
        for (let i = 1; i <= rings; i++) {
            k.c.beginPath();
            k.c.lineWidth = 1;
            k.c.arc(cx, cy, (rad * i) / rings, 0, Math.PI * 2);
            k.c.stroke();
        }
        for (let deg = 0; deg < 180; deg += 15) {
            const a = (deg * Math.PI) / 180;
            line(k, cx - rad * Math.cos(a), cy - rad * Math.sin(a), cx + rad * Math.cos(a), cy + rad * Math.sin(a), 1);
        }
        k.c.restore();
        line(k, cx - rad, cy, cx + rad, cy);
        line(k, cx, cy - rad, cx, cy + rad);
    },

    angle: (k) => {
        const { r } = k;
        const deg = clampInt(k.o.k, 1, 359, 60);
        const vx = r.x + k.fs;
        const vy = r.y + r.h - k.fs;
        const len = Math.min(r.w - k.fs * 2, r.h - k.fs * 2);
        const a = (-deg * Math.PI) / 180;
        line(k, vx, vy, vx + len, vy);
        line(k, vx, vy, vx + len * Math.cos(a), vy + len * Math.sin(a));
        arrowHead(k, vx + len, vy, 0, 8);
        arrowHead(k, vx + len * Math.cos(a), vy + len * Math.sin(a), a, 8);
        const ar = len * 0.28;
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.arc(vx, vy, ar, a, 0);
        k.c.stroke();
        if (k.o.labels !== false) {
            const mid = a / 2;
            label(k, `${deg}°`, vx + ar * 1.5 * Math.cos(mid), vy + ar * 1.5 * Math.sin(mid), 'center', 'middle', 0.95);
            label(k, 'O', vx - k.fs * 0.6, vy + k.fs * 0.6, 'center', 'middle', 0.85);
        }
    },

    triangle_labeled: (k) => {
        const { r } = k;
        const pad = k.fs * 1.1;
        const A = { x: r.x + r.w * 0.42, y: r.y + pad };
        const B = { x: r.x + pad, y: r.y + r.h - pad };
        const C = { x: r.x + r.w - pad, y: r.y + r.h - pad };
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.moveTo(A.x, A.y);
        k.c.lineTo(B.x, B.y);
        k.c.lineTo(C.x, C.y);
        k.c.closePath();
        k.c.stroke();
        if (k.o.labels === false) return;
        label(k, 'A', A.x, A.y - k.fs * 0.75);
        label(k, 'B', B.x - k.fs * 0.7, B.y + k.fs * 0.6);
        label(k, 'C', C.x + k.fs * 0.7, C.y + k.fs * 0.6);
        label(k, 'c', (A.x + B.x) / 2 - k.fs * 0.7, (A.y + B.y) / 2, 'center', 'middle', 0.85);
        label(k, 'b', (A.x + C.x) / 2 + k.fs * 0.7, (A.y + C.y) / 2, 'center', 'middle', 0.85);
        label(k, 'a', (B.x + C.x) / 2, (B.y + C.y) / 2 + k.fs * 0.8, 'center', 'middle', 0.85);
    },

    right_triangle: (k) => {
        const { r } = k;
        const pad = k.fs * 1.1;
        const B = { x: r.x + pad, y: r.y + r.h - pad };
        const C = { x: r.x + r.w - pad, y: r.y + r.h - pad };
        const A = { x: r.x + pad, y: r.y + pad };
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.moveTo(A.x, A.y);
        k.c.lineTo(B.x, B.y);
        k.c.lineTo(C.x, C.y);
        k.c.closePath();
        k.c.stroke();
        // Dik açı işareti
        const m = Math.min(14, Math.min(r.w, r.h) * 0.13);
        k.c.beginPath();
        k.c.lineWidth = Math.max(1, k.lw * 0.8);
        k.c.moveTo(B.x, B.y - m);
        k.c.lineTo(B.x + m, B.y - m);
        k.c.lineTo(B.x + m, B.y);
        k.c.stroke();
        if (k.o.labels === false) return;
        label(k, 'a', B.x - k.fs * 0.75, (A.y + B.y) / 2, 'center', 'middle', 0.9);
        label(k, 'b', (B.x + C.x) / 2, C.y + k.fs * 0.8, 'center', 'middle', 0.9);
        label(k, 'c', (A.x + C.x) / 2 + k.fs * 0.5, (A.y + C.y) / 2 - k.fs * 0.5, 'center', 'middle', 0.9);
        label(k, 'a² + b² = c²', r.x + r.w / 2, r.y + k.fs * 0.7, 'center', 'middle', 0.8);
    },

    circle_parts: (k) => {
        const { r } = k;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const rad = Math.min(r.w, r.h) / 2 - k.fs;
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        k.c.beginPath();
        k.c.arc(cx, cy, Math.max(2, k.lw), 0, Math.PI * 2);
        k.c.fill();
        line(k, cx - rad, cy, cx + rad, cy); // çap
        const a = -Math.PI / 3;
        line(k, cx, cy, cx + rad * Math.cos(a), cy + rad * Math.sin(a)); // yarıçap
        // kiriş
        line(k, cx + rad * Math.cos(2.2), cy + rad * Math.sin(2.2), cx + rad * Math.cos(3.9), cy + rad * Math.sin(3.9));
        if (k.o.labels === false) return;
        label(k, 'O', cx - k.fs * 0.75, cy + k.fs * 0.7, 'center', 'middle', 0.85);
        label(k, 'r', cx + rad * 0.5 * Math.cos(a) + k.fs * 0.55, cy + rad * 0.5 * Math.sin(a), 'center', 'middle', 0.85);
        label(k, 'çap', cx + rad * 0.45, cy + k.fs * 0.8, 'center', 'middle', 0.75);
        label(k, 'kiriş', cx - rad * 0.58, cy + rad * 0.48, 'center', 'middle', 0.7);
    },

    polygon: (k) => {
        const { r } = k;
        const n = clampInt(k.o.n, 3, 16, 6);
        // Alttaki bilgi satırına yer bırak.
        const labelBand = k.o.labels === false ? 0 : k.fs * 1.6;
        const cx = r.x + r.w / 2;
        const cy = r.y + (r.h - labelBand) / 2;
        const rad = Math.min(r.w, r.h - labelBand) / 2 - 4;
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        for (let i = 0; i < n; i++) {
            const a = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
            const x = cx + rad * Math.cos(a);
            const y = cy + rad * Math.sin(a);
            if (i === 0) k.c.moveTo(x, y);
            else k.c.lineTo(x, y);
        }
        k.c.closePath();
        k.c.stroke();
        if (k.o.labels !== false)
            label(k, `${n} kenar · iç açı ${Math.round(((n - 2) * 180) / n)}°`, cx, r.y + r.h - k.fs * 0.3, 'center', 'bottom', 0.72);
    },

    ruler_strip: (k) => {
        const { r } = k;
        const cm = clampInt(k.o.n, 2, 40, 10);
        const top = r.y;
        const h = Math.min(r.h, 60);
        const left = r.x + 6;
        const right = r.x + r.w - 6;
        const step = (right - left) / cm;
        k.c.strokeRect(r.x, top, r.w, h);
        for (let i = 0; i <= cm; i++) {
            const x = left + i * step;
            line(k, x, top, x, top + h * 0.45, Math.max(1, k.lw));
            if (k.o.labels !== false)
                label(k, String(i), x, top + h * 0.72, 'center', 'middle', 0.8);
            if (i < cm) {
                for (let j = 1; j < 10; j++) {
                    const sx = x + (step * j) / 10;
                    line(k, sx, top, sx, top + h * (j === 5 ? 0.3 : 0.18), 1);
                }
            }
        }
        if (k.o.labels !== false) label(k, 'cm', right, top + h * 0.9, 'right', 'middle', 0.7);
    },

    cube: (k) => {
        const r = k.o.labels === false ? k.r : inset(k.r, k.fs * 0.6, k.fs * 0.7);
        const d = Math.min(r.w, r.h) * 0.3;
        const s = Math.min(r.w - d, r.h - d) - 4;
        const x = r.x + 2;
        const y = r.y + d + 2;
        k.c.lineWidth = k.lw;
        k.c.strokeRect(x, y, s, s);
        line(k, x, y, x + d, y - d);
        line(k, x + s, y, x + s + d, y - d);
        line(k, x + s, y + s, x + s + d, y + s - d);
        line(k, x + d, y - d, x + s + d, y - d);
        line(k, x + s + d, y - d, x + s + d, y + s - d);
        k.c.save();
        k.c.setLineDash([5, 4]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        line(k, x, y + s, x + d, y + s - d);
        line(k, x + d, y + s - d, x + d, y - d);
        line(k, x + d, y + s - d, x + s + d, y + s - d);
        k.c.restore();
        if (k.o.labels !== false) label(k, 'a', x + s / 2, y + s + k.fs * 0.75, 'center', 'middle', 0.85);
    },

    rect_prism: (k) => {
        const r = k.o.labels === false ? k.r : inset(k.r, k.fs * 1.1, k.fs * 0.7);
        const d = Math.min(r.w, r.h) * 0.26;
        const w = r.w - d - 4;
        const h = r.h - d - 4;
        const x = r.x + 2;
        const y = r.y + d + 2;
        k.c.lineWidth = k.lw;
        k.c.strokeRect(x, y, w, h);
        line(k, x, y, x + d, y - d);
        line(k, x + w, y, x + w + d, y - d);
        line(k, x + w, y + h, x + w + d, y + h - d);
        line(k, x + d, y - d, x + w + d, y - d);
        line(k, x + w + d, y - d, x + w + d, y + h - d);
        k.c.save();
        k.c.setLineDash([5, 4]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        line(k, x, y + h, x + d, y + h - d);
        line(k, x + d, y + h - d, x + d, y - d);
        line(k, x + d, y + h - d, x + w + d, y + h - d);
        k.c.restore();
        if (k.o.labels === false) return;
        label(k, 'a', x + w / 2, y + h + k.fs * 0.75, 'center', 'middle', 0.85);
        label(k, 'b', x - k.fs * 0.7, y + h / 2, 'center', 'middle', 0.85);
        label(k, 'c', x + w + d * 0.55, y + h - d * 0.4, 'center', 'middle', 0.85);
    },

    cylinder: (k) => {
        const { r } = k;
        const rx = r.w / 2 - 4;
        const ry = Math.min(r.h * 0.16, rx * 0.45);
        const cx = r.x + r.w / 2;
        const top = r.y + ry + 2;
        const bottom = r.y + r.h - ry - 2;
        ellipse(k, cx, top, rx, ry);
        line(k, cx - rx, top, cx - rx, bottom);
        line(k, cx + rx, top, cx + rx, bottom);
        k.c.save();
        k.c.lineWidth = k.lw;
        k.c.beginPath();
        k.c.ellipse(cx, bottom, rx, ry, 0, 0, Math.PI);
        k.c.stroke();
        k.c.setLineDash([5, 4]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        k.c.beginPath();
        k.c.ellipse(cx, bottom, rx, ry, 0, Math.PI, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        if (k.o.labels === false) return;
        line(k, cx, top, cx + rx, top, 1);
        label(k, 'r', cx + rx * 0.5, top - k.fs * 0.6, 'center', 'middle', 0.85);
        label(k, 'h', cx + rx + k.fs * 0.6, (top + bottom) / 2, 'center', 'middle', 0.85);
    },

    cone: (k) => {
        const { r } = k;
        const rx = r.w / 2 - 4;
        const ry = Math.min(r.h * 0.15, rx * 0.45);
        const cx = r.x + r.w / 2;
        const apex = r.y + 3;
        const base = r.y + r.h - ry - 3;
        line(k, cx - rx, base, cx, apex);
        line(k, cx + rx, base, cx, apex);
        k.c.save();
        k.c.lineWidth = k.lw;
        k.c.beginPath();
        k.c.ellipse(cx, base, rx, ry, 0, 0, Math.PI);
        k.c.stroke();
        k.c.setLineDash([5, 4]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        k.c.beginPath();
        k.c.ellipse(cx, base, rx, ry, 0, Math.PI, Math.PI * 2);
        k.c.stroke();
        line(k, cx, apex, cx, base);
        k.c.restore();
        if (k.o.labels === false) return;
        label(k, 'h', cx + k.fs * 0.6, (apex + base) / 2, 'left', 'middle', 0.85);
        label(k, 'r', cx + rx * 0.5, base + k.fs * 0.85, 'center', 'middle', 0.85);
    },

    sphere: (k) => {
        const { r } = k;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const rad = Math.min(r.w, r.h) / 2 - 4;
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        k.c.save();
        k.c.lineWidth = k.lw;
        k.c.beginPath();
        k.c.ellipse(cx, cy, rad, rad * 0.3, 0, 0, Math.PI);
        k.c.stroke();
        k.c.setLineDash([5, 4]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        k.c.beginPath();
        k.c.ellipse(cx, cy, rad, rad * 0.3, 0, Math.PI, Math.PI * 2);
        k.c.stroke();
        k.c.restore();
        if (k.o.labels === false) return;
        line(k, cx, cy, cx + rad * 0.92, cy - rad * 0.38, 1);
        label(k, 'r', cx + rad * 0.5, cy - rad * 0.32, 'center', 'bottom', 0.85);
    },

    pyramid: (k) => {
        const r = k.o.labels === false ? k.r : inset(k.r, k.fs * 0.5, k.fs * 0.3);
        const d = Math.min(r.w, r.h) * 0.22;
        const w = r.w - d - 6;
        const apexX = r.x + w / 2 + d / 2;
        const apexY = r.y + 3;
        const bl = { x: r.x + 3, y: r.y + r.h - 3 };
        const br = { x: r.x + 3 + w, y: r.y + r.h - 3 };
        const backL = { x: bl.x + d, y: bl.y - d };
        const backR = { x: br.x + d, y: br.y - d };
        k.c.lineWidth = k.lw;
        k.c.beginPath();
        k.c.moveTo(bl.x, bl.y);
        k.c.lineTo(br.x, br.y);
        k.c.lineTo(backR.x, backR.y);
        k.c.stroke();
        line(k, bl.x, bl.y, apexX, apexY);
        line(k, br.x, br.y, apexX, apexY);
        line(k, backR.x, backR.y, apexX, apexY);
        k.c.save();
        k.c.setLineDash([5, 4]);
        k.c.strokeStyle = withAlpha(k.color, 0.55);
        line(k, bl.x, bl.y, backL.x, backL.y);
        line(k, backL.x, backL.y, backR.x, backR.y);
        line(k, backL.x, backL.y, apexX, apexY);
        k.c.restore();
        if (k.o.labels !== false) label(k, 'h', apexX + k.fs * 0.5, (apexY + bl.y) / 2, 'left', 'middle', 0.85);
    },

    fraction_circle: (k) => {
        const { r } = k;
        const n = clampInt(k.o.n, 1, 24, 4);
        const filled = clampInt(k.o.k, 0, n, Math.min(1, n));
        const cx = r.x + r.w / 2;
        const cy = r.y + (k.o.labels === false ? r.h / 2 : (r.h - k.fs * 1.6) / 2);
        const rad = Math.min(r.w, k.o.labels === false ? r.h : r.h - k.fs * 1.8) / 2 - 3;
        for (let i = 0; i < n; i++) {
            const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
            k.c.save();
            k.c.beginPath();
            k.c.moveTo(cx, cy);
            k.c.arc(cx, cy, rad, a0, a1);
            k.c.closePath();
            if (i < filled) {
                k.c.globalAlpha = 0.32;
                k.c.fill();
                k.c.globalAlpha = 1;
            }
            k.c.lineWidth = k.lw;
            k.c.stroke();
            k.c.restore();
        }
        if (k.o.labels === false) return;
        const ly = cy + rad + k.fs * 1.35;
        label(k, String(filled), cx, ly - k.fs * 0.55, 'center', 'middle', 0.95);
        line(k, cx - k.fs * 0.5, ly, cx + k.fs * 0.5, ly, Math.max(1, k.lw));
        label(k, String(n), cx, ly + k.fs * 0.6, 'center', 'middle', 0.95);
    },

    fraction_bar: (k) => {
        const { r } = k;
        const n = clampInt(k.o.n, 1, 24, 4);
        const filled = clampInt(k.o.k, 0, n, Math.min(1, n));
        const h = Math.min(r.h - (k.o.labels === false ? 0 : k.fs * 1.6), r.h);
        const cell = r.w / n;
        for (let i = 0; i < n; i++) {
            k.c.save();
            k.c.beginPath();
            k.c.rect(r.x + i * cell, r.y, cell, h);
            if (i < filled) {
                k.c.globalAlpha = 0.32;
                k.c.fill();
                k.c.globalAlpha = 1;
            }
            k.c.lineWidth = k.lw;
            k.c.stroke();
            k.c.restore();
        }
        if (k.o.labels !== false)
            label(k, `${filled}/${n}`, r.x + r.w / 2, r.y + h + k.fs * 0.9, 'center', 'middle', 0.95);
    },

    base_ten: (k) => {
        const { r } = k;
        const value = clampInt(k.o.n, 0, 999, 34);
        const hundreds = Math.floor(value / 100);
        const tens = Math.floor((value % 100) / 10);
        const ones = value % 10;
        const unit = Math.max(4, Math.min(r.w / 26, (r.h - k.fs * 1.6) / 12));
        let x = r.x + 2;
        const top = r.y + 2;
        k.c.lineWidth = Math.max(1, k.lw * 0.7);
        // Yüzlükler (10x10 levha)
        for (let i = 0; i < hundreds; i++) {
            k.c.strokeRect(x, top, unit * 10, unit * 10);
            for (let j = 1; j < 10; j++) {
                line(k, x + j * unit, top, x + j * unit, top + unit * 10, 1);
                line(k, x, top + j * unit, x + unit * 10, top + j * unit, 1);
            }
            x += unit * 10 + unit;
        }
        // Onluklar (1x10 çubuk)
        for (let i = 0; i < tens; i++) {
            k.c.strokeRect(x, top, unit, unit * 10);
            for (let j = 1; j < 10; j++) line(k, x, top + j * unit, x + unit, top + j * unit, 1);
            x += unit * 1.7;
        }
        // Birlikler
        x += unit * 0.8;
        for (let i = 0; i < ones; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            k.c.strokeRect(x + col * unit * 1.4, top + row * unit * 1.4, unit, unit);
        }
        if (k.o.labels !== false)
            label(k, `${value} = ${hundreds ? `${hundreds} yüzlük + ` : ''}${tens} onluk + ${ones} birlik`,
                r.x, r.y + r.h - 2, 'left', 'bottom', 0.75);
    },

    hundred_grid: (k) => {
        const { r } = k;
        const size = Math.min(r.w, r.h);
        const cell = size / 10;
        const x0 = r.x;
        const y0 = r.y;
        k.c.lineWidth = Math.max(1, k.lw * 0.7);
        for (let i = 0; i <= 10; i++) {
            line(k, x0 + i * cell, y0, x0 + i * cell, y0 + size, i % 5 === 0 ? k.lw : 1);
            line(k, x0, y0 + i * cell, x0 + size, y0 + i * cell, i % 5 === 0 ? k.lw : 1);
        }
        if (k.o.labels === false) return;
        k.c.save();
        k.c.font = `${Math.round(cell * 0.42)}px ui-sans-serif, system-ui, Arial`;
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                k.c.fillText(String(row * 10 + col + 1), x0 + (col + 0.5) * cell, y0 + (row + 0.5) * cell);
            }
        }
        k.c.restore();
    },

    times_table: (k) => {
        const { r } = k;
        const n = clampInt(k.o.n, 2, 12, 10);
        const cols = n + 1;
        const cw = r.w / cols;
        const ch = r.h / cols;
        k.c.lineWidth = Math.max(1, k.lw * 0.7);
        for (let i = 0; i <= cols; i++) {
            line(k, r.x + i * cw, r.y, r.x + i * cw, r.y + r.h, i === 1 ? k.lw : 1);
            line(k, r.x, r.y + i * ch, r.x + r.w, r.y + i * ch, i === 1 ? k.lw : 1);
        }
        k.c.save();
        k.c.font = `${Math.round(Math.min(cw, ch) * 0.42)}px ui-sans-serif, system-ui, Arial`;
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        k.c.fillText('×', r.x + cw / 2, r.y + ch / 2);
        for (let i = 1; i <= n; i++) {
            k.c.fillText(String(i), r.x + (i + 0.5) * cw, r.y + ch / 2);
            k.c.fillText(String(i), r.x + cw / 2, r.y + (i + 0.5) * ch);
        }
        if (k.o.labels !== false) {
            for (let a = 1; a <= n; a++)
                for (let b = 1; b <= n; b++)
                    k.c.fillText(String(a * b), r.x + (b + 0.5) * cw, r.y + (a + 0.5) * ch);
        }
        k.c.restore();
    },

    venn: (k) => {
        const { r } = k;
        const sets = clampInt(k.o.n, 2, 3, 2);
        k.c.lineWidth = k.lw;
        if (sets === 2) {
            const rad = Math.min(r.w / 3, r.h / 2) - 4;
            const cy = r.y + r.h / 2;
            const cx1 = r.x + r.w / 2 - rad * 0.62;
            const cx2 = r.x + r.w / 2 + rad * 0.62;
            [cx1, cx2].forEach((cx) => {
                k.c.beginPath();
                k.c.arc(cx, cy, rad, 0, Math.PI * 2);
                k.c.stroke();
            });
            if (k.o.labels !== false) {
                label(k, 'A', cx1 - rad * 0.62, cy - rad * 0.72);
                label(k, 'B', cx2 + rad * 0.62, cy - rad * 0.72);
            }
        } else {
            const rad = Math.min(r.w / 3, r.h / 3);
            const cx = r.x + r.w / 2;
            const cy = r.y + r.h / 2;
            const pts = [
                { x: cx, y: cy - rad * 0.6 },
                { x: cx - rad * 0.55, y: cy + rad * 0.4 },
                { x: cx + rad * 0.55, y: cy + rad * 0.4 },
            ];
            pts.forEach((p) => {
                k.c.beginPath();
                k.c.arc(p.x, p.y, rad, 0, Math.PI * 2);
                k.c.stroke();
            });
            if (k.o.labels !== false) {
                label(k, 'A', pts[0].x, pts[0].y - rad * 0.78);
                label(k, 'B', pts[1].x - rad * 0.7, pts[1].y + rad * 0.62);
                label(k, 'C', pts[2].x + rad * 0.7, pts[2].y + rad * 0.62);
            }
        }
    },

    clock: (k) => {
        const { r } = k;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const rad = Math.min(r.w, r.h) / 2 - 4;
        k.c.beginPath();
        k.c.lineWidth = k.lw;
        k.c.arc(cx, cy, rad, 0, Math.PI * 2);
        k.c.stroke();
        for (let i = 0; i < 60; i++) {
            const a = (-Math.PI / 2) + (i * Math.PI) / 30;
            const big = i % 5 === 0;
            const inner = rad * (big ? 0.86 : 0.93);
            line(k, cx + inner * Math.cos(a), cy + inner * Math.sin(a), cx + rad * Math.cos(a), cy + rad * Math.sin(a), big ? k.lw : 1);
        }
        if (k.o.labels !== false) {
            for (let i = 1; i <= 12; i++) {
                const a = (-Math.PI / 2) + (i * Math.PI) / 6;
                label(k, String(i), cx + rad * 0.73 * Math.cos(a), cy + rad * 0.73 * Math.sin(a), 'center', 'middle', 0.95);
            }
        }
        const hour = clampInt(k.o.k, 0, 23, 3) % 12;
        const minute = clampInt(k.o.m, 0, 59, 0);
        const ma = (-Math.PI / 2) + (minute * Math.PI) / 30;
        const ha = (-Math.PI / 2) + ((hour + minute / 60) * Math.PI) / 6;
        line(k, cx, cy, cx + rad * 0.52 * Math.cos(ha), cy + rad * 0.52 * Math.sin(ha), Math.max(2.5, k.lw * 1.8));
        line(k, cx, cy, cx + rad * 0.76 * Math.cos(ma), cy + rad * 0.76 * Math.sin(ma), Math.max(1.6, k.lw * 1.1));
        k.c.beginPath();
        k.c.arc(cx, cy, Math.max(2.5, k.lw * 1.6), 0, Math.PI * 2);
        k.c.fill();
    },

    balance: (k) => {
        const { r } = k;
        const cx = r.x + r.w / 2;
        const beamY = r.y + r.h * 0.3;
        const baseY = r.y + r.h - 4;
        const arm = r.w / 2 - 10;
        k.c.lineWidth = k.lw;
        line(k, cx - arm, beamY, cx + arm, beamY);
        line(k, cx, beamY, cx - r.w * 0.11, baseY);
        line(k, cx, beamY, cx + r.w * 0.11, baseY);
        line(k, cx - r.w * 0.16, baseY, cx + r.w * 0.16, baseY);
        // Kefeler
        [-1, 1].forEach((s) => {
            const px = cx + s * arm;
            line(k, px, beamY, px, beamY + r.h * 0.16);
            k.c.beginPath();
            k.c.moveTo(px - r.w * 0.13, beamY + r.h * 0.16);
            k.c.lineTo(px + r.w * 0.13, beamY + r.h * 0.16);
            k.c.lineTo(px + r.w * 0.09, beamY + r.h * 0.29);
            k.c.lineTo(px - r.w * 0.09, beamY + r.h * 0.29);
            k.c.closePath();
            k.c.stroke();
        });
        if (k.o.labels !== false) label(k, '=', cx, beamY - k.fs * 0.9, 'center', 'middle', 1.1);
    },
};

// ── Katalog ──────────────────────────────────────────────────────────

export const MATH_CATEGORIES: ReadonlyArray<ObjectCategory> = [
    {
        label: 'Koordinat & Grafik',
        items: [
            {
                kind: 'axes',
                label: 'Koordinat Düzlemi',
                hint: 'Dört bölge, ızgaralı ve sayı etiketli',
                size: { w: 380, h: 380 },
                defaults: { n: 5, labels: true },
                fields: [{ key: 'n', label: 'Her yönde birim', type: 'number', min: 1, max: 20 }],
            },
            {
                kind: 'axes_q1',
                label: '1. Bölge',
                hint: 'Sadece pozitif eksenler',
                size: { w: 340, h: 300 },
                defaults: { n: 10, labels: true },
                fields: [{ key: 'n', label: 'Birim sayısı', type: 'number', min: 1, max: 20 }],
            },
            {
                kind: 'function_plot',
                label: 'Fonksiyon Grafiği',
                hint: 'y = x^2 - 3 gibi bir ifade çizdirin',
                size: { w: 400, h: 400 },
                defaults: { n: 5, expr: 'x^2 - 3', labels: true },
                fields: [
                    { key: 'expr', label: 'y =', type: 'text' },
                    { key: 'n', label: 'Eksen aralığı (±)', type: 'number', min: 2, max: 20 },
                ],
            },
            {
                kind: 'number_line',
                label: 'Sayı Doğrusu',
                hint: 'Başlangıç ve bölme sayısı ayarlanabilir',
                size: { w: 460, h: 110 },
                defaults: { n: 10, k: 0, m: 0, labels: true },
                fields: [
                    { key: 'k', label: 'Başlangıç değeri', type: 'number', min: -100, max: 100 },
                    { key: 'n', label: 'Bölme sayısı', type: 'number', min: 2, max: 40 },
                    { key: 'm', label: 'Ara bölme (0 = yok)', type: 'number', min: 0, max: 10 },
                ],
            },
            {
                kind: 'unit_circle',
                label: 'Birim Çember',
                hint: 'Trigonometri için dereceli çember',
                size: { w: 380, h: 380 },
                defaults: { k: 60, labels: true },
                fields: [{ key: 'k', label: 'Vurgulanan açı (°)', type: 'number', min: 0, max: 360 }],
            },
            {
                kind: 'polar_grid',
                label: 'Kutupsal Izgara',
                hint: 'Halkalı ve 15°lik ışınlı düzlem',
                size: { w: 340, h: 340 },
                defaults: { n: 5 },
                fields: [{ key: 'n', label: 'Halka sayısı', type: 'number', min: 2, max: 10 }],
            },
            {
                kind: 'tool_number_line',
                label: 'Sayı Doğrusu Aracı',
                hint: 'Tam sayı, kesir ve ondalık modlu işaretlenebilir sayı doğrusu',
                size: { w: 420, h: 100 },
                defaults: {},
            },
        ],
    },
    {
        label: 'Geometri',
        items: [
            {
                kind: 'tool_compass',
                label: 'İnteraktif Pergel',
                hint: 'Merkez nokta ve ayarlanabilir yarıçapla çember çizimi',
                size: { w: 260, h: 260 },
                defaults: {},
            },
            {
                kind: 'angle',
                label: 'Açı',
                hint: 'İstenen derecede açı ve yay',
                size: { w: 260, h: 220 },
                defaults: { k: 60, labels: true },
                fields: [{ key: 'k', label: 'Açı (°)', type: 'number', min: 1, max: 359 }],
            },
            {
                kind: 'triangle_labeled',
                label: 'Etiketli Üçgen',
                hint: 'A, B, C köşeleri ve a, b, c kenarları',
                size: { w: 280, h: 240 },
                defaults: { labels: true },
            },
            {
                kind: 'right_triangle',
                label: 'Dik Üçgen',
                hint: 'Pisagor bağıntısı için',
                size: { w: 280, h: 240 },
                defaults: { labels: true },
            },
            {
                kind: 'circle_parts',
                label: 'Çemberin Elemanları',
                hint: 'Merkez, yarıçap, çap, kiriş',
                size: { w: 280, h: 280 },
                defaults: { labels: true },
            },
            {
                kind: 'polygon',
                label: 'Düzgün Çokgen',
                hint: 'Kenar sayısı ve iç açı bilgisiyle',
                size: { w: 260, h: 260 },
                defaults: { n: 6, labels: true },
                fields: [{ key: 'n', label: 'Kenar sayısı', type: 'number', min: 3, max: 16 }],
            },
            {
                kind: 'ruler_strip',
                label: 'Cetvel Şeridi',
                hint: 'Ölçme etkinlikleri için mm bölmeli cetvel',
                size: { w: 460, h: 60 },
                defaults: { n: 10, labels: true },
                fields: [{ key: 'n', label: 'Uzunluk (cm)', type: 'number', min: 2, max: 40 }],
            },
        ],
    },
    {
        label: '10. Sınıf Geometri',
        items: GRADE10_GEOM_ITEMS,
    },
    {
        label: '10. Sınıf İstatistik',
        items: GRADE10_STATS_ITEMS,
    },
    {
        label: 'Geometrik Cisimler',
        items: [
            { kind: 'cube', label: 'Küp', hint: 'Görünmeyen ayrıtlar kesikli', size: { w: 240, h: 240 }, defaults: { labels: true } },
            { kind: 'rect_prism', label: 'Dikdörtgen Prizma', hint: 'a, b, c ayrıt etiketli', size: { w: 280, h: 240 }, defaults: { labels: true } },
            { kind: 'cylinder', label: 'Silindir', hint: 'r ve h etiketli', size: { w: 220, h: 280 }, defaults: { labels: true } },
            { kind: 'cone', label: 'Koni', hint: 'Yükseklik ve taban yarıçapı', size: { w: 220, h: 280 }, defaults: { labels: true } },
            { kind: 'sphere', label: 'Küre', hint: 'Ekvator çizgili', size: { w: 240, h: 240 }, defaults: { labels: true } },
            { kind: 'pyramid', label: 'Kare Piramit', hint: 'Yükseklik etiketli', size: { w: 260, h: 240 }, defaults: { labels: true } },
        ],
    },
    {
        label: 'Sayılar & Modelleme',
        items: [
            {
                kind: 'fraction_circle',
                label: 'Kesir Pastası',
                hint: 'Paydaya göre dilimlenmiş daire',
                size: { w: 240, h: 270 },
                defaults: { n: 4, k: 1, labels: true },
                fields: [
                    { key: 'k', label: 'Pay', type: 'number', min: 0, max: 24 },
                    { key: 'n', label: 'Payda', type: 'number', min: 1, max: 24 },
                ],
            },
            {
                kind: 'fraction_bar',
                label: 'Kesir Çubuğu',
                hint: 'Denk kesir karşılaştırmaları için',
                size: { w: 400, h: 110 },
                defaults: { n: 4, k: 1, labels: true },
                fields: [
                    { key: 'k', label: 'Pay', type: 'number', min: 0, max: 24 },
                    { key: 'n', label: 'Payda', type: 'number', min: 1, max: 24 },
                ],
            },
            {
                kind: 'base_ten',
                label: 'Onluk Taban Blokları',
                hint: 'Basamak değeri modellemesi',
                size: { w: 420, h: 220 },
                defaults: { n: 34, labels: true },
                fields: [{ key: 'n', label: 'Sayı (0-999)', type: 'number', min: 0, max: 999 }],
            },
            {
                kind: 'hundred_grid',
                label: "100'lük Tablo",
                hint: 'Örüntü ve çarpanlar için',
                size: { w: 340, h: 340 },
                defaults: { labels: true },
            },
            {
                kind: 'times_table',
                label: 'Çarpım Tablosu',
                hint: 'n × n çarpım kareleri',
                size: { w: 360, h: 360 },
                defaults: { n: 10, labels: true },
                fields: [{ key: 'n', label: 'Boyut', type: 'number', min: 2, max: 12 }],
            },
            {
                kind: 'venn',
                label: 'Venn Şeması',
                hint: '2 veya 3 kümeli',
                size: { w: 360, h: 280 },
                defaults: { n: 2, labels: true },
                fields: [{ key: 'n', label: 'Küme sayısı', type: 'number', min: 2, max: 3 }],
            },
            {
                kind: 'clock',
                label: 'Analog Saat',
                hint: 'Zaman ölçme etkinlikleri',
                size: { w: 260, h: 260 },
                defaults: { k: 3, m: 0, labels: true },
                fields: [
                    { key: 'k', label: 'Saat', type: 'number', min: 0, max: 23 },
                    { key: 'm', label: 'Dakika', type: 'number', min: 0, max: 59 },
                ],
            },
            {
                kind: 'balance',
                label: 'Denge Terazisi',
                hint: 'Denklem kurma modeli',
                size: { w: 340, h: 240 },
                defaults: { labels: true },
            },
            {
                kind: 'tool_calculator',
                label: 'Basit Hesap Makinesi',
                hint: 'Köşeye küçültülebilen 4 işlem ve kök/yüzde hesaplayıcı',
                size: { w: 220, h: 300 },
                defaults: {},
            },
        ],
    },
];

/** Katalogdaki bir nesneyi türüne göre bulur. */
