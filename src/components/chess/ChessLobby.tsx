// src/components/chess/ChessLobby.tsx — Salon: masalar, kod ve bilgisayar
// ─────────────────────────────────────────────────────────────────────
// Adını yazan oyuncu buraya düşer. Üç yol vardır:
//   1) Açık masalardan birine dokunup oturmak
//   2) Yeni masa kurup kodu/bağlantıyı arkadaşına göndermek
//   3) Rakip yoksa bilgisayara karşı oynamak
//
// Masa listesi canlıdır: biri masa kurduğunda liste kendiliğinden büyür,
// sekmesini kapatanın masası bir buçuk dakika içinde listeden düşer.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { Bot, LogIn, Loader2, Plus, Users } from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { useToast } from '../common/ToastProvider';
import { cn } from '../../utils/cn';
import type { PieceColor } from '../../lib/chess/engine/Chess';
import {
    TIME_CONTROLS,
    createRoom,
    hasFreeSeat,
    pruneStaleRooms,
    readRoom,
    watchOpenRooms,
    type ChessRoom,
    type RoomKind,
    type TimeControlId,
} from '../../lib/chess/rooms';

interface ChessLobbyProps {
    playerId: string;
    playerName: string;
    onOpenRoom: (code: string) => void;
    onPlayBot: () => void;
    onChangeName: () => void;
}

export function ChessLobby({
    playerId,
    playerName,
    onOpenRoom,
    onPlayBot,
    onChangeName,
}: ChessLobbyProps) {
    const [rooms, setRooms] = useState<ChessRoom[] | null>(null);
    /** Masa listesi alınamadı (internet yok ya da sunucuya ulaşılamıyor). */
    const [offline, setOffline] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [timeControl, setTimeControl] = useState<TimeControlId>('artisli10');
    const [kind, setKind] = useState<RoomKind>('acik');
    const [color, setColor] = useState<PieceColor | 'rastgele'>('rastgele');
    const toast = useToast();

    useEffect(() => {
        void pruneStaleRooms();
        const stop = watchOpenRooms(
            (next) => {
                setRooms(next);
                setOffline(false);
            },
            () => {
                setRooms([]);
                setOffline(true);
            }
        );

        // İnternet yokken Firestore hata vermez, sessizce bekler. Beklemeyi
        // ekranda bırakmamak için kısa bir süre sonra boş listeye düşeriz;
        // bağlantı geri gelince dinleyici zaten listeyi doldurur.
        const timer = window.setTimeout(() => {
            setRooms((current) => {
                if (current !== null) return current;
                setOffline(true);
                return [];
            });
        }, 8000);

        return () => {
            stop();
            window.clearTimeout(timer);
        };
    }, []);

    const handleCreate = useCallback(async () => {
        setBusy(true);
        try {
            const room = await createRoom({
                id: playerId,
                name: playerName,
                kind,
                timeControl,
                color,
            });
            onOpenRoom(room.code);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Masa kurulamadı.');
        } finally {
            setBusy(false);
        }
    }, [playerId, playerName, kind, timeControl, color, onOpenRoom, toast]);

    const handleJoinByCode = useCallback(async () => {
        const code = joinCode.replace(/\D/g, '').slice(0, 4);
        if (code.length !== 4) {
            toast.error('Masa kodu dört rakamdır.');
            return;
        }
        setBusy(true);
        try {
            const room = await readRoom(code);
            if (!room) {
                toast.error('Bu kodla bir masa bulunamadı.');
                return;
            }
            onOpenRoom(code);
        } finally {
            setBusy(false);
        }
    }, [joinCode, onOpenRoom, toast]);

    const waiting = (rooms ?? []).filter((r) => hasFreeSeat(r));
    const running = (rooms ?? []).filter((r) => !hasFreeSeat(r));

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                        Canlı Satranç
                    </h1>
                    <p className="mt-0.5 text-sm text-on-surface-variant">
                        Merhaba <strong className="text-on-surface">{playerName}</strong> — bir
                        masaya otur ya da kendi masanı kur.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onChangeName}
                    className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-semibold text-on-surface-variant transition hover:text-on-surface"
                >
                    Adı değiştir
                </button>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                {/* ── Açık masalar ── */}
                <section>
                    <div className="mb-2.5 flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                        <h2 className="text-sm font-bold text-on-surface">Oyuna hazır masalar</h2>
                        {rooms !== null && (
                            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
                                {waiting.length}
                            </span>
                        )}
                    </div>

                    {rooms === null ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface p-8 text-sm text-on-surface-variant">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Masalar yükleniyor…
                        </div>
                    ) : waiting.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-outline bg-surface p-8 text-center">
                            <p className="text-sm font-semibold text-on-surface">
                                {offline
                                    ? 'Masalara şu an ulaşılamıyor.'
                                    : 'Şu an bekleyen masa yok.'}
                            </p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                                {offline
                                    ? 'İnternet bağlantını kontrol et. Bilgisayara karşı oyun internet olmadan da çalışır.'
                                    : 'Masa kurup arkadaşını çağırabilir ya da bilgisayara karşı oynayabilirsin.'}
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {waiting.map((room) => (
                                <RoomCard key={room.id} room={room} onOpen={onOpenRoom} />
                            ))}
                        </ul>
                    )}

                    {running.length > 0 && (
                        <>
                            <h2 className="mb-2.5 mt-6 text-sm font-bold text-on-surface">
                                Süren maçlar
                                <span className="ml-2 text-xs font-medium text-on-surface-variant">
                                    izleyebilirsin
                                </span>
                            </h2>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {running.map((room) => (
                                    <RoomCard key={room.id} room={room} onOpen={onOpenRoom} watching />
                                ))}
                            </ul>
                        </>
                    )}
                </section>

                {/* ── Masa kur / koda katıl / bilgisayar ── */}
                <aside className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                        <h2 className="text-sm font-bold text-on-surface">Yeni masa kur</h2>

                        <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                            Süre
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {TIME_CONTROLS.map((tc) => (
                                <button
                                    key={tc.id}
                                    type="button"
                                    onClick={() => setTimeControl(tc.id)}
                                    className={cn(
                                        'rounded-xl px-2 py-2 text-[11px] font-bold transition',
                                        timeControl === tc.id
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                                    )}
                                >
                                    {tc.label}
                                </button>
                            ))}
                        </div>

                        <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                            Rengin
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(
                                [
                                    ['rastgele', 'Rastgele'],
                                    ['w', 'Beyaz'],
                                    ['b', 'Siyah'],
                                ] as [PieceColor | 'rastgele', string][]
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setColor(value)}
                                    className={cn(
                                        'rounded-xl px-2 py-2 text-[11px] font-bold transition',
                                        color === value
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <label className="mt-3 flex items-center gap-2 text-[12px] text-on-surface-variant">
                            <input
                                type="checkbox"
                                checked={kind === 'ozel'}
                                onChange={(e) => setKind(e.target.checked ? 'ozel' : 'acik')}
                                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
                            />
                            Listede görünmesin, yalnızca kodla girilsin
                        </label>

                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={busy}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition hover:brightness-105 disabled:opacity-60"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Masayı kur
                        </button>
                    </div>

                    <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                        <h2 className="text-sm font-bold text-on-surface">Kodla katıl</h2>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">
                            Arkadaşının masasının dört haneli kodu.
                        </p>
                        <div className="mt-2.5 flex gap-2">
                            <input
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={(e) => e.key === 'Enter' && void handleJoinByCode()}
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="1234"
                                aria-label="Masa kodu"
                                className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-center font-mono text-lg font-bold tracking-[0.3em] text-on-surface outline-none focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={handleJoinByCode}
                                disabled={busy}
                                className="flex items-center justify-center rounded-xl bg-secondary px-4 text-sm font-bold text-on-secondary transition hover:brightness-105 disabled:opacity-60"
                            >
                                <LogIn className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onPlayBot}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface px-4 py-3.5 text-sm font-bold text-on-surface transition hover:border-primary hover:text-primary"
                    >
                        <Bot className="h-4 w-4" aria-hidden="true" />
                        Bilgisayara karşı oyna
                    </button>
                </aside>
            </div>
        </div>
    );
}

