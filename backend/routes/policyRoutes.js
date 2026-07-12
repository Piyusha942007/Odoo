const express = require('express');
const router = express.Router();
const { Policy, PolicyAcknowledgement } = require('../models/Policy');

// GET all acknowledgements
router.get('/acknowledgements', async (req, res, next) => {
  try {
    const acknowledgements = await PolicyAcknowledgement.find()
      .populate('policy', 'title category version')
      .sort({ acknowledgedAt: -1 });
    res.json({ success: true, count: acknowledgements.length, data: acknowledgements });
  } catch (error) {
    next(error);
  }
});

// GET all policies
router.get('/', async (req, res, next) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.json({ success: true, count: policies.length, data: policies });
  } catch (error) {
    next(error);
  }
});

// GET policy by ID
router.get('/:id', async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
});

// POST create policy
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, content, status, version, effectiveDate } = req.body;
    const policy = new Policy({
      title,
      description,
      category,
      content,
      status,
      version,
      effectiveDate
    });
    const savedPolicy = await policy.save();

    // Trigger Notification
    try {
      const { triggerNotification } = require('../services/notificationService');
      await triggerNotification({
        type: 'Policy Reminder',
        title: `New ESG Policy: ${savedPolicy.title}`,
        message: `A new ${savedPolicy.category} policy has been published (v${savedPolicy.version}). Please review and sign off.`,
        referenceId: savedPolicy._id,
        referenceModel: 'Policy'
      });
    } catch (err) {
      console.error('Failed to trigger policy creation notification:', err);
    }

    res.status(201).json({ success: true, data: savedPolicy });
  } catch (error) {
    next(error);
  }
});

// PUT update policy
router.put('/:id', async (req, res, next) => {
  try {
    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPolicy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.json({ success: true, data: updatedPolicy });
  } catch (error) {
    next(error);
  }
});

// DELETE policy
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedPolicy = await Policy.findByIdAndDelete(req.params.id);
    if (!deletedPolicy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    // Delete associated acknowledgements
    await PolicyAcknowledgement.deleteMany({ policy: req.params.id });
    res.json({ success: true, message: 'Policy and associated acknowledgements deleted' });
  } catch (error) {
    next(error);
  }
});

// POST acknowledge policy
router.post('/:id/acknowledge', async (req, res, next) => {
  try {
    const { employee } = req.body;
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee is required' });
    }
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    // Upsert the acknowledgement
    const acknowledgement = await PolicyAcknowledgement.findOneAndUpdate(
      { policy: req.params.id, employee },
      { status: 'Acknowledged', acknowledgedAt: new Date() },
      { new: true, upsert: true }
    );

    // Trigger Notification
    try {
      const { triggerNotification } = require('../services/notificationService');
      await triggerNotification({
        type: 'Approval Decision',
        title: `Policy Signed: ${policy.title}`,
        message: `${employee} has signed off and acknowledged the policy.`,
        referenceId: policy._id,
        referenceModel: 'Policy'
      });
    } catch (err) {
      console.error('Failed to trigger acknowledgement notification:', err);
    }

    res.json({ success: true, data: acknowledgement });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
