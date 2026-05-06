import React from 'react';
import { FileCode2, Upload } from 'lucide-react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { cn } from '../../utils/cn';
import type { Activity } from '../../types';

export type ActivityFormValues = Omit<Activity, 'id' | 'created_at'>;

interface ActivityFormProps {
    editItem: Activity | null;
    isSubmitting: boolean;
    onSubmit: (values: ActivityFormValues) => void;
    onCancel: () => void;
}

const inputClasses =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-500';
const labelClasses =
    'block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2';
const STORAGE_SIZE_LIMIT = 800 * 1024;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

function getInlineHtml(editItem: Activity | null) {
    if (!editItem?.html_code) return '';
    if (editItem.content_mode === 'raw_html') return editItem.html_code;
    return [
        editItem.html_code,
        editItem.css_code ? `<style>\n${editItem.css_code}\n</style>` : '',
        editItem.js_code ? `<script>\n${editItem.js_code}\n</script>` : '',
    ]
        .filter(Boolean)
        .join('\n\n');
}

export function ActivityForm({
    editItem,
    isSubmitting,
    onSubmit,
    onCancel,
}: ActivityFormProps) {
    const [html, setHtml] = React.useState(() => getInlineHtml(editItem));
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [storageLoadFailed, setStorageLoadFailed] = React.useState(false);

    React.useEffect(() => {
        let ignore = false;
        setUploadError(null);
        setStorageLoadFailed(false);
        setHtml(getInlineHtml(editItem));

        if (!editItem?.storage_url) return;

        setIsProcessing(true);
        fetch(editItem.storage_url, { cache: 'no-cache' })
            .then((res) => {
                if (!res.ok) throw new Error('Kayıtlı HTML dosyası okunamadı.');
                return res.json();
            })
            .then((data) => {
                if (!ignore) setHtml(String(data.html_code || ''));
            })
            .catch((err) => {
                console.error('Stored HTML load error:', err);
                if (!ignore) {
                    setStorageLoadFailed(true);
                    setUploadError('Kayıtlı HTML yüklenemedi. Güncellemeden önce bağlantıyı kontrol edin.');
                }
            })
            .finally(() => {
                if (!ignore) setIsProcessing(false);
            });

        return () => {
            ignore = true;
        };
    }, [editItem]);

    const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (file.size > FILE_SIZE_LIMIT) {
            setUploadError('Dosya boyutu çok büyük. Maksimum 10MB HTML yükleyebilirsiniz.');
            return;
        }

        setUploadError(null);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            setHtml(String(event.target?.result || ''));
            setIsProcessing(false);
        };
        reader.onerror = () => {
            setUploadError('HTML dosyası okunamadı.');
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (storageLoadFailed) {
            setUploadError('Kayıtlı HTML yüklenmeden güncelleme yapılamaz.');
            return;
        }

        const formData = new FormData(e.currentTarget);
        const title = String(formData.get('title') || '').trim();
        const html_code = html;

        if (!title || !html_code.trim()) {
            setUploadError('Başlık ve HTML içeriği zorunludur.');
            return;
        }

        const shouldUseStorage = html_code.length > STORAGE_SIZE_LIMIT;
        let storage_url = '';

        if (shouldUseStorage) {
            try {
                setIsProcessing(true);
                const storagePath = `activities/${Date.now()}_raw_html.json`;
                const storageRef = ref(storage, storagePath);
                await uploadString(
                    storageRef,
                    JSON.stringify({ html_code, content_mode: 'raw_html' }),
                    'raw',
                    { contentType: 'application/json' }
                );
                storage_url = await getDownloadURL(storageRef);
            } catch (err) {
                console.error('HTML upload error:', err);
                setUploadError('HTML kaydedilemedi. Dosya boyutu veya bağlantıyı kontrol edin.');
                setIsProcessing(false);
                return;
            } finally {
                setIsProcessing(false);
            }
        }

        onSubmit({
            title,
            image_url: String(formData.get('image_url') || '').trim() || undefined,
            category: String(formData.get('category') || '').trim() || undefined,
            description: String(formData.get('description') || '').trim() || undefined,
            tags: String(formData.get('tags') || '').trim() || undefined,
            html_code: shouldUseStorage ? '' : html_code,
            js_code: '',
            css_code: '',
            external_libs: '',
            content_mode: 'raw_html',
            storage_url,
            is_test: formData.get('is_test') === 'on',
            has_timer: formData.get('has_timer') === 'on',
            duration_minutes: Number(formData.get('duration_minutes')) || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="activity-title" className={labelClasses}>Etkinlik Başlığı</label>
                    <input id="activity-title" name="title" defaultValue={editItem?.title} required className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="activity-image" className={labelClasses}>Önizleme Görseli (URL)</label>
                    <input id="activity-image" name="image_url" type="url" defaultValue={editItem?.image_url} className={inputClasses} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="activity-category" className={labelClasses}>Kategori</label>
                    <input id="activity-category" name="category" defaultValue={editItem?.category} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="activity-description" className={labelClasses}>Açıklama</label>
                    <textarea id="activity-description" name="description" defaultValue={editItem?.description} rows={2} className={cn(inputClasses, 'resize-none')} />
                </div>
            </div>

            <div>
                <label htmlFor="activity-tags" className={labelClasses}>Etiketler (virgülle ayırın)</label>
                <input id="activity-tags" name="tags" defaultValue={editItem?.tags} className={inputClasses} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-5 px-5 py-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="is_test" defaultChecked={editItem?.is_test} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary-container relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase">Test Modu</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="has_timer" defaultChecked={editItem?.has_timer} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-primary-container relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase">Süre Sınırı</span>
                    </label>
                </div>
                <input name="duration_minutes" type="number" min={1} defaultValue={editItem?.duration_minutes || 20} className={inputClasses} />
            </div>

            <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <label htmlFor="activity-html" className={labelClasses}>HTML İçeriği</label>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <FileCode2 className="w-4 h-4" />
                            <span>Buraya yapıştırılan veya yüklenen HTML değiştirilmeden gösterilir.</span>
                        </div>
                    </div>
                    <label className={cn(
                        'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white text-[13px] font-bold rounded-lg cursor-pointer hover:bg-white/15 transition-colors border border-white/10',
                        isProcessing && 'opacity-60 cursor-not-allowed pointer-events-none'
                    )}>
                        <Upload className="w-4 h-4" />
                        {isProcessing ? 'Yükleniyor...' : 'HTML Dosyası Seç'}
                        <input type="file" accept=".html,.htm,text/html" className="sr-only" onChange={handleHtmlFileUpload} disabled={isProcessing} />
                    </label>
                </div>
                <textarea
                    id="activity-html"
                    name="html_code"
                    rows={16}
                    required
                    value={html}
                    onChange={(event) => {
                        setHtml(event.target.value);
                        if (uploadError) setUploadError(null);
                    }}
                    className={cn(inputClasses, 'font-mono text-xs leading-relaxed resize-y min-h-[360px]')}
                    placeholder="Tam HTML dosyanızı buraya yapıştırın."
                    spellCheck={false}
                />
                {uploadError && <p className="text-xs font-medium text-red-400">{uploadError}</p>}
            </section>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Vazgeç</button>
                <button type="submit" disabled={isSubmitting || isProcessing || storageLoadFailed} className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg shadow-lg hover:bg-primary-container/80 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Kaydediliyor...' : editItem ? 'Güncelle' : 'Ekle'}
                </button>
            </div>
        </form>
    );
}
