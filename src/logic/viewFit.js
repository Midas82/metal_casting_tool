/**
 * Camera framing.
 *
 * Rendering at a true 96 px/in means a 12" pattern is 1152 px across, so it
 * will not fit a laptop viewport at 1:1. Framing is therefore a first-class
 * control rather than something the operator has to discover by scrolling.
 */
import { inchesToPixels } from '../utils/unitConversion';

/** Width of the control sidebar overlay, in CSS pixels. */
export const SIDEBAR_WIDTH = 320;

/** Half-extents of a shape in inches, straight from its parameters. */
export const extentsOf = (geometry) => {
    const { shapeType, outerRadius, width, length } = geometry;
    if (shapeType === 'BLOCK') return { halfW: width / 2, halfH: length / 2 };
    return { halfW: outerRadius, halfH: outerRadius };
};

/**
 * Zoom and pan that frame the pattern in the canvas area right of the sidebar.
 * Pure, so it can seed initial state as well as drive the Fit button.
 */
export const computeFitView = (geometry, shrinkFactor, viewport) => {
    const { halfW, halfH } = extentsOf(geometry);
    const widthIn = Math.max(halfW * 2 * shrinkFactor, 0.25);
    const heightIn = Math.max(halfH * 2 * shrinkFactor, 0.25);

    const availW = Math.max(240, viewport.width - SIDEBAR_WIDTH - 96);
    const availH = Math.max(240, viewport.height - 128);

    const zoom = Math.min(availW / inchesToPixels(widthIn), availH / inchesToPixels(heightIn));

    return {
        zoom: Math.max(0.1, Math.min(5, zoom)),
        // Nudge the origin into the middle of the visible canvas.
        pan: { x: SIDEBAR_WIDTH / 2, y: 0 },
    };
};
