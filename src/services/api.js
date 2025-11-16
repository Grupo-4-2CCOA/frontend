import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    const token = getCookie('AUTH_TOKEN');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      hasToken: !!token,
      cookies: document.cookie
    });

    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && !window.location.href.includes('/login')) {
        console.log('Sessão expirada, redirecionando para login...');
        setTimeout(() => {
          window.location.href = '/login?error=session_expired';
        }, 100);
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setAuthCookie = (token, days = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `AUTH_TOKEN=${token}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`;
};

export const isAuthenticated = () => {
  const token = getCookie('AUTH_TOKEN');
  return !!token;
};

export const getAuthDebugInfo = () => {
  return {
    cookies: document.cookie,
    localStorage: localStorage.getItem('userInfo'),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

export default api;
