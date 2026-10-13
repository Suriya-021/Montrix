/**
 * Expense Service
 * 
 * Centralized API service for expenses using our hardened apiFetch client.
 */

import { apiFetch, getHeaders, BASE_URL } from './api';

export { getHeaders, BASE_URL };

const API_URL = `${BASE_URL}/expenses`;

export const expenseService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append('start_date', params.startDate);
    if (params.endDate) query.append('end_date', params.endDate);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.sortBy) query.append('sort_by', params.sortBy);
    if (params.sortOrder) query.append('sort_order', params.sortOrder);
    if (params.page !== undefined && params.page !== null) query.append('page', params.page);
    if (params.pageSize) query.append('page_size', params.pageSize);

    const queryString = query.toString();
    const endpoint = queryString ? `/expenses/?${queryString}` : '/expenses/';
    return await apiFetch(endpoint);
  },

  async getStats(month) {
    const endpoint = month ? `/expenses/stats?month=${encodeURIComponent(month)}` : '/expenses/stats';
    return await apiFetch(endpoint);
  },

  async getCashFlow() {
    return await apiFetch('/insights/cashflow');
  },

  async create(expenseData) {
    return await apiFetch('/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  async update(id, expenseData) {
    return await apiFetch(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  async delete(id) {
    return await apiFetch(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  async exportCSV() {
    try {
      const response = await fetch(`${API_URL}/export`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to export expenses');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const today = new Date().toISOString().split('T')[0];
      a.download = `expenses_export_${today}.csv`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting expenses:', error);
      throw error;
    }
  },

  async previewCSV(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await apiFetch('/expenses/import/preview', {
      method: 'POST',
      body: formData,
    });
  },

  async processCSV(file, mapping) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date_col', mapping.dateCol);
    formData.append('description_col', mapping.descriptionCol);
    formData.append('amount_col', mapping.amountCol);
    if (mapping.categoryCol) {
      formData.append('category_col', mapping.categoryCol);
    }
    formData.append('default_category', mapping.defaultCategory || 'Other');
    formData.append('skip_duplicates', mapping.skipDuplicates !== false ? 'true' : 'false');

    return await apiFetch('/expenses/import/process', {
      method: 'POST',
      body: formData,
    });
  }
};
