import React from 'react';
import { buildPatternRender } from '../../logic/patternRender';
import { planTiles } from '../../logic/tiling';
import { inchesToPixels } from '../../utils/unitConversion';

/**
 * Print-only rendering of the pattern at true 1:1.
 *
 * Two separate problems have to be solved for a printed pattern to be usable:
 *
 * 1. Scale. Printing used to hand the browser the live canvas, so output
 *    scaled with whatever zoom and pan were set. This sheet is sized in real
 *    inches and ignores the view transform entirely.
 *
 * 2. Size. An SVG is an atomic replaced element - a browser will not split one
 *    across pages. A 12" pattern needs a 13" sheet, which cannot fit Letter, so
 *    a single oversized SVG silently loses everything past the first page.
 *    Measured: a 13"x13" sheet printed to Letter yields exactly one page.
 *    The sheet is therefore emitted as one page-sized SVG per tile, each
 *    breaking to a new page, with overlapping glue tabs to tape together.
 *
 * Hidden on screen via .print-sheet in index.css.
 */

/** Corner alignment marks, drawn in the pattern's own pixel space. */
const RegistrationMarks = ({ x, y, width, height }) => {
    const arm = inchesToPixels(0.18);
    const inset = inchesToPixels(0.1);
    const corners = [
        [x + inset, y + inset],
        [x + width - inset, y + inset],
        [x + inset, y + height - inset],
        [x + width - inset, y + height - inset],
    ];

    return (
        <g className="print-marks" stroke="#000" strokeWidth="0.75" fill="none">
            {corners.map(([cx, cy], i) => (
                <g key={i}>
                    <line x1={cx - arm} y1={cy} x2={cx + arm} y2={cy} />
                    <line x1={cx} y1={cy - arm} x2={cx} y2={cy + arm} />
                </g>
            ))}
        </g>
    );
};

const PrintSheet = ({ points, geometry, shrinkFactor = 1 }) => {
    const render = buildPatternRender(points, geometry, { shrinkFactor });
    const plan = planTiles(render.widthIn, render.heightIn);

    // The full-pattern viewBox origin, which every tile is an offset into.
    const [originX, originY] = render.viewBox.split(' ').map(Number);

    const patternPath = (
        <path d={render.pathData} fill="none" fillRule="evenodd" stroke="black" strokeWidth="1" />
    );

    // Fits one page: emit it whole so a small pattern needs no assembly.
    if (plan.count <= 1) {
        return (
            <div className="print-sheet" aria-hidden="true">
                <div className="print-tile">
                    <svg
                        viewBox={render.viewBox}
                        width={`${render.widthIn.toFixed(4)}in`}
                        height={`${render.heightIn.toFixed(4)}in`}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {patternPath}
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="print-sheet" aria-hidden="true">
            {plan.tiles.map((tile) => {
                const vbX = originX + inchesToPixels(tile.xIn);
                const vbY = originY + inchesToPixels(tile.yIn);
                const vbW = inchesToPixels(tile.widthIn);
                const vbH = inchesToPixels(tile.heightIn);

                // Only edges with a neighbour carry a glue tab worth marking.
                const hasRight = tile.col < plan.cols - 1;
                const hasBelow = tile.row < plan.rows - 1;
                const tabX = vbX + vbW - inchesToPixels(plan.overlapIn);
                const tabY = vbY + vbH - inchesToPixels(plan.overlapIn);

                return (
                    <div className="print-tile" key={tile.label}>
                        <svg
                            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                            width={`${tile.widthIn.toFixed(4)}in`}
                            height={`${tile.heightIn.toFixed(4)}in`}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {patternPath}
                            <RegistrationMarks x={vbX} y={vbY} width={vbW} height={vbH} />

                            {/* Dashed line = where the neighbouring sheet overlaps. */}
                            {hasRight && (
                                <line
                                    className="print-marks"
                                    x1={tabX} y1={vbY} x2={tabX} y2={vbY + vbH}
                                    stroke="#000" strokeWidth="0.5" strokeDasharray="4 4"
                                />
                            )}
                            {hasBelow && (
                                <line
                                    className="print-marks"
                                    x1={vbX} y1={tabY} x2={vbX + vbW} y2={tabY}
                                    stroke="#000" strokeWidth="0.5" strokeDasharray="4 4"
                                />
                            )}

                            <text
                                className="print-marks"
                                x={vbX + inchesToPixels(0.35)}
                                y={vbY + inchesToPixels(0.45)}
                                fontFamily="monospace"
                                fontSize={inchesToPixels(0.16)}
                                fill="#000"
                            >
                                {tile.label} · sheet {plan.tiles.indexOf(tile) + 1}/{plan.count}
                                {' · '}{plan.cols}x{plan.rows} grid · 1:1
                            </text>
                        </svg>
                    </div>
                );
            })}
        </div>
    );
};

export default PrintSheet;
