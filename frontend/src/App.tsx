import React, { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [dados, setDados] = useState({
    receita: 0,
    despesa: 0,
    saldo: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [r1, r2, r3] = await Promise.all([
          api.get('/receitas'),
          api.get('/despesas'),
          api.get('/saldo'),
        ])

        setDados({
          receita: r1.data.total ?? 0,
          despesa: r2.data.total ?? 0,
          saldo: r3.data.total ?? 0,
        })
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 animate-fadeIn">
      <h1 className="text-4xl font-bold text-accent animate-slideUp">Dashboard de Finanças</h1>

      {loading ? (
        <p className="text-light animate-pulse">Carregando dados...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="card animate-slideUp delay-100">💰 Receita: R$ {dados.receita.toLocaleString()}</div>
          <div className="card animate-slideUp delay-200">💸 Despesas: R$ {dados.despesa.toLocaleString()}</div>
          <div className="card animate-slideUp delay-300">📈 Saldo: R$ {dados.saldo.toLocaleString()}</div>
        </div>
      )}

      <button className="button mt-6 animate-slideUp delay-500">Ver Detalhes</button>
    </div>
  )
}

export default App
