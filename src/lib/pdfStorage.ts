import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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

export async function savePdfToDB(id: string, name: string, data: ArrayBuffer | Uint8Array): Promise<void> {
    const buffer = data instanceof Uint8Array
        ? (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
        : data.slice(0);
    if (!buffer || buffer.byteLength === 0) {
        console.warn('savePdfToDB: 0 byte veri kaydedilmeye çalışıldı, atlandı.');
        return;
    }
    const db = await openPdfDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put({ id, name, data: buffer, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function loadPdfFromDB(id: string): Promise<ArrayBuffer | null> {
    try {
        const db = await openPdfDB();
        return new Promise((resolve) => {
            const tx = db.transaction(DB_STORE, 'readwrite');
            const store = tx.objectStore(DB_STORE);
            const req = store.get(id);
            req.onsuccess = () => {
                const item = req.result;
                const data = item?.data;
                if (data && data instanceof ArrayBuffer && data.byteLength > 0) {
                    resolve(data);
                } else {
                    if (item) {
                        try {
                            store.delete(id);
                        } catch {}
                    }
                    resolve(null);
                }
            };
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
 * data parametresi File, Blob, ArrayBuffer veya Uint8Array kabul eder.
 * Dosya boyutu 0 byte ise yükleme yapılmaz ve hata döndürülür.
 */
export async function uploadPdfToCloud(
    id: string,
    name: string,
    data: ArrayBuffer | Blob | Uint8Array,
    onProgress?: (ratio: number) => void
): Promise<{ url: string; path: string; size: number; error?: string }> {
    try {
        let blob: Blob;
        let size = 0;

        if (data instanceof Blob) {
            blob = data;
            size = data.size;
        } else if (data instanceof Uint8Array) {
            size = data.byteLength;
            blob = new Blob([data.slice()], {
                type: 'application/pdf',
            });
        } else if (data instanceof ArrayBuffer) {
            size = data.byteLength;
            blob = new Blob([data.slice(0)], { type: 'application/pdf' });
        } else {
            throw new Error('Geçersiz PDF veri formatı');
        }

        if (!size || size === 0) {
            console.error(`[uploadPdfToCloud] PDF verisi boş (0 bytes)! id=${id}, name=${name}`);
            return { url: '', path: '', size: 0, error: 'Yüklenecek PDF verisi boş (0 byte).' };
        }

        const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'document.pdf';
        const storagePath = `notebooks/pdfs/${id}/${sanitizedName}`;
        const storageRef = ref(storage, storagePath);

        await new Promise<void>((resolve, reject) => {
            const task = uploadBytesResumable(storageRef, blob, {
                contentType: 'application/pdf',
                customMetadata: { originalName: name, originalSize: String(size) },
            });
            task.on(
                'state_changed',
                (snapshot) => {
                    if (onProgress && snapshot.totalBytes > 0) {
                        onProgress(Math.min(1, snapshot.bytesTransferred / snapshot.totalBytes));
                    }
                },
                (err) => reject(err),
                () => resolve()
            );
        });

        const url = await getDownloadURL(storageRef);
        return { url, path: storagePath, size };
    } catch (err: any) {
        console.warn('PDF Firebase Storage yükleme uyarısı:', err);
        return { url: '', path: '', size: 0, error: err?.message || 'Bulut yükleme hatası' };
    }
}

/**
 * Buluttaki (Firebase Storage) PDF dosyasını siler.
 */
export async function deletePdfFromCloud(storagePath?: string): Promise<void> {
    if (!storagePath) return;
    try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    } catch (err) {
        console.warn('PDF buluttan silinirken uyarı:', err);
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

    if (!buffer || buffer.byteLength === 0) {
        // İndirilen dosya boş (0 bytes) ise IndexedDB'ye kaydetme ve eski bozuk kaydı temizle
        await deletePdfFromDB(id);
        throw new Error('The PDF file is empty, i.e. its size is zero bytes.');
    }

    // Yerel IndexedDB'ye hemen önbellekle (sonraki açılışlarda anında yüklensin)
    try {
        await savePdfToDB(id, name, buffer.slice(0));
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
        try {
            const pdfjs = await ensurePdfjsLoaded();
            let buffer: ArrayBuffer | null | undefined = data ? data.slice(0) : undefined;
            if (!buffer || buffer.byteLength === 0) {
                buffer = await loadPdfFromDB(id);
            }
            if ((!buffer || buffer.byteLength === 0) && fallbackUrl) {
                buffer = await fetchAndCachePdf(id, fallbackUrl, 'cloud-doc.pdf', onProgress);
            }
            if (!buffer || buffer.byteLength === 0) {
                throw new Error('PDF verisi bulunamadı');
            }

            // PDF.js worker transferi sırasında ana buffer'ın nötrleşmesini (neutered / 0 byte)
            // önlemek için worker'a kopya TypedArray geçiriyoruz.
            const workerData = new Uint8Array(buffer.slice(0));
            const loadingTask = pdfjs.getDocument({ data: workerData });
            return await loadingTask.promise;
        } catch (err) {
            // Hata durumunda cache'i temizle ki tekrar denendiğinde takılı kalmasın
            docCache.delete(id);
            throw err;
        }
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
