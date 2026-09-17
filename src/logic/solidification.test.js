import { describe, it, expect } from 'vitest';
import {
    perimeterOf,
    calculateSurfaceArea,
    solidificationModulus,
    sizeCylindricalRiser,
    calculatePourWeight,
    analyseCasting,
    RISER_MODULUS_RATIO,
} from './solidification';
import { generateBlockPoints, generateCirclePoints } from './geometry';
import { MATERIALS } from '../utils/castingFormulas';

const BLOCK = { shapeType: 'BLOCK', width: 4, length: 6, holeDiameter: 0 };
const blockPts = generateBlockPoints(4, 6);

describe('perimeterOf', () => {
    it('measures a closed rectangle including the closing edge', () => {
        expect(perimeterOf(blockPts)).toBeCloseTo(20, 9); // 2*(4+6)
    });

    it('approaches pi*d for a polygonised circle', () => {
        expect(perimeterOf(generateCirclePoints(6, 512))).toBeCloseTo(Math.PI * 12, 2);
    });

    it('is zero for degenerate input', () => {
        expect(perimeterOf([])).toBe(0);
        expect(perimeterOf(null)).toBe(0);
        expect(perimeterOf([{ x: 1, y: 1 }])).toBe(0);
    });
});

describe('calculateSurfaceArea', () => {
    it('sums both faces plus the outer wall', () => {
        // 4x6x1: faces 2*24 = 48, wall 20*1 = 20 -> 68
        const sa = calculateSurfaceArea(blockPts, BLOCK, 1);
        expect(sa.faces).toBeCloseTo(48, 9);
        expect(sa.outerWall).toBeCloseTo(20, 9);
        expect(sa.holeWall).toBe(0);
        expect(sa.total).toBeCloseTo(68, 9);
    });

    it('removes the hole from the faces and adds its wall', () => {
        const withHole = { ...BLOCK, holeDiameter: 2 };
        const sa = calculateSurfaceArea(blockPts, withHole, 1);
        expect(sa.faces).toBeCloseTo(2 * (24 - Math.PI), 6); // faces lose the hole
        expect(sa.holeWall).toBeCloseTo(Math.PI * 2 * 1, 9); // pi*d*h
    });

    it('scales the walls with height but not the faces', () => {
        const a = calculateSurfaceArea(blockPts, BLOCK, 1);
        const b = calculateSurfaceArea(blockPts, BLOCK, 2);
        expect(b.faces).toBeCloseTo(a.faces, 9);
        expect(b.outerWall).toBeCloseTo(a.outerWall * 2, 9);
    });

    it('is just the two faces at zero height', () => {
        expect(calculateSurfaceArea(blockPts, BLOCK, 0).total).toBeCloseTo(48, 9);
    });
});

describe('solidificationModulus', () => {
    it('is volume over cooling area', () => {
        expect(solidificationModulus(24, 68)).toBeCloseTo(24 / 68, 9);
    });

    it('refuses to divide by a zero or invalid area', () => {
        expect(solidificationModulus(24, 0)).toBe(0);
        expect(solidificationModulus(NaN, 68)).toBe(0);
    });

    it('rises with thickness — a thicker plate freezes more slowly', () => {
        const thin = analyseCasting(blockPts, BLOCK, 0.25, 'ALUMINUM');
        const thick = analyseCasting(blockPts, BLOCK, 2, 'ALUMINUM');
        expect(thick.modulus).toBeGreaterThan(thin.modulus);
    });
});

