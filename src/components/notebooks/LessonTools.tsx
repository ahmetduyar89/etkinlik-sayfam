// src/components/notebooks/LessonTools.tsx
// Ders anlatım örtüleri: spot ışığı ve perde.
//
// İkisi de çizim tuvalinin ÜSTÜNDE duran, kendi olay yakalayan katmanlardır;
// açıkken sayfaya yazılamaz — zaten amaç dikkati bir yere toplamaktır.
// Defter içeriğine dokunmazlar, hiçbir şey kaydedilmez.
import React from 'react';
import { SpotlightOverlay } from '../tools/SpotlightOverlay';

const MIN_RADIUS = 60;
const MAX_RADIUS = 420;

interface SpotlightProps {
    onExit: () => void;
}

/**
 * Spot ışığı: fareyi/parmağı izler, tekerlek ya da +/− ile yarıçapı değişir.
 * Esc ile kapanır.
 */
export function Spotlight({ onExit }: SpotlightProps) {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const [pos, setPos] = React.useState({ x: 0, y: 0 });
    const [radius, setRadius] = React.useState(180);
    const [ready, setReady] = React.useState(false);

    // Açılışta ortaya konumlan; fare gelene kadar rastgele bir köşede durmasın.
    React.useEffect(() => {
        const el = hostRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({ x: r.width / 2, y: r.height / 2 });
        setReady(true);
    }, []);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onExit();
            if (e.key === '+' || e.key === '=') setRadius((r) => Math.min(MAX_RADIUS, r + 20));
            if (e.key === '-' || e.key === '_') setRadius((r) => Math.max(MIN_RADIUS, r - 20));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onExit]);

    const track = (e: React.PointerEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };

    return (
        <div
            ref={hostRef}
            className="absolute inset-0 z-[4200] cursor-none touch-none"
            onPointerMove={track}
            onPointerDown={track}
            onWheel={(e) => {
                setRadius((r) => Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, r - e.deltaY * 0.4)));
            }}
        >
            {ready && <SpotlightOverlay pos={pos} radius={radius} />}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[4300] px-3 py-1.5 rounded-full bg-black/70 text-white text-[11.5px] font-semibold pointer-events-none">
                Tekerlek: boyut · Esc: kapat
            </p>
        </div>
    );
}

interface CurtainProps {
    onExit: () => void;
}

/**
 * Perde: sayfanın ALTINI örter; tutamak aşağı sürüklendikçe içerik yukarıdan
 * aşağı doğru açılır. Klasik tahta tekniği — çözümü satır satır göstermek
 * için. `revealed` açıkta kalan üst kısmın oranıdır.
 */
export function Curtain({ onExit }: CurtainProps) {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = React.useState(0.35);
    const draggingRef = React.useRef(false);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onExit();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onExit]);

    const moveTo = (clientY: number) => {
        const el = hostRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setRevealed(Math.max(0, Math.min(1, (clientY - r.top) / r.height)));
    };

    return (
        <div ref={hostRef} className="absolute inset-0 z-[4200] pointer-events-none">
            {/* Örtü sayfanın altını kapatır; açık kalan üst kısım serbesttir. */}
            <div
                className="absolute left-0 right-0 bottom-0 bg-slate-900 pointer-events-auto touch-none"
                style={{ height: `${(1 - revealed) * 100}%` }}
                onPointerDown={(e) => {
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                    draggingRef.current = true;
                    moveTo(e.clientY);
                }}
                onPointerMove={(e) => draggingRef.current && moveTo(e.clientY)}
                onPointerUp={() => (draggingRef.current = false)}
            />
            {/* Tutamak */}
            <div
                role="slider"
                aria-label="Perdeyi aç / kapat"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(revealed * 100)}
                tabIndex={0}
                className="absolute left-0 right-0 h-9 -mt-[18px] flex items-center justify-center pointer-events-auto cursor-ns-resize touch-none"
                style={{ top: `${revealed * 100}%` }}
                onPointerDown={(e) => {
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                    draggingRef.current = true;
                }}
                onPointerMove={(e) => draggingRef.current && moveTo(e.clientY)}
                onPointerUp={() => (draggingRef.current = false)}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') setRevealed((c) => Math.min(1, c + 0.05));
                    if (e.key === 'ArrowUp') setRevealed((c) => Math.max(0, c - 0.05));
                }}
            >
                <div className="h-1.5 w-full bg-amber-400" />
                <span className="absolute px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-[11px] font-extrabold shadow">
                    ⇕ Aşağı sürükle, açılsın · Esc: kapat
                </span>
            </div>
        </div>
    );
}
