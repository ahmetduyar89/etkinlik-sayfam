// src/components/drawing/libraryObjects.ts
// Matematik ve fen nesne kütüphanelerini tek bir katalogda birleştirir.
// Tuval ve kütüphane paneli yalnızca bu modülü tanır.

import type { MathObjectKind, Stroke } from '../../types';
import { MATH_CATEGORIES, MATH_RENDERERS } from './mathObjects';
import { SCIENCE_CATEGORIES, SCIENCE_RENDERERS } from './scienceObjects';
import {
    GRADE8_ITEMS,
    GRADE8_MATH_ITEMS,
    GRADE10_GEOM_ITEMS,
    GRADE10_STATS_ITEMS,
    GRADE10_NUMBERS_ITEMS,
    MATH_SIM_ITEMS,
    GEOMETRY_SIM_ITEMS,
    NUMBER_SIM_ITEMS,
    PHYSICS_SIM_ITEMS,
    CHEMISTRY_SIM_ITEMS,
    BIO_SIM_ITEMS,
    SORTING_SIM_ITEMS,
    TASK_SIM_ITEMS,
    MEASURE_SIM_ITEMS,
    ELECTRIC_SIM_ITEMS,
    OPTICS_SIM_ITEMS,
    SCIENCE_SIM_ITEMS,
    THREE_SIM_ITEMS,
    SIM_RENDERERS,
    SIM_SPECS,
} from './simObjects';
import type { MathCatalogItem, ObjectCategory, Rect, SimSpec } from './objectDrawing';

export type { MathCatalogItem, ObjectCategory } from './objectDrawing';

const RENDERERS = { ...MATH_RENDERERS, ...SCIENCE_RENDERERS, ...SIM_RENDERERS };

export interface ObjectGroup {
    label: string;
    categories: ReadonlyArray<ObjectCategory>;
}

/**
 * Branşlara göre sistemli gruplama:
 * 1. 🎯 8. Sınıf LGS (LGS Matematik & LGS Fen Bilimleri)
 * 2. 📐 Matematik (Geometri, Grafik & Fonksiyon, Sayılar & Kesirler, 10. Sınıf)
 * 3. ⚡ Fizik (Mekanik & Hareket, Elektrik & Manyetizma, Optik & Dalgalar)
 * 4. 🧪 Kimya (Laboratuvar, Kimya Deneyleri, Atom & Madde)
 * 5. 🧬 Biyoloji (Hücre & Genetik, Ekoloji & Canlı Sistemleri)
 * 6. ✨ 3D Laboratuvar (Three.js 3D İnteraktif Modeller)
 */
