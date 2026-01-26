import React from 'react';
import GeometryPanel from '../components/controls/GeometryPanel';
import DimensionsPanel from '../components/controls/DimensionsPanel';
import CastingStats from '../components/controls/CastingStats';
import ExportPanel from '../components/controls/ExportPanel';

const Sidebar = ({
    geometryValues,
    onGeometryChange,
    height,
    setHeight,
    shrinkage,
    setShrinkage,
    points
}) => {
    const [projectName, setProjectName] = React.useState('Untitled Pattern');
    const [savedProjects, setSavedProjects] = React.useState(() => {
        const saved = localStorage.getItem('midas_vault');
        return saved ? JSON.parse(saved) : [];
    });

    const handleSave = () => {
        const newProject = {
            name: projectName,
            geometry: geometryValues,
            height,
            date: new Date().toLocaleDateString()
        };
        const updated = [...savedProjects.filter(p => p.name !== projectName), newProject].slice(-10);
        setSavedProjects(updated);
        localStorage.setItem('midas_vault', JSON.stringify(updated));
    };

    const handleLoad = (proj) => {
        setProjectName(proj.name);
        onGeometryChange(proj.geometry);
        setHeight(proj.height);
    };

    // Safety Check: Enforce Imperial constraints
    const handleGeometryChange = (newValues) => {
        const safeValues = { ...newValues };

        // Rule 1: Inner Radius must be less than Outer Radius
        const minGap = 0.25; // 1/4 inch
        if (safeValues.innerRadius >= safeValues.outerRadius - minGap) {
            safeValues.innerRadius = parseFloat(Math.max(0.1, safeValues.outerRadius - minGap).toFixed(3));
        }

        // Rule 2: Hole Diameter Safety
        const maxHole = (safeValues.outerRadius * 2) - 0.5; // 1/2" margin
        if (safeValues.holeDiameter > maxHole) {
            safeValues.holeDiameter = Math.max(0, maxHole);
        }

        onGeometryChange(safeValues);
    };

    const handleShapeTypeChange = (type) => {
        onGeometryChange({ ...geometryValues, shapeType: type });
    };

    return (
        <div className="sidebar-container absolute left-0 top-0 bottom-0 w-80 p-4 shadow-xl z-20 flex flex-col" style={{ backgroundColor: '#1e293b', color: '#f1f5f9', borderRight: '1px solid #334155' }}>
            <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#22d3ee' }}>
                    <span className="text-xl">⚒</span> Midas Digital
                </h2>
                <p className="text-xs uppercase tracking-widest ml-7" style={{ color: '#cbd5e1' }}>Pattern Suite v2.0</p>
            </div>

            {/* Project Vault - Phase 5 */}
            <div className="mb-4 bg-slate-900/50 p-2 rounded border border-slate-700">
                <div className="flex gap-1 mb-2">
                    <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-[10px] px-2 py-1 flex-1 rounded text-cyan-300"
                    />
                    <button
                        onClick={handleSave}
                        className="bg-cyan-900 border border-cyan-700 text-[10px] px-2 rounded hover:bg-cyan-800"
                    >
                        SAVE
                    </button>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    {savedProjects.map(p => (
                        <button
                            key={p.name}
                            onClick={() => handleLoad(p)}
                            className="whitespace-nowrap bg-slate-800 text-[8px] px-2 py-1 rounded border border-slate-700 hover:border-cyan-500"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shape Selector - Phase 3 UI */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                {['STAR', 'DISK', 'BLOCK'].map(type => (
                    <button
                        key={type}
                        onClick={() => handleShapeTypeChange(type)}
                        className={`text-[10px] py-1 px-2 rounded border transition-all ${geometryValues.shapeType === type ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2">
                <div className="space-y-4">

                    {/* Geometry Controls */}
                    {geometryValues && (
                        <GeometryPanel
                            values={geometryValues}
                            onChange={handleGeometryChange}
                        />
                    )}

                    {/* Dimension Controls */}
                    <DimensionsPanel
                        height={height}
                        onChangeHeight={setHeight}
                        shrinkage={shrinkage}
                        onToggleShrinkage={setShrinkage}
                        diameter={geometryValues.outerRadius * 2}
                        onChangeDiameter={(d) => handleGeometryChange({ ...geometryValues, outerRadius: d / 2 })}
                    />

                    {/* Casting Data */}
                    <CastingStats
                        points={points}
                        height={height}
                        geometry={geometryValues}
                        shrinkage={shrinkage}
                    />

                </div>
            </div>

            {/* Export Controls */}
            <ExportPanel points={points} geometry={geometryValues} />

        </div>
    );
};

export default Sidebar;
