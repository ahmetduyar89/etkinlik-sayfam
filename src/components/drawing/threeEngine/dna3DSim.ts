// src/components/drawing/threeEngine/dna3DSim.ts
// 3D Çift Sarmal DNA Modeli ve Baz Eşleşmesi (A-T, G-C)

import * as THREE from 'three';
import { getSharedRenderer } from './threeSharedRenderer';
import type { MathObject, Point } from '../../../types';
import type { Ctx, Rect, SimControl, SimParam } from '../objectDrawing';
import { simValue } from '../objectDrawing';

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

function initScene() {
    if (scene && camera) return { scene, camera };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(0, 0, 5.0);
    camera.lookAt(0, 0, 0);

    const amb = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    return { scene, camera };
}

export function renderDna3D(k: Ctx) {
    const { c: ctx, r, o, t = 0 } = k;
    const renderer = getSharedRenderer(Math.round(r.w * 1.5), Math.round(r.h * 1.5));
    if (!renderer) return;

    const { scene: s, camera: cam } = initScene();

    const oldGroup = s.getObjectByName('dnaGroup');
    if (oldGroup) s.remove(oldGroup);

    const dnaGroup = new THREE.Group();
    dnaGroup.name = 'dnaGroup';

    // Parametreler
    const openDist = simValue(o, 'unzip', 0) / 100; // 0 = tam sarmal, 1 = fermuar açılmış
    const rotX = (simValue(o, 'rotX', 10) * Math.PI) / 180;
    const rotY = (simValue(o, 'rotY', 0) * Math.PI) / 180;
    const autoRot = t * 0.5;

    const pairCount = 18;
    const helixRadius = 0.85;
    const height = 3.6;
    const stepY = height / pairCount;

    // Baz renkleri: Adenin: Kırmızı, Timin: Sarı, Guanin: Yeşil, Sitozin: Mavi
    const baseColors = [
        { name1: 'A', col1: 0xef4444, name2: 'T', col2: 0xfacc15 }, // A - T
        { name1: 'G', col1: 0x10b981, name2: 'C', col2: 0x3b82f6 }, // G - C
        { name1: 'T', col1: 0xfacc15, name2: 'A', col2: 0xef4444 }, // T - A
        { name1: 'C', col1: 0x3b82f6, name2: 'G', col2: 0x10b981 }, // C - G
    ];

    const sphereGeom = new THREE.SphereGeometry(0.09, 14, 14);
    const strandMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });

    for (let i = 0; i < pairCount; i++) {
        const y = -height / 2 + i * stepY;
        const theta = i * 0.45;
        const curPair = baseColors[i % baseColors.length];

        // Zincir 1 noktası
        const x1 = Math.cos(theta) * helixRadius - (openDist * 0.8);
        const z1 = Math.sin(theta) * helixRadius;

        // Zincir 2 noktası
        const x2 = -Math.cos(theta) * helixRadius + (openDist * 0.8);
        const z2 = -Math.sin(theta) * helixRadius;

        // Omurga küreleri (Şeker-Fosfat)
        const s1 = new THREE.Mesh(sphereGeom, strandMat);
        s1.position.set(x1, y, z1);
        dnaGroup.add(s1);

        const s2 = new THREE.Mesh(sphereGeom, strandMat);
        s2.position.set(x2, y, z2);
        dnaGroup.add(s2);

        // Baz Çubukları (Köprü)
        if (openDist < 0.8) {
            // Yarı yola kadar baz 1
            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;

            const b1Geom = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
            const b1Mat = new THREE.MeshStandardMaterial({ color: curPair.col1, roughness: 0.3 });
            const b1 = new THREE.Mesh(b1Geom, b1Mat);

            // Zincir 1'den ortaya
            b1.position.set((x1 + midX) / 2, y, (z1 + midZ) / 2);
            b1.scale.set(1, Math.hypot(midX - x1, midZ - z1), 1);
            b1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(midX - x1, 0, midZ - z1).normalize());
            dnaGroup.add(b1);

            // Ortadan Zincir 2'ye (Baz 2)
            const b2Mat = new THREE.MeshStandardMaterial({ color: curPair.col2, roughness: 0.3 });
            const b2 = new THREE.Mesh(b1Geom, b2Mat);
            b2.position.set((midX + x2) / 2, y, (midZ + z2) / 2);
            b2.scale.set(1, Math.hypot(x2 - midX, z2 - midZ), 1);
            b2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x2 - midX, 0, z2 - midZ).normalize());
            dnaGroup.add(b2);
        }
    }

    dnaGroup.rotation.x = rotX;
    dnaGroup.rotation.y = rotY + autoRot;
    s.add(dnaGroup);

    renderer.render(s, cam);

    const dom = renderer.domElement;
    ctx.drawImage(dom, r.x, r.y, r.w, r.h);

    if (o.labels !== false) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(r.x + 8, r.y + 8, Math.min(r.w - 16, 240), 52, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('3D Çift Sarmal DNA Modeli', r.x + 16, r.y + 26);

        ctx.font = '10px sans-serif';
        // Renk açıklamaları
        ctx.fillStyle = '#ef4444'; ctx.fillText('A (Adenin)', r.x + 16, r.y + 44);
        ctx.fillStyle = '#facc15'; ctx.fillText('T (Timin)', r.x + 75, r.y + 44);
        ctx.fillStyle = '#10b981'; ctx.fillText('G (Guanin)', r.x + 128, r.y + 44);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('C (Sitozin)', r.x + 185, r.y + 44);

        ctx.restore();
    }
}

export const DNA_3D_CONTROLS = (r: Rect, o: MathObject): SimControl[] => [
    {
        id: 'rotate',
        type: 'drag',
        x: r.x + r.w - 24,
        y: r.y + 24,
        label: '3D Döndür',
    },
];

export const DNA_3D_ON_CONTROL = (
    r: Rect,
    o: MathObject,
    id: string,
    pos: Point
): Record<string, number> => {
    if (id === 'rotate') {
        const dx = pos.x - (r.x + r.w / 2);
        const dy = pos.y - (r.y + r.h / 2);
        return {
            rotY: Math.round((dx / (r.w / 2)) * 180),
            rotX: Math.round((dy / (r.h / 2)) * 90),
        };
    }
    return {};
};

export const DNA_3D_PARAMS: SimParam[] = [
    { key: 'unzip', label: 'Eşlenme / Açılma (%)', min: 0, max: 100, step: 2 },
    { key: 'rotY', label: 'Dönüş Açısı (°)', min: -180, max: 180, step: 5 },
];
