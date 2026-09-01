import type { DrawingTool, EraserMode } from '../types';
import {
    MousePointer2,
    Pencil,
    Hand,
    Highlighter,
    Sun,
    Eraser,
    Type,
    Lasso,
    Square,
    Circle,
    Triangle,
    MoveRight,
    ArrowRightLeft,
    type LucideIcon,
} from 'lucide-react';

export const DRAWING_COLORS = [
    '#ffffff',
    '#ff4d4d',
    '#ffff00',
    '#ffa500',
    '#2ecc71',
    '#3498db',
    '#4f46e5',
    '#9b59b6',
    '#000000',
] as const;

export const DRAWING_WIDTHS = [2, 5, 10] as const;

export const BG_COLORS: ReadonlyArray<{ color: string; label: string }> = [
    { color: '#ffffff', label: 'Beyaz' },
    { color: '#fffde7', label: 'Krem' },
    { color: '#e8f5e9', label: 'Yeşil' },
    { color: '#e3f2fd', label: 'Mavi' },
    { color: '#1a1a2e', label: 'Gece' },
    { color: '#111827', label: 'Siyah' },
];

export interface MainTool {
    id: DrawingTool;
    icon: LucideIcon;
    label: string;
}

export const MAIN_TOOLS: ReadonlyArray<MainTool> = [
    { id: 'select', icon: MousePointer2, label: 'Seç & Düzenle' },
    { id: 'lasso', icon: Lasso, label: 'Kement (çoklu seçim)' },
    { id: 'pencil', icon: Pencil, label: 'Kalem' },
    { id: 'pan', icon: Hand, label: 'El' },
    { id: 'highlighter', icon: Highlighter, label: 'Fosforlu' },
    { id: 'sun', icon: Sun, label: 'Lazer' },
    { id: 'eraser', icon: Eraser, label: 'Silgi' },
    { id: 'text', icon: Type, label: 'Metin' },
];

export interface ShapeTool {
    id: DrawingTool;
    label: string;
    Icon?: LucideIcon;
    Svg?: React.ComponentType;
}

export const SHAPE_TOOL_IDS: DrawingTool[] = [
    'rect',
    'circle',
    'triangle',
    'line',
    'arrow',
    'double_arrow',
    'dashed',
];

export const makeShapeTools = (
    SolidLineIcon: React.ComponentType,
    DashedLineIcon: React.ComponentType
): ReadonlyArray<ShapeTool> => [
    { id: 'rect', Icon: Square, label: 'Dikdörtgen' },
    { id: 'circle', Icon: Circle, label: 'Daire' },
    { id: 'triangle', Icon: Triangle, label: 'Üçgen' },
    { id: 'line', Svg: SolidLineIcon, label: 'Çizgi' },
    { id: 'arrow', Icon: MoveRight, label: 'Ok' },
    { id: 'double_arrow', Icon: ArrowRightLeft, label: 'Çift Ok' },
    { id: 'dashed', Svg: DashedLineIcon, label: 'Kesikli' },
];

