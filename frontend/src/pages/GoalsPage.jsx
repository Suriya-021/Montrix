import React, { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import { Loader2, AlertCircle, Trophy, Plus, Trash2, TrendingUp } from 'lucide-react';

function GoalsPage({ hideHeader = false }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick add funds state
  const [addFundsId, setAddFundsId] = useState(null);
  const [fundsAmount, setFundsAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load savings goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) {
      setError('Please fill out at least a Title and Target Amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await goalService.create({
        title,
        target_amount: Number(targetAmount),
        current_amount: 0.0, // New goals start at 0
        target_date: targetDate || null
      });
      
      // Reset form
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      
      loadGoals();
    } catch (err) {
      setError('Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFunds = async (goal) => {
    if (!fundsAmount || Number(fundsAmount) <= 0) return;

    try {
      setError(null);
      const newAmount = goal.current_amount + Number(fundsAmount);
      
      await goalService.update(goal.id, {
        current_amount: newAmount
      });
      
      setAddFundsId(null);
      setFundsAmount('');
      loadGoals();
    } catch (err) {
      setError('Failed to add funds.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    
    try {
      await goalService.delete(id);
      loadGoals();
    } catch (err) {
      setError('Failed to delete goal.');
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
        <p>Loading your goals...</p>
      </div>
    );
  }

  return (
    <div>
      {!hideHeader && (
        <div className="page-header">
          <h1 className="page-title">Savings Goals</h1>
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Side: Create Form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Trophy size={20} style={{ color: 'var(--accent-primary)' }} />
            New Savings Goal
          </h2>
          
          <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Goal Title (e.g. Vacation, Emergency Fund)</label>
              <input 
                type="text" 
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you saving for?"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Amount (INR)</label>
              <input 
                type="number" 
                className="form-input"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g. 50000"
                min="1"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Date (Optional)</label>
              <input 
                type="date" 
                className="form-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn btn--primary" disabled={isSubmitting} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
              Create Goal
            </button>
          </form>
        </div>

        {/* Right Side: Active Goals Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {goals.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <p>You haven't set any savings goals yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {goals.map(goal => {
                const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                const isComplete = percentage >= 100;
                
                return (
                  <div key={goal.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Completion Ribbon */}
                    {isComplete && (
                      <div style={{ position: 'absolute', top: '15px', right: '-30px', background: 'var(--accent-primary)', color: 'var(--bg-card)', padding: '5px 35px', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 1 }}>
                        ACHIEVED
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ paddingRight: isComplete ? '50px' : '0' }}>
                        <h3 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{goal.title}</h3>
                        {goal.target_date && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: {goal.target_date}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {formatCurrency(goal.current_amount)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          of {formatCurrency(goal.target_amount)}
                        </span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        background: 'var(--accent-primary)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out'
                      }} />
                    </div>

                    {/* Action Buttons: Add Funds (Left) and Delete (Right) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      {addFundsId === goal.id && !isComplete ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="Amount" 
                            value={fundsAmount}
                            onChange={(e) => setFundsAmount(e.target.value)}
                            style={{ padding: '0.5rem', width: '100px' }}
                            autoFocus
                          />
                          <button className="btn btn--primary" style={{ padding: '0.5rem 1rem' }} onClick={() => handleAddFunds(goal)}>Add</button>
                          <button className="btn" style={{ padding: '0.5rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} onClick={() => setAddFundsId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div>
                          {!isComplete && (
                            <button 
                              className="btn" 
                              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                              onClick={() => setAddFundsId(goal.id)}
                            >
                              <TrendingUp size={16} />
                              Add Funds
                            </button>
                          )}
                        </div>
                      )}

                      {/* Delete Button always visible at bottom right */}
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s ease' }}
                        title="Delete Goal"
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default GoalsPage;
