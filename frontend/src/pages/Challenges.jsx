import React, { useEffect, useState } from 'react';
import { 
  getChallenges, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge,
  getChallengeParticipations,
  createChallengeParticipation,
  updateChallengeParticipation,
  deleteChallengeParticipation,
  getChallengeCategories
} from '../services/gamificationApi';
import { Compass, Plus, Edit2, Trash2, Check, X, RefreshCw, Layers, UserPlus, FileText, CheckCircle, XCircle } from 'lucide-react';

function Challenges() {
  const [activeTab, setActiveTab] = useState('employee-view'); // 'employee-view', 'admin-view', or 'participations'
  
  // Data lists
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [participations, setParticipations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states - Challenge
  const [newChall, setNewChall] = useState({ title: '', category: '', description: '', xp: 100, difficulty: 'Medium', evidenceRequired: false, deadline: '', status: 'Draft' });
  const [showCreate, setShowCreate] = useState(false);

  // Form states - Join / Participate
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [employeeName, setEmployeeName] = useState('');

  // Form states - Update Progress
  const [updatingPartId, setUpdatingPartId] = useState(null);
  const [progressForm, setProgressForm] = useState({ progress: 0, proof: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [challRes, catRes, partRes] = await Promise.all([
        getChallenges(),
        getChallengeCategories(),
        getChallengeParticipations()
      ]);

      if (challRes.success) setChallenges(challRes.data);
      if (partRes.success) setParticipations(partRes.data);
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setNewChall(prev => ({ ...prev, category: catRes.data[0]._id }));
        }
      }
    } catch (err) {
      setErrorMsg("Error loading challenge data: " + err.message);
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

  // Challenge Lifecycle Transition
  const handleTransition = async (id, nextStatus) => {
    try {
      const res = await updateChallenge(id, { status: nextStatus });
      if (res.success) {
        triggerSuccess(`Challenge status updated to ${nextStatus}!`);
        loadData();
      }
    } catch (err) {
      triggerError(err.response?.data?.message || err.message);
    }
  };

  // Create Challenge
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!newChall.title || !newChall.category || !newChall.deadline) {
      triggerError("Title, Category, and Deadline are required.");
      return;
    }

    try {
      const res = await createChallenge(newChall);
      if (res.success) {
        setNewChall({
          title: '',
          category: categories[0]?._id || '',
          description: '',
          xp: 100,
          difficulty: 'Medium',
          evidenceRequired: false,
          deadline: '',
          status: 'Draft'
        });
        setShowCreate(false);
        triggerSuccess("Challenge created as Draft!");
        loadData();
      }
    } catch (err) {
      triggerError("Error creating challenge: " + err.message);
    }
  };

  // Join Challenge (Employee Action)
  const handleJoinChallenge = async (e) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      triggerError("Please write your employee name.");
      return;
    }

    try {
      const res = await createChallengeParticipation({
        challenge: selectedChallenge._id,
        employee: employeeName,
        progress: 0,
        proof: ''
      });
      if (res.success) {
        setEmployeeName('');
        setSelectedChallenge(null);
        triggerSuccess(`Joined challenge successfully! View progress in Participations tab.`);
        loadData();
      }
    } catch (err) {
      triggerError(err.response?.data?.message || err.message);
    }
  };

  // Update Progress / Proof
  const handleProgressSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateChallengeParticipation(updatingPartId, {
        progress: progressForm.progress,
        proof: progressForm.proof
      });
      if (res.success) {
        setUpdatingPartId(null);
        triggerSuccess("Progress updated successfully!");
        loadData();
      }
    } catch (err) {
      triggerError(err.message);
    }
  };

  // Approver Action
  const handleApprovalDecision = async (id, status) => {
    const targetPart = participations.find(p => p._id === id);
    if (!targetPart) return;

    if (status === 'Approved' && targetPart.challenge.evidenceRequired && (!targetPart.proof || !targetPart.proof.trim())) {
      triggerError("Cannot approve: This challenge requires proof evidence file/link.");
      return;
    }

    try {
      const res = await updateChallengeParticipation(id, {
        approvalStatus: status,
        proof: targetPart.proof
      });
      if (res.success) {
        triggerSuccess(`Challenge participation ${status.toLowerCase()}!`);
        loadData();
      }
    } catch (err) {
      triggerError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteParticipation = async (id) => {
    if (!window.confirm("Delete this challenge log?")) return;
    try {
      const res = await deleteChallengeParticipation(id);
      if (res.success) {
        triggerSuccess("Participation log deleted.");
        loadData();
      }
    } catch (err) {
      triggerError("Error deleting log: " + err.message);
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm("Permanently delete this Challenge template?")) return;
    try {
      const res = await deleteChallenge(id);
      if (res.success) {
        triggerSuccess("Challenge template deleted.");
        loadData();
      }
    } catch (err) {
      triggerError("Error deleting challenge: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 p-6 md:p-8">
      
      {/* Alerts */}
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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sustainability Challenges</h2>
          <p className="text-xs text-slate-400 mt-1">Participate in ESG challenges, track progress and earn XP.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('employee-view')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'employee-view' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Challenges
        </button>
        <button
          onClick={() => setActiveTab('admin-view')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'admin-view' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Challenge Creator & Lifecycle
        </button>
        <button
          onClick={() => setActiveTab('participations')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'participations' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Participation Logs ({participations.length})
        </button>
      </div>

      {activeTab === 'employee-view' && (
        <div>
          {/* Join Overlay Modal */}
          {selectedChallenge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <form onSubmit={handleJoinChallenge} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full">
                <h3 className="text-base font-bold text-slate-100 mb-2">Join: {selectedChallenge.title}</h3>
                <p className="text-xs text-slate-400 mb-4">Enter your details to start logging participation progress.</p>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Employee Name/ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm mb-4 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button type="button" onClick={() => setSelectedChallenge(null)} className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                  <button type="submit" className="px-3.5 py-2 bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500">Confirm & Join</button>
                </div>
              </form>
            </div>
          )}

          {/* Active Challenges List */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading active challenges...</div>
          ) : challenges.filter(c => c.status === 'Active').length === 0 ? (
            <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-xl">No active challenges available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.filter(c => c.status === 'Active').map((chall) => (
                <div key={chall._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase">
                        {chall.category?.name || 'Sectors'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        chall.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        chall.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-450'
                      }`}>
                        {chall.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{chall.title}</h3>
                    <p className="text-slate-350 text-xs mt-2 leading-relaxed">{chall.description}</p>
                    <div className="text-[11px] text-slate-500 mt-3 font-semibold space-y-1">
                      <div>Deadline: {new Date(chall.deadline).toLocaleDateString()}</div>
                      <div>Evidence Required: {chall.evidenceRequired ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-4">
                    <span className="text-emerald-400 text-sm font-bold">+{chall.xp} XP</span>
                    <button
                      onClick={() => setSelectedChallenge(chall)}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Join Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin-view' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Challenge Template
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateChallenge} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Challenge Title *</label>
                <input
                  type="text"
                  required
                  value={newChall.title}
                  onChange={(e) => setNewChall(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Category *</label>
                <select
                  required
                  value={newChall.category}
                  onChange={(e) => setNewChall(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">XP Reward</label>
                <input
                  type="number"
                  value={newChall.xp}
                  onChange={(e) => setNewChall(prev => ({ ...prev, xp: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Difficulty</label>
                  <select
                    value={newChall.difficulty}
                    onChange={(e) => setNewChall(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm"
                  >
                    <option value="Easy" className="bg-slate-900 text-slate-100">Easy</option>
                    <option value="Medium" className="bg-slate-900 text-slate-100">Medium</option>
                    <option value="Hard" className="bg-slate-900 text-slate-100">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={newChall.deadline}
                    onChange={(e) => setNewChall(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="evidenceRequired"
                  checked={newChall.evidenceRequired}
                  onChange={(e) => setNewChall(prev => ({ ...prev, evidenceRequired: e.target.checked }))}
                  className="w-4 h-4 bg-slate-950 border border-slate-800 rounded"
                />
                <label htmlFor="evidenceRequired" className="text-xs text-slate-400 font-semibold cursor-pointer">Require Evidence Submission</label>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  value={newChall.description}
                  onChange={(e) => setNewChall(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:outline-none"
                />
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-xs bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500">Save Challenge</button>
              </div>
            </form>
          )}

          {/* Admin Table of All Challenges */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading records...</div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-slate-550">No Challenges template found.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3">Challenge Details</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">XP Reward</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((chall) => (
                    <tr key={chall._id} className="border-b border-slate-850 hover:bg-slate-850 transition">
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{chall.title}</div>
                        <div className="text-[10px] text-slate-500">{chall.description}</div>
                      </td>
                      <td className="p-3 text-slate-400">{chall.category?.name}</td>
                      <td className="p-3 text-emerald-450 font-bold">+{chall.xp} XP</td>
                      <td className="p-3 text-slate-400">{new Date(chall.deadline).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          chall.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                          chall.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' :
                          chall.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' :
                          chall.status === 'Archived' ? 'bg-slate-500/20 text-slate-400' :
                          'bg-slate-850 text-slate-400'
                        }`}>
                          {chall.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {chall.status === 'Draft' && (
                            <button
                              onClick={() => handleTransition(chall._id, 'Active')}
                              className="px-2 py-0.5 bg-emerald-600/20 text-emerald-450 text-[10px] rounded border border-emerald-500/30 hover:bg-emerald-600/30"
                            >
                              Activate
                            </button>
                          )}
                          {chall.status === 'Active' && (
                            <button
                              onClick={() => handleTransition(chall._id, 'Under Review')}
                              className="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-[10px] rounded border border-amber-500/30 hover:bg-amber-600/30"
                            >
                              Under Review
                            </button>
                          )}
                          {chall.status === 'Under Review' && (
                            <>
                              <button
                                onClick={() => handleTransition(chall._id, 'Completed')}
                                className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] rounded border border-blue-500/30 hover:bg-blue-600/30"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleTransition(chall._id, 'Active')}
                                className="px-2 py-0.5 bg-slate-800 text-slate-350 text-[10px] rounded border border-slate-700 hover:bg-slate-750"
                              >
                                Re-Activate
                              </button>
                            </>
                          )}
                          {chall.status !== 'Archived' && (
                            <button
                              onClick={() => handleTransition(chall._id, 'Archived')}
                              className="px-2 py-0.5 bg-rose-600/20 text-rose-450 text-[10px] rounded border border-rose-500/30 hover:bg-rose-600/30"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteChallenge(chall._id)}
                            className="p-1 text-slate-500 hover:text-rose-450 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'participations' && (
        <div>
          {/* Update Progress Modal Overlay */}
          {updatingPartId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4">
              <form onSubmit={handleProgressSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full">
                <h3 className="text-base font-bold text-slate-100 mb-2">Update Participation</h3>
                <p className="text-xs text-slate-400 mb-4">Submit progress completion rate and required proof.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Progress Percentage (0-100) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={progressForm.progress}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Proof Link / Evidence</label>
                    <input
                      type="text"
                      placeholder="e.g. https://corp.eco/proof.png"
                      value={progressForm.proof}
                      onChange={(e) => setProgressForm(prev => ({ ...prev, proof: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs mt-6">
                  <button type="button" onClick={() => setUpdatingPartId(null)} className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                  <button type="submit" className="px-3.5 py-2 bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500">Save Progress</button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading records...</div>
          ) : participations.length === 0 ? (
            <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-xl">No employees joined any challenges yet.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Challenge Title</th>
                    <th className="p-3">Progress (%)</th>
                    <th className="p-3">Proof Submission</th>
                    <th className="p-3">XP Earned</th>
                    <th className="p-3">Approval</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.map((part) => (
                    <tr key={part._id} className="border-b border-slate-850 hover:bg-slate-850 transition">
                      <td className="p-3 font-semibold text-slate-200">{part.employee}</td>
                      <td className="p-3 text-slate-350">
                        {part.challenge?.title || 'Unknown Challenge'}
                        {part.challenge?.evidenceRequired && (
                          <span className="ml-2 px-1.5 py-0.5 bg-rose-500/10 text-rose-450 border border-rose-500/20 text-[9px] rounded font-bold uppercase">
                            Req Evidence
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-950 border border-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${part.progress}%` }}></div>
                          </div>
                          <span className="font-semibold text-slate-300">{part.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-450">
                        {part.proof ? (
                          <a href={part.proof} target="_blank" rel="noreferrer" className="text-emerald-450 hover:underline">
                            {part.proof.length > 25 ? part.proof.substring(0, 25) + '...' : part.proof}
                          </a>
                        ) : (
                          <span className="text-slate-650 italic">None</span>
                        )}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">+{part.xpAwarded} XP</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          part.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          part.approvalStatus === 'Rejected' ? 'bg-rose-500/10 text-rose-450' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {part.approvalStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          {part.approvalStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setUpdatingPartId(part._id);
                                  setProgressForm({ progress: part.progress, proof: part.proof || '' });
                                }}
                                className="p-1 text-slate-400 hover:text-slate-200 transition"
                                title="Update Progress"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
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
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteParticipation(part._id)}
                            className="p-1 text-slate-500 hover:text-rose-450 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

export default Challenges;
