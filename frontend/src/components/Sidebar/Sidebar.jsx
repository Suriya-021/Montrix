import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Settings, Plus, LogOut, Target, Calendar, Trophy, Wallet } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../context/CurrencyContext';
import './Sidebar.css';

/**
 * Sidebar navigation component.
 * Allows the user to navigate through different sections of the application.
 */
function Sidebar({ onAddExpense }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { currency, changeCurrency } = useCurrency();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'];

  return (
    <aside className="sidebar">
      {/* Top section containing logo and navigation links */}
      <div className="sidebar-top">
        {/* Application Logo */}
        <div className="sidebar-logo">
          <span className="logo-mon">Mon</span>
          <span className="logo-trix">trix</span>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <LayoutDashboard className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>
          
          <NavLink to="/expenses" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Receipt className="nav-icon" />
            <span className="nav-text">Expenses</span>
          </NavLink>
          
          <NavLink to="/income" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Wallet className="nav-icon" />
            <span className="nav-text">Income</span>
          </NavLink>
          
          <NavLink to="/planning" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Target className="nav-icon" />
            <span className="nav-text">Planning</span>
          </NavLink>
          
          <NavLink to="/subscriptions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Calendar className="nav-icon" />
            <span className="nav-text">Subscriptions</span>
          </NavLink>
          
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <BarChart3 className="nav-icon" />
            <span className="nav-text">Analytics</span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Settings className="nav-icon" />
            <span className="nav-text">Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom section containing the Add Expense button */}
      <div className="sidebar-bottom">
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <select 
            value={currency} 
            onChange={(e) => changeCurrency(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer'
            }}
          >
            {currencies.map(c => (
              <option key={c} value={c} style={{ color: '#000' }}>{c}</option>
            ))}
          </select>
        </div>

        <button className="nav-item" onClick={handleLogout} style={{ width: '100%', marginBottom: '16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <LogOut className="nav-icon" />
          <span className="nav-text">Logout</span>
        </button>
        <button className="add-expense-btn" onClick={onAddExpense}>
          <Plus className="btn-icon" />
          <span className="btn-text">Add Expense</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
