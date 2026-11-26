// src/components/common/FullscreenToggle.tsx — Tam ekran aç/kapat düğmesi
// Tıklandığında tam ekrana geçer, tekrar tıklandığında normal ekrana döner.
// Yalnızca bilgisayarda (fare + geniş ekran) ve tarayıcı destekliyorsa görünür.
import type { RefObject } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFullscreen } from '../../hooks/useFullscreen';

interface FullscreenToggleProps {
    /** Tam ekrana alınacak öğe; verilmezse tüm sayfa tam ekran olur. */
    target?: RefObject<HTMLElement>;
    /** Açık zeminli üst başlık için 'light', koyu başlıklar için 'dark'. */
    variant?: 'light' | 'dark';
    className?: string;
}

export function FullscreenToggle({ target, variant = 'light', className }: FullscreenToggleProps) {
    const { isFullscreen, isSupported, toggle } = useFullscreen(target);

    if (!isSupported) return null;

    const label = isFullscreen ? 'Normal ekrana dön' : 'Tam ekran';
    const Icon = isFullscreen ? Minimize : Maximize;

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={isFullscreen}
            aria-label={label}
            title={`${label} (F11)`}
            className={cn(
                'flex-shrink-0 p-2 rounded-xl border transition-all active:scale-95',
                variant === 'light'
                    ? isFullscreen
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-surface-container-high text-on-surface-variant border-transparent hover:text-primary hover:border-primary'
                    : isFullscreen
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10',
                className
            )}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}
