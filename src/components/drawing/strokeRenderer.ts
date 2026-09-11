// src/components/drawing/strokeRenderer.ts
// Çizim verisinin canvas'a aktarılması ve geometri yardımcıları.
//
// Bileşenden ayrı tutulur; hem tuval hem de sayfa küçük resimleri aynı
// çizim mantığını kullanır.

import { drawVariableStroke, getPenProfile } from './penEngine';
import { drawLibraryObject } from './libraryObjects';
import { getImage } from './imageStore';
import type { BoundingBox, Point, Stroke } from '../../types';

/** Kutusu birebir kullanılan (boşluk eklenmeyen) araçlar. */
export const TIGHT_TOOLS = ['math', 'image'];

export const SHAPE_TOOLS = [
    'rect',
    'circle',
    'triangle',
    'polygon',
    'cube',
    'rect_prism',
    'tri_prism',
    'pyramid',
    'cylinder',
    'cone',
    'sphere',
    'line',
    'dashed',
    'arrow',
    'double_arrow',
];

export const getBB = (s: Stroke): BoundingBox => {
    let x1 = Math.min(...s.points.map((p) => p.x));
    let y1 = Math.min(...s.points.map((p) => p.y));
    let x2 = Math.max(...s.points.map((p) => p.x));
    let y2 = Math.max(...s.points.map((p) => p.y));

    if (s.tool === 'circle' && s.points.length >= 2) {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        const r = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        x1 = Math.min(x1, p1.x - r);
        y1 = Math.min(y1, p1.y - r);
        x2 = Math.max(x2, p1.x + r);
        y2 = Math.max(y2, p1.y + r);
    }

    // Matematik nesneleri ve fotoğraflar kutularına birebir oturur; serbest
    // çizimde ise parmakla seçimi kolaylaştırmak için bol boşluk bırakılır.
    const pad = TIGHT_TOOLS.includes(s.tool) ? 6 : Math.max((s.width || 2) / 2 + 6, 24);
    return { x1: x1 - pad, y1: y1 - pad, x2: x2 + pad, y2: y2 + pad };
};

export const unionBB = (list: BoundingBox[]): BoundingBox | null => {
    if (list.length === 0) return null;
    return {
        x1: Math.min(...list.map((b) => b.x1)),
        y1: Math.min(...list.map((b) => b.y1)),
        x2: Math.max(...list.map((b) => b.x2)),
        y2: Math.max(...list.map((b) => b.y2)),
    };
};

export const hitTest = (s: Stroke, x: number, y: number): boolean => {
    const bb = getBB(s);
    return x >= bb.x1 && x <= bb.x2 && y >= bb.y1 && y <= bb.y2;
};

/** Işın atma yöntemiyle nokta-çokgen testi (kement seçimi için). */
const pointInPolygon = (p: Point, poly: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i];
        const b = poly[j];
        if (
            a.y > p.y !== b.y > p.y &&
            p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y || 1e-9) + a.x
        ) {
            inside = !inside;
        }
    }
    return inside;
};

/** Bir çizim kementin içine düşüyor mu? */
export const strokeInPolygon = (s: Stroke, poly: Point[]): boolean => {
    // Şekil, matematik nesnesi ve fotoğraflar için köşeler + merkez yeterli.
    if (TIGHT_TOOLS.includes(s.tool) || SHAPE_TOOLS.includes(s.tool)) {
        const bb = getBB(s);
        const probes: Point[] = [
            { x: bb.x1, y: bb.y1 },
            { x: bb.x2, y: bb.y1 },
            { x: bb.x1, y: bb.y2 },
            { x: bb.x2, y: bb.y2 },
            { x: (bb.x1 + bb.x2) / 2, y: (bb.y1 + bb.y2) / 2 },
        ];
        return probes.some((p) => pointInPolygon(p, poly));
    }
    // Serbest çizim ve metin/damga: noktalarından biri içerideyse seçilir.
    return s.points.some((p) => pointInPolygon(p, poly));
};

