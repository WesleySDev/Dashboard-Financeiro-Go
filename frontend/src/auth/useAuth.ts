import { useEffect, useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    const stored = localStorage.getItem('token')
    setToken(stored)
  }, [])

  function login(token: string) {
    localStorage.setItem('token', token)
    setToken(token)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return { token, login, logout, isAuthenticated: !!token }
}
