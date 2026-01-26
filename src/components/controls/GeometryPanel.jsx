import React from 'react';

const GeometryPanel = ({ values, onChange }) => {
    const handleChange = (key, val) => {
        onChange({ ...values, [key]: parseFloat(val) });
    };

    const isStar = values.shapeType === 'STAR';
    const isBlock = values.shapeType === 'BLOCK';
    const isDisk = values.shapeType === 'DISK';

    return (
        <div className="p-4 rounded-lg border mb-4" style={{ backgroundColor: '#334155', borderColor: '#475569' }}>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#f1f5f9' }}>Shape Settings</h3>

            {/* Points Slider - Star Only */}
            {isStar && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                        <label>Points / Teeth</label>
                        <span>{values.numPoints}</span>
                    </div>
                    <input
                        type="range"
                        min="3"
                        max="48"
                        step="1"
                        value={values.numPoints}
                        onChange={(e) => handleChange('numPoints', e.target.value)}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
                    />
                </div>
            )}

            {/* Radius / Diameter Controls */}
            {!isBlock && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                        <label>Outer Radius (in)</label>
                        <span>{values.outerRadius}"</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="6"
                        step="0.0625"
                        value={values.outerRadius}
                        onChange={(e) => handleChange('outerRadius', e.target.value)}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
                    />
                </div>
            )}

            {/* Inner Radius - Star Only */}
            {isStar && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                        <label>Inner Radius (in)</label>
                        <span>{values.innerRadius}"</span>
                    </div>
                    <input
                        type="range"
                        min="0.125"
                        max={values.outerRadius - 0.125}
                        step="0.0625"
                        value={values.innerRadius}
                        onChange={(e) => handleChange('innerRadius', e.target.value)}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
                    />
                </div>
            )}

            {/* Block Dimensions */}
            {isBlock && (
                <>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                            <label>Width (in)</label>
                            <span>{values.width}"</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="12"
                            step="0.125"
                            value={values.width || 4}
                            onChange={(e) => handleChange('width', e.target.value)}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
                        />
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                            <label>Length (in)</label>
                            <span>{values.length}"</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="12"
                            step="0.125"
                            value={values.length || 6}
                            onChange={(e) => handleChange('length', e.target.value)}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
                        />
                    </div>
                </>
            )}

            {/* Center Hole Slider */}
            <div className="mb-2">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
                    <label>Center Hole Dia (in)</label>
                    <span>{values.holeDiameter || 0}"</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={isBlock ? Math.min(values.width, values.length) - 0.5 : values.innerRadius ? (values.innerRadius * 2 - 0.25) : (values.outerRadius * 2 - 0.5)}
                    step="0.0625"
                    value={values.holeDiameter || 0}
                    onChange={(e) => handleChange('holeDiameter', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
                />
            </div>
        </div>
    );
};

export default GeometryPanel;
