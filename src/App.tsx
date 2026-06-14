// src/App.tsx — İÇERİK MERKEZİ RESKIN (referans uygulama)
// ─────────────────────────────────────────────────────────────────────
// Bu dosya, mevcut App.tsx'inin TÜM MANTIĞINI korur (Firebase sync, filtreler,
// önizleme, ekleme/düzenleme/silme, link/HTML kopyalama, sayfalama, öğrenci
// görünümü) ve YALNIZCA düzeni İçerik Merkezi yapısına çevirir:
//   • Üst başlık = <Navbar/> (marka + geniş arama + Yeni İçerik)
//   • Düz sol menü: Tüm İçerikler · Branşlar · İçerik Türü · Etiketler
//   • Karşılama başlığı (hero) + sayaçlar
//   • Sınıf çipleri + sıralama + ızgara/liste
//   • Görsel kart ızgarası (yeni ActivityCard)
//
// NOT (Claude Code): `ActivityListItem` ve `useFirestore` gibi mevcut bileşen/
// hook'ların imza/props'larını kendi dosyalarından koru. Aşağıdaki MOCK ve
// handler'lar senin orijinal App.tsx'inle birebir aynıdır.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useFirestore } from './lib/firebase';
import { cn } from './utils/cn';
import { useDebounce } from './hooks/useDebounce';
import { Navbar } from './components/common/Navbar';
import { Modal } from './components/common/Modal';
import { useToast } from './components/common/ToastProvider';
import { useConfirm } from './components/common/ConfirmDialog';
import { ActivityCard } from './components/activities/ActivityCard';
import { ResultsModal } from './components/activities/ResultsModal';
import { ActivityForm, type ActivityFormValues } from './components/activities/ActivityForm';
import { ActivityPreviewModal } from './components/activities/ActivityPreviewModal';
import { StudentPortal } from './components/student/StudentPortal';
import { GRADE_LEVELS, SUBJECTS, formatGradeLevel } from './constants/education';
import type { Activity, Unit } from './types';

// Branş renkleri (kart ve menü noktaları için)
const SUBJECT_COLOR: Record<string, string> = {
    'Türkçe': '#E8C85A', 'Matematik': '#5AC8A8', 'Fen Bilimleri': '#E8685A',
    'Sosyal Bilgiler': '#6366f1', 'İngilizce': '#3b82f6', 'Din Kültürü ve Ahlak Bilgisi': '#8b5cf6',
    'Fizik': '#0ea5e9', 'Kimya': '#ec4899', 'Biyoloji': '#10b981',
};

