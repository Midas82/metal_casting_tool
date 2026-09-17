/**
 * Dimensional limits and the single sanitiser every geometry mutation
 * must pass through. Sliders, typed input, dragged handles and loaded
 * vault projects all funnel into sanitizeGeometry() - if a rule is not
 * here, it does not exist.
 */
import { clamp, snapToFraction } from '../utils/unitConversion';

export const SHAPE_TYPES = ['STAR', 'DISK', 'BLOCK'];

export const LIMITS = {
    outerRadius: { min: 0.25, max: 6 },      // 1/2" to 12" diameter
    innerRadius: { min: 0.125, max: 6 },
    width: { min: 0.5, max: 12 },
    length: { min: 0.5, max: 12 },
    height: { min: 0.0625, max: 36 },        // 1/16" to 3'
    numPoints: { min: 3, max: 48 },
    /** Minimum web between a star's valley and its tip. */
    minWebGap: 0.25,
    /** Minimum wall of metal left around a centre hole. */
    minWallAtHole: 0.25,
};

export const DEFAULT_GEOMETRY = {
    shapeType: 'STAR',
    numPoints: 5,
    outerRadius: 6.0,
    innerRadius: 3.5,
    holeDiameter: 0,
    width: 4.0,
    length: 6.0,
};

export const DEFAULT_HEIGHT = 1.0;

/**
 * Largest centre hole that leaves minWallAtHole of metal all round.
 * Depends on shape: a disk is bounded by its own radius, a star by its
 * valley radius, a block by its narrowest side.
 */
export const maxHoleDiameter = (geometry) => {
    const { shapeType, outerRadius, innerRadius, width, length } = geometry;
    const wall = 2 * LIMITS.minWallAtHole;

    if (shapeType === 'BLOCK') return Math.max(0, Math.min(width, length) - wall);
    if (shapeType === 'STAR') return Math.max(0, innerRadius * 2 - wall);
    return Math.max(0, outerRadius * 2 - wall); // DISK
};

/**
 * Coerces any geometry-shaped object into a valid, manufacturable one.
 * Order matters: inner depends on outer, and the hole depends on both.
 */
export const sanitizeGeometry = (input = {}) => {
    const g = { ...DEFAULT_GEOMETRY, ...input };

    g.shapeType = SHAPE_TYPES.includes(g.shapeType) ? g.shapeType : DEFAULT_GEOMETRY.shapeType;

    g.numPoints = Math.round(
        clamp(g.numPoints, LIMITS.numPoints.min, LIMITS.numPoints.max, DEFAULT_GEOMETRY.numPoints)
    );

    g.outerRadius = snapToFraction(
        clamp(g.outerRadius, LIMITS.outerRadius.min, LIMITS.outerRadius.max, DEFAULT_GEOMETRY.outerRadius)
    );
    g.width = snapToFraction(clamp(g.width, LIMITS.width.min, LIMITS.width.max, DEFAULT_GEOMETRY.width));
    g.length = snapToFraction(clamp(g.length, LIMITS.length.min, LIMITS.length.max, DEFAULT_GEOMETRY.length));

    // The desired values are what the operator last asked for. They are bounded
    // only by the absolute limits, never by the current shape - so a dimension
    // that today's geometry cannot accommodate is suppressed, not destroyed.
    g.desiredInnerRadius = snapToFraction(
        clamp(
            g.desiredInnerRadius ?? g.innerRadius,
            LIMITS.innerRadius.min,
            LIMITS.innerRadius.max,
            LIMITS.innerRadius.min
        )
    );
    g.desiredHoleDiameter = snapToFraction(
        clamp(g.desiredHoleDiameter ?? g.holeDiameter, 0, LIMITS.outerRadius.max * 2, 0)
    );

    // A star may never invert: the valley stays below the tip by minWebGap.
    const innerCeiling = Math.max(LIMITS.innerRadius.min, g.outerRadius - LIMITS.minWebGap);
    g.innerRadius = snapToFraction(
        clamp(g.desiredInnerRadius, LIMITS.innerRadius.min, innerCeiling, LIMITS.innerRadius.min)
    );

    g.holeDiameter = snapToFraction(clamp(g.desiredHoleDiameter, 0, maxHoleDiameter(g), 0));

    return g;
};

/** Geometry keys whose requested value is remembered separately from the enforced one. */
const DESIRE_KEYS = {
    innerRadius: 'desiredInnerRadius',
    holeDiameter: 'desiredHoleDiameter',
};

/**
 * Applies a change as an operator REQUEST, then sanitises.
 *
 * A value that differs from the current enforced value is an explicit request,
 * so it updates the remembered desire. A value passed through unchanged (the
 * usual case when some other dimension is being edited) leaves the desire
 * alone, which is what lets a suppressed dimension come back when room returns.
 *
 * Without this, sweeping the outer radius down crushed the inner radius and
 * zeroed the centre hole, and sweeping it back up did not restore either -
 * a silent, irreversible loss of the operator's work.
 *
 * `next` may be a full geometry object or a sparse patch.
 */
export const requestGeometry = (previous = {}, next = {}) => {
    const merged = { ...previous, ...next };

    for (const [key, desireKey] of Object.entries(DESIRE_KEYS)) {
        if (next[key] !== undefined && next[key] !== previous[key]) {
            merged[desireKey] = next[key];
        }
    }

    return sanitizeGeometry(merged);
};

/** Height is held outside the geometry object but obeys the same discipline. */
export const sanitizeHeight = (value) =>
    snapToFraction(clamp(value, LIMITS.height.min, LIMITS.height.max, DEFAULT_HEIGHT));
