const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

const rbacXEngine = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid or Expired Token" });

      // --- 1. IP DETECTION ---
      const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.socket.remoteAddress || 
                    req.ip;
      
      const cleanIp = rawIp.replace(/^.*:/, '');

     
      const isInternal = cleanIp === '1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168');
      const ipToLookup = isInternal ? '103.15.254.1' : cleanIp; 

      const geo = geoip.lookup(ipToLookup);
      const detectedCity = geo ? geo.city : "Unknown";
      
      // STRICT LOGIC: If not Bhopal, it's a risk.
      const isOffCampus = detectedCity !== 'Bhopal'; 

      // --- 3. DEVICE FINGERPRINTING ---
      const userAgent = req.headers['user-agent'] || "";
      const isTrustedDevice = /Chrome|Safari|Firefox/i.test(userAgent);

      // --- 4. NEW WINNING RISK SCORING ---
      let riskScore = 0;
      
      if (isOffCampus) {
        riskScore += 60; // Higher penalty for wrong city
      }
      if (!isTrustedDevice) {
        riskScore += 20; // Penalty for unknown browsers
      }

      console.log(`🛡️ Audit: User[${user.role}] | City[${detectedCity}] | Risk[${riskScore}]`);

      // --- 5. ENFORCEMENT (The "Block" Logic) ---
      // We set the threshold to 50. 
      if (riskScore >= 50 && user.role !== 'Admin') {
        return res.status(403).json({ 
          message: "High Security Risk Detected", 
          details: {
            score: riskScore,
            location: detectedCity,
            reason: "Unsafe Geographic Zone"
          }
        });
      }

      // Standard Role Check
      const roles = ['Guest', 'Employee', 'Manager', 'Admin'];
      if (roles.indexOf(user.role) < roles.indexOf(requiredRole) && user.role !== 'Admin') {
        return res.status(403).json({ message: "Permission Denied: Insufficient Role" });
      }

      req.user = user;
      req.currentRisk = riskScore;
      next();
    });
  };
};

module.exports = rbacXEngine;
