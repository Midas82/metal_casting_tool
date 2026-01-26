import { describe, it, expect } from 'vitest';
import { generateStarPoints } from './geometry';

describe('Geometry Engine', () => {
    it('generates correct number of vertices (2x numPoints)', () => {
        const numPoints = 4;
        const outerRadius = 100;
        const innerRadius = 50;

        const points = generateStarPoints(numPoints, outerRadius, innerRadius);

        // asking for 4 points should generate 8 coordinates (4 tips + 4 valleys)
        expect(points.length).toBe(8);
    });

    it('alternates between outer and inner radius', () => {
        const points = generateStarPoints(4, 100, 50);

        // Check first point (index 0, even) -> Outer Radius logic
        // Angle 0, cos(0)=1, x=100
        expect(points[0].x).toBeCloseTo(100);

        // Check second point (index 1, odd) -> Inner Radius logic
        // Angle 45 deg (PI/4), r=50
        // x = 50 * cos(45) = 35.355
        expect(points[1].x).toBeCloseTo(35.355);
    });
});
