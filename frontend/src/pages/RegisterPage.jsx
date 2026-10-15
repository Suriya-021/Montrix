import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  Loader2, AlertCircle, ShieldCheck, Check 
} from 'lucide-react';
import './AuthPages.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '' };
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 1, text: 'Weak', class: 'active-weak' };
    if (score <= 2) return { score: 2, text: 'Moderate', class: 'active-medium' };
    return { score: 3, text: 'Strong', class: 'active-strong' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.register(name.trim(), email.trim(), password);
      // Registration successful! Redirect to login with positive feedback
      navigate('/login', { state: { message: 'Account successfully registered! Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">
            Begin tracking your income, expenses, and automated runway models.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="auth-form-group">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input 
                type="text" 
                className="auth-input"
                placeholder="e.g. Alex Vance"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required 
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
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

          {/* Master Password */}
          <div className="auth-form-group">
            <label className="auth-label">Password (Min. 6 Characters)</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="auth-input"
                placeholder="Create a strong password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                autoComplete="new-password"
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

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="auth-strength-meter">
                <div className={`auth-strength-bar ${strength.score >= 1 ? strength.class : ''}`}></div>
                <div className={`auth-strength-bar ${strength.score >= 2 ? strength.class : ''}`}></div>
                <div className={`auth-strength-bar ${strength.score >= 3 ? strength.class : ''}`}></div>
                <span className="auth-strength-text">{strength.text}</span>
              </div>
            )}
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
                <span>Provisioning Ledger...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Switcher to Login */}
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
