// src/components/notebooks/notebookContent.ts
// Defter sayfalarının Firestore'a yazılması ve okunması.
//
// Firestore doküman sınırı 1 MiB. Sayfa verisi (el yazısı + gömülü
// fotoğraflar) bu sınırı tek dokümanda kolayca aşıyordu; defter dolduğunda
// otomatik kayıt tümden duruyor ve kullanıcı "defter çok büyüdü" uyarısını
// yazmaya devam ettiği sürece görüyordu.
//
// Bunun yerine içerik parçalara bölünür: ilk parça `notebook_content/{id}`
// dokümanında `pages_json` alanında, kalanlar `notebook_content/{id}__c1`,
// `__c2` … dokümanlarının `chunk` alanında durur. `chunk_count` kaç parça
// olduğunu söyler; alan yoksa (eski defterler) içerik tek parçadır.
import { deleteDocById, fetchDocById, saveDocsBatch } from '../../lib/firebase';
import { decodePages, encodePages, splitByBytes, utf8Bytes } from './pageCodec';
import type { NotebookContent, NotebookPage } from '../../types';

const COLLECTION = 'notebook_content';

/** Tek dokümana yazılan azami parça boyutu (1 MiB sınırına pay bırakır). */
export const CHUNK_BYTES = 700 * 1024;
/**
 * Bir defterin azami parça sayısı. Büyük defterlerin açılışını yavaşlatmamak
 * ve toplu yazmayı Firestore'un istek boyutu sınırının altında tutmak için.
 */
export const MAX_CHUNKS = 8;
/** Bir defter içeriğinin azami boyutu. */
export const MAX_CONTENT_BYTES = CHUNK_BYTES * MAX_CHUNKS;

const chunkId = (id: string, index: number): string => `${id}__c${index}`;

/** İçerik sınırı aşıldığında atılır; çağıran taraf kullanıcıya bildirir. */
export class NotebookTooLargeError extends Error {
    constructor(readonly bytes: number) {
        super('Defter içeriği sınırı aştı.');
        this.name = 'NotebookTooLargeError';
    }
}

/** Yüklenmiş içerik: sayfalar ve kaç parçadan geldiği. */
export interface LoadedContent {
    pages: NotebookPage[];
    /** Kayıtta artan parçaların silinebilmesi için okunan parça sayısı. */
    chunkCount: number;
    /** Defterin hiç içeriği yoktu (yeni defter). */
    isEmpty: boolean;
}

/**
 * Defter içeriğini okur. Bir parça eksikse hata atar — yarım içeriği
 * "boş defter" gibi açmak, sonraki otomatik kayıtta gerçek veriyi silerdi.
 */
export async function loadNotebookPages(notebookId: string): Promise<LoadedContent> {
    const main = await fetchDocById<NotebookContent>(COLLECTION, notebookId);
    if (!main?.pages_json) {
        return { pages: decodePages(), chunkCount: 0, isEmpty: true };
    }
    const chunkCount = Math.max(1, Math.min(MAX_CHUNKS, main.chunk_count ?? 1));
    let raw = main.pages_json;
    if (chunkCount > 1) {
        const rest = await Promise.all(
            Array.from({ length: chunkCount - 1 }, (_, i) =>
                fetchDocById<NotebookContent>(COLLECTION, chunkId(notebookId, i + 1))
            )
        );
        rest.forEach((part, i) => {
            if (!part?.chunk) {
                throw new Error(`Defterin ${i + 2}. bölümü okunamadı.`);
            }
            raw += part.chunk;
        });
    }
    // `strict`: yarım veya bozuk içerik boş defter gibi açılmamalı.
    return { pages: decodePages(raw, true), chunkCount, isEmpty: false };
}

/**
 * Defter içeriğini kaydeder ve yazılan parçaları döner. `previous`, bir
 * önceki kaydın parçalarıdır: değişmeyen parçalar yeniden yazılmaz, artan
 * parçalar silinir. Otomatik kayıt saniyeler arayla çalıştığı için bu fark
 * kontrolü yazma sayısını çizim yapılan parçayla sınırlar.
 */
export async function saveNotebookPages(
    notebookId: string,
    pages: NotebookPage[],
    previous: string[] = []
): Promise<string[]> {
    const json = encodePages(pages);
    const bytes = utf8Bytes(json);
    if (bytes > MAX_CONTENT_BYTES) throw new NotebookTooLargeError(bytes);

    const parts = splitByBytes(json, CHUNK_BYTES);
    const updated_at = new Date().toISOString();

    // Tüm parçalar tek bir toplu yazmada gider: yarıda kalan bir kayıt, yeni
    // bir parçayla eski bir parçayı birleştirip okunamaz içerik bırakırdı.
    const writes: { id: string; data?: Record<string, unknown> }[] = [
        // Ana doküman ilk parça değişmese de yazılır; parça sayısı ve zaman
        // damgası (liste ekranı bunu gösterir) güncel kalmalı.
        {
            id: notebookId,
            data: { pages_json: parts[0], chunk_count: parts.length, updated_at },
        },
    ];
    parts.slice(1).forEach((chunk, i) => {
        if (chunk === previous[i + 1]) return;
        writes.push({ id: chunkId(notebookId, i + 1), data: { chunk, updated_at } });
    });
    // Defter küçüldüyse eski parçalar arkada kalmasın.
    for (let i = parts.length; i < previous.length; i++) {
        writes.push({ id: chunkId(notebookId, i) });
    }
    await saveDocsBatch(COLLECTION, writes);
    return parts;
}

/** Defterin içerik dokümanlarını (parçalarıyla birlikte) siler. */
export async function deleteNotebookPages(notebookId: string): Promise<void> {
    let chunkCount = 1;
    try {
        const main = await fetchDocById<NotebookContent>(COLLECTION, notebookId);
        chunkCount = Math.max(1, Math.min(MAX_CHUNKS, main?.chunk_count ?? 1));
    } catch {
        // Okunamadıysa da ana doküman silinmeye çalışılır.
    }
    await deleteDocById(COLLECTION, notebookId).catch(() => undefined);
    await Promise.all(
        Array.from({ length: chunkCount - 1 }, (_, i) =>
            deleteDocById(COLLECTION, chunkId(notebookId, i + 1)).catch(() => undefined)
        )
    );
}
