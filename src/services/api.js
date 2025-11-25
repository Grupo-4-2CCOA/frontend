import axios from 'axios';
import config from '../config';

// Criação da instância do Axios usando URL configurável
const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true, // só necessário se backend usar cookies de sessão
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


// Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  configReq => {
    let token = null;
    
    // 1. Tenta pegar token do localStorage (prioridade)
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        token = userInfo?.token;
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage:', e);
    }
    
    // 2. Se não encontrou no localStorage, tenta pegar do cookie AUTH_TOKEN
    if (!token) {
      token = getCookie('AUTH_TOKEN');
    }

    // 3. Adiciona o token no header Authorization se encontrado
    if (token) {
      configReq.headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Adiciona token do Google se disponível
    const googleToken = getCookie('GOOGLE_ACCESS_TOKEN');
    if (googleToken) {
      configReq.headers['X-Google-Access-Token'] = googleToken;
    }

    // Log para debug (apenas se não houver token para diagnosticar)
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

// Interceptor para tratar respostas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Evita loop de redirect
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

// Função para verificar se o usuário está autenticado
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