import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/register', { nome, email, senha })
      navigate('/login')
    } catch (err: any) {
      const mensagem = err?.response?.data?.erro || 'Erro ao cadastrar. Tente outro e-mail.'
      setErro(mensagem)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary text-light animate-fadeIn">
      <form onSubmit={handleSubmit} className="bg-light text-black p-6 rounded-lg shadow-md w-full max-w-sm space-y-4 animate-slideUp">
        <h2 className="text-2xl font-bold text-center text-primary">Criar Conta</h2>
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <input
          type="text"
          placeholder="Nome"
          className="w-full p-2 border border-gray-300 rounded"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border border-gray-300 rounded"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />
        <button type="submit" className="bg-accent text-black py-2 px-4 rounded w-full hover:opacity-90 transition">Cadastrar</button>
        <p className="text-sm text-center">
          Já tem conta? <span onClick={() => navigate('/login')} className="text-accent hover:underline cursor-pointer">Fazer login</span>
        </p>
      </form>
    </div>
  )
}

export default Register
