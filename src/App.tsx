// src/App.tsx — İÇERİK MERKEZİ: Ünite Rafı + Ders Modu
// ─────────────────────────────────────────────────────────────────────
// Bu dosya, mevcut App.tsx'in TÜM MANTIĞINI korur (Firebase sync, filtreler,
// önizleme, ekleme/düzenleme/silme, link/HTML kopyalama, öğrenci görünümü) ve
// düzeni "İçerik Merkezi — Ünite Rafı + Ders Modu" tasarımına çevirir:
//   • Üst başlık = <Navbar/> (marka + sekmeler + Ctrl+K arama + Ders Modu)
//   • Sol kütüphane ağacı: Tüm İçerikler · Son kullanılanlar · Sınıf → Ünite ·
//     Branşlar · İçerik Türü · Etiketler
//   • Breadcrumb + koyu "Devam eden ders" şeridi + tür çipleri/sıralama
//   • Ünite başlıklı raflar (gruplanmış ızgara) + Son kullanılanlar
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react';
import { useFirestore } from './lib/firebase';
import { useDebounce } from './hooks/useDebounce';
import { useFullscreen } from './hooks/useFullscreen';
import { useRecentActivities } from './hooks/useRecentActivities';
import { Navbar, type MainView } from './components/common/Navbar';
import { Modal } from './components/common/Modal';
import { useToast } from './components/common/ToastProvider';
import { useConfirm } from './components/common/ConfirmDialog';
import { ActivityCard } from './components/activities/ActivityCard';
import { ActivityQrModal } from './components/activities/ActivityQrModal';
import { ResultsModal } from './components/activities/ResultsModal';
import { ActivityForm, type ActivityFormValues } from './components/activities/ActivityForm';
import { ActivityPreviewModal } from './components/activities/ActivityPreviewModal';
import { StudentPortal } from './components/student/StudentPortal';
import { NotebooksView } from './components/notebooks/NotebooksView';
import { ActivityFolderDialog } from './components/notebooks/ActivityFolderDialog';
import { activityFolderIds } from './components/notebooks/activityFolders';
import { LibraryTree } from './components/content/LibraryTree';
import { LessonModeBar } from './components/content/LessonModeBar';
import { ContentFilterBar, type SortBy } from './components/content/ContentFilterBar';
import { RecentActivities } from './components/content/RecentActivities';
import { formatGradeLevel } from './constants/education';
import { subjectColor } from './constants/appearance';
import type { Activity, DriveFolder, Unit } from './types';

const LESSON_MODE_KEY = 'icerik-merkezi:lesson-mode';
/** Bir sayfada gösterilecek raf (ünite) sayısı. */
const SHELVES_PER_PAGE = 6;

// Firebase boşken gösterilecek yedek (mock) veri — orijinal tam liste korundu.
const MOCK_ACTIVITIES: Activity[] = [
    {
        id: 'mock1',
        title: 'Kuantum Alanları',
        description: 'Elektronların gizemli dünyasını interaktif simülasyonla deneyimleyin.',
        category: 'Simülasyon',
        subject: 'Fizik',
        grade_level: '12',
        unit: 'Modern Fizik',
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
        unit: 'Kalıtım',
        tags: 'dna, genetik, biyoloji',
        is_test: false,
        image_url: '/images/dna_helix.png',
    },
    {
        id: 'mock3',
        title: 'Mars Kolonisi',
        description: 'Kızıl gezegende sürdürülebilir bir yaşam alanı inşa etme simülasyonu.',
        category: 'Simülasyon',
        subject: 'Fen Bilimleri',
        grade_level: '9',
        unit: 'Güneş Sistemi',
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
        unit: 'Asitler ve Bazlar',
        tags: 'kimya, asit, baz',
        is_test: false,
    },
    {
        id: 'mock5',
        title: 'Haftalık Test',
        description: 'Fizik ve Kimya üzerine haftalık değerlendirme testi.',
        category: 'Test',
        subject: 'Fizik',
        grade_level: '11',
        unit: 'Asitler ve Bazlar',
        tags: 'fizik, kimya, test',
        is_test: true,
    },
    {
        id: 'mock6',
        title: 'Küresel Isınma Haritası',
        description: 'Son 50 yıldaki iklim değişikliği verilerini dünya haritası üzerinde inceleyin.',
        category: 'Simülasyon',
        subject: 'Sosyal Bilgiler',
        grade_level: '9',
        unit: 'İklim ve Çevre',
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
        unit: 'Cebirsel İfadeler',
        tags: 'matematik, geometri',
        is_test: false,
    },
    {
        id: 'mock8',
        title: 'Zihin Oyunları',
        description: 'Mantık ve problem çözme becerilerinizi geliştirin.',
        category: 'Oyun',
        subject: 'Matematik',
        grade_level: '8',
        unit: 'Cebirsel İfadeler',
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
        unit: 'Kalıtım',
        tags: 'mikroskop, hücre',
        is_test: false,
    },
];

