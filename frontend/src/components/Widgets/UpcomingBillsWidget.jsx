import React, { useState } from 'react';
import { Calendar, Check, Clock, Plus, Zap, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import './Widgets.css';

const getDueBadge = (dueDateStr) => {
  if (!dueDateStr) return { text: 'Scheduled', type: 'normal' };
  try {
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Overdue ${Math.abs(diffDays)}d`, type: 'urgent' };
    if (diffDays === 0) return { text: 'Due Today', type: 'urgent' };
    if (diffDays <= 3) return { text: `Due in ${diffDays}d`, type: 'urgent' };
    if (diffDays <= 7) return { text: `Due in ${diffDays}d`, type: 'cyan' };
    return { text: `In ${diffDays}d`, type: 'normal' };
  } catch {
    return { text: 'Upcoming', type: 'normal' };
  }
};

const formatDueDateText = (dueDateStr) => {
  if (!dueDateStr) return 'Due soon';
  try {
    const d = new Date(dueDateStr);
    if (isNaN(d.getTime())) return dueDateStr;
    return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } catch {
    return 'Due soon';
  }
};

const UpcomingBillsWidget = ({ bills = [], formatCurrency, onBillPaid }) => {
  const [paidIds, setPaidIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const handlePay = async (billId) => {
    setLoadingId(billId);
    try {
      if (subscriptionService.pay) {
        await subscriptionService.pay(billId);
      }
      setPaidIds(prev => [...prev, billId]);
      if (onBillPaid) onBillPaid();
      window.dispatchEvent(new CustomEvent('expenseDataChanged'));
    } catch (err) {
      console.error("Failed to pay bill:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const rawBills = Array.isArray(bills) ? bills : [];
  
  // Sort upcoming bills by next_due_date ascending
  const sortedBills = [...rawBills].sort((a, b) => {
    const dateA = a.next_due_date ? new Date(a.next_due_date).getTime() : Infinity;
    const dateB = b.next_due_date ? new Date(b.next_due_date).getTime() : Infinity;
    return dateA - dateB;
  });

  const displayBills = sortedBills.slice(0, 4);

  return (
    <div className="bills-widget-ref">
      {/* Header */}
      <div className="bills-widget-ref__header">
        <div className="bills-title-left">
          <h3 className="bills-title">Scheduled Bills</h3>
          {rawBills.length > 0 && (
            <span className="bills-pending-badge">
              {rawBills.length} Pending
            </span>
          )}
        </div>
        <Link to="/subscriptions" className="bills-calendar-link">
          Manage Calendar
        </Link>
      </div>

      {/* Bill List or Clean Empty State */}
      {rawBills.length === 0 ? (
        <div className="widget-empty-state">
          <div className="widget-empty-icon" style={{ background: 'rgba(34, 211, 238, 0.08)', color: '#22D3EE', borderColor: 'rgba(34, 211, 238, 0.2)' }}>
            <Calendar size={22} />
          </div>
          <h4 className="widget-empty-title">No scheduled bills</h4>
          <p className="widget-empty-desc">
            Keep track of your recurring software subscriptions and utilities to avoid unexpected renewal charges.
          </p>
          <Link to="/subscriptions" className="widget-empty-btn" style={{ borderColor: 'rgba(34, 211, 238, 0.3)', color: '#67E8F9' }}>
            <Plus size={14} />
            <span>Add Subscription</span>
          </Link>
        </div>
      ) : (
        <div className="bills-list">
          {displayBills.map((bill, idx) => {
            const isPaid = paidIds.includes(bill.id);
            const badgeMeta = getDueBadge(bill.next_due_date);
            const formattedAmt = formatCurrency 
              ? formatCurrency(bill.amount || 0) 
              : `$${Number(bill.amount || 0).toFixed(2)}`;

            return (
              <div key={bill.id || idx} className="bill-card-item">
                <div className="bill-item-left">
                  <div 
                    className="bill-icon-wrapper" 
                    style={{ background: 'rgba(157, 116, 255, 0.15)', color: '#9D74FF' }}
                  >
                    <Zap size={16} />
                  </div>
                  <div className="bill-meta">
                    <span className="bill-name" title={bill.title || bill.name || 'Subscription'}>
                      {bill.title || bill.name || 'Subscription'}
                    </span>
                    <div className="bill-timing">
                      <span className="bill-due-date font-mono">
                        {formatDueDateText(bill.next_due_date)}
                      </span>
                      <span className={`bill-due-badge ${badgeMeta.type}`}>
                        {badgeMeta.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bill-item-right">
                  <span className="bill-amount font-mono">
                    {formattedAmt}
                  </span>
                  <button 
                    className={`bill-log-paid-btn ${isPaid ? 'paid' : ''}`}
                    onClick={() => handlePay(bill.id)}
                    disabled={isPaid || loadingId === bill.id}
                  >
                    {isPaid ? (
                      <>
                        <Check size={12} />
                        Paid
                      </>
                    ) : (
                      loadingId === bill.id ? 'Logging...' : 'Log Paid'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(UpcomingBillsWidget);
