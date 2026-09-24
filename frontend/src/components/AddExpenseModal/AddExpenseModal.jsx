import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AddExpenseModal.css';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

/**
 * AddExpenseModal Component
 * A popup form to create a new expense entry or edit an existing one.
 */
function AddExpenseModal({ isOpen, onClose, onAdd, expenseToEdit }) {
  // We use useState to keep track of what the user is typing in the form
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  // useEffect watches the `expenseToEdit` and `isOpen` variables.
  // When the modal opens, if we passed an expense to edit, we fill the form with its data!
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        amount: expenseToEdit.amount,
        category: expenseToEdit.category,
        description: expenseToEdit.description,
        // Ensure the date is formatted for the HTML input (YYYY-MM-DD)
        date: new Date(expenseToEdit.date).toISOString().split('T')[0]
      });
    } else {
      // Otherwise, start with a fresh blank form
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [expenseToEdit, isOpen]);

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  // Handle changes when the user types in the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field as they type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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
      id: expenseToEdit ? expenseToEdit.id : undefined
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
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
