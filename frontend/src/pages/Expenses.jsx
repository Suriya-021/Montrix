import React, { useState, useEffect } from 'react';
import { Trash2, Receipt, AlertCircle, Loader2 } from 'lucide-react';
import { expenseService } from '../services/expenseService';

/**
 * Expenses Page Component
 * Displays a list of all expenses fetched from the backend.
 * Includes loading states, error handling, and the ability to delete expenses.
 */
function Expenses() {
  // State to hold our list of expenses
  const [expenses, setExpenses] = useState([]);
  
  // State to track if we are currently waiting for the API to respond
  const [isLoading, setIsLoading] = useState(true);
  
  // State to hold any error messages if the API call fails
  const [error, setError] = useState(null);

  // useEffect runs once when the component first appears on the screen
  useEffect(() => {
    loadExpenses();
  }, []);

  // Function to fetch expenses from our backend
  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expenseService.getAll();
      
      // Sort expenses by date (newest first)
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sortedData);
    } catch (err) {
      setError('Failed to load expenses. Please check if the backend server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle deleting an expense
  const handleDelete = async (id) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseService.delete(id);
      // If successful, remove the deleted item from our local state
      // This updates the UI without needing to refresh the page or hit the API again
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (err) {
      alert('Failed to delete expense. Please try again.');
    }
  };

  // Helper function to format the amount as Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // No decimals for cleaner look
    }).format(amount);
  };

  // Helper function to format the date into a readable format (e.g., "Jan 23, 2026")
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
      </div>

      {/* Conditional Rendering: Show loading, error, empty, or actual data */}
      {isLoading ? (
        <div className="empty-state">
          {/* We use a simple inline style keyframe animation for the spinner */}
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="empty-state__text">Loading expenses...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <AlertCircle className="empty-state__icon" style={{ color: 'var(--error)' }} />
          <h3 className="empty-state__title">Oops!</h3>
          <p className="empty-state__text">{error}</p>
          <button className="btn btn--primary" onClick={loadExpenses}>
            Try Again
          </button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <Receipt className="empty-state__icon" />
          <h3 className="empty-state__title">No expenses yet</h3>
          <p className="empty-state__text">Click the "Add Expense" button in the sidebar to get started.</p>
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
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="date">{formatDate(expense.date)}</td>
                    <td>
                      {/* We dynamically apply the category color badge class defined in index.css */}
                      <span className={`badge badge--${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.description}</td>
                    <td className="amount">{formatCurrency(expense.amount)}</td>
                    <td className="actions">
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
    </div>
  );
}

export default Expenses;
