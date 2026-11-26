// src/components/drawing/threeEngine/threeSharedRenderer.ts
// Akıllı tahta ve defter uygulamasında WebGL context sınırına (max 8-16) takılmamak
// ve performansı en üst seviyede tutmak için TEK bir paylaşımlı Three.js WebGLRenderer kullanır.

import * as THREE from 'three';

let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedCanvas: HTMLCanvasElement | null = null;

export function getSharedRenderer(width = 512, height = 512): THREE.WebGLRenderer | null {
    if (typeof window === 'undefined') return null;

    if (!sharedRenderer) {
        try {
            sharedCanvas = document.createElement('canvas');
            sharedCanvas.width = width;
            sharedCanvas.height = height;
            sharedRenderer = new THREE.WebGLRenderer({
                canvas: sharedCanvas,
                alpha: true,
                antialias: true,
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance',
            });
            sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            sharedRenderer.setSize(width, height, false);
            sharedRenderer.toneMapping = THREE.ACESFilmicToneMapping;
            sharedRenderer.toneMappingExposure = 1.1;
        } catch (err) {
            console.warn('[ThreeEngine] WebGLRenderer başlatılamadı:', err);
            return null;
        }
    } else if (sharedCanvas && (sharedCanvas.width !== width || sharedCanvas.height !== height)) {
        sharedCanvas.width = width;
        sharedCanvas.height = height;
        sharedRenderer.setSize(width, height, false);
    }

    return sharedRenderer;
}

export function getSharedCanvas(): HTMLCanvasElement | null {
    return sharedCanvas;
}
