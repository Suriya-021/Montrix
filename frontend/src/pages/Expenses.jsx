import React, { useState, useEffect } from 'react';
import { Trash2, Receipt, AlertCircle, Loader2, Pencil, Search } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import AddExpenseModal from '../components/AddExpenseModal/AddExpenseModal';
import Toast from '../components/Toast/Toast';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

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

  useEffect(() => {
    loadExpenses();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // 1. Filter the expenses array before rendering
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
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
          {/* Search and Filter Bar */}
          {expenses.length > 0 && (
            <div className="filters-bar">
              <div className="search-bar">
                <Search className="search-bar__icon" size={18} />
                <input 
                  type="text" 
                  className="search-bar__input" 
                  placeholder="Search your expenses..." 
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
          )}

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
              <div className="table-container">
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
                        <td className="date">{formatDate(expense.date)}</td>
                        <td>
                          <span className={`badge badge--${expense.category.toLowerCase()}`}>{expense.category}</span>
                        </td>
                        <td>{expense.description}</td>
                        <td className="amount">{formatCurrency(expense.amount)}</td>
                        <td className="actions">
                          {/* Edit Button */}
                          <button 
                            className="action-btn" 
                            style={{ marginRight: '0.5rem' }}
                            onClick={() => handleEditClick(expense)}
                            title="Edit Expense"
                          >
                            <Pencil size={18} />
                          </button>
                          {/* Delete Button */}
                          <button 
                            className="action-btn action-btn--delete" 
                            onClick={() => handleDelete(expense.id)}
                            title="Delete Expense"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
