// src/components/drawing/threeEngine/solids3DSim.ts
// 3D Katı Cisimler ve Dinamik 2D Açınımları (Dynamic 3D Nets)
// Küp, Piramit, Silindir, Koni ve Üçgen Prizma için Three.js tabanlı katlanma/açılma mekanizması.

import * as THREE from 'three';
import { getSharedRenderer } from './threeSharedRenderer';
import type { MathObject, Point } from '../../../types';
import type { Ctx, Rect, SimControl, SimParam } from '../objectDrawing';
import { simValue } from '../objectDrawing';

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

// Cisim şekil indeksleri
export const SOLID_SHAPES = [
    { id: 0, name: 'Küp', formula: 'V = a³ | A = 6a²', faces: '6 Yüz, 8 Köşe, 12 Ayrıt' },
    { id: 1, name: 'Kare Piramit', formula: 'V = (a² · h) / 3', faces: '5 Yüz, 5 Köşe, 8 Ayrıt' },
    { id: 2, name: 'Silindir', formula: 'V = π · r² · h', faces: '3 Yüz (2 Daire, 1 Dikdörtgen)' },
    { id: 3, name: 'Koni', formula: 'V = (π · r² · h) / 3', faces: '2 Yüz (1 Daire, 1 Daire Dilimi)' },
    { id: 4, name: 'Üçgen Prizma', formula: 'V = Taban Alanı · h', faces: '5 Yüz, 6 Köşe, 9 Ayrıt' },
];

function initScene() {
    if (scene && camera) return { scene, camera };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);

    // Işıklandırma
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.6);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    return { scene, camera };
}

// Ortak materyaller
function createFaceMaterial(color: number, opacity = 0.92) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
    });
}

function createEdgeMaterial(color = 0x1e1b4b) {
    return new THREE.LineBasicMaterial({ color, linewidth: 2 });
}

/** Küp katlanma hiyerarşisi */
function buildCubeNet(group: THREE.Group, foldT: number) {
    const s = 1.0; // Kenar uzunluğu
    const half = s / 2;
    const angle = (foldT * Math.PI) / 2; // 0 (düzlem) -> 90 derece (kapalı)

    const geom = new THREE.PlaneGeometry(s, s);
    const edgesGeom = new THREE.EdgesGeometry(geom);
    const edgeMat = createEdgeMaterial(0x312e81);

    const makeFace = (color: number) => {
        const mesh = new THREE.Mesh(geom, createFaceMaterial(color));
        const line = new THREE.LineSegments(edgesGeom, edgeMat);
        mesh.add(line);
        return mesh;
    };

    // Taban (Merkez yüz)
    const base = makeFace(0x6366f1);
    base.rotation.x = -Math.PI / 2;
    group.add(base);

    // Ön yüz (Z+)
    const frontPivot = new THREE.Group();
    frontPivot.position.set(0, -half, 0); // Yerel koordinat
    const frontMesh = makeFace(0xec4899);
    frontMesh.position.set(0, -half, 0);
    frontPivot.add(frontMesh);
    frontPivot.rotation.x = -angle;
    base.add(frontPivot);

    // Arka yüz (Z-)
    const backPivot = new THREE.Group();
    backPivot.position.set(0, half, 0);
    const backMesh = makeFace(0x8b5cf6);
    backMesh.position.set(0, half, 0);
    backPivot.add(backMesh);
    backPivot.rotation.x = angle;
    base.add(backPivot);

    // Sol yüz (X-)
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-half, 0, 0);
    const leftMesh = makeFace(0x14b8a6);
    leftMesh.position.set(-half, 0, 0);
    leftPivot.add(leftMesh);
    leftPivot.rotation.y = -angle;
    base.add(leftPivot);

    // Sağ yüz (X+)
    const rightPivot = new THREE.Group();
    rightPivot.position.set(half, 0, 0);
    const rightMesh = makeFace(0xf59e0b);
    rightMesh.position.set(half, 0, 0);
    rightPivot.add(rightMesh);
    rightPivot.rotation.y = angle;
    base.add(rightPivot);

    // Üst kapak (Sağ yüzün ucuna bağlı)
    const topPivot = new THREE.Group();
    topPivot.position.set(-s, 0, 0);
    const topMesh = makeFace(0x3b82f6);
    topMesh.position.set(-half, 0, 0);
    topPivot.add(topMesh);
    topPivot.rotation.y = angle;
    rightMesh.add(topPivot);
}

