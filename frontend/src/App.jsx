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
            
            {/* 404 Catch-All Route */}
            <Route path="*" element={
              <div className="empty-state">
                <h3 className="empty-state__title">404 - Page Not Found</h3>
                <p className="empty-state__text">The page you are looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
        
        {/* Add Expense Modal */}
        <AddExpenseModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          onAdd={handleSaveExpense}
        />

        {/* Mobile Floating Action Button (Hidden on Desktop) */}
        <button className="fab-mobile" onClick={handleAddExpense} title="Add Expense">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </Router>
  );
}

export default App;
