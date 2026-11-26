// src/components/drawing/threeEngine/seasons3DSim.ts
// 3D Dünya, 23.5° Eksen Eğikliği, Aydınlanma Çemberi ve Mevsimler Simülasyonu.

import * as THREE from 'three';
import { getSharedRenderer } from './threeSharedRenderer';
import type { MathObject, Point } from '../../../types';
import type { Ctx, Rect, SimControl, SimParam } from '../objectDrawing';
import { simValue } from '../objectDrawing';

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

const SEASONS_INFO = [
    { id: 0, date: '21 Mart (İlkbahar Ekinoksu)', note: 'Ekvatora dik gelir. Gece = Gündüz (12 sa)' },
    { id: 1, date: '21 Haziran (Yaz Gündönümü)', note: 'Yengeç Dönencesine dik. KYK En Uzun Gündüz' },
    { id: 2, date: '23 Eylül (Sonbahar Ekinoksu)', note: 'Ekvatora dik gelir. Gece = Gündüz (12 sa)' },
    { id: 3, date: '21 Aralık (Kış Gündönümü)', note: 'Oğlak Dönencesine dik. GYK En Uzun Gündüz' },
];

function initScene() {
    if (scene && camera) return { scene, camera };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
    camera.position.set(0, 0.6, 4.4);
    camera.lookAt(0, 0, 0);

    const amb = new THREE.AmbientLight(0x22223b, 0.4);
    scene.add(amb);

    return { scene, camera };
}

