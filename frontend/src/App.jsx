import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpenseModal from './components/AddExpenseModal/AddExpenseModal';
import Toast from './components/Toast/Toast';
import { expenseService } from './services/expenseService';

/**
 * Main Application Component.
 * Sets up routing and the main layout structure.
 */
function App() {
  // State to control visibility of the "Add Expense" modal
  const [showModal, setShowModal] = useState(false);
  
  // State for showing success/error notifications
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Handler for opening the Add Expense modal
  const handleAddExpense = () => {
    setShowModal(true);
  };

  // Handler for submitting the new expense to the backend
  const handleSaveExpense = async (expenseData) => {
    try {
      // 1. Send the data to the API
      await expenseService.create(expenseData);
      
      // 2. Show success toast
      setToast({ show: true, message: 'Expense added successfully!', type: 'success' });
      
      // 3. Close the modal
      setShowModal(false);
      
    } catch (error) {
      // Show error toast if something went wrong
      setToast({ show: true, message: error.message || 'Error adding expense', type: 'error' });
    }
  };

  return (
    <Router>
      <div className="app-layout">
        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ show: false, message: '', type: '' })} 
          />
        )}

        {/* Sidebar Navigation */}
        <Sidebar onAddExpense={handleAddExpense} />

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            {/* Placeholder routes for future pages */}
            <Route path="/analytics" element={<div style={{ padding: '2rem' }}>Analytics coming soon...</div>} />
            <Route path="/settings" element={<div style={{ padding: '2rem' }}>Settings coming soon...</div>} />
          </Routes>
        </main>
        
        {/* Add Expense Modal */}
        <AddExpenseModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          onAdd={handleSaveExpense}
        />
      </div>
    </Router>
  );
}

export default App;
