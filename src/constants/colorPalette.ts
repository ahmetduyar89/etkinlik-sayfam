/**
 * Tahta çizimi için renk kartelası.
 *
 * Her aile açıktan koyuya beş tondan oluşur; tonlar projeksiyon ve akıllı
 * tahta ekranlarında birbirinden ayırt edilebilecek kadar uzak seçildi.
 * İkinci ton (indeks 1) ailenin "ana" rengidir.
 */
export interface ColorFamily {
    name: string;
    tones: readonly string[];
}

export const COLOR_TONE_LABELS = [
    'açık',
    'canlı',
    'ana',
    'koyu',
    'en koyu',
] as const;

export const COLOR_FAMILIES: ReadonlyArray<ColorFamily> = [
    { name: 'Nötr', tones: ['#ffffff', '#cbd5e1', '#94a3b8', '#475569', '#0f172a'] },
    { name: 'Kırmızı', tones: ['#fca5a5', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d'] },
    { name: 'Turuncu', tones: ['#fdba74', '#fb923c', '#f97316', '#ea580c', '#9a3412'] },
    { name: 'Sarı', tones: ['#fef08a', '#fde047', '#facc15', '#eab308', '#a16207'] },
    { name: 'Yeşil', tones: ['#86efac', '#4ade80', '#22c55e', '#16a34a', '#14532d'] },
    { name: 'Turkuaz', tones: ['#99f6e4', '#2dd4bf', '#14b8a6', '#0d9488', '#134e4a'] },
    { name: 'Mavi', tones: ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e3a8a'] },
    { name: 'Lacivert', tones: ['#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#312e81'] },
    { name: 'Mor', tones: ['#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#581c87'] },
    { name: 'Pembe', tones: ['#f9a8d4', '#f472b6', '#ec4899', '#be185d', '#831843'] },
    { name: 'Kahve', tones: ['#e7c9a9', '#d2a679', '#b45309', '#8b5a2b', '#4a2511'] },
];

/** Karteladaki bir rengin okunabilir adı: "Mavi ana" gibi. */
export function colorLabel(familyIndex: number, toneIndex: number): string {
    return `${COLOR_FAMILIES[familyIndex].name} ${COLOR_TONE_LABELS[toneIndex]}`;
}

/** Son kullanılan renklerin saklandığı anahtar ve kaç tane tutulacağı. */
export const RECENT_COLORS_KEY = 'drawingRecentColors';
export const RECENT_COLORS_LIMIT = 8;
