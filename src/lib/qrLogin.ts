import { browserSessionPersistence, setPersistence, signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';
import { saveSession, SESSION_STORAGE_KEY, type AuthSession } from '../utils/auth';

export interface QrLoginRequest {
    id: string;
    ownerSecret: string;
    scanSecret: string;
    expiresAt: number;
    code: string;
}
export interface QrScan { id: string; scanSecret: string }
export function readQrScan(): QrScan | null {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (!params.has('qrLogin')) return null;
    return { id: params.get('qrLogin') || '', scanSecret: params.get('scan') || '' };
}
export async function createQrLogin(): Promise<QrLoginRequest> {
    return (await httpsCallable<Record<string, never>, QrLoginRequest>(functions, 'createQrLogin')({})).data;
}
export function qrLoginUrl(request: QrLoginRequest): string {
    const url = new URL('/', window.location.origin);
    // Keep the scan secret out of server request URLs and referrer headers.
    url.hash = new URLSearchParams({ qrLogin: request.id, scan: request.scanSecret }).toString();
    return url.href;
}
export async function inspectQrLogin(scan: QrScan): Promise<{ code: string; expiresAt: number }> {
    return (await httpsCallable<QrScan, { code: string; expiresAt: number }>(functions, 'inspectQrLogin')(scan)).data;
}
export async function approveQrLogin(scan: QrScan): Promise<void> {
    await httpsCallable(functions, 'approveQrLogin')(scan);
}
export async function completeQrLogin(request: QrLoginRequest, active: () => boolean = () => true): Promise<boolean> {
    const result = (await httpsCallable<{ id: string; ownerSecret: string },
        { state: 'pending' } | { state: 'complete'; token: string; session: AuthSession }>(functions, 'completeQrLogin')({
        id: request.id, ownerSecret: request.ownerSecret,
    })).data;
    if (result.state !== 'complete' || !active()) return false;
    await setPersistence(auth, browserSessionPersistence);
    // Save display metadata before the auth listener processes the new identity.
    saveSession(result.session, 'tab');
    try {
        await signInWithCustomToken(auth, result.token);
    } catch (error) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        throw error;
    }
    window.location.replace('/');
    return true;
}
export function qrError(error: unknown): string {
    const code = (error as { code?: string })?.code;
    if (code === 'functions/deadline-exceeded') return 'QR kodun süresi doldu. Tahtada yeni QR oluşturun.';
    if (code === 'functions/failed-precondition') return 'Bu QR zaten onaylanmış veya kullanılmış. Tahtada yeni QR oluşturun.';
    if (code === 'functions/resource-exhausted') return 'Çok fazla QR isteği. Birkaç dakika sonra tekrar deneyin.';
    if (code === 'functions/unauthenticated' || code === 'functions/permission-denied') {
        return 'QR onayı için telefonunuzda doğrulanmış öğretmen veya sınıf hesabıyla giriş yapın.';
    }
    return 'QR bağlantısı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.';
}
