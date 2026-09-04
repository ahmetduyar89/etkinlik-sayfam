// src/components/tools/Interactive3DStationTool.tsx
// Akıllı tahta için Kusursuz 3D Fen & Matematik Deney İstasyonu.
// Gerçek dokunmatik/fare Orbit döndürme, fotogerçekçi materyaller, canlı açınım ve tahtaya yapıştırma özelliği.

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
    const [autoRotate, setAutoRotate] = React.useState(true);

    // ── 3D Katı Cisimler Parametreleri ──────────────────────────────
    const [solidShape, setSolidShape] = React.useState<number>(0); // 0:Küp, 1:Piramit, 2:Silindir, 3:Koni, 4:Dörtyüzlü
    const [foldPercent, setFoldPercent] = React.useState<number>(85); // 0: Tam açık 2D açınım, 100: Kapalı katı cisim
    const [wireframe, setWireframe] = React.useState<boolean>(false);

    // ── 3D Mevsimler Parametreleri ──────────────────────────────────
    const [seasonDate, setSeasonDate] = React.useState<number>(1); // 0: 21 Mart, 1: 21 Haziran, 2: 23 Eylül, 3: 21 Aralık

    // ── 3D Atom Parametreleri ───────────────────────────────────────
    const [elementIdx, setElementIdx] = React.useState<number>(3); // 0:H, 1:He, 2:Li, 3:C, 4:O, 5:Na

    // ── 3D DNA Parametreleri ────────────────────────────────────────
    const [dnaUnzip, setDnaUnzip] = React.useState<number>(0); // %0 - %100

    // ── Three.js Referansları ───────────────────────────────────────
    const sceneRef = React.useRef<THREE.Scene | null>(null);
    const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
    const mainGroupRef = React.useRef<THREE.Group | null>(null);
    const reqAnimRef = React.useRef<number | null>(null);

    // Etkileşim durumu (Orbit Controls mantığı)
    const isDraggingRef = React.useRef(false);
    const lastMouseRef = React.useRef({ x: 0, y: 0 });
    const sphericalRef = React.useRef({ radius: 4.8, theta: -0.6, phi: 1.1 });
    const targetSphericalRef = React.useRef({ radius: 4.8, theta: -0.6, phi: 1.1 });

    // ── Sahneyi Başlatma ve Yönetme ─────────────────────────────────
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
            renderer.toneMappingExposure = 1.2;
            rendererRef.current = renderer;
        } catch {
            return;
        }

        // Işıklar
        const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
        dirLight1.position.set(6, 10, 8);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.6);
        dirLight2.position.set(-6, -4, -6);
        scene.add(dirLight2);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);
        mainGroupRef.current = mainGroup;

        // Boyut güncelleme
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
                targetSphericalRef.current.theta += 0.4 * dt;
            }

            // Sönümlü yumuşak dönüş (damping)
            sphericalRef.current.theta += (targetSphericalRef.current.theta - sphericalRef.current.theta) * 0.12;
            sphericalRef.current.phi += (targetSphericalRef.current.phi - sphericalRef.current.phi) * 0.12;
            sphericalRef.current.radius += (targetSphericalRef.current.radius - sphericalRef.current.radius) * 0.12;

            // Küresel koordinatları kamera pozisyonuna dönüştür
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

    // ── Aktif Sahneyi Oluşturma ──────────────────────────────────────
    React.useEffect(() => {
        const group = mainGroupRef.current;
        if (!group) return;

        // Önceki sahneyi temizle
        while (group.children.length > 0) {
            const child = group.children[0];
            group.remove(child);
        }

        if (activeTab === 'solids') {
            buildSolidsScene(group, solidShape, foldPercent / 100, wireframe);
        } else if (activeTab === 'seasons') {
            buildSeasonsScene(group, seasonDate);
        } else if (activeTab === 'atom') {
            buildAtomScene(group, elementIdx);
        } else if (activeTab === 'dna') {
            buildDnaScene(group, dnaUnzip / 100);
        }
    }, [activeTab, solidShape, foldPercent, wireframe, seasonDate, elementIdx, dnaUnzip]);

    // ── Mouse & Touch Orbit Döndürme Etkileşimi ──────────────────────
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

        targetSphericalRef.current.theta -= dx * 0.008;
        targetSphericalRef.current.phi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, targetSphericalRef.current.phi - dy * 0.008)
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
            2.0,
            Math.min(9.0, targetSphericalRef.current.radius + e.deltaY * 0.005)
        );
    };

    const handleResetView = () => {
        targetSphericalRef.current = { radius: 4.8, theta: -0.6, phi: 1.1 };
    };

    // ── "📸 Tahtaya Yapıştır" Özelliği ───────────────────────────────
    const handleCaptureToCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !onInsertImage) return;
        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 440, 340);
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
                'fixed z-[5000] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 select-none text-white',
                isMaximized
                    ? 'inset-4 w-auto h-auto'
                    : 'w-[min(94vw,660px)] h-[560px] top-[10%] left-[calc(50%-330px)] max-h-[88vh]'
            )}
        >
            {/* Üst Başlık Çubuğu */}
            <div
                onPointerDown={(e) => !isMaximized && dragControls.start(e)}
                className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold tracking-wide text-indigo-200">
                        ✨ 3D Laboratuvar & Geometri İstasyonu
                    </span>
                </div>

                {/* Sekmeler */}
                <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-white/5">
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
                        label="Mevsimler"
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
                        title={isMaximized ? 'Küçült' : 'Tam Ekran Yap'}
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

            {/* Orta 3D Görsel Alanı */}
            <div className="relative flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] overflow-hidden">
                {activeTab === 'geogebra' ? (
                    <iframe
                        src="https://www.geogebra.org/3d?embed"
                        title="GeoGebra 3D Graphing Calculator"
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

                        {/* Canlı 3D Kontrol Çubuğu (Floating Tool Pill) */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-xl text-xs">
                            <button
                                type="button"
                                onClick={handleResetView}
                                className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition"
                                title="Açıyı Sıfırla"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Sıfırla</span>
                            </button>
                            <div className="w-[1px] h-3 bg-white/20" />
                            <button
                                type="button"
                                onClick={() => setAutoRotate(!autoRotate)}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-1 rounded-md transition',
                                    autoRotate ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-300 hover:text-white'
                                )}
                                title={autoRotate ? 'Dönüşü Durdur' : 'Otomatik Döndür'}
                            >
                                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                <span>{autoRotate ? 'Dönüyor' : 'Sabit'}</span>
                            </button>
                            {onInsertImage && (
                                <>
                                    <div className="w-[1px] h-3 bg-white/20" />
                                    <button
                                        type="button"
                                        onClick={handleCaptureToCanvas}
                                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 transition shadow-sm"
                                        title="Bu 3D görünümü tahta sayfasına yapıştır"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>📸 Tahtaya Aktar</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Sol Üst Bilgi Kartı */}
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg text-xs pointer-events-none">
                            {activeTab === 'solids' && (
                                <div>
                                    <p className="font-bold text-indigo-300">
                                        {['Küp', 'Kare Piramit', 'Silindir', 'Koni', 'Düzgün Dörtyüzlü'][solidShape]}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {foldPercent < 15
                                            ? '2D Açınım Düzlemi'
                                            : foldPercent > 95
                                            ? 'Tam 3D Katı Cisim'
                                            : `% ${foldPercent} Katlanma Derecesi`}
                                    </p>
                                </div>
                            )}
                            {activeTab === 'seasons' && (
                                <div>
                                    <p className="font-bold text-amber-300">
                                        {['21 Mart (İlkbahar)', '21 Haziran (Yaz Gündönümü)', '23 Eylül (Sonbahar)', '21 Aralık (Kış Gündönümü)'][seasonDate]}
                                    </p>
                                    <p className="text-[10px] text-slate-400">Eksen Eğikliği: 23.5° | Güneş Açısı</p>
                                </div>
                            )}
                            {activeTab === 'atom' && (
                                <div>
                                    <p className="font-bold text-cyan-300">
                                        {['Hidrojen (H)', 'Helyum (He)', 'Lityum (Li)', 'Karbon (C)', 'Oksijen (O)', 'Sodyum (Na)'][elementIdx]}
                                    </p>
                                    <p className="text-[10px] text-slate-400">3D Çekirdek & Kuantum Orbitalleri</p>
                                </div>
                            )}
                            {activeTab === 'dna' && (
                                <div>
                                    <p className="font-bold text-purple-300">3D Çift Sarmal DNA</p>
                                    <p className="text-[10px] text-slate-400">A-T, G-C Baz Eşleşmesi</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Alt Parametre Ayarları Barı */}
            {activeTab !== 'geogebra' && (
                <div className="px-4 py-3 bg-slate-800/90 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {activeTab === 'solids' && (
                        <>
                            <div className="flex items-center gap-1">
                                {['Küp', 'Piramit', 'Silindir', 'Koni', 'Dörtyüzlü'].map((name, idx) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setSolidShape(idx)}
                                        className={cn(
                                            'px-2.5 py-1 rounded-lg font-medium transition',
                                            solidShape === idx
                                                ? 'bg-indigo-600 text-white shadow'
                                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-xs">
                                <span className="text-slate-400 font-medium whitespace-nowrap">Aç / Katla:</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={foldPercent}
                                    onChange={(e) => setFoldPercent(Number(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                />
                                <span className="text-indigo-300 font-bold w-9 text-right">%{foldPercent}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setWireframe(!wireframe)}
                                className={cn(
                                    'px-2.5 py-1 rounded-lg font-medium transition border border-white/10',
                                    wireframe ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white'
                                )}
                            >
                                Tel Kafes
                            </button>
                        </>
                    )}

                    {activeTab === 'seasons' && (
                        <div className="flex items-center gap-2 w-full justify-between">
                            <span className="text-slate-400 font-medium">Tarih Seç:</span>
                            <div className="flex items-center gap-1.5">
                                {[
                                    { id: 0, label: '🌸 21 Mart (Ekinoks)' },
                                    { id: 1, label: '☀️ 21 Haziran (Yaz)' },
                                    { id: 2, label: '🍂 23 Eylül (Ekinoks)' },
                                    { id: 3, label: '❄️ 21 Aralık (Kış)' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSeasonDate(item.id)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg font-medium transition',
                                            seasonDate === item.id
                                                ? 'bg-amber-600 text-white shadow'
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
                            <span className="text-slate-400 font-medium">Element Seç:</span>
                            <div className="flex items-center gap-1">
                                {['1: H', '2: He', '3: Li', '6: C', '8: O', '11: Na'].map((name, idx) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setElementIdx(idx)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg font-medium transition',
                                            elementIdx === idx
                                                ? 'bg-cyan-600 text-white shadow'
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
                            <span className="text-slate-400 font-medium">Sarmalı Aç / Eşle:</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={dnaUnzip}
                                onChange={(e) => setDnaUnzip(Number(e.target.value))}
                                className="w-72 accent-purple-500 cursor-pointer"
                            />
                            <span className="text-purple-300 font-bold">%{dnaUnzip}</span>
                        </div>
                    )}
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
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition',
                active ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

// ── 3D Katı Cisimler Oluşturucu (PBR ve Açınım) ─────────────────────
function buildSolidsScene(group: THREE.Group, shape: number, foldT: number, wireframe: boolean) {
    const angle = (foldT * Math.PI) / 2;
    const s = 1.2;
    const half = s / 2;

    const makeMat = (color: number, opacity = 0.92) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness: 0.25,
            metalness: 0.15,
            side: THREE.DoubleSide,
            transparent: true,
            opacity,
            wireframe,
        });

    const makeEdge = (geom: THREE.BufferGeometry) =>
        new THREE.LineSegments(
            new THREE.EdgesGeometry(geom),
            new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 })
        );

    if (shape === 0) {
        // KÜP AÇINIMI
        const planeGeom = new THREE.PlaneGeometry(s, s);
        const makeFace = (color: number) => {
            const m = new THREE.Mesh(planeGeom, makeMat(color));
            if (!wireframe) m.add(makeEdge(planeGeom));
            return m;
        };

        // Taban (Merkez)
        const base = makeFace(0x4f46e5);
        base.rotation.x = -Math.PI / 2;
        group.add(base);

        // Ön
        const fP = new THREE.Group();
        fP.position.set(0, -half, 0);
        const fM = makeFace(0xec4899);
        fM.position.set(0, -half, 0);
        fP.add(fM);
        fP.rotation.x = -angle;
        base.add(fP);

        // Arka
        const bP = new THREE.Group();
        bP.position.set(0, half, 0);
        const bM = makeFace(0x8b5cf6);
        bM.position.set(0, half, 0);
        bP.add(bM);
        bP.rotation.x = angle;
        base.add(bP);

        // Sol
        const lP = new THREE.Group();
        lP.position.set(-half, 0, 0);
        const lM = makeFace(0x14b8a6);
        lM.position.set(-half, 0, 0);
        lP.add(lM);
        lP.rotation.y = -angle;
        base.add(lP);

        // Sağ
        const rP = new THREE.Group();
        rP.position.set(half, 0, 0);
        const rM = makeFace(0xf59e0b);
        rM.position.set(half, 0, 0);
        rP.add(rM);
        rP.rotation.y = angle;
        base.add(rP);

        // Üst Kapak
        const tP = new THREE.Group();
        tP.position.set(-s, 0, 0);
        const tM = makeFace(0x06b6d4);
        tM.position.set(-half, 0, 0);
        tP.add(tM);
        tP.rotation.y = angle;
        rM.add(tP);
    } else if (shape === 1) {
        // KARE PİRAMİT
        const baseGeom = new THREE.PlaneGeometry(s, s);
        const base = new THREE.Mesh(baseGeom, makeMat(0x3b82f6));
        base.rotation.x = -Math.PI / 2;
        if (!wireframe) base.add(makeEdge(baseGeom));
        group.add(base);

        const h = 1.15;
        const triGeom = new THREE.BufferGeometry();
        const verts = new Float32Array([-half, 0, 0, half, 0, 0, 0, h, 0]);
        triGeom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        triGeom.computeVertexNormals();

        const triAngle = foldT * 1.12;
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
            if (!wireframe) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(triGeom), new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 })));
            p.add(m);
            base.add(p);
        }
    } else if (shape === 2) {
        // SİLİNDİR
        const r = 0.65;
        const h = 1.4;
        const geom = new THREE.CylinderGeometry(r, r, h, 36);
        const mesh = new THREE.Mesh(geom, makeMat(0x06b6d4));
        if (!wireframe) mesh.add(makeEdge(geom));
        group.add(mesh);
    } else if (shape === 3) {
        // KONİ
        const r = 0.8;
        const h = 1.6;
        const geom = new THREE.ConeGeometry(r, h, 36);
        const mesh = new THREE.Mesh(geom, makeMat(0xf97316));
        if (!wireframe) mesh.add(makeEdge(geom));
        group.add(mesh);
    } else {
        // DÖRTYÜZLÜ (Tetrahedron)
        const geom = new THREE.TetrahedronGeometry(1.2);
        const mesh = new THREE.Mesh(geom, makeMat(0xa855f7));
        if (!wireframe) mesh.add(makeEdge(geom));
        group.add(mesh);
    }
}

// ── 3D Mevsimler Sahnesi Oluşturucu ─────────────────────────────────
function buildSeasonsScene(group: THREE.Group, seasonDate: number) {
    // 23.5° Eksen Eğikliğinde dönen Dünya
    const tiltRadian = (23.5 * Math.PI) / 180;
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = tiltRadian;

    const r = 1.15;
    const sphereGeom = new THREE.SphereGeometry(r, 48, 48);

    // Okyanus ve Kıta Materyali (Zengin PBR mavi/yeşil derinlik)
    const earthMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.4,
        metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(sphereGeom, earthMat);

    // Kıta çizgileri ve ızgara
    const gridMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(r * 1.002, 24, 24)),
        gridMat
    );
    earthMesh.add(wire);

    // Ekvator (Kırmızı)
    const eqGeom = new THREE.BufferGeometry();
    const eqPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        eqPts.push(Math.cos(th) * (r * 1.015), 0, Math.sin(th) * (r * 1.015));
    }
    eqGeom.setAttribute('position', new THREE.Float32BufferAttribute(eqPts, 3));
    earthMesh.add(new THREE.Line(eqGeom, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })));

    // Yengeç Dönencesi (Sarı)
    const yLat = (23.5 * Math.PI) / 180;
    const yR = Math.cos(yLat) * (r * 1.015);
    const yY = Math.sin(yLat) * (r * 1.015);
    const yGeom = new THREE.BufferGeometry();
    const yPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        yPts.push(Math.cos(th) * yR, yY, Math.sin(th) * yR);
    }
    yGeom.setAttribute('position', new THREE.Float32BufferAttribute(yPts, 3));
    earthMesh.add(new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 1.5 })));

    // Oğlak Dönencesi (Turuncu)
    const oGeom = new THREE.BufferGeometry();
    const oPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        oPts.push(Math.cos(th) * yR, -yY, Math.sin(th) * yR);
    }
    oGeom.setAttribute('position', new THREE.Float32BufferAttribute(oPts, 3));
    earthMesh.add(new THREE.Line(oGeom, new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 1.5 })));

    // Eksen Çubuğu
    const axisGeom = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 16);
    earthMesh.add(new THREE.Mesh(axisGeom, new THREE.MeshBasicMaterial({ color: 0xffffff })));

    earthGroup.add(earthMesh);
    group.add(earthGroup);

    // Güneş Işınları Huzmesi (Sağdan gelen oklar)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(3.2, 0, 0);

    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    for (let dy = -0.8; dy <= 0.8; dy += 0.4) {
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, dy, 0),
            1.6,
            0xfde047,
            0.2,
            0.15
        );
        sunGroup.add(arrow);
    }
    group.add(sunGroup);
}

