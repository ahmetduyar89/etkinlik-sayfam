// src/components/notebooks/pageCodec.ts
// Defter sayfalarının Firestore'a yazılan JSON gösterimi.
//
// Ham `JSON.stringify` el yazısında çok pahalıya geliyordu: işaretçiden gelen
// koordinatlar tam kayan noktalı yazıldığı için tek bir nokta ~60 bayt
// tutuyordu. Burada nokta, alan adları olmadan `[x, y, p]` dizisi olarak
// kodlanır; koordinatlar 0,1 piksele, uç baskısı 0,01'e yuvarlanır ve
// yuvarlamadan sonra üst üste düşen noktalar atılır. Ekranda fark edilmez,
// veri dörtte birine iner.
//
// Okuma hem yeni dizi biçimini hem eski `{x, y, p}` biçimini kabul eder;
// eski defterler olduğu gibi açılır.
import type { NotebookPage, Point, Stroke, TextBoxData } from '../../types';

/** Koordinat yuvarlaması: 0,1 piksel. */
const r1 = (n: number): number => Math.round(n * 10) / 10;
/** Uç baskısı yuvarlaması: 0,01. */
const r2 = (n: number): number => Math.round(n * 100) / 100;

/** Kodlanmış nokta: `[x, y]` veya baskılı kalemlerde `[x, y, p]`. */
type PackedPoint = [number, number] | [number, number, number];

const isFinitePoint = (pt: Point | undefined): pt is Point =>
    !!pt && Number.isFinite(pt.x) && Number.isFinite(pt.y);

function encodePoints(points: Point[]): PackedPoint[] {
    if (!Array.isArray(points)) return [];
    const out: PackedPoint[] = [];
    // İki noktalı çizimler (şekiller, görseller) köşe tanımıdır; ayıklanmaz.
    const dedupe = points.length > 2;
    for (const pt of points) {
        if (!isFinitePoint(pt)) continue;
        const x = r1(pt.x);
        const y = r1(pt.y);
        const prev = out[out.length - 1];
        if (dedupe && prev && prev[0] === x && prev[1] === y) continue;
        out.push(
            typeof pt.p === 'number' && Number.isFinite(pt.p) ? [x, y, r2(pt.p)] : [x, y]
        );
    }
    // Tümü ayıklanırsa çizim kaybolmasın diye ilk nokta korunur.
    if (out.length === 0 && isFinitePoint(points[0])) {
        out.push([r1(points[0].x), r1(points[0].y)]);
    }
    return out;
}

function decodePoints(raw: unknown): Point[] {
    if (!Array.isArray(raw)) return [];
    const out: Point[] = [];
    for (const item of raw) {
        if (Array.isArray(item)) {
            const [x, y, p] = item as number[];
            if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
            out.push(Number.isFinite(p) ? { x, y, p } : { x, y });
        } else if (item && typeof item === 'object') {
            // Eski biçim: {x, y, p}
            const pt = item as Point;
            if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) continue;
            out.push(
                typeof pt.p === 'number' && Number.isFinite(pt.p)
                    ? { x: pt.x, y: pt.y, p: pt.p }
                    : { x: pt.x, y: pt.y }
            );
        }
    }
    return out;
}

const encodeBox = (box: TextBoxData): TextBoxData => ({ ...box, x: r1(box.x), y: r1(box.y) });

/** Sayfaları Firestore'a yazılacak JSON'a çevirir. */
export function encodePages(pages: NotebookPage[]): string {
    return JSON.stringify(
        pages.map((page) => ({
            strokes: (page.strokes ?? []).map((stroke) => ({
                ...stroke,
                points: encodePoints(stroke.points),
            })),
            boxes: (page.boxes ?? []).map(encodeBox),
        }))
    );
}

const emptyPage = (): NotebookPage => ({ strokes: [], boxes: [] });

/**
 * Kaydedilmiş JSON'u sayfalara çevirir. Bozuk veri tek boş sayfa döner;
 * `strict` verilirse hata fırlatır — okunamayan bir içeriği boş defter gibi
 * açmak, sonraki otomatik kayıtta gerçek veriyi silmek olurdu.
 */
export function decodePages(raw?: string, strict = false): NotebookPage[] {
    if (!raw) return [emptyPage()];
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        if (strict) throw e;
        return [emptyPage()];
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
        if (strict) throw new Error('Defter içeriği okunamadı.');
        return [emptyPage()];
    }
    return parsed.map((page) => {
        const p = page as { strokes?: unknown; boxes?: unknown };
        const strokes = Array.isArray(p?.strokes)
            ? (p.strokes as Stroke[]).map((stroke) => ({
                  ...stroke,
                  points: decodePoints((stroke as { points?: unknown }).points),
              }))
            : [];
        return { strokes, boxes: Array.isArray(p?.boxes) ? (p.boxes as TextBoxData[]) : [] };
    });
}

/**
 * Metnin UTF-8 bayt uzunluğu. Firestore sınırı baytla ölçülür; Türkçe
 * karakterler tek karakterde 2 bayt tuttuğu için `length` yanıltıcıdır.
 */
export function utf8Bytes(text: string): number {
    let bytes = text.length;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < 0x80) continue;
        if (code < 0x800) bytes += 1;
        // Vekil çift: iki karakter toplam 4 bayt eder.
        else if (code >= 0xd800 && code <= 0xdfff) bytes += 1;
        else bytes += 2;
    }
    return bytes;
}

/** Metni, hiçbir parçası `maxBytes`'ı aşmayacak biçimde böler. */
export function splitByBytes(text: string, maxBytes: number): string[] {
    if (utf8Bytes(text) <= maxBytes) return [text];
    const parts: string[] = [];
    let start = 0;
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        const high = code >= 0xd800 && code <= 0xdbff;
        const size = code < 0x80 ? 1 : code < 0x800 ? 2 : high ? 4 : 3;
        if (bytes + size > maxBytes && i > start) {
            parts.push(text.slice(start, i));
            start = i;
            bytes = 0;
        }
        bytes += size;
        // Vekil çiftin ikinci karakteri aynı parçada kalmalı.
        if (high) i++;
    }
    parts.push(text.slice(start));
    return parts;
}

export interface PagesMeasure {
    /** Kaydedilecek JSON. */
    json: string;
    /** JSON'un UTF-8 bayt uzunluğu. */
    bytes: number;
    /** Bunun içinde gömülü fotoğrafların kapladığı bayt. */
    imageBytes: number;
}

/** Sayfaları kodlar ve boyutunu ölçer. */
export function measurePages(pages: NotebookPage[]): PagesMeasure {
    const json = encodePages(pages);
    let imageBytes = 0;
    for (const page of pages) {
        for (const stroke of page.strokes ?? []) {
            if (stroke.tool === 'image' && stroke.src) imageBytes += stroke.src.length;
        }
    }
    return { json, bytes: utf8Bytes(json), imageBytes };
}
