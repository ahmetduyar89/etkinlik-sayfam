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
import {
    GRADE_LEVELS,
    SUBJECTS,
    formatGradeLevel,
    getGradeSortIndex,
    getSubjectSortIndex,
} from './constants/education';
import type { Activity } from './types';

const MOCK_ACTIVITIES: Activity[] = [
    {
        id: 'mock1',
        title: 'Kuantum Alanları',
        description: 'Elektronların gizemli dünyasını interaktif simülasyonla deneyimleyin.',
        category: 'Simülasyon',
        subject: 'Fizik',
        grade_level: '12',
        tags: 'kuantum, fizik, atom',
        is_test: false,
        image_url: '/images/quantum_glow.png',
    },
    {
        id: 'mock2',
        title: 'Genetik Temeller',
        description: 'DNA sarmalı ve kalıtımın mekanizmalarını derinlemesine inceleyin.',
        category: 'Ders Notları',
        subject: 'Biyoloji',
        grade_level: '10',
        tags: 'dna, genetik, biyoloji',
        is_test: false,
        image_url: '/images/dna_helix.png',
    },
    {
        id: 'mock3',
        title: 'Mars Kolonisi',
        description: 'Kızıl gezegende sürdürülebilir bir yaşam alanı inşa etme simülasyonu.',
        category: 'Simülasyon',
        subject: 'Uzay Bilimleri',
        grade_level: '9',
        tags: 'mars, uzay, koloni',
        is_test: false,
    },
    {
        id: 'mock4',
        title: 'Asit-Baz Dengesi',
        description: 'Etkileşimli titrasyon deneyi.',
        category: 'Laboratuvar',
        subject: 'Kimya',
        grade_level: '11',
        tags: 'kimya, asit, baz',
        is_test: false,
    },
    {
        id: 'mock5',
        title: 'Haftalık Test',
        description: 'Fizik ve Kimya üzerine haftalık değerlendirme testi.',
        category: 'Test',
        subject: 'Fizik & Kimya',
        grade_level: 'Tümü',
        tags: 'fizik, kimya, test',
        is_test: true,
    },
    {
        id: 'mock6',
        title: 'Küresel Isınma Haritası',
        description: 'Son 50 yıldaki iklim değişikliği verilerini dünya haritası üzerinde inceleyin.',
        category: 'Simülasyon',
        subject: 'Coğrafya',
        grade_level: '9',
        tags: 'iklim, dünya, çevre',
        is_test: false,
        image_url: '/images/holo_world_map.png',
    },
    {
        id: 'mock7',
        title: 'Matematik Lab',
        description: 'Matematik formüllerini görselleştirin.',
        category: 'Laboratuvar',
        subject: 'Matematik',
        grade_level: '8',
        tags: 'matematik, geometri',
        is_test: false,
    },
    {
        id: 'mock8',
        title: 'Zihin Oyunları',
        description: 'Mantık ve problem çözme becerilerinizi geliştirin.',
        category: 'Oyun',
        subject: 'Genel Kültür',
        grade_level: 'Tümü',
        tags: 'mantık, bulmaca',
        is_test: false,
    },
    {
        id: 'mock9',
        title: 'Mikro Dünya',
        description: 'Mikroskobik organizmaları keşfedin.',
        category: 'Laboratuvar',
        subject: 'Biyoloji',
        grade_level: '10',
        tags: 'mikroskop, hücre',
        is_test: false,
    }
];



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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [editItem, setEditItem] = useState<Activity | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFilterGroup, setActiveFilterGroup] = useState<'category' | 'grade' | 'subject' | 'tag'>('category');

    const activitiesHandler = useFirestore<Activity>('activities');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        const unsub = activitiesHandler.sync((data) => {
            if (data && data.length > 0) {
                setActivities(data);
            } else {
                setActivities(MOCK_ACTIVITIES);
            }
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

    const allCategories = useMemo(() => {
        const categorySet = new Set<string>();
        activities.forEach((a) => categorySet.add(a.category?.trim() || 'Genel'));
        return Array.from(categorySet).sort((a, b) => a.localeCompare(b, 'tr'));
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const needle = debouncedSearch.trim().toLocaleLowerCase('tr');
        return activities.filter((a) => {
            const haystack = [
                a.title,
                a.description,
                a.category,
                a.grade_level ? formatGradeLevel(a.grade_level) : '',
                a.subject,
                a.tags,
            ]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase('tr');
            if (needle && !haystack.includes(needle)) return false;
            if (selectedCategory && (a.category?.trim() || 'Genel') !== selectedCategory) return false;
            if (selectedGradeLevel && a.grade_level !== selectedGradeLevel) return false;
            if (selectedSubject && a.subject !== selectedSubject) return false;
            if (!selectedTag) return true;
            const tags = a.tags
                ? a.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [];
            return tags.includes(selectedTag);
        });
    }, [activities, debouncedSearch, selectedCategory, selectedGradeLevel, selectedSubject, selectedTag]);

    const groupedActivities = useMemo(() => {
        const categoryGroups = new Map<string, Activity[]>();
        filteredActivities.forEach((activity) => {
            const category = activity.category?.trim() || 'Genel';
            const current = categoryGroups.get(category) || [];
            current.push(activity);
            categoryGroups.set(category, current);
        });

        return Array.from(categoryGroups.entries())
            .sort(([a], [b]) => a.localeCompare(b, 'tr'))
            .map(([category, categoryActivities]) => {
                const educationGroups = new Map<string, Activity[]>();
                categoryActivities.forEach((activity) => {
                    const label = `${formatGradeLevel(activity.grade_level)} / ${activity.subject || 'Ders yok'}`;
                    const current = educationGroups.get(label) || [];
                    current.push(activity);
                    educationGroups.set(label, current);
                });
                return [
                    category,
                    Array.from(educationGroups.entries()).sort(([, aItems], [, bItems]) => {
                        const a = aItems[0];
                        const b = bItems[0];
                        const gradeDiff = getGradeSortIndex(a?.grade_level) - getGradeSortIndex(b?.grade_level);
                        if (gradeDiff !== 0) return gradeDiff;
                        const subjectDiff = getSubjectSortIndex(a?.subject) - getSubjectSortIndex(b?.subject);
                        if (subjectDiff !== 0) return subjectDiff;
                        return (a?.subject || '').localeCompare(b?.subject || '', 'tr');
                    }),
                ] as const;
            });
    }, [filteredActivities]);

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
        <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-white pb-24 md:pb-0">
            <Navbar />

            <main className="max-w-[1440px] mx-auto px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Sidebar Filters (Redesigned to match Visual exactly) */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 pt-2">
                        <div className="space-y-1 mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">Filtreler</h2>
                            <p className="text-xs text-[#8c909f] font-medium">Aramanızı daraltın</p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {/* Content Type (Category) Button */}
                            <button 
                                onClick={() => setActiveFilterGroup(activeFilterGroup === 'category' ? null as any : 'category')}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-extrabold transition-all text-left uppercase tracking-wider",
                                    activeFilterGroup === 'category' 
                                        ? "bg-[#571bc1] text-white shadow-lg shadow-[#571bc1]/20" 
                                        : "text-[#c2c6d6] hover:bg-white/5"
                                )}
                            >
                                <span className="material-symbols-outlined !text-[20px]">widgets</span>
                                <span>İçerik Türü</span>
                            </button>
                            
                            {activeFilterGroup === 'category' && (
                                <div className="pl-6 pr-2 py-2 flex flex-col gap-1 animate-fade-in border-l border-white/10 ml-6">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={cn(
                                            "text-left px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors",
                                            selectedCategory === null ? "text-white bg-white/10" : "text-[#c2c6d6] hover:text-white"
                                        )}
                                    >
                                        Tümü
                                    </button>
                                    {allCategories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                                            className={cn(
                                                "text-left px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors",
                                                selectedCategory === category ? "text-[#adc6ff] bg-white/10" : "text-[#c2c6d6] hover:text-white"
                                            )}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Grade Levels Button */}
                            <button 
                                onClick={() => setActiveFilterGroup(activeFilterGroup === 'grade' ? null as any : 'grade')}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-extrabold transition-all text-left uppercase tracking-wider",
                                    activeFilterGroup === 'grade' 
                                        ? "bg-[#571bc1] text-white shadow-lg shadow-[#571bc1]/20" 
                                        : "text-[#c2c6d6] hover:bg-white/5"
                                )}
                            >
                                <span className="material-symbols-outlined !text-[20px]">school</span>
                                <span>Sınıf Seviyeleri</span>
                            </button>

                            {activeFilterGroup === 'grade' && (
                                <div className="pl-6 py-2 grid grid-cols-3 gap-2 border-l border-white/10 ml-6">
                                    {GRADE_LEVELS.map(grade => (
                                        <button
                                            key={grade}
                                            onClick={() => setSelectedGradeLevel(selectedGradeLevel === grade ? null : grade)}
                                            className={cn(
                                                "py-2 rounded-lg text-xs font-bold text-center transition-all border",
                                                selectedGradeLevel === grade ? "bg-[#adc6ff] text-[#002e6a] border-[#adc6ff]" : "bg-white/5 text-[#c2c6d6] border-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Subjects Button */}
                            <button 
                                onClick={() => setActiveFilterGroup(activeFilterGroup === 'subject' ? null as any : 'subject')}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-extrabold transition-all text-left uppercase tracking-wider",
                                    activeFilterGroup === 'subject' 
                                        ? "bg-[#571bc1] text-white shadow-lg shadow-[#571bc1]/20" 
                                        : "text-[#c2c6d6] hover:bg-white/5"
                                )}
                            >
                                <span className="material-symbols-outlined !text-[20px]">menu_book</span>
                                <span>Dersler</span>
                            </button>

                            {activeFilterGroup === 'subject' && (
                                <div className="pl-6 pr-2 py-2 flex flex-col gap-1 border-l border-white/10 ml-6">
                                    <button
                                        onClick={() => setSelectedSubject(null)}
                                        className={cn(
                                            "text-left px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors",
                                            selectedSubject === null ? "text-white bg-white/10" : "text-[#c2c6d6] hover:text-white"
                                        )}
                                    >
                                        Tümü
                                    </button>
                                    {SUBJECTS.map(subject => (
                                        <button
                                            key={subject}
                                            onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
                                            className={cn(
                                                "text-left px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors",
                                                selectedSubject === subject ? "text-[#adc6ff] bg-white/10" : "text-[#c2c6d6] hover:text-white"
                                            )}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tags Button */}
                            <button 
                                onClick={() => setActiveFilterGroup(activeFilterGroup === 'tag' ? null as any : 'tag')}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-extrabold transition-all text-left uppercase tracking-wider",
                                    activeFilterGroup === 'tag' 
                                        ? "bg-[#571bc1] text-white shadow-lg shadow-[#571bc1]/20" 
                                        : "text-[#c2c6d6] hover:bg-white/5"
                                )}
                            >
                                <span className="material-symbols-outlined !text-[20px]">sell</span>
                                <span>Etiketler</span>
                            </button>

                            {activeFilterGroup === 'tag' && (
                                <div className="pl-6 pr-2 py-2 flex flex-wrap gap-2 border-l border-white/10 ml-6">
                                    <button
                                        onClick={() => setSelectedTag(null)}
                                        className={cn(
                                            "px-2.5 py-1 rounded-md text-xs font-bold tracking-wide transition-all border",
                                            selectedTag === null ? "bg-white/20 text-white border-white/20" : "bg-white/5 text-[#c2c6d6] border-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        Tümü
                                    </button>
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-md text-xs font-bold tracking-wide transition-all border",
                                                selectedTag === tag ? "bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/20" : "bg-white/5 text-[#c2c6d6] border-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Reset All Button */}
                        <div className="pt-6 border-t border-white/5 mt-4">
                            <button 
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setSelectedGradeLevel(null);
                                    setSelectedSubject(null);
                                    setSelectedTag(null);
                                    setSearch('');
                                }}
                                className="text-sm font-bold text-[#adc6ff] hover:text-[#4d8eff] transition-colors uppercase tracking-wider flex items-center gap-2 active:scale-95"
                            >
                                Tümünü Sıfırla
                            </button>
                        </div>

                        <button 
                            onClick={openCreate}
                            className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-extrabold tracking-widest rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
                        >
                            <Plus className="w-4 h-4" /> İçerik Ekle
                        </button>
                    </aside>

                    {/* Main Content Area (Bento & Premium UI) */}
                    <section className="flex-1 space-y-10 pt-2">
                        
                        {/* Header matched exactly with Visual */}
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-white tracking-tight leading-[1.15]">Etkinlik Laboratuvarı</h1>
                            <p className="text-lg text-[#c2c6d6] leading-relaxed max-w-3xl">Etkileşimli simülasyonlar, derinlemesine videolar ve pratik testlerle bilim dünyasını keşfedin.</p>
                        </div>

                        {/* Search input placed below header as in Visual */}
                        <div className="relative max-w-xl">
                            <input 
                                className="w-full bg-[#1d2027] hover:bg-[#272a31] border border-white/5 focus:border-[#adc6ff]/40 rounded-xl pl-12 pr-6 py-4 text-[#e1e2ec] font-medium text-base placeholder-[#8c909f] outline-none transition-all focus:shadow-[0_0_30px_rgba(173,198,255,0.05)]" 
                                placeholder="Deney veya konu ara..." 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8c909f]">search</span>
                        </div>

                        {/* Result info */}
                        <div className="flex items-center justify-between pb-2">
                            <div className="text-xs text-[#8c909f] font-bold uppercase tracking-widest">
                                {filteredActivities.length} İÇERİK BULUNDU
                            </div>
                        </div>

                        {/* Content Render */}
                        {isLoading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-[#adc6ff] border-t-transparent rounded-full animate-spin" />
                                <p className="text-[#8c909f] font-extrabold uppercase tracking-widest text-[10px]">Laboratuvar Hazırlanıyor…</p>
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="py-24 bg-surface-container/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 text-[#8c909f] flex items-center justify-center border border-white/5">
                                    <Blocks className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-extrabold text-white">Herhangi bir içerik bulunamadı</h3>
                                    <p className="text-sm text-[#c2c6d6] max-w-xs leading-relaxed">Arama teriminizi değiştirin veya filtrelerinizi temizleyin.</p>
                                </div>
                            </div>
                        ) : (
                            /* Horizontal List Stack Rendering */
                            <div className="flex flex-col gap-6">
                                {filteredActivities.map((act, idx) => (
                                    <ActivityCard
                                        key={act.id}
                                        act={act}
                                        index={idx}
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
                    key={editItem?.id || 'new'}
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
