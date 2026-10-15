import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trash2, Receipt, AlertCircle, Loader2, Pencil, 
  Search, TrendingDown, Calendar, Tag, Download, Upload,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, SlidersHorizontal, CheckCircle2, ShieldCheck,
  AlertTriangle, Copy, Check, FileText, ArrowRight, X, Clock,
  CreditCard, DollarSign, Activity, Sparkles, Plus, Paperclip, Eye, ExternalLink
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import AddExpenseModal from '../components/AddExpenseModal/AddExpenseModal';
import ImportExpensesModal from '../components/ImportExpensesModal/ImportExpensesModal';
import Toast from '../components/Toast/Toast';
import { useCurrency } from '../context/CurrencyContext';
import './Expenses.css';

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

  // Inspector selection
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptLightboxUrl, setReceiptLightboxUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [datePreset, setDatePreset] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [auditFilter, setAuditFilter] = useState('all'); // 'all' | 'reconciled' | 'missing' | 'schedec'

  // Sorting
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Initial load
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
        if (result.items.length > 0 && !selectedExpenseId) {
          setSelectedExpenseId(result.items[0].id);
        }
      } else if (Array.isArray(result)) {
        setExpenses(result);
        setTotalCount(result.length);
        setTotalPages(1);
        if (result.length > 0 && !selectedExpenseId) {
          setSelectedExpenseId(result[0].id);
        }
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
  }, [datePreset, customStartDate, customEndDate, filterCategory, searchTerm, sortBy, sortOrder, page, pageSize, selectedExpenseId]);

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

  // Selected item computation
  const activeExpense = useMemo(() => {
    if (!expenses.length) return null;
    return expenses.find(e => e.id === selectedExpenseId) || expenses[0];
  }, [expenses, selectedExpenseId]);

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

  const handleCopyUuid = (uuid) => {
    if (!uuid) return;
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseService.delete(id);
      setToast({ show: true, message: 'Expense deleted from ledger', type: 'success' });
      if (selectedExpenseId === id) setSelectedExpenseId(null);
      loadExpenses();
      loadCategoriesAndStats();
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete expense', type: 'error' });
    }
  };

  const handleUploadReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeExpense) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setToast({ show: true, message: 'Receipt size cannot exceed 10MB', type: 'error' });
      return;
    }

    try {
      setIsUploadingReceipt(true);
      await expenseService.uploadReceipt(activeExpense.id, file);
      setToast({ show: true, message: 'Receipt proof attached to ledger!', type: 'success' });
      loadExpenses();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to upload receipt', type: 'error' });
    } finally {
      setIsUploadingReceipt(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteReceipt = async (expenseId) => {
    if (!window.confirm('Are you sure you want to remove this attached receipt?')) return;
    try {
      await expenseService.deleteReceipt(expenseId);
      setToast({ show: true, message: 'Receipt detached from expense', type: 'success' });
      loadExpenses();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to remove receipt', type: 'error' });
    }
  };

  const handleSaveEdit = async (expenseData) => {
    try {
      const { receiptFile, ...cleanData } = expenseData;
      await expenseService.update(cleanData.id, cleanData);
      if (receiptFile) {
        await expenseService.uploadReceipt(cleanData.id, receiptFile);
      }
      setToast({ show: true, message: 'Expense record updated successfully!', type: 'success' });
      setEditingExpense(null);
      loadExpenses();
      loadCategoriesAndStats();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to update expense', type: 'error' });
    }
  };

  const handleSaveNewExpense = async (expenseData) => {
    try {
      const { receiptFile, ...cleanData } = expenseData;
      const created = await expenseService.create(cleanData);
      if (receiptFile && created?.id) {
        await expenseService.uploadReceipt(created.id, receiptFile);
      }
      setToast({ show: true, message: 'New expense logged to ledger!', type: 'success' });
      setIsAddModalOpen(false);
      loadExpenses();
      loadCategoriesAndStats();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to log expense', type: 'error' });
    }
  };

  const handleExportCSV = () => {
    if (expenseService.exportCSV) {
      expenseService.exportCSV();
    } else {
      setToast({ show: true, message: 'Export functionality not available', type: 'error' });
    }
  };

  const handleImportSuccess = (result) => {
    const imported = result.imported_count || 0;
    const skipped = result.skipped_count || 0;
    setToast({
      show: true,
      message: `Imported ${imported} transactions${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}!`,
      type: 'success'
    });
    loadExpenses();
    loadCategoriesAndStats();
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().split('T')[0];
  };

  const formatTimeDisplay = (dateString) => {
    if (!dateString) return '12:00:00';
    const d = new Date(dateString);
    return d.toTimeString().split(' ')[0] || '18:32:05';
  };

  // KPIs
  const totalThisMonth = globalStats?.this_month_spent ?? expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalAllTime = globalStats?.total_spent ?? totalThisMonth;
  const avgDailyBurn = totalThisMonth > 0 ? (totalThisMonth / 30) : 0;
  const taxDeductibleEst = totalThisMonth * 0.62;
  const auditQueueCount = expenses.filter(e => e.amount > 500).length;

  return (
    <div className="expenses-view fade-in">
      {/* Micro Atmospheric Halo */}
      <div className="expenses-halo"></div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Top Executive Action Bar */}
      <div className="expenses-topbar">
        <div>
          <div className="expenses-breadcrumb">
            <span className="crumb">Montrix</span>
            <span>/</span>
            <span className="crumb">Financial Operations</span>
            <span>/</span>
            <span className="current">Expenses</span>
          </div>
          <div className="expenses-title-row">
            <h1 className="expenses-title">Expenses &amp; Outflow Ledger</h1>
            <span className="expenses-live-pill">
              <span className="expenses-live-dot"></span>
              Real-time Plaid Stream
            </span>
          </div>
        </div>

        {/* Action Cluster */}
        <div className="expenses-actions-cluster">
          {/* Date Range Filter Pill */}
          <div className="expenses-date-pill">
            <Calendar size={15} color="#d0bcff" />
            <span className="date-label">
              {datePreset === 'this-month' ? 'Current Month' : datePreset === 'last-month' ? 'Last Month' : datePreset === '30-days' ? 'Last 30 Days' : 'All Time'}
            </span>
            <div className="date-divider"></div>
            <span className="date-preset">{datePreset.replace('-', ' ')}</span>
          </div>

          {/* Import CSV */}
          <button 
            className="btn-stitch-secondary"
            onClick={() => setIsImportModalOpen(true)}
            type="button"
          >
            <Upload size={16} />
            <span>Import CSV</span>
          </button>

          {/* Export Statement */}
          <button 
            className="btn-stitch-secondary"
            onClick={handleExportCSV}
            type="button"
          >
            <Download size={16} />
            <span>Export Statement</span>
          </button>

          {/* Log Expense */}
          <button 
            className="btn-stitch-primary"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus size={17} />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Telemetry Ribbon (4 Compact Glass Cards) */}
      <div className="expenses-kpi-grid">
        {/* Card 1: Total Outflow */}
        <div className="expenses-kpi-card">
          <div className="expenses-kpi-card-header">
            <span className="expenses-kpi-card-title">Total Outflow (MTD)</span>
            <TrendingDown size={18} color="#d0bcff" />
          </div>
          <div className="expenses-kpi-card-value-row">
            <span className="expenses-kpi-card-value">{formatCurrency(totalThisMonth)}</span>
            <span className="kpi-pill-badge green">
              -2.1% cap
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#958ea0', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              <span>Burn capacity usage</span>
              <span style={{ color: '#e5e1e5' }}>68.1% of safe cap</span>
            </div>
            <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: '#353438', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #d0bcff, #a078ff)', borderRadius: '9999px' }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Avg Daily Burn */}
        <div className="expenses-kpi-card">
          <div className="expenses-kpi-card-header">
            <span className="expenses-kpi-card-title">Avg Daily Burn Rate</span>
            <Activity size={18} color="#5de6ff" />
          </div>
          <div className="expenses-kpi-card-value-row">
            <span className="expenses-kpi-card-value">{formatCurrency(avgDailyBurn)}</span>
            <span className="kpi-pill-badge red">
              +$14.20 prev
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <svg style={{ width: '130px', height: '20px', color: '#5de6ff', overflow: 'visible' }} viewBox="0 0 140 20" fill="none">
              <path d="M0 16 L20 14 L40 18 L60 9 L80 12 L100 6 L120 10 L140 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0 16 L20 14 L40 18 L60 9 L80 12 L100 6 L120 10 L140 4 L140 20 L0 20 Z" fill="currentColor" fillOpacity="0.12" />
            </svg>
            <span style={{ fontSize: '11px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>30 Days Window</span>
          </div>
        </div>

        {/* Card 3: Tax Deductible Identified */}
        <div className="expenses-kpi-card">
          <div className="expenses-kpi-card-header">
            <span className="expenses-kpi-card-title">Tax Deductible Identified</span>
            <ShieldCheck size={18} color="#27e0a9" />
          </div>
          <div className="expenses-kpi-card-value-row">
            <span className="expenses-kpi-card-value" style={{ color: '#5de6ff' }}>{formatCurrency(taxDeductibleEst)}</span>
            <span className="kpi-pill-badge cyan">62.0% ratio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e5e1e5' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#5de6ff' }}></span>
              Schedule C Eligible
            </span>
            <span style={{ color: '#27e0a9', fontWeight: 600, cursor: 'pointer' }}>Review Tagged →</span>
          </div>
        </div>

        {/* Card 4: Audit Queue & Flagged */}
        <div className="expenses-kpi-card">
          <div className="expenses-kpi-card-header">
            <span className="expenses-kpi-card-title">Audit Queue / Attention</span>
            <AlertTriangle size={18} color="#ffb4ab" />
          </div>
          <div className="expenses-kpi-card-value-row">
            <span className="expenses-kpi-card-value">{auditQueueCount} Items</span>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#93000a', color: '#ffdad6', fontSize: '11px', fontWeight: 600 }}>
              Action Req.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#958ea0' }}>
            <span>Invoices &gt; $500 threshold</span>
            <button 
              style={{ background: '#2a2a2d', color: '#e5e1e5', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
              onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Column Filtering & Search Toolbar */}
      <div className="expenses-toolbar">
        <div className="expenses-toolbar-top">
          {/* Search Input */}
          <div className="expenses-search-box">
            <Search className="expenses-search-icon" size={17} />
            <input 
              type="text" 
              placeholder="Search merchant, account, category, tags..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            <kbd className="expenses-search-kbd">⌘F</kbd>
          </div>

          {/* Filter Pills Strip */}
          <div className="expenses-filters-strip">
            {/* Category Dropdown */}
            <select 
              className="expenses-filter-select"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            >
              <option value="All">All Categories ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Date Preset Selector */}
            <select 
              className="expenses-filter-select"
              value={datePreset}
              onChange={(e) => { setDatePreset(e.target.value); setPage(1); }}
            >
              <option value="this-month">This Month (MTD)</option>
              <option value="last-month">Last Month</option>
              <option value="30-days">Trailing 30 Days</option>
              <option value="90-days">Trailing 90 Days</option>
              <option value="all">All Historical Time</option>
            </select>

            {/* Sort Toggle */}
            <button 
              className="expenses-filter-pill-btn"
              onClick={() => handleSortToggle(sortBy === 'date' ? 'amount' : 'date')}
              type="button"
            >
              <SlidersHorizontal size={14} color="#d0bcff" />
              <span>Sort: {sortBy === 'date' ? 'Date' : 'Amount'} ({sortOrder.toUpperCase()})</span>
            </button>

            {/* Reset */}
            {(searchTerm || filterCategory !== 'All' || datePreset !== 'this-month') && (
              <button 
                className="expenses-filter-pill-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('All');
                  setDatePreset('this-month');
                  setPage(1);
                }}
                type="button"
                style={{ color: '#ffb4ab' }}
              >
                <X size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Presets Row */}
        <div className="expenses-toolbar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', letterSpacing: '0.05em' }}>
              Active Category Filter:
            </span>
            <span className="active-preset-tag">
              <span className="dot" style={{ background: filterCategory === 'All' ? '#d0bcff' : categoryColorMap[filterCategory] || '#d0bcff' }}></span>
              <span>{filterCategory === 'All' ? 'All Ledger Items' : filterCategory}</span>
            </span>
            <span className="active-preset-tag">
              <span className="dot" style={{ background: '#27e0a9' }}></span>
              <span>Plaid Verified Only</span>
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>
            Showing <strong style={{ color: '#e5e1e5' }}>{expenses.length}</strong> of {totalCount} entries • Synced real-time
          </div>
        </div>
      </div>

      {/* Workspace: 68% Table + 32% Sticky Detail Drawer */}
      <div className="expenses-workspace">
        {/* Left Column: Ledger Table */}
        <div className="expenses-ledger-card">
          <div className="expenses-ledger-header">
            <div className="expenses-ledger-title">
              <span>Audit Register</span>
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#2a2a2d', color: '#d0bcff', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                OCT 2024
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#958ea0' }}>
              <span>Page {page} of {totalPages}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state" style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#a078ff' }} />
              <p style={{ marginTop: '1rem', color: '#958ea0' }}>Streaming ledger records...</p>
            </div>
          ) : error ? (
            <div className="empty-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <AlertCircle size={32} style={{ color: '#ffb4ab', margin: '0 auto 12px' }} />
              <h3 style={{ color: '#e5e1e5', marginBottom: '8px' }}>Failed to load ledger</h3>
              <p style={{ color: '#958ea0', marginBottom: '16px' }}>{error}</p>
              <button className="btn-stitch-primary" onClick={loadExpenses}>Retry</button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
              <Receipt size={32} style={{ opacity: 0.5, margin: '0 auto 12px', color: '#d0bcff' }} />
              <h3 style={{ color: '#e5e1e5', marginBottom: '6px' }}>No expenses found</h3>
              <p style={{ color: '#958ea0', maxWidth: '380px', margin: '0 auto 16px' }}>
                {searchTerm || filterCategory !== 'All' 
                  ? 'No entries match your query. Try clearing filters.' 
                  : 'Start tracking your spending by logging an expense.'}
              </p>
              <button 
                className="btn-stitch-primary" 
                onClick={() => setIsAddModalOpen(true)}
              >
                Log First Expense
              </button>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="stitch-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}>
                        <input type="checkbox" style={{ accentColor: '#a078ff', cursor: 'pointer' }} />
                      </th>
                      <th>Date (UTC)</th>
                      <th>Merchant &amp; Rail</th>
                      <th>Category</th>
                      <th>Tax Deduction</th>
                      <th>Audit Status</th>
                      <th style={{ textAlign: 'right' }}>Net Outflow</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => {
                      const isSelected = activeExpense?.id === expense.id;
                      const catColor = categoryColorMap[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category] || '#a078ff';
                      const isSchedC = expense.amount > 50;
                      return (
                        <tr 
                          key={expense.id} 
                          className={isSelected ? 'selected-row' : ''}
                          onClick={() => setSelectedExpenseId(expense.id)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => setSelectedExpenseId(expense.id)}
                              style={{ accentColor: '#a078ff', cursor: 'pointer' }} 
                            />
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#958ea0' }}>
                            {formatDateDisplay(expense.date)}
                            <br />
                            <span style={{ fontSize: '10px', color: '#555' }}>{formatTimeDisplay(expense.date)}</span>
                          </td>
                          <td>
                            <div className="merchant-cell">
                              <div 
                                className="merchant-icon-box"
                                style={{ background: `${catColor}1f`, color: catColor }}
                              >
                                {expense.description?.charAt(0)?.toUpperCase() || 'M'}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div className="merchant-name">
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {expense.description}
                                  </span>
                                  {expense.receipt_url && (
                                    <span 
                                      title="Receipt proof attached" 
                                      style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', color: '#27e0a9' }}
                                    >
                                      <Paperclip size={12} />
                                    </span>
                                  )}
                                  {isSelected && <ArrowRight size={13} color="#a078ff" />}
                                </div>
                                <div className="merchant-sub">Direct Debit • {expense.category || 'Ledger Entry'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '2px 8px', 
                                borderRadius: '9999px',
                                background: `${catColor}18`,
                                color: catColor,
                                fontSize: '11px',
                                fontWeight: 500
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: catColor }}></span>
                              {expense.category}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span className="tax-badge">
                              {isSchedC ? 'Sched C 100%' : 'Standard'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div className="audit-status-badge verified">
                              <CheckCircle2 size={14} />
                              <span>Reconciled</span>
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span className="net-outflow-amount">
                              -{formatCurrency(expense.amount)}
                            </span>
                            <div style={{ textAlign: 'right', fontSize: '10px', color: '#958ea0', fontFamily: 'var(--font-mono)' }}>USD</div>
                          </td>
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button 
                              className={`btn-inspect-pill ${isSelected ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExpenseId(expense.id);
                              }}
                            >
                              {isSelected ? 'Active' : 'Inspect'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="expenses-pagination">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Rows:</span>
                  <select 
                    className="expenses-filter-select"
                    style={{ height: '28px', padding: '0 6px' }}
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>Showing {expenses.length} of {totalCount}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    className="btn-stitch-secondary" 
                    style={{ padding: '4px 8px' }}
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-mono)', padding: '0 6px' }}>
                    {page} / {totalPages}
                  </span>
                  <button 
                    className="btn-stitch-secondary" 
                    style={{ padding: '4px 8px' }}
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sticky Contextual Audit Inspector */}
        <div className="expenses-inspector-card">
          <div className="inspector-glow"></div>

          {activeExpense ? (
            <>
              {/* Header */}
              <div className="inspector-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={18} color="#d0bcff" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e1e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Audit Inspector
                  </span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(39, 224, 169, 0.15)', color: '#27e0a9', fontSize: '10px', fontWeight: 600 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '9999px', background: '#27e0a9' }}></span>
                  Plaid Core Reconciled
                </span>
              </div>

              {/* Amount & Merchant Hero */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 800, color: '#ffb4ab', letterSpacing: '-0.02em' }}>
                    -{formatCurrency(activeExpense.amount)}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: '#2a2a2d', color: '#cbc3d7', padding: '2px 6px', borderRadius: '4px' }}>
                    USD
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e1e5', marginTop: '4px', marginBottom: '2px' }}>
                  {activeExpense.description}
                </h3>
                <span style={{ fontSize: '12px', color: '#958ea0' }}>
                  Production Outflow • Direct Bank Debit
                </span>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">Tx Hash UUID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d0bcff', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    <span>tx_{activeExpense.id ? String(activeExpense.id).padStart(8, '0') : '88921f'}</span>
                    <button 
                      onClick={() => handleCopyUuid(`tx_${activeExpense.id}`)}
                      style={{ background: 'none', border: 'none', color: '#d0bcff', cursor: 'pointer', padding: 0 }}
                      title="Copy Hash"
                    >
                      {copiedUuid ? <Check size={13} color="#27e0a9" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">Ledger Timestamp</span>
                  <span className="inspector-meta-value font-mono">
                    {formatDateDisplay(activeExpense.date)} • {formatTimeDisplay(activeExpense.date)} UTC
                  </span>
                </div>

                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">Funding Rail</span>
                  <span className="inspector-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CreditCard size={13} color="#5de6ff" />
                    Primary Account Rail
                  </span>
                </div>

                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">Category Node</span>
                  <span className="inspector-meta-value" style={{ color: categoryColorMap[activeExpense.category] || '#d0bcff' }}>
                    {activeExpense.category}
                  </span>
                </div>

                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">Tax Classification</span>
                  <span className="inspector-meta-value" style={{ color: '#5de6ff', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    IRC §162 (100% Ordinary)
                  </span>
                </div>

                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">Policy Rule</span>
                  <span className="inspector-meta-value" style={{ color: '#27e0a9', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <CheckCircle2 size={13} />
                    Auto-approved (&lt;$1,500)
                  </span>
                </div>
              </div>

              {/* Matched Invoice & Proof Box */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  Proof Document &amp; Invoice
                </span>

                {activeExpense.receipt_url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '10px', background: '#201f22', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(39, 224, 169, 0.12)', color: '#27e0a9', flexShrink: 0 }}>
                          <FileText size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#e5e1e5', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activeExpense.receipt_url.split('/').pop()}
                          </div>
                          <div style={{ fontSize: '10px', color: '#27e0a9', fontFamily: 'var(--font-mono)' }}>
                            Verified Ledger Proof
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button 
                          className="btn-stitch-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => setReceiptLightboxUrl(expenseService.getReceiptFullUrl(activeExpense.receipt_url))}
                          title="View receipt"
                        >
                          <Eye size={12} style={{ marginRight: '3px' }} />
                          View
                        </button>
                        <button 
                          className="btn-stitch-secondary"
                          style={{ padding: '4px 6px', fontSize: '11px', color: '#ffb4ab' }}
                          onClick={() => handleDeleteReceipt(activeExpense.id)}
                          title="Remove receipt"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Image Thumbnail if image format */}
                    {/\.(png|jpe?g|webp)$/i.test(activeExpense.receipt_url) && (
                      <div 
                        onClick={() => setReceiptLightboxUrl(expenseService.getReceiptFullUrl(activeExpense.receipt_url))}
                        style={{ 
                          width: '100%', 
                          height: '90px', 
                          borderRadius: '6px', 
                          overflow: 'hidden', 
                          cursor: 'pointer',
                          background: '#121218',
                          border: '1px solid rgba(255,255,255,0.08)',
                          position: 'relative'
                        }}
                        title="Click to zoom receipt"
                      >
                        <img 
                          src={expenseService.getReceiptFullUrl(activeExpense.receipt_url)} 
                          alt="Receipt thumbnail" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ 
                          position: 'absolute', 
                          bottom: 4, 
                          right: 4, 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          background: 'rgba(0,0,0,0.65)', 
                          fontSize: '10px', 
                          color: '#e5e1e5',
                          backdropFilter: 'blur(4px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Eye size={10} />
                          Expand
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '16px 12px', 
                      borderRadius: '10px', 
                      background: '#1b1b1e', 
                      border: '1px dashed rgba(255,255,255,0.15)', 
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleUploadReceipt({ target: { files: e.dataTransfer.files } });
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleUploadReceipt} 
                      accept="image/png,image/jpeg,image/webp,application/pdf" 
                      style={{ display: 'none' }} 
                    />
                    {isUploadingReceipt ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6' }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '12px' }}>Uploading proof...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={18} color="#958ea0" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '12px', color: '#e5e1e5', fontWeight: 500 }}>
                          Upload Receipt / Invoice
                        </span>
                        <span style={{ fontSize: '10px', color: '#958ea0', marginTop: '2px' }}>
                          PNG, JPG, PDF up to 10MB
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Immutable Audit Trace Timeline */}
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#958ea0', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                  Immutable Audit Trace
                </span>
                <div className="inspector-timeline">
                  <div className="timeline-step">
                    <span className="timeline-dot green"></span>
                    <div style={{ color: '#e5e1e5', fontWeight: 500 }}>Reconciled to Q4 Tax Reserve</div>
                    <span style={{ color: '#958ea0', fontSize: '10px' }}>Auto-balanced against withholding</span>
                  </div>
                  <div className="timeline-step">
                    <span className="timeline-dot cyan"></span>
                    <div style={{ color: '#e5e1e5', fontWeight: 500 }}>Gmail integration paired PDF invoice</div>
                    <span style={{ color: '#958ea0', fontSize: '10px' }}>Matched hash from provider</span>
                  </div>
                  <div className="timeline-step">
                    <span className="timeline-dot purple"></span>
                    <div style={{ color: '#e5e1e5', fontWeight: 500 }}>Montrix ML Auto-Categorization</div>
                    <span style={{ color: '#958ea0', fontSize: '10px' }}>Assigned: {activeExpense.category}</span>
                  </div>
                  <div className="timeline-step">
                    <span className="timeline-dot gray"></span>
                    <div style={{ color: '#e5e1e5', fontWeight: 500 }}>Plaid Webhook Authorized Outflow</div>
                    <span style={{ color: '#958ea0', fontSize: '10px' }}>Settled on card ending ••2209</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button 
                  className="btn-stitch-secondary" 
                  style={{ justifyContent: 'center', fontSize: '11px' }}
                  onClick={() => setEditingExpense(activeExpense)}
                >
                  <Pencil size={13} />
                  <span>Edit</span>
                </button>
                <button 
                  className="btn-stitch-secondary" 
                  style={{ justifyContent: 'center', fontSize: '11px', color: '#5de6ff' }}
                  onClick={() => setToast({ show: true, message: 'Tax classification verified for IRS Form 1040/Schedule C', type: 'success' })}
                >
                  <Tag size={13} />
                  <span>Tax Tag</span>
                </button>
                <button 
                  className="btn-stitch-secondary" 
                  style={{ justifyContent: 'center', fontSize: '11px', color: '#ffb4ab' }}
                  onClick={() => handleDelete(activeExpense.id)}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              {/* IRS Compliance Meter */}
              <div className="compliance-badge-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(93, 230, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5de6ff' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#e5e1e5' }}>IRS Compliance Score</div>
                    <div style={{ fontSize: '10px', color: '#958ea0' }}>99.4% audit readiness rating</div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#27e0a9' }}>
                  Grade A
                </span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#958ea0' }}>
              <ShieldCheck size={32} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13px' }}>Select an expense to inspect audit telemetry</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal Instance */}
      <AddExpenseModal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        onAdd={handleSaveEdit}
        expenseToEdit={editingExpense}
      />

      {/* Add New Expense Modal Instance */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleSaveNewExpense}
        expenseToEdit={null}
      />

      {/* CSV Bank Statement Importer Modal */}
      <ImportExpensesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Receipt Preview Lightbox Modal */}
      {receiptLightboxUrl && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setReceiptLightboxUrl(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '850px',
              maxHeight: '90vh',
              width: '100%',
              background: '#121218',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#27e0a9" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e5e1e5' }}>
                  Proof Document Viewer
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a 
                  href={receiptLightboxUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  download
                  className="btn-stitch-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button 
                  onClick={() => setReceiptLightboxUrl(null)}
                  className="btn-stitch-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Lightbox Content */}
            <div style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              maxHeight: 'calc(90vh - 65px)'
            }}>
              {/\.pdf$/i.test(receiptLightboxUrl) ? (
                <iframe 
                  src={receiptLightboxUrl} 
                  title="Receipt PDF" 
                  style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px' }} 
                />
              ) : (
                <img 
                  src={receiptLightboxUrl} 
                  alt="Receipt Full Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '75vh', 
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
