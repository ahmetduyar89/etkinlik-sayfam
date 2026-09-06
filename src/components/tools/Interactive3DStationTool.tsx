// src/components/tools/Interactive3DStationTool.tsx
// Akıllı tahta için Profesyonel 3D Fen & Matematik Deney İstasyonu (GeoGebra & PhET Seviyesi).
// Zemin ızgarası, kontak gölgeleri, kusursuz menteşe katlanma geometrisi, NASA tarzı prosedürel Dünya ve OrbitControls.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Move,
    Maximize2,
    Minimize2,
    RotateCcw,
    Play,
    Pause,
    Camera,
    Box,
    Globe,
    Atom,
    Dna,
    ExternalLink,
    Eye,
} from 'lucide-react';
import * as THREE from 'three';
import { cn } from '../../utils/cn';

interface Interactive3DStationToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

type TabType = 'solids' | 'seasons' | 'atom' | 'dna' | 'geogebra';

export function Interactive3DStationTool({ onClose, onInsertImage }: Interactive3DStationToolProps) {
    const dragControls = useDragControls();
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = React.useState<TabType>('solids');
    const [isMaximized, setIsMaximized] = React.useState(false);
    const [autoRotate, setAutoRotate] = React.useState(false);

    // ── 3D Katı Cisimler Parametreleri ──────────────────────────────
    const [solidShape, setSolidShape] = React.useState<number>(0); // 0:Küp, 1:Piramit, 2:Silindir, 3:Koni, 4:Dörtyüzlü
    const [foldPercent, setFoldPercent] = React.useState<number>(85); // 0: Açınım, 100: Kapalı
    const [showGrid, setShowGrid] = React.useState<boolean>(true);
    const [wireframe, setWireframe] = React.useState<boolean>(false);

    // ── 3D Mevsimler Parametreleri ──────────────────────────────────
    const [seasonDate, setSeasonDate] = React.useState<number>(1); // 0: 21 Mart, 1: 21 Haz, 2: 23 Eyl, 3: 21 Ara

    // ── 3D Atom Parametreleri ───────────────────────────────────────
    const [elementIdx, setElementIdx] = React.useState<number>(3); // C: Karbon

    // ── 3D DNA Parametreleri ────────────────────────────────────────
    const [dnaUnzip, setDnaUnzip] = React.useState<number>(0);

    // ── Three.js Referansları ───────────────────────────────────────
    const sceneRef = React.useRef<THREE.Scene | null>(null);
    const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
    const mainGroupRef = React.useRef<THREE.Group | null>(null);
    const gridRef = React.useRef<THREE.GridHelper | null>(null);
    const shadowRef = React.useRef<THREE.Mesh | null>(null);
    const sunLightRef = React.useRef<THREE.DirectionalLight | null>(null);
    const reqAnimRef = React.useRef<number | null>(null);

    // Etkileşim durumu (Orbit Controls)
    const isDraggingRef = React.useRef(false);
    const lastMouseRef = React.useRef({ x: 0, y: 0 });
    const sphericalRef = React.useRef({ radius: 5.2, theta: -0.5, phi: 1.15 });
    const targetSphericalRef = React.useRef({ radius: 5.2, theta: -0.5, phi: 1.15 });

    // ── Three.js Sahnesini Başlatma ─────────────────────────────────
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        cameraRef.current = camera;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                preserveDrawingBuffer: true,
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.25;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            rendererRef.current = renderer;
        } catch {
            return;
        }

        // Işıklandırma (Stüdyo Kalitesi)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.1);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
        dirLight.position.set(6, 12, 8);
        scene.add(dirLight);
        sunLightRef.current = dirLight;

        const fillLight = new THREE.DirectionalLight(0x818cf8, 0.6);
        fillLight.position.set(-6, -2, -6);
        scene.add(fillLight);

        // GeoGebra 3D Zemin Izgarası
        const grid = new THREE.GridHelper(8, 16, 0x6366f1, 0x334155);
        grid.position.y = -1.0;
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.5;
        scene.add(grid);
        gridRef.current = grid;

        // Yumuşak Zemin Kontak Gölgesi (Ground Contact Shadow)
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 128;
        shadowCanvas.height = 128;
        const sCtx = shadowCanvas.getContext('2d');
        if (sCtx) {
            const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
            grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            sCtx.fillStyle = grad;
            sCtx.fillRect(0, 0, 128, 128);
        }
        const shadowTex = new THREE.CanvasTexture(shadowCanvas);
        const shadowMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(3.6, 3.6),
            new THREE.MeshBasicMaterial({
                map: shadowTex,
                transparent: true,
                depthWrite: false,
            })
        );
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = -0.99;
        scene.add(shadowMesh);
        shadowRef.current = shadowMesh;

        // Ana Model Grubu
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);
        mainGroupRef.current = mainGroup;

        // Boyutlandırma
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Render döngüsü
        let lastTime = performance.now();
        const animate = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            if (autoRotate && !isDraggingRef.current) {
                targetSphericalRef.current.theta += 0.5 * dt;
            }

            // Damping (momentum sönümleme)
            sphericalRef.current.theta += (targetSphericalRef.current.theta - sphericalRef.current.theta) * 0.12;
            sphericalRef.current.phi += (targetSphericalRef.current.phi - sphericalRef.current.phi) * 0.12;
            sphericalRef.current.radius += (targetSphericalRef.current.radius - sphericalRef.current.radius) * 0.12;

            const { radius, theta, phi } = sphericalRef.current;
            camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
            camera.position.y = radius * Math.cos(phi);
            camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            reqAnimRef.current = requestAnimationFrame(animate);
        };

        reqAnimRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
            renderer.dispose();
        };
    }, [autoRotate]);

    // ── Izgara Görünürlüğü ──────────────────────────────────────────
    React.useEffect(() => {
        if (gridRef.current) gridRef.current.visible = showGrid;
    }, [showGrid]);

    // ── Modelleri Oluşturma ─────────────────────────────────────────
    React.useEffect(() => {
        const group = mainGroupRef.current;
        if (!group) return;

        while (group.children.length > 0) {
            const child = group.children[0];
            group.remove(child);
        }

        if (activeTab === 'solids') {
            buildPerfectSolids(group, solidShape, foldPercent / 100, wireframe);
        } else if (activeTab === 'seasons') {
            buildRichEarthScene(group, seasonDate, sunLightRef.current);
        } else if (activeTab === 'atom') {
            buildPhetAtomScene(group, elementIdx);
        } else if (activeTab === 'dna') {
            buildHelixDnaScene(group, dnaUnzip / 100);
        }
    }, [activeTab, solidShape, foldPercent, wireframe, seasonDate, elementIdx, dnaUnzip]);

    // ── Orbit Kontrolleri ───────────────────────────────────────────
    const handlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };

        targetSphericalRef.current.theta -= dx * 0.009;
        targetSphericalRef.current.phi = Math.max(
            0.15,
            Math.min(Math.PI / 2 + 0.35, targetSphericalRef.current.phi - dy * 0.009)
        );
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        isDraggingRef.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        targetSphericalRef.current.radius = Math.max(
            2.2,
            Math.min(8.5, targetSphericalRef.current.radius + e.deltaY * 0.005)
        );
    };

    const handleResetView = () => {
        targetSphericalRef.current = { radius: 5.2, theta: -0.5, phi: 1.15 };
    };

    const handleCaptureToCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !onInsertImage) return;
        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 460, 360);
    };

    return (
        <motion.div
            drag={!isMaximized}
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                'fixed z-[5000] flex flex-col bg-[#0b101b]/95 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden transition-all duration-300 select-none text-white',
                isMaximized
                    ? 'inset-4 w-auto h-auto'
                    : 'w-[min(94vw,700px)] h-[580px] top-[9%] left-[calc(50%-350px)] max-h-[88vh]'
            )}
        >
            {/* Üst Bar */}
            <div
                onPointerDown={(e) => !isMaximized && dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border-b border-white/10 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-purple-300">
                        3D Laboratuvar & Geometri
                    </span>
                </div>

                {/* Sekmeler */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    <TabButton
                        active={activeTab === 'solids'}
                        onClick={() => setActiveTab('solids')}
                        icon={<Box className="w-3.5 h-3.5" />}
                        label="Katı Cisimler"
                    />
                    <TabButton
                        active={activeTab === 'seasons'}
                        onClick={() => setActiveTab('seasons')}
                        icon={<Globe className="w-3.5 h-3.5" />}
                        label="Dünya & Mevsimler"
                    />
                    <TabButton
                        active={activeTab === 'atom'}
                        onClick={() => setActiveTab('atom')}
                        icon={<Atom className="w-3.5 h-3.5" />}
                        label="Atom"
                    />
                    <TabButton
                        active={activeTab === 'dna'}
                        onClick={() => setActiveTab('dna')}
                        icon={<Dna className="w-3.5 h-3.5" />}
                        label="DNA"
                    />
                    <TabButton
                        active={activeTab === 'geogebra'}
                        onClick={() => setActiveTab('geogebra')}
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        label="GeoGebra 3D"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                        title={isMaximized ? 'Küçült' : 'Tam Ekran'}
                    >
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        title="Kapat"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Orta Görsel Alan */}
            <div className="relative flex-1 bg-gradient-to-b from-[#0a0f1d] via-[#090d18] to-[#04060c] overflow-hidden">
                {activeTab === 'geogebra' ? (
                    <iframe
                        src="https://www.geogebra.org/3d?embed"
                        title="GeoGebra 3D"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    />
                ) : (
                    <div
                        ref={containerRef}
                        className="w-full h-full relative touch-none cursor-grab active:cursor-grabbing"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onWheel={handleWheel}
                    >
                        <canvas ref={canvasRef} className="w-full h-full block" />

                        {/* Yüzen Kontrol Hapı (Floating Pill Toolbar) */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xl text-xs">
                            <button
                                type="button"
                                onClick={handleResetView}
                                className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition"
                                title="Bakış Açısını Sıfırla"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Açıyı Sıfırla</span>
                            </button>
                            <div className="w-[1px] h-3 bg-white/20" />
                            <button
                                type="button"
                                onClick={() => setAutoRotate(!autoRotate)}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-1 rounded-md transition',
                                    autoRotate ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-300 hover:text-white'
                                )}
                                title="Otomatik Dönüş"
                            >
                                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                <span>{autoRotate ? 'Dönüyor' : 'Sabit'}</span>
                            </button>
                            <div className="w-[1px] h-3 bg-white/20" />
                            <button
                                type="button"
                                onClick={() => setShowGrid(!showGrid)}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-1 rounded-md transition',
                                    showGrid ? 'text-sky-300 bg-sky-500/20' : 'text-slate-400 hover:text-white'
                                )}
                                title="GeoGebra Zemin Izgarası"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Izgara</span>
                            </button>
                            {onInsertImage && (
                                <>
                                    <div className="w-[1px] h-3 bg-white/20" />
                                    <button
                                        type="button"
                                        onClick={handleCaptureToCanvas}
                                        className="flex items-center gap-1.5 text-emerald-300 hover:text-white font-bold px-3 py-1 rounded-md bg-emerald-600/30 hover:bg-emerald-600 transition shadow-sm"
                                        title="Bu 3D görüntüyü defter sayfasına yapıştır"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>📸 Tahtaya Aktar</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Sol Üst Bilgi Kartı */}
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 shadow-lg text-xs pointer-events-none">
                            {activeTab === 'solids' && (
                                <div>
                                    <p className="font-extrabold text-indigo-300 text-sm">
                                        {['Küp', 'Kare Piramit', 'Silindir', 'Koni', 'Düzgün Dörtyüzlü'][solidShape]}
                                    </p>
                                    <p className="text-[10.5px] text-slate-300 font-medium">
                                        {foldPercent < 5
                                            ? '📐 Tam Düzlem 2D Açınımı'
                                            : foldPercent > 95
                                            ? '📦 Kapalı 3D Katı Cisim'
                                            : `⚡ %${foldPercent} Dinamik Katlanma`}
                                    </p>
                                    <p className="text-[9.5px] text-slate-400 mt-0.5">
                                        {solidShape === 0 && 'V = a³ | Alan = 6a² | 6 Kare Yüz'}
                                        {solidShape === 1 && 'V = (a²·h)/3 | 1 Kare + 4 Üçgen'}
                                        {solidShape === 2 && 'V = π·r²·h | 2 Daire + 1 Dikdörtgen'}
                                        {solidShape === 3 && 'V = (π·r²·h)/3 | 1 Daire + 1 Daire Dilimi'}
                                        {solidShape === 4 && 'V = (a³√2)/12 | 4 Eşkenar Üçgen'}
                                    </p>
                                </div>
                            )}
                            {activeTab === 'seasons' && (
                                <div>
                                    <p className="font-extrabold text-amber-300 text-sm">
                                        {['🌸 21 Mart (Ekinoks)', '☀️ 21 Haziran (Yaz Gündönümü)', '🍂 23 Eylül (Ekinoks)', '❄️ 21 Aralık (Kış Gündönümü)'][seasonDate]}
                                    </p>
                                    <p className="text-[10.5px] text-slate-300 font-medium">
                                        Dünya Eksen Eğikliği: <span className="text-yellow-400 font-bold">23° 27′</span>
                                    </p>
                                    <p className="text-[9.5px] text-slate-400 mt-0.5">
                                        {seasonDate === 1 && 'Güneş ışınları Yengeç Dönencesine dik gelir (KYK en uzun gündüz).'}
                                        {seasonDate === 3 && 'Güneş ışınları Oğlak Dönencesine dik gelir (GYK yaz, KYK kış).'}
                                        {(seasonDate === 0 || seasonDate === 2) && 'Güneş ışınları Ekvatora dik gelir (Gece = Gündüz = 12 sa).'}
                                    </p>
                                </div>
                            )}
                            {activeTab === 'atom' && (
                                <div>
                                    <p className="font-extrabold text-cyan-300 text-sm">
                                        {['Hidrojen (₁H)', 'Helyum (₂He)', 'Lityum (₃Li)', 'Karbon (₆C)', 'Oksijen (₈O)', 'Sodyum (₁₁Na)'][elementIdx]}
                                    </p>
                                    <p className="text-[10.5px] text-slate-300 font-medium">
                                        🔴 Proton | ⚪ Nötron | 🔵 3D Elektron Bulutu
                                    </p>
                                </div>
                            )}
                            {activeTab === 'dna' && (
                                <div>
                                    <p className="font-extrabold text-purple-300 text-sm">3D Çift Sarmal DNA Modeli</p>
                                    <p className="text-[10.5px] text-slate-300 font-medium">
                                        🔴 A - 🟡 T | 🟢 G - 🔵 C Hidrojen Bağları
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sağ Alt İpucu */}
                        <div className="absolute top-3 right-3 text-[10px] text-slate-400 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg pointer-events-none">
                            🖱 Parmağınla/Fareyle 360° Çevir & Yakınlaştır
                        </div>
                    </div>
                )}
            </div>

            {/* Alt Kontrol Barı */}
            {activeTab !== 'geogebra' && (
                <div className="px-4 py-3 bg-slate-900/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {activeTab === 'solids' && (
                        <>
                            <div className="flex items-center gap-1">
                                {['Küp', 'Kare Piramit', 'Silindir', 'Koni', 'Dörtyüzlü'].map((name, idx) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setSolidShape(idx)}
                                        className={cn(
                                            'px-2.5 py-1.5 rounded-lg font-bold transition',
                                            solidShape === idx
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-sm">
                                <span className="text-slate-300 font-semibold whitespace-nowrap">Aç / Katla:</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={foldPercent}
                                    onChange={(e) => setFoldPercent(Number(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                                />
                                <span className="text-indigo-300 font-black w-10 text-right">%{foldPercent}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setWireframe(!wireframe)}
                                className={cn(
                                    'px-2.5 py-1.5 rounded-lg font-semibold transition border border-white/10',
                                    wireframe ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500' : 'text-slate-400 hover:text-white'
                                )}
                            >
                                Tel Kafes
                            </button>
                        </>
                    )}

                    {activeTab === 'seasons' && (
                        <div className="flex items-center gap-2 w-full justify-between">
                            <span className="text-slate-300 font-semibold">Tarih & Eksen:</span>
                            <div className="flex items-center gap-2">
                                {[
                                    { id: 0, label: '🌸 21 Mart' },
                                    { id: 1, label: '☀️ 21 Haziran' },
                                    { id: 2, label: '🍂 23 Eylül' },
                                    { id: 3, label: '❄️ 21 Aralık' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSeasonDate(item.id)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-xl font-bold transition',
                                            seasonDate === item.id
                                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40'
                                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'atom' && (
                        <div className="flex items-center gap-2 w-full justify-between">
                            <span className="text-slate-300 font-semibold">Element Seçimi:</span>
                            <div className="flex items-center gap-1.5">
                                {['1: H', '2: He', '3: Li', '6: C', '8: O', '11: Na'].map((name, idx) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setElementIdx(idx)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-xl font-bold transition',
                                            elementIdx === idx
                                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40'
                                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'dna' && (
                        <div className="flex items-center gap-3 w-full justify-between">
                            <span className="text-slate-300 font-semibold">Sarmalı Aç / Eşle:</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={dnaUnzip}
                                onChange={(e) => setDnaUnzip(Number(e.target.value))}
                                className="w-80 accent-purple-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                            />
                            <span className="text-purple-300 font-black">%{dnaUnzip}</span>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'geogebra' && (
                <div className="px-4 py-3 bg-slate-900/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="font-semibold text-white">GeoGebra 3D Uzay Geometri Laboratuvarı</span>
                        <span className="text-slate-500 hidden sm:inline">|</span>
                        <span className="text-slate-400 hidden sm:inline">Katı cisimler, düzlemler ve uzay koordinatları</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href="https://www.geogebra.org/3d"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-bold transition flex items-center gap-1.5"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Tarayıcıda Tam Ekran Aç</span>
                        </a>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

// ── KUSURSUZ MENTEŞE KATLANMA GEOMETRİSİ (KÜP & KATILAR) ────────────
function buildPerfectSolids(group: THREE.Group, shape: number, foldT: number, wireframe: boolean) {
    const s = 1.3;
    const half = s / 2;
    const angle = (foldT * Math.PI) / 2; // 0 = düzlem, 90° = tam dik katlanma

    const makeMat = (color: number, opacity = 0.95) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness: 0.25,
            metalness: 0.1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity,
            wireframe,
        });

    const makeBorder = (w: number, h: number) => {
        const borderGeom = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h));
        return new THREE.LineSegments(
            borderGeom,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true, opacity: 0.6 })
        );
    };

    if (shape === 0) {
        // KÜPÜN STANDART HAÇ (LATIN CROSS) AÇINIMI
        // Merkez taban yüzü (Y = -half'da yatay durur)
        const baseGeom = new THREE.PlaneGeometry(s, s);
        const baseMesh = new THREE.Mesh(baseGeom, makeMat(0x4f46e5));
        baseMesh.rotation.x = -Math.PI / 2;
        baseMesh.position.y = -half;
        baseMesh.add(makeBorder(s, s));
        group.add(baseMesh);

        // 1. ÖN YÜZ (Tabanın alt/ön kenarından yukarı katlanır)
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, -half, 0);
        const frontMesh = new THREE.Mesh(baseGeom, makeMat(0xec4899));
        frontMesh.position.set(0, -half, 0); // Pivotun ucunda
        frontMesh.add(makeBorder(s, s));
        frontPivot.add(frontMesh);
        frontPivot.rotation.x = -angle;
        baseMesh.add(frontPivot);

        // 2. ARKA YÜZ (Tabanın üst/arka kenarından yukarı katlanır)
        const backPivot = new THREE.Group();
        backPivot.position.set(0, half, 0);
        const backMesh = new THREE.Mesh(baseGeom, makeMat(0x8b5cf6));
        backMesh.position.set(0, half, 0);
        backMesh.add(makeBorder(s, s));
        backPivot.add(backMesh);
        backPivot.rotation.x = angle;
        baseMesh.add(backPivot);

        // 3. SOL YÜZ (Tabanın sol kenarından yukarı katlanır)
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-half, 0, 0);
        const leftMesh = new THREE.Mesh(baseGeom, makeMat(0x14b8a6));
        leftMesh.position.set(-half, 0, 0);
        leftMesh.add(makeBorder(s, s));
        leftPivot.add(leftMesh);
        leftPivot.rotation.y = -angle;
        baseMesh.add(leftPivot);

        // 4. SAĞ YÜZ (Tabanın sağ kenarından yukarı katlanır)
        const rightPivot = new THREE.Group();
        rightPivot.position.set(half, 0, 0);
        const rightMesh = new THREE.Mesh(baseGeom, makeMat(0xf59e0b));
        rightMesh.position.set(half, 0, 0);
        rightMesh.add(makeBorder(s, s));
        rightPivot.add(rightMesh);
        rightPivot.rotation.y = angle;
        baseMesh.add(rightPivot);

        // 5. ÜST KAPAK (Arka yüzün ucundaki menteşeden katlanır!)
        // Standart haç açınımında üst kapak arka yüzün ucuna bağlıdır.
        const topPivot = new THREE.Group();
        topPivot.position.set(0, half, 0); // Arka yüzün ucunda
        const topMesh = new THREE.Mesh(baseGeom, makeMat(0x06b6d4));
        topMesh.position.set(0, half, 0);
        topMesh.add(makeBorder(s, s));
        topPivot.add(topMesh);
        topPivot.rotation.x = angle;
        backMesh.add(topPivot);
    } else if (shape === 1) {
        // KARE PİRAMİT AÇINIMI
        const baseGeom = new THREE.PlaneGeometry(s, s);
        const baseMesh = new THREE.Mesh(baseGeom, makeMat(0x3b82f6));
        baseMesh.rotation.x = -Math.PI / 2;
        baseMesh.position.y = -half;
        baseMesh.add(makeBorder(s, s));
        group.add(baseMesh);

        const h = 1.25; // Üçgen yüz boyu
        const triGeom = new THREE.BufferGeometry();
        const verts = new Float32Array([-half, 0, 0, half, 0, 0, 0, h, 0]);
        triGeom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        triGeom.computeVertexNormals();

        // Piramidin tepede birleşme açısı
        const triAngle = foldT * 1.15;
        const sides = [
            { x: 0, y: half, rz: 0, col: 0xec4899 },
            { x: 0, y: -half, rz: Math.PI, col: 0x10b981 },
            { x: half, y: 0, rz: -Math.PI / 2, col: 0xf59e0b },
            { x: -half, y: 0, rz: Math.PI / 2, col: 0x8b5cf6 },
        ];

        for (const sd of sides) {
            const p = new THREE.Group();
            p.position.set(sd.x, sd.y, 0);
            p.rotation.z = sd.rz;
            p.rotation.x = triAngle;
            const m = new THREE.Mesh(triGeom, makeMat(sd.col));
            m.add(new THREE.LineSegments(new THREE.EdgesGeometry(triGeom), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })));
            p.add(m);
            baseMesh.add(p);
        }
    } else if (shape === 2) {
        // SİLİNDİR
        const r = 0.7;
        const h = 1.5;
        const geom = new THREE.CylinderGeometry(r, r, h, 40);
        const mesh = new THREE.Mesh(geom, makeMat(0x06b6d4));
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })));
        group.add(mesh);
    } else if (shape === 3) {
        // KONİ
        const r = 0.85;
        const h = 1.6;
        const geom = new THREE.ConeGeometry(r, h, 40);
        const mesh = new THREE.Mesh(geom, makeMat(0xf97316));
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })));
        group.add(mesh);
    } else {
        // DÖRTYÜZLÜ (Tetrahedron)
        const geom = new THREE.TetrahedronGeometry(1.3);
        const mesh = new THREE.Mesh(geom, makeMat(0xa855f7));
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })));
        group.add(mesh);
    }
}

