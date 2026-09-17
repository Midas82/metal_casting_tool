/**
 * Material data and casting arithmetic.
 *
 * shrinkPerFoot is the patternmaker's shrink rule for the alloy, in inches
 * per foot - the form foundries actually quote. The linear factor a pattern
 * must be enlarged by is therefore 1 + shrinkPerFoot / 12.
 */
export const MATERIALS = {
    ZINC: { label: 'Zinc', density: 0.258, shrinkPerFoot: 5 / 32 },
    ALUMINUM: { label: 'Aluminum', density: 0.098, shrinkPerFoot: 5 / 32 },
    CAST_IRON: { label: 'Cast Iron', density: 0.260, shrinkPerFoot: 1 / 8 },
    STEEL: { label: 'Steel', density: 0.284, shrinkPerFoot: 1 / 4 },
    BRASS: { label: 'Brass', density: 0.307, shrinkPerFoot: 3 / 16 },
};

export const DEFAULT_MATERIAL = 'ZINC';

export const getMaterial = (key) => MATERIALS[key] || MATERIALS[DEFAULT_MATERIAL];

/**
 * Linear factor the PATTERN must be scaled by so the casting cools to the
 * nominal dimensions the user typed. Returns exactly 1 when compensation is off.
 */
export const shrinkageFactor = (materialKey, enabled = true) => {
    if (!enabled) return 1;
    return 1 + getMaterial(materialKey).shrinkPerFoot / 12;
};

/** Human-readable shrink rule, e.g. "5/32 in/ft (1.30%)". */
export const describeShrinkage = (materialKey) => {
    const { shrinkPerFoot } = getMaterial(materialKey);
    const thirtySeconds = Math.round(shrinkPerFoot * 32);
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const common = gcd(thirtySeconds, 32);
    const pct = ((shrinkPerFoot / 12) * 100).toFixed(2);
    return `${thirtySeconds / common}/${32 / common} in/ft (${pct}%)`;
};

/**
 * Volume and weight of the FINISHED CASTING (nominal dimensions).
 * Prismatic: assumes vertical walls. Real draft taper is roadmap work.
 */
export const calculateCastingStats = (areaSqIn, heightIn, material = DEFAULT_MATERIAL) => {
    const { density } = getMaterial(material);
    const volume = areaSqIn * heightIn;

    return {
        area: parseFloat(areaSqIn.toFixed(3)),
        volume: parseFloat(volume.toFixed(3)),
        weight: parseFloat((volume * density).toFixed(3)),
    };
};

/** Shoelace area of a closed polygon. Points must be in inches. */
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

export const SHAPE_FORMULAS = {
    DISK: (diameter) => Math.PI * Math.pow(diameter / 2, 2),
    BLOCK: (width, length) => width * length,
};

/**
 * Net cross-sectional area of a shape in square inches, hole removed.
 * `points` are the shape outline in inches (used for STAR).
 */
export const calculateNetArea = (points, geometry) => {
    const { shapeType, outerRadius, holeDiameter = 0, width, length } = geometry;

    let area = 0;
    if (shapeType === 'DISK') area = SHAPE_FORMULAS.DISK(outerRadius * 2);
    else if (shapeType === 'BLOCK') area = SHAPE_FORMULAS.BLOCK(width, length);
    else area = calculatePolygonArea(points);

    const holeArea = Math.PI * Math.pow(holeDiameter / 2, 2);
    return Math.max(0, area - holeArea);
};
