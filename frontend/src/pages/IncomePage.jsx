import React, { useState, useEffect } from 'react';
import { incomeService } from '../services/incomeService';
import { Loader2, AlertCircle, Wallet, Plus, Trash2 } from 'lucide-react';

function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError('Please fill out all fields.');
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
      
      loadIncomes();
    } catch (err) {
      setError('Failed to save income record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    
    try {
      await incomeService.delete(id);
      loadIncomes();
    } catch (err) {
      setError('Failed to delete income.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading your income records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Income & Cash Flow</h1>
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
            <Wallet size={20} style={{ color: 'var(--accent-primary)' }} />
            Log Income
          </h2>
          
          <form onSubmit={handleSaveIncome} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <label className="form-label">Amount (INR)</label>
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
                      <td className="date">{formatDate(inc.date)}</td>
                      <td><strong>{inc.source}</strong></td>
                      <td className="amount" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
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
    </div>
  );
}

export default IncomePage;
