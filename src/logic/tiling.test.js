import { describe, it, expect } from 'vitest';
import { planTiles, LETTER, A4, DEFAULT_PAGE_MARGIN_IN, DEFAULT_OVERLAP_IN } from './tiling';

describe('planTiles', () => {
    // Ground truth cross-checked against the sibling Flutter tool's proven
    // tiling output - if this drifts, the port has diverged from production.
    it('matches the source project for a 96x144 pattern on Letter, no margin', () => {
        const plan = planTiles(96, 144, { page: LETTER, margin: 0, overlap: 1.0 });

        expect(plan.cols).toBe(13);
        expect(plan.rows).toBe(15);
        expect(plan.count).toBe(195);
        expect(plan.tiles[0].label).toBe('A1');
        expect(plan.tiles[plan.tiles.length - 1].label).toBe('O13');
    });

    // Letter with the tool's default margin/overlap: usable 8.0 x 10.5,
    // step 7.5 x 10.0.
    it('tiles the tool\'s 12" max pattern (plus margin) into a 2x2 grid', () => {
        const plan = planTiles(13, 13, {
            page: LETTER,
            margin: DEFAULT_PAGE_MARGIN_IN,
            overlap: DEFAULT_OVERLAP_IN,
        });

        expect(plan.cols).toBe(2);
        expect(plan.rows).toBe(2);
        expect(plan.count).toBe(4);
        expect(plan.tiles[0].label).toBe('A1');
        expect(plan.tiles[plan.tiles.length - 1].label).toBe('B2');
    });

    it('tiles a 9x9 pattern into 2 columns, 1 row', () => {
        const plan = planTiles(9, 9, {
            page: LETTER,
            margin: DEFAULT_PAGE_MARGIN_IN,
            overlap: DEFAULT_OVERLAP_IN,
        });

        expect(plan.cols).toBe(2);
        expect(plan.rows).toBe(1);
        expect(plan.count).toBe(2);
    });

    it('keeps a small 5x7 block on a single sheet - no regression for small work', () => {
        const plan = planTiles(5, 7, {
            page: LETTER,
            margin: DEFAULT_PAGE_MARGIN_IN,
            overlap: DEFAULT_OVERLAP_IN,
        });

        expect(plan.cols).toBe(1);
        expect(plan.rows).toBe(1);
        expect(plan.count).toBe(1);
        expect(plan.tiles[0].label).toBe('A1');
    });

    it('never decreases tile count as overlap grows', () => {
        const small = planTiles(20, 15, { page: LETTER, margin: 0.25, overlap: 0.25 });
        const big = planTiles(20, 15, { page: LETTER, margin: 0.25, overlap: 1.5 });

        expect(big.count).toBeGreaterThanOrEqual(small.count);
    });

    it('steps tile origins by exactly stepXIn / stepYIn', () => {
        const plan = planTiles(20, 15, { page: LETTER, margin: 0.25, overlap: 0.5 });

        const rightNeighbor = plan.tiles.find((t) => t.row === 0 && t.col === 1);
        const downNeighbor = plan.tiles.find((t) => t.row === 1 && t.col === 0);
        const origin = plan.tiles.find((t) => t.row === 0 && t.col === 0);

        expect(rightNeighbor.xIn - origin.xIn).toBeCloseTo(plan.stepXIn, 10);
        expect(downNeighbor.yIn - origin.yIn).toBeCloseTo(plan.stepYIn, 10);
    });

    it('produces unique labels across the whole grid', () => {
        const plan = planTiles(96, 144, { page: LETTER, margin: 0, overlap: 1.0 });
        const labels = plan.tiles.map((t) => t.label);

        expect(new Set(labels).size).toBe(labels.length);
    });

    it('supports A4 and landscape without breaking the grid', () => {
        const plan = planTiles(12, 12, { page: A4, margin: 0.25, overlap: 0.5, landscape: true });

        expect(plan.pageWidthIn).toBe(A4.height);
        expect(plan.pageHeightIn).toBe(A4.width);
        expect(plan.count).toBe(plan.cols * plan.rows);
    });

    it('does not produce NaN or hang on zero or negative content size', () => {
        const zero = planTiles(0, 0, { page: LETTER, margin: 0.25, overlap: 0.5 });
        expect(zero.count).toBe(0);
        expect(Number.isNaN(zero.cols)).toBe(false);
        expect(Number.isNaN(zero.rows)).toBe(false);

        const negative = planTiles(-5, -3, { page: LETTER, margin: 0.25, overlap: 0.5 });
        expect(negative.count).toBe(0);
        expect(Number.isNaN(negative.cols)).toBe(false);
        expect(Number.isNaN(negative.rows)).toBe(false);
    });

    it('throws when overlap would collapse the step to zero or less', () => {
        // Usable area is 8.0 x 10.5; an overlap that size or larger leaves
        // no forward progress between tiles.
        expect(() =>
            planTiles(20, 20, { page: LETTER, margin: 0.25, overlap: 8.0 })
        ).toThrow(RangeError);

        expect(() =>
            planTiles(20, 20, { page: LETTER, margin: 0.25, overlap: 10.5 })
        ).toThrow(RangeError);
    });

    it('accepts an overlap safely below the usable page size', () => {
        expect(() =>
            planTiles(20, 20, { page: LETTER, margin: 0.25, overlap: 7.9 })
        ).not.toThrow();
    });
});
