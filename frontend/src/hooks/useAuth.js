import { useState, useEffect } from 'react';

export function useAuth() {
  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  
  // Whenever token changes, update localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return {
    token,
    isAuthenticated: !!token,
    login,
    logout
  };
}
