import React, { useState } from 'react';
import BudgetsPage from './BudgetsPage';
import GoalsPage from './GoalsPage';
import { Target, Trophy } from 'lucide-react';

function PlanningPage() {
  const [activeTab, setActiveTab] = useState('budgets');
  
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-5)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Financial Planning</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)', fontSize: '0.9rem' }}>
            Coordinate category spend limits and track long-term savings milestones.
          </p>
        </div>
      </div>
      
      {/* V2 Sleek Segmented Pill Navigation */}
      <div style={{ 
        display: 'inline-flex', 
        padding: '4px', 
        background: 'rgba(12, 12, 20, 0.8)', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '10px', 
        marginBottom: 'var(--space-6)',
        gap: '4px'
      }}>
        <button 
          onClick={() => setActiveTab('budgets')}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'budgets' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'budgets' ? '#FFFFFF' : 'var(--text-muted)',
            boxShadow: activeTab === 'budgets' ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
          }}
        >
          <Target size={15} />
          Category Budgets
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'goals' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'goals' ? '#FFFFFF' : 'var(--text-muted)',
            boxShadow: activeTab === 'goals' ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
          }}
        >
          <Trophy size={15} />
          Savings Goals
        </button>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'budgets' ? <BudgetsPage hideHeader={true} /> : <GoalsPage hideHeader={true} />}
      </div>
    </div>
  );
}

export default PlanningPage;
