// src/components/notebooks/LessonModeToolbar.tsx
// Defterin ders anlatım çubuğu: spot ışığı, perde, sunum modu ve öğrenciye
// gönderme. Yalnızca görünümü değiştirir, defter içeriğine dokunmaz.
import type { RefObject } from 'react';
import { Flashlight, PanelTopClose, Presentation, QrCode } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FullscreenToggle } from '../common/FullscreenToggle';

export type LessonOverlay = 'none' | 'spotlight' | 'curtain';

interface LessonModeToolbarProps {
    overlay: LessonOverlay;
    onOverlayChange: (o: LessonOverlay) => void;
    presenting: boolean;
    onPresentingChange: (v: boolean) => void;
    onShare: () => void;
    /** Tam ekrana alınacak öğe; sunum modunda tüm çalışma alanı verilir. */
    fullscreenTarget?: RefObject<HTMLElement>;
}

export function LessonModeToolbar({
    overlay,
    onOverlayChange,
    presenting,
    onPresentingChange,
    onShare,
    fullscreenTarget,
}: LessonModeToolbarProps) {
    const toggle = (id: LessonOverlay) => onOverlayChange(overlay === id ? 'none' : id);

    const btn = (active: boolean) =>
        cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors',
            active
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:bg-surface-container-high'
        );

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => toggle('spotlight')}
                aria-pressed={overlay === 'spotlight'}
                title="Spot ışığı — dikkati bir noktaya topla"
                className={btn(overlay === 'spotlight')}
            >
                <Flashlight className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Spot</span>
            </button>
            <button
                type="button"
                onClick={() => toggle('curtain')}
                aria-pressed={overlay === 'curtain'}
                title="Perde — cevabı adım adım aç"
                className={btn(overlay === 'curtain')}
            >
                <PanelTopClose className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Perde</span>
            </button>
            <button
                type="button"
                onClick={() => onPresentingChange(!presenting)}
                aria-pressed={presenting}
                title="Sunum modu — araç çubuklarını gizle"
                className={btn(presenting)}
            >
                <Presentation className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sunum</span>
            </button>
            <FullscreenToggle target={fullscreenTarget} className="ml-0.5" />
            <div className="w-px h-4 bg-outline-variant mx-1" />
            <button
                type="button"
                onClick={onShare}
                title="Öğrenciye gönder — QR kod ve bağlantı"
                className={btn(false)}
            >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Öğrenciye gönder</span>
            </button>
        </div>
    );
}
