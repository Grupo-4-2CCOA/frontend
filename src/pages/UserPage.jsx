import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function AdminPage() {
  const { userInfo } = useAuth('USER'); // Somente ADMIN pode acessar

  if (!userInfo) return <div>Carregando...</div>;

  const handleLogout = async () => {
    try {
      // Primeiro tenta fazer logout via API
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Fallback garantido que funciona:
      // 1. Limpa os cookies manualmente
      document.cookie = 'AUTH_TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'USER_ROLE=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // 2. Redireciona usando window.location (não Axios)
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <h1>Painel do User</h1>
      <p>Bem-vindo, {userInfo.name} ({userInfo.role})</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}