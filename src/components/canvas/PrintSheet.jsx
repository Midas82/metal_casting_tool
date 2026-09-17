import React from 'react';
import { buildPatternRender } from '../../logic/patternRender';

/**
 * Print-only rendering of the pattern at true 1:1.
 *
 * Printing used to hand the browser the live canvas, so the output scaled
 * with whatever zoom and pan happened to be set - a printed pattern that is
 * not 1:1 is scrap. This sheet is sized in real inches and ignores the view
 * transform entirely. It is display:none on screen (see index.css).
 */
const PrintSheet = ({ points, geometry, shrinkFactor = 1 }) => {
    const render = buildPatternRender(points, geometry, { shrinkFactor });

    return (
        <div className="print-sheet" aria-hidden="true">
            <svg
                viewBox={render.viewBox}
                width={`${render.widthIn.toFixed(4)}in`}
                height={`${render.heightIn.toFixed(4)}in`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d={render.pathData}
                    fill="none"
                    fillRule="evenodd"
                    stroke="black"
                    strokeWidth="1"
                />
            </svg>
        </div>
    );
};

export default PrintSheet;
