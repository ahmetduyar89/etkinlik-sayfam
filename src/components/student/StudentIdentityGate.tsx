import { useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { signInStudent } from '../../lib/firebase';
import { saveSession } from '../../utils/auth';
import { saveStudentSession, type ChessStudentSession } from '../../lib/chess/player';


export function StudentIdentityGate({ onAuthenticated, expectedClassId, title = 'Öğrenci çalışma alanı' }: {
    onAuthenticated?: (student: ChessStudentSession) => void;
    expectedClassId?: string;
    title?: string;
}) {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); setBusy(true); setError('');
        try {
            const session = await signInStudent(number, { name, classId: expectedClassId });
            saveStudentSession(session); saveSession({ role: 'student', ...session }); onAuthenticated?.(session);
        } catch (e) { setError(e instanceof Error ? e.message : 'Giriş yapılamadı. Bilgilerinizi ve bağlantınızı kontrol edin.'); }
        finally { setBusy(false); }
    };
    return <div className="flex min-h-[100svh] items-center justify-center bg-slate-50 px-4 py-8"><form onSubmit={e => void submit(e)} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <Crown className="mb-4 h-9 w-9 text-indigo-600" /><h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Öğretmeninizin tanımladığı ad soyad ve öğrenci numarasıyla giriş yapın. Çalışmalarınız ve sonuçlarınız kendi kaydınıza bağlanır.</p>
        <label className="mt-5 block text-sm font-bold text-slate-700">Ad soyad<input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80} className="mt-1 min-h-12 w-full rounded-xl border border-slate-200 px-3" /></label>
        <label className="mt-4 block text-sm font-bold text-slate-700">Öğrenci numarası<input required inputMode="numeric" autoComplete="username" value={number} onChange={e => setNumber(e.target.value.replace(/\D/g, '').slice(0, 20))} className="mt-1 min-h-12 w-full rounded-xl border border-slate-200 px-3" /></label>
        {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={busy || !name.trim() || !number} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Doğrulanıyor…' : 'Giriş yap'}</button>
        <a href="/" className="mt-4 block text-center text-sm text-slate-500">Öğretmen / sınıf girişine dön</a>
    </form></div>;
}
