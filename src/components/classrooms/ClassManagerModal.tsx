// src/components/classrooms/ClassManagerModal.tsx — Admin Sınıf Yönetim Paneli
import { useState, useMemo, useEffect } from 'react';
import {
    School,
    Plus,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    Check,
    ArrowLeft,
    Users,
    Key,
    ExternalLink,
    FlaskConical,
    Sparkles,
    BookOpen,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastProvider';
import { useConfirm } from '../common/ConfirmDialog';
import {
    useClassrooms,
    getSatrancLocalStorageStatus,
    importFromSatrancLocalStorage,
    importFromSatrancEncryptedRoster,
} from '../../lib/classrooms';
import { PORTAL_MODULES } from '../../constants/portal';
import { EXPERIMENTS_CATALOG } from '../../constants/experiments';
import { useFirestore } from '../../lib/firebase';
import { saveSession } from '../../utils/auth';
import type { ClassRoom, ClassStudent, Notebook } from '../../types';
import { cn } from '../../utils/cn';

interface ClassManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToClass?: (classItem: ClassRoom) => void;
}

export function ClassManagerModal({ isOpen, onClose, onSwitchToClass }: ClassManagerModalProps) {
    const { classes, loading, addClass, updateClass, removeClass } = useClassrooms();
    const toast = useToast();
    const confirm = useConfirm();

    // Satranç yerel depolama durumu
    const [satrancStatus, setSatrancStatus] = useState(getSatrancLocalStorageStatus);
    const [isImporting, setIsImporting] = useState(false);
    const [showRosterBox, setShowRosterBox] = useState(false);
    const [rosterPass, setRosterPass] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSatrancStatus(getSatrancLocalStorageStatus());
        }
    }, [isOpen]);

    // Defter listesini çek (sınıfa defter atamak için)
    const notebooksHandler = useFirestore<Notebook>('notebooks');
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        const unsub = notebooksHandler.sync(
            (data) => setNotebooks(data || []),
            (err) => console.warn('Defterler yüklenemedi:', err)
        );
        return () => unsub();
    }, [isOpen]);

    // Modal içi görünüm: 'list' veya 'form'
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

    // Form alanları
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [grade, setGrade] = useState('');
    const [studentsRaw, setStudentsRaw] = useState('');
    const [assignedModules, setAssignedModules] = useState<string[]>([]);
    const [assignedExperiments, setAssignedExperiments] = useState<string[]>([]);
    const [assignedNotebooks, setAssignedNotebooks] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Şifreleri kartlarda gizle/göster
    const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

    const togglePasswordVisibility = (id: string) => {
        setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Düzenlemeyi başlat
    const startEdit = (c: ClassRoom) => {
        setEditingClass(c);
        setName(c.name);
        setUsername(c.username);
        setPassword(c.password);
        setGrade(c.grade || '');
        setStudentsRaw((c.students || []).map((s) => s.name).join('\n'));
        setAssignedModules(c.assignedModules || ['satranc', 'deneyler']);
        setAssignedExperiments(c.assignedExperiments || []);
        setAssignedNotebooks(c.assignedNotebooks || []);
        setView('form');
    };

    // Yeni sınıf eklemeyi başlat
    const startNew = () => {
        setEditingClass(null);
        setName('');
        setUsername('');
        setPassword('');
        setGrade('');
        setStudentsRaw('');
        // Varsayılan olarak popüler modüller seçili gelsin
        setAssignedModules(['satranc', 'deneyler', 'akil-oyunlari']);
        setAssignedExperiments(['basit-pusula.html', 'isildayan-devre.html', 'termometre.html']);
        setAssignedNotebooks([]);
        setView('form');
    };

    // Öğrenci metnini diziye dönüştür
    const parsedStudents: ClassStudent[] = useMemo(() => {
        return studentsRaw
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line, idx) => ({
                id: `st_${idx + 1}_${line.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                name: line,
            }));
    }, [studentsRaw]);

    // Modül seçimi aç/kapat
    const toggleModule = (modId: string) => {
        setAssignedModules((prev) =>
            prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
        );
    };

    // Deney seçimi aç/kapat
    const toggleExperiment = (file: string) => {
        setAssignedExperiments((prev) =>
            prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
        );
    };

    // Defter seçimi aç/kapat
    const toggleNotebook = (nbId: string) => {
        setAssignedNotebooks((prev) =>
            prev.includes(nbId) ? prev.filter((id) => id !== nbId) : [...prev, nbId]
        );
    };

    // Kaydet
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const cleanUser = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        const cleanPass = password.trim();

        if (!trimmedName) {
            toast.error('Lütfen sınıf adını girin.');
            return;
        }
        if (!cleanUser) {
            toast.error('Lütfen geçerli bir kullanıcı adı girin.');
            return;
        }
        if (!cleanPass) {
            toast.error('Lütfen bir şifre belirleyin.');
            return;
        }

        // Kullanıcı adı çakışma kontrolü
        const duplicate = classes.find(
            (c) => c.username?.toLowerCase() === cleanUser && c.id !== editingClass?.id
        );
        if (duplicate) {
            toast.error(`"${cleanUser}" kullanıcı adı başka bir sınıfta kullanılıyor.`);
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: trimmedName,
                username: cleanUser,
                password: cleanPass,
                grade: grade.trim() || undefined,
                students: parsedStudents,
                assignedModules,
                assignedExperiments,
                assignedNotebooks,
                assignedActivities: editingClass?.assignedActivities || [],
            };

            if (editingClass) {
                await updateClass(editingClass.id, payload);
                toast.success(`"${trimmedName}" sınıfı güncellendi.`);
            } else {
                await addClass(payload);
                toast.success(`"${trimmedName}" sınıfı başarıyla eklendi.`);
            }
            setView('list');
        } catch (err: any) {
            console.error('Sınıf kaydedilemedi:', err);
            toast.error('Sınıf kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    // Sınıfı sil
    const handleDelete = async (c: ClassRoom) => {
        const ok = await confirm({
            title: `"${c.name}" Sınıfını Sil`,
            message: `Bu sınıfı ve tanımlanan tüm ayarları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
            confirmLabel: 'Evet, Sil',
            variant: 'danger',
        });
        if (!ok) return;

        try {
            await removeClass(c.id);
            toast.success(`"${c.name}" sınıfı silindi.`);
        } catch (err) {
            toast.error('Sınıf silinirken hata oluştu.');
        }
    };

    // Sınıf olarak aç / önizle
    const handleOpenAsClass = (c: ClassRoom) => {
        saveSession({
            role: 'class',
            classId: c.id,
            className: c.name,
            username: c.username,
        });
        onClose();
        if (onSwitchToClass) {
            onSwitchToClass(c);
        } else {
            window.location.reload();
        }
    };

    // Satranç yerel depolamadaki sınıfları aktar
    const handleImportFromStorage = async () => {
        setIsImporting(true);
        try {
            const res = await importFromSatrancLocalStorage();
            if (res.added > 0) {
                toast.success(`${res.added} sınıf ve öğrencileri başarıyla eklendi.`);
            } else if (res.skipped > 0) {
                toast.info(`Kayıtlı sınıflar zaten sistemde mevcut (${res.skipped} sınıf).`);
            } else {
                toast.info('Eklenecek yeni sınıf bulunamadı.');
            }
            setSatrancStatus(getSatrancLocalStorageStatus());
        } catch (e) {
            toast.error('Aktarım sırasında bir hata oluştu.');
        } finally {
            setIsImporting(false);
        }
    };

    // Satranç gömülü şifreli listeyi çöz ve sınıflara ekle
    const handleDecryptSchoolRoster = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = rosterPass.trim();
        if (!trimmed) {
            toast.error('Lütfen öğretmen şifresini girin.');
            return;
        }
        setIsDecrypting(true);
        try {
            const res = await importFromSatrancEncryptedRoster(trimmed);
            toast.success(`Okul listesi açıldı: ${res.added} sınıf eklendi.`);
            setRosterPass('');
            setShowRosterBox(false);
            setSatrancStatus(getSatrancLocalStorageStatus());
        } catch (err: any) {
            toast.error(err.message || 'Şifre çözülemedi.');
        } finally {
            setIsDecrypting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                setView('list');
                onClose();
            }}
            title={view === 'list' ? 'Sınıflarım ve Çalışma Alanları' : editingClass ? 'Sınıfı Düzenle' : 'Yeni Sınıf Ekle'}
        >
            <div className="flex flex-col flex-1 overflow-y-auto max-h-[75vh] pr-1">
                {/* LİSTE GÖRÜNÜMÜ */}
                {view === 'list' && (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[13.5px] text-slate-500">
                                    Sisteme tanımladığınız sınıflar. Her sınıf kendi kullanıcı adı ve şifresiyle giriş yaptığında sadece o sınıfa tanımladığınız çalışmalar açılır.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowRosterBox((s) => !s)}
                                    className="px-3 py-2 rounded-xl text-[12.5px] font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
                                    title="Satranç Okul Listesini Şifreyle Yükle"
                                >
                                    <span>♟️</span>
                                    <span>Satranç Listesi</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={startNew}
                                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_4px_12px_rgba(99,102,241,0.25)] flex items-center gap-1.5 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Yeni Sınıf Ekle
                                </button>
                            </div>
                        </div>

                        {/* Satranç Tarayıcı Deposu Aktarım Kutusu */}
                        {satrancStatus.hasClasses && (
                            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">♟️</span>
                                    <div>
                                        <div className="text-[13.5px] font-extrabold text-amber-950">
                                            Satrançta Kayıtlı Sınıflar Bulundu
                                        </div>
                                        <div className="text-[12px] text-amber-800">
                                            Tarayıcınızda kayıtlı {satrancStatus.classCount} sınıf ve {satrancStatus.studentCount} öğrenci mevcut.
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isImporting}
                                    onClick={handleImportFromStorage}
                                    className="bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-[12.5px] font-bold shadow-sm transition-all flex-shrink-0"
                                >
                                    {isImporting ? 'Aktarılıyor…' : 'Sınıfları İçe Aktar'}
                                </button>
                            </div>
                        )}

                        {/* Satranç Gömülü Okul Listesi Şifre Çözüm Kutusu */}
                        {showRosterBox && (
                            <form
                                onSubmit={handleDecryptSchoolRoster}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-xl">♟️</span>
                                    <input
                                        type="password"
                                        value={rosterPass}
                                        onChange={(e) => setRosterPass(e.target.value)}
                                        placeholder="Satranç öğretmen şifresi"
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isDecrypting}
                                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-[12.5px] font-bold shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {isDecrypting ? 'Çözülüyor…' : 'Okul Listesini Yükle'}
                                </button>
                            </form>
                        )}

                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                Sınıflar yükleniyor…
                            </div>
                        ) : classes.length === 0 ? (
                            <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center p-6 bg-slate-50/50">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                                    <School className="w-6 h-6" />
                                </div>
                                <h3 className="text-[16px] font-bold text-slate-800 mb-1">Henüz sınıf eklenmedi</h3>
                                <p className="text-[13px] text-slate-500 max-w-sm mb-4">
                                    Ders verdiğiniz sınıfları ekleyerek onlara özel satranç listeleri, fen deneyleri ve defterler atayabilirsiniz.
                                </p>
                                <button
                                    type="button"
                                    onClick={startNew}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    İlk Sınıfı Ekle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classes.map((c) => {
                                    const isRevealed = revealedPasswords[c.id];
                                    const studentCount = c.students?.length || 0;
                                    const moduleCount = c.assignedModules?.length || 0;
                                    const expCount = c.assignedExperiments?.length || 0;
                                    const noteCount = c.assignedNotebooks?.length || 0;

                                    return (
                                        <div
                                            key={c.id}
                                            className="border border-slate-200/90 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[16px]">
                                                            {c.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[17px] font-extrabold text-slate-900 leading-tight">
                                                                {c.name}
                                                            </h4>
                                                            {c.grade && (
                                                                <span className="text-[11px] font-semibold text-slate-400">
                                                                    {c.grade}. Sınıf
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(c)}
                                                            title="Düzenle"
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(c)}
                                                            title="Sil"
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Giriş Bilgileri */}
                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-3 flex items-center justify-between text-[12px]">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Kullanıcı: </span>
                                                            <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                                {c.username}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Şifre: </span>
                                                            <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                                {isRevealed ? c.password : '••••••'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility(c.id)}
                                                        className="text-slate-400 hover:text-slate-600 p-0.5"
                                                        title={isRevealed ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                                    >
                                                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>

                                                {/* İstatistikler */}
                                                <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-slate-500">
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                                        <Users className="w-3 h-3 text-slate-400" />
                                                        {studentCount} Öğrenci
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                                                        <Sparkles className="w-3 h-3" />
                                                        {moduleCount} Modül
                                                    </span>
                                                    {expCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                                                            <FlaskConical className="w-3 h-3" />
                                                            {expCount} Deney
                                                        </span>
                                                    )}
                                                    {noteCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md">
                                                            <BookOpen className="w-3 h-3" />
                                                            {noteCount} Defter
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sınıf Olarak Aç Butonu */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAsClass(c)}
                                                className="w-full mt-1 bg-slate-900 hover:bg-black text-white text-[12.5px] font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Sınıf Görünümünü Aç (Önizle)
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* FORM GÖRÜNÜMÜ (YENİ / DÜZENLE) */}
                {view === 'form' && (
                    <form onSubmit={handleSave} className="flex flex-col gap-6">
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800 w-fit"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Sınıf Listesine Dön
                        </button>

                        {/* Temel Bilgiler */}
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4">
                            <h4 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
                                <School className="w-4 h-4 text-indigo-600" />
                                Sınıf ve Giriş Bilgileri
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                                        Sınıf Adı *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Örn: 4-A"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[14px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                                        Kullanıcı Adı (Giriş İçin) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                                        placeholder="Örn: 4a"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[14px] font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                                        Şifre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Örn: 1234"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[14px] font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Öğrenci Kadrosu */}
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    Öğrenci Kadrosu ({parsedStudents.length} Öğrenci)
                                </h4>
                                <span className="text-[11.5px] text-slate-400 font-medium">
                                    Satranç maçlarında ve etkinliklerde kullanılır
                                </span>
                            </div>
                            <p className="text-[12px] text-slate-500">
                                Öğrenci isimlerini her satıra bir öğrenci gelecek şekilde yazabilir veya e-Okul / Excel listesinden doğrudan kopyalayıp yapıştırabilirsiniz:
                            </p>
                            <textarea
                                rows={5}
                                value={studentsRaw}
                                onChange={(e) => setStudentsRaw(e.target.value)}
                                placeholder="Ahmet Yılmaz&#10;Zeynep Kaya&#10;Mehmet Demir&#10;Elif Şahin"
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[13.5px] font-sans leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Açılacak Portal Modülleri */}
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3">
                            <h4 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                Sınıfa Açılacak Çalışmalar (Modüller)
                            </h4>
                            <p className="text-[12px] text-slate-500">
                                Sınıf girişi yapıldığında panoda SADECE burada işaretlediğiniz bölümler görünür.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {PORTAL_MODULES.map((mod) => {
                                    const isChecked = assignedModules.includes(mod.id);
                                    return (
                                        <button
                                            type="button"
                                            key={mod.id}
                                            onClick={() => toggleModule(mod.id)}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                                                isChecked
                                                    ? 'bg-indigo-50/60 border-indigo-300 shadow-sm text-indigo-950'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'w-5 h-5 rounded-md flex items-center justify-center border transition-colors',
                                                    isChecked
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                )}
                                            >
                                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[13px] font-bold truncate">{mod.title}</div>
                                                <div className="text-[11px] text-slate-400 truncate">{mod.meta}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sınıfa Özel Fen Deneyleri */}
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                                    Sınıfa Tanımlanan Deneyler ({assignedExperiments.length} Seçili)
                                </h4>
                                <span className="text-[11.5px] text-slate-400 font-medium">
                                    Sınıf panosunda tek tıkla açılır
                                </span>
                            </div>
                            <p className="text-[12px] text-slate-500">
                                Öğretmenin bu sınıfa özel tanımlamak istediği fen ve bilim simülasyonları:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                                {EXPERIMENTS_CATALOG.map((exp) => {
                                    const isChecked = assignedExperiments.includes(exp.file);
                                    return (
                                        <button
                                            type="button"
                                            key={exp.id}
                                            onClick={() => toggleExperiment(exp.file)}
                                            className={cn(
                                                'flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all',
                                                isChecked
                                                    ? 'bg-emerald-50/70 border-emerald-300 shadow-sm text-emerald-950'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            )}
                                        >
                                            <span className="text-[18px]">{exp.icon}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[12px] font-bold truncate">{exp.title}</div>
                                                <div className="text-[10.5px] text-slate-400 truncate">{exp.category}</div>
                                            </div>
                                            <div
                                                className={cn(
                                                    'w-4 h-4 rounded flex items-center justify-center border transition-colors',
                                                    isChecked
                                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                )}
                                            >
                                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sınıfa Özel Defterler */}
                        {notebooks.length > 0 && (
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3">
                                <h4 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-violet-600" />
                                    Sınıfa Tanımlanan Ders Defterleri ({assignedNotebooks.length} Seçili)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {notebooks.map((nb) => {
                                        const isChecked = assignedNotebooks.includes(nb.id);
                                        return (
                                            <button
                                                type="button"
                                                key={nb.id}
                                                onClick={() => toggleNotebook(nb.id)}
                                                className={cn(
                                                    'flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all',
                                                    isChecked
                                                        ? 'bg-violet-50/70 border-violet-300 shadow-sm text-violet-950'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'w-4 h-4 rounded flex items-center justify-center border transition-colors',
                                                        isChecked
                                                            ? 'bg-violet-600 border-violet-600 text-white'
                                                            : 'border-slate-300 bg-white'
                                                    )}
                                                >
                                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[12.5px] font-bold truncate">{nb.title}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Kaydet Butonları */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Kaydediliyor…' : editingClass ? 'Değişiklikleri Kaydet' : 'Sınıfı Oluştur'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
