import { describe, it, expect } from 'vitest';
import {
    MATERIALS,
    shrinkageFactor,
    describeShrinkage,
    calculateCastingStats,
    calculatePolygonArea,
    calculateNetArea,
    SHAPE_FORMULAS,
} from './castingFormulas';

describe('shrinkageFactor', () => {
    it('is exactly 1 when compensation is off', () => {
        expect(shrinkageFactor('STEEL', false)).toBe(1);
    });

    it('derives from the alloy patternmaker rule, not a fixed 1.5%', () => {
        // Regression: every material used to share a hard-coded 1.015.
        expect(shrinkageFactor('CAST_IRON', true)).toBeCloseTo(1 + (1 / 8) / 12, 9);
        expect(shrinkageFactor('STEEL', true)).toBeCloseTo(1 + (1 / 4) / 12, 9);
        expect(shrinkageFactor('STEEL', true)).not.toBeCloseTo(shrinkageFactor('CAST_IRON', true), 5);
    });

    it('falls back safely for an unknown material', () => {
        expect(shrinkageFactor('UNOBTAINIUM', true)).toBeGreaterThan(1);
    });

    it('describes the rule in foundry terms', () => {
        expect(describeShrinkage('CAST_IRON')).toContain('1/8 in/ft');
        expect(describeShrinkage('STEEL')).toContain('1/4 in/ft');
    });
});

describe('material table', () => {
    it('gives every alloy a density and a shrink rule', () => {
        for (const [key, m] of Object.entries(MATERIALS)) {
            expect(m.density, key).toBeGreaterThan(0);
            expect(m.shrinkPerFoot, key).toBeGreaterThan(0);
        }
    });
});

describe('area maths', () => {
    it('computes a square via the shoelace formula', () => {
        const square = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }];
        expect(calculatePolygonArea(square)).toBe(4);
    });

    it('returns 0 for a degenerate outline', () => {
        expect(calculatePolygonArea([{ x: 0, y: 0 }])).toBe(0);
        expect(calculatePolygonArea(null)).toBe(0);
    });

    it('subtracts the centre hole', () => {
        const geo = { shapeType: 'DISK', outerRadius: 2, holeDiameter: 2 };
        const expected = Math.PI * 4 - Math.PI * 1;
        expect(calculateNetArea([], geo)).toBeCloseTo(expected, 6);
    });

    it('never goes negative', () => {
        const geo = { shapeType: 'BLOCK', width: 1, length: 1, holeDiameter: 50 };
        expect(calculateNetArea([], geo)).toBe(0);
    });

    it('uses the block formula for blocks', () => {
        expect(SHAPE_FORMULAS.BLOCK(3, 4)).toBe(12);
    });
});

describe('calculateCastingStats', () => {
    it('multiplies area, height and density', () => {
        const s = calculateCastingStats(10, 2, 'ALUMINUM');
        expect(s.volume).toBeCloseTo(20, 3);
        expect(s.weight).toBeCloseTo(20 * MATERIALS.ALUMINUM.density, 3);
    });

    it('changes with the selected material', () => {
        const zinc = calculateCastingStats(10, 1, 'ZINC');
        const alu = calculateCastingStats(10, 1, 'ALUMINUM');
        expect(zinc.weight).not.toBe(alu.weight);
    });
});
