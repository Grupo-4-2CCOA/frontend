import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AuthLoading() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuthAndRedirect = async () => {
      try {
        // 1. Verifica autenticação e obtém a role
        const response = await api.get('/auth/user-info');
        const { role } = response.data;

        // 2. Redireciona conforme a role
        switch(role) {
          case 'OWNER':
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'FUNC':
          case 'EMPLOYEE':
            navigate('/admin/dashboard');
            break;
          case 'USER':
            navigate('/agendamento');
            break;
          default:
            navigate('/login?error=invalid_role');
        }
      } catch (error) {
        console.error('Erro na verificação:', error);
        navigate('/login?error=auth_failed');
      }
    };
   
    verifyAuthAndRedirect();
  }, [navigate]);

  return <div>Verificando autenticação...</div>;
}