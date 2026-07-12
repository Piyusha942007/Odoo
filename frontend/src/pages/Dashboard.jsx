import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Server, Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100">Welcome to EcoSphere</h2>
          <p className="text-slate-400 font-medium">ESG Management Platform — P1 Integration Hub</p>
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

      {/* Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend API Connection Status */}
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

        {/* Database Connection Status */}
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
