import React, { useState, useEffect } from 'react';
import {
    Sparkles, Search, ExternalLink, Copy, Share2, Trash2, Edit3, Grid, Filter, Plus,
    LayoutDashboard, Database, BarChart3,
    Target, Zap, Globe, Settings, Bell, User, ArrowRight, HelpCircle, Eye,
    MoreVertical, X, Save, Clock, BookOpen, Anchor, Command, Blocks, Pencil, Eraser,
    Hand, Highlighter, Type, Shapes, Undo, History, Sun, Square, Circle, Triangle, MousePointer2,
    MoveRight, ArrowRightLeft, Minus, PaintBucket, List, LayoutList, LayoutGrid, GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { db, useFirestore } from './lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getFormattedHtml = (act?: any) => {
    if (!act) return '';
    const { html_code, css_code, js_code, external_libs } = act;
    
    // Build external library scripts and link tags
    const libs = external_libs ? external_libs.split('\n').filter((l: string) => l.trim()).map((lib: string) => {
        if (lib.trim().endsWith('.css')) return `<link rel="stylesheet" href="${lib.trim()}">`;
        return `<script src="${lib.trim()}"></script>`;
    }).join('\n') : '';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    ${libs}
    <style>
        body, html {
            margin: 0; padding: 0; width: 100vw; min-height: 100vh;
            background-color: transparent;
        }
        ${css_code || ''}
        #drawing-canvas {
            touch-action: none !important;
            cursor: crosshair;
            z-index: 2147483647 !important;
        }
        body.whiteboard-active {
            background-color: white !important;
            background-image: linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px) !important;
            background-size: 30px 30px !important;
        }
        body.whiteboard-active > *:not(#drawing-canvas):not(script):not(style) {
            opacity: 0 !important;
            pointer-events: none !important;
        }
    </style>
    <script>
        window.sendAnswer = (data) => window.parent.postMessage({ type: 'SIM_ANSWER', data }, '*');

        (function() {
            // Student Portal Answer Sync & Readiness
            window.addEventListener('message', (e) => {
                if (e.data.type === 'CLEANUP' && window._cleanup) window._cleanup();
            });
            window.parent.postMessage({ type: 'DRAWING_READY' }, '*');
        })();
    </script>
    </script>
</head>
<body>
    ${html_code || ''}
    <script>
        try {
            ${js_code || ''}
        } catch (e) {
            console.error('Simülasyon Hatası:', e);
        }

        // Otomatik Yükseklik Senkronizasyonu
        (function() {
            const sendHeight = () => {
                const height = document.documentElement.scrollHeight;
                window.parent.postMessage({ type: 'IFRAME_HEIGHT_SYNC', height }, '*');
            };
            const observer = new ResizeObserver(() => sendHeight());
            observer.observe(document.body);
            window.addEventListener('load', sendHeight);
        })();
    </script>