export const getHandlePositions = (bb: BoundingBox) => {
    const { x1, y1, x2, y2 } = bb;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return [
        { id: 'nw', x: x1, y: y1 },
        { id: 'n', x: mx, y: y1 },
        { id: 'ne', x: x2, y: y1 },
        { id: 'w', x: x1, y: my },
        { id: 'e', x: x2, y: my },
        { id: 'sw', x: x1, y: y2 },
        { id: 's', x: mx, y: y2 },
        { id: 'se', x: x2, y: y2 },
    ];
};

export const resizePoints = (
    origPoints: Point[],
    origBB: BoundingBox,
    handle: string,
    dx: number,
    dy: number
): Point[] => {
    const { x1, y1, x2, y2 } = origBB;
    const w = x2 - x1 || 1;
    const h = y2 - y1 || 1;
    const nb = { x1, y1, x2, y2 };
    if (handle.includes('e')) nb.x2 = x2 + dx;
    if (handle.includes('w')) nb.x1 = x1 + dx;
    if (handle.includes('s')) nb.y2 = y2 + dy;
    if (handle.includes('n')) nb.y1 = y1 + dy;
    const sx = (nb.x2 - nb.x1) / w;
    const sy = (nb.y2 - nb.y1) / h;
    return origPoints.map((p) => ({
        ...p,
        x: nb.x1 + (p.x - x1) * sx,
        y: nb.y1 + (p.y - y1) * sy,
    }));
};

export const drawPolygon = (
    tCtx: CanvasRenderingContext2D,
    points: Point[],
    fill?: boolean,
    color?: string
) => {
    if (!points || points.length < 2) return;
    tCtx.save();
    tCtx.beginPath();
    tCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        tCtx.lineTo(points[i].x, points[i].y);
    }
    tCtx.closePath();

    if (fill) {
        tCtx.save();
        tCtx.globalAlpha = 0.22;
        tCtx.fillStyle = color || tCtx.strokeStyle;
        tCtx.fill();
        tCtx.restore();
    }
    tCtx.stroke();

    // GeoGebra stilinde köşeleri çiz ve etiketle: A, B, C, D...
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

    points.forEach((p, idx) => {
        // Köşe noktası
        tCtx.save();
        tCtx.beginPath();
        tCtx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        tCtx.fillStyle = '#ffffff';
        tCtx.fill();
        tCtx.lineWidth = 2;
        tCtx.strokeStyle = color || '#4f46e5';
        tCtx.stroke();

        // Köşe harf etiketi
        const letter = labels[idx % labels.length];
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const offset = 16;
        const lx = p.x + (dx / dist) * offset;
        const ly = p.y + (dy / dist) * offset;

        tCtx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.strokeStyle = '#ffffff';
        tCtx.lineWidth = 3;
        tCtx.strokeText(letter, lx, ly);
        tCtx.fillStyle = '#0f172a';
        tCtx.fillText(letter, lx, ly);
        tCtx.restore();
    });

    tCtx.restore();
};

