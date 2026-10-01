import React, { useState } from 'react';
import { expenseService } from '../../../services/expenseService';

export default function DataPrivacySettings() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await expenseService.exportCSV();
    } catch (error) {
      alert("Failed to export data. Please try again.");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Standard Settings Card */}
      <div className="settings-card glass-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title">Data & Privacy</h2>
          <p className="settings-card-description">Control your financial data and privacy options.</p>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label">Export My Data</div>
            <div className="setting-description">Download your Montrix financial data in CSV format.</div>
          </div>
          <div className="setting-action">
            <button 
              className="btn" 
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label">Download Financial Report</div>
            <div className="setting-description">Generate a downloadable PDF report of your financial activity.</div>
          </div>
          <div className="setting-action">
            <button 
              className="btn" 
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => alert("PDF report generation coming soon.")}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="settings-card glass-card danger-zone">
        <div className="settings-card-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
          <h2 className="settings-card-title">Danger Zone</h2>
          <p className="settings-card-description" style={{ color: 'rgba(255,255,255,0.6)' }}>
            These actions cannot be easily undone. Proceed with caution.
          </p>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label" style={{ color: 'var(--text-primary)' }}>Delete Account</div>
            <div className="setting-description" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Permanently delete your Montrix account and all associated data.
            </div>
          </div>
          <div className="setting-action">
            <button 
              className="btn" 
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              onClick={() => alert('Account deletion is disabled in this demo.')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
