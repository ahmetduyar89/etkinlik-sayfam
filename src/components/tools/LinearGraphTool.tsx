// src/components/tools/LinearGraphTool.tsx
// 8. Sınıf ve Lise Matematik - Doğrusal Denklem, Eğim ve Fonksiyon Grafik Laboratuvarı.
// y = mx + n doğrusu, eğim üçgeni, eksenleri kestiği noktalar, ikinci doğru ve tahtaya damgalama desteği.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Maximize2,
    Minimize2,
    Camera,
    TrendingUp,
    Sparkles,
    Sliders,
    Layers,
    Info,
    RotateCcw,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LinearGraphToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

export function LinearGraphTool({ onClose, onInsertImage }: LinearGraphToolProps) {
    const dragControls = useDragControls();
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [isMaximized, setIsMaximized] = React.useState(false);

    // ── 1. Doğru Parametreleri: y = m1 * x + n1 ────────────────────────
    const [m1, setM1] = React.useState<number>(1); // Eğim
    const [n1, setN1] = React.useState<number>(2); // y-keseni

    // ── 2. Doğru Parametreleri (Opsiyonel Çift Doğru İncelemesi) ─────────
    const [showLine2, setShowLine2] = React.useState<boolean>(false);
    const [m2, setM2] = React.useState<number>(-1);
    const [n2, setN2] = React.useState<number>(4);

    // Görsel ayarlar
    const [showSlopeTriangle, setShowSlopeTriangle] = React.useState<boolean>(true);
    const [showIntercepts, setShowIntercepts] = React.useState<boolean>(true);

    // Koordinat eksenlerini kestiği noktalar
    // y = 0 -> x = -n / m
    const xIntercept1 = m1 !== 0 ? Math.round((-n1 / m1) * 100) / 100 : null;
    const yIntercept1 = n1;

    // Eğim açısı (derece)
    const slopeAngleDeg1 = Math.round((Math.atan(m1) * (180 / Math.PI)) * 10) / 10;

    // İki doğrunun kesişim noktası
    // m1*x + n1 = m2*x + n2 -> x*(m1 - m2) = n2 - n1 -> x = (n2 - n1) / (m1 - m2)
    const isParallel = m1 === m2;
    const isPerpendicular = Math.abs(m1 * m2 + 1) < 0.05;
    const intersectX = !isParallel ? Math.round(((n2 - n1) / (m1 - m2)) * 100) / 100 : null;
    const intersectY = intersectX !== null ? Math.round((m1 * intersectX + n1) * 100) / 100 : null;

    // ── Canvas Çizimi ──────────────────────────────────────────────────
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const ox = w / 2;
        const oy = h / 2;
        const scale = 30; // 1 birim = 30 piksel

        // Koyu koordinat arka planı
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, w, h);

        // Izgara Çizgileri
        ctx.strokeStyle = '#1e243b';
        ctx.lineWidth = 1;
        for (let x = ox % scale; x < w; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = oy % scale; y < h; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Ana Eksenler (X ve Y)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;

        // X ekseni
        ctx.beginPath();
        ctx.moveTo(20, oy);
        ctx.lineTo(w - 20, oy);
        ctx.stroke();

        // X ok ucu
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(w - 20, oy);
        ctx.lineTo(w - 28, oy - 4);
        ctx.lineTo(w - 28, oy + 4);
        ctx.fill();

        // Y ekseni
        ctx.beginPath();
        ctx.moveTo(ox, h - 20);
        ctx.lineTo(ox, 20);
        ctx.stroke();

        // Y ok ucu
        ctx.beginPath();
        ctx.moveTo(ox, 20);
        ctx.lineTo(ox - 4, 28);
        ctx.lineTo(ox + 4, 28);
        ctx.fill();

        // Eksen isimleri ve sayılar
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('x', w - 16, oy - 8);
        ctx.fillText('y', ox + 8, 22);
        ctx.fillText('0', ox - 12, oy + 14);

        // Sayı cetveli
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748b';
        for (let u = -10; u <= 10; u++) {
            if (u === 0) continue;
            const px = ox + u * scale;
            const py = oy - u * scale;
            if (px > 20 && px < w - 20) {
                ctx.beginPath();
                ctx.moveTo(px, oy - 3);
                ctx.lineTo(px, oy + 3);
                ctx.stroke();
                ctx.fillText(String(u), px - 4, oy + 14);
            }
            if (py > 20 && py < h - 20) {
                ctx.beginPath();
                ctx.moveTo(ox - 3, py);
                ctx.lineTo(ox + 3, py);
                ctx.stroke();
                ctx.fillText(String(u), ox - 16, py + 3);
            }
        }

        // Koordinat dönüşüm fonksiyonu
        const toScreen = (x: number, y: number) => ({
            sx: ox + x * scale,
            sy: oy - y * scale,
        });

        // ── 1. Doğruyu Çiz (y = m1*x + n1) ──────────────────────────────
        const xMin = -12;
        const xMax = 12;
        const pStart1 = toScreen(xMin, m1 * xMin + n1);
        const pEnd1 = toScreen(xMax, m1 * xMax + n1);

        ctx.strokeStyle = '#6366f1'; // İndigo canlı doğru
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(pStart1.sx, pStart1.sy);
        ctx.lineTo(pEnd1.sx, pEnd1.sy);
        ctx.stroke();

        // Eğim Dik Üçgeni (Basamak: Δx = 1, Δy = m)
        if (showSlopeTriangle && m1 !== 0) {
            const baseUnit = 1;
            const triX1 = 1;
            const triY1 = m1 * triX1 + n1;
            const triX2 = triX1 + baseUnit;
            const triY2 = m1 * triX2 + n1;

            const s1 = toScreen(triX1, triY1);
            const sCorner = toScreen(triX2, triY1);
            const s2 = toScreen(triX2, triY2);

            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.beginPath();
            ctx.moveTo(s1.sx, s1.sy);
            ctx.lineTo(sCorner.sx, sCorner.sy);
            ctx.lineTo(s2.sx, s2.sy);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#a5b4fc';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Etiketler: Δx ve Δy
            ctx.fillStyle = '#a5b4fc';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('Δx = 1', (s1.sx + sCorner.sx) / 2 - 14, sCorner.sy + 14);
            ctx.fillText(`Δy = ${m1}`, sCorner.sx + 6, (sCorner.sy + s2.sy) / 2 + 4);
        }

        // Eksen Kesişim Noktaları (0, n) ve (-n/m, 0)
        if (showIntercepts) {
            // y-keseni: (0, n1)
            const pY = toScreen(0, n1);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(pY.sx, pY.sy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#fca5a5';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`(0, ${n1})`, pY.sx + 8, pY.sy - 8);

            // x-keseni: (-n1/m1, 0)
            if (xIntercept1 !== null) {
                const pX = toScreen(xIntercept1, 0);
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(pX.sx, pX.sy, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#6ee7b7';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText(`(${xIntercept1}, 0)`, pX.sx - 20, pX.sy + 18);
            }
        }

        // ── 2. Doğruyu Çiz (Opsiyonel) ──────────────────────────────────
        if (showLine2) {
            const pStart2 = toScreen(xMin, m2 * xMin + n2);
            const pEnd2 = toScreen(xMax, m2 * xMax + n2);

            ctx.strokeStyle = '#f59e0b'; // Kehribar sarısı 2. doğru
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pStart2.sx, pStart2.sy);
            ctx.lineTo(pEnd2.sx, pEnd2.sy);
            ctx.stroke();

            // Kesişim Noktası
            if (intersectX !== null && intersectY !== null) {
                const pInt = toScreen(intersectX, intersectY);
                ctx.fillStyle = '#ec4899';
                ctx.beginPath();
                ctx.arc(pInt.sx, pInt.sy, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#f472b6';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(`Kesişim (${intersectX}, ${intersectY})`, pInt.sx + 10, pInt.sy - 8);
            }
        }
    }, [m1, n1, showLine2, m2, n2, showSlopeTriangle, showIntercepts, xIntercept1]);

    // Tahtaya aktar / damgala
    const handleInsertToCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !onInsertImage) return;
        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 560, 420);
    };

    // Denklem metni biçimlendirici: y = mx + n
    const formatEquation = (m: number, n: number) => {
        let str = 'y = ';
        if (m === 0) {
            return `y = ${n}`;
        }
        if (m === 1) str += 'x';
        else if (m === -1) str += '-x';
        else str += `${m}x`;

        if (n > 0) str += ` + ${n}`;
        else if (n < 0) str += ` - ${Math.abs(n)}`;
        return str;
    };

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
                width: isMaximized ? '98vw' : '820px',
                height: isMaximized ? '95vh' : '580px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={cn(
                'fixed z-[5100] flex flex-col bg-[#13151f]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden',
                isMaximized ? 'top-3 left-3' : 'top-12 left-1/2 -translate-x-1/2'
            )}
        >
            {/* Üst Başlık Çubuğu */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-950/80 via-[#181a29] to-[#13151f] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-600/30 text-blue-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                Doğrusal Denklem, Eğim & Grafik Damgası
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                8. Sınıf & Lise Matematik
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            y = mx + n doğrusu, eğim dik üçgeni ve eksen kesişimlerini canlı inceleyin
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {onInsertImage && (
                        <button
                            type="button"
                            onClick={handleInsertToCanvas}
                            title="Grafiği Tahtaya Damgala / Yapıştır"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Tahtaya Damgala</span>
                        </button>
                    )}
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

            {/* Çalışma Alanı */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {/* Sol İnteraktif Koordinat Sistemi */}
                <div className="flex-1 relative flex items-center justify-center bg-[#070913] p-2 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={460}
                        className="w-full h-full max-w-[640px] max-h-[460px] object-contain rounded-xl border border-white/5 shadow-inner"
                    />

                    {/* Denklem Rozeti */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                        <div className="px-3 py-1.5 rounded-xl bg-indigo-950/80 backdrop-blur-md border border-indigo-500/40 text-white font-mono font-bold text-sm shadow-xl">
                            d₁: {formatEquation(m1, n1)}
                        </div>
                        {showLine2 && (
                            <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono font-bold text-sm shadow-xl">
                                d₂: {formatEquation(m2, n2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sağ Kontrol Paneli */}
                <div className="w-full md:w-[310px] flex-shrink-0 bg-[#171926] border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
                    {/* 1. Doğru Parametreleri */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                                1. Doğru (d₁: y = mx + n)
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setM1(1);
                                    setN1(2);
                                }}
                                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Sıfırla</span>
                            </button>
                        </div>

                        {/* Eğim (m) Slider */}
                        <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Eğim (m)</span>
                                <span className="font-mono font-bold text-indigo-400 text-sm">{m1}</span>
                            </div>
                            <input
                                type="range"
                                min={-4}
                                max={4}
                                step={0.2}
                                value={m1}
                                onChange={(e) => setM1(Math.round(Number(e.target.value) * 10) / 10)}
                                className="w-full accent-indigo-500"
                            />
                            <div className="flex items-center gap-1 mt-1">
                                {[
                                    { v: 1, l: 'm=1' },
                                    { v: -1, l: 'm=-1' },
                                    { v: 2, l: 'm=2' },
                                    { v: 0, l: 'm=0' },
                                    { v: 0.5, l: 'm=½' },
                                ].map((p) => (
                                    <button
                                        key={p.l}
                                        type="button"
                                        onClick={() => setM1(p.v)}
                                        className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 font-mono"
                                    >
                                        {p.l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* y-keseni (n) Slider */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">y-keseni (n)</span>
                                <span className="font-mono font-bold text-red-400 text-sm">{n1}</span>
                            </div>
                            <input
                                type="range"
                                min={-8}
                                max={8}
                                step={0.5}
                                value={n1}
                                onChange={(e) => setN1(Number(e.target.value))}
                                className="w-full accent-red-400"
                            />
                            <div className="flex items-center gap-1 mt-1">
                                {[
                                    { v: 0, l: 'n=0 (Orijin)' },
                                    { v: 3, l: 'n=3' },
                                    { v: -2, l: 'n=-2' },
                                ].map((p) => (
                                    <button
                                        key={p.l}
                                        type="button"
                                        onClick={() => setN1(p.v)}
                                        className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 font-mono"
                                    >
                                        {p.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Analiz Kutusu */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Eğim Açısı (α):</span>
                            <span className="font-mono font-bold text-indigo-300">{slopeAngleDeg1}°</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                            <span>y-keseni:</span>
                            <span className="font-mono font-bold text-red-400">(0, {n1})</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                            <span>x-keseni:</span>
                            <span className="font-mono font-bold text-emerald-400">
                                {xIntercept1 !== null ? `(${xIntercept1}, 0)` : 'Tanımsız (Yatay Doğru)'}
                            </span>
                        </div>
                        <div className="text-[10.5px] text-amber-300/90 pt-1 border-t border-white/10 leading-tight">
                            {m1 > 0
                                ? '↗ Sağa yatık doğru: Eğim pozitif, artan fonksiyon (Dar Açı).'
                                : m1 < 0
                                ? '↘ Sola yatık doğru: Eğim negatif, azalan fonksiyon (Geniş Açı).'
                                : '→ Yatay doğru: Eğim 0 (x eksenine paralel sabit doğru).'}
                        </div>
                    </div>

                    {/* 2. Doğru ve Kesişim Modu */}
                    <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                                2. Doğru (d₂) Karşılaştır
                            </span>
                            <input
                                type="checkbox"
                                checked={showLine2}
                                onChange={(e) => setShowLine2(e.target.checked)}
                                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                        </div>

                        {showLine2 && (
                            <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-black/30 border border-amber-500/20 text-xs">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">d₂ Eğimi (m₂)</span>
                                        <span className="font-mono font-bold text-amber-400">{m2}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={-4}
                                        max={4}
                                        step={0.2}
                                        value={m2}
                                        onChange={(e) => setM2(Math.round(Number(e.target.value) * 10) / 10)}
                                        className="w-full accent-amber-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">d₂ Keseni (n₂)</span>
                                        <span className="font-mono font-bold text-amber-300">{n2}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={-8}
                                        max={8}
                                        step={0.5}
                                        value={n2}
                                        onChange={(e) => setN2(Number(e.target.value))}
                                        className="w-full accent-amber-400"
                                    />
                                </div>

                                <div className="text-[11px] pt-1.5 border-t border-white/10">
                                    {isParallel ? (
                                        <span className="text-emerald-400 font-bold">
                                            // Doğrular Paraleldir (m₁ = m₂). Kesişim noktası yoktur.
                                        </span>
                                    ) : isPerpendicular ? (
                                        <span className="text-purple-400 font-bold">
                                            ⊥ Doğrular Diktir (m₁ · m₂ = -1). Kesişim: ({intersectX}, {intersectY})
                                        </span>
                                    ) : (
                                        <span className="text-amber-300">
                                            Kesişim Noktası: <strong>({intersectX}, {intersectY})</strong>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Görsel Katman Ayarları */}
                    <div className="mt-auto flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showSlopeTriangle}
                                onChange={(e) => setShowSlopeTriangle(e.target.checked)}
                                className="rounded accent-indigo-500"
                            />
                            <span>Eğim Üçgeni (Δy/Δx)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showIntercepts}
                                onChange={(e) => setShowIntercepts(e.target.checked)}
                                className="rounded accent-indigo-500"
                            />
                            <span>Kesişimler</span>
                        </label>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
