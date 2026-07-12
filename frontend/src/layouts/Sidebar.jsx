import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Calendar, Folder } from 'lucide-react';

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Category Master', path: '/categories', icon: Folder },
    { name: 'CSR Activities', path: '/csr', icon: Calendar },
    { name: 'Challenges', path: '/challenges', icon: Compass },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between text-slate-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950 text-lg">
            E
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 tracking-wide text-lg">EcoSphere</h1>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Hour 1 Skeletons</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
        Hour 1 Foundation Loaded.
      </div>
    </aside>
  );
}

export default Sidebar;
