import { apiFetch } from './api';

export const categoryService = {
  // Get all categories (defaults + custom)
  getAll: async () => {
    return await apiFetch('/categories/');
  },

  // Create a new custom category
  create: async (categoryData) => {
    return await apiFetch('/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Delete a custom category (defaults cannot be deleted)
  delete: async (id) => {
    return await apiFetch(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
};
