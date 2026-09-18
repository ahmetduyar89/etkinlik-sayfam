// src/components/drawing/rulerTool.ts
// Cetvel, gönye ve açıölçer: ekranda duran, taşınıp döndürülebilen ölçü
// araçları. Kalem kenara yaklaştığında çizgi kenara oturur.
//
// Araçlar sayfaya kaydedilmez; yalnızca çizerken yardımcı olurlar.

import type { Point, Viewport } from '../../types';

export type RulerKind = 'ruler' | 'setsquare' | 'protractor';

export interface RulerState {
    kind: RulerKind;
    /** Aracın merkezi (dünya koordinatı). */
    x: number;
    y: number;
    /** Dönüş açısı (radyan). */
    angle: number;
}

/** Cetvelin dünya birimindeki uzunluğu ve genişliği. */
const RULER_LEN = 620;
const RULER_H = 74;
/** Gönyenin dik kenar uzunluğu. */
const SET_LEG = 420;
/** Açıölçerin yarıçapı. */
const PROTRACTOR_R = 230;

/** 1 cm kaç dünya birimi sayılsın (kareli defterin 1 karesi ≈ 0,5 cm). */
const PX_PER_CM = 52;

/** Kalem kenara bu mesafeden (ekran pikseli) yakınsa çizgi kenara oturur. */
export const RULER_SNAP_PX = 26;

const rot = (p: Point, angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos };
};

/** Yerel koordinattan dünya koordinatına. */
const toWorld = (state: RulerState, p: Point): Point => {
    const r = rot(p, state.angle);
    return { x: state.x + r.x, y: state.y + r.y };
};

/** Dünya koordinatından aracın kendi eksenine. */
export const toLocal = (state: RulerState, p: Point): Point =>
    rot({ x: p.x - state.x, y: p.y - state.y }, -state.angle);

/**
 * Çizginin oturabileceği kenarlar (dünya koordinatında doğru parçaları).
 * Cetvelde alt kenar, gönyede üç kenar, açıölçerde taban çizgisidir.
 */
export function rulerEdges(state: RulerState): [Point, Point][] {
    if (state.kind === 'ruler') {
        const half = RULER_LEN / 2;
        const y = RULER_H / 2;
        return [
            [toWorld(state, { x: -half, y }), toWorld(state, { x: half, y })],
            [toWorld(state, { x: -half, y: -y }), toWorld(state, { x: half, y: -y })],
        ];
    }
    if (state.kind === 'setsquare') {
        const a = toWorld(state, { x: -SET_LEG / 2, y: SET_LEG / 2 });
        const b = toWorld(state, { x: SET_LEG / 2, y: SET_LEG / 2 });
        const c = toWorld(state, { x: -SET_LEG / 2, y: -SET_LEG / 2 });
        return [
            [a, b],
            [a, c],
            [c, b],
        ];
    }
    const r = PROTRACTOR_R;
    return [[toWorld(state, { x: -r, y: 0 }), toWorld(state, { x: r, y: 0 })]];
}

