const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

const rbacXEngine = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or Expired Token" });

      // 1. IP DETECTION
      const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
      let cleanIp = rawIp.replace(/^.*:/, '');
      if (cleanIp === '1') cleanIp = '127.0.0.1';

      // 2. DEMO TOGGLE (Match this with auth.js for consistency)
      const isInternal = cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168');
      const ipToLookup = isInternal ? '103.15.254.1' : cleanIp; 

      const geo = geoip.lookup(ipToLookup);
      const detectedCity = geo ? geo.city : "Unknown";
      
      // 3. RISK CALCULATION
      let riskScore = (detectedCity !== 'Bhopal') ? 100 : 0; 

      // 4. ENFORCEMENT
      if (riskScore >= 50 && decoded.role !== 'Admin') {
        return res.status(403).json({ 
          message: "ZERO-TRUST BLOCK: Unauthorized Location", 
          details: { detectedLocation: detectedCity, riskScore }
        });
      }

      // 5. ROLE HIERARCHY CHECK (Fixed 'user' to 'decoded')
      const roles = ['Guest', 'Employee', 'Manager', 'Admin'];
      if (roles.indexOf(decoded.role) < roles.indexOf(requiredRole) && decoded.role !== 'Admin') {
        return res.status(403).json({ message: "Permission Denied: Insufficient Role Level" });
      }

      // 6. ATTACH DATA FOR NEXT STEP
      req.user = decoded; // This makes req.user available in server.js
      req.currentRisk = riskScore;
      req.detectedCity = detectedCity;
      next();
    });
  };
};

module.exports = rbacXEngine;

