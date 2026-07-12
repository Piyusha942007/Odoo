const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Department = require('../models/Department');
const CsrActivity = require('../models/CsrActivity');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const Reward = require('../models/Reward');
const EsgSettings = require('../models/EsgSettings');
const EsgConfig = require('../models/EsgConfig');
const EmissionFactor = require('../models/EmissionFactor');
const CarbonTransaction = require('../models/CarbonTransaction');
const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const DepartmentScore = require('../models/DepartmentScore');

const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for comprehensive environment & gamification seeding...");

    // Clean all tables to prevent duplicates/orphan refs
    await Category.deleteMany({});
    await Department.deleteMany({});
    await CsrActivity.deleteMany({});
    await Challenge.deleteMany({});
    await Badge.deleteMany({});
    await Reward.deleteMany({});
    await EsgSettings.deleteMany({});
    await EsgConfig.deleteMany({});
    await EmissionFactor.deleteMany({});
    await CarbonTransaction.deleteMany({});
    await EnvironmentalGoal.deleteMany({});
    await DepartmentScore.deleteMany({});

    console.log("Cleared all existing collection tables for a clean seed.");

    // 1. Create Category foundation
    const catCsr = await Category.create({ name: "CSR Initiatives", type: "CSR Activity", status: "Active" });
    const catEco = await Category.create({ name: "Eco Challenge", type: "Challenge", status: "Active" });
    console.log("Seeded default Categories.");

    // 2. Create Departments (with default employee counts and diversity metrics)
    const departments = await Department.create([
      { name: "Engineering", code: "ENG", employeeCount: 40, status: "Active" },
      { name: "Sales", code: "SLS", employeeCount: 30, status: "Active" },
      { name: "Human Resources", code: "HR", employeeCount: 10, status: "Active" },
      { name: "Operations", code: "OPS", employeeCount: 20, status: "Active" }
    ]);
    const engDept = departments.find(d => d.code === 'ENG');
    console.log("Seeded basic Department structures.");

    // 3. Create default ESG Configuration & Settings
    await EsgSettings.create({ badgeAutoAward: true });
    await EsgConfig.create({
      environmentalWeight: 40,
      socialWeight: 30,
      governanceWeight: 30,
      aggregationMode: 'simple_average',
      autoEmissionCalculation: false
    });
    console.log("Seeded default ESG Weights Config & settings.");

    // 4. Create default Challenges
    await Challenge.create([
      { title: "No Plastic Bottles Challenge", category: catEco._id, description: "Avoid using single-use plastic bottles for 1 week.", xp: 120, difficulty: "Easy", evidenceRequired: true, deadline: new Date(Date.now() + 86400000 * 5), status: "Active" },
      { title: "Bike to Work Week", category: catEco._id, description: "Commute to work by cycling instead of driving.", xp: 250, difficulty: "Medium", evidenceRequired: false, deadline: new Date(Date.now() + 86400000 * 10), status: "Draft" }
    ]);
    console.log("Seeded default Challenges.");

    // 5. Create default Badges
    await Badge.create([
      { name: "ESG Pioneer", description: "Earn at least 100 total XP to unlock this badge.", icon: "Star", unlockRule: { metric: "XP", threshold: 100 }, status: "Active" },
      { name: "CSR Enthusiast", description: "Complete your first Corporate Social Responsibility activity.", icon: "Shield", unlockRule: { metric: "CompletedCsrActivities", threshold: 1 }, status: "Active" },
      { name: "Challenge Conqueror", description: "Successfully complete 2 or more Eco Challenges.", icon: "Trophy", unlockRule: { metric: "CompletedChallenges", threshold: 2 }, status: "Active" }
    ]);
    console.log("Seeded default Badges.");

    // 6. Create default Rewards
    await Reward.create([
      { name: "Reusable Bamboo Mug", description: "Perfect eco-friendly replacement for single-use cups.", pointsRequired: 100, stock: 15, status: "Active" },
      { name: "Solar Phone Charger", description: "Charge your mobile devices using clean solar energy on the go.", pointsRequired: 200, stock: 5, status: "Active" },
      { name: "EcoSphere Organic Cotton Tee", description: "Sustainable organic cotton team tee.", pointsRequired: 150, stock: 10, status: "Active" }
    ]);
    console.log("Seeded default Reward items.");

    // 7. Create default active Emission Factors
    const efGas = await EmissionFactor.create({
      name: 'Natural Gas',
      sourceType: 'Manufacturing',
      co2eFactor: 2.02,
      unit: 'kg',
      status: 'Active'
    });
    const efElec = await EmissionFactor.create({
      name: 'Grid Electricity',
      sourceType: 'Expense',
      co2eFactor: 0.45,
      unit: 'kWh',
      status: 'Active'
    });
    console.log("Seeded default active Emission Factors.");

    // 8. Create Carbon Transactions spread across 2026 for Engineering
    const txDates = [
      new Date(Date.UTC(2026, 0, 15)),  // Jan
      new Date(Date.UTC(2026, 1, 20)),  // Feb
      new Date(Date.UTC(2026, 2, 10)),  // Mar
      new Date(Date.UTC(2026, 3, 5)),   // Apr
      new Date(Date.UTC(2026, 5, 18)),  // Jun
      new Date(Date.UTC(2026, 8, 22)),  // Sep
    ];
    const quantities = [50, 80, 120, 60, 90, 110];

    for (let i = 0; i < txDates.length; i++) {
      const qty = quantities[i];
      const factor = Number(efGas.co2eFactor);
      const co2e = parseFloat((qty * factor).toFixed(2));
      await CarbonTransaction.create({
        department: engDept._id,
        sourceDocument: `SEED-TX-2026-${String(i + 1).padStart(3, '0')}`,
        emissionFactor: efGas._id,
        quantity: qty,
        co2eAmount: co2e,
        calculationType: 'Auto',
        date: txDates[i]
      });
    }
    console.log("Seeded default Carbon Transactions for Engineering.");

    // 9. Create a Sustainability Goal for Engineering in 2026
    await EnvironmentalGoal.create({
      title: 'Annual Carbon Budget 2026',
      department: engDept._id,
      metric: 'CO2e Emissions Limit',
      baseline: 1500,
      targetValue: 1200,
      startDate: new Date(Date.UTC(2026, 0, 1)),
      deadline: new Date(Date.UTC(2026, 11, 31)),
      status: 'On Track'
    });
    console.log("Seeded default Sustainability Goal for Engineering.");

    // 10. Recompute department scores for initial load
    console.log("Recomputing all department scores...");
    await recomputeAllDepartmentScores('2026', 'Q3');
    console.log("Score recomputation complete.");

    console.log("\n✅ Database seeded successfully with consistent environmental and gamification data! 🎉");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
