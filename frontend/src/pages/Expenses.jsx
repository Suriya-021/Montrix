import React, { useState, useEffect } from 'react';
import { 
  Trash2, Receipt, AlertCircle, Loader2, Pencil, 
  Search, TrendingDown, Calendar, Tag, Download 
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import AddExpenseModal from '../components/AddExpenseModal/AddExpenseModal';
import Toast from '../components/Toast/Toast';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

const CATEGORY_COLORS = {
  Food: '#06D6A0', Transport: '#3B82F6', Entertainment: '#8B5CF6', 
  Shopping: '#EC4899', Bills: '#F59E0B', Health: '#EF4444', 
  Education: '#6366F1', Games: '#22D3EE', Investment: '#10B981', 
  Other: '#64748B'
};

/**
 * Expenses Page Component
 * Displays a list of all expenses fetched from the backend.
 * Includes loading states, error handling, search/filtering, and the ability to delete/edit expenses.
 */
function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // States for Edit functionality
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadExpenses();
    
    const handleDataChange = () => {
      loadExpenses();
    };
    
    window.addEventListener('expenseDataChanged', handleDataChange);
    return () => window.removeEventListener('expenseDataChanged', handleDataChange);
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expenseService.getAll();
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sortedData);
    } catch (err) {
      setError('Failed to load expenses. Please check if the backend server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
      setToast({ show: true, message: 'Expense deleted successfully', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete expense', type: 'error' });
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
  };

  const handleSaveEdit = async (expenseData) => {
    try {
      const updatedExpense = await expenseService.update(expenseData.id, expenseData);
      setExpenses(expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
      setToast({ show: true, message: 'Expense updated successfully!', type: 'success' });
      setEditingExpense(null);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to update expense', type: 'error' });
    }
  };

  const handleExportCSV = () => {
    if (expenseService.exportCSV) {
      expenseService.exportCSV();
    } else {
      setToast({ show: true, message: 'Export functionality not available', type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Filter the expenses array before rendering
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const thisMonthSpent = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);
    
  const uniqueCategories = new Set(expenses.map(e => e.category)).size;

  return (
    <div className="fade-in">
      <style>{`
        .expenses-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-6);
        }
        .expenses-header-titles h1 {
          margin: 0 0 var(--space-1) 0;
        }
        .expenses-subtitle {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }
        
        .stat-grid-custom {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        
        .stat-card {
          padding: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .stat-icon-wrapper {
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: var(--space-1);
        }
        .stat-value {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .filters-wrapper {
          padding: var(--space-3);
          margin-bottom: var(--space-6);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
        }
        
        .filters-group {
          display: flex;
          gap: var(--space-3);
          flex: 1;
        }
        
        .search-container {
          position: relative;
          flex: 1;
          max-width: 300px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          padding: var(--space-2) var(--space-3) var(--space-2) 36px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--accent-primary);
        }
        
        .filter-select {
          padding: var(--space-2) var(--space-3);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          outline: none;
        }
        
        .results-count {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        
        .category-cell {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .date-text {
          color: var(--text-muted);
        }
        
        .amount-text {
          color: var(--error);
          font-family: var(--font-mono);
        }
        
        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
        }
        .action-btn-custom {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .action-btn-custom:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.1);
        }
        .action-btn-custom.delete:hover {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .mobile-expense-list {
          display: none;
          flex-direction: column;
          gap: var(--space-3);
        }
        .mobile-expense-card {
          padding: var(--space-3);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .mobile-card-title {
          font-weight: 500;
          color: var(--text-primary);
        }
        .mobile-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .expenses-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }
          .stat-grid-custom {
            grid-template-columns: 1fr;
          }
          .filters-wrapper {
            flex-direction: column;
            align-items: stretch;
          }
          .filters-group {
            flex-direction: column;
          }
          .search-container {
            max-width: 100%;
          }
          .results-count {
            text-align: right;
          }
          
          /* Hide table, show cards on mobile */
          .desktop-table-container {
            display: none;
          }
          .mobile-expense-list {
            display: flex;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Page Header */}
      <div className="expenses-header">
        <div className="expenses-header-titles">
          <h1 className="page-title">Expenses</h1>
          <p className="expenses-subtitle">Track and manage your spending</p>
        </div>
        <button className="btn btn--secondary" onClick={handleExportCSV}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="empty-state__text">Loading expenses...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <AlertCircle className="empty-state__icon" style={{ color: 'var(--error)' }} />
          <h3 className="empty-state__title">Oops!</h3>
          <p className="empty-state__text">{error}</p>
          <button className="btn btn--primary" onClick={loadExpenses}>Try Again</button>
        </div>
      ) : (
        <>
          {/* Summary Stats Row */}
          {expenses.length > 0 && (
            <div className="stat-grid-custom">
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                  <TrendingDown size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Spent</span>
                  <span className="stat-value">{formatCurrency(totalSpent)}</span>
                </div>
              </div>
              
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)' }}>
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">This Month</span>
                  <span className="stat-value">{formatCurrency(thisMonthSpent)}</span>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
                  <Tag size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Categories</span>
                  <span className="stat-value">{uniqueCategories}</span>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          {expenses.length > 0 && (
            <div className="glass-card filters-wrapper">
              <div className="filters-group">
                <div className="search-container">
                  <Search className="search-icon" size={18} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search expenses..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="results-count">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </div>
            </div>
          )}

          {/* Data States */}
          {expenses.length === 0 ? (
            <div className="empty-state">
              <Receipt className="empty-state__icon" />
              <h3 className="empty-state__title">No expenses yet</h3>
              <p className="empty-state__text">Click the "Add Expense" button in the sidebar to get started.</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <Search className="empty-state__icon" />
              <h3 className="empty-state__title">No results found</h3>
              <p className="empty-state__text">We couldn't find any expenses matching your search.</p>
              <button className="btn btn--secondary" onClick={() => { setSearchTerm(''); setFilterCategory('All'); }} style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="glass-card">
              {/* Desktop Table View */}
              <div className="table-container desktop-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="date-text">{formatDate(expense.date)}</td>
                        <td>
                          <div className="category-cell">
                            <span 
                              className="category-dot" 
                              style={{ backgroundColor: CATEGORY_COLORS[expense.category] || CATEGORY_COLORS['Other'] }} 
                            />
                            <span className={`badge badge--${expense.category.toLowerCase()}`}>{expense.category}</span>
                          </div>
                        </td>
                        <td>{expense.description}</td>
                        <td className="amount-text" style={{ textAlign: 'right' }}>
                          -{formatCurrency(expense.amount)}
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              className="action-btn-custom" 
                              onClick={() => handleEditClick(expense)}
                              title="Edit Expense"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              className="action-btn-custom delete" 
                              onClick={() => handleDelete(expense.id)}
                              title="Delete Expense"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="mobile-expense-list">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="mobile-expense-card">
                    <div className="mobile-card-header">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="mobile-card-title">{expense.description}</span>
                        <span className="date-text" style={{ fontSize: '0.85rem' }}>{formatDate(expense.date)}</span>
                      </div>
                      <span className="amount-text">-{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="mobile-card-footer">
                      <div className="category-cell">
                        <span 
                          className="category-dot" 
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] || CATEGORY_COLORS['Other'] }} 
                        />
                        <span className={`badge badge--${expense.category.toLowerCase()}`}>{expense.category}</span>
                      </div>
                      <div className="actions-cell">
                        <button 
                          className="action-btn-custom" 
                          onClick={() => handleEditClick(expense)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          className="action-btn-custom delete" 
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal Instance */}
      <AddExpenseModal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        onAdd={handleSaveEdit}
        expenseToEdit={editingExpense}
      />
    </div>
  );
}

export default Expenses;
