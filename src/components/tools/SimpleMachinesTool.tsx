// src/components/tools/SimpleMachinesTool.tsx
// 8. Sınıf LGS Fen Bilimleri - Basit Makineler Dinamik Laboratuvarı.
// Kaldıraç (1., 2., 3. tip), Sabit/Hareketli Makara & Palanga, Eğik Düzlem ve Çıkrık sistemleri.
// Canlı kuvvet hesabı, kuvvet kazancı, iş eşitliği ve tahtaya damgalama desteği.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Maximize2,
    Minimize2,
    Camera,
    Scale,
    Layers,
    TrendingUp,
    Compass,
    Info,
    Play,
    Pause,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SimpleMachinesToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

type MachineType = 'lever' | 'pulley' | 'inclined_plane' | 'wheel_axle';

export function SimpleMachinesTool({ onClose, onInsertImage }: SimpleMachinesToolProps) {
    const dragControls = useDragControls();
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = React.useState<MachineType>('lever');
    const [isMaximized, setIsMaximized] = React.useState(false);

    // ── Kaldıraç Parametreleri ─────────────────────────────────────────
    // 1: Destek Ortada (Tahterevalli/Pense), 2: Yük Ortada (El Arabası), 3: Kuvvet Ortada (Cımbız/Kürek)
    const [leverType, setLeverType] = React.useState<1 | 2 | 3>(1);
    const [loadP, setLoadP] = React.useState<number>(60); // Newton
    const [effortArm, setEffortArm] = React.useState<number>(3); // metre / birim (Kuvvet Kolu)
    const [loadArm, setLoadArm] = React.useState<number>(1); // metre / birim (Yük Kolu)

    // ── Makara / Palanga Parametreleri ─────────────────────────────────
    // 'fixed': Sabit, 'movable': Hareketli, 'block3': Palanga (3 makaralı), 'block4': Palanga (4 makaralı)
    const [pulleyType, setPulleyType] = React.useState<'fixed' | 'movable' | 'block3' | 'block4'>('movable');
    const [pulleyLoad, setPulleyLoad] = React.useState<number>(80); // Newton
    const [pullProgress, setPullProgress] = React.useState<number>(0.3); // 0 ile 1 arası ip çekme konumu
    const [isPulling, setIsPulling] = React.useState(false);

    // ── Eğik Düzlem Parametreleri ──────────────────────────────────────
    const [planeHeight, setPlaneHeight] = React.useState<number>(2); // metre (h)
    const [planeLength, setPlaneLength] = React.useState<number>(6); // metre (L)
    const [planeLoad, setPlaneLoad] = React.useState<number>(90); // Newton
    const [planeProgress, setPlaneProgress] = React.useState<number>(0.4); // rampa konumu

    // ── Çıkrık Parametreleri ───────────────────────────────────────────
    const [axleRadiusR, setAxleRadiusR] = React.useState<number>(30); // cm (Çıkrık Kolu R)
    const [axleRadiusSmallR, setAxleRadiusSmallR] = React.useState<number>(10); // cm (Silindir Yarıçapı r)
    const [axleLoad, setAxleLoad] = React.useState<number>(60); // Newton
    const [axleAngle, setAxleAngle] = React.useState<number>(0);

    // Otomatik animasyon döngüsü (Makara / Çıkrık için)
    React.useEffect(() => {
        if (!isPulling) return;
        const interval = setInterval(() => {
            if (activeTab === 'pulley') {
                setPullProgress((p) => (p >= 0.95 ? 0.05 : p + 0.02));
            } else if (activeTab === 'wheel_axle') {
                setAxleAngle((a) => (a + 6) % 360);
            } else if (activeTab === 'inclined_plane') {
                setPlaneProgress((p) => (p >= 0.95 ? 0.05 : p + 0.02));
            }
        }, 50);
        return () => clearInterval(interval);
    }, [isPulling, activeTab]);

    // ── Fiziksel Hesaplamalar ──────────────────────────────────────────
    // Kaldıraç
    const leverEffort = Math.round(((loadP * loadArm) / Math.max(0.1, effortArm)) * 10) / 10;
    const leverAdvantage = Math.round((effortArm / Math.max(0.1, loadArm)) * 10) / 10;

    // Makara
    const pulleyStrings = pulleyType === 'fixed' ? 1 : pulleyType === 'movable' ? 2 : pulleyType === 'block3' ? 3 : 4;
    const pulleyEffort = Math.round((pulleyLoad / pulleyStrings) * 10) / 10;
    const pulleyAdvantage = pulleyStrings;

    // Eğik Düzlem
    const planeEffort = Math.round((planeLoad * (planeHeight / Math.max(planeHeight + 0.1, planeLength))) * 10) / 10;
    const planeAdvantage = Math.round((planeLength / Math.max(0.1, planeHeight)) * 10) / 10;

    // Çıkrık
    const axleEffort = Math.round((axleLoad * (axleRadiusSmallR / Math.max(0.1, axleRadiusR))) * 10) / 10;
    const axleAdvantage = Math.round((axleRadiusR / Math.max(0.1, axleRadiusSmallR)) * 10) / 10;

    // ── Canvas Çizimi ──────────────────────────────────────────────────
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Arka plan ızgarası
        ctx.strokeStyle = '#23283e';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        if (activeTab === 'lever') {
            drawLever(ctx, w, h);
        } else if (activeTab === 'pulley') {
            drawPulley(ctx, w, h);
        } else if (activeTab === 'inclined_plane') {
            drawInclinedPlane(ctx, w, h);
        } else if (activeTab === 'wheel_axle') {
            drawWheelAxle(ctx, w, h);
        }
    }, [
        activeTab,
        leverType,
        loadP,
        effortArm,
        loadArm,
        pulleyType,
        pulleyLoad,
        pullProgress,
        planeHeight,
        planeLength,
        planeLoad,
        planeProgress,
        axleRadiusR,
        axleRadiusSmallR,
        axleLoad,
        axleAngle,
    ]);

    // 1. KALDIRAÇ ÇİZİMİ
    function drawLever(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const groundY = h - 60;
        const totalUnits = 8;
        const barStartX = 80;
        const barEndX = w - 80;
        const barWidth = barEndX - barStartX;
        const unitPx = barWidth / totalUnits;
        const barY = groundY - 70;

        let fulcrumUnit = 4; // Destek konumu
        let loadUnit = 1;
        let effortUnit = 7;

        if (leverType === 1) {
            fulcrumUnit = 4;
            loadUnit = Math.max(0, 4 - loadArm);
            effortUnit = Math.min(8, 4 + effortArm);
        } else if (leverType === 2) {
            fulcrumUnit = 0.5;
            loadUnit = 0.5 + loadArm;
            effortUnit = Math.min(8, 0.5 + effortArm);
        } else {
            fulcrumUnit = 0.5;
            effortUnit = 0.5 + effortArm;
            loadUnit = Math.min(8, 0.5 + loadArm);
        }

        const fulcrumX = barStartX + fulcrumUnit * unitPx;
        const loadX = barStartX + loadUnit * unitPx;
        const effortX = barStartX + effortUnit * unitPx;

        // Zemin çizgisi
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, groundY);
        ctx.lineTo(w - 40, groundY);
        ctx.stroke();

        // Destek üçgeni
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fulcrumX, barY);
        ctx.lineTo(fulcrumX - 25, groundY);
        ctx.lineTo(fulcrumX + 25, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Destek tepe mafsal noktası
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(fulcrumX, barY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Kaldıraç çubuğu (eşit bölmeli cetvel)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(barStartX, barY - 7, barWidth, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Çubuk üzerindeki bölmeler ve etiketler
        for (let i = 0; i <= totalUnits; i++) {
            const bx = barStartX + i * unitPx;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, barY - 7);
            ctx.lineTo(bx, barY + 7);
            ctx.stroke();
        }

        // YÜK (P) Çizimi (Kutu + Vektör oku)
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        const boxSize = Math.min(50, 24 + (loadP / 200) * 26);
        ctx.beginPath();
        ctx.roundRect(loadX - boxSize / 2, barY - 14 - boxSize, boxSize, boxSize, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`P = ${loadP} N`, loadX, barY - 18 - boxSize / 2);

        // Yük ağırlık oku (Aşağı yönlü)
        drawArrow(ctx, loadX, barY + 12, loadX, barY + 45, '#ef4444', 'Yük (P)');

        // KUVVET (F) Çizimi (Dinamometre / Ok)
        const isPushUp = leverType === 2 || leverType === 3;
        const arrowStartY = isPushUp ? barY + 45 : barY - 45;
        const arrowEndY = isPushUp ? barY + 12 : barY - 12;
        drawArrow(ctx, effortX, arrowStartY, effortX, arrowEndY, '#10b981', `F = ${leverEffort} N`);

        // Mesafe okları (Yük Kolu ve Kuvvet Kolu)
        drawDimensionLine(ctx, fulcrumX, groundY + 20, loadX, groundY + 20, `Yük Kolu (${loadArm} br)`, '#ef4444');
        drawDimensionLine(ctx, fulcrumX, groundY + 42, effortX, groundY + 42, `Kuvvet Kolu (${effortArm} br)`, '#10b981');
    }

    // 2. MAKARA & PALANGA ÇİZİMİ
    function drawPulley(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const ceilingY = 50;
        const groundY = h - 50;
        const centerX = w / 2;

        // Tavan
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 160, ceilingY);
        ctx.lineTo(centerX + 160, ceilingY);
        ctx.stroke();

        for (let x = centerX - 150; x < centerX + 150; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, ceilingY);
            ctx.lineTo(x + 10, ceilingY - 10);
            ctx.stroke();
        }

        const r = 26;
        const loadY = groundY - 100 - pullProgress * 120;

        if (pulleyType === 'fixed') {
            const pulleyY = ceilingY + 35;
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, ceilingY);
            ctx.lineTo(centerX, pulleyY);
            ctx.stroke();

            drawPulleyWheel(ctx, centerX, pulleyY, r);

            const leftX = centerX - r;
            const rightX = centerX + r;
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(leftX, loadY);
            ctx.arc(centerX, pulleyY, r, Math.PI, 0, false);
            ctx.lineTo(rightX, groundY - 40 + pullProgress * 80);
            ctx.stroke();

            drawWeight(ctx, leftX, loadY, pulleyLoad);

            const handY = groundY - 40 + pullProgress * 80;
            drawArrow(ctx, rightX, handY - 20, rightX, handY + 25, '#10b981', `F = ${pulleyEffort} N`);
        } else if (pulleyType === 'movable') {
            const movableY = loadY - 40;

            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - r, ceilingY);
            ctx.lineTo(centerX - r, movableY);
            ctx.arc(centerX, movableY, r, Math.PI, 0, true);
            ctx.lineTo(centerX + r, ceilingY + 40 - pullProgress * 100);
            ctx.stroke();

            drawPulleyWheel(ctx, centerX, movableY, r);

            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, movableY);
            ctx.lineTo(centerX, loadY);
            ctx.stroke();

            drawWeight(ctx, centerX, loadY, pulleyLoad);

            const handY = ceilingY + 40 - pullProgress * 100;
            drawArrow(ctx, centerX + r, handY + 30, centerX + r, handY - 20, '#10b981', `F = ${pulleyEffort} N`);
        } else {
            const topPulley1X = centerX - 30;
            const topPulley2X = centerX + 30;
            const topY = ceilingY + 35;
            const botY = loadY - 45;

            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(topPulley1X, ceilingY);
            ctx.lineTo(topPulley1X, topY);
            ctx.moveTo(topPulley2X, ceilingY);
            ctx.lineTo(topPulley2X, topY);
            ctx.stroke();

            drawPulleyWheel(ctx, topPulley1X, topY, 22);
            drawPulleyWheel(ctx, topPulley2X, topY, 22);

            drawPulleyWheel(ctx, centerX, botY, 22);

            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 15, botY);
            ctx.lineTo(topPulley1X, topY);
            ctx.lineTo(topPulley2X, topY);
            ctx.lineTo(centerX + 15, botY);
            ctx.lineTo(topPulley2X + 30, ceilingY + 40 + pullProgress * 90);
            ctx.stroke();

            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(centerX, botY);
            ctx.lineTo(centerX, loadY);
            ctx.stroke();

            drawWeight(ctx, centerX, loadY, pulleyLoad);

            const handY = ceilingY + 40 + pullProgress * 90;
            drawArrow(ctx, topPulley2X + 30, handY - 15, topPulley2X + 30, handY + 30, '#10b981', `F = ${pulleyEffort} N`);
        }
    }

    // 3. EĞİK DÜZLEM ÇİZİMİ
    function drawInclinedPlane(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const startX = 100;
        const endX = w - 120;
        const groundY = h - 60;
        const rampBaseW = endX - startX;

        const scaleH = (planeHeight / 5) * (h * 0.45);
        const topY = groundY - scaleH;

        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, groundY);
        ctx.lineTo(w - 40, groundY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, groundY);
        ctx.lineTo(endX, groundY);
        ctx.lineTo(endX, topY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(endX - 16, groundY);
        ctx.lineTo(endX - 16, groundY - 16);
        ctx.lineTo(endX, groundY - 16);
        ctx.stroke();

        const angle = Math.atan2(scaleH, rampBaseW);
        const curDist = planeProgress * Math.hypot(rampBaseW, scaleH);
        const boxX = startX + curDist * Math.cos(angle);
        const boxY = groundY - curDist * Math.sin(angle);

        ctx.save();
        ctx.translate(boxX, boxY);
        ctx.rotate(-angle);

        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-24, -40, 48, 40, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`P=${planeLoad}N`, 0, -18);

        drawArrow(ctx, 24, -20, 70, -20, '#10b981', `F = ${planeEffort} N`);
        ctx.restore();

        drawDimensionLine(ctx, endX + 25, topY, endX + 25, groundY, `h = ${planeHeight} m`, '#f59e0b');
        drawDimensionLine(ctx, startX, groundY + 25, endX, groundY + 25, `Taban = ${Math.round(Math.sqrt(planeLength ** 2 - planeHeight ** 2) * 10) / 10} m`, '#94a3b8');

        const midRampX = (startX + endX) / 2 - 25;
        const midRampY = (groundY + topY) / 2 - 25;
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`L = ${planeLength} m (Kuvvet Yolu)`, midRampX, midRampY);
    }

    // 4. ÇIKRIK ÇİZİMİ
    function drawWheelAxle(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const centerX = w / 2 - 40;
        const centerY = h / 2 - 20;

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY + 90);
        ctx.lineTo(centerX - 80, centerY);
        ctx.lineTo(centerX + 80, centerY);
        ctx.lineTo(centerX + 80, centerY + 90);
        ctx.stroke();

        const scaleSmallR = (axleRadiusSmallR / 25) * 45;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, scaleSmallR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const scaleBigR = (axleRadiusR / 80) * 110;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, scaleBigR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const rad = (axleAngle * Math.PI) / 180;
        const handleX = centerX + scaleBigR * Math.cos(rad);
        const handleY = centerY + scaleBigR * Math.sin(rad);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(handleX, handleY);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(handleX, handleY, 8, 0, Math.PI * 2);
        ctx.fill();

        const ropeX = centerX - scaleSmallR;
        const bucketY = centerY + 130 - (axleAngle / 360) * 40;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ropeX, centerY);
        ctx.lineTo(ropeX, bucketY);
        ctx.stroke();

        drawWeight(ctx, ropeX, bucketY, axleLoad);

        const tanAngle = rad + Math.PI / 2;
        const fEndX = handleX + 45 * Math.cos(tanAngle);
        const fEndY = handleY + 45 * Math.sin(tanAngle);
        drawArrow(ctx, handleX, handleY, fEndX, fEndY, '#10b981', `F = ${axleEffort} N`);

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + scaleSmallR, centerY);
        ctx.stroke();
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`r = ${axleRadiusSmallR} cm`, centerX + scaleSmallR / 2, centerY - 8);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`R = ${axleRadiusR} cm (Kuvvet Kolu)`, centerX, centerY - scaleBigR - 8);
    }

    // ── Yardımcı Çizim Fonksiyonları ──────────────────────────────────
    function drawPulleyWheel(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawWeight(ctx: CanvasRenderingContext2D, cx: number, cy: number, val: number) {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - 24, cy, 48, 36, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${val} N`, cx, cy + 22);
    }

    function drawArrow(
        ctx: CanvasRenderingContext2D,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        color: string,
        label: string
    ) {
        const headlen = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, toX + (toX > fromX ? 15 : -15), toY + (toY > fromY ? 15 : -10));
    }

    function drawDimensionLine(
        ctx: CanvasRenderingContext2D,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        label: string,
        color: string
    ) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1 - 4);
        ctx.lineTo(x1, y1 + 4);
        ctx.moveTo(x2, y2 - 4);
        ctx.lineTo(x2, y2 + 4);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, (x1 + x2) / 2, Math.min(y1, y2) - 6);
    }

    const handleInsertToCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !onInsertImage) return;
        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 560, 380);
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
                width: isMaximized ? '98vw' : '780px',
                height: isMaximized ? '95vh' : '560px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={cn(
                'fixed z-[5100] flex flex-col bg-[#13151f]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden',
                isMaximized ? 'top-3 left-3' : 'top-14 left-1/2 -translate-x-1/2'
            )}
        >
            {/* Üst Başlık Çubuğu */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-950/80 via-[#181a29] to-[#13151f] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
                        <Scale className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                8. Sınıf Basit Makineler Dinamik Laboratuvarı
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                LGS Fen
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Kuvvet kazancı, yol kaybı ve iş eşitliğini dinamik test edin
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {onInsertImage && (
                        <button
                            type="button"
                            onClick={handleInsertToCanvas}
                            title="Tahtaya Aktar / Damgala"
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

            {/* Sistem Seçim Sekmeleri */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
                {[
                    { id: 'lever', label: '1. Kaldıraçlar', icon: Scale },
                    { id: 'pulley', label: '2. Makaralar & Palanga', icon: Layers },
                    { id: 'inclined_plane', label: '3. Eğik Düzlem', icon: TrendingUp },
                    { id: 'wheel_axle', label: '4. Çıkrık (Kuyu)', icon: Compass },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                            setActiveTab(tab.id as MachineType);
                            setIsPulling(false);
                        }}
                        className={cn(
                            'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                            activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Ana Çalışma Alanı: Sol Canvas + Sağ Kontrol Paneli */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                <div className="flex-1 relative flex items-center justify-center bg-[#0d0e17] p-2 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={400}
                        className="w-full h-full max-w-[640px] max-h-[400px] object-contain rounded-xl border border-white/5 shadow-inner"
                    />

                    {(activeTab === 'pulley' || activeTab === 'inclined_plane' || activeTab === 'wheel_axle') && (
                        <button
                            type="button"
                            onClick={() => setIsPulling(!isPulling)}
                            className={cn(
                                'absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all',
                                isPulling ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            )}
                        >
                            {isPulling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPulling ? 'Durdur' : 'Canlı Çalıştır'}</span>
                        </button>
                    )}
                </div>

                <div className="w-full md:w-[280px] flex-shrink-0 bg-[#171926] border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
                    {activeTab === 'lever' && (
                        <>
                            <div>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                                    Kaldıraç Tipi
                                </span>
                                <div className="grid grid-cols-3 gap-1">
                                    {[
                                        { t: 1, label: 'Destek Ortada', sub: 'Pense' },
                                        { t: 2, label: 'Yük Ortada', sub: 'El Arabası' },
                                        { t: 3, label: 'Kuvvet Ortada', sub: 'Cımbız' },
                                    ].map((item) => (
                                        <button
                                            key={item.t}
                                            type="button"
                                            onClick={() => setLeverType(item.t as 1 | 2 | 3)}
                                            className={cn(
                                                'p-1.5 rounded-lg border text-center transition-all',
                                                leverType === item.t
                                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                            )}
                                        >
                                            <span className="block text-[11px] font-bold leading-tight">{item.label}</span>
                                            <span className="block text-[9px] text-slate-300/70">{item.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Yük (P)</span>
                                    <span className="font-bold text-red-400">{loadP} N</span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={200}
                                    step={10}
                                    value={loadP}
                                    onChange={(e) => setLoadP(Number(e.target.value))}
                                    className="w-full accent-red-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Yük Kolu (d₂)</span>
                                    <span className="font-bold text-red-400">{loadArm} birim</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={4}
                                    step={0.5}
                                    value={loadArm}
                                    onChange={(e) => setLoadArm(Number(e.target.value))}
                                    className="w-full accent-red-400"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Kuvvet Kolu (d₁)</span>
                                    <span className="font-bold text-emerald-400">{effortArm} birim</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={4}
                                    step={0.5}
                                    value={effortArm}
                                    onChange={(e) => setEffortArm(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>

                            <div className="mt-auto p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Gereken Kuvvet (F):</span>
                                    <span className="font-mono font-bold text-emerald-400 text-sm">{leverEffort} N</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Kuvvet Kazancı:</span>
                                    <span className="font-mono font-bold text-indigo-300">{leverAdvantage} Kat</span>
                                </div>
                                <div className="text-[10.5px] text-amber-300/90 pt-1 border-t border-white/10 leading-tight">
                                    {leverAdvantage > 1
                                        ? '✅ Kuvvetten kazanç, yoldan kayıp var.'
                                        : leverAdvantage < 1
                                        ? '⚡ Yoldan kazanç, kuvvetten kayıp var.'
                                        : '⚖️ Kuvvet kazancı yok (F = P).'}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'pulley' && (
                        <>
                            <div>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                                    Makara Düzeneği
                                </span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                        { id: 'fixed', label: 'Sabit Makara', sub: 'Kazanç: 1x' },
                                        { id: 'movable', label: 'Hareketli Makara', sub: 'Kazanç: 2x' },
                                        { id: 'block3', label: 'Palanga (3 İp)', sub: 'Kazanç: 3x' },
                                        { id: 'block4', label: 'Palanga (4 İp)', sub: 'Kazanç: 4x' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setPulleyType(item.id as any)}
                                            className={cn(
                                                'p-2 rounded-lg border text-left transition-all',
                                                pulleyType === item.id
                                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                            )}
                                        >
                                            <span className="block text-[11px] font-bold leading-tight">{item.label}</span>
                                            <span className="block text-[9.5px] text-slate-300/70">{item.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Yük (P)</span>
                                    <span className="font-bold text-red-400">{pulleyLoad} N</span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={200}
                                    step={10}
                                    value={pulleyLoad}
                                    onChange={(e) => setPulleyLoad(Number(e.target.value))}
                                    className="w-full accent-red-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">İpi Çek (Yük Yüksekliği)</span>
                                    <span className="font-bold text-amber-400">{Math.round(pullProgress * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0.05}
                                    max={0.95}
                                    step={0.01}
                                    value={pullProgress}
                                    onChange={(e) => setPullProgress(Number(e.target.value))}
                                    className="w-full accent-amber-400"
                                />
                            </div>

                            <div className="mt-auto p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Gereken Kuvvet (F):</span>
                                    <span className="font-mono font-bold text-emerald-400 text-sm">{pulleyEffort} N</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Kuvvet Kazancı:</span>
                                    <span className="font-mono font-bold text-indigo-300">{pulleyAdvantage} Kat</span>
                                </div>
                                <div className="text-[10.5px] text-amber-300/90 pt-1 border-t border-white/10 leading-tight">
                                    Yükün h kadar yükselmesi için ip{' '}
                                    <span className="font-bold underline">{pulleyAdvantage}h</span> çekilmelidir.
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'inclined_plane' && (
                        <>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Yük (P)</span>
                                    <span className="font-bold text-red-400">{planeLoad} N</span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={200}
                                    step={10}
                                    value={planeLoad}
                                    onChange={(e) => setPlaneLoad(Number(e.target.value))}
                                    className="w-full accent-red-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Yükseklik (h)</span>
                                    <span className="font-bold text-amber-400">{planeHeight} m</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={4}
                                    step={0.5}
                                    value={planeHeight}
                                    onChange={(e) => setPlaneHeight(Number(e.target.value))}
                                    className="w-full accent-amber-400"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Rampa Boyu (L)</span>
                                    <span className="font-bold text-purple-400">{planeLength} m</span>
                                </div>
                                <input
                                    type="range"
                                    min={Math.ceil(planeHeight + 1)}
                                    max={10}
                                    step={0.5}
                                    value={planeLength}
                                    onChange={(e) => setPlaneLength(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>

                            <div className="mt-auto p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Gereken Kuvvet (F):</span>
                                    <span className="font-mono font-bold text-emerald-400 text-sm">{planeEffort} N</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Kuvvet Kazancı (L/h):</span>
                                    <span className="font-mono font-bold text-indigo-300">{planeAdvantage} Kat</span>
                                </div>
                                <div className="text-[10.5px] text-amber-300/90 pt-1 border-t border-white/10 leading-tight">
                                    Eğik düzlemde L &gt; h olduğu için her zaman{' '}
                                    <span className="font-bold underline">kuvvetten kazanç</span> vardır.
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'wheel_axle' && (
                        <>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Yük (P)</span>
                                    <span className="font-bold text-red-400">{axleLoad} N</span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={200}
                                    step={10}
                                    value={axleLoad}
                                    onChange={(e) => setAxleLoad(Number(e.target.value))}
                                    className="w-full accent-red-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Silindir Yarıçapı (r)</span>
                                    <span className="font-bold text-red-400">{axleRadiusSmallR} cm</span>
                                </div>
                                <input
                                    type="range"
                                    min={5}
                                    max={25}
                                    step={1}
                                    value={axleRadiusSmallR}
                                    onChange={(e) => setAxleRadiusSmallR(Number(e.target.value))}
                                    className="w-full accent-red-400"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Çıkrık Kolu (R)</span>
                                    <span className="font-bold text-emerald-400">{axleRadiusR} cm</span>
                                </div>
                                <input
                                    type="range"
                                    min={20}
                                    max={80}
                                    step={5}
                                    value={axleRadiusR}
                                    onChange={(e) => setAxleRadiusR(Number(e.target.value))}
                                    className="w-full accent-emerald-400"
                                />
                            </div>

                            <div className="mt-auto p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Gereken Kuvvet (F):</span>
                                    <span className="font-mono font-bold text-emerald-400 text-sm">{axleEffort} N</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Kuvvet Kazancı (R/r):</span>
                                    <span className="font-mono font-bold text-indigo-300">{axleAdvantage} Kat</span>
                                </div>
                                <div className="text-[10.5px] text-amber-300/90 pt-1 border-t border-white/10 leading-tight">
                                    F · R = P · r formülü geçerlidir. Çıkrık kolu uzadıkça kuvvet kazancı artar.
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] text-indigo-200">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                        <span>
                            <strong>Önemli Kural:</strong> Basit makinelerde kuvvetten ya da yoldan kazanç sağlanabilir, ancak{' '}
                            <strong>iş veya enerjiden kazanç sağlanamaz!</strong>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
