// src/components/drawing/strokeRenderer.ts
// Çizim verisinin canvas'a aktarılması ve geometri yardımcıları.
//
// Bileşenden ayrı tutulur; hem tuval hem de sayfa küçük resimleri aynı
// çizim mantığını kullanır.

import { drawVariableStroke, getPenProfile } from './penEngine';
import { drawMathObject } from './mathObjects';
import { getImage } from './imageStore';
import type { BoundingBox, Point, Stroke } from '../../types';

/** Kutusu birebir kullanılan (boşluk eklenmeyen) araçlar. */
export const TIGHT_TOOLS = ['math', 'image'];

export const SHAPE_TOOLS = ['rect', 'circle', 'triangle', 'line', 'dashed', 'arrow', 'double_arrow'];

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

const drawShape = (
    tCtx: CanvasRenderingContext2D,
    tool: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    fill?: boolean
) => {
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
export const drawStroke = (tCtx: CanvasRenderingContext2D, s: Stroke) => {
    if (!s || s.points.length < 1) return;

    if (s.tool === 'math') {
        drawMathObject(tCtx, s);
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
    } else {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        drawShape(tCtx, s.tool, p1.x, p1.y, p2.x, p2.y, s.fillEnabled);
    }
    tCtx.restore();
};

