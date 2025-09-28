// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { checkAuth } from '../services/auth';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const [isAuthorized, setIsAuthorized] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         const authData = await checkAuth();
        
//         if (authData.isAuthenticated && allowedRoles.includes(authData.role)) {
//           setIsAuthorized(true);
//         } else {
//           navigate('/login?error=unauthorized');
//         }
//       } catch (error) {
//         navigate('/login');
//       }
//     };

//     verifyAuth();
//   }, [navigate, allowedRoles]);

//   if (isAuthorized === null) {
//     return <div className="loading">Verificando autenticação...</div>;
//   }

//   return isAuthorized ? children : null;
// };

// export default ProtectedRoute;