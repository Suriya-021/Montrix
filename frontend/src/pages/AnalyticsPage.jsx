import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { expenseService } from '../services/expenseService';
import { useCurrency } from '../context/CurrencyContext';
import AICoachWidget from '../components/AICoach/AICoachWidget';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, 
  Download, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  PieChart, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

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
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState(6); // Default 6 months
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('expenseDataChanged', handleSync);
    return () => window.removeEventListener('expenseDataChanged', handleSync);
  }, []);

  // Re-process chart when data or timeRange changes
  useEffect(() => {
    if (expenses.length > 0) {
      processTrendData(expenses, timeRange);
    }
  }, [timeRange, expenses]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await expenseService.getAll();
      const expenseList = Array.isArray(data) ? data : [];
      setExpenses(expenseList);
      processTrendData(expenseList, timeRange);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load analytics trends.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const processTrendData = (allExpenses, monthsCount) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (monthsCount === 1) {
      // Logic for "This Month" - Group by 4 Weeks
      const weeks = [
        { label: 'Week 1', amount: 0, min: 1, max: 7 },
        { label: 'Week 2', amount: 0, min: 8, max: 14 },
        { label: 'Week 3', amount: 0, min: 15, max: 21 },
        { label: 'Week 4+', amount: 0, min: 22, max: 31 }
      ];

      allExpenses.forEach(exp => {
        const date = new Date(exp.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const day = date.getDate();
          const targetWeek = weeks.find(w => day >= w.min && day <= w.max);
          if (targetWeek) {
            targetWeek.amount += Number(exp.amount) || 0;
          }
        }
      });

      setChartData(weeks);
    } else {
      // Logic for Multi-Month (3, 6, 12) - Group by Month
      const months = [];
      
      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        months.push({
          label: d.toLocaleDateString('default', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth(),
          amount: 0
        });
      }

      allExpenses.forEach(exp => {
        const date = new Date(exp.date);
        const m = date.getMonth();
        const y = date.getFullYear();
        
        const targetMonth = months.find(item => item.month === m && item.year === y);
        if (targetMonth) {
          targetMonth.amount += Number(exp.amount) || 0;
        }
      });

      setChartData(months);
    }
  };

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

  // Metrics calculation
  const totalAnalyzed = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthlyAverage = chartData.length > 0 
    ? chartData.reduce((sum, c) => sum + c.amount, 0) / chartData.length 
    : 0;

  // Find top category
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (Number(e.amount) || 0);
    return acc;
  }, {});
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'None';
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

  if (isLoading && expenses.length === 0) {
    return (
      <div className="empty-state" style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Synthesizing spending trends...</p>
      </div>
    );
  }

  return (
    <div>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Advanced Analytics</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>
            In-depth expenditure velocity, period trends, and AI recommendations.
          </p>
        </div>

        <button 
          className="btn btn--primary" 
          onClick={handleExport}
          disabled={isExporting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.65rem 1.25rem' }}
        >
          {isExporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export CSV Report
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
              <BarChart3 size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Outflow
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatCurrency(totalAnalyzed)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            Across {expenses.length} tracked records
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #22D3EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22D3EE' }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Period Average
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#22D3EE' }}>
            {formatCurrency(monthlyAverage)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            {timeRange === 1 ? 'Per week' : 'Per month'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #EC4899' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
              <PieChart size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Top Outflow Area
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {topCategoryName}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            {formatCurrency(topCategoryAmount)} consumed
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* AI Spending Coach */}
        <AICoachWidget />
        
        {/* Trend Bar Chart */}
        <div className="glass-card" style={{ padding: 'var(--card-padding)', width: '100%', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Spending Distribution</h2>
            </div>
            
            {/* Segmented Period Selector */}
            <div style={{ 
              display: 'inline-flex', 
              padding: '3px', 
              background: 'rgba(0, 0, 0, 0.4)', 
              border: '1px solid rgba(255, 255, 255, 0.06)', 
              borderRadius: '8px',
              gap: '2px'
            }}>
              {[
                { label: 'This Month', val: 1 },
                { label: '3 Months', val: 3 },
                { label: '6 Months', val: 6 },
                { label: '12 Months', val: 12 },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setTimeRange(opt.val)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeRange === opt.val ? 'var(--accent-primary)' : 'transparent',
                    color: timeRange === opt.val ? '#FFFFFF' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ height: '360px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  contentStyle={{ 
                    background: 'rgba(12, 12, 20, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    padding: '10px 14px'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="var(--accent-primary)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={36}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