// ── PROSEDÜREL DOKULU DÜNYA & MEVSİMLER (NASA SEVİYESİ) ─────────────
let cachedEarthTexture: THREE.CanvasTexture | null = null;

function getProceduralEarthTexture(): THREE.CanvasTexture {
    if (cachedEarthTexture) return cachedEarthTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Derin Mavi Okyanus
        ctx.fillStyle = '#0f387a';
        ctx.fillRect(0, 0, 1024, 512);

        // Kıtalar (Yeşilimsi ve toprak tonları)
        ctx.fillStyle = '#22783d';

        // Avrasya & Afrika
        ctx.beginPath();
        ctx.ellipse(560, 200, 180, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(540, 310, 80, 100, 0, 0, Math.PI * 2); // Afrika
        ctx.fill();

        // Kuzey Amerika
        ctx.beginPath();
        ctx.ellipse(260, 180, 110, 70, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Güney Amerika
        ctx.beginPath();
        ctx.ellipse(320, 340, 70, 95, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Avustralya
        ctx.beginPath();
        ctx.ellipse(820, 360, 60, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Antarktika (Buzullar)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 470, 1024, 42);
        ctx.fillRect(0, 0, 1024, 30); // Kuzey kutup buzu

        // Enlem ve Boylam Çizgileri
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        for (let y = 64; y < 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
        }
        for (let x = 128; x < 1024; x += 128) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }
    }

    cachedEarthTexture = new THREE.CanvasTexture(canvas);
    return cachedEarthTexture;
}

function buildRichEarthScene(group: THREE.Group, seasonDate: number, sunLight: THREE.DirectionalLight | null) {
    const tiltRadian = (23.5 * Math.PI) / 180;
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = tiltRadian; // 23.5° Eksen Eğikliği

    const r = 1.35;
    const earthGeom = new THREE.SphereGeometry(r, 64, 64);
    const earthTex = getProceduralEarthTexture();

    const earthMat = new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.6,
        metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);

    // Ekvator Çemberi (Kırmızı Parlayan Hat)
    const eqGeom = new THREE.BufferGeometry();
    const eqPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        eqPts.push(Math.cos(th) * (r * 1.02), 0, Math.sin(th) * (r * 1.02));
    }
    eqGeom.setAttribute('position', new THREE.Float32BufferAttribute(eqPts, 3));
    earthMesh.add(new THREE.Line(eqGeom, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 })));

    // Yengeç Dönencesi (23.5° K - Sarı)
    const yLat = (23.5 * Math.PI) / 180;
    const yR = Math.cos(yLat) * (r * 1.02);
    const yY = Math.sin(yLat) * (r * 1.02);
    const yGeom = new THREE.BufferGeometry();
    const yPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        yPts.push(Math.cos(th) * yR, yY, Math.sin(th) * yR);
    }
    yGeom.setAttribute('position', new THREE.Float32BufferAttribute(yPts, 3));
    earthMesh.add(new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 })));

    // Oğlak Dönencesi (23.5° G - Turuncu)
    const oGeom = new THREE.BufferGeometry();
    const oPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        oPts.push(Math.cos(th) * yR, -yY, Math.sin(th) * yR);
    }
    oGeom.setAttribute('position', new THREE.Float32BufferAttribute(oPts, 3));
    earthMesh.add(new THREE.Line(oGeom, new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 2 })));

    // Eksen Çubuğu (Kuzey & Güney Kutbu)
    const axisMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 3.6, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 })
    );
    earthMesh.add(axisMesh);

    earthGroup.add(earthMesh);
    group.add(earthGroup);

    // Güneş Işığı Konumu: Tarihe göre aydınlanma
    // 21 Haziran'da Güneş Yengeç'e dik; 21 Aralık'ta Oğlak'a dik
    if (sunLight) {
        if (seasonDate === 1) sunLight.position.set(8, 3.2, 5); // 21 Haziran (KYK dik)
        else if (seasonDate === 3) sunLight.position.set(8, -3.2, 5); // 21 Aralık (GYK dik)
        else sunLight.position.set(8, 0, 5); // Ekinoks (Ekvatora dik)
    }

    // Güneş Işınları Ok Demeti
    const sunArrows = new THREE.Group();
    sunArrows.position.set(3.8, 0, 0);
    for (let dy = -1.0; dy <= 1.0; dy += 0.5) {
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, dy, 0),
            1.8,
            0xfde047,
            0.25,
            0.15
        );
        sunArrows.add(arrow);
    }
    group.add(sunArrows);
}

