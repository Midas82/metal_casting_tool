import React from 'react';

const DragHandle = ({ x, y, type, onMouseDown }) => {
    const isOuter = type === 'outer';

    return (
        <g className="cursor-pointer group" onMouseDown={onMouseDown}>
            {/* Invisible larger target for easier clicking */}
            <circle cx={x} cy={y} r="12" fill="transparent" />

            {/* Visual Handle */}
            <circle
                cx={x}
                cy={y}
                r={isOuter ? 6 : 5}
                className={`transition-all duration-100 ${isOuter
                        ? "fill-amber-400 stroke-amber-600 group-hover:r-8 group-hover:fill-amber-300"
                        : "fill-sky-400 stroke-sky-600 group-hover:r-7 group-hover:fill-sky-300"
                    }`}
                strokeWidth="2"
            />
        </g>
    );
};

export default DragHandle;
