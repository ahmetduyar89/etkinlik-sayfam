import React from 'react';

/**
 * Araç çubuğu yoğunluğu.
 *
 * Akıllı tahtalar çoğunlukla 1920x1080 gibi düşük çözünürlükle çalışır; aynı
 * piksel ölçüsü 15" bir dizüstünde normal görünürken 75" bir tahtada devasa
 * durur. Tarayıcı ekranın fiziksel boyutunu bilemediği için kullanıcıya üç
 * kademeli bir boyut tercihi sunuyor, tercihi de tarayıcıda saklıyoruz.
 */
export type ToolbarDensity = 'compact' | 'normal' | 'large';

export const TOOLBAR_DENSITIES: ToolbarDensity[] = ['compact', 'normal', 'large'];

export const TOOLBAR_DENSITY_LABELS: Record<ToolbarDensity, string> = {
    compact: 'Kompakt',
    normal: 'Normal',
    large: 'Büyük',
};

const DENSITY_FACTORS: Record<ToolbarDensity, number> = {
    compact: 0.8,
    normal: 1,
    large: 1.18,
};

/** Dokunmatik hedefler kullanılamaz hâle gelmesin diye alt sınır. */
const MIN_SCALE = 0.6;

const STORAGE_KEY = 'drawingToolbarDensity';

function isDensity(value: unknown): value is ToolbarDensity {
    return value === 'compact' || value === 'normal' || value === 'large';
}

function readStoredDensity(): ToolbarDensity | null {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isDensity(stored) ? stored : null;
    } catch {
        return null;
    }
}

/** Geniş ekranlarda (akıllı tahta / TV) ilk açılışta kompakt başlar. */
function detectDefaultDensity(): ToolbarDensity {
    if (typeof window === 'undefined') return 'normal';
    return window.innerWidth >= 1600 ? 'compact' : 'normal';
}

interface ToolbarScale {
    /** Çubuğa uygulanacak nihai ölçek. */
    scale: number;
    density: ToolbarDensity;
    /** Kompakt → Normal → Büyük sırasıyla döner. */
    cycleDensity: () => void;
}

/**
 * Çubuğun doğal genişliğini ölçüp ekrana sığacak ölçeği hesaplar.
 * Böylece çubuk hiçbir zaman ikinci satıra taşmaz.
 *
 * @param barRef Ölçeklenmemiş (transform uygulanmayan) çubuk elemanı.
 */
export function useToolbarScale(
    barRef: React.RefObject<HTMLElement | null>
): ToolbarScale {
    const [density, setDensity] = React.useState<ToolbarDensity>(
        () => readStoredDensity() ?? detectDefaultDensity()
    );
    const [fitRatio, setFitRatio] = React.useState(1);

    const cycleDensity = React.useCallback(() => {
        setDensity((prev) => {
            const next =
                TOOLBAR_DENSITIES[
                    (TOOLBAR_DENSITIES.indexOf(prev) + 1) % TOOLBAR_DENSITIES.length
                ];
            try {
                window.localStorage.setItem(STORAGE_KEY, next);
            } catch {
                /* gizli sekmede yazılamayabilir, önemsiz */
            }
            return next;
        });
    }, []);

    React.useLayoutEffect(() => {
        const el = barRef.current;
        if (!el) return;

        const measure = () => {
            // transform ölçüyü değiştirmediği için bu değer her zaman doğal genişlik.
            const natural = el.scrollWidth;
            if (!natural) return;
            const available = window.innerWidth - 24;
            setFitRatio(available / natural);
        };

        measure();

        const observer =
            typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
        observer?.observe(el);
        window.addEventListener('resize', measure);

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [barRef]);

    const scale = Math.max(
        MIN_SCALE,
        Math.min(DENSITY_FACTORS[density], fitRatio)
    );

    return { scale, density, cycleDensity };
}
