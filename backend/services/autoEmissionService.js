const EsgConfig = require('../models/EsgConfig');
const EmissionFactor = require('../models/EmissionFactor');
const CarbonTransaction = require('../models/CarbonTransaction');
const Department = require('../models/Department');

const VALID_SOURCE_TYPES = ['Purchase', 'Manufacturing', 'Expense', 'Fleet'];

/**
 * Check whether Auto Emission Calculation is currently enabled.
 * Returns the full EsgConfig document (creates default if none exists).
 */
const getConfig = async () => {
  let config = await EsgConfig.findOne();
  if (!config) {
    config = await EsgConfig.create({
      environmentalWeight: 40,
      socialWeight: 30,
      governanceWeight: 30,
      aggregationMode: 'simple_average',
      autoEmissionCalculation: false
    });
  }
  return config;
};

/**
 * Process one ERP source record and auto-generate Carbon Transactions.
 *
 * @param {object} params
 * @param {string} params.sourceType       - 'Purchase' | 'Manufacturing' | 'Expense' | 'Fleet'
 * @param {string} params.department       - Department ObjectId string
 * @param {string} params.sourceDocument   - Stable ERP document ID (e.g. 'PO-2026-001')
 * @param {Array}  params.items            - [{ emissionFactorId, quantity }]
 *
 * @returns {object} { enabled, sourceDocument, created, skipped, failed }
 */
const processErpRecord = async ({ sourceType, department, sourceDocument, items }) => {
  // 1. Check toggle
  const config = await getConfig();
  if (!config.autoEmissionCalculation) {
    return {
      enabled: false,
      sourceDocument,
      message: 'Auto Emission Calculation is currently disabled. Enable it in Settings to auto-generate Carbon Transactions.',
      created: [],
      skipped: [],
      failed: []
    };
  }

  // 2. Validate sourceType
  if (!VALID_SOURCE_TYPES.includes(sourceType)) {
    throw new Error(`Invalid sourceType "${sourceType}". Must be one of: ${VALID_SOURCE_TYPES.join(', ')}`);
  }

  // 3. Validate department
  const dept = await Department.findById(department);
  if (!dept) {
    throw new Error(`Department with ID "${department}" not found`);
  }

  // 4. Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array of { emissionFactorId, quantity }');
  }

  const created = [];
  const skipped = [];
  const failed  = [];

  // 5. Process each item independently — one invalid item doesn't block others
  for (const item of items) {
    const { emissionFactorId, quantity } = item;

    try {
      // 5a. Validate quantity
      if (!quantity || Number(quantity) <= 0) {
        failed.push({ emissionFactorId, reason: 'Quantity must be greater than 0' });
        continue;
      }

      // 5b. Validate emission factor
      const factor = await EmissionFactor.findById(emissionFactorId);
      if (!factor) {
        failed.push({ emissionFactorId, reason: 'Emission factor not found' });
        continue;
      }
      if (factor.status !== 'Active') {
        failed.push({ emissionFactorId, factorName: factor.name, reason: 'Emission factor is Inactive' });
        continue;
      }

      // 5c. Application-level duplicate check before attempting DB insert
      // (also catches the race condition case returned by the unique index)
      const existing = await CarbonTransaction.findOne({
        sourceType,
        sourceDocument,
        department,
        emissionFactor: emissionFactorId
      });

      if (existing) {
        skipped.push({
          emissionFactorId,
          factorName: factor.name,
          reason: 'Duplicate: this ERP line item was already processed',
          existingId: existing._id
        });
        continue;
      }

      // 5d. Calculate CO2e — uses EmissionFactor.co2eFactor (actual field name in schema)
      const co2eAmount = parseFloat((Number(quantity) * Number(factor.co2eFactor)).toFixed(4));

      // 5e. Create the Carbon Transaction
      try {
        const tx = await CarbonTransaction.create({
          department,
          sourceDocument,
          sourceType,
          emissionFactor: emissionFactorId,
          quantity: Number(quantity),
          co2eAmount,
          calculationType: 'Auto',
          date: new Date()
        });

        created.push({
          transactionId: tx._id,
          emissionFactorId,
          factorName: factor.name,
          quantity: Number(quantity),
          co2eAmount,
          sourceDocument
        });

      } catch (dbErr) {
        // Handle duplicate-key race condition safely
        if (dbErr.code === 11000) {
          const existingRace = await CarbonTransaction.findOne({
            sourceType, sourceDocument, department, emissionFactor: emissionFactorId
          });
          skipped.push({
            emissionFactorId,
            factorName: factor.name,
            reason: 'Duplicate (concurrent request): this ERP line item was already processed',
            existingId: existingRace?._id
          });
        } else {
          throw dbErr;
        }
      }

    } catch (itemErr) {
      failed.push({ emissionFactorId, reason: itemErr.message });
    }
  }

  return {
    enabled: true,
    sourceDocument,
    created,
    skipped,
    failed
  };
};

module.exports = { getConfig, processErpRecord };
