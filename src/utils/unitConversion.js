/**
 * Imperial measurement layer.
 *
 * CANONICAL RULE: all geometry state is stored in DECIMAL INCHES.
 * Pixels exist only at render time, and PIXELS_PER_INCH below is the ONLY
 * place inches become pixels. Nothing else may invent a scale factor.
 */

/** The single source of truth for screen scale. */
export const PIXELS_PER_INCH = 96;

/** Smallest fraction a foundry pattern is dimensioned to. */
export const FRACTION_DENOMINATOR = 64;

/** Matches 6, 6.5 or .5 */
const NUM = String.raw`(?:\d+(?:\.\d+)?|\.\d+)`;

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/**
 * Parses an imperial string into decimal inches.
 *
 * Accepts: 6 | 6.5 | .5 | 1/4 | 6 1/2 | 2' | 2' 6" | 2' 6 3/4" | 6 in | 2 ft
 * A bare number is read as inches.
 *
 * @returns {number|null} decimal inches, or null if the input is not a
 *   measurement. Callers MUST treat null as "reject and keep the old value" —
 *   silently coercing junk to 0 is how a bad dimension reaches the shop floor.
 */
export const parseImperial = (input) => {
    if (typeof input === 'number') return Number.isFinite(input) ? input : null;
    if (typeof input !== 'string') return null;

    let s = input.trim().toLowerCase();
    if (!s) return null;

    let sign = 1;
    if (s.startsWith('-')) {
        sign = -1;
        s = s.slice(1).trim();
    }

    // Normalise spelled-out units to their marks (longest alternatives first).
    s = s.replace(/feet|foot|ft\.?/g, "'").replace(/inches|inch|in\.?/g, '"');

    let total = 0;
    let matched = false;

    // Feet component, e.g. 2'
    const feet = s.match(new RegExp(`(${NUM})\\s*'`));
    if (feet) {
        total += parseFloat(feet[1]) * 12;
        matched = true;
        s = s.replace(feet[0], ' ');
    }

    // Whatever is left is the inches component.
    const rest = s.replace(/"/g, ' ').trim();
    if (rest) {
        const mixed = rest.match(new RegExp(`^(${NUM})\\s+(\\d+)\\s*/\\s*(\\d+)$`));
        const fraction = rest.match(/^(\d+)\s*\/\s*(\d+)$/);
        const plain = rest.match(new RegExp(`^(${NUM})$`));

        if (mixed) {
            const den = parseInt(mixed[3], 10);
            if (den === 0) return null;
            total += parseFloat(mixed[1]) + parseInt(mixed[2], 10) / den;
            matched = true;
        } else if (fraction) {
            const den = parseInt(fraction[2], 10);
            if (den === 0) return null;
            total += parseInt(fraction[1], 10) / den;
            matched = true;
        } else if (plain) {
            total += parseFloat(plain[1]);
            matched = true;
        } else {
            // Unrecognised trailing text - reject rather than guess.
            return null;
        }
    }

    return matched ? sign * total : null;
};

/**
 * Formats decimal inches as a foundry-readable string, e.g. 2' 6 1/4".
 * Rounds ONCE to the nearest 1/64 so the result is stable under re-formatting.
 */
export const formatImperial = (decimalInches, denominator = FRACTION_DENOMINATOR) => {
    if (!Number.isFinite(decimalInches)) return '0"';

    const sign = decimalInches < 0 ? '-' : '';
    const ticks = Math.round(Math.abs(decimalInches) * denominator);
    if (ticks === 0) return '0"';

    const totalInches = Math.floor(ticks / denominator);
    const feet = Math.floor(totalInches / 12);
    const wholeInches = totalInches % 12;

    let num = ticks % denominator;
    let den = denominator;
    if (num > 0) {
        const common = gcd(num, den);
        num /= common;
        den /= common;
    }

    const parts = [];
    if (feet > 0) parts.push(`${feet}'`);

    if (wholeInches > 0 || num > 0 || feet === 0) {
        let inchStr = '';
        if (wholeInches > 0 || num === 0) inchStr += `${wholeInches}`;
        if (num > 0) inchStr += `${inchStr ? ' ' : ''}${num}/${den}`;
        parts.push(`${inchStr}"`);
    }

    return sign + parts.join(' ');
};

/** Inches -> screen pixels. The only conversion in the codebase. */
export const inchesToPixels = (inches) => inches * PIXELS_PER_INCH;

/** Screen pixels -> inches. */
export const pixelsToInches = (pixels) => pixels / PIXELS_PER_INCH;

/** Clamps a value into [min, max], rejecting non-numbers via fallback. */
export const clamp = (value, min, max, fallback = min) => {
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
};

/** Rounds to the nearest 1/64" so stored geometry stays on a real fraction. */
export const snapToFraction = (inches, denominator = FRACTION_DENOMINATOR) =>
    Math.round(inches * denominator) / denominator;