</body>
</html>`;
};

// =======================
// COMPONENTS
// =======================
// =======================
// DRAWING TOOLBAR
// =======================

// Inline SVG ikonlar — yeni araçlar için ek import gerekmez
const SolidLineIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="4" y1="12" x2="20" y2="12"/>
    </svg>
);
const DashedLineIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="3" y1="12" x2="7" y2="12"/>
        <line x1="11" y1="12" x2="15" y2="12"/>
        <line x1="19" y1="12" x2="21" y2="12"/>
    </svg>
);

const DrawingToolbar = ({ onCommand, config, setConfig, showWhiteboard, setShowWhiteboard }: {
    onCommand: (type: string, data?: any) => void,
    config: any,
    setConfig: (c: any) => void,
    showWhiteboard?: boolean,
    setShowWhiteboard?: (val: boolean) => void
}) => {
    const [showShapes, setShowShapes] = React.useState(false);
    const dragControls = useDragControls();
    
    // Sarı ve İndigo eklendi
    const colors = ['#ffffff', '#ff4d4d', '#ffff00', '#ffa500', '#2ecc71', '#3498db', '#4f46e5', '#9b59b6', '#000000'];
    const mainTools = [
        { id: 'select',      icon: MousePointer2, label: 'Seç & Düzenle' },
        { id: 'pencil',      icon: Pencil,      label: 'Kalem' },
        { id: 'pan',         icon: Hand,        label: 'El' },
        { id: 'highlighter', icon: Highlighter, label: 'Fosforlu' },
        { id: 'sun',         icon: Sun,         label: 'Lazer' },
        { id: 'eraser',      icon: Eraser,      label: 'Silgi' },
        { id: 'text',        icon: Type,        label: 'Metin' },
    ];

    const shapeTools: { id: string; label: string; Icon?: React.ComponentType<{ className?: string }>; Svg?: React.ComponentType }[] = [
        { id: 'rect',        Icon: Square,        label: 'Dikdörtgen' },
        { id: 'circle',      Icon: Circle,        label: 'Daire' },
        { id: 'triangle',    Icon: Triangle,      label: 'Üçgen' },
        { id: 'line',        Svg: SolidLineIcon,  label: 'Çizgi' },
        { id: 'arrow',       Icon: MoveRight,     label: 'Ok' },
        { id: 'double_arrow',Icon: ArrowRightLeft,label: 'Çift Ok' },
        { id: 'dashed',      Svg: DashedLineIcon, label: 'Kesikli' },
    ];

    const stamps = [
        { emoji: '✅', label: 'Doğru' },
        { emoji: '❌', label: 'Yanlış' },
        { emoji: '⭐', label: 'Harika' },
        { emoji: '❤️', label: 'Sevdim' },
        { emoji: '❓', label: 'Soru' },
        { emoji: '❗', label: 'Dikkat' },
        { emoji: '💡', label: 'Fikir' },
        { emoji: '📌', label: 'Önemli' },
        { emoji: '🔥', label: 'Muhteşem' },
        { emoji: '👍', label: 'Tebrikler' },
    ];

    const isShapeTool = shapeTools.some(t => t.id === config.tool) || config.tool === 'stamp';

    return (
        <motion.div 
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ left: '50%', x: '-50%', y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-10 z-[5000] flex flex-col items-center gap-3 pointer-events-auto"
            style={{ 
                touchAction: 'none'
            }}
        >

            {/* Şekiller + Damgalar alt menüsü */}
            <AnimatePresence>
                {showShapes && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="flex flex-col gap-2 bg-[#1a1b26]/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        {/* Şekil araçları satırı */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-medium w-12 shrink-0">Şekil</span>
                            <div className="flex items-center gap-0.5">
                                {shapeTools.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => { setConfig({ ...config, tool: tool.id }); setShowShapes(false); }}
                                        className={cn(
                                            "p-2 rounded-xl transition-all",
                                            config.tool === tool.id
                                                ? "bg-[#2d3045] text-white"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                        title={tool.label}
                                    >
                                        {tool.Icon ? <tool.Icon className="w-5 h-5" /> : tool.Svg ? <tool.Svg /> : null}
                                    </button>
                                ))}
                                {/* Dolgu toggle */}
                                <button
                                    onClick={() => setConfig({ ...config, fillEnabled: !config.fillEnabled })}
                                    className={cn(
                                        "p-2 rounded-xl transition-all ml-1 border",
                                        config.fillEnabled
                                            ? "bg-indigo-600/40 text-indigo-300 border-indigo-500/50"
                                            : "text-slate-500 hover:text-white hover:bg-white/5 border-white/10"
                                    )}
                                    title="Şekli Doldur"
                                >
                                    <PaintBucket className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Damgalar satırı */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-medium w-12 shrink-0">Damga</span>
                            <div className="flex items-center gap-0.5 flex-wrap">
                                {stamps.map(stamp => (
                                    <button
                                        key={stamp.emoji}
                                        onClick={() => { setConfig({ ...config, tool: 'stamp', stampIcon: stamp.emoji }); setShowShapes(false); }}
                                        className={cn(
                                            "w-9 h-9 rounded-xl text-xl transition-all hover:bg-white/10 flex items-center justify-center",
                                            config.tool === 'stamp' && config.stampIcon === stamp.emoji
                                                ? "bg-[#2d3045] ring-2 ring-indigo-500"
                                                : ""
                                        )}
                                        title={stamp.label}
                                    >
                                        {stamp.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ana toolbar */}
            <div className="flex items-center gap-1 bg-[#1a1b26] p-1.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-300">
                <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    className="p-2.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing border-r border-white/10"
                    title="Taşı"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
                    {mainTools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => { setConfig({ ...config, tool: tool.id }); setShowShapes(false); }}
                            className={cn(
                                "p-2.5 rounded-xl transition-all duration-200 group relative",
                                config.tool === tool.id ? "bg-[#2d3045] text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                            title={tool.label}
                        >
                            <tool.icon className="w-5 h-5" />
                            {config.tool === tool.id && (
                                <motion.div layoutId="activeTool" className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl pointer-events-none" />
                            )}
                        </button>
                    ))}

                    {/* Şekil / Damga butonu */}
                    <button
                        onClick={() => setShowShapes(!showShapes)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all duration-200 relative",
                            isShapeTool ? "bg-[#2d3045] text-indigo-400" : "text-slate-400 hover:text-white hover:bg-white/5",
                            showShapes ? "bg-white/10 text-white" : ""
                        )}
                        title="Şekiller & Damgalar"
                    >
                        {config.tool === 'stamp' ? (
                            <span className="text-xl leading-none">{config.stampIcon || '✅'}</span>
                        ) : (
                            <Shapes className="w-5 h-5" />
                        )}
                        {isShapeTool && config.tool !== 'stamp' && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[#1a1b26]" />
                        )}
                    </button>
                </div>

                {/* Renkler */}
                <div className="flex items-center gap-2 px-4 border-r border-white/10">
                    {colors.map(color => (
                        <button
                            key={color}
                            onClick={() => setConfig({ ...config, color })}
                            className={cn(
                                "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                                config.color === color ? "border-white scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                {/* Kalınlık */}
                <div className="flex items-center gap-3 px-4 border-r border-white/10">
                    {[2, 5, 10].map(size => (
                        <button
                            key={size}
                            onClick={() => setConfig({ ...config, width: size })}
                            className={cn(
                                "rounded-full bg-slate-400 transition-all hover:bg-white",
                                config.width === size ? "bg-white scale-125 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1a1b26]" : "hover:scale-110"
                            )}
                            style={{ width: size + 4 + 'px', height: size + 4 + 'px' }}
                            title={`${size}px`}
                        />
                    ))}
                </div>

                {/* İşlemler */}
                <div className="flex items-center gap-1.5 px-2">
                    <button onClick={() => onCommand('UNDO_DRAWING')} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all" title="Geri Al">
                        <Undo className="w-5 h-5" />
                    </button>
                    <button onClick={() => onCommand('CLEAR_DRAWING')} className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Temizle">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    {setShowWhiteboard && (
                        <button
                            onClick={() => onCommand('TOGGLE_WHITEBOARD')}
                            className={cn(
                                "p-2.5 rounded-xl transition-all",
                                showWhiteboard ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                            title="Yazı Tahtası"
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const PortalCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div onClick={onClick} className={cn("portal-card overflow-hidden relative group", className)}>
        {children}
    </div>
);

const IconButton = ({ icon: Icon, onClick, className, title }: { icon: any, onClick?: (e: any) => void, className?: string, title?: string }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        title={title}
        className={cn("p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group", className)}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const Navbar = () => (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
        <div className="container mx-auto max-w-6xl flex justify-between items-center pointer-events-auto glass-effect rounded-2xl px-6 py-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Command className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-wider text-slate-800 uppercase">A. Duyar</h1>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">İnteraktif Merkez</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 mr-2">
                    <IconButton icon={Settings} />
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors">
                    <User className="w-4 h-4 text-neutral-500" />
                </div>
            </div>
        </div>
    </header>
);

// =======================
// MODAL COMPONENTS
// =======================
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-3xl p-8 shadow-2xl overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{title}</h3>
                        <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400 hover:text-neutral-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="max-h-[75vh] overflow-y-auto custom-scroll -mr-6 pr-6">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// =======================
// PREVIEW COMPONENTS
// =======================
const LivePreview = ({ act }: { act: any }) => (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-white overflow-hidden rounded-2xl">
        <iframe 
            srcDoc={getFormattedHtml(act)} 
            className="w-[1000px] h-[625px] border-0 origin-top-left scale-[0.28] sm:scale-[0.32] lg:scale-[0.35]"
            title={act?.title}
            loading="lazy"
        />
        <div className="absolute inset-0 bg-transparent" />
    </div>
);

// =======================
// ACTIVITY CARD COMPONENT
// =======================
const ActivityCard = ({ act, setPreviewId, setEditItem, setIsActivityOpen, activitiesHandler, showResultsId, setShowResultsId }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <PortalCard className="p-0 h-full flex flex-col justify-between border-2 border-indigo-50 hover:border-indigo-300 shadow-lg shadow-indigo-100/20 cursor-pointer" onClick={() => setPreviewId(act.id)}>
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[17px] font-bold tracking-tight leading-snug text-slate-800 line-clamp-2">{act.title}</h3>
                    <div className="flex gap-2 shrink-0">
                        {act.is_test && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-md uppercase tracking-widest border border-amber-200">TEST</span>
                        )}
                        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">{act.category || 'Genel'}</span>
                    </div>
                </div>

                <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed h-[40px] font-medium">{act.description || 'Açıklama girilmedi.'}</p>

                <div
                    className="aspect-[16/10] bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 relative group overflow-hidden flex items-center justify-center shadow-inner"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {act.image_url ? (
                        <div className="absolute inset-0 w-full h-full">
                            <img src={act.image_url} alt={act.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-500" />
                        </div>
                    ) : (act.html_code || act.js_code) ? (
                        <div className="absolute inset-0 w-full h-full transition-all duration-500 overflow-hidden">
                            {isHovered ? (
                                <LivePreview act={act} />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-indigo-50/30">
                                    <LayoutDashboard className="w-8 h-8 text-indigo-200" />
                                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Tıkla veya üzerine gel</span>
                                </div>
                            )}
                            <div className={cn(
                                "absolute inset-0 transition-opacity duration-300",
                                isHovered ? "bg-indigo-900/5" : "bg-transparent"
                            )} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LayoutDashboard className="w-10 h-10 text-indigo-200" />
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-indigo-900/10 backdrop-blur-[2px] z-10">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300/50">
                            <Eye className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t-2 border-slate-100 flex justify-between items-center z-20" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1">
                    <IconButton icon={Copy} onClick={() => {
                        navigator.clipboard.writeText(act.html_code);
                    }} title="HTML Kodunu Kopyala" />
                    <IconButton icon={Share2} onClick={() => {
                         const studentLink = `${window.location.origin}${window.location.pathname}?view=student&id=${act.id}`;
                         navigator.clipboard.writeText(studentLink);
                         alert('Öğrenci giriş linki kopyalandı!');
                    }} title="Öğrenci Linki Kopyala" />
                    <IconButton icon={Edit3} onClick={() => { setEditItem(act); setIsActivityOpen(true); }} title="Düzenle" />
                    {act.is_test && (
                        <IconButton icon={BarChart3} onClick={() => setShowResultsId(act.id)} className="text-emerald-500 bg-emerald-50 hover:bg-emerald-100" title="Sonuçları Gör" />
                    )}
                </div>
                <IconButton
                    icon={Trash2}
                    onClick={() => {
                        if (window.confirm('Bu interaktif etkinliği silmek istediğinizden emin misiniz?')) {
                            activitiesHandler.remove(act.id);
                        }
                    }}
                    className="hover:bg-red-50 hover:text-red-500 text-neutral-400"
                />
            </div>
        </PortalCard>
    );
};

const ActivityListItem = ({ act, setPreviewId, setEditItem, setIsActivityOpen, activitiesHandler, showResultsId, setShowResultsId }: any) => {
    return (
        <PortalCard className="p-4 flex flex-col sm:flex-row items-center gap-4 bg-white border-2 border-indigo-50 hover:border-indigo-300 shadow-md !rounded-2xl transition-all group">
            <div 
                className="w-full sm:w-24 h-24 shrink-0 bg-indigo-50/50 rounded-xl border-2 border-indigo-100 flex items-center justify-center cursor-pointer overflow-hidden relative"
                onClick={() => setPreviewId(act.id)}
            >
                {act.image_url ? (
                    <img src={act.image_url} alt={act.title} className="w-full h-full object-cover" />
                ) : (
                    <LayoutDashboard className="w-8 h-8 text-indigo-200" />
                )}
                <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 truncate">{act.title}</h3>
                    {act.is_test && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-md uppercase tracking-widest border border-amber-200">TEST</span>
                    )}
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-md uppercase tracking-wider">{act.category || 'Genel'}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1 font-medium">{act.description || 'Açıklama girilmedi.'}</p>
                <div className="flex items-center gap-4 pt-1">
                    <button 
                         onClick={() => {
                             const studentLink = `${window.location.origin}${window.location.pathname}?view=student&id=${act.id}`;
                             navigator.clipboard.writeText(studentLink);
                             alert('Öğrenci giriş linki kopyalandı!');
                         }}
                         className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 uppercase tracking-tight hover:text-indigo-800 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" /> Linki Kopyala
                    </button>
                    {act.is_test && (
                        <button 
                            onClick={() => setShowResultsId(act.id)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-tight hover:text-emerald-800 transition-colors"
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Sonuçlar
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-xl border border-slate-100">
                <IconButton icon={Copy} onClick={() => navigator.clipboard.writeText(act.html_code)} title="HTML Kodunu Kopyala" />
                <IconButton icon={Edit3} onClick={() => { setEditItem(act); setIsActivityOpen(true); }} title="Düzenle" />
                <IconButton
                    icon={Trash2}
                    onClick={() => {
                        if (window.confirm('Bu interaktif etkinliği silmek istediğinizden emin misiniz?')) {
                            activitiesHandler.remove(act.id);
                        }
                    }}
                    className="hover:bg-red-50 hover:text-red-500 text-neutral-400"
                />
            </div>
        </PortalCard>
    );
};

// =======================
// RESULTS MODAL COMPONENT
// =======================
const ResultsModal = ({ isOpen, onClose, activityId }: { isOpen: boolean, onClose: () => void, activityId: string }) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const submissionsHandler = useFirestore('submissions');

    useEffect(() => {
        if (isOpen) {
            const unsub = submissionsHandler.sync((data) => {
                setSubmissions(data.filter(s => s.activity_id === activityId));
            });
            return unsub;
        }
    }, [isOpen, activityId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Öğrenci Sonuçları">
            <div className="space-y-4">
                {submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-3 font-bold text-slate-600">Öğrenci Adı</th>
                                    <th className="px-4 py-3 font-bold text-slate-600">Başlangıç</th>
                                    <th className="px-4 py-3 font-bold text-slate-600">Teslim Tarihi</th>
                                    <th className="px-4 py-3 font-bold text-slate-600">Puan/Cevaplar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{sub.student_name}</td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px]">{new Date(sub.started_at).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px]">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('tr-TR') : 'Tamamlanmadı'}</td>
                                        <td className="px-4 py-3 font-bold text-indigo-600">
                                            <div className="space-y-1">
                                                {Object.keys(sub.answers || {}).length > 0 ? (
                                                    <div className="text-[10px] bg-indigo-50 p-2 rounded-lg font-medium text-indigo-700 max-w-[200px] break-words">
                                                        {JSON.stringify(sub.answers)}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-300 font-normal italic">Cevaplanmadı</span>
                                                )}
                                                {!sub.submitted_at && (
                                                   <div className="flex items-center gap-1.5 mt-1">
                                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                       <span className="text-[9px] text-emerald-600 uppercase font-black tracking-widest">CANLI</span>
                                                   </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Database className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">Henüz bir katılım bulunmuyor.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// =======================
// GLOBAL DRAWING CANVAS (Z-Kitap Layer)
// =======================
const DrawingCanvas = React.forwardRef<any, { config: any, enabled: boolean, whiteboardMode: boolean }>(({ config, enabled, whiteboardMode }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const bufferCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const laserCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const [strokes, setStrokes] = React.useState<any[]>([]);
    const [currentStroke, setCurrentStroke] = React.useState<any>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
    const [selBB, setSelBB] = React.useState<any>(null);
    const canvasRectRef = React.useRef<DOMRect | null>(null);
    const selectedIdxRef = React.useRef<number | null>(null);
    const dragStateRef = React.useRef<any>(null);

    // Refs for non-react state (performance)
    const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const bufferCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const laserCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const strokesRef = React.useRef<any[]>([]);
    const isDrawingRef = React.useRef(false);

    const getBB = (s: any) => {
        const xs = s.points.map((p: any) => p.x);
        const ys = s.points.map((p: any) => p.y);
        const pad = Math.max((s.width || 2) / 2 + 6, 14);
        return { x1: Math.min(...xs) - pad, y1: Math.min(...ys) - pad, x2: Math.max(...xs) + pad, y2: Math.max(...ys) + pad };
    };

    const hitTest = (s: any, x: number, y: number): boolean => {
        const bb = getBB(s);
        return x >= bb.x1 && x <= bb.x2 && y >= bb.y1 && y <= bb.y2;
    };

    const getHandlePositions = (bb: any) => {
        const { x1, y1, x2, y2 } = bb;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return [
            { id: 'nw', x: x1, y: y1 }, { id: 'n', x: mx, y: y1 }, { id: 'ne', x: x2, y: y1 },
            { id: 'w', x: x1, y: my },                               { id: 'e', x: x2, y: my },
            { id: 'sw', x: x1, y: y2 }, { id: 's', x: mx, y: y2 }, { id: 'se', x: x2, y: y2 },
        ];
    };

    const resizePoints = (origPoints: any[], origBB: any, handle: string, dx: number, dy: number) => {
        const { x1, y1, x2, y2 } = origBB;
        const w = x2 - x1 || 1, h = y2 - y1 || 1;
        const nb = { x1, y1, x2, y2 };
        if (handle.includes('e')) nb.x2 = x2 + dx;
        if (handle.includes('w')) nb.x1 = x1 + dx;
        if (handle.includes('s')) nb.y2 = y2 + dy;
        if (handle.includes('n')) nb.y1 = y1 + dy;
        const sx = (nb.x2 - nb.x1) / w, sy = (nb.y2 - nb.y1) / h;
        return origPoints.map((p: any) => ({ x: nb.x1 + (p.x - x1) * sx, y: nb.y1 + (p.y - y1) * sy }));
    };

    const deselect = () => {
        selectedIdxRef.current = null;
        setSelectedIdx(null);
        setSelBB(null);
    };

    React.useImperativeHandle(ref, () => ({
        undo: () => {
            deselect();
            strokesRef.current.pop();
            setStrokes([...strokesRef.current]);
            redraw();
        },
        clear: () => {
            strokesRef.current = [];
            setStrokes([]);
            deselect();
            redraw();
        },
        deleteSelected: () => {
            if (selectedIdxRef.current !== null) {
                strokesRef.current.splice(selectedIdxRef.current, 1);
                setStrokes([...strokesRef.current]);
                deselect();
                redraw();
            }
        },
        setSelectedColor: (color: string) => {
            if (selectedIdxRef.current !== null && strokesRef.current[selectedIdxRef.current]) {
                strokesRef.current[selectedIdxRef.current].color = color;
                setStrokes([...strokesRef.current]);
                const newBB = getBB(strokesRef.current[selectedIdxRef.current]);
                setSelBB(newBB);
                redraw();
            }
        },
        duplicateSelected: () => {
            if (selectedIdxRef.current !== null && strokesRef.current[selectedIdxRef.current]) {
                const copy = JSON.parse(JSON.stringify(strokesRef.current[selectedIdxRef.current]));
                copy.points = copy.points.map((p: any) => ({ x: p.x + 20, y: p.y + 20 }));
                strokesRef.current.push(copy);
                const newIdx = strokesRef.current.length - 1;
                selectedIdxRef.current = newIdx;
                setStrokes([...strokesRef.current]);
                setSelectedIdx(newIdx);
                setSelBB(getBB(copy));
                redraw();
            }
        },
    }));

    const resize = React.useCallback(() => {
        if (isDrawingRef.current) return; // Çizim sırasında canvas'ı yeniden başlatma
        const canvas = canvasRef.current;
        const buffer = bufferCanvasRef.current;
        const laser = laserCanvasRef.current;
        if (!canvas || !buffer) return;

        const dpr = window.devicePixelRatio || 1;
        // Dinamik yüksekliği değişen parent div yerine, sabit scroll konteynerini (grandparent) kullan
        const scrollContainer = canvas.parentElement?.parentElement;
        const w = scrollContainer ? scrollContainer.clientWidth : (canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth);
        const h = scrollContainer ? scrollContainer.clientHeight : (canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight);

        [canvas, buffer, laser].forEach(c => {
            if (!c) return;
            c.width = w * dpr;
            c.height = h * dpr;
            c.style.width = w + 'px';
            c.style.height = h + 'px';
        });

        ctxRef.current = canvas.getContext('2d');
        if (ctxRef.current) {
            ctxRef.current.setTransform(1,0,0,1,0,0);
            ctxRef.current.scale(dpr, dpr);
        }

        bufferCtxRef.current = buffer.getContext('2d');
        if (bufferCtxRef.current) {
            bufferCtxRef.current.setTransform(1,0,0,1,0,0);
            bufferCtxRef.current.scale(dpr, dpr);
        }

        if (laser) {
            laserCtxRef.current = laser.getContext('2d');
            if (laserCtxRef.current) {
                laserCtxRef.current.setTransform(1,0,0,1,0,0);
                laserCtxRef.current.scale(dpr, dpr);
            }
        }
        redraw();
    }, []);

    React.useEffect(() => {
        // Sabit scroll konteynerini (grandparent) izle; iframeHeight değiştiğinde yeniden boyutlandırma yapma
        const scrollContainer = canvasRef.current?.parentElement?.parentElement;
        const target = scrollContainer || canvasRef.current?.parentElement;
        if (target) {
            const obs = new ResizeObserver(() => resize());
            obs.observe(target);
            resize();
            return () => obs.disconnect();
        }
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    }, [resize]);

    // Kaydırma sırasında canvas'ı görünür alana senkronize et
    React.useEffect(() => {
        const scrollContainer = canvasRef.current?.parentElement?.parentElement;
        if (!scrollContainer) return;
        const handleScroll = () => {
            const top = scrollContainer.scrollTop;
            canvasRectRef.current = null; // Önbelleğe alınan rect'i geçersiz kıl
            if (canvasRef.current) canvasRef.current.style.top = `${top}px`;
            if (laserCanvasRef.current) laserCanvasRef.current.style.top = `${top}px`;
        };
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const drawStroke = (tCtx: CanvasRenderingContext2D, s: any) => {
        if (!s || s.points.length < 1) return;
        tCtx.save();
        tCtx.strokeStyle = s.color; tCtx.fillStyle = s.color; tCtx.lineWidth = s.width;
        tCtx.lineCap = 'round'; tCtx.lineJoin = 'round';
        if (s.tool === 'eraser') tCtx.globalCompositeOperation = 'destination-out';
        if (s.tool === 'highlighter') tCtx.globalAlpha = 0.4;
        if (s.tool === 'dashed') tCtx.setLineDash([12, 6]);

        if (['pencil', 'highlighter', 'eraser'].includes(s.tool)) {
            if (s.points.length < 2) {
                tCtx.beginPath(); tCtx.arc(s.points[0].x, s.points[0].y, s.width/2, 0, Math.PI*2); tCtx.fill();
            } else {
                tCtx.beginPath(); tCtx.moveTo(s.points[0].x, s.points[0].y);
                for (let i = 1; i < s.points.length - 1; i++) {
                    const mid = { x: (s.points[i].x + s.points[i+1].x)/2, y: (s.points[i].y + s.points[i+1].y)/2 };
                    tCtx.quadraticCurveTo(s.points[i].x, s.points[i].y, mid.x, mid.y);
                }
                const last = s.points[s.points.length - 1];
                tCtx.lineTo(last.x, last.y);
                tCtx.stroke();
            }
        } else if (s.tool === 'text') {
            tCtx.font = 'bold 20px Arial'; tCtx.fillText(s.text, s.points[0].x, s.points[0].y);
        } else if (s.tool === 'stamp') {
            tCtx.font = '44px serif'; tCtx.textAlign = 'center'; tCtx.textBaseline = 'middle';
            tCtx.fillText(s.stampIcon, s.points[0].x, s.points[0].y);
        } else {
            const p1 = s.points[0], p2 = s.points[s.points.length - 1];
            drawShape(tCtx, s.tool, p1.x, p1.y, p2.x, p2.y, s.fillEnabled);
        }
        tCtx.restore();
    };

    const drawShape = (tCtx: CanvasRenderingContext2D, tool: string, x1: number, y1: number, x2: number, y2: number, fill: boolean) => {
        tCtx.beginPath();
        if (tool === 'rect') tCtx.rect(x1, y1, x2 - x1, y2 - y1);
        else if (tool === 'circle') tCtx.arc(x1, y1, Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)), 0, Math.PI*2);
        else if (tool === 'triangle') { tCtx.moveTo((x1+x2)/2,y1); tCtx.lineTo(x2,y2); tCtx.lineTo(x1,y2); tCtx.closePath(); }
        else if (tool === 'line' || tool === 'dashed') { tCtx.moveTo(x1, y1); tCtx.lineTo(x2, y2); }
        else if (tool === 'arrow' || tool === 'double_arrow') {
            const h = 15, a = Math.atan2(y2-y1, x2-x1);
            tCtx.moveTo(x1, y1); tCtx.lineTo(x2, y2); tCtx.stroke();
            tCtx.beginPath(); tCtx.moveTo(x2, y2); 
            tCtx.lineTo(x2-h*Math.cos(a-Math.PI/6), y2-h*Math.sin(a-Math.PI/6));
            tCtx.moveTo(x2, y2); tCtx.lineTo(x2-h*Math.cos(a+Math.PI/6), y2-h*Math.sin(a+Math.PI/6));
            if (tool === 'double_arrow') {
                tCtx.moveTo(x1, y1); tCtx.lineTo(x1+h*Math.cos(a-Math.PI/6), y1+h*Math.sin(a-Math.PI/6));
                tCtx.moveTo(x1, y1); tCtx.lineTo(x1+h*Math.cos(a+Math.PI/6), y1+h*Math.sin(a+Math.PI/6));
            }
        }
        if (fill && !['line', 'dashed', 'arrow', 'double_arrow'].includes(tool)) { tCtx.save(); tCtx.globalAlpha = 0.2; tCtx.fill(); tCtx.restore(); }
        tCtx.stroke();
    };

    const redraw = () => {
        const bCtx = bufferCtxRef.current;
        const mainCtx = ctxRef.current;
        const canvas = bufferCanvasRef.current;
        const mainCanvas = canvasRef.current;
        if (!bCtx || !mainCtx || !canvas || !mainCanvas) return;

        bCtx.clearRect(0,0, 4000, 8000);
        strokesRef.current.forEach(s => drawStroke(bCtx, s));

        mainCtx.clearRect(0,0, 4000, 8000);
        mainCtx.drawImage(canvas, 0, 0, mainCanvas.width / (window.devicePixelRatio || 1), mainCanvas.height / (window.devicePixelRatio || 1));

        // Draw selection highlight
        if (selectedIdxRef.current !== null && strokesRef.current[selectedIdxRef.current]) {
            const bb = getBB(strokesRef.current[selectedIdxRef.current]);
            mainCtx.save();
            mainCtx.strokeStyle = '#4f46e5';
            mainCtx.lineWidth = 1.5;
            mainCtx.setLineDash([5, 3]);
            mainCtx.strokeRect(bb.x1, bb.y1, bb.x2 - bb.x1, bb.y2 - bb.y1);
            mainCtx.restore();
        }
    };

    const startDrawing = (e: React.PointerEvent) => {
        if (!enabled || ['pan', 'sun'].includes(config.tool)) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        canvasRectRef.current = rect;
        const x = e.clientX - rect.left, y = e.clientY - rect.top;

        if (config.tool === 'select') {
            // Check resize handles first
            if (selectedIdxRef.current !== null && selBB) {
                for (const h of getHandlePositions(selBB)) {
                    if (Math.hypot(x - h.x, y - h.y) < 10) {
                        const s = strokesRef.current[selectedIdxRef.current];
                        dragStateRef.current = { type: 'resize', handle: h.id, startX: x, startY: y, origPoints: JSON.parse(JSON.stringify(s.points)), origBB: { ...selBB } };
                        return;
                    }
                }
                // Check if inside bbox → move
                if (x >= selBB.x1 && x <= selBB.x2 && y >= selBB.y1 && y <= selBB.y2) {
                    const s = strokesRef.current[selectedIdxRef.current];
                    dragStateRef.current = { type: 'move', startX: x, startY: y, origPoints: JSON.parse(JSON.stringify(s.points)) };
                    return;
                }
            }
            // Hit test strokes (topmost first)
            for (let i = strokesRef.current.length - 1; i >= 0; i--) {
                if (hitTest(strokesRef.current[i], x, y)) {
                    selectedIdxRef.current = i;
                    setSelectedIdx(i);
                    setSelBB(getBB(strokesRef.current[i]));
                    redraw();
                    return;
                }
            }
            deselect();
            redraw();
            return;
        }

        // Deselect when switching to another tool action
        if (selectedIdxRef.current !== null) { deselect(); redraw(); }

        if (config.tool === 'text') {
            const val = prompt('Metin girin:');
            if (val) {
                const s = { tool: 'text', text: val, color: config.color, points: [{x, y}] };
                strokesRef.current.push(s);
                setStrokes([...strokesRef.current]);
                redraw();
            }
            return;
        }
        if (config.tool === 'stamp') {
            const s = { tool: 'stamp', stampIcon: config.stampIcon, color: '#000', points: [{x, y}] };
            strokesRef.current.push(s);
            setStrokes([...strokesRef.current]);
            redraw();
            return;
        }
        isDrawingRef.current = true;
        setIsDrawing(true);
        const newStroke = {
            tool: config.tool, color: config.color,
            width: config.tool === 'highlighter' ? config.width * 5 : config.tool === 'eraser' ? config.width * 10 : config.width,
            fillEnabled: config.fillEnabled, points: [{x, y}]
        };
        setCurrentStroke(newStroke);
    };

    const draw = (e: React.PointerEvent) => {
        const rect = canvasRectRef.current || canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left, y = e.clientY - rect.top;

        if (config.tool === 'select' && dragStateRef.current && selectedIdxRef.current !== null) {
            const drag = dragStateRef.current;
            const dx = x - drag.startX, dy = y - drag.startY;
            const s = strokesRef.current[selectedIdxRef.current];
            if (drag.type === 'move') {
                s.points = drag.origPoints.map((p: any) => ({ x: p.x + dx, y: p.y + dy }));
            } else if (drag.type === 'resize') {
                s.points = resizePoints(drag.origPoints, drag.origBB, drag.handle, dx, dy);
            }
            const newBB = getBB(s);
            setSelBB(newBB);
            redraw();
            return;
        }

        if (config.tool === 'sun') {
            const lCtx = laserCtxRef.current;
            if (lCtx) {
                lCtx.clearRect(0,0, rect.width, rect.height);
                const cx = x, cy = y, r = 12;
                const g = lCtx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
                g.addColorStop(0, 'rgba(255,50,50,1)'); g.addColorStop(0.3, 'rgba(255,80,80,0.4)'); g.addColorStop(1, 'rgba(255,0,0,0)');
                lCtx.fillStyle = g; lCtx.beginPath(); lCtx.arc(cx, cy, r * 3, 0, Math.PI * 2); lCtx.fill();
                lCtx.fillStyle = '#fff'; lCtx.beginPath(); lCtx.arc(cx, cy, 2, 0, Math.PI * 2); lCtx.fill();
            }
            return;
        }
        if (!isDrawing || !currentStroke) return;
        const last = currentStroke.points[currentStroke.points.length - 1];
        if (Math.hypot(x - last.x, y - last.y) < 0.5) return;
        currentStroke.points.push({x, y});
        const mainCtx = ctxRef.current;
        if (mainCtx && bufferCanvasRef.current) {
            mainCtx.clearRect(0,0, rect.width, rect.height);
            mainCtx.drawImage(bufferCanvasRef.current, 0, 0, rect.width, rect.height);
            drawStroke(mainCtx, currentStroke);
        }
    };

    const stopDrawing = () => {
        if (config.tool === 'select') {
            if (dragStateRef.current) {
                dragStateRef.current = null;
                setStrokes([...strokesRef.current]);
            }
            return;
        }
        if (isDrawing && currentStroke) {
            strokesRef.current.push(currentStroke);
            setStrokes([...strokesRef.current]);
            if (bufferCtxRef.current) drawStroke(bufferCtxRef.current, currentStroke);
        }
        isDrawingRef.current = false;
        setIsDrawing(false); setCurrentStroke(null);
        if (laserCtxRef.current) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) laserCtxRef.current.clearRect(0,0, rect.width, rect.height);
        }
    };

    const handleCursorStyle = () => {
        if (!enabled) return 'default';
        if (config.tool === 'pan') return 'grab';
        if (config.tool === 'select') return 'default';
        return 'crosshair';
    };

    const selectionColors = ['#ffffff', '#ff4d4d', '#ffff00', '#ffa500', '#2ecc71', '#3498db', '#4f46e5', '#9b59b6', '#000000'];
    const handleCursors: Record<string, string> = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', w: 'w-resize', e: 'e-resize', sw: 'sw-resize', s: 's-resize', se: 'se-resize' };

    const selStroke = selectedIdx !== null ? strokesRef.current[selectedIdx] : null;

    return (
        <>
            <canvas ref={bufferCanvasRef} style={{ display: 'none' }} />
            <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing}
                className={cn("absolute left-0 z-[4000] touch-none transition-opacity",
                    enabled ? (config.tool === 'pan' ? "pointer-events-none opacity-100" : "pointer-events-auto opacity-100") : "pointer-events-none opacity-0"
                )}
                style={{ top: 0, backgroundColor: whiteboardMode ? 'white' : 'transparent', cursor: handleCursorStyle() }} />
            <canvas ref={laserCanvasRef} className="absolute left-0 z-[4001] pointer-events-none touch-none" style={{ top: 0 }} />

            {/* Selection overlay */}
            {enabled && selectedIdx !== null && selBB && selStroke && (
                <div className="absolute left-0 top-0 z-[4500] pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    {/* Resize handles */}
                    {getHandlePositions(selBB).map(h => (
                        <div
                            key={h.id}
                            className="absolute pointer-events-auto bg-white border-2 border-indigo-500 rounded-sm shadow-md hover:bg-indigo-100 transition-colors"
                            style={{ left: h.x - 5, top: h.y - 5, width: 10, height: 10, cursor: handleCursors[h.id], zIndex: 4600 }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                e.currentTarget.setPointerCapture(e.pointerId);
                                const s = strokesRef.current[selectedIdxRef.current!];
                                dragStateRef.current = { type: 'resize', handle: h.id, startX: e.clientX, startY: e.clientY, origPoints: JSON.parse(JSON.stringify(s.points)), origBB: { ...selBB } };
                            }}
                            onPointerMove={(e) => {
                                if (!dragStateRef.current || selectedIdxRef.current === null) return;
                                const drag = dragStateRef.current;
                                const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
                                const s = strokesRef.current[selectedIdxRef.current];
                                s.points = resizePoints(drag.origPoints, drag.origBB, drag.handle, dx, dy);
                                setSelBB(getBB(s));
                                redraw();
                            }}
                            onPointerUp={(e) => {
                                e.currentTarget.releasePointerCapture(e.pointerId);
                                dragStateRef.current = null;
                                setStrokes([...strokesRef.current]);
                            }}
                        />
                    ))}

                    {/* Mini toolbar above selection */}
                    <div
                        className="absolute pointer-events-auto flex items-center gap-1 bg-[#1a1b26]/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-xl"
                        style={{ left: selBB.x1, top: Math.max(0, selBB.y1 - 52), zIndex: 4700 }}
                        onPointerDown={e => e.stopPropagation()}
                    >
                        {selectionColors.map(color => (
                            <button
                                key={color}
                                className={cn("w-5 h-5 rounded-full border-2 transition-all hover:scale-110 shrink-0",
                                    selStroke.color === color ? "border-white scale-110" : "border-transparent")}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                    if (selectedIdxRef.current !== null) {
                                        strokesRef.current[selectedIdxRef.current].color = color;
                                        setStrokes([...strokesRef.current]);
                                        setSelBB({ ...getBB(strokesRef.current[selectedIdxRef.current]) });
                                        redraw();
                                    }
                                }}
                            />
                        ))}
                        <div className="w-px h-4 bg-white/20 mx-1 shrink-0" />
                        <button
                            title="Çoğalt"
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => {
                                if (selectedIdxRef.current !== null && strokesRef.current[selectedIdxRef.current]) {
                                    const copy = JSON.parse(JSON.stringify(strokesRef.current[selectedIdxRef.current]));
                                    copy.points = copy.points.map((p: any) => ({ x: p.x + 20, y: p.y + 20 }));
                                    strokesRef.current.push(copy);
                                    const ni = strokesRef.current.length - 1;
                                    selectedIdxRef.current = ni;
                                    setStrokes([...strokesRef.current]);
                                    setSelectedIdx(ni);
                                    setSelBB(getBB(copy));
                                    redraw();
                                }
                            }}
                        ><Copy className="w-3.5 h-3.5" /></button>
                        <button
                            title="Seçili öğeyi sil"
                            className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/10 transition-colors"
                            onClick={() => {
                                if (selectedIdxRef.current !== null) {
                                    strokesRef.current.splice(selectedIdxRef.current, 1);
                                    setStrokes([...strokesRef.current]);
                                    deselect();
                                    redraw();
                                }
                            }}
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            )}
        </>
    );
});

// =======================
// STUDENT VIEW COMPONENT
// =======================
const StudentPortal = ({ act }: { act: any }) => {
    const [name, setName] = useState('');
    const [isStarted, setIsStarted] = useState(!act.is_test);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawConfig, setDrawConfig] = useState({ tool: 'pencil', color: '#ff4d4d', width: 3, fillEnabled: false, stampIcon: '✅' });
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [iframeHeight, setIframeHeight] = useState(1000);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const canvasRef = React.useRef<any>(null);
    const submissionsHandler = useFirestore('submissions');

    useEffect(() => {
        if (isStarted && act.is_test && act.has_timer && act.duration_minutes) {
            setTimeLeft(parseInt(act.duration_minutes) * 60);
        }
    }, [isStarted, act]);

    useEffect(() => {
        if (act.is_test && timeLeft === 0 && !isFinished) handleSubmit();
        if (act.is_test && timeLeft !== null && timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isFinished, act.is_test]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'IFRAME_HEIGHT_SYNC' && event.data.height > 0) {
                setIframeHeight(event.data.height);
            }
            if (event.data.type === 'SIM_ANSWER' && submissionId) {
                submissionsHandler.update(submissionId, { answers: event.data.data });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [submissionId]);

    const handleToolbarCommand = (type: string) => {
        if (type === 'UNDO_DRAWING') canvasRef.current?.undo();
        else if (type === 'CLEAR_DRAWING') canvasRef.current?.clear();
        else if (type === 'TOGGLE_WHITEBOARD') setShowWhiteboard(v => !v);
    };

    const handleStart = async () => {
        if (!name.trim()) return alert('Lütfen isminizi girin.');
        const res = await submissionsHandler.add({ activity_id: act.id, student_name: name, started_at: new Date().toISOString(), answers: {}, submitted_at: null });
        setSubmissionId(res.id);
        setIsStarted(true);
    };

    const handleSubmit = async () => {
        if (isFinished) return;
        setIsFinished(true);
        if (submissionId) await submissionsHandler.update(submissionId, { submitted_at: new Date().toISOString() });
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100"><Zap className="w-10 h-10" /></div>
                <div className="space-y-2"><h1 className="text-3xl font-black text-slate-800 tracking-tight">Test Tamamlandı!</h1><p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Cevapların başarıyla kaydedildi.</p></div>
                <p className="text-slate-500 max-w-sm">Dersi takip ettiğin için teşekkürler. Şimdi bu sekmeyi kapatabilirsin.</p>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center space-y-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200"><User className="w-8 h-8 text-white" /></div>
                    <div className="space-y-2"><h1 className="text-2xl font-black text-slate-800 tracking-tight">{act.title}</h1><p className="text-slate-500 text-sm font-medium">Başlamadan önce lütfen adınızı girin</p></div>
                    <div className="space-y-4">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-lg font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300" />
                        <button onClick={handleStart} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-200">Teste Başla</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0f172a] z-[3000] flex flex-col h-screen overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
            <header className="h-16 px-6 border-b border-white/5 flex justify-between items-center bg-slate-900 z-[6000] shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center"><User className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-200">{name || act.title}</span>
                </div>
                
                <div className="flex items-center gap-3">
                    {act.has_timer && timeLeft !== null && (
                        <div className={cn("font-black tabular-nums px-4 py-2 rounded-xl flex items-center gap-2", timeLeft < 60 ? "bg-red-500/20 text-red-400" : "bg-white/5 text-slate-300")}>
                            <Clock className="w-4 h-4" />{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    )}
                    <button onClick={() => setIsDrawingMode(!isDrawingMode)} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", isDrawingMode ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-slate-300 hover:bg-white/10")}><Pencil className="w-4 h-4" />{isDrawingMode ? 'Çizim Kapat' : 'Kalem Modu'}</button>
                    {act.is_test && <button onClick={handleSubmit} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors">Sınavı Bitir</button>}
                </div>
            </header>
            
            <main className="flex-1 relative bg-white overflow-y-auto overflow-x-hidden custom-scroll">
                <div style={{ position: 'relative', width: '100%', minHeight: '100%', height: iframeHeight }}>
                    <iframe 
                        ref={iframeRef} 
                        srcDoc={getFormattedHtml(act)} 
                        className={cn("w-full h-full border-0", isDrawingMode && drawConfig.tool !== 'pan' ? "pointer-events-none" : "pointer-events-auto")}
                        scrolling="no"
                    />
                    <DrawingCanvas ref={canvasRef} config={drawConfig} enabled={isDrawingMode} whiteboardMode={showWhiteboard} />
                </div>
                <AnimatePresence>{isDrawingMode && <DrawingToolbar onCommand={handleToolbarCommand} config={drawConfig} setConfig={setDrawConfig} showWhiteboard={showWhiteboard} setShowWhiteboard={setShowWhiteboard} />}</AnimatePresence>
            </main>
        </div>
    );
};

// =======================
// MAIN APP COMPONENT
// =======================
export default function App() {
    const params = new URLSearchParams(window.location.search);
    const [activities, setActivities] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [showResultsId, setShowResultsId] = useState<string | null>(null);
    const [isPreviewDrawingMode, setIsPreviewDrawingMode] = useState(false);
    const [previewDrawConfig, setPreviewDrawConfig] = useState({ tool: 'pencil', color: '#4f46e5', width: 3 });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [previewIframeHeight, setPreviewIframeHeight] = useState(1000);
    const previewIframeRef = React.useRef<HTMLIFrameElement>(null);
    const previewCanvasRef = React.useRef<any>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'IFRAME_HEIGHT_SYNC' && event.data.height > 0) {
                setPreviewIframeHeight(event.data.height);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Form States
    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const activitiesHandler = useFirestore('activities');

    useEffect(() => {
        const unsubA = activitiesHandler.sync(setActivities);
        return () => { unsubA(); };
    }, []);

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const payload = Object.fromEntries(formData.entries());
        
        // Handle checkbox values explicitly
        const finalPayload = {
            ...payload,
            is_test: formData.get('is_test') === 'on',
            has_timer: formData.get('has_timer') === 'on',
        };

        if (editItem) {
            await activitiesHandler.update(editItem.id, finalPayload);
        } else {
            await activitiesHandler.add(finalPayload);
        }
        setIsActivityOpen(false);
        setEditItem(null);
    };

    const inputClasses = "w-full bg-white border-2 border-indigo-50 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400";
    const labelClasses = "block text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2";

    if (params.get('view') === 'student' && params.get('id')) {
        const activity = activities.find(a => a.id === params.get('id'));
        if (activity) return <StudentPortal act={activity} />;
        return <div className="p-20 text-center font-bold text-slate-400">Etkinlik bulunamadı veya silinmiş olabilir.</div>;
    }

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-slate-50 relative">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100 via-transparent to-pink-50 opacity-60 pointer-events-none" />

            <Navbar />

            <main className="container mx-auto max-w-6xl relative z-10">
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-[11px] font-bold uppercase tracking-wider text-violet-700 shadow-sm">
                                <Grid className="w-3.5 h-3.5" /> Dijital İçerikler
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">İnteraktif Merkez</h2>
                            <p className="text-[15px] text-slate-500 max-w-md font-medium leading-relaxed">
                                Konu anlatımları, deneyler, animasyonlar ve simülasyonlarla dolu dijital arşiv.
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto gap-4 items-center">
                            <div className="relative flex-1 md:w-72">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="İçerik ara..."
                                    className="w-full bg-white border-2 border-indigo-100 rounded-2xl pl-12 pr-4 py-3.5 text-[14px] text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                            <button onClick={() => { setEditItem(null); setIsActivityOpen(true); }} className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 whitespace-nowrap">
                                <Plus className="w-5 h-5" /> İçerik Ekle
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Blocks className="w-4 h-4" /> {activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).length} İçerik Bulundu
                        </div>
                        <div className="flex bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'grid' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-slate-100"
                                )}
                                title="Izgara Görünümü"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'list' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-slate-100"
                                )}
                                title="Liste Görünümü"
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((act) => (
                            viewMode === 'grid' ? (
                                <ActivityCard
                                    key={act.id}
                                    act={act}
                                    setPreviewId={setPreviewId}
                                    setEditItem={setEditItem}
                                    setIsActivityOpen={setIsActivityOpen}
                                    activitiesHandler={activitiesHandler}
                                    showResultsId={showResultsId}
                                    setShowResultsId={setShowResultsId}
                                />
                            ) : (
                                <ActivityListItem
                                    key={act.id}
                                    act={act}
                                    setPreviewId={setPreviewId}
                                    setEditItem={setEditItem}
                                    setIsActivityOpen={setIsActivityOpen}
                                    activitiesHandler={activitiesHandler}
                                    showResultsId={showResultsId}
                                    setShowResultsId={setShowResultsId}
                                />
                            )
                        ))}
                    </div>
                </div>
                <ResultsModal isOpen={!!showResultsId} onClose={() => setShowResultsId(null)} activityId={showResultsId || ''} />
            </main>

            {/* NEW MINIMALIST FOOTER */}
            <footer className="fixed bottom-0 left-0 right-0 z-[50] py-4 bg-[#FAFAFA]/80 backdrop-blur-md border-t border-neutral-200/50 flex justify-center text-center">
                <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-400">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sistem Aktif</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span>V3 Minimalist Tasarım</span>
                </div>
            </footer>

            {/* MODALS */}
            <Modal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} title={editItem ? "Etkinliği Güncelle" : "Yeni İnteraktif İçerik"}>
                <form onSubmit={handleActivitySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Etkinlik Başlığı</label>
                            <input name="title" defaultValue={editItem?.title} required className={inputClasses} placeholder="İlgi çekici bir başlık girin" />
                        </div>
                        <div>
                            <label className={labelClasses}>Önizleme Görseli (URL)</label>
                            <input name="image_url" defaultValue={editItem?.image_url} className={inputClasses} placeholder="Görsel URL'si (Örn: https://.../resim.jpg)" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Kategori</label>
                            <input name="category" defaultValue={editItem?.category} className={inputClasses} placeholder="Matematik, Fen, vb." />
                        </div>
                        <div>
                            <label className={labelClasses}>Kısa Açıklama</label>
                            <textarea name="description" defaultValue={editItem?.description} rows={2} className={cn(inputClasses, "resize-none")} placeholder="Etkinliğin amacını özetleyin" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 py-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" name="is_test" defaultChecked={editItem?.is_test} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className={labelClasses.replace('mb-2', '')}>Test Modu</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group ml-4">
                                <div className="relative">
                                    <input type="checkbox" name="has_timer" defaultChecked={editItem?.has_timer} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className={labelClasses.replace('mb-2', '')}>Süre Sınırı</span>
                            </label>
                        </div>
                        
                        <div>
                            <input name="duration_minutes" type="number" defaultValue={editItem?.duration_minutes || 20} placeholder="Süre (Dakika)" className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>HTML Kodu</label>
                            <textarea name="html_code" defaultValue={editItem?.html_code} rows={5} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="<div id='uygulama'></div>" />
                        </div>
                        <div>
                            <label className={labelClasses}>JavaScript Kodu</label>
                            <textarea name="js_code" defaultValue={editItem?.js_code} rows={5} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="// console.log('Merhaba Dünya');" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>CSS Kodu (Opsiyonel)</label>
                            <textarea name="css_code" defaultValue={editItem?.css_code} rows={3} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="body { background: #f0f; }" />
                        </div>
                        <div>
                            <label className={labelClasses}>Dış Kütüphaneler (Her satıra bir link)</label>
                            <textarea name="external_libs" defaultValue={editItem?.external_libs} rows={3} className={cn(inputClasses, "font-mono text-[11px] text-neutral-600 resize-none")} placeholder="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js" />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsActivityOpen(false)} className="px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                            İptal
                        </button>
                        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[14px] font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200">
                            {editItem ? 'Değişiklikleri Kaydet' : 'Sisteme Ekle'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* FULL PREVIEW MODAL */}
            {previewId && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setPreviewId(null); setIsPreviewDrawingMode(false); setShowWhiteboard(false); }} className="absolute inset-0 bg-neutral-900/90" />
                    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
                        <header className="h-14 px-6 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0 z-[11000]">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                    <Blocks className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <h3 className="text-white font-bold">{activities.find(a => a.id === previewId)?.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsPreviewDrawingMode(!isPreviewDrawingMode)}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                                        isPreviewDrawingMode
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-indigo-500"
                                            : "bg-white/5 text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-300 border-white/10 hover:border-indigo-500/50"
                                    )}
                                >
                                    <Pencil className="w-4 h-4" />
                                    {isPreviewDrawingMode ? 'Kalemi Kapat' : 'Kalem Modu'}
                                </button>
                                <button onClick={() => { setPreviewId(null); setIsPreviewDrawingMode(false); setShowWhiteboard(false); }} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
                            </div>
                        </header>
                        <main className="flex-1 relative bg-white overflow-y-auto overflow-x-hidden custom-scroll">
                            <div style={{ position: 'relative', width: '100%', minHeight: '100%', height: previewIframeHeight }}>
                                <iframe 
                                    ref={previewIframeRef} 
                                    srcDoc={getFormattedHtml(activities.find(a => a.id === previewId))} 
                                    className={cn("w-full h-full border-0", isPreviewDrawingMode && previewDrawConfig.tool !== 'pan' ? "pointer-events-none" : "pointer-events-auto")} 
                                    scrolling="no"
                                />
                                <DrawingCanvas ref={previewCanvasRef} config={previewDrawConfig} enabled={isPreviewDrawingMode} whiteboardMode={showWhiteboard} />
                            </div>
                            <AnimatePresence>{isPreviewDrawingMode && <DrawingToolbar onCommand={(type) => { if(type==='UNDO_DRAWING') previewCanvasRef.current?.undo(); if(type==='CLEAR_DRAWING') previewCanvasRef.current?.clear(); if(type==='TOGGLE_WHITEBOARD') setShowWhiteboard(v => !v); }} config={previewDrawConfig} setConfig={setPreviewDrawConfig} showWhiteboard={showWhiteboard} setShowWhiteboard={setShowWhiteboard} />}</AnimatePresence>
                        </main>
                    </div>
                </div>
            )}

        </div>
    );
}
