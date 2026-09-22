/** A scope is immutable for the lifetime of a page. Switching classes reloads
 * the page, so an in-flight save can never land in the next classroom. */
const candidate = new URLSearchParams(window.location.search).get('class');
export const classroomId = candidate && /^[a-zA-Z0-9_-]{1,128}$/.test(candidate) ? candidate : null;
const scopedCollections = new Set(['folders', 'notebooks', 'notebook_content', 'notebook_ops', 'submissions', 'activity_work', 'recent_activities', 'pdf_files']);
export function scopedCollection(name: string): string {
    return classroomId && scopedCollections.has(name) ? `classrooms/${classroomId}/${name}` : name;
}
export function studentLink(view: 'student' | 'notebook', id: string): string {
    const url = new URL('/', window.location.origin);
    url.searchParams.set('view', view);
    url.searchParams.set('id', id);
    if (classroomId) url.searchParams.set('class', classroomId);
    return url.toString();
}
