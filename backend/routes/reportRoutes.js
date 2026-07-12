const express = require('express');
const router = express.Router();
const { Report } = require('../models/Report');

// Import all models needed for reporting
const CarbonTransaction = require('../models/CarbonTransaction');
const EmployeeParticipation = require('../models/EmployeeParticipation');
const ChallengeParticipation = require('../models/ChallengeParticipation');
const { Policy, PolicyAcknowledgement } = require('../models/Policy');
const { Audit, ComplianceIssue } = require('../models/Audit');
const Department = require('../models/Department');
const Challenge = require('../models/Challenge');
const CsrActivity = require('../models/CsrActivity');

/**
 * Reusable dynamic query compiler for all ESG modules
 */
const gatherReportData = async (type, filters = {}) => {
  const data = {
    environmental: [],
    social: [],
    governance: {
      policies: [],
      audits: [],
      complianceIssues: []
    },
    summary: {}
  };

  // Build Department Filter
  let deptIds = [];
  if (filters.department) {
    deptIds = [filters.department];
  } else {
    const depts = await Department.find();
    deptIds = depts.map(d => d._id);
  }

  // 1. Environmental Data (Carbon Transactions)
  if (type === 'Environmental' || type === 'ESG Summary' || type === 'Custom') {
    const envQuery = { department: { $in: deptIds } };
    if (filters.dateFrom || filters.dateTo) {
      envQuery.date = {};
      if (filters.dateFrom) envQuery.date.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) envQuery.date.$lte = new Date(filters.dateTo);
    }
    data.environmental = await CarbonTransaction.find(envQuery)
      .populate('department')
      .populate('emissionFactor');
  }

  // 2. Social Data (Employee Participations)
  if (type === 'Social' || type === 'ESG Summary' || type === 'Custom') {
    const activityQuery = { department: { $in: deptIds } };
    const activities = await CsrActivity.find(activityQuery);
    const activityIds = activities.map(a => a._id);

    const partQuery = { activity: { $in: activityIds } };
    if (filters.employee) {
      partQuery.employee = { $regex: filters.employee, $options: 'i' };
    }
    if (filters.dateFrom || filters.dateTo) {
      partQuery.completionDate = {};
      if (filters.dateFrom) partQuery.completionDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) partQuery.completionDate.$lte = new Date(filters.dateTo);
    }

    const parts = await EmployeeParticipation.find(partQuery)
      .populate({
        path: 'activity',
        populate: { path: 'department' }
      });
    
    data.social = parts;
  }

  // 3. Governance Data (Policies, Audits, Compliance Issues)
  if (type === 'Governance' || type === 'ESG Summary' || type === 'Custom') {
    // Policies
    const policyQuery = {};
    if (filters.esgCategory) {
      policyQuery.category = filters.esgCategory;
    }
    const policies = await Policy.find(policyQuery);
    const policyIds = policies.map(p => p._id);

    const ackQuery = { policy: { $in: policyIds } };
    if (filters.employee) {
      ackQuery.employee = { $regex: filters.employee, $options: 'i' };
    }
    const acks = await PolicyAcknowledgement.find(ackQuery).populate('policy');
    data.governance.policies = acks;

    // Audits
    const auditQuery = {};
    if (filters.dateFrom || filters.dateTo) {
      auditQuery.startDate = {};
      if (filters.dateFrom) auditQuery.startDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) auditQuery.startDate.$lte = new Date(filters.dateTo);
    }
    const audits = await Audit.find(auditQuery);
    data.governance.audits = audits;

    // Compliance Issues
    const issueQuery = {};
    if (filters.employee) {
      issueQuery.owner = { $regex: filters.employee, $options: 'i' };
    }
    if (filters.dateFrom || filters.dateTo) {
      issueQuery.dueDate = {};
      if (filters.dateFrom) issueQuery.dueDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) issueQuery.dueDate.$lte = new Date(filters.dateTo);
    }
    const issues = await ComplianceIssue.find(issueQuery);
    data.governance.complianceIssues = issues;
  }

  // 4. Summaries Computation
  const totalEmissions = data.environmental.reduce((sum, t) => sum + (t.co2eAmount || 0), 0);
  const totalSocialPoints = data.social.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
  
  const totalAcks = data.governance.policies.length;
  const signedAcks = data.governance.policies.filter(a => a.status === 'Acknowledged').length;
  const policyAckRate = totalAcks > 0 ? Math.round((signedAcks / totalAcks) * 100) : 100;

  const totalAudits = data.governance.audits.length;
  const completedAudits = data.governance.audits.filter(a => a.status === 'Completed').length;
  const auditCompletionRate = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 100;

  const totalIssues = data.governance.complianceIssues.length;
  const resolvedIssues = data.governance.complianceIssues.filter(i => i.status === 'Resolved').length;

  data.summary = {
    totalEmissions: Math.round(totalEmissions * 10) / 10,
    totalSocialPoints,
    policyAckRate,
    auditCompletionRate,
    totalIssues,
    resolvedIssues
  };

  return data;
};

