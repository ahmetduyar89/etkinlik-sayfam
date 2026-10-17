import type { Activity } from '../../types';

/**
 * Etkinliğin bulunduğu klasörlerin id listesi.
 * Çoklu klasör desteğinden önce yazılmış kayıtlarda tek `folder_id` alanı
 * bulunur; burada o da hesaba katılır, böylece veri göçü gerekmez.
 */
export function activityFolderIds(activity: Activity): string[] {
    if (Array.isArray(activity.folder_ids)) return activity.folder_ids.filter(Boolean);
    return activity.folder_id ? [activity.folder_id] : [];
}

/** Etkinlik bu klasörde mi? Klasör ID veya klasör adı eşleşmesi kontrol edilir. */
export function isInFolder(activity: Activity, folderId: string | null, folderName?: string): boolean {
    if (!folderId) return false;
    if (activityFolderIds(activity).includes(folderId)) return true;
    if (folderName) {
        const fn = folderName.trim().toLocaleLowerCase('tr');
        const at = (activity.title || '').trim().toLocaleLowerCase('tr');
        if (fn && (at.includes(fn) || fn.includes(at))) return true;
    }
    return false;
}
