// src/components/chess/ChessArena.tsx — Canlı Satranç sayfasının kökü
// ─────────────────────────────────────────────────────────────────────
// Adres:  …/?view=satranc            → salon
//         …/?view=satranc&oda=1234   → doğrudan o masa
//
// Bu sayfa ŞİFRE İSTEMEZ (bkz. utils/auth.ts). Çocuğa gönderilen bağlantı
// tek dokunuşla açılsın diye giriş yerine tek soru vardır: "Adın soyadın ne?".
// Oturum tarayıcıda saklanır; ikinci girişte doğrudan salona düşülür.
//
// Üç ekran vardır: ad sorma · salon · masa (çevrimiçi ya da bilgisayara karşı).
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { Crown, Loader2, LogIn } from 'lucide-react';
import { ChessLobby } from './ChessLobby';
import { ChessTable } from './ChessTable';
import { ChessBotTable } from './ChessBotTable';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore';
import { StudentIdentityGate } from '../student/StudentIdentityGate';
import { auth, db, signInChessGuest } from '../../lib/firebase';
import {
    clearStudentSession,
    playerId,
    normalizeName,
    isValidName,
    readStudentSession,
    saveStudentSession,
    type ChessStudentSession,
} from '../../lib/chess/player';

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
    const [student, setStudent] = useState<ChessStudentSession | null>(readStudentSession);
    const [guestLogin, setGuestLogin] = useState(false);
    const [identityReady, setIdentityReady] = useState(false);
    const [screen, setScreen] = useState<Screen>(() => {
        const code = roomFromLocation();
        return code ? { kind: 'masa', code } : { kind: 'salon' };
    });

    // Sayfa başlığı, sınıfta açık duran sekmeler arasında ayırt edilsin diye.
    useEffect(() => {
        document.title = 'Canlı Satranç · Atölye';
    }, []);

    useEffect(() => {
        let revision = 0;
        const stop = onAuthStateChanged(auth, async user => {
            const current = ++revision;
            setIdentityReady(false);
            try {
                const token = user ? await user.getIdTokenResult() : null;
                if (token?.claims.role === 'student' && typeof token.claims.classId === 'string' && typeof token.claims.studentId === 'string') {
                    const classroom = await getDocFromServer(doc(db, 'classes', token.claims.classId));
                    const profile = classroom.data()?.students?.find((s: { id: string; active?: boolean }) => s.id === token.claims.studentId && s.active !== false);
                    if (!profile) throw new Error('Öğrenci kaydı bulunamadı.');
                    if (current !== revision) return;
                    const session = { classId: token.claims.classId, studentId: token.claims.studentId, studentName: profile.name };
                    saveStudentSession(session); setStudent(session);
                } else {
                    const saved = readStudentSession();
                    const valid = token?.claims.role === 'chessGuest' && saved && token.claims.studentId === saved.studentId && token.claims.classId === saved.classId;
                    if (current !== revision) return;
                    if (!valid) clearStudentSession();
                    setStudent(valid ? saved : null);
                }
            } catch { if (current === revision) { clearStudentSession(); setStudent(null); } }
            finally { if (current === revision) setIdentityReady(true); }
        });
        return () => { revision++; stop(); };
    }, []);

    // Öğretmen paneli ve salon çevrimiçi öğrencileri görebilsin diye kısa bir
    // yaşam sinyali bırakılır. Ad soyad hiçbir zaman bu belgeye yazılmaz.
    useEffect(() => {
        if (!student) return;
        const ref = doc(db, 'liveChessPresence', `${student.classId}--${student.studentId}`);
        const heartbeat = () => setDoc(ref, {
            studentId: student.studentId,
            studentName: student.studentName,
            classId: student.classId,
            status: 'online',
            lastSeenAt: serverTimestamp(),
        }, { merge: true }).catch(() => undefined);
        void heartbeat();
        const timer = window.setInterval(() => void heartbeat(), 30_000);
        return () => window.clearInterval(timer);
    }, [student]);

    const openRoom = useCallback((code: string) => {
        writeRoomToLocation(code);
        setScreen({ kind: 'masa', code });
    }, []);

    const backToLobby = useCallback(() => {
        writeRoomToLocation(null);
        setScreen({ kind: 'salon' });
    }, []);

    if (!identityReady) {
        return <div className="flex min-h-[100svh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Oyuncu oturumu kontrol ediliyor" /></div>;
    }

    if (!student && !guestLogin) {
        return <div><StudentIdentityGate title="Canlı satranç ve çalışmalarım" onAuthenticated={setStudent} expectedClassId={new URLSearchParams(location.search).get('classId') || undefined} /><div className="fixed bottom-4 left-0 right-0 text-center"><button type="button" onClick={() => setGuestLogin(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">Öğrenci kaydım yok · Misafir olarak oyna</button></div></div>;
    }
    if (!student) {
        return (
            <PlayerNameGate
                onAuthenticated={(session) => {
                    saveStudentSession(session);
                    setStudent(session);
                }}
                roomCode={screen.kind === 'masa' ? screen.code : null}
            />
        );
    }

    const id = student.studentId ? `${student.classId}:${student.studentId}` : playerId();
    const name = student.studentName;

    if (screen.kind === 'masa') {
        return (
            <ChessTable
                code={screen.code}
                playerId={id}
                studentId={student.studentId}
                playerName={name}
                classId={student.classId}
                onExit={backToLobby}
            />
        );
    }

    if (screen.kind === 'bot') {
        return <ChessBotTable trackResult={student.classId !== 'live-guests'} playerName={name} onExit={backToLobby} />;
    }

    return (
        <div>
        {student.classId !== 'live-guests' && <a href="/?view=ogrenci" className="mx-auto mt-4 block max-w-5xl rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">Sana tanımlanan çalışmalar ve sonuçların →</a>}
        <ChessLobby
            playerId={id}
            studentId={student.studentId}
            playerName={name}
            classId={student.classId}
            onOpenRoom={openRoom}
            onPlayBot={() => setScreen({ kind: 'bot' })}
            onChangeName={() => {
                clearStudentSession();
                void signOut(auth);
                setStudent(null);
            }}
        />
        </div>
    );
}

/** Tek soruluk giriş: ad soyad. */
function PlayerNameGate({
    onAuthenticated,
    roomCode,
}: {
    onAuthenticated: (session: ChessStudentSession) => void;
    roomCode: string | null;
}) {
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const ready = isValidName(fullName);

    const submit = async () => {
        if (!ready || loading) return;
        setLoading(true);
        setError(null);
        try {
            const result = await signInChessGuest(normalizeName(fullName));
            onAuthenticated(result);
        } catch {
            setError('Giriş yapılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[100svh] items-center justify-center px-4 py-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                }}
                className="w-full max-w-[380px] rounded-[22px] border border-outline-variant bg-surface p-5 sm:p-7 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                    <Crown className="h-7 w-7" aria-hidden="true" />
                </div>

                <h1 className="text-[20px] font-bold tracking-tight text-on-surface">
                    Canlı Satranç
                </h1>
                <p className="mt-1 text-[13px] text-on-surface-variant">
                    {roomCode
                        ? `${roomCode} numaralı masaya katılıyorsun. Adını ve soyadını yazarak giriş yap.`
                        : 'Adını ve soyadını yaz; oyun oluştur ya da arkadaşlarının oyununa katıl.'}
                </p>

                <label htmlFor="chess-name" className="sr-only">
                    Ad soyad
                </label>
                <input
                    id="chess-name"
                    value={fullName}
                    onChange={(e) => {
                        setFullName(e.target.value.slice(0, 80));
                        setError(null);
                    }}
                    autoFocus
                    autoComplete="name"
                    maxLength={80}
                    placeholder="Ad soyad"
                    className="mt-5 w-full rounded-2xl border-[1.5px] border-transparent bg-surface-container-high px-4 py-3 text-center text-base font-semibold text-on-surface outline-none transition focus:border-primary focus:bg-surface"
                />

                <button
                    type="submit"
                    disabled={!ready || loading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-on-primary shadow-[0_4px_12px_rgba(99,102,241,0.28)] transition hover:brightness-105 disabled:opacity-45 disabled:shadow-none"
                >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    {loading ? 'Kontrol ediliyor…' : 'Giriş yap'}
                </button>

                {error && <p className="mt-3 text-[12px] font-semibold text-red-600" role="alert">{error}</p>}
                <p className="mt-4 text-[11px] leading-snug text-on-surface-variant">
                    Ad soyadın oyunlarda diğer oyunculara görünür.
                </p>
            </form>
        </div>
    );
}