/** Salondaki tek bir masa kartı. */
function RoomCard({
    room,
    onOpen,
    watching = false,
}: {
    room: ChessRoom;
    onOpen: (code: string) => void;
    watching?: boolean;
}) {
    const host = room.white ?? room.black;
    const freeColor: PieceColor = room.white ? 'b' : 'w';
    const minutes = room.clock ? Math.round(room.clock.initial_ms / 60_000) : 0;

    return (
        <li>
            <button
                type="button"
                onClick={() => onOpen(room.code)}
                className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3 text-left transition hover:border-primary hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)]"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high">
                    <ChessPiece
                        type={watching ? 'q' : 'p'}
                        color={watching ? 'b' : freeColor}
                        className="block h-6 w-6 [&>svg]:h-full [&>svg]:w-full"
                    />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-on-surface">
                        {watching
                            ? `${room.white?.name ?? 'Beyaz'} — ${room.black?.name ?? 'Siyah'}`
                            : (host?.name ?? 'Oyuncu')}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-on-surface-variant">
                        {watching
                            ? `${room.moves.length} hamle oynandı`
                            : `${freeColor === 'w' ? 'Beyaz' : 'Siyah'} koltuğu boş · ${
                                  minutes > 0 ? `${minutes} dk` : 'süresiz'
                              }`}
                    </span>
                </span>
                <span className="shrink-0 rounded-lg bg-surface-container-high px-2 py-1 font-mono text-[11px] font-bold tracking-widest text-on-surface-variant">
                    {room.code}
                </span>
            </button>
        </li>
    );
}
