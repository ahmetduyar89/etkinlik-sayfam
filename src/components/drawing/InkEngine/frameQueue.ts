/** Latest presentation wins, but every input sample is processed before scheduling. */
export class InkFrameQueue {
    private frame: number | null = null;
    private job: (() => void) | null = null;
    constructor(
        private readonly request: (callback: FrameRequestCallback) => number = callback => requestAnimationFrame(callback),
        private readonly cancelRequest: (id: number) => void = id => cancelAnimationFrame(id),
    ) {}
    schedule(job: () => void): void {
        this.job = job;
        if (this.frame !== null) return;
        this.frame = this.request(() => {
            this.frame = null;
            const current = this.job;
            this.job = null;
            current?.();
        });
    }
    cancel(): void {
        if (this.frame !== null) this.cancelRequest(this.frame);
        this.frame = null;
        this.job = null;
    }
}
