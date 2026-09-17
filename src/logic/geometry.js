/**
 * Shape generation. Every function here works in INCHES.
 * Nothing in this file may reference pixels.
 */

/** Star / gear outline: numPoints tips alternating with numPoints valleys. */
export const generateStarPoints = (numPoints, outerRadius, innerRadius) => {
    const points = [];
    const totalVertices = numPoints * 2;
    const angleStep = (Math.PI * 2) / totalVertices;
    for (let i = 0; i < totalVertices; i++) {
        const angle = i * angleStep;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
            x: parseFloat((r * Math.cos(angle)).toFixed(4)),
            y: parseFloat((r * Math.sin(angle)).toFixed(4)),
        });
    }
    return points;
};

/** Disk outline, approximated as a polygon for area and bounds. */
export const generateCirclePoints = (radius, resolution = 64) => {
    const points = [];
    const angleStep = (Math.PI * 2) / resolution;
    for (let i = 0; i < resolution; i++) {
        const angle = i * angleStep;
        points.push({
            x: parseFloat((radius * Math.cos(angle)).toFixed(4)),
            y: parseFloat((radius * Math.sin(angle)).toFixed(4)),
        });
    }
    return points;
};

/** Rectangular block outline, centred on the origin. */
export const generateBlockPoints = (width, length) => {
    const w2 = width / 2;
    const l2 = length / 2;
    return [
        { x: -w2, y: -l2 },
        { x: w2, y: -l2 },
        { x: w2, y: l2 },
        { x: -w2, y: l2 },
    ];
};

/**
 * Interactive handles for a shape, in inches.
 *
 * Each handle declares which dimension it edits, so dragging is meaningful
 * for every shape rather than only for stars:
 *   'outer'  -> outerRadius   'inner' -> innerRadius   'corner' -> width + length
 */
export const generateHandles = (geometry, points) => {
    const { shapeType, outerRadius, width, length } = geometry;

    if (shapeType === 'DISK') {
        // Four cardinal grips; every one resizes the disk.
        return [
            { x: outerRadius, y: 0, type: 'outer' },
            { x: 0, y: outerRadius, type: 'outer' },
            { x: -outerRadius, y: 0, type: 'outer' },
            { x: 0, y: -outerRadius, type: 'outer' },
        ];
    }

    if (shapeType === 'BLOCK') {
        // Corner grips drive width and length together.
        const w2 = width / 2;
        const l2 = length / 2;
        return [
            { x: -w2, y: -l2, type: 'corner' },
            { x: w2, y: -l2, type: 'corner' },
            { x: w2, y: l2, type: 'corner' },
            { x: -w2, y: l2, type: 'corner' },
        ];
    }

    // STAR: tips edit the outer radius, valleys the inner.
    return points.map((p, i) => ({ x: p.x, y: p.y, type: i % 2 === 0 ? 'outer' : 'inner' }));
};

/** Axis-aligned bounds of a point set. */
export const boundsOf = (points) => {
    if (!points || points.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    return points.reduce(
        (acc, p) => ({
            minX: Math.min(acc.minX, p.x),
            maxX: Math.max(acc.maxX, p.x),
            minY: Math.min(acc.minY, p.y),
            maxY: Math.max(acc.maxY, p.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
};

/** Converts a point list to a closed SVG path. Units are whatever you pass in. */
export const pointsToSVGPath = (points) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${acc} ${command} ${point.x} ${point.y}`;
    }, '') + ' Z';
};

/**
 * Appends a centre hole as a second subpath. The caller MUST render with
 * fill-rule="evenodd" for it to read as a hole, and must pass a radius in the
 * SAME units as the path it is appending to.
 */
export const addHoleToPath = (path, holeRadius) => {
    if (!holeRadius || holeRadius <= 0) return path;
    const r = holeRadius;
    return `${path} M 0,${-r} A ${r},${r} 0 1,0 0,${r} A ${r},${r} 0 1,0 0,${-r} Z`;
};
