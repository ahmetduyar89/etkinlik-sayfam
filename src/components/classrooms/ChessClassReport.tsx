import { useMemo, useState } from 'react';
import { BookOpenCheck, ChevronDown, ExternalLink, Swords, Trophy } from 'lucide-react';
import type { ClassRoom } from '../../types';
import type { CloudMatch, CloudProgress, CloudTournament } from '../../lib/chess/adminCloud';
import { pointsText } from '../../lib/chess/adminCloud';
import { TOTAL_WEEKS, classWeeks, resultLabel, sourceLabel, summarizeTournament } from '../../lib/chess/classReport';

interface ChessClassReportProps {
    item: ClassRoom;
    matches: CloudMatch[];
    tournaments: CloudTournament[];
    progress: CloudProgress[];
    chessUrl: (route: string) => string;
}

const dateText = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Öğretmenin sınıf ekranında satranç dersinin, turnuvaların ve maçların özeti. */
export function ChessClassReport({ item, matches, tournaments, progress, chessUrl }: ChessClassReportProps) {
    const names = useMemo(() => new Map((item.students || []).map((student) => [student.id, student.name])), [item.students]);
    const nameOf = (id: string, fallback?: string) => names.get(id) || fallback || (id.startsWith('external:') ? 'Başka sınıftan' : 'Silinmiş öğrenci');
    const weeks = classWeeks(progress, item.id);
    const nextWeek = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).find((week) => !weeks.has(week));
    const summaries = useMemo(
        () => tournaments
            .map((tournament) => summarizeTournament(tournament, matches))
            .sort((a, b) => Number(a.tournament.finished) - Number(b.tournament.finished) || String(b.tournament.createdAt || '').localeCompare(String(a.tournament.createdAt || ''))),
        [tournaments, matches]
    );
    const recent = useMemo(
        () => [...matches].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 12),
        [matches]
    );

    return (
        <div className="space-y-5">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="flex items-center gap-2 font-extrabold"><BookOpenCheck className="h-4 w-4 text-indigo-600" /> Satranç ders planı</h3>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{weeks.size}/{TOTAL_WEEKS} hafta</span>
                    <a href={chessUrl(nextWeek ? `plan?hafta=${nextWeek}` : 'plan')} className="ml-auto rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                        {nextWeek ? `${nextWeek}. haftayı aç` : 'Planı aç'} <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                    </a>
                </div>
                <p className="mt-1 text-xs text-slate-500">Sınıfta “Bu haftayı tamamladım” dendiğinde hafta burada işaretlenir.</p>
                <div className="mt-4 grid grid-cols-9 gap-1.5 sm:grid-cols-12" aria-label={`${weeks.size} hafta tamamlandı`}>
                    {Array.from({ length: TOTAL_WEEKS }, (_, index) => {
                        const week = index + 1;
                        const done = weeks.has(week);
                        return (
                            <span
                                key={week}
                                title={`${week}. hafta${done ? ' · tamamlandı' : ''}`}
                                className={`flex h-8 items-center justify-center rounded-lg text-xs font-bold ${done ? 'bg-emerald-500 text-white' : week === nextWeek ? 'border-2 border-indigo-300 bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {week}
                            </span>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="flex items-center gap-2 font-extrabold"><Trophy className="h-4 w-4 text-amber-500" /> Turnuvalar</h3>
                    <a href={chessUrl('turnuva')} className="ml-auto rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Turnuva yönetimi</a>
                </div>
                {summaries.length === 0 && <p className="mt-4 text-sm text-slate-400">Bu sınıfta henüz turnuva yapılmadı.</p>}
                <div className="mt-4 space-y-3">
                    {summaries.map((summary, index) => (
                        <TournamentCard key={summary.tournament.id} summary={summary} nameOf={nameOf} defaultOpen={index === 0}
                            href={chessUrl(`turnuva?id=${encodeURIComponent(summary.tournament.localId || summary.tournament.id)}`)} />
                    ))}
                </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
                    <h3 className="flex items-center gap-2 font-extrabold"><Swords className="h-4 w-4 text-rose-500" /> Son maçlar</h3>
                    <p className="mt-1 text-xs text-slate-500">İki kişilik oyun, turnuva ve canlı satranç sonuçları.</p>
                </div>
                {recent.length === 0 && <p className="p-6 text-sm text-slate-400">Henüz kayıtlı maç yok.</p>}
                <ul className="divide-y divide-slate-100">
                    {recent.map((match) => (
                        <li key={match.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm sm:px-7">
                            <span className="min-w-0 flex-1 font-semibold">
                                {nameOf(match.whiteId, match.whiteName)} <span className="mx-1 rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-white">{resultLabel(match.result)}</span> {nameOf(match.blackId, match.blackName)}
                            </span>
                            <span className="text-xs text-slate-500">
                                {sourceLabel(match.source)}{match.round ? ` · ${match.round}. tur` : ''}{match.date ? ` · ${dateText(match.date)}` : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

function TournamentCard({ summary, nameOf, href, defaultOpen }: {
    summary: ReturnType<typeof summarizeTournament>;
    nameOf: (id: string) => string;
    href: string;
    defaultOpen: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const { tournament, standings, roundsPlayed, plannedRounds, pendingBoards } = summary;
    const state = tournament.finished ? 'Tamamlandı' : pendingBoards ? `${pendingBoards} masa sonuç bekliyor` : 'Devam ediyor';
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50">
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{tournament.name}</strong>
                    <span className="text-xs text-slate-500">{roundsPlayed}/{plannedRounds} tur · {standings.length} oyuncu · {state}</span>
                </span>
                {standings[0] && standings[0].played + standings[0].byes > 0 && (
                    <span className="hidden text-xs font-bold text-amber-700 sm:inline">Lider: {nameOf(standings[0].id)}</span>
                )}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="border-t border-slate-200 bg-white px-4 pb-4">
                    <div className="overflow-x-auto">
                        <table className="mt-2 w-full min-w-[420px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-slate-400">
                                <tr><th className="py-2 pr-2">#</th><th className="py-2 pr-2">Öğrenci</th><th className="py-2 pr-2">Puan</th><th className="py-2 pr-2">G/B/M</th><th className="py-2 pr-2">Bay</th><th className="py-2">Buchholz</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {standings.map((row, index) => (
                                    <tr key={row.id}>
                                        <td className="py-2 pr-2 font-bold text-slate-400">{index + 1}</td>
                                        <td className="py-2 pr-2 font-semibold">{nameOf(row.id)}</td>
                                        <td className="py-2 pr-2 font-extrabold text-indigo-600">{pointsText(row.points)}</td>
                                        <td className="py-2 pr-2">{row.wins}/{row.draws}/{row.losses}</td>
                                        <td className="py-2 pr-2">{row.byes || '—'}</td>
                                        <td className="py-2">{pointsText(row.buchholz)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <a href={href} className="mt-3 inline-block rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Turnuvayı aç</a>
                </div>
            )}
        </div>
    );
}