const draw3DShape = (
    tCtx: CanvasRenderingContext2D,
    tool: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    fill?: boolean
) => {
    const bx = Math.min(x1, x2);
    const by = Math.min(y1, y2);
    const bw = Math.max(Math.abs(x2 - x1), 30);
    const bh = Math.max(Math.abs(y2 - y1), 30);

    if (tool === 'cube') {
        const d = Math.min(bw, bh) * 0.28;
        const s = Math.min(bw - d, bh - d);
        const fx = bx;
        const fy = by + d;

        // Ön kare
        tCtx.beginPath();
        tCtx.rect(fx, fy, s, s);
        // Üst ve sağ dış ayrıtlar
        tCtx.moveTo(fx, fy); tCtx.lineTo(fx + d, fy - d);
        tCtx.lineTo(fx + s + d, fy - d);
        tCtx.lineTo(fx + s, fy);
        tCtx.moveTo(fx + s + d, fy - d); tCtx.lineTo(fx + s + d, fy + s - d);
        tCtx.lineTo(fx + s, fy + s);
        tCtx.stroke();

        // Görünmeyen arka ayrıtlar (kesikli)
        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.moveTo(fx, fy + s); tCtx.lineTo(fx + d, fy + s - d);
        tCtx.lineTo(fx + d, fy - d);
        tCtx.moveTo(fx + d, fy + s - d); tCtx.lineTo(fx + s + d, fy + s - d);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.2;
            tCtx.fillRect(fx, fy, s, s);
            tCtx.beginPath();
            tCtx.moveTo(fx, fy); tCtx.lineTo(fx + d, fy - d);
            tCtx.lineTo(fx + s + d, fy - d); tCtx.lineTo(fx + s, fy);
            tCtx.closePath();
            tCtx.globalAlpha = 0.3;
            tCtx.fill();
            tCtx.beginPath();
            tCtx.moveTo(fx + s, fy); tCtx.lineTo(fx + s + d, fy - d);
            tCtx.lineTo(fx + s + d, fy + s - d); tCtx.lineTo(fx + s, fy + s);
            tCtx.closePath();
            tCtx.globalAlpha = 0.12;
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }

    if (tool === 'rect_prism') {
        const d = Math.min(bw, bh) * 0.26;
        const w = bw - d;
        const h = bh - d;
        const fx = bx;
        const fy = by + d;

        tCtx.beginPath();
        tCtx.rect(fx, fy, w, h);
        tCtx.moveTo(fx, fy); tCtx.lineTo(fx + d, fy - d);
        tCtx.lineTo(fx + w + d, fy - d);
        tCtx.lineTo(fx + w, fy);
        tCtx.moveTo(fx + w + d, fy - d); tCtx.lineTo(fx + w + d, fy + h - d);
        tCtx.lineTo(fx + w, fy + h);
        tCtx.stroke();

        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.moveTo(fx, fy + h); tCtx.lineTo(fx + d, fy + h - d);
        tCtx.lineTo(fx + d, fy - d);
        tCtx.moveTo(fx + d, fy + h - d); tCtx.lineTo(fx + w + d, fy + h - d);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.2;
            tCtx.fillRect(fx, fy, w, h);
            tCtx.beginPath();
            tCtx.moveTo(fx, fy); tCtx.lineTo(fx + d, fy - d);
            tCtx.lineTo(fx + w + d, fy - d); tCtx.lineTo(fx + w, fy);
            tCtx.closePath();
            tCtx.globalAlpha = 0.3;
            tCtx.fill();
            tCtx.beginPath();
            tCtx.moveTo(fx + w, fy); tCtx.lineTo(fx + w + d, fy - d);
            tCtx.lineTo(fx + w + d, fy + h - d); tCtx.lineTo(fx + w, fy + h);
            tCtx.closePath();
            tCtx.globalAlpha = 0.12;
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }

    if (tool === 'tri_prism') {
        const d = Math.min(bw, bh) * 0.28;
        const w = bw - d;
        const p1 = { x: bx + w / 2, y: by + d };
        const p2 = { x: bx, y: by + bh };
        const p3 = { x: bx + w, y: by + bh };
        const b1 = { x: p1.x + d, y: p1.y - d };
        const b2 = { x: p2.x + d, y: p2.y - d };
        const b3 = { x: p3.x + d, y: p3.y - d };

        tCtx.beginPath();
        tCtx.moveTo(p1.x, p1.y); tCtx.lineTo(p2.x, p2.y); tCtx.lineTo(p3.x, p3.y); tCtx.closePath();
        tCtx.moveTo(p1.x, p1.y); tCtx.lineTo(b1.x, b1.y);
        tCtx.lineTo(b3.x, b3.y); tCtx.lineTo(p3.x, p3.y);
        tCtx.stroke();

        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.moveTo(p2.x, p2.y); tCtx.lineTo(b2.x, b2.y);
        tCtx.lineTo(b1.x, b1.y);
        tCtx.moveTo(b2.x, b2.y); tCtx.lineTo(b3.x, b3.y);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.2;
            tCtx.beginPath();
            tCtx.moveTo(p1.x, p1.y); tCtx.lineTo(p2.x, p2.y); tCtx.lineTo(p3.x, p3.y);
            tCtx.closePath();
            tCtx.fill();
            tCtx.beginPath();
            tCtx.moveTo(p1.x, p1.y); tCtx.lineTo(b1.x, b1.y); tCtx.lineTo(b3.x, b3.y); tCtx.lineTo(p3.x, p3.y);
            tCtx.closePath();
            tCtx.globalAlpha = 0.3;
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }

    if (tool === 'pyramid') {
        const apex = { x: bx + bw / 2, y: by };
        const a = { x: bx + bw * 0.1, y: by + bh * 0.78 };
        const b = { x: bx + bw * 0.7, y: by + bh };
        const c = { x: bx + bw, y: by + bh * 0.78 };
        const d = { x: bx + bw * 0.4, y: by + bh * 0.58 };

        tCtx.beginPath();
        tCtx.moveTo(a.x, a.y); tCtx.lineTo(b.x, b.y); tCtx.lineTo(c.x, c.y);
        tCtx.moveTo(apex.x, apex.y); tCtx.lineTo(a.x, a.y);
        tCtx.moveTo(apex.x, apex.y); tCtx.lineTo(b.x, b.y);
        tCtx.moveTo(apex.x, apex.y); tCtx.lineTo(c.x, c.y);
        tCtx.stroke();

        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.moveTo(a.x, a.y); tCtx.lineTo(d.x, d.y); tCtx.lineTo(c.x, c.y);
        tCtx.moveTo(apex.x, apex.y); tCtx.lineTo(d.x, d.y);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.25;
            tCtx.beginPath();
            tCtx.moveTo(apex.x, apex.y); tCtx.lineTo(a.x, a.y); tCtx.lineTo(b.x, b.y);
            tCtx.closePath();
            tCtx.fill();
            tCtx.globalAlpha = 0.15;
            tCtx.beginPath();
            tCtx.moveTo(apex.x, apex.y); tCtx.lineTo(b.x, b.y); tCtx.lineTo(c.x, c.y);
            tCtx.closePath();
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }

    if (tool === 'cylinder') {
        const rx = bw / 2;
        const ry = Math.min(bh * 0.16, rx * 0.45);
        const cx = bx + rx;
        const topY = by + ry;
        const botY = by + bh - ry;

        tCtx.beginPath();
        tCtx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
        tCtx.stroke();

        tCtx.beginPath();
        tCtx.moveTo(cx - rx, topY); tCtx.lineTo(cx - rx, botY);
        tCtx.moveTo(cx + rx, topY); tCtx.lineTo(cx + rx, botY);
        tCtx.ellipse(cx, botY, rx, ry, 0, 0, Math.PI);
        tCtx.stroke();

        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.ellipse(cx, botY, rx, ry, 0, Math.PI, Math.PI * 2);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.2;
            tCtx.beginPath();
            tCtx.rect(cx - rx, topY, bw, botY - topY);
            tCtx.ellipse(cx, botY, rx, ry, 0, 0, Math.PI);
            tCtx.fill();
            tCtx.beginPath();
            tCtx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
            tCtx.globalAlpha = 0.3;
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }

    if (tool === 'cone') {
        const rx = bw / 2;
        const ry = Math.min(bh * 0.16, rx * 0.45);
        const cx = bx + rx;
        const apexY = by;
        const botY = by + bh - ry;

        tCtx.beginPath();
        tCtx.moveTo(cx - rx, botY); tCtx.lineTo(cx, apexY); tCtx.lineTo(cx + rx, botY);
        tCtx.ellipse(cx, botY, rx, ry, 0, 0, Math.PI);
        tCtx.stroke();

        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.ellipse(cx, botY, rx, ry, 0, Math.PI, Math.PI * 2);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.2;
            tCtx.beginPath();
            tCtx.moveTo(cx - rx, botY); tCtx.lineTo(cx, apexY); tCtx.lineTo(cx + rx, botY);
            tCtx.ellipse(cx, botY, rx, ry, 0, 0, Math.PI);
            tCtx.closePath();
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }

    if (tool === 'sphere') {
        const rad = Math.min(bw, bh) / 2;
        const cx = bx + bw / 2;
        const cy = by + bh / 2;

        tCtx.beginPath();
        tCtx.arc(cx, cy, rad, 0, Math.PI * 2);
        tCtx.stroke();

        tCtx.beginPath();
        tCtx.ellipse(cx, cy, rad, rad * 0.28, 0, 0, Math.PI);
        tCtx.stroke();

        tCtx.save();
        tCtx.setLineDash([5, 4]);
        tCtx.beginPath();
        tCtx.ellipse(cx, cy, rad, rad * 0.28, 0, Math.PI, Math.PI * 2);
        tCtx.stroke();
        tCtx.restore();

        if (fill) {
            tCtx.save();
            tCtx.globalAlpha = 0.18;
            tCtx.beginPath();
            tCtx.arc(cx, cy, rad, 0, Math.PI * 2);
            tCtx.fill();
            tCtx.restore();
        }
        return;
    }
};

