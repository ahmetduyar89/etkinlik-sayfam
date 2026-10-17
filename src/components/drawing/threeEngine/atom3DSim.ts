// src/components/drawing/threeEngine/atom3DSim.ts
// 3D Atom Modeli, Çekirdek (Proton/Nötron) ve 3D Elektron Yörüngeleri

import * as THREE from 'three';
import { getSharedRenderer } from './threeSharedRenderer';
import type { MathObject, Point } from '../../../types';
import type { Ctx, Rect, SimControl, SimParam } from '../objectDrawing';
import { simValue } from '../objectDrawing';

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

const ELEMENTS = [
    { z: 1, sym: 'H', name: 'Hidrojen', p: 1, n: 0, e: 1 },
    { z: 2, sym: 'He', name: 'Helyum', p: 2, n: 2, e: 2 },
    { z: 3, sym: 'Li', name: 'Lityum', p: 3, n: 4, e: 3 },
    { z: 6, sym: 'C', name: 'Karbon', p: 6, n: 6, e: 6 },
    { z: 8, sym: 'O', name: 'Oksijen', p: 8, n: 8, e: 8 },
    { z: 11, sym: 'Na', name: 'Sodyum', p: 11, n: 12, e: 11 },
];

function initScene() {
    if (scene && camera) return { scene, camera };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(0, 0, 5.0);
    camera.lookAt(0, 0, 0);

    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(4, 5, 6);
    scene.add(dir);

    return { scene, camera };
}

export function renderAtom3D(k: Ctx) {
    const { c: ctx, r, o, t = 0 } = k;
    const renderer = getSharedRenderer(Math.round(r.w * 1.5), Math.round(r.h * 1.5));
    if (!renderer) return;

    const { scene: s, camera: cam } = initScene();

    const oldGroup = s.getObjectByName('atomGroup');
    if (oldGroup) s.remove(oldGroup);

    const atomGroup = new THREE.Group();
    atomGroup.name = 'atomGroup';

    // Parametreler
    const elemIdx = Math.min(ELEMENTS.length - 1, Math.max(0, Math.round(simValue(o, 'element', 3))));
    const curElem = ELEMENTS[elemIdx];
    const rotX = (simValue(o, 'rotX', 15) * Math.PI) / 180;
    const rotY = (simValue(o, 'rotY', 0) * Math.PI) / 180;

    // 1. Çekirdek (Nucleus) - Protonlar (kırmızı) ve Nötronlar (gri)
    const nucleusGroup = new THREE.Group();
    const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const nMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    const partGeom = new THREE.SphereGeometry(0.12, 16, 16);

    const totalParts = curElem.p + curElem.n;
    for (let i = 0; i < totalParts; i++) {
        const isProton = i < curElem.p;
        const mesh = new THREE.Mesh(partGeom, isProton ? pMat : nMat);
        // Çekirdek kümeleme (Fibonacci sphere dağılımı)
        const phi = Math.acos(-1 + (2 * i) / Math.max(1, totalParts));
        const theta = Math.sqrt(totalParts * Math.PI) * phi;
        const rad = 0.28 * Math.pow(totalParts / 8, 0.33);
        mesh.position.set(
            rad * Math.cos(theta) * Math.sin(phi),
            rad * Math.sin(theta) * Math.sin(phi),
            rad * Math.cos(phi)
        );
        nucleusGroup.add(mesh);
    }
    atomGroup.add(nucleusGroup);

    // 2. Elektron Yörüngeleri & Dönen Elektronlar
    const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4 });

    // Elektron katman dağılımı (2, 8, 18...)
    let remainingE = curElem.e;
    const shellCapacities = [2, 8, 8];
    let shellIndex = 0;

    while (remainingE > 0 && shellIndex < shellCapacities.length) {
        const countInShell = Math.min(remainingE, shellCapacities[shellIndex]);
        const shellRadius = 1.0 + shellIndex * 0.7;

        for (let i = 0; i < countInShell; i++) {
            const orbitGroup = new THREE.Group();
            // Farklı yörünge eğimleri
            const tilt = (i * Math.PI) / countInShell + (shellIndex * 0.4);
            orbitGroup.rotation.x = Math.sin(tilt) * 0.9;
            orbitGroup.rotation.y = Math.cos(tilt) * 0.9;

            // Yörünge elips çizgisi
            const pts: THREE.Vector3[] = [];
            for (let a = 0; a <= 48; a++) {
                const ang = (a / 48) * Math.PI * 2;
                pts.push(new THREE.Vector3(Math.cos(ang) * shellRadius, Math.sin(ang) * shellRadius, 0));
            }
            const orbitGeom = new THREE.BufferGeometry().setFromPoints(pts);
            const orbitLine = new THREE.Line(orbitGeom, orbitMat);
            orbitGroup.add(orbitLine);

            // Dönen Elektron
            const speed = (2.2 - shellIndex * 0.5);
            const electronAngle = t * speed + (i * (Math.PI * 2)) / countInShell;
            const electron = new THREE.Mesh(eGeom, eMat);
            electron.position.set(
                Math.cos(electronAngle) * shellRadius,
                Math.sin(electronAngle) * shellRadius,
                0
            );
            orbitGroup.add(electron);

            atomGroup.add(orbitGroup);
        }

        remainingE -= countInShell;
        shellIndex++;
    }

    atomGroup.rotation.x = rotX;
    atomGroup.rotation.y = rotY + t * 0.15;
    s.add(atomGroup);

    renderer.render(s, cam);

    const dom = renderer.domElement;
    ctx.drawImage(dom, r.x, r.y, r.w, r.h);

    if (o.labels !== false) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(r.x + 8, r.y + 8, Math.min(r.w - 16, 210), 50, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`3D Atom: ${curElem.name} (${curElem.sym})`, r.x + 16, r.y + 26);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Proton: ${curElem.p} | Nötron: ${curElem.n} | Elektron: ${curElem.e}`, r.x + 16, r.y + 44);

        ctx.restore();
    }
}

export const ATOM_3D_CONTROLS = (r: Rect, o: MathObject): SimControl[] => [
    {
        id: 'rotate',
        type: 'drag',
        x: r.x + r.w - 24,
        y: r.y + 24,
        label: '3D Döndür',
    },
];

export const ATOM_3D_ON_CONTROL = (
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

export const ATOM_3D_PARAMS: SimParam[] = [
    { key: 'element', label: 'Element (0:H, 1:He, 2:Li, 3:C, 4:O, 5:Na)', min: 0, max: 5, step: 1 },
    { key: 'rotY', label: 'Döndürme Açısı (°)', min: -180, max: 180, step: 5 },
];
