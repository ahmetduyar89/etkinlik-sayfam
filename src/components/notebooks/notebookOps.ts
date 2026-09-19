// src/components/notebooks/notebookOps.ts
// Ortak çizimin canlı katmanı.
//
// Kalıcı kayıt tam sayfa anlık görüntüsüdür (notebookContent.ts) ve saniyeler
// arayla yazılır; o kadar beklemek "aynı anda çizme" hissini yok eder. Bu
// yüzden her değişiklik ayrıca küçük bir operasyon dokümanı olarak yayınlanır:
//
//   notebook_ops/{defterId}/ops/{opId} → { op_json, writer, at }
//
// Diğer cihazlar bu alt koleksiyonu dinleyip operasyonu kendi tuvaline
// uygular; çizgi anında karşı ekranda belirir. Operasyonlar geçicidir —
// anlık görüntü zaten yazıldığı için kısa süre sonra silinirler. Bir
// operasyon kaçarsa da içerik kaybolmaz: taraflar sakinleştiğinde anlık
// görüntü senkronu (content_rev) her iki ekranı da eşitler.
import { addSubDoc, deleteSubDoc, fetchSubDocs, watchNewDocs } from '../../lib/firebase';
import { WRITER_ID } from './notebookContent';
import type { NotebookOp, NotebookOpDoc } from '../../types';

const PARENT = 'notebook_ops';
const SUB = 'ops';

/** Dinlenen operasyon penceresi: aynı anda bu kadar taze operasyon izlenir. */
const WATCH_LIMIT = 60;
/** Yayınlanan operasyon bu süre sonra silinir (anlık görüntü çoktan yazıldı). */
const OP_TTL_MS = 60000;
/** Bundan eski bir operasyon geç geldiyse uygulanmaz. */
const STALE_MS = 120000;
/**
 * Bir operasyon dokümanının azami boyutu (Firestore sınırı 1 MiB). Fotoğraflı
 * bir sayfanın tamamı bunu aşabilir; o durumda yayın atlanır ve içerik anlık
 * görüntü senkronuyla karşı tarafa geçer — biraz gecikir ama kaybolmaz.
 */
const MAX_OP_BYTES = 800 * 1024;

/** Bu yaştan büyük operasyonlar defter açılırken temizlenir. */
const PRUNE_MS = 600000;

const opPath = (notebookId: string): [string, string, string] => [PARENT, notebookId, SUB];

/**
 * Bir operasyonu yayınlar. Hata yutulur: ortak çizim bir kolaylıktır, kayıt
 * yolu değildir — yayın başarısız olsa da içerik anlık görüntüyle korunur.
 */
export async function publishOp(notebookId: string, op: NotebookOp): Promise<void> {
    try {
        const opJson = JSON.stringify(op);
        if (opJson.length > MAX_OP_BYTES) return;
        const id = await addSubDoc(opPath(notebookId), {
            op_json: opJson,
            writer: WRITER_ID,
            at: Date.now(),
        });
        window.setTimeout(() => {
            void deleteSubDoc(opPath(notebookId), id).catch(() => undefined);
        }, OP_TTL_MS);
    } catch {
        // Sessiz geç: kalıcı kayıt anlık görüntüde.
    }
}

/**
 * Geride kalmış operasyonları siler. Yayınlayan sekme kendi kaydını kısa süre
 * sonra siler; sekme kapanırsa artık kalır. Defter açılışında bir kez çağrılır.
 */
export async function pruneOps(notebookId: string): Promise<void> {
    try {
        const docs = await fetchSubDocs<NotebookOpDoc>(opPath(notebookId), {
            orderBy: 'at',
            limit: 200,
        });
        const cutoff = Date.now() - PRUNE_MS;
        await Promise.all(
            docs
                .filter((d) => (d.at ?? 0) < cutoff)
                .map((d) => deleteSubDoc(opPath(notebookId), d.id).catch(() => undefined))
        );
    } catch {
        // Temizlik iyileştirmedir; başarısız olması akışı etkilemez.
    }
}

/**
 * Başka cihazların operasyonlarını dinler. Abonelik kurulduğu andan sonraki
 * operasyonlar bildirilir; kendi yayınlarımız ve bayatlamış kayıtlar elenir.
 */
export function watchOps(
    notebookId: string,
    onOps: (ops: NotebookOp[]) => void,
    onError?: (e: Error) => void
): () => void {
    return watchNewDocs<NotebookOpDoc>(
        opPath(notebookId),
        { orderBy: 'at', limit: WATCH_LIMIT },
        (docs) => {
            const now = Date.now();
            const ops = docs
                // Sorgu en yeniden eskiye sıralı; uygulama sırası eskiden yeniye.
                .slice()
                .sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
                .filter((d) => d.writer !== WRITER_ID && now - (d.at ?? 0) < STALE_MS)
                .map((d) => {
                    try {
                        return JSON.parse(d.op_json) as NotebookOp;
                    } catch {
                        return null;
                    }
                })
                .filter((op): op is NotebookOp => op !== null);
            if (ops.length) onOps(ops);
        },
        onError
    );
}
