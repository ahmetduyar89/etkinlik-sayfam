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
    apiKey: "AIzaSyDn8WWA2et22ZqtSEf3oUsoxZZo7Mu8LtU",
    authDomain: "interaktif-etkinliklerim.firebaseapp.com",
    projectId: "interaktif-etkinliklerim",
    storageBucket: "interaktif-etkinliklerim.firebasestorage.app",
    messagingSenderId: "701319349005",
    appId: "1:701319349005:web:5eef690a8ec9bb3ed92644"
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
