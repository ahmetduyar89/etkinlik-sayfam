import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export async function lockApp(): Promise<void> {
    await signOut(auth);
    try { localStorage.removeItem('etkinlik_giris'); } catch { /* legacy cleanup */ }
    window.location.assign('/');
}

/**
 * Öğrenciye gönderilen bağlantılar şifre istemez; öğrenciler doğrudan girer.
 * İki tür vardır: etkinlik (?view=student&id=…) ve salt-okunur defter
 * (?view=notebook&id=…).
 */
export function isStudentLink(): boolean {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    return (view === 'student' || view === 'notebook') && !!params.get('id');
}

/**
 * Canlı Satranç bağlantısı (?view=satranc[&oda=1234]).
 *
 * Bu sayfa da şifre istemez: çocuk bağlantıya dokunur, adını yazar ve oynar.
 * Öğretmen panosuna açılan bir kapı DEĞİLDİR — yalnızca satranç masalarını
 * gösterir, içerik merkezine geçiş vermez.
 */
export function isChessLink(): boolean {
    return new URLSearchParams(window.location.search).get('view') === 'satranc';
}
