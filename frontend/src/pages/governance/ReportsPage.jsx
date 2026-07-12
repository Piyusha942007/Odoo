import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  Calendar, 
  Sparkles, 
  Sliders,
  FolderOpen,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Leaf,
  Users,
  ShieldCheck,
  Globe
} from 'lucide-react';

function ReportsPage() {
  const [reportType, setReportType] = useState('ESG Summary');
  const [departments, setDepartments] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  
  const [filters, setFilters] = useState({
    department: '',
    dateFrom: '',
    dateTo: '',
    employee: '',
    esgCategory: ''
  });

  const [generatedData, setGeneratedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/governance/reports`;
  const DEPT_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/departments`;

  const fetchDependencies = async () => {
    try {
      // Fetch active departments
      const deptsRes = await axios.get(DEPT_API_URL);
      if (deptsRes.data?.success) {
        setDepartments(deptsRes.data.data);
      }

      // Fetch saved templates
      const templatesRes = await axios.get(API_URL);
      if (templatesRes.data?.success) {
        setSavedTemplates(templatesRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching reporting dependencies:', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
    handleCompileReport('ESG Summary', filters);
  }, []);

  const handleCompileReport = async (typeToCompile, currentFilters) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/generate`, {
        type: typeToCompile,
        filters: currentFilters
      });
      if (res.data?.success) {
        setGeneratedData(res.data.data);
      }
    } catch (err) {
      console.error('Error generating ESG report:', err);
      alert('Failed to compile report data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleCompileReport(reportType, filters);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('Please enter a template name.');
      return;
    }

    try {
      setIsSavingTemplate(true);
      const res = await axios.post(API_URL, {
        title: templateName,
        type: reportType,
        filters,
        createdBy: 'Anvi Patel'
      });
      if (res.data?.success) {
        setSavedTemplates([res.data.data, ...savedTemplates]);
        setTemplateName('');
        alert('Report template saved successfully.');
      }
    } catch (err) {
      console.error('Error saving report template:', err);
      alert('Failed to save template.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this report template?')) return;
    try {
      const res = await axios.delete(`${API_URL}/${templateId}`);
      if (res.data?.success) {
        setSavedTemplates(savedTemplates.filter(t => t._id !== templateId));
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleLoadTemplate = (template) => {
    setReportType(template.type);
    setFilters({
      department: template.filters?.department || '',
      dateFrom: template.filters?.dateFrom || '',
      dateTo: template.filters?.dateTo || '',
      employee: template.filters?.employee || '',
      esgCategory: template.filters?.esgCategory || ''
    });
    handleCompileReport(template.type, template.filters);
  };

  const handleExport = (format) => {
    const filtersStr = encodeURIComponent(JSON.stringify(filters));
    const exportUrl = `${API_URL}/export?type=${encodeURIComponent(reportType)}&format=${format}&filters=${filtersStr}`;
    window.open(exportUrl, '_blank');
  };

  const getKPIColor = (val, target = 80) => {
    if (val >= target) return 'text-emerald-400';
    if (val >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ESG Reports Center</h1>
        <p className="text-slate-400 mt-2 font-medium">Generate standard compliance declarations, design custom report templates, and download audit sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Builder Controls */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Report Configuration Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
              <Sliders className="text-emerald-400" size={20} />
              <h2 className="text-lg font-bold text-white">Report Settings</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Scope / Framework</label>
                <select 
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700 text-slate-300 font-medium"
                >
                  <option value="ESG Summary">ESG Executive Rollup</option>
                  <option value="Environmental">Environmental Carbon Audit</option>
                  <option value="Social">Social Engagement Matrix</option>
                  <option value="Governance">Governance Index Rating</option>
                  <option value="Custom">Custom Report Builder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Organization Department</label>
                <select 
                  value={filters.department}
                  onChange={e => setFilters({...filters, department: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700 text-slate-300 font-medium"
                >
                  <option value="">All Corporate Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Date From</label>
                  <input 
                    type="date"
                    value={filters.dateFrom}
                    onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Date To</label>
                  <input 
                    type="date"
                    value={filters.dateTo}
                    onChange={e => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Target Employee (Owner/Auditor)</label>
                <input 
                  type="text"
                  placeholder="Enter employee name..."
                  value={filters.employee}
                  onChange={e => setFilters({...filters, employee: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700 placeholder-slate-650"
                />
              </div>

              {reportType === 'Governance' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Governance Policy Category</label>
                  <select 
                    value={filters.esgCategory}
                    onChange={e => setFilters({...filters, esgCategory: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                  >
                    <option value="">All Categories</option>
                    <option value="Environmental">Environmental Governance</option>
                    <option value="Social">Social Governance</option>
                    <option value="Governance">Corporate Governance</option>
                  </select>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6 text-sm"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                {isLoading ? 'Compiling Dataset...' : 'Compile ESG Report'}
              </button>
            </form>
          </div>

          {/* Saved Templates List Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <FolderOpen className="text-slate-450" size={18} />
              <h3 className="text-sm font-bold text-white">Saved Configs</h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedTemplates.map(tpl => (
                <div key={tpl._id} className="flex justify-between items-center p-2.5 bg-slate-900/30 border border-slate-900/60 rounded-xl text-xs">
                  <button 
                    onClick={() => handleLoadTemplate(tpl)}
                    className="text-left font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex-1 truncate"
                  >
                    {tpl.title}
                    <span className="block text-[9px] text-slate-500 font-medium">{tpl.type}</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(tpl._id)}
                    className="text-slate-500 hover:text-red-500 p-1 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {savedTemplates.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-4">No report templates saved.</p>
              )}
            </div>

            {/* Save Configuration Form */}
            <form onSubmit={handleSaveTemplate} className="pt-2 border-t border-slate-900 flex gap-2">
              <input 
                type="text"
                placeholder="Template name..."
                required
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 placeholder-slate-650"
              />
              <button 
                type="submit" 
                disabled={isSavingTemplate}
                className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 p-2 rounded-xl transition-colors"
                title="Save config"
              >
                <Save size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Data Dashboard & Visualization Tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Rollup */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{reportType} Dashboard</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Compiled at {generatedData ? new Date(generatedData.generatedAt).toLocaleString() : '--'}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Download size={12} />
                  PDF
                </button>
                <button 
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Download size={12} />
                  Excel
                </button>
                <button 
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Download size={12} />
                  CSV
                </button>
              </div>
            </div>

            {/* Rollup KPI Grid */}
            {generatedData?.summary ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Environmental metric */}
                {(reportType === 'Environmental' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <Leaf size={14} className="text-emerald-400" />
                      Carbon Emissions
                    </div>
                    <p className="text-2xl font-black text-white mt-4">{generatedData.summary.totalEmissions} <span className="text-xs text-slate-500 font-normal">Tons</span></p>
                  </div>
                )}

                {/* Social metric */}
                {(reportType === 'Social' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <Users size={14} className="text-blue-400" />
                      CSR Engagement
                    </div>
                    <p className="text-2xl font-black text-white mt-4">{generatedData.summary.totalSocialPoints} <span className="text-xs text-slate-500 font-normal">Points</span></p>
                  </div>
                )}

                {/* Governance metric 1 */}
                {(reportType === 'Governance' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} className="text-purple-400" />
                      Policy Acknowledgements
                    </div>
                    <p className={`text-2xl font-black mt-4 ${getKPIColor(generatedData.summary.policyAckRate)}`}>{generatedData.summary.policyAckRate}%</p>
                  </div>
                )}

                {/* Governance metric 2 */}
                {(reportType === 'Governance' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <Globe size={14} className="text-indigo-400" />
                      Audits Completed
                    </div>
                    <p className={`text-2xl font-black mt-4 ${getKPIColor(generatedData.summary.auditCompletionRate)}`}>{generatedData.summary.auditCompletionRate}%</p>
                  </div>
                )}

                {/* Governance metric 3 */}
                {(reportType === 'Governance' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <AlertTriangle size={14} className="text-amber-500" />
                      Compliance Defects
                    </div>
                    <p className="text-2xl font-black text-white mt-4">
                      {generatedData.summary.totalIssues}
                      <span className="text-xs text-slate-500 font-normal ml-1">({generatedData.summary.resolvedIssues} resolved)</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-550 text-center py-6">Compile to display summary analytics</p>
            )}
          </div>

          {/* Dataset Tables List Container */}
          {generatedData && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-8 max-h-[500px] overflow-y-auto">
              
              {/* Environmental table preview */}
              {generatedData.environmental?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-350 border-b border-slate-900 pb-2">Environmental Emissions Activity</h4>
                  <table className="w-full text-xs text-left text-slate-400">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-900">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Department</th>
                        <th className="pb-2">Source Reference</th>
                        <th className="pb-2 text-right">CO2e Amount (Tons)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.environmental.map((t, idx) => (
                        <tr key={idx} className="border-b border-slate-900/40">
                          <td className="py-2.5">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="py-2.5 font-medium text-slate-300">{t.department?.name || 'Unknown'}</td>
                          <td className="py-2.5"><code>{t.sourceDocument}</code></td>
                          <td className="py-2.5 text-right font-bold text-emerald-400">{t.co2eAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Social Table Preview */}
              {generatedData.social?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-350 border-b border-slate-900 pb-2">Social / CSR Participation activity</h4>
                  <table className="w-full text-xs text-left text-slate-400">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-900">
                        <th className="pb-2">Employee</th>
                        <th className="pb-2">CSR Activity</th>
                        <th className="pb-2">Completion Date</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.social.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-900/40">
                          <td className="py-2.5 font-medium text-slate-300">{p.employee}</td>
                          <td className="py-2.5">{p.activity?.title || 'Unknown'}</td>
                          <td className="py-2.5">{p.completionDate ? new Date(p.completionDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              p.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {p.approvalStatus}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-blue-400">{p.pointsEarned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Governance: Policies Table Preview */}
              {generatedData.governance?.policies?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-350 border-b border-slate-900 pb-2">Policies Sign-off Logs</h4>
                  <table className="w-full text-xs text-left text-slate-400">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-900">
                        <th className="pb-2">Policy Title</th>
                        <th className="pb-2">Employee</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Signed On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.governance.policies.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-900/40">
                          <td className="py-2.5 font-medium text-slate-300">{p.policy?.title || 'Unknown'}</td>
                          <td className="py-2.5">{p.employee}</td>
                          <td className="py-2.5 text-emerald-400 font-semibold">{p.status}</td>
                          <td className="py-2.5">{p.acknowledgedAt ? new Date(p.acknowledgedAt).toLocaleString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Governance: Audits Table Preview */}
              {generatedData.governance?.audits?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-350 border-b border-slate-900 pb-2">Corporate Audits</h4>
                  <table className="w-full text-xs text-left text-slate-400">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-900">
                        <th className="pb-2">Audit scope</th>
                        <th className="pb-2">Auditor</th>
                        <th className="pb-2">Date Range</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.governance.audits.map((a, idx) => (
                        <tr key={idx} className="border-b border-slate-900/40">
                          <td className="py-2.5 font-medium text-slate-300">{a.title}</td>
                          <td className="py-2.5">{a.auditor}</td>
                          <td className="py-2.5">{new Date(a.startDate).toLocaleDateString()} to {new Date(a.endDate).toLocaleDateString()}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              a.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Governance: Compliance Issues Table Preview */}
              {generatedData.governance?.complianceIssues?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-350 border-b border-slate-900 pb-2">Compliance Defects</h4>
                  <table className="w-full text-xs text-left text-slate-400">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-900">
                        <th className="pb-2">Issue Title</th>
                        <th className="pb-2">Owner</th>
                        <th className="pb-2">Due Date</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.governance.complianceIssues.map((i, idx) => (
                        <tr key={idx} className="border-b border-slate-900/40">
                          <td className="py-2.5 font-medium text-slate-300">{i.title}</td>
                          <td className="py-2.5">{i.owner}</td>
                          <td className="py-2.5">{new Date(i.dueDate).toLocaleDateString()}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              i.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 animate-pulse'
                            }`}>
                              {i.status}
                            </span>
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
      </div>
    </div>
  );
}

export default ReportsPage;
