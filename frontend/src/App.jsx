import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';

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
        
        {/* Modal placeholder */}
        {showModal && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#333', padding: '2rem', zIndex: 200, color: '#fff', borderRadius: '8px' }}>
            <p>Add Expense Modal Placeholder</p>
            <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
