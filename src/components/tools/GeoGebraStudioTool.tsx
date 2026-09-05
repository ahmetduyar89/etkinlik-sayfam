// src/components/tools/GeoGebraStudioTool.tsx
// Profesyonel GeoGebra Matematik & Geometri Laboratuvarı.
// Klasik, Geometri, Grafik Çizici, 3D ve CAS desteği; doğrudan sayfaya aktarım (PNG/SVG) ve yüzen PIP modu.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Move,
    Maximize2,
    Minimize2,
    Camera,
    Download,
    ExternalLink,
    RotateCcw,
    Sparkles,
    Pin,
    Eye,
    Sliders,
    Layers,
    Compass,
    TrendingUp,
    Box,
    Calculator,
    Share2,
    Check,
    Crosshair,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface GeoGebraStudioToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
    initialApp?: 'geometry' | 'graphing' | '3d' | 'classic' | 'cas';
    initialMaterialId?: string;
}

export type GeoGebraAppType = 'geometry' | 'graphing' | '3d' | 'classic' | 'cas';

interface AppOption {
    id: GeoGebraAppType;
    label: string;
    icon: React.ReactNode;
    desc: string;
    color: string;
}

const APP_OPTIONS: AppOption[] = [
    {
        id: 'geometry',
        label: 'Geometri',
        icon: <Compass className="w-4 h-4" />,
        desc: 'Nokta, doğru, çember, açıortay, teğet ve çokgenler',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'graphing',
        label: 'Grafik Çizici',
        icon: <TrendingUp className="w-4 h-4" />,
        desc: 'Fonksiyonlar, parabol, türev, integral ve dinamik sürgüler',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        id: '3d',
        label: '3D Hesaplayıcı',
        icon: <Box className="w-4 h-4" />,
        desc: 'Uzay geometri, katı cisimler, küre, silindir ve arakesitler',
        color: 'from-purple-500 to-indigo-700',
    },
    {
        id: 'classic',
        label: 'GeoGebra Klasik',
        icon: <Layers className="w-4 h-4" />,
        desc: 'Cebir + Geometri + E-Tablo + CAS tek ekranda',
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: 'cas',
        label: 'CAS Cebir',
        icon: <Calculator className="w-4 h-4" />,
        desc: 'Sembolik denklem çözümü, çarpanlar, limit ve matrisler',
        color: 'from-rose-500 to-pink-600',
    },
];

interface TemplateOption {
    title: string;
    app: GeoGebraAppType;
    badge: string;
    commands: string[];
    note: string;
}

const MAARIF_TEMPLATES: TemplateOption[] = [
    {
        title: 'Birim Çember & Trigonometrik Oranlar',
        app: 'graphing',
        badge: '10. Sınıf',
        commands: [
            'Circle((0,0), 1)',
            'a = Slider(0, 360, 1)',
            'rad = a * pi / 180',
            'P = (cos(rad), sin(rad))',
            'Segment((0,0), P)',
            'Segment((cos(rad),0), P)',
            'Text("sin(a) = " + sin(rad), (1.15, 0.5))',
            'Text("cos(a) = " + cos(rad), (1.15, 0.2))',
        ],
        note: 'Birim çember üzerindeki sin, cos ve tan izdüşümlerini canlı sürgüyle gösterir.',
    },
    {
        title: 'Üçgende Ağırlık Merkezi (G) & Kenarortaylar',
        app: 'geometry',
        badge: '10. Sınıf',
        commands: [
            'A = (1, 1)',
            'B = (7, 1)',
            'C = (3, 6)',
            'poly1 = Polygon(A, B, C)',
            'M_c = Midpoint(A, B)',
            'M_a = Midpoint(B, C)',
            'M_b = Midpoint(A, C)',
            'Segment(C, M_c)',
            'Segment(A, M_a)',
            'Segment(B, M_b)',
            'G = Centroid(poly1)',
        ],
        note: 'Kenarortayların kesiştiği ağırlık merkezinin 2k/1k oranını dinamik sürükleyerek kanıtlar.',
    },
    {
        title: 'İkinci Dereceden Fonksiyon & Tepe Noktası',
        app: 'graphing',
        badge: '10. Sınıf',
        commands: [
            'a = Slider(-3, 3, 0.5, 1, 1)',
            'b = Slider(-5, 5, 0.5, 1, -2)',
            'c = Slider(-5, 5, 0.5, 1, -1)',
            'f(x) = a * x^2 + b * x + c',
            'T = Extremum(f)',
            'kollari = If(a > 0, "Kollar Yukarı", "Kollar Aşağı")',
            'Text("f(x) = " + a + "x² + " + b + "x + " + c, (-4, 5))',
        ],
        note: 'a katsayısının kolların yönüne ve tepe noktasının ötelenmesine etkisini keşfedin.',
    },
    {
        title: '3D Küp, Düzlem ve Arakesit Geometrisi',
        app: '3d',
        badge: '10. Sınıf',
        commands: [
            'A = (0, 0, 0)',
            'B = (3, 0, 0)',
            'C = (3, 3, 0)',
            'D = (0, 3, 0)',
            'cube1 = Cube(A, B, (0, 0, 1))',
            'plane1 = Plane((0, 0, 1.5), (3, 0, 1.5), (0, 3, 3))',
            'Intersect(cube1, plane1)',
        ],
        note: 'Uzayda küpün düzlemle kesit alanını ve oluşan çokgenleri 360° döndürerek inceleyin.',
    },
];

