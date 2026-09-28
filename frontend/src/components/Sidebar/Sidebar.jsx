import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Receipt, BarChart3, Settings, Plus, LogOut, 
  Target, Calendar, Wallet, Zap, CreditCard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../context/CurrencyContext';
import './Sidebar.css';

/**
 * V2 Sidebar Component
 * Premium collapsible navigation with gradient accents.
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

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/expenses', icon: Receipt, label: 'Transactions' },
    { to: '/income', icon: Wallet, label: 'Income' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/planning', icon: Target, label: 'Budgets' },
    { to: '/subscriptions', icon: CreditCard, label: 'Bills' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__icon">
          <Zap size={20} />
        </div>
        <div className="sidebar-logo__text">
          <span className="logo-mon">Mon</span>
          <span className="logo-trix">trix</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink 
            key={item.to}
            to={item.to} 
            end={item.end}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <div className="sidebar-currency">
          <select 
            value={currency} 
            onChange={(e) => changeCurrency(e.target.value)}
          >
            {currencies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button className="add-expense-btn" onClick={onAddExpense}>
          <Plus size={18} />
          <span className="btn-text">Add Expense</span>
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
