import { useEffect, useState } from 'react';
import { browserSessionPersistence, onAuthStateChanged, setPersistence, signInAnonymously, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Eye, EyeOff, GraduationCap, Monitor, ShieldCheck } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { SessionContext, type Session } from '../../contexts/SessionContext';
import { isStudentLink, isChessLink } from '../../utils/auth';

export function PasswordGate({ children }: { children: React.ReactNode }) {
    const publicLink = isStudentLink() || isChessLink();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [mode, setMode] = useState<'board' | 'admin'>('board');
    const [email, setEmail] = useState(import.meta.env.VITE_BOARD_EMAIL || '');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    useEffect(() => {
        let generation = 0;
        const unsub = onAuthStateChanged(auth, async user => {
            const current = ++generation;
            setLoading(true);
            try {
                if (!user) {
                    setSession(null);
                    if (publicLink) {
                        await setPersistence(auth, browserSessionPersistence);
                        await signInAnonymously(auth);
                        return;
                    }
                } else if (publicLink) {
                    setSession({ user, role: 'student' });
                } else if (!user.isAnonymous) {
                    const profile = await getDoc(doc(db, 'users', user.uid));
                    if (current !== generation) return;
                    const role = profile.data()?.role;
                    if (profile.data()?.active === true && (role === 'admin' || role === 'board')) {
                        setSession({ user, role });
                    } else {
                        setSession(null);
                        setError('Hesabınıza henüz erişim yetkisi verilmemiş. Yönetici kurulumu tamamlanmalı.');
                    }
                } else setSession(null);
            } catch {
                if (current === generation) {
                    setSession(null);
                    setError('Giriş hizmetine ulaşılamadı. İnternet bağlantısını ve Firebase giriş ayarlarını kontrol edin.');
                }
            } finally { if (current === generation) setLoading(false); }
        });
        return () => { generation++; unsub(); };
    }, [publicLink]);

    const login = async (e: React.FormEvent) => {
        e.preventDefault(); setBusy(true); setError(''); setNotice('');
        try {
            await setPersistence(auth, browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email.trim(), password);
            setPassword('');
        } catch (err) {
            const code = (err as { code?: string }).code;
            setError(code === 'auth/too-many-requests' ? 'Çok fazla deneme yapıldı. Bir süre sonra yeniden deneyin.' : code === 'auth/operation-not-allowed' ? 'Firebase konsolunda E-posta/Şifre girişi etkinleştirilmeli.' : 'Giriş yapılamadı. E-posta, şifre ve internet bağlantınızı kontrol edin.');
        } finally { setBusy(false); }
    };
    if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-600" role="status">Oturum kontrol ediliyor…</div>;
    if (session) return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
    return <main className="min-h-screen grid lg:grid-cols-2 bg-[#f6f7fb] font-sans">
        <section className="hidden lg:flex flex-col justify-between p-16 bg-[#142c36] text-white">
            <div className="flex items-center gap-3 font-semibold"><GraduationCap size={30} /> Ahmet Duyar · Atölye</div>
            <div><span className="text-emerald-300 text-sm tracking-widest">HER SINIFIN KENDİ HİKÂYESİ</span><h1 className="text-5xl leading-tight font-semibold mt-5 mb-6">Ders biter.<br />Çalışmalar kalır.</h1><p className="text-slate-300 max-w-md text-lg leading-relaxed">Sınıfınızı açın, kaldığınız yerden devam edin. Defterleriniz ve ders sonuçlarınız aynı yerde.</p></div>
            <p className="text-sm text-slate-400">Sınıflar · Etkinlikler · Defterler · Sonuçlar</p>
        </section>
        <section className="flex items-center justify-center p-6"><form onSubmit={login} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="w-12 h-12 grid place-items-center rounded-2xl bg-teal-50 text-teal-700"><GraduationCap /></div>
            <div><h1 className="text-2xl font-bold text-slate-900">Atölyeye hoş geldiniz</h1><p className="text-sm text-slate-500 mt-2">Derse başlamak için güvenli giriş yapın.</p></div>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">{(['board', 'admin'] as const).map(m => <button type="button" key={m} onClick={() => { setMode(m); setEmail(m === 'board' ? import.meta.env.VITE_BOARD_EMAIL || '' : ''); }} className={`flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold ${mode === m ? 'bg-white shadow-sm text-teal-800' : 'text-slate-500'}`}>{m === 'admin' ? <ShieldCheck size={17}/> : <Monitor size={17}/>} {m === 'admin' ? 'Yönetici' : 'Sınıf tahtası'}</button>)}</div>
            <label className="block text-sm font-medium text-slate-700">{mode === 'admin' ? 'Yönetici e-postası' : 'Tahta hesabı e-postası'}<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border-slate-200 p-3" /></label>
            <label className="block text-sm font-medium text-slate-700">Şifre<span className="flex mt-2 border border-slate-200 rounded-xl overflow-hidden"><input required type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border-0 p-3 focus:ring-0"/><button type="button" className="px-3" aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
            {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
            {notice && <p role="status" className="text-sm text-teal-700">{notice}</p>}
            <button disabled={busy} className="w-full bg-teal-800 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50">{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
            <button type="button" disabled={busy} className="w-full text-sm text-slate-500" onClick={async () => { if (!email.trim()) { setError('Önce e-posta adresinizi yazın.'); return; } setBusy(true); try { await sendPasswordResetEmail(auth, email.trim()); setNotice('Hesabınız varsa şifre yenileme bağlantısı e-postanıza gönderildi.'); setError(''); } catch { setError('Şifre yenileme isteği gönderilemedi.'); } finally { setBusy(false); } }}>Şifremi unuttum</button>
            {auth.currentUser && <button type="button" className="w-full text-sm text-slate-500" onClick={() => void signOut(auth)}>Başka hesapla giriş yap</button>}
            <p className="text-xs text-slate-400 leading-relaxed">Ortak tahtalarda oturum bu tarayıcı oturumu boyunca açık kalır. Ders sonunda çıkış yapabilirsiniz.</p>
        </form></section>
    </main>;
}
