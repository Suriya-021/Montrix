/**
 * Expense Service
 * 
 * Centralized API service for expenses using our hardened apiFetch client.
 */

import { apiFetch, getHeaders, BASE_URL } from './api';

export { getHeaders, BASE_URL };

const API_URL = `${BASE_URL}/expenses`;

export const expenseService = {
  async getAll() {
    return await apiFetch('/expenses/');
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
  }
};
