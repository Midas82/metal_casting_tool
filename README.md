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

## Project layout

```
src/
  logic/          geometry, constraints, 1:1 render, view framing  (pure, tested)
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

## Known limitations

- **Taper Preview is a flat 10% visual inset, not a calculated draft angle.**
  Real draft (`inset = height × tan θ`) is not implemented.
- Volume assumes vertical walls, so it does not account for draft taper.
- One centre hole per pattern; no bolt circles.
- No DXF export, fillets, core prints, machining allowance, or gating/riser
  calculations.
