import { describe, it, expect } from 'vitest';
import { buildPatternRender, patternToSVGDocument } from './patternRender';
import { generateBlockPoints } from './geometry';
import { PIXELS_PER_INCH } from '../utils/unitConversion';

const BLOCK = { shapeType: 'BLOCK', width: 4, length: 6, holeDiameter: 0 };
const points = generateBlockPoints(4, 6);

describe('buildPatternRender', () => {
    it('reports true physical extents plus margin', () => {
        const r = buildPatternRender(points, BLOCK, { shrinkFactor: 1, marginIn: 0.5 });
        expect(r.extentsIn.width).toBeCloseTo(4);
        expect(r.extentsIn.height).toBeCloseTo(6);
        expect(r.widthIn).toBeCloseTo(5);
        expect(r.heightIn).toBeCloseTo(7);
    });

    it('applies the shrink allowance to the exported geometry', () => {
        // Regression: shrinkage scaled only the on-screen group, so the file
        // that actually went to the shop carried no allowance at all.
        const plain = buildPatternRender(points, BLOCK, { shrinkFactor: 1 });
        const shrunk = buildPatternRender(points, BLOCK, { shrinkFactor: 1.02 });
        expect(shrunk.extentsIn.width).toBeCloseTo(4 * 1.02, 6);
        expect(shrunk.extentsIn.width).toBeGreaterThan(plain.extentsIn.width);
    });

    it('scales the hole with the pattern', () => {
        const withHole = buildPatternRender(points, { ...BLOCK, holeDiameter: 1 }, { shrinkFactor: 2 });
        // Hole radius in pixels = (1 * 2) / 2 * PPI
        expect(withHole.pathData).toContain(`${PIXELS_PER_INCH}`);
        expect((withHole.pathData.match(/Z/g) || []).length).toBe(2);
    });

    it('emits exactly one hole subpath (not two at mismatched scales)', () => {
        const r = buildPatternRender(points, { ...BLOCK, holeDiameter: 2 }, {});
        expect((r.pathData.match(/A /g) || []).length).toBe(2); // one circle = 2 arcs
    });

    it('survives an empty outline', () => {
        const r = buildPatternRender([], BLOCK, {});
        expect(Number.isFinite(r.widthIn)).toBe(true);
    });
});

describe('patternToSVGDocument', () => {
    it('sizes the document in real inches for 1:1 output', () => {
        const r = buildPatternRender(points, BLOCK, {});
        const svg = patternToSVGDocument(r, { title: 'T', description: 'D' });
        expect(svg).toContain(`width="${r.widthIn.toFixed(4)}in"`);
        expect(svg).toContain(`height="${r.heightIn.toFixed(4)}in"`);
        expect(svg).toContain('fill-rule="evenodd"');
    });

    it('escapes metadata so a project name cannot break the file', () => {
        const r = buildPatternRender(points, BLOCK, {});
        const svg = patternToSVGDocument(r, { title: '<bad>&', description: 'x' });
        expect(svg).toContain('&lt;bad&gt;&amp;');
        expect(svg).not.toContain('<bad>');
    });
});
