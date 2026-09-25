// src/components/classrooms/ClassroomDashboard.tsx — Sınıf Odaklı Çalışma Alanı
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    School,
    LogOut,
    Crown,
    FlaskConical,
    BookOpen,
    Users,
    ArrowRight,
    Sparkles,
    X,
    Maximize2,
    CheckCircle2,
    Play,
} from 'lucide-react';
import { PORTAL_MODULES, type PortalModule } from '../../constants/portal';
import { EXPERIMENTS_CATALOG, findExperimentByFile } from '../../constants/experiments';
import { useClassrooms, syncClassesToChess } from '../../lib/classrooms';
import { getSession, lockApp, saveSession } from '../../utils/auth';
import { useFirestore } from '../../lib/firebase';
import type { ClassRoom, Notebook } from '../../types';
import { cn } from '../../utils/cn';

interface ClassroomDashboardProps {
    classRoom?: ClassRoom | null;
    onOpenInternalModule?: (view: string) => void;
    onReturnToAdmin?: () => void;
}

export function ClassroomDashboard({
    classRoom: propClassRoom,
    onOpenInternalModule,
    onReturnToAdmin,
}: ClassroomDashboardProps) {
    const { classes } = useClassrooms();
    const session = getSession();

    // Aktif sınıfı bul: prop olarak geldiyse onu kullan, yoksa oturumdan bul
    const activeClass = useMemo(() => {
        if (propClassRoom) return propClassRoom;
        if (session && session.role === 'class') {
            return classes.find((c) => c.id === session.classId) || null;
        }
        return null;
    }, [propClassRoom, session, classes]);

    // Defterleri çek
    const notebooksHandler = useFirestore<Notebook>('notebooks');
    const [allNotebooks, setAllNotebooks] = useState<Notebook[]>([]);

    useEffect(() => {
        const unsub = notebooksHandler.sync(
            (data) => setAllNotebooks(data || []),
            (err) => console.warn('Defterler yüklenemedi:', err)
        );
        return () => unsub();
    }, []);

    // Sınıfa atanmış defterler
    const assignedNotebookList = useMemo(() => {
        if (!activeClass || !activeClass.assignedNotebooks) return [];
        return allNotebooks.filter((nb) => activeClass.assignedNotebooks.includes(nb.id));
    }, [activeClass, allNotebooks]);

    // Sınıfa atanmış modüller
    const assignedModulesList = useMemo(() => {
        if (!activeClass) return [];
        const ids = activeClass.assignedModules || [];
        return PORTAL_MODULES.filter((m) => ids.includes(m.id));
    }, [activeClass]);

    // Sınıfa atanmış deneyler
    const assignedExperimentsList = useMemo(() => {
        if (!activeClass) return [];
        const files = activeClass.assignedExperiments || [];
        return files.map((f) => findExperimentByFile(f) || {
            id: f,
            file: f,
            title: f.replace('.html', '').replace(/-/g, ' '),
            category: 'Fen Deneyi',
            icon: '🧪',
            summary: 'İnteraktif fen laboratuvarı deneyi.',
        });
    }, [activeClass]);

    // Deney modalı state'i
    const [activeExperimentFile, setActiveExperimentFile] = useState<string | null>(null);

    // Satranç açıldığında sınıfı önceden ayarla
    const handleOpenChess = (e: React.MouseEvent, mod: PortalModule) => {
        if (activeClass) {
            // Sınıfı Satranç yerel verisinde aktif yap
            syncClassesToChess(classes, activeClass.id);
            // Satranç adresine yönlendir
            window.location.href = `/satranc/?classId=${activeClass.id}`;
            e.preventDefault();
        }
    };

    // Defter aç
    const handleOpenNotebook = (nbId: string) => {
        window.location.href = `/?view=notebook&id=${nbId}`;
    };

    // Eğer oturum admin ise ama sınıf önizleniyorsa
    const isAdminPreview = session?.role === 'admin';

    const handleExitPreview = () => {
        if (onReturnToAdmin) {
            onReturnToAdmin();
        } else {
            saveSession({ role: 'admin', username: 'admin' });
            window.location.href = '/';
        }
    };

    if (!activeClass) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center font-sans">
                <School className="w-12 h-12 text-slate-400 mb-3" />
                <h2 className="text-[20px] font-bold text-slate-800 mb-1">Sınıf Bilgisi Yükleniyor…</h2>
                <p className="text-[14px] text-slate-500 mb-6">
                    Lütfen bekleyin veya tekrar giriş yapın.
                </p>
                <button
                    type="button"
                    onClick={lockApp}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                >
                    Giriş Ekranına Dön
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f8fc] font-sans pb-20">
            {/* Admin Önizleme Üst Şeridi */}
            {isAdminPreview && (
                <div className="bg-amber-500 text-amber-950 px-4 py-2 text-[12.5px] font-bold flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span>Admin Önizleme Modu: "{activeClass.name}" sınıfının öğrenci görünümündesiniz.</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleExitPreview}
                        className="bg-black/15 hover:bg-black/25 text-amber-950 px-3 py-1 rounded-lg text-[12px] font-bold transition-colors"
                    >
                        Admin Paneline Dön
                    </button>
                </div>
            )}

            {/* Üst Başlık (Header) */}
            <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3.5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-[16px] shadow-sm">
                            {activeClass.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-[18px] text-slate-900 tracking-tight leading-none">
                                    {activeClass.name}
                                </h1>
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    Sınıf Alanı
                                </span>
                            </div>
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                                {activeClass.students?.length || 0} Öğrenci Kayıtlı
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdminPreview ? (
                            <button
                                type="button"
                                onClick={handleExitPreview}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                                <Crown className="w-4 h-4 text-amber-600" />
                                Admin Paneline Dön
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={lockApp}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Çıkış Yap"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Çıkış Yap</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1240px] px-5 pt-8 sm:px-8">
                {/* Karşılama Kartı */}
                <div className="relative overflow-hidden rounded-[28px] border border-indigo-100 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 p-6 sm:p-8 text-white shadow-[0_12px_30px_rgba(99,102,241,0.22)] mb-10">
                    <div className="relative z-10 max-w-xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-md mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            {activeClass.name} Özel Çalışma Paneli
                        </span>
                        <h2 className="text-[28px] sm:text-[34px] font-black tracking-tight leading-tight">
                            Hoş Geldiniz!
                        </h2>
                        <p className="mt-2 text-[14.5px] text-indigo-100 leading-relaxed">
                            Öğretmeninizin bu sınıf için hazırladığı satranç ligi, fen deneyleri, ders defterleri ve interaktif etkinlikler tek bir yerde hazır.
                        </p>
                    </div>

                    {/* Dekoratif Işıklar */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-16 right-32 h-64 w-64 rounded-full bg-blue-400/20 blur-2xl" />
                </div>

                {/* BÖLÜM 1: ATANMIŞ PORTAL MODÜLLERİ */}
                {assignedModulesList.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-[19px] font-extrabold text-slate-900 tracking-tight">
                                Atanmış Bölümler & Atölyeler
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {assignedModulesList.map((mod) => {
                                const isChess = mod.id === 'satranc';

                                return (
                                    <div
                                        key={mod.id}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white bg-white/90 p-6 text-left shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                                    >
                                        <span
                                            className={cn(
                                                'absolute inset-x-0 top-0 h-1 rounded-t-[24px] bg-gradient-to-r',
                                                mod.accent.strip
                                            )}
                                        />

                                        <div>
                                            <div className="flex items-start gap-3.5 mb-4">
                                                <div
                                                    className={cn(
                                                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm',
                                                        mod.accent.icon
                                                    )}
                                                >
                                                    <mod.icon className="h-6 w-6" strokeWidth={2} />
                                                </div>
                                                <div className="min-w-0 flex-1 pt-0.5">
                                                    <h4 className="text-[17px] font-extrabold text-slate-900 leading-snug">
                                                        {mod.title}
                                                    </h4>
                                                    {isChess && (
                                                        <span className="inline-block mt-0.5 bg-amber-50 text-amber-800 text-[10.5px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                                            {activeClass.name} Öğrenci Kadrosu
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                                                {isChess
                                                    ? `${activeClass.name} sınıfının öğrencileriyle iki kişilik karşılaşmalar, taş dersleri ve sınıf turnuvaları.`
                                                    : mod.description}
                                            </p>
                                        </div>

                                        {isChess ? (
                                            <a
                                                href={`/satranc/?classId=${activeClass.id}`}
                                                onClick={(e) => handleOpenChess(e, mod)}
                                                className="mt-auto w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                            >
                                                <span>{activeClass.name} Satrancını Başlat</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </a>
                                        ) : mod.kind === 'internal' ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (onOpenInternalModule && mod.view) {
                                                        onOpenInternalModule(mod.view);
                                                    } else {
                                                        window.location.href = mod.href;
                                                    }
                                                }}
                                                className="mt-auto w-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <span>Aç</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <a
                                                href={mod.href}
                                                className="mt-auto w-full bg-slate-900 hover:bg-black text-white font-bold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                            >
                                                <span>Aç</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* BÖLÜM 2: SINIF FEN DENEYLERİ */}
                {assignedExperimentsList.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-[19px] font-extrabold text-slate-900 tracking-tight">
                                    Sınıfa Tanımlanan Deneyler & Simülasyonlar
                                </h3>
                            </div>
                            <span className="text-[12.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                {assignedExperimentsList.length} Deney Hazır
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {assignedExperimentsList.map((exp) => (
                                <div
                                    key={exp.file}
                                    className="border border-slate-200/80 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[22px] flex items-center justify-center flex-shrink-0">
                                                {exp.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                                                    {exp.category}
                                                </span>
                                                <h4 className="text-[15px] font-bold text-slate-900 leading-snug truncate">
                                                    {exp.title}
                                                </h4>
                                            </div>
                                        </div>
                                        <p className="text-[12.5px] text-slate-500 leading-relaxed mb-4">
                                            {exp.summary}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setActiveExperimentFile(exp.file)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Deneyi Başlat</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* BÖLÜM 3: SINIF DEFTERLERİ */}
                {assignedNotebookList.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-violet-600" />
                                <h3 className="text-[19px] font-extrabold text-slate-900 tracking-tight">
                                    Sınıf Ders Defterleri
                                </h3>
                            </div>
                            <span className="text-[12.5px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                                {assignedNotebookList.length} Defter
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignedNotebookList.map((nb) => (
                                <div
                                    key={nb.id}
                                    onClick={() => handleOpenNotebook(nb.id)}
                                    className="border border-slate-200/80 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-pointer flex flex-col justify-between group"
                                >
                                    <div className="flex items-start gap-3.5 mb-3">
                                        <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-[15.5px] font-bold text-slate-900 leading-snug group-hover:text-violet-600 transition-colors">
                                                {nb.title}
                                            </h4>
                                            <p className="text-[12px] text-slate-400 mt-1">
                                                {nb.page_count ?? 1} sayfa ders içeriği
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] font-bold text-violet-600">
                                        <span>Defteri Aç</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* BÖLÜM 4: ÖĞRENCİ LİSTESİ */}
                {activeClass.students && activeClass.students.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-slate-500" />
                            <h4 className="text-[15px] font-bold text-slate-800">
                                Sınıf Öğrenci Kadrosu ({activeClass.students.length})
                            </h4>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                            <div className="flex flex-wrap gap-2">
                                {activeClass.students.map((st, i) => (
                                    <span
                                        key={st.id || i}
                                        className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-[12.5px] font-medium text-slate-700"
                                    >
                                        <span className="text-[11px] font-bold text-slate-400">{i + 1}.</span>
                                        {st.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* DENEY AÇMA MODALI */}
            <AnimatePresence>
                {activeExperimentFile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveExperimentFile(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="relative w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
                        >
                            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                                    <span className="font-bold text-[15px] text-slate-800">
                                        {findExperimentByFile(activeExperimentFile)?.title || 'Fen Deneyi'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/deneyler/${activeExperimentFile}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Tam Ekranda Yeni Sekmede Aç"
                                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setActiveExperimentFile(null)}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <iframe
                                src={`/deneyler/${activeExperimentFile}`}
                                title="Deney"
                                className="w-full flex-1 border-0"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
