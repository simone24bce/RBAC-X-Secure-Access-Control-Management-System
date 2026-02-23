const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const geoip = require('geoip-lite'); // New requirement
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Secure password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

    // --- AUTOMATIC CONTEXT DETECTION ---
    
    // 1. Detect IP (Handling Localhost for Demo)
    // To show "Off-Campus" during demo, change '103.15.254.1' to '8.8.8.8'
    const ip = (req.ip === '::1' || req.ip === '127.0.0.1') ? '103.15.254.1' : req.ip;
    
    const geo = geoip.lookup(ip);
    const detectedCity = geo ? geo.city : "Unknown";
    const isLocal = detectedCity === 'Bhopal'; 

    // 2. Detect Device
    const userAgent = req.headers['user-agent'] || "";
    const isTrusted = userAgent.includes('Chrome') || userAgent.includes('Safari') || userAgent.includes('Firefox');

    // 3. Generate Risk-Aware Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Return Data to Frontend
    res.json({
      token,
      role: user.role,
      username: user.username,
      detectedLocation: isLocal ? "Bhopal (Internal Network)" : `${detectedCity} (External)`,
      deviceStatus: isTrusted ? "Trusted Browser" : "Unknown Device"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;