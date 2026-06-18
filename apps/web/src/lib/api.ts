import axios from 'axios';
import { useToastStore } from './toast';

// If VITE_API_URL is set, treat it as the server root (append /api/v1).
// Otherwise, use '/api/v1' to route through Vite's dev proxy.
const API_URL = import.meta.env.VITE_API_URL;
const baseURL = API_URL ? `${API_URL}/api/v1` : '/api/v1';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusedge_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirectingToLogin = false;

// Response interceptor to handle auth failures and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        console.warn('Unauthorized request. Logging out...');
        localStorage.removeItem('campusedge_token');
        localStorage.removeItem('campusedge_user');

        // Only redirect if we are not already on login/register pages
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && !isRedirectingToLogin) {
          isRedirectingToLogin = true;
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Network error — no response received
      useToastStore.getState().addToast({
        message: 'Network error — cannot reach server. Check your connection.',
        type: 'error',
        duration: 5000,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