// ── PhET SEVİYESİNDE ATOM VE ORBİTALLER ──────────────────────────────
function buildPhetAtomScene(group: THREE.Group, elemIdx: number) {
    const ELEMS = [
        { p: 1, n: 0, e: 1 },
        { p: 2, n: 2, e: 2 },
        { p: 3, n: 4, e: 3 },
        { p: 6, n: 6, e: 6 },
        { p: 8, n: 8, e: 8 },
        { p: 11, n: 12, e: 11 },
    ];
    const el = ELEMS[elemIdx] ?? ELEMS[3];

    // Çekirdek (Proton & Nötron Kümesi)
    const nucGroup = new THREE.Group();
    const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.1 });
    const nMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.1 });
    const pGeom = new THREE.SphereGeometry(0.15, 20, 20);

    const total = el.p + el.n;
    for (let i = 0; i < total; i++) {
        const isP = i < el.p;
        const mesh = new THREE.Mesh(pGeom, isP ? pMat : nMat);
        const phi = Math.acos(-1 + (2 * i) / Math.max(1, total));
        const theta = Math.sqrt(total * Math.PI) * phi;
        const rad = 0.32 * Math.pow(total / 8, 0.33);
        mesh.position.set(
            rad * Math.cos(theta) * Math.sin(phi),
            rad * Math.sin(theta) * Math.sin(phi),
            rad * Math.cos(phi)
        );
        nucGroup.add(mesh);
    }
    group.add(nucGroup);

    // Kuantum Elektron Katmanları ve Yörüngeler
    const eGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const eMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.2,
    });
    const orbMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.45 });

    let remE = el.e;
    const shells = [2, 8, 8];
    let sIdx = 0;

    while (remE > 0 && sIdx < shells.length) {
        const count = Math.min(remE, shells[sIdx]);
        const sRad = 1.15 + sIdx * 0.75;

        for (let i = 0; i < count; i++) {
            const oGroup = new THREE.Group();
            const tilt = (i * Math.PI) / count + sIdx * 0.45;
            oGroup.rotation.x = Math.sin(tilt) * 0.85;
            oGroup.rotation.y = Math.cos(tilt) * 0.85;

            const pts: THREE.Vector3[] = [];
            for (let a = 0; a <= 64; a++) {
                const ang = (a / 64) * Math.PI * 2;
                pts.push(new THREE.Vector3(Math.cos(ang) * sRad, Math.sin(ang) * sRad, 0));
            }
            const oGeom = new THREE.BufferGeometry().setFromPoints(pts);
            oGroup.add(new THREE.Line(oGeom, orbMat));

            const eMesh = new THREE.Mesh(eGeom, eMat);
            const a = (i * (Math.PI * 2)) / count;
            eMesh.position.set(Math.cos(a) * sRad, Math.sin(a) * sRad, 0);
            oGroup.add(eMesh);

            group.add(oGroup);
        }
        remE -= count;
        sIdx++;
    }
}

