// src/components/drawing/imageStore.ts
// Sayfaya eklenen fotoğrafların yüklenme önbelleği ve içe aktarma sıkıştırması.
//
// Görseller Firestore'daki sayfa verisinin içine data URL olarak gömülür.
// Bunun iki sebebi var:
//  1. Tuval dışa aktarımı (PNG indirme) çalışmaya devam eder — uzak bir URL
//     canvas'ı "kirletir" (tainted) ve toDataURL çağrısı hata verir.
//  2. Ayrı bir depolama kuralı/CORS ayarı gerekmez.
// Karşılığında boyut önemlidir: Firestore doküman sınırı 1 MiB olduğu için
// görseller içe aktarılırken agresif biçimde küçültülür.

/** Tek bir görselin hedeflediği azami kodlanmış boyut. */
export const IMAGE_TARGET_BYTES = 190 * 1024;
/** Bir defter içeriğinin güvenli kabul edilen azami boyutu (1 MiB sınırı için pay bırakır). */
export const CONTENT_LIMIT_BYTES = 880 * 1024;

const cache = new Map<string, HTMLImageElement>();
const listeners = new Set<() => void>();

/** Bir görsel yüklendiğinde haber verir; abonelikten çıkma fonksiyonu döner. */
export function onImageReady(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

/**
 * Önbellekten görseli döndürür. İlk çağrıda yüklemeyi başlatır ve
 * hazır olmadığı için `null` verir; yükleme bitince aboneler uyarılır.
 */
export function getImage(src: string): HTMLImageElement | null {
    const cached = cache.get(src);
    if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;

    const img = new Image();
    cache.set(src, img);
    img.onload = () => listeners.forEach((cb) => cb());
    img.onerror = () => listeners.forEach((cb) => cb());
    img.src = src;
    return null;
}

export interface ImportedImage {
    dataUrl: string;
    width: number;
    height: number;
    bytes: number;
}

const loadFile = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Görsel okunamadı.'));
        };
        img.src = url;
    });

/** data URL'in yaklaşık bayt karşılığı (base64 kodlaması ~4/3 büyütür). */
export const dataUrlBytes = (dataUrl: string): number => {
    const comma = dataUrl.indexOf(',');
    if (comma < 0) return dataUrl.length;
    return Math.round(((dataUrl.length - comma - 1) * 3) / 4);
};

/**
 * Bir dosyayı sayfaya gömülebilecek boyutta JPEG data URL'e çevirir.
 * Hedef boyutun altına inene kadar önce kaliteyi, sonra çözünürlüğü düşürür.
 */
export async function importImageFile(
    file: File,
    targetBytes = IMAGE_TARGET_BYTES
): Promise<ImportedImage> {
    if (!file.type.startsWith('image/')) throw new Error('Yalnızca görsel dosyaları eklenebilir.');
    const img = await loadFile(file);
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('Görsel boyutu okunamadı.');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Görsel işlenemedi.');

    let maxDim = 1100;
    let best: ImportedImage | null = null;

    // Çözünürlük ve kalite kademeleri: ilk yeterince küçük sonuç kabul edilir.
    for (let attempt = 0; attempt < 4; attempt++) {
        const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * ratio));
        const h = Math.max(1, Math.round(img.naturalHeight * ratio));
        canvas.width = w;
        canvas.height = h;
        // JPEG saydamlığı desteklemediği için zemin beyaz doldurulur.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        for (const quality of [0.78, 0.62, 0.48]) {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const bytes = dataUrlBytes(dataUrl);
            if (!best || bytes < best.bytes) best = { dataUrl, width: w, height: h, bytes };
            if (bytes <= targetBytes) return { dataUrl, width: w, height: h, bytes };
        }
        maxDim = Math.round(maxDim * 0.72);
    }

    if (!best) throw new Error('Görsel sıkıştırılamadı.');
    return best;
}
