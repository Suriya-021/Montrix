import React, { useState } from 'react';
import { 
  GitFork, CheckCircle2, ShieldCheck, Zap, 
  ArrowRight, Sliders, DollarSign, RefreshCw, AlertCircle
} from 'lucide-react';

export default function AutomationsSettings() {
  const [isEngineActive, setIsEngineActive] = useState(true);
  const [taxPct, setTaxPct] = useState(30);
  const [opsPct, setOpsPct] = useState(50);
  const [hysaPct, setHysaPct] = useState(20);
  const [threshold, setThreshold] = useState(500);
  const [autoRun, setAutoRun] = useState(true);

  // Normalize percentages if needed
  const handleTaxChange = (val) => {
    const newTax = Number(val);
    setTaxPct(newTax);
    const rem = 100 - newTax;
    setOpsPct(Math.round(rem * 0.7));
    setHysaPct(100 - newTax - Math.round(rem * 0.7));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Waterfall Rules Main Card */}
      <div className="glass-card settings-card" style={{ border: '1px solid rgba(160, 120, 255, 0.25)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #d0bcff, #27e0a9)' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={20} color="#d0bcff" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e5e1e5', margin: 0 }}>
                Automated Tax Sweep &amp; Waterfall Rules
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#958ea0', margin: '6px 0 0', maxWidth: '640px' }}>
              Automate cash partitioning on incoming customer deposits across operating cash, quarterly IRS tax reserves, and high-yield treasury buffers.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#201f22', padding: '6px 12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#e5e1e5' }}>Engine Active</span>
            <input 
              type="checkbox" 
              checked={isEngineActive} 
              onChange={() => setIsEngineActive(!isEngineActive)}
              style={{ accentColor: '#a078ff', cursor: 'pointer', width: '16px', height: '16px' }}
            />
          </div>
        </div>

        {/* Trigger Banner */}
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#1c1b1e', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(160, 120, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d0bcff' }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#e5e1e5' }}>Inflow Trigger Condition</div>
              <div style={{ fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
                On deposits &gt; ${threshold}.00 via Stripe, ACH, or Fedwire rails
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            Instant Auto-Run
          </span>
        </div>

        {/* Visual Waterfall Distribution Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', marginBottom: '6px' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dynamic Cash Partition Distribution</span>
            <span style={{ color: '#e5e1e5', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>100.0% Allocation Committed</span>
          </div>
          <div style={{ width: '100%', height: '12px', borderRadius: '9999px', background: '#353438', display: 'flex', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
            <div style={{ width: `${taxPct}%`, background: '#a078ff', transition: 'width 0.3s ease' }} title={`Tax: ${taxPct}%`}></div>
            <div style={{ width: `${opsPct}%`, background: '#27e0a9', transition: 'width 0.3s ease' }} title={`Operating: ${opsPct}%`}></div>
            <div style={{ width: `${hysaPct}%`, background: '#5de6ff', transition: 'width 0.3s ease' }} title={`Vault: ${hysaPct}%`}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#a078ff' }}></span>
              {taxPct}% IRS Tax Vault
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#27e0a9' }}></span>
              {opsPct}% Primary Operating
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#5de6ff' }}></span>
              {hysaPct}% High-Yield Savings Buffer
            </span>
          </div>
        </div>

        {/* Waterfall Steps Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Step 1 */}
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#201f22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#a078ff', color: '#23005c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  1
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e5e1e5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Q4 Federal &amp; State Estimated Tax Vault</span>
                    <ShieldCheck size={14} color="#27e0a9" />
                  </div>
                  <div style={{ fontSize: '11px', color: '#958ea0' }}>Mercury Treasury (••8812) • IRC §6654 Safe Harbor Protected</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#d0bcff' }}>{taxPct}.0%</span>
                <div style={{ fontSize: '10px', color: '#958ea0' }}>Cap: $35,000 / YTD</div>
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Adjust Allocation:</span>
              <input 
                type="range" 
                min="10" 
                max="50" 
                value={taxPct} 
                onChange={(e) => handleTaxChange(e.target.value)} 
                style={{ accentColor: '#a078ff', flex: 1, cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#201f22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#27e0a9', color: '#003827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  2
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e5e1e5' }}>Primary Operating Liquidity</div>
                  <div style={{ fontSize: '11px', color: '#958ea0' }}>SVB Operating Account (••9901) • Immediate Payroll &amp; SaaS</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#27e0a9' }}>{opsPct}.0%</span>
                <div style={{ fontSize: '10px', color: '#958ea0' }}>Direct Sweep</div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#201f22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#5de6ff', color: '#00363e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  3
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e5e1e5' }}>High-Yield Treasury Buffer</div>
                  <div style={{ fontSize: '11px', color: '#958ea0' }}>High-Yield Cash Reserve (••2209) • 4.85% APY Yield Sweep</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#5de6ff' }}>{hysaPct}.0%</span>
                <div style={{ fontSize: '10px', color: '#27e0a9' }}>4.85% APY Yield</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
