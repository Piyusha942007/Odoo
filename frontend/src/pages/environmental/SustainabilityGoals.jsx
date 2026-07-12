import React, { useState, useEffect, useRef } from 'react';
import { 
  getEnvironmentalGoals, 
  createEnvironmentalGoal, 
  updateEnvironmentalGoal, 
  deleteEnvironmentalGoal 
} from '../../services/environmentalService';
import { getDepartments } from '../../services/departmentService';
import { Target, Plus, Trash2, Edit3, AlertCircle, X, Check, Calendar, Clock, ChevronDown, Sparkles } from 'lucide-react';

function SustainabilityGoals() {
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields for Create
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [metric, setMetric] = useState('CO2e Emissions Limit');
  const [baseline, setBaseline] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');

  // Dropdown states (Create)
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  // Form Fields for Edit
  const [editingGoal, setEditingGoal] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editMetric, setEditMetric] = useState('CO2e Emissions Limit');
  const [editBaseline, setEditBaseline] = useState('');
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Dropdown states (Edit)
  const [editDeptDropdownOpen, setEditDeptDropdownOpen] = useState(false);

  // Alerts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [submitError, setSubmitError] = useState(null);

  // Refs for clicking outside
  const deptRef = useRef(null);
  const editDeptRef = useRef(null);

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
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setDeptDropdownOpen(false);
      }
      if (editDeptRef.current && !editDeptRef.current.contains(event.target)) {
        setEditDeptDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const gRes = await getEnvironmentalGoals();
      if (gRes.success) setGoals(gRes.data);

      const dRes = await getDepartments();
      if (dRes.success) setDepartments(dRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch goals. Ensure database connection is active.');
      showToast('Database offline. Failed to fetch goals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title || !department || !baseline || !targetValue || !startDate || !deadline) {
      setSubmitError('All fields are required.');
      return;
    }

    if (Number(targetValue) <= 0 || Number(baseline) < 0) {
      setSubmitError('Target limit must be greater than 0, baseline cannot be negative.');
      return;
    }

    if (new Date(startDate) > new Date(deadline)) {
      setSubmitError('Start date cannot be after deadline date.');
      return;
    }

    try {
      const res = await createEnvironmentalGoal({
        title,
        department,
        metric,
        baseline: Number(baseline),
        targetValue: Number(targetValue),
        startDate,
        deadline
      });

      if (res.success) {
        showToast('Sustainability Goal set successfully!', 'success');
        setTitle('');
        setDepartment('');
        setMetric('CO2e Emissions Limit');
        setBaseline('');
        setTargetValue('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setDeadline('');
        setShowAddForm(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to create goal';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleEditClick = (g) => {
    setEditingGoal(g);
    setEditTitle(g.title);
    setEditDepartment(g.department?._id || g.department || '');
    setEditMetric(g.metric || 'CO2e Emissions Limit');
    setEditBaseline(g.baseline);
    setEditTargetValue(g.targetValue);
    setEditStartDate(g.startDate ? g.startDate.split('T')[0] : '');
    setEditDeadline(g.deadline ? g.deadline.split('T')[0] : '');
    setSubmitError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!editTitle || !editDepartment || !editBaseline || !editTargetValue || !editStartDate || !editDeadline) {
      setSubmitError('All fields are required.');
      return;
    }

    if (Number(editTargetValue) <= 0 || Number(editBaseline) < 0) {
      setSubmitError('Target limit must be greater than 0, baseline cannot be negative.');
      return;
    }

    if (new Date(editStartDate) > new Date(editDeadline)) {
      setSubmitError('Start date cannot be after deadline date.');
      return;
    }

    try {
      const res = await updateEnvironmentalGoal(editingGoal._id, {
        title: editTitle,
        department: editDepartment,
        metric: editMetric,
        baseline: Number(editBaseline),
        targetValue: Number(editTargetValue),
        startDate: editStartDate,
        deadline: editDeadline
      });

      if (res.success) {
        showToast('Sustainability Goal updated successfully!', 'success');
        setEditingGoal(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update goal';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: null });
    try {
      const res = await deleteEnvironmentalGoal(id);
      if (res.success) {
        showToast('Goal deleted successfully', 'success');
        loadData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete goal.', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'At Risk': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Missed': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getSelectedDeptLabel = (id) => {
    const dept = departments.find(d => d._id === id);
    return dept ? `${dept.name} (${dept.code})` : 'Select Department...';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-400" />
            Sustainability Targets Ledger
          </h2>
          <p className="text-slate-400 text-sm font-medium">Define department-specific emission budgets and track real-time utilization progress</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingGoal(null);
            setSubmitError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-955 font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 transition duration-300"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Set Target'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-200">Configure Sustainability Goal</h3>
          
          {submitError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FY26 Q3 Purchase Emissions Cap"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition"
                required
              />
            </div>

            {/* Custom Create Department Select */}
            <div className="space-y-2" ref={deptRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Owner</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span className="truncate">{getSelectedDeptLabel(department)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${deptDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {deptDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                    {departments.map((d) => (
                      <button
                        key={d._id}
                        type="button"
                        onClick={() => {
                          setDepartment(d._id);
                          setDeptDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                      >
                        {d.name} <span className="text-slate-500 text-xs font-mono ml-1">({d.code})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Metric Description</label>
              <input
                type="text"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="e.g. Scope 1 & 2 Emissions Limit (kg CO2e)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div className="space-y-2 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Baseline (kg CO₂e)</label>
                <input
                  type="number"
                  value={baseline}
                  onChange={(e) => setBaseline(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Cap (kg CO₂e)</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 3500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline Target Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition"
                required
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl shadow-lg transition"
              >
                Create Target Cap
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">API Access Error</h4>
            <p className="text-xs font-medium text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {loading && goals.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          Loading organizational sustainability targets...
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <Target className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Sustainability Goals</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
            Define organizational carbon emission limits per department to track compliance metrics.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-955 font-bold rounded-xl transition"
          >
            Set First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {goals.map((g) => {
            const budgetUsed = g.progressPercent || 0;
            return (
              <div 
                key={g._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold ${getStatusColor(g.status)}`}>
                        {g.status}
                      </span>
                      <h3 className="text-base font-bold text-slate-100">{g.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        {g.department?.name || 'Global'} Department
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(g)}
                        className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-950 border border-transparent hover:border-teal-950 rounded-lg transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(g._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-950 border border-transparent hover:border-rose-950 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-850/50 text-center font-mono">
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Baseline</div>
                      <div className="text-xs font-bold text-slate-300">{g.baseline} kg</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Actual</div>
                      <div className="text-xs font-bold text-emerald-400">{(g.actualValue || 0).toFixed(1)} kg</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Target Cap</div>
                      <div className="text-xs font-bold text-slate-300">{g.targetValue} kg</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Emission Budget Used</span>
                      <span className={budgetUsed > 100 ? 'text-rose-400' : budgetUsed > 80 ? 'text-amber-400' : 'text-emerald-400'}>
                        {budgetUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          budgetUsed > 100 ? 'bg-rose-500' : budgetUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-850/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    Start: {g.startDate ? g.startDate.split('T')[0] : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    Deadline: {g.deadline ? g.deadline.split('T')[0] : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(20,184,166,0.1)] max-w-lg w-full space-y-4 animate-[zoom-in_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Edit Sustainability Goal
              </h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              {/* Custom Edit Department Select */}
              <div className="space-y-1" ref={editDeptRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Owner</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditDeptDropdownOpen(!editDeptDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <span className="truncate">{getSelectedDeptLabel(editDepartment)}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${editDeptDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editDeptDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl max-h-40 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                      {departments.map((d) => (
                        <button
                          key={d._id}
                          type="button"
                          onClick={() => {
                            setEditDepartment(d._id);
                            setEditDeptDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Metric Description</label>
                <input
                  type="text"
                  value={editMetric}
                  onChange={(e) => setEditMetric(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Baseline</label>
                  <input
                    type="number"
                    value={editBaseline}
                    onChange={(e) => setEditBaseline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Cap</label>
                  <input
                    type="number"
                    value={editTargetValue}
                    onChange={(e) => setEditTargetValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl shadow-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(244,63,94,0.1)] max-w-md w-full space-y-4 text-center animate-[zoom-in_0.2s_ease-out]">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">Delete Goal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this sustainability target cap?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-955 font-bold rounded-xl transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-slate-950 border-slate-850 text-sm font-semibold max-w-sm animate-fade-in">
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-teal-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className={toast.type === 'success' ? 'text-teal-400' : 'text-rose-400'}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}

export default SustainabilityGoals;
