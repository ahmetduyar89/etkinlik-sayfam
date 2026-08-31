import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlarmClock,
    Blocks,
    Focus,
    Pencil,
    Ruler,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { FullscreenToggle } from '../common/FullscreenToggle';
import { getFormattedHtml } from '../../utils/format-html';
import { HTML2CANVAS_CDN } from '../../constants/drawing';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { TextBoxLayer } from '../tools/TextBoxLayer';
import { RulerTool } from '../tools/RulerTool';
import { ProtractorTool } from '../tools/ProtractorTool';
import { SpotlightOverlay } from '../tools/SpotlightOverlay';
import { OverlayTimer } from '../tools/OverlayTimer';
import { PageNav } from '../tools/PageNav';
import { usePrompt } from '../common/PromptDialog';
import { useToast } from '../common/ToastProvider';
import type {
    Activity,
    DrawConfig,
    DrawingCanvasHandle,
    TextBoxData,
} from '../../types';

interface ActivityPreviewModalProps {
    activity: Activity;
    onClose: () => void;
}

interface Html2Canvas {
    (
        el: HTMLElement,
        opts?: {
            useCORS?: boolean;
            allowTaint?: boolean;
            scale?: number;
            logging?: boolean;
            backgroundColor?: string | null;
            ignoreElements?: (element: Element) => boolean;
        }
    ): Promise<HTMLCanvasElement>;
}

function loadHtml2Canvas(): Promise<Html2Canvas> {
    const existing = (window as unknown as { html2canvas?: Html2Canvas }).html2canvas;
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = HTML2CANVAS_CDN;
        s.crossOrigin = 'anonymous';
        s.onload = () => {
            const h = (window as unknown as { html2canvas?: Html2Canvas }).html2canvas;
            if (h) resolve(h);
            else reject(new Error('html2canvas yüklenemedi'));
        };
        s.onerror = () => reject(new Error('html2canvas yüklenemedi'));
        document.head.appendChild(s);
    });
}

