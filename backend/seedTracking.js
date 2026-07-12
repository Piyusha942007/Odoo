// seedTracking.js is deprecated. Please run:
//   node utils/seed.js
// which performs a comprehensive seed of all departments, emission factors,
// carbon transactions, goals, challenges, rewards, and initial ESG scores.

const { spawn } = require('child_process');
const path = require('path');

console.log("Delegating database seeding to utils/seed.js...");

const child = spawn('node', [path.join(__dirname, 'utils/seed.js')], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
