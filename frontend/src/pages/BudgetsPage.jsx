import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { useCurrency } from '../context/CurrencyContext';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, 
  Target, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Wallet, 
  TrendingDown, 
  PiggyBank 
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 
  'Bills', 'Health', 'Education', 'Games', 'Investment', 'Other'
];

const DEFAULT_CATEGORY_COLORS = {
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

function BudgetsPage({ hideHeader = false }) {
  const { formatCurrency } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [spentByCategory, setSpentByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Dynamic categories state
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [categoryColorMap, setCategoryColorMap] = useState(DEFAULT_CATEGORY_COLORS);
  
  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [budgetStatus, setBudgetStatus] = useState(null);

  useEffect(() => {
    loadData();
    
    const handleDataChange = () => loadData();
    window.addEventListener('expenseDataChanged', handleDataChange);
    return () => window.removeEventListener('expenseDataChanged', handleDataChange);
  }, [currentMonth]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch live budget status, raw budget records, and available categories in parallel
      const [statusData, budgetsData, fetchedCats] = await Promise.all([
        budgetService.getStatus(currentMonth).catch(() => null),
        budgetService.getAll(currentMonth).catch(() => []),
        categoryService.getAll().catch(() => [])
      ]);
      
      setBudgetStatus(statusData);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);

      if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
        const names = fetchedCats.map(c => c.name);
        setCategoriesList(names);
        const colorMap = { ...DEFAULT_CATEGORY_COLORS };
        fetchedCats.forEach(c => {
          if (c.color) colorMap[c.name] = c.color;
        });
        setCategoryColorMap(colorMap);
      }
      
      const spent = {};
      if (statusData && Array.isArray(statusData.categories)) {
        statusData.categories.forEach(item => {
          spent[item.category] = item.spent_amount;
        });
      }
      setSpentByCategory(spent);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load budgets for selected period.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limitAmount || isNaN(limitAmount) || Number(limitAmount) <= 0) {
      setToast({ show: true, message: 'Please enter a valid monthly limit greater than 0.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetService.create({
        category: selectedCategory,
        limit_amount: Number(limitAmount),
        month: currentMonth
      });
      
      setLimitAmount('');
      setToast({ show: true, message: `Budget for ${selectedCategory} updated!`, type: 'success' });
      loadData();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to save budget.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to remove this category budget?')) return;
    
    try {
      setDeletingId(id);
      await budgetService.delete(id);
      setToast({ show: true, message: 'Budget limit removed.', type: 'success' });
      loadData();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete budget.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // Aggregated totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + (Number(b.limit_amount) || 0), 0);
  const totalSpentInBudgeted = budgets.reduce((sum, b) => sum + (spentByCategory[b.category] || 0), 0);
  const totalRemaining = totalBudgeted - totalSpentInBudgeted;

  if (isLoading && budgets.length === 0) {
    return (
      <div className="empty-state" style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading budget allocations...</p>
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

      {/* Header with Month Selector */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {!hideHeader && (
          <div>
            <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Smart Budgets</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>
              Set category limits and control monthly expenditure.
            </p>
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: hideHeader ? 'auto' : '0' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Period:</label>
          <input 
            type="month" 
            className="form-input" 
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontFamily: 'var(--font-mono)' }}
          />
        </div>
      </div>

      {/* Live Budget Alerts Banner */}
      {budgetStatus?.alerts?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: 'var(--space-6)' }}>
          {budgetStatus.alerts.map((alert, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.9rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: alert.type === 'danger' 
                  ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.18), rgba(239, 68, 68, 0.05))' 
                  : 'linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.05))',
                border: `1px solid ${alert.type === 'danger' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                boxShadow: alert.type === 'danger' ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none',
                color: alert.type === 'danger' ? '#FCA5A5' : '#FCD34D'
              }}
            >
              <AlertTriangle size={20} style={{ color: alert.type === 'danger' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 700, color: alert.type === 'danger' ? '#EF4444' : '#F59E0B' }}>
                  {alert.type === 'danger' ? '🚨 Limit Exceeded: ' : '⚠️ Approaching Limit: '}
                </span>
                {alert.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
              <Wallet size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Budget
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatCurrency(totalBudgeted)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            {budgets.length} categories planned
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #22D3EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22D3EE' }}>
              <TrendingDown size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Spent
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#22D3EE' }}>
            {formatCurrency(totalSpentInBudgeted)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            {totalBudgeted > 0 ? `${Math.round((totalSpentInBudgeted / totalBudgeted) * 100)}% of limit` : 'No budget set'}
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: `2px solid ${totalRemaining >= 0 ? '#10B981' : '#EF4444'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: totalRemaining >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: totalRemaining >= 0 ? '#10B981' : '#EF4444' }}>
              <PiggyBank size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Remaining
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: totalRemaining >= 0 ? '#10B981' : '#EF4444' }}>
            {formatCurrency(totalRemaining)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            {totalRemaining >= 0 ? 'Within budget headroom' : 'Budget exceeded'}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-body">
        {/* Left Column: Set Budget Form */}
        <div className="dashboard-column-left" style={{ flex: '1 1 340px' }}>
          <div className="glass-card" style={{ padding: 'var(--card-padding)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Target size={18} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Set Category Limit</h2>
            </div>
            
            <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Monthly Limit</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn--primary" 
                disabled={isSubmitting} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginTop: 'var(--space-2)',
                  padding: '0.75rem',
                  fontWeight: 600
                }}
              >
                {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
                Set Budget
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Budgets List */}
        <div className="dashboard-column-right" style={{ flex: '2 1 500px' }}>
          <div className="glass-card" style={{ padding: 'var(--card-padding)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Budget Allocations</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {budgets.length} active limits
              </span>
            </div>
            
            {budgets.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <Target size={36} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Budgets Configured</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Assign monthly limits to categories like Food or Shopping to monitor spending burn.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {budgets.map(budget => {
                  const categoryStatus = budgetStatus?.categories?.find(c => c.category === budget.category);
                  const spent = categoryStatus ? categoryStatus.spent_amount : (spentByCategory[budget.category] || 0);
                  const limit = budget.limit_amount || 1;
                  const percentage = categoryStatus ? categoryStatus.percentage_used : Math.round((spent / limit) * 100);
                  const status = categoryStatus ? categoryStatus.status : (spent > limit ? 'danger' : (percentage >= 80 ? 'warning' : 'normal'));
                  const isDanger = status === 'danger';
                  const isWarning = status === 'warning';
                  const catColor = categoryColorMap[budget.category] || '#8B5CF6';

                  return (
                    <div 
                      key={budget.id} 
                      style={{ 
                        padding: '1.1rem',
                        background: isDanger ? 'rgba(35, 15, 20, 0.7)' : (isWarning ? 'rgba(30, 25, 15, 0.7)' : 'rgba(15, 15, 25, 0.7)'),
                        borderRadius: 'var(--radius-md)',
                        border: isDanger 
                          ? '1px solid rgba(239, 68, 68, 0.35)' 
                          : isWarning 
                            ? '1px solid rgba(245, 158, 11, 0.35)' 
                            : '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: isDanger ? '0 4px 20px rgba(239, 68, 68, 0.12)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {budget.category}
                          </span>
                          {isDanger ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              <AlertTriangle size={12} /> Over by {formatCurrency(spent - limit)} ({percentage}%)
                            </span>
                          ) : isWarning ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                              <AlertTriangle size={12} /> {percentage}% used ({formatCurrency(limit - spent)} left)
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> {formatCurrency(limit - spent)} remaining ({Math.max(0, 100 - Math.round(percentage))}%)
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: isDanger ? '#EF4444' : (isWarning ? '#F59E0B' : 'var(--text-primary)') }}>
                            {formatCurrency(spent)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(limit)}</span>
                          </span>
                          <button 
                            onClick={() => handleDeleteBudget(budget.id)}
                            disabled={deletingId === budget.id}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--text-muted)', 
                              cursor: 'pointer', 
                              padding: '0.3rem',
                              borderRadius: '4px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            title="Delete budget limit"
                          >
                            {deletingId === budget.id ? (
                              <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`, 
                            height: '100%', 
                            background: isDanger 
                              ? '#EF4444' 
                              : isWarning 
                                ? 'linear-gradient(90deg, #F59E0B, #EF4444)' 
                                : `linear-gradient(90deg, ${catColor}, #22D3EE)`,
                            boxShadow: isDanger ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetsPage;
