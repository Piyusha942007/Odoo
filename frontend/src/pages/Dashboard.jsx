import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Award, 
  TrendingUp, 
  Leaf, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

function Dashboard() {
  const [health, setHealth] = useState({ api: 'checking', db: 'checking' });
  const [loading, setLoading] = useState(false);

  const checkSystemHealth = async () => {
    setLoading(true);
    setHealth({ api: 'checking', db: 'checking' });
    try {
      const response = await api.get('/health');
      if (response.data && response.data.success) {
        setHealth({
          api: 'online',
          db: response.data.database === 'Connected' ? 'online' : 'offline'
        });
      } else {
        setHealth({ api: 'online', db: 'offline' });
      }
    } catch (error) {
      console.error('API connection failed:', error);
      setHealth({ api: 'offline', db: 'offline' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ESG Command Center</h1>
          <p className="text-slate-400 mt-2 font-medium text-sm">Real-time oversight across Environmental, Social, and Governance metrics.</p>
        </div>
        <button
          onClick={checkSystemHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Test Connections
        </button>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div 
            key={card.title}
            className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 p-6 shadow-xl hover:border-slate-800 transition-all duration-300 group"
          >
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

      {/* Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">API Connection</span>
              <h3 className="text-xl font-bold text-slate-200">Express.js Health</h3>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <Server className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {health.api === 'checking' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-sm font-semibold text-slate-400">Verifying API Connection...</span>
              </>
            )}
            {health.api === 'online' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">API Online & Healthy</span>
              </>
            )}
            {health.api === 'offline' && (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-semibold text-rose-500">API Connection Failed</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Connection</span>
              <h3 className="text-xl font-bold text-slate-200">MongoDB Mongoose</h3>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <Database className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {health.db === 'checking' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-sm font-semibold text-slate-400">Pinging Database...</span>
              </>
            )}
            {health.db === 'online' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-semibold text-teal-400">MongoDB Connected</span>
              </>
            )}
            {health.db === 'offline' && (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-semibold text-rose-500">Database Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Module Overview Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-200">Governance & Compliance (Anvi's Track)</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Member 3 has initialized the Governance and Reports modules. You can manage Policies, view active Compliance Audits/Issues, and browse generated disclosure packages from the navigation sidebar.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-200">Social & Gamification (Khushi's Track)</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            The Category Master, CSR Activities, and Challenges models and page foundations are loaded and active. Teammates can manage CSR definitions and track rewards through the navigation panel.
          </p>
        </div>
      </div>

      {/* System Status Details */}
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