const drawShape = (
    tCtx: CanvasRenderingContext2D,
    tool: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    fill?: boolean
) => {
    if (
        ['cube', 'rect_prism', 'tri_prism', 'pyramid', 'cylinder', 'cone', 'sphere'].includes(tool)
    ) {
        draw3DShape(tCtx, tool, x1, y1, x2, y2, fill);
        return;
    }

    tCtx.beginPath();
    if (tool === 'rect') tCtx.rect(x1, y1, x2 - x1, y2 - y1);
    else if (tool === 'circle')
        tCtx.arc(
            x1,
            y1,
            Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
            0,
            Math.PI * 2
        );
    else if (tool === 'triangle') {
        tCtx.moveTo((x1 + x2) / 2, y1);
        tCtx.lineTo(x2, y2);
        tCtx.lineTo(x1, y2);
        tCtx.closePath();
    } else if (tool === 'line' || tool === 'dashed') {
        tCtx.moveTo(x1, y1);
        tCtx.lineTo(x2, y2);
    } else if (tool === 'arrow' || tool === 'double_arrow') {
        const h = 15;
        const a = Math.atan2(y2 - y1, x2 - x1);
        tCtx.moveTo(x1, y1);
        tCtx.lineTo(x2, y2);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(x2, y2);
        tCtx.lineTo(x2 - h * Math.cos(a - Math.PI / 6), y2 - h * Math.sin(a - Math.PI / 6));
        tCtx.moveTo(x2, y2);
        tCtx.lineTo(x2 - h * Math.cos(a + Math.PI / 6), y2 - h * Math.sin(a + Math.PI / 6));
        if (tool === 'double_arrow') {
            tCtx.moveTo(x1, y1);
            tCtx.lineTo(x1 + h * Math.cos(a - Math.PI / 6), y1 + h * Math.sin(a - Math.PI / 6));
            tCtx.moveTo(x1, y1);
            tCtx.lineTo(x1 + h * Math.cos(a + Math.PI / 6), y1 + h * Math.sin(a + Math.PI / 6));
        }
    }
    if (fill && !['line', 'dashed', 'arrow', 'double_arrow'].includes(tool)) {
        tCtx.save();
        tCtx.globalAlpha = 0.2;
        tCtx.fill();
        tCtx.restore();
    }
    tCtx.stroke();
};

