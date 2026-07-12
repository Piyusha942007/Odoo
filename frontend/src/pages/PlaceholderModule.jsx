import React from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Shield, FileBarChart, Settings } from 'lucide-react';

function PlaceholderModule() {
  const location = useLocation();
  const path = location.pathname.replace('/', '');

  const getModuleInfo = () => {
    switch (path) {
      case 'social':
        return {
          title: 'Social & Gamification',
          description: 'Tracks employee engagement, CSR activities, and community impact goals.',
          icon: <Award className="w-12 h-12 text-purple-400" />,
          features: [
            'CSR Activity Registry',
            'Employee Participation Tracking',
            'Corporate Challenges & Goals',
            'XP, Badges & Rewards Engine',
            'Leaderboards & Social Feed'
          ]
        };
      case 'governance':
        return {
          title: 'Governance & Compliance',
          description: 'Manages board oversight, audit compliance, policies, and whistleblowing reports.',
          icon: <Shield className="w-12 h-12 text-blue-400" />,
          features: [
            'ESG Policy Registry',
            'Compliance Audits & Reports',
            'Whistleblower Hotline Management',
            'Risk Assessments & Controls',
            'Governance Score Calculator'
          ]
        };
      case 'reports':
        return {
          title: 'Reports & Analytics',
          description: 'Generates board-ready ESG reporting packages and automated disclosures.',
          icon: <FileBarChart className="w-12 h-12 text-orange-400" />,
          features: [
            'Automated ESG Disclosure Pack',
            'Custom Report Builder (Drag & Drop)',
            'PDF/Excel Exports',
            'Scoring Breakdown Trends',
            'Regulatory Framework Mapping (GRI, SASB)'
          ]
        };
      case 'settings':
        return {
          title: 'Platform Settings',
          description: 'Configure organization weightings, calculations, and integrations.',
          icon: <Settings className="w-12 h-12 text-slate-400" />,
          features: [
            'ESG Weighting (Environmental / Social / Governance)',
            'Auto Emission Calculation toggle',
            'ERP Integration Connectors',
            'User Access Roles & Permissions',
            'Audit Log Trail'
          ]
        };
      default:
        return {
          title: 'Module Under Construction',
          description: 'This area is currently being developed.',
          icon: <Settings className="w-12 h-12 text-emerald-400" />,
          features: []
        };
    }
  };

  const info = getModuleInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl animate-fade-in">
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
          {info.icon}
        </div>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">{info.title}</h2>
          <p className="text-slate-400 font-medium text-sm md:text-base">{info.description}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200">Module Scope & Features (Sprints 2 & 3)</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300 font-medium text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PlaceholderModule;
