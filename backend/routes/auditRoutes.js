const express = require('express');
const router = express.Router();
const { Audit, ComplianceIssue } = require('../models/Audit');

// Helper to flag overdue issues in-memory
const flagOverdueIfNeeded = (doc) => {
  if (!doc) return doc;
  const rawDoc = doc.toObject ? doc.toObject() : doc;
  const now = new Date();
  if (rawDoc.dueDate && new Date(rawDoc.dueDate) < now && !['Resolved', 'Completed', 'Closed'].includes(rawDoc.status)) {
    rawDoc.status = 'Overdue';
  }
  return rawDoc;
};

// --- COMPLIANCE ISSUE ENDPOINTS ---

// GET all compliance issues
router.get('/compliance-issues', async (req, res, next) => {
  try {
    const issues = await ComplianceIssue.find()
      .populate('audit', 'title auditor')
      .populate('policy', 'title category')
      .sort({ dueDate: 1 });
    
    const processedIssues = issues.map(issue => flagOverdueIfNeeded(issue));
    res.json({ success: true, count: processedIssues.length, data: processedIssues });
  } catch (error) {
    next(error);
  }
});

// POST create compliance issue
router.post('/compliance-issues', async (req, res, next) => {
  try {
    const { title, description, audit, policy, owner, severity, dueDate, status } = req.body;
    const issue = new ComplianceIssue({
      title,
      description,
      audit,
      policy,
      owner,
      severity,
      dueDate,
      status
    });
    const savedIssue = await issue.save();

    // Trigger Notification
    try {
      const { triggerNotification } = require('../services/notificationService');
      await triggerNotification({
        type: 'Compliance Issue',
        title: `Compliance Issue Logged: ${savedIssue.title}`,
        message: `A new compliance issue has been logged for ${savedIssue.owner}. Severity: ${savedIssue.severity}. Due Date: ${new Date(savedIssue.dueDate).toLocaleDateString()}.`,
        referenceId: savedIssue._id,
        referenceModel: 'ComplianceIssue'
      });
    } catch (err) {
      console.error('Failed to trigger compliance issue creation notification:', err);
    }

    res.status(201).json({ success: true, data: flagOverdueIfNeeded(savedIssue) });
  } catch (error) {
    next(error);
  }
});

// PUT update compliance issue
router.put('/compliance-issues/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const updateData = { ...req.body };
    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
    }
    const updatedIssue = await ComplianceIssue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedIssue) {
      return res.status(404).json({ success: false, message: 'Compliance issue not found' });
    }

    // Trigger Notification
    try {
      const { triggerNotification } = require('../services/notificationService');
      if (status === 'Resolved') {
        await triggerNotification({
          type: 'Compliance Issue',
          title: `Compliance Issue Resolved: ${updatedIssue.title}`,
          message: `The compliance issue assigned to ${updatedIssue.owner} has been resolved successfully.`,
          referenceId: updatedIssue._id,
          referenceModel: 'ComplianceIssue'
        });
      }
    } catch (err) {
      console.error('Failed to trigger compliance issue update notification:', err);
    }

    res.json({ success: true, data: flagOverdueIfNeeded(updatedIssue) });
  } catch (error) {
    next(error);
  }
});

// DELETE compliance issue
router.delete('/compliance-issues/:id', async (req, res, next) => {
  try {
    const deletedIssue = await ComplianceIssue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) {
      return res.status(404).json({ success: false, message: 'Compliance issue not found' });
    }
    res.json({ success: true, message: 'Compliance issue deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// --- AUDIT ENDPOINTS ---

// GET all audits
router.get('/', async (req, res, next) => {
  try {
    const audits = await Audit.find().sort({ startDate: -1 });
    res.json({ success: true, count: audits.length, data: audits });
  } catch (error) {
    next(error);
  }
});

// GET audit by ID
router.get('/:id', async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }
    res.json({ success: true, data: audit });
  } catch (error) {
    next(error);
  }
});

// POST create audit
router.post('/', async (req, res, next) => {
  try {
    const { title, description, auditor, status, startDate, endDate, findings } = req.body;
    const audit = new Audit({
      title,
      description,
      auditor,
      status,
      startDate,
      endDate,
      findings
    });
    const savedAudit = await audit.save();
    res.status(201).json({ success: true, data: savedAudit });
  } catch (error) {
    next(error);
  }
});

// PUT update audit
router.put('/:id', async (req, res, next) => {
  try {
    const updatedAudit = await Audit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAudit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }
    res.json({ success: true, data: updatedAudit });
  } catch (error) {
    next(error);
  }
});

// DELETE audit
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedAudit = await Audit.findByIdAndDelete(req.params.id);
    if (!deletedAudit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }
    // Unset audit references from compliance issues
    await ComplianceIssue.updateMany({ audit: req.params.id }, { $unset: { audit: "" } });
    res.json({ success: true, message: 'Audit deleted and references updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
