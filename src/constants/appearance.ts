// src/constants/appearance.ts — İçerik Merkezi görsel sabitleri
// Branş renkleri ve Material Symbols glif seçimi tek yerde toplanır; hem
// ActivityCard posterleri hem sol ağaç, tür çipleri ve "Son kullanılanlar"
// satırları aynı haritayı kullanır.
import type { Activity } from '../types';

/** Branş → renk. Kart posteri, ağaç noktaları ve raf başlıkları bu haritayı kullanır. */
export const SUBJECT_COLOR: Record<string, string> = {
    'Türkçe': '#E8C85A', 'Matematik': '#5AC8A8', 'Fen Bilimleri': '#E8685A',
    'Sosyal Bilgiler': '#6366f1', 'İngilizce': '#3b82f6', 'Din Kültürü ve Ahlak Bilgisi': '#8b5cf6',
    'Fizik': '#0ea5e9', 'Kimya': '#ec4899', 'Biyoloji': '#10b981',
};

export const subjectColor = (s?: string) => (s && SUBJECT_COLOR[s]) || '#6366f1';

/** İçerik türü → Material Symbols glifi (tür çipleri ve "Son kullanılanlar" ikonları). */
export function categoryIcon(category?: string) {
    const cat = (category || '').toLocaleLowerCase('tr');
    if (cat.includes('oyun')) return 'sports_esports';
    if (cat.includes('test') || cat.includes('sınav')) return 'quiz';
    if (cat.includes('ders') || cat.includes('not')) return 'menu_book';
    if (cat.includes('lab') || cat.includes('deney')) return 'science';
    if (cat.includes('sim')) return 'animation';
    if (cat.includes('coğraf') || cat.includes('harita')) return 'public';
    return 'rocket_launch';
}

/** Kart posterindeki glif — mevcut ActivityCard mantığı korunur. */
export function posterIcon(act: Pick<Activity, 'title' | 'category' | 'is_test'>) {
    const cat = (act.category || '').toLocaleLowerCase('tr');
    const title = act.title.toLocaleLowerCase('tr');
    if (act.is_test) return 'quiz';
    if (title.includes('harita') || cat.includes('coğraf')) return 'public';
    if (cat.includes('oyun')) return 'sports_esports';
    if (cat.includes('ders') || title.includes('video')) return 'menu_book';
    if (cat.includes('lab') || cat.includes('deney')) return 'science';
    if (cat.includes('sim')) return 'animation';
    return 'rocket_launch';
}

/** Poster zemini: taban gradyan + üstteki ışık halkası. */
export function posterBackground(color: string) {
    return {
        base: `linear-gradient(140deg, ${color}26, ${color}0d 65%, #ffffff00)`,
        glow: `radial-gradient(115% 85% at 85% 12%, ${color}33, transparent 55%)`,
    };
}
