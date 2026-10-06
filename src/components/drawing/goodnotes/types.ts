import type { Point, Stroke } from '../../../types';
export type GoodnotesPen = 'fountain' | 'ballpoint' | 'brush';
export type InkPoint = Point;
export interface BrushConfig {
    pen: GoodnotesPen;
    width: number;
    sharpness: number;
    sensitivity: number;
    complete: boolean;
}
export const MM_TO_PX = 96 / 25.4;
export const isGoodnotesPen = (pen: Stroke['penType']): pen is GoodnotesPen => pen === 'ballpoint' || pen === 'fountain' || pen === 'brush';
