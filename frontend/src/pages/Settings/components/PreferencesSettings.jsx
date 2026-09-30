import React from 'react';

export default function PreferencesSettings() {
  return (
    <div className="settings-card glass-card fade-in">
      <div className="settings-card-header">
        <h2 className="settings-card-title">Preferences</h2>
        <p className="settings-card-description">Manage regional and app behavior preferences.</p>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Display Currency</div>
          <div className="setting-description">Your primary currency for all charts and tables.</div>
        </div>
        <div className="setting-action">
          <select className="form-input" style={{ width: '140px' }} defaultValue="inr">
            <option value="inr">₹ INR</option>
            <option value="usd">$ USD</option>
            <option value="eur">€ EUR</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Date Format</div>
          <div className="setting-description">How dates are displayed across the app.</div>
        </div>
        <div className="setting-action">
          <select className="form-input" style={{ width: '140px' }} defaultValue="ddmmyyyy">
            <option value="ddmmyyyy">DD/MM/YYYY</option>
            <option value="mmddyyyy">MM/DD/YYYY</option>
            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">First Day of Week</div>
          <div className="setting-description">The starting day for weekly charts and budgets.</div>
        </div>
        <div className="setting-action">
          <select className="form-input" style={{ width: '140px' }} defaultValue="monday">
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Default Expense Category</div>
          <div className="setting-description">Pre-selected category when adding new expenses.</div>
        </div>
        <div className="setting-action">
          <select className="form-input" style={{ width: '140px' }} defaultValue="other">
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
