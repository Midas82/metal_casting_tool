import { describe, it, expect } from 'vitest';
import { dragToGeometryPatch } from './dragMath';

// PIXELS_PER_INCH is 96 (src/utils/unitConversion.js) - offsets below are
// chosen as multiples of that so expected inch values come out clean.

describe('dragToGeometryPatch', () => {
    it('doubles the absolute offsets into width and length for a corner drag', () => {
        const patch = dragToGeometryPatch({ type: 'corner', dx: 192, dy: 384, zoom: 1, shrinkFactor: 1 });
        expect(patch).toEqual({ width: 4, length: 8 });
    });

    it('maps the outer handle to outerRadius', () => {
        const patch = dragToGeometryPatch({ type: 'outer', dx: 0, dy: 192, zoom: 1, shrinkFactor: 1 });
        expect(patch).toEqual({ outerRadius: 2 });
    });

    it('maps the inner handle to innerRadius', () => {
        const patch = dragToGeometryPatch({ type: 'inner', dx: 0, dy: 192, zoom: 1, shrinkFactor: 1 });
        expect(patch).toEqual({ innerRadius: 2 });
    });

    it('uses the Euclidean hypotenuse for radial handles', () => {
        // 3-4-5 triangle scaled by 96 px/in -> 5" radius.
        const patch = dragToGeometryPatch({ type: 'outer', dx: 288, dy: 384, zoom: 1, shrinkFactor: 1 });
        expect(patch.outerRadius).toBeCloseTo(5, 9);
    });

    it('cancels zoom: doubling zoom halves the resulting inches for the same screen delta', () => {
        const at1x = dragToGeometryPatch({ type: 'outer', dx: 0, dy: 192, zoom: 1, shrinkFactor: 1 });
        const at2x = dragToGeometryPatch({ type: 'outer', dx: 0, dy: 192, zoom: 2, shrinkFactor: 1 });
        expect(at2x.outerRadius).toBeCloseTo(at1x.outerRadius / 2, 9);
    });

    it('undoes the shrink allowance: a shrinkFactor of 2 halves the inches', () => {
        const unshrunk = dragToGeometryPatch({ type: 'outer', dx: 0, dy: 192, zoom: 1, shrinkFactor: 1 });
        const shrunk = dragToGeometryPatch({ type: 'outer', dx: 0, dy: 192, zoom: 1, shrinkFactor: 2 });
        expect(shrunk.outerRadius).toBeCloseTo(unshrunk.outerRadius / 2, 9);
    });

    it('yields positive dimensions for negative dx/dy on a corner drag', () => {
        const patch = dragToGeometryPatch({ type: 'corner', dx: -192, dy: -384, zoom: 1, shrinkFactor: 1 });
        expect(patch).toEqual({ width: 4, length: 8 });
    });

    it('produces no NaN for zero input deltas', () => {
        const corner = dragToGeometryPatch({ type: 'corner', dx: 0, dy: 0, zoom: 1, shrinkFactor: 1 });
        expect(corner).toEqual({ width: 0, length: 0 });
        expect(Number.isNaN(corner.width)).toBe(false);
        expect(Number.isNaN(corner.length)).toBe(false);

        const outer = dragToGeometryPatch({ type: 'outer', dx: 0, dy: 0, zoom: 1, shrinkFactor: 1 });
        expect(outer).toEqual({ outerRadius: 0 });
        expect(Number.isNaN(outer.outerRadius)).toBe(false);
    });
});
