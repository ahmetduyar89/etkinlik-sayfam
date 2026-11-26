/**
 * Input device profiles.
 *
 * Classroom smart boards (Windows OPS + Chrome/Edge, IR or capacitive frames)
 * deliver a passive plastic pen as `touch` (sometimes as `pen` with a constant
 * pressure), at a low sample rate with several pixels of positional jitter and
 * occasional "ghost" secondary contacts. Tablets with an active stylus deliver
 * dense, accurate samples. The two need different filtering and gesture rules.
 */
export type InkInputProfile = 'stylus' | 'board';
export type BoardMode = 'auto' | 'on' | 'off';

export interface InkProfileConfig {
    /** One Euro minimum cutoff (Hz): lower = steadier slow writing. */
    minCutoff: number;
    /** One Euro speed coefficient, per screen px/s. */
    beta: number;
    derivativeCutoff: number;
    /** Screen px/s below which direction changes are treated as jitter, not corners. */
    cornerMinSpeed: number;
    predictionHorizonMs: number;
    /** Contacts wider than this (CSS px) are treated as a palm. */
    palmContactPx: number;
}

export const INK_PROFILES: Readonly<Record<InkInputProfile, Readonly<InkProfileConfig>>> = Object.freeze({
    stylus: Object.freeze({ minCutoff: 8, beta: .025, derivativeCutoff: 12, cornerMinSpeed: 0, predictionHorizonMs: 35, palmContactPx: 45 }),
    board: Object.freeze({ minCutoff: 3, beta: .03, derivativeCutoff: 8, cornerMinSpeed: 220, predictionHorizonMs: 20, palmContactPx: 90 }),
});

interface ProfileEvent { pointerType: string; pressure: number; tiltX?: number; tiltY?: number }
interface ProfileEnvironment { screenWidth: number; maxTouchPoints: number }

const environment = (): ProfileEnvironment => ({
    screenWidth: typeof screen !== 'undefined' ? Math.max(screen.width, screen.height) : 0,
    maxTouchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints ?? 0 : 0,
});

/** Large multi-touch display: the typical classroom board. */
export const looksLikeBoard = (env: ProfileEnvironment = environment()) => env.screenWidth >= 1600 && env.maxTouchPoints >= 10;

export function detectInputProfile(event: ProfileEvent, mode: BoardMode = 'auto', env: ProfileEnvironment = environment()): InkInputProfile {
    if (mode === 'on') return 'board';
    if (mode === 'off' || event.pointerType === 'mouse') return 'stylus';
    if (event.pointerType === 'touch') return 'board';
    // Board pens reported as "pen": binary pressure and no tilt on a large touch display.
    const binaryPressure = event.pressure === 0 || event.pressure === .5 || event.pressure === 1;
    return binaryPressure && !event.tiltX && !event.tiltY && looksLikeBoard(env) ? 'board' : 'stylus';
}
