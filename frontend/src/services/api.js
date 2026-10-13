/**
 * Centralized API Fetch Client with 401 Interceptor and Session Recovery
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function getHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = getHeaders(options.headers || {});
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('authUnauthorized', { 
        detail: { message: 'Session expired. Please log in again.' } 
      }));
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    throw error;
  }
}

export { BASE_URL };
