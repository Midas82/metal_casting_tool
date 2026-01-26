import React from 'react';
import { downloadSVG } from '../../utils/exportHelpers';

const ExportPanel = ({ points, geometry }) => {
    const handleExport = () => {
        downloadSVG(points, geometry, `pattern_${geometry.shapeType.toLowerCase()}.svg`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 rounded-lg border mt-auto mb-4" style={{ backgroundColor: '#334155', borderColor: '#475569' }}>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#f1f5f9' }}>Production</h3>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-colors border"
                    style={{ backgroundColor: '#475569', color: '#ffffff', borderColor: '#64748b' }}
                >
                    <span>💾</span> SVG
                </button>

                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm transition-colors border"
                    style={{ backgroundColor: '#475569', color: '#ffffff', borderColor: '#64748b' }}
                >
                    <span>🖨️</span> Print
                </button>
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: '#94a3b8' }}>
                Printing will use high-contrast outline mode.
            </p>
        </div>
    );
};

export default ExportPanel;
