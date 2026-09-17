import { describe, it, expect } from 'vitest';
import { sanitizeGeometry, sanitizeHeight, maxHoleDiameter, LIMITS, DEFAULT_GEOMETRY } from './constraints';

describe('sanitizeGeometry', () => {
    it('clamps an oversized diameter typed into the text field', () => {
        // Regression: typed input bypassed validation entirely, so a box
        // labelled "max 12 inches" happily accepted a 50" radius.
        const g = sanitizeGeometry({ ...DEFAULT_GEOMETRY, outerRadius: 25 });
        expect(g.outerRadius).toBe(LIMITS.outerRadius.max);
    });

    it('never lets a star invert', () => {
        const g = sanitizeGeometry({ ...DEFAULT_GEOMETRY, outerRadius: 4, innerRadius: 9 });
        expect(g.innerRadius).toBeLessThanOrEqual(g.outerRadius - LIMITS.minWebGap);
    });

    it('pulls the inner radius down when the outer radius shrinks', () => {
        const g = sanitizeGeometry({ ...DEFAULT_GEOMETRY, outerRadius: 1, innerRadius: 3.5 });
        expect(g.innerRadius).toBeLessThanOrEqual(1 - LIMITS.minWebGap);
    });

    it('caps the hole so a wall of metal always remains', () => {
        const star = sanitizeGeometry({ ...DEFAULT_GEOMETRY, shapeType: 'STAR', innerRadius: 2, holeDiameter: 99 });
        expect(star.holeDiameter).toBe(2 * 2 - 2 * LIMITS.minWallAtHole);

        const block = sanitizeGeometry({ shapeType: 'BLOCK', width: 4, length: 6, holeDiameter: 99 });
        expect(block.holeDiameter).toBe(4 - 2 * LIMITS.minWallAtHole);

        const disk = sanitizeGeometry({ shapeType: 'DISK', outerRadius: 3, holeDiameter: 99 });
        expect(disk.holeDiameter).toBe(6 - 2 * LIMITS.minWallAtHole);
    });

    it('sizes a disk hole from the disk, not from leftover star state', () => {
        // Regression: the slider gated a disk's hole on innerRadius.
        const geo = { shapeType: 'DISK', outerRadius: 6, innerRadius: 0.5, holeDiameter: 0 };
        expect(maxHoleDiameter(geo)).toBe(12 - 2 * LIMITS.minWallAtHole);
    });

    it('repairs garbage and missing fields instead of propagating NaN', () => {
        const g = sanitizeGeometry({ outerRadius: 'wide', numPoints: null, width: undefined, shapeType: 'BLOB' });
        expect(Number.isFinite(g.outerRadius)).toBe(true);
        expect(Number.isFinite(g.width)).toBe(true);
        expect(Number.isInteger(g.numPoints)).toBe(true);
        expect(g.shapeType).toBe('STAR');
    });

    it('is idempotent', () => {
        const once = sanitizeGeometry({ outerRadius: 25, innerRadius: 40, holeDiameter: 99 });
        expect(sanitizeGeometry(once)).toEqual(once);
    });

    it('keeps values on a 1/64 boundary', () => {
        const g = sanitizeGeometry({ ...DEFAULT_GEOMETRY, outerRadius: 3.333333 });
        expect(g.outerRadius * 64).toBeCloseTo(Math.round(g.outerRadius * 64), 9);
    });
});

describe('sanitizeHeight', () => {
    it('enforces the stated 3 foot ceiling', () => {
        expect(sanitizeHeight(100)).toBe(LIMITS.height.max);
        expect(sanitizeHeight(0)).toBe(LIMITS.height.min);
        expect(sanitizeHeight('tall')).toBeGreaterThan(0);
    });
});
