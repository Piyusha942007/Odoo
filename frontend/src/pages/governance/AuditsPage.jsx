import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import axios from 'axios';
import { 
  Plus, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Edit, 
  Trash2,
  X,
  FileCheck,
  User,
  AlertTriangle,
  ClipboardList,
  Clock,
  Activity,
  Layers,
  Search,
  CheckCircle
} from 'lucide-react';

function AuditsPage() {
  const { alert: customAlert, confirm: customConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('audits');
  const [audits, setAudits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showEditAuditModal, setShowEditAuditModal] = useState(false);
  const [showEditIssueModal, setShowEditIssueModal] = useState(false);

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

  const [editingAudit, setEditingAudit] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);

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
      customAlert('Error', 'Failed to save audit to MongoDB database.', 'error');
    }
  };

  const handleEditAuditClick = (audit) => {
    setEditingAudit({
      ...audit,
      startDate: audit.startDate ? new Date(audit.startDate).toISOString().split('T')[0] : '',
      endDate: audit.endDate ? new Date(audit.endDate).toISOString().split('T')[0] : ''
    });
    setShowEditAuditModal(true);
  };

  const handleUpdateAudit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/${editingAudit._id}`, editingAudit);
      if (response.data && response.data.success) {
        setAudits(audits.map(a => a._id === editingAudit._id ? response.data.data : a));
        setShowEditAuditModal(false);
      }
    } catch (err) {
      console.error('Error updating audit:', err);
      customAlert('Error', 'Failed to update audit.', 'error');
    }
  };

  const handleDeleteAudit = async (auditId) => {
    const isConfirmed = await customConfirm('Delete Audit', 'Are you sure you want to delete this audit?', 'error');
    if (!isConfirmed) return;
    try {
      const response = await axios.delete(`${API_URL}/${auditId}`);
      if (response.data && response.data.success) {
        setAudits(audits.filter(a => a._id !== auditId));
      }
    } catch (err) {
      console.error('Error deleting audit:', err);
      customAlert('Error', 'Failed to delete audit.', 'error');
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
      customAlert('Error', 'Failed to save compliance issue to MongoDB database.', 'error');
    }
  };

  const handleEditIssueClick = (issue) => {
    setEditingIssue({
      ...issue,
      dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ''
    });
    setShowEditIssueModal(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/compliance-issues/${editingIssue._id}`, editingIssue);
      if (response.data && response.data.success) {
        setIssues(issues.map(i => i._id === editingIssue._id ? response.data.data : i));
        setShowEditIssueModal(false);
      }
    } catch (err) {
      console.error('Error updating compliance issue:', err);
      customAlert('Error', 'Failed to update compliance issue.', 'error');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    const isConfirmed = await customConfirm('Delete Issue', 'Are you sure you want to delete this compliance issue?', 'error');
    if (!isConfirmed) return;
    try {
      const response = await axios.delete(`${API_URL}/compliance-issues/${issueId}`);
      if (response.data && response.data.success) {
        setIssues(issues.filter(i => i._id !== issueId));
      }
    } catch (err) {
      console.error('Error deleting compliance issue:', err);
      customAlert('Error', 'Failed to delete compliance issue.', 'error');
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
      customAlert('Error', 'Failed to resolve compliance issue.', 'error');
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-800';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Completed':
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'In Progress':
      case 'Under Review':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Overdue':
        return 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse';
      default:
        return 'bg-slate-900 text-slate-450 border border-white/5';
    }
  };

  const getOwnerInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Stats for Audits tab
  const totalAudits = audits.length;
  const inProgressAudits = audits.filter(a => a.status === 'In Progress').length;
  const completedAudits = audits.filter(a => a.status === 'Completed').length;
  const scheduledAudits = audits.filter(a => a.status === 'Scheduled').length;

  // Stats for Issues tab
  const openIssues = issues.filter(i => i.status === 'Open' || i.status === 'Under Review').length;
  const highSeverityIssues = issues.filter(i => i.severity === 'High' || i.severity === 'Critical').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const overdueIssues = issues.filter(i => {
    const isOverdue = new Date(i.dueDate) < new Date() && !['Resolved', 'Completed', 'Closed'].includes(i.status);
    return isOverdue || i.status === 'Overdue';
  }).length;

  return (
    <div className="space-y-8 min-h-screen text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Audit Framework</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Audits & Compliance Cockpit</h1>
          <p className="text-slate-400 text-sm max-w-2xl font-medium">Schedule corporate ESG audits and log and track corrective compliance issues.</p>
        </div>
        <div className="flex gap-3 self-start md:self-center">
          <button 
            onClick={() => setShowAuditModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 rounded-2xl font-bold transition-all text-xs"
          >
            <Calendar size={14} />
            Schedule Audit
          </button>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-bold transition-all duration-200 text-sm shadow-lg shadow-indigo-500/20"
          >
            <Plus size={14} />
            Log Issue
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button 
          onClick={() => setActiveTab('audits')}
          className={`px-6 py-4 font-bold text-xs border-b-2 tracking-wider uppercase transition-all ${
            activeTab === 'audits' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          ESG Audits ({audits.length})
        </button>
        <button 
          onClick={() => setActiveTab('issues')}
          className={`px-6 py-4 font-bold text-xs border-b-2 tracking-wider uppercase transition-all ${
            activeTab === 'issues' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Compliance Issues ({issues.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-slate-900/20 border border-white/5 rounded-3xl text-slate-400 space-y-4">
          <Loader2 className="animate-spin text-blue-400" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Querying operational databases...</p>
        </div>
      ) : (
        <>
          {/* Audits Panel */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              
              {/* Audit KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Layers size={12} /> Total Audits</span>
                  <p className="text-2xl font-black text-white mt-2">{totalAudits}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Activity size={12} className="text-blue-400" /> In Progress</span>
                  <p className="text-2xl font-black text-blue-400 mt-2">{inProgressAudits}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> Completed</span>
                  <p className="text-2xl font-black text-emerald-400 mt-2">{completedAudits}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} className="text-yellow-450" /> Scheduled</span>
                  <p className="text-2xl font-black text-yellow-400 mt-2">{scheduledAudits}</p>
                </div>
              </div>

              {/* Audits Table View */}
              <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-400 whitespace-nowrap min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-white/5 text-slate-550 font-bold uppercase tracking-wider">
                        <th className="p-4">Audit Scope / Objective</th>
                        <th className="p-4">External Auditor</th>
                        <th className="p-4">Schedule Range</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {audits.map((audit) => (
                        <tr key={audit._id} className="hover:bg-slate-900/20 transition-colors group">
                          <td className="p-4 max-w-sm whitespace-normal">
                            <h4 className="font-extrabold text-white group-hover:text-blue-400 transition-colors leading-snug">{audit.title}</h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{audit.description}</p>
                            
                            {audit.findings && audit.findings.length > 0 && (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {audit.findings.map((f, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 bg-slate-900 border border-white/5 text-[9px] text-slate-400 px-2 py-0.5 rounded-md font-semibold">
                                    <AlertCircle size={10} className="text-amber-500" />
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-bold text-slate-300">{audit.auditor}</td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-400">{new Date(audit.startDate).toLocaleDateString()}</span>
                            <span className="mx-1.5 text-slate-600">to</span>
                            <span className="font-semibold text-slate-400">{new Date(audit.endDate).toLocaleDateString()}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(audit.status)}`}>
                              {audit.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-1.5">
                              <button 
                                onClick={() => handleEditAuditClick(audit)}
                                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-white/5 rounded-xl transition-colors"
                                title="Edit schedule"
                              >
                                <Edit size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteAudit(audit._id)}
                                className="p-2 bg-red-950/10 hover:bg-red-950/20 text-red-500 border border-red-900/10 rounded-xl transition-colors"
                                title="Delete audit record"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {audits.length === 0 && (
                  <div className="p-16 text-center border-t border-white/5 text-slate-500 space-y-3">
                    <ClipboardList className="mx-auto text-slate-700 animate-pulse" size={32} />
                    <p className="text-sm font-bold text-slate-400">No scheduled audits</p>
                    <p className="text-xs text-slate-655 max-w-xs mx-auto">Create a compliance schedule to run ESG auditing controls.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Issues Panel */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              
              {/* Issue KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Layers size={12} /> Open Deficiencies</span>
                  <p className="text-2xl font-black text-white mt-2">{openIssues}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={12} className="text-red-400" /> High Severity</span>
                  <p className="text-2xl font-black text-red-400 mt-2">{highSeverityIssues}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} className="text-red-450 animate-pulse" /> Overdue Tasks</span>
                  <p className="text-2xl font-black text-red-500 mt-2">{overdueIssues}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-450" /> Issues Resolved</span>
                  <p className="text-2xl font-black text-emerald-400 mt-2">{resolvedIssues}</p>
                </div>
              </div>

              {/* Grid Layout of Issue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issues.map((issue) => {
                  const isOverdue = new Date(issue.dueDate) < new Date() && !['Resolved', 'Completed', 'Closed'].includes(issue.status);
                  const displayStatus = isOverdue ? 'Overdue' : issue.status;

                  return (
                    <div key={issue._id} className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-800 hover:bg-slate-900/10 transition-all duration-200 shadow-xl relative overflow-hidden group">
                      
                      {/* Overdue alert indicator line */}
                      {displayStatus === 'Overdue' && (
                        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-red-500"></div>
                      )}

                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${getSeverityStyles(issue.severity)}`}>
                              {issue.severity} Severity
                            </span>
                            <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors leading-snug">{issue.title}</h3>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${getStatusStyles(displayStatus)}`}>
                            {displayStatus}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{issue.description}</p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-[10px] text-blue-400 uppercase tracking-wider shrink-0" title={`Assigned owner: ${issue.owner}`}>
                            {getOwnerInitials(issue.owner)}
                          </div>
                          <div className="font-semibold">
                            <p className="text-slate-350">Assignee: <span className="font-black text-slate-200">{issue.owner}</span></p>
                            <p className="mt-0.5 text-[10px] flex items-center gap-1">
                              <span>Due date:</span>
                              <span className={`${displayStatus === 'Overdue' ? 'text-red-400 font-black' : 'text-slate-450 font-bold'}`}>{new Date(issue.dueDate).toLocaleDateString()}</span>
                              {displayStatus === 'Overdue' && <AlertTriangle size={10} className="text-red-400" />}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button 
                            onClick={() => handleEditIssueClick(issue)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-450 rounded-xl transition-colors border border-white/5"
                            title="Edit issue Details"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="p-2 bg-red-950/10 hover:bg-red-950/20 text-red-500 rounded-xl transition-colors border border-red-900/10"
                            title="Delete issue"
                          >
                            <Trash2 size={12} />
                          </button>
                          {issue.status !== 'Resolved' && (
                            <button 
                              onClick={() => handleResolveIssue(issue._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-450 border border-emerald-500/20 rounded-xl font-bold hover:border-emerald-500/40 transition-colors"
                            >
                              <CheckCircle2 size={12} />
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {issues.length === 0 && (
                  <div className="md:col-span-2 p-16 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-550 bg-slate-950/20 space-y-3">
                    <AlertTriangle className="mx-auto text-slate-700 animate-pulse" size={32} />
                    <p className="text-sm font-bold text-slate-400">No active compliance deficiencies</p>
                    <p className="text-xs text-slate-655 max-w-xs mx-auto">Corrective action tasks logged during audit evaluations will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Schedule Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowAuditModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white">Schedule Compliance Audit</h3>
            
            <form onSubmit={handleCreateAudit} className="space-y-4">
              <div>
                <label htmlFor="audit-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Title</label>
                <input 
                  id="audit-title"
                  type="text"
                  required
                  value={newAudit.title}
                  onChange={e => setNewAudit({...newAudit, title: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650"
                  placeholder="e.g. Q3 Social & Governance Health Check"
                />
              </div>

              <div>
                <label htmlFor="audit-desc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  id="audit-desc"
                  required
                  rows={3}
                  value={newAudit.description}
                  onChange={e => setNewAudit({...newAudit, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650 leading-relaxed"
                  placeholder="Define audit scope objectives..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="audit-auditor" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Auditor</label>
                  <input 
                    id="audit-auditor"
                    type="text"
                    required
                    value={newAudit.auditor}
                    onChange={e => setNewAudit({...newAudit, auditor: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 placeholder-slate-650"
                    placeholder="Auditing agent or firm"
                  />
                </div>
                <div>
                  <label htmlFor="audit-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    id="audit-status"
                    value={newAudit.status}
                    onChange={e => setNewAudit({...newAudit, status: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-200"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="audit-start" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    id="audit-start"
                    type="date"
                    required
                    value={newAudit.startDate}
                    onChange={e => setNewAudit({...newAudit, startDate: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="audit-end" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    id="audit-end"
                    type="date"
                    required
                    value={newAudit.endDate}
                    onChange={e => setNewAudit({...newAudit, endDate: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-500/10"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Audit Modal */}
      {showEditAuditModal && editingAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowEditAuditModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white">Edit Compliance Audit</h3>
            
            <form onSubmit={handleUpdateAudit} className="space-y-4">
              <div>
                <label htmlFor="edit-audit-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Title</label>
                <input 
                  id="edit-audit-title"
                  type="text"
                  required
                  value={editingAudit.title}
                  onChange={e => setEditingAudit({...editingAudit, title: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div>
                <label htmlFor="edit-audit-desc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  id="edit-audit-desc"
                  required
                  rows={3}
                  value={editingAudit.description}
                  onChange={e => setEditingAudit({...editingAudit, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-audit-auditor" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Auditor</label>
                  <input 
                    id="edit-audit-auditor"
                    type="text"
                    required
                    value={editingAudit.auditor}
                    onChange={e => setEditingAudit({...editingAudit, auditor: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-202 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="edit-audit-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    id="edit-audit-status"
                    value={editingAudit.status}
                    onChange={e => setEditingAudit({...editingAudit, status: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-250 font-bold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-audit-start" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    id="edit-audit-start"
                    type="date"
                    required
                    value={editingAudit.startDate}
                    onChange={e => setEditingAudit({...editingAudit, startDate: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="edit-audit-end" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    id="edit-audit-end"
                    type="date"
                    required
                    value={editingAudit.endDate}
                    onChange={e => setEditingAudit({...editingAudit, endDate: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditAuditModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Compliance Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowIssueModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white">Log Compliance Issue</h3>
            
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label htmlFor="issue-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Title</label>
                <input 
                  id="issue-title"
                  type="text"
                  required
                  value={newIssue.title}
                  onChange={e => setNewIssue({...newIssue, title: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650"
                  placeholder="e.g. Activity data records fuel missing"
                />
              </div>

              <div>
                <label htmlFor="issue-desc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  id="issue-desc"
                  required
                  rows={3}
                  value={newIssue.description}
                  onChange={e => setNewIssue({...newIssue, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650 leading-relaxed"
                  placeholder="Provide brief details on compliance failure..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="issue-owner" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assignee/Owner</label>
                  <input 
                    id="issue-owner"
                    type="text"
                    required
                    value={newIssue.owner}
                    onChange={e => setNewIssue({...newIssue, owner: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 placeholder-slate-650"
                    placeholder="Owner name"
                  />
                </div>
                <div>
                  <label htmlFor="issue-severity" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Severity</label>
                  <select 
                    id="issue-severity"
                    value={newIssue.severity}
                    onChange={e => setNewIssue({...newIssue, severity: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="issue-due" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                  id="issue-due"
                  type="date"
                  required
                  value={newIssue.dueDate}
                  onChange={e => setNewIssue({...newIssue, dueDate: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-355 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-500/10"
                >
                  Log Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Compliance Issue Modal */}
      {showEditIssueModal && editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowEditIssueModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white">Edit Compliance Issue</h3>
            
            <form onSubmit={handleUpdateIssue} className="space-y-4">
              <div>
                <label htmlFor="edit-issue-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Title</label>
                <input 
                  id="edit-issue-title"
                  type="text"
                  required
                  value={editingIssue.title}
                  onChange={e => setEditingIssue({...editingIssue, title: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div>
                <label htmlFor="edit-issue-desc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  id="edit-issue-desc"
                  required
                  rows={3}
                  value={editingIssue.description}
                  onChange={e => setEditingIssue({...editingIssue, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-issue-owner" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assignee/Owner</label>
                  <input 
                    id="edit-issue-owner"
                    type="text"
                    required
                    value={editingIssue.owner}
                    onChange={e => setEditingIssue({...editingIssue, owner: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-205 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="edit-issue-severity" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Severity</label>
                  <select 
                    id="edit-issue-severity"
                    value={editingIssue.severity}
                    onChange={e => setEditingIssue({...editingIssue, severity: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-250 font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-issue-due" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                    id="edit-issue-due"
                    type="date"
                    required
                    value={editingIssue.dueDate}
                    onChange={e => setEditingIssue({...editingIssue, dueDate: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="edit-issue-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    id="edit-issue-status"
                    value={editingIssue.status}
                    onChange={e => setEditingIssue({...editingIssue, status: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-250 font-bold"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditIssueModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-500/10"
                >
                  Save Changes
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
