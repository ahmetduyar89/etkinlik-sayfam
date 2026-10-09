// src/components/notebooks/PdfPageBackground.tsx
// GoodNotes tarzı PDF sayfa arka plan katmanı.
// Aktif PDF sayfasını DrawingCanvas'ın altına yüksek çözünürlükte çizer;
// yakınlaştırma ve kaydırma (Viewport) ile birebir senkronize çalışır.
// Çoklu cihaz (cross-device) bulut desteği ve yerel IndexedDB önbellekleme içerir.

import React from 'react';
import { FileUp, Loader2, AlertCircle, DownloadCloud, Cloud } from 'lucide-react';
import type { Viewport } from '../../types';
import { getPdfDocument, savePdfToDB, uploadPdfToCloud } from '../../lib/pdfStorage';
import { useToast } from '../common/ToastProvider';

interface PdfPageBackgroundProps {
    pdfId: string;
    pdfName?: string;
    pdfUrl?: string;
    rotation?: number; // 0, 90, 180, 270
    pageNumber: number; // 1-based index (1, 2, 3...)
    view: Viewport;
    canvasSize: { w: number; h: number };
    /**
     * Sayfanın dünya ölçüsü. Verilirse sayfa orijine oturur ve boyutu hiçbir
     * koşulda değişmez; verilmezse eski yerleşim kullanılır (eski defterler).
     */
    box?: { w: number; h: number } | null;
    onPageDimensions?: (w: number, h: number, numPages: number) => void;
    /** İşlenmiş sayfa tuvalini dışarı verir (PNG çıktısına PDF de girsin). */
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    onRebindSuccess?: () => void;
    onCloudUrlReady?: (url: string, path: string) => void;
    onDocLoaded?: (doc: any) => void;
    onMissingChange?: (missing: boolean) => void;
}

