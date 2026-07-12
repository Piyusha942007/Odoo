const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Department = require('../models/Department');
const CsrActivity = require('../models/CsrActivity');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const Reward = require('../models/Reward');
const EsgSettings = require('../models/EsgSettings');

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for Hour 5 & 6 seeding...");

    // Clean tables
    await Category.deleteMany({});
    await Department.deleteMany({});
    await CsrActivity.deleteMany({});
    await Challenge.deleteMany({});
    await Badge.deleteMany({});
    await Reward.deleteMany({});
    await EsgSettings.deleteMany({});
    console.log("Cleared Category, Department, CSR Activity, Challenge, Badge, Reward, and Settings tables.");

    // Create Category foundation
    const catCsr = await Category.create({ name: "CSR Initiatives", type: "CSR Activity", status: "Active" });
    const catEco = await Category.create({ name: "Eco Challenge", type: "Challenge", status: "Active" });
    console.log("Seeded default Categories.");

    // Create minimal departments
    await Department.create([
      { name: "Engineering", code: "ENG" },
      { name: "Sales", code: "SLS" },
      { name: "Human Resources", code: "HR" },
      { name: "Operations", code: "OPS" }
    ]);
    console.log("Seeded basic Department structures.");

    // Create default Challenges
    await Challenge.create([
      { title: "No Plastic Bottles Challenge", category: catEco._id, description: "Avoid using single-use plastic bottles for 1 week.", xp: 120, difficulty: "Easy", evidenceRequired: true, deadline: new Date(Date.now() + 86400000 * 5), status: "Active" },
      { title: "Bike to Work Week", category: catEco._id, description: "Commute to work by cycling instead of driving.", xp: 250, difficulty: "Medium", evidenceRequired: false, deadline: new Date(Date.now() + 86400000 * 10), status: "Draft" }
    ]);
    console.log("Seeded default Challenges.");

    // Create default Badges
    await Badge.create([
      { name: "ESG Pioneer", description: "Earn at least 100 total XP to unlock this badge.", icon: "Star", unlockRule: { metric: "XP", threshold: 100 }, status: "Active" },
      { name: "CSR Enthusiast", description: "Complete your first Corporate Social Responsibility activity.", icon: "Shield", unlockRule: { metric: "CompletedCsrActivities", threshold: 1 }, status: "Active" },
      { name: "Challenge Conqueror", description: "Successfully complete 2 or more Eco Challenges.", icon: "Trophy", unlockRule: { metric: "CompletedChallenges", threshold: 2 }, status: "Active" }
    ]);
    console.log("Seeded default Badges.");

    // Create default Rewards
    await Reward.create([
      { name: "Reusable Bamboo Mug", description: "Perfect eco-friendly replacement for single-use cups.", pointsRequired: 100, stock: 15, status: "Active" },
      { name: "Solar Phone Charger", description: "Charge your mobile devices using clean solar energy on the go.", pointsRequired: 200, stock: 5, status: "Active" },
      { name: "EcoSphere Organic Cotton Tee", description: "Sustainable organic cotton team tee.", pointsRequired: 150, stock: 10, status: "Active" }
    ]);
    console.log("Seeded default Reward items.");

    // Create default Settings
    await EsgSettings.create({
      badgeAutoAward: true
    });
    console.log("Seeded default ESG settings.");

    console.log("Database seeded successfully with Gamification assets!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