declare global {
    interface Window {
        GGBApplet?: any;
        [key: string]: any;
    }
}

export function GeoGebraStudioTool({
    onClose,
    onInsertImage,
    initialApp = 'geometry',
    initialMaterialId,
}: GeoGebraStudioToolProps) {
    const dragControls = useDragControls();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const appletContainerId = React.useId().replace(/[:]/g, '_') + '_ggb';

    const [activeApp, setActiveApp] = React.useState<GeoGebraAppType>(initialApp);
    const [viewMode, setViewMode] = React.useState<'normal' | 'maximized' | 'docked'>('normal');
    const [isSemiTransparent, setIsSemiTransparent] = React.useState<boolean>(false);
    const [materialInput, setMaterialInput] = React.useState<string>(initialMaterialId || '');
    const [showTemplates, setShowTemplates] = React.useState<boolean>(false);
    const [isExporting, setIsExporting] = React.useState<boolean>(false);
    const [exportSuccess, setExportSuccess] = React.useState<boolean>(false);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const [resetPositionKey, setResetPositionKey] = React.useState<number>(0);

    // GeoGebra API referansı
    const ggbApiRef = React.useRef<any>(null);
    const appletInstanceRef = React.useRef<any>(null);

    // ── GeoGebra Scriptini Dinamik Yükle ──────────────────────────────
    const [scriptLoaded, setScriptLoaded] = React.useState<boolean>(() => !!window.GGBApplet);

    React.useEffect(() => {
        if (window.GGBApplet) {
            setScriptLoaded(true);
            return;
        }

        const scriptId = 'geogebra-deployggb-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://www.geogebra.org/apps/deployggb.js';
            script.async = true;
            script.onload = () => {
                setScriptLoaded(true);
            };
            script.onerror = () => {
                setLoadError('GeoGebra script yüklenemedi. İframe moduna geçiliyor.');
            };
            document.head.appendChild(script);
        } else {
            script.addEventListener('load', () => setScriptLoaded(true));
        }
    }, []);

    // ── GeoGebra Applet Başlatma ──────────────────────────────────────
    const initApplet = React.useCallback(
        (appType: GeoGebraAppType, materialId?: string) => {
            if (!window.GGBApplet) return;

            const el = document.getElementById(appletContainerId);
            if (!el) return;
            el.innerHTML = '';

            const params: Record<string, any> = {
                appName: appType,
                width: viewMode === 'docked' ? 460 : viewMode === 'maximized' ? window.innerWidth - 40 : 880,
                height: viewMode === 'docked' ? 340 : viewMode === 'maximized' ? window.innerHeight - 150 : 480,
                showToolBar: true,
                showAlgebraInput: true,
                showMenuBar: false,
                allowStyleBar: true,
                showResetIcon: true,
                enableLabelDrags: true,
                enableShiftDragZoom: true,
                enableRightClick: true,
                errorDialogsActive: false,
                useBrowserForJS: false,
                language: 'tr',
                appletOnLoad: (api: any) => {
                    ggbApiRef.current = api;
                    window[appletContainerId + '_api'] = api;
                },
            };

            if (materialId) {
                params.material_id = materialId;
            }

            try {
                const applet = new window.GGBApplet(params, '5.0');
                appletInstanceRef.current = applet;
                applet.inject(appletContainerId);
            } catch (err) {
                console.error('Failed to inject GeoGebra applet:', err);
            }
        },
        [appletContainerId, viewMode]
    );

    React.useEffect(() => {
        if (scriptLoaded) {
            const timer = setTimeout(() => {
                initApplet(activeApp, materialInput.trim() || undefined);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [scriptLoaded, activeApp, initApplet]);

    // ── Pencere Boyutu Değiştiğinde Applet Yeniden Boyutlandırma ──────
    React.useEffect(() => {
        if (ggbApiRef.current && typeof ggbApiRef.current.setSize === 'function') {
            const w = viewMode === 'docked' ? 460 : viewMode === 'maximized' ? window.innerWidth - 40 : 880;
            const h = viewMode === 'docked' ? 340 : viewMode === 'maximized' ? window.innerHeight - 150 : 480;
            try {
                ggbApiRef.current.setSize(w, h);
            } catch {
                // Ignore resize errors
            }
        }
    }, [viewMode]);

    // ── Sayfaya / Tahtaya Yapıştırma (Export PNG to Canvas) ────────────
    const handleInsertToCanvas = React.useCallback(() => {
        setIsExporting(true);

        const api = ggbApiRef.current;
        if (api && typeof api.exportPNG === 'function') {
            try {
                // 2x ölçek ve 300 DPI kristal netliğinde dışa aktar
                api.exportPNG(2, 300, (dataUrl: string) => {
                    setIsExporting(false);
                    if (dataUrl && onInsertImage) {
                        const w = viewMode === 'docked' ? 460 : 880;
                        const h = viewMode === 'docked' ? 340 : 540;
                        onInsertImage(dataUrl, w, h);
                        setExportSuccess(true);
                        setTimeout(() => setExportSuccess(false), 2400);
                    }
                });
                return;
            } catch (err) {
                console.warn('API exportPNG failed, trying canvas fallback', err);
            }
        }

        // Fallback: Dom Canvas screenshot
        const container = document.getElementById(appletContainerId);
        const internalCanvas = container?.querySelector('canvas');
        if (internalCanvas && onInsertImage) {
            try {
                const dataUrl = internalCanvas.toDataURL('image/png');
                onInsertImage(dataUrl, internalCanvas.width / 2, internalCanvas.height / 2);
                setExportSuccess(true);
                setTimeout(() => setExportSuccess(false), 2400);
            } catch (e) {
                console.error('Canvas capture failed:', e);
            }
        }
        setIsExporting(false);
    }, [appletContainerId, onInsertImage, viewMode]);

    // ── Görsel Olarak İndir (PNG) ────────────────────────────────────
    const handleDownloadPNG = React.useCallback(() => {
        const api = ggbApiRef.current;
        if (api && typeof api.exportPNG === 'function') {
            api.exportPNG(2, 300, (dataUrl: string) => {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `geogebra_${activeApp}_${Date.now()}.png`;
                a.click();
            });
        }
    }, [activeApp]);

    // ── Şablon Uygula ────────────────────────────────────────────────
    const handleApplyTemplate = (tmpl: TemplateOption) => {
        setActiveApp(tmpl.app);
        setShowTemplates(false);

        setTimeout(() => {
            const api = ggbApiRef.current;
            if (api && typeof api.evalCommand === 'function') {
                api.reset();
                tmpl.commands.forEach((cmd) => {
                    try {
                        api.evalCommand(cmd);
                    } catch (e) {
                        console.warn('Failed command:', cmd, e);
                    }
                });
            }
        }, 600);
    };

    // ── Harici Link / ID Açma ────────────────────────────────────────
    const handleLoadMaterial = (e: React.FormEvent) => {
        e.preventDefault();
        const raw = materialInput.trim();
        if (!raw) return;

        let matId = raw;
        const mMatch = raw.match(/\/m\/([a-zA-Z0-9]+)/);
        if (mMatch) {
            matId = mMatch[1];
        } else {
            const idMatch = raw.match(/id\/([a-zA-Z0-9]+)/);
            if (idMatch) matId = idMatch[1];
        }

        initApplet(activeApp, matId);
    };

    return (
        <motion.div
            key={`${viewMode}_${resetPositionKey}`}
            ref={containerRef}
            drag={viewMode !== 'maximized'}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
                opacity: isSemiTransparent ? 0.82 : 1,
                scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            className={cn(
                'fixed z-[5500] flex flex-col bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl transition-[width,height,opacity] duration-200',
                viewMode === 'maximized'
                    ? 'top-3 left-3 right-3 bottom-3 w-auto h-auto'
                    : viewMode === 'docked'
                    ? 'bottom-6 right-6 w-[min(92vw,480px)] h-[min(70vh,440px)] shadow-indigo-500/20'
                    : 'top-[65px] left-[max(12px,calc(50%-445px))] w-[min(95vw,890px)] h-[min(78vh,600px)]'
            )}
            style={{ touchAction: 'none' }}
        >
            {/* ── İframe Fare Kalkanı (Sürükleme anında iframenin fareyi yutmasını önler) ── */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-transparent cursor-grabbing select-none" />
            )}

            {/* ── Üst Başlık Barı (Draggable Header) ── */}
            <div
                onPointerDown={(e) => {
                    // Yalnızca buton olmayan boş alanlara tıklandığında taşımayı başlat
                    if (viewMode !== 'maximized' && (e.target as HTMLElement).tagName !== 'BUTTON' && !(e.target as HTMLElement).closest('button')) {
                        dragControls.start(e);
                    }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    {/* Belirgin Taşıma Tutamacı */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            if (viewMode !== 'maximized') dragControls.start(e);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 cursor-grab active:cursor-grabbing transition"
                        title="Pencereyi Taşımak İçin Sürükleyin"
                    >
                        <Move className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold hidden sm:inline">Taşı</span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm tracking-wide">
                                GeoGebra Matematik Laboratuvarı
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase">
                                Pro
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 hidden md:block">
                            Dinamik geometri, cebirsel grafikler ve 3D cisimleri oluşturup tahtaya aktarın
                        </p>
                    </div>
                </div>

                <div
                    className="flex items-center gap-1.5"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Konumu Sıfırla / Ortala */}
                    {viewMode === 'normal' && (
                        <button
                            type="button"
                            onClick={() => setResetPositionKey((k) => k + 1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
                            title="Pencereyi Merkeze Getir"
                        >
                            <Crosshair className="w-4 h-4" />
                        </button>
                    )}

                    {/* Sayfaya Ekle / Yapıştır Butonu (Primary Glow) */}
                    {onInsertImage && (
                        <button
                            type="button"
                            onClick={handleInsertToCanvas}
                            disabled={isExporting}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg transition-all duration-200',
                                exportSuccess
                                    ? 'bg-emerald-600 text-white shadow-emerald-600/50'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95'
                            )}
                            title="Bu çizimi tahta sayfasına nesne olarak yapıştır"
                        >
                            {exportSuccess ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-200" />
                                    <span>Sayfaya Eklendi!</span>
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    <span>Sayfaya Yapıştır</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Şablonlar Butonu */}
                    <button
                        type="button"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className={cn(
                            'p-2 rounded-xl border transition text-xs font-semibold flex items-center gap-1',
                            showTemplates
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        )}
                        title="Maarif Müfredat Şablonları"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="hidden md:inline">Şablonlar</span>
                    </button>

                    {/* PNG İndir */}
                    <button
                        type="button"
                        onClick={handleDownloadPNG}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                        title="Görsel Olarak İndir (PNG)"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    {/* Yüzen / Sabit PIP Modu */}
                    <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'docked' ? 'normal' : 'docked')}
                        className={cn(
                            'p-2 rounded-xl border transition',
                            viewMode === 'docked'
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        )}
                        title={viewMode === 'docked' ? 'Genişlet' : 'Sayfaya Sabitle / Yüzen Mini Mod'}
                    >
                        <Pin className="w-4 h-4" />
                    </button>

                    {/* Saydamlık Geçişi */}
                    {viewMode === 'docked' && (
                        <button
                            type="button"
                            onClick={() => setIsSemiTransparent(!isSemiTransparent)}
                            className={cn(
                                'p-2 rounded-xl border transition',
                                isSemiTransparent
                                    ? 'bg-amber-500 text-slate-900 border-amber-400'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            )}
                            title="Yarı Saydam / Opak Mod"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}

                    {/* Tam Ekran / Küçült */}
                    <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'maximized' ? 'normal' : 'maximized')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                        title={viewMode === 'maximized' ? 'Küçült' : 'Tam Ekran'}
                    >
                        {viewMode === 'maximized' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* Kapat */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition"
                        title="Laboratuvarı Kapat"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Alt Araç Seçim Barı (App Tabs & Quick Actions) ── */}
            <div
                className="px-3 py-2 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs"
                onPointerDown={(e) => e.stopPropagation()}
            >
                {/* 5 App Sekmesi */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {APP_OPTIONS.map((app) => (
                        <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                                setActiveApp(app.id);
                                initApplet(app.id);
                            }}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap',
                                activeApp === app.id
                                    ? `bg-gradient-to-r ${app.color} text-white shadow-md`
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            )}
                        >
                            {app.icon}
                            <span>{app.label}</span>
                        </button>
                    ))}
                </div>

                {/* Materyal / Link Yükleyici */}
                <form onSubmit={handleLoadMaterial} className="flex items-center gap-1.5">
                    <input
                        type="text"
                        placeholder="GeoGebra Linki veya ID (örn: m/abc123)"
                        value={materialInput}
                        onChange={(e) => setMaterialInput(e.target.value)}
                        className="w-40 sm:w-56 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-[11px] transition"
                        title="Etkinliği Yükle"
                    >
                        Aç
                    </button>
                    <button
                        type="button"
                        onClick={() => initApplet(activeApp)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                        title="Çalışma Alanını Sıfırla"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>

            {/* ── Şablonlar Çekmecesi (Maarif Hazır Konuları) ── */}
            {showTemplates && (
                <div
                    className="p-3 bg-slate-950/95 border-b border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {MAARIF_TEMPLATES.map((tmpl) => (
                        <div
                            key={tmpl.title}
                            onClick={() => handleApplyTemplate(tmpl)}
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-950/30 cursor-pointer transition flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                        {tmpl.badge}
                                    </span>
                                    <span className="text-[10px] text-slate-400 capitalize">{tmpl.app}</span>
                                </div>
                                <h4 className="font-bold text-white group-hover:text-indigo-300 transition text-[11px] line-clamp-1">
                                    {tmpl.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{tmpl.note}</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                                <span>Şablonu Yükle</span>
                                <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── GeoGebra Çalışma Alanı ── */}
            <div className="relative flex-1 bg-white overflow-hidden flex items-center justify-center">
                {/* GeoGebra Web Container */}
                <div
                    id={appletContainerId}
                    className="w-full h-full flex items-center justify-center relative z-10"
                />

                {/* Script yükleniyor ekranı */}
                {!scriptLoaded && !loadError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-slate-300">
                            GeoGebra Matematik Motoru Başlatılıyor…
                        </span>
                    </div>
                )}

                {/* İframe Fallback (Çevrimdışı / API Hatası Durumunda) */}
                {loadError && (
                    <iframe
                        src={`https://www.geogebra.org/${activeApp}?embed`}
                        title="GeoGebra Workspace"
                        className="w-full h-full border-0 absolute inset-0 z-10"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    />
                )}
            </div>

            {/* ── Alt Durum ve İpuçları (Also Draggable) ── */}
            <div
                onPointerDown={(e) => {
                    if (viewMode !== 'maximized' && (e.target as HTMLElement).tagName !== 'BUTTON' && !(e.target as HTMLElement).closest('button')) {
                        dragControls.start(e);
                    }
                }}
                className="px-3 py-1.5 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 select-none cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                        Aktif Mod:{' '}
                        <strong className="text-slate-200">
                            {APP_OPTIONS.find((a) => a.id === activeApp)?.label}
                        </strong>
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="hidden sm:inline text-slate-400">
                        {APP_OPTIONS.find((a) => a.id === activeApp)?.desc}
                    </span>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Alt Çubuk Taşıma Butonu */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            if (viewMode !== 'maximized') dragControls.start(e);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white cursor-grab active:cursor-grabbing transition"
                        title="Pencereyi Taşımak İçin Sürükleyin"
                    >
                        <Move className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Taşı</span>
                    </div>

                    <span className="hidden md:inline text-slate-400">
                        💡 <strong>İpucu:</strong> Çizimi tahtaya aktarmak için sağ üstteki{' '}
                        <strong className="text-indigo-300">"Sayfaya Yapıştır"</strong> butonuna basın.
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
