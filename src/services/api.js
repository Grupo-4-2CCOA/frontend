import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.URL_ENDPOINT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar headers de autenticação se necessário
api.interceptors.request.use(
  config => {
    // Log para debug
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    });
    
    // Verificar se há cookies de autenticação
    const cookies = document.cookie;
    console.log('Cookies disponíveis:', cookies);
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para redirecionamentos
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Verifica se já está na página de login para evitar loop
      if (window.location.pathname !== '/login' && !window.location.href.includes('/login')) {
        console.log('Sessão expirada, redirecionando para login...');
        // Usar setTimeout para evitar problemas de timing
        setTimeout(() => {
          window.location.href = '/login?error=session_expired';
        }, 100);
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const cookies = document.cookie;
  return cookies.includes('AUTH_TOKEN') || cookies.includes('JSESSIONID') || cookies.includes('JSESSIONID=');
};

// Função para obter informações de debug sobre a autenticação
export const getAuthDebugInfo = () => {
  return {
    cookies: document.cookie,
    hasAuthToken: document.cookie.includes('AUTH_TOKEN'),
    hasJSessionId: document.cookie.includes('JSESSIONID'),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

export default api;