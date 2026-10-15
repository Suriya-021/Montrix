import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import './Charts.css';

const CATEGORY_COLORS = {
  Food: '#06D6A0',
  Transport: '#3B82F6',
  Entertainment: '#8B5CF6',
  Shopping: '#EC4899',
  Bills: '#F59E0B',
  Health: '#EF4444',
  Education: '#6366F1',
  Games: '#22D3EE',
  Investment: '#10B981',
  Income: '#10B981',
  Other: '#64748B'
};

const CategoryDonut = ({ data = [], totalValue, formatCurrency }) => {
  const rawData = Array.isArray(data) ? data : [];
  
  // Normalize breakdown data with colors (memoized to eliminate re-allocation)
  const chartData = useMemo(() => {
    return rawData
      .filter(item => Number(item.value || 0) > 0)
      .map(item => ({
        name: item.name || 'Other',
        value: Number(item.value || 0),
        color: item.color || CATEGORY_COLORS[item.name] || '#64748B'
      }))
      .sort((a, b) => b.value - a.value);
  }, [rawData]);

  const displayTotal = totalValue || (formatCurrency ? formatCurrency(0) : '$0.00');

  return (
    <div className="category-donut-ref">
      {/* Header */}
      <div className="category-donut-ref__header">
        <div>
          <h3 className="category-title">Expenses by Category</h3>
          <p className="category-subtitle">Normalized categorical capital drain</p>
        </div>
        <span className="this-month-pill">This Month</span>
      </div>

      {chartData.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '40px 16px', 
          textAlign: 'center' 
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(157, 116, 255, 0.08)',
            border: '1px solid rgba(157, 116, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C084FC',
            marginBottom: 12
          }}>
            <PieIcon size={22} />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
            No expense breakdown yet
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 260, lineHeight: 1.45 }}>
            Categorized spending will appear here as soon as you record or import transactions.
          </div>
        </div>
      ) : (
        <>
          {/* Donut Container with Center Overlay */}
          <div className="donut-center-stage">
            <div style={{ width: '100%', height: 180, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [
                      formatCurrency ? formatCurrency(val) : `$${Number(val).toLocaleString()}`, 
                      'Spent'
                    ]}
                    contentStyle={{ 
                      background: '#0D0D14', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: 8, 
                      fontSize: 12 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Badge */}
              <div className="donut-center-content">
                <span className="donut-center-label">TOTAL SPENT</span>
                <span className="donut-center-amt font-mono">{displayTotal}</span>
                <span className="within-budget-badge">Active Ledger</span>
              </div>
            </div>
          </div>

          {/* Legend Rows */}
          <div className="donut-legend-grid">
            {chartData.map((item, idx) => {
              const formattedVal = formatCurrency 
                ? formatCurrency(item.value) 
                : `$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

              return (
                <div key={idx} className="donut-legend-row">
                  <div className="donut-legend-left">
                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="legend-name-text">{item.name}</span>
                  </div>
                  <span className="donut-legend-val font-mono">
                    {formattedVal}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(CategoryDonut);
