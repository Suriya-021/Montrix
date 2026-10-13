import { apiFetch, BASE_URL } from './api';

const API_URL = `${BASE_URL}/auth`;

export const authService = {
  async register(name, email, password) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    
    return response.json();
  },

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  },

  async getMe(token) {
    if (token) {
      const response = await fetch(`${API_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
    return await apiFetch('/auth/me');
  },

  async updateProfile(profileData) {
    return await apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async changePassword({ currentPassword, newPassword }) {
    return await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      }),
    });
  },

  async deleteAccount() {
    return await apiFetch('/auth/me', {
      method: 'DELETE',
    });
  }
};
