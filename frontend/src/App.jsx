import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpenseModal from './components/AddExpenseModal/AddExpenseModal';

/**
 * Main Application Component.
 * Sets up routing and the main layout structure.
 */
function App() {
  // State to control visibility of the "Add Expense" modal
  const [showModal, setShowModal] = useState(false);

  // Handler for opening the Add Expense modal
  const handleAddExpense = () => {
    setShowModal(true);
  };

  return (
    <Router>
      <div className="app-layout">
        {/* Sidebar Navigation */}
        <Sidebar onAddExpense={handleAddExpense} />

        {/* Main Content Area */}
        {/* Note: In a real app, paddingLeft might be handled via a .main-content CSS class */}
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
          onAdd={(expenseData) => {
            console.log("New expense data:", expenseData);
            // We'll connect this to the API in the next session!
            setShowModal(false);
          }}
        />
      </div>
    </Router>
  );
}

export default App;
