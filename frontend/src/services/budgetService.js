import { getHeaders } from './expenseService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const budgetService = {
  // Get all budgets (optionally filtered by month)
  getAll: async (month) => {
    let url = `${API_URL}/budgets/`;
    if (month) {
      url += `?month=${month}`;
    }
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch budgets');
    return response.json();
  },

  // Create or update a budget
  create: async (budgetData) => {
    const response = await fetch(`${API_URL}/budgets/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error('Failed to save budget');
    return response.json();
  },

  // Delete a budget
  delete: async (id) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete budget');
    return response.json();
  }
};
