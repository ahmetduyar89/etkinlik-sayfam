/**
 * Firestore hatalarını kullanıcıya anlaşılır bir cümleye çevirir.
 * Kod da metne eklenir; böylece sorun uzaktan da teşhis edilebilir.
 */
export function firestoreErrorMessage(error: unknown, fallback: string): string {
    const code =
        typeof error === 'object' && error !== null && 'code' in error
            ? String((error as { code?: unknown }).code || '')
            : '';

    if (code.includes('permission-denied')) {
        return 'Firestore güvenlik kuralları bu bölüme izin vermiyor. Firebase konsolunda "folders", "notebooks" ve "notebook_content" koleksiyonlarına okuma/yazma izni verilmeli. (permission-denied)';
    }
    if (code.includes('unavailable') || code.includes('deadline-exceeded')) {
        return 'Sunucuya şu an ulaşılamıyor. İnternet bağlantını kontrol edip tekrar dene. (' + code + ')';
    }
    if (code.includes('unauthenticated')) {
        return 'Firebase oturumu doğrulanamadı. (unauthenticated)';
    }
    return code ? `${fallback} (${code})` : fallback;
}
