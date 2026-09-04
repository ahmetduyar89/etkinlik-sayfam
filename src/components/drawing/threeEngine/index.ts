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
