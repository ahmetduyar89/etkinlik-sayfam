/**
 * Delegated Ink Trail (W3C Ink API, Chrome/Edge 94+ on Windows).
 *
 * After the app paints ink up to a pointermove's position, the browser hands the
 * remaining distance to the real pen position to the OS compositor, which draws
 * it on the next vsync — ahead of the normal render pipeline. Each update replaces
 * the previous trail and the trail disappears once the next app frame arrives, so
 * nothing is ever committed to the document from here.
 */
interface InkTrailStyle { color: string; diameter: number }
interface DelegatedInkPresenter {
    updateInkTrailStartPoint(event: PointerEvent, style: InkTrailStyle): void;
}
interface InkNavigator { ink?: { requestPresenter(options?: { presentationArea?: Element | null }): Promise<DelegatedInkPresenter> } }

export const delegatedInkSupported = (): boolean =>
    typeof navigator !== 'undefined' && typeof (navigator as InkNavigator).ink?.requestPresenter === 'function';

/** Only fully opaque #rgb/#rrggbb colours: a translucent trail would double-darken over ink. */
export const opaqueInkColor = (color: string): boolean => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);

export class DelegatedInk {
    private presenter: DelegatedInkPresenter | null = null;
    private area: Element | null = null;
    private request: Promise<void> | null = null;

    /** Requests (once per canvas) a presenter; failures leave the normal renderer in charge. */
    attach(area: Element | null): void {
        if (!area || area === this.area || !delegatedInkSupported()) return;
        this.area = area;
        this.presenter = null;
        const pending = (navigator as InkNavigator).ink!.requestPresenter({ presentationArea: area })
            .then(presenter => { if (this.area === area) this.presenter = presenter; })
            .catch(() => { if (this.area === area) this.presenter = null; });
        this.request = pending;
    }

    get active(): boolean { return this.presenter !== null; }

    /** `event` must be the trusted pointermove whose position was just rendered. */
    update(event: PointerEvent, color: string, diameter: number): void {
        if (!this.presenter || !event.isTrusted || event.type !== 'pointermove' || !opaqueInkColor(color) ||
            !Number.isFinite(diameter) || diameter <= 0) return;
        try {
            this.presenter.updateInkTrailStartPoint(event, { color, diameter });
        } catch {
            // Presenter rejected the event (e.g. area detached); keep drawing normally.
        }
    }

    ready(): Promise<void> { return this.request ?? Promise.resolve(); }
}