/** Aracın gövdesine dokunuldu mu (taşımak için)? */
export function rulerHitBody(state: RulerState, p: Point): boolean {
    const l = toLocal(state, p);
    if (state.kind === 'ruler') {
        return Math.abs(l.x) <= RULER_LEN / 2 && Math.abs(l.y) <= RULER_H / 2;
    }
    if (state.kind === 'setsquare') {
        const half = SET_LEG / 2;
        // Köşeler: dik köşe sol altta, hipotenüs sağ alttan sol üste.
        const a = { x: -half, y: half };
        const b = { x: half, y: half };
        const c = { x: -half, y: -half };
        const sign = (p1: Point, p2: Point, p3: Point) =>
            (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        const d1 = sign(l, a, b);
        const d2 = sign(l, b, c);
        const d3 = sign(l, c, a);
        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        return !(hasNeg && hasPos);
    }
    return l.y >= 0 && l.y <= PROTRACTOR_R && Math.hypot(l.x, l.y) <= PROTRACTOR_R;
}

/** Döndürme tutamağının dünya konumu. */
export function rulerRotateHandle(state: RulerState): Point {
    if (state.kind === 'ruler') return toWorld(state, { x: RULER_LEN / 2 + 26, y: 0 });
    if (state.kind === 'setsquare') return toWorld(state, { x: SET_LEG / 2 + 26, y: SET_LEG / 2 });
    return toWorld(state, { x: PROTRACTOR_R + 26, y: 0 });
}

/**
 * Noktayı en yakın kenara oturtur.
 *
 * @param tolerance Dünya birimindeki yapışma mesafesi.
 * @returns Oturtulmuş nokta ve kenar; kenar uzaktaysa `null`.
 */
export function snapToRuler(
    state: RulerState,
    p: Point,
    tolerance: number
): { point: Point; edge: [Point, Point] } | null {
    let best: { point: Point; edge: [Point, Point]; dist: number } | null = null;
    for (const edge of rulerEdges(state)) {
        const [a, b] = edge;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lenSq = dx * dx + dy * dy || 1;
        // Kenarın SONSUZ uzantısına izdüşüm: kalem cetvelin ucunu aşsa da
        // çizgi aynı doğrultuda devam etsin.
        const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
        const proj = { x: a.x + t * dx, y: a.y + t * dy };
        const dist = Math.hypot(p.x - proj.x, p.y - proj.y);
        // Kenarın yakın çevresinde miyiz (uçlarından en fazla yarım boy uzakta)?
        if (t < -0.5 || t > 1.5) continue;
        if (dist <= tolerance && (!best || dist < best.dist)) {
            best = { point: { ...p, ...proj }, edge, dist };
        }
    }
    return best ? { point: best.point, edge: best.edge } : null;
}

/** Ölçü aracını üst katmana (ekran uzayında) çizer. */
export function drawRuler(
    ctx: CanvasRenderingContext2D,
    state: RulerState,
    view: Viewport
): void {
    const s = view.scale;
    ctx.save();
    ctx.translate(state.x * s + view.tx, state.y * s + view.ty);
    ctx.rotate(state.angle);
    ctx.scale(s, s);

    ctx.lineWidth = 1.5 / s;
    ctx.font = `${12 / s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (state.kind === 'ruler') {
        const half = RULER_LEN / 2;
        ctx.fillStyle = 'rgba(250, 250, 252, 0.82)';
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
        ctx.beginPath();
        ctx.rect(-half, -RULER_H / 2, RULER_LEN, RULER_H);
        ctx.fill();
        ctx.stroke();

        // Santimetre ve milimetre çizgileri alt kenardan yukarı doğru.
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        const mm = PX_PER_CM / 10;
        for (let i = 0; i * mm <= RULER_LEN; i++) {
            const x = -half + i * mm;
            const isCm = i % 10 === 0;
            const isHalf = i % 5 === 0;
            const len = isCm ? 16 : isHalf ? 10 : 6;
            ctx.beginPath();
            ctx.moveTo(x, RULER_H / 2);
            ctx.lineTo(x, RULER_H / 2 - len);
            ctx.lineWidth = (isCm ? 1.4 : 0.9) / s;
            ctx.stroke();
            if (isCm) ctx.fillText(String(i / 10), x, RULER_H / 2 - 26);
        }
    } else if (state.kind === 'setsquare') {
        const half = SET_LEG / 2;
        ctx.fillStyle = 'rgba(250, 250, 252, 0.82)';
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
        ctx.beginPath();
        ctx.moveTo(-half, half);
        ctx.lineTo(half, half);
        ctx.lineTo(-half, -half);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Açı etiketleri: 90° dik köşede, 45° diğer ikisinde.
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillText('90°', -half + 34, half - 18);
        ctx.fillText('45°', half - 44, half - 16);
        ctx.fillText('45°', -half + 20, -half + 34);
    } else {
        const r = PROTRACTOR_R;
        ctx.fillStyle = 'rgba(250, 250, 252, 0.82)';
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        for (let deg = 0; deg <= 180; deg += 1) {
            const isTen = deg % 10 === 0;
            const isFive = deg % 5 === 0;
            if (!isFive) continue;
            const a = Math.PI - (deg * Math.PI) / 180;
            const len = isTen ? 18 : 10;
            ctx.beginPath();
            ctx.lineWidth = (isTen ? 1.3 : 0.9) / s;
            ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            ctx.lineTo(Math.cos(a) * (r - len), Math.sin(a) * (r - len));
            ctx.stroke();
            if (deg % 30 === 0) {
                ctx.fillText(
                    String(deg),
                    Math.cos(a) * (r - 34),
                    Math.sin(a) * (r - 34)
                );
            }
        }
        // Merkez işareti.
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 12);
        ctx.lineWidth = 1.2 / s;
        ctx.stroke();
    }

    ctx.restore();

    // Döndürme tutamağı (ekran uzayında sabit büyüklükte).
    const handle = rulerRotateHandle(state);
    const hx = handle.x * s + view.tx;
    const hy = handle.y * s + view.ty;
    ctx.save();
    ctx.beginPath();
    ctx.arc(hx, hy, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
