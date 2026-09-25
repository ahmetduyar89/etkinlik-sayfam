import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpenCheck, Cloud, Crown, ExternalLink, School, Swords, Trophy, Users } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useClassrooms } from '../../lib/classrooms';
import type { ClassRoom } from '../../types/classroom';

interface CloudMatch {
    id: string;
    localId?: string;
    classId: string;
    whiteId: string;
    blackId: string;
    result: '1-0' | '0-1' | '1/2-1/2';
    date?: string;
}

interface CloudTournament {
    id: string;
    localId?: string;
    classId: string;
    name: string;
    finished?: boolean;
    rounds?: Array<unknown[]>;
    playerIds?: string[];
}

interface CloudProgress {
    id: string;
    classId: string;
    profileId: string;
    profileName?: string;
    progress?: {
        xp?: number;
        completedLessons?: string[];
        solvedPuzzles?: string[];
        puzzleStats?: Record<string, { solved?: number; wrong?: number; hints?: number }>;
    };
}

interface SyncDevice {
    id: string;
    classIds?: string[];
    activeClassId?: string;
    anonymous?: boolean;
    lastSeenAt?: { toDate?: () => Date };
}

const levelOf = (xp = 0) => Math.floor(xp / 120) + 1;
const pointsText = (points: number) => Number.isInteger(points) ? String(points) : `${Math.floor(points)}½`;

function useCloudChess() {
    const [matches, setMatches] = useState<CloudMatch[]>([]);
    const [tournaments, setTournaments] = useState<CloudTournament[]>([]);
    const [progress, setProgress] = useState<CloudProgress[]>([]);
    const [devices, setDevices] = useState<SyncDevice[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const watch = <T extends { id: string }>(name: string, setter: (items: T[]) => void) =>
            onSnapshot(collection(db, name), (snapshot) => {
                setter(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T)));
            }, (reason) => setError(reason.message));

        const stops = [
            watch<CloudMatch>('chess_matches', setMatches),
            watch<CloudTournament>('chess_tournaments', setTournaments),
            watch<CloudProgress>('chess_progress', setProgress),
            watch<SyncDevice>('chess_sync', setDevices),
        ];
        return () => stops.forEach((stop) => stop());
    }, []);

    return { matches, tournaments, progress, devices, error };
}

function chessUrl(classId: string, route: string) {
    return `/satranc/?classId=${encodeURIComponent(classId)}#/${route}`;
}

export function ChessAdminDashboard({ onBack }: { onBack: () => void }) {
    const { classes, loading } = useClassrooms();
    const cloud = useCloudChess();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = classes.find((item) => item.id === selectedId) || null;
    const activeDevices = cloud.devices.filter((device) => {
        if (!device.anonymous) return false;
        const seen = device.lastSeenAt?.toDate?.();
        return seen && Date.now() - seen.getTime() < 150_000;
    }).length;

    return (
        <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-5 py-4 sm:px-8">
                    <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
                        <ArrowLeft className="h-4 w-4" /> Atölye
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <Crown className="h-5 w-5 text-amber-500" />
                    <strong className="text-[17px]">Satranç Yönetimi</strong>
                    <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${cloud.error || !activeDevices ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        <Cloud className="h-3.5 w-3.5" /> {cloud.error ? 'Kurulum bekliyor' : activeDevices ? `${activeDevices} sınıf cihazı bağlı` : 'Sınıf bağlantısı bekleniyor'}
                    </span>
                </div>
            </header>

            <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
                <div className="mb-7">
                    <h1 className="text-3xl font-extrabold tracking-tight">Sınıfların satranç durumu</h1>
                    <p className="mt-2 text-sm text-slate-500">Sınıf bilgisayarlarından gelen ilerleme, maç ve turnuva sonuçları bu ekranda anlık güncellenir.</p>
                </div>

                {cloud.error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        Bulut kayıtları okunamadı: {cloud.error}
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-slate-500">Sınıflar yükleniyor…</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {classes.map((item) => (
                            <ClassStatusCard key={item.id} item={item} cloud={cloud} onOpen={() => setSelectedId(item.id)} />
                        ))}
                    </div>
                )}

                {selected && <ClassDetail item={selected} cloud={cloud} onClose={() => setSelectedId(null)} />}
            </main>
        </div>
    );
}

