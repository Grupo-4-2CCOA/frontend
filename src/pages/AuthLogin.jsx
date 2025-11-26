import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function AuthLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyAuthAndRedirect = async () => {
      try {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
          console.log('Token recebido na URL, armazenando...');
          const decodedToken = decodeURIComponent(tokenFromUrl);
          
          const userInfo = { token: decodedToken };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          const expires = new Date();
          expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
          document.cookie = `AUTH_TOKEN=${decodedToken}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`;
          
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
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