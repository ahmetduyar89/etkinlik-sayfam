// src/components/chess/ChessLobby.tsx — Salon: masalar, kod ve bilgisayar
// ─────────────────────────────────────────────────────────────────────
// Adını yazan oyuncu buraya düşer. Üç yol vardır:
//   1) Açık masalardan birine dokunup oturmak
//   2) Yeni oyun oluşturup kodu/bağlantıyı arkadaşına göndermek
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
    pruneStaleRooms,
    readRoom,
    watchOpenRooms,
    type ChessRoom,
    type RoomKind,
    type TimeControlId,
} from '../../lib/chess/rooms';

interface ChessLobbyProps {
    playerId: string;
    studentId: string;
    playerName: string;
    classId: string;
    onOpenRoom: (code: string) => void;
    onPlayBot: () => void;
    onChangeName: () => void;
}

export function ChessLobby({
    playerId,
    studentId,
    playerName,
    classId,
    onOpenRoom,
    onPlayBot,
    onChangeName,
}: ChessLobbyProps) {
    const [mobileTab, setMobileTab] = useState<'requests' | 'live'>('requests');
    const [rooms, setRooms] = useState<ChessRoom[] | null>(null);
    /** Masa listesi alınamadı (internet yok ya da sunucuya ulaşılamıyor). */
    const [offline, setOffline] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [timeControl, setTimeControl] = useState<TimeControlId>('artisli10');
    const [minutes, setMinutes] = useState(10);
    const [increment, setIncrement] = useState(5);
    const [allowDraw, setAllowDraw] = useState(true);
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
                studentId,
                name: playerName,
                classId,
                kind,
                timeControl,
                minutes,
                increment,
                allowDraw,
                color,
            });
            onOpenRoom(room.code);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Masa kurulamadı.');
        } finally {
            setBusy(false);
        }
    }, [playerId, studentId, playerName, classId, kind, timeControl, minutes, increment, allowDraw, color, onOpenRoom, toast]);

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
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Oyuna ulaşılamadı.');
        } finally {
            setBusy(false);
        }
    }, [joinCode, onOpenRoom, toast]);

    const waiting = (rooms ?? []).filter((r) => r.status === 'bekliyor');
    const running = (rooms ?? []).filter((r) => r.status === 'oynaniyor');

    return (
        <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <header className="mb-4 flex flex-wrap sm:mb-6 items-center justify-between gap-3">
                <div className="min-w-0 flex-1 basis-52">
                    <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                        Canlı Satranç
                    </h1>
                    <p className="mt-0.5 break-words text-sm text-on-surface-variant">
                        Merhaba <strong className="text-on-surface">{playerName}</strong> — bir
                        masaya otur ya da kendi masanı kur.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onChangeName}
                    className="min-h-11 shrink-0 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-semibold text-on-surface-variant transition hover:text-on-surface"
                >
                    Oyuncu değiştir
                </button>
            </header>

            <nav aria-label="Satranç salonu bölümleri" className="sticky top-0 z-20 mb-4 grid grid-cols-2 gap-2 bg-background py-2 lg:hidden">
                {([['requests', 'Oyun istekleri', waiting.length], ['live', 'Canlı oyunlar', running.length]] as const).map(([value, label, count]) => (
                    <button key={value} type="button" aria-pressed={mobileTab === value} aria-controls={value === 'requests' ? 'chess-requests' : 'chess-live-games'} onClick={() => setMobileTab(value)}
                        className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-sm font-bold', mobileTab === value ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-surface text-on-surface-variant')}>
                        {label}<span className="rounded-full bg-current/10 px-1.5 text-xs">{count}</span>
                    </button>
                ))}
            </nav>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* ── Açık masalar ── */}
                <section id="chess-requests" className={cn("min-w-0 lg:block", mobileTab !== "requests" && "hidden")}>
                    <div className="mb-2.5 flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                        <h2 className="text-sm font-bold text-on-surface">Oyun istekleri</h2>
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
                                    : 'Henüz oyun isteği yok.'}
                            </p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                                {offline
                                    ? 'İnternet bağlantını kontrol et. Bilgisayara karşı oyun internet olmadan da çalışır.'
                                    : 'Masa kurup arkadaşını çağırabilir ya da bilgisayara karşı oynayabilirsin.'}
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-2">
                            {waiting.map((room) => (
                                <RoomCard key={room.id} room={room} onOpen={onOpenRoom} />
                            ))}
                        </ul>
                    )}

                {/* ── Masa kur / koda katıl / bilgisayar ── */}
                <div className="mt-5 flex flex-col gap-3">
                    <div className="rounded-2xl border border-outline-variant bg-surface p-4">
                        <h2 className="text-sm font-bold text-on-surface">Yeni oyun oluştur</h2>

                        <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                            Süre
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {TIME_CONTROLS.map((tc) => (
                                <button
                                    key={tc.id}
                                    type="button"
                                    onClick={() => { setTimeControl(tc.id); setMinutes(tc.initial_ms / 60_000); setIncrement(tc.increment_ms / 1_000); }}
                                    className={cn(
                                        'min-h-11 rounded-xl px-2 py-2 text-xs font-bold transition',
                                        minutes * 60_000 === tc.initial_ms && (minutes === 0 || increment * 1_000 === tc.increment_ms)
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                                    )}
                                >
                                    {tc.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <label className="text-xs text-on-surface-variant">Süre (dakika, 0 = süresiz)
                                <input type="number" min={0} max={180} step={1} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1 min-h-11 w-full min-w-0 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-base text-on-surface" />
                            </label>
                            <label className="text-xs text-on-surface-variant">Hamle başına ek saniye
                                <input type="number" min={0} max={60} step={1} value={increment} disabled={minutes === 0} onChange={(e) => setIncrement(Number(e.target.value))} className="mt-1 min-h-11 w-full min-w-0 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-base text-on-surface disabled:opacity-50" />
                            </label>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">Standart satranç kuralları uygulanır: şah, mat, pat, rok, geçerken alma ve piyon terfisi.</p>
                        <label className="mt-3 flex min-h-11 items-center gap-3 text-xs text-on-surface-variant">
                            <input type="checkbox" checked={allowDraw} onChange={(e) => setAllowDraw(e.target.checked)} className="h-5 w-5 shrink-0 rounded border-outline text-primary" /> Beraberlik teklifine izin ver
                        </label>

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
                                        'min-h-11 rounded-xl px-2 py-2 text-xs font-bold transition',
                                        color === value
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <label className="mt-3 flex min-h-11 items-center gap-3 text-[12px] text-on-surface-variant">
                            <input
                                type="checkbox"
                                checked={kind === 'ozel'}
                                onChange={(e) => setKind(e.target.checked ? 'ozel' : 'acik')}
                                className="h-5 w-5 shrink-0 rounded border-outline text-primary focus:ring-primary"
                            />
                            Listede görünmesin, yalnızca kodla girilsin
                        </label>

                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={busy || offline || !Number.isInteger(minutes) || minutes < 0 || minutes > 180 || !Number.isInteger(increment) || increment < 0 || increment > 60}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition hover:brightness-105 disabled:opacity-60"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Oyun isteği oluştur
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
                                aria-label="Kodla oyuna katıl"
                                disabled={busy}
                                className="flex min-h-11 min-w-12 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-bold text-on-secondary transition hover:brightness-105 disabled:opacity-60"
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
                </div>
                </section>

                <aside id="chess-live-games" className={cn("min-w-0 lg:block", mobileTab !== "live" && "hidden")}>
                    <h2 className="mb-2.5 text-sm font-bold text-on-surface">Canlı oyunlar <span className="ml-2 text-xs text-on-surface-variant">{running.length}</span></h2>
                    {rooms === null ? (
                        <p className="rounded-2xl border border-outline-variant bg-surface p-8 text-sm text-on-surface-variant">Canlı oyunlar yükleniyor…</p>
                    ) : running.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-outline bg-surface p-8 text-center">
                            <p className="text-sm font-semibold text-on-surface">{offline ? 'Canlı oyunlara şu an ulaşılamıyor.' : 'Şu an devam eden oyun yok.'}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">Başlayan oyunlar burada görünür. Bir oyunu seçerek canlı izleyebilirsin.</p>
                        </div>
                    ) : (
                        <ul className="grid gap-2">{running.map((room) => <RoomCard key={room.id} room={room} onOpen={onOpenRoom} watching />)}</ul>
                    )}
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
    const full = Boolean(room.white && room.black);
    const freeColor: PieceColor = room.white ? 'b' : 'w';
    const minutes = room.clock ? Math.round(room.clock.initial_ms / 60_000) : 0;

    return (
        <li>
            <button
                type="button"
                onClick={() => onOpen(room.code)}
                className="grid w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-2xl border border-outline-variant bg-surface p-3 text-left transition hover:border-primary hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)]"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high">
                    <ChessPiece
                        type={watching ? 'q' : 'p'}
                        color={watching ? 'b' : freeColor}
                        className="block h-6 w-6 [&>svg]:h-full [&>svg]:w-full"
                    />
                </span>
                <span className="col-span-2 min-w-0">
                    <span className="block truncate text-sm font-bold text-on-surface">
                        {watching
                            ? `${room.white?.name ?? 'Beyaz'} — ${room.black?.name ?? 'Siyah'}`
                            : (host?.name ?? 'Oyuncu')}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-on-surface-variant">
                        {watching
                            ? `${room.moves.length} hamle oynandı`
                            : `${full ? 'İki oyuncu katıldı' : `${freeColor === 'w' ? 'Beyaz' : 'Siyah'} koltuğu boş`} · ${
                                  minutes > 0 ? `${minutes} dk + ${(room.clock?.increment_ms ?? 0) / 1000} sn` : 'süresiz'
                              }`}
                    </span>
                </span>
                <span className="col-start-2 row-start-2 min-h-8 text-xs font-bold text-primary">{watching ? 'Canlı izle' : full ? 'Masayı aç' : 'Oyuna katıl'}</span>
                <span className="col-start-3 row-start-2 self-start rounded-lg bg-surface-container-high px-2 py-1 font-mono text-[11px] font-bold tracking-widest text-on-surface-variant">
                    {room.code}
                </span>
            </button>
        </li>
    );
}
