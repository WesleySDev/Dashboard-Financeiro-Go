import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AuthContextType {
  usuario: any;
  isAuthenticated: boolean;
  login: (dadosUsuario: any) => void;
  logout: () => void;
  updateUserData: (dadosAtualizados: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<any>(() => {
    const userData = localStorage.getItem('usuario');
    return userData ? JSON.parse(userData) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const userData = localStorage.getItem('usuario');
    return !!userData;
  });

  useEffect(() => {
    setIsAuthenticated(!!usuario);
  }, [usuario]);

  const login = (dadosUsuario: any) => {
    console.log('AuthContext.login recebeu:', dadosUsuario);
    if (!dadosUsuario || !dadosUsuario.token) {
      console.error('Dados de usuário inválidos ou token ausente');
      return;
    }
    
    setUsuario(dadosUsuario);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    console.log('Dados salvos no localStorage:', JSON.stringify(dadosUsuario));
    setIsAuthenticated(true);
    console.log('isAuthenticated definido como true');
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
  };

  const updateUserData = (dadosAtualizados: any) => {
    if (!dadosAtualizados) {
      console.error('Dados de atualização inválidos');
      return;
    }
    
    const updatedUser = { ...usuario, ...dadosAtualizados };
    setUsuario(updatedUser);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
    console.log('Dados do usuário atualizados:', updatedUser);
  };

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}