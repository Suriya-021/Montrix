import React from 'react';

/**
 * Dashboard Page.
 * Acts as the home page showing an overview of expenses.
 */
function Dashboard() {
  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-header">
        <h1 className="page-title" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
      </header>
      
      <div className="page-content" style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
        <p>Dashboard coming soon...</p>
      </div>
    </div>
  );
}

export default Dashboard;
