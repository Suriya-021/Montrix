import { apiFetch } from './api';

export const goalService = {
  // Get all goals for the current user
  getAll: async () => {
    return await apiFetch('/goals/');
  },

  // Create a new goal
  create: async (goalData) => {
    return await apiFetch('/goals/', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },
  
  // Update a goal (used for adding funds)
  update: async (id, goalData) => {
    return await apiFetch(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },

  // Delete a goal
  delete: async (id) => {
    return await apiFetch(`/goals/${id}`, {
      method: 'DELETE',
    });
  }
};
