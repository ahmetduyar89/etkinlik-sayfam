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
const PortalCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn("bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden relative group", className)}
    >
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const IconButton = ({ icon: Icon, onClick, className }: { icon: any, onClick?: (e: any) => void, className?: string }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={cn("p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all active:scale-95 group", className)}
    >
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
    </button>
);

const Navbar = ({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) => (
    <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
        <div className="container mx-auto max-w-7xl flex justify-between items-center pointer-events-auto bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] px-8 py-3 shadow-sm">
            <div className="flex items-center gap-4">
                <motion.div
                    whileHover={{ rotate: 15 }}
                    className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
                >
                    <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                    <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">Ahmet DUYAR</h1>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Eğitim Portalı</span>
                </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                <button
                    onClick={() => setTab('dashboard')}
                    className={cn(
                        "px-6 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all",
                        activeTab === 'dashboard' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                    )}
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Yıllık Plan
                </button>
                <button
                    onClick={() => setTab('interactive')}
                    className={cn(
                        "px-6 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all",
                        activeTab === 'interactive' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                    )}
                >
                    <Zap className="w-3.5 h-3.5" />
                    İnteraktif
                </button>
            </nav>

            <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 mr-2">
                    <IconButton icon={Search} />
                    <IconButton icon={Settings} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors group">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
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
                    className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-4xl p-8 shadow-2xl overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
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
        <div className="min-h-screen pt-32 pb-16 px-6 text-slate-900 bg-slate-50 selection:bg-indigo-100">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-pink-100/20 blur-[100px] rounded-full" />
            </div>


            <Navbar activeTab={tab} setTab={setTab} />

            <main className="container mx-auto max-w-7xl relative z-10">
                <AnimatePresence mode="wait">
                    {tab === 'dashboard' ? (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                            <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                        <CalendarDays className="w-3 h-3" /> Yıllık Bilim Müfredatı
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">MÜFREDAT <span className="text-slate-300">Akışı</span></h2>
                                    <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                                        1-36 haftalık eğitim-öğretim dönemi için her sınıf düzeyine özel olarak hazırlanmış interaktif deney ve proje planlayıcısı.
                                    </p>
                                </div>

                                <div className="w-full lg:w-auto p-2 bg-white border border-slate-200 rounded-3xl flex items-center gap-4 shadow-sm">
                                    <button onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))} className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
                                    <div className="flex-1 lg:w-48 text-center">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-0.5">Haftalık Görünüm</span>
                                        <span className="text-2xl font-bold tracking-tight text-slate-900">HAFTA <span className="text-indigo-600">#{selectedWeek}</span></span>
                                    </div>
                                    <button onClick={() => setSelectedWeek(Math.min(36, selectedWeek + 1))} className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {filteredScience.map((col, idx) => (
                                    <div key={col.grade} className="space-y-6">
                                        <div className={cn("group p-6 rounded-[1.5rem] border transition-all duration-500 shadow-sm",
                                            idx === 0 ? "bg-emerald-50 border-emerald-100 hover:border-emerald-200" :
                                                idx === 1 ? "bg-blue-50 border-blue-100 hover:border-blue-200" :
                                                    idx === 2 ? "bg-indigo-50 border-indigo-100 hover:border-indigo-200" :
                                                        "bg-orange-50 border-orange-100 hover:border-orange-200"
                                        )}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={cn("text-[10px] font-bold uppercase tracking-wider",
                                                    idx === 0 ? "text-emerald-600" : idx === 1 ? "text-blue-600" : idx === 2 ? "text-indigo-600" : "text-orange-600"
                                                )}>{col.grade}</span>
                                                <BarChart3 className="w-4 h-4 opacity-20" />
                                            </div>
                                            <h4 className="text-lg font-bold tracking-tight text-slate-800">DERSLER</h4>
                                        </div>


                                        <div className="space-y-4">
                                            {col.items.length > 0 ? (
                                                col.items.map((act) => (
                                                    <PortalCard key={act.id} className="p-0 bg-white border-slate-200">
                                                        <div className="p-6 space-y-4">
                                                            <div className="space-y-1">
                                                                <h5 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{act.name}</h5>
                                                                <div className="flex items-center gap-2">
                                                                    <BookOpen className="w-3 h-3 text-slate-300" />
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{act.theme}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed min-h-[5rem] line-clamp-4">
                                                                {act.content}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => { setEditItem(act); setIsScienceOpen(true); }}
                                                                    className="flex-1 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold uppercase transition-all tracking-wider text-slate-600 flex items-center justify-center gap-2"
                                                                >
                                                                    <Edit3 className="w-3 h-3" /> DÜZENLE
                                                                </button>
                                                                <IconButton icon={Trash2} onClick={() => scienceHandler.remove(act.id)} className="hover:bg-rose-50 hover:border-rose-100 text-rose-500" />
                                                            </div>
                                                        </div>
                                                        <div className={cn("h-1 w-full", idx === 0 ? "bg-emerald-500" : idx === 1 ? "bg-blue-500" : idx === 2 ? "bg-indigo-500" : "bg-orange-500")} />
                                                    </PortalCard>
                                                ))
                                            ) : (
                                                <motion.div
                                                    whileHover={{ scale: 1.02, backgroundColor: "white" }}
                                                    onClick={() => { setEditItem(null); setIsScienceOpen(true); }}
                                                    className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-slate-400 hover:border-slate-300 transition-all cursor-pointer bg-slate-50/50"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                                        <Plus className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">PLAN OLUŞTUR</span>
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
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                        <Grid className="w-3 h-3" /> Kütüphane
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-bold tracking-tight leading-none uppercase text-slate-900">İnteraktif <span className="text-slate-300">MERKEZİ</span></h2>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <div className="flex gap-4 items-center bg-white px-4 rounded-2xl border border-slate-200 shadow-sm">
                                            <Search className="w-4 h-4 text-slate-300" />
                                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Uygulama ara..." className="bg-transparent border-0 focus:ring-0 text-sm py-3 w-48 lg:w-80 text-slate-600" />
                                        </div>
                                        <button onClick={() => { setEditItem(null); setIsActivityOpen(true); }} className="px-8 bg-indigo-600 text-white text-xs font-bold uppercase rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> EKLE
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden lg:grid grid-cols-2 gap-4">
                                    {[
                                        { val: stats.total, label: "VARLIK", icon: Database },
                                        { val: stats.interactive, label: "TASARIM", icon: LayoutDashboard }
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 w-36 flex flex-col items-center shadow-sm">
                                            <s.icon className="w-4 h-4 text-slate-200 mb-2" />
                                            <span className="text-3xl font-bold tracking-tight text-slate-900">{s.val}</span>
                                            <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase">{s.label}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((act, i) => (
                                    <PortalCard key={act.id} className="p-0 border border-slate-200 bg-white h-full flex flex-col">
                                        <div className="p-8 pb-24 space-y-6 flex-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="text-xl font-bold tracking-tight uppercase leading-none text-slate-900">{act.title}</h3>
                                                <span className="shrink-0 px-2 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-bold rounded-md uppercase tracking-wider">{act.category || 'GENEL'}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic border-l-2 border-slate-100 pl-4">"{act.description || 'Açıklama girilmedi.'}"</p>

                                            <div className="aspect-video bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                                                {act.html_code ? (
                                                    <iframe srcDoc={act.html_code} className="w-full h-full border-0 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                                                ) : <div className="absolute inset-0 flex items-center justify-center"><LayoutDashboard className="w-10 h-10 text-slate-200" /></div>}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white/40 backdrop-blur-[2px]">
                                                    <button onClick={() => setPreviewId(act.id)} className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-200">
                                                        <Eye className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <IconButton icon={Copy} onClick={() => navigator.clipboard.writeText(act.html_code)} />
                                                <IconButton icon={Share2} />
                                                <IconButton icon={Edit3} onClick={() => { setEditItem(act); setIsActivityOpen(true); }} />
                                            </div>
                                            <IconButton icon={Trash2} onClick={() => activitiesHandler.remove(act.id)} className="text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100" />
                                        </div>
                                    </PortalCard>
                                ))}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* FOOTER */}
            <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full flex items-center gap-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sistem Çevrimiçi</span>
                </div>
                <div className="w-[1px] h-4 bg-slate-200" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SÜRÜM <span className="text-slate-600">2.1 MODERN</span></div>
                <div className="w-[1px] h-4 bg-slate-200" />
                <button className="flex items-center gap-2 group text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors">
                    <span>YARDIM</span>
                    <HelpCircle className="w-3.5 h-3.5" />
                </button>
            </footer>


            {/* =======================
          MODALS
      ======================= */}
            <Modal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} title={editItem ? "PLAN GÜNCELLE" : "YENİ DERS PLANI"}>
                <form onSubmit={handleScienceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SINIF SEVİYESİ</label>
                            <select name="class_level" defaultValue={editItem?.class_level || "1. Sınıf"} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                <option value="1. Sınıf">1. Sınıf</option>
                                <option value="2. Sınıf">2. Sınıf</option>
                                <option value="3. Sınıf">3. Sınıf</option>
                                <option value="4. Sınıf">4. Sınıf</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HAFTA (1-36)</label>
                                <input name="week_number" type="number" defaultValue={editItem?.week_number || selectedWeek} min="1" max="36" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SÜRE (HAFTA)</label>
                                <input name="duration_weeks" type="number" defaultValue={editItem?.duration_weeks || 1} min="1" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DENEY / ETKİNLİK ADI</label>
                            <input name="name" defaultValue={editItem?.name} required placeholder="Örn: Balon Roket deneyi" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TEMA / KONU</label>
                            <input name="theme" defaultValue={editItem?.theme} required placeholder="Örn: Maddenin Halleri" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold" />
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UYGULAMA ADIMLARI</label>
                            <textarea name="content" defaultValue={editItem?.content} required rows={7} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed" placeholder="Deneyin nasıl yapılacağını buraya yazın..." />
                        </div>
                        <button type="submit" className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                            <Save className="w-4 h-4" /> {editItem ? 'DEĞİŞİKLİKLERİ KAYDET' : 'PLANI OLUŞTUR'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} title={editItem ? "ETKİNLİK DÜZENLE" : "YENİ İNTERAKTİF"}>
                <form onSubmit={handleActivitySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ETKİNLİK BAŞLIĞI</label>
                                <input name="title" defaultValue={editItem?.title} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KATEGORİ</label>
                                <input name="category" defaultValue={editItem?.category} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold" placeholder="Matematik, Fen, vb." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KISA AÇIKLAMA</label>
                                <textarea name="description" defaultValue={editItem?.description} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HTML EMBED KODU</label>
                            <textarea name="html_code" defaultValue={editItem?.html_code} required rows={10} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono leading-relaxed" placeholder="<iframe>...</iframe>" />
                        </div>
                    </div>
                    <button type="submit" className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                        <Save className="w-4 h-4" /> {editItem ? 'DEĞİŞİKLİKLERİ KAYDET' : 'SİSTEME EKLE'}
                    </button>
                </form>
            </Modal>


            {/* FULL PREVIEW MODAL */}
            <AnimatePresence>
                {previewId && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full h-full bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl">
                            <div className="absolute top-6 right-6 z-10">
                                <button onClick={() => setPreviewId(null)} className="p-3 bg-white border border-slate-200 text-slate-900 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md">
                                    <X className="w-6 h-6" />
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