// Firebase boşken gösterilecek yedek (mock) veri — orijinal tam liste korundu.
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
    },
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
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [editItem, setEditItem] = useState<Activity | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

    const activitiesHandler = useFirestore<Activity>('activities');
    const unitsHandler = useFirestore<Unit>('units');
    const toast = useToast();
    const confirm = useConfirm();

    const [units, setUnits] = useState<Unit[]>([]);

    useEffect(() => {
        const unsub = activitiesHandler.sync((data) => {
            setActivities(data && data.length > 0 ? data : MOCK_ACTIVITIES);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = unitsHandler.sync((data) => {
            setUnits(data || []);
        });
        return () => unsub();
    }, []);


    const allTags = useMemo(() => {
        const s = new Set<string>();
        activities.forEach((a) => a.tags?.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => s.add(t)));
        return Array.from(s).sort();
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

    const filteredUnitsList = useMemo(() => {
        const unitSet = new Set<string>();
        activities.forEach((a) => {
            if (a.unit) {
                if (selectedGradeLevel && a.grade_level !== selectedGradeLevel) return;
                if (selectedSubject && a.subject !== selectedSubject) return;
                unitSet.add(a.unit.trim());
            }
        });
        return Array.from(unitSet).sort((a, b) => a.localeCompare(b, 'tr'));
    }, [activities, selectedGradeLevel, selectedSubject]);

    const filteredActivities = useMemo(() => {
        const needle = debouncedSearch.trim().toLocaleLowerCase('tr');
        let list = activities.filter((a) => {
            const hay = [a.title, a.description, a.category, formatGradeLevel(a.grade_level), a.subject, a.unit, a.tags].filter(Boolean).join(' ').toLocaleLowerCase('tr');
            if (needle && !hay.includes(needle)) return false;
            if (selectedCategory && (a.category?.trim() || 'Genel') !== selectedCategory) return false;
            if (selectedGradeLevel && a.grade_level !== selectedGradeLevel) return false;
            if (selectedSubject && a.subject !== selectedSubject) return false;
            if (selectedUnit && a.unit !== selectedUnit) return false;
            if (selectedTag) {
                const tags = a.tags ? a.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
                if (!tags.includes(selectedTag)) return false;
            }
            return true;
        });
        if (sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        else list = [...list].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        return list;
    }, [activities, debouncedSearch, selectedCategory, selectedGradeLevel, selectedSubject, selectedTag, selectedUnit, sortBy]);

    useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory, selectedGradeLevel, selectedSubject, selectedTag, selectedUnit]);


    const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pagedActivities = useMemo(() => filteredActivities.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filteredActivities, safePage]);

    const openEdit = useCallback((act: Activity) => { setEditItem(act); setIsActivityOpen(true); }, []);
    const openCreate = useCallback(() => { setEditItem(null); setIsActivityOpen(true); }, []);

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

    const currentPreview = previewId ? activities.find((a) => a.id === previewId) ?? null : null;
    const resetFilters = () => { setSelectedCategory(null); setSelectedGradeLevel(null); setSelectedSubject(null); setSelectedUnit(null); setSelectedTag(null); setSearch(''); };


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

    const title = selectedSubject || selectedCategory || (selectedTag ? `#${selectedTag}` : 'Tüm İçerikler');

    // Düz menü öğesi
    const NavItem = ({ active, onClick, dot, icon, label, count }: { active: boolean; onClick: () => void; dot?: string; icon?: React.ReactNode; label: string; count?: number }) => (
        <button onClick={onClick} className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors',
            active ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high'
        )}>
            <span className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                {dot ? <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} /> : icon}
            </span>
            <span className="flex-1 text-left">{label}</span>
            {count != null && <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-[22px] text-center', active ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface-variant')}>{count}</span>}
        </button>
    );

    return (
        <div className="min-h-screen bg-background text-on-background font-sans">
            <Navbar search={search} onSearchChange={setSearch} onAdd={openCreate} />

            <div className="flex max-w-[1280px] mx-auto">
                {/* Sol menü */}
                <aside className="w-[232px] flex-shrink-0 border-r border-outline-variant bg-white p-3 hidden lg:flex flex-col gap-1 min-h-[calc(100vh-62px)]">
                    <NavItem active={!selectedSubject && !selectedCategory && !selectedTag} onClick={resetFilters} icon={<LayoutGrid className="w-4 h-4" />} label="Tüm İçerikler" count={activities.length} />

                    <div className="text-[10.5px] font-bold tracking-[1.4px] uppercase text-on-surface-variant/60 px-3 pt-4 pb-1.5">Branşlar</div>
                    {SUBJECTS.filter((s) => subjectCounts[s]).map((s) => (
                        <NavItem key={s} active={selectedSubject === s} onClick={() => setSelectedSubject(selectedSubject === s ? null : s)} dot={SUBJECT_COLOR[s] || '#6366f1'} label={s} count={subjectCounts[s] || 0} />
                    ))}

                    <div className="text-[10.5px] font-bold tracking-[1.4px] uppercase text-on-surface-variant/60 px-3 pt-4 pb-1.5">İçerik Türü</div>
                    {allCategories.map((cat) => (
                        <NavItem key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} icon={<Tag className="w-4 h-4" />} label={cat} />
                    ))}

                    {filteredUnitsList.length > 0 && (
                        <>
                            <div className="text-[10.5px] font-bold tracking-[1.4px] uppercase text-on-surface-variant/60 px-3 pt-4 pb-1.5">Üniteler</div>
                            {filteredUnitsList.map((unit) => (
                                <NavItem key={unit} active={selectedUnit === unit} onClick={() => setSelectedUnit(selectedUnit === unit ? null : unit)} icon={<span className="material-symbols-outlined !text-[16px] text-on-surface-variant">layers</span>} label={unit} />
                            ))}
                        </>
                    )}

                    {allTags.length > 0 && (
                        <>
                            <div className="text-[10.5px] font-bold tracking-[1.4px] uppercase text-on-surface-variant/60 px-3 pt-4 pb-1.5">Etiketler</div>
                            <div className="flex flex-wrap gap-1.5 px-2">
                                {allTags.map((t) => (
                                    <button key={t} onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                                        className={cn('px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition', selectedTag === t ? 'bg-primary/10 text-primary border-transparent' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary')}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </aside>

                {/* Ana içerik */}
                <main className="flex-1 min-w-0 px-6 py-6 pb-20">
                    {/* Hero */}
                    <div className="flex items-center justify-between gap-5 flex-wrap bg-white border border-outline-variant rounded-[18px] px-6 py-4 mb-5">
                        <div>
                            <h2 className="text-[22px] font-bold font-headline-md text-on-surface tracking-tight">Merhaba, Ahmet Öğretmen</h2>
                            <p className="text-[13px] text-on-surface-variant mt-1">Hazırladığın içerikleri seç, derste tam ekran sun.</p>
                        </div>
                        <div className="flex gap-2.5">
                            {[['İçerik', activities.length], ['Ders', Object.keys(subjectCounts).length], ['Tür', allCategories.length]].map(([l, v]) => (
                                <div key={l as string} className="text-center px-4 py-2 rounded-2xl bg-surface-container-low border border-outline-variant">
                                    <b className="block text-[22px] font-extrabold font-headline-md text-on-surface leading-none">{v as number}</b>
                                    <span className="text-[11px] text-on-surface-variant font-semibold">{l as string}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-4 flex-wrap mb-4">
                        <div className="flex items-baseline gap-2.5">
                            <h1 className="text-[21px] font-bold font-headline-md text-on-surface m-0">{title}</h1>
                            <span className="text-[13px] text-on-surface-variant">{filteredActivities.length} içerik</span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            <button onClick={() => setSelectedGradeLevel(null)} className={cn('px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition', selectedGradeLevel == null ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary')}>Tüm Sınıflar</button>
                            {GRADE_LEVELS.map((g) => (
                                <button key={g} onClick={() => setSelectedGradeLevel(selectedGradeLevel === g ? null : g)} className={cn('min-w-[34px] px-2.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition', selectedGradeLevel === g ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary')}>{g}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')} className="border border-outline-variant bg-white rounded-[10px] px-3 py-1.5 text-[12.5px] font-semibold text-on-surface-variant">
                                <option value="recent">Son eklenen</option>
                                <option value="title">Ada göre (A-Z)</option>
                            </select>
                            <div className="flex bg-surface-container-high rounded-[10px] p-[3px] gap-0.5">
                                <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-lg', viewMode === 'grid' ? 'bg-primary text-white' : 'text-on-surface-variant')}><LayoutGrid className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-lg', viewMode === 'list' ? 'bg-primary text-white' : 'text-on-surface-variant')}><List className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* İçerik */}
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Yükleniyor…</p>
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="py-20 bg-white rounded-[22px] border border-outline-variant text-center">
                            <h3 className="text-base font-bold font-headline-md text-on-surface">Sonuç bulunamadı</h3>
                            <p className="text-[13px] text-on-surface-variant mt-1.5">Arama veya filtreleri değiştirmeyi deneyin.</p>
                            <button onClick={resetFilters} className="mt-4 bg-surface-container-high text-on-surface-variant font-semibold px-4 py-2.5 rounded-xl text-[13.5px]">Filtreleri temizle</button>
                        </div>
                    ) : (
                        <>
                            <div className={cn(viewMode === 'grid' ? 'grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(216px,1fr))]' : 'flex flex-col gap-3')}>
                                {pagedActivities.map((act, idx) => (
                                    <ActivityCard
                                        key={act.id}
                                        act={act}
                                        index={(safePage - 1) * PAGE_SIZE + idx}
                                        onOpenPreview={setPreviewId}
                                        onEdit={openEdit}
                                        onRequestDelete={handleRequestDelete}
                                        onShowResults={setShowResultsId}
                                        onCopyLink={handleCopyLink}
                                        onCopyHtml={handleCopyHtml}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8">
                                    <button onClick={() => { setPage(safePage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={safePage === 1}
                                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white border border-outline-variant text-on-surface text-sm font-bold disabled:opacity-30 hover:bg-surface-container-high transition">
                                        <ChevronLeft className="w-4 h-4" /> Önceki
                                    </button>
                                    <span className="px-4 py-2.5 text-sm font-bold text-on-surface-variant">{safePage} / {totalPages}</span>
                                    <button onClick={() => { setPage(safePage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={safePage === totalPages}
                                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white border border-outline-variant text-on-surface text-sm font-bold disabled:opacity-30 hover:bg-surface-container-high transition">
                                        Sonraki <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-outline-variant py-7 px-6 text-center text-[13px] text-on-surface-variant">
                © 2026 Ahmet DUYAR · Etkinlik Laboratuvarı — interaktif eğitim içerik merkezi
            </footer>

            <ResultsModal isOpen={!!showResultsId} onClose={() => setShowResultsId(null)} activityId={showResultsId || ''} />

            <Modal isOpen={isActivityOpen} onClose={() => { setIsActivityOpen(false); setEditItem(null); }} title={editItem ? 'Etkinliği Güncelle' : 'Yeni İnteraktif İçerik'}>
                <ActivityForm key={editItem?.id || 'new'} editItem={editItem} isSubmitting={isSubmitting} onSubmit={handleActivitySubmit} onCancel={() => { setIsActivityOpen(false); setEditItem(null); }} units={units} />
            </Modal>

            {currentPreview && <ActivityPreviewModal activity={currentPreview} onClose={() => setPreviewId(null)} />}
        </div>
    );
}
