import React from 'react';
import PatternWorkspace from './components/canvas/PatternWorkspace';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <div className="h-screen w-screen bg-slate-900 overflow-hidden">
            <ErrorBoundary>
                <PatternWorkspace />
            </ErrorBoundary>
        </div>
    );
}

export default App;
