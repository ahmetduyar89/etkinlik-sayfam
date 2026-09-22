import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { Archive, ArrowRight, BookOpen, CheckCircle2, GraduationCap, LayoutGrid, Library, LogOut, Monitor, Plus, Search, Settings2, Users } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useSession } from '../../contexts/SessionContext';
import type { Classroom } from '../../contexts/ClassroomContext';
import { GRADE_LEVELS } from '../../constants/education';
import { lockApp } from '../../utils/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastProvider';
import type { Notebook, Submission } from '../../types';
import { useConfirm } from '../common/ConfirmDialog';

const field = 'mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50';
const academicYear = () => { const d = new Date(); const y = d.getFullYear() - (d.getMonth() < 7 ? 1 : 0); return `${y}–${y + 1}`; };
const date = (s?: string | null) => s ? new Date(s).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : 'Henüz çalışma yok';
interface Work { id: string; title: string; updated_at: string; completed?: boolean; answers?: Record<string, unknown>; }

export function ClassroomDashboard() {
    const { role, user } = useSession();
    const admin = role === 'admin';
    const toast = useToast();
    const confirm = useConfirm();
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [editing, setEditing] = useState<Partial<Classroom> | null>(null);
    const [saving, setSaving] = useState(false);
    const [report, setReport] = useState<Classroom | null>(null);
    useEffect(() => {
        const ref = collection(db, 'classrooms');
        return onSnapshot(admin ? ref : query(ref, where('archived', '==', false)), snap => {
            setClasses(snap.docs.map(d => ({ ...d.data(), id: d.id } as Classroom))); setLoading(false); setError('');
        }, () => { setLoading(false); setError('Sınıflar yüklenemedi. İnternet bağlantısını ve veritabanı erişim kurallarını kontrol edin.'); });
    }, [admin]);
    const visible = useMemo(() => classes.filter(c => c.archived === showArchived && `${c.name} ${c.school_year}`.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))).sort((a,b) => a.name.localeCompare(b.name, 'tr', { numeric: true })), [classes, showArchived, search]);
    const seed = async () => {
        setSaving(true);
        try {
            const batch = writeBatch(db);
            const year = academicYear();
            for (const grade of GRADE_LEVELS) {
                const id = `grade-${grade}-${year.replace('–', '-')}`;
                if (classes.some(c => c.id === id || (c.grade_level === grade && c.name === `${grade}. Sınıf` && c.school_year === year))) continue;
                batch.set(doc(db, 'classrooms', id), { name: `${grade}. Sınıf`, grade_level: grade, school_year: year, archived: false, activity_ids: [], include_grade_content: true, created_at: new Date().toISOString() });
            }
            await batch.commit(); toast.success('Kayıtlı 5–12. sınıf düzeylerinin kartları hazır.');
        } catch { toast.error('Sınıflar oluşturulamadı. Lütfen tekrar deneyin.'); }
        finally { setSaving(false); }
    };
    const save = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editing?.name?.trim()) return; setSaving(true);
        try {
            const data = { name: editing.name.trim(), grade_level: editing.grade_level || '5', school_year: editing.school_year?.trim() || academicYear(), include_grade_content: editing.include_grade_content !== false };
            if (editing.id) await updateDoc(doc(db, 'classrooms', editing.id), data);
            else await addDoc(collection(db, 'classrooms'), { ...data, archived: false, activity_ids: [], created_at: new Date().toISOString() });
            setEditing(null); toast.success('Sınıf kaydedildi.');
        } catch { toast.error('Sınıf kaydedilemedi.'); } finally { setSaving(false); }
    };
    const archive = async (c: Classroom) => {
        if (!await confirm({ title: c.archived ? 'Sınıfı geri aç' : 'Sınıfı arşivle', message: c.archived ? `${c.name} yeniden tahtalarda listelenecek.` : `${c.name} tahtalardaki listeden kaldırılacak. Çalışmalar ve sonuçlar yönetim panelinde korunacak.`, confirmLabel: c.archived ? 'Geri aç' : 'Arşivle' })) return;
        try { await updateDoc(doc(db, 'classrooms', c.id), { archived: !c.archived }); } catch { toast.error('Sınıf güncellenemedi.'); }
    };
    return <main className="min-h-screen bg-[#f5f7f8] text-slate-800 font-sans">
        <header className="bg-white border-b border-slate-200 px-5 md:px-10 py-5 flex flex-wrap justify-between gap-4 items-center"><a href="/" className="flex gap-3 items-center font-bold text-lg"><span className="p-2.5 bg-teal-800 text-white rounded-xl"><GraduationCap/></span>Ahmet Duyar <span className="text-slate-400 font-normal hidden sm:inline">/ Atölye</span></a><div className="flex gap-3 items-center"><span className="text-xs rounded-full bg-teal-50 text-teal-800 px-3 py-2 font-semibold">{admin ? 'Yönetici' : 'Sınıf tahtası'}</span><button className={`${button} text-slate-500 hover:bg-slate-100`} onClick={() => void lockApp()}><LogOut size={17}/> Çıkış</button></div></header>
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
            <div className="flex flex-wrap gap-5 items-end justify-between mb-8"><div><p className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-3">{admin ? 'YÖNETİM PANELİ' : 'DERS ALANI'}</p><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Sınıflarım</h1><p className="text-slate-500 mt-3">{admin ? 'Tüm sınıflarınız, çalışmalarınız ve sonuçlarınız bir arada.' : 'Sınıfınızı seçin. Dersinize kaldığınız yerden devam edin.'}</p></div>{admin && <div className="flex flex-wrap gap-2"><a href="/?workspace=library" className={`${button} border border-slate-200 bg-white`}><Library size={18}/> Ortak arşiv</a><button onClick={() => setEditing({ grade_level: '5', school_year: academicYear(), include_grade_content: true })} className={`${button} bg-teal-800 text-white`}><Plus size={18}/> Sınıf ekle</button></div>}</div>
            <section className="rounded-3xl bg-[#142c36] text-white p-7 sm:p-9 mb-8 flex justify-between items-center gap-4"><div><p className="text-teal-200 text-sm mb-2">{academicYear()} eğitim yılı</p><h2 className="text-xl sm:text-2xl font-semibold">Her sınıf için ayrı bir çalışma alanı.</h2><p className="text-slate-300 text-sm mt-3 max-w-xl leading-relaxed">Etkinlik notları ve defterler seçtiğiniz sınıfa kaydedilir. Farklı bir tahtadan açtığınızda buluttaki son çalışmanıza ulaşabilirsiniz.</p></div><div className="hidden sm:block text-right shrink-0"><strong className="text-5xl font-semibold">{classes.filter(c => !c.archived).length}</strong><p className="mt-2 text-sm text-teal-200">aktif sınıf</p></div></section>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-5"><div className="flex gap-2 items-center"><LayoutGrid size={19} className="text-teal-700"/><h2 className="font-semibold">{showArchived ? 'Arşivlenen sınıflar' : 'Sınıf seçin'}</h2><span className="text-xs bg-slate-200 rounded-full px-2 py-1">{visible.length}</span></div><div className="flex flex-wrap gap-3">{admin && <button className="text-sm text-slate-500" onClick={() => setShowArchived(v => !v)}>{showArchived ? 'Aktif sınıflar' : 'Arşivi göster'}</button>}<label className="flex items-center gap-2 bg-white border border-slate-200 px-3 rounded-xl"><Search size={17} className="text-slate-400"/><input aria-label="Sınıf ara" placeholder="Sınıf ara…" value={search} onChange={e => setSearch(e.target.value)} className="border-0 bg-transparent py-3 text-sm focus:ring-0 w-40"/></label></div></div>
            {error && <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700">{error}</p>}
            {loading ? <p role="status" className="py-16 text-center text-slate-500">Sınıflar yükleniyor…</p> : !error && <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{visible.map(c => <ClassCard key={c.id} classroom={c} admin={admin} onEdit={() => setEditing(c)} onReport={() => setReport(c)} onArchive={() => void archive(c)}/>)}</div>}
            {!loading && !error && visible.length === 0 && <div className="bg-white border border-dashed border-slate-300 rounded-3xl text-center p-12 mt-4"><Users className="mx-auto text-slate-300 mb-4" size={40}/><h3 className="text-lg font-semibold">{classes.length ? 'Bu görünümde sınıf yok' : 'Sınıflarınızı hazırlayalım'}</h3><p className="text-slate-500 text-sm mt-2 mb-5">{admin ? 'Kayıtlı tüm sınıf düzeylerini ekleyebilir veya 7-A gibi bir şube oluşturabilirsiniz.' : 'Yöneticiniz sınıfları oluşturduğunda burada görünecek.'}</p>{admin && !showArchived && <button disabled={saving} onClick={() => void seed()} className={`${button} bg-teal-800 text-white`}>{saving ? 'Hazırlanıyor…' : 'Kayıtlı tüm sınıfları ekle (5–12)'}</button>}</div>}
            {admin && classes.length > 0 && <button onClick={() => void seed()} disabled={saving} className="mt-6 text-sm text-slate-500 underline">Eksik kayıtlı sınıf düzeylerini ekle (5–12)</button>}
            <p className="mt-10 text-xs text-slate-400">{user?.email} · Sınıf değiştirirken açık çalışmanızı kaydedip kapatın.</p>
        </div>
        <Modal isOpen={!!editing} onClose={() => { if (!saving) setEditing(null); }} title={editing?.id ? 'Sınıfı düzenle' : 'Yeni sınıf'}>{editing && <form onSubmit={save} className="space-y-4"><label className="block text-sm font-medium">Sınıf adı<input required maxLength={60} autoFocus className={field} placeholder="Örn. 7-A" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}/></label><div className="grid grid-cols-2 gap-4"><label className="text-sm font-medium">Sınıf düzeyi<select className={field} value={editing.grade_level} onChange={e => setEditing({ ...editing, grade_level: e.target.value })}>{GRADE_LEVELS.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}</select></label><label className="text-sm font-medium">Eğitim yılı<input required maxLength={30} className={field} value={editing.school_year} onChange={e => setEditing({ ...editing, school_year: e.target.value })}/></label></div><label className="flex gap-3 text-sm items-start bg-teal-50 rounded-xl p-4"><input type="checkbox" checked={editing.include_grade_content !== false} onChange={e => setEditing({ ...editing, include_grade_content: e.target.checked })}/><span>Bu sınıf düzeyindeki içerikleri otomatik göster.<small className="block mt-1 text-slate-500">Kapalıyken sadece sınıfa ayrıca atadığınız içerikler görünür.</small></span></label><button disabled={saving} className={`${button} bg-teal-800 text-white w-full`}>{saving ? 'Kaydediliyor…' : 'Sınıfı kaydet'}</button></form>}</Modal>
        {report && <ClassReport classroom={report} onClose={() => setReport(null)}/>}
    </main>;
}
function ClassCard({ classroom: c, admin, onEdit, onReport, onArchive }: { classroom: Classroom; admin: boolean; onEdit: () => void; onReport: () => void; onArchive: () => void }) {
    const [works, setWorks] = useState<Work[]>([]);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(0);
    useEffect(() => {
        const work = onSnapshot(collection(db, 'classrooms', c.id, 'activity_work'), s => { setWorks(s.docs.map(d => ({ ...d.data(), id: d.id } as Work))); setLoaded(v => v | 1); }, () => setError(true));
        const books = onSnapshot(collection(db, 'classrooms', c.id, 'notebooks'), s => { setNotebooks(s.docs.map(d => ({ ...d.data(), id: d.id } as Notebook))); setLoaded(v => v | 2); }, () => setError(true));
        return () => { work(); books(); };
    }, [c.id]);
    const latest = [...works.map(w => ({ title: w.title, at: w.updated_at, href: `/etkinlikler?class=${c.id}&activity=${encodeURIComponent(w.id)}` })), ...notebooks.map(n => ({ title: n.title, at: n.updated_at || '', href: `/defterlerim?class=${c.id}&notebook=${encodeURIComponent(n.id)}` }))].sort((a,b) => b.at.localeCompare(a.at))[0];
    return <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"><div className="p-5"><div className="flex justify-between items-center mb-5"><span className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 grid place-items-center font-bold text-lg">{c.grade_level}</span>{admin && <button onClick={onEdit} aria-label={`${c.name} sınıfını düzenle`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Settings2 size={18}/></button>}</div><h3 className="font-bold text-xl">{c.name}</h3><p className="text-xs text-slate-400 mt-1">{c.school_year} · {c.include_grade_content ? 'Düzeye uygun içerikler' : 'Atanan içerikler'}</p><div className="flex gap-3 text-xs text-slate-500 mt-5 mb-5"><span className="flex items-center gap-1"><BookOpen size={14}/>{loaded === 3 ? notebooks.length : '…'} defter</span><span className="flex items-center gap-1"><CheckCircle2 size={14}/>{loaded === 3 ? works.filter(w => w.completed).length : '…'} tamamlanan</span></div><div className="border-t border-slate-100 pt-4 min-h-[82px]"><p className="text-[11px] text-slate-400 mb-1">SON ÇALIŞMA</p>{error ? <p className="text-xs text-red-600">Çalışma bilgisi alınamadı.</p> : <><p className="text-sm font-medium truncate">{latest?.title || (loaded === 3 ? 'İlk dersinizi başlatın' : 'Yükleniyor…')}</p><p className="text-xs text-slate-400 mt-1">{date(latest?.at)}</p></>}</div></div><div className="px-5 pb-5 space-y-2"><a className={`${button} bg-teal-800 text-white w-full`} href={`/?class=${c.id}`}><Monitor size={16}/> Sınıfı aç <ArrowRight size={16}/></a>{latest && !error && <a href={latest.href} className="block text-center text-sm py-2 text-teal-700">Kaldığın yerden devam et</a>}{admin && <div className="flex justify-between pt-2"><button onClick={onReport} className="text-xs font-semibold text-slate-500">Çalışmalar ve sonuçlar</button><button onClick={onArchive} className="text-xs text-slate-400 flex gap-1 items-center"><Archive size={13}/>{c.archived ? 'Geri aç' : 'Arşivle'}</button></div>}</div></article>;
}
function ClassReport({ classroom: c, onClose }: { classroom: Classroom; onClose: () => void }) {
    const [results, setResults] = useState<Submission[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [error, setError] = useState('');
    const [loaded, setLoaded] = useState(0);
    useEffect(() => {
        const fail = () => setError('Rapor yüklenemedi. Lütfen yeniden açın.');
        const a = onSnapshot(collection(db, 'classrooms', c.id, 'submissions'), s => { setResults(s.docs.map(d => ({ ...d.data(), id: d.id } as Submission))); setLoaded(v => v | 1); }, fail);
        const b = onSnapshot(collection(db, 'classrooms', c.id, 'activity_work'), s => { setWorks(s.docs.map(d => ({ ...d.data(), id: d.id } as Work))); setLoaded(v => v | 2); }, fail);
        return () => { a(); b(); };
    }, [c.id]);
    return <Modal isOpen onClose={onClose} title={`${c.name} · Çalışmalar ve sonuçlar`}><div className="space-y-6">{error && <p role="alert" className="text-red-600">{error}</p>}{loaded !== 3 && !error && <p role="status">Rapor yükleniyor…</p>}<section><h3 className="font-semibold mb-3">Etkinlik çalışmaları</h3>{works.sort((a,b) => b.updated_at.localeCompare(a.updated_at)).map(w => <a key={w.id} href={`/etkinlikler?class=${c.id}&activity=${encodeURIComponent(w.id)}`} className="flex justify-between gap-3 border-b py-3 text-sm"><span>{w.title}{Object.keys(w.answers || {}).length > 0 && <small className="block mt-1 text-slate-500 break-words">{Object.entries(w.answers || {}).map(([k,v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ')}</small>}<small className="block text-slate-400 mt-1">{date(w.updated_at)}</small></span><span className="text-teal-700">{w.completed ? 'Tamamlandı' : 'Devam ediyor'} →</span></a>)}{loaded === 3 && !works.length && <p className="text-sm text-slate-400">Henüz etkinlik çalışması yok.</p>}</section><section><h3 className="font-semibold mb-3">Öğrenci sonuçları ({results.length})</h3>{results.sort((a,b) => (b.started_at || '').localeCompare(a.started_at || '')).map(s => <div key={s.id} className="border border-slate-200 rounded-xl p-4 mb-3 text-sm"><div className="flex justify-between gap-3"><strong>{s.student_name}</strong><span className="text-xs text-slate-500">{s.submitted_at ? 'Teslim edildi' : 'Devam ediyor'}</span></div><p className="text-xs text-slate-400 mt-1">{works.find(w => w.id === s.activity_id)?.title || s.activity_id} · {date(s.submitted_at || s.started_at)}</p><dl className="mt-3 space-y-1 break-words">{Object.entries(s.answers || {}).map(([k,v]) => <div key={k}><dt className="inline font-medium">{k}: </dt><dd className="inline">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd></div>)}</dl></div>)}{loaded === 3 && !results.length && <p className="text-sm text-slate-400">Henüz öğrenci teslimi yok. Sınıfın içinden paylaşılan etkinlik bağlantıları bu sınıfa kaydedilir.</p>}</section><a href={`/defterlerim?class=${c.id}`} className={`${button} bg-teal-50 text-teal-800 w-full`}><BookOpen size={17}/> Sınıfın defterlerini incele</a></div></Modal>;
}
