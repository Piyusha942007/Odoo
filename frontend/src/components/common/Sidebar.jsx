import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  BarChart3, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Environmental', to: '/environmental', icon: Leaf },
    { name: 'Social & CSR', to: '/social', icon: Users },
    { name: 'Policies', to: '/governance/policies', icon: ShieldCheck },
    { name: 'Audits & Issues', to: '/governance/audits', icon: ShieldAlert },
    { name: 'Reports Center', to: '/governance/reports', icon: BarChart3 }
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 backdrop-blur-md hover:bg-slate-800 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 
        bg-slate-950/80 border-r border-slate-900 backdrop-blur-xl
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">EcoSphere</h1>
              <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">ESG PLATFORM</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Core Modules
            </span>
            <div className="space-y-1">
              {navigation.slice(0, 3).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 shadow-inner font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Governance & Compliance
            </span>
            <div className="space-y-1">
              {navigation.slice(3).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 shadow-inner font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              G
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">Governance Admin</p>
              <p className="text-[10px] text-slate-500 truncate">gov.admin@ecosphere.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
