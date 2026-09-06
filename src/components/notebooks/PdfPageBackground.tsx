// src/components/notebooks/PdfPageBackground.tsx
// GoodNotes tarzı PDF sayfa arka plan katmanı.
// Aktif PDF sayfasını DrawingCanvas'ın altına yüksek çözünürlükte çizer;
// yakınlaştırma ve kaydırma (Viewport) ile birebir senkronize çalışır.

import React from 'react';
import { FileUp, Loader2, AlertCircle } from 'lucide-react';
import type { Viewport } from '../../types';
import { getPdfDocument, savePdfToDB } from '../../lib/pdfStorage';
import { useToast } from '../common/ToastProvider';

interface PdfPageBackgroundProps {
    pdfId: string;
    pdfName?: string;
    pageNumber: number; // 1-based index (1, 2, 3...)
    view: Viewport;
    canvasSize: { w: number; h: number };
    onPageDimensions?: (w: number, h: number, numPages: number) => void;
    onRebindSuccess?: () => void;
}

export function PdfPageBackground({
    pdfId,
    pdfName = 'PDF Belgesi',
    pageNumber,
    view,
    canvasSize,
    onPageDimensions,
    onRebindSuccess,
}: PdfPageBackgroundProps) {
    const toast = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [missingInDb, setMissingInDb] = React.useState(false);
    const [pageSize, setPageSize] = React.useState<{ w: number; h: number } | null>(null);
    const [rendering, setRendering] = React.useState(false);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const renderTaskRef = React.useRef<any>(null);
    const pdfDocRef = React.useRef<any>(null);
    const lastRenderedPageRef = React.useRef<number>(-1);

    // PDF Dokümanını yükle
    React.useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);
        setMissingInDb(false);

        (async () => {
            try {
                const doc = await getPdfDocument(pdfId);
                if (!isMounted) return;
                pdfDocRef.current = doc;
                setIsLoading(false);
            } catch (err: any) {
                if (!isMounted) return;
                setIsLoading(false);
                if (err?.message?.includes('PDF verisi bulunamadı')) {
                    setMissingInDb(true);
                } else {
                    setError('PDF dokümanı yüklenemedi: ' + (err?.message || 'Bilinmeyen hata'));
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [pdfId]);

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

                // Rahat bir genişlik için taban ölçek (hedef genişlik ~900px)
                const targetWorldW = Math.max(baseW, Math.min(1000, canvasSize.w > 200 ? canvasSize.w - 80 : 900));
                const fitScale = targetWorldW / baseW;
                const worldW = baseW * fitScale;
                const worldH = baseH * fitScale;

                setPageSize({ w: worldW, h: worldH });
                onPageDimensions?.(worldW, worldH, doc.numPages);

                const canvas = canvasRef.current;
                if (!canvas) {
                    setRendering(false);
                    return;
                }

                // Yüksek DPI keskinliği (özellikle yazılar için Retina netliği)
                const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
                const renderScale = fitScale * Math.max(1, Math.min(view.scale, 2)) * dpr;
                const viewport = page.getViewport({ scale: renderScale });

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
        [canvasSize.w, view.scale, onPageDimensions]
    );

    // Sayfa numarası veya doküman değiştiğinde çiz
    React.useEffect(() => {
        if (!isLoading && pdfDocRef.current) {
            void renderPage(pageNumber);
        }
    }, [isLoading, pageNumber, renderPage]);

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

    // Başka bir cihazda açıldığında dosyayı yeniden bağlama
    const handleRebindFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const buffer = await file.arrayBuffer();
            await savePdfToDB(pdfId, file.name, buffer);
            setMissingInDb(false);
            const doc = await getPdfDocument(pdfId, buffer);
            pdfDocRef.current = doc;
            void renderPage(pageNumber);
            toast.success('PDF bu cihaza bağlandı.');
            onRebindSuccess?.();
        } catch {
            toast.error('PDF dosyası okunamadı.');
        }
    };

    if (missingInDb) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/90 backdrop-blur-sm z-10 p-6 pointer-events-auto">
                <div className="max-w-md w-full bg-surface-container-high p-6 rounded-2xl border border-outline-variant shadow-2xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-on-surface">PDF Dosyası Eksik</h3>
                        <p className="text-xs text-on-surface-variant mt-1">
                            Bu defter <span className="font-semibold text-primary">{pdfName}</span> dokümanına bağlıdır. Güvenlik ve gizlilik gereği orijinal PDF yalnızca ilk yüklendiği cihazda tutulur.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2">
                            Bu cihazda da çalışmak için lütfen aynı PDF dosyasını seçin.
                        </p>
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-md transition-all">
                        <FileUp className="w-4 h-4" />
                        <span>PDF Dosyasını Seç & Bağla</span>
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

    // Sayfa konumu (Dünya koordinatlarında sabit x: 40, y: 24)
    const worldX = 40;
    const worldY = 24;

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
