import React, { useState } from 'react';
import { expenseService } from '../../../services/expenseService';
import { authService } from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../components/Toast/Toast';
import { Download, FileText, AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

export default function DataPrivacySettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await expenseService.exportCSV();
      setToast({ show: true, message: 'Financial CSV exported successfully!', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Failed to export CSV. Please try again.', type: 'error' });
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setToast({ show: true, message: 'Please type DELETE to confirm account deletion.', type: 'error' });
      return;
    }

    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to delete account.', type: 'error' });
      setIsDeleting(false);
    }
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

      {/* Standard Settings Card */}
      <div className="settings-card glass-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title">Data & Privacy</h2>
          <p className="settings-card-description">Control your financial data portability and privacy options.</p>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={15} style={{ color: 'var(--text-muted)' }} />
              Export Financial Data (CSV)
            </div>
            <div className="setting-description">Download your complete transaction ledger in standard CSV format.</div>
          </div>
          <div className="setting-action">
            <button 
              className="btn btn--secondary" 
              onClick={handleExportCSV}
              disabled={exporting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} style={{ color: 'var(--text-muted)' }} />
              Print / Save Financial Summary
            </div>
            <div className="setting-description">Generate a printable document or save a snapshot of your dashboard as a PDF.</div>
          </div>
          <div className="setting-action">
            <button 
              className="btn btn--secondary" 
              onClick={handlePrintReport}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} />
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="settings-card glass-card danger-zone" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(30, 10, 15, 0.4)' }}>
        <div className="settings-card-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={20} style={{ color: '#EF4444' }} />
            <h2 className="settings-card-title" style={{ color: '#EF4444' }}>Danger Zone</h2>
          </div>
          <p className="settings-card-description" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Irreversible account and financial record deletion. Proceed with extreme caution.
          </p>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label" style={{ color: 'var(--text-primary)' }}>Delete Account & Wipe Data</div>
            <div className="setting-description" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Permanently delete your profile and wipe all expenses, income, budgets, subscriptions, and goals from the database.
            </div>
          </div>
          <div className="setting-action">
            <button 
              className="btn" 
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                color: '#EF4444', 
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              onClick={() => {
                setDeleteConfirmationText('');
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            className="glass-card" 
            style={{ 
              maxWidth: '480px', 
              width: '100%', 
              padding: 'var(--space-6)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertTriangle size={24} style={{ color: '#EF4444' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#EF4444' }}>Delete Account Permanently?</h3>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              This action is <strong>strictly irreversible</strong>. All your logged transactions, active budgets, recurring subscriptions, savings goals, and custom categories will be permanently purged from the database.
            </p>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Please type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm:
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                style={{ borderColor: deleteConfirmationText === 'DELETE' ? '#EF4444' : 'var(--card-border)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button 
                className="btn btn--secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button 
                className="btn"
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                onClick={handleConfirmDelete}
                style={{ 
                  backgroundColor: '#EF4444', 
                  color: '#fff', 
                  fontWeight: 600,
                  opacity: deleteConfirmationText === 'DELETE' ? 1 : 0.4,
                  cursor: deleteConfirmationText === 'DELETE' ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {isDeleting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
