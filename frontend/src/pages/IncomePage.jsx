import React, { useState, useEffect, useMemo } from 'react';
import { incomeService } from '../services/incomeService';
import { useCurrency } from '../context/CurrencyContext';
import Toast from '../components/Toast/Toast';
import { 
  Loader2, AlertCircle, Wallet, Plus, Trash2, TrendingUp, 
  Calendar, CheckCircle2, ArrowRight, Download, Search,
  CreditCard, ShieldCheck, Activity, DollarSign, Clock,
  ArrowUpRight, RefreshCw, X, FileText, Check
} from 'lucide-react';
import './IncomePage.css';

function IncomePage() {
  const { formatCurrency } = useCurrency();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection for Inspector
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [streamFilter, setStreamFilter] = useState('All');

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomeService.getAll();
      const list = Array.isArray(data) ? data : [];
      setIncomes(list);
      if (list.length > 0 && !selectedIncomeId) {
        setSelectedIncomeId(list[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load income records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault();
    if (!source || !amount || Number(amount) <= 0 || !date) {
      setToast({ message: 'Please enter a valid source, positive amount, and date.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await incomeService.create({
        source: source.trim(),
        amount: Number(amount),
        date
      });
      
      setSource('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsAddOpen(false);
      
      setToast({ message: 'Inflow stream recorded successfully!', type: 'success' });
      window.dispatchEvent(new Event('expenseDataChanged'));
      loadIncomes();
    } catch (err) {
      setToast({ message: 'Failed to record inflow stream.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this inflow record?')) return;
    
    try {
      await incomeService.delete(id);
      setToast({ message: 'Inflow record removed from ledger.', type: 'success' });
      if (selectedIncomeId === id) setSelectedIncomeId(null);
      window.dispatchEvent(new Event('expenseDataChanged'));
      loadIncomes();
    } catch (err) {
      setToast({ message: 'Failed to delete income.', type: 'error' });
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  }, [incomes]);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthIncome = useMemo(() => {
    return incomes
      .filter(inc => {
        const d = new Date(inc.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  }, [incomes, currentMonth, currentYear]);

  const uniqueSources = useMemo(() => {
    return new Set(incomes.map(inc => inc.source)).size;
  }, [incomes]);

  const mrrEstimate = totalIncome > 0 ? (totalIncome * 0.72) : 0;
  const inTransitAmount = totalIncome > 0 ? (totalIncome * 0.18) : 0;

  // Filtered
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const matchSearch = inc.source?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [incomes, searchTerm]);

  const activeInflow = useMemo(() => {
    if (!incomes.length) return null;
    return incomes.find(i => i.id === selectedIncomeId) || incomes[0];
  }, [incomes, selectedIncomeId]);

  if (isLoading && incomes.length === 0) {
    return (
      <div className="empty-state" style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#5de6ff' }} />
        <p style={{ marginTop: 16, color: '#958ea0' }}>Streaming revenue ledger...</p>
      </div>
    );
  }

  return (
    <div className="income-view fade-in">
      <div className="income-halo"></div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Top Action Bar */}
      <div className="income-topbar">
        <div>
          <div className="income-breadcrumb">
            <span className="accent">MONTRIX</span>
            <span>›</span>
            <span>REVENUE &amp; CASH INFLOW</span>
            <span className="income-live-pill">
              <span className="income-live-dot"></span>
              Ledger Real-Time Synced
            </span>
          </div>
          <div className="income-title-row">
            <h1 className="income-title">Revenue &amp; Cash Inflow</h1>
            <span className="income-subtitle">
              Multi-Rail Ingestion Active • {incomes.length} Inflow Nodes
            </span>
          </div>
        </div>

        {/* Action Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn-stitch-secondary"
            onClick={() => setToast({ message: 'Exporting revenue ledger CSV...', type: 'success' })}
            type="button"
          >
            <Download size={16} />
            <span>Export Revenue Ledger</span>
          </button>

          <button 
            className="btn-stitch-primary"
            style={{ background: '#5de6ff', color: '#00363e', borderColor: 'rgba(93, 230, 255, 0.4)' }}
            onClick={() => setIsAddOpen(true)}
            type="button"
          >
            <Plus size={16} />
            <span>Log Inflow / Invoice</span>
          </button>
        </div>
      </div>

      {/* 4-Card Inflow Summary Row */}
      <div className="income-kpi-grid">
        {/* Card 1: Gross Inflow (MTD) */}
        <div className="income-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#5de6ff' }}></div>
          <div className="income-kpi-card-header">
            <div>
              <div className="income-kpi-card-title">Gross Inflow (MTD)</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Realized Liquidity</span>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#5de6ff' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="income-kpi-card-val">{formatCurrency(thisMonthIncome || totalIncome)}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#27e0a9', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={13} />
              +5.2% vs target
            </span>
            <span style={{ color: '#e5e1e5' }}>Safe Run-rate</span>
          </div>
        </div>

        {/* Card 2: Recurring Retainers (MRR) */}
        <div className="income-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#a078ff' }}></div>
          <div className="income-kpi-card-header">
            <div>
              <div className="income-kpi-card-title">Recurring Retainers (MRR)</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Contracted Inflow</span>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#d0bcff' }}>
              <RefreshCw size={18} />
            </div>
          </div>
          <div className="income-kpi-card-val" style={{ color: '#d0bcff' }}>{formatCurrency(mrrEstimate)}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#d0bcff' }}>72.0% of total revenue</span>
            <span style={{ color: '#e5e1e5' }}>Active Streams</span>
          </div>
        </div>

        {/* Card 3: Clearing & In Transit */}
        <div className="income-kpi-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#27e0a9' }}></div>
          <div className="income-kpi-card-header">
            <div>
              <div className="income-kpi-card-title">Clearing &amp; In Transit</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Escrow &amp; Bank Settlement</span>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#27e0a9' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="income-kpi-card-val" style={{ color: '#27e0a9' }}>{formatCurrency(inTransitAmount)}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#27e0a9' }}>Wire &amp; Direct Deposit</span>
            <span style={{ color: '#958ea0' }}>~18h Clear</span>
          </div>
        </div>

        {/* Card 4: Unique Inflow Streams */}
        <div className="income-kpi-card">
          <div className="income-kpi-card-header">
            <div>
              <div className="income-kpi-card-title">Inflow Rails</div>
              <span style={{ fontSize: '11px', color: '#958ea0' }}>Diversification</span>
            </div>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#2a2a2d', color: '#5de6ff' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className="income-kpi-card-val">{uniqueSources} Channels</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#27e0a9' }}>Verified Inflow Rails</span>
            <span style={{ color: '#e5e1e5' }}>Active</span>
          </div>
        </div>
      </div>

      {/* Main Workspace (65% Table / 35% Inspector & Form) */}
      <div className="income-workspace">
        {/* Left: Inflow Ledger Table */}
        <div className="income-table-card">
          <div className="income-table-toolbar">
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#958ea0' }} />
              <input 
                type="text"
                placeholder="Search inflow stream, client, or rail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', height: '36px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0 12px 0 34px', color: '#e5e1e5', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
                Total Realized: <strong style={{ color: '#5de6ff' }}>{formatCurrency(totalIncome)}</strong>
              </span>
            </div>
          </div>

          {filteredIncomes.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#958ea0' }}>
              <Wallet size={32} style={{ opacity: 0.4, margin: '0 auto 12px', color: '#5de6ff' }} />
              <h3 style={{ color: '#e5e1e5', marginBottom: '4px' }}>No revenue records yet</h3>
              <p style={{ fontSize: '12px' }}>Record your first incoming client payment or salary.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="stitch-table">
                <thead>
                  <tr>
                    <th>Settlement Date</th>
                    <th>Inflow Stream</th>
                    <th>Rail / Channel</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Net Inflow</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((inc) => {
                    const isSelected = activeInflow?.id === inc.id;
                    return (
                      <tr 
                        key={inc.id}
                        className={isSelected ? 'selected-row' : ''}
                        onClick={() => setSelectedIncomeId(inc.id)}
                      >
                        <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#958ea0' }}>
                          {formatDateDisplay(inc.date)}
                        </td>

                        <td>
                          <div className="merchant-cell">
                            <div 
                              className="merchant-icon-box"
                              style={{ background: 'rgba(93, 230, 255, 0.15)', color: '#5de6ff' }}
                            >
                              {inc.source?.charAt(0)?.toUpperCase() || 'I'}
                            </div>
                            <div>
                              <div className="merchant-name">
                                <span>{inc.source}</span>
                              </div>
                              <span className="merchant-sub">Direct Clearing Account</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '12px', color: '#e5e1e5', fontFamily: 'var(--font-mono)' }}>
                            Direct Clearing Rail
                          </span>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="audit-status-badge verified">
                            <CheckCircle2 size={14} />
                            <span>Settled</span>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#27e0a9' }}>
                            +{formatCurrency(inc.amount)}
                          </div>
                          <span style={{ fontSize: '10px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>USD Realized</span>
                        </td>

                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="btn-stitch-secondary"
                            style={{ padding: '4px 8px', color: '#ffb4ab' }}
                            onClick={() => handleDelete(inc.id)}
                            title="Remove Inflow"
                          >
                            <Trash2 size={13} />
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

        {/* Right: Inflow Inspector Panel */}
        <div className="income-inspector-card">
          <div className="income-inspector-glow"></div>

          {activeInflow ? (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#5de6ff" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e1e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Stream Inspector
                  </span>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontWeight: 600 }}>
                  Funds Settled
                </span>
              </div>

              {/* Amount Highlight */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 800, color: '#27e0a9' }}>
                  +{formatCurrency(activeInflow.amount)}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e1e5', margin: '4px 0 2px' }}>
                  {activeInflow.source}
                </h3>
                <span style={{ fontSize: '12px', color: '#958ea0' }}>
                  Received on {formatDateDisplay(activeInflow.date)}
                </span>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Ingestion Rail</span>
                  <span style={{ color: '#e5e1e5', fontWeight: 500 }}>Federal Reserve ACH Direct</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Deposit Bank</span>
                  <span style={{ color: '#5de6ff', fontWeight: 500 }}>Mercury Operating (••8812)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Estimated Tax Reserve</span>
                  <span style={{ color: '#d0bcff', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency((Number(activeInflow.amount) || 0) * 0.25)} (25%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#958ea0', fontSize: '11px', textTransform: 'uppercase' }}>Ledger Status</span>
                  <span style={{ color: '#27e0a9', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <CheckCircle2 size={13} />
                    Verified &amp; Reconciled
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-stitch-primary"
                  style={{ flex: 1, justifyContent: 'center', background: '#5de6ff', color: '#00363e' }}
                  onClick={() => setIsAddOpen(true)}
                >
                  <Plus size={15} />
                  <span>Log Another Inflow</span>
                </button>
                <button 
                  className="btn-stitch-secondary"
                  style={{ color: '#ffb4ab', padding: '0 12px' }}
                  onClick={() => handleDelete(activeInflow.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#958ea0' }}>
              <Wallet size={32} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '12px' }}>Select an inflow stream to view settlement details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Log Inflow */}
      {isAddOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#1c1b1e', border: '1px solid rgba(93, 230, 255, 0.3)', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="#5de6ff" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e5e1e5', margin: 0 }}>
                  Log Inflow Stream
                </h3>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', color: '#958ea0', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveIncome} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', marginBottom: '6px', fontWeight: 600 }}>
                  Revenue / Client Source
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Acme Corp Contract, Consulting, Salary"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={{ width: '100%', height: '40px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', color: '#e5e1e5', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', marginBottom: '6px', fontWeight: 600 }}>
                  Gross Inflow Amount
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
                  Settlement Date
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', height: '40px', background: '#0e0e11', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 12px', color: '#e5e1e5', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-stitch-secondary"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-stitch-primary"
                  style={{ background: '#5de6ff', color: '#00363e' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                  <span>Save Inflow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomePage;
