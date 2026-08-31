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

/** Etkinlik bu klasörde mi? */
export function isInFolder(activity: Activity, folderId: string | null): boolean {
    if (!folderId) return false;
    return activityFolderIds(activity).includes(folderId);
}
