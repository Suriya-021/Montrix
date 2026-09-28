import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './Charts.css';

/**
 * Custom Tooltip for the CategoryDonut
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-item" style={{ color: payload[0].payload.color }}>
          <span className="chart-tooltip-name">{payload[0].name}:</span>
          <span className="chart-tooltip-value font-mono">
            ${payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * CategoryDonut - Donut chart with center overlay and custom legend
 */
const CategoryDonut = ({ data, totalLabel, totalValue }) => {
  return (
    <div className="chart-card glass-card">
      <div className="chart-header flex-between">
        <h3 className="chart-title">All Expense</h3>
        <a href="/analytics" className="chart-link">Show more &gt;</a>
      </div>
      
      <div className="donut-container">
        <div className="donut-chart-wrapper">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="chart-center-label">
            <div className="center-label-value font-mono">{totalValue}</div>
            <div className="center-label-text">Total expenses<br/>per month</div>
          </div>
        </div>

        <div className="chart-legend">
          {data.map((item, index) => (
            <div key={index} className="chart-legend__item">
              <div className="legend-left">
                <div className="chart-legend__dot" style={{ backgroundColor: item.color }}></div>
                <span className="legend-name">{item.name}</span>
              </div>
              <div className="legend-right">
                <span className="legend-value font-mono">${item.value.toLocaleString()}</span>
                <span className="legend-percent">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDonut;