export const STAMP_CATEGORIES: ReadonlyArray<{
    label: string;
    items: ReadonlyArray<{ emoji: string; label: string }>;
}> = [
    {
        label: 'Değerlendirme',
        items: [
            { emoji: '✅', label: 'Doğru' },
            { emoji: '❌', label: 'Yanlış' },
            { emoji: '⭐', label: 'Harika' },
            { emoji: '❤️', label: 'Sevdim' },
            { emoji: '❓', label: 'Soru' },
            { emoji: '❗', label: 'Dikkat' },
            { emoji: '💡', label: 'Fikir' },
            { emoji: '📌', label: 'Önemli' },
            { emoji: '🔥', label: 'Muhteşem' },
            { emoji: '👍', label: 'Tebrikler' },
        ],
    },
    {
        label: 'Fen',
        items: [
            { emoji: '⚛️', label: 'Atom' },
            { emoji: '🧪', label: 'Deney' },
            { emoji: '🔬', label: 'Mikroskop' },
            { emoji: '🧲', label: 'Mıknatıs' },
            { emoji: '⚡', label: 'Elektrik' },
            { emoji: '🌡️', label: 'Termometre' },
            { emoji: '🧬', label: 'DNA' },
            { emoji: '☢️', label: 'Radyoaktif' },
            { emoji: '🦠', label: 'Bakteri' },
            { emoji: '🌍', label: 'Dünya' },
        ],
    },
    {
        label: 'Matematik',
        items: [
            { emoji: 'π', label: 'Pi' },
            { emoji: '√', label: 'Kök' },
            { emoji: '∑', label: 'Sigma' },
            { emoji: '∫', label: 'İntegral' },
            { emoji: '∞', label: 'Sonsuz' },
            { emoji: '≤', label: 'Küçük Eşit' },
            { emoji: '≥', label: 'Büyük Eşit' },
            { emoji: '≠', label: 'Eşit Değil' },
            { emoji: '△', label: 'Üçgen' },
            { emoji: '∠', label: 'Açı' },
        ],
    },
    {
        label: 'İşlem',
        items: [
            { emoji: '×', label: 'Çarpı' },
            { emoji: '÷', label: 'Bölü' },
            { emoji: '±', label: 'Artı Eksi' },
            { emoji: '%', label: 'Yüzde' },
            { emoji: '≈', label: 'Yaklaşık' },
            { emoji: '≡', label: 'Denk' },
            { emoji: '·', label: 'Nokta Çarpım' },
            { emoji: '⁻¹', label: 'Ters' },
            { emoji: '²', label: 'Kare' },
            { emoji: '³', label: 'Küp' },
        ],
    },
    {
        label: 'Küme & Mantık',
        items: [
            { emoji: '∈', label: 'Elemanıdır' },
            { emoji: '∉', label: 'Elemanı Değil' },
            { emoji: '⊂', label: 'Alt Küme' },
            { emoji: '∪', label: 'Birleşim' },
            { emoji: '∩', label: 'Kesişim' },
            { emoji: '∅', label: 'Boş Küme' },
            { emoji: '∀', label: 'Her' },
            { emoji: '∃', label: 'Vardır' },
            { emoji: '⇒', label: 'İse' },
            { emoji: '⇔', label: 'Ancak ve Ancak' },
        ],
    },
    {
        label: 'Geometri',
        items: [
            { emoji: '∥', label: 'Paralel' },
            { emoji: '⊥', label: 'Dik' },
            { emoji: '≅', label: 'Eş' },
            { emoji: '∼', label: 'Benzer' },
            { emoji: '°', label: 'Derece' },
            { emoji: '⌒', label: 'Yay' },
            { emoji: '□', label: 'Kare' },
            { emoji: '○', label: 'Çember' },
            { emoji: '⟶', label: 'Işın' },
            { emoji: '↔', label: 'Doğru' },
        ],
    },
    {
        label: 'Fizik & Birim',
        items: [
            { emoji: 'Δ', label: 'Delta' },
            { emoji: 'θ', label: 'Teta' },
            { emoji: 'λ', label: 'Lambda' },
            { emoji: 'μ', label: 'Mü' },
            { emoji: 'Ω', label: 'Ohm' },
            { emoji: '→', label: 'Vektör' },
            { emoji: '↑', label: 'Yukarı' },
            { emoji: '↓', label: 'Aşağı' },
            { emoji: '⇌', label: 'Denge' },
            { emoji: '∝', label: 'Orantılı' },
        ],
    },
];

export const TEXTBOX_COLORS = [
    '#fff9c4',
    '#f8d7da',
    '#d4edda',
    '#d1ecf1',
    '#e2d9f3',
    '#1a1b26',
] as const;

export const TEXTBOX_TEXT_COLORS: Record<string, string> = {
    '#1a1b26': '#ffffff',
    default: '#1a1b26',
};

export const getTextBoxTextColor = (bg: string): string =>
    TEXTBOX_TEXT_COLORS[bg] || TEXTBOX_TEXT_COLORS.default;

export const ERASER_MODES: ReadonlyArray<{ id: EraserMode; label: string; hint: string }> = [
    { id: 'pixel', label: 'Piksel', hint: 'Kalem ve fosforlu izini dokunduğu yerden keser' },
    {
        id: 'stroke',
        label: 'Çizgi',
        hint: 'Dokunduğu çizimin tamamını siler (şekil, nesne, fotoğraf dahil)',
    },
];

export const HANDLE_CURSORS: Record<string, string> = {
    nw: 'nw-resize',
    n: 'n-resize',
    ne: 'ne-resize',
    w: 'w-resize',
    e: 'e-resize',
    sw: 'sw-resize',
    s: 's-resize',
    se: 'se-resize',
};

// html2canvas CDN (used for preview screenshot fallback)
export const HTML2CANVAS_CDN =
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
