import { apiFetch } from './api';

export const subscriptionService = {
  // Get all subscriptions for the current user
  getAll: async () => {
    return await apiFetch('/subscriptions/');
  },

  // Create a new subscription
  create: async (subData) => {
    return await apiFetch('/subscriptions/', {
      method: 'POST',
      body: JSON.stringify(subData),
    });
  },

  // Delete a subscription
  delete: async (id) => {
    return await apiFetch(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }
};
