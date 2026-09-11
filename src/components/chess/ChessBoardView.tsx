// src/components/chess/ChessBoardView.tsx — Oynanabilir satranç tahtası
// ─────────────────────────────────────────────────────────────────────
// Tahta konumu FEN olarak alır ve yalnızca YASAL hamleleri kabul eder; kuralı
// motorun kendisi söyler (src/lib/chess/engine). İki kullanım biçimi vardır ve
// ikisi de aynı anda açıktır:
//   • Dokun-seç, dokun-oyna  → akıllı tahta ve tablet için
//   • Sürükle-bırak          → fare ile oynayanlar için
//
// Piyon son sıraya ulaştığında terfi penceresi açılır; oyuncu taşı seçene
// kadar hamle gönderilmez.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type PieceColor, type PieceType } from '../../lib/chess/engine/Chess';
import { ChessPiece } from './ChessPiece';
import { cn } from '../../utils/cn';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PROMOTION_CHOICES: { type: PieceType; label: string }[] = [
    { type: 'q', label: 'Vezir' },
    { type: 'r', label: 'Kale' },
    { type: 'b', label: 'Fil' },
    { type: 'n', label: 'At' },
];

interface ChessBoardViewProps {
    /** Gösterilecek konum. */
    fen: string;
    /** Tahtanın altında duran renk. */
    orientation: PieceColor;
    /** Bu renk hamle yapabilir; null ise tahta yalnızca izlenir. */
    playable: PieceColor | null;
    /** Yasal hamle yapıldığında "e2e4" / "e7e8q" biçiminde bildirilir. */
    onMove: (uci: string) => void;
    /** Vurgulanacak son hamle (UCI). */
    lastMove?: string | null;
}

