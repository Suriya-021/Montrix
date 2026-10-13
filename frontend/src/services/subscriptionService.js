import { apiFetch } from './api';

export const subscriptionService = {
  // Get all subscriptions for the current user
  getAll: async () => {
    return await apiFetch('/subscriptions/');
  },

  // Get due or overdue subscriptions
  getDue: async () => {
    return await apiFetch('/subscriptions/due');
  },

  // Create a new subscription
  create: async (subData) => {
    return await apiFetch('/subscriptions/', {
      method: 'POST',
      body: JSON.stringify(subData),
    });
  },

  // Log subscription as an expense and advance due date
  pay: async (id) => {
    return await apiFetch(`/subscriptions/${id}/pay`, {
      method: 'POST',
    });
  },

  // Batch process all currently due subscriptions
  processAllDue: async () => {
    return await apiFetch('/subscriptions/process-due', {
      method: 'POST',
    });
  },

  // Delete a subscription
  delete: async (id) => {
    return await apiFetch(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }
};
