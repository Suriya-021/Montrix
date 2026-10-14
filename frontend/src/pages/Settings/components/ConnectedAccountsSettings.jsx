import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, RefreshCw, ShieldCheck, 
  ExternalLink, Plus, AlertCircle, CreditCard
} from 'lucide-react';

const INSTITUTIONS = [
  { id: 'mercury', name: 'Mercury Bank', mask: '••8812', type: 'Checking & Treasury', balance: '$84,920.00', status: 'Healthy', latency: '120ms' },
  { id: 'corporate_card', name: 'Corporate Cash & Cards', mask: '••2209', type: 'Commercial Credit & HYSA', balance: '$46,210.00', status: 'Healthy', latency: '180ms' },
  { id: 'chase', name: 'Chase Sapphire Biz', mask: '••8819', type: 'Credit Card Rail', balance: '$3,410.50', status: 'Healthy', latency: '240ms' },
  { id: 'stripe', name: 'Stripe Connect Clearing', mask: 'acct_102', type: 'Merchant Inflow Rail', balance: '$14,850.00', status: 'Healthy', latency: '90ms' }
];

export default function ConnectedAccountsSettings() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('All nodes 100% synchronized');

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Refreshed just now via Plaid Webhook');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-card settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e5e1e5', margin: 0 }}>
              Connected Banking Rails &amp; Plaid Streams
            </h3>
            <p style={{ fontSize: '13px', color: '#958ea0', margin: '4px 0 0' }}>
              Real-time multi-institution clearing connections and corporate card feeds.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-stitch-secondary"
              onClick={handleSyncAll}
              disabled={isSyncing}
              style={{ padding: '6px 12px' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync All Nodes'}</span>
            </button>
            <button 
              className="btn-stitch-primary"
              style={{ padding: '6px 14px' }}
              onClick={() => alert('Plaid Link sandbox connection launched.')}
            >
              <Plus size={14} />
              <span>Link Institution</span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#27e0a9', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
          <CheckCircle2 size={14} />
          <span>{syncStatus}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {INSTITUTIONS.map((inst) => (
            <div 
              key={inst.id}
              style={{
                borderRadius: '12px',
                background: '#201f22',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(160, 120, 255, 0.12)', color: '#d0bcff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e5e1e5' }}>{inst.name}</div>
                    <div style={{ fontSize: '11px', color: '#958ea0' }}>{inst.type} • {inst.mask}</div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontWeight: 600 }}>
                  {inst.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#958ea0' }}>Available Liquidity</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#e5e1e5' }}>
                  {inst.balance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
