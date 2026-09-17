/**
 * Pointer-drag arithmetic for the pattern handles.
 *
 * The screen-space delta between the pointer and the shape origin must pass
 * through three inversions before it is a geometry value: undo the view
 * zoom, undo the px/in scale, then undo the shrink allowance (the shape is
 * rendered pre-scaled by shrinkFactor, so a screen inch is shrinkFactor
 * fewer real inches). Extracted so this - the source of two past bugs - is
 * unit-testable without a DOM.
 */
import { pixelsToInches } from '../utils/unitConversion';

/**
 * @param {Object} args
 * @param {'corner'|'outer'|'inner'} args.type - which handle is being dragged.
 * @param {number} args.dx - pointer x minus origin x, in screen pixels.
 * @param {number} args.dy - pointer y minus origin y, in screen pixels.
 * @param {number} args.zoom - current view zoom.
 * @param {number} args.shrinkFactor - linear shrink-allowance factor in effect.
 * @returns {Object} a geometry patch, e.g. { width, length } or { outerRadius }.
 */
export const dragToGeometryPatch = ({ type, dx, dy, zoom, shrinkFactor }) => {
    const canvasDx = dx / zoom;
    const canvasDy = dy / zoom;

    const toInches = (px) => pixelsToInches(px) / shrinkFactor;

    if (type === 'corner') {
        return {
            width: Math.abs(toInches(canvasDx)) * 2,
            length: Math.abs(toInches(canvasDy)) * 2,
        };
    }

    const radiusInches = toInches(Math.sqrt(canvasDx * canvasDx + canvasDy * canvasDy));
    const key = type === 'outer' ? 'outerRadius' : 'innerRadius';
    return { [key]: radiusInches };
};
