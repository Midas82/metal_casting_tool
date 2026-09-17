import React from 'react';
import PatternWorkspace from './components/canvas/PatternWorkspace';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    // The `app-shell` class is a print hook: this wrapper's h-screen and
    // overflow-hidden would otherwise clip the 1:1 print sheet. See index.css.
    return (
        <div className="app-shell h-screen w-screen bg-slate-900 overflow-hidden">
            <ErrorBoundary>
                <PatternWorkspace />
            </ErrorBoundary>
        </div>
    );
}

export default App;
