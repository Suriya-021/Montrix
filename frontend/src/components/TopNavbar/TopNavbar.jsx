import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, CheckCircle2, AlertTriangle, Zap, Clock, X } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import './TopNavbar.css';

const PAGE_TITLES = {
  '/': 'Overview',
  '/expenses': 'Audit Ledger & Expenses',
  '/income': 'Revenue & Inflow',
  '/analytics': 'Financial Analytics',
  '/planning': 'Runway & Planning',
  '/subscriptions': 'Recurring Cadence & Bills',
  '/settings': 'Settings & Workspace',
};

function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  if (location.pathname === '/') {
    return null;
  }

  const pageTitle = PAGE_TITLES[location.pathname] || 'Montrix';
  
  // Get user initial from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = (user.full_name || user.username || 'User')[0].toUpperCase();

  // Current month for the selector
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Load upcoming bills for the notification tray
  useEffect(() => {
    subscriptionService.getAll().then(bills => {
      if (Array.isArray(bills)) {
        const alerts = bills.slice(0, 3).map(b => ({
          id: b.id,
          title: b.title || b.name,
          subtitle: `Scheduled renewal of $${Number(b.amount || 0).toFixed(2)} due on ${b.next_due_date || 'soon'}`,
          type: 'bill'
        }));
        setNotifications(alerts);
      }
    }).catch(() => {});
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/expenses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="topnav">
      <div className="topnav__left">
        <h1 className="topnav__title">{pageTitle}</h1>
      </div>

      <div className="topnav__center">
        <div className="topnav__search">
          <Search size={16} className="topnav__search-icon" />
          <input 
            type="text" 
            className="topnav__search-input" 
            placeholder="Search ledger by description, category... (Enter ↵)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>
      </div>

      <div className="topnav__right" ref={notifRef}>
        <span className="topnav__month-select">
          {currentMonth} <ChevronDown size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
        </span>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="topnav__btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications Tray"
          >
            <Bell size={18} />
            {notifications.length > 0 && <span className="topnav__badge"></span>}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '320px',
              borderRadius: '14px',
              background: '#0C0C12',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
              padding: '16px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Activity &amp; Alerts</span>
                <span style={{ fontSize: '10px', color: '#27e0a9', fontFamily: 'var(--font-mono)' }}>Live Synced</span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#958ea0', textAlign: 'center', padding: '16px 0' }}>
                  No pending alerts or notifications.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/subscriptions');
                      }}
                    >
                      <Zap size={15} color="#5de6ff" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8F0' }}>{n.title}</div>
                        <div style={{ fontSize: '11px', color: '#958ea0', marginTop: '2px', lineHeight: 1.35 }}>{n.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div 
          className="topnav__avatar" 
          onClick={() => navigate('/settings')}
          title="Account Settings"
          style={{ cursor: 'pointer' }}
        >
          {userInitial}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
