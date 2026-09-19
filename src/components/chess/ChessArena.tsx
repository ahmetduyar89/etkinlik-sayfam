// src/components/chess/ChessArena.tsx — Canlı Satranç sayfasının kökü
// ─────────────────────────────────────────────────────────────────────
// Adres:  …/?view=satranc            → salon
//         …/?view=satranc&oda=1234   → doğrudan o masa
//
// Bu sayfa ŞİFRE İSTEMEZ (bkz. utils/auth.ts). Çocuğa gönderilen bağlantı
// tek dokunuşla açılsın diye giriş yerine tek soru vardır: "Adın ne?".
// Ad tarayıcıda saklanır; ikinci girişte doğrudan salona düşülür.
//
// Üç ekran vardır: ad sorma · salon · masa (çevrimiçi ya da bilgisayara karşı).
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { Crown, LogIn } from 'lucide-react';
import { ChessLobby } from './ChessLobby';
import { ChessTable } from './ChessTable';
import { ChessBotTable } from './ChessBotTable';
import { isValidName, normalizeName, playerId, readPlayerName, savePlayerName } from '../../lib/chess/player';

/** Adres çubuğundaki masa kodu (…&oda=1234). */
function roomFromLocation(): string | null {
    const code = new URLSearchParams(window.location.search).get('oda');
    return code && /^\d{4}$/.test(code) ? code : null;
}

/** Masa kodunu adrese yazar; sayfa yenilense de aynı masa açılır. */
function writeRoomToLocation(code: string | null): void {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'satranc');
    if (code) url.searchParams.set('oda', code);
    else url.searchParams.delete('oda');
    window.history.replaceState({}, '', url.toString());
}

type Screen = { kind: 'salon' } | { kind: 'masa'; code: string } | { kind: 'bot' };

export function ChessArena() {
    const [id] = useState(playerId);
    const [name, setName] = useState(readPlayerName);
    const [draft, setDraft] = useState(readPlayerName);
    const [screen, setScreen] = useState<Screen>(() => {
        const code = roomFromLocation();
        return code ? { kind: 'masa', code } : { kind: 'salon' };
    });

    // Sayfa başlığı, sınıfta açık duran sekmeler arasında ayırt edilsin diye.
    useEffect(() => {
        document.title = 'Canlı Satranç · Atölye';
    }, []);

    const openRoom = useCallback((code: string) => {
        writeRoomToLocation(code);
        setScreen({ kind: 'masa', code });
    }, []);

    const backToLobby = useCallback(() => {
        writeRoomToLocation(null);
        setScreen({ kind: 'salon' });
    }, []);

    if (!name) {
        return (
            <NameGate
                value={draft}
                onChange={setDraft}
                onSubmit={() => {
                    const clean = normalizeName(draft);
                    savePlayerName(clean);
                    setName(clean);
                }}
                roomCode={screen.kind === 'masa' ? screen.code : null}
            />
        );
    }

    if (screen.kind === 'masa') {
        return (
            <ChessTable
                code={screen.code}
                playerId={id}
                playerName={name}
                onExit={backToLobby}
            />
        );
    }

    if (screen.kind === 'bot') {
        return <ChessBotTable playerName={name} onExit={backToLobby} />;
    }

    return (
        <ChessLobby
            playerId={id}
            playerName={name}
            onOpenRoom={openRoom}
            onPlayBot={() => setScreen({ kind: 'bot' })}
            onChangeName={() => {
                setDraft(name);
                setName('');
            }}
        />
    );
}

/** Tek soruluk giriş: ad soyad. */
function NameGate({
    value,
    onChange,
    onSubmit,
    roomCode,
}: {
    value: string;
    onChange: (next: string) => void;
    onSubmit: () => void;
    roomCode: string | null;
}) {
    const ready = isValidName(value);
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (ready) onSubmit();
                }}
                className="w-full max-w-[380px] rounded-[22px] border border-outline-variant bg-surface p-7 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                    <Crown className="h-7 w-7" aria-hidden="true" />
                </div>

                <h1 className="text-[20px] font-bold tracking-tight text-on-surface">
                    Canlı Satranç
                </h1>
                <p className="mt-1 text-[13px] text-on-surface-variant">
                    {roomCode
                        ? `${roomCode} numaralı masaya katılıyorsun. Adını yaz, hemen başlayalım.`
                        : 'Adını yaz, arkadaşınla karşılıklı oyna ya da bilgisayara karşı dene.'}
                </p>

                <label htmlFor="chess-name" className="sr-only">
                    Ad soyad
                </label>
                <input
                    id="chess-name"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                    autoComplete="name"
                    maxLength={28}
                    placeholder="Ad Soyad"
                    className="mt-5 w-full rounded-2xl border-[1.5px] border-transparent bg-surface-container-high px-4 py-3 text-center text-[15px] font-semibold text-on-surface outline-none transition focus:border-primary focus:bg-surface"
                />

                <button
                    type="submit"
                    disabled={!ready}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-on-primary shadow-[0_4px_12px_rgba(99,102,241,0.28)] transition hover:brightness-105 disabled:opacity-45 disabled:shadow-none"
                >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Oyuna gir
                </button>

                <p className="mt-4 text-[11px] leading-snug text-on-surface-variant">
                    Adın yalnızca masadaki rakibine ve maçı izleyenlere görünür.
                </p>
            </form>
        </div>
    );
}
