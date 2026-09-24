import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { expenseService } from '../services/expenseService';
import { Loader2, AlertCircle } from 'lucide-react';

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
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await expenseService.getAll();
      // Sort newest first
      setExpenses(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Calculate Summary Stats
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthSpent = expenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const transactionCount = expenses.length;

  // 2. Prepare Chart Data (Group by Category)
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  // Convert the grouped object into an array for Recharts
  const chartData = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  })).sort((a, b) => b.value - a.value); // Sort biggest slices first

  // 3. Get Recent Transactions (Top 5)
  const recentTransactions = expenses.slice(0, 5);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
        <div className="stat-card">
          <div className="stat-card__label">Total Spent</div>
          <div className="stat-card__value">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">This Month</div>
          <div className="stat-card__value">{formatCurrency(thisMonthSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Transactions</div>
          <div className="stat-card__value">{transactionCount}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Donut Chart */}
        <div className="glass-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Category Breakdown</h2>
          {expenses.length > 0 ? (
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

        {/* Right Side: Recent Transactions */}
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
  );
}

export default Dashboard;
