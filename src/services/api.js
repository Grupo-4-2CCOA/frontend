import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173',
  withCredentials: true,
});

// Interceptor para redirecionamentos
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redireciona sem usar Axios para evitar problemas de CORS
      window.location.href = '/login?error=session_expired';
      return Promise.reject();
    }
    return Promise.reject(error);
  }
);

export default api;