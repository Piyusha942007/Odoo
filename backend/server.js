const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// MongoDB Connection Setup
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.warn('\x1b[33m%s\x1b[0m', 'WARNING: MONGODB_URI environment variable is not defined.');
  console.warn('\x1b[33m%s\x1b[0m', 'The server will start, but database-dependent features will fail.');
} else {
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('MongoDB successfully connected.');
    })
    .catch((err) => {
      console.error('\x1b[31m%s\x1b[0m', 'MongoDB connection error:', err.message);
      console.warn('\x1b[33m%s\x1b[0m', 'The server will continue running without database connectivity.');
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "EcoSphere API is running",
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Import Department routes
const departmentRoutes = require('./routes/departmentRoutes');

// Mount routes
app.use('/api/departments', departmentRoutes);
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/environmental', require('./routes/environmentalRoutes'));

// Mount Governance module routes
app.use('/api/governance/policies', require('./routes/policyRoutes'));
app.use('/api/governance/audits', require('./routes/auditRoutes'));
app.use('/api/governance/reports', require('./routes/reportRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API Route not found'
  });
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
