import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Edit3, GraduationCap, KeyRound, School, Trophy, UserRound, Users } from 'lucide-react';
import { useClassrooms } from '../../lib/classrooms';
import type { ClassRoom } from '../../types';
import { ClassManagerModal } from './ClassManagerModal';

interface ClassAdminDashboardProps {
    onBack: () => void;
    onOpenChessReports: () => void;
    onPreviewClass: (classRoom: ClassRoom) => void;
}

export function ClassAdminDashboard({ onBack, onOpenChessReports, onPreviewClass }: ClassAdminDashboardProps) {
    const { classes, loading, error } = useClassrooms();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [managerOpen, setManagerOpen] = useState(false);
    const selected = useMemo(
        () => classes.find((item) => item.id === selectedId) || classes[0] || null,
        [classes, selectedId]
    );

    return (
        <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-5 py-4 sm:px-8">
                    <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
                        <ArrowLeft className="h-4 w-4" /> Atölye
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <School className="h-5 w-5 text-indigo-600" />
                    <strong className="text-[17px]">Sınıflar</strong>
                    <button type="button" onClick={() => setManagerOpen(true)} className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                        Sınıfları yönet
                    </button>
                </div>
            </header>

            <main className="mx-auto grid max-w-[1280px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
                <aside>
                    <h1 className="text-3xl font-extrabold tracking-tight">Sınıf merkezi</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">Sınıf girişleri, öğrenci listeleri, atanmış çalışmalar ve raporlar tek yerde.</p>
                    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                    <div className="mt-6 space-y-2">
                        {loading && <p className="text-sm text-slate-500">Sınıflar yükleniyor…</p>}
                        {!loading && classes.length === 0 && (
                            <button type="button" onClick={() => setManagerOpen(true)} className="w-full rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-5 text-sm font-bold text-indigo-700">
                                İlk sınıfı oluştur
                            </button>
                        )}
                        {classes.map((item) => (
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
                                        <span className="text-xs text-slate-400">{item.students?.length || 0} öğrenci</span>
                                    </span>
                                    {item.credentialConfigured ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <KeyRound className="h-4 w-4 text-amber-500" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                <section>
                    {selected ? (
                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex flex-wrap items-start gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                                        <h2 className="text-2xl font-extrabold">{selected.name}</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">Kullanıcı adı: <strong>{selected.username}</strong> · {selected.assignedModules?.length || 0} modül atanmış</p>
                                </div>
                                <div className="ml-auto flex flex-wrap gap-2">
                                    <button type="button" onClick={() => onPreviewClass(selected)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Sınıf görünümü</button>
                                    <button type="button" onClick={onOpenChessReports} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"><Trophy className="mr-1 inline h-3.5 w-3.5" /> Satranç raporu</button>
                                    <button type="button" onClick={() => setManagerOpen(true)} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white"><Edit3 className="mr-1 inline h-3.5 w-3.5" /> Düzenle</button>
                                </div>
                            </div>

                            {!selected.credentialConfigured && (
                                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    Bu sınıf eski veri modelinden geliyor. Sınıfı düzenleyip en az 6 karakterli yeni giriş şifresi belirleyin.
                                </div>
                            )}

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <Summary icon={Users} label="Öğrenci" value={String(selected.students?.length || 0)} />
                                <Summary icon={UserRound} label="Numarası tanımlı" value={String(selected.students?.filter((student) => student.schoolNumber).length || 0)} />
                                <Summary icon={School} label="Sınıf seviyesi" value={selected.grade ? `${selected.grade}. sınıf` : 'Belirtilmedi'} />
                            </div>

                            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                                        <tr><th className="p-3">Öğrenci no</th><th className="p-3">Ad soyad</th><th className="p-3">Canlı satranç</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(selected.students || []).map((student) => (
                                            <tr key={student.id}>
                                                <td className="p-3 font-mono font-bold text-slate-600">{student.schoolNumber || '—'}</td>
                                                <td className="p-3 font-semibold">{student.name}</td>
                                                <td className="p-3 text-xs font-bold"><span className={student.schoolNumber ? 'text-emerald-600' : 'text-amber-600'}>{student.schoolNumber ? 'Giriş hazır' : 'Numara gerekli'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-sm text-slate-500">Görüntülenecek sınıf bulunmuyor.</div>
                    )}
                </section>
            </main>

            <ClassManagerModal isOpen={managerOpen} onClose={() => setManagerOpen(false)} onSwitchToClass={onPreviewClass} />
        </div>
    );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
    return <div className="rounded-2xl bg-slate-50 p-4"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Icon className="h-4 w-4" />{label}</span><strong className="mt-1 block text-lg">{value}</strong></div>;
}
