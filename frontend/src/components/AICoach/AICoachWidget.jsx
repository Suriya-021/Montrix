import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Bot } from 'lucide-react';
import { apiFetch } from '../../services/api';

function AICoachWidget() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/insights/coach');
      setInsights(data.insights || []);
    } catch (err) {
      console.error(err);
      setError("AI Coach is currently quiet. Keep tracking your spending to receive customized tips!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div style={{
      borderRadius: '16px',
      background: '#0C0C12',
      border: '1px solid rgba(160, 120, 255, 0.25)',
      padding: '22px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Top Gradient Highlight */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '3px', 
        background: 'linear-gradient(90deg, #a078ff, #5de6ff, #27e0a9)' 
      }}></div>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(160, 120, 255, 0.15)',
            color: '#d0bcff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
              Gemini Financial Intelligence
            </h3>
            <span style={{ fontSize: '11px', color: '#958ea0' }}>
              Powered by Google Gemini 2.5 Flash
            </span>
          </div>
        </div>

        <button 
          onClick={fetchInsights}
          disabled={isLoading}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#d0bcff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 0', color: '#958ea0', fontSize: '13px' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#a078ff' }} />
          <span>Synthesizing categorical patterns and generating personalized strategies...</span>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', color: '#ffb4ab', fontSize: '13px' }}>
          <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {insights.map((insight, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'flex-start',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ 
                background: '#a078ff', 
                color: '#23005c', 
                borderRadius: '6px', 
                width: '20px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '11px', 
                fontWeight: 700, 
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {index + 1}
              </div>
              <p style={{ margin: 0, color: '#E2E8F0', fontSize: '13px', lineHeight: 1.5 }}>
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AICoachWidget;
