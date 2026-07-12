import React, { useState, useEffect, useRef } from 'react';
import { 
  getEsgConfig, 
  saveEsgConfig, 
  getLiveDashboard, 
  recomputeEsgScores 
} from '../../services/environmentalService';
import { 
  Award, 
  Settings2, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  ChevronDown, 
  TrendingUp, 
  Building2, 
  Scale, 
  Sparkles,
  Users
} from 'lucide-react';

function EsgDashboard() {
  const [config, setConfig] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [envWeight, setEnvWeight] = useState(40);
  const [socWeight, setSocWeight] = useState(30);
  const [govWeight, setGovWeight] = useState(30);
  const [aggMode, setAggMode] = useState('simple_average');

  // Dropdown states
  const [aggDropdownOpen, setAggDropdownOpen] = useState(false);
  const aggRef = useRef(null);

  // Alerts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formError, setFormError] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Click outside to close custom select dropdown panels
  useEffect(() => {
    function handleClickOutside(event) {
      if (aggRef.current && !aggRef.current.contains(event.target)) {
        setAggDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const configRes = await getEsgConfig();
      if (configRes.success) {
        setConfig(configRes.data);
        setEnvWeight(configRes.data.environmentalWeight);
        setSocWeight(configRes.data.socialWeight);
        setGovWeight(configRes.data.governanceWeight);
        setAggMode(configRes.data.aggregationMode);
      }

      const dashRes = await getLiveDashboard();
      if (dashRes.success) {
        setDashboard(dashRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ESG score configuration. Verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setFormError(null);

    const total = Number(envWeight) + Number(socWeight) + Number(govWeight);
    if (total !== 100) {
      setFormError(`Weights must sum exactly to 100% (currently ${total}%).`);
      showToast('Configuration weights error', 'error');
      return;
    }

    try {
      const res = await saveEsgConfig({
        environmentalWeight: Number(envWeight),
        socialWeight: Number(socWeight),
        governanceWeight: Number(govWeight),
        aggregationMode: aggMode
      });

      if (res.success) {
        showToast('ESG Weightings configuration saved!', 'success');
        setConfig(res.data);
        // Trigger auto recompute
        handleRecompute();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to save configuration';
      setFormError(msg);
      showToast(msg, 'error');
    }
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      const res = await recomputeEsgScores({ period: '2026', quarter: 'Q3' });
      if (res.success) {
        showToast('ESG scoring indexes recomputed successfully!', 'success');
        setDashboard(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Scoring recomputation failed', 'error');
    } finally {
      setRecomputing(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="text-center py-24 text-slate-400 font-semibold animate-pulse">
        Loading scoring dashboard...
      </div>
    );
  }

  const overallScore = dashboard?.overallESGScore || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            ESG Scoring & Analytics
          </h2>
          <p className="text-slate-400 text-sm font-medium">Verify Environmental, Social, and Governance aggregates and overall ESG indices</p>
        </div>
        
        <button
          onClick={handleRecompute}
          disabled={recomputing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
          {recomputing ? 'Recomputing...' : 'Recalculate ESG Scores'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Scoring System Error</h4>
            <p className="text-xs font-medium text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Main KPI Rollup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Score Circle Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-indigo-500 opacity-5 blur-3xl" />
          
          <div className="space-y-1 relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Overall ESG Index</h3>
            <p className="text-xs text-slate-500 font-semibold">Weighted average score across all departments</p>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circle Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-indigo-500 transition-all duration-1000"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * overallScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-100">{overallScore}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Points</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-xs font-bold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            Attainment Level: {overallScore >= 80 ? 'Gold' : overallScore >= 60 ? 'Silver' : 'Bronze'}
          </div>
        </div>

        {/* Weights & Parameter Config */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-slate-400" />
            ESG Weights Configuration
          </h3>

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Environmental Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={envWeight}
                onChange={(e) => setEnvWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Social Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={socWeight}
                onChange={(e) => setSocWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Governance Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={govWeight}
                onChange={(e) => setGovWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Custom Dropdown Aggregation Mode Select */}
            <div className="space-y-1.5 sm:col-span-2" ref={aggRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aggregation Rollup Mode</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAggDropdownOpen(!aggDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span>
                    {aggMode === 'simple_average' ? 'Simple Average (Equal weight per department)' : 'Headcount Weighted (Size-proportional average)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${aggDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {aggDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setAggMode('simple_average');
                        setAggDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                    >
                      Simple Average (Equal weight per department)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAggMode('headcount_weighted');
                        setAggDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                    >
                      Headcount Weighted (Size-proportional average)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end sm:col-span-1">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold rounded-xl shadow-lg transition"
              >
                Save Configuration
              </button>
            </div>
          </form>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 text-center font-mono">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Environmental Avg</div>
              <div className="text-lg font-extrabold text-emerald-400">{dashboard?.environmentalScore || 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Social Avg</div>
              <div className="text-lg font-extrabold text-cyan-400">{dashboard?.socialScore || 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Governance Avg</div>
              <div className="text-lg font-extrabold text-indigo-400">{dashboard?.governanceScore || 0}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Department Scores Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          Department scoring metrics
        </h3>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Headcount</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Environmental (E)</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Social (S)</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Governance (G)</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center bg-indigo-500/5">Total ESG Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {dashboard?.departmentScores?.map((d) => (
                <tr key={d._id} className="hover:bg-slate-850/30 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-200 text-sm">{d.name}</div>
                    <code className="text-[10px] text-slate-500 font-mono">{d.code}</code>
                  </td>
                  <td className="p-4 text-center text-slate-300 font-semibold text-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {d.employeeCount}
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-400 text-sm">
                    {d.environmentalScore}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-cyan-400 text-sm">
                    {d.socialScore}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-indigo-400 text-sm">
                    {d.governanceScore}
                  </td>
                  <td className="p-4 text-center font-mono font-extrabold text-slate-100 text-sm bg-indigo-500/5">
                    {d.totalScore}
                  </td>
                </tr>
              ))}
              {(!dashboard?.departmentScores || dashboard.departmentScores.length === 0) && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-semibold">
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-slate-950 border-slate-850 text-sm font-semibold max-w-sm animate-fade-in">
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-indigo-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className={toast.type === 'success' ? 'text-indigo-400' : 'text-rose-400'}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}

export default EsgDashboard;
