import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, AlertCircle, Calendar, CheckCircle2, Loader2 } from 'lucide-react';

function AuditsPage() {
  const [activeTab, setActiveTab] = useState('audits');
  const [audits, setAudits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const [newAudit, setNewAudit] = useState({
    title: '',
    description: '',
    auditor: '',
    status: 'Scheduled',
    startDate: '',
    endDate: ''
  });

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    owner: '',
    severity: 'Medium',
    dueDate: '',
    status: 'Open'
  });

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/governance/audits`;

  const fetchAuditsAndIssues = async () => {
    try {
      setIsLoading(true);
      const auditsRes = await axios.get(API_URL);
      const issuesRes = await axios.get(`${API_URL}/compliance-issues`);

      if (auditsRes.data?.success && issuesRes.data?.success) {
        let auditsData = auditsRes.data.data;
        let issuesData = issuesRes.data.data;

        // Seed default audits and issues to Mongo if database is empty
        if (auditsData.length === 0 && issuesData.length === 0) {
          const defaultAudits = [
            {
              title: 'Q2 Environmental Emissions Audit',
              description: 'Validation of Scope 1 & 2 carbon accounting protocols for corporate offices.',
              auditor: 'Apex ESG Consulting',
              status: 'In Progress',
              startDate: '2026-06-15',
              endDate: '2026-07-20'
            },
            {
              title: 'Annual Code of Conduct Review',
              description: 'Audit of whistleblowing logs and employee compliance training status.',
              auditor: 'Internal Audit Committee',
              status: 'Completed',
              startDate: '2026-05-01',
              endDate: '2026-05-15',
              findings: ['Completed 100% staff training sign-off', 'No whistleblowing complaints filed']
            }
          ];

          const defaultIssues = [
            {
              title: 'Missing fuel receipt files for generator-3',
              description: 'Activity data for environmental emissions tracking is missing raw validation files.',
              owner: 'Piyusha Patel',
              severity: 'Medium',
              dueDate: '2026-07-18',
              status: 'Open'
            },
            {
              title: 'Security training backlog in IT support',
              description: 'Three staff members have not finished the required annual security compliance test.',
              owner: 'David Vance',
              severity: 'High',
              dueDate: '2026-07-10',
              status: 'Overdue'
            }
          ];

          for (const item of defaultAudits) {
            await axios.post(API_URL, item);
          }

          for (const item of defaultIssues) {
            await axios.post(`${API_URL}/compliance-issues`, item);
          }

          const refetchedAudits = await axios.get(API_URL);
          const refetchedIssues = await axios.get(`${API_URL}/compliance-issues`);
          auditsData = refetchedAudits.data.data;
          issuesData = refetchedIssues.data.data;
        }

        setAudits(auditsData);
        setIssues(issuesData);
      }
    } catch (err) {
      console.error('Error fetching audits and issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditsAndIssues();
  }, []);

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, newAudit);
      if (response.data && response.data.success) {
        setAudits([response.data.data, ...audits]);
        setNewAudit({ title: '', description: '', auditor: '', status: 'Scheduled', startDate: '', endDate: '' });
        setShowAuditModal(false);
      }
    } catch (err) {
      console.error('Error creating audit:', err);
      alert('Failed to save audit to MongoDB database.');
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/compliance-issues`, newIssue);
      if (response.data && response.data.success) {
        setIssues([response.data.data, ...issues]);
        setNewIssue({ title: '', description: '', owner: '', severity: 'Medium', dueDate: '', status: 'Open' });
        setShowIssueModal(false);
      }
    } catch (err) {
      console.error('Error creating compliance issue:', err);
      alert('Failed to save compliance issue to MongoDB database.');
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      const response = await axios.put(`${API_URL}/compliance-issues/${issueId}`, { status: 'Resolved' });
      if (response.data && response.data.success) {
        setIssues(issues.map(i => i._id === issueId ? response.data.data : i));
      }
    } catch (err) {
      console.error('Error resolving issue:', err);
      alert('Failed to resolve compliance issue.');
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-400 border border-red-900/50';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-900/50';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-900/50';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-900/50';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Completed':
      case 'Resolved':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'In Progress':
      case 'Under Review':
        return 'bg-blue-500/15 text-blue-400';
      case 'Overdue':
        return 'bg-red-500/15 text-red-400 animate-pulse';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Audits & Compliance</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage corporate ESG audits and log and track corrective compliance issues.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold transition-all text-sm"
          >
            <Calendar size={16} />
            Schedule Audit
          </button>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} />
            Log Issue
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900">
        <button 
          onClick={() => setActiveTab('audits')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'audits' 
              ? 'border-emerald-500 text-emerald-400 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          ESG Audits ({audits.length})
        </button>
        <button 
          onClick={() => setActiveTab('issues')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'issues' 
              ? 'border-emerald-500 text-emerald-400 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          Compliance Issues ({issues.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-950/60 border border-slate-900 rounded-2xl text-slate-400 space-y-3">
          <Loader2 className="animate-spin text-emerald-400" size={24} />
          <p className="text-xs font-medium">Loading audits and compliance logs from MongoDB...</p>
        </div>
      ) : (
        <>
          {/* Audits Panel */}
          {activeTab === 'audits' && (
            <div className="grid grid-cols-1 gap-6">
              {audits.map((audit) => (
                <div key={audit._id} className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-bold text-white">{audit.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusStyles(audit.status)}`}>
                          {audit.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm max-w-2xl">{audit.description}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500 space-y-1 font-medium">
                      <p>Auditor: <span className="text-slate-300 font-semibold">{audit.auditor}</span></p>
                      <p>{new Date(audit.startDate).toLocaleDateString()} to {new Date(audit.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {audit.findings && audit.findings.length > 0 && (
                    <div className="mt-6 border-t border-slate-900/60 pt-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Findings</h4>
                      <ul className="space-y-1.5">
                        {audit.findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-350">
                            <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {audits.length === 0 && (
                <div className="p-12 text-center border border-dashed border-slate-900 rounded-2xl text-slate-550">
                  No audits scheduled yet.
                </div>
              )}
            </div>
          )}

          {/* Compliance Issues Panel */}
          {activeTab === 'issues' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map((issue) => (
                <div key={issue._id} className="bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-800 transition-colors">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${getSeverityStyles(issue.severity)}`}>
                          {issue.severity} Severity
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2">{issue.title}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusStyles(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{issue.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      <p>Owner: <span className="text-slate-350 font-semibold">{issue.owner}</span></p>
                      <p className="mt-0.5">Due Date: <span className={`${issue.status === 'Overdue' ? 'text-red-400 font-bold' : 'text-slate-400'}`}>{new Date(issue.dueDate).toLocaleDateString()}</span></p>
                    </div>
                    {issue.status !== 'Resolved' && (
                      <button 
                        onClick={() => handleResolveIssue(issue._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/20 rounded-lg font-semibold hover:border-emerald-500/40 transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="p-12 text-center border border-dashed border-slate-900 rounded-2xl text-slate-550">
                  No compliance issues logged yet.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Schedule Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white">Schedule Compliance Audit</h3>
            <form onSubmit={handleCreateAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Audit Title</label>
                <input 
                  type="text"
                  required
                  value={newAudit.title}
                  onChange={e => setNewAudit({...newAudit, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  placeholder="e.g. Q3 Social & Governance Health Check"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={newAudit.description}
                  onChange={e => setNewAudit({...newAudit, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  placeholder="What is the audit scope?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Auditor</label>
                  <input 
                    type="text"
                    required
                    value={newAudit.auditor}
                    onChange={e => setNewAudit({...newAudit, auditor: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                    placeholder="Auditing agent or firm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Status</label>
                  <select 
                    value={newAudit.status}
                    onChange={e => setNewAudit({...newAudit, status: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={newAudit.startDate}
                    onChange={e => setNewAudit({...newAudit, startDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700 text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">End Date</label>
                  <input 
                    type="date"
                    required
                    value={newAudit.endDate}
                    onChange={e => setNewAudit({...newAudit, endDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700 text-slate-400"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold transition-all"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Compliance Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white">Log Compliance Issue</h3>
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Issue Title</label>
                <input 
                  type="text"
                  required
                  value={newIssue.title}
                  onChange={e => setNewIssue({...newIssue, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  placeholder="e.g. Uncategorized waste disposal in Sector B"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={newIssue.description}
                  onChange={e => setNewIssue({...newIssue, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  placeholder="Detail the non-compliance incident or missing requirement."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Assignee/Owner</label>
                  <input 
                    type="text"
                    required
                    value={newIssue.owner}
                    onChange={e => setNewIssue({...newIssue, owner: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                    placeholder="Owner name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Severity</label>
                  <select 
                    value={newIssue.severity}
                    onChange={e => setNewIssue({...newIssue, severity: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Due Date</label>
                <input 
                  type="date"
                  required
                  value={newIssue.dueDate}
                  onChange={e => setNewIssue({...newIssue, dueDate: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700 text-slate-400"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold transition-all"
                >
                  Log Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditsPage;
