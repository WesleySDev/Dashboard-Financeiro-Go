import { useState } from "react";

export function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    const userData = localStorage.getItem("usuario");
    return userData ? JSON.parse(userData) : null;
  });

  const login = (dadosUsuario: any) => {
    setUsuario(dadosUsuario);
    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return { usuario, login, logout };
}