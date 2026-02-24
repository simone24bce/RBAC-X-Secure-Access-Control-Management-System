# RBAC-X-Secure-Access-Control-Management-System
RBAC-X: Context-Aware Zero-Trust Architecture
Problem Statement 5: Advanced Role-Based Access Control
Project Overview
RBAC-X is a Zero■Trust Role■Based Access Control system that verifies identity, location, and
device context before granting access. It calculates a real-time risk score where low risk allows
access, medium risk restricts permissions, and high risk denies entry. The system is designed for
high-security environments like universities and enterprises.
Key Features
• Secure authentication using bcrypt hashing and JWT tokens
• Geofencing using Geo■IP detection
• Context■aware risk scoring
• Admin override for emergency oversight
• Enterprise network compatibility (Static IP / VPN)
Tech Stack
Frontend: React.js, Vite, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
Security: JWT, bcrypt, GeoIP-lite
stem Working
The system checks login credentials, verifies geographic location, evaluates device trust, and
assigns a risk score. Employees are restricted to campus network access, while Admins can
bypass restrictions for emergency monitoring.
Project Setup
1. Install Node.js and MongoDB
2. Run npm install in frontend and backend folders
3. Create .env file with Mongo URI, JWT Secret, and Port
4. Seed database using: node utils/seed.js
5. Start backend: node server.js
6. Start frontend: npm run dev
Project Structure
models/ → User schemas
routes/ → API endpoints
middleware/ → RBAC■X engine
utils/ → Database seeding scripts
Impact
RBAC■X prevents unauthorized access due to misconfiguration, ensures secure enterprise
infrastructure, and provides intelligent dynamic access control for organizations.
Team
Ayush kumar
(24BEC10159) 
Simone Gupta
(24BCE10618) 