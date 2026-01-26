/**
 * Industrial Material Densities (lbs per cubic inch)
 */
export const MATERIAL_DENSITIES = {
    ZINC: 0.258,
    ALUMINUM: 0.098,
    CAST_IRON: 0.260,
    STEEL: 0.284,
    BRASS: 0.307
};

/**
 * Calculates volume and weight for a casting using Decimal Inches.
 * @param {number} areaSqIn - Area in square inches
 * @param {number} heightIn - Thickness/Height in inches
 * @param {string} material - Key from MATERIAL_DENSITIES
 * @returns {Object} { volume, weight }
 */
export const calculateCastingStats = (areaSqIn, heightIn, material = 'ZINC') => {
    const density = MATERIAL_DENSITIES[material] || MATERIAL_DENSITIES.ZINC;
    const volume = areaSqIn * heightIn;
    const weight = volume * density;

    return {
        volume: parseFloat(volume.toFixed(3)),
        weight: parseFloat(weight.toFixed(3)),
        area: parseFloat(areaSqIn.toFixed(3))
    };
};

/**
 * Area calculation specifically for the Polygon/Star shape
 * Works in inches if points are in inches.
 */
export const calculatePolygonArea = (points) => {
    if (!points || points.length < 3) return 0;
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
};

/**
 * Specialized area formulas for Phase 2 Shapes
 */
export const SHAPE_FORMULAS = {
    DISK: (diameter) => Math.PI * Math.pow(diameter / 2, 2),
    BLOCK: (width, length) => width * length,
    FLANGE: (diameter, holeDia) => {
        const mainArea = Math.PI * Math.pow(diameter / 2, 2);
        const holeArea = Math.PI * Math.pow(holeDia / 2, 2);
        return Math.max(0, mainArea - holeArea);
    }
};
