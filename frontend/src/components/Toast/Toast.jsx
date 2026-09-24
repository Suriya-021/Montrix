import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import './Toast.css';

/**
 * Toast Notification Component.
 * Displays temporary success or error messages to the user.
 * 
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 * @param {function} onClose - Function to call when the toast is closed or dismisses.
 */
function Toast({ message, type = 'success', onClose }) {
  // Auto-dismiss the toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Cleanup timer if the component unmounts before 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine which icon and class to use based on the type
  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const typeClass = isSuccess ? 'toast--success' : 'toast--error';

  return (
    <div className={`toast ${typeClass}`}>
      <div className="toast-content">
        <Icon className="toast-icon" />
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
}

export default Toast;
