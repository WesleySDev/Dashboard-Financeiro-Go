import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, usuario } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - usuario:', usuario);
  
  // Verificação adicional para garantir que temos dados do usuário
  const reallyAuthenticated = isAuthenticated && !!usuario && !!usuario.token;
  console.log('ProtectedRoute - reallyAuthenticated:', reallyAuthenticated);

  if (!reallyAuthenticated) {
    console.log('ProtectedRoute - Redirecionando para /login');
    return <Navigate to="/login" />;
  }

  console.log('ProtectedRoute - Renderizando children');
  return children;
};

export default ProtectedRoute;
