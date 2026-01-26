import { useMemo } from 'react';
import {
    generateStarPoints,
    generateCirclePoints,
    generateBlockPoints,
    pointsToSVGPath,
    addHoleToPath
} from '../logic/geometry';
import { inchesToPixels } from '../utils/unitConversion';

export default function usePatternGeometry(geometry) {
    const {
        shapeType = 'STAR',
        numPoints,
        outerRadius,
        innerRadius,
        holeDiameter,
        width,
        length
    } = geometry;

    return useMemo(() => {
        let pointsInches = [];

        // 1. Generate Points in INCHES
        switch (shapeType) {
            case 'DISK':
                pointsInches = generateCirclePoints(outerRadius);
                break;
            case 'BLOCK':
                pointsInches = generateBlockPoints(width || 4, length || 4);
                break;
            case 'STAR':
            default:
                pointsInches = generateStarPoints(numPoints, outerRadius, innerRadius);
                break;
        }

        // 2. Generate SVG Path (Scaled to Pixels for rendering)
        const scale = (p) => ({ x: inchesToPixels(p.x), y: inchesToPixels(p.y) });
        const pointsPixels = pointsInches.map(scale);
        let path = pointsToSVGPath(pointsPixels);

        // Add Hole if applicable
        if (holeDiameter > 0) {
            path = addHoleToPath(path, inchesToPixels(holeDiameter / 2));
        }

        return {
            points: pointsInches, // For Area Calc
            renderPoints: pointsPixels, // For Handles
            path
        };
    }, [shapeType, numPoints, outerRadius, innerRadius, holeDiameter, width, length]);
}
