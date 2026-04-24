import { initializeApp } from 'firebase/app';
import {
    initializeFirestore,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    DocumentReference,
} from 'firebase/firestore';

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

export interface FirestoreHandler<T extends { id: string }> {
    sync: (onUpdate: (data: T[]) => void) => () => void;
    add: (data: Omit<T, 'id' | 'created_at'>) => Promise<DocumentReference>;
    update: (id: string, data: Partial<Omit<T, 'id'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export function useFirestore<T extends { id: string }>(
    collectionName: string
): FirestoreHandler<T> {
    return {
        sync: (onUpdate) => {
            const q = query(
                collection(db, collectionName),
                orderBy('created_at', 'desc')
            );
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(
                    (d) => ({ id: d.id, ...d.data() } as unknown as T)
                );
                onUpdate(data);
            });
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