export function PdfPageBackground({
    pdfId,
    pdfName = 'PDF Belgesi',
    pdfUrl,
    rotation = 0,
    pageNumber,
    view,
    canvasSize,
    box,
    onPageDimensions,
    onCanvasReady,
    onRebindSuccess,
    onCloudUrlReady,
    onDocLoaded,
    onMissingChange,
}: PdfPageBackgroundProps) {
    const toast = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [missingInDb, setMissingInDb] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState<number | null>(null);
    const [pageSize, setPageSize] = React.useState<{ w: number; h: number } | null>(null);
    const [rendering, setRendering] = React.useState(false);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        onCanvasReady?.(canvasRef.current);
        return () => onCanvasReady?.(null);
    }, [onCanvasReady]);
    const renderTaskRef = React.useRef<any>(null);
    const pdfDocRef = React.useRef<any>(null);
    const lastRenderedPageRef = React.useRef<number>(-1);

    // PDF Dokümanını yükle (Yerel IndexedDB veya Bulut Bağlantısından)
    React.useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);
        setMissingInDb(false);
        setDownloadProgress(null);

        (async () => {
            try {
                const doc = await getPdfDocument(
                    pdfId,
                    undefined,
                    pdfUrl,
                    (ratio) => {
                        if (isMounted) {
                            setDownloadProgress(Math.round(ratio * 100));
                        }
                    }
                );
                if (!isMounted) return;
                pdfDocRef.current = doc;
                setIsLoading(false);
                setDownloadProgress(null);
                onDocLoaded?.(doc);
                onMissingChange?.(false);
            } catch (err: any) {
                if (!isMounted) return;
                setIsLoading(false);
                setDownloadProgress(null);
                if (err?.message?.includes('PDF verisi bulunamadı') || err?.message?.includes('buluttan indirilemedi')) {
                    setMissingInDb(true);
                    onMissingChange?.(true);
                } else {
                    setError('PDF dokümanı yüklenemedi: ' + (err?.message || 'Bilinmeyen hata'));
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [pdfId, pdfUrl, onDocLoaded, onMissingChange]);

    // Sayfayı render et
    const renderPage = React.useCallback(
        async (pageNum: number) => {
            const doc = pdfDocRef.current;
            if (!doc) return;
            if (pageNum < 1 || pageNum > doc.numPages) return;

            try {
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                    renderTaskRef.current = null;
                }

                setRendering(true);
                const page = await doc.getPage(pageNum);

                // Standart 1x ölçekteki sayfa boyutu
                const unscaledViewport = page.getViewport({ scale: 1 });
                const baseW = unscaledViewport.width;
                const baseH = unscaledViewport.height;

                const targetWorldW = box
                    ? box.w
                    : Math.max(
                          baseW,
                          Math.min(1000, canvasSize.w > 200 ? canvasSize.w - 80 : 900)
                      );
                const fitScale = targetWorldW / baseW;
                const worldW = box ? box.w : baseW * fitScale;
                const worldH = box ? box.h : baseH * fitScale;

                setPageSize({ w: worldW, h: worldH });
                onPageDimensions?.(worldW, worldH, doc.numPages);

                const canvas = canvasRef.current;
                if (!canvas) {
                    setRendering(false);
                    return;
                }

                // Yüksek DPI keskinliği (Retina netliği ve zoom keskinliği)
                const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
                const renderScale = fitScale * Math.max(1, Math.min(view.scale, 2.5)) * dpr;
                const targetRotation = ((page.rotate || 0) + (rotation || 0)) % 360;
                const viewport = page.getViewport({ scale: renderScale, rotation: targetRotation });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setRendering(false);
                    return;
                }

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport,
                };

                const task = page.render(renderContext);
                renderTaskRef.current = task;
                await task.promise;
                renderTaskRef.current = null;
                lastRenderedPageRef.current = pageNum;
                setRendering(false);
            } catch (err: any) {
                if (err?.name === 'RenderingCancelledException') {
                    return;
                }
                setRendering(false);
            }
        },
        [box, canvasSize.w, view.scale, rotation, onPageDimensions]
    );

    // Sayfa numarası, dönüş açısı veya doküman değiştiğinde çiz
    React.useEffect(() => {
        if (!isLoading && pdfDocRef.current) {
            void renderPage(pageNumber);
        }
    }, [isLoading, pageNumber, rotation, renderPage]);

    // Yakınlaştırma (zoom) bittiğinde daha yüksek çözünürlük için debounced yeniden çizim
    React.useEffect(() => {
        if (isLoading || !pdfDocRef.current) return;
        const timer = setTimeout(() => {
            if (lastRenderedPageRef.current === pageNumber) {
                void renderPage(pageNumber);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [view.scale, pageNumber, isLoading, renderPage]);

    // Başka bir cihazda açıldığında dosyayı yeniden bağlama ve bulut ile eşitleme
    const handleRebindFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsLoading(true);
            const buffer = await file.arrayBuffer();
            await savePdfToDB(pdfId, file.name, buffer);
            setMissingInDb(false);
            onMissingChange?.(false);
            const doc = await getPdfDocument(pdfId, buffer);
            pdfDocRef.current = doc;
            setIsLoading(false);
            void renderPage(pageNumber);
            toast.success('PDF bu cihaza bağlandı.');
            onRebindSuccess?.();
            onDocLoaded?.(doc);

            // Arka planda Firebase Storage'a yükleyerek diğer tüm cihazlar için de hazırla!
            uploadPdfToCloud(pdfId, file.name, buffer).then(({ url, path }) => {
                if (url) {
                    onCloudUrlReady?.(url, path);
                    toast.success('PDF bulut ile eşitlendi, diğer tüm cihazlarda açılmaya hazır.');
                }
            });
        } catch {
            setIsLoading(false);
            toast.error('PDF dosyası okunamadı.');
        }
    };

    // Buluttan indirme durumu göstergesi
    if (downloadProgress !== null) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/75 backdrop-blur-sm z-10 p-6 pointer-events-auto">
                <div className="max-w-sm w-full bg-[#1e2030] text-white p-6 rounded-2xl border border-white/10 shadow-2xl text-center space-y-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto animate-pulse">
                        <DownloadCloud className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">PDF Buluttan Eşitleniyor</h3>
                        <p className="text-xs text-slate-300 mt-1">
                            <span className="font-semibold text-sky-400">{pdfName}</span> dokümanı bu cihaza aktarılıyor…
                        </p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-sky-500 h-full transition-all duration-200 rounded-full"
                            style={{ width: `${Math.max(5, downloadProgress)}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><Cloud className="w-3 h-3 text-sky-400" /> Bulut Bağlantısı</span>
                        <span className="font-bold text-sky-400">%{downloadProgress}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (missingInDb) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/90 backdrop-blur-sm z-10 p-6 pointer-events-auto">
                <div className="max-w-md w-full bg-surface-container-high p-6 rounded-2xl border border-outline-variant shadow-2xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-on-surface">PDF Dosyasını Bağlayın</h3>
                        <p className="text-xs text-on-surface-variant mt-1">
                            Bu defter <span className="font-semibold text-primary">{pdfName}</span> dokümanına bağlıdır.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2">
                            PDF dosyasını bir kez seçtiğinizde dosya bulut ile eşitlenecek ve sonraki girişlerde tüm cihazlarınızda otomatik olarak açılacaktır.
                        </p>
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-md transition-all">
                        <FileUp className="w-4 h-4" />
                        <span>PDF Dosyasını Seç & Buluta Eşitle</span>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleRebindFile}
                        />
                    </label>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-error text-xs">
                {error}
            </div>
        );
    }

    // Sayfa konumu
    const worldX = box ? 0 : 40;
    const worldY = box ? 0 : 24;

    const screenX = worldX * view.scale + view.tx;
    const screenY = worldY * view.scale + view.ty;
    const screenW = (pageSize?.w || 900) * view.scale;
    const screenH = (pageSize?.h || 1200) * view.scale;

    return (
        <div
            className="absolute pointer-events-none select-none transition-opacity duration-150"
            style={{
                left: screenX,
                top: screenY,
                width: screenW,
                height: screenH,
            }}
        >
            {/* Sayfa Kağıt Efekti & Gölgesi (GoodNotes Defter Sayfası Görünümü) */}
            <div
                className="relative w-full h-full bg-white rounded-md shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden"
                style={{
                    boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.25), 0 4px 12px -2px rgba(0, 0, 0, 0.1)',
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block object-contain"
                    style={{
                        imageRendering: 'auto',
                    }}
                />

                {/* Yükleniyor Göstergesi */}
                {(isLoading || rendering) && (
                    <div className="absolute top-3 right-3 bg-slate-900/70 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow">
                        <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                        <span>Sayfa {pageNumber} işleniyor…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
