import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import PoliciesPage from './pages/governance/PoliciesPage';
import AuditsPage from './pages/governance/AuditsPage';
import ReportsPage from './pages/governance/ReportsPage';

// Placeholders for other branch modules
function EnvironmentalSkeleton() {
  return (
    <div className="p-8 border border-dashed border-slate-900 rounded-3xl bg-slate-950 text-center space-y-4">
      <h2 className="text-2xl font-bold text-slate-200">Environmental & Core Module</h2>
      <p className="text-slate-400 max-w-md mx-auto text-sm">
        This module is currently being configured on the <code>feature/environment-core</code> branch by Piyusha Patel.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-905 border border-slate-900 text-xs text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Environment Skeletons Loading
      </div>
    </div>
  );
}

function SocialSkeleton() {
  return (
    <div className="p-8 border border-dashed border-slate-900 rounded-3xl bg-slate-950 text-center space-y-4">
      <h2 className="text-2xl font-bold text-slate-200">Social & Gamification Module</h2>
      <p className="text-slate-400 max-w-md mx-auto text-sm">
        This module is currently being configured on the <code>feature/social-gamification</code> branch by Member 2.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-905 border border-slate-900 text-xs text-blue-400">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        Social Skeletons Loading
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/environmental" element={<EnvironmentalSkeleton />} />
            <Route path="/social" element={<SocialSkeleton />} />
            <Route path="/governance/policies" element={<PoliciesPage />} />
            <Route path="/governance/audits" element={<AuditsPage />} />
            <Route path="/governance/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
