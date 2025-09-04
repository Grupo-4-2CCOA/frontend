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
        setUserInfo(response.data);
        
        if (!requiredRole || response.data.role === requiredRole) {
          setIsAuthorized(true);
        } else {
          navigate('/unauthorized');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  return { isAuthorized, userInfo };
}