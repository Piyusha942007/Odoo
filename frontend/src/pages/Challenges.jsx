import React from 'react';
import { Compass } from 'lucide-react';

function Challenges() {
  return (
    <div className="flex-grow bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="text-center max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <Compass className="w-12 h-12 text-emerald-450 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Gamification Challenges Skeleton</h2>
        <p className="text-sm text-slate-400">
          This is the Gamification Challenges page skeleton. Hour 4 will implement the Challenges lifecycle (Draft to Active to Completed).
        </p>
      </div>
    </div>
  );
}

export default Challenges;
