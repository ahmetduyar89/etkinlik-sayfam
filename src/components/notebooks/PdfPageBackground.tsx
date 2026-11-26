// src/components/notebooks/PdfPageBackground.tsx
// GoodNotes tarzı PDF sayfa arka plan katmanı.
// Aktif PDF sayfasını DrawingCanvas'ın altına yüksek çözünürlükte çizer;
// yakınlaştırma ve kaydırma (Viewport) ile birebir senkronize çalışır.
// Çoklu cihaz (cross-device) bulut desteği ve yerel IndexedDB önbellekleme içerir.

import React from 'react';
import { FileUp, Loader2, AlertCircle, DownloadCloud, Cloud } from 'lucide-react';
import type { Viewport } from '../../types';
import { getPdfDocument, savePdfToDB, uploadPdfToCloud, clearPdfDocCache } from '../../lib/pdfStorage';
import { useToast } from '../common/ToastProvider';

interface PdfPageBackgroundProps {
    pdfId: string;
    pdfName?: string;
    pdfUrl?: string;
    rotation?: number; // 0, 90, 180, 270
    /** 1-based PDF sayfa numarası (1, 2, 3...). `null` veya `<= 0` ise bu yaprakta PDF sayfası yoktur (boş çalışma sayfası). */
    pageNumber: number | null;
    view: Viewport;
    canvasSize: { w: number; h: number };
    /**
     * Sayfanın dünya ölçüsü. Verilirse sayfa orijine oturur ve boyutu hiçbir
     * koşulda değişmez; verilmezse eski yerleşim kullanılır (eski defterler).
     */
    box?: { w: number; h: number } | null;
    /** Alt alta sayfa görünümünde bu sayfanın dünya Y konumu (varsayılan: 0). */
    worldYOffset?: number;
    /** Sayfa numarası rozeti gösterilsin mi (alt alta çoklu sayfa görünümünde). */
    pageBadgeLabel?: string;
    onPageDimensions?: (w: number, h: number, numPages: number) => void;
    /** İşlenmiş sayfa tuvalini dışarı verir (PNG çıktısına PDF de girsin). */
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    onRebindSuccess?: () => void;
    onCloudUrlReady?: (url: string, path: string, size?: number) => Promise<void>;
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
    worldYOffset = 0,
    pageBadgeLabel,
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
    const onPageDimensionsRef = React.useRef(onPageDimensions);
    onPageDimensionsRef.current = onPageDimensions;
    const onCanvasReadyRef = React.useRef(onCanvasReady);
    onCanvasReadyRef.current = onCanvasReady;
    const onDocLoadedRef = React.useRef(onDocLoaded);
    onDocLoadedRef.current = onDocLoaded;
    const onMissingChangeRef = React.useRef(onMissingChange);
    onMissingChangeRef.current = onMissingChange;

