const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const Department = require('./models/Department');
const EmissionFactor = require('./models/EmissionFactor');
const CarbonTransaction = require('./models/CarbonTransaction');
const EnvironmentalGoal = require('./models/EnvironmentalGoal');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Find or create a department
  let dept = await Department.findOne();
  if (!dept) {
    dept = await Department.create({ name: 'Engineering', code: 'ENG', status: 'Active' });
    console.log('Created department:', dept.name);
  } else {
    console.log('Using department:', dept.name, dept._id.toString());
  }

  // 2. Find or create an emission factor
  let ef = await EmissionFactor.findOne({ status: 'Active' });
  if (!ef) {
    ef = await EmissionFactor.create({
      name: 'Natural Gas',
      sourceType: 'Manufacturing',
      co2eFactor: 2.02,
      unit: 'kg',
      status: 'Active'
    });
    console.log('Created emission factor:', ef.name);
  } else {
    console.log('Using emission factor:', ef.name, '| co2eFactor:', ef.co2eFactor);
  }

  // 3. Create 6 carbon transactions spread across 2026
  const txDates = [
    new Date(Date.UTC(2026, 0, 15)),  // Jan 2026
    new Date(Date.UTC(2026, 1, 20)),  // Feb 2026
    new Date(Date.UTC(2026, 2, 10)),  // Mar 2026
    new Date(Date.UTC(2026, 3, 5)),   // Apr 2026
    new Date(Date.UTC(2026, 5, 18)),  // Jun 2026
    new Date(Date.UTC(2026, 8, 22)),  // Sep 2026
  ];

  const quantities = [50, 80, 120, 60, 90, 110];

  for (let i = 0; i < txDates.length; i++) {
    const qty = quantities[i];
    const factor = Number(ef.co2eFactor) || 2.02;
    const co2e = parseFloat((qty * factor).toFixed(2));
    await CarbonTransaction.create({
      department: dept._id,
      sourceDocument: `SEED-TX-2026-${String(i + 1).padStart(3, '0')}`,
      emissionFactor: ef._id,
      quantity: qty,
      co2eAmount: co2e,
      calculationType: 'Auto',
      date: txDates[i]
    });
    console.log(`Created tx ${i + 1}: ${qty} ${ef.unit} → ${co2e} kg CO₂e on ${txDates[i].toISOString().split('T')[0]}`);
  }

  // 4. Create a sustainability goal for dept in 2026
  const existingGoal = await EnvironmentalGoal.findOne({ department: dept._id });
  if (!existingGoal) {
    await EnvironmentalGoal.create({
      title: 'Annual Carbon Budget 2026',
      department: dept._id,
      metric: 'CO2e Emissions Limit',
      baseline: 1000,
      targetValue: 600,
      startDate: new Date(Date.UTC(2026, 0, 1)),
      deadline: new Date(Date.UTC(2026, 11, 31)),
      status: 'On Track'
    });
    console.log('Created sustainability goal: Annual Carbon Budget 2026 (target: 600 kg)');
  } else {
    console.log('Sustainability goal already exists:', existingGoal.title);
  }

  console.log('\n✅ Seed complete! Department ID to use in tracking:', dept._id.toString());
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
