import type { BoundingBox } from '../../../types';

const intersects = (a: BoundingBox, b: BoundingBox) => a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1;
/** Bounded uniform-grid broad phase. Large objects/queries use a safe fallback. */
export class SpatialIndex<T> {
    private cells = new Map<string, Set<T>>();
    private entries = new Map<T, { bounds: BoundingBox; keys: string[] | null }>();
    private overflow = new Set<T>();
    constructor(private readonly cellSize = 128, private readonly maxCells = 256) {
        if (!(cellSize > 0) || !Number.isFinite(cellSize) || maxCells < 1) throw new Error('Invalid spatial index configuration');
    }
    private keys(bounds: BoundingBox): string[] | null {
        if (![bounds.x1, bounds.y1, bounds.x2, bounds.y2].every(Number.isFinite)) return null;
        const x1 = Math.floor(bounds.x1 / this.cellSize), x2 = Math.floor(bounds.x2 / this.cellSize);
        const y1 = Math.floor(bounds.y1 / this.cellSize), y2 = Math.floor(bounds.y2 / this.cellSize);
        if (![x1, x2, y1, y2].every(Number.isSafeInteger)) return null;
        if ((x2 - x1 + 1) * (y2 - y1 + 1) > this.maxCells) return null;
        const result: string[] = [];
        for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) result.push(`${x}:${y}`);
        return result;
    }
    set(item: T, bounds: BoundingBox): void {
        this.delete(item);
        const keys = this.keys(bounds);
        this.entries.set(item, { bounds, keys });
        if (!keys) { this.overflow.add(item); return; }
        for (const key of keys) {
            let bucket = this.cells.get(key);
            if (!bucket) this.cells.set(key, bucket = new Set());
            bucket.add(item);
        }
    }
    delete(item: T): void {
        const entry = this.entries.get(item);
        if (!entry) return;
        for (const key of entry.keys ?? []) {
            const bucket = this.cells.get(key)!;
            bucket.delete(item);
            if (!bucket.size) this.cells.delete(key);
        }
        this.entries.delete(item);
        this.overflow.delete(item);
    }
    has(item: T): boolean { return this.entries.has(item); }
    query(bounds: BoundingBox): Set<T> {
        const keys = this.keys(bounds);
        const candidates = new Set<T>(keys ? this.overflow : this.entries.keys());
        for (const key of keys ?? []) for (const item of this.cells.get(key) ?? []) candidates.add(item);
        for (const item of candidates) {
            const entry = this.entries.get(item)!;
            // Non-finite objects remain candidates so broad-phase never hides legacy data.
            if (Object.values(entry.bounds).every(Number.isFinite) && !intersects(entry.bounds, bounds)) candidates.delete(item);
        }
        return candidates;
    }
    clear(): void { this.cells.clear(); this.entries.clear(); this.overflow.clear(); }
}

/** Keeps immutable object replacements incremental; invalidate after in-place edits. */
export class DocumentSpatialIndex<T> {
    private source: readonly T[] | null = null;
    private objects = new Set<T>();
    private index = new SpatialIndex<T>();
    constructor(private readonly bounds: (item: T) => BoundingBox) {}
    invalidate(): void { this.source = null; this.objects.clear(); this.index.clear(); }
    query(source: readonly T[], region: BoundingBox): Set<T> {
        if (source !== this.source) {
            const next = new Set(source);
            for (const item of this.objects) if (!next.has(item)) this.index.delete(item);
            for (const item of next) if (!this.index.has(item)) this.index.set(item, this.bounds(item));
            this.objects = next;
            this.source = source;
        }
        return this.index.query(region);
    }
}
