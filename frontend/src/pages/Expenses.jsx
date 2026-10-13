import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Receipt, AlertCircle, Loader2, Pencil, 
  Search, TrendingDown, Calendar, Tag, Download,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, SlidersHorizontal
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import AddExpenseModal from '../components/AddExpenseModal/AddExpenseModal';
import Toast from '../components/Toast/Toast';
import { useCurrency } from '../context/CurrencyContext';

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

const DEFAULT_CATEGORY_COLORS = {
  Food: '#06D6A0', Transport: '#3B82F6', Entertainment: '#8B5CF6', 
  Shopping: '#EC4899', Bills: '#F59E0B', Health: '#EF4444', 
  Education: '#6366F1', Games: '#22D3EE', Investment: '#10B981', 
  Other: '#64748B'
};

function getDateBounds(preset, customStart, customEnd) {
  const now = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (preset === 'all') return { startDate: '', endDate: '' };

  if (preset === 'this-month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: formatYMD(start), endDate: formatYMD(end) };
  }

  if (preset === 'last-month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: formatYMD(start), endDate: formatYMD(end) };
  }

  if (preset === '30-days') {
    const start = new Date();
    start.setDate(now.getDate() - 30);
    return { startDate: formatYMD(start), endDate: formatYMD(now) };
  }

  if (preset === '90-days') {
    const start = new Date();
    start.setDate(now.getDate() - 90);
    return { startDate: formatYMD(start), endDate: formatYMD(now) };
  }

  if (preset === 'custom') {
    return { startDate: customStart || '', endDate: customEnd || '' };
  }

  return { startDate: '', endDate: '' };
}

