import { useEffect, useState } from 'react';
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { db } from '../../lib/firebase';
import type { Classroom } from '../../contexts/ClassroomContext';
import { useSession } from '../../contexts/SessionContext';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastProvider';
export function AssignActivityButton({ activityId }: { activityId: string }) {
    const { role } = useSession();
    const [open, setOpen] = useState(false);
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();
    useEffect(() => {
        if (!open) return;
        return onSnapshot(collection(db, 'classrooms'), s => setClasses(s.docs.map(d => ({ ...d.data(), id: d.id } as Classroom)).filter(c => !c.archived)), () => setError('Sınıflar yüklenemedi.'));
    }, [open]);
    if (role !== 'admin') return null;
    return <span onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}><button aria-label="Sınıfa ata" title="Sınıfa ata" className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50" onClick={() => setOpen(true)}><Users size={20}/></button><Modal isOpen={open} onClose={() => setOpen(false)} title="Etkinliği sınıflara ata"><p className="text-sm text-slate-500 mb-4">Seçilen sınıflarda bu etkinlik görünür. Her sınıfın çalışması ayrı kaydedilir. Sınıf düzeyiyle otomatik gelen içerikler bundan bağımsızdır.</p>{error && <p role="alert">{error}</p>}{classes.map(c => <label key={c.id} className="flex gap-3 items-center border-b py-3"><input type="checkbox" disabled={busy} checked={c.activity_ids.includes(activityId)} onChange={async e => { const checked = e.target.checked; setBusy(true); try { await updateDoc(doc(db, 'classrooms', c.id), { activity_ids: checked ? arrayUnion(activityId) : arrayRemove(activityId) }); } catch { toast.error('İçerik ataması kaydedilemedi.'); } finally { setBusy(false); } }}/>{c.name}</label>)}</Modal></span>;
}
