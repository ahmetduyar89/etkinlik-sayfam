// src/constants/pageSizes.ts
// Sayfa ölçüleri.
//
// Dünya birimi ile santimetre arasındaki bağ kareli defterden gelir: bir kare
// 26 birim ve 0,5 cm sayılır, yani 52 birim = 1 cm. A4 bu ölçekte 1092 × 1544
// birimdir ve 1920 genişliğindeki bir akıllı tahtada %100 yakınlaştırmada
// rahatça sığar.

import type { PageSize } from '../types';

/** 1 santimetre kaç dünya birimi. */
export const UNITS_PER_CM = 52;

export interface PageSizeOption {
    id: PageSize;
    label: string;
    hint: string;
    /** Sınırsız sayfada ölçü yoktur. */
    dims: { w: number; h: number } | null;
}

const mm = (value: number): number => Math.round((value / 10) * UNITS_PER_CM);

export const PAGE_SIZES: ReadonlyArray<PageSizeOption> = [
    {
        id: 'a4l',
        label: 'A4 Yatay',
        hint: '29,7 × 21 cm — tahta ve projeksiyon için',
        dims: { w: mm(297), h: mm(210) },
    },
    {
        id: 'a4p',
        label: 'A4 Dikey',
        hint: '21 × 29,7 cm — çıktı ve föy için',
        dims: { w: mm(210), h: mm(297) },
    },
    {
        id: 'b5p',
        label: 'B5 Dikey',
        hint: '17,6 × 25 cm — standart okul defteri',
        dims: { w: mm(176), h: mm(250) },
    },
    {
        id: 'b5l',
        label: 'B5 Yatay',
        hint: '25 × 17,6 cm — yatay okul defteri',
        dims: { w: mm(250), h: mm(176) },
    },
    {
        id: 'a3l',
        label: 'A3 Yatay',
        hint: '42 × 29,7 cm — geniş çalışma',
        dims: { w: mm(420), h: mm(297) },
    },
    {
        id: 'a3p',
        label: 'A3 Dikey',
        hint: '29,7 × 42 cm — uzun çözümler',
        dims: { w: mm(297), h: mm(420) },
    },
    {
        id: 'wide169',
        label: 'Tahta 16:9',
        hint: 'Akıllı tahtanın kendi oranı',
        dims: { w: 1920, h: 1080 },
    },
    {
        id: 'free',
        label: 'Sınırsız',
        hint: 'Sayfa sınırı yok, çizim her yere yayılır',
        dims: null,
    },
];

/**
 * PDF ölçüsünden (punto) dünya birimine çevirim.
 *
 * PDF sayfaları puntoyla tanımlıdır (1 punto = 1/72 inç). Bu katsayı bir A4
 * PDF'i tam olarak bizim A4 sayfamıza oturtur: 595 x 842 punto → 1092 x 1544
 * birim. Böylece PDF üstüne alınan notlar her ekranda aynı yerde durur.
 */
export const UNITS_PER_PT = UNITS_PER_CM / 28.3465;

/** PDF sayfasının punto ölçüsünü dünya ölçüsüne çevirir. */
export function pdfBoxFromPoints(wPt: number, hPt: number): { w: number; h: number } {
    return {
        w: Math.round(wPt * UNITS_PER_PT),
        h: Math.round(hPt * UNITS_PER_PT),
    };
}

/** Seçilen boyutun dünya ölçüsü; sınırsızda `null`. */
export function pageDims(size?: PageSize): { w: number; h: number } | null {
    if (!size || size === 'free') return null;
    return PAGE_SIZES.find((p) => p.id === size)?.dims ?? null;
}
