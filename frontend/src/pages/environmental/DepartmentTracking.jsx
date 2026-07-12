import React, { useState, useEffect, useRef } from 'react';
import { getDepartmentTracking, getLiveDashboard } from '../../services/environmentalService';
import { getDepartments } from '../../services/departmentService';
import { 
  Building2, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Target, 
  ClipboardList, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

function DepartmentTracking() {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dropdown states
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const deptRef = useRef(null);
  const yearRef = useRef(null);

  // Click outside to close custom select dropdown panels
  useEffect(() => {
    function handleClickOutside(event) {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setDeptDropdownOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target)) {
        setYearDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch departments initially
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await getDepartments();
        if (res.success && res.data.length > 0) {
          setDepartments(res.data);
          setSelectedDeptId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  // Fetch tracking metrics whenever dept/year changes
  useEffect(() => {
    if (!selectedDeptId) return;

    const fetchTracking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDepartmentTracking(selectedDeptId, selectedYear);
        if (res.success) {
          setTrackingData(res.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve department tracking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [selectedDeptId, selectedYear]);

  const getSelectedDeptName = () => {
    const dept = departments.find(d => d._id === selectedDeptId);
    return dept ? dept.name : 'Select Department...';
  };

  const getPercentageColor = (val) => {
    if (val < 0) return 'text-emerald-400';
    if (val > 0) return 'text-rose-500';
    return 'text-slate-400';
  };

  const getStatusBadge = (status) => {
    if (status === 'achieved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved
        </span>
      );
    }
    if (status === 'at_risk') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5" /> At Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
        No Goals Set
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      {/* Header & Selectors */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Department Carbon Ledger
          </h2>
          <p className="text-slate-400 text-sm font-medium">Verify department-specific monthly emissions and check compliance goals</p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          {/* Custom Department Dropdown */}
          <div className="relative w-56" ref={deptRef}>
            <button
              onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
            >
              <span className="truncate">{getSelectedDeptName()}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${deptDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {deptDropdownOpen && (
              <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                {departments.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => {
                      setSelectedDeptId(d._id);
                      setDeptDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Year Dropdown */}
          <div className="relative w-32" ref={yearRef}>
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
            >
              <span>{selectedYear}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {yearDropdownOpen && (
              <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                {[2026, 2025, 2024].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedYear(yr);
                      setYearDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Data Fetching Error</h4>
            <p className="text-xs font-medium text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {loading && !trackingData ? (
        <div className="text-center py-24 text-slate-400 font-semibold animate-pulse">
          Retrieving department ledger statistics...
        </div>
      ) : trackingData && (
        <div className="space-y-6 animate-fade-in">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Period Emission</span>
              <div className="mt-2.5 space-y-1">
                <div className="text-2xl font-extrabold text-slate-100">{trackingData.carbon.currentEmission.toLocaleString()} kg</div>
                <div className="text-[10px] text-slate-500 font-medium">Total carbon generated for {selectedYear}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Previous Period Emission</span>
              <div className="mt-2.5 space-y-1">
                <div className="text-2xl font-extrabold text-slate-100">{trackingData.carbon.previousEmission.toLocaleString()} kg</div>
                <div className="text-[10px] text-slate-500 font-medium">Total carbon generated for {selectedYear - 1}</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Carbon Difference</span>
              <div className="mt-2.5 space-y-1">
                <div className={`text-2xl font-extrabold flex items-center gap-1.5 ${
                  trackingData.carbon.difference <= 0 ? 'text-emerald-400' : 'text-rose-500'
                }`}>
                  {trackingData.carbon.difference <= 0 ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                  {Math.abs(trackingData.carbon.difference).toLocaleString()} kg
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Net weight variance vs. previous year</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Emissions Variance</span>
              <div className="mt-2.5 space-y-1">
                <div className={`text-2xl font-extrabold ${getPercentageColor(trackingData.carbon.percentageChange)}`}>
                  {trackingData.carbon.percentageChange > 0 ? '+' : ''}
                  {trackingData.carbon.percentageChange}%
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Percentage variance vs. previous year</div>
              </div>
            </div>

          </div>

          {/* Monthly Comparison Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-200">Monthly Actual vs Goal Limits</h3>
              <p className="text-xs text-slate-500 font-medium">Compares monthly actual carbon weights with the share of target budgets</p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackingData.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="actualEmission" name="Actual Emissions (kg)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetEmission" name="Target Cap Share (kg)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals Compliance */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Sustainability Goal Compliance Ledger
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackingData.goals.map((g, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex justify-between items-center hover:border-slate-800 transition"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="font-bold text-slate-200 text-sm truncate">{g.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Target Cap: <span className="text-slate-350">{g.target} kg</span> | Actual: <span className="text-slate-350">{g.actual} kg</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(g.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Ledger list */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              Annual Transaction History
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date / Doc</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Factor</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Category</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Activity Data</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Calculated CO₂e</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {trackingData.transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-850/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                          {tx.date ? tx.date.split('T')[0] : 'N/A'}
                        </div>
                        <code className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-mono">
                          {tx.sourceDocument}
                        </code>
                      </td>
                      <td className="p-4 text-slate-350 font-semibold text-sm">
                        {tx.emissionFactor?.name || <span className="text-slate-550 italic">Deleted Factor</span>}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
                          {tx.emissionFactor?.sourceType || 'Manual'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-300 text-sm">
                        {tx.quantity} {tx.emissionFactor?.unit || ''}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {tx.co2eAmount.toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                  {trackingData.transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 font-semibold">
                        No carbon transactions logged for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default DepartmentTracking;
