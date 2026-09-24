import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Settings, Plus } from 'lucide-react';
import './Sidebar.css';

/**
 * Sidebar navigation component.
 * Allows the user to navigate through different sections of the application.
 */
function Sidebar({ onAddExpense }) {
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
        <button className="add-expense-btn" onClick={onAddExpense}>
          <Plus className="btn-icon" />
          <span className="btn-text">Add Expense</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
