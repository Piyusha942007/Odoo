const { Policy, PolicyAcknowledgement } = require('../models/Policy');
const { Audit, ComplianceIssue } = require('../models/Audit');
const Department = require('../models/Department');
const EsgConfig = require('../models/EsgConfig');

/**
 * Calculates the overall Governance Score based on Governance module data:
 * - Policy Acknowledgement Rate (40%)
 * - Audit Completion Rate (30%)
 * - Compliance Issue Resolution Rate (30%), penalized by overdue issues.
 *
 * It then updates all departments with the calculated governanceScore and re-aggregates the overall Total ESG Score.
 * 
 * @returns {Promise<Object>} Object containing the computed scores and breakdown
 */
async function calculateAndUpdateGovernanceScore() {
  try {
    // 1. Policy Acknowledgement Rate
    const totalAcks = await PolicyAcknowledgement.countDocuments();
    const acknowledgedCount = await PolicyAcknowledgement.countDocuments({ status: 'Acknowledged' });
    const policyAckPercentage = totalAcks > 0 ? (acknowledgedCount / totalAcks) : 1;

    // 2. Audit Completion Rate
    const totalAudits = await Audit.countDocuments();
    const completedAudits = await Audit.countDocuments({ status: 'Completed' });
    const auditCompletionRate = totalAudits > 0 ? (completedAudits / totalAudits) : 1;

    // 3. Compliance Issue Resolution Rate (penalized by Overdue issues)
    const totalIssues = await ComplianceIssue.countDocuments();
    const resolvedIssues = await ComplianceIssue.countDocuments({ status: 'Resolved' });
    
    // We count overdue issues based on date, just in case they haven't been saved with 'Overdue' status yet
    const now = new Date();
    const overdueIssuesCount = await ComplianceIssue.countDocuments({
      status: { $nin: ['Resolved', 'Completed', 'Closed'] },
      dueDate: { $lt: now }
    });

    let complianceResolutionRate = 1;
    if (totalIssues > 0) {
      // Resolved issues add points, Overdue issues deduct 0.5 weight points
      const scoreWeight = resolvedIssues - (overdueIssuesCount * 0.5);
      complianceResolutionRate = Math.max(0, scoreWeight / totalIssues);
    }

    // 4. Aggregate Governance Score
    const governanceScore = Math.round(
      (policyAckPercentage * 40) +
      (auditCompletionRate * 30) +
      (complianceResolutionRate * 30)
    );

    // 5. Update all Department documents using dynamic ESG weights configuration
    let config = await EsgConfig.findOne();
    if (!config) {
      config = { environmentalWeight: 40, socialWeight: 30, governanceWeight: 30 };
    }

    const envWt = config.environmentalWeight / 100;
    const socWt = config.socialWeight / 100;
    const govWt = config.governanceWeight / 100;

    const departments = await Department.find();
    for (const dept of departments) {
      dept.governanceScore = governanceScore;

      // Recompute Total ESG Score (using config weights)
      const envScore = dept.environmentalScore || 0;
      const socScore = dept.socialScore || 0;
      dept.totalESGScore = Math.round((envScore * envWt) + (socScore * socWt) + (governanceScore * govWt));

      await dept.save();
    }

    return {
      governanceScore,
      breakdown: {
        policyAckPercentage: Math.round(policyAckPercentage),
        auditCompletionRate: Math.round(auditCompletionRate),
        complianceResolutionRate: Math.round(complianceResolutionRate),
        totalAcks,
        acknowledgedCount,
        totalAudits,
        completedAudits,
        totalIssues,
        resolvedIssues,
        overdueIssuesCount
      }
    };
  } catch (error) {
    console.error('Failed to calculate and update Governance Score:', error.message);
    throw error;
  }
}

module.exports = {
  calculateAndUpdateGovernanceScore
};
