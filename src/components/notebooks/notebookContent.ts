import { readDraft, writeDraft, clearDraft } from '../../lib/drafts';
// src/components/notebooks/notebookContent.ts
// Defter sayfalarının Firestore'a yazılması, okunması ve cihazlar arası
// senkronu.
//
// Firestore doküman sınırı 1 MiB. Sayfa verisi (el yazısı + gömülü
// fotoğraflar) bu sınırı tek dokümanda kolayca aşıyordu; defter dolduğunda
// otomatik kayıt tümden duruyor ve kullanıcı "defter çok büyüdü" uyarısını
// yazmaya devam ettiği sürece görüyordu. Bunun yerine içerik parçalara
// bölünür:
//
//   notebook_content/{id}       → yalnızca üst veri: rev, writer, chunk_count
//   notebook_content/{id}__c0…  → sayfa JSON'unun parçaları (`chunk` alanı)
//
// Ana doküman kasıtlı olarak küçüktür: her kayıt onu işlem (transaction)
// içinde okuyup sürümü (`rev`) doğrular. Sunucudaki sürüm elimizdekinden
// yeniyse defter başka bir cihazda değişmiş demektir; hiçbir şey yazılmaz ve
// çağıran tarafa çakışma bildirilir, böylece bir cihaz diğerinin çizimlerini
// sessizce silmez.
//
// Kayıt ayrıca `notebooks/{id}` üst verisine `content_rev` yazar. Editör ve
// öğrenci görüntüleyicisi bu küçük dokümanı zaten canlı dinlediği için
// içeriğin değiştiğini ağır sayfa verisini indirmeden duyar.
//
// Eski defterlerde tüm içerik ana dokümanın `pages_json` alanındaydı; okuma
// bu biçimi de kabul eder, ilk kayıtta yeni düzene geçilir.
import { deleteDocById, fetchDocById, saveDocsTransaction } from '../../lib/firebase';
import type { DocWrite } from '../../lib/firebase';
import { decodePages, encodePages, splitByBytes, utf8Bytes } from './pageCodec';
import type { NotebookContent, NotebookPage } from '../../types';

const COLLECTION = 'notebook_content';
const NOTEBOOKS = 'notebooks';

/** Tek dokümana yazılan azami parça boyutu (1 MiB sınırına pay bırakır). */
export const CHUNK_BYTES = 700 * 1024;
/**
 * Bir defterin azami parça sayısı. Büyük defterlerin açılışını yavaşlatmamak
 * ve tek işlemdeki yazmayı Firestore'un istek boyutu sınırının altında tutmak
 * için.
 */
export const MAX_CHUNKS = 8;
/** Bir defter içeriğinin azami boyutu. */
export const MAX_CONTENT_BYTES = CHUNK_BYTES * MAX_CHUNKS;

const chunkId = (id: string, index: number): string => `${id}__c${index}`;

/**
 * Bu sekmeye özgü kimlik. Kaydedilen içerikle birlikte yazılır; canlı
 * dinleyiciler böylece kendi yazdıkları güncellemeyi geri yüklemez.
 */
export const WRITER_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Defter, son okuduğumuz sürümden sonra başka bir cihazda değişmişse atılır. */
export class NotebookConflictError extends Error {
    constructor(readonly serverRev: number) {
        super('Defter başka bir cihazda değişti.');
        this.name = 'NotebookConflictError';
    }
}

/** İçerik sınırı aşıldığında atılır; çağıran taraf kullanıcıya bildirir. */
export class NotebookTooLargeError extends Error {
    constructor(readonly bytes: number) {
        super('Defter içeriği sınırı aştı.');
        this.name = 'NotebookTooLargeError';
    }
}

/** Yüklenmiş içerik. */
export interface LoadedContent {
    isLocalDraft?: boolean;
    pages: NotebookPage[];
    /** Kayıtta artan parçaların silinebilmesi için okunan parça sayısı. */
    chunkCount: number;
    /** Okunan içeriğin sürümü; kayıtta çakışma kontrolünün dayanağı. */
    rev: number;
    /** Defterin hiç içeriği yoktu (yeni defter). */
    isEmpty: boolean;
}

/** Parça dokümanlarını sırayla okuyup birleştirir. */
async function readChunks(notebookId: string, from: number, to: number): Promise<string> {
    const parts = await Promise.all(
        Array.from({ length: to - from }, (_, i) =>
            fetchDocById<NotebookContent>(COLLECTION, chunkId(notebookId, from + i))
        )
    );
    return parts
        .map((part, i) => {
            // Eksik parçayı "boş" saymak, yarım içeriği tam sanmak olurdu.
            if (typeof part?.chunk !== 'string') {
                throw new Error(`Defterin ${from + i + 1}. bölümü okunamadı.`);
            }
            return part.chunk;
        })
        .join('');
}

/**
 * Defter içeriğini okur. Bir parça eksikse hata atar — yarım içeriği
 * "boş defter" gibi açmak, sonraki otomatik kayıtta gerçek veriyi silerdi.
 */
export async function loadNotebookPages(notebookId: string, restoreDraft = false): Promise<LoadedContent> {
    if (restoreDraft) {
        const draft = await readDraft<{ pages: NotebookPage[]; baseRev: number }>(`notebook:${notebookId}`).catch(() => null);
        if (draft) return { pages: draft.value.pages, rev: draft.value.baseRev, chunkCount: MAX_CHUNKS, isEmpty: false, isLocalDraft: true };
    }
    const main = await fetchDocById<NotebookContent>(COLLECTION, notebookId);
    const rev = main?.rev ?? 0;
    const chunkCount = Math.max(0, Math.min(MAX_CHUNKS, main?.chunk_count ?? 0));
    const legacy = typeof main?.pages_json === 'string' ? main.pages_json : '';

    if (!main || (!legacy && chunkCount === 0)) {
        return { pages: decodePages(), chunkCount: 0, rev, isEmpty: true };
    }

    // Eski düzen: ilk parça ana dokümanda, varsa kalanlar __c1'den itibaren.
    const raw = legacy
        ? legacy + (chunkCount > 1 ? await readChunks(notebookId, 1, chunkCount) : '')
        : await readChunks(notebookId, 0, chunkCount);

    // `strict`: yarım veya bozuk içerik boş defter gibi açılmamalı.
    return {
        pages: decodePages(raw, true),
        chunkCount: legacy ? Math.max(1, chunkCount) : chunkCount,
        rev,
        isEmpty: false,
    };
}

