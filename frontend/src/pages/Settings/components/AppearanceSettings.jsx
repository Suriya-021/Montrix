import React, { useState } from 'react';
import Toggle from './Toggle';

export default function AppearanceSettings() {
  const [theme, setTheme] = useState('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  return (
    <div className="settings-card glass-card fade-in">
      <div className="settings-card-header">
        <h2 className="settings-card-title">Appearance</h2>
        <p className="settings-card-description">Customize how Montrix looks and feels.</p>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Theme</div>
          <div className="setting-description">Select your preferred color theme.</div>
        </div>
        <div className="setting-action">
          <select 
            className="form-input" 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: '120px' }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Compact Mode</div>
          <div className="setting-description">Reduce spacing to fit more content on screen.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={compactMode} onChange={setCompactMode} />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-row-info">
          <div className="setting-label">Animations</div>
          <div className="setting-description">Enable smooth transitions and UI animations.</div>
        </div>
        <div className="setting-action">
          <Toggle checked={animations} onChange={setAnimations} />
        </div>
      </div>
    </div>
  );
}
