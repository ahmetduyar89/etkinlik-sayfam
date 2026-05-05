import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Activity } from '../../types';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

export type ActivityFormValues = Omit<Activity, 'id' | 'created_at'>;

interface ActivityFormProps {
    editItem: Activity | null;
    isSubmitting: boolean;
    onSubmit: (values: ActivityFormValues) => void;
    onCancel: () => void;
}

const inputClasses =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-500';
const labelClasses =
    'block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2';
const STORAGE_SIZE_LIMIT = 800 * 1024;
const FULL_HTML_TEXTAREA_LIMIT = 200 * 1024;
const isFullHtmlDocumentText = (text: string) =>
    /<html[\s>]|<head[\s>]|<!DOCTYPE/i.test(text);

export function ActivityForm({
    editItem,
    isSubmitting,
    onSubmit,
    onCancel,
}: ActivityFormProps) {
    const htmlCodeRef = React.useRef<HTMLTextAreaElement>(null);
    const jsCodeRef = React.useRef<HTMLTextAreaElement>(null);
    const cssCodeRef = React.useRef<HTMLTextAreaElement>(null);
    const external_libsRef = React.useRef<HTMLTextAreaElement>(null);
    const uploadedFullHtmlRef = React.useRef<string | null>(null);
    const uploadedRawHtmlRef = React.useRef(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [storageLoadFailed, setStorageLoadFailed] = React.useState(false);
    const [uploadedFullHtmlLabel, setUploadedFullHtmlLabel] = React.useState<string | null>(null);

    // Eğer düzenleme modundaysak ve storage_url varsa veriyi çek
    React.useEffect(() => {
        setStorageLoadFailed(false);
        setUploadError(null);
        uploadedFullHtmlRef.current = null;
        uploadedRawHtmlRef.current = editItem?.content_mode === 'raw_html';
        setUploadedFullHtmlLabel(null);
        if (editItem?.storage_url) {
            setIsProcessing(true);
            fetch(editItem.storage_url)
                .then(res => res.json())
                .then(data => {
                    const htmlCode = String(data.html_code || '');
                    if (htmlCodeRef.current) {
                        if (isFullHtmlDocumentText(htmlCode) && htmlCode.length > FULL_HTML_TEXTAREA_LIMIT) {
                            uploadedFullHtmlRef.current = htmlCode;
                            setUploadedFullHtmlLabel('Kayıtlı tam HTML içerik');
                            htmlCodeRef.current.value = `Tam HTML içerik hazır (${Math.round(htmlCode.length / 1024)} KB). Metin alanına basılmadı; güncellerseniz yeni dosya yükleyin veya bu alana manuel HTML yazın.`;
                        } else {
                            htmlCodeRef.current.value = htmlCode;
                        }
                    }
                    if (jsCodeRef.current) jsCodeRef.current.value = data.js_code || '';
                    if (cssCodeRef.current) cssCodeRef.current.value = data.css_code || '';
                    if (external_libsRef.current) external_libsRef.current.value = data.external_libs || '';
                })
                .catch(err => {
                    console.error('Failed to load storage content:', err);
                    setStorageLoadFailed(true);
                    setUploadError('Kayıtlı büyük içerik yüklenemedi. Güncellemeden önce bağlantıyı kontrol edin.');
                })
                .finally(() => setIsProcessing(false));
        }
    }, [editItem]);

    const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Dosya boyutu çok büyük (Maksimum 10MB).');
            return;
        }

        setUploadError(null);
        uploadedFullHtmlRef.current = null;
        uploadedRawHtmlRef.current = false;
        setUploadedFullHtmlLabel(null);
        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (ev) => {
            setTimeout(() => {
                try {
                    const text = ev.target?.result as string;
                    if (!text) throw new Error('Dosya okunamadı.');

                    uploadedRawHtmlRef.current = true;
                    if (htmlCodeRef.current) {
                        if (text.length > FULL_HTML_TEXTAREA_LIMIT) {
                            uploadedFullHtmlRef.current = text;
                            setUploadedFullHtmlLabel(file.name);
                            htmlCodeRef.current.value = `HTML dosyası yüklendi: ${file.name} (${Math.round(text.length / 1024)} KB). Performans için metin alanına basılmadı; kaydedince dosya olduğu gibi kullanılacak.`;
                        } else {
                            uploadedFullHtmlRef.current = null;
                            setUploadedFullHtmlLabel(null);
                            htmlCodeRef.current.value = text;
                        }
                    }
                    if (jsCodeRef.current) jsCodeRef.current.value = '';
                    if (cssCodeRef.current) cssCodeRef.current.value = '';
                    if (external_libsRef.current) external_libsRef.current.value = '';

                } catch (err) {
                    console.error('Parse error:', err);
                    setUploadError(err instanceof Error ? err.message : 'Hata oluştu.');
                } finally {
                    setIsProcessing(false);
                }
            }, 100);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const html_code = uploadedFullHtmlRef.current ?? String(formData.get('html_code') || '');
        const js_code = String(formData.get('js_code') || '');
        const css_code = String(formData.get('css_code') || '');
        const external_libs = String(formData.get('external_libs') || '');
        const content_mode =
            uploadedRawHtmlRef.current || (isFullHtmlDocumentText(html_code) && !js_code && !css_code && !external_libs)
                ? 'raw_html'
                : 'composed';

        if (storageLoadFailed) {
            setUploadError('Kayıtlı içerik yüklenmeden güncelleme yapılamaz.');
            return;
        }

        const totalSize = html_code.length + js_code.length + css_code.length + external_libs.length;
        const shouldUseStorage = totalSize > STORAGE_SIZE_LIMIT;
        let storage_url: string | undefined;

        // Eğer içerik Firestore güvenli sınırını aşarsa Storage'a taşı
        if (shouldUseStorage) {
            try {
                setIsProcessing(true);
                const storagePath = `activities/${Date.now()}_code.json`;
                const storageRef = ref(storage, storagePath);
                const content = JSON.stringify({ html_code, js_code, css_code, external_libs, content_mode });
                await uploadString(storageRef, content, 'raw', { contentType: 'application/json' });
                storage_url = await getDownloadURL(storageRef);
            } catch (err) {
                console.error('Upload error:', err);
                setUploadError('Veri kaydedilemedi. Boyut çok büyük olabilir.');
                setIsProcessing(false);
                return;
            } finally {
                setIsProcessing(false);
            }
        }

        const payload: ActivityFormValues = {
            title: String(formData.get('title') || '').trim(),
            image_url: String(formData.get('image_url') || '').trim() || undefined,
            category: String(formData.get('category') || '').trim() || undefined,
            description: String(formData.get('description') || '').trim() || undefined,
            tags: String(formData.get('tags') || '').trim() || undefined,
            html_code: shouldUseStorage ? '' : html_code,
            js_code: shouldUseStorage ? '' : js_code,
            css_code: shouldUseStorage ? '' : css_code,
            external_libs: shouldUseStorage ? '' : external_libs,
            content_mode,
            storage_url: storage_url || '',
            is_test: formData.get('is_test') === 'on',
            has_timer: formData.get('has_timer') === 'on',
            duration_minutes: Number(formData.get('duration_minutes')) || undefined,
        };
        onSubmit(payload);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
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
                <input name="duration_minutes" type="number" defaultValue={editItem?.duration_minutes || 20} className={inputClasses} />
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border-2 border-dashed border-white/20 text-center space-y-2">
                <span className={labelClasses}>HTML Dosyası Yükle</span>
                <p className="text-xs text-slate-400">Maksimum 10MB .html dosyası yükleyebilirsiniz.</p>
                <label className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white text-[13px] font-bold rounded-xl cursor-pointer hover:bg-primary-container/80 transition-colors shadow-md",
                    isProcessing && "opacity-60 cursor-not-allowed pointer-events-none"
                )}>
                    {isProcessing ? "İşleniyor..." : "Dosya Seç"}
                    <input type="file" accept=".html,.htm" className="sr-only" onChange={handleHtmlFileUpload} disabled={isProcessing} />
                </label>
                {uploadedFullHtmlLabel && (
                    <p className="text-xs font-medium text-emerald-300">
                        {uploadedFullHtmlLabel} tam HTML olarak hızlı modda hazır.
                    </p>
                )}
                {uploadError && <p className="text-xs font-medium text-red-400">{uploadError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <textarea
                    id="activity-html"
                    ref={htmlCodeRef}
                    name="html_code"
                    rows={5}
                    defaultValue={editItem?.html_code || ''}
                    onChange={() => {
                        uploadedFullHtmlRef.current = null;
                        uploadedRawHtmlRef.current = false;
                        setUploadedFullHtmlLabel(null);
                    }}
                    className={cn(inputClasses, 'font-mono text-xs')}
                    placeholder="HTML Kodu"
                />
                <textarea id="activity-js" ref={jsCodeRef} name="js_code" rows={5} defaultValue={editItem?.js_code || ''} className={cn(inputClasses, 'font-mono text-xs')} placeholder="JS Kodu" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <textarea id="activity-css" ref={cssCodeRef} name="css_code" rows={3} defaultValue={editItem?.css_code || ''} className={cn(inputClasses, 'font-mono text-xs')} placeholder="CSS Kodu" />
                <textarea id="activity-libs" ref={external_libsRef} name="external_libs" rows={3} defaultValue={editItem?.external_libs || ''} className={cn(inputClasses, 'font-mono text-xs')} placeholder="Dış Kütüphaneler" />
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Vazgeç</button>
                <button type="submit" disabled={isSubmitting || isProcessing || storageLoadFailed} className="px-6 py-3 bg-primary-container text-white font-bold rounded-xl shadow-lg hover:bg-primary-container/80 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Kaydediliyor...' : editItem ? 'Güncelle' : 'Ekle'}
                </button>
            </div>
        </form>
    );
}
