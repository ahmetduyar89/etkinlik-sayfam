// src/components/chess/ChessBotTable.tsx — Bilgisayara karşı oyun
// ─────────────────────────────────────────────────────────────────────
// Bu ekran ağa hiç bağlanmaz: motor da rakip de tarayıcıda çalışır. Rakip
// bulunamadığında ya da tek başına çalışmak istendiğinde kullanılır.
//
// Yapay zekâ, satranç uygulamasının kendi motorudur (src/lib/chess/engine/Ai).
// Kolay seviyede bilerek hata yapar; çocuk kazanmayı da öğrensin diye.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, RefreshCw, Undo2 } from 'lucide-react';
import { ChessBoardView } from './ChessBoardView';
import { MoveList, PlayerBar, ResultBanner } from './TableParts';
import { advantageOf } from './tableUtils';
import { cn } from '../../utils/cn';
import { Chess, sanTr, type PieceColor } from '../../lib/chess/engine/Chess';
import { LEVELS, ai } from '../../lib/chess/engine/Ai';

const LEVEL_IDS = ['kolay', 'orta', 'zor'] as const;
type LevelId = (typeof LEVEL_IDS)[number];

interface ChessBotTableProps {
    playerName: string;
    onExit: () => void;
}

export function ChessBotTable({ playerName, onExit }: ChessBotTableProps) {
    const [level, setLevel] = useState<LevelId>('kolay');
    const [myColor, setMyColor] = useState<PieceColor>('w');
    const [game, setGame] = useState(() => new Chess());
    const [fen, setFen] = useState(() => game.fen());
    const [lastMove, setLastMove] = useState<string | null>(null);
    const [thinking, setThinking] = useState(false);
    // Aynı konum için iki kez düşünmeyi engeller (React iki kez çizebilir).
    const pending = useRef<string | null>(null);

    // Motor nesnesi yerinde değişir; durum bu yüzden her çizimde ondan
    // okunur (React'in bağımlılık listesiyle takip edilemez).
    const status = game.status();
    const turn = game.turnColor();
    const botColor: PieceColor = myColor === 'w' ? 'b' : 'w';

    /** Konumu ekrana yansıtır. Motor nesnesi yerinde değişir, FEN tetikler. */
    const sync = useCallback((chess: Chess, move: string | null) => {
        setFen(chess.fen());
        setLastMove(move);
    }, []);

    const newGame = useCallback(
        (color: PieceColor = myColor, nextLevel: LevelId = level) => {
            const fresh = new Chess();
            pending.current = null;
            setMyColor(color);
            setLevel(nextLevel);
            setGame(fresh);
            setThinking(false);
            sync(fresh, null);
        },
        [myColor, level, sync]
    );

    const handleMove = useCallback(
        (uci: string) => {
            if (game.turnColor() !== myColor || game.isGameOver()) return;
            if (!game.moveUci(uci)) return;
            sync(game, uci);
        },
        [game, myColor, sync]
    );

    // Sıra bilgisayardaysa hamlesini hesaplar. Hesap sürerken tahta kilitli
    // değildir; yalnızca sıra karşıda olduğu için hamle kabul edilmez.
    useEffect(() => {
        if (turn !== botColor || status.over) return;
        if (pending.current === fen) return;
        pending.current = fen;

        let alive = true;
        setThinking(true);
        ai.chooseMove(game, level)
            .then((move) => {
                if (!alive || !move) return;
                const uci = `${move.from}${move.to}${move.promotion ?? ''}`;
                if (game.moveUci(uci)) sync(game, uci);
            })
            .finally(() => alive && setThinking(false));

        return () => {
            alive = false;
        };
    }, [turn, botColor, status.over, fen, game, level, sync]);

    /** Geri al: kendi hamlem ve bilgisayarın yanıtı birlikte geri alınır. */
    const undo = useCallback(() => {
        if (thinking) return;
        game.undo();
        if (game.turnColor() !== myColor) game.undo();
        pending.current = game.fen();
        sync(game, null);
    }, [game, myColor, thinking, sync]);

    const lost = game.capturedPieces();
    const advantage = advantageOf(lost);
    const san = (game.getHistory() as string[]).map(sanTr);

    const resultTone = !status.over
        ? 'berabere'
        : status.winner === null
          ? 'berabere'
          : status.winner === myColor
            ? 'kazandin'
            : 'kaybettin';

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onExit}
                    className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Salon
                </button>
                <span className="flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container">
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    Bilgisayara karşı
                </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="flex flex-col gap-2.5">
                    <PlayerBar
                        name={`Bilgisayar · ${LEVELS[level].label}`}
                        color={botColor}
                        active={turn === botColor && !status.over}
                        clockMs={null}
                        captured={botColor === 'w' ? lost.b : lost.w}
                        advantage={botColor === 'w' ? advantage.w : advantage.b}
                    />

                    <ChessBoardView
                        fen={fen}
                        orientation={myColor}
                        playable={turn === myColor && !status.over ? myColor : null}
                        onMove={handleMove}
                        lastMove={lastMove}
                    />

                    <PlayerBar
                        name={playerName}
                        color={myColor}
                        active={turn === myColor && !status.over}
                        clockMs={null}
                        captured={myColor === 'w' ? lost.b : lost.w}
                        advantage={myColor === 'w' ? advantage.w : advantage.b}
                        isSelf
                    />
                </div>

                <aside className="flex flex-col gap-3">
                    {status.over ? (
                        <ResultBanner
                            result={
                                status.winner === null
                                    ? 'Berabere'
                                    : status.winner === myColor
                                      ? 'Kazandın!'
                                      : 'Kaybettin'
                            }
                            reason={status.reason}
                            tone={resultTone}
                        />
                    ) : (
                        <p className="rounded-2xl border border-outline-variant bg-surface px-3 py-2.5 text-center text-xs font-semibold text-on-surface-variant">
                            {thinking
                                ? 'Bilgisayar düşünüyor…'
                                : turn === myColor
                                  ? status.reason || 'Sıra sende.'
                                  : 'Sıra bilgisayarda.'}
                        </p>
                    )}

                    <div className="rounded-2xl border border-outline-variant bg-surface p-3">
                        <p className="mb-2 text-xs font-bold text-on-surface-variant">Zorluk</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {LEVEL_IDS.map((id) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => newGame(myColor, id)}
                                    className={cn(
                                        'rounded-xl px-2 py-2 text-xs font-bold transition',
                                        level === id
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                                    )}
                                >
                                    {LEVELS[id].label}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-[11px] leading-snug text-on-surface-variant">
                            {LEVELS[level].description}
                        </p>

                        <p className="mb-2 mt-4 text-xs font-bold text-on-surface-variant">Rengin</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {(['w', 'b'] as PieceColor[]).map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => newGame(color, level)}
                                    className={cn(
                                        'rounded-xl px-2 py-2 text-xs font-bold transition',
                                        myColor === color
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                                    )}
                                >
                                    {color === 'w' ? 'Beyaz' : 'Siyah'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => newGame()}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-on-primary transition hover:brightness-105"
                        >
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                            Yeni oyun
                        </button>
                        <button
                            type="button"
                            onClick={undo}
                            disabled={san.length === 0 || thinking}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-xs font-bold text-on-surface-variant transition hover:text-on-surface disabled:opacity-40"
                        >
                            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Geri al
                        </button>
                    </div>

                    <MoveList san={san} />
                </aside>
            </div>
        </div>
    );
}
