import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Parse basic payload from JWT if present
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        return { id: payload.sub, name: payload.name || 'User', email: payload.email || '' };
      }
    } catch {
      // Ignore token parse failure
    }
    return null;
  });

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ id: payload.sub, name: payload.name || 'User', email: payload.email || '' });
    } catch {
      setUser({ name: 'User' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Synchronize on storage changes (multi-tab) and 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          setToken(null);
          setUser(null);
        } else {
          setToken(e.newValue);
        }
      }
    };

    window.addEventListener('authUnauthorized', handleUnauthorized);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authUnauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
