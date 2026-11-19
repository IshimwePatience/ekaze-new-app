import axios from 'axios';

// Base URL configuration
const BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL || 'https://ihirwepay.benofinance.rw/api/v1'
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Single trigger reload to avoid multiple rapid reloads
let isReloading = false;
export const triggerReload = (delay = 400) => {
  if (isReloading) return;
  isReloading = true;
  setTimeout(() => {
    window.location.reload();
  }, delay);
};

// Global offline listener: when internet goes, reload
if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    triggerReload(300);
  });
}

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    // If browser is already offline before sending request, trigger reload
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      triggerReload(300);
    }
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof window !== 'undefined') {
      const appLang = localStorage.getItem('app_language') || 'kin';
      config.params = { ...(config.params || {}), lang: appLang };
      if (
        config.data &&
        typeof config.data === 'object' &&
        !Array.isArray(config.data) &&
        !(config.data instanceof FormData) &&
        !('language' in config.data)
      ) {
        config.data.language = appLang;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/');
    const isNidaEndpoint = url.includes('/nida/');
    const status = error.response?.status;

    // Only redirect to login on 401 if it's an authenticated session expiration,
    // NEVER when the user is trying to authenticate on /auth/ endpoints
    if (status === 401 && !isAuthEndpoint && !isNidaEndpoint) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/?login=true';
      }
      return Promise.reject(error);
    }

    // Only reload when the browser is actually offline, never on transient/CORS errors
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (isOffline) {
      triggerReload(400);
    }

    return Promise.reject(error);
  }
);

export default api;