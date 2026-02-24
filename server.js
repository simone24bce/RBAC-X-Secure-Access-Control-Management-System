require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rbacXEngine = require('./middleware/rbacXEngine');

const app = express();

// --- 🛡️ ZERO-TRUST PROXY CONFIGURATION ---
// Critical for ngrok, Render, or mobile testing to see the real visitor IP.
app.set('trust proxy', true); 

app.use(cors()); 
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 1. PUBLIC ROUTES
// Contains the login logic and the first location check.
app.use('/api/auth', require('./routes/auth'));

// 2. THE SECURITY SHIELD (Global Middleware)
// Every route starting with /api/dashboard now requires 'Employee' role 
// AND passes through the Zero-Trust location verification.
app.use('/api/dashboard', rbacXEngine('Employee'));

// 3. PROTECTED DATA ROUTES
app.get('/api/dashboard/stats', (req, res) => {
  // Accessing data injected by the rbacXEngine middleware
  res.json({
    secretData: "VIT Analytics: 98% System Integrity",
    riskAtAccess: req.currentRisk, 
    userRole: req.user.role,
    detectedLocation: req.user.detectedLocation || "Verified HQ Zone",
    message: "Zero-Trust verification successful. Access granted to internal perimeters."
  });
});

// --- GLOBAL ERROR HANDLER ---
// Catches any unauthorized attempts or server crashes gracefully.
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
  
  console.error("🚨 Server Error:", err.stack);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

const PORT = process.env.PORT || 5000;

// Listening on 0.0.0.0 is essential for your phone/external devices to connect
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n--------------------------------------------------`);
    console.log(`🚀 RBAC-X Engine running on port ${PORT}`);
    console.log(`🛡️  Zero-Trust Mode: ACTIVE (Bhopal HQ Only)`);
    console.log(`📱 For Mobile Testing: http://YOUR_LAPTOP_IP:${PORT}`);
    console.log(`--------------------------------------------------\n`);
});
