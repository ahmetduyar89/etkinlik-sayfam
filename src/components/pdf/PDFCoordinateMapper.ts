// src/components/pdf/PDFCoordinateMapper.ts
// Merkezi PDF Sayfa Koordinat Dönüştürücüsü.
// Tüm anotasyon, çizim, seçim ve dışa aktarma işlemlerinde
// ekran koordinatları (screen px) ile bağımsız PDF sayfa noktaları (PDF pt)
// arasındaki çift yönlü hassas dönüşümleri yönetir.

import type { Point, Viewport } from '../../types';

export interface PDFPageBox {
    w: number;
    h: number;
    rotation?: number; // 0, 90, 180, 270
}

export interface PDFRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class PDFCoordinateMapper {
    /**
     * Ekran koordinatını (ClientX, ClientY) PDF dünya koordinatına çevirir.
     */
    static screenToWorld(clientX: number, clientY: number, view: Viewport): Point {
        return {
            x: (clientX - view.tx) / view.scale,
            y: (clientY - view.ty) / view.scale,
        };
    }

    /**
     * Dünya koordinatını ekran piksel koordinatına çevirir.
     */
    static worldToScreen(worldPt: Point, view: Viewport): Point {
        return {
            x: worldPt.x * view.scale + view.tx,
            y: worldPt.y * view.scale + view.ty,
        };
    }

    /**
     * Dünya koordinatını PDF sayfa koordinatına çevirir.
     * Sayfa dönüş açısı (rotation: 0, 90, 180, 270) hesaba katılır.
     */
    static worldToPdfPoint(worldPt: Point, pageBox: PDFPageBox): Point {
        const rot = (pageBox.rotation || 0) % 360;
        const x = worldPt.x;
        const y = worldPt.y;

        switch (rot) {
            case 90:
                return { x: y, y: pageBox.w - x };
            case 180:
                return { x: pageBox.w - x, y: pageBox.h - y };
            case 270:
                return { x: pageBox.h - y, y: x };
            case 0:
            default:
                return { x, y };
        }
    }

    /**
     * PDF sayfa koordinatını dünya koordinatına çevirir.
     */
    static pdfToWorldPoint(pdfPt: Point, pageBox: PDFPageBox): Point {
        const rot = (pageBox.rotation || 0) % 360;
        const x = pdfPt.x;
        const y = pdfPt.y;

        switch (rot) {
            case 90:
                return { x: pageBox.w - y, y: x };
            case 180:
                return { x: pageBox.w - x, y: pageBox.h - y };
            case 270:
                return { x: y, y: pageBox.h - x };
            case 0:
            default:
                return { x, y };
        }
    }

    /**
     * Ekran koordinatından doğrudan normalize edilmiş PDF oranına (0..1) çevirir.
     */
    static screenToNormalizedPdf(clientX: number, clientY: number, view: Viewport, pageBox: PDFPageBox): Point {
        const world = this.screenToWorld(clientX, clientY, view);
        const pdf = this.worldToPdfPoint(world, pageBox);
        return {
            x: Math.max(0, Math.min(1, pdf.x / (pageBox.w || 1))),
            y: Math.max(0, Math.min(1, pdf.y / (pageBox.h || 1))),
        };
    }

    /**
     * Normalize edilmiş PDF oranından (0..1) ekran koordinatına çevirir.
     */
    static normalizedPdfToScreen(normPt: Point, view: Viewport, pageBox: PDFPageBox): Point {
        const pdfPt: Point = {
            x: normPt.x * (pageBox.w || 1),
            y: normPt.y * (pageBox.h || 1),
        };
        const world = this.pdfToWorldPoint(pdfPt, pageBox);
        return this.worldToScreen(world, view);
    }

    /**
     * PDF dikdörtgenini dünya dikdörtgenine dönüştürür.
     */
    static pdfToWorldRect(rect: PDFRect, pageBox: PDFPageBox): PDFRect {
        const p1 = this.pdfToWorldPoint({ x: rect.x, y: rect.y }, pageBox);
        const p2 = this.pdfToWorldPoint({ x: rect.x + rect.width, y: rect.y + rect.height }, pageBox);

        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);

        return { x, y, width, height };
    }

    /**
     * Dünya dikdörtgenini ekran piksel dikdörtgenine dönüştürür.
     */
    static worldToScreenRect(rect: PDFRect, view: Viewport): PDFRect {
        return {
            x: rect.x * view.scale + view.tx,
            y: rect.y * view.scale + view.ty,
            width: rect.width * view.scale,
            height: rect.height * view.scale,
        };
    }
}
