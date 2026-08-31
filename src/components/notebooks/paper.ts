// src/components/notebooks/paper.ts
// Sayfa şablonları. Canvas şeffaf olduğu için desen çizim alanının altında kalır.
//
// Basit desenler CSS gradyanıyla, tekrar etmeyen ya da karmaşık olanlar
// (koordinat düzlemi, Cornell, nota, izometrik) satır içi SVG ile üretilir.

import type { PaperStyle } from '../../types';

export interface PaperOption {
    id: PaperStyle;
    label: string;
    /** Şablon grubu — seçim menüsünde başlık olarak kullanılır. */
    group: 'Temel' | 'Matematik & Fen' | 'Yazı & Not';
    hint: string;
}

export const PAPER_STYLES: ReadonlyArray<PaperOption> = [
    { id: 'grid', label: 'Kareli', group: 'Temel', hint: 'Klasik 26 px kareli defter' },
    { id: 'lined', label: 'Çizgili', group: 'Temel', hint: 'Standart satır aralığı' },
    { id: 'dotted', label: 'Noktalı', group: 'Temel', hint: 'Bullet journal tarzı nokta ızgara' },
    { id: 'blank', label: 'Düz', group: 'Temel', hint: 'Boş sayfa' },

    { id: 'graph_mm', label: 'Milimetrik', group: 'Matematik & Fen', hint: 'Grafik çizimi için mm kağıdı' },
    { id: 'coordinate', label: 'Koordinat', group: 'Matematik & Fen', hint: 'Ortası eksenli kareli düzlem' },
    { id: 'isometric', label: 'İzometrik', group: 'Matematik & Fen', hint: 'Üç boyutlu cisim çizimi için' },

    { id: 'wide_lined', label: 'Geniş Çizgili', group: 'Yazı & Not', hint: 'İlkokul için geniş satır' },
    { id: 'handwriting', label: 'Güzel Yazı', group: 'Yazı & Not', hint: 'Dört çizgi üç aralık' },
    { id: 'cornell', label: 'Cornell', group: 'Yazı & Not', hint: 'Anahtar kelime / not / özet bölmeli' },
    { id: 'music', label: 'Nota', group: 'Yazı & Not', hint: 'Beş çizgili porte' },
    { id: 'todo', label: 'Kontrol Listesi', group: 'Yazı & Not', hint: 'Kutucuklu yapılacaklar satırı' },
];

const LINE = 'rgba(15, 23, 42, 0.10)';
const STRONG = 'rgba(15, 23, 42, 0.22)';

