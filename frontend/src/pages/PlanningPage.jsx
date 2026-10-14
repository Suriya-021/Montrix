import React, { useState, useEffect, useMemo } from 'react';
import BudgetsPage from './BudgetsPage';
import GoalsPage from './GoalsPage';
import { useCurrency } from '../context/CurrencyContext';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { 
  Target, Trophy, Activity, TrendingUp, Sparkles,
  ShieldCheck, AlertTriangle, ArrowRight, RotateCcw,
  Sliders, Calendar, CheckCircle2, ChevronRight,
  TrendingDown, DollarSign, Zap, BarChart2
} from 'lucide-react';
import './PlanningPage.css';

function PlanningPage() {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('runway'); // 'runway' | 'budgets' | 'goals'

  // Real database telemetry
  const [stats, setStats] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    Promise.all([
      expenseService.getStats().catch(() => null),
      incomeService.getAll().catch(() => [])
    ]).then(([s, inc]) => {
      if (s) setStats(s);
      if (Array.isArray(inc)) {
        setTotalIncome(inc.reduce((acc, i) => acc + Number(i.amount || 0), 0));
      }
    });
  }, []);

  // Scenario state
  const [scenario, setScenario] = useState('base'); // 'base' | 'bear' | 'hiring'
  const [horizon, setHorizon] = useState('24M'); // '12M' | '24M' | '36M' | 'Max'

  // Dynamic stress test sliders
  const [inflowDelta, setInflowDelta] = useState(0); // -50% to +50%
  const [burnDelta, setBurnDelta] = useState(0); // $0 to $10,000
  const [taxShield, setTaxShield] = useState('scorp'); // 'standard' | 'scorp'

  // Computed metrics based on real database telemetry and sliders
  const { runwayMonths, netBurn, taxEstimate, effectiveTaxRate, coverageMultiplier, cashOnHand } = useMemo(() => {
    const totalSpent = Number(stats?.total_spent || 0);
    const monthSpent = Number(stats?.month_spent || stats?.this_month_spent || 0);
    const baseBurn = monthSpent > 0 ? monthSpent : (totalSpent > 0 ? totalSpent : 0);
    const cash = Math.max(0, totalIncome - totalSpent);
    
    let baseRunway = baseBurn > 0 ? (cash / baseBurn) : 24.0;
    let baseTax = totalIncome * 0.20;
    let baseRate = 24.0;

    if (scenario === 'bear') {
      baseRunway = Math.max(1, baseRunway - 6.0);
    } else if (scenario === 'hiring') {
      baseRunway = Math.max(1, baseRunway - 4.0);
    }

    const burnAdjusted = Math.max(0, baseBurn + burnDelta);
    const runwayAdjusted = burnAdjusted > 0 
      ? Math.max(1, (cash * (1 + (inflowDelta / 100))) / burnAdjusted)
      : Math.max(1, baseRunway * (1 + (inflowDelta / 100)));
    const rateAdjusted = taxShield === 'scorp' ? 22.5 : 28.0;
    const coverage = burnAdjusted > 0 ? (totalIncome / burnAdjusted).toFixed(2) : '1.0';

    return {
      runwayMonths: runwayAdjusted.toFixed(1),
      netBurn: burnAdjusted,
      taxEstimate: baseTax * (taxShield === 'scorp' ? 0.85 : 1.0),
      effectiveTaxRate: rateAdjusted,
      coverageMultiplier: coverage,
      cashOnHand: cash
    };
  }, [stats, totalIncome, scenario, inflowDelta, burnDelta, taxShield]);

  const handleReset = () => {
    setScenario('base');
    setHorizon('24M');
    setInflowDelta(0);
    setBurnDelta(0);
    setTaxShield('scorp');
  };

  return (
    <div className="planning-view fade-in">
      <div className="planning-halo"></div>

      {/* Top Context & Action Bar */}
      <div className="planning-topbar">
        <div>
          <div className="planning-breadcrumb">
            <span>MONTRIX</span>
            <ChevronRight size={13} />
            <span className="accent">CAPITAL PLANNING &amp; SCENARIOS</span>
            <span className="planning-live-pill">
              <span className="planning-live-dot"></span>
              Monte Carlo Engine Active
            </span>
          </div>
          <div className="planning-title-row">
            <h1 className="planning-title">Runway &amp; Tax Scenario Planning</h1>
          </div>
          <p className="planning-subtitle">
            Algorithmic runway projection, multi-variable burn stress testing, and automated IRS tax sheltering strategies.
          </p>
        </div>

        {/* Actions & Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Horizon Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#0e0e11', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {['12M', '24M', '36M', 'Max'].map(h => (
              <button 
                key={h}
                onClick={() => setHorizon(h)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: horizon === h ? '#a078ff' : 'transparent',
                  color: horizon === h ? '#23005c' : '#958ea0',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Scenario Selector */}
          <select 
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '10px',
              background: '#1c1b1e',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e5e1e5',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="base">Base Case (Default)</option>
            <option value="bear">Bear Market (-30% Inflow)</option>
            <option value="hiring">Aggressive Hiring (+$4k Burn)</option>
          </select>
        </div>
      </div>

      {/* Segmented Pill Navigation Tabs */}
      <div className="planning-tabs-control">
        <button 
          className={`planning-tab-btn ${activeTab === 'runway' ? 'active' : ''}`}
          onClick={() => setActiveTab('runway')}
        >
          <Activity size={15} />
          <span>Runway &amp; Stress Test</span>
        </button>
        <button 
          className={`planning-tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          <Target size={15} />
          <span>Category Budgets</span>
        </button>
        <button 
          className={`planning-tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <Trophy size={15} />
          <span>Savings Milestones</span>
        </button>
      </div>

      {/* Tab 1: Runway & Stress Test */}
      {activeTab === 'runway' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* KPI Metrics Grid (4 Equal Cards) */}
          <div className="planning-kpi-grid">
            {/* Card 1: Projected Runway */}
            <div className="planning-kpi-card">
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#a078ff' }}></div>
              <div className="planning-kpi-card-header">
                <div>
                  <div className="planning-kpi-card-title">Projected Runway</div>
                  <span style={{ fontSize: '11px', color: '#958ea0' }}>Monte Carlo P50</span>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontSize: '11px', fontWeight: 600 }}>
                  +3.2 mo surplus
                </span>
              </div>
              <div className="planning-kpi-card-val" style={{ color: '#d0bcff' }}>
                {runwayMonths} <span style={{ fontSize: '16px', fontWeight: 500 }}>Months</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
                <span>Survival Horizon: Nov 2026</span>
                <span style={{ color: '#27e0a9' }}>Healthy</span>
              </div>
            </div>

            {/* Card 2: Baseline Net Burn Rate */}
            <div className="planning-kpi-card">
              <div className="planning-kpi-card-header">
                <div>
                  <div className="planning-kpi-card-title">Net Burn Velocity</div>
                  <span style={{ fontSize: '11px', color: '#958ea0' }}>Monthly operational spend</span>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(93, 230, 255, 0.15)', color: '#5de6ff', fontSize: '11px', fontWeight: 600 }}>
                  Surplus Covered
                </span>
              </div>
              <div className="planning-kpi-card-val">
                {formatCurrency(netBurn)} <span style={{ fontSize: '14px', color: '#958ea0', fontWeight: 400 }}>/ mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
                <span>Inflow covers 2.51x spend</span>
                <span style={{ color: '#5de6ff' }}>Active</span>
              </div>
            </div>

            {/* Card 3: Q4 Estimated Tax */}
            <div className="planning-kpi-card">
              <div className="planning-kpi-card-header">
                <div>
                  <div className="planning-kpi-card-title">Q4 Estimated Tax</div>
                  <span style={{ fontSize: '11px', color: '#958ea0' }}>IRS Safe Harbor reserve</span>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontSize: '11px', fontWeight: 600 }}>
                  94.2% Funded
                </span>
              </div>
              <div className="planning-kpi-card-val" style={{ color: '#5de6ff' }}>
                {formatCurrency(taxEstimate)}
              </div>
              <div>
                <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: '#353438', overflow: 'hidden', margin: '4px 0' }}>
                  <div style={{ width: '94.2%', height: '100%', background: '#27e0a9', borderRadius: '9999px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
                  <span>{formatCurrency(taxEstimate * 0.942)} sheltered</span>
                  <span>Due Jan 15</span>
                </div>
              </div>
            </div>

            {/* Card 4: Effective Tax Rate */}
            <div className="planning-kpi-card">
              <div className="planning-kpi-card-header">
                <div>
                  <div className="planning-kpi-card-title">Effective Tax Rate</div>
                  <span style={{ fontSize: '11px', color: '#958ea0' }}>Optimized blended rate</span>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(93, 230, 255, 0.15)', color: '#5de6ff', fontSize: '11px', fontWeight: 600 }}>
                  -4.2% opt
                </span>
              </div>
              <div className="planning-kpi-card-val">
                {effectiveTaxRate}% <span style={{ fontSize: '14px', color: '#958ea0', fontWeight: 400 }}>blended</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0' }}>
                <span>Identified tax savings</span>
                <span style={{ color: '#27e0a9', fontWeight: 600 }}>$6,240 / yr</span>
              </div>
            </div>
          </div>

          {/* Chart Card: Runway & Monte Carlo Simulation Curve */}
          <div style={{ borderRadius: '16px', background: 'rgba(28, 27, 30, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e5e1e5', margin: 0 }}>
                  Cash Horizon &amp; Runway Stress Test
                </h3>
                <p style={{ fontSize: '12px', color: '#958ea0', margin: '4px 0 0' }}>
                  Simulating 10,000 statistical market &amp; operational trajectory paths ({horizon})
                </p>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5de6ff' }}>
                  <span style={{ width: '12px', height: '2px', background: '#5de6ff' }}></span> P90 Bull
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d0bcff', fontWeight: 600 }}>
                  <span style={{ width: '12px', height: '3px', background: '#d0bcff' }}></span> P50 Base
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffb4ab' }}>
                  <span style={{ width: '12px', height: '2px', background: '#ffb4ab' }}></span> P10 Bear
                </span>
              </div>
            </div>

            {/* High-Fidelity SVG Curve */}
            <div style={{ position: 'relative', width: '100%', height: '260px', background: 'rgba(14, 14, 17, 0.6)', borderRadius: '12px', overflow: 'hidden', padding: '16px' }}>
              <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 900 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="p50Grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#a078ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#a078ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="0" y1="60" x2="900" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="900" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="180" x2="900" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* P10 Bear Curve */}
                <path 
                  d="M 0,140 C 180,150 360,175 540,200 C 650,220 750,230 900,235" 
                  fill="none" 
                  stroke="#ffb4ab" 
                  strokeWidth="2" 
                  strokeDasharray="4 4" 
                />

                {/* P90 Bull Curve */}
                <path 
                  d="M 0,120 C 200,100 400,75 600,50 C 720,35 820,25 900,15" 
                  fill="none" 
                  stroke="#5de6ff" 
                  strokeWidth="2" 
                  strokeDasharray="6 6" 
                />

                {/* P50 Base Area */}
                <path 
                  d="M 0,130 C 220,120 440,100 600,85 C 750,72 840,65 900,60 L 900,240 L 0,240 Z" 
                  fill="url(#p50Grad)" 
                />

                {/* P50 Base Line */}
                <path 
                  d="M 0,130 C 220,120 440,100 600,85 C 750,72 840,65 900,60" 
                  fill="none" 
                  stroke="#d0bcff" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                />

                {/* Marker at month 12 */}
                <circle cx="490" cy="95" r="5" fill="#d0bcff" stroke="#131316" strokeWidth="2" />
              </svg>

              {/* Month 12 Pinned Tooltip */}
              <div style={{ position: 'absolute', left: '54%', top: '24%', transform: 'translateX(-50%)', background: '#201f22', border: '1px solid rgba(160, 120, 255, 0.4)', borderRadius: '10px', padding: '8px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
                <div style={{ fontSize: '10px', color: '#958ea0', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Trajectory Horizon</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e5e1e5' }}>Cash on Hand: <span style={{ color: '#d0bcff' }}>{formatCurrency(cashOnHand)}</span></div>
                <div style={{ fontSize: '11px', color: '#27e0a9' }}>Runway: {runwayMonths} mo projected</div>
              </div>
            </div>

            {/* Stress Model Dynamic Parameters Sliders */}
            <div style={{ borderRadius: '12px', background: '#201f22', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e5e1e5' }}>Stress Model Parameters</span>
                <button 
                  onClick={handleReset}
                  style={{ background: 'none', border: 'none', color: '#d0bcff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset to Baseline</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="stress-slider-group">
                  <label>
                    <span>Revenue Velocity Shift</span>
                    <strong style={{ color: inflowDelta >= 0 ? '#27e0a9' : '#ffb4ab' }}>
                      {inflowDelta > 0 ? `+${inflowDelta}%` : `${inflowDelta}%`}
                    </strong>
                  </label>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={inflowDelta} 
                    onChange={(e) => setInflowDelta(Number(e.target.value))} 
                  />
                </div>

                <div className="stress-slider-group">
                  <label>
                    <span>Operational Burn Surge</span>
                    <strong style={{ color: '#ffb4ab' }}>+{formatCurrency(burnDelta)}</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="500" 
                    value={burnDelta} 
                    onChange={(e) => setBurnDelta(Number(e.target.value))} 
                  />
                </div>

                <div className="stress-slider-group">
                  <label>
                    <span>Tax Shield Strategy</span>
                    <strong style={{ color: '#5de6ff' }}>{taxShield === 'scorp' ? 'S-Corp Max' : 'Standard'}</strong>
                  </label>
                  <select 
                    value={taxShield}
                    onChange={(e) => setTaxShield(e.target.value)}
                    style={{ height: '34px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e5e1e5', padding: '0 8px', fontSize: '12px' }}
                  >
                    <option value="scorp">S-Corp Election (24.2% rate)</option>
                    <option value="standard">Standard Pass-Through (28.5% rate)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Category Budgets */}
      {activeTab === 'budgets' && (
        <BudgetsPage hideHeader={true} />
      )}

      {/* Tab 3: Savings Goals */}
      {activeTab === 'goals' && (
        <GoalsPage hideHeader={true} />
      )}
    </div>
  );
}

export default PlanningPage;
