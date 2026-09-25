/**
 * Expense Service
 * 
 * This file handles all the communication (API calls) between our React frontend
 * and our FastAPI backend for anything related to expenses.
 * 
 * Using a separate service file keeps our React components clean and makes
 * it easier to update the API logic in one place.
 */

// The base URL for our FastAPI backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = `${BASE_URL}/expenses`;

// Helper function to get the current token and format the headers
function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export const expenseService = {
  async getAll() {
    try {
      const response = await fetch(API_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return await response.json();
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${API_URL}/stats`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },

  async create(expenseData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create expense');
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  async update(id, expenseData) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update expense');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete expense');
      return true;
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  }
};
