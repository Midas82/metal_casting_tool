# Manual Test Script: Zinc Casting Pattern Tool

## 1. Safety Check: "The Impossible Shape"

**Goal:** Verify that the "Inner Radius" can never exceed or equal the "Outer Radius".

1. **Launch the App.**
2. **Set Outer Radius** to roughly `100px`.
3. **Drag Inner Radius Slider** to the right, attempting to pass `100px`.
    * *Expected Behavior:* The Inner Radius slider should stop or "stick" roughly 5px before the Outer Radius value.
4. **Drag Outer Radius Slider** to the left, attempting to go below the current Inner Radius.
    * *Expected Behavior:* As you drag Outer Radius down, it should "push" the Inner Radius down with it, maintaining a small gap.
5. **Result:** The star shape should never invert or crisscross.

## 2. Casting Scenario: "The 1-Inch Coin"

**Goal:** Create a pattern that fits within a 1-inch diameter (approx. size of a quarter/coin).

1. **Set Units:** Recall that `50px = 1 inch` in our engine.
2. **Target Size:** 1 inch diameter = `0.5 inch` radius = `25px` radius.
3. **Adjust Sliders:**
    * Set **Outer Radius** to `25 px`.
    * Set **Inner Radius** to `15 px`.
    * Set **Points** to `6`.
4. **Check Stats:**
    * Look at the "Foundry Info" card.
    * *Verify:* Volume should be very small (approx 0.05 - 0.1 in³).
5. **Visual Check:** The shape should look like a small, valid gear/star in the center of the grid.

## 3. Production Verify: "The Export"

**Goal:** Ensure the digital file matches the screen for manufacturing.

1. **Design a Shape:** Create a distinct shape (e.g., 5 points, thin spikes).
2. **Click '💾 SVG'** in the sidebar.
3. **Locate File:** Find `casting-pattern.svg` in your Downloads folder.
4. **Browser Verification:** Drag and drop `casting-pattern.svg` into a New Tab in Chrome/Firefox.
    * *Expected:* You see **only** the black outline of the shape.
    * *Check:* No grid lines. No background color. No yellow/blue drag handles.
5. **Visual Match:** Ensure the points and proportions match exactly what you designed.

---
**Test Run Logic:**
If all 3 scenarios pass, the tool is strictly validated for:

1. Geometry Errors (Impossible shapes)
2. Micro-Casting Capability (Jewelry/Coins)
3. CAM/Print Readiness (Clean Exports)
