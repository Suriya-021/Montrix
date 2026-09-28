import React, { useState, useEffect } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { expenseService } from '../../services/expenseService';
import { useCurrency } from '../../context/CurrencyContext';
import { Loader2, Activity } from 'lucide-react';

function HeatmapWidget() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenses = await expenseService.getAll();
        
        // We need 1 year of data for the activity calendar, ending today
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // 1. Initialize a map of all days in the last year to 0
        const daysMap = {};
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          daysMap[dateStr] = 0;
        }

        // 2. Add expenses to the respective days
        expenses.forEach(exp => {
          const dateStr = new Date(exp.date).toISOString().split('T')[0];
          if (daysMap[dateStr] !== undefined) {
            daysMap[dateStr] += exp.amount;
          }
        });

        // 3. Find the max spending day to calculate relative levels (0-4)
        let maxSpent = 0;
        Object.values(daysMap).forEach(amt => {
          if (amt > maxSpent) maxSpent = amt;
        });

        // 4. Format data for the calendar
        const calendarData = Object.keys(daysMap).map(dateStr => {
          const amount = daysMap[dateStr];
          
          // Calculate intensity level (0-4)
          let level = 0;
          if (amount > 0) {
            if (amount < maxSpent * 0.25) level = 1;
            else if (amount < maxSpent * 0.5) level = 2;
            else if (amount < maxSpent * 0.75) level = 3;
            else level = 4;
          }

          return {
            date: dateStr,
            count: amount, // We store the actual amount here to show in the tooltip
            level: level
          };
        });

        // The library requires dates to be strictly sorted
        calendarData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setData(calendarData);
      } catch (err) {
        console.error("Failed to load heatmap data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    );
  }

  const explicitTheme = {
    light: ['#1e293b', '#0d3d30', '#0a6c50', '#08a177', '#06d6a0'],
    dark: ['#1e293b', '#0d3d30', '#0a6c50', '#08a177', '#06d6a0'],
  };

  return (
    <div className="glass-card" style={{ width: '100%', minWidth: 0 }}>
      <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
        Daily Spending Intensity
      </h2>
      
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
        <div style={{ minWidth: '750px', padding: '0.5rem' }}>
          <ActivityCalendar 
            data={data}
            theme={explicitTheme}
            colorScheme="dark"
            labels={{
              totalCount: '{{count}} spent in the last year',
            }}
            renderBlock={(block, activity) => {
              return React.cloneElement(block, {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${formatCurrency(activity.count)} on ${activity.date}`
              });
            }}
            blockSize={14}
            blockMargin={4}
            fontSize={14}
          />
        </div>
      </div>
      
      <Tooltip 
        id="heatmap-tooltip" 
        style={{ 
          backgroundColor: 'var(--bg-elevated)', 
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          color: '#fff',
          padding: '8px 12px',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          zIndex: 1000
        }}
      />
    </div>
  );
}

export default HeatmapWidget;