export const LIBRARY_GROUPS: ReadonlyArray<ObjectGroup> = [
    {
        label: '🎯 8. Sınıf LGS',
        categories: [
            { label: 'LGS Matematik', items: GRADE8_MATH_ITEMS },
            { label: 'LGS Fen Bilimleri', items: GRADE8_ITEMS },
        ],
    },
    {
        label: '📐 Matematik',
        categories: [
            { label: 'Geometri & Çizim', items: [...MATH_CATEGORIES[1].items, ...GEOMETRY_SIM_ITEMS] },
            { label: 'Grafik & Fonksiyon', items: [...MATH_CATEGORIES[0].items, ...MATH_SIM_ITEMS] },
            { label: 'Sayılar & Kesirler', items: [...MATH_CATEGORIES[2].items, ...NUMBER_SIM_ITEMS] },
            { label: '10. Sınıf Matematik', items: [...GRADE10_GEOM_ITEMS, ...GRADE10_STATS_ITEMS, ...GRADE10_NUMBERS_ITEMS] },
        ],
    },
    {
        label: '⚡ Fizik',
        categories: [
            {
                label: 'Mekanik & Hareket',
                items: [
                    ...SCIENCE_CATEGORIES[1].items,
                    ...PHYSICS_SIM_ITEMS,
                    ...TASK_SIM_ITEMS,
                    ...MEASURE_SIM_ITEMS,
                ],
            },
            {
                label: 'Elektrik & Manyetizma',
                items: [
                    {
                        kind: 'circuit_sim',
                        label: 'Canlı Devre (Mini PhET)',
                        hint: 'Pil, lamba, anahtar ve direnç; Ohm kanununu canlı izle',
                        size: { w: 440, h: 300 },
                        defaults: { labels: true, sim: { parallel: 0, n: 2, v: 2, sw: 1, res: 10 } },
                    },
                    ...ELECTRIC_SIM_ITEMS,
                ],
            },
            {
                label: 'Optik & Dalgalar',
                items: [
                    {
                        kind: 'optics_bench',
                        label: 'Optik Düzeneği',
                        hint: 'Cismi sürükle, görüntü canlı oluşsun',
                        size: { w: 460, h: 300 },
                        defaults: { labels: true, sim: { f: 4, a: 7, h: 2 } },
                    },
                    {
                        kind: 'refraction_sim',
                        label: 'Işık Kırılması & Tam Yansıma',
                        hint: 'Lazer açısını sürükle; Snell yasası, sınır açısı ve tam yansıma',
                        size: { w: 460, h: 320 },
                        defaults: { labels: true, sim: { theta1: 45, n1: 1.5, n2: 1.0 } },
                    },
                    ...OPTICS_SIM_ITEMS,
                ],
            },
        ],
    },
    {
        label: '🧪 Kimya',
        categories: [
            {
                label: 'Laboratuvar & Deneyler',
                items: [
                    ...SCIENCE_CATEGORIES[0].items,
                    ...CHEMISTRY_SIM_ITEMS,
                ],
            },
            {
                label: 'Atom & Maddenin Halleri',
                items: [
                    {
                        kind: 'matter_sim',
                        label: 'Maddenin Halleri (Canlı)',
                        hint: 'Sıcaklığı değiştir, tanecikleri izle',
                        size: { w: 380, h: 280 },
                        defaults: { labels: true, sim: { temp: 20 } },
                    },
                    ...SCIENCE_CATEGORIES[2].items.filter((it) =>
                        ['bohr_atom', 'element_card', 'states_of_matter', 'tool_periodic_table', 'ph_sim'].includes(it.kind)
                    ),
                ],
            },
        ],
    },
    {
        label: '🧬 Biyoloji',
        categories: [
            {
                label: 'Hücre, Bölünme & Genetik',
                items: [
                    ...SCIENCE_CATEGORIES[2].items.filter((it) =>
                        ['division_sim', 'animal_cell', 'plant_cell'].includes(it.kind)
                    ),
                    ...BIO_SIM_ITEMS,
                ],
            },
            {
                label: 'Ekoloji & Canlı Sistemleri',
                items: [
                    ...SCIENCE_CATEGORIES[2].items.filter((it) =>
                        ['sun_earth_moon'].includes(it.kind)
                    ),
                    ...SORTING_SIM_ITEMS,
                    ...SCIENCE_SIM_ITEMS,
                ],
            },
        ],
    },
    {
        label: '✨ 3D Lab',
        categories: [
            {
                label: '3D İnteraktif Modeller',
                items: THREE_SIM_ITEMS,
            },
        ],
    },
];

/** Bir nesnenin canlı simülasyon tanımı (yoksa undefined). */
export const getSimSpec = (kind: MathObjectKind): SimSpec | undefined => SIM_SPECS[kind];

/** Bu çizim şu anda her karede yeniden çizilmeli mi? */
export function isAnimated(stroke: Stroke): boolean {
    if (stroke.tool !== 'math' || !stroke.math) return false;
    const flag = getSimSpec(stroke.math.kind)?.animated;
    return typeof flag === 'function' ? flag(stroke.math) : !!flag;
}

/** Çizim, nesnenin kutusunu bu şekilde türetir; kontroller de aynısını kullanır. */
export function objectRect(stroke: Stroke): Rect | null {
    if (stroke.points.length < 2) return null;
    const a = stroke.points[0];
    const b = stroke.points[stroke.points.length - 1];
    const rect: Rect = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        w: Math.abs(b.x - a.x),
        h: Math.abs(b.y - a.y),
    };
    return rect.w < 8 || rect.h < 8 ? null : rect;
}

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
export function drawLibraryObject(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    time = 0
): void {
    const obj = stroke.math;
    if (!obj) return;
    const render = RENDERERS[obj.kind];
    if (!render) return;
    const rect = objectRect(stroke);
    if (!rect) return;

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
        t: time,
    });
    ctx.restore();
}
