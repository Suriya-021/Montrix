import React, { useState } from 'react';
import Toggle from './Toggle';

export default function NotificationsSettings() {
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [budgetExceeded, setBudgetExceeded] = useState(true);
  const [upcomingBills, setUpcomingBills] = useState(true);
  const [savingsGoals, setSavingsGoals] = useState(true);
  const [aiInsights, setAiInsights] = useState(false);

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
          <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Budget exceeded</div>
          <div className="setting-description">Notify when a category exceeds its budget.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={budgetExceeded} onChange={setBudgetExceeded} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Upcoming bills</div>
          <div className="setting-description">Remind me about upcoming recurring payments.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={upcomingBills} onChange={setUpcomingBills} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Savings goals</div>
          <div className="setting-description">Notify me when I reach a savings milestone.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={savingsGoals} onChange={setSavingsGoals} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">AI insights</div>
          <div className="setting-description">Notify me when a new spending insight is available.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={aiInsights} onChange={setAiInsights} />
        </div>
      </div>
    </div>
  );
}
