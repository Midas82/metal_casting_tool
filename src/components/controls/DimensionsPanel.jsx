import React, { useState, useEffect } from 'react';
import { parseImperial, formatImperial } from '../../utils/unitConversion';

const ImperialInput = ({ label, value, onCommit }) => {
    const [localVal, setLocalVal] = useState(formatImperial(value));

    useEffect(() => {
        setLocalVal(formatImperial(value));
    }, [value]);

    const handleBlur = () => {
        const decimal = parseImperial(localVal);
        onCommit(decimal);
        setLocalVal(formatImperial(decimal));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleBlur();
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                <label>{label}</label>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={localVal}
                    onChange={(e) => setLocalVal(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder='e.g. 2\u0027 6 1/4"'
                    className="rounded px-2 py-1 w-full font-mono text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500"
                    style={{ backgroundColor: '#0f172a', color: '#ffffff', border: '1px solid #475569' }}
                />
            </div>
        </div>
    );
};

const DimensionsPanel = ({ height, shrinkage, onChangeHeight, onToggleShrinkage, diameter, onChangeDiameter }) => {
    return (
        <div className="p-4 rounded-lg border mb-4" style={{ backgroundColor: '#334155', borderColor: '#475569' }}>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#f1f5f9' }}>Pattern Dimensions</h3>

            <ImperialInput
                label="Pattern Diameter (Max 12'')"
                value={diameter}
                onCommit={onChangeDiameter}
            />

            <ImperialInput
                label="Pattern Height (Max 3')"
                value={height}
                onCommit={onChangeHeight}
            />

            {/* Shrinkage Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm" style={{ color: '#cbd5e1' }}>Apply Shrinkage (1.5%)</label>
                <button
                    onClick={() => onToggleShrinkage(!shrinkage)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${shrinkage ? 'bg-cyan-600' : 'bg-slate-600'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${shrinkage ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
        </div>
    );
};

export default DimensionsPanel;
