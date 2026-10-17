// src/components/chess/tableUtils.ts — Masa ekranlarının küçük yardımcıları
// Bileşen değil, hesap: saat biçimi, saat tiktakı ve materyal farkı. Ayrı
// dosyada duruyorlar ki bileşen dosyaları yalnızca bileşen dışa aktarsın
// (Vite'ın hızlı yenilemesi bunu bekler).
import { useEffect, useState } from 'react';
import { SIMPLE_VALUES } from '../../lib/chess/engine/Evaluator';
import type { PieceColor, PieceType } from '../../lib/chess/engine/Chess';

/** "10:35" / "0:07.4" — son 20 saniyede salise gösterilir, heyecan artsın. */
export function formatClock(ms: number): string {
    const safe = Math.max(0, ms);
    const totalSeconds = Math.floor(safe / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (safe < 20_000) {
        const tenths = Math.floor((safe % 1000) / 100);
        return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Saniyede birkaç kez yeniden çizilen saat. Yalnızca süre varken çalışır. */
export function useTicker(active: boolean, everyMs = 200): number {
    const [tick, setTick] = useState(() => Date.now());
    useEffect(() => {
        if (!active) return;
        const id = window.setInterval(() => setTick(Date.now()), everyMs);
        return () => window.clearInterval(id);
    }, [active, everyMs]);
    return tick;
}

/**
 * Materyal farkı. Girdi motorun verdiği "hangi renk hangi taşlarını kaybetti"
 * haritasıdır: `lost.w`, beyazın kaybettiği taşlardır. Beyazın önde olması
 * demek, siyahın daha çok taş kaybetmesi demektir.
 */
export function advantageOf(lost: Record<PieceColor, PieceType[]>): { w: number; b: number } {
    const sum = (list: PieceType[]) => list.reduce((total, type) => total + SIMPLE_VALUES[type], 0);
    const whiteLost = sum(lost.w);
    const blackLost = sum(lost.b);
    return { w: Math.max(0, blackLost - whiteLost), b: Math.max(0, whiteLost - blackLost) };
}
