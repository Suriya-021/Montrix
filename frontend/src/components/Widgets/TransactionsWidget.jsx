import React, { useState } from 'react';
import { 
  ChevronRight, Coffee, CreditCard, ShoppingBag, 
  Car, Zap, Film, HeartPulse, GraduationCap, 
  Gamepad2, TrendingUp, Wallet, Receipt, Plus,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Widgets.css';

// Map standard categories to icons and theme colors
const CATEGORY_MAP = {
  Food: { icon: Coffee, color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.15)' },
  Transport: { icon: Car, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  Entertainment: { icon: Film, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  Shopping: { icon: ShoppingBag, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' },
  Bills: { icon: Zap, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  Health: { icon: HeartPulse, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  Education: { icon: GraduationCap, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' },
  Games: { icon: Gamepad2, color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.15)' },
  Investment: { icon: TrendingUp, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  Income: { icon: Wallet, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  Other: { icon: Receipt, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' }
};

const getCategoryMeta = (category) => {
  if (!category) return CATEGORY_MAP.Other;
  return CATEGORY_MAP[category] || CATEGORY_MAP.Other;
};

const formatTxDate = (dateStr) => {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const TransactionsWidget = ({ transactions = [], formatCurrency, onAddExpense }) => {
  const [filter, setFilter] = useState('All');

  // Filter dynamic transactions based on tab
  const items = Array.isArray(transactions) ? transactions : [];
  
  const filteredItems = items.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Expenses') return !t.is_income && t.category !== 'Income';
    if (filter === 'Income') return t.is_income || t.category === 'Income';
    return true;
  });

  const displayItems = filteredItems.slice(0, 5);

  return (
    <div className="tx-widget-ref">
      {/* Header */}
      <div className="tx-widget-ref__header">
        <div>
          <h3 className="tx-title">Recent Transactions</h3>
          <p className="tx-subtitle">Verified clearing ledger across synchronized accounts</p>
        </div>

        <div className="tx-header-right">
          <div className="tx-filter-pills">
            {['All', 'Expenses', 'Income'].map(tab => (
              <button 
                key={tab} 
                className={`tx-filter-btn ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link to="/expenses" className="tx-view-all">
            <span>View All ({items.length})</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Transactions Table or Clean Empty State */}
      {items.length === 0 ? (
        <div className="widget-empty-state">
          <div className="widget-empty-icon">
            <Receipt size={22} />
          </div>
          <h4 className="widget-empty-title">No transactions logged yet</h4>
          <p className="widget-empty-desc">
            Your transactions ledger is currently empty. Start logging expenses or import a statement to track your spending.
          </p>
          {onAddExpense ? (
            <button className="widget-empty-btn" onClick={onAddExpense}>
              <Plus size={14} />
              <span>Log First Expense</span>
            </button>
          ) : (
            <Link to="/expenses" className="widget-empty-btn">
              <Plus size={14} />
              <span>Go to Expenses</span>
            </Link>
          )}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="widget-empty-state">
          <div className="widget-empty-icon">
            <FileText size={22} />
          </div>
          <h4 className="widget-empty-title">No {filter.toLowerCase()} found</h4>
          <p className="widget-empty-desc">
            No entries match your active filter. Switch back to "All" to view your full ledger.
          </p>
          <button className="widget-empty-btn" onClick={() => setFilter('All')}>
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          <div className="tx-table-container">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>ENTITY / PURPOSE</th>
                  <th>CATEGORY</th>
                  <th>TIMESTAMP</th>
                  <th className="align-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((tx, idx) => {
                  const meta = getCategoryMeta(tx.category);
                  const IconComp = meta.icon;
                  const isIncome = Boolean(tx.is_income || tx.category === 'Income');
                  const formattedAmt = formatCurrency 
                    ? formatCurrency(Math.abs(tx.amount || 0)) 
                    : `$${Number(Math.abs(tx.amount || 0)).toFixed(2)}`;

                  return (
                    <tr key={tx.id || idx}>
                      {/* Entity / Purpose */}
                      <td>
                        <div className="tx-entity-cell">
                          <div 
                            className="tx-icon-box" 
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            <IconComp size={16} />
                          </div>
                          <div className="tx-entity-meta">
                            <span className="tx-entity-name" title={tx.description || 'Transaction'}>
                              {tx.description || tx.title || 'Transaction'}
                            </span>
                            <span className="tx-entity-sub">
                              {tx.category || 'General Ledger'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td>
                        <span className="tx-cat-pill">
                          <span 
                            className="tx-cat-dot" 
                            style={{ backgroundColor: meta.color }}
                          ></span>
                          {tx.category || 'Other'}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <span className="tx-timestamp font-mono">
                          {formatTxDate(tx.date)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="align-right">
                        <span className={`tx-amount font-mono ${isIncome ? 'income' : 'expense'}`}>
                          {isIncome ? `+${formattedAmt}` : `-${formattedAmt}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer with 100% Real Numbers */}
          <div className="tx-table-footer">
            <span className="tx-entries-text">
              Showing {displayItems.length} of {filteredItems.length} entries
            </span>
            <div className="tx-pagination-controls">
              <Link to="/expenses" className="tx-view-all" style={{ fontSize: '11px' }}>
                <span>Manage All in Ledger</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsWidget;
