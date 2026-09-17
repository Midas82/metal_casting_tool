/**
 * Sheet tiling for oversized patterns.
 *
 * The tool prints at true 96 px/in and its largest pattern (12") does not
 * fit one Letter page, so a big pattern has to be split into overlapping
 * tiles the operator prints, trims and tapes together. The stepping and
 * A1/B2-style labelling here are ported from the sibling Flutter tool's
 * production tiling algorithm - keep them identical so a pattern tiled by
 * either app lines up the same way on paper.
 */

/** US Letter, portrait, in inches. */
export const LETTER = { width: 8.5, height: 11 };

/** ISO A4, portrait, in inches. */
export const A4 = { width: 8.27, height: 11.69 };

/** Most printers cannot mark right to the edge of the sheet. */
export const DEFAULT_PAGE_MARGIN_IN = 0.25;

/** Width of the glue tab shared by two adjacent sheets. */
export const DEFAULT_OVERLAP_IN = 0.5;

/**
 * Lays out a content rectangle as a grid of tiles sized to one page each.
 * Adjacent tiles overlap by `overlap` so the operator has a strip to align
 * and tape, rather than butting raw cut edges together.
 *
 * @returns {{
 *   cols: number, rows: number, count: number,
 *   tiles: Array<{ row: number, col: number, label: string,
 *                  xIn: number, yIn: number, widthIn: number, heightIn: number }>,
 *   pageWidthIn: number, pageHeightIn: number,
 *   stepXIn: number, stepYIn: number, overlapIn: number
 * }}
 */
export const planTiles = (contentWidthIn, contentHeightIn, options = {}) => {
    const {
        page = LETTER,
        margin = DEFAULT_PAGE_MARGIN_IN,
        overlap = DEFAULT_OVERLAP_IN,
        landscape = false,
    } = options;

    const pageWidthIn = landscape ? page.height : page.width;
    const pageHeightIn = landscape ? page.width : page.height;

    const usableWidthIn = pageWidthIn - 2 * margin;
    const usableHeightIn = pageHeightIn - 2 * margin;

    // stepX/stepY are what each new tile advances by. An overlap at or past
    // the usable page size drives a step to zero or negative, which would
    // never advance the grid and loop forever - refuse instead of hanging.
    if (overlap >= usableWidthIn || overlap >= usableHeightIn) {
        throw new RangeError(
            `overlap (${overlap}in) must be smaller than the usable page size ` +
            `(${usableWidthIn}in x ${usableHeightIn}in)`
        );
    }

    const stepXIn = usableWidthIn - overlap;
    const stepYIn = usableHeightIn - overlap;

    // A zero, negative or non-finite content size still has to resolve to
    // "nothing to tile" rather than NaN propagating through Math.ceil.
    const safeWidthIn = Number.isFinite(contentWidthIn) ? Math.max(0, contentWidthIn) : 0;
    const safeHeightIn = Number.isFinite(contentHeightIn) ? Math.max(0, contentHeightIn) : 0;

    const cols = safeWidthIn === 0 ? 0 : Math.ceil(safeWidthIn / stepXIn);
    const rows = safeHeightIn === 0 ? 0 : Math.ceil(safeHeightIn / stepYIn);

    const tiles = [];
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            tiles.push({
                row,
                col,
                // A1, A2, ... B1, B2, ... - rows letter, columns number.
                label: String.fromCharCode(65 + row) + (col + 1),
                xIn: col * stepXIn,
                yIn: row * stepYIn,
                widthIn: usableWidthIn,
                heightIn: usableHeightIn,
            });
        }
    }

    return {
        cols,
        rows,
        count: tiles.length,
        tiles,
        pageWidthIn,
        pageHeightIn,
        stepXIn,
        stepYIn,
        overlapIn: overlap,
    };
};
