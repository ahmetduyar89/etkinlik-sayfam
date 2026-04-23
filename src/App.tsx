import { useCallback, useEffect, useMemo, useState } from 'react';
import { Blocks, LayoutGrid, LayoutList, Plus, Search, Tag, Tags } from 'lucide-react';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                toast.error('Link kopyalanamadı. Tarayıcı izinlerini kontrol edin.');
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
                toast.error('Kopyalanamadı. Tarayıcı izinlerini kontrol edin.');
            }
        },
        [toast]
    );

    const handleRequestDelete = useCallback(
        async (act: Activity) => {
            const ok = await confirm({
                title: 'Etkinliği sil?',
                message: `"${act.title}" adlı etkinlik kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
                confirmLabel: 'Sil',
                cancelLabel: 'Vazgeç',
                variant: 'danger',
            });
            if (!ok) return;
            try {
                await activitiesHandler.remove(act.id);
                toast.success('Etkinlik silindi.');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Etkinlik silinemedi. Lütfen tekrar deneyin.');
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
                console.error('Save error:', err);
                toast.error(
                    'Etkinlik kaydedilemedi. Bağlantınızı kontrol edip tekrar deneyin.'
                );
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
                <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                    <div
                        className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
                        role="status"
                        aria-label="Yükleniyor"
                    />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Etkinlik yükleniyor…
                    </p>
                </div>
            );
        }
        const activity = activities.find((a) => a.id === studentId);
        if (activity) return <StudentPortal act={activity} />;
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl font-black">
                    ?
                </div>
                <h1 className="text-lg font-bold text-slate-700">Etkinlik bulunamadı</h1>
                <p className="text-sm text-slate-500 max-w-sm">
                    Aradığınız etkinlik silinmiş veya bağlantı hatalı olabilir.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-slate-50 relative">
            <div
                aria-hidden="true"
                className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100 via-transparent to-pink-50 opacity-60 pointer-events-none"
            />

            <Navbar />

            <main className="container mx-auto max-w-6xl relative z-10">
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-3">
                            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
                                İnteraktif Merkez
                            </h2>
                            <p className="text-[15px] text-slate-500 max-w-md font-medium leading-relaxed">
                                Oyunlar, testler ve HTML tabanlı eğitici materyallerle dolu
                                dijital havuz.
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto gap-4 items-center">
                            <div className="relative flex-1 md:w-72">
                                <Search
                                    className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                />
                                <label htmlFor="activity-search" className="sr-only">
                                    İçerik ara
                                </label>
                                <input
                                    id="activity-search"
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="İçerik ara..."
                                    className="w-full bg-white border-2 border-indigo-100 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={openCreate}
                                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
                            >
                                <Plus className="w-5 h-5" aria-hidden="true" /> İçerik Ekle
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Blocks className="w-4 h-4" aria-hidden="true" />{' '}
                                {filteredActivities.length} İçerik Bulundu
                            </div>
                            <div
                                role="radiogroup"
                                aria-label="Görünüm modu"
                                className="flex bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-1 gap-1"
                            >
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={viewMode === 'grid'}
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        'p-2 rounded-lg transition-all',
                                        viewMode === 'grid'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'text-slate-400 hover:bg-slate-100'
                                    )}
                                    aria-label="Izgara görünümü"
                                    title="Izgara Görünümü"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={viewMode === 'list'}
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        'p-2 rounded-lg transition-all',
                                        viewMode === 'list'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'text-slate-400 hover:bg-slate-100'
                                    )}
                                    aria-label="Liste görünümü"
                                    title="Liste Görünümü"
                                >
                                    <LayoutList className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {allTags.length > 0 && (
                            <div
                                role="group"
                                aria-label="Etiket filtreleri"
                                className="flex flex-wrap gap-2 py-1"
                            >
                                <button
                                    type="button"
                                    onClick={() => setSelectedTag(null)}
                                    aria-pressed={selectedTag === null}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border',
                                        selectedTag === null
                                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                    )}
                                >
                                    <Tags className="w-3 h-3" aria-hidden="true" /> Tümü
                                </button>
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() =>
                                            setSelectedTag(selectedTag === tag ? null : tag)
                                        }
                                        aria-pressed={selectedTag === tag}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border',
                                            selectedTag === tag
                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                                        )}
                                    >
                                        <Tag className="w-3 h-3" aria-hidden="true" /> {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <div
                                className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
                                role="status"
                                aria-label="Yükleniyor"
                            />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                Yükleniyor…
                            </p>
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                <Blocks className="w-7 h-7" aria-hidden="true" />
                            </div>
                            <h3 className="text-base font-bold text-slate-700">
                                Sonuç bulunamadı
                            </h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                Arama veya etiket filtresini temizleyip yeniden deneyin.
                            </p>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'grid gap-6',
                                viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                            )}
                        >
                            {filteredActivities.map((act) =>
                                viewMode === 'grid' ? (
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
                                ) : (
                                    <ActivityListItem
                                        key={act.id}
                                        act={act}
                                        onOpenPreview={setPreviewId}
                                        onEdit={openEdit}
                                        onRequestDelete={handleRequestDelete}
                                        onShowResults={setShowResultsId}
                                        onCopyLink={handleCopyLink}
                                        onCopyHtml={handleCopyHtml}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>

                <ResultsModal
                    isOpen={!!showResultsId}
                    onClose={() => setShowResultsId(null)}
                    activityId={showResultsId || ''}
                />
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-[50] py-4 bg-[#FAFAFA]/80 backdrop-blur-md border-t border-neutral-200/50 flex justify-center text-center">
                <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-400">
                    <span className="flex items-center gap-1.5">
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            aria-hidden="true"
                        />{' '}
                        Sistem Aktif
                    </span>
                    <span
                        className="w-1 h-1 rounded-full bg-neutral-300"
                        aria-hidden="true"
                    />
                    <span>V3 Minimalist Tasarım</span>
                </div>
            </footer>

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
