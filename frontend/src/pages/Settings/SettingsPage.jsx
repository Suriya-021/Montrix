import React, { useState } from 'react';
import { 
  Building2, 
  GitFork, 
  Key, 
  Sliders, 
  User, 
  Database,
  CheckCircle2,
  Download,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';
import './SettingsPage.css';

// Import setting sections
import AutomationsSettings from './components/AutomationsSettings';
import ConnectedAccountsSettings from './components/ConnectedAccountsSettings';
import SecuritySettings from './components/SecuritySettings';
import PreferencesSettings from './components/PreferencesSettings';
import ProfileSettings from './components/ProfileSettings';
import DataPrivacySettings from './components/DataPrivacySettings';

const TABS = [
  { id: 'automations', label: 'Automations & Tax Sweeps', icon: GitFork, component: AutomationsSettings },
  { id: 'accounts', label: 'Connected Accounts & Plaid', icon: Building2, component: ConnectedAccountsSettings, badge: '4 Live' },
  { id: 'security', label: 'Security & API Keys', icon: Key, component: SecuritySettings },
  { id: 'preferences', label: 'Preferences & Currency', icon: Sliders, component: PreferencesSettings },
  { id: 'profile', label: 'Profile & Team', icon: User, component: ProfileSettings },
  { id: 'data', label: 'Data & Privacy', icon: Database, component: DataPrivacySettings }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('automations');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || AutomationsSettings;

  return (
    <div className="settings-view fade-in">
      <div className="settings-halo"></div>

      {/* Top Executive Header & Action Bar */}
      <div className="settings-topbar">
        <div>
          <div className="settings-breadcrumb">
            <span>MONTRIX</span>
            <ChevronRight size={13} />
            <span>WORKSPACE &amp; INFRASTRUCTURE</span>
            <ChevronRight size={13} />
            <span className="accent">SETTINGS &amp; AUTOMATIONS</span>
            <span className="settings-live-pill">
              <span className="settings-live-dot"></span>
              Auto-Sync: Enabled (15m)
            </span>
          </div>
          <div className="settings-title-row">
            <h1 className="settings-title">Settings &amp; Automations</h1>
            <span style={{ fontSize: '12px', color: '#958ea0', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
              <CheckCircle2 size={14} color="#27e0a9" />
              Config Hash: 0x8a92…e41f
            </span>
          </div>
          <p className="settings-subtitle">
            Configure multi-institution Plaid bank sync feeds, automated IRS tax sweep waterfall logic, and ledger governance rules.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn-stitch-secondary"
            onClick={() => alert('Configuration JSON exported.')}
            type="button"
          >
            <Download size={15} />
            <span>Export Config</span>
          </button>
          <button 
            className="btn-stitch-primary"
            onClick={() => alert('New integration wizard launched.')}
            type="button"
          >
            <Plus size={15} />
            <span>+ Add Integration</span>
          </button>
        </div>
      </div>

      {/* 4 Top Telemetry Status Cards */}
      <div className="settings-kpi-grid">
        {/* Card 1: Plaid Bank Sync */}
        <div className="settings-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#a078ff' }}></div>
          <div className="settings-kpi-card-header">
            <div>
              <div className="settings-kpi-card-title">Plaid Bank Sync</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Live Financial Rail</span>
            </div>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontSize: '10px', fontWeight: 600 }}>
              100% Health
            </span>
          </div>
          <div className="settings-kpi-card-val">4 Institutions</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>9 Accounts Active</span>
            <span style={{ color: '#27e0a9' }}>Latency: 240ms</span>
          </div>
        </div>

        {/* Card 2: Tax Waterfall */}
        <div className="settings-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#27e0a9' }}></div>
          <div className="settings-kpi-card-header">
            <div>
              <div className="settings-kpi-card-title">Tax Waterfall</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Automated Cash Partition</span>
            </div>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(160, 120, 255, 0.15)', color: '#d0bcff', fontSize: '10px', fontWeight: 600 }}>
              Engine Active
            </span>
          </div>
          <div className="settings-kpi-card-val" style={{ color: '#d0bcff' }}>30.0% Allocation</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>Gross Inflow Auto-Swept</span>
            <span style={{ color: '#5de6ff' }}>Next: 23:59 UTC</span>
          </div>
        </div>

        {/* Card 3: Safe Harbor Cushion */}
        <div className="settings-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#5de6ff' }}></div>
          <div className="settings-kpi-card-header">
            <div>
              <div className="settings-kpi-card-title">Safe Harbor §6654</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>IRS Penalty Shield</span>
            </div>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(93, 230, 255, 0.15)', color: '#5de6ff', fontSize: '10px', fontWeight: 600 }}>
              100% Target
            </span>
          </div>
          <div className="settings-kpi-card-val" style={{ color: '#5de6ff' }}>$12,480.00</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>IRS Risk Score</span>
            <span style={{ color: '#27e0a9' }}>0.0% Protected</span>
          </div>
        </div>

        {/* Card 4: Webhook Velocity */}
        <div className="settings-kpi-card">
          <div className="settings-kpi-card-header">
            <div>
              <div className="settings-kpi-card-title">Webhook Velocity</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Event Ingestion Stream</span>
            </div>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#2a2a2d', color: '#cbc3d7', fontSize: '10px', fontWeight: 600 }}>
              Real-Time
            </span>
          </div>
          <div className="settings-kpi-card-val">1,248 Events</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>Deliverability Rate</span>
            <span style={{ color: '#27e0a9' }}>99.98%</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Ribbon */}
      <div className="settings-tab-ribbon">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`settings-ribbon-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: isActive ? 'rgba(0,0,0,0.3)' : 'rgba(39, 224, 169, 0.2)', color: isActive ? '#fff' : '#27e0a9', fontFamily: 'var(--font-mono)' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
}
