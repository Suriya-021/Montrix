import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import SpendingHeatmap from '../../../components/Charts/SpendingHeatmap';
import Toast from '../../../components/Toast/Toast';
import { Loader2, Check } from 'lucide-react';

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profile = await authService.getMe(token);
          setUser(profile);
          setName(profile?.name || '');
          setEmail(profile?.email || '');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setToast({ show: true, message: 'Name and email cannot be empty.', type: 'error' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = await authService.updateProfile({
        name: name.trim(),
        email: email.trim()
      });
      setUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-card glass-card fade-in">Loading profile...</div>;
  }

  // Get first letter of name for avatar
  const initial = name ? name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U');
  const hasChanges = (name !== (user?.name || '')) || (email !== (user?.email || ''));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', minWidth: 0 }}>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      <div className="settings-card glass-card fade-in">
        <div className="settings-card-header">
          <h2 className="settings-card-title">Profile</h2>
          <p className="settings-card-description">Manage your personal information and account identity.</p>
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

        <form className="settings-form" onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              maxLength={100}
            />
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button 
              className="btn btn--primary" 
              type="submit" 
              disabled={isSaving || !hasChanges}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
              Save Changes
            </button>
            {hasChanges && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Unsaved changes</span>
            )}
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