// ── 3D ÇİFT SARMAL DNA ──────────────────────────────────────────────
function buildHelixDnaScene(group: THREE.Group, unzipT: number) {
    const pairs = 20;
    const rad = 0.9;
    const h = 4.0;
    const stepY = h / pairs;

    const baseCols = [
        { c1: 0xef4444, c2: 0xfacc15 }, // A-T
        { c1: 0x10b981, c2: 0x3b82f6 }, // G-C
        { c1: 0xfacc15, c2: 0xef4444 }, // T-A
        { c1: 0x3b82f6, c2: 0x10b981 }, // C-G
    ];

    const sGeom = new THREE.SphereGeometry(0.11, 16, 16);
    const strMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.25, metalness: 0.1 });

    for (let i = 0; i < pairs; i++) {
        const y = -h / 2 + i * stepY;
        const th = i * 0.45;
        const cur = baseCols[i % baseCols.length];

        const x1 = Math.cos(th) * rad - unzipT * 0.85;
        const z1 = Math.sin(th) * rad;
        const x2 = -Math.cos(th) * rad + unzipT * 0.85;
        const z2 = -Math.sin(th) * rad;

        const s1 = new THREE.Mesh(sGeom, strMat);
        s1.position.set(x1, y, z1);
        group.add(s1);

        const s2 = new THREE.Mesh(sGeom, strMat);
        s2.position.set(x2, y, z2);
        group.add(s2);

        if (unzipT < 0.8) {
            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;
            const cyl = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);

            const b1 = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({ color: cur.c1, roughness: 0.3 }));
            b1.position.set((x1 + midX) / 2, y, (z1 + midZ) / 2);
            b1.scale.set(1, Math.hypot(midX - x1, midZ - z1), 1);
            b1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(midX - x1, 0, midZ - z1).normalize());
            group.add(b1);

            const b2 = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({ color: cur.c2, roughness: 0.3 }));
            b2.position.set((midX + x2) / 2, y, (midZ + z2) / 2);
            b2.scale.set(1, Math.hypot(x2 - midX, z2 - midZ), 1);
            b2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x2 - midX, 0, z2 - midZ).normalize());
            group.add(b2);
        }
    }
}
