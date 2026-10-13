import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { expenseService } from '../services/expenseService';
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

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 
  'Bills', 'Health', 'Education', 'Games', 'Investment', 'Other'
];

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

function BudgetsPage({ hideHeader = false }) {
  const { formatCurrency } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [spentByCategory, setSpentByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
    
    const handleDataChange = () => loadData();
    window.addEventListener('expenseDataChanged', handleDataChange);
    return () => window.removeEventListener('expenseDataChanged', handleDataChange);
  }, [currentMonth]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch both budgets and month-specific stats in parallel
      const [budgetsData, statsData] = await Promise.all([
        budgetService.getAll(currentMonth),
        expenseService.getStats(currentMonth) // Month-filtered stats!
      ]);
      
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      
      const spent = {};
      if (statsData && statsData.category_breakdown) {
        statsData.category_breakdown.forEach(item => {
          spent[item.name] = item.value;
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
                  {CATEGORIES.map(cat => (
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
                  const spent = spentByCategory[budget.category] || 0;
                  const limit = budget.limit_amount || 1;
                  const percentage = Math.round((spent / limit) * 100);
                  const isOver = spent > limit;
                  const catColor = CATEGORY_COLORS[budget.category] || '#8B5CF6';

                  return (
                    <div 
                      key={budget.id} 
                      style={{ 
                        padding: '1rem',
                        background: 'rgba(15, 15, 25, 0.7)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {budget.category}
                          </span>
                          {isOver ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontWeight: 600 }}>
                              <AlertTriangle size={11} /> Over by {formatCurrency(spent - limit)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontWeight: 600 }}>
                              {formatCurrency(limit - spent)} remaining
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: isOver ? '#EF4444' : 'var(--text-primary)' }}>
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
                      <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`, 
                            height: '100%', 
                            background: isOver 
                              ? '#EF4444' 
                              : `linear-gradient(90deg, ${catColor}, #22D3EE)`,
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
