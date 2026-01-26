import { inchesToPixels } from './unitConversion';
import { pointsToSVGPath, addHoleToPath } from '../logic/geometry';

/**
 * Generates and downloads a clean SVG file of the pattern
 */
export const downloadSVG = (points, geometry, filename = 'pattern_export_midas.svg') => {
    const { holeDiameter = 0, outerRadius = 6, width = 4, length = 6, shapeType = 'STAR' } = geometry;

    // 1. Calculate Bounds in INCHES
    let bounds = { minX: -outerRadius, maxX: outerRadius, minY: -outerRadius, maxY: outerRadius };
    if (shapeType === 'BLOCK') {
        bounds = { minX: -width / 2, maxX: width / 2, minY: -length / 2, maxY: length / 2 };
    }

    // Convert bounds to pixels for viewBox
    const margin = 0.5; // 0.5" margin
    const viewBoxX = inchesToPixels(bounds.minX - margin);
    const viewBoxY = inchesToPixels(bounds.minY - margin);
    const viewBoxW = inchesToPixels(bounds.maxX - bounds.minX + margin * 2);
    const viewBoxH = inchesToPixels(bounds.maxY - bounds.minY + margin * 2);

    // 2. Generate Path
    // Scale points to pixels
    const renderPoints = points.map(p => ({ x: inchesToPixels(p.x), y: inchesToPixels(p.y) }));
    let pathData = pointsToSVGPath(renderPoints);
    if (holeDiameter > 0) {
        pathData = addHoleToPath(pathData, inchesToPixels(holeDiameter / 2));
    }

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}" width="${viewBoxW / 96}in" height="${viewBoxH / 96}in">
    <title>${filename}</title>
    <desc>Imperial Foundary Pattern - Midas Digital</desc>
    <path d="${pathData}" fill="none" stroke="black" stroke-width="1" fill-rule="evenodd" />
</svg>
    `.trim();

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
