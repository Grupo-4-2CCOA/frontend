import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function AuthLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyAuthAndRedirect = async () => {
      try {
        // 1. Verifica se há token na URL (passado pelo backend após login)
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
          console.log('Token recebido na URL, armazenando...');
          // Decodifica o token (foi codificado pelo backend)
          const decodedToken = decodeURIComponent(tokenFromUrl);
          
          // Armazena o token no localStorage para o interceptor poder usar
          const userInfo = { token: decodedToken };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          // Também armazena em um cookie não-HttpOnly como fallback
          const expires = new Date();
          expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 1 dia
          document.cookie = `AUTH_TOKEN=${decodedToken}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`;
          
          // Remove o token da URL por segurança
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // 2. Verifica autenticação e obtém a role
        const response = await api.get('/auth/user-info');
        const { role } = response.data;

        // 2. Redireciona conforme a role
        switch(role) {
          case 'OWNER':
          case 'Administrador':
            navigate('/system-dashboard');
            break;
          case 'FUNC':
          case 'Funcionário':
            navigate('/system-dashboard');
            break;
          case 'Cliente':
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
  }, [navigate, searchParams]);

  return <div>Verificando autenticação...</div>;
}