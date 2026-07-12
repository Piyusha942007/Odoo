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
  getChallengeCategories,
  getSettings,
  updateSettings,
  getBadges,
  createBadge,
  deleteBadge,
  getEarnedBadges,
  getEarnedBadgesByEmployee,
  getRewards,
  createReward,
  deleteReward,
  redeemReward,
  getRedemptions,
  getEmployeeProfile,
  getLeaderboard
} from '../services/gamificationApi';
import { getDepartments } from '../services/socialApi'; // Consume department master data from P1/Social
import { 
  Compass, Plus, Edit2, Trash2, Check, X, RefreshCw, Layers, 
  UserPlus, FileText, CheckCircle, XCircle, Award, Gift, Trophy, 
  TrendingUp, PlusCircle, Lock, Unlock, Settings as SettingsIcon, Shield, Star
} from 'lucide-react';

function Challenges() {
  const [activeTab, setActiveTab] = useState('employee-view'); // 'employee-view', 'admin-view', 'participations', 'badges-tab', 'rewards-tab', 'leaderboard-tab'
  
  // Data lists
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Gamification states
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [autoAwardSetting, setAutoAwardSetting] = useState(true);
  
  // Profile lookup
  const [profileName, setProfileName] = useState('');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeEarnedBadges, setEmployeeEarnedBadges] = useState([]);

  // Shop context employee
  const [shopEmployee, setShopEmployee] = useState('');
  const [shopProfile, setShopProfile] = useState(null);

  // Filter department for leaderboard
  const [leaderboardDept, setLeaderboardDept] = useState('');

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

  // Form states - Badge
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [newBadge, setNewBadge] = useState({ name: '', description: '', icon: 'Award', metric: 'XP', threshold: 100 });

  // Form states - Reward
  const [showCreateReward, setShowCreateReward] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', description: '', pointsRequired: 100, stock: 10 });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [challRes, catRes, partRes, deptRes, badgeRes, rewardRes, settingsRes, redempRes, leaderRes] = await Promise.all([
        getChallenges(),
        getChallengeCategories(),
        getChallengeParticipations(),
        getDepartments(),
        getBadges(),
        getRewards(),
        getSettings(),
        getRedemptions(),
        getLeaderboard(leaderboardDept)
      ]);

      if (challRes.success) setChallenges(challRes.data);
      if (partRes.success) setParticipations(partRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (badgeRes.success) setBadges(badgeRes.data);
      if (rewardRes.success) setRewards(rewardRes.data);
      if (settingsRes.success) setAutoAwardSetting(settingsRes.data.badgeAutoAward);
      if (redempRes.success) setRedemptions(redempRes.data);
      if (leaderRes.success) setLeaderboard(leaderRes.data);

      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !newChall.category) {
          setNewChall(prev => ({ ...prev, category: catRes.data[0]._id }));
        }
      }

      // Refresh profiles if loaded
      if (profileName) {
        handleSearchProfile(null, profileName);
      }
      if (shopEmployee) {
        fetchShopProfile(shopEmployee);
      }

    } catch (err) {
      setErrorMsg("Error loading challenge / gamification data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [leaderboardDept]);

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Settings Toggle
  const handleToggleAutoAward = async () => {
    try {
      const res = await updateSettings({ badgeAutoAward: !autoAwardSetting });
      if (res.success) {
        setAutoAwardSetting(res.data.badgeAutoAward);
        triggerSuccess(`Badge Auto-Award is now ${res.data.badgeAutoAward ? 'ENABLED' : 'DISABLED'}.`);
      }
    } catch (err) {
      triggerError("Error updating setting: " + err.message);
    }
  };

  // Search Profile
  const handleSearchProfile = async (e, customName = '') => {
    if (e) e.preventDefault();
    const targetName = customName || profileName;
    if (!targetName.trim()) return;

    try {
      const [profileRes, earnedRes] = await Promise.all([
        getEmployeeProfile(targetName),
        getEarnedBadgesByEmployee(targetName)
      ]);
      if (profileRes.success) {
        setEmployeeProfile(profileRes.data);
      }
      if (earnedRes.success) {
        setEmployeeEarnedBadges(earnedRes.data.map(eb => eb.badge?._id || eb.badge));
      }
    } catch (err) {
      triggerError("Employee profile not found or has no activity record.");
    }
  };

  // Fetch shop employee profile
  const fetchShopProfile = async (name) => {
    if (!name.trim()) {
      setShopProfile(null);
      return;
    }
    try {
      const res = await getEmployeeProfile(name);
      if (res.success) {
        setShopProfile(res.data);
      }
    } catch (err) {
      setShopProfile({ employee: name, currentPoints: 0, totalXp: 0 });
    }
  };

  // Create Badge
  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newBadge.name,
        description: newBadge.description,
        icon: newBadge.icon,
        unlockRule: {
          metric: newBadge.metric,
          threshold: Number(newBadge.threshold)
        }
      };
      const res = await createBadge(payload);
      if (res.success) {
        triggerSuccess(`Badge template "${res.data.name}" created!`);
        setShowCreateBadge(false);
        setNewBadge({ name: '', description: '', icon: 'Award', metric: 'XP', threshold: 100 });
        loadData();
      }
    } catch (err) {
      triggerError("Error creating badge: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete Badge
  const handleDeleteBadge = async (id) => {
    if (!window.confirm("Delete this badge template and all earned records for it?")) return;
    try {
      const res = await deleteBadge(id);
      if (res.success) {
        triggerSuccess("Badge deleted successfully.");
        loadData();
      }
    } catch (err) {
      triggerError(err.message);
    }
  };

  // Create Reward
  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      const res = await createReward(newReward);
      if (res.success) {
        triggerSuccess(`Reward "${res.data.name}" added to catalog.`);
        setShowCreateReward(false);
        setNewReward({ name: '', description: '', pointsRequired: 100, stock: 10 });
        loadData();
      }
    } catch (err) {
      triggerError("Error creating reward: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete Reward
  const handleDeleteReward = async (id) => {
    if (!window.confirm("Remove this reward from the catalog?")) return;
    try {
      const res = await deleteReward(id);
      if (res.success) {
        triggerSuccess("Reward removed.");
        loadData();
      }
    } catch (err) {
      triggerError(err.message);
    }
  };

  // Redeem Reward
  const handleRedeem = async (rewardId) => {
    if (!shopEmployee.trim()) {
      triggerError("Please type in an employee name/ID in the points checker first.");
      return;
    }
    try {
      const res = await redeemReward(shopEmployee, rewardId);
      if (res.success) {
        triggerSuccess(`Successfully redeemed reward! ${res.data.reward.pointsRequired} points deducted.`);
        loadData();
      }
    } catch (err) {
      triggerError(err.response?.data?.message || err.message);
    }
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

  // Join Challenge
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

  // Helper to render badge icon dynamically
  const renderBadgeIcon = (iconName, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Trophy': return <Trophy className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Star': return <Star className={className} />;
      case 'Compass': return <Compass className={className} />;
      default: return <Award className={className} />;
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
          <h2 className="text-2xl font-bold tracking-tight">Gamification & CSR Challenges</h2>
          <p className="text-xs text-slate-400 mt-1">Sustainably engage employees, track achievements, award Badges, and redeem Rewards.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('employee-view')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'employee-view' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Challenges
        </button>
        <button
          onClick={() => setActiveTab('admin-view')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'admin-view' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Challenge Creator & Lifecycle
        </button>
        <button
          onClick={() => setActiveTab('participations')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'participations' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Participation Logs ({participations.length})
        </button>
        <button
          onClick={() => setActiveTab('badges-tab')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'badges-tab' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Badges & Auto-Award
        </button>
        <button
          onClick={() => setActiveTab('rewards-tab')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'rewards-tab' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Rewards Shop
        </button>
        <button
          onClick={() => setActiveTab('leaderboard-tab')}
          className={`pb-3 text-sm font-semibold border-b-2 transition duration-200 ${
            activeTab === 'leaderboard-tab' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* TABS CONTENT */}

      {/* 1. ACTIVE CHALLENGES */}
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

          {challenges.filter(c => c.status === 'Active').length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-8 rounded-2xl text-center">
              <p className="text-slate-400 text-sm">No Active challenges available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.filter(c => c.status === 'Active').map((chall) => (
                <div key={chall._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[10px] rounded-full font-bold uppercase tracking-wider">
                        {chall.category?.name || 'Challenge'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        chall.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        chall.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-450'
                      }`}>
                        {chall.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">{chall.title}</h3>
                    <p className="text-xs text-slate-450 leading-relaxed mb-4">{chall.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-850">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                      <div>
                        Reward: <span className="font-bold text-emerald-450">+{chall.xp} XP</span>
                      </div>
                      <div>
                        Deadline: <span className="font-semibold text-slate-300">{new Date(chall.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedChallenge(chall)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 font-bold text-xs rounded-xl transition duration-200"
                    >
                      <UserPlus className="w-4 h-4" />
                      Participate / Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CHALLENGE CREATOR & LIFECYCLE */}
      {activeTab === 'admin-view' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-200">Manage Challenges</h3>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs transition duration-200"
            >
              {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreate ? 'Close Form' : 'New Challenge Template'}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateChallenge} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-200">Create New Challenge Template</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Challenge Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Green Commute Week"
                    value={newChall.title}
                    onChange={(e) => setNewChall({...newChall, title: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Category *</label>
                  <select
                    value={newChall.category}
                    onChange={(e) => setNewChall({...newChall, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  placeholder="Describe the challenge goals and parameters..."
                  value={newChall.description}
                  onChange={(e) => setNewChall({...newChall, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm h-20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">XP Reward *</label>
                  <input
                    type="number"
                    required
                    value={newChall.xp}
                    onChange={(e) => setNewChall({...newChall, xp: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Difficulty</label>
                  <select
                    value={newChall.difficulty}
                    onChange={(e) => setNewChall({...newChall, difficulty: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={newChall.deadline}
                    onChange={(e) => setNewChall({...newChall, deadline: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="evidenceRequired"
                  checked={newChall.evidenceRequired}
                  onChange={(e) => setNewChall({...newChall, evidenceRequired: e.target.checked})}
                  className="rounded border-slate-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-slate-950"
                />
                <label htmlFor="evidenceRequired" className="text-xs text-slate-350 select-none">Require proof attachment (evidence required flag)</label>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-505 text-slate-950 rounded font-bold text-xs"
              >
                Create Template (Draft)
              </button>
            </form>
          )}

          {/* Lifecycle list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-400">
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">XP Reward</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Deadline</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Workflow Transitions</th>
                    <th className="p-3.5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((chall) => (
                    <tr key={chall._id} className="border-b border-slate-850 hover:bg-slate-850/40 transition">
                      <td className="p-3.5 font-bold text-slate-200">{chall.title}</td>
                      <td className="p-3.5 text-slate-400">{chall.category?.name || 'N/A'}</td>
                      <td className="p-3.5 font-mono text-emerald-450">+{chall.xp} XP</td>
                      <td className="p-3.5 text-slate-300">{chall.difficulty}</td>
                      <td className="p-3.5 text-slate-400">{new Date(chall.deadline).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          chall.status === 'Draft' ? 'bg-slate-800 text-slate-400' :
                          chall.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                          chall.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' :
                          chall.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {chall.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {chall.status === 'Draft' && (
                            <button onClick={() => handleTransition(chall._id, 'Active')} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 font-bold text-[9px] uppercase">Activate</button>
                          )}
                          {chall.status === 'Active' && (
                            <button onClick={() => handleTransition(chall._id, 'Under Review')} className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/30 font-bold text-[9px] uppercase">Under Review</button>
                          )}
                          {chall.status === 'Under Review' && (
                            <>
                              <button onClick={() => handleTransition(chall._id, 'Completed')} className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded hover:bg-indigo-600/30 font-bold text-[9px] uppercase">Complete</button>
                              <button onClick={() => handleTransition(chall._id, 'Active')} className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-bold text-[9px] uppercase">Re-activate</button>
                            </>
                          )}
                          {chall.status === 'Archived' && (
                            <>
                              <button onClick={() => handleTransition(chall._id, 'Draft')} className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-bold text-[9px] uppercase">Revert to Draft</button>
                              <button onClick={() => handleTransition(chall._id, 'Active')} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 font-bold text-[9px] uppercase">Activate</button>
                            </>
                          )}
                          {chall.status !== 'Archived' && (
                            <button onClick={() => handleTransition(chall._id, 'Archived')} className="px-2 py-1 bg-rose-950 text-rose-400 rounded hover:bg-rose-900 font-bold text-[9px] uppercase">Archive</button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <button onClick={() => handleDeleteChallenge(chall._id)} className="p-1 text-slate-500 hover:text-rose-450 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PARTICIPATION LOGS */}
      {activeTab === 'participations' && (
        <div className="space-y-6">
          {/* Inline Edit Modal */}
          {updatingPartId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <form onSubmit={handleProgressSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
                <h3 className="text-base font-bold text-slate-100">Log Progress</h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Progress Percentage (0 - 100)%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={progressForm.progress}
                    onChange={(e) => setProgressForm({...progressForm, progress: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Proof Link / Text Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Photo link or completion summary"
                    value={progressForm.proof}
                    onChange={(e) => setProgressForm({...progressForm, proof: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button type="button" onClick={() => setUpdatingPartId(null)} className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded font-semibold">Cancel</button>
                  <button type="submit" className="px-3.5 py-2 bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500">Save Progress</button>
                </div>
              </form>
            </div>
          )}

          {participations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-8 rounded-2xl text-center">
              <p className="text-slate-400 text-sm">No employee participation logs available.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-400">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Challenge</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Proof Evidence</th>
                    <th className="p-3">Points/XP Awarded</th>
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
                          <span className="ml-2 px-1.5 py-0.5 bg-rose-500/10 text-rose-455 border border-rose-500/20 text-[9px] rounded font-bold uppercase">
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
                          part.approvalStatus === 'Rejected' ? 'bg-rose-500/10 text-rose-455' :
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
                                className="p-1 text-rose-455 hover:text-rose-400 transition"
                                title="Reject Submission"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteParticipation(part._id)}
                            className="p-1 text-slate-500 hover:text-rose-455 transition"
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

      {/* 4. BADGES & SETTINGS */}
      {activeTab === 'badges-tab' && (
        <div className="space-y-6">
          {/* Settings Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SettingsIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-200">Auto-Award Settings</h3>
              </div>
              <p className="text-xs text-slate-400">When enabled, badges unlock automatically as soon as an employee qualifies.</p>
            </div>
            <button
              onClick={handleToggleAutoAward}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
                autoAwardSetting 
                  ? 'bg-emerald-600 text-slate-950 hover:bg-emerald-500' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {autoAwardSetting ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {autoAwardSetting ? 'Auto-Award: ON' : 'Auto-Award: OFF'}
            </button>
          </div>

          {/* Badge Search profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-200 mb-2">Check Employee Earned Badges</h3>
            <form onSubmit={handleSearchProfile} className="flex gap-2 max-w-md">
              <input
                type="text"
                required
                placeholder="Enter employee name/ID..."
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded font-bold text-xs transition duration-200"
              >
                Search
              </button>
            </form>

            {employeeProfile && (
              <div className="mt-4 p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    Employee: <span className="font-bold text-slate-200">{employeeProfile.employee}</span>
                  </div>
                  <div>
                    Department: <span className="font-semibold text-emerald-400">{employeeProfile.departmentName}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Total XP</p>
                    <p className="text-sm font-bold text-emerald-450">{employeeProfile.totalXp} XP</p>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Challenges Completed</p>
                    <p className="text-sm font-bold text-slate-200">{employeeProfile.completedChallengesCount}</p>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">CSR Completed</p>
                    <p className="text-sm font-bold text-slate-200">{employeeProfile.completedCsrActivitiesCount}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Badge list & creation */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-200">Badges Library</h3>
              <button
                onClick={() => setShowCreateBadge(!showCreateBadge)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs transition duration-200"
              >
                {showCreateBadge ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showCreateBadge ? 'Close Form' : 'New Badge Template'}
              </button>
            </div>

            {showCreateBadge && (
              <form onSubmit={handleCreateBadge} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-xl space-y-4">
                <h4 className="text-sm font-bold text-slate-200">Create Badge Template</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Badge Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ESG Champion"
                      value={newBadge.name}
                      onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Icon</label>
                    <select
                      value={newBadge.icon}
                      onChange={(e) => setNewBadge({...newBadge, icon: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    >
                      <option value="Award">Award Badge</option>
                      <option value="Trophy">Trophy</option>
                      <option value="Shield">Shield</option>
                      <option value="Star">Star</option>
                      <option value="Compass">Compass</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unlocked by completing 5 sustainability challenges"
                    value={newBadge.description}
                    onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Unlock Metric *</label>
                    <select
                      value={newBadge.metric}
                      onChange={(e) => setNewBadge({...newBadge, metric: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    >
                      <option value="XP">Total XP Earned</option>
                      <option value="CompletedChallenges">Completed Challenges</option>
                      <option value="CompletedCsrActivities">Completed CSR Activities</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Unlock Threshold Value *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newBadge.threshold}
                      onChange={(e) => setNewBadge({...newBadge, threshold: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-505 text-slate-950 rounded font-bold text-xs"
                >
                  Create Badge
                </button>
              </form>
            )}

            {badges.length === 0 ? (
              <div className="bg-slate-900 border border-slate-850 p-8 rounded-2xl text-center">
                <p className="text-slate-400 text-sm">No badges available. Seed or create them using the button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {badges.map((b) => {
                  const isEarned = employeeProfile && employeeEarnedBadges.includes(b._id);
                  const showUnlockStatus = employeeProfile !== null;
                  return (
                    <div 
                      key={b._id} 
                      className={`relative bg-slate-900 border rounded-2xl p-6 text-center transition duration-300 ${
                        showUnlockStatus 
                          ? isEarned 
                            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' 
                            : 'border-slate-800 opacity-40' 
                          : 'border-slate-800 hover:border-emerald-500/20'
                      }`}
                    >
                      {showUnlockStatus && (
                        <span className={`absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isEarned ? 'bg-emerald-500/20 text-emerald-450' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isEarned ? 'Unlocked' : 'Locked'}
                        </span>
                      )}
                      <div className={`mx-auto w-12 h-12 rounded-full mb-3 flex items-center justify-center ${
                        showUnlockStatus && !isEarned ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 text-slate-950 shadow-md'
                      }`}>
                        {renderBadgeIcon(b.icon, "w-6 h-6")}
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mb-1">{b.name}</h4>
                      <p className="text-[11px] text-slate-400 mb-3 h-8 leading-tight overflow-hidden">{b.description}</p>
                      
                      <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-450">
                        Rule: <span className="font-semibold text-slate-350">{b.unlockRule?.metric} &gt;= {b.unlockRule?.threshold}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteBadge(b._id)} 
                        className="mt-3 text-[10px] text-slate-650 hover:text-rose-455 transition"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. REWARDS SHOP */}
      {activeTab === 'rewards-tab' && (
        <div className="space-y-6">
          {/* Shop Context / Points Checker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-200 mb-1">Redeem Rewards Shop</h3>
            <p className="text-xs text-slate-450 mb-3">Select or enter the employee name to check points and log purchases.</p>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                required
                placeholder="Enter shopper employee name..."
                value={shopEmployee}
                onChange={(e) => {
                  setShopEmployee(e.target.value);
                  fetchShopProfile(e.target.value);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
              />
              <button
                onClick={() => fetchShopProfile(shopEmployee)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded font-bold text-xs"
              >
                Refresh
              </button>
            </div>

            {shopProfile && (
              <div className="mt-4 p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Current Shopper: <span className="font-bold text-slate-200">{shopProfile.employee}</span></p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Unified ESG Points Ledger</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold">Points Balance</p>
                  <p className="text-xl font-bold text-emerald-450">{shopProfile.currentPoints || 0} pts <span className="text-[10px] text-slate-500 font-medium">({shopProfile.totalXp || 0} total XP)</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Reward Catalog */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-200">Redeemable Rewards Catalog</h3>
              <button
                onClick={() => setShowCreateReward(!showCreateReward)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs transition duration-200"
              >
                {showCreateReward ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showCreateReward ? 'Close Form' : 'New Reward'}
              </button>
            </div>

            {showCreateReward && (
              <form onSubmit={handleCreateReward} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-xl space-y-4">
                <h4 className="text-sm font-bold text-slate-200">Create Reward Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Reward Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reusable Eco Thermos"
                      value={newReward.name}
                      onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="High quality steel thermos with logo"
                      value={newReward.description}
                      onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Points Cost *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newReward.pointsRequired}
                      onChange={(e) => setNewReward({...newReward, pointsRequired: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Initial Stock Level *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newReward.stock}
                      onChange={(e) => setNewReward({...newReward, stock: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-505 text-slate-950 rounded font-bold text-xs"
                >
                  Save Reward Item
                </button>
              </form>
            )}

            {rewards.length === 0 ? (
              <div className="bg-slate-900 border border-slate-850 p-8 rounded-2xl text-center">
                <p className="text-slate-400 text-sm">No reward items seeded. Create a new reward above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards.map((r) => {
                  const pointsAvailable = shopProfile?.currentPoints || 0;
                  const canRedeem = pointsAvailable >= r.pointsRequired && r.stock > 0;
                  return (
                    <div key={r._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/20 transition duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-slate-200">{r.name}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            r.stock > 0 ? 'bg-emerald-500/10 text-emerald-450' : 'bg-rose-500/10 text-rose-455'
                          }`}>
                            {r.stock > 0 ? `${r.stock} In Stock` : 'Out of Stock'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-450 leading-relaxed mb-4">{r.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-850">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] text-slate-400">Cost:</span>
                          <span className="text-sm font-bold text-emerald-450">{r.pointsRequired} Points</span>
                        </div>
                        <button
                          disabled={!canRedeem}
                          onClick={() => handleRedeem(r._id)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition duration-200 ${
                            canRedeem 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950' 
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Gift className="w-4 h-4" />
                          {r.stock <= 0 ? 'Out of Stock' : !shopProfile ? 'Type Shopper Name' : 'Redeem Item'}
                        </button>
                        <div className="text-center mt-3">
                          <button 
                            onClick={() => handleDeleteReward(r._id)} 
                            className="text-[10px] text-slate-650 hover:text-rose-455 transition"
                          >
                            Remove Reward
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Redemption Records */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-200 mb-4">Recent Redemptions Log</h3>
            {redemptions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No redemptions logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-400">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Reward Item</th>
                      <th className="p-3">Points Spent</th>
                      <th className="p-3 text-right">Redeemed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((red) => (
                      <tr key={red._id} className="border-b border-slate-850 hover:bg-slate-850/40 transition">
                        <td className="p-3 font-semibold text-slate-200">{red.employee}</td>
                        <td className="p-3 text-slate-400">{red.reward?.name || 'Unknown Reward'}</td>
                        <td className="p-3 font-mono text-emerald-450 font-bold">-{red.pointsSpent} Points</td>
                        <td className="p-3 text-slate-500 text-right">{new Date(red.redeemedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. LEADERBOARD */}
      {activeTab === 'leaderboard-tab' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-200">ESG Leaderboard</h3>
                <p className="text-xs text-slate-450">Ranked by total earned points & XP across EcoSphere.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold shrink-0">Filter Department:</label>
                <select
                  value={leaderboardDept}
                  onChange={(e) => setLeaderboardDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No scores to calculate. Approve some participations first!
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                      <th className="p-4 w-16 text-center">Rank</th>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Primary Department</th>
                      <th className="p-4 text-center">Completed CSR</th>
                      <th className="p-4 text-center">Completed Challenges</th>
                      <th className="p-4 text-right">Points Spent</th>
                      <th className="p-4 text-right">Total XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => (
                      <tr key={item.employee} className="border-b border-slate-850 hover:bg-slate-900/50 transition">
                        <td className="p-4 text-center font-bold text-slate-400">
                          {index === 0 ? (
                            <span className="inline-flex w-6 h-6 items-center justify-center bg-yellow-500/20 text-yellow-450 border border-yellow-500/30 rounded-full text-[10px]">1st</span>
                          ) : index === 1 ? (
                            <span className="inline-flex w-6 h-6 items-center justify-center bg-slate-300/20 text-slate-200 border border-slate-300/30 rounded-full text-[10px]">2nd</span>
                          ) : index === 2 ? (
                            <span className="inline-flex w-6 h-6 items-center justify-center bg-amber-600/20 text-amber-500 border border-amber-600/30 rounded-full text-[10px]">3rd</span>
                          ) : (
                            index + 1
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-200 text-sm">{item.employee}</td>
                        <td className="p-4 font-semibold text-emerald-450">{item.departmentName}</td>
                        <td className="p-4 text-center text-slate-350">{item.completedCsrActivitiesCount}</td>
                        <td className="p-4 text-center text-slate-350">{item.completedChallengesCount}</td>
                        <td className="p-4 text-right text-rose-455 font-mono">-{item.spentPoints} pts</td>
                        <td className="p-4 text-right text-emerald-400 font-bold font-mono text-sm">+{item.totalXp} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Challenges;
