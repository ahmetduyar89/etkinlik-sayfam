import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PORTAL_MODULES } from '../../constants/portal';
import { findExperimentByFile } from '../../constants/experiments';
import type { Activity, ClassRoom, Notebook } from '../../types';
export function ClassResourceCards({ classroom }: { classroom: ClassRoom | null }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [error, setError] = useState('');
    useEffect(() => {
        const a = onSnapshot(collection(db, 'activities'), s => setActivities(s.docs.map(d => ({ ...d.data(), id: d.id } as Activity))), e => setError(e.message));
        const n = onSnapshot(collection(db, 'notebooks'), s => setNotebooks(s.docs.map(d => ({ ...d.data(), id: d.id } as Notebook))), e => setError(e.message));
        return () => { a(); n(); };
    }, []);
    const links = [
        ...PORTAL_MODULES.filter(m => (classroom?.assignedModules || []).includes(m.id) && m.kind === 'static').map(m => ({ id: `module-${m.id}`, title: m.title, href: m.id === 'satranc' ? '/satranc/?returnTo=%2F%3Fview%3Dogrenci' : m.href })),
        ...activities.filter(a => classroom?.assignedActivities?.includes(a.id)).map(a => ({ id: `activity-${a.id}`, title: a.title, href: `/?view=student&id=${encodeURIComponent(a.id)}` })),
        ...notebooks.filter(n => classroom?.assignedNotebooks?.includes(n.id)).map(n => ({ id: `notebook-${n.id}`, title: n.title, href: `/?view=notebook&id=${encodeURIComponent(n.id)}` })),
        ...(classroom?.assignedExperiments || []).map(file => ({ id: `experiment-${file}`, title: findExperimentByFile(file)?.title || 'Sınıf deneyi', href: `/deneyler/${encodeURIComponent(file)}` })),
    ];
    return <section><h2 className="mb-3 text-xl font-extrabold">Sınıf çalışma alanları</h2>{error && <p role="alert" className="text-sm text-red-700">İçerikler alınamadı: {error}</p>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(link => <a key={link.id} href={link.href} className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-indigo-700">{link.title}</a>)}</div>{!links.length && <p className="text-sm text-slate-500">Sınıfa bölüm veya içerik atandığında burada görünür.</p>}</section>;
}
