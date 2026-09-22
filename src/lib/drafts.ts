import { auth } from './firebase';
import { classroomId } from './classroomScope';
export interface Draft<T> { token: string; value: T; }
const keyFor = (key: string) => `${auth.currentUser?.uid || 'guest'}:${classroomId || 'library'}:${key}`;
function open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('atolye-drafts', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('drafts');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
export async function readDraft<T>(key: string): Promise<Draft<T> | null> {
    const db = await open();
    return new Promise((resolve, reject) => {
        const request = db.transaction('drafts').objectStore('drafts').get(keyFor(key));
        request.onsuccess = () => { db.close(); resolve(request.result || null); };
        request.onerror = () => { db.close(); reject(request.error); };
    });
}
export async function writeDraft<T>(key: string, value: T): Promise<string> {
    const token = crypto.randomUUID();
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').put({ token, value }, keyFor(key));
        tx.oncomplete = () => { db.close(); resolve(token); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}
/** Never delete a newer draft while an earlier cloud write is finishing. */
export async function clearDraft(key: string, token: string): Promise<void> {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        const store = tx.objectStore('drafts');
        const request = store.get(keyFor(key));
        request.onsuccess = () => { if (request.result?.token === token) store.delete(keyFor(key)); };
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}
