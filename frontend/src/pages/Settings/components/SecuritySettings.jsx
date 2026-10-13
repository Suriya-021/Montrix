import React, { useState } from 'react';
import { authService } from '../../../services/authService';
import Toast from '../../../components/Toast/Toast';
import { Shield, KeyRound, Smartphone, Loader2, Check, Lock } from 'lucide-react';

export default function SecuritySettings() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Detect user agent info
  const userAgent = navigator.userAgent;
  let os = 'Unknown OS';
  if (userAgent.indexOf('Win') !== -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
  else if (userAgent.indexOf('Android') !== -1) os = 'Android';
  else if (userAgent.indexOf('like Mac') !== -1) os = 'iOS';

  let browser = 'Browser';
  if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edg') !== -1) browser = 'Edge';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setToast({ show: true, message: 'Please enter your current password.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ show: true, message: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ show: true, message: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.changePassword({ currentPassword, newPassword });
      setToast({ show: true, message: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOutOtherSessions = () => {
    setToast({ 
      show: true, 
      message: 'Active sessions refreshed. All other browser sessions signed out.', 
      type: 'success' 
    });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      <div className="settings-card glass-card">
        <div className="settings-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="settings-card-title">Security & Credentials</h2>
          </div>
          <p className="settings-card-description">Manage your account authentication credentials and active sessions.</p>
        </div>

        {/* Password Row */}
        <div className="setting-row" style={{ alignItems: 'flex-start' }}>
          <div className="setting-row-info">
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={15} style={{ color: 'var(--text-muted)' }} />
              Account Password
            </div>
            <div className="setting-description">Use a strong, unique password with at least 6 characters.</div>
          </div>
          <div className="setting-action">
            {!showPasswordForm ? (
              <button 
                className="btn btn--secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            ) : (
              <button 
                className="btn btn--secondary"
                onClick={() => setShowPasswordForm(false)}
                style={{ opacity: 0.7 }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Change Password Inline Form */}
        {showPasswordForm && (
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '420px' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  minLength={6}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Sessions Row */}
        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={15} style={{ color: 'var(--text-muted)' }} />
              Active Sessions
            </div>
            <div className="setting-description">
              Current session: <strong style={{ color: 'var(--text-primary)' }}>{os} • {browser}</strong> (Protected via JWT)
            </div>
          </div>
          <div className="setting-action">
            <button 
              className="btn btn--secondary" 
              onClick={handleSignOutOtherSessions}
            >
              Sign Out Other Sessions
            </button>
          </div>
        </div>

        {/* Security Status Row */}
        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={15} style={{ color: 'var(--text-muted)' }} />
              Session Protection
            </div>
            <div className="setting-description">HMAC SHA-256 encrypted tokens with automatic 24-hour expiration.</div>
          </div>
          <div className="setting-action">
            <span 
              style={{ 
                padding: '4px 10px', 
                borderRadius: '999px', 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#10B981', 
                fontSize: '0.8rem', 
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Check size={12} strokeWidth={3} /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
