import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Receipt, Repeat, Wallet, 
  Target, BarChart3, Settings, Command
} from 'lucide-react';
import './Sidebar.css';

/**
 * Montrix Reference Sidebar Component
 * Matches the reference dark fintech aesthetic pixel-for-pixel.
 */
function Sidebar({ onAddExpense, onOpenCommand }) {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
    { to: '/income', icon: Wallet, label: 'Income' },
    { to: '/planning', icon: Target, label: 'Planning' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__icon-hex">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke="#9D74FF" strokeWidth="2" strokeLinejoin="round" fill="rgba(157, 116, 255, 0.15)"/>
            <path d="M12 6L16.33 8.5V13.5L12 16L7.67 13.5V8.5L12 6Z" fill="#9D74FF"/>
          </svg>
        </div>
        <div className="sidebar-logo__meta">
          <span className="sidebar-logo__brand">Montrix</span>
          <span className="sidebar-logo__version">v2.1</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            end={item.end}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <item.icon className="nav-icon" size={18} />
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Command Trigger */}
      <div className="sidebar-bottom">
        <button 
          className="quick-command-btn" 
          onClick={onOpenCommand || onAddExpense}
          title="Open Quick Command (⌘K)"
        >
          <div className="quick-command-left">
            <Command size={15} />
            <span>Quick Command</span>
          </div>
          <kbd className="quick-command-badge">⌘K</kbd>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
