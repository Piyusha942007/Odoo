import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Settings, 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  RefreshCw, 
  CheckCircle2, 
  Info,
  ToggleLeft,
  ToggleRight,
  ShieldAlert
} from 'lucide-react';

function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('score');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    complianceIssueEnabled: true,
    policyReminderEnabled: true,
    approvalDecisionEnabled: true,
    badgeUnlockEnabled: true
  });
  const [scoreData, setScoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingScore, setIsRefreshingScore] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/governance`;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Notifications
      const notifsRes = await axios.get(`${API_URL}/notifications`);
      if (notifsRes.data?.success) {
        setNotifications(notifsRes.data.data);
      }

      // Fetch Settings
      const settingsRes = await axios.get(`${API_URL}/notifications/settings`);
      if (settingsRes.data?.success) {
        setSettings(settingsRes.data.data);
      }

      // Fetch Governance Score
      const scoreRes = await axios.get(`${API_URL}/score`);
      if (scoreRes.data?.success) {
        setScoreData(scoreRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecalculateScore = async () => {
    try {
      setIsRefreshingScore(true);
      const res = await axios.get(`${API_URL}/score`);
      if (res.data?.success) {
        setScoreData(res.data.data);
      }
    } catch (err) {
      console.error('Error recalculating governance score:', err);
      alert('Failed to recalculate score.');
    } finally {
      setIsRefreshingScore(false);
    }
  };

  const handleToggleRead = async (notificationId, currentReadStatus) => {
    try {
      const res = await axios.put(`${API_URL}/notifications/${notificationId}`, { read: !currentReadStatus });
      if (res.data?.success) {
        setNotifications(notifications.map(n => n._id === notificationId ? res.data.data : n));
      }
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const res = await axios.delete(`${API_URL}/notifications/${notificationId}`);
      if (res.data?.success) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleToggleSetting = async (settingKey) => {
    const updatedSettings = {
      ...settings,
      [settingKey]: !settings[settingKey]
    };
    
    // Optimistic UI update
    setSettings(updatedSettings);

    try {
      await axios.put(`${API_URL}/notifications/settings`, updatedSettings);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      // Revert state if request failed
      setSettings(settings);
      alert('Failed to save settings changes.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Compliance Issue':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'Approval Decision':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'Policy Reminder':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'Badge Unlock':
        return <Award className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20';
    if (score >= 50) return 'text-yellow-400 border-yellow-500/20';
    return 'text-red-400 border-red-500/20';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Governance Score & Preferences</h1>
          <p className="text-slate-400 mt-2 font-medium">Analyze ESG governance performance ratings and adjust notification preferences.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900">
        <button 
          onClick={() => setActiveTab('score')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'score' 
              ? 'border-emerald-500 text-emerald-400 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <ShieldCheck size={16} />
          Governance Rating Score
        </button>
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inbox' 
              ? 'border-emerald-500 text-emerald-400 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Bell size={16} />
          Inbox ({unreadCount > 0 ? `${unreadCount} new` : notifications.length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'settings' 
              ? 'border-emerald-500 text-emerald-400 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Settings size={16} />
          Notification Settings
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-950/60 border border-slate-900 rounded-2xl text-slate-400 space-y-3 animate-pulse">
          <RefreshCw className="animate-spin text-emerald-400" size={24} />
          <p className="text-xs font-medium">Loading parameters from backend database...</p>
        </div>
      ) : (
        <>
          {/* Governance Score Tab */}
          {activeTab === 'score' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall Score Card */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-8 flex flex-col justify-between items-center text-center">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Governance Index</h3>
                  <p className="text-xs text-slate-450">Aggregated real-time ESG metrics</p>
                </div>
                
                {/* Large score display */}
                <div className="my-8 relative flex items-center justify-center w-40 h-40 rounded-full border-4 border-slate-900">
                  <div className={`text-5xl font-black ${getScoreColor(scoreData?.governanceScore || 0)}`}>
                    {scoreData?.governanceScore ?? '--'}
                  </div>
                  <span className="absolute bottom-6 text-[10px] font-bold text-slate-500 uppercase">Points</span>
                </div>

                <button 
                  onClick={handleRecalculateScore}
                  disabled={isRefreshingScore}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-950 text-slate-300 hover:text-white border border-slate-800 rounded-xl font-bold transition-all text-sm shadow-md"
                >
                  <RefreshCw size={14} className={isRefreshingScore ? 'animate-spin text-emerald-400' : ''} />
                  {isRefreshingScore ? 'Calculating...' : 'Recalculate Score'}
                </button>
              </div>

              {/* Score breakdown metrics list */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3">Scoring Engine Parameters</h3>
                
                {scoreData?.breakdown ? (
                  <div className="space-y-4">
                    {/* Policy Acknowledgements */}
                    <div className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Policy Acknowledgements</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {scoreData.breakdown.acknowledgedCount} of {scoreData.breakdown.totalAcks} signs registered
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-blue-400">{scoreData.breakdown.policyAckPercentage}%</span>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Weight: 40%</p>
                      </div>
                    </div>

                    {/* Audits Completion */}
                    <div className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">ESG Audits Completion Rate</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {scoreData.breakdown.completedAudits} of {scoreData.breakdown.totalAudits} audits completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400">{scoreData.breakdown.auditCompletionRate}%</span>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Weight: 30%</p>
                      </div>
                    </div>

                    {/* Compliance Issues */}
                    <div className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Compliance Issue Resolution</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {scoreData.breakdown.resolvedIssues} resolved / {scoreData.breakdown.overdueIssuesCount} overdue of {scoreData.breakdown.totalIssues} issues
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-red-400">{scoreData.breakdown.complianceResolutionRate}%</span>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Weight: 30%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-12">Scoring data unavailable.</p>
                )}
              </div>
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-lg font-bold text-white">System Logs & Notifications</h3>
                <span className="text-xs text-slate-500 font-medium">Showing {notifications.length} events</span>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`flex items-start gap-4 p-4 border rounded-xl transition-colors ${
                      notif.read 
                        ? 'bg-slate-950/40 border-slate-900/60 opacity-60' 
                        : 'bg-slate-900/10 border-slate-800 hover:border-slate-750'
                    }`}
                  >
                    <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-200">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        )}
                        <span className="text-[10px] text-slate-500 font-bold px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded-md uppercase ml-auto">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4">
                      <button 
                        onClick={() => handleToggleRead(notif._id, notif.read)}
                        className="text-[10px] font-bold text-slate-450 hover:text-emerald-400 bg-slate-900 hover:bg-slate-850 px-2 py-1.5 rounded-lg border border-slate-800 transition-colors"
                      >
                        {notif.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button 
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="text-slate-450 hover:text-red-500 bg-slate-900 hover:bg-red-950/10 p-1.5 rounded-lg border border-slate-800 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-slate-900 rounded-xl text-slate-550 text-xs">
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">Select which corporate governance events prompt notification logs.</p>
              </div>

              <div className="divide-y divide-slate-900">
                {/* Compliance Issue Toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Compliance Issue Logs</h4>
                    <p className="text-xs text-slate-500">Record when corrective actions are scheduled, resolved, or overdue.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('complianceIssueEnabled')}>
                    {settings.complianceIssueEnabled ? (
                      <ToggleRight className="w-9 h-9 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Policy Reminder Toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Policy Reminders & Publications</h4>
                    <p className="text-xs text-slate-500">Log warnings for new regulatory policies or acknowledgements pending.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('policyReminderEnabled')}>
                    {settings.policyReminderEnabled ? (
                      <ToggleRight className="w-9 h-9 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Approval Toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Approval Decisions</h4>
                    <p className="text-xs text-slate-500">Record signatures, audit outcomes, or policy approval updates.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('approvalDecisionEnabled')}>
                    {settings.approvalDecisionEnabled ? (
                      <ToggleRight className="w-9 h-9 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Badge Unlock Toggle */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">Badge Unlock Events</h4>
                    <p className="text-xs text-slate-500">Log notices when teams achieve gamified compliance rewards.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('badgeUnlockEnabled')}>
                    {settings.badgeUnlockEnabled ? (
                      <ToggleRight className="w-9 h-9 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NotificationsPage;
