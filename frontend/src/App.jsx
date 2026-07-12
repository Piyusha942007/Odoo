import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
      <div className="text-center space-y-4 font-sans">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          EcoSphere
        </h1>
        <p className="text-xl md:text-2xl font-medium text-slate-400">
          ESG Management Platform
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Foundation Initialized
        </div>
      </div>
    </div>
  );
}

export default App;
