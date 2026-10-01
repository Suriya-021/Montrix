import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

/**
 * StatCard - A reusable KPI card component
 * Displays a metric with an icon, sparkline, and percentage change.
 */
const StatCard = ({ icon: Icon, label, value, change, changeType, color, sparklineData }) => {
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'var(--accent-teal)' : 'var(--accent-purple)';

  return (
    <div className="stat-card glass-card" style={{ borderTopColor: color }}>
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {Icon && <Icon size={20} />}
        </div>
        <div className="stat-card-label">{label}</div>
      </div>
      
      <div className="stat-card-value font-mono">{value}</div>
      
      <div className="stat-card-footer">
        <div className="stat-card-change" style={{ color: changeColor, backgroundColor: `${changeColor}20` }}>
          <ChangeIcon size={14} />
          <span>{change}</span>
        </div>
        
        <div className="stat-card-sparkline">
          {sparklineData && sparklineData.length > 0 && (
            <ResponsiveContainer width="100%" height={32}>
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  fill={`url(#gradient-${label})`} 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
