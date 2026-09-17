import React, { useState, useRef, useEffect, useCallback } from 'react';
import GridBackground from './GridBackground';
import ShapeRenderer from './ShapeRenderer';
import PrintSheet from './PrintSheet';
import Sidebar from '../../layout/Sidebar';
import usePatternGeometry from '../../hooks/usePatternGeometry';
import { computeFitView } from '../../logic/viewFit';
import { dragToGeometryPatch } from '../../logic/dragMath';
import { sanitizeGeometry, sanitizeHeight, DEFAULT_GEOMETRY, DEFAULT_HEIGHT } from '../../logic/constraints';
import { shrinkageFactor, DEFAULT_MATERIAL, MATERIALS } from '../../utils/castingFormulas';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../../utils/storage';

// Read once up front so the initial-view fit and the persisted-state
// initializers below don't each hit storage separately for the same keys.
const loadInitialState = () => {
    const geometry = sanitizeGeometry(loadJSON(STORAGE_KEYS.geometry, DEFAULT_GEOMETRY));
    const height = sanitizeHeight(loadJSON(STORAGE_KEYS.height, DEFAULT_HEIGHT));
    const shrinkage = loadJSON(STORAGE_KEYS.shrinkage, false) === true;
    const savedMaterial = loadJSON(STORAGE_KEYS.material, DEFAULT_MATERIAL);
    const material = MATERIALS[savedMaterial] ? savedMaterial : DEFAULT_MATERIAL;
    return { geometry, height, shrinkage, material };
};

