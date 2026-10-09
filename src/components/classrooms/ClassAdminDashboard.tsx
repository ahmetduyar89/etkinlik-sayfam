import { StudentLearningReport } from '../learning/StudentLearningReport';
import { AssignmentManager } from '../learning/AssignmentManager';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowLeft, BookOpenCheck, CheckCircle2, Cloud, Crown, Edit3, ExternalLink,
    GraduationCap, KeyRound, School, Swords, Trophy, UserRound, Users,
} from 'lucide-react';
import { useClassrooms } from '../../lib/classrooms';
import type { ClassRoom } from '../../types';
import { levelOf, pointsText, useCloudChess } from '../../lib/chess/adminCloud';
import { ClassManagerModal } from './ClassManagerModal';

interface ClassAdminDashboardProps {
    onBack: () => void;
    onPreviewClass: (classRoom: ClassRoom) => void;
}

const chessUrl = (classId: string, route: string) =>
    `/satranc/?classId=${encodeURIComponent(classId)}&returnTo=${encodeURIComponent('/siniflar')}#/${route}`;

export function ClassAdminDashboard({ onBack, onPreviewClass }: ClassAdminDashboardProps) {
    const { classes, loading, error } = useClassrooms();
    const cloud = useCloudChess();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [managerOpen, setManagerOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ClassRoom | null>(null);
    const selected = useMemo(
        () => classes.find((item) => item.id === selectedId) || classes[0] || null,
        [classes, selectedId]
    );

    const openManager = () => {
        setEditTarget(null);
        setManagerOpen(true);
    };

    const editClass = (item: ClassRoom) => {
        setEditTarget(item);
        setManagerOpen(true);
    };

    return (
        <div className="min-h-[100svh] bg-[#f6f7fb] text-slate-900">
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2 sm:gap-3 px-3 py-3 sm:py-4 sm:px-8">
                    <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
                        <ArrowLeft className="h-4 w-4" /> Atölye
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <School className="h-5 w-5 text-indigo-600" />
                    <strong className="text-[17px]">Sınıflar</strong>
                    <span className="hidden text-sm text-slate-400 sm:inline">Öğrenciler, girişler ve satranç yönetimi</span>
                    <button type="button" onClick={openManager} className="ml-auto rounded-xl bg-indigo-600 min-h-11 px-3 sm:px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                        Sınıfları yönet
                    </button>
                </div>
            </header>

            <main className="mx-auto grid max-w-[1320px] gap-4 sm:gap-6 px-3 py-5 sm:py-8 sm:px-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
                <aside>
                    <h1 className="text-3xl font-extrabold tracking-tight">Sınıf merkezi</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">Bir sınıf seçin; giriş bilgilerini, öğrenci listesini, satranç ilerlemesini, maçları ve turnuvaları aynı yerde yönetin.</p>
                    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                    <div className="mt-6 space-y-2">
                        {loading && <p className="text-sm text-slate-500">Sınıflar yükleniyor…</p>}
                        {!loading && classes.length === 0 && (
                            <button type="button" onClick={openManager} className="w-full rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-5 text-sm font-bold text-indigo-700">
                                İlk sınıfı oluştur
                            </button>
                        )}
                        {classes.map((item) => {
                            const matchCount = cloud.matches.filter((match) => match.classId === item.id).length;
                            const tournamentCount = cloud.tournaments.filter((tournament) => tournament.classId === item.id).length;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedId(item.id)}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === item.id ? 'border-indigo-300 bg-white shadow-md' : 'border-slate-200 bg-white/70 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-extrabold text-indigo-600">{item.name.slice(0, 2).toUpperCase()}</span>
                                        <span className="min-w-0 flex-1">
                                            <strong className="block truncate text-sm">{item.name}</strong>
                                            <span className="text-xs text-slate-400">{item.students?.length || 0} öğrenci · {matchCount} maç · {tournamentCount} turnuva</span>
                                        </span>
                                        {item.credentialConfigured ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <KeyRound className="h-4 w-4 text-amber-500" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className="min-w-0">
                    {selected ? (
                        <ClassWorkspace item={selected} cloud={cloud} onEdit={() => editClass(selected)} onPreview={() => onPreviewClass(selected)} />
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-sm text-slate-500">Görüntülenecek sınıf bulunmuyor.</div>
                    )}
                </section>
            </main>

            <ClassManagerModal
                isOpen={managerOpen}
                initialClass={editTarget}
                onClose={() => {
                    setManagerOpen(false);
                    setEditTarget(null);
                }}
                onSwitchToClass={onPreviewClass}
            />
        </div>
    );
}

function ClassWorkspace({ item, cloud, onEdit, onPreview }: {
    item: ClassRoom;
    cloud: ReturnType<typeof useCloudChess>;
    onEdit: () => void;
    onPreview: () => void;
}) {
    const [focusedStudent, setFocusedStudent] = useState<string | null>(null);
    const matches = cloud.matches.filter((match) => match.classId === item.id);
    const tournaments = cloud.tournaments.filter((tournament) => tournament.classId === item.id);
    const profiles = cloud.progress.filter((profile) => profile.classId === item.id && profile.profileId.startsWith('student:'));
    const course = cloud.progress.find((profile) => profile.classId === item.id && (profile.profileId === `class:${item.id}` || profile.profileId === 'teacher' || profile.profileId === `class_${item.id}`));
    const classCompletedWeeks = new Set<string>(
        (course?.progress?.completedLessons || []).filter((id) => /^week-\d+$/.test(id))
    );
    cloud.progress
        .filter((profile) => profile.classId === item.id)
        .forEach((profile) => {
            profile.progress?.completedLessons?.forEach((id) => {
                if (/^week-\d+$/.test(id)) classCompletedWeeks.add(id);
            });
        });
    const weeks = classCompletedWeeks.size;
    const liveGames = cloud.liveGames.filter((game) => game.whiteClassId === item.id || game.blackClassId === item.id);
    const online = cloud.presence.filter((presence) => {
        const seen = presence.lastSeenAt?.toDate?.();
        return presence.classId === item.id && seen && Date.now() - seen.getTime() < 90_000;
    }).length;
    const lastSync = cloud.devices
        .filter((device) => device.activeClassId === item.id || device.classIds?.includes(item.id))
        .map((device) => device.lastSeenAt?.toDate?.())
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0];
    const avgLevel = profiles.length
        ? profiles.reduce((sum, profile) => sum + levelOf(profile.progress?.xp), 0) / profiles.length
        : 0;
    const progressByStudent = new Map(profiles.map((profile) => [profile.profileId.slice(8), profile]));
    const rows = (item.students || []).map((student) => {
        let wins = 0;
        let draws = 0;
        let losses = 0;
        let points = 0;
        for (const match of matches) {
            if (match.whiteId !== student.id && match.blackId !== student.id) continue;
            const whitePoints = match.result === '1-0' ? 1 : match.result === '0-1' ? 0 : 0.5;
            const mine = match.whiteId === student.id ? whitePoints : 1 - whitePoints;
            points += mine;
            if (mine === 1) wins += 1;
            else if (mine === 0.5) draws += 1;
            else losses += 1;
        }
        return { student, profile: progressByStudent.get(student.id), wins, draws, losses, points };
    }).sort((a, b) => b.points - a.points || b.wins - a.wins || a.student.name.localeCompare(b.student.name, 'tr'));

    return (
        <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-2xl font-extrabold">{item.name}</h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Kullanıcı adı: <strong>{item.username}</strong> · {item.assignedModules?.length || 0} çalışma alanı atanmış</p>
                    </div>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <button type="button" onClick={onPreview} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Sınıf görünümü</button>
                        <button type="button" onClick={onEdit} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white"><Edit3 className="mr-1 inline h-3.5 w-3.5" /> Sınıfı düzenle</button>
                    </div>
                </div>

                {!item.credentialConfigured && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Bu sınıfın güvenli girişi tamamlanmamış. “Sınıfı düzenle” ile en az 6 karakterli yeni şifre belirleyin.
                    </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={Users} label="Öğrenci" value={String(item.students?.length || 0)} />
                    <Metric icon={UserRound} label="Numarası tanımlı" value={String(item.students?.filter((student) => student.schoolNumber).length || 0)} />
                    <Metric icon={BookOpenCheck} label="Satranç ders planı" value={`${weeks}/36 hafta`} />
                    <Metric icon={Crown} label="Ortalama seviye" value={profiles.length ? avgLevel.toFixed(1) : '—'} />
                    <Metric icon={Swords} label="Kayıtlı maç" value={String(matches.length)} />
                    <Metric icon={Trophy} label="Turnuva" value={String(tournaments.length)} />
                    <Metric icon={Users} label="Şimdi çevrimiçi" value={String(online)} />
                    <Metric icon={Cloud} label="Canlı satranç maçı" value={String(liveGames.length)} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
                    <span className="mr-auto text-xs font-semibold text-slate-500">
                        {cloud.ready ? `Sunucudan son güncelleme: ${(cloud.lastConfirmedAt || lastSync)?.toLocaleString('tr-TR') || 'Güncel'}` : 'Sunucu kayıtları bekleniyor…'}
                    </span>
                    <a href={chessUrl(item.id, 'reports')} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">Satranç raporu <ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a>
                    <a href={chessUrl(item.id, 'turnuva')} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Turnuva yönetimi</a>
                    <a href={chessUrl(item.id, 'siniflar')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">Satranç öğrencileri</a>
                </div>
            </div>

            <AssignmentManager key={item.id} classroom={item} />

            {cloud.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    Satranç bulut kayıtları okunamadı: {cloud.error}
                </div>
            )}

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
                    <h3 className="font-extrabold text-slate-900">Öğrenciler ve satranç durumu</h3>
                    <p className="mt-1 text-xs text-slate-500">Öğrenci numarası, canlı giriş hazırlığı, seviye, ders ve maç sonuçları birlikte gösterilir.</p>
                </div>
                <div className="min-w-0 overflow-x-auto overscroll-x-contain" tabIndex={0} aria-label="Öğrenci tablosu, yatay kaydırılabilir">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="p-3">#</th><th className="p-3">Öğrenci no</th><th className="p-3">Ad soyad</th><th className="p-3">Giriş</th><th className="p-3">Seviye</th><th className="p-3">XP</th><th className="p-3">Ders</th><th className="p-3">Maç</th><th className="p-3">Puan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row, index) => (
                                <tr key={row.student.id} className="hover:bg-slate-50/70">
                                    <td className="p-3 font-bold text-slate-400">{index + 1}</td>
                                    <td className="p-3 font-mono font-bold text-slate-600">{row.student.schoolNumber || '—'}</td>
                                    <td className="p-3 font-bold"><button type="button" onClick={() => setFocusedStudent(row.student.id)} className="min-h-11 text-left text-indigo-700 underline decoration-indigo-200 underline-offset-4">{row.student.name}</button></td>
                                    <td className={`p-3 text-xs font-bold ${row.student.schoolNumber ? 'text-emerald-600' : 'text-amber-600'}`}>{row.student.schoolNumber ? 'Hazır' : 'Numara gerekli'}</td>
                                    <td className="p-3">{row.profile ? levelOf(row.profile.progress?.xp) : '—'}</td>
                                    <td className="p-3">{row.profile?.progress?.xp ?? '—'}</td>
                                    <td className="p-3">{row.profile?.progress?.completedLessons?.length ?? 0}</td>
                                    <td className="p-3">{row.wins}G {row.draws}B {row.losses}M</td>
                                    <td className="p-3 font-extrabold text-indigo-600">{pointsText(row.points)}</td>
                                </tr>
                            ))}
                            {rows.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-sm text-slate-400">Bu sınıfa henüz öğrenci eklenmemiş.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {focusedStudent && <StudentLearningReport key={focusedStudent} classroom={item} studentId={focusedStudent} cloud={cloud} onClose={() => setFocusedStudent(null)} />}
            {tournaments.length > 0 && (
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <h3 className="flex items-center gap-2 font-extrabold"><Trophy className="h-4 w-4 text-amber-500" /> Sınıf turnuvaları</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {tournaments.map((tournament) => (
                            <div key={tournament.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                    <strong className="text-sm">{tournament.name}</strong>
                                    <p className="mt-1 text-xs text-slate-500">{tournament.rounds?.length || 0} tur · {tournament.finished ? 'Tamamlandı' : 'Devam ediyor'}</p>
                                </div>
                                <a href={chessUrl(item.id, `turnuva?id=${encodeURIComponent(tournament.localId || tournament.id)}`)} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Aç</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Icon className="h-4 w-4" />{label}</span>
            <strong className="mt-1 block text-lg">{value}</strong>
        </div>
    );
}
