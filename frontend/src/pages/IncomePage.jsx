import React, { useState, useEffect } from 'react';
import { incomeService } from '../services/incomeService';
import { useCurrency } from '../context/CurrencyContext';
import Toast from '../components/Toast/Toast';
import { Loader2, AlertCircle, Wallet, Plus, Trash2, TrendingUp, Calendar } from 'lucide-react';

function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomeService.getAll();
      setIncomes(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load income records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault();
    if (!source || !amount || !date) {
      setToast({ message: 'Please fill out all fields.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await incomeService.create({
        source,
        amount: Number(amount),
        date
      });
      
      // Reset form
      setSource('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      
      setToast({ message: 'Income recorded successfully!', type: 'success' });
      loadIncomes();
    } catch (err) {
      setToast({ message: 'Failed to save income record.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    
    try {
      await incomeService.delete(id);
      setToast({ message: 'Income deleted successfully.', type: 'success' });
      loadIncomes();
    } catch (err) {
      setToast({ message: 'Failed to delete income.', type: 'error' });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate statistics
  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthIncome = incomes
    .filter(inc => {
      const d = new Date(inc.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, inc) => sum + Number(inc.amount), 0);
    
  const uniqueSources = new Set(incomes.map(inc => inc.source)).size;

  if (isLoading && incomes.length === 0) {
    return (
      <div className="empty-state">
        <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading your income records...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Income</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Track your earnings and cash flow</p>
      </div>

      {error && (
        <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {/* Summary Stats Row */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        {/* Total Income Stat */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(6, 214, 160, 0.15)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Income</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalIncome)}</h3>
          </div>
        </div>

        {/* This Month Stat */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 187, 249, 0.15)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>This Month</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-mono)' }}>{formatCurrency(thisMonthIncome)}</h3>
          </div>
        </div>

        {/* Sources Stat */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(114, 9, 183, 0.15)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={24} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Sources</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-mono)' }}>{uniqueSources}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Create Form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Wallet size={20} style={{ color: 'var(--accent-primary)' }} />
            Log Income
          </h2>
          
          <form onSubmit={handleSaveIncome} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Income Source</label>
              <input 
                type="text" 
                className="form-input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Salary, Freelance, Dividend"
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
                placeholder="e.g. 85000"
                min="1"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date Received</label>
              <input 
                type="date" 
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn--primary" disabled={isSubmitting} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
              Save Income
            </button>
          </form>
        </div>

        {/* Right Side: Income History Table */}
        <div className="glass-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Income History</h2>
          
          {incomes.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <p>No income recorded yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((inc) => (
                    <tr key={inc.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(inc.date)}</td>
                      <td><strong>{inc.source}</strong></td>
                      <td style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                        +{formatCurrency(inc.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(inc.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                          title="Delete Income"
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default IncomePage;
