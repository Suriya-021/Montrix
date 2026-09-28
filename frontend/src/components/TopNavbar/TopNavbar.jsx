import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import './TopNavbar.css';

/**
 * V2 TopNavbar Component
 * Sticky header with search, month selector, and user avatar.
 */

const PAGE_TITLES = {
  '/': 'Overview',
  '/expenses': 'Transactions',
  '/income': 'Income',
  '/analytics': 'Analytics',
  '/planning': 'Budgets',
  '/subscriptions': 'Upcoming Bills',
  '/settings': 'Settings',
};

function TopNavbar() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Montrix';
  
  // Get user initial from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = (user.username || 'U')[0].toUpperCase();

  // Current month for the selector
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

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
            placeholder="Search transactions..." 
          />
        </div>
      </div>

      <div className="topnav__right">
        <span className="topnav__month-select">
          {currentMonth} <ChevronDown size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
        </span>

        <button className="topnav__btn">
          <Bell size={18} />
          <span className="topnav__badge"></span>
        </button>

        <div className="topnav__avatar">
          {userInitial}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
