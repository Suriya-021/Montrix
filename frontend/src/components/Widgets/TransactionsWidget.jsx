import React from 'react';
import '../Charts/Charts.css'; // Reuse chart header styles

/**
 * TransactionsWidget - Displays recent transactions
 */
const TransactionsWidget = ({ transactions, formatCurrency }) => {
  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Helper to get a consistent color based on name string
  const getAvatarColor = (name) => {
    const colors = [
      'var(--accent-cyan)', 
      'var(--accent-blue)', 
      'var(--accent-purple)', 
      'var(--accent-teal)',
      '#F59E0B', // amber
      '#EF4444'  // red
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="chart-card glass-card">
      <div className="chart-header flex-between">
        <h3 className="chart-title">Recent Transactions</h3>
        <a href="/expenses" className="chart-link">Show more &gt;</a>
      </div>
      
      <div className="transactions-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
        {transactions && transactions.slice(0, 5).map((tx) => {
          const isNegative = tx.amount < 0;
          const displayAmount = formatCurrency ? formatCurrency(Math.abs(tx.amount)) : `$${Math.abs(tx.amount).toFixed(2)}`;
          const avatarColor = getAvatarColor(tx.description);

          return (
            <div 
              key={tx.id} 
              className="transaction-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                transition: 'background var(--transition-base)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* Avatar */}
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${avatarColor}20`,
                  color: avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  marginRight: 'var(--space-4)'
                }}
              >
                {getInitials(tx.description)}
              </div>
              
              {/* Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.9rem' }}>
                    {tx.description}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {tx.category}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {tx.date}
                </span>
              </div>
              
              {/* Amount */}
              <div 
                className="font-mono"
                style={{ 
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}
              >
                -{displayAmount}
              </div>
            </div>
          );
        })}
        {(!transactions || transactions.length === 0) && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsWidget;
