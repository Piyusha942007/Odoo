import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getLiveDashboard } from '../services/environmentalService';
import {
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  TrendingUp,
  TrendingDown,
  Leaf,
  Users,
  ShieldCheck,
  Factory,
  Target,
  Building2,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

// Animated radial score ring
function ScoreRing({ score, size = 120, strokeWidth = 10, color = '#6366f1', label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ - (circ * Math.min(score, 100)) / 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="transparent"
            stroke="#1e293b" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="transparent"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={filled}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-100">{score}</span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">pts</span>
        </div>
      </div>
      {label && <span className="text-xs font-bold text-slate-400">{label}</span>}
    </div>
  );
}

function Dashboard() {
  const [health, setHealth] = useState({ api: 'checking', db: 'checking' });
  const [healthLoading, setHealthLoading] = useState(false);
  const [esg, setEsg] = useState(null);
  const [esgLoading, setEsgLoading] = useState(true);

  const checkSystemHealth = async () => {
    setHealthLoading(true);
    setHealth({ api: 'checking', db: 'checking' });
    try {
      const response = await api.get('/health');
      if (response.data?.success) {
        setHealth({
          api: 'online',
          db: response.data.database === 'Connected' ? 'online' : 'offline'
        });
      } else {
        setHealth({ api: 'online', db: 'offline' });
      }
    } catch {
      setHealth({ api: 'offline', db: 'offline' });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    getLiveDashboard()
      .then(res => { if (res.success) setEsg(res.data); })
      .catch(() => {})
      .finally(() => setEsgLoading(false));
  }, []);

  const fmt = (n) => (n || 0).toLocaleString();
  const fmtTons = (kg) => ((kg || 0) / 1000).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ESG Command Center</h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">
            Real-time oversight across Environmental, Social, and Governance metrics.
          </p>
        </div>
        <button
          onClick={checkSystemHealth}
          disabled={healthLoading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Overall ESG Score Hero ───────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-500 opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-emerald-500 opacity-5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
          {/* Overall ring */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <ScoreRing
              score={esgLoading ? 0 : (esg?.overallESGScore || 0)}
              size={160}
              strokeWidth={14}
              color="#6366f1"
            />
            <div className="text-center">
              <div className="text-sm font-bold text-slate-300">Overall ESG Index</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {esgLoading ? 'Calculating...' : (
                  (esg?.overallESGScore || 0) >= 80 ? '🏅 Gold Attainment'
                  : (esg?.overallESGScore || 0) >= 60 ? '🥈 Silver Attainment'
                  : '🥉 Bronze Attainment'
                )}
              </div>
            </div>
          </div>

          {/* E / S / G breakdown rings */}
          <div className="flex flex-wrap justify-center gap-8">
            <ScoreRing score={esgLoading ? 0 : (esg?.environmentalScore || 0)} size={110} strokeWidth={10} color="#10b981" label="Environmental" />
            <ScoreRing score={esgLoading ? 0 : (esg?.socialScore || 0)}        size={110} strokeWidth={10} color="#06b6d4" label="Social" />
            <ScoreRing score={esgLoading ? 0 : (esg?.governanceScore || 0)}    size={110} strokeWidth={10} color="#8b5cf6" label="Governance" />
          </div>

          {/* Quick KPI tiles */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              { label: 'Total CO₂e',      value: esgLoading ? '—' : `${fmtTons(esg?.totalEmission)} t`,   icon: Factory,   color: 'text-emerald-400', sub: 'Metric tons equivalent' },
              { label: 'Active Goals',     value: esgLoading ? '—' : fmt(esg?.activeGoals),                icon: Target,    color: 'text-cyan-400',    sub: 'Sustainability targets' },
              { label: 'Departments',      value: esgLoading ? '—' : fmt(esg?.departmentCount),            icon: Building2, color: 'text-indigo-400',  sub: 'Tracked org units' },
              { label: 'Carbon Reduction', value: esgLoading ? '—' : `${fmtTons(esg?.carbonReduction)} t`, icon: Leaf,      color: 'text-teal-400',    sub: 'Vs. baseline targets' },
            ].map(k => (
              <div key={k.label} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                </div>
                <div className="text-xl font-extrabold text-slate-100">{k.value}</div>
                <div className="text-[10px] text-slate-600 font-medium">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ESG Scoring shortcut */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Scores are computed from live Carbon Transactions &amp; Sustainability Goals
          </div>
          <div className="flex gap-3">
            <Link to="/environmental/esg-dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-500/20 transition">
              <Award className="w-3.5 h-3.5" /> ESG Scoring Panel <ChevronRight className="w-3 h-3" />
            </Link>
            <Link to="/environmental/department-tracking"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition">
              <Leaf className="w-3.5 h-3.5" /> Carbon Tracking <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Top Emitters + Goal Attainment ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 5 Emitters Horizontal Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Factory className="w-5 h-5 text-rose-400" />
              Top Emission Sources
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Departments ranked by total CO₂e output</p>
          </div>
          <div className="space-y-3 pt-1">
            {esgLoading ? (
              <div className="text-xs text-slate-500 animate-pulse py-4 text-center">Loading emitters data...</div>
            ) : (esg?.topEmitters || []).length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No carbon transaction data yet.</div>
            ) : (() => {
              const max = Math.max(...(esg?.topEmitters || []).map(e => e.value), 1);
              return (esg?.topEmitters || []).map((e, i) => {
                const pct = Math.round((e.value / max) * 100);
                const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500'];
                return (
                  <div key={e.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-slate-800 text-slate-400">
                          {i + 1}
                        </span>
                        {e.name}
                      </span>
                      <span className="text-slate-400 font-mono">{(e.value / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[i]} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Goal Attainment Progress Bars */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-400" />
              Goal Attainment — Emission Budget Used
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Actual vs target cap per sustainability goal (100% = at limit)</p>
          </div>
          <div className="space-y-4 pt-1">
            {esgLoading ? (
              <div className="text-xs text-slate-500 animate-pulse py-4 text-center">Loading goal data...</div>
            ) : (esg?.goalAttainment || []).length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No sustainability goals configured yet.</div>
            ) : (esg?.goalAttainment || []).map((g, i) => {
              const pct = Math.min(g.percentage, 100);
              const over = g.percentage > 100;
              const barColor = g.status === 'achieved' ? 'bg-emerald-500' : 'bg-rose-500';
              const badge = g.status === 'achieved'
                ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Achieved ✅</span>
                : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">At Risk ⚠️</span>;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-200 leading-tight">{g.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{g.department}</div>
                    </div>
                    {badge}
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Actual: {g.actualValue.toLocaleString()} kg</span>
                    <span className={over ? 'text-rose-400 font-bold' : ''}>
                      {g.percentage}% of {g.targetValue.toLocaleString()} kg cap
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── API / DB Health ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            label: 'API Connection', title: 'Express.js Health',
            icon: Server, iconColor: 'text-emerald-400',
            status: health.api,
            msgs: { checking: 'Verifying API Connection...', online: 'API Online & Healthy', offline: 'API Connection Failed' },
            colors: { checking: 'text-slate-400', online: 'text-emerald-400', offline: 'text-rose-500' }
          },
          {
            label: 'Database Connection', title: 'MongoDB Mongoose',
            icon: Database, iconColor: 'text-teal-400',
            status: health.db,
            msgs: { checking: 'Pinging Database...', online: 'MongoDB Connected', offline: 'Database Offline' },
            colors: { checking: 'text-slate-400', online: 'text-teal-400', offline: 'text-rose-500' }
          }
        ].map(c => (
          <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.label}</span>
                <h3 className="text-xl font-bold text-slate-200">{c.title}</h3>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <c.icon className={`w-6 h-6 ${c.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.status === 'checking' && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />}
              {c.status === 'online'   && <CheckCircle2 className={`w-5 h-5 ${c.colors.online}`} />}
              {c.status === 'offline'  && <AlertTriangle className={`w-5 h-5 ${c.colors.offline}`} />}
              <span className={`text-sm font-semibold ${c.colors[c.status]}`}>{c.msgs[c.status]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Teammate Module Banners ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-200">Governance & Compliance</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Manage corporate environmental policies, track active compliance audits/issues, and generate auditable compliance disclosure packages from the navigation sidebar.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-200">Social & Gamification</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Define corporate social responsibility (CSR) activities, run employee sustainability challenges, and gamify rewards programs to drive corporate environmental engagement.
          </p>
        </div>
      </div>

      {/* ── System Config Status ─────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200">Local Configuration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm font-medium">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Frontend Environment Status</span>
            <span className="text-slate-200 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              {import.meta.env.VITE_API_URL ? 'Loaded (.env)' : 'Default (Local)'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Target Gateway URL</span>
            <code className="text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] md:text-xs">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </code>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
