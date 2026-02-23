const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

const rbacXEngine = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid or Expired Token" });

      // --- 1. SMART IP DETECTION (PRO-LEVEL) ---
      // Prioritize X-Forwarded-For (for ngrok), then standard IP sources
      const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.socket.remoteAddress || 
                    req.ip;
      
      // Clean IPv6 garbage (removes the "::ffff:" prefix)
      const cleanIp = rawIp.replace(/^.*:/, '');

      // --- DEMO LOGIC ---
      // If localhost or internal network, we use Bhopal (103.15.254.1) for the demo.
      // If it's a real public IP (from ngrok/mobile), we use the real cleanIp!
      const isInternal = cleanIp === '1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168');
      
      // TIP: Change '103.15.254.1' to '8.8.8.8' here if you want to force a "High Risk" block manually
      const ipToLookup = isInternal ? '103.15.254.1' : cleanIp;

      const geo = geoip.lookup(ipToLookup);
      
      // Define "Off-Campus" logic (Strictly Bhopal)
      const isOffCampus = !geo || geo.city !== 'Bhopal'; 

      // --- 2. AUTOMATIC DEVICE DETECTION ---
      const userAgent = req.headers['user-agent'] || "";
      const isTrustedDevice = /Chrome|Safari|Firefox/i.test(userAgent);

      // --- 3. RISK CALCULATION ---
      let riskScore = 0;
      if (isOffCampus) riskScore += 40;
      if (!isTrustedDevice) riskScore += 30;

      // Debugging: Keep an eye on your Window 2 terminal
      console.log(`🛡️  Audit: User[${user.role}] | RealIP[${cleanIp}] | LookupIP[${ipToLookup}] | City[${geo ? geo.city : 'Unknown'}] | Risk[${riskScore}]`);

      // --- 4. ENFORCEMENT ---
      // Block if risk is high, unless the user is an Admin (Admins bypass for emergencies)
      if (riskScore >= 70 && user.role !== 'Admin') {
        return res.status(403).json({ 
          message: "High Security Risk Detected", 
          details: {
            score: riskScore,
            location: geo ? geo.city : "Unknown",
            device: isTrustedDevice ? "Trusted Browser" : "Unknown Device"
          }
        });
      }

      // Standard Role Hierarchy Check
      const roles = ['Guest', 'Employee', 'Manager', 'Admin'];
      const userRoleLevel = roles.indexOf(user.role);
      const requiredRoleLevel = roles.indexOf(requiredRole);

      if (userRoleLevel < requiredRoleLevel && user.role !== 'Admin') {
        return res.status(403).json({ message: "Permission Denied: Insufficient Role" });
      }

      req.user = user;
      req.currentRisk = riskScore;
      next();
    });
  };
};

module.exports = rbacXEngine;