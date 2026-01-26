import React, { useState, useRef, useEffect } from 'react';
import GridBackground from './GridBackground';
import ShapeRenderer from './ShapeRenderer';
import Sidebar from '../../layout/Sidebar';
import usePatternGeometry from '../../hooks/usePatternGeometry';
import { pixelsToInches, validateConstraints } from '../../utils/unitConversion';

const PatternWorkspace = () => {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);

    // 'outer' | 'inner' | null
    const [activeDragHandle, setActiveDragHandle] = useState(null);

    const lastMousePos = useRef({ x: 0, y: 0 });

    // -- State Initialization with Local Storage --

    // Geometry State
    const [geometry, setGeometry] = useState(() => {
        const saved = localStorage.getItem('midas_pattern_geometry');
        const defaultGeo = {
            shapeType: 'STAR',
            numPoints: 5,
            outerRadius: 6.0, // 6 inches
            innerRadius: 3.5, // 3.5 inches
            holeDiameter: 0,
            width: 4.0,
            length: 6.0
        };
        return saved ? { ...defaultGeo, ...JSON.parse(saved) } : defaultGeo;
    });

    // Casting Properties
    const [height, setHeight] = useState(() => {
        const saved = localStorage.getItem('midas_pattern_height');
        return saved ? parseFloat(saved) : 1.0;
    });

    const [shrinkage, setShrinkage] = useState(() => {
        const saved = localStorage.getItem('midas_pattern_shrinkage');
        return saved === 'true';
    });

    // New: Draft Angle Visibility
    const [showDraft, setShowDraft] = useState(false);

    // -- Persistence Effects --
    useEffect(() => {
        localStorage.setItem('midas_pattern_geometry', JSON.stringify(geometry));
    }, [geometry]);

    useEffect(() => {
        localStorage.setItem('midas_pattern_height', height.toString());
    }, [height]);

    useEffect(() => {
        localStorage.setItem('midas_pattern_shrinkage', shrinkage.toString());
    }, [shrinkage]);

    // Calculate Points Hook
    const { points, renderPoints, path } = usePatternGeometry(geometry);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // -- Interaction Logic --

    const handleMouseDown = (e) => {
        // Middle mouse button or Space key held start Pan
        if (e.button === 1 || e.shiftKey) {
            setIsPanning(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        }
    };

    const onHandleDragStart = (type) => {
        setActiveDragHandle(type);
    };

    const handleMouseMove = (e) => {
        // Handle Panning
        if (isPanning) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;

            setPan(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));

            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        // Handle Radius Resizing
        if (activeDragHandle) {
            const screenCenterX = dimensions.width / 2 + pan.x;
            const screenCenterY = dimensions.height / 2 + pan.y;

            const deltaX = (e.clientX - screenCenterX) / zoom;
            const deltaY = (e.clientY - screenCenterY) / zoom;

            // Euclidean distance in screen pixels
            const radiusPixels = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Convert to Inches
            let newRadiusInches = pixelsToInches(radiusPixels);

            // Validation
            newRadiusInches = validateConstraints('DIAMETER', newRadiusInches * 2) / 2;

            setGeometry(prev => ({
                ...prev,
                [activeDragHandle === 'outer' ? 'outerRadius' : 'innerRadius']: parseFloat(newRadiusInches.toFixed(3))
            }));
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setActiveDragHandle(null);
    };

    // Zoom with wheel
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomSensitivity = 0.001;
            const newZoom = Math.max(0.1, Math.min(5, zoom - e.deltaY * zoomSensitivity));
            setZoom(newZoom);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900 select-none">
            {/* Pass geometry state and setter to Sidebar */}
            <Sidebar
                geometryValues={geometry}
                onGeometryChange={setGeometry}
                height={height}
                setHeight={setHeight}
                shrinkage={shrinkage}
                setShrinkage={setShrinkage}
                points={points}
            />

            {/* Draft Toggle Overlay */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setShowDraft(!showDraft)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${showDraft
                        ? "bg-amber-900/40 border-amber-600 text-amber-400"
                        : "bg-slate-800/80 border-slate-600 text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <span>{showDraft ? '👁' : 'Ø'}</span>
                    <span>Draft Preview</span>
                </button>
            </div>

            {/* Main Visual Canvas */}
            <svg
                className={`w-full h-full cursor-${isPanning ? 'grabbing' : activeDragHandle ? 'crosshair' : 'default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Background Grid */}
                <GridBackground
                    width={dimensions.width}
                    height={dimensions.height}
                    scale={zoom}
                    pan={pan}
                />

                {/* Workspace Content Group */}
                {/* Transform origin is center screen + pan */}
                <g
                    transform={`translate(${dimensions.width / 2 + pan.x}, ${dimensions.height / 2 + pan.y}) scale(${zoom})`}
                >
                    {/* Center Marker */}
                    <circle cx="0" cy="0" r="5" fill="#f59e0b" opacity="0.5" />

                    {/* Casting Pattern Layer */}
                    {/* If Shrinkage is ON, we scale the VISUALS by 1.015, but the underlying data (and stats) remain based on the desired dimensions */}
                    <g transform={shrinkage ? "scale(1.015)" : "scale(1)"} className="transition-transform duration-300">
                        <ShapeRenderer
                            points={renderPoints}
                            path={path}
                            holeDiameter={geometry.holeDiameter}
                            onHandleMouseDown={onHandleDragStart}
                            showDraft={showDraft}
                        />
                    </g>

                </g>

                {/* Helper Text */}
                <text x="340" y="30" fill="#94a3b8" fontFamily="monospace" fontSize="12">
                    Zoom: {zoom.toFixed(2)}x | Pan: {Math.round(pan.x)}, {Math.round(pan.y)} | Drag points to resize
                </text>
            </svg>
        </div>
    );
};

export default PatternWorkspace;
