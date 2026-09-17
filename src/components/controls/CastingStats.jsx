import React, { useMemo, useId } from 'react';
import {
    calculateCastingStats,
    calculateNetArea,
    describeShrinkage,
    MATERIALS,
} from '../../utils/castingFormulas';
import { formatImperial } from '../../utils/unitConversion';

/**
 * Foundry figures.
 *
 * Volume and weight describe the FINISHED CASTING at nominal size. The shrink
 * allowance enlarges the PATTERN, which is reported separately - the panel
 * used to print "Shrinkage Compensated" next to numbers that had not changed
 * at all.
 */
const CastingStats = ({ points, height, geometry, shrinkage, material, setMaterial, shrinkFactor }) => {
    const selectId = useId();

    const stats = useMemo(
        () => calculateCastingStats(calculateNetArea(points, geometry), height, material),
        [points, geometry, height, material]
    );

    // Linear factor cubed: pattern displaces measurably more sand.
    const patternVolume = (stats.volume * Math.pow(shrinkFactor, 3)).toFixed(3);

    return (
        <div className="p-4 rounded-lg shadow-inner mt-4" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="flex items-center gap-2 font-bold text-sm" style={{ color: '#f59e0b' }}>
                    <span aria-hidden="true">🔥</span> Foundry Data
                </h3>
                <label htmlFor={selectId} className="sr-only">Material</label>
                <select
                    id={selectId}
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded px-1 py-0.5 outline-none"
                >
                    {Object.entries(MATERIALS).map(([key, m]) => (
                        <option key={key} value={key}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <span className="text-[10px] uppercase block" style={{ color: '#94a3b8' }}>Casting Volume</span>
                    <div className="font-mono text-lg" style={{ color: '#ffffff' }}>
                        {stats.volume} <span className="text-xs" style={{ color: '#64748b' }}>in³</span>
                    </div>
                </div>
                <div>
                    <span className="text-[10px] uppercase block" style={{ color: '#94a3b8' }}>Casting Weight</span>
                    <div className="font-mono text-lg font-bold" style={{ color: '#fbbf24' }}>
                        {stats.weight} <span className="text-xs" style={{ color: '#d97706' }}>lbs</span>
                    </div>
                </div>
            </div>

            <dl className="text-[10px] space-y-1 mb-3" style={{ color: '#94a3b8' }}>
                <div className="flex justify-between">
                    <dt>Net area</dt>
                    <dd className="font-mono">{stats.area} in²</dd>
                </div>
                <div className="flex justify-between">
                    <dt>Height</dt>
                    <dd className="font-mono">{formatImperial(height)}</dd>
                </div>
                {shrinkage && (
                    <div className="flex justify-between">
                        <dt>Pattern volume</dt>
                        <dd className="font-mono">{patternVolume} in³</dd>
                    </div>
                )}
            </dl>

            <div
                className={`text-[10px] px-2 py-1.5 rounded border leading-snug ${
                    shrinkage
                        ? 'border-emerald-800 bg-emerald-900/30 text-emerald-400'
                        : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
            >
                {shrinkage ? (
                    <>
                        Pattern enlarged ×{shrinkFactor.toFixed(5)} — {describeShrinkage(material)}.
                        <span className="block" style={{ color: '#6ee7b7' }}>Allowance is included in the SVG export and print.</span>
                    </>
                ) : (
                    <>
                        No shrink allowance. Export and print are at nominal casting size.
                    </>
                )}
            </div>
        </div>
    );
};

export default CastingStats;
