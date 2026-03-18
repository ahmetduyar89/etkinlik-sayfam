import React, { useState, useEffect, useMemo } from 'react';
import {
    Sparkles, Search, ExternalLink, Copy, Share2, Trash2, Edit3, Grid, Filter, Plus,
    LayoutDashboard, ChevronLeft, ChevronRight, Database, BarChart3, CalendarDays,
    Target, Zap, Globe, Settings, Bell, User, ArrowRight, HelpCircle, Eye,
    MoreVertical, X, Save, Clock, BookOpen, Anchor, Book, FlaskConical, Command, Blocks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, useFirestore } from './lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getFormattedHtml = (code?: string) => {
    if (!code) return '';
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body, html {
            margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            background-color: transparent;
        }
        iframe, object, embed, video {
            width: 100% !important; height: 100% !important; border: none !important; margin: 0 !important; padding: 0 !important;
        }
    </style>
</head>
<body>
    ${code}
</body>
</html>`;
};

// =======================
// COMPONENTS
// =======================
const PortalCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div onClick={onClick} className={cn("portal-card overflow-hidden relative group", className)}>
        {children}
    </div>
);

const IconButton = ({ icon: Icon, onClick, className }: { icon: any, onClick?: (e: any) => void, className?: string }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={cn("p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors group", className)}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const Navbar = ({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) => (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
        <div className="container mx-auto max-w-6xl flex justify-between items-center pointer-events-auto glass-effect rounded-2xl px-6 py-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                    <Command className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-semibold tracking-tight text-neutral-900 leading-none">A. Duyar</h1>
                </div>
            </div>

            <nav className="hidden md:flex items-center gap-2 bg-neutral-100/50 p-1 rounded-xl">
                {[
                    { id: 'dashboard', label: 'Müfredat Planı', icon: Book },
                    { id: 'interactive', label: 'İnteraktif Merkez', icon: Blocks }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all duration-200",
                            activeTab === item.id 
                                ? "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-neutral-200/50" 
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50"
                        )}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 mr-2">
                    <IconButton icon={Search} />
                    <IconButton icon={Settings} />
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors">
                    <User className="w-4 h-4 text-neutral-500" />
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
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-3xl p-8 shadow-2xl overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{title}</h3>
                        <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400 hover:text-neutral-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto custom-scroll -mr-2 pr-2">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// =======================
// ACTIVITY CARD COMPONENT
// =======================
const ActivityCard = ({ act, setPreviewId, setEditItem, setIsActivityOpen, activitiesHandler }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <PortalCard className="p-0 h-full flex flex-col justify-between">
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[15px] font-semibold tracking-tight leading-snug text-neutral-900 line-clamp-2">{act.title}</h3>
                    <span className="shrink-0 px-2.5 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-medium rounded-md uppercase tracking-wider border border-neutral-200/50">{act.category || 'Genel'}</span>
                </div>
                
                <p className="text-[13px] text-neutral-500 line-clamp-2 leading-relaxed h-[40px]">{act.description || 'Açıklama girilmedi.'}</p>

                <div 
                    className="aspect-[16/10] bg-neutral-50 rounded-xl border border-neutral-200/60 relative group overflow-hidden flex items-center justify-center cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setPreviewId(act.id)}
                >
                    {act.html_code ? (
                        <>
                            <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-50 transition-colors">
                                <Blocks className="w-8 h-8 text-neutral-300 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            {isHovered && (
                                <iframe 
                                    srcDoc={getFormattedHtml(act.html_code)} 
                                    className="absolute inset-0 w-full h-full border-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white" 
                                    title={act.title}
                                />
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LayoutDashboard className="w-8 h-8 text-neutral-300" />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-neutral-900/5 backdrop-blur-[1px] z-10">
                        <button onClick={(e) => { e.stopPropagation(); setPreviewId(act.id); }} className="w-10 h-10 bg-white border border-neutral-200/50 rounded-full flex items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4 bg-neutral-50/50 border-t border-neutral-100 flex justify-between items-center z-20">
                <div className="flex gap-1">
                    <IconButton icon={Copy} onClick={() => {
                        navigator.clipboard.writeText(act.html_code);
                    }} />
                    <IconButton icon={Share2} onClick={() => {
                        const shareUrl = `${window.location.origin}/legacy/view.html?id=${act.id}`;
                        navigator.clipboard.writeText(shareUrl);
                    }} />
                    <IconButton icon={Edit3} onClick={() => { setEditItem(act); setIsActivityOpen(true); }} />
                </div>
                <IconButton
                    icon={Trash2}
                    onClick={() => {
                        if (window.confirm('Bu interaktif etkinliği silmek istediğinizden emin misiniz?')) {
                            activitiesHandler.remove(act.id);
                        }
                    }}
                    className="hover:bg-red-50 hover:text-red-500 text-neutral-400"
                />
            </div>
        </PortalCard>
    );
};

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

    const inputClasses = "w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-[13px] text-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400";
    const labelClasses = "block text-[11px] font-medium text-neutral-500 uppercase tracking-wide mb-1.5";

    return (
        <div className="min-h-screen pt-28 pb-16 px-4">
            <Navbar activeTab={tab} setTab={setTab} />

            <main className="container mx-auto max-w-6xl relative z-10">
                <AnimatePresence mode="wait">
                    {tab === 'dashboard' ? (
                        <motion.div key="dashboard" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3 }} className="space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Müfredat Planı</h2>
                                    <p className="text-[14px] text-neutral-500 max-w-md leading-relaxed">
                                        1-36 haftalık eğitim-öğretim dönemi için her sınıf düzeyine özel olarak hazırlanmış bilim deney ve proje akışı.
                                    </p>
                                </div>

                                <div className="inline-flex bg-white border border-neutral-200 rounded-xl p-1 shadow-sm">
                                    <button onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="flex flex-col items-center justify-center px-6 min-w-[120px]">
                                        <span className="text-[10px] font-medium uppercase text-neutral-400 tracking-widest hidden md:block mb-0.5">Hafta</span>
                                        <span className="text-lg font-semibold tracking-tight text-neutral-900">{selectedWeek}</span>
                                    </div>
                                    <button onClick={() => setSelectedWeek(Math.min(36, selectedWeek + 1))} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredScience.map((col, idx) => (
                                    <div key={col.grade} className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                                            <h4 className="text-sm font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                                                {col.grade}
                                            </h4>
                                            <span className="text-xs text-neutral-400 font-medium">{col.items.length} Plan</span>
                                        </div>

                                        <div className="space-y-3">
                                            {col.items.length > 0 ? (
                                                col.items.map((act) => (
                                                    <PortalCard key={act.id} className="p-5 flex flex-col gap-4 bg-white">
                                                        <div>
                                                            <div className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                                <FlaskConical className="w-3 h-3" /> {act.theme}
                                                            </div>
                                                            <h5 className="text-[14px] font-medium text-neutral-900 leading-snug">{act.name}</h5>
                                                        </div>
                                                        <p className="text-[12px] text-neutral-500 line-clamp-3 leading-relaxed">
                                                            {act.content}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto">
                                                            <button 
                                                                onClick={() => { setEditItem(act); setIsScienceOpen(true); }}
                                                                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                                                            >
                                                                Düzenle
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    if (window.confirm('Emin misiniz?')) scienceHandler.remove(act.id);
                                                                }}
                                                                className="text-[11px] font-medium text-neutral-400 hover:text-red-500 transition-colors"
                                                            >
                                                                Sil
                                                            </button>
                                                        </div>
                                                    </PortalCard>
                                                ))
                                            ) : (
                                                <button
                                                    onClick={() => { setEditItem(null); setIsScienceOpen(true); }}
                                                    className="w-full h-32 border border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-all group"
                                                >
                                                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[11px] font-medium uppercase tracking-widest">Plan Ekle</span>
                                                </button>
                                            )}
                                            
                                            {col.items.length > 0 && (
                                                <button
                                                    onClick={() => { setEditItem(null); setIsScienceOpen(true); }}
                                                    className="w-full py-2.5 border border-dashed border-neutral-200 hover:border-neutral-300 rounded-xl text-[11px] font-medium text-neutral-500 hover:text-neutral-800 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Yeni Ekle
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="interactive" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3 }}  className="space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">İnteraktif Merkez</h2>
                                    <p className="text-[14px] text-neutral-500 max-w-md leading-relaxed">
                                        HTML tabanlı interaktif içerikler, oyunlar ve testleri barındıran dijital kütüphane.
                                    </p>
                                </div>
                                <div className="flex w-full md:w-auto gap-3 items-center">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input 
                                            value={search} 
                                            onChange={e => setSearch(e.target.value)} 
                                            placeholder="İçerik ara..." 
                                            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-[13px] text-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 shadow-sm"
                                        />
                                    </div>
                                    <button onClick={() => { setEditItem(null); setIsActivityOpen(true); }} className="px-5 py-2 bg-neutral-900 text-white text-[13px] font-medium rounded-xl hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Yeni
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((act, i) => (
                                    <ActivityCard 
                                        key={act.id} 
                                        act={act} 
                                        setPreviewId={setPreviewId} 
                                        setEditItem={setEditItem} 
                                        setIsActivityOpen={setIsActivityOpen} 
                                        activitiesHandler={activitiesHandler} 
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* NEW MINIMALIST FOOTER */}
            <footer className="fixed bottom-0 left-0 right-0 z-[50] py-4 bg-[#FAFAFA]/80 backdrop-blur-md border-t border-neutral-200/50 flex justify-center text-center">
                <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-400">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sistem Aktif</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span>V3 Minimalist Tasarım</span>
                </div>
            </footer>

            {/* MODALS */}
            <Modal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} title={editItem ? "Planı Güncelle" : "Yeni Müfredat Planı"}>
                <form onSubmit={handleScienceSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Sınıf Seviyesi</label>
                            <select name="class_level" defaultValue={editItem?.class_level || "1. Sınıf"} className={inputClasses}>
                                <option value="1. Sınıf">1. Sınıf</option>
                                <option value="2. Sınıf">2. Sınıf</option>
                                <option value="3. Sınıf">3. Sınıf</option>
                                <option value="4. Sınıf">4. Sınıf</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Hafta (1-36)</label>
                                <input name="week_number" type="number" defaultValue={editItem?.week_number || selectedWeek} min="1" max="36" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Süre (Hafta)</label>
                                <input name="duration_weeks" type="number" defaultValue={editItem?.duration_weeks || 1} min="1" className={inputClasses} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Etkinlik Adı</label>
                            <input name="name" defaultValue={editItem?.name} required placeholder="Örn: Balon Roket" className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Tema / Konu</label>
                            <input name="theme" defaultValue={editItem?.theme} required placeholder="Örn: Kuvvet" className={inputClasses} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Uygulama Adımları</label>
                        <textarea name="content" defaultValue={editItem?.content} required rows={5} className={cn(inputClasses, "resize-none")} placeholder="Detaylı adımları girin..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsScienceOpen(false)} className="px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                            İptal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-neutral-900 text-white text-[13px] font-medium rounded-lg hover:bg-neutral-800 transition-colors shadow-sm">
                            {editItem ? 'Değişiklikleri Kaydet' : 'Planı Oluştur'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} title={editItem ? "Etkinliği Güncelle" : "Yeni İnteraktif İçerik"}>
                <form onSubmit={handleActivitySubmit} className="space-y-6">
                    <div>
                        <label className={labelClasses}>Etkinlik Başlığı</label>
                        <input name="title" defaultValue={editItem?.title} required className={inputClasses} placeholder="İlgi çekici bir başlık girin" />
                    </div>
                    
                    <div>
                        <label className={labelClasses}>Kategori</label>
                        <input name="category" defaultValue={editItem?.category} className={inputClasses} placeholder="Matematik, Fen, vb." />
                    </div>
                    
                    <div>
                        <label className={labelClasses}>Kısa Açıklama</label>
                        <textarea name="description" defaultValue={editItem?.description} rows={2} className={cn(inputClasses, "resize-none")} placeholder="Etkinliğin amacını özetleyin" />
                    </div>
                    
                    <div>
                        <label className={labelClasses}>HTML Embed Kodu</label>
                        <textarea name="html_code" defaultValue={editItem?.html_code} required rows={5} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="<iframe src='...'></iframe>" />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsActivityOpen(false)} className="px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                            İptal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-neutral-900 text-white text-[13px] font-medium rounded-lg hover:bg-neutral-800 transition-colors shadow-sm">
                            {editItem ? 'Değişiklikleri Kaydet' : 'Sisteme Ekle'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* FULL PREVIEW MODAL */}
            <AnimatePresence>
                {previewId && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewId(null)} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} className="relative w-full h-full bg-white rounded-2xl border border-neutral-200/50 overflow-hidden shadow-2xl">
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={() => setPreviewId(null)} className="w-10 h-10 bg-white/90 backdrop-blur-md border border-neutral-200/50 text-neutral-900 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors shadow-sm">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <iframe 
                                srcDoc={getFormattedHtml(activities.find(a => a.id === previewId)?.html_code)} 
                                className="w-full h-full border-0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
