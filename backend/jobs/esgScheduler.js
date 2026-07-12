const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');

const startESGScheduler = () => {
  console.log('[ESG Scheduler] Background scores scheduler active (Interval: 12 Hours).');

  // Trigger initial recalculation on startup
  recomputeAllDepartmentScores('2026', 'Q3')
    .then(() => {
      console.log('[ESG Scheduler] Initial startup ESG recomputations completed successfully.');
    })
    .catch((err) => {
      console.error('[ESG Scheduler] Initial startup ESG recomputations failed:', err);
    });

  // 12-hour interval
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  setInterval(async () => {
    console.log('[ESG Scheduler] Executing scheduled scores recalculation...');
    try {
      await recomputeAllDepartmentScores('2026', 'Q3');
      console.log('[ESG Scheduler] Scheduled scores recalculation completed successfully.');
    } catch (err) {
      console.error('[ESG Scheduler] Scheduled scores recalculation failed:', err);
    }
  }, TWELVE_HOURS_MS);
};

module.exports = {
  startESGScheduler
};
