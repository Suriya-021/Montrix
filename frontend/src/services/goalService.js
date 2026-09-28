import { getHeaders } from './expenseService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const goalService = {
  // Get all goals for the current user
  getAll: async () => {
    const response = await fetch(`${API_URL}/goals/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  // Create a new goal
  create: async (goalData) => {
    const response = await fetch(`${API_URL}/goals/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to save goal');
    return response.json();
  },
  
  // Update a goal (used for adding funds)
  update: async (id, goalData) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },

  // Delete a goal
  delete: async (id) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete goal');
    return response.json();
  }
};
