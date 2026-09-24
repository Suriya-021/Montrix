import React, { useState } from 'react';
import { X } from 'lucide-react';
import './AddExpenseModal.css';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

/**
 * AddExpenseModal Component
 * A popup form to create a new expense entry.
 */
function AddExpenseModal({ isOpen, onClose, onAdd }) {
  // We use useState to keep track of what the user is typing in the form
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food', // Default category
    description: '',
    date: new Date().toISOString().split('T')[0] // Default to today's date (YYYY-MM-DD)
  });

  // Keep track of any validation errors
  const [errors, setErrors] = useState({});

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  // Handle changes when the user types in the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update the specific field in our formData state
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field as they type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the page from refreshing
    
    // Simple validation
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Please enter a description';
    }

    // If there are errors, stop and show them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If everything is good, pass the data back up to the parent component
    // We convert the amount to a number explicitly
    onAdd({
      ...formData,
      amount: Number(formData.amount)
    });
    
    // Reset the form for the next time
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
          <h2 className="modal__title">Add New Expense</h2>
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
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