// ── 3D Atom Sahnesi Oluşturucu ──────────────────────────────────────
function buildAtomScene(group: THREE.Group, elemIdx: number) {
    const ELEMS = [
        { p: 1, n: 0, e: 1 },
        { p: 2, n: 2, e: 2 },
        { p: 3, n: 4, e: 3 },
        { p: 6, n: 6, e: 6 },
        { p: 8, n: 8, e: 8 },
        { p: 11, n: 12, e: 11 },
    ];
    const el = ELEMS[elemIdx] ?? ELEMS[3];

    // Çekirdek
    const nucGroup = new THREE.Group();
    const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const nMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    const pGeom = new THREE.SphereGeometry(0.14, 16, 16);

    const total = el.p + el.n;
    for (let i = 0; i < total; i++) {
        const isP = i < el.p;
        const mesh = new THREE.Mesh(pGeom, isP ? pMat : nMat);
        const phi = Math.acos(-1 + (2 * i) / Math.max(1, total));
        const theta = Math.sqrt(total * Math.PI) * phi;
        const rad = 0.3 * Math.pow(total / 8, 0.33);
        mesh.position.set(
            rad * Math.cos(theta) * Math.sin(phi),
            rad * Math.sin(theta) * Math.sin(phi),
            rad * Math.cos(phi)
        );
        nucGroup.add(mesh);
    }
    group.add(nucGroup);

    // Yörüngeler ve Elektronlar
    const eGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const orbMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.5 });

    let remE = el.e;
    const shells = [2, 8, 8];
    let sIdx = 0;

    while (remE > 0 && sIdx < shells.length) {
        const count = Math.min(remE, shells[sIdx]);
        const sRad = 1.1 + sIdx * 0.7;

        for (let i = 0; i < count; i++) {
            const oGroup = new THREE.Group();
            const tilt = (i * Math.PI) / count + sIdx * 0.4;
            oGroup.rotation.x = Math.sin(tilt) * 0.9;
            oGroup.rotation.y = Math.cos(tilt) * 0.9;

            const pts: THREE.Vector3[] = [];
            for (let a = 0; a <= 48; a++) {
                const ang = (a / 48) * Math.PI * 2;
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

// ── 3D DNA Sahnesi Oluşturucu ────────────────────────────────────────
function buildDnaScene(group: THREE.Group, unzipT: number) {
    const pairs = 18;
    const rad = 0.85;
    const h = 3.6;
    const stepY = h / pairs;

    const baseCols = [
        { c1: 0xef4444, c2: 0xfacc15 }, // A-T
        { c1: 0x10b981, c2: 0x3b82f6 }, // G-C
        { c1: 0xfacc15, c2: 0xef4444 }, // T-A
        { c1: 0x3b82f6, c2: 0x10b981 }, // C-G
    ];

    const sGeom = new THREE.SphereGeometry(0.09, 14, 14);
    const strMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });

    for (let i = 0; i < pairs; i++) {
        const y = -h / 2 + i * stepY;
        const th = i * 0.45;
        const cur = baseCols[i % baseCols.length];

        const x1 = Math.cos(th) * rad - unzipT * 0.8;
        const z1 = Math.sin(th) * rad;
        const x2 = -Math.cos(th) * rad + unzipT * 0.8;
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
            const cyl = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);

            const b1 = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({ color: cur.c1 }));
            b1.position.set((x1 + midX) / 2, y, (z1 + midZ) / 2);
            b1.scale.set(1, Math.hypot(midX - x1, midZ - z1), 1);
            b1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(midX - x1, 0, midZ - z1).normalize());
            group.add(b1);

            const b2 = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({ color: cur.c2 }));
            b2.position.set((midX + x2) / 2, y, (midZ + z2) / 2);
            b2.scale.set(1, Math.hypot(x2 - midX, z2 - midZ), 1);
            b2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x2 - midX, 0, z2 - midZ).normalize());
            group.add(b2);
        }
    }
}
