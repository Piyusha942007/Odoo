import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import EnvironmentalOverview from './pages/environmental/EnvironmentalOverview';
import CategoriesPage from './pages/social/CategoriesPage';
import CsrActivities from './pages/social/CsrActivitiesPage';
import Challenges from './pages/Challenges';
import PoliciesPage from './pages/governance/PoliciesPage';
import AuditsPage from './pages/governance/AuditsPage';
import ReportsPage from './pages/governance/ReportsPage';
import PlaceholderModule from './pages/PlaceholderModule';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {/* Main Module Routes */}
          <Route index element={<Dashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="environmental" element={<EnvironmentalOverview />} />
          
          {/* Khushi's Social & Gamification Routes */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="csr" element={<CsrActivities />} />
          <Route path="challenges" element={<Challenges />} />

          {/* Anvi's Governance & Reports Routes */}
          <Route path="governance/policies" element={<PoliciesPage />} />
          <Route path="governance/audits" element={<AuditsPage />} />
          <Route path="governance/reports" element={<ReportsPage />} />

          {/* Skeletons/Placeholders for other feature tracks to minimize merge conflicts */}
          <Route path="settings" element={<PlaceholderModule />} />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
