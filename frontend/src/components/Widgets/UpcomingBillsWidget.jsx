import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import './Widgets.css';

/**
 * UpcomingBillsWidget - Displays a list of upcoming bills and payments
 * 
 * @param {Array} bills - Array of bill objects { id, name, amount, dueDate, daysUntilDue }
 * @param {Function} formatCurrency - Formatter function for currency display
 */
const UpcomingBillsWidget = ({ bills = [], formatCurrency = (val) => `$${val}` }) => {
  // Helper to calculate days until due
  const getDaysUntilDue = (dateString) => {
    if (!dateString) return 999;
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Sort bills by days until due, then take max 4
  const sortedBills = [...bills]
    .map(bill => ({
      ...bill,
      daysUntilDue: getDaysUntilDue(bill.next_due_date || bill.next_due),
      dueDateFormatted: (bill.next_due_date || bill.next_due) ? new Date(bill.next_due_date || bill.next_due).toLocaleDateString() : 'N/A'
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 4);

  const getDueBadgeClass = (days) => {
    if (days <= 3) return 'badge--urgent';
    if (days <= 7) return 'badge--warning';
    return 'badge--normal';
  };

  const getIconColor = (index) => {
    const colors = ['--accent-blue', '--accent-purple', '--accent-cyan', '--accent-teal'];
    return colors[index % colors.length];
  };

  return (
    <div className="glass-card widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Upcoming Payments</h3>
        <a href="/subscriptions" className="widget-link">
          All bills <ChevronRight size={16} />
        </a>
      </div>
      
      <div className="widget-list">
        {sortedBills.length === 0 ? (
          <div className="widget-empty">No upcoming bills</div>
        ) : (
          sortedBills.map((bill, index) => {
            const billName = bill.title || bill.name || 'Bill';
            return (
            <div key={bill.id || index} className="widget-item">
              <div 
                className="widget-item__icon" 
                style={{ backgroundColor: `var(${getIconColor(index)})`, opacity: 0.8 }}
              >
                {billName.charAt(0).toUpperCase()}
              </div>
              
              <div className="widget-item__info">
                <span className="widget-item__name">{billName}</span>
                <span className="widget-item__subtitle">
                  {bill.frequency || 'Monthly'}, next on {bill.dueDateFormatted} 
                  <span className={`due-badge ${getDueBadgeClass(bill.daysUntilDue)}`} style={{ marginLeft: '8px', fontSize: '11px' }}>
                    {bill.daysUntilDue === 0 ? 'Due today' : bill.daysUntilDue < 0 ? 'Overdue' : `In ${bill.daysUntilDue}d`}
                  </span>
                </span>
              </div>
              
              <div className="widget-item__amount font-mono">
                {formatCurrency(bill.amount)}
              </div>
            </div>
          )}
          )
        )}
      </div>
    </div>
  );
};

export default UpcomingBillsWidget;
