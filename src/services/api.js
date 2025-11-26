import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};


api.interceptors.request.use(
  configReq => {
    let token = null;
    
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        token = userInfo?.token;
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage:', e);
    }
    
    if (!token) {
      token = getCookie('AUTH_TOKEN');
    }

    if (token) {
      configReq.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const googleToken = getCookie('GOOGLE_ACCESS_TOKEN');
    if (googleToken) {
      configReq.headers['X-Google-Access-Token'] = googleToken;
    }

    if (!token) {
      console.warn('⚠️ Token não encontrado para a requisição:', {
        url: configReq.url,
        method: configReq.method,
        localStorage: localStorage.getItem('userInfo'),
        cookies: document.cookie
      });
    }

    return configReq;
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

export const isAuthenticated = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) return false;
    const userInfo = JSON.parse(userInfoStr);
    return !!userInfo?.token;
  } catch (e) {
    return false;
  }
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