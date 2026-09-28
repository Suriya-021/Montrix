import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { expenseService } from '../services/expenseService';
import { subscriptionService } from '../services/subscriptionService';
import { goalService } from '../services/goalService';
import { useCurrency } from '../context/CurrencyContext';
import { Loader2, AlertCircle, Calendar, Trophy } from 'lucide-react';

// Map categories to our specific design system colors
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

/**
 * Dashboard Component
 * Shows summary statistics, a category breakdown chart, and recent transactions.
 */
function Dashboard() {
  const { formatCurrency, isLoading: currencyLoading } = useCurrency();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats, all expenses, subscriptions, goals, and income simultaneously
      const [statsData, allExpenses, subsData, goalsData, incomeData] = await Promise.all([
        expenseService.getStats(),
        expenseService.getAll(),
        subscriptionService.getAll().catch(() => []), 
        goalService.getAll().catch(() => []),
        import('../services/incomeService').then(m => m.incomeService.getAll()).catch(() => [])
      ]);
      
      setStats(statsData);
      
      const totalInc = incomeData.reduce((sum, item) => sum + item.amount, 0);
      setTotalIncome(totalInc);
      setNetBalance(totalInc - (statsData?.total_spent || 0));
      
      // Sort newest first and get top 5
      const sorted = allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentTransactions(sorted.slice(0, 5));
      
      // Get top 2 active goals
      const active = goalsData
        .filter(g => g.current_amount < g.target_amount) // only not completed
        .slice(0, 2);
      setActiveGoals(active);
      
      // Calculate upcoming bills
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = subsData
        .map(sub => {
          const due = new Date(sub.next_due_date);
          due.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          return { ...sub, diffDays };
        })
        .filter(sub => sub.diffDays >= 0) // Only upcoming or due today
        .sort((a, b) => a.diffDays - b.diffDays)
        .slice(0, 3); // top 3 closest bills
        
      setUpcomingBills(upcoming);
      
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert the grouped object into an array for Recharts if stats is loaded
  const chartData = stats ? stats.category_breakdown.sort((a, b) => b.value - a.value) : [];

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Custom tooltip for the Pie Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-elevated)', padding: '10px', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{payload[0].name}</p>
          <p style={{ margin: 0, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <AlertCircle className="empty-state__icon" style={{ color: 'var(--error)' }} />
        <p>{error}</p>
        <button className="btn btn--primary" onClick={loadDashboardData} style={{ marginTop: '1rem' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Top Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="stat-card__label">Total Income</div>
          <div className="stat-card__value" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(totalIncome)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--error)' }}>
          <div className="stat-card__label">Total Expenses</div>
          <div className="stat-card__value">{formatCurrency(stats?.total_spent || 0)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: `4px solid ${netBalance >= 0 ? 'var(--accent-primary)' : 'var(--error)'}` }}>
          <div className="stat-card__label">Net Balance</div>
          <div className="stat-card__value" style={{ color: netBalance >= 0 ? 'var(--text-primary)' : 'var(--error)' }}>
            {formatCurrency(netBalance)}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Donut Chart */}
        <div className="glass-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Category Breakdown</h2>
          {chartData.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <p>No data to chart yet.</p>
            </div>
          )}
        </div>

        {/* Right Side: Widgets Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
          {/* Upcoming Bills Widget */}
          <div className="glass-card">
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                Upcoming Bills
              </h2>
            </div>
            
            {upcomingBills.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {upcomingBills.map(bill => (
                  <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{bill.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: bill.diffDays === 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                        {bill.diffDays === 0 ? 'Due Today!' : `Due in ${bill.diffDays} day${bill.diffDays !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(bill.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No upcoming bills found.</p>
              </div>
            )}
          </div>

          {/* Active Goals Widget */}
          <div className="glass-card">
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} style={{ color: 'var(--accent-primary)' }} />
                Active Goals
              </h2>
            </div>
            
            {activeGoals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeGoals.map(goal => {
                  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  return (
                    <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{goal.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{percentage.toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent-primary)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No active goals right now.</p>
              </div>
            )}
          </div>

          {/* Recent Transactions Widget */}
          <div className="glass-card">
            <div className="section-header">
              <h2 className="section-title">Recent Transactions</h2>
            </div>
            
            {recentTransactions.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((expense) => (
                      <tr key={expense.id}>
                        <td className="date">{formatDate(expense.date)}</td>
                        <td>
                          <span className={`badge badge--${expense.category.toLowerCase()}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="amount">{formatCurrency(expense.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <p>No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
