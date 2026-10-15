import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, FileText, Terminal, Bell, Clock, Loader2 
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { subscriptionService } from '../services/subscriptionService';
import { goalService } from '../services/goalService';
import { budgetService } from '../services/budgetService';
import { useCurrency } from '../context/CurrencyContext';

// Reference Components
import StatCard from '../components/Cards/StatCard';
import CashFlowChart from '../components/Charts/CashFlowChart';
import CategoryDonut from '../components/Charts/CategoryDonut';
import TransactionsWidget from '../components/Widgets/TransactionsWidget';
import UpcomingBillsWidget from '../components/Widgets/UpcomingBillsWidget';
import SavingsGoalsWidget from '../components/Widgets/SavingsGoalsWidget';
import AddExpenseModal from '../components/AddExpenseModal/AddExpenseModal';
import ImportExpensesModal from '../components/ImportExpensesModal/ImportExpensesModal';
import Toast from '../components/Toast/Toast';

import './Dashboard.css';

function LiveUtcClock() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' };
      const datePart = now.toLocaleDateString('en-US', options);
      const timePart = now.toISOString().slice(11, 19);
      setTimestamp(`As of ${datePart} • ${timePart} UTC`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="status-time-text">
      <Clock size={13} />
      {timestamp}
    </span>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { currency, formatCurrency } = useCurrency();
  
  // Real telemetry state
  const [stats, setStats] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // User Profile
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.full_name || user.username || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    loadDashboardData();
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('expenseDataChanged', handleRefresh);
    return () => window.removeEventListener('expenseDataChanged', handleRefresh);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, expensesData, incomeData, billsData, goalsData, cfData, bStatus] = await Promise.all([
        expenseService.getStats().catch(() => null),
        expenseService.getAll({ pageSize: 10 }).catch(() => []),
        incomeService.getAll().catch(() => []),
        subscriptionService.getAll().catch(() => []),
        goalService.getAll().catch(() => []),
        expenseService.getCashFlow().catch(() => []),
        budgetService.getStatus().catch(() => null)
      ]);

      setStats(statsData);
      setBudgetStatus(bStatus);
      
      const expItems = Array.isArray(expensesData) 
        ? expensesData 
        : (expensesData?.items || []);
      setRecentTransactions(expItems);

      const incomeArr = Array.isArray(incomeData) ? incomeData : [];
      setIncomeList(incomeArr);

      const billsArr = Array.isArray(billsData) ? billsData : [];
      setUpcomingBills(billsArr);

      const goalsArr = Array.isArray(goalsData) ? goalsData : [];
      setActiveGoals(goalsArr);

      setCashFlowData(Array.isArray(cfData) ? cfData : []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      await expenseService.create(expenseData);
      setToast({ show: true, message: 'Expense logged successfully!', type: 'success' });
      setIsAddExpenseOpen(false);
      loadDashboardData();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to save expense', type: 'error' });
    }
  };

  const handleImportSuccess = (result) => {
    setToast({
      show: true,
      message: `Successfully imported ${result.imported_count} transactions!`,
      type: 'success'
    });
    loadDashboardData();
  };

  // 100% Real Calculations based on actual user data (memoized to eliminate re-computation on modal/toast state updates)
  const {
    totalIncome,
    thisMonthIncome,
    totalSpent,
    thisMonthSpent,
    netBalance,
    netSavings,
    savingsRate,
    totalGoalsSaved,
    totalGoalsTarget,
    goalsFundedPct,
    totalBudget,
    budgetUsedPct,
    budgetRemaining,
    balanceSparkline,
    latestIncome
  } = useMemo(() => {
    const tIncome = incomeList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const tmIncome = incomeList
      .filter(i => i.date && String(i.date).startsWith(currentMonthKey))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const tSpent = Number(stats?.total_spent || 0);
    const tmSpent = Number(stats?.this_month_spent || stats?.month_spent || 0);

    const nBalance = tIncome - tSpent;
    const nSavings = Math.max(0, nBalance);
    const sRate = tIncome > 0 
      ? Math.max(0, Math.round(((tIncome - tSpent) / tIncome) * 100)) 
      : 0;

    const tgSaved = activeGoals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
    const tgTarget = activeGoals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
    const gFundedPct = tgTarget > 0 
      ? Math.min(100, Math.round((tgSaved / tgTarget) * 100)) 
      : 0;

    const tBudget = Number(budgetStatus?.total_budget || stats?.total_budget || 0);
    const bUsedPct = Number(budgetStatus?.percentage_used || stats?.budget_used_percentage || 0);
    const bRemaining = Math.max(0, tBudget - tmSpent);

    const bSparkline = (Array.isArray(cashFlowData) && cashFlowData.length > 0)
      ? cashFlowData.map(d => ({
          value: Math.max(0, Number(d.income || 0) - Number(d.expenses || 0) + 10)
        }))
      : [];

    const lIncome = incomeList.length > 0 
      ? incomeList[incomeList.length - 1] 
      : null;

    return {
      totalIncome: tIncome,
      thisMonthIncome: tmIncome,
      totalSpent: tSpent,
      thisMonthSpent: tmSpent,
      netBalance: nBalance,
      netSavings: nSavings,
      savingsRate: sRate,
      totalGoalsSaved: tgSaved,
      totalGoalsTarget: tgTarget,
      goalsFundedPct: gFundedPct,
      totalBudget: tBudget,
      budgetUsedPct: bUsedPct,
      budgetRemaining: bRemaining,
      balanceSparkline: bSparkline,
      latestIncome: lIncome
    };
  }, [incomeList, stats, budgetStatus, activeGoals, cashFlowData]);

  return (
    <div className="dashboard-ref-container">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* TOP HEADER MASTER CONTROL BAR */}
      <header className="dashboard-ref-header">
        {/* Left Welcome & Telemetry Meta */}
        <div className="dashboard-header-left">
          <h1 className="dashboard-greeting-title">Welcome back, {userName} 👋</h1>
          <p className="dashboard-greeting-sub">Here is your financial velocity today.</p>
          
          <div className="dashboard-status-row">
            <span className="status-synced-pill">
              <span className="pulse-dot"></span>
              LEDGER REAL-TIME SYNCED
            </span>
            <LiveUtcClock />
            <span className="status-currency-pill font-mono">
              {currency || 'USD'} (Base)
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="dashboard-header-right">
          <button 
            className="btn-header-action"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileText size={15} />
            <span>Import CSV Statement</span>
          </button>

          <button 
            className="btn-header-action"
            onClick={() => navigate('/planning')}
            title="Execute Financial Plan"
          >
            <Terminal size={15} />
            <span>Execute Plan</span>
            <kbd className="key-badge">⌘E</kbd>
          </button>

          <button 
            className="btn-primary-purple"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>

          <button className="btn-bell-icon" title="Notifications">
            <Bell size={16} />
            <span className="bell-ping-dot"></span>
          </button>

          <div 
            className="user-avatar-pill" 
            onClick={() => navigate('/settings')}
            title="Profile Settings"
          >
            {userInitial}
          </div>
        </div>
      </header>

      {/* TOP 4 KPI TELEMETRY CARDS - 100% REAL & EASILY UNDERSTANDABLE */}
      <section className="dashboard-kpi-grid">
        {/* Card 1: NET BALANCE (Cash on Hand) */}
        <StatCard 
          label="NET BALANCE (CASH ON HAND)"
          badgeText={netBalance >= 0 ? "↗ Surplus" : "↘ Deficit"}
          badgeType={netBalance >= 0 ? "positive" : "urgent"}
          value={formatCurrency(netBalance)}
          valueColor={netBalance >= 0 ? "#FFFFFF" : "#F87171"}
          sparklineData={balanceSparkline.length > 0 ? balanceSparkline : null}
          footerLeft={`All-Time Inflow: ${formatCurrency(totalIncome)}`}
          footerRight={`All-Time Outflow: ${formatCurrency(totalSpent)}`}
        />

        {/* Card 2: TOTAL INFLOW (Earnings) */}
        <StatCard 
          label="TOTAL INFLOW (EARNINGS)"
          badgeText={`${incomeList.length} Records`}
          badgeType="cyan"
          value={formatCurrency(totalIncome)}
          middleItem={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE' }}></span>
              <span>This Month Inflow: <strong style={{ color: '#FFFFFF' }} className="font-mono">{formatCurrency(thisMonthIncome)}</strong></span>
            </div>
          }
          footerHighlight={
            latestIncome 
              ? `Latest: ${latestIncome.source} (${formatCurrency(latestIncome.amount)})` 
              : 'No income logged yet'
          }
        />

        {/* Card 3: TOTAL OUTFLOW (Spending) */}
        <StatCard 
          label="TOTAL OUTFLOW (SPENDING)"
          badgeText={`${stats?.category_breakdown?.length || 0} Categories`}
          badgeType="amber"
          value={formatCurrency(totalSpent)}
          middleItem={
            totalBudget > 0 ? (
              <div>
                <span>Budget Capacity: <strong>{budgetUsedPct}% ({formatCurrency(totalBudget)} Cap)</strong></span>
              </div>
            ) : (
              <div>
                <span>This Month Outflow: <strong style={{ color: '#FFFFFF' }} className="font-mono">{formatCurrency(thisMonthSpent)}</strong></span>
              </div>
            )
          }
          footerLeft={totalBudget > 0 ? "Budget Remaining:" : "Current Month Spend:"}
          footerRight={totalBudget > 0 ? `${formatCurrency(budgetRemaining)} unspent` : formatCurrency(thisMonthSpent)}
        />

        {/* Card 4: NET SAVINGS & GOALS */}
        <StatCard 
          label="NET SAVINGS & GOALS"
          badgeText={`${savingsRate}% savings rate`}
          badgeType="positive"
          value={formatCurrency(totalGoalsSaved > 0 ? totalGoalsSaved : netSavings)}
          valueColor="#10B981"
          middleItem={
            activeGoals.length > 0 ? (
              <div>
                <span>{activeGoals.length} Active Financial Goals (<strong style={{ color: '#10B981' }}>{goalsFundedPct}% Funded</strong>)</span>
              </div>
            ) : (
              <div>
                <span>Net Cash Savings: <strong style={{ color: '#10B981' }}>{formatCurrency(netSavings)}</strong></span>
              </div>
            )
          }
          footerLeft={activeGoals.length > 0 ? "Combined Target:" : "Available Capital:"}
          footerRight={activeGoals.length > 0 ? formatCurrency(totalGoalsTarget) : formatCurrency(netSavings)}
        />
      </section>

      {/* BODY 2-COLUMN MAIN GRID */}
      <section className="dashboard-main-grid">
        {/* Left Column: Cash Flow Velocity + Recent Transactions */}
        <div className="dashboard-left-col">
          <CashFlowChart data={cashFlowData} />
          <TransactionsWidget 
            transactions={recentTransactions} 
            formatCurrency={formatCurrency}
            onAddExpense={() => setIsAddExpenseOpen(true)}
          />
        </div>

        {/* Right Column: Category Donut + Scheduled Bills + Target Milestones */}
        <div className="dashboard-right-col">
          <CategoryDonut 
            data={stats?.category_breakdown} 
            totalValue={formatCurrency(thisMonthSpent > 0 ? thisMonthSpent : totalSpent)}
            formatCurrency={formatCurrency}
          />
          <UpcomingBillsWidget 
            bills={upcomingBills} 
            formatCurrency={formatCurrency}
            onBillPaid={loadDashboardData}
          />
          <SavingsGoalsWidget 
            goals={activeGoals} 
            formatCurrency={formatCurrency}
          />
        </div>
      </section>

      {/* MODALS */}
      <AddExpenseModal 
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAdd={handleSaveExpense}
      />

      <ImportExpensesModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default Dashboard;
