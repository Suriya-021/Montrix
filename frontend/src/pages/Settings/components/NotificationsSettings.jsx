import React from 'react';
import Toggle from './Toggle';
import { useSettings } from '../../../context/SettingsContext';

export default function NotificationsSettings() {
  const { notifications, updateSetting } = useSettings();

  const handleToggle = (key, value) => {
    updateSetting('notifications', {
      ...notifications,
      [key]: value
    });
  };

  return (
    <div className="settings-card glass-card fade-in">
      <div className="settings-card-header">
        <h2 className="settings-card-title">Notifications</h2>
        <p className="settings-card-description">Choose which notifications you want to receive.</p>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Budget alerts</div>
          <div className="setting-description">Notify when spending reaches 80% of a budget.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={notifications?.budgetAlerts} onChange={(v) => handleToggle('budgetAlerts', v)} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Budget exceeded</div>
          <div className="setting-description">Notify when a category exceeds its budget.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={notifications?.budgetExceeded} onChange={(v) => handleToggle('budgetExceeded', v)} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Upcoming bills</div>
          <div className="setting-description">Remind me about upcoming recurring payments.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={notifications?.upcomingBills} onChange={(v) => handleToggle('upcomingBills', v)} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Savings goals</div>
          <div className="setting-description">Notify me when I reach a savings milestone.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={notifications?.savingsGoals} onChange={(v) => handleToggle('savingsGoals', v)} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">AI insights</div>
          <div className="setting-description">Notify me when a new spending insight is available.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={notifications?.aiInsights} onChange={(v) => handleToggle('aiInsights', v)} />
        </div>
      </div>
    </div>
  );
}