/** Kaydetme seçenekleri. */
export interface SaveOptions {
    localBackup?: boolean;
    metadata?: { collection: string; id: string; fields: Record<string, unknown> };
    /** Bir önceki kaydın parçaları; değişmeyen parça yeniden yazılmaz. */
    previous?: string[];
    /** Elimizdeki içeriğin sürümü; sunucudaki bundan yeniyse çakışma olur. */
    baseRev?: number;
    /** Çakışmayı yok sayıp sunucudaki sürümün üzerine yaz. */
    force?: boolean;
}

/** Kaydın sonucu: yazılan parçalar ve oluşan yeni sürüm. */
export interface SaveResult {
    parts: string[];
    rev: number;
}

/**
 * Defter içeriğini kaydeder. Bütün parçalar tek bir işlemde yazılır — yarıda
 * kalan bir kayıt, yeni bir parçayla eski bir parçayı birleştirip okunamaz
 * içerik bırakırdı. Sunucudaki sürüm `baseRev`'den yeniyse (defter başka bir
 * cihazda değişmiş) hiçbir şey yazılmaz ve `NotebookConflictError` atılır.
 */
export async function saveNotebookPages(
    notebookId: string,
    pages: NotebookPage[],
    { previous = [], baseRev = 0, force = false, metadata, localBackup = true }: SaveOptions = {}
): Promise<SaveResult> {
    const draftToken = localBackup ? await writeDraft(`notebook:${notebookId}`, { pages, baseRev }).catch(() => null) : null;
    if (!navigator.onLine) throw new Error(draftToken ? 'İnternet yok. Çalışma cihazda saklandı; bağlantı gelince yeniden gönderilecek.' : 'İnternet yok ve cihaz taslağı yazılamadı. Bu pencereyi kapatmayın.');
    const json = encodePages(pages);
    const bytes = utf8Bytes(json);
    if (bytes > MAX_CONTENT_BYTES) throw new NotebookTooLargeError(bytes);

    const parts = splitByBytes(json, CHUNK_BYTES);
    const updated_at = new Date().toISOString();
    let serverRev = baseRev;
    let rev = baseRev + 1;

    const written = await saveDocsTransaction({ collection: COLLECTION, id: notebookId }, (current) => {
        serverRev = (current?.rev as number) ?? 0;
        if (!force && serverRev !== baseRev) return null;
        rev = serverRev + 1;

        const writes: DocWrite[] = [
            {
                collection: COLLECTION,
                id: notebookId,
                // Ana doküman küçük kalmalı: her kayıt onu işlem içinde okur.
                // `pages_json` eski düzenden kalan içeriği temizler.
                data: {
                    chunk_count: parts.length,
                    rev,
                    writer: WRITER_ID,
                    pages_json: null,
                    updated_at,
                },
            },
            {
                // Üst veri, içerikle aynı işlemde güncellenir; diğer cihazlar
                // değişikliği bu küçük dokümanı dinleyerek duyar.
                collection: metadata?.collection ?? NOTEBOOKS,
                id: metadata?.id ?? notebookId,
                data: {
                    ...metadata?.fields,
                    page_count: pages.length,
                    content_rev: rev,
                    content_writer: WRITER_ID,
                    updated_at,
                },
            },
        ];
        parts.forEach((chunk, i) => {
            if (chunk === previous[i]) return;
            writes.push({ collection: COLLECTION, id: chunkId(notebookId, i), data: { chunk } });
        });
        // Defter küçüldüyse eski parçalar arkada kalmasın.
        for (let i = parts.length; i < previous.length; i++) {
            writes.push({ collection: COLLECTION, id: chunkId(notebookId, i) });
        }
        return writes;
    });
    if (!written) throw new NotebookConflictError(serverRev);
    if (draftToken) await clearDraft(`notebook:${notebookId}`, draftToken).catch(() => undefined);
    return { parts, rev };
}

/** Defterin içerik dokümanlarını (parçalarıyla birlikte) siler. */
export async function deleteNotebookPages(notebookId: string): Promise<void> {
    let chunkCount = MAX_CHUNKS;
    try {
        const main = await fetchDocById<NotebookContent>(COLLECTION, notebookId);
        chunkCount = Math.max(0, Math.min(MAX_CHUNKS, main?.chunk_count ?? 0));
    } catch {
        // Okunamadıysa da ana doküman ve olası parçalar silinmeye çalışılır.
    }
    await deleteDocById(COLLECTION, notebookId).catch(() => undefined);
    await Promise.all(
        // Eski düzende parçalar 1'den başlıyordu; bir fazlası denenir.
        Array.from({ length: chunkCount + 1 }, (_, i) =>
            deleteDocById(COLLECTION, chunkId(notebookId, i)).catch(() => undefined)
        )
    );
}

/** Explicitly accepting the cloud copy discards only the draft just read. */
export async function discardNotebookDraft(notebookId: string): Promise<void> {
    const key = `notebook:${notebookId}`;
    const draft = await readDraft(key).catch(() => null);
    if (draft) await clearDraft(key, draft.token);
}
