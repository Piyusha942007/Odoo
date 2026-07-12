import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import favicon from '../assets/favicon.png';
import { 
  LayoutDashboard, 
  Building2, 
  Leaf, 
  Award, 
  Shield, 
  FileBarChart, 
  Settings,
  Menu,
  X,
  Folder,
  Calendar,
  Compass,
  ShieldCheck,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

function AppShell() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Departments', to: '/departments', icon: Building2 },
    { name: 'Environmental', to: '/environmental', icon: Leaf },
    { name: 'Category Master', to: '/categories', icon: Folder },
    { name: 'CSR Activities', to: '/csr', icon: Calendar },
    { name: 'Challenges', to: '/challenges', icon: Compass },
    { name: 'Policies', to: '/governance/policies', icon: ShieldCheck },
    { name: 'Audits & Issues', to: '/governance/audits', icon: ShieldAlert },
    { name: 'Reports Center', to: '/governance/reports', icon: BarChart3 },
    { name: 'Gov Score & Preferences', to: '/governance/notifications', icon: Shield },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <img src={favicon} alt="EcoSphere Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            EcoSphere
          </span>
        </div>
        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-2'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition duration-200" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src={favicon} alt="EcoSphere Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              EcoSphere
            </span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-2'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-200">
              System Console
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Piyusha Branch Active
            </div>
          </div>
        </header>

        {/* View Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
