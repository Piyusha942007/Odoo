import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import favicon from '../assets/favicon.png';
import { 
  LayoutDashboard, 
  Building2, 
  Leaf, 
  Shield, 
  Settings,
  Menu,
  X,
  Folder,
  Calendar,
  Compass,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Bell,
  TrendingUp,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

// Page title map
const PAGE_TITLES = {
  '/': 'Dashboard',
  '/departments': 'Departments',
  '/environmental': 'Environmental',
  '/categories': 'Category Master',
  '/csr': 'CSR Activities',
  '/challenges': 'Challenges',
  '/governance/policies': 'Policies',
  '/governance/audits': 'Audits & Issues',
  '/governance/reports': 'Reports Center',
  '/governance/notifications': 'Gov Score & Preferences',
  '/settings': 'Settings',
};

// Live clock component
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden sm:flex flex-col items-end">
      <span className="text-xs font-extrabold text-slate-200 tabular-nums tracking-tight">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="text-[10px] font-medium text-slate-500">
        {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

function AppShell() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Refs to measure button positions for portal dropdowns
  const bellRef = useRef(null);
  const avatarRef = useRef(null);

  const location = useLocation();

  // Close menus on outside click
  useEffect(() => {
    function handler(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || 'EcoSphere';

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

  const notifications = [
    { id: 1, icon: '🌿', title: 'Carbon Goal On Track', desc: 'Engineering dept is 12% under Q3 budget', time: '2m ago', color: 'text-emerald-400' },
    { id: 2, icon: '⚡', title: 'Auto Emission Processed', desc: '6 new transactions generated from ERP feed', time: '18m ago', color: 'text-amber-400' },
    { id: 3, icon: '🏆', title: 'ESG Score Updated', desc: 'Overall org score recalculated to 72/100', time: '1h ago', color: 'text-indigo-400' },
  ];

  const NavLinks = ({ onClick }) => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          onClick={onClick}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-2'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`
          }
        >
          <item.icon className="w-5 h-5 shrink-0" />
          {item.name}
        </NavLink>
      ))}
    </>
  );

  // ── Portal dropdowns — rendered into document.body so no overflow/backdrop-filter clips them ──
  const NotifDropdown = notifOpen ? createPortal(
    <div
      style={{ position: 'fixed', top: '68px', right: '16px', zIndex: 99999 }}
      className="w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 animate-fade-in"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</span>
        <span className="text-[10px] px-2 py-0.5 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-full font-bold">
          {notifications.length} new
        </span>
      </div>
      <div className="divide-y divide-slate-800/60">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40 transition cursor-pointer">
            <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${n.color}`}>{n.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
            </div>
            <span className="text-[10px] text-slate-600 shrink-0 mt-0.5">{n.time}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-slate-800 text-center">
        <button className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition">
          View all activity →
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  const UserDropdown = userMenuOpen ? createPortal(
    <div
      style={{ position: 'fixed', top: '68px', right: '16px', zIndex: 99999 }}
      className="w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 animate-fade-in"
    >
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-xs font-bold text-slate-200">EcoSphere Admin</p>
        <p className="text-[10px] text-slate-500 mt-0.5">admin@ecosphere.io</p>
      </div>
      <div className="py-1.5">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition rounded-none">
          <User className="w-3.5 h-3.5" />
          Profile Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition rounded-none">
          <Settings className="w-3.5 h-3.5" />
          Preferences
        </button>
      </div>
      <div className="border-t border-slate-800 py-1.5">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition rounded-none">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <img src={favicon} alt="EcoSphere Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            EcoSphere
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        {/* Sidebar footer user card */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-slate-950">ES</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">EcoSphere Admin</p>
              <p className="text-[10px] text-slate-500 truncate">admin@ecosphere.io</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
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
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLinks onClick={() => setIsMobileOpen(false)} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ─── Top Navbar ─── */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 gap-4 z-30">

          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 md:hidden shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden md:block text-[10px] font-bold text-slate-600 uppercase tracking-widest shrink-0">EcoSphere</span>
              <span className="hidden md:block text-slate-700">/</span>
              <h1 className="text-sm font-bold text-slate-200 truncate">{pageTitle}</h1>
            </div>
          </div>

          {/* Right: clock, ESG chip, notifs, avatar */}
          <div className="flex items-center gap-2 shrink-0">

            <LiveClock />

            <div className="hidden sm:block w-px h-6 bg-slate-800" />

            {/* ESG Score chip */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-300">ESG</span>
              <span className="text-[11px] font-extrabold text-slate-100">72</span>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>

            {/* Notification Bell */}
            <div ref={bellRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                className="relative p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </button>
            </div>

            {/* User Avatar */}
            <div ref={avatarRef}>
              <button
                onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800 transition group"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-slate-950">ES</span>
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-300 group-hover:text-slate-100">Admin</span>
                <ChevronDown className={`hidden sm:block w-3 h-3 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

          </div>
        </header>

        {/* View Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* ── Portal Dropdowns (rendered into document.body — immune to all overflow/backdrop clipping) ── */}
      {NotifDropdown}
      {UserDropdown}

    </div>
  );
}

export default AppShell;
