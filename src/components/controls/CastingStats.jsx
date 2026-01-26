import React, { useMemo, useState } from 'react';
import { calculateCastingStats, calculatePolygonArea, SHAPE_FORMULAS, MATERIAL_DENSITIES } from '../../utils/castingFormulas';

const CastingStats = ({ points, height, geometry, shrinkage }) => {
    const [material, setMaterial] = useState('ZINC');
    const { shapeType, outerRadius, holeDiameter, width, length } = geometry;

    const stats = useMemo(() => {
        let area = 0;
        if (shapeType === 'STAR') {
            area = calculatePolygonArea(points);
        } else if (shapeType === 'DISK') {
            area = SHAPE_FORMULAS.DISK(outerRadius * 2);
        } else if (shapeType === 'BLOCK') {
            area = SHAPE_FORMULAS.BLOCK(width, length);
        }

        // Subtract hole for all shapes
        const holeArea = Math.PI * Math.pow((holeDiameter || 0) / 2, 2);
        const netArea = Math.max(0, area - holeArea);

        return calculateCastingStats(netArea, height, material);
    }, [points, height, geometry, material]);

    return (
        <div className="p-4 rounded-lg shadow-inner mt-4" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="flex items-center gap-2 font-bold" style={{ color: '#f59e0b' }}>
                    <span>🔥</span> Foundry Data
                </h3>
                <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded px-1 outline-none"
                >
                    {Object.keys(MATERIAL_DENSITIES).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <label className="text-xs uppercase" style={{ color: '#94a3b8' }}>Volume</label>
                    <div className="font-mono text-lg" style={{ color: '#ffffff' }}>
                        {stats.volume} <span className="text-sm" style={{ color: '#64748b' }}>in³</span>
                    </div>
                </div>
                <div>
                    <label className="text-xs uppercase" style={{ color: '#94a3b8' }}>Weight ({material})</label>
                    <div className="font-mono text-lg font-bold" style={{ color: '#fbbf24' }}>
                        {stats.weight} <span className="text-sm" style={{ color: '#d97706' }}>lbs</span>
                    </div>
                </div>
            </div>

            <div className={`text-xs px-2 py-1 rounded border ${shrinkage
                ? "border-emerald-800 bg-emerald-900/30 text-emerald-400"
                : "border-slate-600 bg-slate-800 text-slate-400"
                }`}>
                {shrinkage
                    ? "✓ Shrinkage Compensated (1.5%)"
                    : "Original Dimensions (No Shrinkage)"}
            </div>
        </div>
    );
};

export default CastingStats;
