const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const authService = {
  async register(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
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
    // FastAPI's OAuth2PasswordRequestForm requires x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI calls it username
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
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

    return response.json(); // returns { access_token, token_type }
  },

  async getMe(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }
};
