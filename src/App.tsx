import React, { useState, useEffect, useMemo } from 'react';
import {
    Sparkles,
    FlaskConical,
    Search,
    ExternalLink,
    Copy,
    Share2,
    Trash2,
    Edit3,
    Grid,
    Filter,
    Plus,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Database,
    BarChart3,
    CalendarDays,
    Target,
    Zap,
    Globe,
    Settings,
    Bell,
    User,
    ArrowRight,
    HelpCircle,
    Eye,
    MoreVertical,
    X,
    Save,
    Clock,
    BookOpen,
    Anchor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, useFirestore } from './lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// =======================
// COMPONENTS
// =======================
const GlassCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn("bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative group", className)}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const IconButton = ({ icon: Icon, onClick, className }: { icon: any, onClick?: (e: any) => void, className?: string }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={cn("p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group", className)}
    >
        <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
    </button>
);

const Navbar = ({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) => (
    <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
        <div className="container mx-auto max-w-7xl flex justify-between items-center pointer-events-auto bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-8 py-3 shadow-2xl">
            <div className="flex items-center gap-4">
                <motion.div
                    whileHover={{ rotate: 180 }}
                    className="w-11 h-11 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20"
                >
                    <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                    <h1 className="text-lg font-black tracking-widest text-white leading-none">TEDRİS</h1>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Eğitim Portalı</span>
                </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                <button
                    onClick={() => setTab('dashboard')}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'dashboard' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Yıllık Plan
                </button>
                <button
                    onClick={() => setTab('interactive')}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'interactive' ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Zap className="w-4 h-4" />
                    İnteraktif
                </button>
            </nav>

            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-3 mr-4">
                    <IconButton icon={Search} />
                    <IconButton icon={Settings} />
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 overflow-hidden group">
                    <User className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    </header>
);

// =======================
// MODAL COMPONENTS
// =======================
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-[#0a0a0c] border border-white/10 rounded-[3rem] w-full max-w-4xl p-10 shadow-[0_64px_128px_-16px_rgba(0,0,0,1)] overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase">{title}</h3>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scroll">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// =======================
// MAIN APP COMPONENT
// =======================
export default function App() {
    const [tab, setTab] = useState('dashboard');
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [activities, setActivities] = useState<any[]>([]);
    const [science, setScience] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);

    // Form States
    const [isScienceOpen, setIsScienceOpen] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const activitiesHandler = useFirestore('activities');
    const scienceHandler = useFirestore('science_activities');

    useEffect(() => {
        const unsubA = activitiesHandler.sync(setActivities);
        const unsubS = scienceHandler.sync(setScience);
        return () => { unsubA(); unsubS(); };
    }, []);

    const filteredScience = useMemo(() => {
        const grades = ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"];
        return grades.map(grade => ({
            grade,
            items: science.filter(s =>
                s.class_level === grade &&
                (parseInt(s.week_number) <= selectedWeek &&
                    (parseInt(s.week_number) + (parseInt(s.duration_weeks) || 1) > selectedWeek))
            )
        }));
    }, [science, selectedWeek]);

    const stats = useMemo(() => ({
        total: activities.length + science.length,
        interactive: activities.length,
    }), [science, activities]);

    // Handle Form Submissions
    const handleScienceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const payload = Object.fromEntries(formData.entries());

        if (editItem) {
            await scienceHandler.update(editItem.id, payload);
        } else {
            await scienceHandler.add(payload);
        }
        setIsScienceOpen(false);
        setEditItem(null);
    };

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const payload = Object.fromEntries(formData.entries());

        if (editItem) {
            await activitiesHandler.update(editItem.id, payload);
        } else {
            await activitiesHandler.add(payload);
        }
        setIsActivityOpen(false);
        setEditItem(null);
    };

    return (
        <div className="min-h-screen pt-32 pb-16 px-6 text-white bg-[#02040a] selection:bg-purple-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
            </div>

            <Navbar activeTab={tab} setTab={setTab} />

            <main className="container mx-auto max-w-7xl relative z-10">
                <AnimatePresence mode="wait">
                    {tab === 'dashboard' ? (
                        <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-12">
                            <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                                        <CalendarDays className="w-3 h-3" /> Yıllık Bilim Müfredatı
                                    </div>
                                    <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none">MÜFREDAT <span className="text-white/20 uppercase">Akışı</span></h2>
                                    <p className="text-white/40 max-w-lg font-medium leading-relaxed">
                                        1-36 haftalık eğitim-öğretim dönemi için her sınıf düzeyine özel olarak hazırlanmış interaktif deney ve proje planlayıcısı.
                                    </p>
                                </div>

                                <div className="w-full lg:w-auto p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center gap-4">
                                    <button onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                                    <div className="flex-1 lg:w-48 text-center">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-1">Haftalık Görünüm</span>
                                        <span className="text-4xl font-black font-mono tracking-tighter">HAFTA <span className="text-purple-500">#{selectedWeek}</span></span>
                                    </div>
                                    <button onClick={() => setSelectedWeek(Math.min(36, selectedWeek + 1))} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronRight className="w-6 h-6" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {filteredScience.map((col, idx) => (
                                    <div key={col.grade} className="space-y-6">
                                        <div className={cn("group p-6 rounded-[2rem] border transition-all duration-500 shadow-xl",
                                            idx === 0 ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10" :
                                                idx === 1 ? "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10" :
                                                    idx === 2 ? "bg-purple-500/5 border-purple-500/10 hover:bg-purple-500/10" :
                                                        "bg-orange-500/5 border-orange-500/10 hover:bg-orange-500/10"
                                        )}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]",
                                                    idx === 0 ? "text-emerald-500" : idx === 1 ? "text-blue-500" : idx === 2 ? "text-purple-500" : "text-orange-500"
                                                )}>{col.grade}</span>
                                                <BarChart3 className="w-4 h-4 text-white/10" />
                                            </div>
                                            <h4 className="text-xl font-black italic tracking-tighter">DERSLER</h4>
                                        </div>

                                        <div className="space-y-4">
                                            {col.items.length > 0 ? (
                                                col.items.map((act) => (
                                                    <GlassCard key={act.id} className="p-0 border-none bg-gradient-to-br from-white/10 to-transparent hover:scale-105 active:scale-95">
                                                        <div className="p-7 space-y-4">
                                                            <div className="space-y-1">
                                                                <h5 className="text-lg font-bold leading-tight line-clamp-2">{act.name}</h5>
                                                                <div className="flex items-center gap-2">
                                                                    <BookOpen className="w-3 h-3 text-white/20" />
                                                                    <p className="text-[10px] font-black text-white/30 truncate uppercase tracking-widest leading-none">{act.theme}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-[11px] text-white/50 leading-relaxed italic min-h-[5rem] line-clamp-4">
                                                                "{act.content}"
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => { setEditItem(act); setIsScienceOpen(true); }}
                                                                    className="flex-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest flex items-center justify-center gap-2"
                                                                >
                                                                    <Edit3 className="w-3 h-3" /> DÜZENLE
                                                                </button>
                                                                <IconButton icon={Trash2} onClick={() => scienceHandler.remove(act.id)} className="hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-500" />
                                                            </div>
                                                        </div>
                                                        <div className={cn("h-1.5 w-full", idx === 0 ? "bg-emerald-500" : idx === 1 ? "bg-blue-500" : idx === 2 ? "bg-purple-500" : "bg-orange-500")} />
                                                    </GlassCard>
                                                ))
                                            ) : (
                                                <motion.div
                                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                                                    onClick={() => { setEditItem(null); setIsScienceOpen(true); }}
                                                    className="aspect-[4/5] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-white/20 hover:text-white/60 hover:border-white/10 transition-all cursor-pointer group"
                                                >
                                                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:rotate-90 transition-transform duration-700">
                                                        <Plus className="w-8 h-8" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">PLAN OLUŞTUR</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="interactive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                                        <Grid className="w-3 h-3" /> Kütüphane
                                    </div>
                                    <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none uppercase">İnteraktif <span className="text-white/20">MERKEZİ</span></h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex gap-4 items-center bg-white/5 p-1 rounded-2xl border border-white/10">
                                            <div className="pl-4"><Search className="w-4 h-4 text-white/30" /></div>
                                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Uygulama ara..." className="bg-transparent border-0 focus:ring-0 text-xs py-3 w-48 lg:w-80" />
                                        </div>
                                        <button onClick={() => { setEditItem(null); setIsActivityOpen(true); }} className="px-8 bg-white text-black text-xs font-black uppercase rounded-[1.2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> EKLE
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden lg:grid grid-cols-2 gap-4">
                                    {[
                                        { val: stats.total, label: "VARLIK", icon: Database },
                                        { val: stats.interactive, label: "TASARIM", icon: LayoutDashboard }
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 w-40 flex flex-col items-center">
                                            <s.icon className="w-4 h-4 text-white/20 mb-3" />
                                            <span className="text-4xl font-black tracking-tighter">{s.val}</span>
                                            <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((act, i) => (
                                    <GlassCard key={act.id} className="p-0 border-none bg-white/5 hover:bg-white/10 h-full flex flex-col">
                                        <div className="p-8 pb-24 space-y-6 flex-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{act.title}</h3>
                                                <span className="shrink-0 px-3 py-1 bg-white text-black text-[8px] font-black rounded-lg uppercase tracking-widest">{act.category || 'GENEL'}</span>
                                            </div>
                                            <p className="text-xs text-white/40 line-clamp-2 leading-relaxed italic border-l border-white/10 pl-4">"{act.description || 'Açıklama girilmedi.'}"</p>

                                            <div className="aspect-video bg-black/40 rounded-[1.5rem] border border-white/5 relative group overflow-hidden">
                                                {act.html_code ? (
                                                    <iframe srcDoc={act.html_code} className="w-full h-full border-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                                                ) : <div className="absolute inset-0 flex items-center justify-center"><LayoutDashboard className="w-12 h-12 text-white/5" /></div>}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20 backdrop-blur-sm">
                                                    <button onClick={() => setPreviewId(act.id)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-2xl">
                                                        <Eye className="w-7 h-7" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center">
                                            <div className="flex gap-2.5">
                                                <IconButton icon={Copy} onClick={() => navigator.clipboard.writeText(act.html_code)} />
                                                <IconButton icon={Share2} />
                                                <IconButton icon={Edit3} onClick={() => { setEditItem(act); setIsActivityOpen(true); }} />
                                            </div>
                                            <IconButton icon={Trash2} onClick={() => activitiesHandler.remove(act.id)} className="text-rose-500 border-rose-500/10 hover:bg-rose-500/20" />
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* FOOTER */}
            <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-10 py-4 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Sistem Çevrimiçi</span>
                </div>
                <div className="w-[1px] h-5 bg-white/10" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 uppercase">SÜRÜM <span className="text-white/80">2.0 VİTE-PRO</span></div>
                <div className="w-[1px] h-5 bg-white/10" />
                <button className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">
                    <span>YARDIM</span>
                    <HelpCircle className="w-3.5 h-3.5" />
                </button>
            </footer>

            {/* =======================
          MODALS
      ======================= */}
            <Modal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} title={editItem ? "PLAN GÜNCELLE" : "YENİ DERS PLANI"}>
                <form onSubmit={handleScienceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">SINIF SEVİYESİ</label>
                            <select name="class_level" defaultValue={editItem?.class_level || "1. Sınıf"} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none">
                                <option value="1. Sınıf">1. Sınıf</option>
                                <option value="2. Sınıf">2. Sınıf</option>
                                <option value="3. Sınıf">3. Sınıf</option>
                                <option value="4. Sınıf">4. Sınıf</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">HAFTA (1-36)</label>
                                <input name="week_number" type="number" defaultValue={editItem?.week_number || selectedWeek} min="1" max="36" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">SÜRE (HAFTA)</label>
                                <input name="duration_weeks" type="number" defaultValue={editItem?.duration_weeks || 1} min="1" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">DENEY / ETKİNLİK ADI</label>
                            <input name="name" defaultValue={editItem?.name} required placeholder="Örn: Balon Roket deneyi" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">TEMA / KONU</label>
                            <input name="theme" defaultValue={editItem?.theme} required placeholder="Örn: Maddenin Halleri" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">UYGULAMA ADIMLARI</label>
                            <textarea name="content" defaultValue={editItem?.content} required rows={8} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm leading-relaxed" placeholder="Deneyin nasıl yapılacağını buraya yazın..." />
                        </div>
                        <button type="submit" className="w-full p-5 bg-white text-black rounded-3xl font-black uppercase text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Save className="w-5 h-5" /> {editItem ? 'GÜNCELLEMEYİ KAYDET' : 'PLANI OLUŞTUR'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} title={editItem ? "ETKİNLİK DÜZENLE" : "YENİ İNTERAKTİF"}>
                <form onSubmit={handleActivitySubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">ETKİNLİK BAŞLIĞI</label>
                                <input name="title" defaultValue={editItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">KATEGORİ</label>
                                <input name="category" defaultValue={editItem?.category} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" placeholder="Matematik, Fen, vb." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">KISA AÇIKLAMA</label>
                                <textarea name="description" defaultValue={editItem?.description} rows={4} className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">HTML EMBED KODU</label>
                            <textarea name="html_code" defaultValue={editItem?.html_code} required rows={12} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-xs font-mono leading-relaxed" placeholder="<iframe>...</iframe> veya HTML kodunu buraya yapıştırın." />
                        </div>
                    </div>
                    <button type="submit" className="w-full p-5 bg-white text-black rounded-3xl font-black uppercase text-sm flex items-center justify-center gap-3">
                        <Save className="w-5 h-5" /> {editItem ? 'DEĞİŞİKLİKLERİ KAYDET' : 'SİSTEME EKLE'}
                    </button>
                </form>
            </Modal>

            {/* FULL PREVIEW MODAL */}
            <AnimatePresence>
                {previewId && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewId(null)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full h-full bg-black rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                            <div className="absolute top-8 right-8 z-10">
                                <button onClick={() => setPreviewId(null)} className="p-4 bg-white text-black rounded-full hover:scale-110 active:scale-90 transition-all shadow-2xl">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>
                            <iframe srcDoc={activities.find(a => a.id === previewId)?.html_code} className="w-full h-full border-0" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
