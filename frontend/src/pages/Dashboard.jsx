import React from 'react';
import { LayoutDashboard } from 'lucide-react';

function Dashboard() {
  return (
    <div className="flex-grow bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="text-center max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <LayoutDashboard className="w-12 h-12 text-emerald-450 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">EcoSphere Social & Gamification</h2>
        <p className="text-sm text-slate-400">
          This dashboard skeleton represents the Hour 1 status of feature/social-gamification. Category foundations are loaded under the Category Master link.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
