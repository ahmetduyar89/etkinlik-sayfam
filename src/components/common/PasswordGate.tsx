// src/components/common/PasswordGate.tsx — Rol Bazlı Giriş Ekranı (Admin & Sınıf)
// ─────────────────────────────────────────────────────────────────────
// Öğretmen/Admin kendi şifresiyle girdiğinde tüm sistemi görür.
// Bir sınıfa ait kullanıcı adı ve şifre ile girildiğinde ise doğrudan o sınıfa
// atanmış etkinlikleri, deneyleri ve satrancı içeren sınıf panosu açılır.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Eye, EyeOff, School, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
    APP_PASSWORD,
    FIREBASE_ADMIN_EMAIL,
    AUTH_STORAGE_KEY,
    SESSION_STORAGE_KEY,
    isAuthenticated,
    getSession,
    isChessLink,
    isStudentLink,
    saveSession,
} from '../../utils/auth';
import { auth } from '../../lib/firebase';
import { bootstrapTeacherRole, fetchDocById, signInClass } from '../../lib/firebase';
import { readQrScan } from '../../lib/qrLogin';
import { QrLoginApproval, QrLoginDisplay } from './QrLogin';

interface PasswordGateProps {
    children: React.ReactNode;
}

type LoginTab = 'admin' | 'class';

