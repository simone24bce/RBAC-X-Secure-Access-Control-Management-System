const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const geoip = require('geoip-lite');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // --- RBAC-X ZERO-TRUST RISK ENGINE START ---

    // 3. IP DETECTION & DEMO OVERRIDE
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.socket.remoteAddress || 
                  req.ip;
    
    let cleanIp = rawIp.replace(/^.*:/, '');
    if (cleanIp === '1') cleanIp = '127.0.0.1';

    /**
     * 🎥 VIDEO DEMO TOGGLE:
     * To show SUCCESS: Use '103.15.254.1' (Bhopal)
     * To show BLOCK:   Use '8.8.8.8'      (California)
     */
    const isInternal = (cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168'));
    const ipToLookup = isInternal ? '103.15.254.1' : cleanIp; 

    const geo = geoip.lookup(ipToLookup);
    const detectedCity = geo ? geo.city : "Unknown";
    
    // 4. CALCULATE RISK
    let riskScore = 0;
    const isOffCampus = detectedCity !== 'Bhopal';
    
    if (isOffCampus) riskScore += 100; // Immediate failure for non-Bhopal IPs

    console.log(`🛡️ [RBAC-X LOGIN AUDIT]: User ${username} | City: ${detectedCity} | Risk: ${riskScore}`);

    // 5. ENFORCEMENT BLOCK
    // We block if Risk is high AND user is not an Admin
    if (riskScore >= 50 && user.role !== 'Admin') {
      return res.status(403).json({ 
        message: "ZERO-TRUST BLOCK: Unauthorized Location Detected", 
        details: {
          location: detectedCity,
          risk: riskScore,
          action: "Access denied from external perimeters."
        }
      });
    }

    // --- RISK ENGINE END ---

    // 6. GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 7. SUCCESS RESPONSE
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        location: detectedCity,
        risk: riskScore
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
