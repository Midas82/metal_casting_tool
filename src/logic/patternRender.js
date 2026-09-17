/**
 * Builds the physical, 1:1 representation of a pattern.
 *
 * Both the SVG export and the print sheet consume this, so what the shop
 * prints and what the shop laser-cuts can never drift apart.
 *
 * Input points are the FINISHED CASTING in inches. Applying shrinkFactor
 * here - and only here - produces the PATTERN, which is what gets made.
 */
import { inchesToPixels } from '../utils/unitConversion';
import { pointsToSVGPath, addHoleToPath, boundsOf } from './geometry';

export const DEFAULT_MARGIN_IN = 0.5;

export const buildPatternRender = (points, geometry, options = {}) => {
    const { shrinkFactor = 1, marginIn = DEFAULT_MARGIN_IN } = options;
    const { holeDiameter = 0 } = geometry;

    // Casting -> pattern.
    const patternPoints = (points || []).map((p) => ({
        x: p.x * shrinkFactor,
        y: p.y * shrinkFactor,
    }));
    const patternHoleDia = holeDiameter * shrinkFactor;

    // Bounds come from the real outline, not from a per-shape guess.
    const b = boundsOf(patternPoints);
    const widthIn = b.maxX - b.minX + marginIn * 2;
    const heightIn = b.maxY - b.minY + marginIn * 2;

    const pixelPoints = patternPoints.map((p) => ({
        x: inchesToPixels(p.x),
        y: inchesToPixels(p.y),
    }));

    let pathData = pointsToSVGPath(pixelPoints);
    if (patternHoleDia > 0) {
        pathData = addHoleToPath(pathData, inchesToPixels(patternHoleDia / 2));
    }

    const viewBox = [
        inchesToPixels(b.minX - marginIn),
        inchesToPixels(b.minY - marginIn),
        inchesToPixels(widthIn),
        inchesToPixels(heightIn),
    ].join(' ');

    return {
        pathData,
        viewBox,
        widthIn,
        heightIn,
        extentsIn: {
            width: b.maxX - b.minX,
            height: b.maxY - b.minY,
        },
    };
};

/**
 * Serialises a render to a standalone SVG sized in real inches, so opening
 * or printing it at 100% yields a true 1:1 template.
 */
export const patternToSVGDocument = (render, meta = {}) => {
    const { title = 'Pattern', description = '' } = meta;
    const esc = (s) =>
        String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${render.viewBox}" width="${render.widthIn.toFixed(4)}in" height="${render.heightIn.toFixed(4)}in">
    <title>${esc(title)}</title>
    <desc>${esc(description)}</desc>
    <path d="${render.pathData}" fill="none" stroke="black" stroke-width="1" fill-rule="evenodd" />
</svg>`;
};
