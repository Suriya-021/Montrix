import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, ArrowUpRight, Check, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import './Charts.css';

/**
 * Custom Tooltip matching the inspection card in the reference design
 */
const ReferenceTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    const inflow = Number(payload.find(p => p.dataKey === 'income')?.value || 0);
    const outflow = Number(payload.find(p => p.dataKey === 'expenses')?.value || 0);
    const net = inflow - outflow;

    const formattedInflow = formatCurrency ? formatCurrency(inflow) : `$${inflow.toLocaleString()}`;
    const formattedOutflow = formatCurrency ? formatCurrency(outflow) : `$${outflow.toLocaleString()}`;
    const formattedNet = formatCurrency ? formatCurrency(Math.abs(net)) : `$${Math.abs(net).toLocaleString()}`;

    return (
      <div className="ref-chart-tooltip">
        <div className="ref-chart-tooltip__header">
          <span>📅 {label || 'Cycle'}</span>
          <span className="ref-chart-tooltip__badge">
            {net >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>
        <div className="ref-chart-tooltip__rows">
          <div className="ref-tooltip-row">
            <span className="ref-tooltip-label">Inflow:</span>
            <span className="ref-tooltip-val green font-mono">+{formattedInflow}</span>
          </div>
          <div className="ref-tooltip-row">
            <span className="ref-tooltip-label">Outflow:</span>
            <span className="ref-tooltip-val red font-mono">-{formattedOutflow}</span>
          </div>
          <div className="ref-tooltip-row total">
            <span className="ref-tooltip-label">Net Differential:</span>
            <span className="ref-tooltip-val cyan font-mono">
              {net >= 0 ? `+${formattedNet}` : `-${formattedNet}`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Generate blank 6-month array if backend returns empty
const generateEmptyMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      income: 0,
      expenses: 0
    });
  }
  return months;
};

const CashFlowChart = ({ data = [] }) => {
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState('6M');

  const chartData = (Array.isArray(data) && data.length > 0) 
    ? data 
    : generateEmptyMonths();

  // Calculate real net surge over the displayed dataset
  const totalInflow = chartData.reduce((sum, d) => sum + Number(d.income || 0), 0);
  const totalOutflow = chartData.reduce((sum, d) => sum + Number(d.expenses || 0), 0);
  const netSurge = totalInflow - totalOutflow;

  const maxVal = Math.max(...chartData.map(d => Math.max(Number(d.income || 0), Number(d.expenses || 0))));

  return (
    <div className="chart-card-ref">
      {/* Header */}
      <div className="chart-card-ref__header">
        <div>
          <div className="chart-title-group">
            <h3 className="chart-title-text">Cash Flow Velocity</h3>
            <Activity size={18} className="chart-activity-icon" />
          </div>
          <p className="chart-subtitle-text">Smoothed Inflow vs Outflow comparative telemetry</p>
        </div>

        {/* Period Pills */}
        <div className="period-pill-group">
          {['1M', '3M', '6M', 'YTD'].map(p => (
            <button 
              key={p} 
              className={`period-pill-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Net Surge Sub-bar */}
      <div className="chart-subbar">
        <div className="chart-legend-pills">
          <div className="chart-legend-entry">
            <span className="legend-box cyan"></span>
            <span>Inflow (Deposits &amp; Earnings)</span>
          </div>
          <div className="chart-legend-entry">
            <span className="legend-box purple"></span>
            <span>Outflow (Operational Spend)</span>
          </div>
        </div>
        <div className="chart-net-surge">
          <TrendingUp size={14} />
          <span>
            Net Surge: {netSurge >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netSurge))}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: 230 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9D74FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#9D74FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 11 }}
              dy={6}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
              domain={[0, maxVal > 0 ? 'auto' : 1000]}
            />
            <Tooltip content={<ReferenceTooltip formatCurrency={formatCurrency} />} />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#22D3EE" 
              strokeWidth={2.2}
              fill="url(#cyanArea)" 
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#9D74FF" 
              strokeWidth={2.2}
              fill="url(#purpleArea)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Status */}
      <div className="chart-card-ref__footer">
        <div className="status-momentum">
          {netSurge >= 0 ? (
            <>
              <Check size={14} className="check-icon-green" />
              <span>Positive net cashflow momentum across recorded cycles</span>
            </>
          ) : (
            <>
              <AlertTriangle size={14} style={{ color: '#FB7185' }} />
              <span style={{ color: '#FB7185' }}>Outflow exceeds inflow across recent cycles</span>
            </>
          )}
        </div>
        <Link to="/analytics" className="variance-report-link">
          <span>Detailed Analytics Report</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default React.memo(CashFlowChart);
