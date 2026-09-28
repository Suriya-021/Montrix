import React from 'react';
import { ChevronRight, Target } from 'lucide-react';
import './Widgets.css';

/**
 * SavingsGoalsWidget - Displays current progress towards financial goals
 * 
 * @param {Array} goals - Array of goal objects { id, title, currentAmount, targetAmount }
 * @param {Function} formatCurrency - Formatter function for currency display
 */
const SavingsGoalsWidget = ({ goals = [], formatCurrency = (val) => `$${val}` }) => {
  // Take max 3 goals
  const displayGoals = goals.slice(0, 3);

  const calculateProgress = (current, target) => {
    if (!target) return 0;
    const percentage = (current / target) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
  };

  return (
    <div className="glass-card widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Saving goals</h3>
        <a href="/planning" className="widget-link">
          Show more <ChevronRight size={16} />
        </a>
      </div>
      
      <div className="widget-list">
        {displayGoals.length === 0 ? (
          <div className="widget-empty">No active goals</div>
        ) : (
          displayGoals.map((goal, index) => {
            const current = goal.current_amount || goal.currentAmount || 0;
            const target = goal.target_amount || goal.targetAmount || 0;
            const progress = calculateProgress(current, target);
            
            return (
              <div key={goal.id || index} className="widget-goal-item">
                <div className="widget-goal-header">
                  <div className="widget-goal-title">
                    <Target size={16} className="widget-goal-icon" />
                    <span>{goal.title || goal.name}</span>
                  </div>
                  <span className="widget-goal-percentage">{Math.round(progress)}%</span>
                </div>
                
                <div className="widget-progress">
                  <div 
                    className="widget-progress__fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="widget-goal-amounts">
                  <span className="amount-current">{formatCurrency(current)}</span>
                  <span className="amount-target">of {formatCurrency(target)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SavingsGoalsWidget;
