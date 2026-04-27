import { useCallback, useEffect, useMemo, useState } from 'react';
import { Blocks, LayoutGrid, LayoutList, Plus, Search, Tag, Tags, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFirestore } from './lib/firebase';
import { cn } from './utils/cn';
import { useDebounce } from './hooks/useDebounce';
import { Navbar } from './components/common/Navbar';
import { Modal } from './components/common/Modal';
import { useToast } from './components/common/ToastProvider';
import { useConfirm } from './components/common/ConfirmDialog';
import { ActivityCard } from './components/activities/ActivityCard';
import { ActivityListItem } from './components/activities/ActivityListItem';
import { ResultsModal } from './components/activities/ResultsModal';
import { ActivityForm, type ActivityFormValues } from './components/activities/ActivityForm';
import { ActivityPreviewModal } from './components/activities/ActivityPreviewModal';
import { StudentPortal } from './components/student/StudentPortal';
import type { Activity } from './types';

export default function App() {
    const params = new URLSearchParams(window.location.search);
    const isStudentView = params.get('view') === 'student' && !!params.get('id');
    const studentId = params.get('id');

    const [activities, setActivities] = useState<Activity[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 200);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [showResultsId, setShowResultsId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [editItem, setEditItem] = useState<Activity | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activitiesHandler = useFirestore<Activity>('activities');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        const unsub = activitiesHandler.sync((data) => {
            setActivities(data);
            setIsLoading(false);
        });
        return () => {
            unsub();
        };
    }, []);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        activities.forEach((a) => {
            if (a.tags) {
                a.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .forEach((t) => tagSet.add(t));
            }
        });
        return Array.from(tagSet).sort();
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const needle = debouncedSearch.toLowerCase();
        return activities.filter((a) => {
            const titleMatch = (a.title || '').toLowerCase().includes(needle);
            if (!titleMatch) return false;
            if (!selectedTag) return true;
            const tags = a.tags
                ? a.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [];
            return tags.includes(selectedTag);
        });
    }, [activities, debouncedSearch, selectedTag]);

    const openEdit = useCallback((act: Activity) => {
        setEditItem(act);
        setIsActivityOpen(true);
    }, []);

    const openCreate = useCallback(() => {
        setEditItem(null);
        setIsActivityOpen(true);
    }, []);

    const handleCopyLink = useCallback(
        async (act: Activity) => {
            const link = `${window.location.origin}${window.location.pathname}?view=student&id=${act.id}`;
            try {
                await navigator.clipboard.writeText(link);
                toast.success('Öğrenci giriş linki kopyalandı.');
            } catch {
                toast.error('Link kopyalanamadı.');
            }
        },
        [toast]
    );

    const handleCopyHtml = useCallback(
        async (act: Activity) => {
            try {
                await navigator.clipboard.writeText(act.html_code || '');
                toast.success('HTML kodu kopyalandı.');
            } catch {
                toast.error('Kopyalanamadı.');
            }
        },
        [toast]
    );

    const handleRequestDelete = useCallback(
        async (act: Activity) => {
            const ok = await confirm({
                title: 'Etkinliği sil?',
                message: `"${act.title}" adlı etkinlik kalıcı olarak silinecek.`,
                confirmLabel: 'Sil',
                cancelLabel: 'Vazgeç',
                variant: 'danger',
            });
            if (!ok) return;
            try {
                await activitiesHandler.remove(act.id);
                toast.success('Etkinlik silindi.');
            } catch (err) {
                toast.error('Etkinlik silinemedi.');
            }
        },
        [activitiesHandler, confirm, toast]
    );

    const handleActivitySubmit = useCallback(
        async (values: ActivityFormValues) => {
            setIsSubmitting(true);
            try {
                if (editItem) {
                    await activitiesHandler.update(editItem.id, values);
                    toast.success('Etkinlik güncellendi.');
                } else {
                    await activitiesHandler.add(values);
                    toast.success('Etkinlik eklendi.');
                }
                setIsActivityOpen(false);
                setEditItem(null);
            } catch (err) {
                toast.error('Etkinlik kaydedilemedi.');
            } finally {
                setIsSubmitting(false);
            }
        },
        [editItem, activitiesHandler, toast]
    );

    const currentPreview = previewId
        ? activities.find((a) => a.id === previewId) ?? null
        : null;

    if (isStudentView) {
        if (isLoading) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0b1326]">
                    <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Yükleniyor…</p>
                </div>
            );
        }
        const activity = activities.find((a) => a.id === studentId);
        if (activity) return <StudentPortal act={activity} />;
    }

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-white pb-24 md:pb-0">
            <Navbar />

            <main className="max-w-screen-2xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-2 text-white">
                                <span className="material-symbols-outlined text-primary">tune</span> Filtreler
                            </h3>
                            
                            <div className="space-y-8">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="font-label-md text-label-md text-slate-400 uppercase tracking-widest text-[10px]">İçerik Ara</label>
                                    <div className="relative">
                                        <input 
                                            className="w-full bg-surface-container-highest border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-tertiary transition-all" 
                                            placeholder="Simülasyon, test..." 
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">search</span>
                                    </div>
                                </div>

                                {/* Categories / Tags */}
                                <div className="space-y-3">
                                    <label className="font-label-md text-label-md text-slate-400 uppercase tracking-widest text-[10px]">Etiketler</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            onClick={() => setSelectedTag(null)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full font-label-md text-xs transition-all",
                                                selectedTag === null ? "bg-primary-container text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                                            )}
                                        >
                                            Tümü
                                        </button>
                                        {allTags.map(tag => (
                                            <button 
                                                key={tag}
                                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full font-label-md text-xs transition-all",
                                                    selectedTag === tag ? "bg-primary-container text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={openCreate}
                                    className="w-full py-4 bg-gradient-to-br from-primary-container to-secondary-container text-white font-bold rounded-xl shadow-xl shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> İçerik Ekle
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="flex-1 space-y-8">
                        {/* Header & View Switcher */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="font-headline-xl text-headline-xl text-white tracking-tight">Etkinlikleri Keşfet</h1>
                                <p className="text-body-lg text-slate-400">{filteredActivities.length} interaktif içerik bulundu</p>
                            </div>
                            
                            <div className="flex items-center gap-2 glass-card p-1 rounded-xl">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === 'grid' ? "bg-primary-container text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === 'list' ? "bg-primary-container text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    <LayoutList className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Yükleniyor…</p>
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="py-20 glass-card rounded-3xl flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 text-slate-400 flex items-center justify-center">
                                    <Blocks className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Sonuç bulunamadı</h3>
                                    <p className="text-slate-400 max-w-sm mt-1">Arama veya filtreleri temizleyip tekrar deneyin.</p>
                                </div>
                            </div>
                        ) : (
                            <div className={cn(
                                "grid gap-8",
                                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                            )}>
                                {filteredActivities.map((act) => (
                                    <ActivityCard 
                                        key={act.id}
                                        act={act}
                                        onOpenPreview={setPreviewId}
                                        onEdit={openEdit}
                                        onRequestDelete={handleRequestDelete}
                                        onShowResults={setShowResultsId}
                                        onCopyLink={handleCopyLink}
                                        onCopyHtml={handleCopyHtml}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 full-width py-12 px-8 border-t border-white/5 mt-20 text-center md:text-left">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <div className="text-2xl font-black text-white font-headline-xl italic tracking-tighter">Ahmet DUYAR</div>
                        <p className="font-body-md text-sm text-slate-500 leading-relaxed max-w-xs">Eğitimi interaktif ve eğlenceli hale getiren yeni nesil simülasyon platformu.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 font-headline-md text-lg">Hızlı Erişim</h4>
                        <ul className="space-y-3">
                            <li><a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">Keşfet</a></li>
                            <li><a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">Kategoriler</a></li>
                            <li><a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">Ders Notları</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6 font-headline-md text-lg">Destek</h4>
                        <ul className="space-y-3">
                            <li><a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">Yardım Merkezi</a></li>
                            <li><a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">İletişim</a></li>
                            <li><a className="text-sm text-slate-500 hover:text-primary transition-all" href="#">Gizlilik Politikası</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold mb-6 font-headline-md text-lg">Bülten</h4>
                        <p className="text-sm text-slate-500">Yeni etkinliklerden haberdar olun.</p>
                        <div className="flex gap-2">
                            <input className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-1 focus:ring-primary" placeholder="E-posta adresi" type="email"/>
                            <button className="bg-primary-container text-white px-4 py-2 rounded-lg hover:bg-primary-container/80 transition-all">Abone Ol</button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-sm text-slate-500">© 2024 Ahmet DUYAR. Tüm hakları saklıdır.</p>
                </div>
            </footer>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl md:hidden z-50">
                <button className="flex flex-col items-center text-primary-container">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Ana Sayfa</span>
                </button>
                <button className="flex flex-col items-center text-slate-500">
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Ara</span>
                </button>
                <button onClick={openCreate} className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center text-white -mt-12 shadow-xl shadow-primary-container/40 border-4 border-[#0b1326]">
                    <Plus className="w-6 h-6" />
                </button>
                <button className="flex flex-col items-center text-slate-500">
                    <span className="material-symbols-outlined">favorite</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Favoriler</span>
                </button>
                <button className="flex flex-col items-center text-slate-500">
                    <span className="material-symbols-outlined">account_circle</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Profil</span>
                </button>
            </nav>

            <ResultsModal
                isOpen={!!showResultsId}
                onClose={() => setShowResultsId(null)}
                activityId={showResultsId || ''}
            />

            <Modal
                isOpen={isActivityOpen}
                onClose={() => {
                    setIsActivityOpen(false);
                    setEditItem(null);
                }}
                title={editItem ? 'Etkinliği Güncelle' : 'Yeni İnteraktif İçerik'}
            >
                <ActivityForm
                    editItem={editItem}
                    isSubmitting={isSubmitting}
                    onSubmit={handleActivitySubmit}
                    onCancel={() => {
                        setIsActivityOpen(false);
                        setEditItem(null);
                    }}
                />
            </Modal>

            {currentPreview && (
                <ActivityPreviewModal
                    activity={currentPreview}
                    onClose={() => setPreviewId(null)}
                />
            )}
        </div>
    );
}
