import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useCurrency } from '../context/CurrencyContext';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, 
  Calendar, 
  Plus, 
  Trash2, 
  Repeat, 
  AlertCircle,
  CreditCard,
  Clock,
  Sparkles
} from 'lucide-react';

const FREQUENCIES = ['Monthly', 'Yearly', 'Weekly', 'Quarterly'];

function SubscriptionsPage() {
  const { formatCurrency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadSubscriptions();

    const handleSync = () => loadSubscriptions();
    window.addEventListener('expenseDataChanged', handleSync);
    return () => window.removeEventListener('expenseDataChanged', handleSync);
  }, []);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getAll();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load subscriptions.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0 || !nextDueDate) {
      setToast({ show: true, message: 'Please enter a valid title, positive amount, and due date.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await subscriptionService.create({
        title: title.trim(),
        amount: Number(amount),
        frequency,
        next_due_date: nextDueDate
      });
      
      setTitle('');
      setAmount('');
      setNextDueDate('');
      setFrequency('Monthly');
      setToast({ show: true, message: 'Subscription added successfully!', type: 'success' });
      loadSubscriptions();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to save subscription.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this recurring bill?')) return;
    
    try {
      setDeletingId(id);
      await subscriptionService.delete(id);
      setToast({ show: true, message: 'Subscription deleted.', type: 'success' });
      loadSubscriptions();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete subscription.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to calculate days until due
  const getDaysUntilDue = (dateString) => {
    if (!dateString) return 999;
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Monthly normalized total calculation
  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    const val = Number(sub.amount) || 0;
    if (sub.frequency === 'Monthly') return sum + val;
    if (sub.frequency === 'Yearly') return sum + (val / 12);
    if (sub.frequency === 'Weekly') return sum + (val * 4.33);
    if (sub.frequency === 'Quarterly') return sum + (val / 3);
    return sum + val;
  }, 0);

  const dueSoonCount = subscriptions.filter(sub => {
    const days = getDaysUntilDue(sub.next_due_date);
    return days >= 0 && days <= 7;
  }).length;

  if (isLoading) {
    return (
      <div className="empty-state" style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading subscriptions...</p>
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
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Subscriptions & Recurring</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>
            Monitor automated charges, upcoming renewals, and fixed commitments.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
              <CreditCard size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Estimated Monthly
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {formatCurrency(monthlyTotal)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            ~{formatCurrency(monthlyTotal * 12)} / year
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #22D3EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22D3EE' }}>
              <Repeat size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Bills
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {subscriptions.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            Across all frequencies
          </span>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', borderTop: '2px solid #EC4899' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
              <Clock size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Due This Week
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: dueSoonCount > 0 ? '#EC4899' : 'var(--text-primary)' }}>
            {dueSoonCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            Next 7 calendar days
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-body">
        {/* Left Column: Create Form */}
        <div className="dashboard-column-left" style={{ flex: '1 1 360px' }}>
          <div className="glass-card" style={{ padding: 'var(--card-padding)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Add Recurring Bill</h2>
            </div>
            
            <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Service / Bill Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Netflix, Rent, Spotify"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Billing Frequency</label>
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
                <label className="form-label">Next Renewal / Due Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
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
                Add Subscription
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Subscriptions List */}
        <div className="dashboard-column-right" style={{ flex: '2 1 500px' }}>
          <div className="glass-card" style={{ padding: 'var(--card-padding)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Repeat size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>Active Bills & Services</h2>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {subscriptions.length} registered
              </span>
            </div>
            
            {subscriptions.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <Sparkles size={36} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Subscriptions Logged</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add your monthly streaming services, gym memberships, or rent to keep track of renewal dates.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {subscriptions.map(sub => {
                  const daysUntil = getDaysUntilDue(sub.next_due_date);
                  
                  // Color code badge for due date
                  let badgeBg = 'rgba(255, 255, 255, 0.05)';
                  let badgeColor = 'var(--text-muted)';
                  let dueText = `Due in ${daysUntil} days`;

                  if (daysUntil < 0) {
                    badgeBg = 'rgba(239, 68, 68, 0.15)';
                    badgeColor = '#EF4444';
                    dueText = `Overdue by ${Math.abs(daysUntil)}d`;
                  } else if (daysUntil === 0) {
                    badgeBg = 'rgba(236, 72, 153, 0.2)';
                    badgeColor = '#EC4899';
                    dueText = 'Due Today';
                  } else if (daysUntil <= 3) {
                    badgeBg = 'rgba(245, 158, 11, 0.15)';
                    badgeColor = '#F59E0B';
                    dueText = `Due in ${daysUntil}d`;
                  } else if (daysUntil <= 7) {
                    badgeBg = 'rgba(34, 211, 238, 0.15)';
                    badgeColor = '#22D3EE';
                    dueText = `Due in ${daysUntil}d`;
                  }

                  const initial = (sub.title || 'S').charAt(0).toUpperCase();

                  return (
                    <div 
                      key={sub.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(15, 15, 25, 0.7)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s, border-color 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: 'rgba(139, 92, 246, 0.15)', 
                          color: '#A78BFA',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {initial}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                            {sub.title}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              background: badgeBg, 
                              color: badgeColor,
                              fontWeight: 600
                            }}>
                              {dueText}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              • Next: {sub.next_due_date}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                            {formatCurrency(sub.amount)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {sub.frequency}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId === sub.id}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-muted)', 
                            cursor: 'pointer', 
                            padding: '0.4rem',
                            borderRadius: '4px',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          title="Remove subscription"
                        >
                          {deletingId === sub.id ? (
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
    </div>
  );
}

export default SubscriptionsPage;
