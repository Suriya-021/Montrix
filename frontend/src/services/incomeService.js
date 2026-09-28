import { getHeaders } from './expenseService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const incomeService = {
  // Get all income records
  getAll: async () => {
    const response = await fetch(`${API_URL}/income/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch income');
    return response.json();
  },

  // Add new income
  create: async (incomeData) => {
    const response = await fetch(`${API_URL}/income/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(incomeData),
    });
    if (!response.ok) throw new Error('Failed to save income');
    return response.json();
  },
  
  // Delete income
  delete: async (id) => {
    const response = await fetch(`${API_URL}/income/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete income');
    return response.json();
  }
};
