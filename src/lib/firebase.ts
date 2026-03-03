import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper for real-time sync
export const useFirestore = (collectionName: string) => {
    return {
        sync: (onUpdate: (data: any[]) => void) => {
            const q = query(collection(db, collectionName), orderBy("created_at", "desc"));
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                onUpdate(data);
            });
        },
        add: async (data: any) => {
            return addDoc(collection(db, collectionName), {
                ...data,
                created_at: Timestamp.now().toDate().toISOString()
            });
        },
        update: async (id: string, data: any) => {
            const docRef = doc(db, collectionName, id);
            return updateDoc(docRef, data);
        },
        remove: async (id: string) => {
            const docRef = doc(db, collectionName, id);
            return deleteDoc(docRef);
        }
    };
};
