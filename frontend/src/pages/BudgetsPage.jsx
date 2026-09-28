import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { expenseService } from '../services/expenseService';
import { Loader2, AlertCircle, Target, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 
  'Bills', 'Health', 'Education', 'Games', 'Investment', 'Other'
];

function BudgetsPage({ hideHeader = false }) {
  const [budgets, setBudgets] = useState([]);
  const [spentByCategory, setSpentByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // We need both budgets and stats to calculate progress
      const [budgetsData, statsData] = await Promise.all([
        budgetService.getAll(currentMonth),
        expenseService.getStats() // getStats returns { by_category: [...] }
      ]);
      
      setBudgets(budgetsData);
      
      // Calculate how much was spent per category this month
      // Note: statsData.category_breakdown comes from our fix in Session 22
      const spent = {};
      if (statsData.category_breakdown) {
        statsData.category_breakdown.forEach(item => {
          spent[item.name] = item.value;
        });
      }
      setSpentByCategory(spent);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load budgets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limitAmount || isNaN(limitAmount) || Number(limitAmount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await budgetService.create({
        category: selectedCategory,
        limit_amount: Number(limitAmount),
        month: currentMonth
      });
      
      setLimitAmount('');
      loadData(); // Refresh the list
    } catch (err) {
      setError('Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget limit?')) return;
    
    try {
      await budgetService.delete(id);
      loadData();
    } catch (err) {
      setError('Failed to delete budget.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading your budgets...</p>
      </div>
    );
  }

  return (
    <div>
      {!hideHeader && (
        <div className="page-header">
          <h1 className="page-title">Smart Budgets</h1>
          <input 
            type="month" 
            className="form-input" 
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>
      )}
      
      {/* If header is hidden, we still need the month selector */}
      {hideHeader && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <input 
            type="month" 
            className="form-input" 
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Side: Create Budget Form */}
        <div className="glass-card">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Target size={20} style={{ color: 'var(--accent-primary)' }} />
            Set Category Budget
          </h2>
          
          <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <label className="form-label">Monthly Limit (INR)</label>
              <input 
                type="number" 
                className="form-input"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="e.g. 5000"
                min="1"
                step="1"
                required
              />
            </div>
            
            <button type="submit" className="btn btn--primary" disabled={isSubmitting} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
              Save Budget
            </button>
          </form>
        </div>

        {/* Right Side: Budget Progress */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 className="section-title">Budget Progress</h2>
          
          {budgets.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <p>You haven't set any budgets for {currentMonth}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {budgets.map(budget => {
                const spent = spentByCategory[budget.category] || 0;
                const percentage = Math.min((spent / budget.limit_amount) * 100, 100);
                
                // Determine color based on progress
                let progressColor = 'var(--accent-primary)'; // Green
                if (percentage >= 90) progressColor = 'var(--error)'; // Red
                else if (percentage >= 75) progressColor = '#F59E0B'; // Orange/Yellow
                
                return (
                  <div key={budget.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{budget.category}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {formatCurrency(spent)} / {formatCurrency(budget.limit_amount)}
                        </span>
                        <button 
                          onClick={() => handleDeleteBudget(budget.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                          title="Delete budget"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar Track */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      {/* Progress Bar Fill */}
                      <div style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        background: progressColor,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                      }} />
                    </div>
                    
                    {percentage >= 100 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>
                        You have exceeded your {budget.category} budget!
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetsPage;
