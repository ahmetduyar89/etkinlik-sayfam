// src/components/drawing/libraryObjects.ts
// Matematik ve fen nesne kütüphanelerini tek bir katalogda birleştirir.
// Tuval ve kütüphane paneli yalnızca bu modülü tanır.

import type { MathObjectKind, Stroke } from '../../types';
import { MATH_CATEGORIES, MATH_RENDERERS } from './mathObjects';
import { SCIENCE_CATEGORIES, SCIENCE_RENDERERS } from './scienceObjects';
import {
    GRADE8_ITEMS,
    GRADE8_MATH_ITEMS,
    MIDDLE_SCHOOL_MATH_ITEMS,
    MIDDLE_SCHOOL_SCIENCE_ITEMS,
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

export const NEW_BRANCH_TOOL_ITEMS: MathCatalogItem[] = [
    {
        kind: 'tool_simple_machines',
        label: '🧪 Basit Makineler Dinamik Lab',
        hint: 'Kaldıraç (1., 2., 3. tip), makara, palanga, eğik düzlem ve çıkrık; canlı kuvvet kazancı hesabı',
        size: { w: 560, h: 380 },
        defaults: {},
    },
    {
        kind: 'tool_dna_genetics',
        label: '🧬 DNA, Genetik & Çaprazlama',
        hint: 'Mendel çaprazlama tablosu (Punnett karesi), fenotip/genotip oranları ve nükleotid bulmacası',
        size: { w: 560, h: 390 },
        defaults: {},
    },
    {
        kind: 'tool_linear_graph',
        label: '📈 Doğrusal Denklem & Grafik Çizici',
        hint: 'y = mx + n doğrusu, eğim dik üçgeni, eksen kesişimleri ve çift doğru incelemesi',
        size: { w: 540, h: 380 },
        defaults: {},
    },
    {
        kind: 'tool_math_formula',
        label: '🧮 Formül & LaTeX Denklem Editörü',
        hint: 'Kareköklü, üslü, kesirli ifadeler, geometri ve kimyasal reaksiyon okları; tahtaya damgala',
        size: { w: 500, h: 300 },
        defaults: {},
    },
    {
        kind: 'tool_pdf_viewer',
        label: '📄 PDF Kitap & Soru Kırpıcı',
        hint: 'MEB ders kitabı ve soru bankası PDF yükleme, soru kırpıp tahtaya yapıştırma',
        size: { w: 560, h: 420 },
        defaults: {},
    },
];

const NEW_TOOL_RENDERERS: Record<string, (k: any) => void> = {
    tool_simple_machines: (k) => {
        const { r } = k;
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.55;
        k.c.save();
        k.c.strokeStyle = '#f59e0b';
        k.c.lineWidth = 2;
        k.c.beginPath();
        k.c.moveTo(cx, cy);
        k.c.lineTo(cx - 12, cy + 16);
        k.c.lineTo(cx + 12, cy + 16);
        k.c.closePath();
        k.c.stroke();
        k.c.strokeStyle = '#4f46e5';
        k.c.lineWidth = 3;
        k.c.beginPath();
        k.c.moveTo(cx - 28, cy - 4);
        k.c.lineTo(cx + 28, cy + 4);
        k.c.stroke();
        k.c.fillStyle = '#ef4444';
        k.c.fillRect(cx - 28, cy - 16, 12, 12);
        k.c.fillStyle = '#10b981';
        k.c.beginPath();
        k.c.arc(cx + 22, cy + 10, 6, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();
    },
    tool_dna_genetics: (k) => {
        const { r } = k;
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.5;
        k.c.save();
        k.c.strokeStyle = '#a855f7';
        k.c.lineWidth = 2;
        for (let i = -16; i <= 16; i += 8) {
            k.c.beginPath();
            k.c.moveTo(cx - 14, cy + i);
            k.c.lineTo(cx + 14, cy + i);
            k.c.stroke();
        }
        k.c.fillStyle = '#ef4444';
        k.c.beginPath();
        k.c.arc(cx - 14, cy - 8, 3, 0, Math.PI * 2);
        k.c.fill();
        k.c.fillStyle = '#3b82f6';
        k.c.beginPath();
        k.c.arc(cx + 14, cy - 8, 3, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();
    },
    tool_linear_graph: (k) => {
        const { r } = k;
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.5;
        k.c.save();
        k.c.strokeStyle = '#64748b';
        k.c.lineWidth = 1.5;
        k.c.beginPath();
        k.c.moveTo(r.x + 8, cy);
        k.c.lineTo(r.x + r.w - 8, cy);
        k.c.moveTo(cx, r.y + 8);
        k.c.lineTo(cx, r.y + r.h - 8);
        k.c.stroke();
        k.c.strokeStyle = '#2563eb';
        k.c.lineWidth = 2.5;
        k.c.beginPath();
        k.c.moveTo(cx - 20, cy + 16);
        k.c.lineTo(cx + 20, cy - 16);
        k.c.stroke();
        k.c.restore();
    },
    tool_math_formula: (k) => {
        const { r } = k;
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.5;
        k.c.save();
        k.c.fillStyle = '#6366f1';
        k.c.font = 'bold 16px serif';
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        k.c.fillText('∑ √x', cx, cy);
        k.c.restore();
    },
    tool_pdf_viewer: (k) => {
        const { r } = k;
        const cx = r.x + r.w * 0.5;
        const cy = r.y + r.h * 0.5;
        k.c.save();
        k.c.strokeStyle = '#f43f5e';
        k.c.lineWidth = 2;
        k.c.strokeRect(cx - 14, cy - 18, 28, 36);
        k.c.fillStyle = '#f43f5e';
        k.c.font = 'bold 10px sans-serif';
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        k.c.fillText('PDF', cx, cy);
        k.c.restore();
    },
};

const RENDERERS = { ...MATH_RENDERERS, ...SCIENCE_RENDERERS, ...SIM_RENDERERS, ...NEW_TOOL_RENDERERS };

export interface ObjectGroup {
    label: string;
    categories: ReadonlyArray<ObjectCategory>;
}

/**
 * Branşlara göre sistemli gruplama:
 * 1. 🎯 8. Sınıf LGS (LGS Matematik & LGS Fen Bilimleri)
 * 2. 🎒 Ortaokul (5-7) (Ortaokul Matematik & Fen Bilimleri)
 * 3. 📐 Matematik (Geometri, Grafik & Fonksiyon, Sayılar & Kesirler, 10. Sınıf)
 * 4. ⚡ Fizik (Mekanik & Hareket, Elektrik & Manyetizma, Optik & Dalgalar)
 * 5. 🧪 Kimya (Laboratuvar, Kimya Deneyleri, Atom & Madde)
 * 6. 🧬 Biyoloji (Hücre & Genetik, Ekoloji & Canlı Sistemleri)
 * 7. ✨ 3D Laboratuvar (Three.js 3D İnteraktif Modeller)
 */
export const LIBRARY_GROUPS: ReadonlyArray<ObjectGroup> = [
    {
        label: '🎯 8. Sınıf LGS',
        categories: [
            { label: 'LGS Matematik', items: [NEW_BRANCH_TOOL_ITEMS[4], NEW_BRANCH_TOOL_ITEMS[2], NEW_BRANCH_TOOL_ITEMS[3], ...GRADE8_MATH_ITEMS] },
            { label: 'LGS Fen Bilimleri', items: [NEW_BRANCH_TOOL_ITEMS[4], NEW_BRANCH_TOOL_ITEMS[0], NEW_BRANCH_TOOL_ITEMS[1], ...GRADE8_ITEMS] },
        ],
    },
    {
        label: '🎒 Ortaokul (5-7)',
        categories: [
            { label: 'Ortaokul Matematik', items: MIDDLE_SCHOOL_MATH_ITEMS },
            { label: 'Ortaokul Fen', items: MIDDLE_SCHOOL_SCIENCE_ITEMS },
        ],
    },
    {
        label: '📐 Matematik',
        categories: [
            { label: 'Geometri & Çizim', items: [...MATH_CATEGORIES[1].items, ...GEOMETRY_SIM_ITEMS, ...MIDDLE_SCHOOL_MATH_ITEMS.filter(it => it.kind === 'polygon_angles_sim')] },
            { label: 'Grafik & Fonksiyon', items: [...MATH_CATEGORIES[0].items, ...MATH_SIM_ITEMS, ...MIDDLE_SCHOOL_MATH_ITEMS.filter(it => it.kind === 'algebra_balance_sim')] },
            { label: 'Sayılar & Kesirler', items: [...MATH_CATEGORIES[2].items, ...NUMBER_SIM_ITEMS, ...MIDDLE_SCHOOL_MATH_ITEMS.filter(it => ['integer_counters_sim', 'factor_tree_sim', 'fraction_percent_decimal_sim'].includes(it.kind))] },
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
                    ...MIDDLE_SCHOOL_SCIENCE_ITEMS.filter(it => ['roller_coaster_sim', 'mass_weight_gravity_sim'].includes(it.kind)),
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
                    ...MIDDLE_SCHOOL_SCIENCE_ITEMS.filter(it => it.kind === 'shadow_screen_sim'),
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
                    ...MIDDLE_SCHOOL_SCIENCE_ITEMS.filter(it => it.kind === 'density_column_sim'),
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
                    ...MIDDLE_SCHOOL_SCIENCE_ITEMS.filter(it => it.kind === 'expansion_ring_sim'),
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
