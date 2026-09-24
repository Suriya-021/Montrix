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
const API_URL = 'http://localhost:8000/api/expenses';

export const expenseService = {
  /**
   * Fetch all expenses from the backend
   */
  async getAll() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      
      // Convert the JSON response into a JavaScript object/array
      return await response.json();
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  /**
   * Fetch summary statistics from the backend
   */
  async getStats() {
    try {
      const response = await fetch(`${API_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },

  /**
   * Send a new expense to the backend to be saved in the database
   */
  async create(expenseData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST', // POST tells the server we are creating new data
        headers: {
          'Content-Type': 'application/json', // We are sending JSON data
        },
        body: JSON.stringify(expenseData), // Convert our JS object to a JSON string
      });

      if (!response.ok) {
        // Try to get a specific error message from the backend if possible
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create expense');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  /**
   * Update an existing expense by its ID
   */
  async update(id, expenseData) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT', // PUT is used to update existing data
        headers: {
          'Content-Type': 'application/json',
        },
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

  /**
   * Delete an expense by its ID
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE', // DELETE tells the server to remove the data
      });

      if (!response.ok) throw new Error('Failed to delete expense');
      return true;
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  }
};