export function PasswordGate({ children }: PasswordGateProps) {
    const secureAdminEnabled = Boolean(FIREBASE_ADMIN_EMAIL);
    const [isUnlocked, setIsUnlocked] = useState(() => secureAdminEnabled ? false : isAuthenticated());
    const [authReady, setAuthReady] = useState(false);
    const [qrScan, setQrScan] = useState(readQrScan);
    useEffect(() => {
        const sync = () => setQrScan(readQrScan());
        window.addEventListener('hashchange', sync);
        return () => window.removeEventListener('hashchange', sync);
    }, []);
    const [tab, setTab] = useState<LoginTab>('admin');

    // Admin form fields
    const [adminPassword, setAdminPassword] = useState('');

    // Class form fields
    const [classUsername, setClassUsername] = useState('');
    const [classPassword, setClassPassword] = useState('');

    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Başka bir sekmede çıkış/giriş yapılırsa bu sekme de güncellensin.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === AUTH_STORAGE_KEY || e.key === SESSION_STORAGE_KEY) {
                window.location.reload();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Firebase is the authority for both teacher and class identities.
    useEffect(() => {
        let revision = 0;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const current = ++revision;
            const finish = (unlocked: boolean) => {
                if (revision === current) { setIsUnlocked(unlocked); setAuthReady(true); }
            };
            if (!user) {
                finish(!secureAdminEnabled && getSession()?.role === 'admin');
                return;
            }
            try {
                const token = await user.getIdTokenResult();
                const role = token.claims.role;
                if (role === 'teacher' || (secureAdminEnabled && user.email === FIREBASE_ADMIN_EMAIL)) {
                    if (role !== 'teacher') await bootstrapTeacherRole();
                    if (revision !== current) return;
                    saveSession({ role: 'admin', username: user.email || 'admin' });
                    finish(true);
                } else if (role === 'class' && typeof token.claims.classId === 'string') {
                    const classRoom = await fetchDocById<{ name: string; username: string }>('classes', token.claims.classId);
                    if (revision !== current) return;
                    if (!classRoom) { finish(false); return; }
                    saveSession({ role: 'class', classId: token.claims.classId,
                        className: classRoom.name, username: classRoom.username });
                    finish(true);
                } else {
                    finish(false);
                }
            } catch {
                finish(false);
            }
        });
        return () => { revision += 1; unsubscribe(); };
    }, [secureAdminEnabled]);

    const handleAdminSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            const trimmed = adminPassword.trim();
            if (secureAdminEnabled) {
                if (!trimmed) {
                    setError('Yönetici şifresini girin.');
                    return;
                }
                setIsLoading(true);
                try {
                    await setPersistence(auth, browserLocalPersistence);
                    const credential = await signInWithEmailAndPassword(auth, FIREBASE_ADMIN_EMAIL, trimmed);
                    await bootstrapTeacherRole();
                    saveSession({ role: 'admin', username: credential.user.email || 'admin' }, 'local');
                    setIsUnlocked(true);
                } catch {
                    setError('Yönetici şifresi hatalı veya oturum açılamadı.');
                } finally {
                    setIsLoading(false);
                }
                return;
            }
            if (trimmed !== APP_PASSWORD) {
                setError('Yönetici şifresi hatalı, tekrar deneyin.');
                return;
            }

            saveSession({ role: 'admin', username: 'admin' });
            setIsUnlocked(true);
        },
        [adminPassword, secureAdminEnabled]
    );

    const handleClassSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            const u = classUsername.trim().toLowerCase();
            const p = classPassword.trim();

            if (!u || !p) {
                setError('Lütfen kullanıcı adı ve şifreyi girin.');
                return;
            }

            setIsLoading(true);
            try {
                await setPersistence(auth, browserLocalPersistence);
                const matched = await signInClass(u, p);
                saveSession({
                    role: 'class',
                    classId: matched.classId,
                    className: matched.className,
                    username: matched.username,
                }, 'local');
                setIsUnlocked(true);
            } catch (err: unknown) {
                console.error('Giriş doğrulama hatası:', err);
                setError('Giriş yapılırken bir sorun oluştu.');
            } finally {
                setIsLoading(false);
            }
        },
        [classUsername, classPassword]
    );

    if (!authReady && !isStudentLink() && !isChessLink()) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" aria-label="Oturum kontrol ediliyor" />
            </div>
        );
    }

    if (isUnlocked && qrScan) return <QrLoginApproval scan={qrScan} />;
    if (isUnlocked || isStudentLink() || isChessLink()) return <>{children}</>;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="w-full max-w-[400px] bg-white border border-slate-200/80 rounded-[28px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-6 sm:p-8 flex flex-col items-center">
                {/* Logo & Başlık */}
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center mb-3.5 shadow-sm">
                    {tab === 'admin' ? (
                        <ShieldCheck className="w-7 h-7" aria-hidden="true" />
                    ) : (
                        <School className="w-7 h-7" aria-hidden="true" />
                    )}
                </div>

                <h1 className="text-[21px] font-extrabold text-slate-900 tracking-tight font-headline-md text-center">
                    Ahmet <span className="text-indigo-600">DUYAR</span>
                </h1>
                <p className="text-[13px] text-slate-500 mb-6 text-center">
                    Eğitim & Etkinlik Atölyesi
                </p>

                {qrScan && <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">Tahtadaki girişi onaylamak için önce telefonunda kullanmak istediğin hesaba giriş yap.</p>}

                {/* Sekme Değiştirici */}
                <div className="w-full grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl mb-5 text-[13px] font-semibold text-slate-600">
                    <button
                        type="button"
                        onClick={() => {
                            setTab('admin');
                            setError(null);
                        }}
                        className={cn(
                            'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5',
                            tab === 'admin'
                                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                                : 'hover:text-slate-900'
                        )}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Öğretmen
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTab('class');
                            setError(null);
                        }}
                        className={cn(
                            'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5',
                            tab === 'class'
                                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                                : 'hover:text-slate-900'
                        )}
                    >
                        <School className="w-4 h-4" />
                        Sınıf Girişi
                    </button>
                </div>

                {/* Öğretmen (Admin) Formu */}
                {tab === 'admin' && (
                    <form onSubmit={handleAdminSubmit} className="w-full flex flex-col gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 ml-1">
                                Yönetici Şifresi
                            </label>
                            <div
                                className={cn(
                                    'w-full flex items-center gap-2 rounded-2xl px-4 py-3 border-[1.5px] transition-all bg-slate-50',
                                    error
                                        ? 'border-red-400 bg-red-50/50 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.18)]'
                                        : 'border-slate-200 focus-within:bg-white focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.14)]'
                                )}
                            >
                                <Lock className="w-4 h-4 text-slate-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    inputMode="numeric"
                                    autoFocus
                                    value={adminPassword}
                                    onChange={(e) => {
                                        setAdminPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Şifreyi girin"
                                    className="flex-1 min-w-0 bg-transparent border-0 p-0 outline-none focus:ring-0 text-[15px] text-slate-800 placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-[12px] font-semibold text-red-500 px-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3 rounded-xl text-[14px] font-semibold shadow-[0_4px_14px_rgba(99,102,241,0.28)] flex items-center justify-center gap-2 transition-all"
                        >
                            Öğretmen Paneline Gir
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* Sınıf Giriş Formu */}
                {tab === 'class' && (
                    <form onSubmit={handleClassSubmit} className="w-full flex flex-col gap-3">
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 ml-1">
                                Sınıf Kullanıcı Adı
                            </label>
                            <div className="w-full flex items-center gap-2 rounded-2xl px-4 py-3 border-[1.5px] border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.14)] transition-all">
                                <School className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    value={classUsername}
                                    onChange={(e) => {
                                        setClassUsername(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Örn: 4a, 3b"
                                    className="flex-1 min-w-0 bg-transparent border-0 p-0 outline-none focus:ring-0 text-[14.5px] text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 ml-1">
                                Sınıf Şifresi
                            </label>
                            <div className="w-full flex items-center gap-2 rounded-2xl px-4 py-3 border-[1.5px] border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.14)] transition-all">
                                <Lock className="w-4 h-4 text-slate-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={classPassword}
                                    onChange={(e) => {
                                        setClassPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Sınıf şifresi"
                                    className="flex-1 min-w-0 bg-transparent border-0 p-0 outline-none focus:ring-0 text-[14.5px] text-slate-800 placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-[12px] font-semibold text-red-500 px-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 text-white py-3 rounded-xl text-[14px] font-semibold shadow-[0_4px_14px_rgba(99,102,241,0.28)] flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Giriş yapılıyor…
                                </>
                            ) : (
                                <>
                                    Sınıf Çalışma Alanını Aç
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {!qrScan && <QrLoginDisplay />}

                <div className="mt-6 pt-5 border-t border-slate-100 w-full text-center">
                    <p className="text-[11.5px] text-slate-400">
                        {tab === 'admin'
                            ? 'Öğretmen şifresiyle giriş yaparak tüm modüllere ve sınıf yönetimine erişebilirsiniz.'
                            : 'Sınıfınıza tanımlanan satranç, deney ve etkinliklere erişmek için sınıf bilgilerini kullanın.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
