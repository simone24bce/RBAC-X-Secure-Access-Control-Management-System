require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rbacXEngine = require('./middleware/rbacXEngine');

const app = express();

// --- 🛡️ ZERO-TRUST PROXY CONFIGURATION ---
// Essential for ngrok and production environments to see the visitor's real IP.
app.set('trust proxy', true); 

app.use(cors()); 
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// --- PROTECTED ROUTE: DASHBOARD STATS ---
// The core of your demo. Calculates risk dynamically via rbacXEngine.
app.get('/api/dashboard/stats', rbacXEngine('Employee'), (req, res) => {
  res.json({
    secretData: "VIT Analytics: 98% System Integrity",
    riskAtAccess: req.currentRisk, // Injected by your middleware logic
    userRole: req.user.role,
    message: "Context-aware data retrieved successfully"
  });
});

// --- GLOBAL ERROR HANDLER ---
// Keeps the server alive even if there's an unexpected logic error.
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.stack);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n-----------------------------------------`);
    console.log(`🚀 RBAC-X Engine running on port ${PORT}`);
    console.log(`🛡️  Zero-Trust Mode: ACTIVE`);
    console.log(`📍 Proxy Trusting: ENABLED`);
    console.log(`-----------------------------------------\n`);
});