// src/components/pdf/PDFDebugOverlay.tsx
// Profesyonel PDF Tanı ve Performans Paneli (Debug Overlay).
// Sayfa indeksi, yakınlaştırma ölçeği, ekran -> PDF koordinat dönüşümü,
// çizim ve nesne sayıları, önbellek durumu ve anlık FPS takibi sunar.

import React from 'react';
import { Activity, X, Eye, EyeOff, Layers, Cpu, Maximize } from 'lucide-react';
import type { Viewport } from '../../types';

interface PDFDebugOverlayProps {
    visible: boolean;
    onClose: () => void;
    pageIndex: number;
    totalPages: number;
    view: Viewport;
    canvasSize: { w: number; h: number };
    pageBox?: { w: number; h: number } | null;
    rotation?: number;
    annotationCount: number;
    isCloudSynced: boolean;
    isPdfMissing: boolean;
    pdfName?: string;
}

export function PDFDebugOverlay({
    visible,
    onClose,
    pageIndex,
    totalPages,
    view,
    canvasSize,
    pageBox,
    rotation = 0,
    annotationCount,
    isCloudSynced,
    isPdfMissing,
    pdfName,
}: PDFDebugOverlayProps) {
    const [fps, setFps] = React.useState(60);
    const [mouseCoords, setMouseCoords] = React.useState<{ screenX: number; screenY: number; pdfX: number; pdfY: number }>({
        screenX: 0,
        screenY: 0,
        pdfX: 0,
        pdfY: 0,
    });

    // FPS hesaplayıcı
    React.useEffect(() => {
        if (!visible) return;
        let frameCount = 0;
        let lastTime = performance.now();
        let animId: number;

        const loop = (now: number) => {
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(Math.round((frameCount * 1000) / (now - lastTime)));
                frameCount = 0;
                lastTime = now;
            }
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [visible]);

    // Fare koordinat takibi
    React.useEffect(() => {
        if (!visible) return;
        const handlePointer = (e: PointerEvent) => {
            const screenX = Math.round(e.clientX);
            const screenY = Math.round(e.clientY);
            const worldX = Math.round((screenX - view.tx) / view.scale);
            const worldY = Math.round((screenY - view.ty) / view.scale);
            setMouseCoords({
                screenX,
                screenY,
                pdfX: worldX,
                pdfY: worldY,
            });
        };
        window.addEventListener('pointermove', handlePointer, { passive: true });
        return () => window.removeEventListener('pointermove', handlePointer);
    }, [visible, view]);

    if (!visible) return null;

    return (
        <div className="fixed top-16 right-4 z-[9999] w-80 bg-[#12131c]/95 text-slate-200 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 text-xs font-mono select-none pointer-events-auto">
            {/* Başlık */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2 font-bold text-sky-400">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>PDF WORKSPACE DIAGNOSTICS</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {fps} FPS
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Kapat"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Metrikler */}
            <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                    <span className="text-slate-400">Doküman:</span>
                    <span className="text-white truncate max-w-[170px]" title={pdfName || 'Yok'}>
                        {pdfName || 'PDF Bağlı Değil'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Sayfa:</span>
                    <span className="text-sky-300 font-bold">
                        {pageIndex + 1} / {totalPages}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Zoom Ölçeği:</span>
                    <span className="text-amber-300 font-semibold">
                        %{Math.round(view.scale * 100)} ({view.scale.toFixed(2)}x)
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Sayfa Boyutu:</span>
                    <span className="text-slate-200">
                        {pageBox ? `${Math.round(pageBox.w)} × ${Math.round(pageBox.h)} pt` : 'Dinamik'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Sayfa Açısı:</span>
                    <span className="text-indigo-300 font-semibold">{rotation}°</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Anotasyon / Çizim:</span>
                    <span className="text-emerald-400 font-bold">{annotationCount} adet</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Bulut Senkronizasyonu:</span>
                    <span className={isCloudSynced ? 'text-emerald-400' : 'text-amber-400'}>
                        {isCloudSynced ? 'Aktif (Tüm Cihazlar)' : 'Yerel (IndexedDB)'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Durum:</span>
                    <span className={isPdfMissing ? 'text-rose-400 font-bold' : 'text-sky-400'}>
                        {isPdfMissing ? 'Dosya Eksik' : 'Hazır & Çizilebilir'}
                    </span>
                </div>

                {/* İmleç Koordinatları */}
                <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Koordinat Dönüşümü</div>
                    <div className="flex justify-between text-[10.5px]">
                        <span className="text-slate-400">Ekran:</span>
                        <span>x: {mouseCoords.screenX}, y: {mouseCoords.screenY} px</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                        <span className="text-slate-400">PDF Dünya:</span>
                        <span className="text-sky-300">x: {mouseCoords.pdfX}, y: {mouseCoords.pdfY} pt</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
