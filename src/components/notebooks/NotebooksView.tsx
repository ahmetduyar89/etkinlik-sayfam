// src/components/notebooks/NotebooksView.tsx
// "Defterlerim" ekranı: klasörleme mantığıyla defter ve beyaz tahta yönetimi.
// Üstte ayrı bir şeritte "+ Yeni" menüsü (Not Defteri · Beyaz Tahta · Klasör),
// altında içinde bulunulan klasörün içeriği listelenir.
import React from 'react';
import {
    ChevronRight,
    Eye,
    Folder,
    FolderInput,
    FolderPlus,
    Home,
    LayoutGrid,
    Link2,
    List,
    MonitorPlay,
    MoreVertical,
    NotebookPen,
    PencilLine,
    Plus,
    Presentation,
    Search,
    Trash2,
} from 'lucide-react';
import { useFirestore, deleteDocById } from '../../lib/firebase';
import { cn } from '../../utils/cn';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastProvider';
import { useConfirm } from '../common/ConfirmDialog';
import { usePrompt } from '../common/PromptDialog';
import { NotebookEditor } from './NotebookEditor';
import { ActivityPicker } from './ActivityPicker';
import { ActivityFolderDialog } from './ActivityFolderDialog';
import { activityFolderIds, isInFolder } from './activityFolders';
import { firestoreErrorMessage } from './errors';
import { ActivityPreviewModal } from '../activities/ActivityPreviewModal';
import { formatGradeLevel } from '../../constants/education';
import type { Activity, DriveFolder, Notebook, NotebookKind } from '../../types';

type MoveTarget =
    | { kind: 'folder'; id: string; name: string }
    | { kind: 'notebook'; id: string; name: string };

const FOLDER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

