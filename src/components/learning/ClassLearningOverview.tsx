import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Activity } from '../../types';
import { useLearning, LEARNING_LABELS } from '../../lib/learning';
import { useCloudChess } from '../../lib/chess/adminCloud';
import type { ClassRoom } from '../../types';
export function ClassLearningOverview({ classroom }: { classroom: ClassRoom }) {
    const { assignments, results, ready, error } = useLearning(classroom.id);
    const chess = useCloudChess(classroom.id);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activityError, setActivityError] = useState('');
    useEffect(() => onSnapshot(collection(db, 'activities'), snapshot => setActivities(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Activity))), e => setActivityError(e.message)), []);
    const active = assignments.filter(a => a.active);
    return <section className="mb-10 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-extrabold">Sınıf çalışmaları ve satranç durumu</h3><a href={`/?view=ogrenci&classId=${encodeURIComponent(classroom.id)}`} className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">Öğrenci çalışma alanına giriş</a></div>
        {(error || chess.error) && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error || chess.error}</p>}
        <p role="status" className="text-xs font-bold text-slate-500">{ready && chess.ready ? 'Çevrimiçi · Güncel' : 'Sunucudan güncel sınıf kayıtları bekleniyor…'}</p>
        <div className="grid grid-cols-3 gap-3">{[['Çalışma', active.length], ['Kayıtlı maç', chess.matches.length], ['Turnuva', chess.tournaments.length]].map(([label, count]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4"><strong className="text-2xl">{count}</strong><p className="text-xs text-slate-500">{label}</p></div>)}</div>
        <div className="grid gap-3 sm:grid-cols-2">{active.map(a => <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4"><span className="text-xs font-bold text-indigo-600">{LEARNING_LABELS[a.kind]}</span><h4 className="mt-1 font-bold">{a.title}</h4><p className="mt-2 text-sm text-slate-500">{a.description}</p><p className="mt-2 text-xs font-semibold text-emerald-700">{results.filter(r => r.assignmentId === a.id && r.status === 'completed').length} öğrenci tamamladı · {a.studentIds.length ? 'Belirli öğrencilere atanmış' : 'Tüm sınıfa atanmış'}</p></div>)}</div>
        {activityError && <p role="alert" className="text-sm text-red-700">{activityError}</p>}
        {classroom.assignedActivities?.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-4"><h4 className="font-bold">Sınıfa tanımlanan etkinlikler</h4><div className="mt-3 flex flex-wrap gap-2">{activities.filter(a => classroom.assignedActivities.includes(a.id)).map(a => <a key={a.id} href={`/?view=student&id=${encodeURIComponent(a.id)}`} className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">{a.title}</a>)}</div></div>}
        {chess.tournaments.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-4"><h4 className="font-bold">Sınıf turnuvaları</h4>{chess.tournaments.map(t => <p key={t.id} className="mt-2 text-sm text-slate-600">{t.name} · {t.rounds?.length || 0} tur · {t.finished ? 'Tamamlandı' : 'Devam ediyor'}</p>)}</div>}
        {chess.matches.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-4"><h4 className="font-bold">Son karşılaşmalar</h4>{[...chess.matches].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8).map(m => <p key={m.id} className="mt-2 text-sm text-slate-600">{classroom.students.find(s => s.id === m.whiteId)?.name || m.whiteName || 'Rakip'} — {classroom.students.find(s => s.id === m.blackId)?.name || m.blackName || 'Rakip'} · <strong>{m.result}</strong></p>)}</div>}
    </section>;
}