    React.useEffect(() => {
        onCanvasReadyRef.current?.(canvasRef.current);
        return () => onCanvasReadyRef.current?.(null);
    }, []);
    const renderTaskRef = React.useRef<any>(null);
    const pdfDocRef = React.useRef<any>(null);
    const lastRenderedKeyRef = React.useRef<string>('');
    const viewScaleRef = React.useRef(view.scale);
    viewScaleRef.current = view.scale;
    const canvasWidthRef = React.useRef(canvasSize.w);
    canvasWidthRef.current = canvasSize.w;

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
                lastRenderedKeyRef.current = '';
                setIsLoading(false);
                setDownloadProgress(null);
                onDocLoadedRef.current?.(doc);
                onMissingChangeRef.current?.(false);
            } catch (err: any) {
                if (!isMounted) return;
                setIsLoading(false);
                setDownloadProgress(null);
                const msg = err?.message || '';
                if (
                    msg.includes('PDF verisi bulunamadı') ||
                    msg.includes('buluttan indirilemedi') ||
                    msg.includes('zero bytes') ||
                    msg.includes('is empty') ||
                    msg.includes('boş') ||
                    msg.includes('Invalid PDF') ||
                    msg.includes('FormatError')
                ) {
                    setMissingInDb(true);
                    onMissingChangeRef.current?.(true);
                } else {
                    setError('PDF dokümanı yüklenemedi: ' + msg);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [pdfId, pdfUrl]);

    const boxW = box?.w ?? null;
    const boxH = box?.h ?? null;

    // Sayfayı render et (Çift tamponlama / Double-buffering ile ekranda beyazlama olmadan)
    const renderPage = React.useCallback(
        async (pageNum: number, scaleForRender: number, isZoomRefresh = false) => {
            const doc = pdfDocRef.current;
            if (!doc) return;
            if (pageNum < 1 || pageNum > doc.numPages) return;

            // Zoom seviyesini 0.25'lik dilimlere yuvarla ki mikroskobik zoom
            // farklarında gereksiz yeniden çizim yapılmasın.
            const quantizedZoom = Math.round(Math.max(1, Math.min(scaleForRender, 2.5)) * 4) / 4;
            const renderKey = `${pdfId}:${pageNum}:${rotation}:${boxW ?? 'auto'}:${quantizedZoom}`;
            if (lastRenderedKeyRef.current === renderKey) {
                return;
            }

            try {
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                    renderTaskRef.current = null;
                }

                // Yalnızca yeni bir sayfaya geçildiğinde "Sayfa işleniyor" rozeti göster;
                // yakınlaştırma (zoom) netleştirmesinde kullanıcıyı rahatsız etme.
                if (!isZoomRefresh) {
                    setRendering(true);
                }
                const page = await doc.getPage(pageNum);

                // Standart 1x ölçekteki sayfa boyutu
                const unscaledViewport = page.getViewport({ scale: 1 });
                const baseW = unscaledViewport.width;
                const baseH = unscaledViewport.height;

                const cw = canvasWidthRef.current;
                const targetWorldW = boxW
                    ? boxW
                    : Math.max(
                          baseW,
                          Math.min(1000, cw > 200 ? cw - 80 : 900)
                      );
                const fitScale = targetWorldW / baseW;
                const worldW = boxW ? boxW : baseW * fitScale;
                const worldH = boxH ? boxH : baseH * fitScale;

                setPageSize((prev) =>
                    prev && prev.w === worldW && prev.h === worldH ? prev : { w: worldW, h: worldH }
                );
                onPageDimensionsRef.current?.(worldW, worldH, doc.numPages);

                const canvas = canvasRef.current;
                if (!canvas) {
                    setRendering(false);
                    return;
                }

                // Yüksek DPI keskinliği (Retina netliği ve zoom keskinliği)
                const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
                const renderScale = fitScale * quantizedZoom * dpr;
                const targetRotation = ((page.rotate || 0) + (rotation || 0)) % 360;
                const viewport = page.getViewport({ scale: renderScale, rotation: targetRotation });

                // Arka planda geçici (offscreen) tuvale çiz; bitince ana tuvale tek karede aktar.
                // Böylece ana tuvalin width/height değeri erken sıfırlanıp ekran beyazlamaz!
                const offscreen = document.createElement('canvas');
                offscreen.width = viewport.width;
                offscreen.height = viewport.height;
                const offCtx = offscreen.getContext('2d');
                if (!offCtx) {
                    setRendering(false);
                    return;
                }

                const task = page.render({
                    canvasContext: offCtx,
                    viewport,
                });
                renderTaskRef.current = task;
                await task.promise;
                renderTaskRef.current = null;

                // Çizim tamamlandı: şimdi görünür tuvale tek seferde kopyala
                const visibleCanvas = canvasRef.current;
                if (visibleCanvas) {
                    visibleCanvas.width = offscreen.width;
                    visibleCanvas.height = offscreen.height;
                    const visibleCtx = visibleCanvas.getContext('2d');
                    visibleCtx?.drawImage(offscreen, 0, 0);
                    onCanvasReadyRef.current?.(visibleCanvas);
                }

                lastRenderedKeyRef.current = renderKey;
                setRendering(false);
            } catch (err: any) {
                if (err?.name === 'RenderingCancelledException') {
                    return;
                }
                setRendering(false);
            }
        },
        [pdfId, boxW, boxH, rotation]
    );

    // Sayfa numarası, dönüş açısı veya doküman değiştiğinde çiz (Kaydırma/Pan sırasında TETİKLENMEZ)
    React.useEffect(() => {
        if (!pageNumber || pageNumber <= 0) {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
            lastRenderedKeyRef.current = '';
            onCanvasReadyRef.current?.(null);
            setRendering(false);
            return;
        }
        if (!isLoading && pdfDocRef.current) {
            void renderPage(pageNumber, viewScaleRef.current, false);
        }
    }, [isLoading, pageNumber, rotation, renderPage]);

    // YALNIZCA yakınlaştırma (view.scale) değişip durduğunda çözünürlüğü sessizce netleştir
    React.useEffect(() => {
        if (isLoading || !pdfDocRef.current || !pageNumber || pageNumber <= 0) return;
        const timer = setTimeout(() => {
            void renderPage(pageNumber, viewScaleRef.current, true);
        }, 320);
        return () => clearTimeout(timer);
    }, [view.scale, pageNumber, isLoading, renderPage]);

    // Başka bir cihazda açıldığında dosyayı yeniden bağlama ve bulut ile eşitleme
    const handleRebindFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsLoading(true);
            const buffer = await file.arrayBuffer();
            await savePdfToDB(pdfId, file.name, buffer.slice(0));
            setMissingInDb(false);
            onMissingChange?.(false);
            clearPdfDocCache(pdfId);
            const doc = await getPdfDocument(pdfId, buffer.slice(0));
            pdfDocRef.current = doc;
            lastRenderedKeyRef.current = '';
            setIsLoading(false);
            if (pageNumber && pageNumber > 0) {
                void renderPage(pageNumber, viewScaleRef.current, false);
            }
            onRebindSuccess?.();
            onDocLoadedRef.current?.(doc);

            if (onCloudUrlReady) {
                const { url, path, size } = await uploadPdfToCloud(pdfId, file.name, file);
                await onCloudUrlReady(url, path, size);
                toast.success('PDF bulut ile eşitlendi, diğer tüm cihazlarda açılmaya hazır.');
            } else {
                toast.success('PDF bu cihaza bağlandı.');
            }
        } catch (err: unknown) {
            setIsLoading(false);
            toast.error(err instanceof Error ? err.message : 'PDF dosyası okunamadı.');
        } finally {
            e.target.value = '';
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
                            {onCloudUrlReady
                                ? 'PDF bu bilgisayarda bulunamadı. Dosyayı seçerek buluta kaydedin veya ilk yüklediğiniz bilgisayarda defteri açıp eşitleyin.'
                                : 'PDF bu bilgisayarda bulunamadı. Dosyayı bu cihazda açmak için seçin. Kalıcı eşitleme için öğretmeniniz defteri kendi bilgisayarında açmalıdır.'}
                        </p>
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-md transition-all">
                        <FileUp className="w-4 h-4" />
                        <span>{onCloudUrlReady ? 'PDF Dosyasını Seç & Buluta Eşitle' : 'PDF Dosyasını Seç'}</span>
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

    // Bu defter sayfası araya eklenmiş boş bir çalışma yaprağı ise (PDF sayfası değilse),
    // alttaki kareli/çizgili kağıt deseninin görünmesi için PDF tuvalini gizle.
    if (!pageNumber || pageNumber <= 0 || (pdfDocRef.current && pageNumber > pdfDocRef.current.numPages)) {
        return null;
    }

    // Sayfa konumu
    const worldX = box ? 0 : 40;
    const worldY = (box ? 0 : 24) + worldYOffset;

    const screenX = worldX * view.scale + view.tx;
    const screenY = worldY * view.scale + view.ty;
    const screenW = (pageSize?.w || box?.w || 900) * view.scale;
    const screenH = (pageSize?.h || box?.h || 1200) * view.scale;

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

                {pageBadgeLabel && (
                    <div className="absolute bottom-2.5 right-3 bg-slate-900/60 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {pageBadgeLabel}
                    </div>
                )}

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
