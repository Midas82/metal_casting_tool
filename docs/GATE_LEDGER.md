# Gate Ledger — `metal_casting_tool`

Two states only. **VERIFIED** = the gate's central assertion actually executed
against these exact sources, with the evidence shown. **DEFERRED** = not
executed here; the exact reproduction command is given. Nothing in this table is
a green check for an unrun claim.

This file exists because of a specific failure. A print fix in this repository
was reported as done when its central assertion had never been run. It was later
found to be broken in two independent ways — the sheet was still clipped by its
ancestors, *and* an oversized pattern silently lost every page after the first.
Counting pages in a real PDF settled in seconds what inspection had got wrong.
The rule that follows: **a claim is DEFERRED until something executes it.**

Re-run the executable gates with `npm run verify` and `npm run verify:print`.

| Gate | Claim | State | Evidence / Reproduction |
|---|---|---|---|
| **G1** | Lint, tests and build all pass | **VERIFIED** | `npm run verify` → 9 test files, **106 tests passed**, eslint clean, `vite build` exit 0. Re-prove: `npm run verify`. |
| **G2** | CI actually executes the gates | **VERIFIED** | Run on `bc362d1`, `28d5889`, `52b41bd` → success. Step level on `bc362d1`: Lint ✅, Test ✅, Build ✅, `Upload artifact` **skipped**, `deploy` job **skipped** — so the checks ran and the branch/deploy split holds. Before this, the repository's entire Actions history was one run from the v2.0 push. Re-prove: push and read the run. |
| **G3** | Tiling math matches the sibling tool | **VERIFIED** | `src/logic/tiling.test.js` pins that tool's ground truth: 96″×144″ content, 8.5″×11″ pages, 1″ overlap → `cols=13`, `rows=15`, **195 tiles**, first `A1`, last `O13`. Re-prove: `npx vitest run src/logic/tiling.test.js`. |
| **G4** | Print output is 1:1 and paginates | **VERIFIED** | Real Chromium in print media, real PDFs: 4″×6″ block → 5″×7″ sheet → **1 page, 1 tile**; 12″ disk → 13″×13″ sheet → **4 pages, 4 tiles** (`A1`,`A2`,`B1`,`B2`). Geometry measured at exactly 96 px/in in both. No ancestor reports non-visible overflow. Re-prove: `npm run build && npm run preview -- --port 4173 &` then `node scripts/verify-print.mjs http://localhost:4173`. |
| **G5** | A printed sheet physically measures 1:1 | **DEFERRED** | No printer and no CUPS on this host. Reproduce: set a BLOCK to 4″×6″ with the shrink allowance off, Print at **100% scale** (not "fit to page"), measure the sheet with a rule. See `MANUAL_TEST_SCRIPT.md` §7. |
| **G6** | Drag behaviour survived extraction to `dragMath.js` | **VERIFIED** | Real browser drag: star outer handle moved `outerRadius` 6″ → 4 1/8″; block corner handle moved width 4″ → 5 7/8″ **and** length 6″ → 7 7/8″ together. No page errors. Unit side: 8 tests in `src/logic/dragMath.test.js`. |
| **G7** | Clamping is non-destructive | **VERIFIED** | Real browser slider sweep: start `{outer 6, inner 3.5, hole 2}` → outer to 0.5″ gives `{0.5, 0.25, 0}` (suppressed) → outer back to 6″ gives `{6, 3.5, 2}` — both restored. Unit side: 6 tests in `src/logic/constraints.test.js`. |
| **G8** | Corrupt storage cannot white-screen the app | **VERIFIED** | Wrote `{{{bad` into `midas_pattern_geometry` and `garbage` into `midas_vault`, reloaded: app started with sane defaults, sidebar rendered, no page errors, no error boundary shown. Reproduce: set those keys in devtools and reload. |
| **G9** | The GitHub Pages deployment serves correctly | **DEFERRED** | Egress to `midas82.github.io` is blocked from this host, so the live site was never fetched. The `base: './'` fix is reasoned, not observed: the repo is a project page, and an absolute `/` base emits `/assets/…` which 404s there. Reproduce: merge to `main`, wait for the deploy job, open the Pages URL and confirm assets load. |
| **G10** | Solidification maths: surface area, modulus, riser, yield | **VERIFIED** | 21 tests in `src/logic/solidification.test.js`. Key assertion is a round-trip: a riser sized to a target modulus is solved back through V/A and returns that modulus, across H/Ø of 0.5/1/1.5/2 and both base conventions. Worked case, 4″×6″×1″ aluminium: area 24 in², surface **68 in²**, M **0.353 in**, riser **Ø2 1/8″**, pour **3.08 lb**, yield **76%** — read back out of the running app, not just the unit tests. Re-prove: `npx vitest run src/logic/solidification.test.js`. |

## Notes on honesty

- G3 and G4 are the two that matter for the shop floor, and both are executable
  from a clean checkout with no printer — G4 keeps all scratch in a `mktemp`
  directory outside the repo and removes it on `SIGINT`/`SIGTERM`/`SIGHUP`, so
  the gate never pollutes the tree it grades.
- `scripts/verify-print.mjs` exits **2** when Playwright is unavailable, not 1,
  so "no browser" can never be read as a pass.
- G5 and G9 are the only claims that cannot be closed from here. They are listed
  as DEFERRED with reproduction steps rather than dressed up as done.
- Three tests in the suite were written to fail if a specific past bug returns:
  decimal parsing (`0.125` once parsed as 125 inches), the 1.92× grid scale
  error, and the destructive clamp. They are regression anchors, not coverage
  padding.
