
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { expenseService } from '../../services/expenseService';
import './SpendingHeatmap.css';

const SpendingHeatmap = () => {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await expenseService.getAll();
        setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses for heatmap', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpenses();
    
    const handleDataChange = () => fetchExpenses();
    window.addEventListener('expenseDataChanged', handleDataChange);
    return () => window.removeEventListener('expenseDataChanged', handleDataChange);
  }, []);

  // 1. Generate the grid dates
  const { grid, months, maxSpend, totalYearSpend } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map expenses by date string 'YYYY-MM-DD'
    const expenseMap = {};
    let totalSpent = 0;
    
    if (expenses && Array.isArray(expenses)) {
      expenses.forEach(exp => {
        // Handle timezone issues by taking the first 10 chars
        const dateStr = exp.date.split('T')[0];
        expenseMap[dateStr] = (expenseMap[dateStr] || 0) + exp.amount;
      });
    }

    // We want 52 columns of 7 days
    const numCols = 52;
    const numRows = 7;
    const todayDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

    // Start date is exactly 52 weeks ago, plus an offset to start on a Sunday
    // For example, if today is Wednesday (3), the start date is 51 weeks + 3 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - ((numCols - 1) * 7) - todayDayOfWeek);

    const newGrid = [];
    const newMonths = [];
    let currentMonth = -1;
    let max = 0;

    for (let c = 0; c < numCols; c++) {
      const col = [];
      for (let r = 0; r < numRows; r++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (c * 7) + r);
        
        // Extract YYYY-MM-DD safely
        const year = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${m}-${d}`;
        
        const isFuture = currentDate > today;
        const amount = isFuture ? 0 : (expenseMap[dateStr] || 0);
        
        if (!isFuture && amount > 0) {
          totalSpent += amount;
          if (amount > max) max = amount;
        }
        
        // Track months for the header
        if (r === 0) {
          const monthIndex = currentDate.getMonth();
          if (monthIndex !== currentMonth) {
            newMonths.push({
              index: c, // the column index this month starts
              name: currentDate.toLocaleString('default', { month: 'short' })
            });
            currentMonth = monthIndex;
          }
        }
        
        col.push({
          date: currentDate,
          dateStr: dateStr,
          amount: amount,
          isFuture: isFuture
        });
      }
      newGrid.push(col);
    }
    
    return { grid: newGrid, months: newMonths, maxSpend: max, totalYearSpend: totalSpent };
  }, [expenses]);

  // Determine intensity level (0-4) based on quartiles or simple buckets
  const getLevel = (amount) => {
    if (amount === 0) return 0;
    if (amount < maxSpend * 0.25) return 1;
    if (amount < maxSpend * 0.5) return 2;
    if (amount < maxSpend * 0.75) return 3;
    return 4;
  };

  if (isLoading) {
    return (
      <div className="heatmap-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-purple)' }} />
      </div>
    );
  }

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <h3 className="heatmap-title">
          <Activity size={20} className="heatmap-icon" />
          Daily Spending Intensity
        </h3>
      </div>
      
      <div className="heatmap-container">
        {/* Months Row */}
        <div className="heatmap-months">
          {months.map((m, i) => {
            // Calculate left margin based on column index difference
            const prevColIndex = i === 0 ? 0 : months[i-1].index;
            const diffCols = m.index - prevColIndex;
            return (
              <div 
                key={i} 
                className="heatmap-month-label"
                style={{ width: `${(i === 0 ? m.index : diffCols) * 15}px` }}
              >
                {m.name}
              </div>
            );
          })}
        </div>
        
        {/* Grid Area */}
        <div className="heatmap-grid-wrapper">
          <div className="heatmap-grid">
            {grid.map((col, cIdx) => (
              <div key={cIdx} className="heatmap-col">
                {col.map((day, rIdx) => (
                  <div 
                    key={rIdx} 
                    className={`heatmap-cell ${day.isFuture ? 'is-future' : ''}`}
                    data-level={getLevel(day.amount)}
                    title={`${day.date.toDateString()}: ${formatCurrency(day.amount)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="heatmap-footer">
        <div>
          <span>{formatCurrency(totalYearSpend)} spent in the last year</span>
        </div>
        
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <div className="legend-cell" data-level="0" />
          <div className="legend-cell" data-level="1" />
          <div className="legend-cell" data-level="2" />
          <div className="legend-cell" data-level="3" />
          <div className="legend-cell" data-level="4" />
          <span className="legend-label">More</span>
        </div>
      </div>
    </div>
  );
};

export default SpendingHeatmap;
