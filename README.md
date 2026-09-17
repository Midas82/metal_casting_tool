# Midas Digital — Pattern Suite

A browser tool for laying out foundry casting patterns in imperial units, with
live volume/weight figures and 1:1 output for the shop floor.

Stack: React 19 + Vite + Tailwind, deployed to GitHub Pages.

## Running it

```bash
npm install
npm run dev       # dev server
npm run verify    # lint + tests + build (what CI runs)
```

| script | what it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | production build into `dist/` |
| `npm run lint` | ESLint over the whole tree |
| `npm run test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run verify` | lint + test + build |
| `npm run verify:print` | print gate — drives a real browser, asserts 1:1 and pagination |

## The unit rule

This is a dimensional tool, so there is exactly one rule and everything obeys it:

> **All geometry state is stored in decimal inches. Inches become pixels in
> exactly one place — `inchesToPixels()` in `src/utils/unitConversion.js`,
> backed by `PIXELS_PER_INCH = 96`. Nothing else may invent a scale factor.**

The measurement grid derives its square size from that same constant, so one
major grid square is always one inch. (It previously hard-coded 50 px/in while
geometry rendered at 96 px/in, which made every square on screen wrong by 1.92×.)

## How constraints work

Every geometry mutation — slider, typed field, dragged handle, loaded vault
project — funnels through `sanitizeGeometry()` in `src/logic/constraints.js`.
If a limit is not expressed there, it does not exist. The function is
idempotent and repairs missing or garbage fields rather than propagating `NaN`.

Current limits live in `LIMITS`: 1/2"–12" diameter, 1/16"–3' height,
1/2"–12" block sides, 3–48 star points, a 1/4" minimum web between a star's
tip and valley, and a 1/4" minimum wall around a centre hole.

## Shrink allowance

Dimensions you enter describe the **finished casting**. With the shrink
allowance on, the **pattern** is enlarged by the alloy's patternmaker's shrink
rule so the casting cools to the size you asked for:

| Alloy | Shrink rule | Linear factor |
| --- | --- | --- |
| Cast Iron | 1/8 in/ft | 1.0104 |
| Zinc / Aluminum | 5/32 in/ft | 1.0130 |
| Brass | 3/16 in/ft | 1.0156 |
| Steel | 1/4 in/ft | 1.0208 |

The allowance is applied in `buildPatternRender()`, which both the SVG export
and the print sheet consume — so what you see, what you print, and what you
cut cannot drift apart. Volume and weight in the Foundry Data panel describe
the finished casting at nominal size; the pattern volume is reported separately.

## Output

Both the SVG export and printing are **true 1:1**. The SVG is sized in real
inches (`width="5.0000in"`); printing uses a dedicated hidden sheet rather than
the live canvas, so zoom and pan cannot scale the result. Print at 100% — never
"fit to page".

### Tiled printing

A browser will not split an SVG across pages, and the tool's largest pattern
(12") needs a 13" sheet, which cannot fit Letter. An oversized pattern is
therefore emitted as one page-sized SVG **per tile**, each breaking to its own
page, with a 0.5" glue tab shared by neighbours:

| Pattern | Sheet | Pages |
| --- | --- | --- |
| 4"×6" block | 5"×7" | 1 — no assembly |
| 12" disk | 13"×13" | 4 (`A1`,`A2`,`B1`,`B2`) |

Each tile carries corner registration crosses, dashed lines showing where the
neighbouring sheet overlaps, and a label (`A1 · sheet 1/4 · 2x2 grid · 1:1`).
Trim to the dashed line, align on the crosses, tape.

The grid maths lives in `src/logic/tiling.js` and is ported from a sibling
tool's production algorithm; its tests pin that tool's ground truth
(96"×144" @ 1" overlap → 13×15 = 195 tiles, `A1`..`O13`) so the two stay
interchangeable.

### Verifying print output

`npm run verify:print` builds nothing — serve the app first, then point it at
the server:

```bash
npm run build && npm run preview -- --port 4173 &
node scripts/verify-print.mjs http://localhost:4173
```

It drives a real browser in print media, generates PDFs, and asserts page
counts and that no ancestor clips the sheet. It exits 2 (not 1) when Playwright
is unavailable, so a missing browser can never be mistaken for a pass.

## Project layout

```
src/
  logic/          geometry, constraints, 1:1 render, view framing, tiling (pure, tested)
  utils/          units, casting maths, storage, export            (pure, tested)
  hooks/          usePatternGeometry — derives canvas data
  components/     canvas/ (workspace, renderer, grid, print sheet)
                  controls/ (sidebar panels)
  layout/         Sidebar
```

`src/logic` and `src/utils` hold no React and carry the test suite. Anything
dimensional belongs there, not in a component.

## Deployment

CI runs lint, tests and build on **every branch push** and pull request, so a
feature branch is verified before it ever reaches review. Deployment to GitHub
Pages happens only on a push to `main`.

The Vite `base` is `'./'` (relative), so the build works from a user page, a
project page or a custom domain without reconfiguration.

## Verification ledger

Every claim about this tool is graded in [`docs/GATE_LEDGER.md`](docs/GATE_LEDGER.md)
as either **VERIFIED** (executed, with the evidence shown) or **DEFERRED** (not
run here, with the exact reproduction command). There is no third state, and
nothing is a green check for an unrun claim.

## Known limitations

- **Taper Preview is a flat 10% visual inset, not a calculated draft angle.**
  Real draft (`inset = height × tan θ`) is not implemented.
- Volume assumes vertical walls, so it does not account for draft taper.
- One centre hole per pattern; no bolt circles.
- Tile labels use a single letter per row, so a pattern needing more than 26
  rows of sheets would repeat labels. Unreachable at the current 12" maximum.
- No DXF export, fillets, core prints, machining allowance, or gating/riser
  calculations.
