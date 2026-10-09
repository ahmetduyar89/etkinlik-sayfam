interface Positioned<T> { item: T; index: number }
export interface InkOperation<T> { removed: Positioned<T>[]; added: Positioned<T>[] }

/** Retains changed objects, plus one shallow snapshot for the current gesture. */
export class InkHistory<T> {
    private past: InkOperation<T>[] = [];
    private future: InkOperation<T>[] = [];
    private before: T[] | null = null;
    constructor(private readonly limit = 80, private readonly key?: (item: T) => string | undefined) {}
    get canUndo(): boolean { return this.before !== null || this.past.length > 0; }
    get canRedo(): boolean { return this.future.length > 0 && this.before === null; }
    get retainedChanges(): number { return [...this.past, ...this.future].reduce((n, op) => n + op.removed.length + op.added.length, 0); }
    begin(current: T[]): void {
        this.finish(current);
        this.before = current.slice();
    }
    finish(current: T[]): void {
        if (!this.before) return;
        const before = this.before;
        this.before = null;
        const operation = this.diff(before, current);
        if (!operation) return;
        this.past.push(operation);
        if (this.past.length > this.limit) this.past.shift();
        this.future = [];
    }
    private diff(before: T[], current: T[]): InkOperation<T> | null {
        const oldSet = new Set(before), newSet = new Set(current);
        const oldCommon = before.filter(item => newSet.has(item));
        const newCommon = current.filter(item => oldSet.has(item));
        const reordered = new Set<T>();
        oldCommon.forEach((item, i) => { if (item !== newCommon[i]) { reordered.add(item); reordered.add(newCommon[i]); } });
        const removed = before.flatMap((item, index) => !newSet.has(item) || reordered.has(item) ? [{ item, index }] : []);
        const added = current.flatMap((item, index) => !oldSet.has(item) || reordered.has(item) ? [{ item, index }] : []);
        return removed.length || added.length ? { removed, added } : null;
    }
    reset(): void { this.past = []; this.future = []; this.before = null; }
    private apply(current: T[], remove: Positioned<T>[], insert: Positioned<T>[]): T[] {
        const present = new Set(current), blocked = new Set<string>();
        for (const { item } of remove) {
            const id = this.key?.(item);
            if (id && !present.has(item)) blocked.add(id);
        }
        const removed = new Set(remove.map(entry => entry.item));
        const result = current.filter(item => !removed.has(item));
        const keys = new Set(result.map(item => this.key?.(item)).filter(Boolean));
        for (const { item, index } of insert) {
            const id = this.key?.(item);
            // Keep remote replacements/deletions; never overwrite a newer object with the same ID.
            if (id && (blocked.has(id) || keys.has(id))) continue;
            result.splice(Math.min(index, result.length), 0, item);
            if (id) keys.add(id);
        }
        return result;
    }
    undo(current: T[]): T[] | null {
        this.finish(current);
        const operation = this.past.pop();
        if (!operation) return null;
        const next = this.apply(current, operation.added, operation.removed);
        const applied = this.diff(next, current);
        if (applied) this.future.push(applied);
        return next;
    }
    redo(current: T[]): T[] | null {
        this.finish(current);
        const operation = this.future.pop();
        if (!operation) return null;
        const next = this.apply(current, operation.removed, operation.added);
        const applied = this.diff(current, next);
        if (applied) this.past.push(applied);
        return next;
    }
}
