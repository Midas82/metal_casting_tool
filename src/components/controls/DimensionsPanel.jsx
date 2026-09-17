import React, { useState, useId } from 'react';
import { parseImperial, formatImperial } from '../../utils/unitConversion';
import { LIMITS } from '../../logic/constraints';
import { describeShrinkage } from '../../utils/castingFormulas';

/**
 * Text entry for an imperial dimension.
 *
 * Unparseable input is REJECTED and the field snaps back to the last good
 * value, with a brief inline warning - it is never silently coerced to 0.
 */
const ImperialInput = ({ label, hint, value, onCommit }) => {
    const id = useId();
    // `draft` is the in-progress edit. null means "show the committed value",
    // so after every commit the field falls back to whatever the sanitiser
    // actually accepted - not to what the operator asked for. Without this,
    // typing 50" into a field capped at 12" left "4' 2"" on screen while the
    // real geometry was 12".
    const [draft, setDraft] = useState(null);
    const [invalid, setInvalid] = useState(false);

    const display = draft === null ? formatImperial(value) : draft;

    const commit = () => {
        if (draft === null) return;
        const decimal = parseImperial(draft);
        if (decimal === null) {
            setInvalid(true);
            setDraft(null); // revert to the last good value
            return;
        }
        setInvalid(false);
        setDraft(null);     // re-sync to whatever the parent accepts
        onCommit(decimal);
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                <label htmlFor={id}>{label}</label>
                <span className="text-[10px]" style={{ color: '#64748b' }}>{hint}</span>
            </div>
            <input
                id={id}
                type="text"
                inputMode="text"
                value={display}
                onChange={(e) => { setDraft(e.target.value); setInvalid(false); }}
                onBlur={commit}
                onKeyDown={(e) => e.key === 'Enter' && commit()}
                placeholder={`e.g. 2' 6 1/4"  or  6.5`}
                aria-invalid={invalid}
                className="rounded px-2 py-1 w-full font-mono text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500"
                style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: `1px solid ${invalid ? '#ef4444' : '#475569'}`,
                }}
            />
            {invalid && (
                <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>
                    Not a valid measurement — reverted. Try 6, 6.5, 6 1/2, or 2&apos; 6&quot;.
                </p>
            )}
        </div>
    );
};

const DimensionsPanel = ({
    height,
    shrinkage,
    onChangeHeight,
    onToggleShrinkage,
    diameter,
    onChangeDiameter,
    material,
}) => {
    const toggleId = useId();

    return (
        <div className="p-4 rounded-lg border mb-4" style={{ backgroundColor: '#334155', borderColor: '#475569' }}>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#f1f5f9' }}>
                Pattern Dimensions
            </h3>

            <ImperialInput
                label="Pattern Diameter"
                hint={`max ${formatImperial(LIMITS.outerRadius.max * 2)}`}
                value={diameter}
                onCommit={onChangeDiameter}
            />

            <ImperialInput
                label="Pattern Height"
                hint={`max ${formatImperial(LIMITS.height.max)}`}
                value={height}
                onCommit={onChangeHeight}
            />

            <div className="flex items-center justify-between">
                <label htmlFor={toggleId} className="text-xs pr-2" style={{ color: '#cbd5e1' }}>
                    Shrink allowance
                    <span className="block text-[10px]" style={{ color: '#64748b' }}>
                        {describeShrinkage(material)}
                    </span>
                </label>
                <button
                    id={toggleId}
                    type="button"
                    role="switch"
                    aria-checked={shrinkage}
                    onClick={() => onToggleShrinkage(!shrinkage)}
                    className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${shrinkage ? 'bg-cyan-600' : 'bg-slate-600'}`}
                >
                    <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${shrinkage ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
        </div>
    );
};

export default DimensionsPanel;
