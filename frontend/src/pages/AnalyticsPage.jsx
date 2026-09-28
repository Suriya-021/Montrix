import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { expenseService } from '../services/expenseService';
import AICoachWidget from '../components/AICoach/AICoachWidget';
import HeatmapWidget from '../components/Heatmap/HeatmapWidget';
import { Loader2, AlertCircle, Download, TrendingUp } from 'lucide-react';

function AnalyticsPage() {
  const [expenses, setExpenses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState(6); // Default 6 months
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
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
      setError(null);
      const data = await expenseService.getAll();
      setExpenses(data);
      processTrendData(data, timeRange);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
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
        { label: 'Week 1 (1-7)', amount: 0, min: 1, max: 7 },
        { label: 'Week 2 (8-14)', amount: 0, min: 8, max: 14 },
        { label: 'Week 3 (15-21)', amount: 0, min: 15, max: 21 },
        { label: 'Week 4 (22+)', amount: 0, min: 22, max: 31 }
      ];

      allExpenses.forEach(exp => {
        const date = new Date(exp.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const day = date.getDate();
          const targetWeek = weeks.find(w => day >= w.min && day <= w.max);
          if (targetWeek) {
            targetWeek.amount += exp.amount;
          }
        }
      });

      setChartData(weeks);
    } else {
      // Logic for Multi-Month (3, 6, 12) - Group by Month
      const months = [];
      
      // Generate the last X months
      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        months.push({
          label: d.toLocaleDateString('en-IN', { month: 'short', year: monthsCount > 6 ? '2-digit' : undefined }),
          year: d.getFullYear(),
          month: d.getMonth(),
          amount: 0
        });
      }

      // Sum expenses by month
      allExpenses.forEach(exp => {
        const date = new Date(exp.date);
        const m = date.getMonth();
        const y = date.getFullYear();
        
        const targetMonth = months.find(item => item.month === m && item.year === y);
        if (targetMonth) {
          targetMonth.amount += exp.amount;
        }
      });

      setChartData(months);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await expenseService.exportCSV();
    } catch (err) {
      alert('Failed to download CSV export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading your analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Advanced Analytics</h1>
        <button 
          className="btn btn--primary" 
          onClick={handleExport}
          disabled={isExporting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isExporting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
          Export CSV
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', width: '100%' }}>
        <AICoachWidget />
        
        <div className="glass-card" style={{ width: '100%', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
              Spending Trend
            </h2>
            
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '0.4rem 1rem' }}
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
            >
              <option value={1}>This Month</option>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Yearly</option>
            </select>
          </div>
          
          <div style={{ height: '400px', width: '100%', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)' }} 
                  axisLine={{ stroke: 'var(--glass-border)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)' }}
                  tickFormatter={(value) => `₹${value}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    background: 'var(--bg-elevated)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Total Spent']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="var(--accent-primary)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <HeatmapWidget />
      </div>
    </div>
  );
}

export default AnalyticsPage;
