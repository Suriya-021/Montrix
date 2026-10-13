import { apiFetch } from './api';

export const incomeService = {
  // Get all income records
  getAll: async () => {
    return await apiFetch('/income/');
  },

  // Add new income
  create: async (incomeData) => {
    return await apiFetch('/income/', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  },
  
  // Delete income
  delete: async (id) => {
    return await apiFetch(`/income/${id}`, {
      method: 'DELETE',
    });
  }
};
