import type { Stroke } from '../../../types';
import type { RecognizedShape } from './models';

/** Existing stroke schema carries geometry through save/load, selection, history and sync. */
export function shapeToStroke(shape: RecognizedShape): Pick<Stroke, 'tool' | 'points' | 'rotation' | 'arrowHeadAngle'> {
    switch (shape.kind) {
        case 'line': return { tool: 'line', points: [shape.start, shape.end] };
        case 'arrow': return { tool: 'arrow', points: [shape.start, shape.end], arrowHeadAngle: shape.headAngle };
        case 'circle': return { tool: 'circle', points: [shape.center, { x: shape.center.x + shape.radius, y: shape.center.y }] };
        case 'ellipse': return { tool: 'ellipse', rotation: shape.rotation, points: [
            { x: shape.center.x - shape.radiusX, y: shape.center.y - shape.radiusY },
            { x: shape.center.x + shape.radiusX, y: shape.center.y + shape.radiusY },
        ] };
        case 'polygon': return { tool: 'polygon', points: shape.points };
    }
}
