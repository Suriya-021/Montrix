import React, { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import { useCurrency } from '../context/CurrencyContext';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, 
  Trophy, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Coins 
} from 'lucide-react';

function GoalsPage({ hideHeader = false }) {
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick add funds state
  const [addFundsId, setAddFundsId] = useState(null);
  const [fundsAmount, setFundsAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadGoals();

    const handleSync = () => loadGoals();
    window.addEventListener('expenseDataChanged', handleSync);
    return () => window.removeEventListener('expenseDataChanged', handleSync);
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const data = await goalService.getAll();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load savings goals.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount || Number(targetAmount) <= 0) {
      setToast({ show: true, message: 'Please enter a goal title and target amount.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await goalService.create({
        title: title.trim(),
        target_amount: Number(targetAmount),
        current_amount: 0.0,
        target_date: targetDate || null
      });
      
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setToast({ show: true, message: 'Savings goal created!', type: 'success' });
      loadGoals();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to create goal.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFunds = async (goal) => {
    if (!fundsAmount || isNaN(fundsAmount) || Number(fundsAmount) <= 0) {
      setToast({ show: true, message: 'Please enter a valid deposit amount.', type: 'error' });
      return;
    }

    try {
      setIsDepositing(true);
      const updatedAmount = Number(goal.current_amount || 0) + Number(fundsAmount);
      await goalService.update(goal.id, {
        current_amount: updatedAmount
      });

      setAddFundsId(null);
      setFundsAmount('');
      setToast({ show: true, message: `Added ${formatCurrency(fundsAmount)} to ${goal.title}!`, type: 'success' });
      loadGoals();
    } catch (err) {
      setToast({ show: true, message: 'Failed to deposit funds.', type: 'error' });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    
    try {
      setDeletingId(id);
      await goalService.delete(id);
      setToast({ show: true, message: 'Goal removed.', type: 'success' });
      loadGoals();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete goal.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics
  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.target_amount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (Number(g.current_amount) || 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  if (isLoading && goals.length === 0) {
    return (
      <div className="empty-state" style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading financial targets...</p>
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
      {!hideHeader && (
        <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Savings Goals</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>
              Fund your milestones, track emergency reserves, and grow your wealth.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
              <Target size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Milestone Target
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatCurrency(totalTarget)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            Across {goals.length} active goals
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <Coins size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Accumulated
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10B981' }}>
            {formatCurrency(totalSaved)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            {formatCurrency(Math.max(0, totalTarget - totalSaved))} left to save
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #22D3EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22D3EE' }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Progress
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#22D3EE' }}>
            {overallPercentage}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            Aggregate completion rate
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-body">
        {/* Left Column: Create Goal Form */}
        <div className="dashboard-column-left" style={{ flex: '1 1 340px' }}>
          <div className="glass-card" style={{ padding: 'var(--card-padding)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Trophy size={18} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Create Goal</h2>
            </div>
            
            <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Laptop, Vacation, House Fund"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Amount</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Target Completion Date (Optional)</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
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
                Create Goal
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Goal Cards Grid */}
        <div className="dashboard-column-right" style={{ flex: '2 1 500px' }}>
          <div className="glass-card" style={{ padding: 'var(--card-padding)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Active Targets</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {goals.length} milestones
              </span>
            </div>
            
            {goals.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <Trophy size={36} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Goals Set Yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Define your future purchases or emergency reserves to start allocating funds.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {goals.map(goal => {
                  const target = Number(goal.target_amount) || 1;
                  const current = Number(goal.current_amount) || 0;
                  const percentage = Math.min(Math.round((current / target) * 100), 100);
                  const isComplete = current >= target;

                  return (
                    <div 
                      key={goal.id} 
                      style={{ 
                        padding: '1.25rem',
                        background: 'rgba(15, 15, 25, 0.7)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                              {goal.title}
                            </span>
                            {isComplete && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 600 }}>
                                <CheckCircle2 size={12} /> Achieved!
                              </span>
                            )}
                          </div>
                          {goal.target_date && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                              Target Date: {goal.target_date}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <button 
                            onClick={() => setAddFundsId(addFundsId === goal.id ? null : goal.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(139, 92, 246, 0.15)',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              color: '#A78BFA',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            + Deposit
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteGoal(goal.id)}
                            disabled={deletingId === goal.id}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--text-muted)', 
                              cursor: 'pointer', 
                              padding: '0.2rem',
                              borderRadius: '4px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            title="Delete goal"
                          >
                            {deletingId === goal.id ? (
                              <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Quick Add Funds Input Dropdown */}
                      {addFundsId === goal.id && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '0.5rem', 
                          padding: '0.6rem', 
                          background: 'rgba(0, 0, 0, 0.3)', 
                          borderRadius: '6px', 
                          border: '1px solid rgba(255,255,255,0.06)' 
                        }}>
                          <input 
                            type="number"
                            className="form-input"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                            placeholder="Deposit amount"
                            value={fundsAmount}
                            onChange={(e) => setFundsAmount(e.target.value)}
                            min="1"
                            step="0.01"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleAddFunds(goal)}
                            disabled={isDepositing}
                            className="btn btn--primary"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            {isDepositing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm'}
                          </button>
                        </div>
                      )}

                      {/* Progress Bar Container */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#10B981', fontWeight: 600 }}>
                            {formatCurrency(current)}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {formatCurrency(target)} ({percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              background: isComplete 
                                ? '#10B981' 
                                : 'linear-gradient(90deg, #8B5CF6, #22D3EE)',
                              borderRadius: '999px',
                              transition: 'width 0.4s ease'
                            }} 
                          />
                        </div>
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

export default GoalsPage;
