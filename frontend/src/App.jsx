import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import EnvironmentalOverview from './pages/environmental/EnvironmentalOverview';
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
          
          {/* Skeletons/Placeholders for other feature tracks to minimize merge conflicts */}
          <Route path="social" element={<PlaceholderModule />} />
          <Route path="governance" element={<PlaceholderModule />} />
          <Route path="reports" element={<PlaceholderModule />} />
          <Route path="settings" element={<PlaceholderModule />} />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
