import { describe, it, expect } from 'vitest';
import {
    generateStarPoints,
    generateCirclePoints,
    generateBlockPoints,
    generateHandles,
    boundsOf,
    pointsToSVGPath,
    addHoleToPath,
} from './geometry';

describe('generateStarPoints', () => {
    it('emits two vertices per point (tip + valley)', () => {
        expect(generateStarPoints(4, 6, 3).length).toBe(8);
    });

    it('alternates outer and inner radius', () => {
        const pts = generateStarPoints(4, 100, 50);
        expect(pts[0].x).toBeCloseTo(100);
        expect(pts[1].x).toBeCloseTo(35.355);
    });
});

describe('generateBlockPoints', () => {
    it('centres the block on the origin', () => {
        const b = boundsOf(generateBlockPoints(4, 6));
        expect(b.minX).toBe(-2);
        expect(b.maxX).toBe(2);
        expect(b.minY).toBe(-3);
        expect(b.maxY).toBe(3);
    });
});

describe('generateCirclePoints', () => {
    it('stays within the radius', () => {
        for (const p of generateCirclePoints(5)) {
            expect(Math.hypot(p.x, p.y)).toBeCloseTo(5, 3);
        }
    });
});

describe('generateHandles', () => {
    it('gives a star alternating outer/inner grips', () => {
        const geo = { shapeType: 'STAR', outerRadius: 6, innerRadius: 3, width: 4, length: 6 };
        const pts = generateStarPoints(5, 6, 3);
        const handles = generateHandles(geo, pts);
        expect(handles.length).toBe(10);
        expect(handles[0].type).toBe('outer');
        expect(handles[1].type).toBe('inner');
    });

    it('gives a disk four grips that all resize it', () => {
        // Regression: a disk used to get 40 handles, half of them no-ops
        // that edited an inner radius the disk does not have.
        const geo = { shapeType: 'DISK', outerRadius: 5, innerRadius: 2, width: 4, length: 6 };
        const handles = generateHandles(geo, generateCirclePoints(5));
        expect(handles.length).toBe(4);
        expect(handles.every((h) => h.type === 'outer')).toBe(true);
    });

    it('gives a block corner grips instead of dead handles', () => {
        // Regression: a block's handles edited outerRadius/innerRadius,
        // neither of which affects a block. They did nothing at all.
        const geo = { shapeType: 'BLOCK', outerRadius: 5, innerRadius: 2, width: 4, length: 6 };
        const handles = generateHandles(geo, generateBlockPoints(4, 6));
        expect(handles.length).toBe(4);
        expect(handles.every((h) => h.type === 'corner')).toBe(true);
    });
});

describe('path helpers', () => {
    it('closes the path', () => {
        expect(pointsToSVGPath([{ x: 0, y: 0 }, { x: 1, y: 0 }]).trim()).toMatch(/^M .* Z$/);
    });

    it('appends exactly one hole subpath', () => {
        const withHole = addHoleToPath('M 0 0 L 1 0 Z', 5);
        expect((withHole.match(/Z/g) || []).length).toBe(2);
    });

    it('is a no-op for a zero or missing radius', () => {
        expect(addHoleToPath('M 0 0 Z', 0)).toBe('M 0 0 Z');
        expect(addHoleToPath('M 0 0 Z', undefined)).toBe('M 0 0 Z');
    });
});