interface Shelf {
    key: string;
    title: string;
    color: string;
    grades: string;
    items: Activity[];
}

export default function App() {
    const params = new URLSearchParams(window.location.search);
    const isStudentView = params.get('view') === 'student' && !!params.get('id');
    const studentId = params.get('id');

    const [mainView, setMainView] = useState<MainView>('content');
    const [activities, setActivities] = useState<Activity[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 200);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [showResultsId, setShowResultsId] = useState<string | null>(null);
    const [qrActivityId, setQrActivityId] = useState<string | null>(null);
    const [folderActivityId, setFolderActivityId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [openGrades, setOpenGrades] = useState<Record<string, boolean>>({});
    const [sortBy, setSortBy] = useState<SortBy>('unit');
    const [isLessonMode, setIsLessonMode] = useState(() => {
        try { return localStorage.getItem(LESSON_MODE_KEY) !== '0'; } catch { return true; }
    });
    const [isTreeOpen, setIsTreeOpen] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [editItem, setEditItem] = useState<Activity | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);

    const searchRef = useRef<HTMLInputElement>(null);
    const activitiesHandler = useFirestore<Activity>('activities');
    const unitsHandler = useFirestore<Unit>('units');
    const foldersHandler = useFirestore<DriveFolder>('folders');
    const toast = useToast();
    const confirm = useConfirm();
    const fullscreen = useFullscreen();
    const { recents, markOpened } = useRecentActivities();

    useEffect(() => {
        const unsub = activitiesHandler.sync((data) => {
            setActivities(data && data.length > 0 ? data : MOCK_ACTIVITIES);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = unitsHandler.sync((data) => setUnits(data || []));
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = foldersHandler.sync((data) => setFolders(data || []));
        return () => unsub();
    }, []);

    useEffect(() => {
        try { localStorage.setItem(LESSON_MODE_KEY, isLessonMode ? '1' : '0'); } catch { /* yoksay */ }
    }, [isLessonMode]);

    // Ctrl/⌘+K → arama alanına odaklan.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setMainView('content');
                searchRef.current?.focus();
                searchRef.current?.select();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ── Türetilmiş listeler ───────────────────────────────────────────
    const allTags = useMemo(() => {
        const s = new Set<string>();
        activities.forEach((a) => a.tags?.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => s.add(t)));
        return Array.from(s).sort((a, b) => a.localeCompare(b, 'tr'));
    }, [activities]);

    const allCategories = useMemo(() => {
        const s = new Set<string>();
        activities.forEach((a) => s.add(a.category?.trim() || 'Genel'));
        return Array.from(s).sort((a, b) => a.localeCompare(b, 'tr'));
    }, [activities]);

    const subjectCounts = useMemo(() => {
        const m: Record<string, number> = {};
        activities.forEach((a) => { if (a.subject) m[a.subject] = (m[a.subject] || 0) + 1; });
        return m;
    }, [activities]);

    const gradeCounts = useMemo(() => {
        const m: Record<string, number> = {};
        activities.forEach((a) => { if (a.grade_level) m[a.grade_level] = (m[a.grade_level] || 0) + 1; });
        return m;
    }, [activities]);

    /** Sınıf → o sınıfta içeriği olan üniteler (alfabetik). */
    const unitsByGrade = useMemo(() => {
        const m: Record<string, Set<string>> = {};
        activities.forEach((a) => {
            if (!a.grade_level) return;
            const unit = a.unit?.trim();
            if (!unit) return;
            (m[a.grade_level] ||= new Set()).add(unit);
        });
        const out: Record<string, string[]> = {};
        Object.entries(m).forEach(([g, set]) => { out[g] = Array.from(set).sort((a, b) => a.localeCompare(b, 'tr')); });
        return out;
    }, [activities]);

    const unitCounts = useMemo(() => {
        const m: Record<string, number> = {};
        activities.forEach((a) => {
            const unit = a.unit?.trim();
            if (!a.grade_level || !unit) return;
            const key = `${a.grade_level}|${unit}`;
            m[key] = (m[key] || 0) + 1;
        });
        return m;
    }, [activities]);

    const needle = debouncedSearch.trim().toLocaleLowerCase('tr');

    const filteredActivities = useMemo(() => {
        return activities.filter((a) => {
            const hay = [a.title, a.description, a.category, formatGradeLevel(a.grade_level), a.subject, a.unit, a.tags]
                .filter(Boolean).join(' ').toLocaleLowerCase('tr');
            if (needle && !hay.includes(needle)) return false;
            // Arama doluyken ağaç filtreleri atlanır: arama tüm kütüphanede çalışır.
            if (!needle) {
                if (selectedGradeLevel && a.grade_level !== selectedGradeLevel) return false;
                if (selectedSubject && a.subject !== selectedSubject) return false;
                if (selectedUnit && (a.unit?.trim() || '') !== selectedUnit) return false;
            }
            if (selectedCategory && (a.category?.trim() || 'Genel') !== selectedCategory) return false;
            if (selectedTag) {
                const tags = a.tags ? a.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
                if (!tags.includes(selectedTag)) return false;
            }
            return true;
        });
    }, [activities, needle, selectedCategory, selectedGradeLevel, selectedSubject, selectedTag, selectedUnit]);

    /** Ünite başlıklı raflar. Ünitesi olmayan içerikler "Diğer" rafında toplanır. */
    const shelves = useMemo<Shelf[]>(() => {
        const map = new Map<string, Activity[]>();
        filteredActivities.forEach((a) => {
            const key = a.unit?.trim() || 'Diğer';
            const list = map.get(key);
            if (list) list.push(a);
            else map.set(key, [a]);
        });

        const out: Shelf[] = Array.from(map.entries()).map(([key, items]) => {
            const sorted = sortBy === 'title'
                ? [...items].sort((a, b) => a.title.localeCompare(b.title, 'tr'))
                : [...items].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
            return {
                key,
                title: key,
                color: subjectColor(sorted[0]?.subject),
                grades: Array.from(new Set(sorted.map((i) => formatGradeLevel(i.grade_level)))).join(' · '),
                items: sorted,
            };
        });

        // "Diğer" her zaman en sonda; kalanlar ünite adına göre sıralanır.
        return out.sort((a, b) => {
            if (a.key === 'Diğer') return 1;
            if (b.key === 'Diğer') return -1;
            return a.title.localeCompare(b.title, 'tr');
        });
    }, [filteredActivities, sortBy]);

    const totalPages = Math.max(1, Math.ceil(shelves.length / SHELVES_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const pagedShelves = useMemo(
        () => shelves.slice((safePage - 1) * SHELVES_PER_PAGE, safePage * SHELVES_PER_PAGE),
        [shelves, safePage]
    );

    useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory, selectedGradeLevel, selectedSubject, selectedTag, selectedUnit, sortBy]);

    const activityById = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
    const recentEntries = useMemo(
        () => recents
            .map((entry) => ({ entry, activity: activityById.get(entry.id) }))
            .filter((r): r is { entry: typeof r.entry; activity: Activity } => !!r.activity),
        [recents, activityById]
    );

    /** Ders Modu şeridi: en son açılan etkinlik; hiç yoksa kütüphanenin ilk içeriği. */
    const lessonActivity = recentEntries[0]?.activity ?? activities[0] ?? null;

    const folderOptions = useMemo(() => {
        const out: Array<{ id: string; label: string; depth: number }> = [];
        const walk = (parent: string | null, depth: number) => {
            folders
                .filter((f) => (f.parent_id ?? null) === parent)
                .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                .forEach((f) => { out.push({ id: f.id, label: f.name, depth }); walk(f.id, depth + 1); });
        };
        walk(null, 0);
        return out;
    }, [folders]);

    // ── Aksiyonlar ────────────────────────────────────────────────────
    const openEdit = useCallback((act: Activity) => { setEditItem(act); setIsActivityOpen(true); }, []);
    const openCreate = useCallback(() => { setEditItem(null); setIsActivityOpen(true); }, []);

    const openPreview = useCallback((id: string) => { markOpened(id); setPreviewId(id); }, [markOpened]);

    const openFullscreen = useCallback((act: Activity) => {
        markOpened(act.id);
        setPreviewId(act.id);
        if (fullscreen.isSupported && !fullscreen.isFullscreen) void fullscreen.enter();
    }, [fullscreen, markOpened]);

    const handleCopyLink = useCallback(async (act: Activity) => {
        const link = `${window.location.origin}${window.location.pathname}?view=student&id=${act.id}`;
        try { await navigator.clipboard.writeText(link); toast.success('Öğrenci giriş linki kopyalandı.'); }
        catch { toast.error('Link kopyalanamadı.'); }
    }, [toast]);

    const handleCopyHtml = useCallback(async (act: Activity) => {
        try { await navigator.clipboard.writeText(act.html_code || ''); toast.success('HTML kodu kopyalandı.'); }
        catch { toast.error('Kopyalanamadı.'); }
    }, [toast]);

    const handleRequestDelete = useCallback(async (act: Activity) => {
        const ok = await confirm({ title: 'Etkinliği sil?', message: `"${act.title}" kalıcı olarak silinecek.`, confirmLabel: 'Sil', cancelLabel: 'Vazgeç', variant: 'danger' });
        if (!ok) return;
        try { await activitiesHandler.remove(act.id); toast.success('Etkinlik silindi.'); }
        catch { toast.error('Etkinlik silinemedi.'); }
    }, [activitiesHandler, confirm, toast]);

    const handleSaveFolders = useCallback(async (activityId: string, ids: string[]) => {
        try {
            await activitiesHandler.update(activityId, { folder_ids: ids, folder_id: null });
            setFolderActivityId(null);
            toast.success(ids.length ? `Etkinlik ${ids.length} klasörde görünüyor.` : 'Etkinlik tüm klasörlerden çıkarıldı.');
        } catch { toast.error('Klasörler kaydedilemedi.'); }
    }, [activitiesHandler, toast]);

    const handleActivitySubmit = useCallback(async (values: ActivityFormValues) => {
        setIsSubmitting(true);
        try {
            if (values.unit && values.grade_level && values.subject) {
                const exists = units.some(
                    (u) =>
                        u.grade_level === values.grade_level &&
                        u.subject === values.subject &&
                        u.name.toLowerCase().trim() === values.unit!.toLowerCase().trim()
                );
                if (!exists) {
                    await unitsHandler.add({
                        grade_level: values.grade_level,
                        subject: values.subject,
                        name: values.unit.trim(),
                    });
                }
            }

            if (editItem) { await activitiesHandler.update(editItem.id, values); toast.success('Etkinlik güncellendi.'); }
            else { await activitiesHandler.add(values); toast.success('Etkinlik eklendi.'); }
            setIsActivityOpen(false); setEditItem(null);
        } catch { toast.error('Etkinlik kaydedilemedi.'); }
        finally { setIsSubmitting(false); }
    }, [editItem, activitiesHandler, units, unitsHandler, toast]);

    // ── Ağaç etkileşimleri ────────────────────────────────────────────
    const closeTree = () => setIsTreeOpen(false);
    const resetFilters = useCallback(() => {
        setSelectedCategory(null); setSelectedGradeLevel(null); setSelectedSubject(null);
        setSelectedUnit(null); setSelectedTag(null); setSearch('');
    }, []);

    const selectAll = () => { resetFilters(); closeTree(); };

    const selectRecents = () => {
        closeTree();
        document.getElementById('son-kullanilanlar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Sınıfa tıklamak o sınıfı seçer ve aç/kapa yapar.
    const selectGrade = (grade: string) => {
        setSelectedGradeLevel(grade); setSelectedUnit(null); setSelectedSubject(null); setSearch('');
    };
    const toggleGradeOpen = (grade: string) => setOpenGrades((prev) => ({ ...prev, [grade]: !prev[grade] }));

    // Üniteye tıklamak seçer, tekrar tıklamak kaldırır.
    const selectUnit = (grade: string, unit: string) => {
        setSelectedGradeLevel(grade);
        setSelectedSubject(null);
        setSearch('');
        setSelectedUnit((prev) => (prev === unit ? null : unit));
        closeTree();
    };

    // Branşa tıklamak sınıf/ünite seçimini temizler.
    const selectSubject = (subject: string) => {
        setSelectedSubject((prev) => (prev === subject ? null : subject));
        setSelectedGradeLevel(null); setSelectedUnit(null); setSearch('');
        closeTree();
    };

    const selectCategory = (category: string | null) => {
        setSelectedCategory((prev) => (prev === category ? null : category));
        closeTree();
    };

    const selectTag = (tag: string) => {
        setSelectedTag((prev) => (prev === tag ? null : tag));
        closeTree();
    };

    const hasAnyFilter = !!(selectedGradeLevel || selectedSubject || selectedUnit || selectedCategory || selectedTag || needle);

    const crumb = needle ? `"${debouncedSearch.trim()}" araması`
        : selectedUnit ? selectedUnit
        : selectedSubject ? selectedSubject
        : selectedGradeLevel ? `${selectedGradeLevel}. Sınıf`
        : selectedCategory ? selectedCategory
        : selectedTag ? `#${selectedTag}`
        : 'Tüm İçerikler';

    // ── Öğrenci görünümü ──────────────────────────────────────────────
    if (isStudentView) {
        if (isLoading) return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Yükleniyor…</p>
            </div>
        );
        const activity = activities.find((a) => a.id === studentId);
        if (activity) return <StudentPortal act={activity} />;
    }

    const currentPreview = previewId ? activities.find((a) => a.id === previewId) ?? null : null;
    const qrActivity = qrActivityId ? activities.find((a) => a.id === qrActivityId) ?? null : null;
    const folderActivity = folderActivityId ? activities.find((a) => a.id === folderActivityId) ?? null : null;

    const treeProps = {
        totalCount: activities.length,
        gradeCounts, unitsByGrade, unitCounts, subjectCounts,
        categories: allCategories,
        tags: allTags,
        openGrades,
        onToggleGradeOpen: toggleGradeOpen,
        selectedGradeLevel, selectedUnit, selectedSubject, selectedCategory, selectedTag,
        hasAnyFilter,
        hasRecents: recentEntries.length > 0,
        onSelectAll: selectAll,
        onSelectRecents: selectRecents,
        onSelectGrade: selectGrade,
        onSelectUnit: selectUnit,
        onSelectSubject: selectSubject,
        onSelectCategory: (c: string) => selectCategory(c),
        onSelectTag: selectTag,
    };

    return (
        <div className="min-h-screen bg-background text-on-background font-sans">
            <Navbar
                ref={searchRef}
                search={search}
                onSearchChange={setSearch}
                onAdd={openCreate}
                view={mainView}
                onViewChange={setMainView}
                isLessonMode={isLessonMode}
                onToggleLessonMode={() => setIsLessonMode((v) => !v)}
                onOpenTree={() => setIsTreeOpen(true)}
            />

            {mainView === 'notebooks' ? (
                <div className="flex max-w-[1440px] mx-auto">
                    <NotebooksView />
                </div>
            ) : (
                <div className="flex max-w-[1440px] mx-auto items-start">
                    {/* Sol kütüphane ağacı (≥1024px) */}
                    <aside className="w-[232px] xl:w-[268px] flex-shrink-0 bg-white border-r border-outline-variant px-3 pt-4 pb-10 hidden lg:block sticky top-[73px] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] overflow-y-auto">
                        <LibraryTree {...treeProps} />
                    </aside>

                    {/* Ağaç çekmecesi (<1024px) */}
                    {isTreeOpen && (
                        <div className="fixed inset-0 z-[110] lg:hidden">
                            <div className="absolute inset-0 bg-black/40" onClick={closeTree} />
                            <div className="absolute inset-y-0 left-0 w-[288px] max-w-[85vw] bg-white shadow-2xl px-3 pt-4 pb-10 overflow-y-auto">
                                <div className="flex items-center justify-between px-3 pb-2">
                                    <span className="text-[10.5px] font-bold uppercase tracking-[1.4px] text-on-surface-variant/60">Kütüphane</span>
                                    <button type="button" onClick={closeTree} aria-label="Kapat" className="p-2 -mr-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <LibraryTree {...treeProps} />
                            </div>
                        </div>
                    )}

                    {/* Ana içerik */}
                    <main className="flex-1 min-w-0 px-4 sm:px-7 pt-[22px] pb-16">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2.5 text-[13.5px] text-on-surface-variant mb-[18px]">
                            <Home className="w-[17px] h-[17px] flex-shrink-0" />
                            <button type="button" onClick={selectAll} className="hover:text-primary transition-colors">Kütüphane</button>
                            <ChevronRight className="w-[15px] h-[15px] opacity-60 flex-shrink-0" />
                            <span className="text-on-surface font-semibold truncate">{crumb}</span>
                            <span className="ml-auto text-[13px] flex-shrink-0">{filteredActivities.length} içerik</span>
                        </div>

                        {/* Ders Modu şeridi */}
                        {isLessonMode && lessonActivity && (
                            <LessonModeBar
                                activity={lessonActivity}
                                onOpenFullscreen={openFullscreen}
                                onShowQr={(act) => setQrActivityId(act.id)}
                                onEdit={openEdit}
                            />
                        )}

                        {/* Tür çipleri + sıralama */}
                        <ContentFilterBar
                            categories={allCategories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={(c) => { setSelectedCategory(c); }}
                            sortBy={sortBy}
                            onToggleSort={() => setSortBy((s) => (s === 'unit' ? 'title' : 'unit'))}
                        />

                        {/* Raflar */}
                        {isLoading ? (
                            <div className="py-24 flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Yükleniyor…</p>
                            </div>
                        ) : shelves.length === 0 ? (
                            <div className="px-6 py-20 bg-white border border-outline-variant rounded-[22px] text-center">
                                <h3 className="font-headline-md text-base font-bold text-on-surface m-0">Sonuç bulunamadı</h3>
                                <p className="text-[13px] text-on-surface-variant mt-1.5">Arama veya filtreleri değiştirmeyi deneyin.</p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-4 h-11 px-5 rounded-xl bg-surface-container-high text-on-surface-variant text-[13.5px] font-semibold"
                                >
                                    Filtreleri temizle
                                </button>
                            </div>
                        ) : (
                            <>
                                {pagedShelves.map((shelf) => (
                                    <section key={shelf.key} className="mb-[30px]">
                                        <div className="flex items-center gap-3 mb-3.5">
                                            <span className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0" style={{ background: shelf.color }} />
                                            <h3 className="font-headline-md text-[16.5px] font-bold text-on-surface m-0 truncate">{shelf.title}</h3>
                                            <span className="text-[12.5px] text-on-surface-variant flex-shrink-0">{shelf.items.length} içerik</span>
                                            <span className="flex-1 h-px bg-outline-variant" />
                                            <span className="text-[12.5px] font-semibold text-on-surface-variant flex-shrink-0 hidden sm:inline">{shelf.grades}</span>
                                        </div>
                                        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
                                            {shelf.items.map((act) => (
                                                <ActivityCard
                                                    key={act.id}
                                                    act={act}
                                                    onOpenPreview={openPreview}
                                                    onOpenFullscreen={openFullscreen}
                                                    onShowQr={(a) => setQrActivityId(a.id)}
                                                    onMoveToFolder={(a) => setFolderActivityId(a.id)}
                                                    onEdit={openEdit}
                                                    onRequestDelete={handleRequestDelete}
                                                    onShowResults={setShowResultsId}
                                                    onCopyLink={handleCopyLink}
                                                    onCopyHtml={handleCopyHtml}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        <button
                                            onClick={() => { setPage(safePage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            disabled={safePage === 1}
                                            className="flex items-center gap-1 h-11 px-4 rounded-xl bg-white border border-outline-variant text-on-surface text-sm font-bold disabled:opacity-30 hover:bg-surface-container-high transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Önceki
                                        </button>
                                        <span className="px-4 text-sm font-bold text-on-surface-variant">{safePage} / {totalPages}</span>
                                        <button
                                            onClick={() => { setPage(safePage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            disabled={safePage === totalPages}
                                            className="flex items-center gap-1 h-11 px-4 rounded-xl bg-white border border-outline-variant text-on-surface text-sm font-bold disabled:opacity-30 hover:bg-surface-container-high transition"
                                        >
                                            Sonraki <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Son kullanılanlar */}
                        <RecentActivities entries={recentEntries} onOpen={openFullscreen} />
                    </main>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-outline-variant py-7 px-6 text-center text-[13px] text-on-surface-variant">
                © 2026 Ahmet DUYAR · Etkinlik Laboratuvarı — interaktif eğitim içerik merkezi
            </footer>

            <ResultsModal isOpen={!!showResultsId} onClose={() => setShowResultsId(null)} activityId={showResultsId || ''} />

            <Modal isOpen={isActivityOpen} onClose={() => { setIsActivityOpen(false); setEditItem(null); }} title={editItem ? 'Etkinliği Güncelle' : 'Yeni İnteraktif İçerik'}>
                <ActivityForm key={editItem?.id || 'new'} editItem={editItem} isSubmitting={isSubmitting} onSubmit={handleActivitySubmit} onCancel={() => { setIsActivityOpen(false); setEditItem(null); }} units={units} />
            </Modal>

            {qrActivity && <ActivityQrModal activity={qrActivity} onClose={() => setQrActivityId(null)} />}

            {folderActivity && (
                <ActivityFolderDialog
                    isOpen
                    onClose={() => setFolderActivityId(null)}
                    activityTitle={folderActivity.title}
                    folders={folderOptions}
                    selectedIds={activityFolderIds(folderActivity)}
                    onSave={(ids) => handleSaveFolders(folderActivity.id, ids)}
                />
            )}

            {currentPreview && <ActivityPreviewModal activity={currentPreview} onClose={() => setPreviewId(null)} />}
        </div>
    );
}
