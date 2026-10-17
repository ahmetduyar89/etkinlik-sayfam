import { useLearning } from '../../lib/learning';
import type { ClassRoom } from '../../types';
import type { useCloudChess } from '../../lib/chess/adminCloud';
export function StudentLearningReport({ classroom, studentId, cloud, onClose }: { classroom: ClassRoom; studentId: string; cloud: ReturnType<typeof useCloudChess>; onClose: () => void }) {
    const student = classroom.students.find(s => s.id === studentId);
    const { results, ready, error } = useLearning(classroom.id, studentId);
    const profile = cloud.progress.find(p => p.classId === classroom.id && p.profileId === `student:${studentId}`)?.progress;
    const matches = cloud.matches.filter(m => m.classId === classroom.id && (m.whiteId === studentId || m.blackId === studentId));
    const games = profile?.gamesArchive || [];
    return <section className="rounded-[28px] border border-indigo-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold">{student?.name} · Öğrenci kaydı</h3><button className="min-h-11 rounded-xl border px-3 text-sm" onClick={onClose}>Kapat</button></div>
        <p className="mt-2 text-sm text-slate-500">{classroom.name} · Öğrenci no: {student?.schoolNumber || 'Tanımlanmamış'} · {profile?.xp || 0} XP · {profile?.completedLessons?.length || 0} ders · {profile?.solvedPuzzles?.length || 0} bulmaca</p>
        <h4 className="mt-5 font-bold">Atanmış çalışmaların sonuçları</h4>{error && <p role="alert" className="text-red-700">{error}</p>}{!ready && <p className="text-sm text-slate-400">Sonuçlar sunucudan alınıyor…</p>}
        <div className="mt-3 space-y-2">{results.map(r => <p key={r.id} className="rounded-xl bg-slate-50 p-3 text-sm">{r.title} · <strong>{r.status === 'completed' ? 'Tamamlandı' : 'Devam ediyor'}</strong>{r.evidence?.best !== undefined ? ` · Puan: ${r.evidence.best}` : ''}</p>)}</div>
        <h4 className="mt-5 font-bold">Canlı maçlar ve turnuva karşılaşmaları ({matches.length})</h4><div className="mt-3 space-y-2">{matches.map(m => <p key={m.id} className="rounded-xl bg-slate-50 p-3 text-sm">{classroom.students.find(s => s.id === m.whiteId)?.name || m.whiteName || 'Rakip'} — {classroom.students.find(s => s.id === m.blackId)?.name || m.blackName || 'Rakip'} · <strong>{m.result}</strong>{m.date ? ` · ${new Date(m.date).toLocaleDateString('tr-TR')}` : ''}</p>)}</div>
        <h4 className="mt-5 font-bold">Bilgisayara karşı oyunlar ({games.length})</h4><div className="mt-3 space-y-2">{games.map(g => <p key={g.id} className="rounded-xl bg-slate-50 p-3 text-sm">{g.result === 'won' ? 'Kazandı' : g.result === 'lost' ? 'Kaybetti' : 'Berabere'} · {g.level?.id || 'Satranç'} · {g.moves?.length || 0} hamle{g.playedAt ? ` · ${new Date(g.playedAt).toLocaleString('tr-TR')}` : ''}</p>)}</div>
    </section>;
}
