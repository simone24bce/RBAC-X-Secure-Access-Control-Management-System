import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Lock, AlertCircle, MapPin, Smartphone,Activity } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // Changed to object to hold risk details

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      setResult(response.data);
    } catch (err) {
      // Catch the detailed error middleware
      setError(err.response?.data || { message: 'Access Blocked' });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <Shield size={48} color={result ? "#10b981" : "#6366f1"} />
        <h2 style={{color: '#fff', marginBottom: '5px'}}>RBAC-X Terminal</h2>
        <p style={{color: '#64748b', fontSize: '12px', marginBottom: '20px'}}>Adaptive Risk-Based Authentication</p>

        {!result ? (
          <form onSubmit={handleLogin} style={styles.form}>
            {/* AUTOMATED DETECTION INDICATOR */}
            <div style={styles.detectionBox}>
              <Activity size={14} color="#6366f1" />
              <span style={{color: '#94a3b8', fontSize: '11px'}}>Real-time Context Detection Active</span>
            </div>

            <input style={styles.input} placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} />
            <input style={styles.input} type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <button style={styles.btn}>VERIFY IDENTITY</button>

            {error && (
              <div style={styles.errorContainer}>
                <div style={styles.error}><AlertCircle size={16}/> {error.message}</div>
                {error.details && (
                  <div style={styles.errorDetails}>
                    <span>Loc: {error.details.location}</span> | <span>Risk: {error.details.score}</span>
                  </div>
                )}
              </div>
            )}
          </form>
        ) : (
          <div style={{color: '#fff'}}>
            <div style={styles.successBadge}>ACCESS GRANTED</div>
            <div style={styles.dashboardInfo}>
              <p><Lock size={14} /> <strong>Role:</strong> {result.role}</p>
              <p><MapPin size={14} /> <strong>Detected:</strong> {result.detectedLocation || 'Bhopal (Internal)'}</p>
              <p><Smartphone size={14} /> <strong>Integrity:</strong> Trusted Device</p>
            </div>
            <button style={styles.logout} onClick={() => setResult(null)}>TERMINATE SESSION</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#020617', fontFamily: 'sans-serif' },
  glassCard: { background: '#0f172a', padding: '40px', borderRadius: '20px', border: '1px solid #1e293b', width: '380px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', outline: 'none' },
  btn: { padding: '12px', borderRadius: '8px', background: '#6366f1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: '0.3s' },
  detectionBox: { background: '#1e293b', padding: '8px', borderRadius: '20px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' },
  errorContainer: { marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' },
  error: { color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center', fontWeight: 'bold' },
  errorDetails: { color: '#94a3b8', fontSize: '11px', marginTop: '5px' },
  successBadge: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #10b981', marginBottom: '20px' },
  dashboardInfo: { textAlign: 'left', background: '#1e293b', padding: '15px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' },
  logout: { marginTop: '20px', background: 'none', color: '#64748b', border: '1px solid #334155', cursor: 'pointer', padding: '8px 15px', borderRadius: '5px', fontSize: '12px' }
};

export default App;