import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const DB_NAME = 'EtkinlikSitem_PdfDB';
const DB_STORE = 'pdfs';

// ── IndexedDB Yönetimi ──────────────────────────────────────────

export function openPdfDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB bu tarayıcıda desteklenmiyor.'));
            return;
        }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(DB_STORE)) {
                db.createObjectStore(DB_STORE, { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function savePdfToDB(id: string, name: string, data: ArrayBuffer): Promise<void> {
    const db = await openPdfDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put({ id, name, data, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function loadPdfFromDB(id: string): Promise<ArrayBuffer | null> {
    try {
        const db = await openPdfDB();
        return new Promise((resolve) => {
            const tx = db.transaction(DB_STORE, 'readonly');
            const store = tx.objectStore(DB_STORE);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result?.data || null);
            req.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
}

export async function deletePdfFromDB(id: string): Promise<void> {
    try {
        const db = await openPdfDB();
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(id);
    } catch {
        // Hata durumunda yut
    }
}

export async function getRecentPdfsFromDB(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
    try {
        const db = await openPdfDB();
        return new Promise((resolve) => {
            const tx = db.transaction(DB_STORE, 'readonly');
            const store = tx.objectStore(DB_STORE);
            const req = store.getAll();
            req.onsuccess = () => {
                const list = (req.result || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    updatedAt: item.updatedAt || 0,
                }));
                list.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
                resolve(list);
            };
            req.onerror = () => resolve([]);
        });
    } catch {
        return [];
    }
}

// ── Mozilla PDF.js Yükleyici & Doküman Yönetimi ─────────────────

let pdfjsLoadingPromise: Promise<any> | null = null;

export function ensurePdfjsLoaded(): Promise<any> {
    if (typeof window === 'undefined') return Promise.reject(new Error('Window yok'));
    if ((window as any).pdfjsLib) {
        return Promise.resolve((window as any).pdfjsLib);
    }
    if (pdfjsLoadingPromise) return pdfjsLoadingPromise;

    pdfjsLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = PDFJS_CDN;
        script.async = true;
        script.onload = () => {
            const lib = (window as any).pdfjsLib;
            if (lib) {
                lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
                resolve(lib);
            } else {
                reject(new Error('pdfjsLib bulunamadı'));
            }
        };
        script.onerror = () => reject(new Error('PDF.js yüklenemedi'));
        document.head.appendChild(script);
    });

    return pdfjsLoadingPromise;
}

/**
 * PDF dosyasını Firebase Storage'a yükler ve indirme bağlantısını döner.
 * Böylece yüklenen PDF kullanıcının tüm cihazlarında (iPad, akıllı tahta, laptop, telefon) görünür.
 */
export async function uploadPdfToCloud(
    id: string,
    name: string,
    data: ArrayBuffer
): Promise<{ url: string; path: string }> {
    try {
        const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'document.pdf';
        const storagePath = `notebooks/pdfs/${id}/${sanitizedName}`;
        const storageRef = ref(storage, storagePath);
        const blob = new Blob([data], { type: 'application/pdf' });
        await uploadBytes(storageRef, blob, { contentType: 'application/pdf' });
        const url = await getDownloadURL(storageRef);
        return { url, path: storagePath };
    } catch (err) {
        console.warn('PDF Firebase Storage yükleme uyarısı:', err);
        return { url: '', path: '' };
    }
}

/**
 * Buluttaki PDF'i indirip yerel IndexedDB'ye kaydeder.
 * İlerleme yüzdesi bildirilebilir.
 */
export async function fetchAndCachePdf(
    id: string,
    url: string,
    name = 'document.pdf',
    onProgress?: (ratio: number) => void
): Promise<ArrayBuffer> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`PDF buluttan indirilemedi (${res.status} ${res.statusText})`);
    }

    const contentLength = res.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    let buffer: ArrayBuffer;
    if (res.body && totalBytes > 0 && typeof ReadableStream !== 'undefined') {
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedBytes = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                chunks.push(value);
                receivedBytes += value.length;
                if (onProgress && totalBytes > 0) {
                    onProgress(Math.min(1, receivedBytes / totalBytes));
                }
            }
        }

        const combined = new Uint8Array(receivedBytes);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }
        buffer = combined.buffer;
    } else {
        buffer = await res.arrayBuffer();
    }

    // Yerel IndexedDB'ye hemen önbellekle (sonraki açılışlarda anında yüklensin)
    try {
        await savePdfToDB(id, name, buffer);
    } catch (e) {
        console.warn('PDF IndexedDB önbellekleme hatası:', e);
    }

    return buffer;
}

const docCache = new Map<string, Promise<any>>();

export async function getPdfDocument(
    id: string,
    data?: ArrayBuffer,
    fallbackUrl?: string,
    onProgress?: (ratio: number) => void
): Promise<any> {
    if (docCache.has(id)) {
        return docCache.get(id)!;
    }

    const loadPromise = (async () => {
        const pdfjs = await ensurePdfjsLoaded();
        let buffer: ArrayBuffer | null | undefined = data;
        if (!buffer) {
            buffer = await loadPdfFromDB(id);
        }
        if (!buffer && fallbackUrl) {
            buffer = await fetchAndCachePdf(id, fallbackUrl, 'cloud-doc.pdf', onProgress);
        }
        if (!buffer) {
            throw new Error('PDF verisi bulunamadı');
        }
        const loadingTask = pdfjs.getDocument({ data: buffer });
        return loadingTask.promise;
    })();

    docCache.set(id, loadPromise);
    return loadPromise;
}

export function clearPdfDocCache(id?: string) {
    if (id) {
        docCache.delete(id);
    } else {
        docCache.clear();
    }
}