/** SVG dizesini CSS `url(...)` değerine çevirir. */
const svgUrl = (svg: string): string =>
    `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;

/**
 * Kutunun (ya da desen karesinin) tam ortasından geçen bir çizgi katmanı.
 * `background-position: center` ile birlikte kullanıldığında çizgiler
 * sayfanın merkezine tam oturur — koordinat ekseni bu şekilde üretilir.
 */
const centerLine = (color: string, thickness: number, axis: 'h' | 'v'): string => {
    const half = thickness / 2;
    const dir = axis === 'h' ? 'to bottom' : 'to right';
    return (
        `linear-gradient(${dir}, transparent calc(50% - ${half}px), ${color} calc(50% - ${half}px),` +
        ` ${color} calc(50% + ${half}px), transparent calc(50% + ${half}px))`
    );
};

/** Tekrar eden bir SVG desen katmanı. */
function tile(width: number, height: number, body: string): string {
    return svgUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
    );
}

/**
 * Seçilen kağıt desenini CSS arka planına çevirir.
 * Koordinat düzleminde eksenler sayfanın ortasına oturması için
 * `backgroundPosition: center` kullanılır.
 */
export function paperBackground(paper: PaperStyle, bgColor: string): React.CSSProperties {
    const base: React.CSSProperties = { backgroundColor: bgColor };

    switch (paper) {
        case 'grid':
            return {
                ...base,
                backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
                backgroundSize: '26px 26px',
            };

        case 'lined':
            return {
                ...base,
                backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px)`,
                backgroundSize: '100% 30px',
            };

        case 'wide_lined':
            return {
                ...base,
                backgroundImage: `linear-gradient(${LINE} 1.5px, transparent 1.5px)`,
                backgroundSize: '100% 48px',
            };

        case 'dotted':
            return {
                ...base,
                backgroundImage: `radial-gradient(${STRONG} 1.2px, transparent 1.2px)`,
                backgroundSize: '24px 24px',
            };

        // Milimetrik: 1 mm ince, 5 mm orta, 10 mm kalın çizgiler.
        case 'graph_mm':
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(rgba(15,23,42,0.055) 1px, transparent 1px)`,
                    `linear-gradient(90deg, rgba(15,23,42,0.055) 1px, transparent 1px)`,
                    `linear-gradient(rgba(15,23,42,0.11) 1px, transparent 1px)`,
                    `linear-gradient(90deg, rgba(15,23,42,0.11) 1px, transparent 1px)`,
                    `linear-gradient(rgba(15,23,42,0.2) 1px, transparent 1px)`,
                    `linear-gradient(90deg, rgba(15,23,42,0.2) 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: '8px 8px, 8px 8px, 40px 40px, 40px 40px, 80px 80px, 80px 80px',
            };

        // Koordinat: kareli zemin + sayfanın tam ortasından geçen eksenler.
        case 'coordinate':
            return {
                ...base,
                backgroundImage: [
                    // Sayfanın tam ortasından geçen x ve y eksenleri
                    centerLine('rgba(15,23,42,0.42)', 1.6, 'h'),
                    centerLine('rgba(15,23,42,0.42)', 1.6, 'v'),
                    // Beşer karede bir kalınlaşan ana ızgara
                    centerLine('rgba(15,23,42,0.2)', 1, 'h'),
                    centerLine('rgba(15,23,42,0.2)', 1, 'v'),
                    // İnce birim ızgara
                    centerLine(LINE, 1, 'h'),
                    centerLine(LINE, 1, 'v'),
                ].join(', '),
                backgroundSize:
                    '100% 100%, 100% 100%, 140px 140px, 140px 140px, 28px 28px, 28px 28px',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat, repeat, repeat',
            };

        // İzometrik: 60°/120° eğik çizgiler + dikeyler.
        case 'isometric':
            return {
                ...base,
                backgroundImage: tile(
                    60,
                    104,
                    `<g stroke="rgba(15,23,42,0.13)" stroke-width="1" fill="none">
                        <path d="M0 26 L30 43 L60 26 M0 78 L30 95 L60 78" />
                        <path d="M0 78 L30 61 L60 78 M0 26 L30 9 L60 26" />
                        <path d="M0 26 L0 78 M30 43 L30 95 M60 26 L60 78 M30 -9 L30 9" />
                     </g>`
                ),
                backgroundSize: '60px 104px',
            };

        // Güzel yazı: dört çizgi, üç aralık (ortadaki kesikli).
        case 'handwriting':
            return {
                ...base,
                backgroundImage: tile(
                    40,
                    72,
                    `<g stroke-width="1" fill="none">
                        <line x1="0" y1="6" x2="40" y2="6" stroke="rgba(15,23,42,0.10)" />
                        <line x1="0" y1="24" x2="40" y2="24" stroke="rgba(37,99,235,0.30)" stroke-dasharray="5 5" />
                        <line x1="0" y1="42" x2="40" y2="42" stroke="rgba(37,99,235,0.30)" stroke-dasharray="5 5" />
                        <line x1="0" y1="60" x2="40" y2="60" stroke="rgba(15,23,42,0.20)" stroke-width="1.4" />
                     </g>`
                ),
                backgroundSize: '40px 72px',
            };

        // Cornell: solda anahtar kelime sütunu, altta özet bandı.
        case 'cornell': {
            const rule = 'rgba(220,38,38,0.45)';
            return {
                ...base,
                backgroundImage: [
                    // Sol anahtar-kelime sütununu ayıran dikey çizgi
                    `linear-gradient(to right, transparent calc(26% - 1px), ${rule} calc(26% - 1px),` +
                        ` ${rule} calc(26% + 1px), transparent calc(26% + 1px))`,
                    // Alttaki özet bandını ayıran yatay çizgi
                    `linear-gradient(to bottom, transparent calc(82% - 1px), ${rule} calc(82% - 1px),` +
                        ` ${rule} calc(82% + 1px), transparent calc(82% + 1px))`,
                    `linear-gradient(${LINE} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: '100% 82%, 100% 100%, 100% 32px',
                backgroundRepeat: 'no-repeat, no-repeat, repeat',
                backgroundPosition: 'left top, left top, left top',
            };
        }

        // Nota: beşer çizgilik porteler.
        case 'music':
            return {
                ...base,
                backgroundImage: tile(
                    40,
                    96,
                    `<g stroke="rgba(15,23,42,0.28)" stroke-width="1" fill="none">
                        <line x1="0" y1="16" x2="40" y2="16" />
                        <line x1="0" y1="26" x2="40" y2="26" />
                        <line x1="0" y1="36" x2="40" y2="36" />
                        <line x1="0" y1="46" x2="40" y2="46" />
                        <line x1="0" y1="56" x2="40" y2="56" />
                     </g>`
                ),
                backgroundSize: '40px 96px',
            };

        // Kontrol listesi: her satırın başında kutucuk.
        case 'todo':
            return {
                ...base,
                backgroundImage: [
                    // Kutucuklar yalnızca sol sütunda, satır başına bir tane
                    tile(
                        40,
                        40,
                        `<rect x="8" y="11" width="17" height="17" rx="4" fill="none" stroke="rgba(15,23,42,0.32)" stroke-width="1.4" />`
                    ),
                    `linear-gradient(${LINE} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: '40px 40px, 100% 40px',
                backgroundRepeat: 'repeat-y, repeat',
                backgroundPosition: '14px 6px, left 6px',
            };

        case 'blank':
        default:
            return base;
    }
}