/** Kare Piramit katlanma hiyerarşisi */
function buildPyramidNet(group: THREE.Group, foldT: number) {
    const s = 1.2;
    const half = s / 2;
    const h = 1.15; // Üçgen yan kenar yüksekliği

    // Taban kare
    const baseGeom = new THREE.PlaneGeometry(s, s);
    const baseEdge = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeom), createEdgeMaterial(0x1e3a8a));
    const base = new THREE.Mesh(baseGeom, createFaceMaterial(0x3b82f6));
    base.rotation.x = -Math.PI / 2;
    base.add(baseEdge);
    group.add(base);

    // Üçgen yüzler
    const triGeom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -half, 0, 0,
        half, 0, 0,
        0, h, 0,
    ]);
    triGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    triGeom.computeVertexNormals();
    const triEdges = new THREE.LineSegments(new THREE.EdgesGeometry(triGeom), createEdgeMaterial(0x1e3a8a));

    // Katlanma açısı: düzlemden (0) tepede birleşme açısına (yaklaşık 65-70 derece)
    const targetAngle = 1.12; // radyan
    const angle = foldT * targetAngle;

    const sides = [
        { x: 0, y: half, rotZ: 0, rotX: angle, color: 0xec4899 },
        { x: 0, y: -half, rotZ: Math.PI, rotX: angle, color: 0x10b981 },
        { x: half, y: 0, rotZ: -Math.PI / 2, rotX: angle, color: 0xf59e0b },
        { x: -half, y: 0, rotZ: Math.PI / 2, rotX: angle, color: 0x8b5cf6 },
    ];

    for (const side of sides) {
        const pivot = new THREE.Group();
        pivot.position.set(side.x, side.y, 0);
        pivot.rotation.z = side.rotZ;
        pivot.rotation.x = side.rotX;

        const mesh = new THREE.Mesh(triGeom, createFaceMaterial(side.color));
        mesh.add(triEdges.clone());
        pivot.add(mesh);
        base.add(pivot);
    }
}

/** Silindir ve Koni */
function buildCylinderNet(group: THREE.Group, foldT: number) {
    const r = 0.55;
    const h = 1.3;
    const fold = foldT; // 0 = düzlem açınım, 1 = katlanmış silindir

    if (fold > 0.85) {
        // Tam silindir
        const cylGeom = new THREE.CylinderGeometry(r, r, h, 32);
        const cylMesh = new THREE.Mesh(cylGeom, createFaceMaterial(0x06b6d4));
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cylGeom), createEdgeMaterial(0x0e7490));
        cylMesh.add(edges);
        group.add(cylMesh);
    } else {
        // Açınım: Orta dikdörtgen + üst ve alt daire
        const rectW = 2 * Math.PI * r * (1 - fold * 0.4);
        const rectGeom = new THREE.PlaneGeometry(rectW, h);
        const rectMesh = new THREE.Mesh(rectGeom, createFaceMaterial(0x06b6d4));
        rectMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(rectGeom), createEdgeMaterial(0x0e7490)));
        group.add(rectMesh);

        // Üst ve alt kapak
        const circleGeom = new THREE.CircleGeometry(r, 32);
        const topCircle = new THREE.Mesh(circleGeom, createFaceMaterial(0x3b82f6));
        topCircle.position.set(0, h / 2 + r + (1 - fold) * 0.1, 0);
        topCircle.rotation.x = -fold * (Math.PI / 2);
        group.add(topCircle);

        const bottomCircle = new THREE.Mesh(circleGeom, createFaceMaterial(0x10b981));
        bottomCircle.position.set(0, -(h / 2 + r + (1 - fold) * 0.1), 0);
        bottomCircle.rotation.x = fold * (Math.PI / 2);
        group.add(bottomCircle);
    }
}

/** Koni */
function buildConeNet(group: THREE.Group, foldT: number) {
    const r = 0.7;
    const h = 1.4;

    if (foldT > 0.85) {
        const coneGeom = new THREE.ConeGeometry(r, h, 32);
        const coneMesh = new THREE.Mesh(coneGeom, createFaceMaterial(0xf97316));
        coneMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(coneGeom), createEdgeMaterial(0xc2410c)));
        group.add(coneMesh);
    } else {
        // Daire dilimi ve taban dairesi
        const circleGeom = new THREE.CircleGeometry(r, 32);
        const baseCircle = new THREE.Mesh(circleGeom, createFaceMaterial(0xf59e0b));
        baseCircle.position.set(0, -0.6, 0);
        group.add(baseCircle);

        // Dilim
        const sectorGeom = new THREE.CircleGeometry(h, 32, 0, Math.PI * 1.3);
        const sectorMesh = new THREE.Mesh(sectorGeom, createFaceMaterial(0xf97316));
        sectorMesh.position.set(0, 0.4, 0);
        sectorMesh.rotation.z = Math.PI * 0.35;
        group.add(sectorMesh);
    }
}

