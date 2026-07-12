import React, { useEffect, useState } from 'react';
import { 
  getCsrActivities, 
  createCsrActivity, 
  updateCsrActivity, 
  deleteCsrActivity, 
  getCategories, 
  getDepartments,
  getEmployeeParticipations,
  createEmployeeParticipation,
  updateEmployeeParticipation,
  deleteEmployeeParticipation,
  getTrainingCompletions,
  createTrainingCompletion,
  deleteTrainingCompletion,
  updateDepartmentDiversity,
  getSocialDashboardMetrics
} from '../../services/socialApi';
import { 
  getSettings, 
  updateSettings 
} from '../../services/gamificationApi';
import { 
  Calendar, Plus, Edit2, Trash2, Check, X, RefreshCw, UserCheck, 
  CheckCircle, XCircle, GraduationCap, Award, Sliders, Users, 
  ShieldAlert, Settings, Info
} from 'lucide-react';

function CsrActivitiesPage() {
  const [activeTab, setActiveTab] = useState('activities');
  
  // Data lists
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [trainingCompletions, setTrainingCompletions] = useState([]);
  
  // Dashboard & settings
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [esgSettings, setEsgSettings] = useState({
    badgeAutoAward: true,
    csrEvidenceRequired: false,
    weightCsr: 25,
    weightChallenge: 25,
    weightTraining: 25,
    weightDiversity: 25
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states - Activity
  const [newAct, setNewAct] = useState({ title: '', category: '', department: '', description: '', date: '', points: 50, status: 'Active' });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', category: '', department: '', description: '', date: '', points: 50, status: 'Active' });

  // Form states - Participation
  const [newPart, setNewPart] = useState({ employee: '', activity: '', proof: '', completionDate: '', department: '' });
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Form states - Training
  const [showCreateTraining, setShowCreateTraining] = useState(false);
  const [newTraining, setNewTraining] = useState({ employee: '', trainingName: '', department: '', completionDate: '', score: 100 });

  // Form states - Diversity Modal
  const [editingDept, setEditingDept] = useState(null);
  const [diversityForm, setDiversityForm] = useState({ genderRatio: '50:50', under30: 30, thirtyToFifty: 50, over50: 20 });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const [actRes, catRes, deptRes, partRes, trainRes, metricsRes, settingsRes] = await Promise.all([
        getCsrActivities(),
        getCategories(),
        getDepartments(),
        getEmployeeParticipations(),
        getTrainingCompletions(),
        getSocialDashboardMetrics(),
        getSettings()
      ]);

      if (actRes.success) setActivities(actRes.data);
      if (partRes.success) setParticipations(partRes.data);
      if (trainRes.success) setTrainingCompletions(trainRes.data);
      if (metricsRes.success) setDashboardMetrics(metricsRes.data);
      if (settingsRes.success) setEsgSettings(settingsRes.data);
      
      if (catRes.success) {
        const filteredCats = catRes.data.filter(c => c.type === 'CSR Activity');
        setCategories(filteredCats);
        if (filteredCats.length > 0) {
          setNewAct(prev => ({ ...prev, category: filteredCats[0]._id }));
        }
      }
      if (deptRes.success) {
        const activeDepts = deptRes.data || [];
        setDepartments(activeDepts);
        if (activeDepts.length > 0) {
          setNewAct(prev => ({ ...prev, department: activeDepts[0]._id }));
          setNewTraining(prev => ({ ...prev, department: activeDepts[0]._id }));
        }
      }

      // Default selection for participation form
      if (actRes.success && actRes.data.length > 0) {
        setNewPart(prev => ({ 
          ...prev, 
          activity: actRes.data[0]._id, 
          department: deptRes.data?.[0]?._id || '' 
        }));
      }
    } catch (err) {
      setErrorMsg("Error loading CSR data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Activity Handlers
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newAct.title || !newAct.category || !newAct.department || !newAct.date) {
      triggerError("Please fill all required activity fields.");
      return;
    }

    try {
      const res = await createCsrActivity(newAct);
      if (res.success) {
        setNewAct({ 
          title: '', 
          category: categories[0]?._id || '', 
          department: departments[0]?._id || '', 
          description: '', 
          date: '', 
          points: 50, 
          status: 'Active' 
        });
        setShowCreate(false);
        triggerSuccess("CSR Activity created successfully!");
        loadData();
      }
    } catch (err) {
      triggerError("Error creating CSR activity: " + err.message);
    }
  };

  const handleEditClick = (act) => {
    setEditingId(act._id);
    setEditForm({
      title: act.title,
      category: act.category?._id || '',
      department: act.department?._id || '',
      description: act.description || '',
      date: act.date ? new Date(act.date).toISOString().split('T')[0] : '',
      points: act.points || 50,
      status: act.status || 'Active'
    });
  };

  const handleUpdateActivity = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCsrActivity(editingId, editForm);
      if (res.success) {
        setEditingId(null);
        triggerSuccess("CSR Activity updated successfully!");
        loadData();
      }
    } catch (err) {
      triggerError("Error updating CSR Activity: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      const res = await deleteCsrActivity(id);
      if (res.success) {
        triggerSuccess("CSR Activity deleted successfully!");
        loadData();
      }
    } catch (err) {
      triggerError("Error deleting CSR Activity: " + err.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPart(prev => ({ ...prev, proof: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Participation Handlers
  const handleCreateParticipation = async (e) => {
    e.preventDefault();
    if (!newPart.employee || !newPart.activity || !newPart.completionDate) {
      triggerError("Employee, Activity, and Completion Date are required.");
      return;
    }

    try {
      const res = await createEmployeeParticipation(newPart);
      if (res.success) {
        setNewPart({ 
          employee: '', 
          activity: activities[0]?._id || '', 
          proof: '', 
          completionDate: '' 
        });
        setShowJoinForm(false);
        triggerSuccess("Participation submitted! Pending approval.");
        loadData();
      }
    } catch (err) {
      triggerError("Error logging participation: " + err.message);
    }
  };

  const handleApprovalDecision = async (id, status) => {
    const targetPart = participations.find(p => p._id === id);
    if (!targetPart) return;

    if (status === 'Approved' && esgSettings.csrEvidenceRequired && (!targetPart.proof || !targetPart.proof.trim())) {
      triggerError("Cannot approve: Evidence Required setting is enabled, but no proof file/link is attached.");
      return;
    }

    try {
      const res = await updateEmployeeParticipation(id, { 
        approvalStatus: status,
        proof: targetPart.proof 
      });
      if (res.success) {
        triggerSuccess(`Participation ${status.toLowerCase()} successfully!`);
        loadData();
      }
    } catch (err) {
      triggerError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteParticipation = async (id) => {
    if (!window.confirm("Delete this participation log?")) return;
    try {
      const res = await deleteEmployeeParticipation(id);
      if (res.success) {
        triggerSuccess("Participation record deleted.");
        loadData();
      }
    } catch (err) {
      triggerError("Error deleting record: " + err.message);
    }
  };

  // Training Completion Handlers
  const handleCreateTraining = async (e) => {
    e.preventDefault();
    if (!newTraining.employee || !newTraining.trainingName || !newTraining.department || !newTraining.completionDate) {
      triggerError("Employee Name, Training Title, Department, and Date are required.");
      return;
    }

    try {
      const res = await createTrainingCompletion(newTraining);
      if (res.success) {
        setNewTraining({
          employee: '',
          trainingName: '',
          department: departments[0]?._id || '',
          completionDate: '',
          score: 100
        });
        setShowCreateTraining(false);
        triggerSuccess("Training completion logged successfully!");
        loadData();
      }
    } catch (err) {
      triggerError("Error logging training: " + err.message);
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training record?")) return;
    try {
      const res = await deleteTrainingCompletion(id);
      if (res.success) {
        triggerSuccess("Training record deleted successfully!");
        loadData();
      }
    } catch (err) {
      triggerError("Error deleting training record: " + err.message);
    }
  };

  // Diversity Handlers
  const handleOpenDiversityEdit = (dept) => {
    setEditingDept(dept);
    setDiversityForm({
      genderRatio: dept.diversityMetrics?.genderRatio || '50:50',
      under30: dept.diversityMetrics?.ageBands?.under30 || 30,
      thirtyToFifty: dept.diversityMetrics?.ageBands?.thirtyToFifty || 50,
      over50: dept.diversityMetrics?.ageBands?.over50 || 20
    });
  };

  const handleUpdateDiversity = async (e) => {
    e.preventDefault();
    const sum = Number(diversityForm.under30) + Number(diversityForm.thirtyToFifty) + Number(diversityForm.over50);
    if (sum !== 100) {
      triggerError("Age bands percentages must total exactly 100%. Current sum: " + sum + "%");
      return;
    }

    try {
      const res = await updateDepartmentDiversity(editingDept._id, {
        genderRatio: diversityForm.genderRatio,
        ageBands: {
          under30: Number(diversityForm.under30),
          thirtyToFifty: Number(diversityForm.thirtyToFifty),
          over50: Number(diversityForm.over50)
        }
      });
      if (res.success) {
        setEditingDept(null);
        triggerSuccess("Diversity metrics updated successfully!");
        loadData();
      }
    } catch (err) {
      triggerError("Error updating diversity metrics: " + err.message);
    }
  };

  // Settings Handlers
  const handleToggleSetting = async (field, value) => {
    try {
      const updatedData = { ...esgSettings, [field]: value };
      const res = await updateSettings(updatedData);
      if (res.success) {
        setEsgSettings(res.data);
        triggerSuccess("Settings updated and ESG scores recalculated!");
        loadData();
      }
    } catch (err) {
      triggerError("Failed to update settings: " + err.message);
    }
  };

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    const sum = Number(esgSettings.weightCsr) + Number(esgSettings.weightChallenge) + Number(esgSettings.weightTraining) + Number(esgSettings.weightDiversity);
    if (sum !== 100) {
      triggerError("Social score sub-weights must sum to exactly 100%. Current: " + sum + "%");
      return;
    }

    try {
      const res = await updateSettings(esgSettings);
      if (res.success) {
        setEsgSettings(res.data);
        triggerSuccess("Social sub-weights updated and ESG scores recomputed!");
        loadData();
      }
    } catch (err) {
      triggerError("Failed to update weights: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 p-6 md:p-8">
      
      {/* Alert Banners */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">CSR & Social Scorecard</h2>
          <p className="text-xs text-slate-400 mt-1">Manage community activities, employee training tracks, and department diversity structures.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'activities' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Activities Registry
        </button>
        <button
          onClick={() => setActiveTab('participations')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'participations' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Employee Participations ({participations.length})
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'training' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ESG Training Tracker
        </button>
        <button
          onClick={() => setActiveTab('diversity')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'diversity' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Diversity Metrics
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'dashboard' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Social Dashboard & Config
        </button>
      </div>

      {/* 1. CSR ACTIVITIES TAB */}
      {activeTab === 'activities' && (
        <div>
          {/* Create Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create CSR Activity
            </button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <form onSubmit={handleCreateActivity} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={newAct.title}
                  onChange={(e) => setNewAct(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Category *</label>
                <select
                  required
                  value={newAct.category}
                  onChange={(e) => setNewAct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-sm focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-950 text-slate-105">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Department *</label>
                <select
                  required
                  value={newAct.department}
                  onChange={(e) => setNewAct(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-sm focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-slate-950 text-slate-105">{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Date *</label>
                  <input
                    type="date"
                    required
                    value={newAct.date}
                    onChange={(e) => setNewAct(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Points</label>
                  <input
                    type="number"
                    value={newAct.points}
                    onChange={(e) => setNewAct(prev => ({ ...prev, points: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  value={newAct.description}
                  onChange={(e) => setNewAct(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500">Save Activity</button>
              </div>
            </form>
          )}

          {/* Activities Registry Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-xl">No CSR activities registered.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act) => (
                <div key={act._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300">
                  {editingId === act._id ? (
                    <form onSubmit={handleUpdateActivity} className="space-y-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none"
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-xs focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c._id} value={c._id} className="bg-slate-950 text-slate-105">{c.name}</option>
                          ))}
                        </select>
                        <select
                          value={editForm.department}
                          onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-xs focus:outline-none"
                        >
                          {departments.map((d) => (
                            <option key={d._id} value={d._id} className="bg-slate-950 text-slate-105">{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1 bg-emerald-600 text-slate-955 font-bold rounded text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-[11px] flex items-center gap-1">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[9px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-emerald-400 font-bold uppercase tracking-wider">
                            {act.category?.name || 'CSR Activity'}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-emerald-450 text-[10px] font-bold rounded">
                            +{act.points} pts
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 mt-1">{act.title}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                          Date: {act.date ? new Date(act.date).toLocaleDateString() : 'N/A'} &middot; Dept: {act.department?.name || 'All'}
                        </p>
                        <p className="text-slate-300 text-xs mt-3 leading-relaxed">{act.description}</p>
                      </div>
                      <div className="flex gap-2 justify-end mt-4 pt-2 border-t border-slate-850">
                        <button onClick={() => handleEditClick(act)} className="p-1 text-slate-550 hover:text-slate-200 transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteActivity(act._id)} className="p-1 text-slate-550 hover:text-rose-455 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. EMPLOYEE PARTICIPATIONS TAB */}
      {activeTab === 'participations' && (
        <div>
          {/* Log Participation Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Log Employee Participation
            </button>
          </div>

          {/* Log Form */}
          {showJoinForm && (
            <form onSubmit={handleCreateParticipation} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Employee Name/ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newPart.employee}
                  onChange={(e) => setNewPart(prev => ({ ...prev, employee: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">CSR Activity *</label>
                {activities.length === 0 ? (
                  <div className="text-xs text-rose-450 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded font-semibold">
                    No activities available. Create a CSR Activity first in the "Activities Registry" tab!
                  </div>
                ) : (
                  <select
                    required
                    value={newPart.activity}
                    onChange={(e) => setNewPart(prev => ({ ...prev, activity: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-105 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {activities.map((a) => (
                      <option key={a._id} value={a._id} className="bg-slate-950 text-slate-105">
                        {a.title} ({a.points || 50} pts)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-400 font-semibold">Proof of Involvement (Link or Photo)</label>
                <input
                  type="text"
                  placeholder="Paste URL/link, or upload a photo below"
                  value={newPart.proof.startsWith('data:') ? 'Image uploaded' : newPart.proof}
                  disabled={newPart.proof.startsWith('data:')}
                  onChange={(e) => setNewPart(prev => ({ ...prev, proof: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded text-[11px] font-semibold transition">
                    Choose Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                  {newPart.proof && (
                    <button 
                      type="button" 
                      onClick={() => setNewPart(prev => ({ ...prev, proof: '' }))}
                      className="text-[10px] text-rose-400 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {newPart.proof.startsWith('data:image/') && (
                  <div className="mt-1">
                    <img src={newPart.proof} alt="Thumbnail preview" className="w-16 h-16 rounded object-cover border border-slate-800" />
                  </div>
                )}
              </div>

               <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Department *</label>
                <select
                  required
                  value={newPart.department}
                  onChange={(e) => setNewPart(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-105 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-slate-950 text-slate-105">{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Completion Date *</label>
                <input
                  type="date"
                  required
                  value={newPart.completionDate}
                  onChange={(e) => setNewPart(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:outline-none"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowJoinForm(false)} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500">Submit Log</button>
              </div>
            </form>
          )}

          {/* Table list */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading records...</div>
          ) : participations.length === 0 ? (
            <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-xl">No participation logs submitted yet.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3">Employee</th>
                    <th className="p-3">CSR Activity</th>
                    <th className="p-3">Proof Details / Link</th>
                    <th className="p-3">Completion Date</th>
                    <th className="p-3">Points</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.map((part) => (
                    <tr key={part._id} className="border-b border-slate-850 hover:bg-slate-850 transition">
                      <td className="p-3 font-semibold text-slate-200">{part.employee}</td>
                      <td className="p-3 text-slate-350">
                        {part.activity?.title || 'Unknown Activity'}
                        <div className="text-[10px] text-slate-550">{part.activity?.category?.name}</div>
                      </td>
                      <td className="p-3 text-slate-400">
                        {part.proof ? (
                          part.proof.startsWith('data:image/') ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={part.proof} 
                                alt="Uploaded Proof" 
                                className="w-10 h-10 rounded object-cover border border-slate-800 cursor-zoom-in hover:scale-105 transition"
                                onClick={() => {
                                  const w = window.open();
                                  w.document.write(`<img src="${part.proof}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }} 
                              />
                              <span className="text-[9px] text-slate-500 font-semibold">Image</span>
                            </div>
                          ) : (
                            <a href={part.proof} target="_blank" rel="noreferrer" className="text-emerald-450 hover:underline font-mono text-xs">
                              {part.proof.length > 30 ? part.proof.substring(0, 30) + '...' : part.proof}
                            </a>
                          )
                        ) : (
                          <span className="text-slate-600 italic text-xs">None provided</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{part.completionDate ? new Date(part.completionDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3 text-emerald-400 font-bold">+{part.pointsEarned} pts</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          part.approvalStatus === 'Approved' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : part.approvalStatus === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-455'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {part.approvalStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {part.approvalStatus === 'Pending' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApprovalDecision(part._id, 'Approved')}
                              className="p-1 text-emerald-400 hover:text-emerald-350 transition"
                              title="Approve Submission"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprovalDecision(part._id, 'Rejected')}
                              className="p-1 text-rose-450 hover:text-rose-400 transition"
                              title="Reject Submission"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {part.approvalStatus !== 'Pending' && (
                          <button
                            onClick={() => handleDeleteParticipation(part._id)}
                            className="p-1 text-slate-500 hover:text-rose-450 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. ESG TRAINING TRACKER TAB */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-200">ESG Training Completions</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Record and view employee ESG certification courses.</p>
            </div>
            <button
              onClick={() => setShowCreateTraining(!showCreateTraining)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs transition duration-200"
            >
              {showCreateTraining ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showCreateTraining ? 'Close Form' : 'Log Training Completion'}
            </button>
          </div>

          {showCreateTraining && (
            <form onSubmit={handleCreateTraining} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Employee Name/ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Smith"
                  value={newTraining.employee}
                  onChange={(e) => setNewTraining({...newTraining, employee: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Training Course Title *</label>
                <select
                  required
                  value={newTraining.trainingName}
                  onChange={(e) => setNewTraining({...newTraining, trainingName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-sm focus:outline-none"
                >
                  <option value="" className="bg-slate-950 text-slate-105">-- Select Course --</option>
                  <option value="ESG & Climate Literacy" className="bg-slate-950 text-slate-105">ESG & Climate Literacy</option>
                  <option value="Anti-Bribery and Corruption" className="bg-slate-950 text-slate-105">Anti-Bribery and Corruption</option>
                  <option value="Diversity & Inclusion Essentials" className="bg-slate-950 text-slate-105">Diversity & Inclusion Essentials</option>
                  <option value="Corporate Governance Standards" className="bg-slate-950 text-slate-105">Corporate Governance Standards</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Department *</label>
                <select
                  required
                  value={newTraining.department}
                  onChange={(e) => setNewTraining({...newTraining, department: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-sm focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-slate-950 text-slate-105">{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={newTraining.completionDate}
                    onChange={(e) => setNewTraining({...newTraining, completionDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTraining.score}
                    onChange={(e) => setNewTraining({...newTraining, score: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateTraining(false)} className="px-3.5 py-2 text-xs bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                <button type="submit" className="px-3.5 py-2 bg-emerald-600 text-slate-955 rounded font-bold hover:bg-emerald-500">Save training Completion</button>
              </div>
            </form>
          )}

          {trainingCompletions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-8 rounded-2xl text-center">
              <p className="text-slate-400 text-sm">No ESG training records registered yet.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Training Course</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3">Completion Date</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingCompletions.map((tr) => (
                    <tr key={tr._id} className="border-b border-slate-850 hover:bg-slate-850/40 transition">
                      <td className="p-3 font-semibold text-slate-200">{tr.employee}</td>
                      <td className="p-3 text-slate-350">{tr.trainingName}</td>
                      <td className="p-3 text-slate-450">{tr.department?.name || 'N/A'}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-450">{tr.score}%</td>
                      <td className="p-3 text-slate-400">{tr.completionDate ? new Date(tr.completionDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteTraining(tr._id)} className="p-1 text-slate-550 hover:text-rose-455 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. DIVERSITY METRICS TAB */}
      {activeTab === 'diversity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-200">Department Workforce Diversity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Edit and configure diversity dimensions for CSR social score attainment calculations.</p>
            </div>
            <div className="text-xs text-slate-450 bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex items-center gap-1.5 max-w-sm">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Attainment calculations compare gender balance deviations against an ideal 50:50 parity target.</span>
            </div>
          </div>

          {editingDept && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <form onSubmit={handleUpdateDiversity} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-100">Edit Diversity: {editingDept.name}</h3>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Gender Ratio (Female:Male) *</label>
                  <select
                    value={diversityForm.genderRatio}
                    onChange={(e) => setDiversityForm({...diversityForm, genderRatio: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-105 text-sm focus:outline-none"
                  >
                    <option value="50:50">50:50 (Equal Parity)</option>
                    <option value="45:55">45:55 (Balanced)</option>
                    <option value="40:60">40:60</option>
                    <option value="35:65">35:65</option>
                    <option value="30:70">30:70</option>
                    <option value="60:40">60:40</option>
                    <option value="70:30">70:30</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="block text-xs text-slate-400 font-semibold border-b border-slate-800 pb-1">Age Distribution (%) - Must sum to 100%</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5 font-bold">Under 30</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={diversityForm.under30}
                        onChange={(e) => setDiversityForm({...diversityForm, under30: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5 font-bold">30 to 50</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={diversityForm.thirtyToFifty}
                        onChange={(e) => setDiversityForm({...diversityForm, thirtyToFifty: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5 font-bold">Over 50</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={diversityForm.over50}
                        onChange={(e) => setDiversityForm({...diversityForm, over50: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-4 border-t border-slate-850">
                  <button type="button" onClick={() => setEditingDept(null)} className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                  <button type="submit" className="px-3.5 py-2 bg-emerald-600 text-slate-955 rounded font-bold hover:bg-emerald-500">Save Metrics</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <div key={dept._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-emerald-500/20 transition duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-slate-200">{dept.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Code: {dept.code} &middot; Head: {dept.head || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleOpenDiversityEdit(dept)}
                    className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition"
                    title="Edit Diversity Ratios"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-550 block font-semibold mb-1">Gender Parity</span>
                    <span className="text-emerald-400 font-bold">{dept.diversityMetrics?.genderRatio || '50:50'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-550 block font-semibold mb-1">Employee Pool Size</span>
                    <span className="text-slate-200 font-bold">{dept.employeeCount || 0} Staff</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Age Band Distribution</span>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[10px] text-slate-450">Under 30</p>
                      <p className="font-semibold text-slate-250">{dept.diversityMetrics?.ageBands?.under30 || 30}%</p>
                    </div>
                    <div className="h-6 w-px bg-slate-850" />
                    <div>
                      <p className="text-[10px] text-slate-450">30 - 50</p>
                      <p className="font-semibold text-slate-250">{dept.diversityMetrics?.ageBands?.thirtyToFifty || 50}%</p>
                    </div>
                    <div className="h-6 w-px bg-slate-850" />
                    <div>
                      <p className="text-[10px] text-slate-450">Over 50</p>
                      <p className="font-semibold text-slate-250">{dept.diversityMetrics?.ageBands?.over50 || 20}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SOCIAL DASHBOARD & SETTINGS TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Key KPI Stats Dashboard */}
          {dashboardMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-450 uppercase block font-semibold tracking-wider">Avg Social ESG Score</span>
                <span className="text-2xl font-bold text-emerald-450">{dashboardMetrics.avgSocialScore || 0}%</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-450 uppercase block font-semibold tracking-wider">Training Completions</span>
                <span className="text-2xl font-bold text-slate-200">{dashboardMetrics.trainingCount || 0} Certs</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-450 uppercase block font-semibold tracking-wider">Active CSR Events</span>
                <span className="text-2xl font-bold text-slate-200">{dashboardMetrics.activeCsrCount || 0} Listed</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-450 uppercase block font-semibold tracking-wider">Total Submissions</span>
                <span className="text-2xl font-bold text-slate-200">{dashboardMetrics.totalParticipations || 0} Logs</span>
              </div>
            </div>
          )}

          {/* Settings Section (Evidence Required & Auto-Award) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Settings className="w-5 h-5 text-emerald-450" />
                <h3 className="text-base font-bold text-slate-200">ESG Gamification Switches</h3>
              </div>

              {/* Evidence Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Enforce Evidence Attachment</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Reject CSR approvals when no proof link or image is attached.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('csrEvidenceRequired', !esgSettings.csrEvidenceRequired)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition duration-200 ${
                    esgSettings.csrEvidenceRequired 
                      ? 'bg-rose-500/20 text-rose-455 border border-rose-500/30' 
                      : 'bg-slate-850 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {esgSettings.csrEvidenceRequired ? 'ENFORCED' : 'DISABLED'}
                </button>
              </div>

              {/* Auto Award Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Auto-Award Badges</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Award badges instantly when qualifications are met.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('badgeAutoAward', !esgSettings.badgeAutoAward)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition duration-200 ${
                    esgSettings.badgeAutoAward 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-850 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {esgSettings.badgeAutoAward ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Custom Sub Weights Configuration */}
            <form onSubmit={handleSaveWeights} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="w-5 h-5 text-emerald-450" />
                <h3 className="text-base font-bold text-slate-200">Social Score Weight Allocation</h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Determine the weight contribution of each social scorecard metric. All weights must sum up to exactly 100%.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">CSR Events (%)</label>
                  <input
                    type="number"
                    value={esgSettings.weightCsr}
                    onChange={(e) => setEsgSettings({ ...esgSettings, weightCsr: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Challenges (%)</label>
                  <input
                    type="number"
                    value={esgSettings.weightChallenge}
                    onChange={(e) => setEsgSettings({ ...esgSettings, weightChallenge: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Training (%)</label>
                  <input
                    type="number"
                    value={esgSettings.weightTraining}
                    onChange={(e) => setEsgSettings({ ...esgSettings, weightTraining: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Diversity (%)</label>
                  <input
                    type="number"
                    value={esgSettings.weightDiversity}
                    onChange={(e) => setEsgSettings({ ...esgSettings, weightDiversity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-450">
                  Current Sum: <span className={
                    (Number(esgSettings.weightCsr) + Number(esgSettings.weightChallenge) + Number(esgSettings.weightTraining) + Number(esgSettings.weightDiversity)) === 100 
                    ? 'text-emerald-450 font-bold' 
                    : 'text-rose-455 font-bold'
                  }>
                    {Number(esgSettings.weightCsr) + Number(esgSettings.weightChallenge) + Number(esgSettings.weightTraining) + Number(esgSettings.weightDiversity)}%
                  </span>
                </span>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-955 font-bold rounded-lg text-[11px] transition">
                  Apply Weights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CsrActivitiesPage;