export function renderSeasons3D(k: Ctx) {
    const { c: ctx, r, o, t = 0 } = k;
    const renderer = getSharedRenderer(Math.round(r.w * 1.5), Math.round(r.h * 1.5));
    if (!renderer) return;

    const { scene: s, camera: cam } = initScene();

    // Önceki sahne nesnelerini temizle
    const oldGroup = s.getObjectByName('earthGroup');
    if (oldGroup) s.remove(oldGroup);

    const earthGroup = new THREE.Group();
    earthGroup.name = 'earthGroup';

    // Parametreler
    const dateIdx = Math.round(simValue(o, 'season', 1)) % 4;
    const userSpin = (simValue(o, 'spin', 0) * Math.PI) / 180;
    const rotX = (simValue(o, 'rotX', 10) * Math.PI) / 180;
    const rotY = (simValue(o, 'rotY', 0) * Math.PI) / 180;
    const autoSpin = (t * 0.4) % (Math.PI * 2);

    // Güneş Işığı Konumu: Mevsim tarihine göre güneş açısı
    // 21 Mart: Güneş (3, 0, 0)
    // 21 Haziran: Güneş (3, 0, 0) ama Dünya ekseni Güneş'e doğru eğik
    // Mevsime göre Güneş'in yön açısı
    const sunAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const sunAngle = sunAngles[dateIdx];

    // Güneş ışığı (sağdan veya açıya göre)
    const oldLight = s.getObjectByName('sunLight');
    if (oldLight) s.remove(oldLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    const sunX = Math.cos(sunAngle) * 6;
    const sunZ = Math.sin(sunAngle) * 6;
    sunLight.position.set(sunX, 0, sunZ);
    sunLight.name = 'sunLight';
    s.add(sunLight);

    // 1. Dünya Küresi
    const sphereRadius = 1.0;
    const sphereGeom = new THREE.SphereGeometry(sphereRadius, 36, 36);
    
    // Okyanus ve kıta hatları için prosedürel materyal
    const earthMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8, // Mavi okyanus
        roughness: 0.5,
        metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(sphereGeom, earthMat);

    // Kıta çizgileri (yeşilimsi/turkuaz dekoratif enlemler)
    const gridMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(sphereRadius * 1.002, 18, 18)), gridMat);
    earthMesh.add(wire);

    // Ekvator Çemberi (Kırmızı çizgi)
    const eqGeom = new THREE.BufferGeometry();
    const eqPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        eqPts.push(Math.cos(theta) * 1.02, 0, Math.sin(theta) * 1.02);
    }
    eqGeom.setAttribute('position', new THREE.Float32BufferAttribute(eqPts, 3));
    const eqLine = new THREE.Line(eqGeom, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 }));
    earthMesh.add(eqLine);

    // Yengeç Dönencesi (23.5° K - Sarı)
    const yLat = (23.5 * Math.PI) / 180;
    const yR = Math.cos(yLat) * 1.02;
    const yY = Math.sin(yLat) * 1.02;
    const yGeom = new THREE.BufferGeometry();
    const yPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        yPts.push(Math.cos(theta) * yR, yY, Math.sin(theta) * yR);
    }
    yGeom.setAttribute('position', new THREE.Float32BufferAttribute(yPts, 3));
    const yLine = new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 1 }));
    earthMesh.add(yLine);

    // Oğlak Dönencesi (23.5° G - Turuncu)
    const oY = -Math.sin(yLat) * 1.02;
    const oGeom = new THREE.BufferGeometry();
    const oPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        oPts.push(Math.cos(theta) * yR, oY, Math.sin(theta) * yR);
    }
    oGeom.setAttribute('position', new THREE.Float32BufferAttribute(oPts, 3));
    const oLine = new THREE.Line(oGeom, new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 1 }));
    earthMesh.add(oLine);

    // Dönme Ekseni Çubuğu (Kuzey ve Güney kutup noktalarından geçen çubuk)
    const axisGeom = new THREE.CylinderGeometry(0.02, 0.02, 2.7, 16);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const axisMesh = new THREE.Mesh(axisGeom, axisMat);
    earthMesh.add(axisMesh);

    // Kendi ekseni etrafında dönüş
    earthMesh.rotation.y = autoSpin + userSpin;

    // 23.5° EKSEN EĞİKLİĞİ (Z ekseninde 23.5° yatıklık)
    const tiltRadian = (23.5 * Math.PI) / 180;
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = tiltRadian;
    tiltGroup.add(earthMesh);

    earthGroup.add(tiltGroup);

    // Kullanıcının kamerayı veya sahneyi döndürmesi
    earthGroup.rotation.x = rotX;
    earthGroup.rotation.y = rotY;
    s.add(earthGroup);

    // Render et
    renderer.render(s, cam);

    // 2D Canvas'a aktar
    const dom = renderer.domElement;
    ctx.drawImage(dom, r.x, r.y, r.w, r.h);

    // Bilgi kartları ve Güneş Işınları yön çizgileri
    if (o.labels !== false) {
        ctx.save();
        const info = SEASONS_INFO[dateIdx] ?? SEASONS_INFO[1];

        // Bilgi kutusu
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(r.x + 8, r.y + 8, Math.min(r.w - 16, 260), 54, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(info.date, r.x + 16, r.y + 26);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px sans-serif';
        ctx.fillText(info.note, r.x + 16, r.y + 42);
        ctx.fillText('Eksen Eğikliği: 23° 27\' (Sabit)', r.x + 16, r.y + 54);

        // Güneş Işınları Oku (Sağ veya sol taraftan gelen sarı ışın demetleri)
        ctx.strokeStyle = '#facc15';
        ctx.fillStyle = '#facc15';
        ctx.lineWidth = 2;
        const arrowStartX = r.x + r.w - 30;
        const arrowEndX = r.x + r.w - 85;
        const rayY = r.y + r.h / 2;

        for (let dy = -28; dy <= 28; dy += 28) {
            ctx.beginPath();
            ctx.moveTo(arrowStartX, rayY + dy);
            ctx.lineTo(arrowEndX, rayY + dy);
            ctx.stroke();
            // Ok ucu
            ctx.beginPath();
            ctx.moveTo(arrowEndX, rayY + dy);
            ctx.lineTo(arrowEndX + 8, rayY + dy - 4);
            ctx.lineTo(arrowEndX + 8, rayY + dy + 4);
            ctx.fill();
        }
        ctx.font = 'bold 9.5px sans-serif';
        ctx.fillText('☀️ GÜNEŞ IŞINLARI', arrowStartX - 90, rayY - 38);

        ctx.restore();
    }
}

export const SEASONS_3D_CONTROLS = (r: Rect, o: MathObject): SimControl[] => {
    return [
        {
            id: 'rotate',
            type: 'drag',
            x: r.x + r.w - 24,
            y: r.y + 24,
            label: 'Bakış Açısını Değiştir',
        },
    ];
};

export const SEASONS_3D_ON_CONTROL = (
    r: Rect,
    o: MathObject,
    id: string,
    pos: Point
): Record<string, number> => {
    if (id === 'rotate') {
        const dx = pos.x - (r.x + r.w / 2);
        const dy = pos.y - (r.y + r.h / 2);
        const rotY = Math.round((dx / (r.w / 2)) * 180);
        const rotX = Math.round((dy / (r.h / 2)) * 90);
        return { rotX, rotY };
    }
    return {};
};

export const SEASONS_3D_PARAMS: SimParam[] = [
    { key: 'season', label: 'Tarih (0: 21 Mart, 1: 21 Haz, 2: 23 Eyl, 3: 21 Ara)', min: 0, max: 3, step: 1 },
    { key: 'spin', label: 'Dünya Dönüşü (°)', min: 0, max: 360, step: 10 },
    { key: 'rotY', label: 'Yatay Bakış Açısı (°)', min: -180, max: 180, step: 5 },
];
