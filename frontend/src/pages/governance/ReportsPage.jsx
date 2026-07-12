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
  AlertTriangle,
  Leaf,
  Users,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
  FileText,
  Clock,
  Briefcase,
  Loader2
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
    <div className="space-y-8 min-h-screen text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">ESG Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">ESG Reports Center</h1>
          <p className="text-slate-400 text-sm max-w-2xl font-medium">Generate standard compliance declarations, design custom report templates, and download audit sheets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Builder Controls */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Report Configuration Card */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <Sliders className="text-blue-400" size={18} />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Report Settings</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="select-scope" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Scope / Framework</label>
                <select 
                  id="select-scope"
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-200 font-bold"
                >
                  <option value="ESG Summary">ESG Executive Rollup</option>
                  <option value="Environmental">Environmental Carbon Audit</option>
                  <option value="Social">Social Engagement Matrix</option>
                  <option value="Governance">Governance Index Rating</option>
                  <option value="Custom">Custom Report Builder</option>
                </select>
              </div>

              <div>
                <label htmlFor="select-dept" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Department</label>
                <select 
                  id="select-dept"
                  value={filters.department}
                  onChange={e => setFilters({...filters, department: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-355 focus:outline-none focus:border-blue-500/40 text-slate-205 font-bold"
                >
                  <option value="">All Corporate Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date-from" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date From</label>
                  <input 
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date To</label>
                  <input 
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={e => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="input-employee" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Employee Name</label>
                <input 
                  id="input-employee"
                  type="text"
                  placeholder="Enter employee name..."
                  value={filters.employee}
                  onChange={e => setFilters({...filters, employee: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-655"
                />
              </div>

              {reportType === 'Governance' && (
                <div>
                  <label htmlFor="select-gov-cat" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Governance Policy Category</label>
                  <select 
                    id="select-gov-cat"
                    value={filters.esgCategory}
                    onChange={e => setFilters({...filters, esgCategory: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/40 text-slate-202 font-bold"
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
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-95 disabled:from-blue-800 disabled:to-indigo-800 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 mt-6 text-xs shadow-lg shadow-blue-500/10"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <Sparkles size={14} />
                )}
                {isLoading ? 'Compiling Dataset...' : 'Compile ESG Report'}
              </button>
            </form>
          </div>

          {/* Saved Templates List Card */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <FolderOpen className="text-slate-500" size={16} />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Saved Configurations</h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {savedTemplates.map(tpl => (
                <div key={tpl._id} className="flex justify-between items-center p-3 bg-slate-900/10 border border-white/5 rounded-2xl text-xs hover:border-white/10 transition-colors">
                  <button 
                    onClick={() => handleLoadTemplate(tpl)}
                    className="text-left font-bold text-slate-350 hover:text-blue-400 transition-colors flex-1 truncate"
                  >
                    {tpl.title}
                    <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{tpl.type}</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(tpl._id)}
                    className="text-slate-500 hover:text-red-500 p-1.5 rounded-lg transition-colors ml-2 bg-slate-900/20"
                    title="Delete template config"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {savedTemplates.length === 0 && (
                <p className="text-[10px] text-slate-600 text-center py-4 italic">No configurations saved.</p>
              )}
            </div>

            {/* Save Configuration Form */}
            <form onSubmit={handleSaveTemplate} className="pt-3 border-t border-white/5 flex gap-2">
              <input 
                type="text"
                placeholder="Save configuration as..."
                required
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-202 focus:outline-none focus:border-blue-500/40 placeholder-slate-655"
              />
              <button 
                type="submit" 
                disabled={isSavingTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 p-2.5 rounded-xl transition-colors shrink-0"
                title="Save template"
              >
                <Save size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Data Dashboard & Visualization Tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Rollup */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/5 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-400 shadow-md">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-snug">{reportType} Dashboard</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-0.5">
                    <Calendar size={12} className="text-slate-500" />
                    <span>Compiled at {generatedData ? new Date(generatedData.generatedAt).toLocaleTimeString() : '--'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 self-start sm:self-center shrink-0">
                <button 
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-white/5 rounded-xl text-xs font-bold transition-all"
                >
                  <FileText size={12} className="text-red-400" />
                  PDF
                </button>
                <button 
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-white/5 rounded-xl text-xs font-bold transition-all"
                >
                  <FileSpreadsheet size={12} className="text-emerald-450" />
                  Excel
                </button>
                <button 
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-white/5 rounded-xl text-xs font-bold transition-all"
                >
                  <Download size={12} className="text-blue-400" />
                  CSV
                </button>
              </div>
            </div>

            {/* Rollup KPI Grid */}
            {generatedData?.summary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Environmental metric */}
                {(reportType === 'Environmental' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/10 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors shadow">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Leaf size={14} className="text-emerald-400" />
                      Carbon Emissions
                    </div>
                    <p className="text-2xl font-black text-white mt-4">{generatedData.summary.totalEmissions} <span className="text-xs text-slate-500 font-semibold tracking-normal lowercase">tons CO2e</span></p>
                  </div>
                )}

                {/* Social metric */}
                {(reportType === 'Social' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/10 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors shadow">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Users size={14} className="text-blue-400" />
                      CSR Engagement
                    </div>
                    <p className="text-2xl font-black text-white mt-4">{generatedData.summary.totalSocialPoints} <span className="text-xs text-slate-500 font-semibold tracking-normal lowercase">points</span></p>
                  </div>
                )}

                {/* Governance metric 1 */}
                {(reportType === 'Governance' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/10 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors shadow">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <ShieldCheck size={14} className="text-purple-400" />
                      Policy Signs
                    </div>
                    <p className={`text-2xl font-black mt-4 ${getKPIColor(generatedData.summary.policyAckRate)}`}>{generatedData.summary.policyAckRate}%</p>
                  </div>
                )}

                {/* Governance metric 2 */}
                {(reportType === 'Governance' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/10 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors shadow">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Globe size={14} className="text-indigo-400" />
                      Audits Completed
                    </div>
                    <p className={`text-2xl font-black mt-4 ${getKPIColor(generatedData.summary.auditCompletionRate)}`}>{generatedData.summary.auditCompletionRate}%</p>
                  </div>
                )}

                {/* Governance metric 3 */}
                {(reportType === 'Governance' || reportType === 'ESG Summary' || reportType === 'Custom') && (
                  <div className="bg-slate-900/10 border border-white/5 p-4.5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors shadow">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <AlertTriangle size={14} className="text-amber-500" />
                      Compliance Defects
                    </div>
                    <p className="text-2xl font-black text-white mt-4">
                      {generatedData.summary.totalIssues}
                      <span className="text-xs text-slate-500 font-medium ml-1">({generatedData.summary.resolvedIssues} resolved)</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-550 text-center py-6">Compile settings to display summary metrics dashboard</p>
            )}
          </div>

          {/* Dataset Tables List Container */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative min-h-[250px]">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-20 bg-slate-950/20 backdrop-blur-sm rounded-3xl text-slate-400 space-y-4">
                <Loader2 className="animate-spin text-blue-500" size={36} />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Compiling Report Datasets...</p>
              </div>
            ) : generatedData ? (
              <div className="space-y-8 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                
                {/* Environmental table preview */}
                {generatedData.environmental?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 uppercase tracking-wider flex items-center gap-2">
                      <Leaf size={14} className="text-emerald-400 animate-pulse" /> Environmental Activity Transactions
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-450 whitespace-nowrap min-w-[500px]">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5 font-semibold">
                            <th className="pb-2.5">Date</th>
                            <th className="pb-2.5">Department</th>
                            <th className="pb-2.5">Source Reference</th>
                            <th className="pb-2.5 text-right">CO2e Amount (Tons)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedData.environmental.map((t, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-slate-900/10">
                              <td className="py-3 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                              <td className="py-3 font-bold text-slate-200">{t.department?.name || 'Unknown'}</td>
                              <td className="py-3"><code className="bg-slate-900 px-2 py-0.5 rounded border border-white/5 text-[10px] text-slate-350">{t.sourceDocument}</code></td>
                              <td className="py-3 text-right font-black text-emerald-400">{t.co2eAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Social Table Preview */}
                {generatedData.social?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} className="text-blue-400 animate-pulse" /> Social / CSR Engagement logs
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-450 whitespace-nowrap min-w-[500px]">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5 font-semibold">
                            <th className="pb-2.5">Employee</th>
                            <th className="pb-2.5">CSR Activity</th>
                            <th className="pb-2.5">Completion Date</th>
                            <th className="pb-2.5">Status</th>
                            <th className="pb-2.5 text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedData.social.map((p, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-slate-900/10">
                              <td className="py-3 font-bold text-slate-200">{p.employee}</td>
                              <td className="py-3">{p.activity?.title || 'Unknown'}</td>
                              <td className="py-3">{p.completionDate ? new Date(p.completionDate).toLocaleDateString() : 'N/A'}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  p.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                  {p.approvalStatus}
                                </span>
                              </td>
                              <td className="py-3 text-right font-black text-blue-400">{p.pointsEarned}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Governance: Policies Table Preview */}
                {generatedData.governance?.policies?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck size={14} className="text-purple-400 animate-pulse" /> Policy Acknowledgements Logs
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-450 whitespace-nowrap min-w-[500px]">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5 font-semibold">
                            <th className="pb-2.5">Policy Title</th>
                            <th className="pb-2.5">Employee</th>
                            <th className="pb-2.5">Status</th>
                            <th className="pb-2.5">Signed On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedData.governance.policies.map((p, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-slate-900/10">
                              <td className="py-3 font-bold text-slate-200">{p.policy?.title || 'Unknown'}</td>
                              <td className="py-3 font-semibold text-slate-350">{p.employee}</td>
                              <td className="py-3 text-emerald-450 font-bold">{p.status}</td>
                              <td className="py-3">{p.acknowledgedAt ? new Date(p.acknowledgedAt).toLocaleString() : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Governance: Audits Table Preview */}
                {generatedData.governance?.audits?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase size={14} className="text-indigo-400 animate-pulse" /> Audits Registry
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-450 whitespace-nowrap min-w-[500px]">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5 font-semibold">
                            <th className="pb-2.5">Audit Scope</th>
                            <th className="pb-2.5">Auditor</th>
                            <th className="pb-2.5">Date Range</th>
                            <th className="pb-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedData.governance.audits.map((a, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-slate-900/10">
                              <td className="py-3 font-bold text-slate-205">{a.title}</td>
                              <td className="py-3 font-semibold text-slate-350">{a.auditor}</td>
                              <td className="py-3">{new Date(a.startDate).toLocaleDateString()} to {new Date(a.endDate).toLocaleDateString()}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  a.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Governance: Compliance Issues Table Preview */}
                {generatedData.governance?.complianceIssues?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-500 animate-pulse" /> Corrective Compliance Issues
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-450 whitespace-nowrap min-w-[500px]">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5 font-semibold">
                            <th className="pb-2.5">Issue Title</th>
                            <th className="pb-2.5">Owner</th>
                            <th className="pb-2.5">Due Date</th>
                            <th className="pb-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedData.governance.complianceIssues.map((i, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-slate-900/10">
                              <td className="py-3 font-bold text-slate-205">{i.title}</td>
                              <td className="py-3 font-semibold text-slate-350">{i.owner}</td>
                              <td className="py-3">{new Date(i.dueDate).toLocaleDateString()}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  i.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                                }`}>
                                  {i.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-slate-600 space-y-3">
                <BarChart3 size={32} className="text-slate-700" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Preview Empty</p>
                <p className="text-xs text-slate-655 max-w-xs text-center leading-relaxed">Select a scope and configure filters on the left settings panel, then click Compile to load datasets.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
