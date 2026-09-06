// src/components/tools/MoleculeBuilderTool.tsx
// Akıllı tahta ve öğrenci kullanımı için Profesyonel Etkileşimli Molekül İnşa Laboratuvarı (PhET Standardı).
// Manyetik bağ kenetlenmesi, Three.js 3D molekül motoru, görev koleksiyonları ve tahtaya damgalama.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Maximize2,
    Minimize2,
    RotateCcw,
    Camera,
    Sparkles,
    CheckCircle2,
    Trash2,
    Box,
    Trophy,
    ArrowRight,
    Volume2,
    VolumeX,
    Atom,
    Plus,
    Flame,
} from 'lucide-react';
import * as THREE from 'three';
import { cn } from '../../utils/cn';

export interface MoleculeBuilderToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

// ── Atom Kimyasal Tanımları (CPK Standartları) ─────────────────────────────
export interface AtomTypeInfo {
    symbol: string;
    name: string;
    color: string;
    textColor: string;
    radius2D: number; // 2D çizim piksel yarıçapı
    vdwRadius3D: number; // 3D Uzay dolgulu yarıçapı
    covalentRadius3D: number; // 3D Top-çubuk yarıçapı
    valency: number; // Maksimum kovalent bağ kapasitesi
    description: string;
}

export const ATOM_TYPES: Record<string, AtomTypeInfo> = {
    H: {
        symbol: 'H',
        name: 'Hidrojen',
        color: '#f8fafc',
        textColor: '#0f172a',
        radius2D: 22,
        vdwRadius3D: 0.38,
        covalentRadius3D: 0.26,
        valency: 1,
        description: '1 Değerlik Elektronu (1 Kovalent Bağ)',
    },
    O: {
        symbol: 'O',
        name: 'Oksijen',
        color: '#ef4444',
        textColor: '#ffffff',
        radius2D: 28,
        vdwRadius3D: 0.62,
        covalentRadius3D: 0.42,
        valency: 2,
        description: '2 Kovalent Bağ (Tekli veya İkili)',
    },
    N: {
        symbol: 'N',
        name: 'Azot',
        color: '#3b82f6',
        textColor: '#ffffff',
        radius2D: 28,
        vdwRadius3D: 0.64,
        covalentRadius3D: 0.44,
        valency: 3,
        description: '3 Kovalent Bağ (Tekli, İkili veya Üçlü)',
    },
    C: {
        symbol: 'C',
        name: 'Karbon',
        color: '#334155',
        textColor: '#ffffff',
        radius2D: 29,
        vdwRadius3D: 0.68,
        covalentRadius3D: 0.46,
        valency: 4,
        description: '4 Kovalent Bağ (Organik kimyanın temeli)',
    },
    Cl: {
        symbol: 'Cl',
        name: 'Klor',
        color: '#10b981',
        textColor: '#ffffff',
        radius2D: 30,
        vdwRadius3D: 0.72,
        covalentRadius3D: 0.48,
        valency: 1,
        description: '1 Kovalent Bağ (Halojen)',
    },
    S: {
        symbol: 'S',
        name: 'Kükürt',
        color: '#eab308',
        textColor: '#000000',
        radius2D: 30,
        vdwRadius3D: 0.74,
        covalentRadius3D: 0.5,
        valency: 2,
        description: '2 Kovalent Bağ',
    },
    P: {
        symbol: 'P',
        name: 'Fosfor',
        color: '#f97316',
        textColor: '#ffffff',
        radius2D: 29,
        vdwRadius3D: 0.73,
        covalentRadius3D: 0.49,
        valency: 3,
        description: '3 Kovalent Bağ',
    },
};

// ── Çalışma Alanı Veri Yapıları ───────────────────────────────────────────
export interface ActiveAtom {
    id: string;
    symbol: string;
    x: number;
    y: number;
}

export interface ActiveBond {
    id: string;
    atom1Id: string;
    atom2Id: string;
    order: 1 | 2 | 3;
}

// ── Bilinen Molekül Kütüphanesi ───────────────────────────────────────────
export interface KnownMolecule {
    id: string;
    name: string;
    formula: string;
    composition: Record<string, number>;
    description: string;
    category: 'temel' | 'gaz' | 'asit' | 'organik';
}

