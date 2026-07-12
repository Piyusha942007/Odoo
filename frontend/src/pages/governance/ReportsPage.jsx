import React, { useState } from 'react';
import { BarChart3, Download, RefreshCw, Calendar, Sparkles, Sliders } from 'lucide-react';

function ReportsPage() {
  const [reportType, setReportType] = useState('ESG Summary');
  const [filters, setFilters] = useState({
    department: 'All',
    dateRange: 'This Year',
    module: 'All',
    employee: 'All',
    challenge: 'All',
    category: 'All'
  });
  
  const [generatedReport, setGeneratedReport] = useState({
    title: 'Q2 2026 ESG Executive Summary',
    generatedAt: '2026-07-12',
    metrics: [
      { name: 'Environmental Score', value: 82, target: 85, status: 'On Track', color: 'bg-emerald-500' },
      { name: 'Social Compliance Rate', value: 75, target: 80, status: 'Needs Focus', color: 'bg-blue-500' },
      { name: 'Governance & Audits', value: 95, target: 90, status: 'Exceeding', color: 'bg-purple-500' }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setGeneratedReport({
        title: `Custom ${reportType} Report - Generated`,
        generatedAt: new Date().toISOString().split('T')[0],
        metrics: reportType === 'Environmental' ? [
          { name: 'Scope 1 Carbon (MT CO2e)', value: 450, target: 500, status: 'Under Target', color: 'bg-emerald-500' },
          { name: 'Scope 2 Carbon (MT CO2e)', value: 520, target: 480, status: 'Over Target', color: 'bg-red-500' },
          { name: 'Recycling & E-Waste (%)', value: 100, target: 100, status: 'Completed', color: 'bg-teal-500' }
        ] : reportType === 'Social' ? [
          { name: 'CSR Hours Logged', value: 320, target: 300, status: 'Exceeding', color: 'bg-blue-500' },
          { name: 'CSR Participation Rate (%)', value: 74, target: 80, status: 'Needs Focus', color: 'bg-indigo-500' },
          { name: 'Compliance Training Completion', value: 88, target: 95, status: 'In Progress', color: 'bg-cyan-500' }
        ] : reportType === 'Governance' ? [
          { name: 'Policy Acknowledgement (%)', value: 95, target: 98, status: 'Near Target', color: 'bg-purple-500' },
          { name: 'Compliance Issues Resolved', value: 14, target: 15, status: 'On Track', color: 'bg-pink-500' },
          { name: 'Avg Resolution Time (Days)', value: 6.2, target: 7.0, status: 'Exceeding', color: 'bg-amber-500' }
        ] : [
          { name: 'Environmental Score', value: 82, target: 85, status: 'On Track', color: 'bg-emerald-500' },
          { name: 'Social Compliance Rate', value: 75, target: 80, status: 'Needs Focus', color: 'bg-blue-500' },
          { name: 'Governance & Audits', value: 95, target: 90, status: 'Exceeding', color: 'bg-purple-500' }
        ]
      });
    }, 800);
  };

  const handleExport = (format) => {
    alert(`Exporting "${generatedReport.title}" as ${format}...\nThis feature is fully modeled and will execute downloading in later stages.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ESG Reports Center</h1>
        <p className="text-slate-400 mt-2 font-medium">Build custom ESG reports, configure filters, and export results for compliance submissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Builder Form */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
            <Sliders className="text-emerald-400" size={20} />
            <h2 className="text-lg font-bold text-white">Report Builder</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Report Type</label>
              <select 
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              >
                <option value="ESG Summary">ESG Summary Report</option>
                <option value="Environmental">Environmental Metrics</option>
                <option value="Social">Social & CSR Metrics</option>
                <option value="Governance">Governance & Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Department</label>
              <select 
                value={filters.department}
                onChange={e => setFilters({...filters, department: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Facilities">Facilities</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Date Range</label>
              <select 
                value={filters.dateRange}
                onChange={e => setFilters({...filters, dateRange: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              >
                <option value="This Month">This Month</option>
                <option value="This Quarter">This Quarter</option>
                <option value="This Year">This Year (YTD)</option>
                <option value="Custom">Custom Range...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">ESG Category</label>
              <select 
                value={filters.category}
                onChange={e => setFilters({...filters, category: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              >
                <option value="All">All Categories</option>
                <option value="Scope 1 & 2">Scope 1 & 2 Emissions</option>
                <option value="Social CSR">Social / Gamified Activities</option>
                <option value="Policies">Corporate Governance Policies</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Sparkles size={18} />
              )}
              {isLoading ? 'Generating...' : 'Compile ESG Report'}
            </button>
          </form>
        </div>

        {/* Generated Report View */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{generatedReport.title}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <Calendar size={12} />
                    <span>Compiled on {generatedReport.generatedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('PDF')}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg hover:text-white transition-colors"
                  title="Export PDF"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-5">
              {generatedReport.metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300">{metric.name}</span>
                    <div className="space-x-3 text-xs">
                      <span className="text-slate-500">Target: <strong className="text-slate-400 font-semibold">{metric.target}</strong></span>
                      <span className="font-bold text-slate-200">Current: {metric.value}</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className={`h-full ${metric.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (metric.value / (metric.target || 100)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Performance ratio: {Math.round((metric.value / (metric.target || 100)) * 100)}%</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-md ${
                      metric.status === 'Exceeding' || metric.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : metric.status === 'On Track'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex gap-3 justify-end">
            <button 
              onClick={() => handleExport('PDF')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              Export PDF
            </button>
            <button 
              onClick={() => handleExport('Excel')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              Export Excel
            </button>
            <button 
              onClick={() => handleExport('CSV')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
