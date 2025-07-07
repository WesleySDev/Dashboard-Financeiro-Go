import { useEffect, useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("token")
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("token");
    setToken(stored);
  }, []);

  function login(token: string) {
    sessionStorage.setItem("token", token);
    setToken(token);
  }

  function logout() {
    sessionStorage.removeItem("token");
    setToken(null);
  }

  return { token, login, logout, isAuthenticated: !!token };
}
