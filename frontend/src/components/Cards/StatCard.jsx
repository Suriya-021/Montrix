import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import './StatCard.css';

/**
 * Montrix Reference Telemetry StatCard
 * Displays rich financial metrics matching the reference fintech dashboard.
 */
const StatCard = ({ 
  label, 
  value, 
  badgeText, 
  badgeType = 'positive', 
  valueColor, 
  sparklineData,
  middleItem,
  footerLeft,
  footerRight,
  footerHighlight
}) => {
  return (
    <div className="stat-card-ref">
      {/* Top Header Row */}
      <div className="stat-card-ref__header">
        <span className="stat-card-ref__label">{label}</span>
        {badgeText && (
          <span className={`stat-card-ref__badge stat-card-ref__badge--${badgeType}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Primary Value */}
      <div 
        className="stat-card-ref__value font-mono" 
        style={{ color: valueColor || '#FFFFFF' }}
      >
        {value}
      </div>

      {/* Middle Item / Sub-telemetry */}
      {middleItem && (
        <div className="stat-card-ref__middle">
          {middleItem}
        </div>
      )}

      {/* Mini Sparkline (if present) */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="stat-card-ref__sparkline">
          <ResponsiveContainer width="100%" height={36}>
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="purpleWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9D74FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#9D74FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#9D74FF" 
                strokeWidth={2}
                fill="url(#purpleWave)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Row */}
      {(footerLeft || footerRight || footerHighlight) && (
        <div className="stat-card-ref__footer">
          {footerLeft && <span className="footer-dim">{footerLeft}</span>}
          {footerRight && <span className="footer-right">{footerRight}</span>}
          {footerHighlight && <span className="footer-highlight">{footerHighlight}</span>}
        </div>
      )}
    </div>
  );
};

export default React.memo(StatCard);