function ClassStatusCard({ item, cloud, onOpen }: { item: ClassRoom; cloud: ReturnType<typeof useCloudChess>; onOpen: () => void }) {
    const matches = cloud.matches.filter((match) => match.classId === item.id);
    const tournaments = cloud.tournaments.filter((tournament) => tournament.classId === item.id);
    const profiles = cloud.progress.filter((profile) => profile.classId === item.id && profile.profileId.startsWith('student:'));
    const course = cloud.progress.find((profile) => profile.classId === item.id && profile.profileId === `class:${item.id}`);
    const weeks = course?.progress?.completedLessons?.filter((id) => /^week-\d+$/.test(id)).length || 0;
    const active = tournaments.find((tournament) => !tournament.finished);
    const lastSync = cloud.devices
        .filter((device) => device.anonymous && device.activeClassId === item.id)
        .map((device) => device.lastSeenAt?.toDate?.())
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0];
    const avgLevel = profiles.length
        ? profiles.reduce((sum, profile) => sum + levelOf(profile.progress?.xp), 0) / profiles.length
        : 0;

    return (
        <button type="button" onClick={onOpen} className="group rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><School className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-extrabold">{item.name}</h2>
                    <p className="text-xs font-semibold text-slate-400">{item.students?.length || 0} öğrenci · {profiles.length} profil senkronlandı</p>
                </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <Metric icon={BookOpenCheck} label="Ders planı" value={`${weeks}/36 hafta`} />
                <Metric icon={Crown} label="Ort. seviye" value={profiles.length ? avgLevel.toFixed(1) : '—'} />
                <Metric icon={Swords} label="Maç" value={String(matches.length)} />
                <Metric icon={Trophy} label="Turnuva" value={String(tournaments.length)} />
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                {active
                    ? `${active.name} · ${(active.rounds?.length || 0)}. tur devam ediyor`
                    : lastSync
                      ? `Son senkron: ${lastSync.toLocaleString('tr-TR')}`
                      : 'Henüz bu sınıftan bulut kaydı gelmedi'}
            </div>
        </button>
    );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400"><Icon className="h-3.5 w-3.5" />{label}</span>
            <strong className="mt-1 block text-base">{value}</strong>
        </div>
    );
}

function ClassDetail({ item, cloud, onClose }: { item: ClassRoom; cloud: ReturnType<typeof useCloudChess>; onClose: () => void }) {
    const matches = cloud.matches.filter((match) => match.classId === item.id);
    const tournaments = cloud.tournaments.filter((tournament) => tournament.classId === item.id);
    const progressByStudent = new Map(
        cloud.progress
            .filter((profile) => profile.classId === item.id && profile.profileId.startsWith('student:'))
            .map((profile) => [profile.profileId.slice(8), profile])
    );

    const rows = (item.students || []).map((student) => {
        let wins = 0, draws = 0, losses = 0, points = 0;
        for (const match of matches) {
            if (match.whiteId !== student.id && match.blackId !== student.id) continue;
            const whitePoints = match.result === '1-0' ? 1 : match.result === '0-1' ? 0 : 0.5;
            const mine = match.whiteId === student.id ? whitePoints : 1 - whitePoints;
            points += mine;
            if (mine === 1) wins += 1;
            else if (mine === 0.5) draws += 1;
            else losses += 1;
        }
        const profile = progressByStudent.get(student.id);
        return { student, wins, draws, losses, points, profile };
    }).sort((a, b) => b.points - a.points || b.wins - a.wins || a.student.name.localeCompare(b.student.name, 'tr'));

    return (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/35 p-3 backdrop-blur-sm sm:p-8" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section className="mx-auto max-w-5xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">
                <div className="flex flex-wrap items-start gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold">{item.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">Öğrenci seviyeleri ve turnuva sıralaması</p>
                    </div>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <a href={chessUrl(item.id, 'reports')} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Raporu aç <ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a>
                        <a href={chessUrl(item.id, 'turnuva')} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Turnuvayı yönet</a>
                        <a href={chessUrl(item.id, 'siniflar')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Öğrencileri yönet</a>
                        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Kapat</button>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                            <tr><th className="p-3">#</th><th className="p-3">Öğrenci</th><th className="p-3">Seviye</th><th className="p-3">XP</th><th className="p-3">Ders</th><th className="p-3">Maç</th><th className="p-3">Puan</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row, index) => (
                                <tr key={row.student.id} className="hover:bg-slate-50/70">
                                    <td className="p-3 font-bold text-slate-400">{index + 1}</td>
                                    <td className="p-3 font-bold">{row.student.name}</td>
                                    <td className="p-3">{row.profile ? levelOf(row.profile.progress?.xp) : '—'}</td>
                                    <td className="p-3">{row.profile?.progress?.xp ?? '—'}</td>
                                    <td className="p-3">{row.profile?.progress?.completedLessons?.length ?? 0}</td>
                                    <td className="p-3">{row.wins}G {row.draws}B {row.losses}M</td>
                                    <td className="p-3 font-extrabold text-indigo-600">{pointsText(row.points)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Metric icon={Users} label="Öğrenci" value={String(item.students?.length || 0)} />
                    <Metric icon={Swords} label="Toplam maç" value={String(matches.length)} />
                    <Metric icon={Trophy} label="Turnuva" value={`${tournaments.filter((t) => t.finished).length}/${tournaments.length} tamamlandı`} />
                </div>
            </section>
        </div>
    );
}
