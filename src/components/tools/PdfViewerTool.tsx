// src/components/tools/PdfViewerTool.tsx
// Profesyonel PDF Dokümanı Açma, Sayfa Sayfa İnceleme ve Soru Kırpma Aracı.
// Mozilla PDF.js ile yüksek çözünürlüklü tembel (lazy) render; IndexedDB yerel saklama ve tahtaya doğrudan damgalama.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Maximize2,
    Minimize2,
    Upload,
    FileText,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Crop,
    Camera,
    RotateCcw,
    Check,
    FolderOpen,
    Loader2,
    AlertCircle,
    Info,
    Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useToast } from '../common/ToastProvider';
import {
    savePdfToDB,
    loadPdfFromDB,
    getRecentPdfsFromDB,
    ensurePdfjsLoaded,
} from '../../lib/pdfStorage';

export interface PdfViewerToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

interface CropRect {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}

export function PdfViewerTool({ onClose, onInsertImage }: PdfViewerToolProps) {
    const dragControls = useDragControls();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const toast = useToast();

    const [isMaximized, setIsMaximized] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMsg, setLoadingMsg] = React.useState('PDF yükleniyor...');
    const [pdfDoc, setPdfDoc] = React.useState<any>(null);
    const [fileName, setFileName] = React.useState<string>('');
    const [pageNum, setPageNum] = React.useState<number>(1);
    const [totalPages, setTotalPages] = React.useState<number>(0);
    const [zoomScale, setZoomScale] = React.useState<number>(1.25);
    const [recentPdfs, setRecentPdfs] = React.useState<Array<{ id: string; name: string }>>([]);

    // ── Kırpma (Crop) Durumları ───────────────────────────────────────
    const [isCropMode, setIsCropMode] = React.useState(false);
    const [cropRect, setCropRect] = React.useState<CropRect | null>(null);
    const [isDraggingCrop, setIsDraggingCrop] = React.useState(false);

    // Son açılan PDF'leri listele
    React.useEffect(() => {
        getRecentPdfsFromDB().then((list) => setRecentPdfs(list));
    }, []);

    // ── PDF.js Kütüphanesini Yükleme ──────────────────────────────────
    const loadPdfJs = ensurePdfjsLoaded;

    // ── PDF Dosyasını İşleme ──────────────────────────────────────────
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Lütfen geçerli bir PDF dosyası seçin.');
            return;
        }

        setIsLoading(true);
        setLoadingMsg('PDF hazırlanıyor...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjs = await loadPdfJs();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const doc = await loadingTask.promise;

            setPdfDoc(doc);
            setFileName(file.name);
            setTotalPages(doc.numPages);
            setPageNum(1);
            setIsCropMode(false);
            setCropRect(null);

            // IndexedDB'ye kaydet
            const fileId = `${file.name}_${file.size}`;
            await savePdfToDB(fileId, file.name, arrayBuffer);
            getRecentPdfsFromDB().then((list) => setRecentPdfs(list));

            toast.success(`"${file.name}" yüklendi (${doc.numPages} sayfa).`);
        } catch (err: any) {
            console.error('PDF yükleme hatası:', err);
            toast.error('PDF dosyası açılırken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Kayıtlı PDF'i aç
    const handleOpenRecent = async (item: { id: string; name: string }) => {
        setIsLoading(true);
        setLoadingMsg('Kayıtlı doküman açılıyor...');
        try {
            const data = await loadPdfFromDB(item.id);
            if (!data) {
                toast.error('Dosya önbellekten okunamadı.');
                return;
            }
            const pdfjs = await loadPdfJs();
            const loadingTask = pdfjs.getDocument({ data });
            const doc = await loadingTask.promise;

            setPdfDoc(doc);
            setFileName(item.name);
            setTotalPages(doc.numPages);
            setPageNum(1);
            setIsCropMode(false);
            setCropRect(null);
            toast.success(`"${item.name}" açıldı.`);
        } catch (err) {
            console.error('Kayıtlı PDF açma hatası:', err);
            toast.error('Dosya açılırken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Sayfayı Canvas Üzerine Çizme (Tembel/On-Demand Render) ─────────
    React.useEffect(() => {
        if (!pdfDoc) return;
        let isCancelled = false;

        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (isCancelled) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const dpr = Math.min(2, window.devicePixelRatio || 1);
                // zoomScale ile ölçeklendirilmiş viewport
                const viewport = page.getViewport({ scale: zoomScale * dpr });

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = `${viewport.width / dpr}px`;
                canvas.style.height = `${viewport.height / dpr}px`;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const renderContext = {
                    canvasContext: ctx,
                    viewport,
                };

                await page.render(renderContext).promise;
            } catch (err) {
                console.error('Sayfa çizim hatası:', err);
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
        };
    }, [pdfDoc, pageNum, zoomScale]);

    // ── Kırpma Dikdörtgeni Etkileşimi ─────────────────────────────────
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isCropMode) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        setIsDraggingCrop(true);
        setCropRect({ startX, startY, currentX: startX, currentY: startY });
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isCropMode || !isDraggingCrop || !cropRect) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

        setCropRect((prev) => (prev ? { ...prev, currentX, currentY } : null));
    };

    const handlePointerUp = () => {
        setIsDraggingCrop(false);
    };

    // ── Soru Kırp ve Tahtaya Yapıştır ─────────────────────────────────
    const handleInsertCroppedQuestion = () => {
        if (!cropRect || !canvasRef.current || !onInsertImage) return;

        const canvas = canvasRef.current;
        const rectWidth = Math.abs(cropRect.currentX - cropRect.startX);
        const rectHeight = Math.abs(cropRect.currentY - cropRect.startY);

        if (rectWidth < 20 || rectHeight < 20) {
            toast.error('Lütfen soruyu kapsayan daha geniş bir alan seçin.');
            return;
        }

        const leftPx = Math.min(cropRect.startX, cropRect.currentX);
        const topPx = Math.min(cropRect.startY, cropRect.currentY);

        // Canvas fiziksel piksellerine göre ölçek oranı
        const displayWidth = parseFloat(canvas.style.width);
        const displayHeight = parseFloat(canvas.style.height);
        const scaleX = canvas.width / displayWidth;
        const scaleY = canvas.height / displayHeight;

        const sourceX = leftPx * scaleX;
        const sourceY = topPx * scaleY;
        const sourceW = rectWidth * scaleX;
        const sourceH = rectHeight * scaleY;

        // Geçici kırpma tuvali
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = sourceW;
        cropCanvas.height = sourceH;
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return;

        cropCtx.drawImage(canvas, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

        const dataUrl = cropCanvas.toDataURL('image/png');
        // Tahtaya orantılı genişlik ve yükseklikle yapıştır (azami 540px genişlik)
        const targetW = Math.min(540, Math.max(260, rectWidth));
        const targetH = Math.round((targetW / rectWidth) * rectHeight);

        onInsertImage(dataUrl, targetW, targetH);
        toast.success('Soru kırpıldı ve akıllı tahta sayfasına yapıştırıldı.');
        setCropRect(null);
    };

    // ── Tam Sayfayı Tahtaya Aktar ─────────────────────────────────────
    const handleInsertFullPage = () => {
        if (!canvasRef.current || !onInsertImage) return;
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');

        // Sayfa oranını koruyarak tahtaya ekle
        const aspect = canvas.width / canvas.height;
        const targetH = 600;
        const targetW = Math.round(targetH * aspect);

        onInsertImage(dataUrl, targetW, targetH);
        toast.success(`Sayfa ${pageNum} tahta sayfasına yapıştırıldı.`);
    };

    // Kırpma kutusu sınırları
    const cropBox = cropRect
        ? {
              left: Math.min(cropRect.startX, cropRect.currentX),
              top: Math.min(cropRect.startY, cropRect.currentY),
              width: Math.abs(cropRect.currentX - cropRect.startX),
              height: Math.abs(cropRect.currentY - cropRect.startY),
          }
        : null;

    return (
        <motion.div
            ref={containerRef}
            drag={!isMaximized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{
                opacity: 1,
                scale: 1,
                width: isMaximized ? '98vw' : '880px',
                height: isMaximized ? '95vh' : '620px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={cn(
                'fixed z-[5100] flex flex-col bg-[#13151f]/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden',
                isMaximized ? 'top-3 left-3' : 'top-10 left-1/2 -translate-x-1/2'
            )}
        >
            {/* Üst Başlık Çubuğu */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-sky-950/80 via-[#181d29] to-[#13151f] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-600/30 text-sky-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                {fileName ? fileName : 'PDF Dokümanı & Soru Kırpıcı'}
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                Akıllı Doküman
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            MEB soru kitapları ve föylerden soru kırpıp tahtada çözün
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all active:scale-95"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Yeni PDF Yükle</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Doküman Açıkken Alt Navigasyon & Araç Çubuğu */}
            {pdfDoc && (
                <div className="flex items-center justify-between px-4 py-2 bg-[#181a26] border-b border-white/10 text-xs text-slate-300 flex-wrap gap-2">
                    {/* Sayfa Gezintisi */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pageNum <= 1}
                            onClick={() => {
                                setPageNum((p) => Math.max(1, p - 1));
                                setCropRect(null);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white transition-all"
                            title="Önceki Sayfa"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
                            <input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={pageNum}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (val >= 1 && val <= totalPages) {
                                        setPageNum(val);
                                        setCropRect(null);
                                    }
                                }}
                                className="w-12 bg-transparent text-center font-bold text-white focus:outline-none"
                            />
                            <span className="text-slate-400 font-mono">/ {totalPages}</span>
                        </div>

                        <button
                            type="button"
                            disabled={pageNum >= totalPages}
                            onClick={() => {
                                setPageNum((p) => Math.min(totalPages, p + 1));
                                setCropRect(null);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white transition-all"
                            title="Sonraki Sayfa"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Yakınlaştırma (Zoom) */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.15))}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                            title="Uzaklaştır"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-sky-300 font-bold px-1 text-[11px]">
                            %{Math.round(zoomScale * 100)}
                        </span>
                        <button
                            type="button"
                            onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.15))}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                            title="Yakınlaştır"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setZoomScale(1.25)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-bold ml-1"
                        >
                            %100
                        </button>
                    </div>

                    {/* Aksiyonlar: Soru Kırp ve Tam Sayfa Aktar */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCropMode(!isCropMode);
                                setCropRect(null);
                            }}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all',
                                isCropMode
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-400'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-200'
                            )}
                        >
                            <Crop className="w-3.5 h-3.5" />
                            <span>{isCropMode ? 'Kırpma Açık (Seçim Yapın)' : '✂️ Soru Kırp'}</span>
                        </button>

                        {isCropMode && cropBox && cropBox.width > 20 && (
                            <button
                                type="button"
                                onClick={handleInsertCroppedQuestion}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-all animate-pulse"
                            >
                                <Check className="w-4 h-4" />
                                <span>Kırpılan Soruyu Tahtaya Yapıştır</span>
                            </button>
                        )}

                        {onInsertImage && !isCropMode && (
                            <button
                                type="button"
                                onClick={handleInsertFullPage}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg transition-all active:scale-95"
                                title="Bu Sayfayı Tahtaya Aktar"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Sayfayı Tahtaya Aktar</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Ana Gövde */}
            <div className="flex-1 relative flex items-center justify-center bg-[#0d0f1a] overflow-auto p-4 select-none">
                {isLoading && (
                    <div className="flex flex-col items-center gap-3 text-sky-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-bold">{loadingMsg}</span>
                    </div>
                )}

                {!isLoading && !pdfDoc && (
                    /* PDF Yükleme ve Başlangıç Karşılama Ekranı */
                    <div className="flex flex-col items-center justify-center max-w-[540px] text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl">
                        <div className="p-4 rounded-2xl bg-sky-500/20 text-sky-400 mb-4 ring-4 ring-sky-500/10">
                            <FileText className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            Ders Kitabı veya Soru Föyü Yükleyin
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            MEB ders kitaplarını, deneme sınavlarını veya soru bankalarını PDF olarak yükleyin.
                            İstediğiniz soruyu dikdörtgen seçimle anında kırpıp tahtaya yapıştırabilir ve altında çözebilirsiniz.
                        </p>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-sky-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Bilgisayardan PDF Seç</span>
                        </button>

                        {/* Son Açılan PDF'ler */}
                        {recentPdfs.length > 0 && (
                            <div className="w-full mt-8 pt-6 border-t border-white/10 text-left">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    Son Kullanılan Kitaplar
                                </span>
                                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                                    {recentPdfs.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleOpenRecent(item)}
                                            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs text-slate-200 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            <span className="text-[10px] text-sky-300 font-semibold shrink-0 ml-2">
                                                Aç
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PDF Sayfası ve Kırpma Katmanı */}
                {!isLoading && pdfDoc && (
                    <div
                        ref={overlayRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className={cn(
                            'relative shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-white transition-all',
                            isCropMode ? 'cursor-crosshair' : 'cursor-default'
                        )}
                    >
                        <canvas ref={canvasRef} className="block pointer-events-none" />

                        {/* Kırpma Seçim Kutusu */}
                        {isCropMode && cropBox && (
                            <div
                                className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none shadow-2xl transition-all"
                                style={{
                                    left: `${cropBox.left}px`,
                                    top: `${cropBox.top}px`,
                                    width: `${cropBox.width}px`,
                                    height: `${cropBox.height}px`,
                                }}
                            >
                                <span className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold whitespace-nowrap shadow">
                                    Soru Alanı ({Math.round(cropBox.width)} × {Math.round(cropBox.height)})
                                </span>
                            </div>
                        )}

                        {/* Kırpma Modu Kılavuz Rozeti */}
                        {isCropMode && !cropBox && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-2 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-2xl animate-bounce">
                                ✂️ Soruyu seçmek için farenizle/kaleminizle dikdörtgen çizin
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
