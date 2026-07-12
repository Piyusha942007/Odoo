import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

function EnvironmentalOverview() {
  // Mock trend data
  const trendData = [
    { name: 'Jan', 'Scope 1': 120, 'Scope 2': 80, 'Scope 3': 210 },
    { name: 'Feb', 'Scope 1': 110, 'Scope 2': 75, 'Scope 3': 200 },
    { name: 'Mar', 'Scope 1': 115, 'Scope 2': 85, 'Scope 3': 220 },
    { name: 'Apr', 'Scope 1': 100, 'Scope 2': 70, 'Scope 3': 190 },
    { name: 'May', 'Scope 1': 95, 'Scope 2': 65, 'Scope 3': 185 },
    { name: 'Jun', 'Scope 1': 90, 'Scope 2': 60, 'Scope 3': 170 },
  ];

  // Mock distribution data matching KPI values
  const distributionData = [
    { name: 'Scope 1 (Direct)', value: 1250, color: '#06b6d4' },
    { name: 'Scope 2 (Indirect)', value: 850, color: '#8b5cf6' },
    { name: 'Scope 3 (Value Chain)', value: 2720, color: '#10b981' },
  ];

  const kpis = [
    {
      title: 'Total CO₂e',
      value: '4,820 tCO₂e',
      change: '-8.4%',
      trendType: 'decrease',
      timeframe: 'vs last year',
      icon: Leaf,
      color: 'from-emerald-500 to-teal-500',
      accentColor: 'border-emerald-500/30'
    },
    {
      title: 'Scope 1 (Direct)',
      value: '1,250 tCO₂e',
      change: '-12.1%',
      trendType: 'decrease',
      timeframe: 'vs last year',
      icon: Factory,
      color: 'from-cyan-500 to-blue-500',
      accentColor: 'border-cyan-500/30'
    },
    {
      title: 'Scope 2 (Indirect)',
      value: '850 tCO₂e',
      change: '+1.8%',
      trendType: 'increase',
      timeframe: 'vs last year',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      accentColor: 'border-purple-500/30'
    },
    {
      title: 'Scope 3 (Value Chain)',
      value: '2,720 tCO₂e',
      change: '-5.3%',
      trendType: 'decrease',
      timeframe: 'vs last year',
      icon: Recycle,
      color: 'from-teal-500 to-emerald-500',
      accentColor: 'border-teal-500/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Enterprise Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-emerald-500 opacity-5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl shadow-inner">
            <Leaf className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Environmental Intelligence</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Track emissions, carbon performance, and sustainability targets.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Last Updated Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Last Updated: 2 mins ago
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
            {/* Soft decorative background glow */}
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-tr ${kpi.color} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{kpi.title}</span>
              <div className={`p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 shadow-md`}>
                <kpi.icon size={18} />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <span className="text-2xl font-bold text-slate-100 tracking-tight">{kpi.value}</span>
              <div className="flex items-center gap-1 text-xs font-medium">
                {kpi.trendType === 'decrease' ? (
                  <>
                    <ArrowDownRight size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold">{kpi.change}</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={14} className="text-amber-500" />
                    <span className="text-amber-500 font-bold">{kpi.change}</span>
                  </>
                )}
                <span className="text-slate-500">{kpi.timeframe}</span>
              </div>
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
              <p className="text-xs text-slate-500 font-medium">Monthly CO₂e output in metric tons (tCO₂e) by Scope</p>
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
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <p className="text-xs text-slate-500 font-medium">Breakdown of total carbon footprint by regulatory scope</p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            {/* Absolute Centered Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-100">4,820</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">tCO₂e Total</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} tCO₂e`, 'Value']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs font-semibold pt-2">
            {distributionData.map((scope) => (
              <div key={scope.name} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-850/50">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: scope.color }} />
                  {scope.name}
                </span>
                <span className="text-slate-200">{scope.value} tCO₂e</span>
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
                Configure and manage greenhouse gas conversion factors (CO₂e) mapped by resource category and fuel sources.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-500">24 Active Factors</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 group-hover:underline">
              Manage Factors
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Carbon Transactions Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-cyan-500/30 hover:bg-slate-850/20 transition duration-300 shadow-xl flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 group-hover:border-cyan-500/20 transition">
                <ClipboardList className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                Configuration Ready
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition">Carbon Transactions</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Record and verify carbon offsets, direct fuel consumption, and value chain usage across departments.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-500">No Transactions Yet</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Sustainability Goals Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-teal-500/30 hover:bg-slate-850/20 transition duration-300 shadow-xl flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 group-hover:border-teal-500/20 transition">
                <Target className="w-6 h-6 text-teal-400" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/25">
                Ready
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-teal-400 transition">Sustainability Goals</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Define and audit organizational reduction objectives, net zero pathways, and compliance deadlines.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-500">No Goals Created</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Visual Workflow Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-200">Carbon Accounting Methodology</h3>
          <p className="text-sm text-slate-400 font-medium">How EcoSphere converts business activities into verifiable compliance reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 pt-2">
          {/* Step 1 */}
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Business Activity</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Fuel, electricity, expense ledger data.</p>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="md:col-span-1 flex justify-center text-slate-600">
            <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          {/* Step 2 */}
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto border border-cyan-500/20">
              <Hash className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Emission Factor</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Map metrics to specific CO₂e coefficients.</p>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="md:col-span-1 flex justify-center text-slate-600">
            <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          {/* Step 3 */}
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto border border-teal-500/20">
              <Cpu className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">CO₂e Calculation</div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Rollup Scopes 1, 2 & 3 equivalent weight.</p>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className="md:col-span-1 flex justify-center text-slate-600">
            <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          {/* Step 4 */}
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
