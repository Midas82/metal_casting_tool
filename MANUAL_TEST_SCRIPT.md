# Manual Test Script — Midas Pattern Suite

Automated coverage lives in `npm run test` (unit layer, constraints, geometry,
1:1 render, view framing). This script covers what only a human at a real
printer can confirm.

## 1. Scale truth

**Goal:** the on-screen grid agrees with the geometry.

1. Launch the app and press **Fit**, then set zoom back to 1.00× (ctrl+wheel).
2. Set **Outer Radius** to `6"` on a STAR.
3. Count major grid squares from the centre marker to a star tip.
   - *Expect:* exactly **6** squares. One major square is one inch, always.
4. Check the scale legend at the bottom right — the labelled bar is 1".

## 2. Dimensional input

**Goal:** the fields accept real measurements and refuse nonsense.

Type each into **Pattern Diameter**, pressing Enter:

| Input | Expected result |
| --- | --- |
| `6.5` | `6 1/2"` — decimals are read as decimals |
| `0.125` | `1/8"` |
| `6 1/2` | `6 1/2"` |
| `2' 6"` | clamps to `1'` (12" max diameter) |
| `50"` | clamps to `1'`, field shows the **accepted** value |
| `banana` | red border, reverts to the previous value, never 0 |

## 3. Impossible shapes

**Goal:** geometry cannot invert.

1. On a STAR, drag the **Inner Radius** slider to its maximum.
   - *Expect:* it stops 1/4" below the outer radius.
2. Drag an **outer** (amber) handle on the canvas inward past the valleys.
   - *Expect:* the valleys are pushed down with it; the star never crisscrosses.
3. Drag an **inner** (blue) handle outward past the tips.
   - *Expect:* it stops. Dragging obeys the same rules as the sliders.

## 4. Handles on every shape

1. **STAR** — amber tip handles resize the outer radius, blue valley handles the inner.
2. **DISK** — four handles at N/E/S/W; *every one* resizes the disk.
3. **BLOCK** — four green corner handles; dragging changes width and length together.

None of these should be decorative — if a handle does nothing, that is a bug.

## 5. Centre hole

1. Set **Centre Hole Dia.** to `2"` on a STAR.
   - *Expect:* a clean empty circle. **No filled dot at its centre.**
2. Switch to DISK with a 6" outer radius.
   - *Expect:* the hole slider allows up to `11 1/2"`, not a value left over
     from the star's inner radius.

## 6. Shrink allowance

1. Note the **Casting Weight**, then toggle **Shrink allowance** on.
2. *Expect:* the badge names the actual rule, e.g. "Pattern enlarged ×1.01302
   — 5/32 in/ft (1.30%)", and states the allowance is in the export.
3. Change the material to **Steel**.
   - *Expect:* the factor changes (steel shrinks ~2×as much as cast iron).
4. Export an SVG with the allowance on and off and compare the `width="…in"`
   attribute — **they must differ.** The allowance has to be in the file.

## 7. Production output — 1:1

**Goal:** the printed pattern is physically correct. This is the one that
cannot be automated.

1. Set a BLOCK to exactly `4"` × `6"`, shrink allowance **off**.
2. Click **Print**, and in the print dialog set scale to **100%** (not "fit to page").
3. Print, then measure the sheet with a rule or tape.
   - *Expect:* **4" × 6", within printer tolerance.**
4. Repeat at a different on-screen zoom and pan.
   - *Expect:* identical printed size. Zoom must not reach the printed output.
5. Click **SVG**, open the file, confirm only a black outline — no grid, no
   handles, no background — and that it reports `4in`-scale dimensions.

## 8. Resilience

1. Save a project in the vault, reload — it should still be listed.
2. Load it — geometry, height, **material and shrink setting** all restore.
3. In devtools, corrupt storage:
   `localStorage.setItem('midas_pattern_geometry','{{{bad')` and reload.
   - *Expect:* the app still starts with sane defaults. No blank screen.

## 9. Touch

On a tablet: drag to pan, and drag a handle to resize.
- *Expect:* both work. The tool is meant for the shop floor, not just a desk.
