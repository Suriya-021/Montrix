import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Loader2, AlertCircle, ShieldCheck, Sparkles 
} from 'lucide-react';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email.trim(), password);
      login(data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex@montrix.ai');
    setPassword('DemoPass123!');
    setError(null);
    setLoading(true);

    try {
      // Try login with demo account
      const data = await authService.login('alex@montrix.ai', 'DemoPass123!');
      login(data.access_token);
      navigate('/');
    } catch {
      // If demo account doesn't exist yet, try to auto-register it then login
      try {
        await authService.register('Alex Vance', 'alex@montrix.ai', 'DemoPass123!');
        const data = await authService.login('alex@montrix.ai', 'DemoPass123!');
        login(data.access_token);
        navigate('/');
      } catch (regErr) {
        setError(regErr.message || 'Failed to authenticate demo workspace');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient-glow"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <ShieldCheck size={13} color="#27e0a9" />
            <span>MONTRIX FINANCIAL LEDGER</span>
          </div>
          <h2 className="auth-title">Sign in to your ledger</h2>
          <p className="auth-subtitle">
            Access your multi-account clearing dashboard, cash velocity telemetry, and AI coach.
          </p>
        </div>

        {/* Success message from register redirect */}
        {successMessage && !error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(39, 224, 169, 0.12)',
            border: '1px solid rgba(39, 224, 169, 0.25)',
            color: '#27e0a9',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div className="auth-form-group">
            <label className="auth-label">Corporate Email</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input 
                type="email" 
                className="auth-input"
                placeholder="name@company.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="auth-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="auth-label">Master Password</label>
            </div>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="auth-input"
                placeholder="••••••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="auth-input-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Authenticating Ledger...</span>
              </>
            ) : (
              <>
                <span>Sign In to Montrix</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or evaluate instantly</span>
        </div>

        {/* Demo Login Button */}
        <button 
          type="button" 
          className="auth-demo-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <Sparkles size={14} />
          <span>Launch Demo Workspace</span>
        </button>

        {/* Switcher to Register */}
        <div className="auth-footer">
          <span>New to Montrix?</span>
          <Link to="/register" className="auth-link">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
