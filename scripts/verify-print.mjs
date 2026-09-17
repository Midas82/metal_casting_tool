#!/usr/bin/env node
/**
 * Print gate — proves, by execution, that printed output is 1:1 and paginates.
 *
 * This exists because a previous "print fix" in this repo was reported as done
 * when its central assertion had never been run: the sheet was still clipped by
 * its ancestors, and an oversized pattern silently lost everything past page
 * one. Counting pages in a real PDF is the only thing that settles it.
 *
 * Usage:
 *   npm run build && npm run preview -- --port 4173   # in one shell
 *   node scripts/verify-print.mjs http://localhost:4173
 *
 * Requires Playwright's chromium to be resolvable. If it is not, this exits 2
 * (DEFERRED) rather than 1, so a missing browser is never mistaken for a pass.
 */
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:4173';

// Every artefact lives outside the repo and is removed on any exit, so the
// gate never pollutes the tree it is grading.
const WORK = await mkdtemp(join(tmpdir(), 'printgate-'));
const cleanup = async () => { await rm(WORK, { recursive: true, force: true }); };
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, async () => { await cleanup(); process.exit(130); });
}

let chromium;
try {
    ({ chromium } = await import('playwright'));
} catch {
    try {
        ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs'));
    } catch {
        console.error('DEFERRED: playwright is not resolvable; cannot run the print gate.');
        console.error('Reproduce: npm i -D playwright && npx playwright install chromium');
        await cleanup();
        process.exit(2);
    }
}

/** Counts page objects in a PDF without needing poppler. */
const pdfPageCount = (file) =>
    (readFileSync(file, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

const CASES = [
    { shape: 'BLOCK', pages: 1, why: '4x6 block -> 5x7in sheet, fits one Letter page' },
    { shape: 'DISK', pages: 4, why: '12in disk -> 13x13in sheet, tiles 2x2' },
];

const browser = await chromium.launch();
let failures = 0;

try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => { try { localStorage.clear(); } catch { /* private mode */ } });
    await page.reload({ waitUntil: 'networkidle' });

    for (const { shape, pages: expected, why } of CASES) {
        await page.emulateMedia({ media: 'screen' });
        await page.getByRole('button', { name: shape, exact: true }).click();
        await page.waitForTimeout(400);

        const tiles = await page.locator('.print-tile').count();

        await page.emulateMedia({ media: 'print' });
        await page.waitForTimeout(250);

        // Ancestors must not constrain the sheet, or tall output is cropped.
        const clipping = await page.evaluate(() => {
            const bad = [];
            let el = document.querySelector('.print-sheet')?.parentElement;
            while (el && el !== document.documentElement) {
                const cs = getComputedStyle(el);
                if (cs.overflow !== 'visible') bad.push(`${el.className || el.tagName}:${cs.overflow}`);
                el = el.parentElement;
            }
            return bad;
        });

        const pdf = join(WORK, `${shape}.pdf`);
        await page.pdf({ path: pdf, format: 'Letter' });
        const actual = pdfPageCount(pdf);

        const ok = actual === expected && tiles === expected && clipping.length === 0;
        if (!ok) failures += 1;
        console.log(`${ok ? 'PASS' : 'FAIL'}  ${shape.padEnd(6)} pages=${actual} (expected ${expected}), ` +
            `tiles=${tiles}${clipping.length ? `, CLIPPING ANCESTORS: ${clipping.join(', ')}` : ''}`);
        console.log(`      ${why}`);
    }
} finally {
    await browser.close();
    await cleanup();
}

if (failures > 0) {
    console.error(`\nVERIFIED: no. ${failures} print case(s) failed.`);
    process.exit(1);
}
console.log('\nVERIFIED: print output is 1:1 and paginates correctly.');
