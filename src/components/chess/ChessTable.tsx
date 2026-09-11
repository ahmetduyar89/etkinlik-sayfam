// src/components/chess/ChessTable.tsx — Çevrimiçi maç masası
// ─────────────────────────────────────────────────────────────────────
// İki cihaz aynı masa dokümanını dinler; biri hamle yazdığında diğerinin
// tahtası anında güncellenir (bkz. src/lib/chess/rooms.ts).
//
// Ekran üç hâlde olabilir:
//   bekliyor   → rakip bekleniyor; kod ve bağlantı paylaşılır, "Hazırım" denir
//   oynaniyor  → tahta açık, saatler işliyor
//   bitti      → sonuç ve "Yeniden oyna"
//
// Masa dolduğunda gelen üçüncü kişi İZLEYİCİ olur: tahtayı canlı görür ama
// hamle yapamaz. Öğretmen sınıfta maçı tahtaya böyle yansıtır.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, Flag, Handshake, Loader2, RefreshCw, Users, X } from 'lucide-react';
import { ChessBoardView } from './ChessBoardView';
import { MoveList, PlayerBar, ResultBanner } from './TableParts';
import { advantageOf, useTicker } from './tableUtils';
import { useToast } from '../common/ToastProvider';
import { cn } from '../../utils/cn';
import { sanTr, type PieceColor } from '../../lib/chess/engine/Chess';
import {
    HEARTBEAT_MS,
    STALE_MS,
    answerDraw,
    clockNow,
    flagTimeout,
    heartbeat,
    joinRoom,
    leaveRoom,
    offerDraw,
    playMove,
    replay,
    requestRematch,
    resign,
    seatColor,
    setReady,
    watchRoom,
    type ChessRoom,
} from '../../lib/chess/rooms';

interface ChessTableProps {
    code: string;
    playerId: string;
    playerName: string;
    onExit: () => void;
}

