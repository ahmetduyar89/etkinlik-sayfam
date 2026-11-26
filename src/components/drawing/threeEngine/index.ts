// src/components/drawing/threeEngine/index.ts
// Three.js tabanlı 3D simülasyonların kayıt kütüğü ve kütüphane tanımları.

import type { MathObjectKind } from '../../../types';
import type { MathCatalogItem, Renderer, SimSpec } from '../objectDrawing';
import {
    renderSolids3D,
    SOLIDS_3D_CONTROLS,
    SOLIDS_3D_ON_CONTROL,
    SOLIDS_3D_PARAMS,
} from './solids3DSim';
import {
    renderSeasons3D,
    SEASONS_3D_CONTROLS,
    SEASONS_3D_ON_CONTROL,
    SEASONS_3D_PARAMS,
} from './seasons3DSim';
import {
    renderAtom3D,
    ATOM_3D_CONTROLS,
    ATOM_3D_ON_CONTROL,
    ATOM_3D_PARAMS,
} from './atom3DSim';
import {
    renderDna3D,
    DNA_3D_CONTROLS,
    DNA_3D_ON_CONTROL,
    DNA_3D_PARAMS,
} from './dna3DSim';

export const THREE_SIM_RENDERERS: Partial<Record<MathObjectKind, Renderer>> = {
    tool_3d_station: (k) => {
        const { c, r } = k;
        c.save();
        c.strokeStyle = '#6366f1';
        c.lineWidth = 1.8;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2 - 4;
        const s = Math.min(r.w, r.h) * 0.3;

        // Üst yüz
        c.beginPath();
        c.moveTo(cx, cy - s);
        c.lineTo(cx + s * 0.86, cy - s * 0.5);
        c.lineTo(cx, cy);
        c.lineTo(cx - s * 0.86, cy - s * 0.5);
        c.closePath();
        c.fillStyle = 'rgba(99, 102, 241, 0.3)';
        c.fill();
        c.stroke();

        // Sol yüz
        c.beginPath();
        c.moveTo(cx - s * 0.86, cy - s * 0.5);
        c.lineTo(cx, cy);
        c.lineTo(cx, cy + s);
        c.lineTo(cx - s * 0.86, cy + s * 0.5);
        c.closePath();
        c.fillStyle = 'rgba(168, 85, 247, 0.3)';
        c.fill();
        c.stroke();

        // Sağ yüz
        c.beginPath();
        c.moveTo(cx + s * 0.86, cy - s * 0.5);
        c.lineTo(cx, cy);
        c.lineTo(cx, cy + s);
        c.lineTo(cx + s * 0.86, cy + s * 0.5);
        c.closePath();
        c.fillStyle = 'rgba(236, 72, 153, 0.3)';
        c.fill();
        c.stroke();

        c.font = 'bold 9px sans-serif';
        c.fillStyle = '#818cf8';
        c.textAlign = 'center';
        c.fillText('3D LAB', cx, cy + s + 12);
        c.restore();
    },
    solids_3d_sim: renderSolids3D,
    seasons_3d_sim: renderSeasons3D,
    atom_3d_sim: renderAtom3D,
    dna_3d_sim: renderDna3D,
};

export const THREE_SIM_SPECS: Partial<Record<MathObjectKind, SimSpec>> = {
    solids_3d_sim: {
        animated: false,
        controls: SOLIDS_3D_CONTROLS,
        onControl: SOLIDS_3D_ON_CONTROL,
        params: SOLIDS_3D_PARAMS,
    },
    seasons_3d_sim: {
        animated: true,
        controls: SEASONS_3D_CONTROLS,
        onControl: SEASONS_3D_ON_CONTROL,
        params: SEASONS_3D_PARAMS,
    },
    atom_3d_sim: {
        animated: true,
        controls: ATOM_3D_CONTROLS,
        onControl: ATOM_3D_ON_CONTROL,
        params: ATOM_3D_PARAMS,
    },
    dna_3d_sim: {
        animated: true,
        controls: DNA_3D_CONTROLS,
        onControl: DNA_3D_ON_CONTROL,
        params: DNA_3D_PARAMS,
    },
};

export const THREE_SIM_ITEMS: MathCatalogItem[] = [
    {
        kind: 'tool_3d_station',
        label: '✨ 3D Laboratuvar İstasyonu',
        hint: 'Kusursuz dokunmatik 3D döndürme, katı cisim açınımı, mevsimler, atom, DNA ve GeoGebra 3D',
        size: { w: 480, h: 360 },
        defaults: {},
    },
    {
        kind: 'solids_3d_sim',
        label: '3D Katı Cisimler & Açınım',
        hint: 'Küp, piramit, silindir, koni; 360° çevir ve sürgüyle düzleme aç/katla (GeoGebra 3D)',
        size: { w: 460, h: 350 },
        defaults: {
            labels: true,
            sim: { shape: 0, fold: 90, rotX: 20, rotY: -35 },
        },
    },
    {
        kind: 'seasons_3d_sim',
        label: '3D Dünya, Eksen Eğikliği & Mevsimler',
        hint: '23.5° eksen eğikliği, aydınlanma çemberi, 21 Haziran/Aralık Güneş geliş açısı',
        size: { w: 480, h: 360 },
        defaults: {
            labels: true,
            sim: { season: 1, spin: 0, rotX: 10, rotY: 0 },
        },
    },
    {
        kind: 'atom_3d_sim',
        label: '3D Atom & Elektron Orbitalleri',
        hint: 'Proton-nötron çekirdeği ve 3D uzayda dönen elektron bulutları (PhET Tarzı)',
        size: { w: 460, h: 350 },
        defaults: {
            labels: true,
            sim: { element: 3, rotX: 15, rotY: 0 },
        },
    },
    {
        kind: 'dna_3d_sim',
        label: '3D Çift Sarmal DNA & Replikasyon',
        hint: 'A-T, G-C baz eşleşmeleri, 360° 3D heliks ve fermuar gibi açılma animasyonu',
        size: { w: 460, h: 360 },
        defaults: {
            labels: true,
            sim: { unzip: 0, rotX: 10, rotY: 0 },
        },
    },
];
