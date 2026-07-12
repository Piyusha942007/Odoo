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
  deleteEmployeeParticipation
} from '../../services/socialApi';
import { Calendar, Plus, Edit2, Trash2, Check, X, RefreshCw, UserCheck, CheckCircle, XCircle } from 'lucide-react';

function CsrActivitiesPage() {
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'participations'
  
  // Data lists
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [participations, setParticipations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states - Activity
  const [newAct, setNewAct] = useState({ title: '', category: '', department: '', description: '', date: '', points: 50, status: 'Active' });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', category: '', department: '', description: '', date: '', points: 50, status: 'Active' });

  // Form states - Participation
  const [newPart, setNewPart] = useState({ employee: '', activity: '', proof: '', completionDate: '' });
  const [showJoinForm, setShowJoinForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [actRes, catRes, deptRes, partRes] = await Promise.all([
        getCsrActivities(),
        getCategories(),
        getDepartments(),
        getEmployeeParticipations()
      ]);

      if (actRes.success) setActivities(actRes.data);
      if (partRes.success) setParticipations(partRes.data);
      
      if (catRes.success) {
        const filteredCats = catRes.data.filter(c => c.type === 'CSR Activity');
        setCategories(filteredCats);
        if (filteredCats.length > 0) {
          setNewAct(prev => ({ ...prev, category: filteredCats[0]._id }));
        }
      }
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0) {
          setNewAct(prev => ({ ...prev, department: deptRes.data[0]._id }));
        }
      }

      // Default selection for participation form
      if (actRes.success && actRes.data.length > 0) {
        setNewPart(prev => ({ ...prev, activity: actRes.data[0]._id }));
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

    if (status === 'Approved' && (!targetPart.proof || !targetPart.proof.trim())) {
      triggerError("Cannot approve participation without an attached proof file/link.");
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

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 p-6 md:p-8">
      
      {/* Alert Banners */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm">
          {successMsg}
        </div>
      )}

      {/* Title Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CSR & Social Center</h2>
          <p className="text-xs text-slate-400 mt-1">Manage CSR Activities and track Employee Participation logs.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'activities' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Activities Registry
        </button>
        <button
          onClick={() => setActiveTab('participations')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'participations' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          Employee Participations ({participations.length})
        </button>
      </div>

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

          {/* Form */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Department *</label>
                <select
                  required
                  value={newAct.department}
                  onChange={(e) => setNewAct(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id} className="bg-slate-900 text-slate-100">{d.name}</option>
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
                    onChange={(e) => setNewAct(prev => ({ ...prev, points: e.target.value }))}
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

          {/* Activities List */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-xl">No CSR activities registered.</div>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative">
                  {editingId === act._id ? (
                    <form onSubmit={handleUpdateActivity} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100">{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-slate-950 font-bold rounded text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded text-xs flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase tracking-wider">
                            {act.category?.name}
                          </span>
                          <h3 className="text-base font-bold mt-1 text-slate-100">{act.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Date: {new Date(act.date).toLocaleDateString()} &middot; Department: {act.department?.name || 'All'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-semibold rounded">
                          +{act.points} pts
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-2">{act.description}</p>
                      <div className="flex gap-2 justify-end mt-4 pt-2 border-t border-slate-800">
                        <button onClick={() => handleEditClick(act)} className="p-1 text-slate-400 hover:text-slate-200 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteActivity(act._id)} className="p-1 text-slate-400 hover:text-rose-450 transition">
                          <Trash2 className="w-4 h-4" />
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

      {activeTab === 'participations' && (
        <div>
          {/* Join Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Log Employee Participation
            </button>
          </div>

          {/* Join Form */}
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

          {/* Participations List Table */}
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
                        <div className="text-[10px] text-slate-500">{part.activity?.category?.name}</div>
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
                            <a href={part.proof} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-mono text-xs">
                              {part.proof.length > 30 ? part.proof.substring(0, 30) + '...' : part.proof}
                            </a>
                          )
                        ) : (
                          <span className="text-slate-600 italic text-xs">None provided</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{new Date(part.completionDate).toLocaleDateString()}</td>
                      <td className="p-3 text-emerald-400 font-bold">+{part.pointsEarned} pts</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          part.approvalStatus === 'Approved' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : part.approvalStatus === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-450'
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

    </div>
  );
}

export default CsrActivitiesPage;
