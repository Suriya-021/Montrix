import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { getHeaders } from '../../services/expenseService';

function AICoachWidget() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${BASE_URL}/insights/coach`, {
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI insights');
        }
        
        const data = await response.json();
        setInsights(data.insights || []);
      } catch (err) {
        console.error(err);
        setError("AI Coach is currently sleeping. We'll have tips for you soon!");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  return (
    <div className="glass-card ai-coach-widget" style={{ border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--accent-primary), #8B5CF6)' }}></div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
        <h3 className="section-title" style={{ margin: 0, background: 'linear-gradient(90deg, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI Spending Coach
        </h3>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Gemini AI is analyzing your spending...</span>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={16} style={{ marginTop: '3px' }} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {insights.map((insight, index) => (
            <li key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ 
                background: 'rgba(6, 214, 160, 0.1)', 
                color: 'var(--accent-primary)', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.4 }}>
                {insight}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AICoachWidget;
