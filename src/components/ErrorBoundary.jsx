import React from 'react';

/**
 * Last line of defence. Without this, a single render throw left a blank
 * screen with no way to recover short of clearing site data by hand.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Pattern Suite crashed:', error, info);
    }

    handleReset = () => {
        try {
            Object.keys(localStorage)
                .filter((k) => k.startsWith('midas_'))
                .forEach((k) => localStorage.removeItem(k));
        } catch { /* storage unavailable */ }
        window.location.reload();
    };

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div className="h-full w-full flex items-center justify-center p-8" style={{ backgroundColor: '#0f172a' }}>
                <div className="max-w-md text-center">
                    <h1 className="text-lg font-bold mb-2" style={{ color: '#f87171' }}>
                        The pattern workspace hit an error
                    </h1>
                    <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
                        Your saved patterns are still stored locally. If this keeps happening, a
                        saved project may be corrupt — resetting clears them and reloads.
                    </p>
                    <pre
                        className="text-[10px] text-left p-2 rounded mb-4 overflow-auto max-h-32"
                        style={{ backgroundColor: '#1e293b', color: '#cbd5e1' }}
                    >
                        {String(this.state.error?.message || this.state.error)}
                    </pre>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-3 py-2 rounded text-xs border border-slate-600 text-slate-200 hover:bg-slate-800"
                        >
                            Reload
                        </button>
                        <button
                            type="button"
                            onClick={this.handleReset}
                            className="px-3 py-2 rounded text-xs border border-red-800 text-red-300 hover:bg-red-900/30"
                        >
                            Reset saved data
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
