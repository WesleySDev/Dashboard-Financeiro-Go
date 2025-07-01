import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const res = await api.post('/login', { email, senha })
      await login(res.data.token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } }
      const status = axiosErr?.response?.status
      if (status === 401 || status === 404) {
        setErro('Credenciais inválidas. Verifique e tente novamente.')
      } else {
        setErro('Erro inesperado ao tentar logar.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary text-light animate-fadeIn">
      <form onSubmit={handleSubmit} className="bg-light text-black p-6 rounded-lg shadow-md w-full max-w-sm space-y-4 animate-slideUp">
        <h1 className="text-2xl font-bold text-center text-primary">Conecte-se</h1>
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="bg-accent text-black py-2 px-4 rounded w-full hover:opacity-90 transition">Entrar</button>
        <p className="text-sm text-center">
          Ainda não tem conta? <span onClick={() => navigate('/register')} className="text-accent hover:underline cursor-pointer">Clique aqui</span>
        </p>
      </form>
    </div>
  )
}

export default Login
