/**
 * Solidification maths: surface area, casting modulus, riser sizing and yield.
 *
 * A casting solidifies from its surface inwards, so the ratio of volume to
 * cooling surface - the modulus M = V/A - governs how long it takes.
 * Chvorinov's rule states t = B*M^2. A riser only feeds the casting if it is
 * still liquid when the casting has frozen, which means its modulus must
 * exceed the casting's; foundry practice is 1.2 to 1.5 times.
 *
 * Everything here is in inches and cubic inches. Pure, no React.
 */
import { getMaterial } from '../utils/castingFormulas';
import { calculateNetArea } from '../utils/castingFormulas';

/** Usual safety factor on the riser modulus. Below 1.2 the riser freezes first. */
export const RISER_MODULUS_RATIO = { min: 1.2, max: 1.5, default: 1.2 };

/** Closed-polygon perimeter, in whatever units the points carry. */
export const perimeterOf = (points) => {
    if (!points || points.length < 2) return 0;
    return points.reduce((total, p, i) => {
        const q = points[(i + 1) % points.length];
        return total + Math.hypot(q.x - p.x, q.y - p.y);
    }, 0);
};

/**
 * Cooling surface of a prismatic casting: both flat faces, the outer wall and
 * the wall of the centre hole.
 *
 * Assumes vertical walls. Real draft taper would enlarge one face and slant
 * the wall; until draft is implemented this is a slight underestimate of area,
 * which makes the modulus a slight OVERestimate - erring towards a larger
 * riser, which is the safe direction.
 */
export const calculateSurfaceArea = (points, geometry, heightIn) => {
    const height = Math.max(0, heightIn || 0);
    const netArea = calculateNetArea(points, geometry);
    const holeDiameter = geometry.holeDiameter || 0;

    const faces = 2 * netArea;
    const outerWall = perimeterOf(points) * height;
    const holeWall = Math.PI * holeDiameter * height;

    return {
        faces,
        outerWall,
        holeWall,
        total: faces + outerWall + holeWall,
    };
};

/** M = V/A, in inches. Zero area means no meaningful modulus. */
export const solidificationModulus = (volumeIn3, surfaceAreaIn2) => {
    if (!Number.isFinite(volumeIn3) || !Number.isFinite(surfaceAreaIn2) || surfaceAreaIn2 <= 0) return 0;
    return volumeIn3 / surfaceAreaIn2;
};

/**
 * Sizes a cylindrical riser to a target modulus.
 *
 * For a cylinder of height H = r*D:
 *   V = pi*D^3*r/4
 *   A = pi*D*H + (pi*D^2/4)*k      k = number of flat ends that cool
 *   M = V/A = (D*r/4) / (r + k/4)  =>  D = M*(4r + k)/r
 *
 * `baseContactsCasting` (the default, and the normal case) means the riser sits
 * on the casting, so its bottom face is not a cooling surface and k = 1, giving
 * D = 5M at H = D. A free-standing cylinder cools from both ends, k = 2, giving
 * D = 6M. Getting this wrong by one end oversizes the diameter by 20% and the
 * riser volume by roughly 73%, so the convention is explicit rather than baked in.
 */
export const sizeCylindricalRiser = (castingModulus, options = {}) => {
    const {
        ratio = RISER_MODULUS_RATIO.default,
        heightToDiameter = 1,
        baseContactsCasting = true,
    } = options;

    const coolingEnds = baseContactsCasting ? 1 : 2;
    const r = heightToDiameter;

    if (!Number.isFinite(castingModulus) || castingModulus <= 0 || r <= 0) {
        return { ratio, riserModulus: 0, diameter: 0, height: 0, volume: 0, surfaceArea: 0 };
    }

    const riserModulus = castingModulus * ratio;
    const diameter = riserModulus * (4 * r + coolingEnds) / r;
    const height = diameter * r;

    const volume = Math.PI * Math.pow(diameter, 2) / 4 * height;
    const surfaceArea = Math.PI * diameter * height + (Math.PI * Math.pow(diameter, 2) / 4) * coolingEnds;

    return { ratio, riserModulus, diameter, height, volume, surfaceArea };
};

/**
 * Metal actually needed for a pour, versus metal that leaves as product.
 *
 * Yield is the number a foundry buys metal by: a casting reported without its
 * riser understates the melt by 20-35% on typical small work.
 */
export const calculatePourWeight = (castingVolumeIn3, riserVolumeIn3, materialKey) => {
    const { density } = getMaterial(materialKey);
    const casting = Math.max(0, castingVolumeIn3 || 0);
    const riser = Math.max(0, riserVolumeIn3 || 0);
    const total = casting + riser;

    return {
        castingWeight: casting * density,
        riserWeight: riser * density,
        pourWeight: total * density,
        yieldPercent: total > 0 ? (casting / total) * 100 : 0,
    };
};

/** Everything the Foundry Data panel needs, from one call. */
export const analyseCasting = (points, geometry, heightIn, materialKey, options = {}) => {
    const netArea = calculateNetArea(points, geometry);
    const volume = netArea * Math.max(0, heightIn || 0);
    const surface = calculateSurfaceArea(points, geometry, heightIn);
    const modulus = solidificationModulus(volume, surface.total);
    const riser = sizeCylindricalRiser(modulus, options);
    const weights = calculatePourWeight(volume, riser.volume, materialKey);

    return { netArea, volume, surface, modulus, riser, ...weights };
};
