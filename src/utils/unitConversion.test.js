import { describe, it, expect } from 'vitest';
import {
    parseImperial,
    formatImperial,
    inchesToPixels,
    pixelsToInches,
    snapToFraction,
    PIXELS_PER_INCH,
} from './unitConversion';

describe('parseImperial', () => {
    it('reads decimal inches (regression: decimals used to be summed digit-group-wise)', () => {
        expect(parseImperial('6.5')).toBe(6.5);
        expect(parseImperial('0.125')).toBe(0.125);
        expect(parseImperial('3.25')).toBe(3.25);
        expect(parseImperial('.5')).toBe(0.5);
    });

    it('reads whole inches, fractions and mixed numbers', () => {
        expect(parseImperial('12')).toBe(12);
        expect(parseImperial('1/4')).toBe(0.25);
        expect(parseImperial('6 1/2')).toBe(6.5);
    });

    it('reads feet and feet-inch combinations', () => {
        expect(parseImperial("2'")).toBe(24);
        expect(parseImperial('2\' 6"')).toBe(30);
        expect(parseImperial('2\' 6 3/4"')).toBe(30.75);
    });

    it('accepts spelled-out units', () => {
        expect(parseImperial('6 in')).toBe(6);
        expect(parseImperial('2 ft')).toBe(24);
        expect(parseImperial('3 inches')).toBe(3);
    });

    it('handles negatives', () => {
        expect(parseImperial('-2')).toBe(-2);
        expect(parseImperial('-1/2')).toBe(-0.5);
    });

    it('rejects junk rather than silently returning 0', () => {
        expect(parseImperial('abc')).toBeNull();
        expect(parseImperial('')).toBeNull();
        expect(parseImperial('   ')).toBeNull();
        expect(parseImperial('6 x 4')).toBeNull();
        expect(parseImperial('1/0')).toBeNull();
        expect(parseImperial(null)).toBeNull();
        expect(parseImperial(NaN)).toBeNull();
    });

    it('passes finite numbers straight through', () => {
        expect(parseImperial(4.25)).toBe(4.25);
    });
});

describe('formatImperial', () => {
    it('formats whole, fractional and feet values', () => {
        expect(formatImperial(0)).toBe('0"');
        expect(formatImperial(6)).toBe('6"');
        expect(formatImperial(6.5)).toBe('6 1/2"');
        expect(formatImperial(0.5)).toBe('1/2"');
        expect(formatImperial(12)).toBe("1'");
        expect(formatImperial(30.75)).toBe('2\' 6 3/4"');
    });

    it('rounds once, without overshooting into a spurious 1/64', () => {
        // Regression: the old recursive carry produced 6 1/64" here.
        expect(formatImperial(5.9999)).toBe('6"');
        expect(formatImperial(11.9999)).toBe("1'");
    });

    it('reduces fractions to lowest terms', () => {
        expect(formatImperial(0.25)).toBe('1/4"');
        expect(formatImperial(0.125)).toBe('1/8"');
        expect(formatImperial(1 / 64)).toBe('1/64"');
    });

    it('keeps the sign', () => {
        expect(formatImperial(-6.5)).toBe('-6 1/2"');
    });

    it('survives non-finite input', () => {
        expect(formatImperial(NaN)).toBe('0"');
        expect(formatImperial(Infinity)).toBe('0"');
    });
});

describe('parse/format round trip', () => {
    it('is stable for any value already on a 1/64 boundary', () => {
        for (let ticks = 0; ticks <= 64 * 40; ticks += 7) {
            const inches = ticks / 64;
            const text = formatImperial(inches);
            expect(parseImperial(text)).toBeCloseTo(inches, 10);
        }
    });

    it('is idempotent: format(parse(format(x))) === format(x)', () => {
        for (const x of [0, 0.3333, 1 / 3, 5.9999, 12.0001, 30.75, 0.0078, 23.98]) {
            const once = formatImperial(x);
            expect(formatImperial(parseImperial(once))).toBe(once);
        }
    });
});

describe('pixel conversion', () => {
    it('round trips through the single canonical scale', () => {
        expect(inchesToPixels(1)).toBe(PIXELS_PER_INCH);
        expect(pixelsToInches(inchesToPixels(3.5))).toBeCloseTo(3.5);
    });
});

describe('snapToFraction', () => {
    it('snaps to the nearest 1/64', () => {
        expect(snapToFraction(0.3333)).toBeCloseTo(21 / 64);
        expect(snapToFraction(1.00001)).toBe(1);
    });
});