/** Bir noktanın a–b doğru parçasına uzaklığı (çizgi silgisi için). */
const distanceToSegment = (p: Point, a: Point, b: Point): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/**
 * Çizgi silgisi için gerçek yola göre isabet testi. Serbest çizim ve
 * doğru parçalarında segmentlere, diğerlerinde sınırlayıcı kutuya bakar.
 */
export const strokeNearPoint = (s: Stroke, x: number, y: number, radius: number): boolean => {
    const p = { x, y };
    const tolerance = radius + (s.width || 2) / 2;
    if (s.tool === 'polygon' && s.points.length >= 2) {
        for (let i = 0; i < s.points.length; i++) {
            const pA = s.points[i];
            const pB = s.points[(i + 1) % s.points.length];
            if (distanceToSegment(p, pA, pB) <= tolerance) return true;
        }
        return false;
    }
    if (['pencil', 'highlighter', 'eraser', 'line', 'dashed', 'arrow', 'double_arrow'].includes(s.tool)) {
        if (s.points.length === 1) return Math.hypot(x - s.points[0].x, y - s.points[0].y) <= tolerance;
        const pts = ['line', 'dashed', 'arrow', 'double_arrow'].includes(s.tool)
            ? [s.points[0], s.points[s.points.length - 1]]
            : s.points;
        for (let i = 1; i < pts.length; i++) {
            if (distanceToSegment(p, pts[i - 1], pts[i]) <= tolerance) return true;
        }
        return false;
    }
    return hitTest(s, x, y);
};

