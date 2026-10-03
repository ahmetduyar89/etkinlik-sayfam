// src/components/chess/TableParts.tsx — Masanın çevresindeki küçük parçalar
// Oyuncu şeridi, satranç saati, alınan taşlar ve hamle defteri. Hem çevrimiçi
// maç hem de bilgisayara karşı oyun aynı parçaları kullanır.
import { Clock, Crown, Wifi, WifiOff } from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { formatClock } from './tableUtils';
import { cn } from '../../utils/cn';
import type { PieceColor, PieceType } from '../../lib/chess/engine/Chess';

interface PlayerBarProps {
    name: string;
    color: PieceColor;
    /** Sıra bu oyuncuda mı? */
    active: boolean;
    /** Kalan süre (ms); süresiz oyunda null. */
    clockMs: number | null;
    /** Alınan taşlar — bu oyuncunun kazandığı taşlar. */
    captured: PieceType[];
    /** Materyal farkı (piyon cinsinden); sıfır ya da eksi ise gösterilmez. */
    advantage: number;
    /** Karşı taraf canlı mı (çevrimiçi maçta). */
    online?: boolean | null;
    /** "Sen" rozetini kime takacağımız. */
    isSelf?: boolean;
}

export function PlayerBar({
    name,
    color,
    active,
    clockMs,
    captured,
    advantage,
    online = null,
    isSelf = false,
}: PlayerBarProps) {
    const low = clockMs !== null && clockMs < 30_000;
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-2xl border px-3 py-2 transition-colors',
                active
                    ? 'border-primary/50 bg-primary-container/60'
                    : 'border-outline-variant bg-surface-container-low'
            )}
        >
            <span
                className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                    color === 'w'
                        ? 'border-outline-variant bg-[#fffaf0]'
                        : 'border-transparent bg-[#3a3060]'
                )}
            >
                <ChessPiece
                    type="k"
                    color={color}
                    className="block h-6 w-6 [&>svg]:h-full [&>svg]:w-full"
                />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-on-surface">
                        {name || (color === 'w' ? 'Beyaz' : 'Siyah')}
                    </span>
                    {isSelf && (
                        <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            sen
                        </span>
                    )}
                    {online === true && <Wifi className="h-3 w-3 shrink-0 text-tertiary" />}
                    {online === false && (
                        <WifiOff className="h-3 w-3 shrink-0 text-on-surface-variant" />
                    )}
                </div>
                <div className="mt-0.5 flex min-h-[18px] items-center gap-0.5">
                    {captured.map((type, index) => (
                        <ChessPiece
                            key={`${type}-${index}`}
                            type={type}
                            color={color === 'w' ? 'b' : 'w'}
                            className="block h-4 w-4 [&>svg]:h-full [&>svg]:w-full"
                        />
                    ))}
                    {advantage > 0 && (
                        <span className="ml-1 text-[11px] font-bold text-tertiary">
                            +{advantage}
                        </span>
                    )}
                </div>
            </div>

            {clockMs !== null && (
                <span
                    className={cn(
                        'flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 font-mono text-base font-bold tabular-nums',
                        low
                            ? 'bg-error-container text-on-error-container'
                            : active
                              ? 'bg-surface text-on-surface'
                              : 'bg-surface-container-high text-on-surface-variant'
                    )}
                >
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatClock(clockMs)}
                </span>
            )}
        </div>
    );
}

/** Hamle defteri: 1. e4 e5 · 2. Af3 Ac6 … */
export function MoveList({ san }: { san: string[] }) {
    const rows: { no: number; white: string; black: string }[] = [];
    for (let i = 0; i < san.length; i += 2) {
        rows.push({ no: i / 2 + 1, white: san[i], black: san[i + 1] ?? '' });
    }
    return (
        <div className="max-h-44 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-low p-2 lg:max-h-none lg:flex-1">
            {rows.length === 0 ? (
                <p className="px-1 py-2 text-xs text-on-surface-variant">Henüz hamle yapılmadı.</p>
            ) : (
                <ol className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 text-[13px] tabular-nums">
                    {rows.map((row) => (
                        <li key={row.no} className="contents">
                            <span className="py-0.5 text-right text-on-surface-variant">
                                {row.no}.
                            </span>
                            <span className="py-0.5 font-semibold text-on-surface">{row.white}</span>
                            <span className="py-0.5 font-semibold text-on-surface">{row.black}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

/** Oyun bittiğinde tahtanın üstünde beliren sonuç şeridi. */
export function ResultBanner({
    result,
    reason,
    tone,
}: {
    result: string;
    reason: string;
    tone: 'kazandin' | 'kaybettin' | 'berabere';
}) {
    const palette = {
        kazandin: 'border-tertiary/40 bg-tertiary-container text-on-tertiary-container',
        kaybettin: 'border-error/30 bg-error-container text-on-error-container',
        berabere: 'border-outline-variant bg-surface-container-high text-on-surface',
    }[tone];
    return (
        <div className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3', palette)}>
            <Crown className="h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-sm font-bold">{result}</p>
                <p className="text-xs opacity-80">{reason}</p>
            </div>
        </div>
    );
}
