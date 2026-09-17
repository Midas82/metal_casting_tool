import React from 'react';
import { PIXELS_PER_INCH } from '../../utils/unitConversion';

/**
 * Measurement grid.
 *
 * The square size is DERIVED from PIXELS_PER_INCH rather than hard-coded.
 * It previously declared "50px = 1 inch" while geometry rendered at 96 px/in,
 * so every square the user counted was wrong by a factor of 1.92.
 */
const GridBackground = ({ width, height, scale = 1, pan = { x: 0, y: 0 } }) => {
    const minorColor = '#1e293b'; // slate-800 - quarter inch
    const majorColor = '#334155'; // slate-700 - one inch
    const axisColor = '#64748b';  // slate-500

    const inch = PIXELS_PER_INCH * scale;
    const quarter = inch / 4;

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    // Offsets keep the grid locked to the origin under pan and zoom.
    const offsetX = ((centerX % inch) + inch) % inch;
    const offsetY = ((centerY % inch) + inch) % inch;

    // Below ~24px per inch the quarter-inch lines turn into mush.
    const showQuarters = quarter >= 6;

    return (
        <g className="grid-layer" style={{ pointerEvents: 'none' }}>
            <defs>
                <pattern id="gridQuarterInch" width={quarter} height={quarter} patternUnits="userSpaceOnUse" x={offsetX} y={offsetY}>
                    <path d={`M ${quarter} 0 L 0 0 0 ${quarter}`} fill="none" stroke={minorColor} strokeWidth={1} />
                </pattern>
                <pattern id="gridOneInch" width={inch} height={inch} patternUnits="userSpaceOnUse" x={offsetX} y={offsetY}>
                    {showQuarters && <rect width={inch} height={inch} fill="url(#gridQuarterInch)" />}
                    <path d={`M ${inch} 0 L 0 0 0 ${inch}`} fill="none" stroke={majorColor} strokeWidth={1.25} />
                </pattern>
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill="url(#gridOneInch)" />

            <line x1={0} y1={centerY} x2={width} y2={centerY} stroke={axisColor} strokeWidth={1.5} />
            <line x1={centerX} y1={0} x2={centerX} y2={height} stroke={axisColor} strokeWidth={1.5} />

            {/* Scale legend: one labelled inch, so the grid is self-documenting. */}
            <g transform={`translate(${width - 130}, ${height - 34})`}>
                <line x1={0} y1={0} x2={inch} y2={0} stroke="#94a3b8" strokeWidth={2} />
                <line x1={0} y1={-4} x2={0} y2={4} stroke="#94a3b8" strokeWidth={2} />
                <line x1={inch} y1={-4} x2={inch} y2={4} stroke="#94a3b8" strokeWidth={2} />
                <text x={inch / 2} y={16} fill="#94a3b8" fontFamily="monospace" fontSize="11" textAnchor="middle">
                    1&quot;
                </text>
            </g>
        </g>
    );
};

export default GridBackground;
