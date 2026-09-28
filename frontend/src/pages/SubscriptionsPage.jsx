import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { Loader2, AlertCircle, Calendar, Plus, Trash2, Repeat } from 'lucide-react';

const FREQUENCIES = ['Monthly', 'Yearly', 'Weekly', 'Quarterly'];

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionService.getAll();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    if (!title || !amount || !nextDueDate) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await subscriptionService.create({
        title,
        amount: Number(amount),
        frequency,
        next_due_date: nextDueDate
      });
      
      // Reset form
      setTitle('');
      setAmount('');
      setNextDueDate('');
      
      loadSubscriptions(); // Refresh the list
    } catch (err) {
      setError('Failed to save subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      await subscriptionService.delete(id);
      loadSubscriptions();
    } catch (err) {
      setError('Failed to delete subscription.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };
  
  // Helper to calculate days until due
  const getDaysUntilDue = (dateString) => {
    const due = new Date(dateString);
    const today = new Date();
    // reset time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0); 
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading your subscriptions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscriptions & Bills</h1>
      </div>

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
            <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
            Add New Bill
          </h2>
          
          <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Title (e.g. Netflix, Rent)</label>
              <input 
                type="text" 
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Subscription name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (INR)</label>
              <input 
                type="number" 
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 199"
                min="1"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select 
                className="form-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                {FREQUENCIES.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input 
                type="date" 
                className="form-input"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn--primary" disabled={isSubmitting} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
              Add Subscription
            </button>
          </form>
        </div>

        {/* Right Side: Active Subscriptions List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Repeat size={20} style={{ color: 'var(--text-secondary)' }} />
            Active Subscriptions
          </h2>
          
          {subscriptions.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <p>No active subscriptions found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {subscriptions.map(sub => {
                const daysUntil = getDaysUntilDue(sub.next_due_date);
                
                // Color code the due date
                let dueColor = 'var(--text-secondary)';
                if (daysUntil < 0) dueColor = 'var(--error)'; // Overdue
                else if (daysUntil <= 3) dueColor = '#F59E0B'; // Due very soon (orange)
                else if (daysUntil <= 7) dueColor = 'var(--accent-primary)'; // Due soon (green)

                let dueText = `Due in ${daysUntil} days`;
                if (daysUntil === 0) dueText = 'Due Today!';
                else if (daysUntil === 1) dueText = 'Due Tomorrow';
                else if (daysUntil < 0) dueText = `Overdue by ${Math.abs(daysUntil)} days`;

                return (
                  <div key={sub.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{sub.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: dueColor, fontWeight: '500' }}>
                        {dueText} ({sub.next_due_date})
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                          {formatCurrency(sub.amount)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {sub.frequency}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem' }}
                        title="Delete subscription"
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

export default SubscriptionsPage;
