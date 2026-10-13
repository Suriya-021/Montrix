import { apiFetch } from './api';

export const budgetService = {
  // Get all budgets (optionally filtered by month)
  getAll: async (month) => {
    const endpoint = month ? `/budgets/?month=${encodeURIComponent(month)}` : '/budgets/';
    return await apiFetch(endpoint);
  },

  // Create or update a budget
  create: async (budgetData) => {
    return await apiFetch('/budgets/', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  },

  // Delete a budget
  delete: async (id) => {
    return await apiFetch(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }
};
