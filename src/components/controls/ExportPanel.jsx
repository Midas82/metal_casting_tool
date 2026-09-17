import React from 'react';
import { downloadSVG } from '../../utils/exportHelpers';

const ExportPanel = ({ points, geometry, height, material, shrinkage, shrinkFactor, projectName }) => {
    const slug = (projectName || 'pattern').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

    const handleExport = () => {
        downloadSVG(points, geometry, {
            filename: `${slug || 'pattern'}_${geometry.shapeType.toLowerCase()}.svg`,
            shrinkFactor,
            material,
            shrinkageEnabled: shrinkage,
            height,
            projectName,
        });
    };

    return (
        <div className="p-4 rounded-lg border mt-auto mb-4" style={{ backgroundColor: '#334155', borderColor: '#475569' }}>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#f1f5f9' }}>
                Production
            </h3>

            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-colors border hover:brightness-110"
                    style={{ backgroundColor: '#475569', color: '#ffffff', borderColor: '#64748b' }}
                >
                    <span aria-hidden="true">💾</span> SVG
                </button>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-colors border hover:brightness-110"
                    style={{ backgroundColor: '#475569', color: '#ffffff', borderColor: '#64748b' }}
                >
                    <span aria-hidden="true">🖨️</span> Print
                </button>
            </div>
            <p className="text-[10px] mt-2 text-center leading-snug" style={{ color: '#94a3b8' }}>
                Both output at true 1:1. Print at 100% scale — no &quot;fit to page&quot;.
            </p>
        </div>
    );
};

export default ExportPanel;