export const KNOWN_MOLECULES: KnownMolecule[] = [
    {
        id: 'H2O',
        name: 'Su',
        formula: 'H₂O',
        composition: { H: 2, O: 1 },
        description: 'Canlılığın temeli olan polar kovalent bağlı molekül.',
        category: 'temel',
    },
    {
        id: 'O2',
        name: 'Oksijen Gazı',
        formula: 'O₂',
        composition: { O: 2 },
        description: 'Solunum için hayati gaz; atomlar arasında ikili kovalent bağ (O=O) bulunur.',
        category: 'gaz',
    },
    {
        id: 'H2',
        name: 'Hidrojen Gazı',
        formula: 'H₂',
        composition: { H: 2 },
        description: 'Evrende en çok bulunan en hafif element molekülü (H-H).',
        category: 'gaz',
    },
    {
        id: 'CO2',
        name: 'Karbondioksit',
        formula: 'CO₂',
        composition: { C: 1, O: 2 },
        description: 'Fotosentez hammaddesi, doğrusal apolar molekül (O=C=O).',
        category: 'temel',
    },
    {
        id: 'N2',
        name: 'Azot Gazı',
        formula: 'N₂',
        composition: { N: 2 },
        description: 'Atmosferin %78’i; atomları arasında çok güçlü üçlü bağ (N≡N) vardır.',
        category: 'gaz',
    },
    {
        id: 'CH4',
        name: 'Metan',
        formula: 'CH₄',
        composition: { C: 1, H: 4 },
        description: 'Doğal gazın ana bileşeni olan en basit hidrokarbon.',
        category: 'organik',
    },
    {
        id: 'NH3',
        name: 'Amonyak',
        formula: 'NH₃',
        composition: { N: 1, H: 3 },
        description: 'Gübre sanayinde kullanılan bazik gaz; üçgen piramit geometridedir.',
        category: 'temel',
    },
    {
        id: 'HCl',
        name: 'Hidroklorik Asit (Tuz Ruhu)',
        formula: 'HCl',
        composition: { H: 1, Cl: 1 },
        description: 'Mide asidinde bulunan kuvvetli asit (H-Cl).',
        category: 'asit',
    },
    {
        id: 'Cl2',
        name: 'Klor Gazı',
        formula: 'Cl₂',
        composition: { Cl: 2 },
        description: 'Dezenfektan ve su arıtımında kullanılan zehirli halojen molekülü.',
        category: 'gaz',
    },
    {
        id: 'CO',
        name: 'Karbonmonoksit',
        formula: 'CO',
        composition: { C: 1, O: 1 },
        description: 'Eksik yanma ürünü, kokusuz zehirli soba gazı.',
        category: 'gaz',
    },
    {
        id: 'H2O2',
        name: 'Hidrojen Peroksit (Oksijenli Su)',
        formula: 'H₂O₂',
        composition: { H: 2, O: 2 },
        description: 'Antiseptik ve ağartıcı olarak kullanılan peroksit.',
        category: 'temel',
    },
    {
        id: 'C2H6',
        name: 'Etan',
        formula: 'C₂H₆',
        composition: { C: 2, H: 6 },
        description: 'Doğal gazda bulunan iki karbonlu alkan.',
        category: 'organik',
    },
    {
        id: 'C2H4',
        name: 'Etilen',
        formula: 'C₂H₄',
        composition: { C: 2, H: 4 },
        description: 'Meyvelerin olgunlaşmasını sağlayan ikili bağlı alken (CH₂=CH₂).',
        category: 'organik',
    },
    {
        id: 'CH3OH',
        name: 'Metanol',
        formula: 'CH₃OH',
        composition: { C: 1, H: 4, O: 1 },
        description: 'Odun ruhu olarak da bilinen en basit alkol.',
        category: 'organik',
    },
    {
        id: 'C2H5OH',
        name: 'Etanol',
        formula: 'C₂H₅OH',
        composition: { C: 2, H: 6, O: 1 },
        description: 'Dezenfektan ve kolonyalarda kullanılan etil alkol.',
        category: 'organik',
    },
    {
        id: 'SO2',
        name: 'Kükürt Dioksit',
        formula: 'SO₂',
        composition: { S: 1, O: 2 },
        description: 'Asit yağmurlarına sebep olan volkanik gaz.',
        category: 'gaz',
    },
    {
        id: 'H2S',
        name: 'Hidrojen Sülfür',
        formula: 'H₂S',
        composition: { H: 2, S: 1 },
        description: 'Çürük yumurta kokulu zehirli kükürtlü gaz.',
        category: 'gaz',
    },
];

// ── Koleksiyon / Görev Seviyeleri (PhET Tarzı) ───────────────────────────
export interface CollectionTarget {
    moleculeId: string;
    requiredCount: number;
}

export interface CollectionLevel {
    id: number;
    title: string;
    subtitle: string;
    targets: CollectionTarget[];
    bucketInventory: Record<string, number>;
}

export const COLLECTIONS: CollectionLevel[] = [
    {
        id: 1,
        title: 'Koleksiyon 1: Yaşamın Molekülleri',
        subtitle: 'Su, Oksijen, Hidrojen, Karbondioksit ve Azot gazını inşa edin',
        targets: [
            { moleculeId: 'H2O', requiredCount: 1 },
            { moleculeId: 'O2', requiredCount: 1 },
            { moleculeId: 'H2', requiredCount: 1 },
            { moleculeId: 'CO2', requiredCount: 1 },
            { moleculeId: 'N2', requiredCount: 1 },
        ],
        bucketInventory: { H: 6, O: 5, C: 2, N: 2 },
    },
    {
        id: 2,
        title: 'Koleksiyon 2: Çoklu Moleküller',
        subtitle: 'Katsayılar ve birden fazla molekül üretme',
        targets: [
            { moleculeId: 'CO2', requiredCount: 2 },
            { moleculeId: 'O2', requiredCount: 2 },
            { moleculeId: 'H2O', requiredCount: 2 },
        ],
        bucketInventory: { C: 3, O: 8, H: 6 },
    },
    {
        id: 3,
        title: 'Koleksiyon 3: Asitler & Gazlar',
        subtitle: 'Metan, Amonyak, Tuz Ruhu ve Klor gazı',
        targets: [
            { moleculeId: 'CH4', requiredCount: 1 },
            { moleculeId: 'NH3', requiredCount: 1 },
            { moleculeId: 'HCl', requiredCount: 1 },
            { moleculeId: 'Cl2', requiredCount: 1 },
            { moleculeId: 'CO', requiredCount: 1 },
        ],
        bucketInventory: { C: 2, H: 8, N: 1, Cl: 3, O: 1 },
    },
    {
        id: 4,
        title: 'Koleksiyon 4: Organik Bileşikler',
        subtitle: 'Etan, Etilen ve Metanol moleküllerini oluşturun',
        targets: [
            { moleculeId: 'C2H6', requiredCount: 1 },
            { moleculeId: 'C2H4', requiredCount: 1 },
            { moleculeId: 'CH3OH', requiredCount: 1 },
        ],
        bucketInventory: { C: 5, H: 14, O: 2 },
    },
];