function formatDate(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function NotebooksView() {
    const foldersHandler = useFirestore<DriveFolder>('folders');
    const notebooksHandler = useFirestore<Notebook>('notebooks');
    const activitiesHandler = useFirestore<Activity>('activities');
    const toast = useToast();
    const confirm = useConfirm();
    const prompt = usePrompt();

    const [folders, setFolders] = React.useState<DriveFolder[]>([]);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState<string | null>(null);

    const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
    const [isNewMenuOpen, setIsNewMenuOpen] = React.useState(false);
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
    const [moveTarget, setMoveTarget] = React.useState<MoveTarget | null>(null);
    const [openNotebookId, setOpenNotebookId] = React.useState<string | null>(null);
    const [activities, setActivities] = React.useState<Activity[]>([]);
    const [previewActivityId, setPreviewActivityId] = React.useState<string | null>(null);
    const [isPickerOpen, setIsPickerOpen] = React.useState(false);
    const [folderEditActivityId, setFolderEditActivityId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const unsub = foldersHandler.sync(
            (data) => setFolders(data || []),
            (e) => setLoadError(firestoreErrorMessage(e, 'Klasörler yüklenemedi.'))
        );
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const unsub = notebooksHandler.sync(
            (data) => {
                setNotebooks(data || []);
                setIsLoading(false);
            },
            (e) => {
                setLoadError(firestoreErrorMessage(e, 'Defterler yüklenemedi.'));
                setIsLoading(false);
            }
        );
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const unsub = activitiesHandler.sync((data) => setActivities(data || []));
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Menüleri dışarı tıklamada kapat
    React.useEffect(() => {
        const close = () => {
            setIsNewMenuOpen(false);
            setOpenMenuId(null);
        };
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, []);

    const folderById = React.useMemo(() => {
        const m = new Map<string, DriveFolder>();
        folders.forEach((f) => m.set(f.id, f));
        return m;
    }, [folders]);

    /** Kök klasörden mevcut klasöre kadar olan yol. */
    const breadcrumb = React.useMemo(() => {
        const path: DriveFolder[] = [];
        let id = currentFolderId;
        const guard = new Set<string>();
        while (id && !guard.has(id)) {
            guard.add(id);
            const f = folderById.get(id);
            if (!f) break;
            path.unshift(f);
            id = f.parent_id;
        }
        return path;
    }, [currentFolderId, folderById]);

    const needle = search.trim().toLocaleLowerCase('tr');

    const visibleFolders = React.useMemo(() => {
        const list = needle
            ? folders.filter((f) => f.name.toLocaleLowerCase('tr').includes(needle))
            : folders.filter((f) => (f.parent_id ?? null) === currentFolderId);
        return [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }, [folders, currentFolderId, needle]);

    const visibleNotebooks = React.useMemo(() => {
        const list = needle
            ? notebooks.filter((n) => n.title.toLocaleLowerCase('tr').includes(needle))
            : notebooks.filter((n) => (n.parent_id ?? null) === currentFolderId);
        return [...list].sort((a, b) =>
            (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || '')
        );
    }, [notebooks, currentFolderId, needle]);

    /**
     * Etkinlikler yalnızca eklendikleri klasörün içinde görünür; ana klasörde
     * listelenmezler (hepsi zaten "İçerikler" sekmesinde duruyor).
     */
    const visibleActivities = React.useMemo(() => {
        const filed = activities.filter((a) => activityFolderIds(a).length > 0);
        const list = needle
            ? filed.filter((a) => a.title.toLocaleLowerCase('tr').includes(needle))
            : currentFolderId
            ? filed.filter((a) => isInFolder(a, currentFolderId))
            : [];
        return [...list].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    }, [activities, currentFolderId, needle]);

    const countsFor = React.useCallback(
        (folderId: string) => ({
            folders: folders.filter((f) => f.parent_id === folderId).length,
            notebooks: notebooks.filter((n) => n.parent_id === folderId).length,
            activities: activities.filter((a) => isInFolder(a, folderId)).length,
        }),
        [folders, notebooks, activities]
    );

    // ── Oluşturma ────────────────────────────────────────────────────
    const createFolder = async () => {
        const name = await prompt({
            title: 'Yeni klasör',
            message: 'Örn. 8. Sınıf Fen Bilimleri',
            placeholder: 'Klasör adı',
            confirmLabel: 'Oluştur',
        });
        if (!name?.trim()) return;
        try {
            await foldersHandler.add({
                name: name.trim(),
                parent_id: currentFolderId,
                color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
            });
            toast.success('Klasör oluşturuldu.');
        } catch (e) {
            toast.error(firestoreErrorMessage(e, 'Klasör oluşturulamadı.'));
        }
    };

    const createNotebook = async (kind: NotebookKind) => {
        const isWb = kind === 'whiteboard';
        try {
            const ref = await notebooksHandler.add({
                title: isWb ? 'Adsız beyaz tahta' : 'Adsız defter',
                kind,
                parent_id: currentFolderId,
                paper: isWb ? 'blank' : 'grid',
                bg_color: '#ffffff',
                page_count: 1,
                updated_at: new Date().toISOString(),
            });
            setOpenNotebookId(ref.id);
        } catch (e) {
            toast.error(
                firestoreErrorMessage(
                    e,
                    isWb ? 'Beyaz tahta oluşturulamadı.' : 'Defter oluşturulamadı.'
                )
            );
        }
    };

    // ── Yeniden adlandır / taşı / sil ────────────────────────────────
    const renameFolder = async (f: DriveFolder) => {
        const name = await prompt({
            title: 'Klasörü yeniden adlandır',
            defaultValue: f.name,
            placeholder: 'Klasör adı',
            confirmLabel: 'Kaydet',
        });
        if (!name?.trim()) return;
        try {
            await foldersHandler.update(f.id, { name: name.trim() });
        } catch {
            toast.error('Klasör güncellenemedi.');
        }
    };

    const renameNotebook = async (n: Notebook) => {
        const title = await prompt({
            title: 'Yeniden adlandır',
            defaultValue: n.title,
            placeholder: 'Defter adı',
            confirmLabel: 'Kaydet',
        });
        if (!title?.trim()) return;
        try {
            await notebooksHandler.update(n.id, { title: title.trim() });
        } catch {
            toast.error('Defter güncellenemedi.');
        }
    };

    /** Bir klasörün altındaki tüm klasör ve defterleri toplar. */
    const collectDescendants = React.useCallback(
        (rootId: string) => {
            const folderIds: string[] = [];
            const queue = [rootId];
            while (queue.length) {
                const id = queue.shift()!;
                folderIds.push(id);
                folders.forEach((f) => {
                    if (f.parent_id === id && !folderIds.includes(f.id)) queue.push(f.id);
                });
            }
            const notebookIds = notebooks
                .filter((n) => n.parent_id && folderIds.includes(n.parent_id))
                .map((n) => n.id);
            const activityIds = activities
                .filter((a) => activityFolderIds(a).some((id) => folderIds.includes(id)))
                .map((a) => a.id);
            return { folderIds, notebookIds, activityIds };
        },
        [folders, notebooks, activities]
    );

    const deleteFolder = async (f: DriveFolder) => {
        const { folderIds, notebookIds, activityIds } = collectDescendants(f.id);
        const ok = await confirm({
            title: 'Klasörü sil?',
            message:
                notebookIds.length > 0 || folderIds.length > 1 || activityIds.length > 0
                    ? `"${f.name}" ve içindeki ${folderIds.length - 1} klasör, ${notebookIds.length} defter kalıcı olarak silinecek.` +
                      (activityIds.length
                          ? ` İçindeki ${activityIds.length} etkinlik silinmez, yalnızca klasörden çıkarılır.`
                          : '')
                    : `"${f.name}" kalıcı olarak silinecek.`,
            confirmLabel: 'Sil',
            cancelLabel: 'Vazgeç',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await Promise.all(
                notebookIds.map(async (id) => {
                    await notebooksHandler.remove(id);
                    await deleteDocById('notebook_content', id).catch(() => undefined);
                })
            );
            // Etkinlikler İçerikler sekmesinde kalmalı; yalnızca silinen
            // klasörlerin bağı kopar, diğer klasörlerdeki üyelik korunur.
            await Promise.all(
                activityIds.map((id) => {
                    const act = activities.find((a) => a.id === id);
                    if (!act) return Promise.resolve();
                    const kept = activityFolderIds(act).filter((fid) => !folderIds.includes(fid));
                    return activitiesHandler.update(id, { folder_ids: kept, folder_id: null });
                })
            );
            await Promise.all(folderIds.map((id) => foldersHandler.remove(id)));
            if (folderIds.includes(currentFolderId || '')) setCurrentFolderId(f.parent_id);
            toast.success('Klasör silindi.');
        } catch {
            toast.error('Klasör silinemedi.');
        }
    };

    const deleteNotebook = async (n: Notebook) => {
        const ok = await confirm({
            title: 'Defteri sil?',
            message: `"${n.title}" ve içindeki tüm sayfalar kalıcı olarak silinecek.`,
            confirmLabel: 'Sil',
            cancelLabel: 'Vazgeç',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await notebooksHandler.remove(n.id);
            await deleteDocById('notebook_content', n.id).catch(() => undefined);
            toast.success('Defter silindi.');
        } catch {
            toast.error('Defter silinemedi.');
        }
    };

    const addActivitiesToFolder = async (ids: string[]) => {
        if (!currentFolderId) return;
        try {
            await Promise.all(
                ids.map((id) => {
                    const act = activities.find((a) => a.id === id);
                    const next = new Set(act ? activityFolderIds(act) : []);
                    next.add(currentFolderId);
                    return activitiesHandler.update(id, {
                        folder_ids: Array.from(next),
                        folder_id: null,
                    });
                })
            );
            setIsPickerOpen(false);
            toast.success(
                ids.length > 1 ? `${ids.length} etkinlik klasöre eklendi.` : 'Etkinlik klasöre eklendi.'
            );
        } catch (e) {
            toast.error(firestoreErrorMessage(e, 'Etkinlik eklenemedi.'));
        }
    };

    /** Etkinliği yalnızca bulunulan klasörden çıkarır; diğer klasörler kalır. */
    const removeActivityFromFolder = async (a: Activity) => {
        if (!currentFolderId) return;
        const kept = activityFolderIds(a).filter((id) => id !== currentFolderId);
        try {
            await activitiesHandler.update(a.id, { folder_ids: kept, folder_id: null });
            toast.success(
                kept.length
                    ? `Etkinlik bu klasörden çıkarıldı. Hâlâ ${kept.length} klasörde duruyor.`
                    : 'Etkinlik klasörden çıkarıldı. İçerikler sekmesinde duruyor.'
            );
        } catch (e) {
            toast.error(firestoreErrorMessage(e, 'Etkinlik çıkarılamadı.'));
        }
    };

    const saveActivityFolders = async (activityId: string, ids: string[]) => {
        try {
            await activitiesHandler.update(activityId, { folder_ids: ids, folder_id: null });
            setFolderEditActivityId(null);
            toast.success(
                ids.length
                    ? `Etkinlik ${ids.length} klasörde görünüyor.`
                    : 'Etkinlik tüm klasörlerden çıkarıldı.'
            );
        } catch (e) {
            toast.error(firestoreErrorMessage(e, 'Klasörler kaydedilemedi.'));
        }
    };

    const handleCopyActivityLink = async (a: Activity) => {
        const link = `${window.location.origin}${window.location.pathname}?view=student&id=${a.id}`;
        try {
            await navigator.clipboard.writeText(link);
            toast.success('Öğrenci giriş linki kopyalandı.');
        } catch {
            toast.error('Link kopyalanamadı.');
        }
    };

    /** Taşıma hedefi olarak seçilemeyecek klasörler (kendisi ve alt klasörleri). */
    const blockedForMove = React.useMemo(() => {
        if (moveTarget?.kind !== 'folder') return new Set<string>();
        return new Set(collectDescendants(moveTarget.id).folderIds);
    }, [moveTarget, collectDescendants]);

    const moveOptions = React.useMemo(() => {
        const out: Array<{ id: string | null; label: string; depth: number }> = [
            { id: null, label: 'Defterlerim (ana klasör)', depth: 0 },
        ];
        const walk = (parent: string | null, depth: number) => {
            folders
                .filter((f) => (f.parent_id ?? null) === parent)
                .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                .forEach((f) => {
                    out.push({ id: f.id, label: f.name, depth });
                    walk(f.id, depth + 1);
                });
        };
        walk(null, 1);
        return out;
    }, [folders]);

    const applyMove = async (destination: string | null) => {
        if (!moveTarget) return;
        try {
            if (moveTarget.kind === 'folder') {
                await foldersHandler.update(moveTarget.id, { parent_id: destination });
            } else {
                await notebooksHandler.update(moveTarget.id, { parent_id: destination });
            }
            toast.success('Taşındı.');
        } catch (e) {
            toast.error(firestoreErrorMessage(e, 'Taşıma başarısız.'));
        } finally {
            setMoveTarget(null);
        }
    };

    const openNotebook = notebooks.find((n) => n.id === openNotebookId) || null;
    const previewActivity = activities.find((a) => a.id === previewActivityId) || null;
    const currentFolder = currentFolderId ? folderById.get(currentFolderId) : undefined;
    const folderOptions = React.useMemo(() => {
        const out: Array<{ id: string; label: string; depth: number }> = [];
        const walk = (parent: string | null, depth: number) => {
            folders
                .filter((f) => (f.parent_id ?? null) === parent)
                .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                .forEach((f) => {
                    out.push({ id: f.id, label: f.name, depth });
                    walk(f.id, depth + 1);
                });
        };
        walk(null, 0);
        return out;
    }, [folders]);

    const folderEditActivity =
        activities.find((a) => a.id === folderEditActivityId) || null;

    const activityIdsHere = React.useMemo(
        () => new Set(activities.filter((a) => isInFolder(a, currentFolderId)).map((a) => a.id)),
        [activities, currentFolderId]
    );

    // ── Parçalar ─────────────────────────────────────────────────────
    const RowMenu = ({ id, children }: { id: string; children: React.ReactNode }) => {
        const btnRef = React.useRef<HTMLButtonElement>(null);
        const isOpen = openMenuId === id;
        // Sayfanın altına yakın satırlarda menü yukarı doğru açılır.
        const [dropUp, setDropUp] = React.useState(false);

        const toggle = () => {
            if (isOpen) {
                setOpenMenuId(null);
                return;
            }
            const rect = btnRef.current?.getBoundingClientRect();
            setDropUp(!!rect && rect.bottom + 168 > window.innerHeight);
            setOpenMenuId(id);
        };

        return (
            <div
                className={cn('relative', isOpen && 'z-40')}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    ref={btnRef}
                    onClick={toggle}
                    aria-label="Seçenekler"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
                {isOpen && (
                    <div
                        role="menu"
                        className={cn(
                            'absolute right-0 z-40 min-w-[184px] bg-white border border-outline-variant rounded-xl shadow-lg py-1.5',
                            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
                        )}
                    >
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const MenuAction = ({
        icon,
        label,
        onClick,
        danger,
    }: {
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        danger?: boolean;
    }) => (
        <button
            onClick={() => {
                setOpenMenuId(null);
                onClick();
            }}
            className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors',
                danger
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-on-surface hover:bg-surface-container-high'
            )}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-6 pb-20">
            {/* Üst şerit: yol + arama + görünüm + Yeni */}
            <div className="bg-white border border-outline-variant rounded-[18px] px-4 sm:px-5 py-3.5 mb-5 flex items-center gap-3 flex-wrap">
                <nav className="flex items-center gap-1 min-w-0 flex-1" aria-label="Klasör yolu">
                    <button
                        onClick={() => setCurrentFolderId(null)}
                        className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13.5px] font-semibold transition-colors',
                            currentFolderId === null
                                ? 'text-on-surface'
                                : 'text-on-surface-variant hover:bg-surface-container-high'
                        )}
                    >
                        <Home className="w-4 h-4" /> Defterlerim
                    </button>
                    {breadcrumb.map((f, i) => (
                        <React.Fragment key={f.id}>
                            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/60 flex-shrink-0" />
                            <button
                                onClick={() => setCurrentFolderId(f.id)}
                                className={cn(
                                    'px-2.5 py-1.5 rounded-lg text-[13.5px] font-semibold truncate max-w-[180px] transition-colors',
                                    i === breadcrumb.length - 1
                                        ? 'text-on-surface'
                                        : 'text-on-surface-variant hover:bg-surface-container-high'
                                )}
                            >
                                {f.name}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>

                <div className="flex items-center gap-2.5 bg-surface-container-high focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/25 rounded-xl px-3 py-2 transition-all w-full sm:w-[240px]">
                    <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Defter veya klasör ara…"
                        aria-label="Defter veya klasör ara"
                        className="flex-1 bg-transparent outline-none text-[13px] text-on-surface placeholder-on-surface-variant min-w-0"
                    />
                </div>

                <div className="flex bg-surface-container-high rounded-[10px] p-[3px] gap-0.5">
                    <button
                        onClick={() => setViewMode('list')}
                        aria-label="Liste görünümü"
                        className={cn('p-1.5 rounded-lg', viewMode === 'list' ? 'bg-primary text-white' : 'text-on-surface-variant')}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        aria-label="Kart görünümü"
                        className={cn('p-1.5 rounded-lg', viewMode === 'grid' ? 'bg-primary text-white' : 'text-on-surface-variant')}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>

                {/* + Yeni */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setIsNewMenuOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isNewMenuOpen}
                        className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-[13.5px] font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.28)] hover:-translate-y-0.5 hover:brightness-105 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Yeni
                    </button>

                    {isNewMenuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-full mt-2 z-40 w-[340px] bg-white border border-outline-variant rounded-[20px] shadow-[0_18px_44px_rgba(15,23,42,0.16)] p-3"
                        >
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => {
                                        setIsNewMenuOpen(false);
                                        void createNotebook('notebook');
                                    }}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <span className="w-full h-[76px] rounded-xl bg-[#eef2ff] border border-[#c7d2fe] flex items-center justify-center">
                                        <NotebookPen className="w-7 h-7 text-primary" />
                                    </span>
                                    <span className="text-[13px] font-semibold text-on-surface">Not Defteri</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsNewMenuOpen(false);
                                        void createNotebook('whiteboard');
                                    }}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <span className="w-full h-[76px] rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center">
                                        <Presentation className="w-7 h-7 text-emerald-600" />
                                    </span>
                                    <span className="text-[13px] font-semibold text-on-surface">Beyaz Tahta</span>
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setIsNewMenuOpen(false);
                                    void createFolder();
                                }}
                                className="mt-2.5 w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-[13.5px] font-semibold text-on-surface transition-colors"
                            >
                                <FolderPlus className="w-[18px] h-[18px] text-on-surface-variant" /> Yeni Klasör
                            </button>
                            <button
                                onClick={() => {
                                    setIsNewMenuOpen(false);
                                    setIsPickerOpen(true);
                                }}
                                disabled={!currentFolderId}
                                title={
                                    currentFolderId
                                        ? undefined
                                        : 'Önce bir klasöre girin'
                                }
                                className="mt-1.5 w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:hover:bg-surface-container-high text-[13.5px] font-semibold text-on-surface transition-colors"
                            >
                                <MonitorPlay className="w-[18px] h-[18px] text-on-surface-variant" />{' '}
                                Etkinlik Ekle
                            </button>
                            <p className="text-[11.5px] text-on-surface-variant mt-2 px-1 leading-relaxed">
                                Klasör oluşturup derslerini içine ekleyebilirsin. Yeni defter,
                                bulunduğun klasörde açılır. “Etkinlik Ekle” ile İçerikler
                                sekmesindeki etkinlikleri bu klasöre bağlarsın.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Başlık */}
            <div className="flex items-baseline gap-2.5 mb-3.5">
                <h1 className="text-[21px] font-bold font-headline-md text-on-surface m-0">
                    {needle
                        ? `"${search.trim()}" araması`
                        : breadcrumb.length
                        ? breadcrumb[breadcrumb.length - 1].name
                        : 'Defterlerim'}
                </h1>
                <span className="text-[13px] text-on-surface-variant">
                    {visibleFolders.length} klasör · {visibleNotebooks.length} defter
                    {visibleActivities.length > 0 && ` · ${visibleActivities.length} etkinlik`}
                </span>
            </div>

            {loadError && (
                <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-[13px] text-red-700">
                    {loadError}
                </div>
            )}

            {isLoading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">
                        Yükleniyor…
                    </p>
                </div>
            ) : visibleFolders.length === 0 &&
              visibleNotebooks.length === 0 &&
              visibleActivities.length === 0 ? (
                <div className="py-20 bg-white rounded-[22px] border border-outline-variant text-center px-6">
                    <h3 className="text-base font-bold font-headline-md text-on-surface">
                        {needle ? 'Sonuç bulunamadı' : 'Bu klasör boş'}
                    </h3>
                    <p className="text-[13px] text-on-surface-variant mt-1.5">
                        {needle
                            ? 'Farklı bir arama deneyin.'
                            : 'Sağ üstteki “Yeni” düğmesinden defter, beyaz tahta veya klasör oluşturun.'}
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white border border-outline-variant rounded-[18px]">
                    {visibleFolders.map((f) => {
                        const c = countsFor(f.id);
                        return (
                            <div
                                key={f.id}
                                onClick={() => {
                                    setSearch('');
                                    setCurrentFolderId(f.id);
                                }}
                                className="flex items-center gap-3.5 px-4 py-3 border-b border-outline-variant last:border-b-0 first:rounded-t-[18px] last:rounded-b-[18px] hover:bg-surface-container-low cursor-pointer transition-colors"
                            >
                                <Folder
                                    className="w-9 h-9 flex-shrink-0"
                                    style={{ color: f.color || '#3b82f6' }}
                                    fill={f.color || '#3b82f6'}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-semibold text-on-surface truncate">{f.name}</p>
                                    <p className="text-[12px] text-on-surface-variant">
                                        {c.folders} klasör · {c.notebooks} defter
                                        {c.activities > 0 && ` · ${c.activities} etkinlik`} ·{' '}
                                        {formatDate(f.created_at)}
                                    </p>
                                </div>
                                <RowMenu id={f.id}>
                                    <MenuAction icon={<PencilLine className="w-4 h-4" />} label="Yeniden adlandır" onClick={() => renameFolder(f)} />
                                    <MenuAction icon={<FolderInput className="w-4 h-4" />} label="Taşı" onClick={() => setMoveTarget({ kind: 'folder', id: f.id, name: f.name })} />
                                    <MenuAction icon={<Trash2 className="w-4 h-4" />} label="Sil" danger onClick={() => deleteFolder(f)} />
                                </RowMenu>
                            </div>
                        );
                    })}

                    {visibleNotebooks.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => setOpenNotebookId(n.id)}
                            className="flex items-center gap-3.5 px-4 py-3 border-b border-outline-variant last:border-b-0 first:rounded-t-[18px] last:rounded-b-[18px] hover:bg-surface-container-low cursor-pointer transition-colors"
                        >
                            <span
                                className={cn(
                                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border',
                                    n.kind === 'whiteboard'
                                        ? 'bg-[#ecfdf5] border-[#a7f3d0] text-emerald-600'
                                        : 'bg-[#eef2ff] border-[#c7d2fe] text-primary'
                                )}
                            >
                                {n.kind === 'whiteboard' ? (
                                    <Presentation className="w-[18px] h-[18px]" />
                                ) : (
                                    <NotebookPen className="w-[18px] h-[18px]" />
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-semibold text-on-surface truncate">{n.title}</p>
                                <p className="text-[12px] text-on-surface-variant">
                                    {n.page_count || 1} sayfa · {formatDate(n.updated_at || n.created_at)}
                                </p>
                            </div>
                            <RowMenu id={n.id}>
                                <MenuAction icon={<PencilLine className="w-4 h-4" />} label="Yeniden adlandır" onClick={() => renameNotebook(n)} />
                                <MenuAction icon={<FolderInput className="w-4 h-4" />} label="Taşı" onClick={() => setMoveTarget({ kind: 'notebook', id: n.id, name: n.title })} />
                                <MenuAction icon={<Trash2 className="w-4 h-4" />} label="Sil" danger onClick={() => deleteNotebook(n)} />
                            </RowMenu>
                        </div>
                    ))}

                    {visibleActivities.map((a) => (
                        <div
                            key={a.id}
                            onClick={() => setPreviewActivityId(a.id)}
                            className="flex items-center gap-3.5 px-4 py-3 border-b border-outline-variant last:border-b-0 first:rounded-t-[18px] last:rounded-b-[18px] hover:bg-surface-container-low cursor-pointer transition-colors"
                        >
                            <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border bg-[#fff7ed] border-[#fed7aa] text-orange-500">
                                <MonitorPlay className="w-[18px] h-[18px]" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-semibold text-on-surface truncate">{a.title}</p>
                                <p className="text-[12px] text-on-surface-variant truncate">
                                    Etkinlik
                                    {a.subject ? ` · ${a.subject}` : ''}
                                    {a.grade_level ? ` · ${formatGradeLevel(a.grade_level)}` : ''}
                                    {a.category ? ` · ${a.category}` : ''}
                                    {activityFolderIds(a).length > 1 &&
                                        ` · ${activityFolderIds(a).length} klasörde`}
                                </p>
                            </div>
                            <RowMenu id={a.id}>
                                <MenuAction icon={<Eye className="w-4 h-4" />} label="Aç / önizle" onClick={() => setPreviewActivityId(a.id)} />
                                <MenuAction icon={<Link2 className="w-4 h-4" />} label="Öğrenci linkini kopyala" onClick={() => handleCopyActivityLink(a)} />
                                <MenuAction icon={<FolderInput className="w-4 h-4" />} label="Klasörlerini düzenle" onClick={() => setFolderEditActivityId(a.id)} />
                                <MenuAction icon={<Trash2 className="w-4 h-4" />} label="Klasörden çıkar" danger onClick={() => removeActivityFromFolder(a)} />
                            </RowMenu>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
                    {visibleFolders.map((f) => {
                        const c = countsFor(f.id);
                        return (
                            <div
                                key={f.id}
                                onClick={() => {
                                    setSearch('');
                                    setCurrentFolderId(f.id);
                                }}
                                className="bg-white border border-outline-variant rounded-[18px] p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <Folder
                                        className="w-10 h-10"
                                        style={{ color: f.color || '#3b82f6' }}
                                        fill={f.color || '#3b82f6'}
                                    />
                                    <RowMenu id={f.id}>
                                        <MenuAction icon={<PencilLine className="w-4 h-4" />} label="Yeniden adlandır" onClick={() => renameFolder(f)} />
                                        <MenuAction icon={<FolderInput className="w-4 h-4" />} label="Taşı" onClick={() => setMoveTarget({ kind: 'folder', id: f.id, name: f.name })} />
                                        <MenuAction icon={<Trash2 className="w-4 h-4" />} label="Sil" danger onClick={() => deleteFolder(f)} />
                                    </RowMenu>
                                </div>
                                <p className="mt-2.5 text-[14px] font-semibold text-on-surface truncate">{f.name}</p>
                                <p className="text-[12px] text-on-surface-variant">
                                    {c.folders} klasör · {c.notebooks} defter
                                    {c.activities > 0 && ` · ${c.activities} etkinlik`}
                                </p>
                            </div>
                        );
                    })}

                    {visibleNotebooks.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => setOpenNotebookId(n.id)}
                            className="bg-white border border-outline-variant rounded-[18px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all"
                        >
                            <div
                                className={cn(
                                    'h-[104px] flex items-center justify-center rounded-t-[17px] overflow-hidden',
                                    n.kind === 'whiteboard' ? 'bg-[#ecfdf5]' : 'bg-[#eef2ff]'
                                )}
                                style={
                                    n.kind === 'whiteboard'
                                        ? undefined
                                        : {
                                              backgroundImage:
                                                  'linear-gradient(rgba(99,102,241,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.16) 1px, transparent 1px)',
                                              backgroundSize: '14px 14px',
                                          }
                                }
                            >
                                {n.kind === 'whiteboard' ? (
                                    <Presentation className="w-8 h-8 text-emerald-600" />
                                ) : (
                                    <NotebookPen className="w-8 h-8 text-primary" />
                                )}
                            </div>
                            <div className="flex items-start gap-1 p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13.5px] font-semibold text-on-surface truncate">{n.title}</p>
                                    <p className="text-[11.5px] text-on-surface-variant">
                                        {n.page_count || 1} sayfa · {formatDate(n.updated_at || n.created_at)}
                                    </p>
                                </div>
                                <RowMenu id={n.id}>
                                    <MenuAction icon={<PencilLine className="w-4 h-4" />} label="Yeniden adlandır" onClick={() => renameNotebook(n)} />
                                    <MenuAction icon={<FolderInput className="w-4 h-4" />} label="Taşı" onClick={() => setMoveTarget({ kind: 'notebook', id: n.id, name: n.title })} />
                                    <MenuAction icon={<Trash2 className="w-4 h-4" />} label="Sil" danger onClick={() => deleteNotebook(n)} />
                                </RowMenu>
                            </div>
                        </div>
                    ))}

                    {visibleActivities.map((a) => (
                        <div
                            key={a.id}
                            onClick={() => setPreviewActivityId(a.id)}
                            className="bg-white border border-outline-variant rounded-[18px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all"
                        >
                            <div
                                className="h-[104px] flex items-center justify-center rounded-t-[17px] overflow-hidden bg-[#fff7ed] bg-cover bg-center"
                                style={
                                    a.image_url ? { backgroundImage: `url(${a.image_url})` } : undefined
                                }
                            >
                                {!a.image_url && <MonitorPlay className="w-8 h-8 text-orange-500" />}
                            </div>
                            <div className="flex items-start gap-1 p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13.5px] font-semibold text-on-surface truncate">{a.title}</p>
                                    <p className="text-[11.5px] text-on-surface-variant truncate">
                                        Etkinlik{a.subject ? ` · ${a.subject}` : ''}
                                        {a.grade_level ? ` · ${formatGradeLevel(a.grade_level)}` : ''}
                                        {activityFolderIds(a).length > 1 &&
                                            ` · ${activityFolderIds(a).length} klasörde`}
                                    </p>
                                </div>
                                <RowMenu id={a.id}>
                                    <MenuAction icon={<Eye className="w-4 h-4" />} label="Aç / önizle" onClick={() => setPreviewActivityId(a.id)} />
                                    <MenuAction icon={<Link2 className="w-4 h-4" />} label="Öğrenci linkini kopyala" onClick={() => handleCopyActivityLink(a)} />
                                    <MenuAction icon={<FolderInput className="w-4 h-4" />} label="Klasörlerini düzenle" onClick={() => setFolderEditActivityId(a.id)} />
                                    <MenuAction icon={<Trash2 className="w-4 h-4" />} label="Klasörden çıkar" danger onClick={() => removeActivityFromFolder(a)} />
                                </RowMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Taşıma penceresi */}
            <Modal
                isOpen={!!moveTarget}
                onClose={() => setMoveTarget(null)}
                title={moveTarget ? `"${moveTarget.name}" taşı` : 'Taşı'}
            >
                <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
                    {moveOptions.map((opt) => {
                        const disabled = opt.id !== null && blockedForMove.has(opt.id);
                        return (
                            <button
                                key={opt.id ?? 'root'}
                                disabled={disabled}
                                onClick={() => applyMove(opt.id)}
                                style={{ paddingLeft: 12 + opt.depth * 16 }}
                                className={cn(
                                    'flex items-center gap-2.5 pr-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left transition-colors',
                                    disabled
                                        ? 'opacity-35 cursor-not-allowed'
                                        : 'hover:bg-surface-container-high text-on-surface'
                                )}
                            >
                                {opt.id === null ? (
                                    <Home className="w-4 h-4 text-on-surface-variant" />
                                ) : (
                                    <Folder className="w-4 h-4 text-blue-500" fill="#3b82f6" />
                                )}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </Modal>

            {/* Etkinlik seçici */}
            <ActivityPicker
                isOpen={isPickerOpen && !!currentFolderId}
                onClose={() => setIsPickerOpen(false)}
                activities={activities}
                folderName={currentFolder?.name || 'Klasör'}
                existingIds={activityIdsHere}
                onAdd={addActivitiesToFolder}
            />

            {/* Etkinliğin klasörleri */}
            {folderEditActivity && (
                <ActivityFolderDialog
                    isOpen
                    onClose={() => setFolderEditActivityId(null)}
                    activityTitle={folderEditActivity.title}
                    folders={folderOptions}
                    selectedIds={activityFolderIds(folderEditActivity)}
                    onSave={(ids) => saveActivityFolders(folderEditActivity.id, ids)}
                />
            )}

            {/* Etkinlik önizleme */}
            {previewActivity && (
                <ActivityPreviewModal
                    activity={previewActivity}
                    onClose={() => setPreviewActivityId(null)}
                />
            )}

            {/* Editör */}
            {openNotebook && (
                <NotebookEditor
                    key={openNotebook.id}
                    notebook={openNotebook}
                    onClose={() => setOpenNotebookId(null)}
                    onMetaChange={(patch) => {
                        void notebooksHandler.update(openNotebook.id, patch).catch(() => undefined);
                    }}
                />
            )}
        </div>
    );
}
