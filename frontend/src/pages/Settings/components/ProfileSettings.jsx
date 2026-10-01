import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import SpendingHeatmap from '../../../components/Charts/SpendingHeatmap';

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profile = await authService.getMe(token);
          setUser(profile);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return <div className="settings-card glass-card fade-in">Loading profile...</div>;
  }

  // Get first letter of name for avatar
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="settings-card glass-card fade-in">
        <div className="settings-card-header">
          <h2 className="settings-card-title">Profile</h2>
          <p className="settings-card-description">Manage your personal information.</p>
        </div>

        <div className="profile-avatar-section">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-info">
            <h3 style={{ margin: '0 0 var(--space-1) 0', color: 'var(--text-primary)' }}>{user?.name || 'User'}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{user?.email}</p>
            {user?.created_at && (
              <p style={{ margin: 'var(--space-1) 0 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" defaultValue={user?.name || ''} readOnly />
          </div>
          <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" defaultValue={user?.email || ''} readOnly />
          </div>
          <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="form-label">Currency</label>
            <select className="form-input" disabled>
              <option>INR — ₹</option>
              <option>USD — $</option>
              <option>EUR — €</option>
            </select>
          </div>
          
          <div style={{ marginTop: 'var(--space-6)' }}>
            <button className="btn btn-primary" type="button" disabled>Save Changes</button>
            <p style={{ marginTop: 'var(--space-2)', fontSize: '12px', color: 'var(--text-muted)' }}>
              * Profile updates are currently disabled in the demo.
            </p>
          </div>
        </form>
      </div>
      
      {/* GitHub-style Heatmap */}
      <div className="fade-in" style={{ animationDelay: '0.1s' }}>
        <SpendingHeatmap />
      </div>
    </div>
  );
}
