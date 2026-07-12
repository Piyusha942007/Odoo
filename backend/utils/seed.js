const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Department = require('../models/Department');
const CsrActivity = require('../models/CsrActivity');
const Challenge = require('../models/Challenge');

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for Hour 1 seeding...");

    // Clean Category, Department, CSR Activities and Challenges
    await Category.deleteMany({});
    await Department.deleteMany({});
    await CsrActivity.deleteMany({});
    await Challenge.deleteMany({});
    console.log("Cleared Category, Department, CSR Activity, and Challenge tables.");

    // Create Category foundation
    const catCsr = await Category.create({ name: "CSR Initiatives", type: "CSR Activity", status: "Active" });
    const catEco = await Category.create({ name: "Eco Challenge", type: "Challenge", status: "Active" });
    console.log("Seeded default Categories.");

    // Create minimal departments for baseline compilation
    await Department.create([
      { name: "Engineering", code: "ENG" },
      { name: "Sales", code: "SLS" },
      { name: "Human Resources", code: "HR" },
      { name: "Operations", code: "OPS" }
    ]);
    console.log("Seeded basic Department structures.");

    console.log("Hour 1 database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
