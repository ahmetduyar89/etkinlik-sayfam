import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { ClassResourceCards } from '../learning/ClassResourceCards';
import { ArrowLeft, CheckCircle2, Crown, Loader2, LogOut, Play } from 'lucide-react';
import { db } from '../../lib/firebase';
import { assignmentUrl, completeLearningAssignment, LEARNING_LABELS, startLearningAssignment, useLearning } from '../../lib/learning';
import { StudentIdentityGate } from './StudentIdentityGate';
import { useStudentIdentity } from '../../lib/studentIdentity';
import { lockApp } from '../../utils/auth';
import { clearStudentSession } from '../../lib/chess/player';
import { useToast } from '../common/ToastProvider';
import type { ClassRoom } from '../../types';
import type { LearningAssignment } from '../../types/learning';

export function StudentWorkspace() {
    const { student, loading, error: identityError } = useStudentIdentity();
    const { assignments, results, ready, error } = useLearning(student?.classId, student?.studentId);
    const [classroom, setClassroom] = useState<ClassRoom | null>(null);
    const [classReady, setClassReady] = useState(false);
    const [classError, setClassError] = useState('');
    const [busy, setBusy] = useState<string | null>(null);
    const [opened, setOpened] = useState<LearningAssignment | null>(null);
    const [matchCount, setMatchCount] = useState(0);
    const [offline, setOffline] = useState(!navigator.onLine);
    const toast = useToast();
    useEffect(() => {
        const sync = () => setOffline(!navigator.onLine);
        window.addEventListener('online', sync); window.addEventListener('offline', sync);
        return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync); };
    }, []);
    useEffect(() => {
        setClassroom(null); setClassReady(false); setClassError('');
        if (!student) return;
        const stop = onSnapshot(doc(db, 'classes', student.classId), { includeMetadataChanges: true }, snapshot => {
            setClassReady(!snapshot.metadata.fromCache);
            if (!snapshot.metadata.fromCache) {
                const data = snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as ClassRoom : null;
                setClassroom(data);
                setClassError(data?.students.some(s => s.id === student.studentId && s.active !== false) ? '' : 'Öğrenci kaydı artık etkin değil. Öğretmeninizle iletişime geçin.');
            }
        }, e => setClassError(e.message));
        const games = onSnapshot(query(collection(db, 'chess_matches'), where('classId', '==', student.classId)), snapshot => setMatchCount(snapshot.docs.filter(d => d.data().whiteId === student.studentId || d.data().blackId === student.studentId).length), e => setClassError(e.message));
        return () => { stop(); games(); };
    }, [student]);
    const open = async (item: LearningAssignment) => {
        if (!ready || offline || busy) return;
        setBusy(item.id);
        try {
            await startLearningAssignment(item.id);
            if (item.kind === 'experiment' || item.kind === 'notebook') setOpened(item);
            else location.href = assignmentUrl(item);
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Çalışma açılamadı.'); }
        finally { setBusy(null); }
    };
    if (loading) return <div className="flex min-h-[100svh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" aria-label="Öğrenci oturumu kontrol ediliyor" /></div>;
    if (!student) return <><StudentIdentityGate expectedClassId={new URLSearchParams(location.search).get('classId') || undefined} />{identityError && <p role="alert" className="fixed bottom-4 left-4 right-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{identityError}</p>}</>;
    const visible = assignments.filter(a => a.active && (!a.studentIds.length || a.studentIds.includes(student.studentId)));
    const online = ready && classReady && !offline && !error && !classError;
    return <div className="min-h-[100svh] bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white p-4"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-extrabold">{classroom?.students.find(s => s.id === student.studentId)?.name || student.studentName}</h1><p className="text-xs text-slate-500">{classroom?.name || 'Öğrenci çalışma alanı'}</p></div><div className="flex gap-2"><a href="/?view=satranc" className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-100 px-4 text-sm font-bold text-amber-900"><Crown className="h-4 w-4" /> Canlı satranç</a><button onClick={() => { clearStudentSession(); lockApp(); }} className="rounded-xl border border-slate-200 p-3" aria-label="Çıkış yap"><LogOut className="h-4 w-4" /></button></div></div></header>
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-7">
            <p role="status" className={`rounded-xl p-3 text-sm font-semibold ${online ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{error || classError || (offline ? 'İnternet bağlantısı yok. Kayıt için yeniden bağlanın.' : online ? 'Çevrimiçi · Çalışmalar ve sonuçlar güncel' : 'Sunucudan güncel çalışmalar bekleniyor…')}</p>
            <div className="grid grid-cols-3 gap-3">{[['Atanmış çalışma', visible.length], ['Tamamlanan', results.filter(r => r.status === 'completed').length], ['Satranç maçı', matchCount]].map(([label, count]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4"><strong className="block text-2xl">{count}</strong><span className="text-xs text-slate-500">{label}</span></div>)}</div>
            {opened && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 p-4"><h2 className="font-bold">{opened.title}</h2><div className="flex gap-2"><button onClick={() => setOpened(null)} className="rounded-xl border px-3 py-2 text-sm"><ArrowLeft className="mr-1 inline h-4 w-4" /> Çalışmalarıma dön</button><button disabled={!online || Boolean(busy)} onClick={async () => { setBusy(opened.id); try { await completeLearningAssignment(opened.id); toast.success('Tamamlandı bilgisi öğretmeninize gönderildi.'); setOpened(null); } catch (e) { toast.error(e instanceof Error ? e.message : 'Sonuç kaydedilemedi.'); } finally { setBusy(null); } }} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Çalışmamı tamamladım</button></div></div><iframe key={opened.id} title={opened.title} src={assignmentUrl(opened)} className="h-[70svh] w-full border-0" /></section>}
            <section><h2 className="mb-4 text-xl font-extrabold">Sana tanımlanan çalışmalar</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map(item => {
                const result = results.find(r => r.assignmentId === item.id);
                return <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"><span className="text-xs font-bold text-indigo-600">{LEARNING_LABELS[item.kind]}</span><h3 className="mt-2 text-lg font-bold">{item.title}</h3><p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-slate-500">{item.description}</p>{item.dueAt && <p className="mt-3 text-xs text-slate-500">Son tarih: {new Date(item.dueAt).toLocaleString('tr-TR')}</p>}<p className={`mt-3 flex items-center gap-1 text-xs font-bold ${result?.status === 'completed' ? 'text-emerald-700' : 'text-slate-500'}`}>{result?.status === 'completed' && <CheckCircle2 className="h-4 w-4" />}{result?.status === 'completed' ? 'Tamamlandı' : result ? 'Devam ediyor' : 'Başlamadın'}</p><button disabled={!online || Boolean(busy)} onClick={() => void open(item)} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white disabled:opacity-50">{busy === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}{result ? 'Çalışmayı aç' : 'Başla'}</button></article>;
            })}</div>{online && !visible.length && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Öğretmenin çalışma atadığında burada görünecek.</p>}</section>
            <ClassResourceCards classroom={classroom} />
        </main>
    </div>;
}
