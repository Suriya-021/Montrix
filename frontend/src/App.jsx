import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import AddExpenseModal from './components/AddExpenseModal/AddExpenseModal';
import Toast from './components/Toast/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import { expenseService } from './services/expenseService';
import { Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));

// Extracted the protected layout out of the main App component
const ProtectedLayout = ({ handleAddExpense, toast, setToast, showModal, setShowModal, handleSaveExpense }) => {
  return (
    <div className="app-layout">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      <Sidebar onAddExpense={handleAddExpense} />

      <main className="main-content">
        <Suspense fallback={
          <div className="empty-state" style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <Loader2 className="empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<div className="empty-state"><h3 className="empty-state__title">Analytics</h3><p className="empty-state__text">Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="empty-state"><h3 className="empty-state__title">Settings</h3><p className="empty-state__text">Coming soon...</p></div>} />
            <Route path="*" element={
              <div className="empty-state">
                <h3 className="empty-state__title">404 - Page Not Found</h3>
                <p className="empty-state__text">The page you are looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      
      <AddExpenseModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onAdd={handleSaveExpense}
      />

      <button className="fab-mobile" onClick={handleAddExpense} title="Add Expense">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
};

function App() {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const handleAddExpense = () => setShowModal(true);

  const handleSaveExpense = async (expenseData) => {
    try {
      await expenseService.create(expenseData);
      setToast({ show: true, message: 'Expense added successfully!', type: 'success' });
      setShowModal(false);
      // Trigger a window event or context update to refetch data if necessary
    } catch (error) {
      setToast({ show: true, message: error.message || 'Error adding expense', type: 'error' });
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/*" element={
          <ProtectedRoute>
            <ProtectedLayout 
              handleAddExpense={handleAddExpense}
              toast={toast}
              setToast={setToast}
              showModal={showModal}
              setShowModal={setShowModal}
              handleSaveExpense={handleSaveExpense}
            />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
