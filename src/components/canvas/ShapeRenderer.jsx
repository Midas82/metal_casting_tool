import React from 'react';
import DragHandle from './DragHandle';

/**
 * Draws the pattern outline and its handles.
 *
 * The path arrives fully formed (hole included) from usePatternGeometry.
 * This component must NOT re-apply the hole - doing so previously cut it
 * twice, at two different unit scales.
 */
const ShapeRenderer = ({ points, path, handles = [], onHandlePointerDown, showTaper }) => {
    if (!path) return null;

    // Visual taper preview only - a flat 10% inset, NOT a calculated draft
    // angle. Real draft (inset = height x tan(theta)) is roadmap work.
    const TAPER_INSET = 0.9;
    const taperPath = points && points.length
        ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x * TAPER_INSET} ${p.y * TAPER_INSET}`, '') + ' Z'
        : '';

    return (
        <g className="shape-layer">
            {/* fill-rule evenodd is what makes the centre hole read as empty. */}
            <path
                d={path}
                fill="cyan"
                fillOpacity="0.4"
                fillRule="evenodd"
                stroke="cyan"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            {showTaper && taperPath && (
                <path
                    d={taperPath}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    strokeOpacity="0.8"
                />
            )}

            {handles.map((h, i) => (
                <DragHandle
                    key={`${h.type}-${i}`}
                    x={h.x}
                    y={h.y}
                    type={h.type}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (onHandlePointerDown) onHandlePointerDown(h.type, e);
                    }}
                />
            ))}
        </g>
    );
};

export default ShapeRenderer;
