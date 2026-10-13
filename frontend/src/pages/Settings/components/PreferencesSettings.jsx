import React, { useState, useEffect } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useCurrency } from '../../../context/CurrencyContext';
import { categoryService } from '../../../services/categoryService';
import Toast from '../../../components/Toast/Toast';
import { Plus, Trash2, Tag, Loader2, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#8B5CF6', '#EC4899', '#3B82F6', '#06D6A0', 
  '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', 
  '#F97316', '#84CC16', '#06B6D4', '#A855F7'
];

export default function PreferencesSettings() {
  const { dateFormat, firstDayOfWeek, defaultCategory, updateSetting } = useSettings();
  const { currency, changeCurrency } = useCurrency();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCats(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setToast({ show: true, message: 'Category name cannot be empty', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await categoryService.create({
        name: trimmed,
        color: newCatColor,
        icon: 'Tag'
      });
      setToast({ show: true, message: `Category "${created.name}" created!`, type: 'success' });
      setNewCatName('');
      loadCategories();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to create category', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (cat.is_default) {
      setToast({ show: true, message: 'Default categories cannot be deleted.', type: 'error' });
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"? Existing expenses with this category will remain unchanged.`)) {
      return;
    }

    try {
      setDeletingId(cat.id);
      await categoryService.delete(cat.id);
      setToast({ show: true, message: `Category "${cat.name}" removed.`, type: 'success' });
      loadCategories();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to delete category', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* Regional & App Preferences */}
      <div className="settings-card glass-card fade-in">
        <div className="settings-card-header">
          <h2 className="settings-card-title">Preferences</h2>
          <p className="settings-card-description">Manage regional and app behavior preferences.</p>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label">Display Currency</div>
            <div className="setting-description">Your primary currency for all charts and tables.</div>
          </div>
          <div className="setting-action">
            <select 
              className="form-input" 
              style={{ width: '140px' }} 
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label">Date Format</div>
            <div className="setting-description">How dates are displayed across the app.</div>
          </div>
          <div className="setting-action">
            <select 
              className="form-input" 
              style={{ width: '140px' }} 
              value={dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
            >
              <option value="ddmmyyyy">DD/MM/YYYY</option>
              <option value="mmddyyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label">First Day of Week</div>
            <div className="setting-description">The starting day for weekly charts and budgets.</div>
          </div>
          <div className="setting-action">
            <select 
              className="form-input" 
              style={{ width: '140px' }} 
              value={firstDayOfWeek}
              onChange={(e) => updateSetting('firstDayOfWeek', e.target.value)}
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <div className="setting-label">Default Expense Category</div>
            <div className="setting-description">Pre-selected category when adding new expenses.</div>
          </div>
          <div className="setting-action">
            <select 
              className="form-input" 
              style={{ width: '160px' }} 
              value={defaultCategory}
              onChange={(e) => updateSetting('defaultCategory', e.target.value)}
            >
              {categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))
              ) : (
                <>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Category Management Card */}
      <div className="settings-card glass-card fade-in">
        <div className="settings-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Tag size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="settings-card-title">Expense Categories</h2>
          </div>
          <p className="settings-card-description">
            Customize your spending categories. Add custom tags for your specific lifestyle and recurring needs.
          </p>
        </div>

        {/* Existing Categories List */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Categories ({categories.length})
          </div>

          {loadingCats ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Loading categories...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {categories.map((cat) => (
                <div 
                  key={cat.id || cat.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span 
                    style={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      background: cat.color || '#8B5CF6',
                      boxShadow: `0 0 8px ${cat.color || '#8B5CF6'}66`
                    }} 
                  />
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  {cat.is_default ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7, padding: '1px 4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={deletingId === cat.id}
                      title="Delete category"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {deletingId === cat.id ? (
                        <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category Form */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 'var(--space-4)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
            Create New Custom Category
          </div>

          <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '480px' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Category name (e.g., Gym, Pets, Cloud)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                maxLength={50}
                required
                style={{ flex: 1 }}
              />

              <button 
                type="submit" 
                className="btn btn--primary"
                disabled={isSubmitting || !newCatName.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                Add Category
              </button>
            </div>

            {/* Color Palette Selector */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Tag Color
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: color,
                      border: newCatColor === color ? '2px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      boxShadow: newCatColor === color ? `0 0 10px ${color}` : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {newCatColor === color && <Check size={12} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
