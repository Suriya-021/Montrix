import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2, Paperclip } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import './AddExpenseModal.css';

const DEFAULT_FALLBACK_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

/**
 * AddExpenseModal Component
 * A popup form to create a new expense entry or edit an existing one.
 */
function AddExpenseModal({ isOpen, onClose, onAdd, expenseToEdit }) {
  const [categories, setCategories] = useState(DEFAULT_FALLBACK_CATEGORIES.map(c => ({ name: c, is_default: true })));
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');
  const [catError, setCatError] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      categoryService.getAll().then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setCategories(res);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        amount: expenseToEdit.amount,
        category: expenseToEdit.category,
        description: expenseToEdit.description,
        date: new Date(expenseToEdit.date).toISOString().split('T')[0]
      });
      setReceiptFile(null);
    } else {
      setFormData({
        amount: '',
        category: categories[0]?.name || 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setReceiptFile(null);
    }
  }, [expenseToEdit, isOpen, categories.length]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName || !newCatName.trim()) {
      setCatError('Category name is required');
      return;
    }
    try {
      setIsCreatingCat(true);
      setCatError('');
      const created = await categoryService.create({
        name: newCatName.trim(),
        color: newCatColor
      });
      setCategories(prev => [...prev, created]);
      setFormData(prev => ({ ...prev, category: created.name }));
      setNewCatName('');
      setShowNewCatInput(false);
    } catch (err) {
      setCatError(err.message || 'Failed to create category');
    } finally {
      setIsCreatingCat(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Please enter a description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Pass the data back up, including the ID if we are editing
    onAdd({
      ...formData,
      amount: Number(formData.amount),
      id: expenseToEdit ? expenseToEdit.id : undefined,
      receiptFile
    });
    
    // Reset the form
    setFormData({
      amount: '',
      category: 'Food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          {/* Change title based on whether we are editing or adding */}
          <h2 className="modal__title">{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="modal__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              className={`form-input form-input--amount ${errors.amount ? 'form-input--error' : ''}`}
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
            />
            {errors.amount && <div className="form-error">{errors.amount}</div>}
          </div>

          {/* Category Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Category</label>
              <button
                type="button"
                onClick={() => { setShowNewCatInput(!showNewCatInput); setCatError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8B5CF6',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Plus size={13} /> {showNewCatInput ? 'Cancel' : 'New Category'}
              </button>
            </div>

            {showNewCatInput ? (
              <div style={{
                background: 'rgba(15, 15, 25, 0.8)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rent, Pet, Gym..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                    maxLength="50"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    style={{ width: '38px', height: '36px', padding: 2, background: 'none', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', cursor: 'pointer' }}
                    title="Choose category color"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isCreatingCat}
                    className="btn btn--primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isCreatingCat ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />} Add
                  </button>
                </div>
                {catError && <div style={{ color: '#EF4444', fontSize: '0.75rem' }}>{catError}</div>}
              </div>
            ) : (
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name} {!cat.is_default ? '★ (Custom)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="description"
              className={`form-input ${errors.description ? 'form-input--error' : ''}`}
              placeholder="What did you spend on?"
              value={formData.description}
              onChange={handleChange}
              maxLength="200"
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          {/* Date Field */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          {/* Receipt Attachment Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Receipt / Proof Document (Optional)</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, PDF &lt; 10MB</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="file"
                id="modal-receipt-input"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="modal-receipt-input"
                className="btn btn--secondary"
                style={{ 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.85rem'
                }}
              >
                <Paperclip size={14} />
                {receiptFile ? 'Change File' : (expenseToEdit?.receipt_url ? 'Replace Receipt' : 'Attach File')}
              </label>

              {receiptFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#27e0a9' }}>
                  <Check size={14} />
                  <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {receiptFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReceiptFile(null)}
                    style={{ background: 'none', border: 'none', color: '#ffb4ab', cursor: 'pointer', padding: 2, display: 'inline-flex' }}
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : expenseToEdit?.receipt_url ? (
                <span style={{ fontSize: '0.8rem', color: '#5de6ff' }}>
                  ✓ Existing receipt attached
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {expenseToEdit ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
