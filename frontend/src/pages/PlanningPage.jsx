import React, { useState } from 'react';
import BudgetsPage from './BudgetsPage';
import GoalsPage from './GoalsPage';

function PlanningPage() {
  const [activeTab, setActiveTab] = useState('budgets');
  
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">Budgets & Goals</h1>
      </div>
      
      {/* Custom Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('budgets')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1rem', 
            color: activeTab === 'budgets' ? 'var(--accent-primary)' : 'var(--text-muted)', 
            cursor: 'pointer', 
            borderBottom: activeTab === 'budgets' ? '2px solid var(--accent-primary)' : 'none', 
            paddingBottom: '0.5rem', 
            fontWeight: activeTab === 'budgets' ? 'bold' : 'normal',
            transition: 'color 0.2s'
          }}
        >
          Smart Budgets
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1rem', 
            color: activeTab === 'goals' ? 'var(--accent-primary)' : 'var(--text-muted)', 
            cursor: 'pointer', 
            borderBottom: activeTab === 'goals' ? '2px solid var(--accent-primary)' : 'none', 
            paddingBottom: '0.5rem', 
            fontWeight: activeTab === 'goals' ? 'bold' : 'normal',
            transition: 'color 0.2s'
          }}
        >
          Savings Goals
        </button>
      </div>
      
      {/* Render the selected tab content and hide their individual headers */}
      {activeTab === 'budgets' ? <BudgetsPage hideHeader={true} /> : <GoalsPage hideHeader={true} />}
    </div>
  );
}

export default PlanningPage;
