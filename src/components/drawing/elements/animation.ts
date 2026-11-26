import { ELEMENTS } from './catalog';
const animations = new Map(ELEMENTS.filter(e => e.kind === 'gif').map(e => [e.src,e]));
export const animatedElement = (src?: string) => src ? animations.get(src) : undefined;
export function elementFrame(time: number, frames: number, frameMs: number): number {
    return Math.floor(Math.max(0,Number.isFinite(time) ? time : 0) * 1000 / frameMs) % frames;
}
