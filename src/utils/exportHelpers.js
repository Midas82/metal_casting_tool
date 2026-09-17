import { buildPatternRender, patternToSVGDocument } from '../logic/patternRender';
import { formatImperial } from './unitConversion';
import { describeShrinkage, getMaterial } from './castingFormulas';

/**
 * Generates and downloads a 1:1 SVG of the PATTERN.
 *
 * When shrinkage compensation is on, the exported geometry is enlarged by the
 * alloy's shrink rule - the export is the thing that gets manufactured, so the
 * allowance has to be in the file, not just on the screen.
 */
export const downloadSVG = (points, geometry, options = {}) => {
    const {
        filename = 'pattern_export.svg',
        shrinkFactor = 1,
        material = 'ZINC',
        shrinkageEnabled = false,
        height = 0,
        projectName = 'Untitled Pattern',
    } = options;

    const render = buildPatternRender(points, geometry, { shrinkFactor });

    const allowance = shrinkageEnabled
        ? `shrink allowance applied: ${describeShrinkage(material)} (x${shrinkFactor.toFixed(5)})`
        : 'NO shrink allowance - nominal casting size';

    const description = [
        `Project: ${projectName}`,
        `Shape: ${geometry.shapeType}`,
        `Material: ${getMaterial(material).label}`,
        `Pattern height: ${formatImperial(height)}`,
        `Extents: ${formatImperial(render.extentsIn.width)} x ${formatImperial(render.extentsIn.height)}`,
        allowance,
        'Scale 1:1 - do not resize when printing or importing.',
        `Generated ${new Date().toISOString().slice(0, 10)} by Midas Digital Pattern Suite`,
    ].join(' | ');

    const svgContent = patternToSVGDocument(render, { title: projectName, description });

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
