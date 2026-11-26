import { useEffect, useState } from 'react';
import { ClipboardList, Copy, Loader2, Plus } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { archiveLearningAssignment, LEARNING_LABELS, MINI_GAME_OPTIONS, saveLearningAssignment, useLearning } from '../../lib/learning';
import { EXPERIMENTS_CATALOG } from '../../constants/experiments';
import { useToast } from '../common/ToastProvider';
import type { Activity, ClassRoom, Notebook } from '../../types';
import type { LearningKind } from '../../types/learning';

const field = 'min-w-0 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm';
export function AssignmentManager({ classroom }: { classroom: ClassRoom }) {
    const { assignments, results, ready, error } = useLearning(classroom.id);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [catalogError, setCatalogError] = useState('');
    const [kind, setKind] = useState<LearningKind>('chess-week');
    const [resourceId, setResourceId] = useState('week-1');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [studentId, setStudentId] = useState('');
    const [reportStudent, setReportStudent] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [busy, setBusy] = useState(false);
    const toast = useToast();
    useEffect(() => {
        const stopA = onSnapshot(collection(db, 'activities'), snapshot => setActivities(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Activity))), e => setCatalogError(e.message));
        const stopN = onSnapshot(collection(db, 'notebooks'), snapshot => setNotebooks(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Notebook))), e => setCatalogError(e.message));
        return () => { stopA(); stopN(); };
    }, []);
    const options: [string, string][] = kind === 'chess-week' ? Array.from({ length: 36 }, (_, i) => [`week-${i + 1}`, `${i + 1}. hafta satranç dersi`])
        : kind === 'chess-minigame' ? MINI_GAME_OPTIONS.map(([id, name]) => [id, name])
        : kind === 'chess-bot' ? [['all', 'Herhangi bir seviyede oyun'], ['kolay', 'Kolay seviye'], ['orta', 'Orta seviye'], ['zor', 'Zor seviye']]
        : kind === 'activity' ? activities.map(a => [a.id, a.title])
        : kind === 'notebook' ? notebooks.map(n => [n.id, n.title])
        : kind === 'experiment' ? EXPERIMENTS_CATALOG.map(e => [e.file, e.title]) : [];
    const effectiveResource = resourceId || options[0]?.[0] || '';
    const label = kind === 'chess-puzzle' ? `Satranç bulmacası ${effectiveResource.slice(7)}` : options.find(([id]) => id === effectiveResource)?.[1] || '';
    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (busy || !ready || !navigator.onLine) return;
        setBusy(true);
        try {
            await saveLearningAssignment({ classId: classroom.id, kind, resourceId: effectiveResource, title: title.trim() || label,
                description: description.trim(), studentIds: studentId ? [studentId] : [], dueAt: dueAt ? new Date(dueAt).toISOString() : null });
            toast.success('Çalışma atandı. Öğrenci ekranına canlı yansıyacak.');
            setTitle(''); setDescription('');
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Çalışma atanamadı.'); }
        finally { setBusy(false); }
    };
    const copyLink = async () => {
        try { await navigator.clipboard.writeText(`${location.origin}/?view=ogrenci&classId=${encodeURIComponent(classroom.id)}`); toast.success('Öğrenci giriş bağlantısı kopyalandı.'); }
        catch { toast.error('Bağlantı kopyalanamadı.'); }
    };
    const filtered = reportStudent ? results.filter(r => r.studentId === reportStudent) : results;
    return <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-extrabold"><ClipboardList className="h-5 w-5 text-indigo-600" /> Çalışma atama ve sonuçlar</h3>
            <button type="button" onClick={() => void copyLink()} className="flex min-h-11 items-center gap-2 rounded-xl bg-indigo-50 px-3 text-xs font-bold text-indigo-700"><Copy className="h-4 w-4" /> Öğrenci giriş bağlantısı</button>
        </div>
        <p className="mt-2 text-sm text-slate-500">Sınıfın tamamına veya tek öğrenciye çalışma tanımlayın. Başlama ve tamamlama durumları burada canlı görünür.</p>
        <p className={`mt-3 text-xs font-bold ${ready && !error ? 'text-emerald-700' : 'text-amber-700'}`} role="status">{error ? `Kayıtlar alınamadı: ${error}` : ready ? 'Çevrimiçi · Güncel' : 'Sunucudan güncel kayıtlar bekleniyor…'}</p>
        {catalogError && <p role="alert" className="text-sm text-red-700">Çalışma listesi alınamadı: {catalogError}</p>}
        <form onSubmit={event => void submit(event)} className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="min-w-0 text-xs font-bold text-slate-600">Çalışma türü<select className={field} value={kind} onChange={e => { const value = e.target.value as LearningKind; setKind(value); setResourceId(value === 'chess-week' ? 'week-1' : value === 'chess-puzzle' ? 'puzzle-0001' : ''); }}>
                {Object.entries(LEARNING_LABELS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select></label>
            <label className="min-w-0 text-xs font-bold text-slate-600">{kind === 'chess-puzzle' ? 'Bulmaca numarası (1–1934)' : 'Çalışma'}
                {kind === 'chess-puzzle' ? <input className={field} type="number" min={1} max={1934} value={Number(resourceId.slice(7)) || 1} onChange={e => setResourceId(`puzzle-${String(Math.max(1, Math.min(1934, Number(e.target.value)))).padStart(4, '0')}`)} /> :
                    <select className={field} value={effectiveResource} onChange={e => setResourceId(e.target.value)}>{!options.length && <option value="">Kayıt bulunamadı</option>}{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>}
            </label>
            <label className="min-w-0 text-xs font-bold text-slate-600">Kime atanacak?<select className={field} value={studentId} onChange={e => setStudentId(e.target.value)}><option value="">Tüm sınıf</option>{classroom.students.filter(s => s.active !== false).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label className="min-w-0 text-xs font-bold text-slate-600">Son tarih (isteğe bağlı)<input className={field} type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} /></label>
            <label className="min-w-0 text-xs font-bold text-slate-600 sm:col-span-2">Başlık<input className={field} value={title} maxLength={100} placeholder={label} onChange={e => setTitle(e.target.value)} /></label>
            <label className="min-w-0 text-xs font-bold text-slate-600 sm:col-span-2">Öğrenciye açıklama<textarea className={field} value={description} maxLength={1000} onChange={e => setDescription(e.target.value)} /></label>
            <button disabled={busy || !ready || Boolean(error) || !effectiveResource} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {busy ? 'Sunucuya kaydediliyor…' : 'Çalışmayı ata'}</button>
        </form>
        <div className="mt-6 space-y-3">{assignments.filter(a => a.active).map(a => {
            const own = results.filter(r => r.assignmentId === a.id);
            const completed = own.filter(r => r.status === 'completed').length;
            const total = a.studentIds.length || classroom.students.filter(s => s.active !== false).length;
            return <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 p-4"><div className="min-w-0 flex-1"><strong className="text-sm">{a.title}</strong><p className="mt-1 text-xs text-slate-500">{a.studentIds.length ? a.studentIds.map(id => classroom.students.find(s => s.id === id)?.name || 'Öğrenci').join(', ') : 'Tüm sınıf'} · {completed}/{total} tamamlandı · {own.filter(r => r.status === 'started').length} devam ediyor{a.dueAt ? ` · Son tarih: ${new Date(a.dueAt).toLocaleString('tr-TR')}` : ''}</p></div>
                <button type="button" disabled={busy || !ready} onClick={async () => { setBusy(true); try { await archiveLearningAssignment(a.id); toast.success('Çalışma kapatıldı. Geçmiş sonuçlar korunuyor.'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Çalışma kapatılamadı.'); } finally { setBusy(false); } }} className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 disabled:opacity-50">Atamayı kapat</button></div>;
        })}{ready && !assignments.some(a => a.active) && <p className="text-sm text-slate-400">Henüz çalışma atanmadı.</p>}</div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h4 className="font-bold">Öğrenci sonuçları</h4><select aria-label="Sonuçları öğrenciye göre filtrele" className={field + ' sm:!w-auto'} value={reportStudent} onChange={e => setReportStudent(e.target.value)}><option value="">Tüm öğrenciler</option>{classroom.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div className="mt-3 space-y-2">{filtered.map(r => <div key={r.id} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{r.studentName}</strong> · {r.title}<span className={`ml-2 text-xs font-bold ${r.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'}`}>{r.status === 'completed' ? 'Tamamlandı' : 'Devam ediyor'}</span>
            {r.evidence?.result && <p className="mt-1 text-xs text-slate-600">Oyun sonucu: {r.evidence.result === 'won' ? 'Kazandı' : r.evidence.result === 'lost' ? 'Kaybetti' : 'Berabere'} · {r.evidence.moves} hamle</p>}
            {r.evidence?.score !== undefined && <p className="mt-1 text-xs text-slate-600">Son oyun puanı: {r.evidence.score}</p>}
            {r.evidence?.best !== undefined && <p className="mt-1 text-xs text-slate-600">En iyi puan: {r.evidence.best}</p>}
            {r.evidence?.answers && <details className="mt-2"><summary className="cursor-pointer text-xs font-bold text-indigo-700">Test cevaplarını görüntüle</summary><pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(r.evidence.answers, null, 2)}</pre></details>}
            {r.completionSource === 'student-report' && <p className="mt-1 text-xs text-slate-500">Öğrenci çalışmayı tamamladığını bildirdi.</p>}
            {r.completedAt && <p className="mt-1 text-xs text-slate-400">{r.completedAt.toDate().toLocaleString('tr-TR')}</p>}
        </div>)}{ready && !filtered.length && <p className="text-sm text-slate-400">Öğrenci çalışmayı açtığında sonucu burada görünür.</p>}</div>
    </section>;
}