/** 3D Katı Cisimler Sahnesini Render Eden Fonksiyon */
export function renderSolids3D(k: Ctx) {
    const { c: ctx, r, o } = k;
    const renderer = getSharedRenderer(Math.round(r.w * 1.5), Math.round(r.h * 1.5));
    if (!renderer) return;

    const { scene: s, camera: cam } = initScene();

    // Önceki nesne grubunu temizle
    const oldGroup = s.getObjectByName('solidGroup');
    if (oldGroup) s.remove(oldGroup);

    const group = new THREE.Group();
    group.name = 'solidGroup';

    // Parametreler
    const shape = Math.round(simValue(o, 'shape', 0));
    const fold = simValue(o, 'fold', 90) / 100; // 0 ile 1 arası
    const rotX = (simValue(o, 'rotX', 25) * Math.PI) / 180;
    const rotY = (simValue(o, 'rotY', -35) * Math.PI) / 180;

    // Şekle göre kur
    if (shape === 0) buildCubeNet(group, fold);
    else if (shape === 1) buildPyramidNet(group, fold);
    else if (shape === 2) buildCylinderNet(group, fold);
    else if (shape === 3) buildConeNet(group, fold);
    else buildCubeNet(group, fold);

    // Kullanıcı döndürmesi
    group.rotation.x = rotX;
    group.rotation.y = rotY;
    s.add(group);

    // Render et
    renderer.render(s, cam);

    // 2D Canvas'a aktar
    const dom = renderer.domElement;
    ctx.drawImage(dom, r.x, r.y, r.w, r.h);

    // Üzerine şık bilgi etiketi ve formül kartı çiz
    if (o.labels !== false) {
        ctx.save();
        const curInfo = SOLID_SHAPES[shape] ?? SOLID_SHAPES[0];
        
        // Üst Bilgi Kartı
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.beginPath();
        ctx.roundRect(r.x + 8, r.y + 8, Math.min(r.w - 16, 210), 48, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`3D ${curInfo.name} ${fold < 0.15 ? '(Açınım)' : fold > 0.9 ? '(Kapalı Cisim)' : '(% ' + Math.round(fold * 100) + ' Katlı)'}`, r.x + 16, r.y + 26);

        ctx.fillStyle = '#818cf8';
        ctx.font = '10.5px sans-serif';
        ctx.fillText(curInfo.formula, r.x + 16, r.y + 44);

        // Sağ alt köşe etkileşim ipucu
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '9.5px sans-serif';
        ctx.fillText('🖱 Çevir & Sürgüyle Katla', r.x + r.w - 126, r.y + r.h - 10);

        ctx.restore();
    }
}

// Simülasyon etkileşim kontrolleri
export const SOLIDS_3D_CONTROLS = (r: Rect, o: MathObject): SimControl[] => {
    // Nesnenin ortasında döndürme kontrol noktası
    return [
        {
            id: 'rotate',
            type: 'drag',
            x: r.x + r.w - 24,
            y: r.y + 24,
            label: '3D Döndür (Çevir)',
        },
    ];
};

export const SOLIDS_3D_ON_CONTROL = (
    r: Rect,
    o: MathObject,
    id: string,
    pos: Point
): Record<string, number> => {
    if (id === 'rotate') {
        const dx = pos.x - (r.x + r.w / 2);
        const dy = pos.y - (r.y + r.h / 2);
        const rotY = Math.round((dx / (r.w / 2)) * 180);
        const rotX = Math.round((dy / (r.h / 2)) * 180);
        return { rotX, rotY };
    }
    return {};
};

export const SOLIDS_3D_PARAMS: SimParam[] = [
    { key: 'shape', label: 'Cisim Türü (0:Küp, 1:Piramit, 2:Silindir, 3:Koni)', min: 0, max: 3, step: 1 },
    { key: 'fold', label: 'Katlama / Açınım (%)', min: 0, max: 100, step: 1 },
    { key: 'rotY', label: 'Yatay Dönüş (°)', min: -180, max: 180, step: 5 },
    { key: 'rotX', label: 'Dikey Eğim (°)', min: -90, max: 90, step: 5 },
];
