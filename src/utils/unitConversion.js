/**
 * Utility for handling Imperial measurements (Feet, Inches, Fractions)
 * and converting them to decimal inches or rendering pixels.
 */

const PPI = 96; // Standard web PPI for more accurate DPI translation if needed
// However, for industrial tools, the user cares about relative scale.
// We'll use 96 as a baseline for "Screen Pixels per Inch".

/**
 * Parses a string input into decimal inches.
 * Supports patterns like: 2', 6", 2' 6", 1/4, 6 1/2, 2' 6 3/4"
 */
export const parseImperial = (input) => {
    if (typeof input === 'number') return input;
    if (!input || typeof input !== 'string') return 0;

    let totalInches = 0;

    // 1. Extract feet (e.g., 2')
    const feetMatch = input.match(/(\d+)'/);
    if (feetMatch) {
        totalInches += parseInt(feetMatch[1]) * 12;
    }

    // 2. Extract remaining parts (inches and fractions)
    // Remove feet part for easier parsing
    const inchesPart = input.replace(/(\d+)'/, '').trim();

    // Handle fractions like "1/2" or "6 1/2"
    // This regex looks for: 
    // - [Whole Number]?[space]?([Numerator]/[Denominator])
    // - OR just a whole number
    const regex = /(\d+)?\s?(\d+)\/(\d+)|(\d+)/g;
    let match;
    let hasFoundInches = false;

    while ((match = regex.exec(inchesPart)) !== null) {
        if (match[2] && match[3]) { // Fraction part
            const whole = match[1] ? parseInt(match[1]) : 0;
            const fraction = parseInt(match[2]) / parseInt(match[3]);
            totalInches += (whole + fraction);
            hasFoundInches = true;
        } else if (match[4]) { // Whole number part (if not part of a fraction)
            // Check if it's followed by a fraction (to avoid double counting)
            const lookahead = inchesPart.slice(match.index + match[4].length).trim();
            if (!lookahead.startsWith('/')) {
                totalInches += parseInt(match[4]);
                hasFoundInches = true;
            }
        }
    }

    return totalInches;
};

/**
 * Formats decimal inches into a readable string (e.g., 2' 6 1/4")
 * Precision is limited to 1/64th for practical foundry use.
 */
export const formatImperial = (decimalInches) => {
    if (decimalInches === 0) return '0"';

    const feet = Math.floor(decimalInches / 12);
    const inches = decimalInches % 12;
    const wholeInches = Math.floor(inches);
    const remainder = inches - wholeInches;

    // Calculate nearest 64th
    const sixtyFourths = Math.round(remainder * 64);

    let fractionStr = '';
    if (sixtyFourths > 0) {
        // Simplify the fraction (e.g., 32/64 -> 1/2)
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const common = gcd(sixtyFourths, 64);
        const num = sixtyFourths / common;
        const den = 64 / common;

        // If rounded to 64/64, adjust inches
        if (num === den) {
            return formatImperial(decimalInches + (1 / 64)); // Recursive fix for rounding up
        }

        fractionStr = `${num}/${den}`;
    }

    let result = '';
    if (feet > 0) result += `${feet}' `;
    if (wholeInches > 0 || fractionStr) {
        result += `${wholeInches}`;
        if (fractionStr) result += ` ${fractionStr}`;
        result += '"';
    }

    return result.trim() || '0"';
};

/**
 * Converts inches to pixels for rendering
 */
export const inchesToPixels = (inches) => inches * PPI;

/**
 * Converts pixels to inches for calculation
 */
export const pixelsToInches = (pixels) => pixels / PPI;

/**
 * Enforces industrial constraints
 */
export const validateConstraints = (type, value, context = {}) => {
    switch (type) {
        case 'DIAMETER':
            return Math.min(12, Math.max(0.5, value)); // 0.5" to 12"
        case 'HEIGHT':
            return Math.min(36, Math.max(0.125, value)); // 1/8" to 3'
        case 'HOLE':
            const maxHole = (context.outerDiameter || 1) - 0.25; // 1/4" margin
            return Math.min(maxHole, Math.max(0, value));
        default:
            return value;
    }
};
