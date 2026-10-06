import type { Point } from '../../../types';

export type InkDiagnostic =
    | { stage: 'begin'; id: string; pointerType: string; trusted: boolean; legacy: boolean }
    | { stage: 'sample'; timestamp: number; pressure: number; raw: Point; filtered: Point; scale: number }
    | { stage: 'process'; durationMs: number }
    | { stage: 'frame'; renderMs: number; queueMs: number; sampleAgeMs: number | null };

/** Fixed memory, O(1) insertion. Summary sorts copies outside the pointer handlers. */
class Series {
    private data = new Float64Array(4096);
    private count = 0;
    push(value: number) { if (Number.isFinite(value) && value >= 0) this.data[this.count++ % this.data.length] = value; }
    summary() {
        const values = [...this.data.slice(0, Math.min(this.count, this.data.length))].sort((a, b) => a - b);
        const at = (p: number) => values.length ? values[Math.min(values.length - 1, Math.ceil(values.length * p) - 1)] : null;
        return { observed: this.count, retained: values.length, p50: at(.5), p95: at(.95), max: values.at(-1) ?? null };
    }
}

export class DeviceSession {
    readonly startedAt = new Date().toISOString();
    private intervals = new Series();
    private processing = new Series();
    private rendering = new Series();
    private queue = new Series();
    private sampleAge = new Series();
    private filterOffset = new Series();
    private lastTimestamp: number | null = null;
    private include = false;
    private pressureMin = Infinity;
    private pressureMax = -Infinity;
    private samples = 0;
    private strokes = 0;
    private syntheticStrokes = 0;
    private pointers = new Set<string>();
    readonly mode: 'current' | 'legacy';
    constructor(legacy = false) { this.mode = legacy ? 'legacy' : 'current'; }

    record(event: InkDiagnostic) {
        if (event.stage === 'begin') {
            this.lastTimestamp = null;
            this.include = event.trusted && event.legacy === (this.mode === 'legacy');
            if (!event.trusted) this.syntheticStrokes++;
            if (this.include) { this.strokes++; this.pointers.add(event.pointerType); }
            return;
        }
        if (!this.include) return;
        if (event.stage === 'sample') {
            const dt = this.lastTimestamp === null ? 0 : event.timestamp - this.lastTimestamp;
            // Exclude actual dwell; this measures active sample cadence, not idle wall time.
            if (dt > 0 && dt < 100) this.intervals.push(dt);
            this.lastTimestamp = event.timestamp; this.samples++;
            if (Number.isFinite(event.pressure)) { this.pressureMin = Math.min(this.pressureMin, event.pressure); this.pressureMax = Math.max(this.pressureMax, event.pressure); }
            this.filterOffset.push(Math.hypot(event.raw.x - event.filtered.x, event.raw.y - event.filtered.y) * event.scale);
        } else if (event.stage === 'process') this.processing.push(event.durationMs);
        else {
            this.rendering.push(event.renderMs); this.queue.push(event.queueMs);
            if (event.sampleAgeMs !== null) this.sampleAge.push(event.sampleAgeMs);
        }
    }

    report() {
        return { version: 1, startedAt: this.startedAt, mode: this.mode, strokes: this.strokes, samples: this.samples,
            pointerTypes: [...this.pointers], syntheticStrokesExcluded: this.syntheticStrokes,
            pressureRange: Number.isFinite(this.pressureMin) ? [this.pressureMin, this.pressureMax] : null,
            sampleIntervalMs: this.intervals.summary(), processingMs: this.processing.summary(), renderMs: this.rendering.summary(),
            frameQueueMs: this.queue.summary(), sampleToCanvasCompletionMs: this.sampleAge.summary(), filterOffsetScreenPx: this.filterOffset.summary(),
            limitations: ['Canvas completion is not physical display latency.', 'Sample interval reflects browser-delivered input, not guaranteed digitizer frequency.', 'Timing instrumentation adds overhead.', 'Only trusted input in the chosen filter mode is measured.', 'Distributions retain the most recent 4096 observations.'],
        };
    }
}

/** PointerEvent timestamps normally share performance.now()'s origin; reject incompatible clocks. */
export function sampleAge(now: number, timestamp: number): number | null {
    const age = now - timestamp;
    return Number.isFinite(age) && age >= 0 && age < 1000 ? age : null;
}
