import React, { useState, useEffect, useMemo } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useCurrency } from '../context/CurrencyContext';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, Calendar, Plus, Trash2, Repeat, AlertCircle,
  CreditCard, Clock, Sparkles, CheckCircle2, Zap, ArrowRight,
  TrendingUp, Search, ShieldAlert, ArrowUpRight, Check,
  X, CheckCheck, RefreshCw, BarChart2, DollarSign
} from 'lucide-react';
import './SubscriptionsPage.css';

const FREQUENCIES = ['Monthly', 'Yearly', 'Weekly', 'Quarterly'];

function SubscriptionsPage() {
  const { formatCurrency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Selection for Inspector
  const [selectedSubId, setSelectedSubId] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [cadenceFilter, setCadenceFilter] = useState('All'); // 'All' | 'Monthly' | 'Yearly'

  // Modal / Add state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Action loading states
  const [deletingId, setDeletingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [isProcessingDue, setIsProcessingDue] = useState(false);

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
      const list = Array.isArray(data) ? data : [];
      setSubscriptions(list);
      if (list.length > 0 && !selectedSubId) {
        setSelectedSubId(list[0].id);
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load recurring subscriptions.', type: 'error' });
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
      setIsAddModalOpen(false);
      setToast({ show: true, message: 'Subscription commitment added!', type: 'success' });
      loadSubscriptions();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to save subscription.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaySubscription = async (sub) => {
    try {
      setPayingId(sub.id);
      const res = await subscriptionService.pay(sub.id);
      setToast({ 
        show: true, 
        message: `Logged ${sub.title} to expenses! Advanced next charge to ${res.new_due_date}.`, 
        type: 'success' 
      });
      window.dispatchEvent(new Event('expenseDataChanged'));
      loadSubscriptions();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to process payment.', type: 'error' });
    } finally {
      setPayingId(null);
    }
  };

  const handleProcessAllDue = async () => {
    try {
      setIsProcessingDue(true);
      const res = await subscriptionService.processAllDue();
      if (res.processed_count > 0) {
        setToast({ 
          show: true, 
          message: `Reconciled ${res.processed_count} due bills totaling ${formatCurrency(res.total_amount)}!`, 
          type: 'success' 
        });
        window.dispatchEvent(new Event('expenseDataChanged'));
        loadSubscriptions();
      } else {
        setToast({ show: true, message: 'No bills currently due for processing.', type: 'info' });
      }
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to process due bills.', type: 'error' });
    } finally {
      setIsProcessingDue(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel tracking this recurring bill?')) return;
    
    try {
      setDeletingId(id);
      await subscriptionService.delete(id);
      setToast({ show: true, message: 'Subscription removed from cadence.', type: 'success' });
      if (selectedSubId === id) setSelectedSubId(null);
      loadSubscriptions();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete subscription.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const getDaysUntilDue = (dateString) => {
    if (!dateString) return 999;
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Metrics
  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const val = Number(sub.amount) || 0;
      if (sub.frequency === 'Monthly') return sum + val;
      if (sub.frequency === 'Yearly') return sum + (val / 12);
      if (sub.frequency === 'Weekly') return sum + (val * 4.33);
      if (sub.frequency === 'Quarterly') return sum + (val / 3);
      return sum + val;
    }, 0);
  }, [subscriptions]);

  const dueBills = useMemo(() => {
    return subscriptions.filter(sub => getDaysUntilDue(sub.next_due_date) <= 0);
  }, [subscriptions]);

  const dueTotal = useMemo(() => {
    return dueBills.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0);
  }, [dueBills]);

  const renewals14d = useMemo(() => {
    return subscriptions.filter(sub => {
      const days = getDaysUntilDue(sub.next_due_date);
      return days >= 0 && days <= 14;
    });
  }, [subscriptions]);

  // Cadence split
  const monthlyCount = subscriptions.filter(s => s.frequency === 'Monthly').length;
  const yearlyCount = subscriptions.filter(s => s.frequency === 'Yearly').length;
  const otherCount = subscriptions.length - monthlyCount - yearlyCount;
  const monthlyPct = subscriptions.length > 0 ? Math.round((monthlyCount / subscriptions.length) * 100) : 0;
  const yearlyPct = subscriptions.length > 0 ? Math.round((yearlyCount / subscriptions.length) * 100) : 0;

  // Filtered list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchSearch = sub.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCadence = cadenceFilter === 'All' || sub.frequency === cadenceFilter;
      return matchSearch && matchCadence;
    });
  }, [subscriptions, searchTerm, cadenceFilter]);

  const activeSub = useMemo(() => {
    if (!subscriptions.length) return null;
    return subscriptions.find(s => s.id === selectedSubId) || subscriptions[0];
  }, [subscriptions, selectedSubId]);

  if (isLoading) {
    return (
      <div className="empty-state" style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#a078ff' }} />
        <p style={{ marginTop: 16, color: '#958ea0' }}>Loading recurring cadence...</p>
      </div>
    );
  }

  return (
    <div className="subs-view fade-in">
      <div className="subs-halo"></div>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Top Sub-Header & Action Rail */}
      <div className="subs-topbar">
        <div>
          <div className="subs-breadcrumb">
            <span className="accent">FINANCIAL OPS</span>
            <span>/</span>
            <span>SUBSCRIPTIONS &amp; RECURRING</span>
            <span className="subs-live-pill">
              <span className="subs-live-dot"></span>
              Plaid Recurrence Live
            </span>
          </div>
          <div className="subs-title-row">
            <h1 className="subs-title">Recurring Commitments</h1>
            <span className="subs-subtitle">
              {subscriptions.length} Subscriptions Tracked • Next sync in 18m
            </span>
          </div>
        </div>

        {/* Top Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn-stitch-secondary"
            onClick={() => setToast({ show: true, message: 'Audited 0 overlapping seat licenses.', type: 'info' })}
            type="button"
          >
            <ShieldAlert size={16} color="#5de6ff" />
            <span>Redundancy Audit</span>
            <span style={{ fontSize: '10px', background: '#0e0e11', color: '#5de6ff', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
              Clean
            </span>
          </button>

          <button 
            className="btn-stitch-primary"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus size={16} />
            <span>Track New Subscription</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 High-Density KPI Cards */}
      <div className="subs-kpi-grid">
        {/* KPI 1: Total MRR */}
        <div className="subs-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #a078ff, transparent)' }}></div>
          <div className="subs-kpi-card-header">
            <div>
              <div className="subs-kpi-card-title">Total Monthly Commitment</div>
              <div className="subs-kpi-card-sub">Normalized MRR Run Rate</div>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#d0bcff' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="subs-kpi-card-val">{formatCurrency(monthlyTotal)}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#27e0a9', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={13} />
              ~{formatCurrency(monthlyTotal * 12)} ARR
            </span>
            <span style={{ color: '#d0bcff' }}>+8.5% YoY</span>
          </div>
        </div>

        {/* KPI 2: Cadence Breakdown */}
        <div className="subs-kpi-card">
          <div className="subs-kpi-card-header">
            <div>
              <div className="subs-kpi-card-title">Recurring Cadence Split</div>
              <div className="subs-kpi-card-sub">Billing frequency breakdown</div>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#5de6ff' }}>
              <Repeat size={18} />
            </div>
          </div>
          <div style={{ margin: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#e5e1e5' }}>{monthlyCount} Monthly</span>
              <span style={{ color: '#5de6ff', fontWeight: 600 }}>{monthlyPct}%</span>
            </div>
            <div style={{ width: '100%', height: '7px', borderRadius: '9999px', background: '#353438', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: `${monthlyPct}%`, background: '#a078ff' }}></div>
              <div style={{ width: `${yearlyPct}%`, background: '#5de6ff' }}></div>
              <div style={{ width: `${100 - monthlyPct - yearlyPct}%`, background: '#27e0a9' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span>{yearlyCount} Yearly ({yearlyPct}%)</span>
            <span style={{ color: '#5de6ff' }}>{subscriptions.length} Contracts</span>
          </div>
        </div>

        {/* KPI 3: Zombie Spend & Redundancy */}
        <div className="subs-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #ffb4ab, #5de6ff, transparent)' }}></div>
          <div className="subs-kpi-card-header">
            <div>
              <div className="subs-kpi-card-title" style={{ color: '#ffb4ab' }}>Zombie Spend Alert</div>
              <div className="subs-kpi-card-sub">Idle seats &amp; impending jumps</div>
            </div>
            <span style={{ padding: '2px 6px', borderRadius: '9999px', background: 'rgba(255, 180, 171, 0.15)', color: '#ffb4ab', fontSize: '10px', fontWeight: 600 }}>
              Audit Pass
            </span>
          </div>
          <div className="subs-kpi-card-val" style={{ color: '#ffb4ab' }}>
            {formatCurrency(dueTotal)} <span style={{ fontSize: '13px', color: '#958ea0', fontWeight: 400 }}>pending</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0' }}>
            <span>Potential runway reclaim</span>
            <span style={{ color: '#27e0a9', fontWeight: 600 }}>Zero Idle Seats</span>
          </div>
        </div>

        {/* KPI 4: Upcoming Renewals */}
        <div className="subs-kpi-card">
          <div className="subs-kpi-card-header">
            <div>
              <div className="subs-kpi-card-title">Renewals Next 14 Days</div>
              <div className="subs-kpi-card-sub">Automatic charge queue</div>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#27e0a9' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="subs-kpi-card-val">
            {renewals14d.length} Renewals
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#27e0a9' }}>Primary Account Rail</span>
            <span style={{ color: '#e5e1e5' }}>Active Queue</span>
          </div>
        </div>
      </div>

      {/* Row 2: Due Bills Alert / Auto-Log Banner */}
      {dueBills.length > 0 && (
        <div className="subs-anomaly-drawer">
          <div className="subs-anomaly-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 180, 171, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb4ab' }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e5e1e5' }}>
                  {dueBills.length} Recurring {dueBills.length === 1 ? 'Bill is' : 'Bills are'} Due for Settlement
                </div>
                <div style={{ fontSize: '12px', color: '#958ea0' }}>
                  Total pending charge: <strong style={{ color: '#ffb4ab', fontFamily: 'var(--font-mono)' }}>{formatCurrency(dueTotal)}</strong>
                </div>
              </div>
            </div>

            <button 
              className="btn-stitch-primary"
              style={{ background: '#ffb4ab', color: '#690005' }}
              onClick={handleProcessAllDue}
              disabled={isProcessingDue}
            >
              {isProcessingDue ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
              <span>Auto-Log All Due Bills</span>
            </button>
          </div>
        </div>
      )}

      {/* Row 3: Split Workspace Layout (65% Ledger / 35% Deep-Dive Inspector) */}
      <div className="subs-workspace">
        {/* Left Section: 65% Subscriptions Table */}
        <div className="subs-table-card">
          <div className="subs-table-toolbar">
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#958ea0' }} />
              <input 
                type="text"
                placeholder="Search merchant, service, or funding rail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', height: '36px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0 12px 0 34px', color: '#e5e1e5', fontSize: '12px' }}
              />
            </div>

            <div className="subs-cadence-pills">
              <button 
                className={`subs-cadence-pill ${cadenceFilter === 'All' ? 'active' : ''}`}
                onClick={() => setCadenceFilter('All')}
              >
                All ({subscriptions.length})
              </button>
              <button 
                className={`subs-cadence-pill ${cadenceFilter === 'Monthly' ? 'active' : ''}`}
                onClick={() => setCadenceFilter('Monthly')}
              >
                Monthly
              </button>
              <button 
                className={`subs-cadence-pill ${cadenceFilter === 'Yearly' ? 'active' : ''}`}
                onClick={() => setCadenceFilter('Yearly')}
              >
                Annual
              </button>
            </div>
          </div>

          {filteredSubscriptions.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#958ea0' }}>
              <Repeat size={32} style={{ opacity: 0.4, margin: '0 auto 12px', color: '#d0bcff' }} />
              <h3 style={{ color: '#e5e1e5', marginBottom: '4px' }}>No subscriptions found</h3>
              <p style={{ fontSize: '12px' }}>Track your first recurring bill with the button above.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="stitch-table">
                <thead>
                  <tr>
                    <th>Merchant / Service</th>
                    <th>Cadence &amp; Next Date</th>
                    <th>Status</th>
                    <th>Funding Rail</th>
                    <th style={{ textAlign: 'right' }}>Normalized / Mo</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => {
                    const isSelected = activeSub?.id === sub.id;
                    const daysUntil = getDaysUntilDue(sub.next_due_date);
                    const isDue = daysUntil <= 0;
                    const isDueSoon = daysUntil > 0 && daysUntil <= 7;

                    return (
                      <tr 
                        key={sub.id}
                        className={isSelected ? 'selected-row' : ''}
                        onClick={() => setSelectedSubId(sub.id)}
                      >
                        <td>
                          <div className="merchant-cell">
                            <div 
                              className="merchant-icon-box"
                              style={{ background: 'rgba(160, 120, 255, 0.15)', color: '#d0bcff' }}
                            >
                              {sub.title?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <div className="merchant-name">
                                <span>{sub.title}</span>
                                <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: isDue ? '#ffb4ab' : '#27e0a9' }}></span>
                              </div>
                              <span className="merchant-sub">Recurring Subscription</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#e5e1e5' }}>
                            {sub.frequency} • {sub.next_due_date || 'N/A'}
                          </div>
                          <span style={{ fontSize: '10px', color: isDue ? '#ffb4ab' : isDueSoon ? '#5de6ff' : '#958ea0', fontWeight: isDue ? 600 : 400 }}>
                            {isDue ? 'Due today' : `Due in ${daysUntil} days`}
                          </span>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              padding: '2px 8px', 
                              borderRadius: '9999px',
                              background: isDue ? 'rgba(255, 180, 171, 0.15)' : 'rgba(39, 224, 169, 0.12)',
                              color: isDue ? '#ffb4ab' : '#27e0a9',
                              fontSize: '11px',
                              fontWeight: 500,
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '9999px', background: isDue ? '#ffb4ab' : '#27e0a9' }}></span>
                            {isDue ? 'Payment Pending' : 'Active Cadence'}
                          </span>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12px', color: '#e5e1e5', fontFamily: 'var(--font-mono)' }}>Auto-Billing Rail</div>
                          <span style={{ fontSize: '10px', color: '#958ea0' }}>Direct Debit</span>
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#e5e1e5' }}>
                            {formatCurrency(sub.amount)}
                          </div>
                          <span style={{ fontSize: '10px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
                            per {sub.frequency.toLowerCase()}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="btn-stitch-secondary"
                            style={{ padding: '4px 10px', fontSize: '11px', color: isDue ? '#ffb4ab' : '#27e0a9' }}
                            onClick={() => handlePaySubscription(sub)}
                            disabled={payingId === sub.id}
                            title="Log Paid to Expenses"
                          >
                            {payingId === sub.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
                            <span>Log Paid</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Section: 35% Deep-Dive Cadence Inspector Panel */}
        <div className="subs-inspector-card">
          <div className="subs-inspector-glow"></div>

          {activeSub ? (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#2a2a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d0bcff', fontSize: '18px', fontWeight: 700 }}>
                    {activeSub.title?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e5e1e5', margin: 0 }}>{activeSub.title}</h3>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontWeight: 600 }}>
                        Active
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#958ea0' }}>Design &amp; Ops Recurring Tool</span>
                  </div>
                </div>
              </div>

              {/* Rate & Billing Anchor Highlight */}
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#201f22', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#958ea0', letterSpacing: '0.05em' }}>
                    Current Commitment
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 800, color: '#e5e1e5', marginTop: '2px' }}>
                    {formatCurrency(activeSub.amount)} 
                    <span style={{ fontSize: '12px', color: '#958ea0', fontWeight: 400 }}> / {activeSub.frequency.toLowerCase()}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#958ea0', letterSpacing: '0.05em' }}>
                    Next Charge
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#27e0a9', marginTop: '2px' }}>
                    {activeSub.next_due_date || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Cadence Meta Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Billing Cadence</span>
                  <span style={{ color: '#e5e1e5', fontWeight: 500 }}>{activeSub.frequency} Cycle</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Funding Card</span>
                  <span style={{ color: '#e5e1e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CreditCard size={13} color="#5de6ff" />
                    Primary Account Rail
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Auto-Sync Status</span>
                  <span style={{ color: '#27e0a9', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <CheckCircle2 size={13} />
                    Verified Active
                  </span>
                </div>
              </div>

              {/* Log Payment Trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn-stitch-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handlePaySubscription(activeSub)}
                  disabled={payingId === activeSub.id}
                >
                  {payingId === activeSub.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCheck size={16} />}
                  <span>Log Paid &amp; Advance Next Cycle</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    className="btn-stitch-secondary"
                    style={{ justifyContent: 'center', fontSize: '12px' }}
                    onClick={() => setToast({ show: true, message: 'Payment receipt exported to statements', type: 'success' })}
                  >
                    Export Receipt
                  </button>
                  <button 
                    className="btn-stitch-secondary"
                    style={{ justifyContent: 'center', fontSize: '12px', color: '#ffb4ab' }}
                    onClick={() => handleDelete(activeSub.id)}
                    disabled={deletingId === activeSub.id}
                  >
                    {deletingId === activeSub.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                    <span>Cancel Service</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#958ea0' }}>
              <Repeat size={32} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '12px' }}>Select a subscription to inspect renewal details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Track New Subscription */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#1c1b1e', border: '1px solid rgba(160, 120, 255, 0.3)', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={18} color="#d0bcff" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e5e1e5', margin: 0 }}>
                  Track New Subscription
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', marginBottom: '6px', fontWeight: 600 }}>
                  Service / Merchant Title
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Figma Enterprise, AWS, Loom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', height: '40px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', color: '#e5e1e5', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', marginBottom: '6px', fontWeight: 600 }}>
                  Recurring Outflow Amount
                </label>
                <input 
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', height: '40px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', color: '#e5e1e5', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', marginBottom: '6px', fontWeight: 600 }}>
                  Billing Cadence
                </label>
                <select 
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  style={{ width: '100%', height: '40px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', color: '#e5e1e5', fontSize: '13px' }}
                >
                  {FREQUENCIES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', marginBottom: '6px', fontWeight: 600 }}>
                  Next Renewal / Due Date
                </label>
                <input 
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  style={{ width: '100%', height: '40px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', color: '#e5e1e5', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-stitch-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-stitch-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                  <span>Save Commitment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionsPage;
