import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield, Bell, Calendar } from '../../components/Icons';
import PasswordInput from '../../components/PasswordInput';
import './Admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      
      // Smart redirect according to role
      if (res.user.role === 'frontdesk') {
        navigate('/admin/dashboard/front-desk');
      } else if (res.user.role === 'eventmanager') {
        navigate('/admin/dashboard/events');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showToast(err.error || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    login(roleEmail, rolePass)
      .then((res) => {
        showToast(`Logged in as ${res.user.role.toUpperCase()} (Demo)`, 'success');
        if (res.user.role === 'frontdesk') {
          navigate('/admin/dashboard/front-desk');
        } else if (res.user.role === 'eventmanager') {
          navigate('/admin/dashboard/events');
        } else {
          navigate('/admin/dashboard');
        }
      })
      .catch((err) => showToast(err.error || 'Login failed', 'error'));
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <div className="login-brand-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>ORIS SIGNATURES</h1>
            <p>Hotel & Suites • Staff Portal</p>
          </Link>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label>Staff Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@orissignatures.com"
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-admin btn-admin-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="quick-demo-roles">
          <div className="quick-demo-label">Quick Demo Access by Role:</div>
          <div className="quick-demo-btns">
            <button
              type="button"
              className="btn-demo-role"
              onClick={() => handleQuickDemo('admin@orissignatures.com', 'admin123')}
            >
              <Shield width="15" height="15" /> Main Admin
            </button>
            <button
              type="button"
              className="btn-demo-role"
              onClick={() => handleQuickDemo('frontdesk@orissignatures.com', 'frontdesk123')}
            >
              <Bell width="15" height="15" /> Front Desk
            </button>
            <button
              type="button"
              className="btn-demo-role"
              onClick={() => handleQuickDemo('events@orissignatures.com', 'events123')}
            >
              <Calendar width="15" height="15" /> Event Mgr
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#6b7280', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to Oris Signatures Website
          </Link>
        </div>
      </div>
    </div>
  );
}
