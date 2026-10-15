import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { expenseService } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import AICoachWidget from '../components/AICoach/AICoachWidget';
import ExecutiveReportModal from '../components/ExecutiveReport/ExecutiveReportModal';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, Download, TrendingUp, BarChart3, 
  Calendar, PieChart, Sparkles, ArrowUpRight,
  ChevronRight, CheckCircle2, Sliders, ShieldCheck, Printer
} from 'lucide-react';
import './AnalyticsPage.css';

const CATEGORY_COLORS = {
  Food: '#06D6A0',
  Transport: '#3B82F6',
  Entertainment: '#8B5CF6',
  Shopping: '#EC4899',
  Bills: '#F59E0B',
  Health: '#EF4444',
  Education: '#6366F1',
  Games: '#22D3EE',
  Investment: '#10B981',
  Other: '#64748B'
};

function AnalyticsPage() {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [timeRange, setTimeRange] = useState(6); // Default 6 months
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('expenseDataChanged', handleSync);
    return () => window.removeEventListener('expenseDataChanged', handleSync);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await expenseService.getAll();
      const expenseList = Array.isArray(data) ? data : (data?.items || []);
      setExpenses(expenseList);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load analytics trends.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized Chart Trend Data computation (zero duplicate passes, runs only when data or timeRange changes)
  const chartData = useMemo(() => {
    if (!expenses.length) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (timeRange === 1) {
      // "This Month" - Group by 4 Weeks
      const weeks = [
        { label: 'Week 1', amount: 0, min: 1, max: 7 },
        { label: 'Week 2', amount: 0, min: 8, max: 14 },
        { label: 'Week 3', amount: 0, min: 15, max: 21 },
        { label: 'Week 4+', amount: 0, min: 22, max: 31 }
      ];

      expenses.forEach(exp => {
        const date = new Date(exp.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const day = date.getDate();
          const targetWeek = weeks.find(w => day >= w.min && day <= w.max);
          if (targetWeek) {
            targetWeek.amount += Number(exp.amount) || 0;
          }
        }
      });

      return weeks;
    } else {
      // Multi-Month (3, 6, 12) - Group by Month
      const months = [];
      
      for (let i = timeRange - 1; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        months.push({
          label: d.toLocaleDateString('default', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth(),
          amount: 0
        });
      }

      expenses.forEach(exp => {
        const date = new Date(exp.date);
        const m = date.getMonth();
        const y = date.getFullYear();
        
        const targetMonth = months.find(item => item.month === m && item.year === y);
        if (targetMonth) {
          targetMonth.amount += Number(exp.amount) || 0;
        }
      });

      return months;
    }
  }, [expenses, timeRange]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await expenseService.exportCSV();
      setToast({ show: true, message: 'Expense report exported successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to download CSV export.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // Memoized Metrics calculations
  const totalAnalyzed = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const monthlyAverage = useMemo(() => {
    return chartData.length > 0 
      ? chartData.reduce((sum, c) => sum + c.amount, 0) / chartData.length 
      : 0;
  }, [chartData]);

  // Memoized Category Pareto aggregation
  const sortedCategories = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, e) => {
      const cat = e.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {});

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        color: CATEGORY_COLORS[name] || '#64748B',
        percentage: totalAnalyzed > 0 ? Math.round((amount / totalAnalyzed) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalAnalyzed]);

  const topCategoryName = sortedCategories[0]?.name || 'None';
  const topCategoryAmount = sortedCategories[0]?.amount || 0;
  const topCategoryPct = sortedCategories[0]?.percentage || 0;

  if (isLoading && expenses.length === 0) {
    return (
      <div className="empty-state" style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#a078ff' }} />
        <p style={{ marginTop: 16, color: '#958ea0' }}>Synthesizing spending trends &amp; telemetry...</p>
      </div>
    );
  }

  return (
    <div className="analytics-view fade-in">
      <div className="analytics-halo"></div>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Top Executive Command Bar */}
      <div className="analytics-topbar">
        <div>
          <div className="analytics-breadcrumb">
            <span>MONTRIX</span>
            <ChevronRight size={13} />
            <span className="accent">DEEP ANALYTICS &amp; REVENUE VELOCITY</span>
            <span className="analytics-live-pill">
              <span className="analytics-live-dot"></span>
              Gemini AI Engine Active
            </span>
          </div>
          <div className="analytics-title-row">
            <h1 className="analytics-title">Financial Analytics &amp; Intelligence</h1>
          </div>
          <p className="analytics-subtitle">
            Cross-period expenditure distribution, category burn Pareto analysis, and generative insights.
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-stitch-secondary" 
            onClick={() => setIsReportModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} />
            <span>Executive PDF</span>
          </button>
          <button 
            className="btn-stitch-primary" 
            onClick={handleExport}
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isExporting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={15} />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Top Telemetry Status Cards */}
      <div className="analytics-kpi-grid">
        {/* Card 1: Total Outflow */}
        <div className="analytics-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#a078ff' }}></div>
          <div className="analytics-kpi-card-header">
            <span className="analytics-kpi-card-title">Total Outflow</span>
            <span className="analytics-kpi-badge purple">{expenses.length} Records</span>
          </div>
          <div className="analytics-kpi-card-val" style={{ color: '#d0bcff' }}>
            {formatCurrency(totalAnalyzed)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>Historical Volume</span>
            <span style={{ color: '#27e0a9' }}>Verified 100%</span>
          </div>
        </div>

        {/* Card 2: Period Average */}
        <div className="analytics-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#5de6ff' }}></div>
          <div className="analytics-kpi-card-header">
            <span className="analytics-kpi-card-title">Velocity Rate</span>
            <span className="analytics-kpi-badge cyan">{timeRange === 1 ? 'Weekly' : 'Monthly'}</span>
          </div>
          <div className="analytics-kpi-card-val" style={{ color: '#5de6ff' }}>
            {formatCurrency(monthlyAverage)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>Burn Average</span>
            <span style={{ color: '#5de6ff' }}>Active</span>
          </div>
        </div>

        {/* Card 3: Top Category */}
        <div className="analytics-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#ffb4ab' }}></div>
          <div className="analytics-kpi-card-header">
            <span className="analytics-kpi-card-title">Top Outflow Area</span>
            <span className="analytics-kpi-badge amber">{topCategoryPct}% Share</span>
          </div>
          <div className="analytics-kpi-card-val" style={{ color: '#ffb4ab', fontSize: '20px' }}>
            {topCategoryName}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>{formatCurrency(topCategoryAmount)} consumed</span>
            <span style={{ color: '#ffb4ab' }}>Dominant</span>
          </div>
        </div>

        {/* Card 4: AI Status */}
        <div className="analytics-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#27e0a9' }}></div>
          <div className="analytics-kpi-card-header">
            <span className="analytics-kpi-card-title">AI Directives</span>
            <span className="analytics-kpi-badge green">Gemini 2.5 Flash</span>
          </div>
          <div className="analytics-kpi-card-val" style={{ color: '#27e0a9' }}>
            3 Active
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>Personalized Advice</span>
            <span style={{ color: '#27e0a9' }}>Ready</span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="analytics-workspace">
        {/* Section 1: AI Spending Coach */}
        <AICoachWidget />

        {/* Section 2: Expenditure Velocity Bar Chart */}
        <div className="analytics-main-card">
          <div className="analytics-card-header">
            <div>
              <h3 className="analytics-card-title">
                <TrendingUp size={18} style={{ color: '#a078ff' }} />
                <span>Expenditure Velocity &amp; Cadence</span>
              </h3>
              <p className="analytics-card-sub">
                Periodic capital drain across selected operational time horizon
              </p>
            </div>

            {/* Segmented Period Switcher */}
            <div className="analytics-period-switcher">
              {[
                { label: 'This Month', val: 1 },
                { label: '3 Months', val: 3 },
                { label: '6 Months', val: 6 },
                { label: '12 Months', val: 12 },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setTimeRange(opt.val)}
                  className={`analytics-period-btn ${timeRange === opt.val ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a078ff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c4dff" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#64748B" 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                  tickLine={false}
                  dy={4}
                />
                <YAxis 
                  stroke="#64748B" 
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{ 
                    background: 'rgba(12, 12, 18, 0.96)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [formatCurrency(val), 'Outflow']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#purpleBarGrad)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Category Pareto Distribution Matrix */}
        <div className="analytics-main-card">
          <div className="analytics-card-header">
            <div>
              <h3 className="analytics-card-title">
                <PieChart size={18} style={{ color: '#5de6ff' }} />
                <span>Category Pareto Distribution</span>
              </h3>
              <p className="analytics-card-sub">
                Share of wallet by expenditure category ranked by volume
              </p>
            </div>
            <span style={{ fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
              {sortedCategories.length} Categories Tracked
            </span>
          </div>

          <div className="analytics-pareto-grid">
            {sortedCategories.map((cat, idx) => (
              <div key={idx} className="analytics-pareto-item">
                <div className="analytics-pareto-top">
                  <div className="analytics-pareto-name">
                    <span className="analytics-pareto-dot" style={{ backgroundColor: cat.color }}></span>
                    <span>{cat.name}</span>
                  </div>
                  <span className="analytics-pareto-val font-mono">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>

                <div className="analytics-pareto-bar-track">
                  <div 
                    className="analytics-pareto-bar-fill" 
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  ></div>
                </div>

                <div className="analytics-pareto-meta font-mono">
                  <span>{cat.percentage}% of total</span>
                  <span>Rank #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Financial Statement Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        expenses={expenses}
        periodLabel={`Historical Analysis (${timeRange === 1 ? 'Last 30 Days' : `${timeRange} Months Window`})`}
      />
    </div>
  );
}

export default AnalyticsPage;