export function ActivityPreviewModal({
    activity,
    onClose,
}: ActivityPreviewModalProps) {
    const [isPreviewDrawingMode, setIsPreviewDrawingMode] = React.useState(false);
    const [previewDrawConfig, setPreviewDrawConfig] = React.useState<DrawConfig>({
        tool: 'pencil',
        color: '#4f46e5',
        width: 3,
        fillEnabled: false,
        stampIcon: '✅',
    });
    const [showWhiteboard, setShowWhiteboard] = React.useState(false);
    const [iframeHeight, setIframeHeight] = React.useState(1000);
    const [zoomLevel, setZoomLevel] = React.useState(1.0);
    const [spotlightActive, setSpotlightActive] = React.useState(false);
    const [spotlightPos, setSpotlightPos] = React.useState({ x: 0, y: 0 });
    const [spotlightRadius, setSpotlightRadius] = React.useState(180);
    const [timerTotal, setTimerTotal] = React.useState(300);
    const [timerSecs, setTimerSecs] = React.useState(300);
    const [timerRunning, setTimerRunning] = React.useState(false);
    const [showTimer, setShowTimer] = React.useState(false);
    const [textBoxes, setTextBoxes] = React.useState<TextBoxData[]>([]);
    const [isTextBoxMode, setIsTextBoxMode] = React.useState(false);
    const [bgColor, setBgColor] = React.useState('#ffffff');
    const [pageInfo, setPageInfo] = React.useState({ current: 0, total: 1 });
    const [showRuler, setShowRuler] = React.useState(false);
    const [showProtractor, setShowProtractor] = React.useState(false);

    const mainRef = React.useRef<HTMLElement>(null);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const stageRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<DrawingCanvasHandle>(null);
    const [drawHistory, setDrawHistory] = React.useState({ canUndo: false, canRedo: false });
    const prompt = usePrompt();
    const toast = useToast();

    const [formattedHtml, setFormattedHtml] = React.useState<string>('');
    const [isLoadingContent, setIsLoadingContent] = React.useState(true);
    const isRawHtml = activity.content_mode === 'raw_html';

    React.useEffect(() => {
        const loadContent = async () => {
            setIsLoadingContent(true);
            try {
                let data = {
                    html_code: activity.html_code,
                    js_code: activity.js_code,
                    css_code: activity.css_code,
                    external_libs: activity.external_libs,
                    content_mode: activity.content_mode
                };

                if (activity.storage_url) {
                    try {
                        const res = await fetch(activity.storage_url, { cache: 'no-cache' });
                        if (res.ok) {
                            const storageData = await res.json();
                            data = { ...data, ...storageData };
                        } else {
                            console.warn(`Storage URL returned non-ok: ${res.status}`);
                        }
                    } catch (err) {
                        console.warn('CORS or network error fetching storage_url, using Firestore content fallback:', err);
                    }
                }
                
                setFormattedHtml(getFormattedHtml(data));
            } catch (err) {
                console.error('Failed to load activity content:', err);
                toast.error('İçerik yüklenemedi.');
            } finally {
                setIsLoadingContent(false);
            }
        };
        loadContent();
    }, [activity, toast]);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data as { type?: string; height?: number; error?: string };
            if (data?.type === 'IFRAME_HEIGHT_SYNC' && (data.height ?? 0) > 0) {
                setIframeHeight(data.height as number);
            }
            if (data?.type === 'JS_ERROR') {
                const msg = data.error || '';
                if (msg && msg !== 'Script error.' && msg !== 'Script error') {
                    toast.error(`İçerik hatası: ${msg}`);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [toast]);

    React.useEffect(() => {
        if (!timerRunning || timerSecs <= 0) return;
        const id = window.setInterval(
            () => setTimerSecs((s) => (s > 0 ? s - 1 : 0)),
            1000
        );
        return () => window.clearInterval(id);
    }, [timerRunning, timerSecs]);

    React.useEffect(() => {
        if (!spotlightActive) return;
        const handleMouseMove = (e: MouseEvent) => {
            const rect = mainRef.current?.getBoundingClientRect();
            if (rect) {
                setSpotlightPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top + (mainRef.current?.scrollTop || 0),
                });
            }
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [spotlightActive]);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleScreenshot = async () => {
        const stage = stageRef.current;
        const iframe = iframeRef.current;
        if (!stage) return;
        try {
            const h2c = await loadHtml2Canvas();
            const scale = window.devicePixelRatio || 1;

            // 1) İçeriğin tamamını (iframe belgesi) ayrıca render ediyoruz; html2canvas
            //    iframe içeriğini doğrudan yakalayamadığından bu gerekli.
            let contentCanvas: HTMLCanvasElement | null = null;
            const doc = iframe?.contentDocument;
            if (doc?.documentElement) {
                contentCanvas = await h2c(doc.documentElement, {
                    useCORS: true,
                    allowTaint: true,
                    scale,
                    logging: false,
                    backgroundColor: showWhiteboard ? bgColor || '#ffffff' : '#ffffff',
                });
            }

            // 2) Üst katmanı (çizimler + metin kutuları) iframe'i yok sayarak render et.
            const overlayCanvas = await h2c(stage, {
                useCORS: true,
                allowTaint: true,
                scale,
                logging: false,
                backgroundColor: null,
                ignoreElements: (el: Element) => el.tagName === 'IFRAME',
            });

            // 3) İçerik + üst katmanı birleştir.
            const w = Math.max(contentCanvas?.width || 0, overlayCanvas.width);
            const h = Math.max(contentCanvas?.height || 0, overlayCanvas.height);
            if (w <= 0 || h <= 0) throw new Error('Boş içerik');

            const out = document.createElement('canvas');
            out.width = w;
            out.height = h;
            const ctx = out.getContext('2d');
            if (!ctx) throw new Error('Canvas bağlamı alınamadı');

            ctx.fillStyle = showWhiteboard ? bgColor || '#ffffff' : '#ffffff';
            ctx.fillRect(0, 0, w, h);
            if (contentCanvas) ctx.drawImage(contentCanvas, 0, 0);
            ctx.drawImage(overlayCanvas, 0, 0);

            const link = document.createElement('a');
            link.download = `${activity.title || 'etkinlik'}-ekran.png`;
            link.href = out.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Screenshot error:', err);
            canvasRef.current?.screenshot(showWhiteboard, bgColor);
            toast.info('Ekran görüntüsü için yedek yöntem kullanıldı.');
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-neutral-900/90"
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={activity.title}
                className="relative w-full h-full bg-white overflow-hidden flex flex-col"
            >
                <header className="h-14 px-4 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0 z-[11000] gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Blocks className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-white font-bold truncate text-sm">
                            {activity.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <div
                            role="group"
                            aria-label="Yakınlaştır"
                            className="flex items-center gap-1 bg-white/5 rounded-xl px-1 border border-white/10"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setZoomLevel((z) =>
                                        Math.max(0.5, Math.round((z - 0.25) * 100) / 100)
                                    )
                                }
                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                aria-label="Uzaklaştır"
                                title="Uzaklaştır"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span
                                aria-live="polite"
                                className="text-xs font-bold text-slate-300 tabular-nums w-10 text-center"
                            >
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setZoomLevel((z) =>
                                        Math.min(3.0, Math.round((z + 0.25) * 100) / 100)
                                    )
                                }
                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                aria-label="Yakınlaştır"
                                title="Yakınlaştır"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowRuler((r) => !r)}
                            aria-pressed={showRuler}
                            aria-label="Cetvel"
                            className={cn(
                                'p-2 rounded-xl transition-all border',
                                showRuler
                                    ? 'bg-amber-500 text-white border-amber-400'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                            )}
                            title="Cetvel"
                        >
                            <Ruler className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowProtractor((p) => !p)}
                            aria-pressed={showProtractor}
                            aria-label="Açıölçer"
                            className={cn(
                                'p-2 rounded-xl transition-all border',
                                showProtractor
                                    ? 'bg-sky-500 text-white border-sky-400'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                            )}
                            title="Açıölçer"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                aria-hidden="true"
                            >
                                <path d="M2 20 L12 4 L22 20 Z" />
                                <line x1="2" y1="20" x2="22" y2="20" />
                                <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="3 2" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSpotlightActive((s) => !s)}
                            aria-pressed={spotlightActive}
                            aria-label="Spotlight modu"
                            className={cn(
                                'p-2 rounded-xl transition-all border text-xs font-bold',
                                spotlightActive
                                    ? 'bg-yellow-500 text-white border-yellow-400 shadow-lg shadow-yellow-500/30'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                            )}
                            title="Spotlight Modu"
                        >
                            <Focus className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowTimer((s) => !s);
                                if (!showTimer) {
                                    setTimerSecs(timerTotal);
                                    setTimerRunning(false);
                                }
                            }}
                            aria-pressed={showTimer}
                            aria-label="Sayaç"
                            className={cn(
                                'p-2 rounded-xl transition-all border',
                                showTimer
                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                            )}
                            title="Sayaç"
                        >
                            <AlarmClock className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsPreviewDrawingMode((m) => !m)}
                            aria-pressed={isPreviewDrawingMode}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border',
                                isPreviewDrawingMode
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-indigo-500'
                                    : 'bg-white/5 text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-300 border-white/10'
                            )}
                        >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                            <span className="hidden sm:inline">
                                {isPreviewDrawingMode ? 'Kalemi Kapat' : 'Kalem Modu'}
                            </span>
                        </button>

                        <FullscreenToggle variant="dark" />

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Önizlemeyi kapat"
                            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main
                    ref={mainRef}
                    className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scroll"
                    style={{
                        backgroundColor: showWhiteboard ? bgColor || '#ffffff' : '#ffffff',
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'top center',
                            width: `${100 / zoomLevel}%`,
                            minHeight: `${100 / zoomLevel}%`,
                            position: 'relative',
                        }}
                    >
                        <div
                            ref={stageRef}
                            style={{
                                position: 'relative',
                                width: '100%',
                                minHeight: isRawHtml ? 'calc(100vh - 3.5rem)' : iframeHeight,
                                height: isRawHtml ? 'calc(100vh - 3.5rem)' : iframeHeight,
                            }}
                        >
                            {isLoadingContent ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">İçerik yükleniyor...</p>
                                </div>
                            ) : (
                                <iframe
                                    key={activity.id}
                                    ref={iframeRef}
                                    srcDoc={formattedHtml}
                                    title={activity.title}
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-pointer-lock"
                                    className={cn(
                                        'w-full h-full border-0',
                                        (isPreviewDrawingMode &&
                                            previewDrawConfig.tool !== 'pan') ||
                                            isTextBoxMode
                                            ? 'pointer-events-none'
                                            : 'pointer-events-auto'
                                    )}
                                    scrolling="auto"
                                />
                            )}
                            <DrawingCanvas
                                ref={canvasRef}
                                config={previewDrawConfig}
                                enabled={isPreviewDrawingMode}
                                whiteboardMode={showWhiteboard}
                                bgColor={bgColor}
                                onPageChange={(cur, tot) =>
                                    setPageInfo({ current: cur, total: tot })
                                }
                                onHistoryChange={(canUndo, canRedo) =>
                                    setDrawHistory({ canUndo, canRedo })
                                }
                                onRequestText={() =>
                                    prompt({
                                        title: 'Metin ekle',
                                        placeholder: 'Yazı girin',
                                        confirmLabel: 'Ekle',
                                    })
                                }
                            />
                            <TextBoxLayer
                                boxes={textBoxes}
                                enabled={isTextBoxMode}
                                onAdd={(b) => setTextBoxes((prev) => [...prev, b])}
                                onUpdate={(id, upd) =>
                                    setTextBoxes((prev) =>
                                        prev.map((b) => (b.id === id ? upd : b))
                                    )
                                }
                                onDelete={(id) =>
                                    setTextBoxes((prev) => prev.filter((b) => b.id !== id))
                                }
                            />
                        </div>
                    </div>

                    {spotlightActive && (
                        <SpotlightOverlay pos={spotlightPos} radius={spotlightRadius} />
                    )}

                    {spotlightActive && (
                        <div className="fixed bottom-6 right-6 z-[11500] flex items-center gap-2 bg-[#1a1b26]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-xl">
                            <Focus
                                className="w-4 h-4 text-yellow-400 shrink-0"
                                aria-hidden="true"
                            />
                            <label htmlFor="spotlight-radius" className="sr-only">
                                Spotlight yarıçapı
                            </label>
                            <input
                                id="spotlight-radius"
                                type="range"
                                min={80}
                                max={400}
                                value={spotlightRadius}
                                onChange={(e) => setSpotlightRadius(Number(e.target.value))}
                                className="w-28 accent-yellow-400"
                            />
                        </div>
                    )}

                    <AnimatePresence>
                        {isPreviewDrawingMode && (
                            <DrawingToolbar
                                onCommand={(type) => {
                                    if (type === 'UNDO_DRAWING') canvasRef.current?.undo();
                                    if (type === 'REDO_DRAWING') canvasRef.current?.redo();
                                    if (type === 'CLEAR_DRAWING') canvasRef.current?.clear();
                                    if (type === 'TOGGLE_WHITEBOARD')
                                        setShowWhiteboard((v) => !v);
                                }}
                                config={previewDrawConfig}
                                setConfig={setPreviewDrawConfig}
                                showWhiteboard={showWhiteboard}
                                setShowWhiteboard={setShowWhiteboard}
                                bgColor={bgColor}
                                onBgColorChange={setBgColor}
                                onScreenshot={handleScreenshot}
                                isTextBoxMode={isTextBoxMode}
                                onTextBoxModeToggle={() => setIsTextBoxMode((m) => !m)}
                                onInsertMath={(math) =>
                                    canvasRef.current?.insertMath(
                                        math,
                                        previewDrawConfig.color === '#ffffff'
                                            ? '#1a1b26'
                                            : previewDrawConfig.color
                                    )
                                }
                                canUndo={drawHistory.canUndo}
                                canRedo={drawHistory.canRedo}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isPreviewDrawingMode && (
                            <PageNav
                                current={pageInfo.current}
                                total={pageInfo.total}
                                onPrev={() => canvasRef.current?.prevPage()}
                                onNext={() => canvasRef.current?.nextPage()}
                                onAdd={() => canvasRef.current?.addPage()}
                                onDelete={() => canvasRef.current?.deletePage()}
                            />
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {showTimer && (
                <OverlayTimer
                    secs={timerSecs}
                    running={timerRunning}
                    total={timerTotal}
                    onToggle={() => setTimerRunning((r) => !r)}
                    onReset={() => {
                        setTimerSecs(timerTotal);
                        setTimerRunning(false);
                    }}
                    onSetTotal={(s) => {
                        setTimerTotal(s);
                        setTimerSecs(s);
                        setTimerRunning(false);
                    }}
                    onClose={() => {
                        setShowTimer(false);
                        setTimerRunning(false);
                    }}
                />
            )}

            {showRuler && <RulerTool onClose={() => setShowRuler(false)} />}
            {showProtractor && <ProtractorTool onClose={() => setShowProtractor(false)} />}
        </div>
    );
}
