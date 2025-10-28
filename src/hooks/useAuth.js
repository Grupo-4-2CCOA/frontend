import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function useAuth(requiredRole) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/user-info');
        const data = response.data || {};
        const normalizedUser = {
          id: data.id
            ?? data.userId
            ?? data._id
            ?? data.usuarioId
            ?? data.clienteId
            ?? data.idUsuario
            ?? data.idCliente
            ?? data.user_id
            ?? data.id_user
            ?? data.idcliente
            ?? data.cliente_id
            ?? (data.user && data.user.id)
            ?? null,
          role: data.role ?? data.papel ?? data.perfil ?? null,
          name: data.name ?? data.nome ?? data.username ?? '',
          email: data.email ?? data.mail ?? '',
          ...data,
        };
        if (normalizedUser.id == null) {
          // Ajuda a diagnosticar rapidamente se o backend usa outro campo de id
          console.warn('useAuth: id ausente em /auth/user-info. Payload recebido:', data);
        }
        setUserInfo(normalizedUser);
        
        if (!requiredRole || normalizedUser.role === requiredRole) {
          setIsAuthorized(true);
        } else {
          navigate('/unauthorized');
        }
      } catch (error) {
        console.error('Erro na autenticação:', error);
        // Só redireciona se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  return { isAuthorized, userInfo };
}