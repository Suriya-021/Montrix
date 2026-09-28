import { getHeaders } from './expenseService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const subscriptionService = {
  // Get all subscriptions for the current user
  getAll: async () => {
    const response = await fetch(`${API_URL}/subscriptions/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    return response.json();
  },

  // Create a new subscription
  create: async (subData) => {
    const response = await fetch(`${API_URL}/subscriptions/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subData),
    });
    if (!response.ok) throw new Error('Failed to save subscription');
    return response.json();
  },

  // Delete a subscription
  delete: async (id) => {
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete subscription');
    return response.json();
  }
};