function Expenses() {
  const { formatCurrency } = useCurrency();

  // Data & stats
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [globalStats, setGlobalStats] = useState(null);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [categoryColorMap, setCategoryColorMap] = useState(DEFAULT_CATEGORY_COLORS);

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [datePreset, setDatePreset] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modal & Toast
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Initial load for categories & global stats
  useEffect(() => {
    loadCategoriesAndStats();
  }, []);

  const loadCategoriesAndStats = async () => {
    try {
      const [cats, stats] = await Promise.all([
        categoryService.getAll().catch(() => []),
        expenseService.getStats().catch(() => null)
      ]);

      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(cats.map(c => c.name));
        const colorMap = { ...DEFAULT_CATEGORY_COLORS };
        cats.forEach(c => {
          if (c.color) colorMap[c.name] = c.color;
        });
        setCategoryColorMap(colorMap);
      }
      setGlobalStats(stats);
    } catch (err) {
      console.error('Failed to load initial categories/stats:', err);
    }
  };

  // Main fetch function for expenses
  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateBounds(datePreset, customStartDate, customEndDate);

      const params = {
        category: filterCategory,
        search: searchTerm,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        page,
        pageSize
      };

      const result = await expenseService.getAll(params);

      if (result && typeof result === 'object' && Array.isArray(result.items)) {
        setExpenses(result.items);
        setTotalCount(result.total);
        setTotalPages(result.total_pages || 1);
      } else if (Array.isArray(result)) {
        setExpenses(result);
        setTotalCount(result.length);
        setTotalPages(1);
      } else {
        setExpenses([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, [datePreset, customStartDate, customEndDate, filterCategory, searchTerm, sortBy, sortOrder, page, pageSize]);

  // Refetch when filters or pagination change
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Listen for global expense change events
  useEffect(() => {
    const handleDataChange = () => {
      loadExpenses();
      loadCategoriesAndStats();
    };
    window.addEventListener('expenseDataChanged', handleDataChange);
    return () => window.removeEventListener('expenseDataChanged', handleDataChange);
  }, [loadExpenses]);

  // Handlers
  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setFilterCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(id);
      setToast({ show: true, message: 'Expense deleted successfully', type: 'success' });
      loadExpenses();
      loadCategoriesAndStats();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete expense', type: 'error' });
    }
  };

  const handleSaveEdit = async (expenseData) => {
    try {
      await expenseService.update(expenseData.id, expenseData);
      setToast({ show: true, message: 'Expense updated successfully!', type: 'success' });
      setEditingExpense(null);
      loadExpenses();
      loadCategoriesAndStats();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to update expense', type: 'error' });
    }
  };

  const handleExportCSV = () => {
    if (expenseService.exportCSV) {
      expenseService.exportCSV();
    } else {
      setToast({ show: true, message: 'Export functionality not available', type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Stats calculation
  const totalAllTime = globalStats?.total_spent ?? expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthSpent = globalStats?.this_month_spent ?? 0;
  const categoriesCount = categoriesList.length;

  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="fade-in">
      <style>{`
        .expenses-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-6);
        }
        .expenses-header-titles h1 {
          margin: 0 0 var(--space-1) 0;
        }
        .expenses-subtitle {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }
        
        .stat-grid-custom {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        
        .stat-card {
          padding: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .stat-icon-wrapper {
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: var(--space-1);
        }
        .stat-value {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .filters-panel {
          padding: var(--space-4);
          margin-bottom: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .filters-primary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        
        .search-container {
          position: relative;
          flex: 1 1 240px;
          min-width: 200px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          padding: var(--space-2) var(--space-3) var(--space-2) 36px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          outline: none;
          font-size: 0.9rem;
          transition: border-color var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--accent-primary);
        }

        .preset-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .preset-pill {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .preset-pill:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.07);
        }
        .preset-pill.active {
          background: var(--accent-primary);
          color: #fff;
          border-color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.35);
        }
        
        .filters-secondary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          flex-wrap: wrap;
          padding-top: var(--space-3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .filter-select {
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          outline: none;
          font-size: 0.85rem;
        }

        .custom-date-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .custom-date-inputs input[type="date"] {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }

        .sort-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: inherit;
          font: inherit;
          cursor: pointer;
          padding: 0;
        }
        .sort-btn:hover {
          color: var(--accent-primary);
        }
        
        .category-cell {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .date-text {
          color: var(--text-muted);
        }
        
        .amount-text {
          color: var(--error);
          font-family: var(--font-mono);
          font-weight: 600;
        }
        
        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
        }
        .action-btn-custom {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .action-btn-custom:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.1);
        }
        .action-btn-custom.delete:hover {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: var(--space-3);
        }
        .pagination-btn {
          padding: 5px 12px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
        }
        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .mobile-expense-list {
          display: none;
          flex-direction: column;
          gap: var(--space-3);
        }
        .mobile-expense-card {
          padding: var(--space-3);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .mobile-card-title {
          font-weight: 500;
          color: var(--text-primary);
        }
        .mobile-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        @media (max-width: 768px) {
          .expenses-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }
          .stat-grid-custom {
            grid-template-columns: 1fr;
          }
          .filters-panel {
            gap: var(--space-3);
          }
          .filters-primary-row, .filters-secondary-row {
            flex-direction: column;
            align-items: stretch;
          }
          .search-container {
            max-width: 100%;
          }
          .custom-date-inputs {
            flex-wrap: wrap;
          }
          .desktop-table-container {
            display: none;
          }
          .mobile-expense-list {
            display: flex;
          }
          .pagination-bar {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Page Header */}
      <div className="expenses-header">
        <div className="expenses-header-titles">
          <h1 className="page-title">Expenses</h1>
          <p className="expenses-subtitle">Track, filter, and audit your financial transactions</p>
        </div>
        <button className="btn btn--secondary" onClick={handleExportCSV}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Export CSV
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stat-grid-custom">
        <div className="glass-card stat-card" style={{ borderTop: '2px solid #8B5CF6' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}>
            <TrendingDown size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">{formatCurrency(totalAllTime)}</span>
          </div>
        </div>
        
        <div className="glass-card stat-card" style={{ borderTop: '2px solid #22D3EE' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 211, 238, 0.12)', color: '#22D3EE' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">This Month</span>
            <span className="stat-value">{formatCurrency(thisMonthSpent)}</span>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderTop: '2px solid #10B981' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <Tag size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Categories</span>
            <span className="stat-value">{categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters & Sorting Panel */}
      <div className="glass-card filters-panel">
        {/* Top Row: Search & Date Presets */}
        <div className="filters-primary-row">
          <div className="search-container">
            <Search className="search-icon" size={17} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search expenses by description..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Quick Date Presets */}
          <div className="preset-pills">
            <button 
              className={`preset-pill ${datePreset === 'all' ? 'active' : ''}`}
              onClick={() => handleDatePresetChange('all')}
            >
              All Time
            </button>
            <button 
              className={`preset-pill ${datePreset === 'this-month' ? 'active' : ''}`}
              onClick={() => handleDatePresetChange('this-month')}
            >
              This Month
            </button>
            <button 
              className={`preset-pill ${datePreset === 'last-month' ? 'active' : ''}`}
              onClick={() => handleDatePresetChange('last-month')}
            >
              Last Month
            </button>
            <button 
              className={`preset-pill ${datePreset === '30-days' ? 'active' : ''}`}
              onClick={() => handleDatePresetChange('30-days')}
            >
              30 Days
            </button>
            <button 
              className={`preset-pill ${datePreset === '90-days' ? 'active' : ''}`}
              onClick={() => handleDatePresetChange('90-days')}
            >
              90 Days
            </button>
            <button 
              className={`preset-pill ${datePreset === 'custom' ? 'active' : ''}`}
              onClick={() => handleDatePresetChange('custom')}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Secondary Row: Category, Custom Dates, Sorting, Per Page */}
        <div className="filters-secondary-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {/* Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select 
                className="filter-select"
                value={filterCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Custom Date Bounds */}
            {datePreset === 'custom' && (
              <div className="custom-date-inputs">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => { setCustomStartDate(e.target.value); setPage(1); }}
                  placeholder="Start"
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => { setCustomEndDate(e.target.value); setPage(1); }}
                  placeholder="End"
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {/* Sort Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
              <select 
                className="filter-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
              >
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
              </select>
            </div>

            {/* Page Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Show:</span>
              <select 
                className="filter-select"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="empty-state" style={{ height: '40vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
          <p className="empty-state__text" style={{ marginTop: '1rem' }}>Loading expenses...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <AlertCircle className="empty-state__icon" style={{ color: 'var(--error)' }} />
          <h3 className="empty-state__title">Failed to load</h3>
          <p className="empty-state__text">{error}</p>
          <button className="btn btn--primary" onClick={loadExpenses}>Try Again</button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
          {searchTerm || filterCategory !== 'All' || datePreset !== 'all' ? (
            <>
              <Search className="empty-state__icon" style={{ opacity: 0.6, marginBottom: '1rem' }} />
              <h3 className="empty-state__title">No matching expenses</h3>
              <p className="empty-state__text" style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                We couldn't find any expenses matching your filters. Try clearing your filters or changing date bounds.
              </p>
              <button 
                className="btn btn--secondary" 
                onClick={() => { 
                  setSearchTerm(''); 
                  setFilterCategory('All'); 
                  setDatePreset('all'); 
                  setPage(1); 
                }}
              >
                Reset Filters
              </button>
            </>
          ) : (
            <>
              <Receipt className="empty-state__icon" style={{ opacity: 0.6, marginBottom: '1rem' }} />
              <h3 className="empty-state__title">No expenses logged yet</h3>
              <p className="empty-state__text" style={{ maxWidth: '400px', margin: '0.5rem auto 1rem auto' }}>
                Start tracking your spending by adding an expense using the button in the sidebar.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="glass-card">
          {/* Desktop Table View */}
          <div className="table-container desktop-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button className="sort-btn" onClick={() => handleSortToggle('date')}>
                      <span>Date</span>
                      {sortBy === 'date' ? (
                        sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : <ArrowUpDown size={14} style={{ opacity: 0.5 }} />}
                    </button>
                  </th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>
                    <button className="sort-btn" style={{ justifyContent: 'flex-end', width: '100%' }} onClick={() => handleSortToggle('amount')}>
                      <span>Amount</span>
                      {sortBy === 'amount' ? (
                        sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : <ArrowUpDown size={14} style={{ opacity: 0.5 }} />}
                    </button>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const catColor = categoryColorMap[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category] || '#8B5CF6';
                  return (
                    <tr key={expense.id}>
                      <td className="date-text">{formatDate(expense.date)}</td>
                      <td>
                        <div className="category-cell">
                          <span 
                            className="category-dot" 
                            style={{ backgroundColor: catColor, boxShadow: `0 0 6px ${catColor}66` }} 
                          />
                          <span 
                            style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.8rem', 
                              fontWeight: 500,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            {expense.category}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{expense.description}</td>
                      <td className="amount-text" style={{ textAlign: 'right' }}>
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="action-btn-custom" 
                            onClick={() => setEditingExpense(expense)}
                            title="Edit Expense"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            className="action-btn-custom delete" 
                            onClick={() => handleDelete(expense.id)}
                            title="Delete Expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-expense-list">
            {expenses.map((expense) => {
              const catColor = categoryColorMap[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category] || '#8B5CF6';
              return (
                <div key={expense.id} className="mobile-expense-card">
                  <div className="mobile-card-header">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="mobile-card-title">{expense.description}</span>
                      <span className="date-text" style={{ fontSize: '0.85rem' }}>{formatDate(expense.date)}</span>
                    </div>
                    <span className="amount-text">-{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="mobile-card-footer">
                    <div className="category-cell">
                      <span 
                        className="category-dot" 
                        style={{ backgroundColor: catColor, boxShadow: `0 0 6px ${catColor}66` }} 
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{expense.category}</span>
                    </div>
                    <div className="actions-cell">
                      <button 
                        className="action-btn-custom" 
                        onClick={() => setEditingExpense(expense)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="action-btn-custom delete" 
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Server-Side Pagination Bar */}
          <div className="pagination-bar">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{startIndex}</strong>–<strong style={{ color: 'var(--text-primary)' }}>{endIndex}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> expenses
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button 
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span style={{ fontSize: '0.85rem', padding: '0 8px', color: 'var(--text-muted)' }}>
                Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
              </span>

              <button 
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Instance */}
      <AddExpenseModal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        onAdd={handleSaveEdit}
        expenseToEdit={editingExpense}
      />
    </div>
  );
}

export default Expenses;
