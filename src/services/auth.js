import api from './api';

export const checkAuth = async () => {
  const response = await api.get('/auth/check-auth');
  return response.data;
};

export const getUserInfo = async () => {
  const response = await api.get('/auth/user-info');
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};