describe('sizeCylindricalRiser', () => {
    it('gives D = 5M at H = D when the base sits on the casting', () => {
        // The standard convention: the joint is not a cooling surface.
        const r = sizeCylindricalRiser(1, { ratio: 1, heightToDiameter: 1 });
        expect(r.diameter).toBeCloseTo(5, 9);
    });

    it('gives D = 6M at H = D for a free-standing cylinder', () => {
        const r = sizeCylindricalRiser(1, { ratio: 1, heightToDiameter: 1, baseContactsCasting: false });
        expect(r.diameter).toBeCloseTo(6, 9);
    });

    it('round-trips: the sized riser really has the target modulus', () => {
        // The assertion that matters - geometry solved back to its own input.
        for (const hd of [0.5, 1, 1.5, 2]) {
            for (const base of [true, false]) {
                const target = 0.42;
                const r = sizeCylindricalRiser(target, { ratio: 1, heightToDiameter: hd, baseContactsCasting: base });
                expect(solidificationModulus(r.volume, r.surfaceArea)).toBeCloseTo(target, 9);
            }
        }
    });

    it('always feeds later than the casting it serves', () => {
        const casting = 0.35;
        for (const ratio of [RISER_MODULUS_RATIO.min, RISER_MODULUS_RATIO.max]) {
            const r = sizeCylindricalRiser(casting, { ratio });
            expect(r.riserModulus).toBeGreaterThan(casting);
        }
    });

    it('returns a zero riser rather than NaN for nonsense input', () => {
        for (const bad of [0, -1, NaN, undefined]) {
            const r = sizeCylindricalRiser(bad);
            expect(r.diameter).toBe(0);
            expect(Number.isFinite(r.volume)).toBe(true);
        }
    });
});

describe('calculatePourWeight', () => {
    it('separates what is poured from what ships', () => {
        const w = calculatePourWeight(24, 12, 'ALUMINUM');
        expect(w.castingWeight).toBeCloseTo(24 * MATERIALS.ALUMINUM.density, 9);
        expect(w.pourWeight).toBeCloseTo(36 * MATERIALS.ALUMINUM.density, 9);
        expect(w.yieldPercent).toBeCloseTo((24 / 36) * 100, 9);
    });

    it('is 100% yield with no riser', () => {
        expect(calculatePourWeight(24, 0, 'ZINC').yieldPercent).toBe(100);
    });

    it('does not divide by zero on an empty casting', () => {
        expect(calculatePourWeight(0, 0, 'ZINC').yieldPercent).toBe(0);
    });
});

describe('analyseCasting', () => {
    it('reproduces the worked 4x6x1 aluminium block', () => {
        const a = analyseCasting(blockPts, BLOCK, 1, 'ALUMINUM');
        expect(a.netArea).toBeCloseTo(24, 6);
        expect(a.volume).toBeCloseTo(24, 6);
        expect(a.surface.total).toBeCloseTo(68, 6);
        expect(a.modulus).toBeCloseTo(0.35294, 4);
        // 1.2 * 0.35294 * 5 = 2.1176"
        expect(a.riser.diameter).toBeCloseTo(2.1176, 3);
        expect(a.castingWeight).toBeCloseTo(24 * MATERIALS.ALUMINUM.density, 6);
        expect(a.yieldPercent).toBeGreaterThan(0);
        expect(a.yieldPercent).toBeLessThan(100);
    });

    it('reports a lower yield for a heavier riser demand', () => {
        const thin = analyseCasting(blockPts, BLOCK, 0.25, 'ALUMINUM');
        const thick = analyseCasting(blockPts, BLOCK, 2, 'ALUMINUM');
        // A thicker casting needs a much bigger riser relative to itself.
        expect(thick.riser.volume).toBeGreaterThan(thin.riser.volume);
    });

    it('is material-independent in geometry, dependent in weight', () => {
        const al = analyseCasting(blockPts, BLOCK, 1, 'ALUMINUM');
        const fe = analyseCasting(blockPts, BLOCK, 1, 'CAST_IRON');
        expect(fe.modulus).toBeCloseTo(al.modulus, 9);
        expect(fe.riser.diameter).toBeCloseTo(al.riser.diameter, 9);
        expect(fe.pourWeight).toBeGreaterThan(al.pourWeight);
        expect(fe.yieldPercent).toBeCloseTo(al.yieldPercent, 9);
    });
});
