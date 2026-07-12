import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import CsrActivities from './pages/CsrActivities';
import Challenges from './pages/Challenges';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Primary Page Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/csr" element={<CsrActivities />} />
            <Route path="/challenges" element={<Challenges />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
