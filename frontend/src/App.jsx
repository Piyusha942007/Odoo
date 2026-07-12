import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import EnvironmentalOverview from './pages/environmental/EnvironmentalOverview';
import EmissionFactors from './pages/environmental/EmissionFactors';
import CarbonTransactions from './pages/environmental/CarbonTransactions';
import ProductEsgProfiles from './pages/environmental/ProductEsgProfiles';
import SustainabilityGoals from './pages/environmental/SustainabilityGoals';
import EsgDashboard from './pages/environmental/EsgDashboard';
import DepartmentTracking from './pages/environmental/DepartmentTracking';
import AutoEmissionSettings from './pages/environmental/AutoEmissionSettings';
import CategoriesPage from './pages/social/CategoriesPage';
import CsrActivities from './pages/social/CsrActivitiesPage';
import Challenges from './pages/Challenges';
import PoliciesPage from './pages/governance/PoliciesPage';
import AuditsPage from './pages/governance/AuditsPage';
import ReportsPage from './pages/governance/ReportsPage';
import NotificationsPage from './pages/governance/NotificationsPage';
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
          <Route path="environmental/emission-factors" element={<EmissionFactors />} />
          <Route path="environmental/carbon-transactions" element={<CarbonTransactions />} />
          <Route path="environmental/product-esg-profiles" element={<ProductEsgProfiles />} />
          <Route path="environmental/sustainability-goals" element={<SustainabilityGoals />} />
          <Route path="environmental/esg-dashboard" element={<EsgDashboard />} />
          <Route path="environmental/department-tracking" element={<DepartmentTracking />} />
          <Route path="environmental/auto-emission" element={<AutoEmissionSettings />} />
          {/* Social & Gamification Routes */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="csr" element={<CsrActivities />} />
          <Route path="challenges" element={<Challenges />} />

          {/* Governance & Reports Routes */}
          <Route path="governance/policies" element={<PoliciesPage />} />
          <Route path="governance/audits" element={<AuditsPage />} />
          <Route path="governance/reports" element={<ReportsPage />} />
          <Route path="governance/notifications" element={<NotificationsPage />} />

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
