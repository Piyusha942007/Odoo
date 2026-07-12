import React from 'react';
import { 
  TrendingUp, 
  Leaf, 
  Users, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

function Dashboard() {
  const cards = [
    {
      title: 'Environmental Score',
      value: '82 / 100',
      change: '+4.2% from last month',
      icon: Leaf,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Social & CSR Hours',
      value: '320 Hrs',
      change: '74% participation rate',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-400'
    },
    {
      title: 'Policy Acknowledgement',
      value: '95.0%',
      change: '8 Active policies',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400'
    },
    {
      title: 'Open Compliance Issues',
      value: '2 Issues',
      change: '14 resolved this quarter',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ESG Command Center</h1>
        <p className="text-slate-400 mt-2 font-medium">Real-time oversight across Environmental, Social, and Governance metrics.</p>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div 
            key={card.title}
            className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 p-6 shadow-xl hover:border-slate-800 transition-all duration-300 group"
          >
            {/* Background glow decoration */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-tr ${card.color} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{card.title}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${card.color} bg-opacity-10 text-white shadow-md`}>
                <card.icon size={20} />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-100 tracking-tight">{card.value}</span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
                <TrendingUp size={14} className={card.textColor} />
                <span>{card.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 opacity-30 pointer-events-none" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-900/60 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform Active
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to EcoSphere Hour 1 Foundation</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The platform skeletons and database connectivity have been established. Member 3 has initialized the Governance module routes, schemas, and skeletons. Use the sidebar to inspect policies, active compliance audits, and the report center.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
