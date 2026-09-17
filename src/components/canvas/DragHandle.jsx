import React from 'react';

const STYLES = {
    outer: { r: 6, fill: '#fbbf24', stroke: '#d97706' }, // amber
    inner: { r: 5, fill: '#38bdf8', stroke: '#0284c7' }, // sky
    corner: { r: 6, fill: '#34d399', stroke: '#059669' }, // emerald
};

const LABELS = {
    outer: 'Drag to resize outer radius',
    inner: 'Drag to resize inner radius',
    corner: 'Drag to resize width and length',
};

const DragHandle = ({ x, y, type, onPointerDown }) => {
    const style = STYLES[type] || STYLES.outer;

    return (
        <g className="drag-handle cursor-pointer" onPointerDown={onPointerDown}>
            <title>{LABELS[type] || LABELS.outer}</title>
            {/* Oversized invisible target - fingers are not mice. */}
            <circle cx={x} cy={y} r="16" fill="transparent" />
            <circle
                cx={x}
                cy={y}
                r={style.r}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="2"
            />
        </g>
    );
};

export default DragHandle;
