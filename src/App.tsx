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

export const getFormattedHtml = (act?: any) => {
    if (!act) return '';
    const { html_code, css_code, js_code, external_libs } = act;
    
    // Build external library scripts and link tags
    const libs = external_libs ? external_libs.split('\n').filter((l: string) => l.trim()).map((lib: string) => {
        if (lib.trim().endsWith('.css')) return `<link rel="stylesheet" href="${lib.trim()}">`;
        return `<script src="${lib.trim()}"></script>`;
    }).join('\n') : '';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${libs}
    <style>
        body, html {
            margin: 0; padding: 0; width: 100vw; min-height: 100vh;
            background-color: transparent;
        }
        ${css_code || ''}
    </style>
    <script>
        // Helper to send answers to the portal
        window.sendAnswer = (data) => {
            window.parent.postMessage({ type: 'SIM_ANSWER', data }, '*');
        };
    </script>
</head>
<body>
    ${html_code || ''}
    <script>
        try {
            ${js_code || ''}
        } catch (e) {
            console.error('Simülasyon Hatası:', e);
        }
    </script>
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

const IconButton = ({ icon: Icon, onClick, className, title }: { icon: any, onClick?: (e: any) => void, className?: string, title?: string }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        title={title}
        className={cn("p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group", className)}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const Navbar = ({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) => (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
        <div className="container mx-auto max-w-6xl flex justify-between items-center pointer-events-auto glass-effect rounded-2xl px-6 py-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Command className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-wider text-slate-800 uppercase">A. Duyar</h1>
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
                            "px-5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all duration-300",
                            activeTab === item.id 
                                ? "bg-white text-indigo-600 shadow-md border border-indigo-100" 
                                : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
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
                    <div className="max-h-[75vh] overflow-y-auto custom-scroll -mr-6 pr-6">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// =======================
// PREVIEW COMPONENTS
// =======================
const LivePreview = ({ act }: { act: any }) => (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-white overflow-hidden rounded-2xl">
        <iframe 
            srcDoc={getFormattedHtml(act)} 
            className="w-[1000px] h-[625px] border-0 origin-top-left scale-[0.28] sm:scale-[0.32] lg:scale-[0.35]"
            title={act?.title}
            loading="lazy"
        />
        <div className="absolute inset-0 bg-transparent" />
    </div>
);

// =======================
// ACTIVITY CARD COMPONENT
// =======================
const ActivityCard = ({ act, setPreviewId, setEditItem, setIsActivityOpen, activitiesHandler, showResultsId, setShowResultsId }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <PortalCard className="p-0 h-full flex flex-col justify-between border-2 border-indigo-50 hover:border-indigo-300 shadow-lg shadow-indigo-100/20">
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[17px] font-bold tracking-tight leading-snug text-slate-800 line-clamp-2">{act.title}</h3>
                    <div className="flex gap-2 shrink-0">
                        {act.is_test && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-md uppercase tracking-widest border border-amber-200">TEST</span>
                        )}
                        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">{act.category || 'Genel'}</span>
                    </div>
                </div>
                
                <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed h-[40px] font-medium">{act.description || 'Açıklama girilmedi.'}</p>

                <div 
                    className="aspect-[16/10] bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 relative group overflow-hidden flex items-center justify-center cursor-pointer shadow-inner"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setPreviewId(act.id)}
                >
                    {act.image_url ? (
                        <div className="absolute inset-0 w-full h-full">
                            <img src={act.image_url} alt={act.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-500" />
                        </div>
                    ) : (act.html_code || act.js_code) ? (
                        <div className="absolute inset-0 w-full h-full transition-all duration-500 overflow-hidden">
                            <LivePreview act={act} />
                            
                            {/* Overlay for better text legibility and interaction feel */}
                            <div className={cn(
                                "absolute inset-0 transition-opacity duration-300",
                                isHovered ? "bg-indigo-900/5" : "bg-transparent"
                            )} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LayoutDashboard className="w-10 h-10 text-indigo-200" />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-indigo-900/10 backdrop-blur-[2px] z-10">
                        <button onClick={(e) => { e.stopPropagation(); setPreviewId(act.id); }} className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-300/50">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t-2 border-slate-100 flex justify-between items-center z-20">
                <div className="flex gap-1">
                    <IconButton icon={Copy} onClick={() => {
                        navigator.clipboard.writeText(act.html_code);
                    }} title="HTML Kodunu Kopyala" />
                    <IconButton icon={Share2} onClick={() => {
                         const studentLink = `${window.location.origin}${window.location.pathname}?view=student&id=${act.id}`;
                         navigator.clipboard.writeText(studentLink);
                         alert('Öğrenci giriş linki kopyalandı!');
                    }} title="Öğrenci Linki Kopyala" />
                    <IconButton icon={Edit3} onClick={() => { setEditItem(act); setIsActivityOpen(true); }} title="Düzenle" />
                    {act.is_test && (
                        <IconButton icon={BarChart3} onClick={() => setShowResultsId(act.id)} className="text-emerald-500 bg-emerald-50 hover:bg-emerald-100" title="Sonuçları Gör" />
                    )}
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
// RESULTS MODAL COMPONENT
// =======================
const ResultsModal = ({ isOpen, onClose, activityId }: { isOpen: boolean, onClose: () => void, activityId: string }) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const submissionsHandler = useFirestore('submissions');

    useEffect(() => {
        if (isOpen) {
            const unsub = submissionsHandler.sync((data) => {
                setSubmissions(data.filter(s => s.activity_id === activityId));
            });
            return unsub;
        }
    }, [isOpen, activityId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Öğrenci Sonuçları">
            <div className="space-y-4">
                {submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-3 font-bold text-slate-600">Öğrenci Adı</th>
                                    <th className="px-4 py-3 font-bold text-slate-600">Başlangıç</th>
                                    <th className="px-4 py-3 font-bold text-slate-600">Teslim Tarihi</th>
                                    <th className="px-4 py-3 font-bold text-slate-600">Puan/Cevaplar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{sub.student_name}</td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px]">{new Date(sub.started_at).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px]">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('tr-TR') : 'Tamamlanmadı'}</td>
                                        <td className="px-4 py-3 font-bold text-indigo-600">
                                            {sub.submitted_at ? (
                                                <div className="space-y-1">
                                                    {Object.keys(sub.answers || {}).length > 0 ? (
                                                        <div className="text-[10px] bg-indigo-50 p-2 rounded-lg font-medium text-indigo-700">
                                                            {JSON.stringify(sub.answers)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400">Cevap yok</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-amber-500">Devam ediyor...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Database className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">Henüz bir katılım bulunmuyor.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// =======================
// STUDENT VIEW COMPONENT
// =======================
const StudentPortal = ({ act }: { act: any }) => {
    const [name, setName] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const submissionsHandler = useFirestore('submissions');

    // Timer logic
    useEffect(() => {
        if (isStarted && act.has_timer && act.duration_minutes) {
            setTimeLeft(parseInt(act.duration_minutes) * 60);
        }
    }, [isStarted, act]);

    useEffect(() => {
        if (timeLeft === 0 && !isFinished) {
            handleSubmit();
        }
        if (timeLeft !== null && timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isFinished]);

    // Listen for answers from simulation
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'SIM_ANSWER' && submissionId) {
                const newAnswer = event.data.data;
                submissionsHandler.update(submissionId, {
                    answers: newAnswer // Simulation should send current full state
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [submissionId]);

    const handleStart = async () => {
        if (!name.trim()) return alert('Lütfen isminizi girin.');
        const res = await submissionsHandler.add({
            activity_id: act.id,
            student_name: name,
            started_at: new Date().toISOString(),
            answers: {},
            submitted_at: null
        });
        setSubmissionId(res.id);
        setIsStarted(true);
    };

    const handleSubmit = async () => {
        if (isFinished) return;
        setIsFinished(true);
        if (submissionId) {
            await submissionsHandler.update(submissionId, {
                submitted_at: new Date().toISOString()
            });
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100">
                    <Zap className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Test Tamamlandı!</h1>
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Cevapların başarıyla kaydedildi.</p>
                </div>
                <p className="text-slate-500 max-w-sm">Dersi takip ettiğin için teşekkürler. Şimdi bu sekmeyi kapatabilirsin.</p>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center space-y-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{act.title}</h1>
                        <p className="text-slate-500 text-sm font-medium">Başlamadan önce lütfen adınızı girin</p>
                    </div>
                    <div className="space-y-4">
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Adınız Soyadınız"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-lg font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                        />
                        <button 
                            onClick={handleStart}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-200"
                        >
                            Teste Başla
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden">
            <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-700">{name}</span>
                </div>
                
                {act.has_timer && timeLeft !== null && (
                    <div className={cn(
                        "font-black tabular-nums transition-colors px-4 py-2 rounded-xl flex items-center gap-2",
                        timeLeft < 60 ? "bg-red-50 text-red-500 animate-pulse" : "bg-slate-50 text-slate-600"
                    )}>
                        <Clock className="w-4 h-4" />
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                )}
                
                <button onClick={handleSubmit} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                    Sınavı Bitir
                </button>
            </header>
            
            <main className="flex-1 min-h-0 bg-slate-50 p-4">
                <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative">
                    <iframe 
                        srcDoc={getFormattedHtml(act)} 
                        className="w-full h-full border-0" 
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen 
                    />
                </div>
            </main>
        </div>
    );
};

// =======================
// MAIN APP COMPONENT
// =======================
export default function App() {
    const params = new URLSearchParams(window.location.search);
    const [tab, setTab] = useState('dashboard');
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [activities, setActivities] = useState<any[]>([]);
    const [science, setScience] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [showResultsId, setShowResultsId] = useState<string | null>(null);

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
        
        // Handle checkbox values explicitly
        const finalPayload = {
            ...payload,
            is_test: formData.get('is_test') === 'on',
            has_timer: formData.get('has_timer') === 'on',
        };

        if (editItem) {
            await activitiesHandler.update(editItem.id, finalPayload);
        } else {
            await activitiesHandler.add(finalPayload);
        }
        setIsActivityOpen(false);
        setEditItem(null);
    };

    const inputClasses = "w-full bg-white border-2 border-indigo-50 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400";
    const labelClasses = "block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2";

    const getColColor = (idx: number) => {
        switch(idx) {
            case 0: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hover: 'hover:border-emerald-300', icon: 'text-emerald-500', button: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' };
            case 1: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', hover: 'hover:border-blue-300', icon: 'text-blue-500', button: 'bg-blue-100 text-blue-700 hover:bg-blue-200' };
            case 2: return { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', hover: 'hover:border-violet-300', icon: 'text-violet-500', button: 'bg-violet-100 text-violet-700 hover:bg-violet-200' };
            case 3: return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', hover: 'hover:border-orange-300', icon: 'text-orange-500', button: 'bg-orange-100 text-orange-700 hover:bg-orange-200' };
            default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', hover: 'hover:border-slate-300', icon: 'text-slate-500', button: 'bg-slate-100 text-slate-700 hover:bg-slate-200' };
        }
    };

    if (params.get('view') === 'student' && params.get('id')) {
        const activity = activities.find(a => a.id === params.get('id'));
        if (activity) return <StudentPortal act={activity} />;
        return <div className="p-20 text-center font-bold text-slate-400">Etkinlik bulunamadı veya silinmiş olabilir.</div>;
    }

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-slate-50 relative">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100 via-transparent to-pink-50 opacity-60 pointer-events-none" />
            
            <Navbar activeTab={tab} setTab={setTab} />

            <main className="container mx-auto max-w-6xl relative z-10">
                <AnimatePresence mode="wait">
                    {tab === 'dashboard' ? (
                        <motion.div key="dashboard" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3 }} className="space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-[11px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
                                        <CalendarDays className="w-3.5 h-3.5" /> Yıllık Bilim Müfredatı
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">Müfredat Planı</h2>
                                    <p className="text-[15px] text-slate-500 max-w-md font-medium leading-relaxed">
                                        1-36 haftalık eğitim-öğretim dönemi için her sınıf düzeyine özel olarak hazırlanmış bilim deney ve proje akışı.
                                    </p>
                                </div>

                                <div className="inline-flex bg-white border-2 border-indigo-50 rounded-2xl p-1.5 shadow-lg shadow-indigo-100/50">
                                    <button onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))} className="p-3 rounded-xl hover:bg-indigo-50 transition-colors text-indigo-600">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex flex-col items-center justify-center px-8 min-w-[140px]">
                                        <span className="text-[11px] font-bold uppercase text-indigo-400 tracking-widest hidden md:block mb-1">HAFTA</span>
                                        <span className="text-2xl font-black tracking-tight text-indigo-700">{selectedWeek}</span>
                                    </div>
                                    <button onClick={() => setSelectedWeek(Math.min(36, selectedWeek + 1))} className="p-3 rounded-xl hover:bg-indigo-50 transition-colors text-indigo-600">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredScience.map((col, idx) => {
                                    const colors = getColColor(idx);
                                    return (
                                    <div key={col.grade} className={cn("flex flex-col gap-4 p-5 rounded-3xl border-2 shadow-sm transition-all", colors.bg, colors.border, colors.hover)}>
                                        <div className="flex items-center justify-between pb-3 border-b-2 border-inherit">
                                            <h4 className={cn("text-lg font-black tracking-tight flex items-center gap-2", colors.text)}>
                                                {col.grade}
                                            </h4>
                                            <span className={cn("text-xs font-bold px-3 py-1 bg-white rounded-full shadow-sm", colors.text)}>{col.items.length} Plan</span>
                                        </div>

                                        <div className="space-y-4">
                                            {col.items.length > 0 ? (
                                                col.items.map((act) => (
                                                    <PortalCard key={act.id} className="p-5 flex flex-col gap-4 bg-white border-2 hover:border-indigo-300 shadow-md !rounded-2xl">
                                                        <div>
                                                            <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5", colors.text)}>
                                                                <FlaskConical className="w-3.5 h-3.5" /> {act.theme}
                                                            </div>
                                                            <h5 className="text-[16px] font-bold text-slate-800 leading-snug">{act.name}</h5>
                                                        </div>
                                                        <p className="text-[13px] text-slate-600 font-medium line-clamp-3 leading-relaxed">
                                                            {act.content}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100 mt-auto">
                                                            <button 
                                                                onClick={() => { setEditItem(act); setIsScienceOpen(true); }}
                                                                className={cn("text-[11px] font-bold uppercase transition-colors", colors.text)}
                                                            >
                                                                Düzenle
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    if (window.confirm('Emin misiniz?')) scienceHandler.remove(act.id);
                                                                }}
                                                                className="text-[11px] font-bold uppercase text-red-400 hover:text-red-600 transition-colors"
                                                            >
                                                                Sil
                                                            </button>
                                                        </div>
                                                    </PortalCard>
                                                ))
                                            ) : (
                                                <button
                                                    onClick={() => { setEditItem(null); setIsScienceOpen(true); }}
                                                    className={cn("w-full h-32 border-2 border-dashed bg-white shadow-sm hover:shadow-md rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group", colors.border, colors.text)}
                                                >
                                                    <div className={cn("p-2 rounded-xl", colors.button)}>
                                                        <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                                    </div>
                                                    <span className="text-[12px] font-black uppercase tracking-widest">Plan Ekle</span>
                                                </button>
                                            )}
                                            
                                            {col.items.length > 0 && (
                                                <button
                                                    onClick={() => { setEditItem(null); setIsScienceOpen(true); }}
                                                    className={cn("w-full py-3.5 border-2 border-dashed bg-white shadow-sm hover:shadow-md rounded-2xl text-[12px] font-black uppercase transition-all flex items-center justify-center gap-2", colors.border, colors.text)}
                                                >
                                                    <Plus className="w-4 h-4" /> Yeni Ekle
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="interactive" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3 }}  className="space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-[11px] font-bold uppercase tracking-wider text-violet-700 shadow-sm">
                                        <Grid className="w-3.5 h-3.5" /> Dijital İçerikler
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">İnteraktif Merkez</h2>
                                    <p className="text-[15px] text-slate-500 max-w-md font-medium leading-relaxed">
                                        Oyunlar, testler ve HTML tabanlı eğitici materyallerle dolu dijital havuz.
                                    </p>
                                </div>
                                <div className="flex w-full md:w-auto gap-4 items-center">
                                    <div className="relative flex-1 md:w-72">
                                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            value={search} 
                                            onChange={e => setSearch(e.target.value)} 
                                            placeholder="İçerik ara..." 
                                            className="w-full bg-white border-2 border-indigo-100 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                        />
                                    </div>
                                    <button onClick={() => { setEditItem(null); setIsActivityOpen(true); }} className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 whitespace-nowrap">
                                        <Plus className="w-5 h-5" /> İçerik Ekle
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
                                        showResultsId={showResultsId}
                                        setShowResultsId={setShowResultsId}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <ResultsModal isOpen={!!showResultsId} onClose={() => setShowResultsId(null)} activityId={showResultsId || ''} />
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
                        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200">
                            {editItem ? 'Değişiklikleri Kaydet' : 'Planı Oluştur'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} title={editItem ? "Etkinliği Güncelle" : "Yeni İnteraktif İçerik"}>
                <form onSubmit={handleActivitySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Etkinlik Başlığı</label>
                            <input name="title" defaultValue={editItem?.title} required className={inputClasses} placeholder="İlgi çekici bir başlık girin" />
                        </div>
                        <div>
                            <label className={labelClasses}>Önizleme Görseli (URL)</label>
                            <input name="image_url" defaultValue={editItem?.image_url} className={inputClasses} placeholder="Görsel URL'si (Örn: https://.../resim.jpg)" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Kategori</label>
                            <input name="category" defaultValue={editItem?.category} className={inputClasses} placeholder="Matematik, Fen, vb." />
                        </div>
                        <div>
                            <label className={labelClasses}>Kısa Açıklama</label>
                            <textarea name="description" defaultValue={editItem?.description} rows={2} className={cn(inputClasses, "resize-none")} placeholder="Etkinliğin amacını özetleyin" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 py-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" name="is_test" defaultChecked={editItem?.is_test} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className={labelClasses.replace('mb-2', '')}>Test Modu</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group ml-4">
                                <div className="relative">
                                    <input type="checkbox" name="has_timer" defaultChecked={editItem?.has_timer} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className={labelClasses.replace('mb-2', '')}>Süre Sınırı</span>
                            </label>
                        </div>
                        
                        <div>
                            <input name="duration_minutes" type="number" defaultValue={editItem?.duration_minutes || 20} placeholder="Süre (Dakika)" className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>HTML Kodu</label>
                            <textarea name="html_code" defaultValue={editItem?.html_code} rows={5} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="<div id='uygulama'></div>" />
                        </div>
                        <div>
                            <label className={labelClasses}>JavaScript Kodu</label>
                            <textarea name="js_code" defaultValue={editItem?.js_code} rows={5} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="// console.log('Merhaba Dünya');" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>CSS Kodu (Opsiyonel)</label>
                            <textarea name="css_code" defaultValue={editItem?.css_code} rows={3} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="body { background: #f0f; }" />
                        </div>
                        <div>
                            <label className={labelClasses}>Dış Kütüphaneler (Her satıra bir link)</label>
                            <textarea name="external_libs" defaultValue={editItem?.external_libs} rows={3} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js" />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsActivityOpen(false)} className="px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                            İptal
                        </button>
                        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200">
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
                                srcDoc={getFormattedHtml(activities.find(a => a.id === previewId))} 
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
