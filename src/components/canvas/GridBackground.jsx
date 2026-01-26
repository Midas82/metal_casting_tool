import React, { useState, useEffect, useRef } from 'react';

const GridBackground = ({ width, height, scale = 1, pan = { x: 0, y: 0 } }) => {
    // Grid settings
    const gridSize = 50; // 50px = 1 inch
    const gridColor = "#334155"; // slate-700
    const axisColor = "#64748b"; // slate-500

    // Calculate visible range based on pan and zoom
    // We want to draw infinite lines, but for SVG performance we just draw enough to cover the view
    // Center is (0,0) so we offset by half width/height

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    // Create pattern for efficient grid rendering instead of thousands of lines

    return (
        <g className="grid-layer" style={{ pointerEvents: 'none' }}>
            <defs>
                <pattern
                    id="gridPattern"
                    width={gridSize * scale}
                    height={gridSize * scale}
                    patternUnits="userSpaceOnUse"
                    x={centerX % (gridSize * scale)}
                    y={centerY % (gridSize * scale)}
                >
                    <path
                        d={`M ${gridSize * scale} 0 L 0 0 0 ${gridSize * scale}`}
                        fill="none"
                        stroke={gridColor}
                        strokeWidth={1}
                    />
                </pattern>
            </defs>

            {/* Infinite Grid Background */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#gridPattern)" />

            {/* Axes */}
            <line
                x1={0} y1={centerY}
                x2={width} y2={centerY}
                stroke={axisColor}
                strokeWidth={2}
            />
            <line
                x1={centerX} y1={0}
                x2={centerX} y2={height}
                stroke={axisColor}
                strokeWidth={2}
            />
        </g>
    );
};

export default GridBackground;
