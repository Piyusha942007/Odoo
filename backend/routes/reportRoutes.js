const express = require('express');
const router = express.Router();
const { Report } = require('../models/Report');

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
      createdBy
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

// POST generate report dynamically (mock data for Hour 1)
router.post('/generate', async (req, res, next) => {
  try {
    const { type, filters } = req.body;

    let reportData = {
      generatedAt: new Date(),
      type: type || 'ESG Summary',
      filters: filters || {},
      summary: {}
    };

    if (type === 'Environmental') {
      reportData.summary = {
        totalEmissions: 1240.5,
        scope1: 450.2,
        scope2: 520.3,
        scope3: 270.0,
        reductionPercent: 12.4
      };
    } else if (type === 'Social') {
      reportData.summary = {
        trainingCompletionRate: 88.5,
        diversityRatio: { male: 52, female: 45, nonBinary: 3 },
        csrParticipationRate: 74.2,
        totalCSRHours: 320
      };
    } else if (type === 'Governance') {
      reportData.summary = {
        policyAcknowledgementRate: 95.0,
        activePoliciesCount: 8,
        openComplianceIssues: 2,
        resolvedComplianceIssues: 14,
        averageResolutionDays: 6.2
      };
    } else {
      reportData.summary = {
        overallScore: 78,
        environmentalScore: 82,
        socialScore: 75,
        governanceScore: 77,
        status: 'On Track'
      };
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