export function ChessBoardView({
    fen,
    orientation,
    playable,
    onMove,
    lastMove = null,
}: ChessBoardViewProps) {
    const chess = useMemo(() => new Chess(fen), [fen]);
    const pieces = useMemo(() => chess.pieceMap(), [chess]);
    const checkedSquare = useMemo(() => chess.checkedKingSquare(), [chess]);

    const [selected, setSelected] = useState<string | null>(null);
    const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    /**
     * Süren dokunuşun kaydı: hangi kareden başladı ve o kare DOKUNMADAN ÖNCE
     * zaten seçili miydi. İkincisi, "aynı taşa ikinci kez dokununca seçim
     * kalksın" davranışı için gerekir.
     */
    const press = useRef<{ square: string; wasSelected: boolean } | null>(null);
    /** İşaretçiyle hallettiğimiz dokunuşun ardından gelen click'i yutar. */
    const handledByPointer = useRef(false);

    // Konum değişince (hamle, yeni oyun, rakibin hamlesi) seçim düşer.
    useEffect(() => {
        setSelected(null);
        setDragging(null);
    }, [fen]);

    const turn = chess.turnColor();
    const canMoveNow = playable !== null && playable === turn;

    const targets = useMemo(() => {
        if (!selected || !canMoveNow) return new Set<string>();
        return new Set(chess.destinations(selected));
    }, [chess, selected, canMoveNow]);

    /** Hamleyi gönderir; piyon terfisi gerekiyorsa önce taş sorulur. */
    const commit = useCallback(
        (from: string, to: string) => {
            const piece = chess.get(from);
            if (!piece) return;
            const lastRank = piece.color === 'w' ? '8' : '1';
            if (piece.type === 'p' && to[1] === lastRank) {
                setPromotion({ from, to });
                setSelected(null);
                return;
            }
            setSelected(null);
            onMove(`${from}${to}`);
        },
        [chess, onMove]
    );

    /**
     * Bir kareye dokunmanın anlamı.
     *
     *   • Seçili taş varsa ve burası yasal hedefse → hamle
     *   • Kendi taşınsa → seç (aynı taşa ikinci dokunuş seçimi bırakır)
     *   • Başka yerse → seçimi bırak
     */
    const handleSquare = useCallback(
        (square: string) => {
            if (promotion) return;
            if (!canMoveNow) {
                setSelected(null);
                return;
            }
            if (selected && targets.has(square)) {
                commit(selected, square);
                return;
            }
            const piece = pieces[square];
            if (piece && piece.color === playable) {
                setSelected((current) => (current === square ? null : square));
                return;
            }
            setSelected(null);
        },
        [promotion, canMoveNow, selected, targets, commit, pieces, playable]
    );

    /* -------------------------------------------------------------- *
     * Dokunma ve sürükleme
     *
     * HTML5 sürükleme yerine işaretçi (pointer) olayları kullanılır: aynı kod
     * fare, dokunmatik ekran ve kalem için çalışır. Seçim `pointerdown` anında
     * yapılır ki sürüklenen taşın hedefleri hemen görünsün.
     *
     * DİKKAT: Tarayıcı, dokunuşun ardından bir de `click` üretir. Seçim iki
     * kez işlenirse taş seçilir ve aynı anda bırakılır — tahta hiç tepki
     * vermemiş gibi görünür. Bu yüzden işaretçiyle hallettiğimiz dokunuşun
     * click'i yutulur; click yolu yalnızca klavye ve erişilebilirlik
     * araçlarından gelen tıklamalar için açık kalır.
     * -------------------------------------------------------------- */
    const handlePointerDown = useCallback(
        (square: string) => (event: React.PointerEvent) => {
            if (!canMoveNow || promotion) return;
            handledByPointer.current = true;

            if (selected && targets.has(square)) {
                press.current = null;
                commit(selected, square);
                return;
            }

            const piece = pieces[square];
            if (piece && piece.color === playable) {
                (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
                press.current = { square, wasSelected: selected === square };
                setSelected(square);
                setDragging(square);
                return;
            }

            press.current = null;
            setSelected(null);
        },
        [canMoveNow, promotion, selected, targets, commit, pieces, playable]
    );

    const handlePointerUp = useCallback(
        (event: React.PointerEvent) => {
            const started = press.current;
            press.current = null;
            const from = dragging;
            setDragging(null);
            if (!from) return;

            const dropped = document
                .elementFromPoint(event.clientX, event.clientY)
                ?.closest('[data-square]');
            const to = dropped?.getAttribute('data-square');

            if (to && to !== from) {
                if (chess.destinations(from).includes(to)) commit(from, to);
                return;
            }
            // Taş kendi karesine bırakıldı: bu, sürükleme değil dokunuştu.
            // Zaten seçiliydiyse ikinci dokunuş sayılır ve seçim kalkar.
            if (started?.wasSelected) setSelected(null);
        },
        [dragging, chess, commit]
    );

    /** Klavye/erişilebilirlik yolundan gelen tıklama. */
    const handleClick = useCallback(
        (square: string) => {
            if (handledByPointer.current) {
                handledByPointer.current = false;
                return;
            }
            handleSquare(square);
        },
        [handleSquare]
    );

    const files = orientation === 'w' ? FILES : [...FILES].reverse();
    const ranks = orientation === 'w' ? RANKS : [...RANKS].reverse();

    const lastFrom = lastMove ? lastMove.slice(0, 2) : null;
    const lastTo = lastMove ? lastMove.slice(2, 4) : null;

    return (
        <div className="relative w-full">
            <div
                onPointerUp={handlePointerUp}
                // Satırlar da sütunlar kadar eşit bölünmeli: aksi hâlde taşı olan
                // satırlar içeriğe göre uzar, boş satırlar ezilir ve kareler
                // dikdörtgene döner.
                className="grid aspect-square w-full grid-cols-8 grid-rows-[repeat(8,minmax(0,1fr))] overflow-hidden rounded-2xl border border-outline-variant shadow-[0_10px_30px_rgba(15,23,42,0.12)] touch-none"
                role="grid"
                aria-label="Satranç tahtası"
            >
                {ranks.map((rank, rowIndex) =>
                    files.map((file, colIndex) => {
                        const square = `${file}${rank}`;
                        const piece = pieces[square];
                        const light = (rowIndex + colIndex) % 2 === 0;
                        const isTarget = targets.has(square);
                        const showEdgeFile = rowIndex === 7;
                        const showEdgeRank = colIndex === 0;
                        return (
                            <div
                                key={square}
                                data-square={square}
                                role="gridcell"
                                aria-label={square}
                                onClick={() => handleClick(square)}
                                onPointerDown={handlePointerDown(square)}
                                className={cn(
                                    'relative flex items-center justify-center',
                                    light ? 'bg-[#f2e6cf]' : 'bg-[#b58561]',
                                    (square === lastFrom || square === lastTo) &&
                                        'after:absolute after:inset-0 after:bg-amber-300/35',
                                    selected === square && 'ring-2 ring-inset ring-primary/80',
                                    square === checkedSquare &&
                                        'after:absolute after:inset-0 after:bg-red-500/35',
                                    canMoveNow && piece?.color === playable
                                        ? 'cursor-pointer'
                                        : isTarget
                                          ? 'cursor-pointer'
                                          : 'cursor-default'
                                )}
                            >
                                {showEdgeRank && (
                                    <span
                                        className={cn(
                                            'pointer-events-none absolute left-0.5 top-0.5 text-[0.55rem] font-bold leading-none',
                                            light ? 'text-[#b58561]' : 'text-[#f2e6cf]'
                                        )}
                                    >
                                        {rank}
                                    </span>
                                )}
                                {showEdgeFile && (
                                    <span
                                        className={cn(
                                            'pointer-events-none absolute bottom-0.5 right-1 text-[0.55rem] font-bold leading-none',
                                            light ? 'text-[#b58561]' : 'text-[#f2e6cf]'
                                        )}
                                    >
                                        {file}
                                    </span>
                                )}

                                {piece && (
                                    <ChessPiece
                                        type={piece.type}
                                        color={piece.color}
                                        className={cn(
                                            'relative z-10 block h-[78%] w-[78%] [&>svg]:h-full [&>svg]:w-full',
                                            dragging === square && 'opacity-40'
                                        )}
                                    />
                                )}

                                {/* Yasal hamle işareti: boş kareye nokta, alınacak taşa halka. */}
                                {isTarget && (
                                    <span
                                        className={cn(
                                            'pointer-events-none absolute z-20',
                                            piece
                                                ? 'inset-[6%] rounded-full border-[0.35rem] border-emerald-500/70'
                                                : 'h-[26%] w-[26%] rounded-full bg-emerald-600/55'
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {promotion && (
                <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-on-surface/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xs rounded-2xl bg-surface p-4 shadow-xl">
                        <p className="mb-3 text-center text-sm font-semibold text-on-surface">
                            Piyonun hangi taşa dönüşsün?
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {PROMOTION_CHOICES.map((choice) => (
                                <button
                                    key={choice.type}
                                    type="button"
                                    onClick={() => {
                                        const { from, to } = promotion;
                                        setPromotion(null);
                                        onMove(`${from}${to}${choice.type}`);
                                    }}
                                    className="flex flex-col items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-2 transition hover:border-primary hover:bg-primary-container"
                                >
                                    <ChessPiece
                                        type={choice.type}
                                        color={playable ?? 'w'}
                                        className="block h-9 w-9 [&>svg]:h-full [&>svg]:w-full"
                                    />
                                    <span className="text-[11px] font-semibold text-on-surface-variant">
                                        {choice.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