// GET all saved reports/templates
router.get('/', async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
});

// POST save a report template
router.post('/', async (req, res, next) => {
  try {
    const { title, type, filters, createdBy } = req.body;
    const report = new Report({
      title,
      type,
      filters,
      createdBy: createdBy || 'System'
    });
    const savedReport = await report.save();
    res.status(201).json({ success: true, data: savedReport });
  } catch (error) {
    next(error);
  }
});

// DELETE a saved report template
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ success: false, message: 'Report template not found' });
    }
    res.json({ success: true, message: 'Report template deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST generate report dynamically based on real data
router.post('/generate', async (req, res, next) => {
  try {
    const { type, filters } = req.body;
    const reportData = await gatherReportData(type || 'ESG Summary', filters || {});
    res.json({ success: true, data: { generatedAt: new Date(), type: type || 'ESG Summary', filters: filters || {}, ...reportData } });
  } catch (error) {
    next(error);
  }
});

// GET export report as CSV / Excel / PDF
router.get('/export', async (req, res, next) => {
  try {
    const { type, format, filters: filtersStr } = req.query;
    let filters = {};
    if (filtersStr) {
      try {
        filters = JSON.parse(filtersStr);
      } catch (err) {
        console.error('Failed to parse export filters:', err);
      }
    }

    const reportData = await gatherReportData(type || 'ESG Summary', filters);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `esg_${(type || 'summary').toLowerCase().replace(/\s+/g, '_')}_report_${dateStr}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      
      let csvContent = `ESG REPORT: ${(type || 'ESG Summary').toUpperCase()}\n`;
      csvContent += `Generated At,${new Date().toLocaleString()}\n\n`;

      csvContent += `SUMMARY METRICS\n`;
      csvContent += `Metric,Value\n`;
      if (type === 'Environmental' || type === 'ESG Summary' || type === 'Custom') {
        csvContent += `Total Emissions (CO2e Tons),${reportData.summary.totalEmissions}\n`;
      }
      if (type === 'Social' || type === 'ESG Summary' || type === 'Custom') {
        csvContent += `Total CSR Points Earned,${reportData.summary.totalSocialPoints}\n`;
      }
      if (type === 'Governance' || type === 'ESG Summary' || type === 'Custom') {
        csvContent += `Policy Acknowledgement Rate (%),${reportData.summary.policyAckRate}\n`;
        csvContent += `Audit Completion Rate (%),${reportData.summary.auditCompletionRate}\n`;
        csvContent += `Total Compliance Issues,${reportData.summary.totalIssues}\n`;
        csvContent += `Resolved Compliance Issues,${reportData.summary.resolvedIssues}\n`;
      }
      csvContent += `\n`;

      if (type === 'Environmental' || type === 'Custom') {
        csvContent += `ENVIRONMENTAL: CARBON TRANSACTIONS\n`;
        csvContent += `Date,Department,Source Document,CO2e Amount,Calculation Type\n`;
        reportData.environmental.forEach(t => {
          csvContent += `"${new Date(t.date).toLocaleDateString()}","${t.department?.name || 'Unknown'}","${t.sourceDocument}",${t.co2eAmount},"${t.calculationType}"\n`;
        });
        csvContent += `\n`;
      }

      if (type === 'Social' || type === 'Custom') {
        csvContent += `SOCIAL: CSR EMPLOYEE PARTICIPATIONS\n`;
        csvContent += `Employee,CSR Activity,Department,Date,Status,Points Earned\n`;
        reportData.social.forEach(p => {
          csvContent += `"${p.employee}","${p.activity?.title || 'Unknown'}","${p.activity?.department?.name || 'Unknown'}","${p.completionDate ? new Date(p.completionDate).toLocaleDateString() : 'N/A'}","${p.approvalStatus}",${p.pointsEarned}\n`;
        });
        csvContent += `\n`;
      }

      if (type === 'Governance' || type === 'Custom') {
        csvContent += `GOVERNANCE: POLICIES ACKNOWLEDGEMENTS\n`;
        csvContent += `Policy Title,Employee,Status,Signed Date\n`;
        reportData.governance.policies.forEach(a => {
          csvContent += `"${a.policy?.title || 'Unknown'}","${a.employee}","${a.status}","${a.acknowledgedAt ? new Date(a.acknowledgedAt).toLocaleString() : 'N/A'}"\n`;
        });
        csvContent += `\n`;

        csvContent += `GOVERNANCE: AUDITS\n`;
        csvContent += `Audit Title,Auditor,Start Date,End Date,Status\n`;
        reportData.governance.audits.forEach(a => {
          csvContent += `"${a.title}","${a.auditor}","${new Date(a.startDate).toLocaleDateString()}","${new Date(a.endDate).toLocaleDateString()}","${a.status}"\n`;
        });
        csvContent += `\n`;

        csvContent += `GOVERNANCE: COMPLIANCE ISSUES\n`;
        csvContent += `Issue Title,Owner,Severity,Due Date,Status\n`;
        reportData.governance.complianceIssues.forEach(i => {
          csvContent += `"${i.title}","${i.owner}","${i.severity}","${new Date(i.dueDate).toLocaleDateString()}","${i.status}"\n`;
        });
        csvContent += `\n`;
      }

      return res.send(csvContent);

    } else if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);

      let htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; }
              th { background-color: #10b981; color: white; text-align: left; }
              h2, h3 { font-family: Arial, sans-serif; color: #1e293b; }
            </style>
          </head>
          <body>
            <h2>ESG Report: ${type}</h2>
            <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>

            <h3>Summary KPI Dashboard</h3>
            <table>
              <tr>
                <th>Indicator Metric</th>
                <th>Value / Performance</th>
              </tr>
              ${type === 'Environmental' || type === 'ESG Summary' || type === 'Custom' ? `
                <tr>
                  <td>Total Emissions (CO2e Tons)</td>
                  <td><b>${reportData.summary.totalEmissions}</b></td>
                </tr>
              ` : ''}
              ${type === 'Social' || type === 'ESG Summary' || type === 'Custom' ? `
                <tr>
                  <td>Total CSR Points Earned</td>
                  <td><b>${reportData.summary.totalSocialPoints}</b></td>
                </tr>
              ` : ''}
              ${type === 'Governance' || type === 'ESG Summary' || type === 'Custom' ? `
                <tr>
                  <td>Policy Acknowledgement Rate (%)</td>
                  <td><b>${reportData.summary.policyAckRate}%</b></td>
                </tr>
                <tr>
                  <td>Audit Completion Rate (%)</td>
                  <td><b>${reportData.summary.auditCompletionRate}%</b></td>
                </tr>
                <tr>
                  <td>Total Compliance Issues</td>
                  <td><b>${reportData.summary.totalIssues}</b></td>
                </tr>
                <tr>
                  <td>Resolved Compliance Issues</td>
                  <td><b>${reportData.summary.resolvedIssues}</b></td>
                </tr>
              ` : ''}
            </table>
      `;

      if (type === 'Environmental' || type === 'Custom') {
        htmlContent += `
          <h3>Environmental: Carbon Transactions</h3>
          <table>
            <tr>
              <th>Date</th>
              <th>Department</th>
              <th>Source Document</th>
              <th>CO2e Amount</th>
              <th>Calculation Type</th>
            </tr>
            ${reportData.environmental.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.department?.name || 'Unknown'}</td>
                <td>${t.sourceDocument}</td>
                <td>${t.co2eAmount}</td>
                <td>${t.calculationType}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      if (type === 'Social' || type === 'Custom') {
        htmlContent += `
          <h3>Social: CSR Employee Participations</h3>
          <table>
            <tr>
              <th>Employee Name</th>
              <th>CSR Activity</th>
              <th>Department</th>
              <th>Completion Date</th>
              <th>Status</th>
              <th>Points Earned</th>
            </tr>
            ${reportData.social.map(p => `
              <tr>
                <td>${p.employee}</td>
                <td>${p.activity?.title || 'Unknown'}</td>
                <td>${p.activity?.department?.name || 'Unknown'}</td>
                <td>${p.completionDate ? new Date(p.completionDate).toLocaleDateString() : 'N/A'}</td>
                <td>${p.approvalStatus}</td>
                <td>${p.pointsEarned}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      if (type === 'Governance' || type === 'Custom') {
        htmlContent += `
          <h3>Governance: Policy Acknowledgements</h3>
          <table>
            <tr>
              <th>Policy</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Signature Timestamp</th>
            </tr>
            ${reportData.governance.policies.map(a => `
              <tr>
                <td>${a.policy?.title || 'Unknown'}</td>
                <td>${a.employee}</td>
                <td>${a.status}</td>
                <td>${a.acknowledgedAt ? new Date(a.acknowledgedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </table>

          <h3>Governance: ESG Audits</h3>
          <table>
            <tr>
              <th>Audit Title</th>
              <th>Auditor</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
            ${reportData.governance.audits.map(a => `
              <tr>
                <td>${a.title}</td>
                <td>${a.auditor}</td>
                <td>${new Date(a.startDate).toLocaleDateString()}</td>
                <td>${new Date(a.endDate).toLocaleDateString()}</td>
                <td>${a.status}</td>
              </tr>
            `).join('')}
          </table>

          <h3>Governance: Compliance Issues</h3>
          <table>
            <tr>
              <th>Issue Title</th>
              <th>Owner</th>
              <th>Severity</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
            ${reportData.governance.complianceIssues.map(i => `
              <tr>
                <td>${i.title}</td>
                <td>${i.owner}</td>
                <td>${i.severity}</td>
                <td>${new Date(i.dueDate).toLocaleDateString()}</td>
                <td>${i.status}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      htmlContent += `
          </body>
        </html>
      `;

      return res.send(htmlContent);

    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'text/html');
      
      let htmlContent = `
        <html>
          <head>
            <title>ESG Report - ${type}</title>
            <style>
              body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; }
              .header-bar { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
              table { border-collapse: collapse; width: 100%; margin-top: 15px; margin-bottom: 30px; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; font-size: 13px; text-align: left; }
              th { background-color: #f8fafc; color: #475569; font-weight: bold; }
              .grid-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 35px; }
              .kpi-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
              .kpi-value { font-size: 24px; font-weight: 900; color: #10b981; margin-top: 5px; }
              .no-print-banner { background: #e0f2fe; padding: 15px; border-radius: 8px; font-size: 13px; color: #0369a1; margin-bottom: 20px; font-weight: 500; }
              @media print {
                .no-print-banner { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="no-print-banner">
              🖨️ PDF Generation: The browser print dialog has been automatically opened. Select <strong>Save as PDF</strong> as your destination.
            </div>

            <div class="header-bar">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800;">EcoSphere ESG Report Panel</h1>
              <div style="margin-top: 10px; font-size: 12px; color: #64748b; display: flex; justify-between; width: 100%;">
                <span><strong>Report Scope:</strong> ${type}</span>
                <span style="margin-left: auto;"><strong>Generated On:</strong> ${new Date().toLocaleString()}</span>
              </div>
            </div>

            <div class="grid-kpis">
              ${type === 'Environmental' || type === 'ESG Summary' || type === 'Custom' ? `
                <div class="kpi-card">
                  <div style="font-size: 11px; font-weight: bold; color: #64748b; uppercase;">CO2e Emissions</div>
                  <div class="kpi-value">${reportData.summary.totalEmissions} tons</div>
                </div>
              ` : ''}
              ${type === 'Social' || type === 'ESG Summary' || type === 'Custom' ? `
                <div class="kpi-card">
                  <div style="font-size: 11px; font-weight: bold; color: #64748b; uppercase;">CSR Gamification Points</div>
                  <div class="kpi-value">${reportData.summary.totalSocialPoints} pts</div>
                </div>
              ` : ''}
              ${type === 'Governance' || type === 'ESG Summary' || type === 'Custom' ? `
                <div class="kpi-card">
                  <div style="font-size: 11px; font-weight: bold; color: #64748b; uppercase;">Policy Signed Rate</div>
                  <div class="kpi-value">${reportData.summary.policyAckRate}%</div>
                </div>
                <div class="kpi-card">
                  <div style="font-size: 11px; font-weight: bold; color: #64748b; uppercase;">Compliance Audits Done</div>
                  <div class="kpi-value">${reportData.summary.auditCompletionRate}%</div>
                </div>
                <div class="kpi-card">
                  <div style="font-size: 11px; font-weight: bold; color: #64748b; uppercase;">Compliance Defect Issues</div>
                  <div class="kpi-value">${reportData.summary.totalIssues} (${reportData.summary.resolvedIssues} resolved)</div>
                </div>
              ` : ''}
            </div>
      `;

      if (type === 'Environmental' || type === 'Custom') {
        htmlContent += `
          <h2 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Environmental Activity Tracking</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Source Doc</th>
                <th>CO2e Value (Tons)</th>
                <th>Trigger Mode</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.environmental.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.department?.name || 'Unknown'}</td>
                  <td><code>${t.sourceDocument}</code></td>
                  <td>${t.co2eAmount}</td>
                  <td>${t.calculationType}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      if (type === 'Social' || type === 'Custom') {
        htmlContent += `
          <h2 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Social Engagement Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>CSR Activity</th>
                <th>Department</th>
                <th>Completed Date</th>
                <th>Status</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.social.map(p => `
                <tr>
                  <td>${p.employee}</td>
                  <td>${p.activity?.title || 'Unknown'}</td>
                  <td>${p.activity?.department?.name || 'Unknown'}</td>
                  <td>${p.completionDate ? new Date(p.completionDate).toLocaleDateString() : 'N/A'}</td>
                  <td><span style="font-weight:bold; color: ${p.approvalStatus === 'Approved' ? '#10b981' : '#f59e0b'}">${p.approvalStatus}</span></td>
                  <td>${p.pointsEarned}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      if (type === 'Governance' || type === 'Custom') {
        htmlContent += `
          <h2 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Policy Acknowledgement Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Policy Document</th>
                <th>Employee Name</th>
                <th>Sign Status</th>
                <th>Signature Date</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.governance.policies.map(a => `
                <tr>
                  <td>${a.policy?.title || 'Unknown'}</td>
                  <td>${a.employee}</td>
                  <td><span style="color:#10b981; font-weight:bold;">${a.status}</span></td>
                  <td>${a.acknowledgedAt ? new Date(a.acknowledgedAt).toLocaleString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Compliance Audits</h2>
          <table>
            <thead>
              <tr>
                <th>Audit scope</th>
                <th>Assigned Auditor</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.governance.audits.map(a => `
                <tr>
                  <td>${a.title}</td>
                  <td>${a.auditor}</td>
                  <td>${new Date(a.startDate).toLocaleDateString()}</td>
                  <td>${new Date(a.endDate).toLocaleDateString()}</td>
                  <td>${a.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2 style="font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Compliance Issues</h2>
          <table>
            <thead>
              <tr>
                <th>Issue Details</th>
                <th>Assignee</th>
                <th>Severity</th>
                <th>Due date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.governance.complianceIssues.map(i => `
                <tr>
                  <td><strong>${i.title}</strong><br/><span style="font-size:11px; color:#64748b;">${i.description}</span></td>
                  <td>${i.owner}</td>
                  <td>${i.severity}</td>
                  <td>${new Date(i.dueDate).toLocaleDateString()}</td>
                  <td>${i.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      htmlContent += `
          </body>
        </html>
      `;

      return res.send(htmlContent);
    }

    res.status(400).json({ success: false, message: 'Invalid format requested' });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
