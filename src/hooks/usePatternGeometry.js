import { useMemo } from 'react';
import {
    generateStarPoints,
    generateCirclePoints,
    generateBlockPoints,
    generateHandles,
    pointsToSVGPath,
    addHoleToPath,
} from '../logic/geometry';
import { inchesToPixels } from '../utils/unitConversion';

/**
 * Derives everything the canvas needs from a sanitised geometry object.
 *
 * The centre hole is applied HERE and nowhere else - it used to be appended
 * again downstream at inch scale into a pixel-scale path, which left a filled
 * speck in the middle of every hole.
 */
export default function usePatternGeometry(geometry) {
    const { shapeType, numPoints, outerRadius, innerRadius, holeDiameter, width, length } = geometry;

    return useMemo(() => {
        let pointsInches;
        switch (shapeType) {
            case 'DISK':
                pointsInches = generateCirclePoints(outerRadius);
                break;
            case 'BLOCK':
                pointsInches = generateBlockPoints(width, length);
                break;
            case 'STAR':
            default:
                pointsInches = generateStarPoints(numPoints, outerRadius, innerRadius);
                break;
        }

        const pointsPixels = pointsInches.map((p) => ({
            x: inchesToPixels(p.x),
            y: inchesToPixels(p.y),
        }));

        let path = pointsToSVGPath(pointsPixels);
        if (holeDiameter > 0) {
            path = addHoleToPath(path, inchesToPixels(holeDiameter / 2));
        }

        // Handles are shape-aware and stay in pixel space for rendering.
        const handles = generateHandles(geometry, pointsInches).map((h) => ({
            ...h,
            x: inchesToPixels(h.x),
            y: inchesToPixels(h.y),
        }));

        return {
            points: pointsInches,   // inches - area, stats and export
            renderPoints: pointsPixels,
            handles,
            path,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shapeType, numPoints, outerRadius, innerRadius, holeDiameter, width, length]);
}
