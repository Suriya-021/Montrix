import React from 'react';

export default function SecuritySettings() {
  return (
    <div className="settings-card glass-card fade-in">
      <div className="settings-card-header">
        <h2 className="settings-card-title">Security</h2>
        <p className="settings-card-description">Manage your password and account security.</p>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Password</div>
          <div className="setting-description">Last changed: Never</div>
        </div>
        <div className="setting-action">
          <button className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            Change Password
          </button>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Active Sessions</div>
          <div className="setting-description">Current session: Windows • Chrome</div>
        </div>
        <div className="setting-action">
          <button className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            Sign Out Other Sessions
          </button>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Two-factor authentication</div>
          <div className="setting-description">Status: Not enabled</div>
        </div>
        <div className="setting-action">
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent-blue)', color: '#fff' }}>
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
