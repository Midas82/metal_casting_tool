import React, { useState } from 'react';
import GeometryPanel from '../components/controls/GeometryPanel';
import DimensionsPanel from '../components/controls/DimensionsPanel';
import CastingStats from '../components/controls/CastingStats';
import ExportPanel from '../components/controls/ExportPanel';
import { sanitizeGeometry, sanitizeHeight } from '../logic/constraints';
import { MATERIALS, DEFAULT_MATERIAL } from '../utils/castingFormulas';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';

const MAX_VAULT_ENTRIES = 20;

const Sidebar = ({
    geometryValues,
    onGeometryChange,
    height,
    setHeight,
    shrinkage,
    setShrinkage,
    material,
    setMaterial,
    shrinkFactor,
    points,
}) => {
    const [projectName, setProjectName] = useState('Untitled Pattern');
    const [savedProjects, setSavedProjects] = useState(() => {
        const raw = loadJSON(STORAGE_KEYS.vault, []);
        return Array.isArray(raw) ? raw : [];
    });

    const persistVault = (next) => {
        setSavedProjects(next);
        saveJSON(STORAGE_KEYS.vault, next);
    };

    const handleSave = () => {
        const name = projectName.trim() || 'Untitled Pattern';
        const entry = {
            name,
            geometry: geometryValues,
            height,
            material,
            shrinkage,
            date: new Date().toLocaleDateString(),
        };
        persistVault([...savedProjects.filter((p) => p.name !== name), entry].slice(-MAX_VAULT_ENTRIES));
    };

    // Everything from the vault is re-sanitised: a project saved by an older
    // build may be missing fields or carry values that are no longer legal.
    const handleLoad = (proj) => {
        setProjectName(proj.name);
        onGeometryChange(sanitizeGeometry(proj.geometry));
        setHeight(sanitizeHeight(proj.height));
        if (proj.material && MATERIALS[proj.material]) setMaterial(proj.material);
        else setMaterial(DEFAULT_MATERIAL);
        setShrinkage(proj.shrinkage === true);
    };

    const handleDelete = (name) => persistVault(savedProjects.filter((p) => p.name !== name));

    const handleShapeTypeChange = (type) => onGeometryChange({ ...geometryValues, shapeType: type });

    return (
        <div
            className="sidebar-container absolute left-0 top-0 bottom-0 w-80 p-4 shadow-xl z-20 flex flex-col"
            style={{ backgroundColor: '#1e293b', color: '#f1f5f9', borderRight: '1px solid #334155' }}
        >
            <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#22d3ee' }}>
                    <span className="text-xl" aria-hidden="true">⚒</span> Midas Digital
                </h2>
                <p className="text-xs uppercase tracking-widest ml-7" style={{ color: '#cbd5e1' }}>
                    Pattern Suite v2.1
                </p>
            </div>

            {/* Project Vault */}
            <div className="mb-4 bg-slate-900/50 p-2 rounded border border-slate-700">
                <label htmlFor="project-name" className="sr-only">Project name</label>
                <div className="flex gap-1 mb-2">
                    <input
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-[10px] px-2 py-1 flex-1 rounded text-cyan-300"
                    />
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-cyan-900 border border-cyan-700 text-[10px] px-2 rounded hover:bg-cyan-800"
                    >
                        SAVE
                    </button>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    {savedProjects.length === 0 && (
                        <span className="text-[9px] text-slate-500 italic px-1">No saved patterns yet</span>
                    )}
                    {savedProjects.map((p) => (
                        <span key={p.name} className="flex items-center whitespace-nowrap bg-slate-800 rounded border border-slate-700 hover:border-cyan-500">
                            <button
                                type="button"
                                onClick={() => handleLoad(p)}
                                title={`Load ${p.name} (saved ${p.date})`}
                                className="text-[8px] px-2 py-1"
                            >
                                {p.name}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(p.name)}
                                title={`Delete ${p.name}`}
                                aria-label={`Delete ${p.name}`}
                                className="text-[8px] px-1 py-1 text-slate-500 hover:text-red-400"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Shape Selector */}
            <div className="mb-4 grid grid-cols-3 gap-2" role="group" aria-label="Shape type">
                {['STAR', 'DISK', 'BLOCK'].map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => handleShapeTypeChange(type)}
                        aria-pressed={geometryValues.shapeType === type}
                        className={`text-[10px] py-1 px-2 rounded border transition-all ${
                            geometryValues.shapeType === type
                                ? 'bg-cyan-600 border-cyan-400 text-white'
                                : 'bg-slate-700 border-slate-600 text-slate-400'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2">
                <div className="space-y-4">
                    <GeometryPanel values={geometryValues} onChange={onGeometryChange} />

                    <DimensionsPanel
                        height={height}
                        onChangeHeight={setHeight}
                        shrinkage={shrinkage}
                        onToggleShrinkage={setShrinkage}
                        diameter={geometryValues.outerRadius * 2}
                        onChangeDiameter={(d) => onGeometryChange({ ...geometryValues, outerRadius: d / 2 })}
                        material={material}
                    />

                    <CastingStats
                        points={points}
                        height={height}
                        geometry={geometryValues}
                        shrinkage={shrinkage}
                        material={material}
                        setMaterial={setMaterial}
                        shrinkFactor={shrinkFactor}
                    />
                </div>
            </div>

            <ExportPanel
                points={points}
                geometry={geometryValues}
                height={height}
                material={material}
                shrinkage={shrinkage}
                shrinkFactor={shrinkFactor}
                projectName={projectName}
            />
        </div>
    );
};

export default Sidebar;