/** Tek bir çizimi verilen bağlama çizer. Küçük resimlerde de kullanılır. */
export const drawStroke = (tCtx: CanvasRenderingContext2D, s: Stroke, time = 0) => {
    if (!s || s.points.length < 1) return;

    if (s.tool === 'math') {
        drawLibraryObject(tCtx, s, time);
        return;
    }

    if (s.tool === 'image') {
        if (!s.src || s.points.length < 2) return;
        const a = s.points[0];
        const b = s.points[s.points.length - 1];
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(b.x - a.x);
        const h = Math.abs(b.y - a.y);
        const img = getImage(s.src);
        if (img) {
            tCtx.drawImage(img, x, y, w, h);
        } else {
            // Yüklenene kadar yer tutucu çerçeve.
            tCtx.save();
            tCtx.strokeStyle = 'rgba(100,116,139,0.5)';
            tCtx.setLineDash([6, 5]);
            tCtx.lineWidth = 1.5;
            tCtx.strokeRect(x, y, w, h);
            tCtx.restore();
        }
        return;
    }

    tCtx.save();
    tCtx.strokeStyle = s.color;
    tCtx.fillStyle = s.color;
    tCtx.lineWidth = s.width || 2;
    tCtx.lineCap = 'round';
    tCtx.lineJoin = 'round';
    if (s.tool === 'eraser') tCtx.globalCompositeOperation = 'destination-out';
    if (s.tool === 'highlighter') tCtx.globalAlpha = 0.4;
    if (s.tool === 'dashed') tCtx.setLineDash([12, 6]);

    if (s.tool === 'pencil') {
        // Kalem ucuna göre değişken kalınlık (dolma kalem / fırça hissi).
        tCtx.globalAlpha *= getPenProfile(s.penType).alpha;
        drawVariableStroke(tCtx, s, s.width || 2);
        tCtx.restore();
        return;
    }

    if (['highlighter', 'eraser'].includes(s.tool)) {
        if (s.points.length < 2) {
            tCtx.beginPath();
            tCtx.arc(s.points[0].x, s.points[0].y, (s.width || 2) / 2, 0, Math.PI * 2);
            tCtx.fill();
        } else {
            tCtx.beginPath();
            tCtx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length - 1; i++) {
                const mid = {
                    x: (s.points[i].x + s.points[i + 1].x) / 2,
                    y: (s.points[i].y + s.points[i + 1].y) / 2,
                };
                tCtx.quadraticCurveTo(s.points[i].x, s.points[i].y, mid.x, mid.y);
            }
            const last = s.points[s.points.length - 1];
            if (last) tCtx.lineTo(last.x, last.y);
            tCtx.stroke();
        }
    } else if (s.tool === 'text') {
        tCtx.font = 'bold 20px Arial';
        tCtx.fillText(s.text || '', s.points[0].x, s.points[0].y);
    } else if (s.tool === 'stamp') {
        tCtx.font = '44px serif';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(s.stampIcon || '', s.points[0].x, s.points[0].y);
    } else if (s.tool === 'polygon') {
        drawPolygon(tCtx, s.points, s.fillEnabled, s.color);
    } else {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        drawShape(tCtx, s.tool, p1.x, p1.y, p2.x, p2.y, s.fillEnabled);
    }
    tCtx.restore();
};

