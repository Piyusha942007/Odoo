import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
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
  ShieldAlert,
  Inbox,
  TrendingUp,
  Sliders,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis 
} from 'recharts';

function NotificationsPage() {
  const { alert: customAlert, toast: customToast } = useAlert();
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
        customToast('Score recalculated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error recalculating governance score:', err);
      customAlert('Error', 'Failed to recalculate score.', 'error');
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
        customToast('Notification deleted.', 'success');
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
      customToast('Preferences updated.', 'success');
    } catch (err) {
      console.error('Error updating notification settings:', err);
      // Revert state if request failed
      setSettings(settings);
      customAlert('Error', 'Failed to save settings changes.', 'error');
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
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreFillColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const scoreValue = scoreData?.governanceScore || 0;
  
  // Radial chart data format for Recharts
  const radialData = [
    { name: 'Score', value: scoreValue, fill: getScoreFillColor(scoreValue) }
  ];

  // Historical simulated trend data for governance score
  const trendData = [
    { month: 'Jan', score: Math.max(0, scoreValue - 12) },
    { month: 'Feb', score: Math.max(0, scoreValue - 9) },
    { month: 'Mar', score: Math.max(0, scoreValue - 5) },
    { month: 'Apr', score: Math.max(0, scoreValue - 3) },
    { month: 'May', score: Math.max(0, scoreValue - 1) },
    { month: 'Jun', score: scoreValue }
  ];

  return (
    <div className="space-y-8 min-h-screen text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Performance</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Rating & System Preferences</h1>
          <p className="text-slate-400 text-sm max-w-2xl font-medium">Analyze ESG governance performance ratings and adjust notification preferences.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button 
          onClick={() => setActiveTab('score')}
          className={`px-6 py-4 font-bold text-xs border-b-2 tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === 'score' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShieldCheck size={14} />
          Governance Rating
        </button>
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`px-6 py-4 font-bold text-xs border-b-2 tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === 'inbox' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bell size={14} />
          Inbox {unreadCount > 0 ? (
            <span className="ml-1.5 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black">{unreadCount}</span>
          ) : (
            <span className="text-slate-600 text-[10px]">({notifications.length})</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-4 font-bold text-xs border-b-2 tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === 'settings' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings size={14} />
          Preferences
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-slate-900/20 border border-white/5 rounded-3xl text-slate-400 space-y-4">
          <Loader2 className="animate-spin text-blue-400" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Accessing preference registers...</p>
        </div>
      ) : (
        <>
          {/* Governance Score Tab */}
          {activeTab === 'score' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Overall Score Card */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-xl">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Governance Index</h3>
                  <p className="text-[11px] text-slate-550 font-semibold uppercase tracking-wider">Aggregated ESG Rating</p>
                </div>
                
                {/* Recharts Radial Bar circular score gauge */}
                <div className="my-6 relative w-48 h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="75%" 
                      outerRadius="100%" 
                      barSize={10} 
                      data={radialData} 
                      startAngle={90} 
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={6} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-5xl font-black tracking-tighter ${getScoreColor(scoreValue)}`}>
                      {scoreValue}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">Points</span>
                  </div>
                </div>

                <button 
                  onClick={handleRecalculateScore}
                  disabled={isRefreshingScore}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-955 text-slate-350 hover:text-white border border-white/5 rounded-xl font-bold transition-all text-xs"
                >
                  <RefreshCw size={12} className={isRefreshingScore ? 'animate-spin text-blue-400' : ''} />
                  {isRefreshingScore ? 'Recomputing Engine...' : 'Recalculate Rating'}
                </button>
              </div>

              {/* Score breakdown metrics list and Historical Trend */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Scoring Parameters breakdowns */}
                <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scoring Engine Parameters</h3>
                  
                  {scoreData?.breakdown ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Policies parameter */}
                      <div className="bg-slate-900/10 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Policy Sign-off</span>
                          <span className="text-lg font-black text-blue-400">{scoreData.breakdown.policyAckPercentage}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-3">Weight: 40%</p>
                      </div>

                      {/* Audits parameter */}
                      <div className="bg-slate-900/10 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Audits Completed</span>
                          <span className="text-lg font-black text-emerald-400">{scoreData.breakdown.auditCompletionRate}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-3">Weight: 30%</p>
                      </div>

                      {/* Compliance parameter */}
                      <div className="bg-slate-900/10 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Defects Resolved</span>
                          <span className="text-lg font-black text-red-400">{scoreData.breakdown.complianceResolutionRate}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-3">Weight: 30%</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 text-center py-6">Calculations breakdown data unavailable.</p>
                  )}
                </div>

                {/* Score Historical Trend Chart */}
                <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-blue-450" />
                      Governance Rating Trend
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">6-Month YTD</span>
                  </div>

                  <div className="h-44 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                          labelStyle={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '9px' }}
                          itemStyle={{ color: '#F8FAFC', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logs & Messages</h3>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{notifications.length} alerts logged</span>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`flex items-start gap-4.5 p-4 border rounded-2xl transition-all duration-200 ${
                      notif.read 
                        ? 'bg-slate-950/20 border-slate-950/60 opacity-60' 
                        : 'bg-slate-900/10 border-white/5 hover:border-white/10'
                    }`}
                    style={!notif.read ? { borderLeft: '3px solid #3b82f6' } : {}}
                  >
                    <div className="mt-0.5 p-2 bg-slate-900 border border-white/5 rounded-xl shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-200 leading-snug">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" title="Unread alert"></span>
                        )}
                        <span className="text-[9px] text-slate-500 font-extrabold px-1.5 py-0.5 bg-slate-900 border border-white/5 rounded uppercase ml-auto">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{notif.message}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button 
                        onClick={() => handleToggleRead(notif._id, notif.read)}
                        className="text-[10px] font-bold text-slate-400 hover:text-blue-400 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl border border-white/5 transition-colors"
                      >
                        {notif.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button 
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="text-slate-400 hover:text-red-500 bg-slate-900 hover:bg-red-950/10 p-2 rounded-xl border border-white/5 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 space-y-3 bg-slate-950/20">
                    <Inbox className="mx-auto text-slate-700 animate-pulse" size={32} />
                    <p className="text-sm font-bold text-slate-400">Inbox is empty</p>
                    <p className="text-xs text-slate-650 max-w-xs mx-auto">No governance notifications have been logged or preferences filter them out.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notification Preferences</h3>
                <p className="text-xs text-slate-550 mt-1 font-semibold">Select which corporate governance events prompt notification logs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Compliance Issue Toggle */}
                <div className="bg-slate-900/10 border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-200">Compliance Issue Logs</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">Record when corrective actions are scheduled, resolved, or overdue.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('complianceIssueEnabled')} className="shrink-0 transition-transform active:scale-95 focus:outline-none">
                    {settings.complianceIssueEnabled ? (
                      <ToggleRight className="w-10 h-10 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Policy Reminder Toggle */}
                <div className="bg-slate-900/10 border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-200">Policy Reminders</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">Log warnings for new regulatory policies or acknowledgements pending.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('policyReminderEnabled')} className="shrink-0 transition-transform active:scale-95 focus:outline-none">
                    {settings.policyReminderEnabled ? (
                      <ToggleRight className="w-10 h-10 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Approval Toggle */}
                <div className="bg-slate-900/10 border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-200">Approval Decisions</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">Record signatures, audit outcomes, or policy approval updates.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('approvalDecisionEnabled')} className="shrink-0 transition-transform active:scale-95 focus:outline-none">
                    {settings.approvalDecisionEnabled ? (
                      <ToggleRight className="w-10 h-10 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Badge Unlock Toggle */}
                <div className="bg-slate-900/10 border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-200">Badge Unlock Events</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">Log notices when teams achieve gamified compliance rewards.</p>
                  </div>
                  <button onClick={() => handleToggleSetting('badgeUnlockEnabled')} className="shrink-0 transition-transform active:scale-95 focus:outline-none">
                    {settings.badgeUnlockEnabled ? (
                      <ToggleRight className="w-10 h-10 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
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
