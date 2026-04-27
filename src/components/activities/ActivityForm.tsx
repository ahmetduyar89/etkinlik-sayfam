import React from 'react';
import { Plus } from 'lucide-react';
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
    'w-full bg-white border-2 border-indigo-50 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400';
const labelClasses =
    'block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2';

export function ActivityForm({
    editItem,
    isSubmitting,
    onSubmit,
    onCancel,
}: ActivityFormProps) {
    const htmlCodeRef = React.useRef<HTMLTextAreaElement>(null);
    const jsCodeRef = React.useRef<HTMLTextAreaElement>(null);
    const cssCodeRef = React.useRef<HTMLTextAreaElement>(null);
    const externalLibsRef = React.useRef<HTMLTextAreaElement>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolü (1MB limit)
        if (file.size > 1.5 * 1024 * 1024) {
            setUploadError('Dosya boyutu çok büyük (Maksimum 1.5MB).');
            return;
        }

        setUploadError(null);
        const reader = new FileReader();

        reader.onload = (ev) => {
            try {
                const text = ev.target?.result as string;
                if (!text || text.trim().length === 0) {
                    throw new Error('Dosya içeriği boş.');
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                // Parser hatası kontrolü
                const parserError = doc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('HTML dosyası geçersiz veya bozuk.');
                }

                // Body içeriğini ayıkla (Script ve Style etiketleri hariç)
                const body = doc.body;
                if (!body) throw new Error('HTML gövdesi (body) bulunamadı.');

                const bodyClone = body.cloneNode(true) as HTMLElement;
                const scripts = bodyClone.querySelectorAll('script');
                const styles = bodyClone.querySelectorAll('style');
                scripts.forEach((s) => s.remove());
                styles.forEach((s) => s.remove());

                const bodyHtml = bodyClone.innerHTML.trim();

                // CSS İçeriği
                const cssContent = Array.from(doc.querySelectorAll('style'))
                    .map((s) => s.innerHTML)
                    .join('\n')
                    .trim();

                // JS İçeriği
                const jsContent = Array.from(doc.querySelectorAll('script:not([src])'))
                    .filter((s) => {
                        const t = (s as HTMLScriptElement).type;
                        return !t || t.includes('javascript');
                    })
                    .map((s) => s.innerHTML)
                    .join('\n')
                    .trim();

                // Dış kütüphaneler
                const extScripts = Array.from(doc.querySelectorAll('script[src]')).map(
                    (s) => (s as HTMLScriptElement).getAttribute('src') || ''
                );
                const extCss = Array.from(
                    doc.querySelectorAll('link[rel="stylesheet"]')
                ).map((l) => {
                    const href = (l as HTMLLinkElement).getAttribute('href') || '';
                    return href ? `css:${href}` : '';
                });

                const extLibs = [...extScripts, ...extCss].filter(Boolean).join('\n');

                // Form alanlarını güncelle
                if (htmlCodeRef.current) htmlCodeRef.current.value = bodyHtml;
                if (jsCodeRef.current) jsCodeRef.current.value = jsContent;
                if (cssCodeRef.current) cssCodeRef.current.value = cssContent;
                if (externalLibsRef.current) externalLibsRef.current.value = extLibs;

                // Başarı durumunda scroll'u aşağı kaydır ki dolan alanlar görünsün
                setTimeout(() => {
                    htmlCodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);

            } catch (err) {
                console.error('HTML parse error:', err);
                setUploadError(err instanceof Error ? err.message : 'HTML dosyası işlenemedi.');
            }
        };

        reader.onerror = () => setUploadError('Dosya okunurken bir hata oluştu.');
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = String(formData.get('title') || '').trim();
        if (!title) return;

        const durationRaw = formData.get('duration_minutes');
        const duration =
            durationRaw !== null && String(durationRaw).trim() !== ''
                ? Number(durationRaw)
                : undefined;

        const payload: ActivityFormValues = {
            title,
            image_url: String(formData.get('image_url') || '').trim() || undefined,
            category: String(formData.get('category') || '').trim() || undefined,
            description:
                String(formData.get('description') || '').trim() || undefined,
            tags: String(formData.get('tags') || '').trim() || undefined,
            html_code: String(formData.get('html_code') || ''),
            js_code: String(formData.get('js_code') || ''),
            css_code: String(formData.get('css_code') || ''),
            external_libs: String(formData.get('external_libs') || ''),
            is_test: formData.get('is_test') === 'on',
            has_timer: formData.get('has_timer') === 'on',
            duration_minutes: Number.isFinite(duration) ? duration : undefined,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="activity-title" className={labelClasses}>
                        Etkinlik Başlığı
                    </label>
                    <input
                        id="activity-title"
                        name="title"
                        defaultValue={editItem?.title}
                        required
                        minLength={2}
                        className={inputClasses}
                        placeholder="İlgi çekici bir başlık girin"
                    />
                </div>
                <div>
                    <label htmlFor="activity-image" className={labelClasses}>
                        Önizleme Görseli (URL)
                    </label>
                    <input
                        id="activity-image"
                        name="image_url"
                        type="url"
                        defaultValue={editItem?.image_url}
                        className={inputClasses}
                        placeholder="https://.../resim.jpg"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="activity-category" className={labelClasses}>
                        Kategori
                    </label>
                    <input
                        id="activity-category"
                        name="category"
                        defaultValue={editItem?.category}
                        className={inputClasses}
                        placeholder="Matematik, Fen, vb."
                    />
                </div>
                <div>
                    <label htmlFor="activity-description" className={labelClasses}>
                        Kısa Açıklama
                    </label>
                    <textarea
                        id="activity-description"
                        name="description"
                        defaultValue={editItem?.description}
                        rows={2}
                        className={cn(inputClasses, 'resize-none')}
                        placeholder="Etkinliğin amacını özetleyin"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="activity-tags" className={labelClasses}>
                    Etiketler (virgülle ayırın)
                </label>
                <input
                    id="activity-tags"
                    name="tags"
                    defaultValue={editItem?.tags}
                    className={inputClasses}
                    placeholder="Fen 7. Sınıf, Moleküller, Sınav"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                    Etiketler etkinlikleri hızlıca filtrelemek için kullanılır.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 py-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100">
                <div className="flex items-center gap-6 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                name="is_test"
                                defaultChecked={editItem?.is_test}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                            Test Modu
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                name="has_timer"
                                defaultChecked={editItem?.has_timer}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                            Süre Sınırı
                        </span>
                    </label>
                </div>

                <div>
                    <label htmlFor="activity-duration" className="sr-only">
                        Süre (Dakika)
                    </label>
                    <input
                        id="activity-duration"
                        name="duration_minutes"
                        type="number"
                        min={1}
                        max={240}
                        defaultValue={editItem?.duration_minutes || 20}
                        placeholder="Süre (Dakika)"
                        className={inputClasses}
                    />
                </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-200 text-center space-y-2">
                <span className={labelClasses + ' block'}>HTML Dosyası Yükle</span>
                <p className="text-[12px] text-slate-500">
                    Bir <strong>.html</strong> dosyası yükleyin — kod alanları otomatik
                    doldurulur.
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-bold rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
                    <Plus className="w-4 h-4" aria-hidden="true" /> Dosya Seç
                    <input
                        type="file"
                        accept=".html,.htm"
                        className="sr-only"
                        onChange={handleHtmlFileUpload}
                    />
                </label>
                {uploadError && (
                    <p role="alert" className="text-xs font-medium text-red-500">
                        {uploadError}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="activity-html" className={labelClasses}>
                        HTML Kodu
                    </label>
                    <textarea
                        id="activity-html"
                        ref={htmlCodeRef}
                        name="html_code"
                        defaultValue={editItem?.html_code}
                        rows={5}
                        className={cn(
                            inputClasses,
                            'font-mono text-[11px] text-neutral-600 resize-none'
                        )}
                        placeholder="<div id='uygulama'></div>"
                    />
                </div>
                <div>
                    <label htmlFor="activity-js" className={labelClasses}>
                        JavaScript Kodu
                    </label>
                    <textarea
                        id="activity-js"
                        ref={jsCodeRef}
                        name="js_code"
                        defaultValue={editItem?.js_code}
                        rows={5}
                        className={cn(
                            inputClasses,
                            'font-mono text-[11px] text-neutral-600 resize-none'
                        )}
                        placeholder="// console.log('Merhaba Dünya');"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="activity-css" className={labelClasses}>
                        CSS Kodu (Opsiyonel)
                    </label>
                    <textarea
                        id="activity-css"
                        ref={cssCodeRef}
                        name="css_code"
                        defaultValue={editItem?.css_code}
                        rows={3}
                        className={cn(
                            inputClasses,
                            'font-mono text-[11px] text-neutral-600 resize-none'
                        )}
                        placeholder="body { background: #f0f; }"
                    />
                </div>
                <div>
                    <label htmlFor="activity-libs" className={labelClasses}>
                        Dış Kütüphaneler (her satıra bir link)
                    </label>
                    <textarea
                        id="activity-libs"
                        ref={externalLibsRef}
                        name="external_libs"
                        defaultValue={editItem?.external_libs}
                        rows={3}
                        className={cn(
                            inputClasses,
                            'font-mono text-[11px] text-neutral-600 resize-none'
                        )}
                        placeholder="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    Vazgeç
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isSubmitting
                        ? 'Kaydediliyor…'
                        : editItem
                        ? 'Değişiklikleri Kaydet'
                        : 'Sisteme Ekle'}
                </button>
            </div>
        </form>
    );
}
