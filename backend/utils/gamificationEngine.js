const EmployeeParticipation = require('../models/EmployeeParticipation');
const ChallengeParticipation = require('../models/ChallengeParticipation');
const Redemption = require('../models/Redemption');
const Badge = require('../models/Badge');
const EmployeeBadge = require('../models/EmployeeBadge');
const EsgSettings = require('../models/EsgSettings');

/**
 * Calculates the complete points & stats ledger for a given employee name.
 * Points and XP are treated as a single unified ledger.
 */
async function getEmployeeStats(employeeName) {
  if (!employeeName) {
    return {
      employee: '',
      totalXp: 0,
      spentPoints: 0,
      currentPoints: 0,
      completedChallengesCount: 0,
      completedCsrActivitiesCount: 0,
      departmentName: 'Unassigned'
    };
  }

  // 1. Get approved CSR participations
  const csrParticipations = await EmployeeParticipation.find({
    employee: employeeName,
    approvalStatus: 'Approved'
  }).populate({
    path: 'activity',
    populate: { path: 'department' }
  });

  // 2. Get approved Challenge participations
  const challengeParticipations = await ChallengeParticipation.find({
    employee: employeeName,
    approvalStatus: 'Approved'
  });

  // 3. Get all redemptions
  const redemptions = await Redemption.find({ employee: employeeName });

  // Calculate totals
  const totalCsrXp = csrParticipations.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
  const totalChallengeXp = challengeParticipations.reduce((sum, p) => sum + (p.xpAwarded || 0), 0);
  const totalXp = totalCsrXp + totalChallengeXp;

  const spentPoints = redemptions.reduce((sum, r) => sum + (r.pointsSpent || 0), 0);
  const currentPoints = Math.max(0, totalXp - spentPoints);

  const completedCsrActivitiesCount = csrParticipations.length;
  const completedChallengesCount = challengeParticipations.length;

  // Determine department by checking the first available approved participation's department
  let departmentName = 'Unassigned';
  for (const p of csrParticipations) {
    if (p.activity && p.activity.department && p.activity.department.name) {
      departmentName = p.activity.department.name;
      break;
    }
  }

  return {
    employee: employeeName,
    totalXp,
    spentPoints,
    currentPoints,
    completedChallengesCount,
    completedCsrActivitiesCount,
    departmentName
  };
}

/**
 * Check if the employee qualifies for any new badges, and award them.
 */
async function checkAndAwardBadges(employeeName) {
  try {
    if (!employeeName) return [];

    // Check if auto-award toggle is ON
    let settings = await EsgSettings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await EsgSettings.create({ badgeAutoAward: true });
    }

    if (!settings.badgeAutoAward) {
      console.log(`Badge Auto-Award is disabled globally. Skipping for ${employeeName}.`);
      return [];
    }

    // Get current stats
    const stats = await getEmployeeStats(employeeName);

    // Get all active badges
    const activeBadges = await Badge.find({ status: 'Active' });

    // Get earned badges
    const earnedRecords = await EmployeeBadge.find({ employee: employeeName });
    const earnedBadgeIds = earnedRecords.map(rec => rec.badge.toString());

    const newlyAwarded = [];

    for (const badge of activeBadges) {
      if (earnedBadgeIds.includes(badge._id.toString())) {
        continue; // Already unlocked
      }

      const { metric, threshold } = badge.unlockRule;
      let qualifies = false;

      if (metric === 'XP') {
        qualifies = stats.totalXp >= threshold;
      } else if (metric === 'CompletedChallenges') {
        qualifies = stats.completedChallengesCount >= threshold;
      } else if (metric === 'CompletedCsrActivities') {
        qualifies = stats.completedCsrActivitiesCount >= threshold;
      }

      if (qualifies) {
        // Award badge
        try {
          await EmployeeBadge.create({
            employee: employeeName,
            badge: badge._id
          });
          newlyAwarded.push(badge);
          console.log(`Successfully auto-awarded badge "${badge.name}" to employee "${employeeName}"!`);
        } catch (dbErr) {
          // In case of race conditions, ignore duplicate key error
          if (dbErr.code !== 11000) {
            throw dbErr;
          }
        }
      }
    }

    return newlyAwarded;
  } catch (err) {
    console.error('Error in checkAndAwardBadges:', err);
    return [];
  }
}

module.exports = {
  getEmployeeStats,
  checkAndAwardBadges
};
