import React from 'react';
import { Plus, Target, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Widgets.css';

const GRADIENTS = [
  { gradient: 'linear-gradient(90deg, #06D6A0, #22D3EE)', pctColor: '#22D3EE' },
  { gradient: 'linear-gradient(90deg, #10B981, #06D6A0)', pctColor: '#10B981' },
  { gradient: 'linear-gradient(90deg, #9D74FF, #F472B6)', pctColor: '#F472B6' },
  { gradient: 'linear-gradient(90deg, #3B82F6, #9D74FF)', pctColor: '#9D74FF' },
];

const SavingsGoalsWidget = ({ goals = [], formatCurrency }) => {
  const rawGoals = Array.isArray(goals) ? goals : [];

  const displayGoals = rawGoals.slice(0, 3).map((g, idx) => {
    const cur = Number(g.current_amount || 0);
    const tgt = Number(g.target_amount || 1);
    const pct = Math.min(100, Math.round((cur / tgt) * 100));
    const style = GRADIENTS[idx % GRADIENTS.length];

    return {
      id: g.id || idx,
      title: g.title || g.name || 'Financial Goal',
      percentage: pct,
      current: cur,
      target: tgt,
      gradient: style.gradient,
      pctColor: style.pctColor
    };
  });

  return (
    <div className="milestones-widget-ref">
      {/* Header */}
      <div className="milestones-widget-ref__header">
        <div>
          <h3 className="milestones-title">Target Milestones</h3>
          <p className="milestones-subtitle">Capital allocation towards structured funds</p>
        </div>
        <Link to="/planning" className="milestones-add-btn" title="Add Milestone">
          <Plus size={16} />
        </Link>
      </div>

      {/* Goal Items or Clean Empty State */}
      {rawGoals.length === 0 ? (
        <div className="widget-empty-state">
          <div className="widget-empty-icon" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <PiggyBank size={22} />
          </div>
          <h4 className="widget-empty-title">No savings goals set</h4>
          <p className="widget-empty-desc">
            Define savings targets for emergency reserves, investments, or large planned purchases in capital planning.
          </p>
          <Link to="/planning" className="widget-empty-btn" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#6EE7B7' }}>
            <Plus size={14} />
            <span>Create First Goal</span>
          </Link>
        </div>
      ) : (
        <div className="milestones-list">
          {displayGoals.map((m) => {
            const formattedCurrent = formatCurrency 
              ? formatCurrency(m.current) 
              : `$${m.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const formattedTarget = formatCurrency 
              ? formatCurrency(m.target) 
              : `$${m.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            return (
              <div key={m.id} className="milestone-card-item">
                {/* Title & Percentage Header */}
                <div className="milestone-meta-row">
                  <span className="milestone-name">{m.title}</span>
                  <span className="milestone-pct font-mono" style={{ color: m.pctColor }}>
                    {m.percentage}%
                  </span>
                </div>

                {/* Progress Track */}
                <div className="milestone-track">
                  <div 
                    className="milestone-bar-fill" 
                    style={{ width: `${m.percentage}%`, background: m.gradient }}
                  ></div>
                </div>

                {/* Amounts Row */}
                <div className="milestone-amounts-row">
                  <span className="milestone-current font-mono">
                    {formattedCurrent} saved
                  </span>
                  <span className="milestone-target font-mono">
                    Target: {formattedTarget}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(SavingsGoalsWidget);
