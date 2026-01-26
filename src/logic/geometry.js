/**
 * Generates coordinates for a Star/Gear shape (in inches).
 */
export const generateStarPoints = (numPoints, outerRadius, innerRadius) => {
    const points = [];
    const totalVertices = numPoints * 2;
    const angleStep = (Math.PI * 2) / totalVertices;
    for (let i = 0; i < totalVertices; i++) {
        const angle = i * angleStep;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
            x: parseFloat((r * Math.cos(angle)).toFixed(4)),
            y: parseFloat((r * Math.sin(angle)).toFixed(4))
        });
    }
    return points;
};

/**
 * Generates coordinates for a Simple Disk/Circle.
 * Note: SVGs use <circle>, but we generate points for area/handle logic.
 */
export const generateCirclePoints = (radius, resolution = 40) => {
    const points = [];
    const angleStep = (Math.PI * 2) / resolution;
    for (let i = 0; i < resolution; i++) {
        const angle = i * angleStep;
        points.push({
            x: parseFloat((radius * Math.cos(angle)).toFixed(4)),
            y: parseFloat((radius * Math.sin(angle)).toFixed(4))
        });
    }
    return points;
};

/**
 * Generates coordinates for a Rectangular/Block shape.
 */
export const generateBlockPoints = (width, length) => {
    const w2 = width / 2;
    const l2 = length / 2;
    return [
        { x: -w2, y: -l2 },
        { x: w2, y: -l2 },
        { x: w2, y: l2 },
        { x: -w2, y: l2 }
    ];
};

/**
 * Converts points to SVG path.
 */
export const pointsToSVGPath = (points) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${acc} ${command} ${point.x} ${point.y}`;
    }, '') + ' Z';
};

/**
 * Helper to add a hole to a path using even-odd winding.
 */
export const addHoleToPath = (path, holeRadius) => {
    if (!holeRadius || holeRadius <= 0) return path;
    // Draw an inverse circle to "cut" the hole
    const r = holeRadius;
    return `${path} M 0,${-r} A ${r},${r} 0 1,0 0,${r} A ${r},${r} 0 1,0 0,${-r} Z`;
};
