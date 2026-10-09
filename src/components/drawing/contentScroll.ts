import type { Point } from '../../types';

/** The lesson owns scrolling; ink remains in lesson document coordinates. */
export function bindContentScroll(iframe: HTMLIFrameElement, onOffset: (offset: Point) => void) {
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return null;
    let contentScroller: HTMLElement | null = null;
    const sync = () => onOffset({
        x: win.scrollX + (contentScroller?.scrollLeft ?? 0),
        y: win.scrollY + (contentScroller?.scrollTop ?? 0),
    });
    const onScroll = (event: Event) => {
        const target = event.target as HTMLElement | null;
        // Ignore independently scrolling menus and small interactive widgets.
        if (target?.nodeType === 1 && target !== doc.scrollingElement &&
            target.getBoundingClientRect().width >= iframe.clientWidth * .5) {
            contentScroller = target;
        }
        sync();
    };
    doc.addEventListener('scroll', onScroll, true);
    win.addEventListener('scroll', sync, { passive: true });
    sync();
    return {
        sync,
        wheel(event: WheelEvent) {
            const rect = iframe.getBoundingClientRect();
            const x = (event.clientX - rect.left) * iframe.clientWidth / rect.width;
            const y = (event.clientY - rect.top) * iframe.clientHeight / rect.height;
            const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? iframe.clientHeight : 1;
            const dx = event.deltaX * multiplier, dy = event.deltaY * multiplier;
            let target = doc.elementFromPoint(x, y) as HTMLElement | null;
            while (target && target !== doc.body && target !== doc.documentElement) {
                const style = win.getComputedStyle(target);
                if (/(auto|scroll)/.test(style.overflowY + style.overflowX)) {
                    const previousX = target.scrollLeft, previousY = target.scrollTop;
                    target.scrollBy({ left: dx, top: dy, behavior: 'instant' });
                    if (target.scrollLeft !== previousX || target.scrollTop !== previousY) {
                        if (target.getBoundingClientRect().width >= iframe.clientWidth * .5) contentScroller = target;
                        sync();
                        return;
                    }
                }
                target = target.parentElement;
            }
            win.scrollBy({ left: dx, top: dy, behavior: 'instant' });
            sync();
        },
        dispose() {
            doc.removeEventListener('scroll', onScroll, true);
            win.removeEventListener('scroll', sync);
        },
    };
}
