// src/components/drawing/libraryObjects.ts
// Matematik ve fen nesne kütüphanelerini tek bir katalogda birleştirir.
// Tuval ve kütüphane paneli yalnızca bu modülü tanır.

import type { MathObjectKind, Stroke } from '../../types';
import { MATH_CATEGORIES, MATH_RENDERERS } from './mathObjects';
import { SCIENCE_CATEGORIES, SCIENCE_RENDERERS } from './scienceObjects';
import type { MathCatalogItem, ObjectCategory, Rect } from './objectDrawing';

export type { MathCatalogItem, ObjectCategory } from './objectDrawing';

const RENDERERS = { ...MATH_RENDERERS, ...SCIENCE_RENDERERS };

export interface ObjectGroup {
    label: string;
    categories: ReadonlyArray<ObjectCategory>;
}

/**
 * Panel iki kademeli: önce ders (Matematik / Fen), sonra o dersin
 * kategorileri. Dokuz kategoriyi tek satırda göstermek, sığmayanların
 * yatay kaydırmada gizli kalmasına yol açıyordu.
 */
export const LIBRARY_GROUPS: ReadonlyArray<ObjectGroup> = [
    { label: 'Matematik', categories: MATH_CATEGORIES },
    { label: 'Fen', categories: SCIENCE_CATEGORIES },
];

/** Tüm kategoriler (arama ve nesne bulma için). */
export const LIBRARY_CATEGORIES: ReadonlyArray<ObjectCategory> = LIBRARY_GROUPS.flatMap(
    (g) => g.categories
);

/** Katalogdaki bir nesneyi türüne göre bulur. */
export const findLibraryItem = (kind: MathObjectKind): MathCatalogItem | undefined =>
    LIBRARY_CATEGORIES.flatMap((c) => c.items).find((i) => i.kind === kind);

/**
 * Bir kütüphane nesnesini canvas'a çizer.
 * `stroke.points` en az iki nokta içermeli (sol-üst, sağ-alt).
 */
export function drawLibraryObject(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
    const obj = stroke.math;
    if (!obj || stroke.points.length < 2) return;
    const render = RENDERERS[obj.kind];
    if (!render) return;

    const a = stroke.points[0];
    const b = stroke.points[stroke.points.length - 1];
    const rect: Rect = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        w: Math.abs(b.x - a.x),
        h: Math.abs(b.y - a.y),
    };
    if (rect.w < 8 || rect.h < 8) return;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width || 2;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    render({
        c: ctx,
        r: rect,
        o: obj,
        color: stroke.color,
        lw: Math.max(1, stroke.width || 2),
        fs: Math.max(9, Math.min(20, Math.min(rect.w, rect.h) / 13)),
    });
    ctx.restore();
}
