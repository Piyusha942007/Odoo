/**
 * EcoSphere — Full Production Seed Script
 * Wipes ALL collections and seeds realistic, presentation-ready ESG data.
 * Run: node backend/utils/seed.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Category          = require('../models/Category');
const Department        = require('../models/Department');
const CsrActivity       = require('../models/CsrActivity');
const Challenge         = require('../models/Challenge');
const Badge             = require('../models/Badge');
const Reward            = require('../models/Reward');
const EsgSettings       = require('../models/EsgSettings');
const EsgConfig         = require('../models/EsgConfig');
const EmissionFactor    = require('../models/EmissionFactor');
const CarbonTransaction = require('../models/CarbonTransaction');
const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const DepartmentScore   = require('../models/DepartmentScore');
const { Policy, PolicyAcknowledgement } = require('../models/Policy');
const { Audit, ComplianceIssue }        = require('../models/Audit');

const { recomputeAllDepartmentScores } = require('../services/esgCalculationService');

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) { console.error('MONGODB_URI not set.'); process.exit(1); }

// ─── helpers ─────────────────────────────────────────────────────────────────
const d = (y, m, day) => new Date(Date.UTC(y, m - 1, day));

async function seed() {
  await mongoose.connect(mongoURI);
  console.log('\n🌱  Connected to MongoDB. Wiping existing data…\n');

  // ── 1. Wipe ALL managed collections ──────────────────────────────────────
  await Promise.all([
    Category.deleteMany({}),
    Department.deleteMany({}),
    CsrActivity.deleteMany({}),
    Challenge.deleteMany({}),
    Badge.deleteMany({}),
    Reward.deleteMany({}),
    EsgSettings.deleteMany({}),
    EsgConfig.deleteMany({}),
    EmissionFactor.deleteMany({}),
    CarbonTransaction.deleteMany({}),
    EnvironmentalGoal.deleteMany({}),
    DepartmentScore.deleteMany({}),
    Policy.deleteMany({}),
    PolicyAcknowledgement.deleteMany({}),
    Audit.deleteMany({}),
    ComplianceIssue.deleteMany({}),
  ]);
  console.log('✅  All collections cleared.\n');

  // ── 2. Categories ─────────────────────────────────────────────────────────
  const [catCsr, catEco, catWellbeing, catVolunteer] = await Category.create([
    { name: 'CSR Initiatives',       type: 'CSR Activity', status: 'Active' },
    { name: 'Eco Challenges',        type: 'Challenge',    status: 'Active' },
    { name: 'Employee Wellbeing',    type: 'CSR Activity', status: 'Active' },
    { name: 'Community Volunteering',type: 'Challenge',    status: 'Active' },
  ]);
  console.log('✅  Categories seeded.');

  // ── 3. Departments ────────────────────────────────────────────────────────
  const [eng, sls, hr, ops] = await Department.create([
    {
      name: 'Engineering', code: 'ENG', head: 'Rohan Mehta',
      employeeCount: 42, status: 'Active',
      diversityMetrics: { genderRatio: '58:42', ageBands: { under30: 35, thirtyToFifty: 52, over50: 13 } }
    },
    {
      name: 'Sales & Business Development', code: 'SLS', head: 'Priya Sharma',
      employeeCount: 28, status: 'Active',
      diversityMetrics: { genderRatio: '45:55', ageBands: { under30: 40, thirtyToFifty: 48, over50: 12 } }
    },
    {
      name: 'Human Resources', code: 'HR', head: 'Neha Joshi',
      employeeCount: 12, status: 'Active',
      diversityMetrics: { genderRatio: '30:70', ageBands: { under30: 25, thirtyToFifty: 60, over50: 15 } }
    },
    {
      name: 'Operations & Supply Chain', code: 'OPS', head: 'Arjun Kapoor',
      employeeCount: 22, status: 'Active',
      diversityMetrics: { genderRatio: '62:38', ageBands: { under30: 20, thirtyToFifty: 55, over50: 25 } }
    },
  ]);
  console.log('✅  Departments seeded (ENG, SLS, HR, OPS).');

  // ── 4. ESG Config & Settings ──────────────────────────────────────────────
  await EsgSettings.create({ badgeAutoAward: true });
  await EsgConfig.create({
    environmentalWeight: 40,
    socialWeight:        30,
    governanceWeight:    30,
    aggregationMode:     'simple_average',
    autoEmissionCalculation: false,
  });
  console.log('✅  ESG Config & Settings seeded.');

  // ── 5. Emission Factors ───────────────────────────────────────────────────
  const [efElec, efGas, efFleet, efCooling, efWaste] = await EmissionFactor.create([
    { name: 'Grid Electricity (IN)',  sourceType: 'Expense',       co2eFactor: 0.82,  unit: 'kWh', status: 'Active' },
    { name: 'Natural Gas (Cooking)',  sourceType: 'Manufacturing', co2eFactor: 2.04,  unit: 'kg',  status: 'Active' },
    { name: 'Company Fleet (Diesel)', sourceType: 'Fleet',         co2eFactor: 2.68,  unit: 'L',   status: 'Active' },
    { name: 'Refrigerant (R-22)',     sourceType: 'Manufacturing', co2eFactor: 1810,  unit: 'kg',  status: 'Active' },
    { name: 'Landfill Waste',         sourceType: 'Expense',       co2eFactor: 0.587, unit: 'kg',  status: 'Active' },
  ]);
  console.log('✅  Emission Factors seeded.');

  // ── 6. Carbon Transactions (all 4 depts, Jan–Jul 2026) ───────────────────
  //  Engineering — server cooling & electricity (heaviest emitter)
  const txData = [
    // ENG — electricity heavy usage (data center + dev machines)
    { dept: eng._id, ef: efElec._id, qty: 18400, date: d(2026,1,31), doc: 'ELEC-ENG-JAN-2026' },
    { dept: eng._id, ef: efElec._id, qty: 16900, date: d(2026,2,28), doc: 'ELEC-ENG-FEB-2026' },
    { dept: eng._id, ef: efElec._id, qty: 17600, date: d(2026,3,31), doc: 'ELEC-ENG-MAR-2026' },
    { dept: eng._id, ef: efElec._id, qty: 15800, date: d(2026,4,30), doc: 'ELEC-ENG-APR-2026' },
    { dept: eng._id, ef: efElec._id, qty: 14200, date: d(2026,5,31), doc: 'ELEC-ENG-MAY-2026' },
    { dept: eng._id, ef: efElec._id, qty: 13500, date: d(2026,6,30), doc: 'ELEC-ENG-JUN-2026' },
    // ENG — fleet (team offsite, site visits)
    { dept: eng._id, ef: efFleet._id, qty: 320, date: d(2026,3,15), doc: 'FLEET-ENG-Q1-OFFSITE' },
    { dept: eng._id, ef: efFleet._id, qty: 210, date: d(2026,6,10), doc: 'FLEET-ENG-Q2-SITEVISIT' },

    // SLS — fleet (sales reps, client meetings)
    { dept: sls._id, ef: efFleet._id, qty: 850,  date: d(2026,1,31), doc: 'FLEET-SLS-JAN-2026' },
    { dept: sls._id, ef: efFleet._id, qty: 920,  date: d(2026,2,28), doc: 'FLEET-SLS-FEB-2026' },
    { dept: sls._id, ef: efFleet._id, qty: 1050, date: d(2026,3,31), doc: 'FLEET-SLS-MAR-2026' },
    { dept: sls._id, ef: efFleet._id, qty: 780,  date: d(2026,4,30), doc: 'FLEET-SLS-APR-2026' },
    { dept: sls._id, ef: efFleet._id, qty: 690,  date: d(2026,5,31), doc: 'FLEET-SLS-MAY-2026' },
    { dept: sls._id, ef: efFleet._id, qty: 610,  date: d(2026,6,30), doc: 'FLEET-SLS-JUN-2026' },
    // SLS — electricity (office + showroom)
    { dept: sls._id, ef: efElec._id, qty: 4200,  date: d(2026,1,31), doc: 'ELEC-SLS-JAN-2026' },
    { dept: sls._id, ef: efElec._id, qty: 3900,  date: d(2026,3,31), doc: 'ELEC-SLS-MAR-2026' },
    { dept: sls._id, ef: efElec._id, qty: 3600,  date: d(2026,6,30), doc: 'ELEC-SLS-JUN-2026' },

    // HR — small office, minimal footprint
    { dept: hr._id, ef: efElec._id, qty: 1800, date: d(2026,1,31), doc: 'ELEC-HR-JAN-2026' },
    { dept: hr._id, ef: efElec._id, qty: 1650, date: d(2026,3,31), doc: 'ELEC-HR-MAR-2026' },
    { dept: hr._id, ef: efElec._id, qty: 1500, date: d(2026,6,30), doc: 'ELEC-HR-JUN-2026' },
    { dept: hr._id, ef: efWaste._id, qty: 280,  date: d(2026,3,31), doc: 'WASTE-HR-Q1-2026' },
    { dept: hr._id, ef: efWaste._id, qty: 210,  date: d(2026,6,30), doc: 'WASTE-HR-Q2-2026' },

    // OPS — manufacturing gas + waste (warehouse + logistics)
    { dept: ops._id, ef: efGas._id,  qty: 420,  date: d(2026,1,31), doc: 'GAS-OPS-JAN-2026' },
    { dept: ops._id, ef: efGas._id,  qty: 390,  date: d(2026,2,28), doc: 'GAS-OPS-FEB-2026' },
    { dept: ops._id, ef: efGas._id,  qty: 460,  date: d(2026,3,31), doc: 'GAS-OPS-MAR-2026' },
    { dept: ops._id, ef: efGas._id,  qty: 340,  date: d(2026,4,30), doc: 'GAS-OPS-APR-2026' },
    { dept: ops._id, ef: efGas._id,  qty: 310,  date: d(2026,5,31), doc: 'GAS-OPS-MAY-2026' },
    { dept: ops._id, ef: efGas._id,  qty: 285,  date: d(2026,6,30), doc: 'GAS-OPS-JUN-2026' },
    { dept: ops._id, ef: efFleet._id,qty: 1200, date: d(2026,1,31), doc: 'FLEET-OPS-JAN-2026' },
    { dept: ops._id, ef: efFleet._id,qty: 1380, date: d(2026,3,31), doc: 'FLEET-OPS-MAR-2026' },
    { dept: ops._id, ef: efFleet._id,qty: 1140, date: d(2026,6,30), doc: 'FLEET-OPS-JUN-2026' },
    { dept: ops._id, ef: efWaste._id,qty: 980,  date: d(2026,3,31), doc: 'WASTE-OPS-Q1-2026' },
    { dept: ops._id, ef: efWaste._id,qty: 840,  date: d(2026,6,30), doc: 'WASTE-OPS-Q2-2026' },
  ];

  // Map emission factor id -> co2eFactor
  const efMap = {
    [efElec._id.toString()]:    efElec.co2eFactor,
    [efGas._id.toString()]:     efGas.co2eFactor,
    [efFleet._id.toString()]:   efFleet.co2eFactor,
    [efCooling._id.toString()]: efCooling.co2eFactor,
    [efWaste._id.toString()]:   efWaste.co2eFactor,
  };

  for (const t of txData) {
    const factor = efMap[t.ef.toString()];
    await CarbonTransaction.create({
      department: t.dept,
      sourceDocument: t.doc,
      emissionFactor: t.ef,
      quantity: t.qty,
      co2eAmount: parseFloat((t.qty * factor).toFixed(2)),
      calculationType: 'Manual',
      date: t.date,
    });
  }
  console.log(`✅  Carbon Transactions seeded (${txData.length} records across all departments).`);

  // ── 7. Environmental Goals ────────────────────────────────────────────────
  await EnvironmentalGoal.create([
    {
      title: 'Engineering — 2026 Net Carbon Reduction',
      department: eng._id,
      metric: 'CO2e Emissions Limit',
      baseline: 175000, targetValue: 140000,
      startDate: d(2026,1,1), deadline: d(2026,12,31),
      status: 'On Track'
    },
    {
      title: 'Sales Fleet Decarbonisation Target',
      department: sls._id,
      metric: 'CO2e Emissions Limit',
      baseline: 14000, targetValue: 10500,
      startDate: d(2026,1,1), deadline: d(2026,12,31),
      status: 'On Track'
    },
    {
      title: 'Operations Zero-Waste Q3 Initiative',
      department: ops._id,
      metric: 'Waste Diverted from Landfill (kg)',
      baseline: 4000, targetValue: 1000,
      startDate: d(2026,7,1), deadline: d(2026,9,30),
      status: 'On Track'
    },
    {
      title: 'HR Office — Paper & Plastic Free Commitment',
      department: hr._id,
      metric: 'CO2e Emissions Limit',
      baseline: 3500, targetValue: 2500,
      startDate: d(2026,1,1), deadline: d(2026,12,31),
      status: 'On Track'
    },
  ]);
  console.log('✅  Environmental Goals seeded (4 active goals).');

  // ── 8. CSR Activities ─────────────────────────────────────────────────────
  await CsrActivity.create([
    {
      title: 'Tree Plantation Drive — Aarey Colony',
      category: catCsr._id, department: eng._id,
      description: '500 native tree saplings planted across 2 hectares in Aarey forest buffer zone with MCGM partnership.',
      date: d(2026,3,22), status: 'Active', points: 150
    },
    {
      title: 'Coastal Clean-up — Versova Beach',
      category: catCsr._id, department: ops._id,
      description: 'Quarterly beach clean-up drive collecting 1.2 tonnes of plastic waste with 60 employee volunteers.',
      date: d(2026,4,12), status: 'Active', points: 120
    },
    {
      title: 'Digital Literacy Program — NGO Partnership',
      category: catVolunteer._id, department: hr._id,
      description: 'Teaching foundational computer literacy to 80 students across 4 government schools in Mumbai suburbs.',
      date: d(2026,5,10), status: 'Active', points: 100
    },
    {
      title: 'Blood Donation Camp — Company Campus',
      category: catWellbeing._id, department: hr._id,
      description: 'Internal blood donation drive in association with Hinduja Hospital — 74 units collected.',
      date: d(2026,6,14), status: 'Active', points: 80
    },
    {
      title: 'Solar Panel Awareness Workshop',
      category: catCsr._id, department: eng._id,
      description: 'Community education session on residential rooftop solar adoption with free site assessment vouchers.',
      date: d(2026,6,28), status: 'Active', points: 90
    },
    {
      title: 'Mangrove Restoration Volunteer Day',
      category: catVolunteer._id, department: sls._id,
      description: 'Replanting 800 mangrove propagules along Thane Creek shoreline with Bombay Natural History Society.',
      date: d(2026,7,6), status: 'Active', points: 130
    },
  ]);
  console.log('✅  CSR Activities seeded (6 activities).');

  // ── 9. Challenges ─────────────────────────────────────────────────────────
  await Challenge.create([
    {
      title: 'Zero Single-Use Plastic — 30 Days',
      category: catEco._id,
      description: 'Avoid all single-use plastics for a full calendar month. Log daily alternatives and submit photographic evidence at week 4.',
      xp: 200, difficulty: 'Medium', evidenceRequired: true,
      deadline: d(2026,8,31), status: 'Active'
    },
    {
      title: 'Cycle-to-Work Challenge',
      category: catEco._id,
      description: 'Commute by bicycle or electric bike for at least 10 working days in July. Submit route screenshots from your fitness app.',
      xp: 300, difficulty: 'Hard', evidenceRequired: true,
      deadline: d(2026,7,31), status: 'Active'
    },
    {
      title: 'Paperless Week',
      category: catEco._id,
      description: 'Operate without printing a single page for 5 consecutive working days. Move all approvals to digital workflows.',
      xp: 120, difficulty: 'Easy', evidenceRequired: false,
      deadline: d(2026,7,25), status: 'Active'
    },
    {
      title: 'Energy Audit Your Desk',
      category: catEco._id,
      description: 'Monitor your workstation power usage for one week using a smart plug and submit a brief reduction report.',
      xp: 180, difficulty: 'Medium', evidenceRequired: true,
      deadline: d(2026,8,15), status: 'Active'
    },
    {
      title: 'Green Lunch Challenge',
      category: catEco._id,
      description: 'Bring a plant-based, zero-waste packed lunch every working day for 2 weeks. No plastic cutlery or packaging.',
      xp: 150, difficulty: 'Easy', evidenceRequired: false,
      deadline: d(2026,7,31), status: 'Active'
    },
    {
      title: 'Volunteer 4 Hours — Local NGO',
      category: catVolunteer._id,
      description: 'Dedicate at least 4 volunteer hours to an approved local NGO partner. Submit your NGO sign-off certificate.',
      xp: 250, difficulty: 'Medium', evidenceRequired: true,
      deadline: d(2026,9,30), status: 'Active'
    },
  ]);
  console.log('✅  Challenges seeded (6 active challenges).');

  // ── 10. Badges ────────────────────────────────────────────────────────────
  await Badge.create([
    { name: 'ESG Pioneer',          description: 'Awarded for crossing 100 total XP in ESG engagement.',         icon: 'Star',    unlockRule: { metric: 'XP',                      threshold: 100 }, status: 'Active' },
    { name: 'Green Guardian',       description: 'Complete your first Eco Challenge.',                            icon: 'Leaf',    unlockRule: { metric: 'CompletedChallenges',     threshold: 1   }, status: 'Active' },
    { name: 'CSR Champion',         description: 'Participate in your first Corporate Social Responsibility activity.', icon: 'Shield', unlockRule: { metric: 'CompletedCsrActivities', threshold: 1 }, status: 'Active' },
    { name: 'Challenge Conqueror',  description: 'Successfully complete 3 or more Eco Challenges.',              icon: 'Trophy',  unlockRule: { metric: 'CompletedChallenges',     threshold: 3   }, status: 'Active' },
    { name: 'Carbon Cutter',        description: 'Earn 500+ XP by completing carbon reduction activities.',       icon: 'Wind',    unlockRule: { metric: 'XP',                      threshold: 500 }, status: 'Active' },
    { name: 'Community Builder',    description: 'Complete 5 or more CSR community engagement activities.',       icon: 'Users',   unlockRule: { metric: 'CompletedCsrActivities',  threshold: 5   }, status: 'Active' },
  ]);
  console.log('✅  Badges seeded (6 badges).');

  // ── 11. Rewards ───────────────────────────────────────────────────────────
  await Reward.create([
    { name: 'Reusable Bamboo Mug',          description: 'BPA-free, sustainably sourced 400ml bamboo travel mug with EcoSphere branding.', pointsRequired: 80,  stock: 25, status: 'Active' },
    { name: 'Solar Phone Charger',          description: '10,000 mAh solar-powered portable charger with dual USB-C output.', pointsRequired: 220, stock: 8,  status: 'Active' },
    { name: 'Organic Cotton Tee',           description: 'GOTS-certified 100% organic cotton t-shirt — choose your size.', pointsRequired: 150, stock: 20, status: 'Active' },
    { name: 'Seed Starter Kit',             description: 'Grow-your-own herb kit with 6 seed varieties, organic compost and biodegradable pots.', pointsRequired: 60,  stock: 30, status: 'Active' },
    { name: 'Amazon Kindle Paperwhite',     description: '11th Gen Kindle with 6-month reading subscription — awarded for 1000+ XP milestones.', pointsRequired: 800, stock: 3,  status: 'Active' },
    { name: '1 Day WFH Extra Leave',        description: 'Redeem for one additional work-from-home day, management pre-approval required.', pointsRequired: 300, stock: 50, status: 'Active' },
    { name: 'EcoSphere Water Bottle',       description: 'Double-walled stainless steel 750ml insulated water bottle with carry handle.', pointsRequired: 100, stock: 40, status: 'Active' },
  ]);
  console.log('✅  Rewards seeded (7 rewards).');

  // ── 12. Policies ─────────────────────────────────────────────────────────
  const [polEthics, polEnv, polDei, polData, polHealth] = await Policy.create([
    {
      title: 'Code of Business Conduct & Ethics',
      description: 'Defines the rules and expectations for ethical operations, anti-bribery, anti-corruption, whistleblowing mechanisms, and conflict-of-interest declarations for all employees.',
      category: 'Governance',
      content: `1. SCOPE: This Code of Conduct applies to all EcoSphere employees, contractors, directors, and agents worldwide.\n\n2. ETHICAL STANDARDS: All personnel must uphold honesty, integrity, and fairness in every business interaction. Zero tolerance is maintained for bribery, kickbacks, or facilitation payments.\n\n3. WHISTLEBLOWING: Any employee who witnesses or suspects misconduct must report it through the confidential Ethics Hotline (ethics@ecosphere.io). Retaliation against whistleblowers is strictly prohibited.\n\n4. CONFLICT OF INTEREST: Employees must disclose any personal or financial interest that may influence their professional decisions to their line manager and HR within 5 working days.\n\n5. DATA CONFIDENTIALITY: Trade secrets, client data, and proprietary ESG metrics must never be shared externally without a signed NDA.\n\n6. ENFORCEMENT: Violations may result in disciplinary action, including termination and referral to law enforcement where applicable.`,
      status: 'Active', version: '2.1',
      effectiveDate: d(2026,1,1)
    },
    {
      title: 'Environmental Sustainability & Emissions Policy',
      description: 'Sets binding emissions reduction targets, mandates carbon accounting procedures, and governs waste minimisation, energy usage, and biodiversity commitments across all EcoSphere operations.',
      category: 'Environmental',
      content: `1. COMMITMENT: EcoSphere commits to achieving Net Zero Scope 1 & 2 emissions by 2035 and Scope 3 neutrality by 2040 in alignment with the Science Based Targets initiative (SBTi).\n\n2. CARBON ACCOUNTING: All departments must log monthly energy, fleet, and waste data into the EcoSphere platform by the 5th of the following month. Non-compliance is flagged to the CSO.\n\n3. EMISSION REDUCTION TARGETS: FY2026 corporate target: reduce total CO2e by 15% versus 2025 baseline. Each department carries a proportional reduction obligation set in the annual ESG budget.\n\n4. WASTE MANAGEMENT: Zero single-use plastics in all corporate premises by Q3 2026. Minimum 60% of operational waste must be diverted from landfill through recycling or composting.\n\n5. ENERGY PROCUREMENT: 50% of electricity procurement must come from certified renewable sources by December 2026. Preference must be given to direct solar, wind PPAs, or RECs.\n\n6. REPORTING: Environmental KPIs are reviewed quarterly by the Sustainability Committee and published in the Annual ESG Disclosure Report.`,
      status: 'Active', version: '1.4',
      effectiveDate: d(2026,1,1)
    },
    {
      title: 'Diversity, Equity & Inclusion (DEI) Policy',
      description: 'Sets diversity representation targets, prohibits all forms of discrimination, and mandates equitable hiring, promotion, and pay practices across all EcoSphere entities.',
      category: 'Social',
      content: `1. VISION: EcoSphere is committed to creating a workplace where all individuals are respected and can thrive regardless of gender, ethnicity, age, disability, religion, or sexual orientation.\n\n2. REPRESENTATION TARGETS: By end of FY2027 — (a) 40% women in senior leadership roles; (b) minimum 25% underrepresented community hires at graduate level; (c) 100% pay equity certification audit.\n\n3. HIRING: All open roles must be advertised through diverse talent channels. Interview panels must include at least one diverse interviewer. Blind CV screening is mandatory for roles above grade 5.\n\n4. ANTI-HARASSMENT: Zero tolerance for any form of harassment or discrimination. Complaints are investigated within 10 working days by a neutral HR panel.\n\n5. PAY EQUITY: Annual pay equity analysis is conducted by a third-party firm. Unexplained gender/ethnic pay gaps exceeding 2% are remediated in the next compensation cycle.\n\n6. INCLUSION PROGRAMS: All employees must complete the DEI Awareness training module within 90 days of joining and refresh annually.`,
      status: 'Active', version: '1.2',
      effectiveDate: d(2026,2,1)
    },
    {
      title: 'Data Privacy & Information Security Policy',
      description: 'Governs the collection, processing, storage, and cross-border transfer of personal and sensitive business data in compliance with DPDP Act 2023 and ISO/IEC 27001 standards.',
      category: 'Governance',
      content: `1. LEGAL BASIS: EcoSphere processes personal data only with explicit consent, legitimate interest, or contractual necessity under India's Digital Personal Data Protection (DPDP) Act 2023.\n\n2. DATA CLASSIFICATION: All data is classified as Public, Internal, Confidential, or Restricted. Restricted data (e.g., employee salary, health records) requires encryption at rest and in transit.\n\n3. ACCESS CONTROL: Role-based access control (RBAC) is enforced across all systems. Privileged access is reviewed quarterly. Passwords must be 14+ characters and rotated every 90 days.\n\n4. BREACH RESPONSE: Any suspected data breach must be reported to the DPO (dpo@ecosphere.io) within 2 hours of discovery. Regulatory notification is required within 72 hours per DPDP Act.\n\n5. THIRD PARTY: All vendors handling personal data must sign a Data Processing Agreement (DPA) and complete an annual security review.\n\n6. RETENTION: Personal data is retained no longer than necessary — employee records 7 years post-exit, customer data 5 years, marketing data 2 years unless consent renewed.`,
      status: 'Active', version: '1.0',
      effectiveDate: d(2026,3,1)
    },
    {
      title: 'Employee Health, Safety & Wellbeing Policy',
      description: 'Establishes mandatory health and safety standards, ergonomic guidelines, mental health support frameworks, and emergency response protocols across all EcoSphere offices and worksites.',
      category: 'Social',
      content: `1. COMMITMENT: EcoSphere is committed to providing a safe, healthy, and inclusive working environment for every employee and contractor.\n\n2. LEGAL COMPLIANCE: All offices and worksites comply with the Factories Act 1948, Occupational Safety, Health and Working Conditions Code 2020, and local municipal fire safety regulations.\n\n3. ERGONOMICS: All workstations must meet ergonomic standards (ISO 9241). Annual ergonomic assessments are provided to all office employees. Sit-stand desks are available on request.\n\n4. MENTAL HEALTH: EcoSphere provides a confidential Employee Assistance Program (EAP) including 6 free therapy sessions per annum. Mental Health First Aiders are trained in every department.\n\n5. INCIDENT REPORTING: Any workplace injury, near-miss, or unsafe condition must be reported in the HSSE portal within 24 hours. Fatal or serious injuries trigger an immediate root-cause investigation.\n\n6. EMERGENCY RESPONSE: Fire drills are conducted twice yearly. First aid kits and AEDs are maintained in all offices. Emergency contact trees are updated quarterly.`,
      status: 'Draft', version: '1.0',
      effectiveDate: d(2026,7,1)
    },
  ]);
  console.log('✅  Policies seeded (5 policies).');

  // Policy acknowledgements (realistic sign-offs)
  const ackData = [
    // Code of Conduct — widely signed
    { policy: polEthics._id, employee: 'Rohan Mehta',     acknowledgedAt: d(2026,1,10) },
    { policy: polEthics._id, employee: 'Priya Sharma',    acknowledgedAt: d(2026,1,11) },
    { policy: polEthics._id, employee: 'Neha Joshi',      acknowledgedAt: d(2026,1,11) },
    { policy: polEthics._id, employee: 'Arjun Kapoor',    acknowledgedAt: d(2026,1,12) },
    { policy: polEthics._id, employee: 'Rahul Gupta',     acknowledgedAt: d(2026,1,15) },
    { policy: polEthics._id, employee: 'Deepa Iyer',      acknowledgedAt: d(2026,1,16) },
    { policy: polEthics._id, employee: 'Siddharth Nair',  acknowledgedAt: d(2026,1,18) },
    // Environmental Policy
    { policy: polEnv._id, employee: 'Rohan Mehta',    acknowledgedAt: d(2026,1,15) },
    { policy: polEnv._id, employee: 'Arjun Kapoor',   acknowledgedAt: d(2026,1,16) },
    { policy: polEnv._id, employee: 'Kavya Reddy',    acknowledgedAt: d(2026,1,20) },
    { policy: polEnv._id, employee: 'Vikram Bose',    acknowledgedAt: d(2026,2,2)  },
    // DEI Policy
    { policy: polDei._id, employee: 'Neha Joshi',     acknowledgedAt: d(2026,2,5)  },
    { policy: polDei._id, employee: 'Priya Sharma',   acknowledgedAt: d(2026,2,6)  },
    { policy: polDei._id, employee: 'Deepa Iyer',     acknowledgedAt: d(2026,2,8)  },
    // Data Privacy
    { policy: polData._id, employee: 'Rohan Mehta',   acknowledgedAt: d(2026,3,5)  },
    { policy: polData._id, employee: 'Siddharth Nair',acknowledgedAt: d(2026,3,6)  },
    { policy: polData._id, employee: 'Rahul Gupta',   acknowledgedAt: d(2026,3,7)  },
  ];

  for (const a of ackData) {
    await PolicyAcknowledgement.create({ ...a, status: 'Acknowledged' });
  }
  console.log(`✅  Policy Acknowledgements seeded (${ackData.length} sign-offs).`);

  // ── 13. Audits ────────────────────────────────────────────────────────────
  const [auditCarbon, auditGov, auditSocial] = await Audit.create([
    {
      title: 'Q2 2026 Scope 1 & 2 Carbon Emissions Audit',
      description: 'Independent third-party verification of Scope 1 (direct) and Scope 2 (purchased energy) greenhouse gas emissions across all four departments for Q1–Q2 2026, aligned to GHG Protocol Corporate Standard.',
      auditor: 'Deloitte ESG Assurance LLP',
      status: 'In Progress',
      startDate: d(2026,6,15),
      endDate:   d(2026,7,31),
      findings: [
        'Operations fleet emissions exceeded Q2 budget by 8% — corrective plan required',
        'Engineering electricity usage trending 12% below 2025 baseline — commendable',
        'Emission factor for Grid Electricity verified against CEA national averages'
      ]
    },
    {
      title: 'Annual Corporate Governance & Ethics Audit FY2026',
      description: 'Comprehensive review of whistleblowing mechanisms, conflict-of-interest disclosure logs, board committee composition, and Code of Conduct compliance training completion rates.',
      auditor: 'Internal Audit Committee — Head: Rajan Pillai',
      status: 'Completed',
      startDate: d(2026,4,1),
      endDate:   d(2026,5,15),
      findings: [
        '98% Code of Conduct sign-off rate — target exceeded',
        '2 undisclosed conflict-of-interest cases identified and remediated',
        'Whistleblowing log: 0 retaliation incidents in FY2026 to date',
        'Board diversity: 38% female directors — 2% below FY2026 target'
      ]
    },
    {
      title: 'DEI & Social Compliance Audit — FY2026 Mid-Year',
      description: 'Assessment of diversity representation metrics, pay equity analysis, sexual harassment (POSH) complaint handling, and employee wellbeing program utilisation.',
      auditor: 'Aon ESG Advisory Services',
      status: 'Scheduled',
      startDate: d(2026,8,1),
      endDate:   d(2026,9,15),
      findings: []
    },
  ]);
  console.log('✅  Audits seeded (3 audits).');

  // ── 14. Compliance Issues ─────────────────────────────────────────────────
  await ComplianceIssue.create([
    {
      title: 'Operations Fleet Emissions — Q2 Budget Overrun',
      description: 'Total diesel consumption by the Operations department fleet exceeded the Q2 2026 carbon budget by 8.3% (approx 1.2 tonnes CO2e over limit). Root cause: unexpected surge in last-mile delivery runs due to vendor consolidation project.',
      audit: auditCarbon._id,
      owner: 'Arjun Kapoor',
      severity: 'High',
      dueDate: d(2026,8,15),
      status: 'Open'
    },
    {
      title: 'Undisclosed Conflict of Interest — Vendor Selection',
      description: 'Two employees in the procurement function failed to disclose a financial relationship with a shortlisted IT vendor prior to the vendor selection committee vote. Both disclosures are now filed and vendor re-evaluation is underway.',
      audit: auditGov._id,
      owner: 'Neha Joshi',
      severity: 'Critical',
      dueDate: d(2026,7,20),
      status: 'Under Review'
    },
    {
      title: 'DEI Training Completion Backlog — Engineering',
      description: '6 of 42 Engineering employees have not completed the mandatory Annual DEI Awareness training module within the stipulated 90-day onboarding window. Automated reminders have been sent; escalation to HRBP triggered.',
      owner: 'Neha Joshi',
      severity: 'Medium',
      dueDate: d(2026,7,31),
      status: 'Open'
    },
    {
      title: 'Waste Disposal Documentation Gap — Q1 Operations',
      description: 'Landfill waste disposal manifests for January and February 2026 (Operations warehouse) are missing third-party transporter signatures as required by the Environmental Policy v1.4. Retrospective documentation requested from vendor.',
      owner: 'Arjun Kapoor',
      severity: 'Low',
      dueDate: d(2026,7,10),
      status: 'Resolved',
      resolvedAt: d(2026,7,8)
    },
    {
      title: 'Code of Conduct Sign-off Pending — 2 Employees',
      description: '2 recently onboarded Sales employees (joined May 2026) have not signed the Code of Business Conduct & Ethics within the mandated 30-day window. HR follow-up in progress.',
      audit: auditGov._id,
      owner: 'Priya Sharma',
      severity: 'Medium',
      dueDate: d(2026,7,15),
      status: 'Resolved',
      resolvedAt: d(2026,7,12)
    },
  ]);
  console.log('✅  Compliance Issues seeded (5 issues).');

  // ── 15. Recompute all ESG scores ──────────────────────────────────────────
  console.log('\n⚙️   Recomputing all department ESG scores…');
  await recomputeAllDepartmentScores('2026', 'Q2');
  console.log('✅  ESG scores recomputed and synced to MongoDB.\n');

  console.log('━'.repeat(60));
  console.log('🎉  EcoSphere database fully seeded with production-quality data!');
  console.log('━'.repeat(60));
  console.log(`
  Collections populated:
  • Categories           : 4
  • Departments          : 4 (ENG, SLS, HR, OPS)
  • Emission Factors     : 5
  • Carbon Transactions  : ${txData.length}
  • Environmental Goals  : 4
  • CSR Activities       : 6
  • Challenges           : 6
  • Badges               : 6
  • Rewards              : 7
  • Policies             : 5
  • Policy Ack. Sign-offs: ${ackData.length}
  • Audits               : 3
  • Compliance Issues    : 5
  • ESG Config & Settings: ✓
  `);

  process.exit(0);
}

seed().catch(err => { console.error('❌  Seed error:', err); process.exit(1); });