export function ChessTable({ code, playerId, playerName, onExit }: ChessTableProps) {
    const [room, setRoom] = useState<ChessRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const toast = useToast();

    // Masaya katıl (koltuk boşsa otur), sonra canlı dinlemeye geç.
    useEffect(() => {
        let alive = true;
        joinRoom(code, playerId, playerName)
            .then(() => alive && setLoading(false))
            .catch((e: Error) => {
                if (!alive) return;
                setError(e.message || 'Masaya bağlanılamadı.');
                setLoading(false);
            });
        const stop = watchRoom(
            code,
            (next) => {
                if (!alive) return;
                setRoom(next);
                if (!next) setError('Bu masa kapanmış.');
            },
            () => alive && setError('Bağlantı koptu. İnterneti kontrol edin.')
        );
        return () => {
            alive = false;
            stop();
        };
    }, [code, playerId, playerName]);

    const myColor: PieceColor | null = room ? seatColor(room, playerId) : null;

    // Yaşam sinyali: sekme açık kaldığı sürece koltuk canlı görünür.
    useEffect(() => {
        if (!myColor) return;
        void heartbeat(code, myColor);
        const id = window.setInterval(() => void heartbeat(code, myColor), HEARTBEAT_MS);
        return () => window.clearInterval(id);
    }, [code, myColor]);

    const chess = useMemo(() => (room ? replay(room.moves) : null), [room]);
    const playing = room?.status === 'oynaniyor';
    const tick = useTicker(Boolean(playing && room?.clock));
    const live = room ? clockNow(room, tick) : null;

    // Süre bittiğinde sonucu masaya iki taraf da yazabilir; hangisi önce
    // yetişirse yazar, işlem ikinciyi geri çevirir.
    useEffect(() => {
        if (!room || !playing || !live) return;
        if (live.w_ms <= 0) void flagTimeout(code, 'w');
        else if (live.b_ms <= 0) void flagTimeout(code, 'b');
    }, [room, playing, live, code]);

    const handleMove = useCallback(
        async (uci: string) => {
            const ok = await playMove(code, playerId, uci);
            if (!ok) toast.error('Hamle yazılamadı, sıranı bekle.');
        },
        [code, playerId, toast]
    );

    const handleExit = useCallback(async () => {
        if (myColor) await leaveRoom(code, playerId);
        onExit();
    }, [myColor, code, playerId, onExit]);

    const shareUrl = useMemo(() => {
        const url = new URL(window.location.href);
        url.search = `?view=satranc&oda=${code}`;
        url.hash = '';
        return url.toString();
    }, [code]);

    const copyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Bağlantı kopyalanamadı, elle seçip kopyalayın.');
        }
    }, [shareUrl, toast]);

    if (loading || (!room && !error)) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-on-surface-variant">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                <p className="text-sm">Masa açılıyor…</p>
            </div>
        );
    }

    if (error || !room || !chess) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
                <p className="text-base font-semibold text-on-surface">
                    {error ?? 'Masa bulunamadı.'}
                </p>
                <button
                    type="button"
                    onClick={onExit}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                >
                    Salona dön
                </button>
            </div>
        );
    }

    const orientation: PieceColor = myColor ?? 'w';
    const turn = chess.turnColor();
    const lost = chess.capturedPieces();
    const advantage = advantageOf(lost);
    const san = (chess.getHistory() as string[]).map(sanTr);
    const opponentColor: PieceColor = orientation === 'w' ? 'b' : 'w';
    const mySeat = myColor ? (myColor === 'w' ? room.white : room.black) : null;
    const topSeat = opponentColor === 'w' ? room.white : room.black;
    const bottomSeat = orientation === 'w' ? room.white : room.black;
    const now = Date.now();

    const iAmSpectator = myColor === null;
    const drawOfferToMe = room.draw_offer !== null && myColor !== null && room.draw_offer !== myColor;
    const iOfferedDraw = room.draw_offer !== null && room.draw_offer === myColor;

    const resultTone = !room.result
        ? 'berabere'
        : room.result.winner === null
          ? 'berabere'
          : room.result.winner === myColor
            ? 'kazandin'
            : 'kaybettin';

    const resultTitle = !room.result
        ? ''
        : room.result.winner === null
          ? 'Berabere'
          : myColor === null
            ? `${room.result.winner === 'w' ? 'Beyaz' : 'Siyah'} kazandı`
            : room.result.winner === myColor
              ? 'Kazandın!'
              : 'Kaybettin';

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={handleExit}
                    className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Salon
                </button>
                <div className="flex items-center gap-2">
                    {iAmSpectator && (
                        <span className="flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container">
                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                            İzleyici
                        </span>
                    )}
                    <span className="rounded-full bg-surface-container-high px-3 py-1.5 font-mono text-sm font-bold tracking-[0.2em] text-on-surface">
                        {room.code}
                    </span>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="flex flex-col gap-2.5">
                    <PlayerBar
                        name={topSeat?.name ?? 'Rakip bekleniyor'}
                        color={opponentColor}
                        active={playing && turn === opponentColor}
                        clockMs={live ? (opponentColor === 'w' ? live.w_ms : live.b_ms) : null}
                        captured={opponentColor === 'w' ? lost.b : lost.w}
                        advantage={opponentColor === 'w' ? advantage.w : advantage.b}
                        online={topSeat ? now - topSeat.seen < STALE_MS : null}
                    />

                    <ChessBoardView
                        fen={room.fen}
                        orientation={orientation}
                        playable={playing && myColor && turn === myColor ? myColor : null}
                        onMove={handleMove}
                        lastMove={room.last_move}
                    />

                    <PlayerBar
                        name={bottomSeat?.name ?? (iAmSpectator ? 'Boş koltuk' : playerName)}
                        color={orientation}
                        active={playing && turn === orientation}
                        clockMs={live ? (orientation === 'w' ? live.w_ms : live.b_ms) : null}
                        captured={orientation === 'w' ? lost.b : lost.w}
                        advantage={orientation === 'w' ? advantage.w : advantage.b}
                        online={bottomSeat ? now - bottomSeat.seen < STALE_MS : null}
                        isSelf={!iAmSpectator}
                    />
                </div>

                <aside className="flex flex-col gap-3">
                    {room.status === 'bekliyor' && (
                        <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                            <p className="text-sm font-bold text-on-surface">
                                {topSeat ? 'Başlamaya hazır mısın?' : 'Rakip bekleniyor'}
                            </p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                                {topSeat
                                    ? 'İki oyuncu da hazır olunca saat çalışmaya başlar.'
                                    : 'Arkadaşına aşağıdaki kodu ya da bağlantıyı gönder.'}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                                <span className="flex-1 rounded-xl bg-surface-container-high px-3 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.3em] text-on-surface">
                                    {room.code}
                                </span>
                                <button
                                    type="button"
                                    onClick={copyLink}
                                    title="Bağlantıyı kopyala"
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant bg-surface text-on-surface-variant transition hover:border-primary hover:text-primary"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-tertiary" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {!iAmSpectator && (
                                <ReadyButton room={room} myColor={myColor} code={code} />
                            )}
                        </div>
                    )}

                    {room.status === 'bitti' && room.result && (
                        <div className="flex flex-col gap-3">
                            <ResultBanner
                                result={resultTitle}
                                reason={room.result.reason}
                                tone={resultTone}
                            />
                            {!iAmSpectator && (
                                <button
                                    type="button"
                                    onClick={() => void requestRematch(code, playerId)}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition hover:brightness-105"
                                >
                                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                    {myColor && room.rematch[myColor]
                                        ? 'Rakip bekleniyor…'
                                        : 'Yeniden oyna (renkler değişir)'}
                                </button>
                            )}
                        </div>
                    )}

                    {drawOfferToMe && (
                        <div className="rounded-2xl border border-secondary/40 bg-secondary-container/60 p-3">
                            <p className="text-sm font-semibold text-on-secondary-container">
                                Rakibin beraberlik teklif etti.
                            </p>
                            <div className="mt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => void answerDraw(code, playerId, true)}
                                    className="flex-1 rounded-xl bg-tertiary px-3 py-2 text-xs font-bold text-on-tertiary"
                                >
                                    Kabul et
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void answerDraw(code, playerId, false)}
                                    className="flex-1 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-bold text-on-surface-variant"
                                >
                                    Reddet
                                </button>
                            </div>
                        </div>
                    )}

                    {playing && !iAmSpectator && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => void offerDraw(code, playerId, !iOfferedDraw)}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition',
                                    iOfferedDraw
                                        ? 'border-secondary/40 bg-secondary-container text-on-secondary-container'
                                        : 'border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface'
                                )}
                            >
                                {iOfferedDraw ? (
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                    <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {iOfferedDraw ? 'Teklifi geri al' : 'Beraberlik'}
                            </button>
                            <button
                                type="button"
                                onClick={() => void resign(code, playerId)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-error/30 bg-error-container px-3 py-2.5 text-xs font-bold text-on-error-container transition hover:brightness-105"
                            >
                                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                                Pes et
                            </button>
                        </div>
                    )}

                    {playing && chess.inCheck() && (
                        <p className="rounded-xl bg-error-container px-3 py-2 text-center text-xs font-bold text-on-error-container">
                            Şah! {turn === myColor ? 'Şahını kurtaracak bir hamle yap.' : ''}
                        </p>
                    )}

                    <MoveList san={san} />

                    {mySeat && room.status === 'bekliyor' && (
                        <p className="text-center text-[11px] text-on-surface-variant">
                            Renklerin: {myColor === 'w' ? 'beyaz' : 'siyah'} — beyaz başlar.
                        </p>
                    )}
                </aside>
            </div>
        </div>
    );
}

/** "Hazırım" düğmesi; iki taraf da bastığında oyun kendiliğinden başlar. */
function ReadyButton({
    room,
    myColor,
    code,
}: {
    room: ChessRoom;
    myColor: PieceColor | null;
    code: string;
}) {
    const [busy, setBusy] = useState(false);
    if (!myColor) return null;
    const mine = myColor === 'w' ? room.white : room.black;
    const other = myColor === 'w' ? room.black : room.white;
    const ready = Boolean(mine?.ready);

    return (
        <button
            type="button"
            disabled={busy}
            onClick={async () => {
                setBusy(true);
                try {
                    await setReady(code, mine!.id, !ready);
                } finally {
                    setBusy(false);
                }
            }}
            className={cn(
                'mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold transition',
                ready
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-primary text-on-primary hover:brightness-105'
            )}
        >
            {ready
                ? other?.ready
                    ? 'Başlıyor…'
                    : 'Hazırsın — rakip bekleniyor'
                : 'Hazırım, başlayalım'}
        </button>
    );
}
