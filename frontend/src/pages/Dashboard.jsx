import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { subscriptionService } from '../services/subscriptionService';
import { goalService } from '../services/goalService';
import { budgetService } from '../services/budgetService';
import { useCurrency } from '../context/CurrencyContext';
import { Link } from 'react-router-dom';

// V2 Components
import StatCard from '../components/Cards/StatCard';
import CashFlowChart from '../components/Charts/CashFlowChart';
import CategoryDonut from '../components/Charts/CategoryDonut';
import TransactionsWidget from '../components/Widgets/TransactionsWidget';
import UpcomingBillsWidget from '../components/Widgets/UpcomingBillsWidget';
import SavingsGoalsWidget from '../components/Widgets/SavingsGoalsWidget';
import { Loader2, Wallet, TrendingDown, TrendingUp, PiggyBank, AlertTriangle, ArrowRight } from 'lucide-react';

// Category colors for the donut chart
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

function Dashboard() {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allExpenses, setAllExpenses] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState(null);
  
  useEffect(() => {
    loadDashboardData();
    
    const handleDataChange = () => {
      loadDashboardData();
    };
    
    window.addEventListener('expenseDataChanged', handleDataChange);
    return () => window.removeEventListener('expenseDataChanged', handleDataChange);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, expensesData, incomeData, billsData, goalsData, cfData, bStatusData] = await Promise.all([
        expenseService.getStats().catch(() => null),
        expenseService.getAll().catch(() => []),
        incomeService.getAll().catch(() => []),
        subscriptionService.getAll().catch(() => []),
        goalService.getAll().catch(() => []),
        expenseService.getCashFlow().catch(() => []),
        budgetService.getStatus().catch(() => null)
      ]);
      
      setStats(statsData);
      setAllExpenses(Array.isArray(expensesData) ? expensesData : []);
      setRecentTransactions(Array.isArray(expensesData) ? expensesData.slice(0, 5) : []);
      setCashFlowData(Array.isArray(cfData) ? cfData : []);
      setBudgetStatus(bStatusData);
      
      const incomeArr = Array.isArray(incomeData) ? incomeData : [];
      const incomeSum = incomeArr.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalIncome(incomeSum);

      const billsArr = Array.isArray(billsData) ? billsData : [];
      const activeB = billsArr.sort((a, b) => {
        const dateA = a.next_due_date ? new Date(a.next_due_date) : new Date();
        const dateB = b.next_due_date ? new Date(b.next_due_date) : new Date();
        return dateA - dateB;
      });
      setUpcomingBills(activeB.slice(0, 4));
      
      const goalsArr = Array.isArray(goalsData) ? goalsData : [];
      const activeG = goalsArr.filter(g => (g.current_amount || 0) < (g.target_amount || 1));
      setActiveGoals(activeG.slice(0, 3));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalExpenses = stats?.total_spent || 0;
  const netBalance = totalIncome - totalExpenses;
  const savings = netBalance > 0 ? netBalance : 0;

  const categoryData = (stats && Array.isArray(stats.category_breakdown)) 
    ? stats.category_breakdown.map(item => {
        const total = stats.total_spent || 1;
        return {
          name: item.name || 'Other',
          value: item.value || 0,
          color: CATEGORY_COLORS[item.name] || '#64748B',
          percentage: Math.round(((item.value || 0) / total) * 100)
        };
      }).sort((a, b) => b.value - a.value) 
    : [];

  const generateSparkline = (baseValue) => {
    if (!baseValue || baseValue === 0) {
      return Array.from({ length: 7 }, () => ({ value: 0 }));
    }
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.round(baseValue * (0.7 + Math.random() * 0.6))
    }));
  };

  if (isLoading) {
    return (
      <div className="empty-state" style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#8B5CF6' }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Overview</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>
            Here's what's happening with your finances today.
          </p>
        </div>
      </div>

      {/* Live Budget Alerts Banner */}
      {budgetStatus?.alerts?.length > 0 && (
        <div 
          style={{ 
            marginBottom: 'var(--space-6)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: budgetStatus.alerts.some(a => a.type === 'danger') 
              ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.16), rgba(245, 158, 11, 0.06))'
              : 'linear-gradient(90deg, rgba(245, 158, 11, 0.16), rgba(139, 92, 246, 0.06))',
            border: budgetStatus.alerts.some(a => a.type === 'danger')
              ? '1px solid rgba(239, 68, 68, 0.35)'
              : '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: budgetStatus.alerts.some(a => a.type === 'danger') ? '0 4px 20px rgba(239, 68, 68, 0.15)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              background: budgetStatus.alerts.some(a => a.type === 'danger') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: budgetStatus.alerts.some(a => a.type === 'danger') ? '#EF4444' : '#F59E0B', 
              flexShrink: 0 
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {budgetStatus.alerts.some(a => a.type === 'danger') ? 'Budget Limit Exceeded' : 'Budget Warning'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                {budgetStatus.alerts[0].message}
                {budgetStatus.alerts.length > 1 && ` (+${budgetStatus.alerts.length - 1} other alerts)`}
              </div>
            </div>
          </div>
          <Link 
            to="/budgets" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#22D3EE', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(34, 211, 238, 0.2)'
            }}
          >
            Review Budgets <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="stat-grid">
        <StatCard 
          icon={Wallet}
          label="Balance"
          value={formatCurrency(netBalance)}
          change="+14.50%"
          changeType="positive"
          color="#8B5CF6"
          sparklineData={generateSparkline(netBalance)}
        />
        <StatCard 
          icon={TrendingUp}
          label="Income"
          value={formatCurrency(totalIncome)}
          change="+25.00%"
          changeType="positive"
          color="#22D3EE"
          sparklineData={generateSparkline(totalIncome)}
        />
        <StatCard 
          icon={TrendingDown}
          label="Expense"
          value={formatCurrency(totalExpenses)}
          change="-12.20%"
          changeType="negative"
          color="#EC4899"
          sparklineData={generateSparkline(totalExpenses)}
        />
        <StatCard 
          icon={PiggyBank}
          label="Savings"
          value={formatCurrency(savings)}
          change="+36.70%"
          changeType="positive"
          color="#10B981"
          sparklineData={generateSparkline(savings)}
        />
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-body">
        <div className="dashboard-column-left">
          <CashFlowChart data={cashFlowData} />
          <TransactionsWidget 
            transactions={recentTransactions} 
            formatCurrency={formatCurrency} 
          />
        </div>
        <div className="dashboard-column-right">
          <CategoryDonut 
            data={categoryData} 
            totalLabel="Total expenses per month"
            totalValue={formatCurrency(totalExpenses)}
          />
          <UpcomingBillsWidget 
            bills={upcomingBills} 
            formatCurrency={formatCurrency} 
          />
          <SavingsGoalsWidget 
            goals={activeGoals} 
            formatCurrency={formatCurrency} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
