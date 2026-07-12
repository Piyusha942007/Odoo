import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Target, 
  ClipboardList, 
  Factory, 
  Zap, 
  Recycle, 
  ChevronRight, 
  Hash, 
  Cpu, 
  FileBarChart, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Award,
  AlertCircle,
  Building2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { getLiveDashboard } from '../../services/environmentalService';

function EnvironmentalOverview() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getLiveDashboard();
        if (res.success) {
          setDashboard(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch live dashboard:', err);
        setError('Failed to fetch carbon overview statistics. Ensure API server is online.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400 font-semibold animate-pulse">
        Loading environmental intelligence overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl flex items-start gap-4 shadow-xl">
        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Dashboard Error</h4>
          <p className="text-sm text-rose-450">{error}</p>
        </div>
      </div>
    );
  }

  const {
    overallESGScore = 0,
    environmentalScore = 0,
    socialScore = 0,
    governanceScore = 0,
    totalEmission = 0,
    carbonReduction = 0,
    activeGoals = 0,
    departmentCount = 0,
    distributionData = [],
    trendData = []
  } = dashboard || {};

  // Formatted scopes in Metric Tons (tCO2e)
  const getScopeVal = (scopeIdx) => {
    const item = distributionData[scopeIdx];
    return item ? `${(item.value / 1000).toFixed(2)} t` : '0 t';
  };

  const kpis = [
    {
      title: 'Total CO₂e Emissions',
      value: `${(totalEmission / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t`,
      subText: 'Total aggregated greenhouse weight',
      icon: Leaf,
      color: 'from-emerald-500 to-teal-500',
      accentColor: 'border-emerald-500/30'
    },
    {
      title: 'Scope 1 (Direct)',
      value: getScopeVal(0),
      subText: 'Manufacturing & Fleet fuels',
      icon: Factory,
      color: 'from-cyan-500 to-blue-500',
      accentColor: 'border-cyan-500/30'
    },
    {
      title: 'Scope 2 (Indirect)',
      value: getScopeVal(1),
      subText: 'Purchased utilities (Electricity)',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      accentColor: 'border-purple-500/30'
    },
    {
      title: 'Scope 3 (Value Chain)',
      value: getScopeVal(2),
      subText: 'Purchase items & supplies',
      icon: Recycle,
      color: 'from-teal-500 to-emerald-500',
      accentColor: 'border-teal-500/30'
    }
  ];

  // Format trend data values to Metric Tons (tCO2e) for chart readability
  const chartTrendData = trendData.map(t => ({
    name: t.name,
    'Scope 1': parseFloat((t['Scope 1'] / 1000).toFixed(3)),
    'Scope 2': parseFloat((t['Scope 2'] / 1000).toFixed(3)),
    'Scope 3': parseFloat((t['Scope 3'] / 1000).toFixed(3))
  }));

  // Format donut values to Tons
  const chartDonutData = distributionData.map(d => ({
    name: d.name,
    value: parseFloat((d.value / 1000).toFixed(2)),
    color: d.color
  }));

  const totalTons = parseFloat((totalEmission / 1000).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      
      {/* Enterprise Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-emerald-500 opacity-5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl shadow-inner">
            <Leaf className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Environmental Intelligence</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Track live emissions parameters, goal compliances, and weights calculations.</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                to="/environmental/esg-dashboard"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 hover:border-indigo-400/50 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-indigo-500/10 hover:shadow-md"
              >
                <span className="p-1 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                  <Award className="w-3 h-3 text-indigo-300" />
                </span>
                <span className="text-[11px] font-semibold text-indigo-300 group-hover:text-indigo-200 whitespace-nowrap">ESG Scoring</span>
                <svg className="w-3 h-3 text-indigo-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>

              <Link
                to="/environmental/department-tracking"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-cyan-500/10 hover:shadow-md"
              >
                <span className="p-1 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                  <Building2 className="w-3 h-3 text-cyan-300" />
                </span>
                <span className="text-[11px] font-semibold text-cyan-300 group-hover:text-cyan-200 whitespace-nowrap">Dept. Tracking</span>
                <svg className="w-3 h-3 text-cyan-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>

              <Link
                to="/environmental/product-esg-profiles"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-emerald-500/10 hover:shadow-md"
              >
                <span className="p-1 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                  <Tag className="w-3 h-3 text-emerald-300" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-300 group-hover:text-emerald-200 whitespace-nowrap">Product ESG</span>
                <svg className="w-3 h-3 text-emerald-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>

              <Link
                to="/environmental/auto-emission"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-400/50 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-amber-500/10 hover:shadow-md"
              >
                <span className="p-1 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                  <Zap className="w-3 h-3 text-amber-300" />
                </span>
                <span className="text-[11px] font-semibold text-amber-300 group-hover:text-amber-200 whitespace-nowrap">Auto Emission</span>
                <svg className="w-3 h-3 text-amber-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* ESG Average Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-indigo-950 text-xs font-bold text-indigo-400">
            <Award className="w-4 h-4 text-indigo-400" />
            Overall ESG Score: {overallESGScore}
          </div>
          {/* Live Data Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div 
            key={kpi.title}
            className={`relative overflow-hidden rounded-2xl border ${kpi.accentColor} bg-slate-900 p-6 shadow-xl hover:border-slate-700 transition duration-300 group`}
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-tr ${kpi.color} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{kpi.title}</span>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 shadow-md">
                <kpi.icon size={18} />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <span className="text-2xl font-extrabold text-slate-100 tracking-tight">{kpi.value}</span>
              <p className="text-[11px] text-slate-500 font-medium">{kpi.subText}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Visualization Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Stacked Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-200">Emissions Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly CO₂e output in metric tons (tCO₂e) by regulatory scope</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Scope 1
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Scope 2
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Scope 3
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value) => [`${value} tCO₂e`]}
                />
                <Area type="monotone" dataKey="Scope 1" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorScope1)" stackId="1" />
                <Area type="monotone" dataKey="Scope 2" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorScope2)" stackId="1" />
                <Area type="monotone" dataKey="Scope 3" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorScope3)" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scope Distribution Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200">Emissions Distribution</h3>
            <p className="text-xs text-slate-500 font-medium">Breakdown of total carbon footprint by Scope classification</p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-100">{totalTons.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">tCO₂e Total</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} tCO₂e`]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-semibold pt-2">
            {chartDonutData.map((scope) => (
              <div key={scope.name} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-850/50">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: scope.color }} />
                  {scope.name}
                </span>
                <span className="text-slate-200">{scope.value.toLocaleString()} tCO₂e</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emission Factors Card */}
        <Link 
          to="/environmental/emission-factors"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-emerald-500/30 hover:bg-slate-850/20 transition duration-300 shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 group-hover:border-emerald-500/20 transition">
                <Hash className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Active
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-emerald-400 transition">Emission Factors</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Configure greenhouse gas conversion coefficients mapped by fuel types and supply categories.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-500">Master Registry</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 group-hover:underline">
              Manage Factors
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Carbon Transactions Card */}
        <Link 
          to="/environmental/carbon-transactions"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-cyan-500/30 hover:bg-slate-850/20 transition duration-300 shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 group-hover:border-cyan-500/20 transition">
                <ClipboardList className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                Active
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition">Carbon Transactions</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Log and record consumption metrics against departments to calculate authoritative carbon equivalent weight.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-500">Live Ledgers</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-cyan-400 group-hover:underline">
              Manage Ledger
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Sustainability Goals Card */}
        <Link 
          to="/environmental/sustainability-goals"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-teal-500/30 hover:bg-slate-850/20 transition duration-300 shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 group-hover:border-teal-500/20 transition">
                <Target className="w-6 h-6 text-teal-400" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/25">
                Active
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-teal-400 transition">Sustainability Goals</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Define department emissions budget caps and trace real-time compliance percentages.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-500">{activeGoals} Active Targets</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-400 group-hover:underline">
              Manage Targets
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>

      {/* ── Top Emitters + Goal Attainment ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top 5 Emitting Departments */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Factory className="w-5 h-5 text-rose-400" />
              Top Emission Sources
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Departments ranked by total CO₂e output (all periods)
            </p>
          </div>

          <div className="space-y-3">
            {(() => {
              const emitters = dashboard?.topEmitters || [];
              if (emitters.length === 0) {
                return (
                  <div className="text-xs text-slate-500 py-6 text-center font-medium">
                    No carbon transactions recorded yet.
                  </div>
                );
              }
              const max = Math.max(...emitters.map(e => e.value), 1);
              const barColors = [
                'from-rose-500 to-rose-400',
                'from-orange-500 to-amber-400',
                'from-amber-500 to-yellow-400',
                'from-yellow-500 to-lime-400',
                'from-lime-500 to-green-400'
              ];
              return emitters.map((e, i) => (
                <div key={e.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold bg-slate-800 text-slate-400 shrink-0">
                        {i + 1}
                      </span>
                      {e.name}
                    </span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {(e.value / 1000).toFixed(2)} tCO₂e
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${barColors[i]} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.round((e.value / max) * 100)}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Goal Attainment Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-400" />
              Goal Attainment — Emission Budget Used
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Actual emissions as % of each goal's target cap (100% = at limit)
            </p>
          </div>

          <div className="space-y-5">
            {(() => {
              const goals = dashboard?.goalAttainment || [];
              if (goals.length === 0) {
                return (
                  <div className="text-xs text-slate-500 py-6 text-center font-medium">
                    No sustainability goals configured yet.
                  </div>
                );
              }
              return goals.map((g, i) => {
                const pct    = Math.min(g.percentage, 100);
                const isOver = g.percentage > 100;
                const achieved = g.status === 'achieved';
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{g.title}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{g.department}</div>
                      </div>
                      {achieved
                        ? <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">Achieved ✅</span>
                        : <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">At Risk ⚠️</span>
                      }
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${achieved ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                      {/* 100% marker */}
                      <div className="absolute top-0 bottom-0 w-px bg-slate-600" style={{ left: '100%', transform: 'translateX(-1px)' }} />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Actual: {g.actualValue.toLocaleString()} kg</span>
                      <span className={isOver ? 'text-rose-400 font-bold' : ''}>
                        {g.percentage}% of {g.targetValue.toLocaleString()} kg cap
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

      {/* Carbon Accounting Methodology Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-200">Carbon Accounting Methodology</h3>
          <p className="text-sm text-slate-400 font-medium">How EcoSphere converts business activities into verifiable compliance reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 pt-2">
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Business Activity</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Fuel, electricity, expense ledger data.</p>
            </div>
          </div>

          <div className="md:col-span-1 flex justify-center text-slate-600">
            <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto border border-cyan-500/20">
              <Hash className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Emission Factor</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Map metrics to specific CO₂e coefficients.</p>
            </div>
          </div>

          <div className="md:col-span-1 flex justify-center text-slate-600">
            <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto border border-teal-500/20">
              <Cpu className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">CO₂e Calculation</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Rollup Scopes 1, 2 & 3 equivalent weight.</p>
            </div>
          </div>

          <div className="md:col-span-1 flex justify-center text-slate-600">
            <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto border border-purple-500/20">
              <FileBarChart className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">ESG Report</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Export disclosure logs & audit ledgers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentalOverview;
