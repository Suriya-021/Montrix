import React from 'react';

/**
 * Expenses Page.
 * Displays the list of all expenses and allows managing them.
 */
function Expenses() {
  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ color: 'var(--text-primary)' }}>Expenses</h1>
        <button className="add-expense-btn" style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: 'var(--accent-primary, #06D6A0)', 
          color: '#121212', 
          border: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Add Expense
        </button>
      </header>
      
      <div className="page-content" style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
        <p>Expenses page coming soon...</p>
      </div>
    </div>
  );
}

export default Expenses;
