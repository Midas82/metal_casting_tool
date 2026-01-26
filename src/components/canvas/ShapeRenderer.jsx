import React from 'react';
import DragHandle from './DragHandle';

const ShapeRenderer = ({ points, path, holeDiameter = 0, onHandleMouseDown, showDraft }) => {
    if (!points || points.length === 0) return null;

    // Use provided path or calculate fallback
    let pathData = path || points.reduce((acc, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${acc} ${command} ${point.x} ${point.y}`;
    }, '') + ' Z';

    // If Hole exists, append a circular path to the pathData
    // We use a MoveTo (M) to 0,-r then Arc (A) command to draw the circle
    // To create a compound path (hole), the winding order usually matters, but 'evenodd' rule handles it best.
    // SVG Path Circle: M cx, cy-r A r,r 0 1,0 cx, cy+r A r,r 0 1,0 cx, cy-r

    if (holeDiameter > 0) {
        const r = holeDiameter / 2;
        // Draw circle (counter-clockwise or clockwise doesn't matter much with evenodd, but standard is M 0,-r ... )
        pathData += ` M 0,-${r} A ${r},${r} 0 1,0 0,${r} A ${r},${r} 0 1,0 0,-${r} Z`;
    }

    // Calculate Draft Line (scaled down version of the shape)
    // Simulating a 45 degree chamfer or standard draft taper
    const draftScale = 0.90; // 10% taper/inset for visualization
    const draftPoints = points.map(p => ({ x: p.x * draftScale, y: p.y * draftScale }));

    const draftPathData = draftPoints.reduce((acc, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${acc} ${command} ${point.x} ${point.y}`;
    }, '') + ' Z';

    return (
        <g className="shape-layer">
            {/* Main Pattern Body */}
            {/* fillRule="evenodd" is CRITICAL for the hole to show as transparent/empty */}
            <path
                d={pathData}
                fill="cyan"
                fillOpacity="0.4"
                fillRule="evenodd"
                stroke="cyan"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            {/* Draft Angle Visualization */}
            {showDraft && (
                <path
                    d={draftPathData}
                    fill="none"
                    stroke="#fbbf24" // amber-400
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    strokeOpacity="0.8"
                />
            )}

            {/* Render Interactive Handles */}
            {points.map((p, i) => {
                const type = i % 2 === 0 ? 'outer' : 'inner';
                return (
                    <DragHandle
                        key={i}
                        x={p.x}
                        y={p.y}
                        type={type}
                        onMouseDown={(e) => {
                            e.stopPropagation(); // Prevent panning start
                            if (onHandleMouseDown) onHandleMouseDown(type);
                        }}
                    />
                );
            })}
        </g>
    );
};

export default ShapeRenderer;
