import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  Settings2, 
  Bell, 
  Shield, 
  Database 
} from 'lucide-react';
import './SettingsPage.css';

// Import all setting sections
import ProfileSettings from './components/ProfileSettings';
import AppearanceSettings from './components/AppearanceSettings';
import PreferencesSettings from './components/PreferencesSettings';
import NotificationsSettings from './components/NotificationsSettings';
import SecuritySettings from './components/SecuritySettings';
import DataPrivacySettings from './components/DataPrivacySettings';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User, component: ProfileSettings },
  { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
  { id: 'preferences', label: 'Preferences', icon: Settings2, component: PreferencesSettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsSettings },
  { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
  { id: 'data', label: 'Data & Privacy', icon: Database, component: DataPrivacySettings }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Find the currently active component
  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          Manage your account, preferences, and Montrix experience.
        </p>
      </header>

      <div className="settings-layout">
        {/* Left Sidebar Navigation */}
        <nav className="settings-sidebar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="icon" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Content Area */}
        <div className="settings-content">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
