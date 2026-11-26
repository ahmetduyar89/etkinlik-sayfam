// src/utils/surfaceTint.ts
// Tam ekran yüzeylerin sistem şeritlerine (durum çubuğu) rengini bildirmesi.
//
// Uygulama tablete/telefona "uygulama olarak" kurulduğunda saat, pil ve ağ
// göstergelerinin bulunduğu üst şerit sayfanın kendi alanı değildir: işletim
// sistemi burayı sayfanın KÖK arka plan rengiyle boyar. Kök renk açık tema
// olduğu için, koyu bir tam ekran ekran (etkinlik önizlemesi, öğrenci
// ekranı) açıkken üstte ekrana ait olmayan beyaz bir bant kalıyordu.
//
// Ekran açık olduğu sürece kök renk o ekranın başlık rengine çekilir;
// kapanınca eski değerine döner. Android'de aynı işi `theme-color` meta
// etiketi gördüğü için o da birlikte güncellenir.

import React from 'react';

/** Adres/durum çubuğu rengini bildiren meta etiketi (varsa). */
const themeColorMeta = (): HTMLMetaElement | null =>
    typeof document === 'undefined'
        ? null
        : document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

/**
 * Tam ekran bir yüzey açıkken sistem şeritlerinin rengini yüzeye eşitler.
 *
 * @param color Yüzeyin başlık rengi (ör. '#0f172a'). `null` verilirse
 *              bir şey değişmez — koşullu kullanım için.
 */
export function useSurfaceTint(color: string | null): void {
    React.useEffect(() => {
        if (!color) return;
        const root = document.documentElement;
        const meta = themeColorMeta();
        const previousRoot = root.style.backgroundColor;
        const previousMeta = meta?.content ?? null;

        root.style.backgroundColor = color;
        if (meta) meta.content = color;

        return () => {
            root.style.backgroundColor = previousRoot;
            if (meta && previousMeta !== null) meta.content = previousMeta;
        };
    }, [color]);
}