/** Piksel silgisiyle parça parça kesilebilen (vektör iz bırakan) araçlar. */
const TRIMMABLE_TOOLS = ['pencil', 'highlighter'];

/**
 * Seçilebilir mi?
 *
 * Eski defterlerde silgi, üzerine `destination-out` bir katman koyan normal
 * bir çizim olarak saklanıyordu. Bu katmanlar hâlâ çizilir (yoksa eskiden
 * silinmiş içerik geri gelirdi) ama asla seçilemez: aksi halde silgi izi
 * kenara çekilip altındaki çizim ortaya çıkarılabiliyordu.
 */
export const isSelectable = (s: Stroke): boolean => s.tool !== 'eraser';

const lerp = (a: number | undefined, b: number | undefined, t: number): number | undefined => {
    if (a === undefined && b === undefined) return undefined;
    const av = a ?? b ?? 0;
    const bv = b ?? a ?? 0;
    return av + (bv - av) * t;
};

/**
 * Noktalar arasındaki boşlukları doldurur. Hızlı çizilen bir çizgide noktalar
 * seyrek olur; silgi iki nokta arasından geçtiğinde kesme yapılabilmesi için
 * ara noktalar gerekir.
 */
function densify(points: Point[], maxGap: number): Point[] {
    if (points.length < 2) return points;
    const out: Point[] = [points[0]];
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        const extra = Math.floor(distance / maxGap);
        for (let k = 1; k <= extra; k++) {
            const t = k / (extra + 1);
            out.push({
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t,
                p: lerp(a.p, b.p, t),
            });
        }
        out.push(b);
    }
    return out;
}

/**
 * Piksel silgisi: verilen daireye giren serbest çizim parçalarını keser.
 * Kalan parçalar ayrı çizimler olarak döner; hiçbir şey değişmediyse `null`.
 *
 * Şekil, metin, damga, matematik nesnesi ve fotoğraflar parça parça
 * silinemediği için bu silgiden etkilenmez — onları kaldırmak için
 * çizgi silgisi ya da seçip silme kullanılır.
 */
export function erasePixels(
    strokes: Stroke[],
    x: number,
    y: number,
    radius: number
): Stroke[] | null {
    let changed = false;
    const result: Stroke[] = [];

    for (const stroke of strokes) {
        if (!TRIMMABLE_TOOLS.includes(stroke.tool)) {
            result.push(stroke);
            continue;
        }
        // Ucuz eleme: silgi dairesi çizimin kutusuna değmiyorsa dokunma.
        const bb = getBB(stroke);
        if (x < bb.x1 - radius || x > bb.x2 + radius || y < bb.y1 - radius || y > bb.y2 + radius) {
            result.push(stroke);
            continue;
        }

        const reach = radius + (stroke.width || 2) / 2;
        const points = densify(stroke.points, Math.max(2, radius / 2));

        const runs: Point[][] = [];
        let run: Point[] = [];
        for (const point of points) {
            if (Math.hypot(point.x - x, point.y - y) <= reach) {
                if (run.length >= 2) runs.push(run);
                run = [];
            } else {
                run.push(point);
            }
        }
        if (run.length >= 2) runs.push(run);

        // Hiç nokta silinmediyse çizimi olduğu gibi bırak (densify'ı da atma).
        if (runs.length === 1 && runs[0].length === points.length) {
            result.push(stroke);
            continue;
        }
        changed = true;
        for (const segment of runs) result.push({ ...stroke, points: segment });
    }

    return changed ? result : null;
}