// ── Web Audio API ile Saf Sentetik Ses Efektleri ─────────────────────────
function playTone(type: 'snap' | 'break' | 'collect' | 'fanfare') {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'snap') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'break') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.09);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.09);
        } else if (type === 'collect') {
            [523.25, 659.25, 783.99].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.06);
                osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
            });
        } else if (type === 'fanfare') {
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
                gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.1);
                osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
            });
        }
    } catch {
        // Ses desteği yoksa sessizce devam et
    }
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────
export function MoleculeBuilderTool({ onClose, onInsertImage }: MoleculeBuilderToolProps) {
    const dragControls = useDragControls();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasHiddenRef = React.useRef<HTMLCanvasElement>(null);
    const svgAreaRef = React.useRef<SVGSVGElement>(null);

    // Mod: 'game' (Koleksiyon / Görev Modu) | 'sandbox' (Serbest Keşif)
    const [mode, setMode] = React.useState<'game' | 'sandbox'>('game');
    const [currentLevelIdx, setCurrentLevelIdx] = React.useState<number>(0);
    const [isMaximized, setIsMaximized] = React.useState<boolean>(false);
    const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);

    // Koleksiyon Tamamlama Durumu { moleculeId: count }
    const [collectedMolecules, setCollectedMolecules] = React.useState<Record<string, number>>({});
    const [levelSuccess, setLevelSuccess] = React.useState<boolean>(false);

    // Kova / Envanter Sayıları { symbol: count }
    const currentLevel = COLLECTIONS[currentLevelIdx];
    const [bucketCounts, setBucketCounts] = React.useState<Record<string, number>>({ ...currentLevel.bucketInventory });

    // Çalışma Alanındaki Atomlar ve Bağlar
    const [placedAtoms, setPlacedAtoms] = React.useState<ActiveAtom[]>([]);
    const [placedBonds, setPlacedBonds] = React.useState<ActiveBond[]>([]);

    // Sürükleme durumu
    const [draggingAtomId, setDraggingAtomId] = React.useState<string | null>(null);
    const dragOffsetRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const groupOffsetsRef = React.useRef<Map<string, { dx: number; dy: number }>>(new Map());

    // 3D İnceleme Modalı
    const [active3DMolecule, setActive3DMolecule] = React.useState<KnownMolecule | null>(null);
    const [viewMode3D, setViewMode3D] = React.useState<'ball_stick' | 'space_fill'>('ball_stick');

    // Ses çalma yardımcısı
    const triggerSound = (type: 'snap' | 'break' | 'collect' | 'fanfare') => {
        if (soundEnabled) playTone(type);
    };

    // Seviye veya mod değiştiğinde envanteri ve alanı sıfırla
    React.useEffect(() => {
        if (mode === 'game') {
            setBucketCounts({ ...COLLECTIONS[currentLevelIdx].bucketInventory });
            setCollectedMolecules({});
            setLevelSuccess(false);
            setPlacedAtoms([]);
            setPlacedBonds([]);
        } else {
            // Sandbox modu: bol atom
            setBucketCounts({ H: 12, O: 8, C: 6, N: 6, Cl: 4, S: 4, P: 4 });
            setPlacedAtoms([]);
            setPlacedBonds([]);
        }
    }, [mode, currentLevelIdx]);

    // ── Molekül Algılama & Bağlantılı Bileşenler Grafiği ───────────────────
    interface DetectedGroup {
        atomIds: string[];
        composition: Record<string, number>;
        matchedMolecule: KnownMolecule | null;
        centerX: number;
        centerY: number;
    }

    const detectedGroups: DetectedGroup[] = React.useMemo(() => {
        if (placedAtoms.length === 0) return [];

        const visited = new Set<string>();
        const adj = new Map<string, string[]>();
        placedAtoms.forEach((a) => adj.set(a.id, []));
        placedBonds.forEach((b) => {
            adj.get(b.atom1Id)?.push(b.atom2Id);
            adj.get(b.atom2Id)?.push(b.atom1Id);
        });

        const groups: DetectedGroup[] = [];

        placedAtoms.forEach((startAtom) => {
            if (visited.has(startAtom.id)) return;

            const currentGroupIds: string[] = [];
            const queue = [startAtom.id];
            visited.add(startAtom.id);

            while (queue.length > 0) {
                const cur = queue.shift()!;
                currentGroupIds.push(cur);
                const neighbors = adj.get(cur) || [];
                neighbors.forEach((nbr) => {
                    if (!visited.has(nbr)) {
                        visited.add(nbr);
                        queue.push(nbr);
                    }
                });
            }

            // Atom kompozisyonunu say
            const comp: Record<string, number> = {};
            let sumX = 0;
            let sumY = 0;
            currentGroupIds.forEach((id) => {
                const atom = placedAtoms.find((a) => a.id === id);
                if (atom) {
                    comp[atom.symbol] = (comp[atom.symbol] || 0) + 1;
                    sumX += atom.x;
                    sumY += atom.y;
                }
            });

            // Bilinen bir molekülle eşleşiyor mu?
            let matched: KnownMolecule | null = null;
            if (currentGroupIds.length >= 2) {
                for (const km of KNOWN_MOLECULES) {
                    const keysKm = Object.keys(km.composition);
                    const keysCur = Object.keys(comp);
                    if (keysKm.length === keysCur.length) {
                        const allMatch = keysKm.every((k) => km.composition[k] === comp[k]);
                        if (allMatch) {
                            matched = km;
                            break;
                        }
                    }
                }
            }

            groups.push({
                atomIds: currentGroupIds,
                composition: comp,
                matchedMolecule: matched,
                centerX: sumX / currentGroupIds.length,
                centerY: sumY / currentGroupIds.length,
            });
        });

        return groups;
    }, [placedAtoms, placedBonds]);

    // ── Kovadan Tezgaha Atom Ekleme ───────────────────────────────────────
    const handleAddAtomFromBucket = (symbol: string) => {
        const count = bucketCounts[symbol] || 0;
        if (count <= 0) return;

        const svgRect = svgAreaRef.current?.getBoundingClientRect();
        const baseW = svgRect ? svgRect.width : 500;
        const baseH = svgRect ? svgRect.height : 320;

        const newAtom: ActiveAtom = {
            id: `atom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            symbol,
            x: baseW / 2 + (Math.random() * 120 - 60),
            y: baseH / 2 + (Math.random() * 80 - 40),
        };

        setBucketCounts((prev) => ({ ...prev, [symbol]: prev[symbol] - 1 }));
        setPlacedAtoms((prev) => [...prev, newAtom]);
        triggerSound('snap');
    };

    // ── Tüm Tezgâhı Kovaya Sıfırlama ──────────────────────────────────────
    const handleResetWorkspace = () => {
        placedAtoms.forEach((a) => {
            setBucketCounts((prev) => ({ ...prev, [a.symbol]: (prev[a.symbol] || 0) + 1 }));
        });
        setPlacedAtoms([]);
        setPlacedBonds([]);
        triggerSound('break');
    };

    // ── Bağ Koparma (Makas) ───────────────────────────────────────────────
    const handleBreakBond = (bondId: string) => {
        setPlacedBonds((prev) => prev.filter((b) => b.id !== bondId));
        triggerSound('break');
    };

    // ── Pointer / Dokunmatik Sürükleme Mantığı ─────────────────────────────
    const handlePointerDownAtom = (e: React.PointerEvent, atomId: string) => {
        e.stopPropagation();
        const atom = placedAtoms.find((a) => a.id === atomId);
        if (!atom || !svgAreaRef.current) return;

        const svgRect = svgAreaRef.current.getBoundingClientRect();
        const pointerX = e.clientX - svgRect.left;
        const pointerY = e.clientY - svgRect.top;

        dragOffsetRef.current = { x: pointerX - atom.x, y: pointerY - atom.y };
        setDraggingAtomId(atomId);

        // Bu atom bir moleküle bağlıysa, moleküldeki tüm atomların göreceli konumlarını kaydet
        const group = detectedGroups.find((g) => g.atomIds.includes(atomId));
        const offsetMap = new Map<string, { dx: number; dy: number }>();
        if (group) {
            group.atomIds.forEach((id) => {
                const other = placedAtoms.find((a) => a.id === id);
                if (other) {
                    offsetMap.set(id, { dx: other.x - atom.x, dy: other.y - atom.y });
                }
            });
        } else {
            offsetMap.set(atomId, { dx: 0, dy: 0 });
        }
        groupOffsetsRef.current = offsetMap;

        (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingAtomId || !svgAreaRef.current) return;

        const svgRect = svgAreaRef.current.getBoundingClientRect();
        const pointerX = e.clientX - svgRect.left;
        const pointerY = e.clientY - svgRect.top;

        const leaderNewX = Math.max(25, Math.min(svgRect.width - 25, pointerX - dragOffsetRef.current.x));
        const leaderNewY = Math.max(25, Math.min(svgRect.height - 25, pointerY - dragOffsetRef.current.y));

        setPlacedAtoms((prev) =>
            prev.map((a) => {
                const offset = groupOffsetsRef.current.get(a.id);
                if (offset !== undefined) {
                    return {
                        ...a,
                        x: Math.max(25, Math.min(svgRect.width - 25, leaderNewX + offset.dx)),
                        y: Math.max(25, Math.min(svgRect.height - 25, leaderNewY + offset.dy)),
                    };
                }
                return a;
            })
        );
    };

    // Atom bırakıldığında: Manyetik Kenetlenme (Snap-to-Bond) Kontrolü
    const handlePointerUp = () => {
        if (!draggingAtomId) return;

        const movingAtom = placedAtoms.find((a) => a.id === draggingAtomId);
        if (movingAtom) {
            const SNAP_THRESHOLD = 65;
            const BOND_DISTANCE = 54;

            for (const other of placedAtoms) {
                if (other.id === movingAtom.id) continue;

                const existingBond = placedBonds.find(
                    (b) =>
                        (b.atom1Id === movingAtom.id && b.atom2Id === other.id) ||
                        (b.atom1Id === other.id && b.atom2Id === movingAtom.id)
                );

                const dx = other.x - movingAtom.x;
                const dy = other.y - movingAtom.y;
                const dist = Math.hypot(dx, dy);

                if (dist < SNAP_THRESHOLD) {
                    const movingVal = ATOM_TYPES[movingAtom.symbol].valency;
                    const otherVal = ATOM_TYPES[other.symbol].valency;

                    const movingUsedBonds = placedBonds.reduce(
                        (sum, b) => (b.atom1Id === movingAtom.id || b.atom2Id === movingAtom.id ? sum + b.order : sum),
                        0
                    );
                    const otherUsedBonds = placedBonds.reduce(
                        (sum, b) => (b.atom1Id === other.id || b.atom2Id === other.id ? sum + b.order : sum),
                        0
                    );

                    if (!existingBond) {
                        if (movingUsedBonds < movingVal && otherUsedBonds < otherVal) {
                            const angle = Math.atan2(dy, dx);
                            const snapX = other.x - Math.cos(angle) * BOND_DISTANCE;
                            const snapY = other.y - Math.sin(angle) * BOND_DISTANCE;

                            setPlacedAtoms((prev) =>
                                prev.map((a) => (a.id === movingAtom.id ? { ...a, x: snapX, y: snapY } : a))
                            );

                            const newBond: ActiveBond = {
                                id: `bond_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                atom1Id: movingAtom.id,
                                atom2Id: other.id,
                                order: 1,
                            };

                            setPlacedBonds((prev) => [...prev, newBond]);
                            triggerSound('snap');
                            break;
                        }
                    } else {
                        if (existingBond.order < 3 && movingUsedBonds < movingVal && otherUsedBonds < otherVal) {
                            setPlacedBonds((prev) =>
                                prev.map((b) =>
                                    b.id === existingBond.id
                                        ? { ...b, order: (b.order + 1) as 1 | 2 | 3 }
                                        : b
                                )
                            );
                            triggerSound('snap');
                            break;
                        }
                    }
                }
            }
        }

        setDraggingAtomId(null);
        groupOffsetsRef.current.clear();
    };

    // ── Molekülü Koleksiyona / Hedefe Ekleme ──────────────────────────────
    const handleCollectGroup = (group: DetectedGroup) => {
        if (!group.matchedMolecule) return;

        const target = currentLevel.targets.find((t) => t.moleculeId === group.matchedMolecule?.id);
        if (!target) return;

        const curCount = collectedMolecules[group.matchedMolecule.id] || 0;
        if (curCount >= target.requiredCount) return;

        setPlacedAtoms((prev) => prev.filter((a) => !group.atomIds.includes(a.id)));
        setPlacedBonds((prev) =>
            prev.filter((b) => !group.atomIds.includes(b.atom1Id) && !group.atomIds.includes(b.atom2Id))
        );

        const newCollected = {
            ...collectedMolecules,
            [group.matchedMolecule.id]: curCount + 1,
        };
        setCollectedMolecules(newCollected);
        triggerSound('collect');

        const allDone = currentLevel.targets.every(
            (t) => (newCollected[t.moleculeId] || 0) >= t.requiredCount
        );

        if (allDone) {
            setLevelSuccess(true);
            triggerSound('fanfare');
        }
    };

    // ── Tahtaya / Deftere Damgalama (Canvas Çizimi) ─────────────────────────
    const handleInsertToCanvas = (molecule: KnownMolecule) => {
        const canvas = canvasHiddenRef.current;
        if (!canvas || !onInsertImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = 620;
        const h = 420;
        canvas.width = w;
        canvas.height = h;

        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, w - 8, h - 8);

        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('FEN BİLİMLERİ · MOLEKÜL İNŞA KARTI', 32, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`${molecule.name} (${molecule.formula})`, 32, 85);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px sans-serif';
        ctx.fillText(molecule.description, 32, 115);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(32, 135);
        ctx.lineTo(w - 32, 135);
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Element Bileşimi:', 32, 170);

        let curY = 200;
        Object.entries(molecule.composition).forEach(([sym, count]) => {
            const atomInfo = ATOM_TYPES[sym];
            ctx.fillStyle = atomInfo.color;
            ctx.beginPath();
            ctx.arc(48, curY - 5, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = atomInfo.textColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(sym, 43, curY - 1);

            ctx.fillStyle = '#f8fafc';
            ctx.font = '14px sans-serif';
            ctx.fillText(`${count}x ${atomInfo.name} (${sym})`, 75, curY);

            curY += 36;
        });

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(280, 160, 300, 180);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(280, 160, 300, 180);

        const cx = 430;
        const cy = 250;
        if (molecule.id === 'H2O') {
            ctx.fillStyle = ATOM_TYPES.O.color;
            ctx.beginPath();
            ctx.arc(cx, cy - 15, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('O', cx - 6, cy - 10);

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(cx - 15, cy - 5);
            ctx.lineTo(cx - 45, cy + 25);
            ctx.moveTo(cx + 15, cy - 5);
            ctx.lineTo(cx + 45, cy + 25);
            ctx.stroke();

            ctx.fillStyle = ATOM_TYPES.H.color;
            ctx.beginPath();
            ctx.arc(cx - 50, cy + 30, 16, 0, Math.PI * 2);
            ctx.arc(cx + 50, cy + 30, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('H', cx - 55, cy + 34);
            ctx.fillText('H', cx + 45, cy + 34);
        } else {
            ctx.fillStyle = '#a5b4fc';
            ctx.font = 'italic 16px sans-serif';
            ctx.fillText(molecule.formula, cx - 25, cy + 6);
        }

        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px sans-serif';
        ctx.fillText('💡 MEB Fen: Atomlar kararlı hale geçmek için kovalent bağ yaparak molekülleri oluşturur.', 32, 385);

        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 580, 390);
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
                width: isMaximized ? '98vw' : '880px',
                height: isMaximized ? '95vh' : '640px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={cn(
                'fixed z-[5100] flex flex-col bg-[#0f111a]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden',
                isMaximized ? 'top-3 left-3' : 'top-8 left-1/2 -translate-x-1/2'
            )}
        >
            <canvas ref={canvasHiddenRef} className="hidden" />

            {/* ── Üst Başlık Çubuğu ────────────────────────────────────────── */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                        <Atom className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-wide">
                                Molekül İnşa Laboratuvarı
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                PhET Standardı
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Manyetik Kovalent Bağlanma & 3D Molekül Modeli
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Mod Seçimi */}
                    <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 mr-2">
                        <button
                            type="button"
                            onClick={() => setMode('game')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                                mode === 'game'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                            )}
                        >
                            🎯 Koleksiyon Modu
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('sandbox')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                                mode === 'sandbox'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                            )}
                        >
                            🧪 Serbest Mod
                        </button>
                    </div>

                    {/* Ses Aç / Kapat */}
                    <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    </button>

                    {/* Temizle / Sıfırla */}
                    <button
                        type="button"
                        onClick={handleResetWorkspace}
                        title="Tezgahı Temizle (Atomları kovaya geri koy)"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Tam Ekran / Pencere */}
                    <button
                        type="button"
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* Kapat */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Koleksiyon Bilgi Şeridi (Game Mode) ────────────────────── */}
            {mode === 'game' && (
                <div className="flex items-center justify-between px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/20 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-300">
                            {currentLevel.title}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">
                            · {currentLevel.subtitle}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {COLLECTIONS.map((col, idx) => (
                            <button
                                key={col.id}
                                type="button"
                                onClick={() => setCurrentLevelIdx(idx)}
                                className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all',
                                    currentLevelIdx === idx
                                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                                        : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                )}
                            >
                                {col.id}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Ana Çalışma Alanı (Orta Grid) ──────────────────────────── */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Sol / Tezgah Alanı: SVG Interactive Canvas */}
                <div className="flex-1 flex flex-col bg-[#0b0c14] relative select-none">
                    <div className="absolute top-2 left-3 z-10 pointer-events-none flex items-center gap-2 text-[11px] text-slate-400 bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                        <span>💡 İki atomu birbirine yaklaştırarak kovalent bağ kurun.</span>
                    </div>

                    {/* SVG Çalışma Alanı */}
                    <svg
                        ref={svgAreaRef}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="w-full h-full cursor-crosshair"
                    >
                        <defs>
                            <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.4" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dotGrid)" />

                        {/* Kovalent Bağ Çizgileri */}
                        {placedBonds.map((bond) => {
                            const a1 = placedAtoms.find((a) => a.id === bond.atom1Id);
                            const a2 = placedAtoms.find((a) => a.id === bond.atom2Id);
                            if (!a1 || !a2) return null;

                            const dx = a2.x - a1.x;
                            const dy = a2.y - a1.y;
                            const len = Math.hypot(dx, dy);
                            if (len === 0) return null;

                            const nx = -dy / len;
                            const ny = dx / len;

                            const renderLines = () => {
                                if (bond.order === 1) {
                                    return (
                                        <line
                                            x1={a1.x}
                                            y1={a1.y}
                                            x2={a2.x}
                                            y2={a2.y}
                                            stroke="#94a3b8"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                        />
                                    );
                                }
                                if (bond.order === 2) {
                                    const sep = 4.5;
                                    return (
                                        <g>
                                            <line
                                                x1={a1.x + nx * sep}
                                                y1={a1.y + ny * sep}
                                                x2={a2.x + nx * sep}
                                                y2={a2.y + ny * sep}
                                                stroke="#94a3b8"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                            <line
                                                x1={a1.x - nx * sep}
                                                y1={a1.y - ny * sep}
                                                x2={a2.x - nx * sep}
                                                y2={a2.y - ny * sep}
                                                stroke="#94a3b8"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                        </g>
                                    );
                                }
                                const sep = 6;
                                return (
                                    <g>
                                        <line
                                            x1={a1.x + nx * sep}
                                            y1={a1.y + ny * sep}
                                            x2={a2.x + nx * sep}
                                            y2={a2.y + ny * sep}
                                            stroke="#94a3b8"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                        <line
                                            x1={a1.x}
                                            y1={a1.y}
                                            x2={a2.x}
                                            y2={a2.y}
                                            stroke="#94a3b8"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                        <line
                                            x1={a1.x - nx * sep}
                                            y1={a1.y - ny * sep}
                                            x2={a2.x - nx * sep}
                                            y2={a2.y - ny * sep}
                                            stroke="#94a3b8"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                    </g>
                                );
                            };

                            const midX = (a1.x + a2.x) / 2;
                            const midY = (a1.y + a2.y) / 2;

                            return (
                                <g key={bond.id} className="group cursor-pointer">
                                    {renderLines()}
                                    <circle
                                        cx={midX}
                                        cy={midY}
                                        r="11"
                                        fill="#1e293b"
                                        stroke="#e2e8f0"
                                        strokeWidth="1.5"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBreakBond(bond.id);
                                        }}
                                    />
                                    <text
                                        x={midX}
                                        y={midY + 3.5}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="#cbd5e1"
                                        className="opacity-0 group-hover:opacity-100 pointer-events-none font-bold"
                                    >
                                        ✂
                                    </text>
                                </g>
                            );
                        })}

                        {/* Atom Küreleri */}
                        {placedAtoms.map((atom) => {
                            const info = ATOM_TYPES[atom.symbol];
                            const isDragging = draggingAtomId === atom.id;

                            return (
                                <g
                                    key={atom.id}
                                    onPointerDown={(e) => handlePointerDownAtom(e, atom.id)}
                                    className="cursor-grab active:cursor-grabbing transition-transform"
                                    style={{ touchAction: 'none' }}
                                >
                                    <circle
                                        cx={atom.x}
                                        cy={atom.y}
                                        r={info.radius2D + 3}
                                        fill="none"
                                        stroke={isDragging ? '#6366f1' : 'rgba(255,255,255,0.15)'}
                                        strokeWidth={isDragging ? 3 : 1.5}
                                    />
                                    <circle
                                        cx={atom.x}
                                        cy={atom.y}
                                        r={info.radius2D}
                                        fill={info.color}
                                        stroke="#1e293b"
                                        strokeWidth="2"
                                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
                                    />
                                    <circle
                                        cx={atom.x - info.radius2D * 0.3}
                                        cy={atom.y - info.radius2D * 0.3}
                                        r={info.radius2D * 0.35}
                                        fill="#ffffff"
                                        opacity="0.35"
                                    />
                                    <text
                                        x={atom.x}
                                        y={atom.y + 5}
                                        textAnchor="middle"
                                        fontSize={info.radius2D * 0.7}
                                        fontWeight="bold"
                                        fill={info.textColor}
                                        className="select-none pointer-events-none"
                                    >
                                        {info.symbol}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tanınan Molekül Rozetleri & Eylemleri */}
                    {detectedGroups.map((group, idx) => {
                        if (!group.matchedMolecule) return null;
                        const mol = group.matchedMolecule;
                        const target = currentLevel.targets.find((t) => t.moleculeId === mol.id);
                        const isTargetNeeded =
                            mode === 'game' &&
                            target &&
                            (collectedMolecules[mol.id] || 0) < target.requiredCount;

                        return (
                            <motion.div
                                key={`group_${idx}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    left: Math.max(80, Math.min(group.centerX, 480)),
                                    top: Math.max(30, group.centerY - 55),
                                }}
                                className="absolute -translate-x-1/2 flex items-center gap-1.5 p-1.5 px-3 rounded-xl bg-[#1e1b4b]/90 border border-indigo-500/50 shadow-xl backdrop-blur-md z-20"
                            >
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    {mol.name} ({mol.formula})
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setActive3DMolecule(mol)}
                                    title="3D Molekül Modeli"
                                    className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow"
                                >
                                    <Box className="w-3 h-3" />
                                    3D
                                </button>

                                {isTargetNeeded && (
                                    <button
                                        type="button"
                                        onClick={() => handleCollectGroup(group)}
                                        title="Hedef Kutucuğuna Ekle"
                                        className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow animate-pulse"
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Hedefe Ekle
                                    </button>
                                )}

                                {onInsertImage && (
                                    <button
                                        type="button"
                                        onClick={() => handleInsertToCanvas(mol)}
                                        title="Tahtaya Yapıştır"
                                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                                    >
                                        <Camera className="w-3 h-3" />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Sağ / Hedef & Koleksiyon Paneli (Game Mode) VEYA Bilgi Paneli (Sandbox) */}
                <div className="w-full md:w-64 bg-[#131522] border-t md:border-t-0 md:border-l border-white/10 p-3 flex flex-col justify-between overflow-y-auto">
                    {mode === 'game' ? (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    Hedef Koleksiyon
                                </span>
                                <span className="text-[11px] text-slate-400 font-semibold">
                                    {Object.values(collectedMolecules).reduce((a, b) => a + b, 0)} /{' '}
                                    {currentLevel.targets.reduce((a, b) => a + b.requiredCount, 0)}
                                </span>
                            </div>

                            {/* Hedef Listesi */}
                            <div className="flex flex-col gap-2">
                                {currentLevel.targets.map((target) => {
                                    const km = KNOWN_MOLECULES.find((m) => m.id === target.moleculeId);
                                    const currentCount = collectedMolecules[target.moleculeId] || 0;
                                    const isDone = currentCount >= target.requiredCount;

                                    return (
                                        <div
                                            key={target.moleculeId}
                                            className={cn(
                                                'p-2.5 rounded-xl border transition-all flex items-center justify-between',
                                                isDone
                                                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                                                    : 'bg-white/[0.03] border-white/10 text-slate-300'
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs',
                                                        isDone ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                                                    )}
                                                >
                                                    {isDone ? '✓' : target.requiredCount}
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold leading-tight">
                                                        {km?.name}
                                                    </span>
                                                    <span className="block text-[11px] text-indigo-300 font-mono">
                                                        {km?.formula}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    {currentCount}/{target.requiredCount}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Seviye Tamamlandı Tebrik Kartı */}
                            {levelSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl mt-1 text-center"
                                >
                                    <div className="text-2xl mb-1">🎉</div>
                                    <div className="text-xs font-bold">Harika İş! Koleksiyon Tamamlandı</div>
                                    {currentLevelIdx < COLLECTIONS.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentLevelIdx((prev) => prev + 1)}
                                            className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-white text-emerald-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow flex items-center justify-center gap-1.5"
                                        >
                                            <span>Sonraki Koleksiyon</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <div className="text-[11px] text-emerald-100 mt-1">
                                            Tüm seviyeleri başarıyla tamamladınız!
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        /* Sandbox Bilgi Paneli */
                        <div className="flex flex-col gap-2 text-xs">
                            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Flame className="w-4 h-4 text-orange-400" />
                                Serbest Keşif
                            </span>
                            <p className="text-slate-400 text-[11px]">
                                İstediğiniz atomları tezgaha alıp dilediğiniz molekülleri inşa edebilirsiniz.
                            </p>

                            <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1 text-[11px]">
                                <span className="font-bold text-indigo-300">Değerlik Kuralları:</span>
                                <span>• H, Cl: 1 Bağ</span>
                                <span>• O, S: 2 Bağ (Tekli veya İkili)</span>
                                <span>• N, P: 3 Bağ (Tekli, İkili veya Üçlü)</span>
                                <span>• C: 4 Bağ (Dörtlü kovalent)</span>
                            </div>
                        </div>
                    )}

                    {/* Hızlı Eylemler */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Tezgahta: {placedAtoms.length} atom</span>
                        <button
                            type="button"
                            onClick={handleResetWorkspace}
                            className="text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                            <Trash2 className="w-3 h-3" />
                            Temizle
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Alt Atom Havuzları / Kovaları (Tepsisi) ───────────────────── */}
            <div className="px-4 py-3 bg-[#131522] border-t border-white/10 select-none">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        📦 Atom Kovaları (Tıklayarak Tezgaha Ekleyin):
                    </span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {Object.keys(bucketCounts).map((symbol) => {
                        const info = ATOM_TYPES[symbol];
                        if (!info) return null;
                        const count = bucketCounts[symbol] || 0;
                        const isEmpty = count <= 0;

                        return (
                            <button
                                key={symbol}
                                type="button"
                                disabled={isEmpty}
                                onClick={() => handleAddAtomFromBucket(symbol)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 relative group',
                                    isEmpty
                                        ? 'opacity-35 bg-white/[0.02] border-white/5 cursor-not-allowed'
                                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-indigo-500/50 cursor-pointer active:scale-95 shadow'
                                )}
                            >
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow border"
                                    style={{
                                        backgroundColor: info.color,
                                        color: info.textColor,
                                        borderColor: '#334155',
                                    }}
                                >
                                    {info.symbol}
                                </div>

                                <div className="text-left">
                                    <span className="block text-xs font-bold text-white group-hover:text-indigo-200">
                                        {info.name}
                                    </span>
                                    <span className="block text-[10px] text-slate-400">
                                        {count} adet kaldı
                                    </span>
                                </div>

                                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-300 ml-1">
                                    <Plus className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── 3D Molekül İnceleme Modalı (Three.js) ────────────────────── */}
            {active3DMolecule && (
                <Molecule3DViewerModal
                    molecule={active3DMolecule}
                    viewMode={viewMode3D}
                    onToggleViewMode={() =>
                        setViewMode3D((prev) => (prev === 'ball_stick' ? 'space_fill' : 'ball_stick'))
                    }
                    onClose={() => setActive3DMolecule(null)}
                    onInsertImage={onInsertImage}
                />
            )}
        </motion.div>
    );
}

// ── Three.js ile 3D Molekül Modalı ─────────────────────────────────────────
interface Molecule3DViewerModalProps {
    molecule: KnownMolecule;
    viewMode: 'ball_stick' | 'space_fill';
    onToggleViewMode: () => void;
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

function Molecule3DViewerModal({
    molecule,
    viewMode,
    onToggleViewMode,
    onClose,
    onInsertImage,
}: Molecule3DViewerModalProps) {
    const canvas3DRef = React.useRef<HTMLCanvasElement>(null);
    const sceneRef = React.useRef<THREE.Scene | null>(null);
    const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
    const groupRef = React.useRef<THREE.Group | null>(null);
    const reqIdRef = React.useRef<number | null>(null);

    const isDraggingRef = React.useRef(false);
    const lastPosRef = React.useRef({ x: 0, y: 0 });
    const sphericalRef = React.useRef({ radius: 4.8, theta: 0.5, phi: 1.2 });

    React.useEffect(() => {
        const canvas = canvas3DRef.current;
        if (!canvas) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
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

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(5, 8, 6);
        scene.add(dirLight);

        const backLight = new THREE.DirectionalLight(0x818cf8, 0.8);
        backLight.position.set(-5, -4, -5);
        scene.add(backLight);

        const molGroup = new THREE.Group();
        scene.add(molGroup);
        groupRef.current = molGroup;

        build3DMolecule(molGroup, molecule, viewMode);

        const updateCamera = () => {
            const { radius, theta, phi } = sphericalRef.current;
            camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
            camera.position.y = radius * Math.cos(phi);
            camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
            camera.lookAt(0, 0, 0);
        };

        const render = () => {
            if (!renderer || !scene || !camera) return;
            if (!isDraggingRef.current && molGroup) {
                molGroup.rotation.y += 0.005;
            }
            updateCamera();
            renderer.render(scene, camera);
            reqIdRef.current = requestAnimationFrame(render);
        };
        render();

        const handleResize = () => {
            if (!canvas || !renderer || !camera) return;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
            renderer.dispose();
        };
    }, [molecule, viewMode]);

    const handlePointerDown = (e: React.PointerEvent) => {
        isDraggingRef.current = true;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        lastPosRef.current = { x: e.clientX, y: e.clientY };

        sphericalRef.current.theta -= dx * 0.01;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - dy * 0.01));
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        sphericalRef.current.radius = Math.max(2.5, Math.min(9.0, sphericalRef.current.radius + e.deltaY * 0.005));
    };

    const handleInsert3DToCanvas = () => {
        const canvas = canvas3DRef.current;
        if (!canvas || !onInsertImage) return;
        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 520, 390);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[5200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-lg bg-[#11131f] border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-indigo-400" />
                        <div>
                            <span className="font-bold text-white text-sm">
                                {molecule.name} ({molecule.formula})
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                                360° Etkileşimli 3D Model
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={onToggleViewMode}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                        >
                            {viewMode === 'ball_stick' ? 'Top & Çubuk Modu' : 'Uzay Dolgulu (CPK)'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onWheel={handleWheel}
                    className="w-full h-80 bg-radial from-slate-900 to-black relative cursor-grab active:cursor-grabbing select-none"
                >
                    <canvas ref={canvas3DRef} className="w-full h-full block" />
                    <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 pointer-events-none bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                        🔄 Fare veya dokunarak 360° döndürün, tekerlekle yakınlaştırın
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 border-t border-white/10 bg-white/[0.02]">
                    <span className="text-xs text-slate-400">
                        {molecule.description}
                    </span>

                    <div className="flex items-center gap-2">
                        {onInsertImage && (
                            <button
                                type="button"
                                onClick={handleInsert3DToCanvas}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                Tahtaya Yapıştır
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ── 3D Molekül Geometrisi Oluşturucu ───────────────────────────────────────
function build3DMolecule(group: THREE.Group, molecule: KnownMolecule, viewMode: 'ball_stick' | 'space_fill') {
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }

    interface Atom3DCoord {
        symbol: string;
        pos: [number, number, number];
    }
    interface Bond3DDef {
        i1: number;
        i2: number;
        order: 1 | 2 | 3;
    }

    let atomsCoords: Atom3DCoord[] = [];
    let bondsDefs: Bond3DDef[] = [];

    if (molecule.id === 'H2O') {
        atomsCoords = [
            { symbol: 'O', pos: [0, 0.15, 0] },
            { symbol: 'H', pos: [-0.85, -0.4, 0] },
            { symbol: 'H', pos: [0.85, -0.4, 0] },
        ];
        bondsDefs = [
            { i1: 0, i2: 1, order: 1 },
            { i1: 0, i2: 2, order: 1 },
        ];
    } else if (molecule.id === 'CO2') {
        atomsCoords = [
            { symbol: 'C', pos: [0, 0, 0] },
            { symbol: 'O', pos: [-1.2, 0, 0] },
            { symbol: 'O', pos: [1.2, 0, 0] },
        ];
        bondsDefs = [
            { i1: 0, i2: 1, order: 2 },
            { i1: 0, i2: 2, order: 2 },
        ];
    } else if (molecule.id === 'O2') {
        atomsCoords = [
            { symbol: 'O', pos: [-0.65, 0, 0] },
            { symbol: 'O', pos: [0.65, 0, 0] },
        ];
        bondsDefs = [{ i1: 0, i2: 1, order: 2 }];
    } else if (molecule.id === 'N2') {
        atomsCoords = [
            { symbol: 'N', pos: [-0.6, 0, 0] },
            { symbol: 'N', pos: [0.6, 0, 0] },
        ];
        bondsDefs = [{ i1: 0, i2: 1, order: 3 }];
    } else if (molecule.id === 'H2') {
        atomsCoords = [
            { symbol: 'H', pos: [-0.5, 0, 0] },
            { symbol: 'H', pos: [0.5, 0, 0] },
        ];
        bondsDefs = [{ i1: 0, i2: 1, order: 1 }];
    } else if (molecule.id === 'CH4') {
        atomsCoords = [
            { symbol: 'C', pos: [0, 0, 0] },
            { symbol: 'H', pos: [0, 1.05, 0] },
            { symbol: 'H', pos: [0.98, -0.35, 0] },
            { symbol: 'H', pos: [-0.49, -0.35, 0.85] },
            { symbol: 'H', pos: [-0.49, -0.35, -0.85] },
        ];
        bondsDefs = [
            { i1: 0, i2: 1, order: 1 },
            { i1: 0, i2: 2, order: 1 },
            { i1: 0, i2: 3, order: 1 },
            { i1: 0, i2: 4, order: 1 },
        ];
    } else if (molecule.id === 'NH3') {
        atomsCoords = [
            { symbol: 'N', pos: [0, 0.3, 0] },
            { symbol: 'H', pos: [0.85, -0.3, 0] },
            { symbol: 'H', pos: [-0.42, -0.3, 0.73] },
            { symbol: 'H', pos: [-0.42, -0.3, -0.73] },
        ];
        bondsDefs = [
            { i1: 0, i2: 1, order: 1 },
            { i1: 0, i2: 2, order: 1 },
            { i1: 0, i2: 3, order: 1 },
        ];
    } else if (molecule.id === 'HCl') {
        atomsCoords = [
            { symbol: 'Cl', pos: [-0.4, 0, 0] },
            { symbol: 'H', pos: [0.85, 0, 0] },
        ];
        bondsDefs = [{ i1: 0, i2: 1, order: 1 }];
    } else if (molecule.id === 'Cl2') {
        atomsCoords = [
            { symbol: 'Cl', pos: [-0.75, 0, 0] },
            { symbol: 'Cl', pos: [0.75, 0, 0] },
        ];
        bondsDefs = [{ i1: 0, i2: 1, order: 1 }];
    } else if (molecule.id === 'CO') {
        atomsCoords = [
            { symbol: 'C', pos: [-0.6, 0, 0] },
            { symbol: 'O', pos: [0.6, 0, 0] },
        ];
        bondsDefs = [{ i1: 0, i2: 1, order: 3 }];
    } else {
        let idx = 0;
        Object.entries(molecule.composition).forEach(([sym, count]) => {
            for (let c = 0; c < count; c++) {
                atomsCoords.push({
                    symbol: sym,
                    pos: [(idx - count / 2) * 0.9, (idx % 2 === 0 ? 0.3 : -0.3), 0],
                });
                if (idx > 0) {
                    bondsDefs.push({ i1: idx - 1, i2: idx, order: 1 });
                }
                idx++;
            }
        });
    }

    atomsCoords.forEach((item) => {
        const info = ATOM_TYPES[item.symbol] || ATOM_TYPES.H;
        const radius = viewMode === 'space_fill' ? info.vdwRadius3D : info.covalentRadius3D;

        const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(info.color),
            roughness: 0.25,
            metalness: 0.1,
        });

        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(...item.pos);
        group.add(mesh);
    });

    if (viewMode === 'ball_stick') {
        const bondMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.35,
            metalness: 0.1,
        });

        bondsDefs.forEach((b) => {
            const p1 = new THREE.Vector3(...atomsCoords[b.i1].pos);
            const p2 = new THREE.Vector3(...atomsCoords[b.i2].pos);
            const dir = new THREE.Vector3().subVectors(p2, p1);
            const len = dir.length();
            const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

            const orientation = new THREE.Matrix4();
            orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
            orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

            const bondRadius = b.order === 1 ? 0.08 : b.order === 2 ? 0.065 : 0.055;
            const cylGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, len, 16);
            const cylMesh = new THREE.Mesh(cylGeo, bondMat);
            cylMesh.position.copy(center);
            cylMesh.quaternion.setFromRotationMatrix(orientation);
            group.add(cylMesh);
        });
    }
}
