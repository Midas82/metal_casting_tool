import React, { useId } from 'react';
import { LIMITS, maxHoleDiameter } from '../../logic/constraints';
import { formatImperial } from '../../utils/unitConversion';

const Slider = ({ id, label, value, min, max, step, onChange, display }) => (
    <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#cbd5e1' }}>
            <label htmlFor={id}>{label}</label>
            <span className="font-mono">{display}</span>
        </div>
        <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ backgroundColor: '#475569', accentColor: '#06b6d4' }}
        />
    </div>
);

const GeometryPanel = ({ values, onChange }) => {
    const uid = useId();
    const set = (key) => (val) => onChange({ ...values, [key]: val });

    const isStar = values.shapeType === 'STAR';
    const isBlock = values.shapeType === 'BLOCK';

    // Hole ceiling is shape-aware: a disk is no longer limited by a star's
    // leftover inner radius.
    const holeMax = maxHoleDiameter(values);

    return (
        <div className="p-4 rounded-lg border mb-4" style={{ backgroundColor: '#334155', borderColor: '#475569' }}>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#f1f5f9' }}>
                Shape Settings
            </h3>

            {isStar && (
                <Slider
                    id={`${uid}-points`}
                    label="Points / Teeth"
                    value={values.numPoints}
                    min={LIMITS.numPoints.min}
                    max={LIMITS.numPoints.max}
                    step={1}
                    onChange={set('numPoints')}
                    display={values.numPoints}
                />
            )}

            {!isBlock && (
                <Slider
                    id={`${uid}-outer`}
                    label="Outer Radius"
                    value={values.outerRadius}
                    min={LIMITS.outerRadius.min}
                    max={LIMITS.outerRadius.max}
                    step={1 / 16}
                    onChange={set('outerRadius')}
                    display={formatImperial(values.outerRadius)}
                />
            )}

            {isStar && (
                <Slider
                    id={`${uid}-inner`}
                    label="Inner Radius"
                    value={values.innerRadius}
                    min={LIMITS.innerRadius.min}
                    max={Math.max(LIMITS.innerRadius.min, values.outerRadius - LIMITS.minWebGap)}
                    step={1 / 16}
                    onChange={set('innerRadius')}
                    display={formatImperial(values.innerRadius)}
                />
            )}

            {isBlock && (
                <>
                    <Slider
                        id={`${uid}-width`}
                        label="Width"
                        value={values.width}
                        min={LIMITS.width.min}
                        max={LIMITS.width.max}
                        step={1 / 8}
                        onChange={set('width')}
                        display={formatImperial(values.width)}
                    />
                    <Slider
                        id={`${uid}-length`}
                        label="Length"
                        value={values.length}
                        min={LIMITS.length.min}
                        max={LIMITS.length.max}
                        step={1 / 8}
                        onChange={set('length')}
                        display={formatImperial(values.length)}
                    />
                </>
            )}

            <Slider
                id={`${uid}-hole`}
                label="Centre Hole Dia."
                value={Math.min(values.holeDiameter, holeMax)}
                min={0}
                max={Math.max(0.0625, holeMax)}
                step={1 / 16}
                onChange={set('holeDiameter')}
                display={values.holeDiameter > 0 ? formatImperial(values.holeDiameter) : 'none'}
            />
            <p className="text-[9px] -mt-2" style={{ color: '#64748b' }}>
                Capped at {formatImperial(holeMax)} to leave {formatImperial(LIMITS.minWallAtHole)} of wall.
            </p>
        </div>
    );
};

export default GeometryPanel;
