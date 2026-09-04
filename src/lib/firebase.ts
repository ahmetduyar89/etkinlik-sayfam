import { initializeApp } from 'firebase/app';
import {
    initializeFirestore,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    query,
    orderBy,
    limit as queryLimit,
    getDocs,
    Timestamp,
    DocumentReference,
    runTransaction,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
});
export const storage = getStorage(app);

export interface FirestoreHandler<T extends { id: string }> {
    sync: (onUpdate: (data: T[]) => void, onError?: (e: Error) => void) => () => void;
    add: (data: Omit<T, 'id' | 'created_at'>) => Promise<DocumentReference>;
    update: (id: string, data: Partial<Omit<T, 'id'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export function useFirestore<T extends { id: string }>(
    collectionName: string
): FirestoreHandler<T> {
    return {
        sync: (onUpdate, onError) => {
            const q = query(
                collection(db, collectionName),
                orderBy('created_at', 'desc')
            );
            return onSnapshot(
                q,
                (snapshot) => {
                    const data = snapshot.docs.map(
                        (d) => ({ id: d.id, ...d.data() } as unknown as T)
                    );
                    onUpdate(data);
                },
                (error) => onError?.(error)
            );
        },
        add: async (data) =>
            addDoc(collection(db, collectionName), {
                ...data,
                created_at: Timestamp.now().toDate().toISOString(),
            }),
        update: async (id, data) => {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data as Record<string, unknown>);
        },
        remove: async (id) => {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
        },
    };
}

/** Tek bir dokümanı id ile okur; yoksa null döner. */
export async function fetchDocById<T>(
    collectionName: string,
    id: string
): Promise<T | null> {
    const snap = await getDoc(doc(db, collectionName, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as unknown as T;
}

/** Tek bir dokümanı canlı dinler; abonelikten çıkma fonksiyonu döner. */
export function watchDocById<T>(
    collectionName: string,
    id: string,
    onUpdate: (data: T | null) => void,
    onError?: (e: Error) => void
): () => void {
    return onSnapshot(
        doc(db, collectionName, id),
        (snap) => onUpdate(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null),
        (error) => onError?.(error)
    );
}

/** Dokümanı id ile oluşturur veya birleştirerek günceller. */
export async function saveDocById(
    collectionName: string,
    id: string,
    data: Record<string, unknown>
): Promise<void> {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
}

/** Bir işlemde yazılacak (veya `data` yoksa silinecek) doküman. */
export interface DocWrite {
    collection: string;
    id: string;
    data?: Record<string, unknown>;
}

/**
 * Bir dokümanı işlem (transaction) içinde okur, yazılacakları ona bakarak
 * hazırlar ve hepsini tek seferde yazar. `build` null dönerse hiçbir şey
 * yazılmaz ve `false` döner — eşzamanlı düzenlemede kimin kazandığına çağıran
 * karar verir. Okunan doküman küçük tutulmalıdır; her yazmada indirilir.
 */
export async function saveDocsTransaction(
    read: { collection: string; id: string },
    build: (current: Record<string, unknown> | null) => DocWrite[] | null
): Promise<boolean> {
    return runTransaction(db, async (tx) => {
        const snap = await tx.get(doc(db, read.collection, read.id));
        const writes = build(snap.exists() ? (snap.data() as Record<string, unknown>) : null);
        if (!writes) return false;
        for (const w of writes) {
            const ref = doc(db, w.collection, w.id);
            if (w.data) tx.set(ref, w.data, { merge: true });
            else tx.delete(ref);
        }
        return true;
    });
}

/**
 * Bir dokümanın alt koleksiyonunu canlı dinler ve YALNIZCA yeni eklenen
 * dokümanları bildirir. İlk anlık görüntü atlanır: çağıran taraf zaten
 * güncel durumu ayrıca yüklemiştir, geçmiş kayıtları tekrar uygulamamalıdır.
 */
export function watchNewDocs<T>(
    path: [string, string, string],
    options: { orderBy: string; limit: number },
    onAdded: (docs: T[]) => void,
    onError?: (e: Error) => void
): () => void {
    const [parent, parentId, sub] = path;
    const q = query(
        collection(db, parent, parentId, sub),
        orderBy(options.orderBy, 'desc'),
        queryLimit(options.limit)
    );
    let first = true;
    return onSnapshot(
        q,
        (snap) => {
            if (first) {
                first = false;
                return;
            }
            const added = snap
                .docChanges()
                .filter((c) => c.type === 'added')
                .map((c) => ({ id: c.doc.id, ...c.doc.data() } as unknown as T));
            if (added.length) onAdded(added);
        },
        (error) => onError?.(error)
    );
}

/** Alt koleksiyona doküman ekler ve id'sini döner. */
export async function addSubDoc(
    path: [string, string, string],
    data: Record<string, unknown>
): Promise<string> {
    const [parent, parentId, sub] = path;
    const ref = await addDoc(collection(db, parent, parentId, sub), data);
    return ref.id;
}

/** Alt koleksiyondaki dokümanları (sıralı, sınırlı) tek seferlik okur. */
export async function fetchSubDocs<T>(
    path: [string, string, string],
    options: { orderBy: string; limit: number }
): Promise<T[]> {
    const [parent, parentId, sub] = path;
    const snap = await getDocs(
        query(
            collection(db, parent, parentId, sub),
            orderBy(options.orderBy, 'desc'),
            queryLimit(options.limit)
        )
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
}

/** Alt koleksiyondaki dokümanı siler. */
export async function deleteSubDoc(
    path: [string, string, string],
    id: string
): Promise<void> {
    const [parent, parentId, sub] = path;
    await deleteDoc(doc(db, parent, parentId, sub, id));
}

/** Dokümanı id ile siler. */
export async function deleteDocById(
    collectionName: string,
    id: string
): Promise<void> {
    await deleteDoc(doc(db, collectionName, id));
}