const PatternWorkspace = () => {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    // Seeded from a fit so the pattern is framed on first paint rather than
    // being clipped at true 1:1 scale. Uses the persisted material/shrinkage
    // so a reload with the shrink allowance on doesn't open at a zoom
    // computed for the unshrunk size.
    const [initial] = useState(loadInitialState);
    const [initialView] = useState(() =>
        computeFitView(
            initial.geometry,
            shrinkageFactor(initial.material, initial.shrinkage),
            { width: window.innerWidth, height: window.innerHeight }
        )
    );
    const [pan, setPan] = useState(initialView.pan);
    const [zoom, setZoom] = useState(initialView.zoom);
    const [isPanning, setIsPanning] = useState(false);
    const [activeDragHandle, setActiveDragHandle] = useState(null);

    const lastPointerPos = useRef({ x: 0, y: 0 });
    const svgRef = useRef(null);


    // -- Persisted state (every load sanitised, so old or corrupt saves
    //    can never inject an impossible pattern) --
    const [geometry, setGeometry] = useState(initial.geometry);
    const [height, setHeightRaw] = useState(initial.height);
    const [shrinkage, setShrinkage] = useState(initial.shrinkage);
    const [material, setMaterial] = useState(initial.material);
    const [showTaper, setShowTaper] = useState(false);

    // Single funnel for every geometry mutation.
    const updateGeometry = useCallback((next) => {
        setGeometry((prev) => sanitizeGeometry(typeof next === 'function' ? next(prev) : next));
    }, []);

    const setHeight = useCallback((value) => setHeightRaw(sanitizeHeight(value)), []);

    useEffect(() => { saveJSON(STORAGE_KEYS.geometry, geometry); }, [geometry]);
    useEffect(() => { saveJSON(STORAGE_KEYS.height, height); }, [height]);
    useEffect(() => { saveJSON(STORAGE_KEYS.shrinkage, shrinkage); }, [shrinkage]);
    useEffect(() => { saveJSON(STORAGE_KEYS.material, material); }, [material]);

    const { points, renderPoints, handles, path } = usePatternGeometry(geometry);
    const shrinkFactor = shrinkageFactor(material, shrinkage);

    const fitToView = useCallback(() => {
        const view = computeFitView(geometry, shrinkFactor, dimensions);
        setZoom(view.zoom);
        setPan(view.pan);
    }, [geometry, shrinkFactor, dimensions]);

    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // -- Pointer interaction (covers mouse, pen and touch) --

    const handlePointerDown = (e) => {
        if (e.button === 1 || e.shiftKey || e.pointerType === 'touch') {
            setIsPanning(true);
            lastPointerPos.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture?.(e.pointerId);
            e.preventDefault();
        }
    };

    const onHandleDragStart = (type, e) => {
        setActiveDragHandle(type);
        svgRef.current?.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (isPanning) {
            setPan((prev) => ({
                x: prev.x + (e.clientX - lastPointerPos.current.x),
                y: prev.y + (e.clientY - lastPointerPos.current.y),
            }));
            lastPointerPos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (!activeDragHandle) return;

        const rect = svgRef.current?.getBoundingClientRect();
        const originX = (rect?.left ?? 0) + dimensions.width / 2 + pan.x;
        const originY = (rect?.top ?? 0) + dimensions.height / 2 + pan.y;

        const patch = dragToGeometryPatch({
            type: activeDragHandle,
            dx: e.clientX - originX,
            dy: e.clientY - originY,
            zoom,
            shrinkFactor,
        });
        updateGeometry((prev) => ({ ...prev, ...patch }));
    };

    const handlePointerUp = () => {
        setIsPanning(false);
        setActiveDragHandle(null);
    };

    const handleWheel = (e) => {
        const sensitivity = e.ctrlKey || e.metaKey ? 0.003 : 0.001;
        setZoom((z) => Math.max(0.1, Math.min(5, z - e.deltaY * sensitivity)));
    };

    const cursor = isPanning ? 'grabbing' : activeDragHandle ? 'crosshair' : 'default';

    return (
        <div className="app-shell relative w-full h-full overflow-hidden bg-slate-900 select-none">
            <Sidebar
                geometryValues={geometry}
                onGeometryChange={updateGeometry}
                height={height}
                setHeight={setHeight}
                shrinkage={shrinkage}
                setShrinkage={setShrinkage}
                material={material}
                setMaterial={setMaterial}
                shrinkFactor={shrinkFactor}
                points={points}
            />

            <div className="app-chrome absolute top-4 right-4 z-10 flex gap-2">
                <button
                    type="button"
                    onClick={fitToView}
                    title="Frame the pattern in view"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all bg-slate-800/80 border-slate-600 text-slate-400 hover:text-slate-200"
                >
                    <span aria-hidden="true">⤢</span>
                    <span>Fit</span>
                </button>
                <button
                    type="button"
                    onClick={() => setShowTaper((v) => !v)}
                    title="Visual taper preview only - not a calculated draft angle"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                        showTaper
                            ? 'bg-amber-900/40 border-amber-600 text-amber-400'
                            : 'bg-slate-800/80 border-slate-600 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <span aria-hidden="true">{showTaper ? '◎' : '○'}</span>
                    <span>Taper Preview</span>
                </button>
            </div>

            <svg
                ref={svgRef}
                className="w-full h-full app-canvas"
                style={{ cursor, touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
            >
                <GridBackground width={dimensions.width} height={dimensions.height} scale={zoom} pan={pan} />

                <g transform={`translate(${dimensions.width / 2 + pan.x}, ${dimensions.height / 2 + pan.y}) scale(${zoom})`}>
                    <circle cx="0" cy="0" r="4" fill="#f59e0b" opacity="0.6" />

                    {/* Shrink allowance is shown at true scale; the same factor
                        goes into the export, so screen and file agree. */}
                    <g transform={`scale(${shrinkFactor})`}>
                        <ShapeRenderer
                            points={renderPoints}
                            path={path}
                            handles={handles}
                            onHandlePointerDown={onHandleDragStart}
                            showTaper={showTaper}
                        />
                    </g>
                </g>

                <text x="340" y="30" fill="#94a3b8" fontFamily="monospace" fontSize="12" className="app-chrome">
                    Zoom {zoom.toFixed(2)}x · Pan {Math.round(pan.x)},{Math.round(pan.y)} · shift-drag to pan · wheel to zoom · 1 grid square = 1 inch
                </text>
            </svg>

            {/* Hidden on screen, shown at true 1:1 when printing. */}
            <PrintSheet
                points={points}
                geometry={geometry}
                shrinkFactor={shrinkFactor}
            />
        </div>
    );
};

export default PatternWorkspace;
