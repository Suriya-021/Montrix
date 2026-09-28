import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { subscriptionService } from '../services/subscriptionService';
import { goalService } from '../services/goalService';
import { useCurrency } from '../context/CurrencyContext';

// V2 Components
import StatCard from '../components/Cards/StatCard';
import CashFlowChart from '../components/Charts/CashFlowChart';
import CategoryDonut from '../components/Charts/CategoryDonut';
import TransactionsWidget from '../components/Widgets/TransactionsWidget';
import UpcomingBillsWidget from '../components/Widgets/UpcomingBillsWidget';
import SavingsGoalsWidget from '../components/Widgets/SavingsGoalsWidget';
import { Loader2, Wallet, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';

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

/**
 * V2 Dashboard
 * Premium overview page with KPI cards, charts, and widgets.
 */
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
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel — each has its own catch to prevent cascade failures
      const [statsData, expensesData, incomeData, billsData, goalsData, cfData] = await Promise.all([
        expenseService.getStats().catch(() => null),
        expenseService.getAll().catch(() => []),
        incomeService.getAll().catch(() => []),
        subscriptionService.getAll().catch(() => []),
        goalService.getAll().catch(() => []),
        expenseService.getCashFlow().catch(() => [])
      ]);
      
      setStats(statsData);
      setAllExpenses(Array.isArray(expensesData) ? expensesData : []);
      setRecentTransactions(Array.isArray(expensesData) ? expensesData.slice(0, 5) : []);
      setCashFlowData(Array.isArray(cfData) ? cfData : []);
      
      const incomeArr = Array.isArray(incomeData) ? incomeData : [];
      const incomeSum = incomeArr.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalIncome(incomeSum);

      const billsArr = Array.isArray(billsData) ? billsData : [];
      // Subscriptions have next_due_date in DB.
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

  // Calculate derived data
  const totalExpenses = stats?.total_spent || 0;
  const netBalance = totalIncome - totalExpenses;
  const savings = netBalance > 0 ? netBalance : 0;

  // Category breakdown for donut chart
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

  // Generate sparkline data (7 random points around a base value)
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
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-blue)' }} />
        <p style={{ marginTop: 16 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* KPI Cards Row */}
      <div className="stat-grid">
        <StatCard 
          icon={Wallet}
          label="Balance"
          value={formatCurrency(netBalance)}
          change="+14.50%"
          changeType="positive"
          color="#06D6A0"
          sparklineData={generateSparkline(netBalance)}
        />
        <StatCard 
          icon={TrendingUp}
          label="Income"
          value={formatCurrency(totalIncome)}
          change="+25.00%"
          changeType="positive"
          color="#3B82F6"
          sparklineData={generateSparkline(totalIncome)}
        />
        <StatCard 
          icon={TrendingDown}
          label="Expense"
          value={formatCurrency(totalExpenses)}
          change="-12.20%"
          changeType="negative"
          color="#EF4444"
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

      {/* Main Dashboard Layout (Left / Right columns) */}
      <div className="dashboard-body">
        {/* Left Column */}
        <div className="dashboard-column-left">
          <CashFlowChart data={cashFlowData} />
          
          <TransactionsWidget 
            transactions={recentTransactions} 
            formatCurrency={formatCurrency} 
          />
        </div>

        {/* Right Column */}
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
