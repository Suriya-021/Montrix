import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useCurrency } from '../../../context/CurrencyContext';

export default function PreferencesSettings() {
  const { dateFormat, firstDayOfWeek, defaultCategory, updateSetting } = useSettings();
  const { currency, changeCurrency } = useCurrency();

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
          <select 
            className="form-input" 
            style={{ width: '140px' }} 
            value={currency}
            onChange={(e) => changeCurrency(e.target.value)}
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Date Format</div>
          <div className="setting-description">How dates are displayed across the app.</div>
        </div>
        <div className="setting-action">
          <select 
            className="form-input" 
            style={{ width: '140px' }} 
            value={dateFormat}
            onChange={(e) => updateSetting('dateFormat', e.target.value)}
          >
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
          <select 
            className="form-input" 
            style={{ width: '140px' }} 
            value={firstDayOfWeek}
            onChange={(e) => updateSetting('firstDayOfWeek', e.target.value)}
          >
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
          <select 
            className="form-input" 
            style={{ width: '140px' }} 
            value={defaultCategory}
            onChange={(e) => updateSetting('defaultCategory', e.target.value)}
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Housing">Housing</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
