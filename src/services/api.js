import axios from 'axios';

// Criação da instância do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // só necessário se backend usar cookies de sessão
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  config => {
    // Pega token do localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log para debug
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    });

    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Evita loop de redirect
      if (window.location.pathname !== '/login' && !window.location.href.includes('/login')) {
        console.log('Sessão expirada, redirecionando para login...');
        setTimeout(() => {
          // window.location.href = '/login?error=session_expired';
        }, 100);
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return !!userInfo?.token;
};

// Função para debug de autenticação
export const getAuthDebugInfo = () => {
  return {
    cookies: document.cookie,
    localStorage: localStorage.getItem('userInfo'),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

export default api;
