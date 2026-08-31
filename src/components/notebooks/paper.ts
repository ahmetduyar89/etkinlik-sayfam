import type { PaperStyle } from '../../types';

export const PAPER_STYLES: ReadonlyArray<{ id: PaperStyle; label: string }> = [
    { id: 'grid', label: 'Kareli' },
    { id: 'lined', label: 'Çizgili' },
    { id: 'dotted', label: 'Noktalı' },
    { id: 'blank', label: 'Düz' },
];

/**
 * Seçilen kağıt desenini CSS arka planına çevirir.
 * Canvas şeffaf olduğu için desen çizim alanının altında kalır.
 */
export function paperBackground(
    paper: PaperStyle,
    bgColor: string
): React.CSSProperties {
    const line = 'rgba(15, 23, 42, 0.10)';
    if (paper === 'grid') {
        return {
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: '26px 26px',
        };
    }
    if (paper === 'lined') {
        return {
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px)`,
            backgroundSize: '100% 30px',
        };
    }
    if (paper === 'dotted') {
        return {
            backgroundColor: bgColor,
            backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.22) 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
        };
    }
    return { backgroundColor: bgColor };
}
