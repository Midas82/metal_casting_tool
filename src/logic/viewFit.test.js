import { describe, it, expect } from 'vitest';
import { computeFitView, extentsOf, SIDEBAR_WIDTH } from './viewFit';

const VIEW = { width: 1440, height: 900 };

describe('computeFitView', () => {
    it('frames a large pattern below 1:1 so it is not clipped', () => {
        const big = { shapeType: 'DISK', outerRadius: 6, width: 4, length: 6 };
        const { zoom } = computeFitView(big, 1, VIEW);
        expect(zoom).toBeLessThan(1);
        expect(zoom).toBeGreaterThan(0.1);
    });

    it('never zooms past the clamp range', () => {
        const tiny = { shapeType: 'DISK', outerRadius: 0.25, width: 1, length: 1 };
        expect(computeFitView(tiny, 1, VIEW).zoom).toBeLessThanOrEqual(5);
        const huge = { shapeType: 'BLOCK', outerRadius: 6, width: 12, length: 12 };
        expect(computeFitView(huge, 1, VIEW).zoom).toBeGreaterThanOrEqual(0.1);
    });

    it('offsets the origin clear of the sidebar', () => {
        expect(computeFitView({ shapeType: 'DISK', outerRadius: 3 }, 1, VIEW).pan.x)
            .toBe(SIDEBAR_WIDTH / 2);
    });

    it('accounts for the shrink allowance', () => {
        const geo = { shapeType: 'DISK', outerRadius: 6 };
        expect(computeFitView(geo, 1.05, VIEW).zoom).toBeLessThan(computeFitView(geo, 1, VIEW).zoom);
    });

    it('reads block extents from width and length', () => {
        expect(extentsOf({ shapeType: 'BLOCK', width: 4, length: 6 })).toEqual({ halfW: 2, halfH: 3 });
    });

    it('survives a degenerate viewport', () => {
        expect(Number.isFinite(computeFitView({ shapeType: 'DISK', outerRadius: 6 }, 1, { width: 0, height: 0 }).zoom)).toBe(true);
    });
});
