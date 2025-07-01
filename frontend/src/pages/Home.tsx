import React, { useEffect, useState } from 'react'
import api from '../api/api'
import ChartCard from '../components/ChartCard'
import { useAuth } from '../auth/useAuth'

function Home() {
  const [resumo, setResumo] = useState({ receita: 0, despesa: 0, saldo: 0 })
  const [graficoResumo, setGraficoResumo] = useState([])
  const [graficoSaldo, setGraficoSaldo] = useState([])
  const [filtro, setFiltro] = useState('7dias')

  const { logout } = useAuth()

  useEffect(() => {
    async function carregarDados() {
      try {
        const [r1, r2, r3] = await Promise.all([
          api.get(`/resumo?periodo=${filtro}`),
          api.get(`/grafico/resumo?periodo=${filtro}`),
          api.get(`/grafico/saldo?periodo=${filtro}`),
        ])

        setResumo(r1.data)
        setGraficoResumo(r2.data)
        setGraficoSaldo(r3.data)
      } catch (err) {
        console.error(err)
      }
    }

    carregarDados()
  }, [filtro])

  return (
    <div className="min-h-screen p-6 bg-primary text-light animate-fadeIn">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-accent">Dashboard</h1>
        <button onClick={logout} className="button">Sair</button>
      </header>

      <div className="mb-4">
        <label className="mr-2">Filtrar por:</label>
        <select
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="text-primary p-2 rounded"
        >
          <option value="7dias">Últimos 7 dias</option>
          <option value="mes">Mês atual</option>
          <option value="ano">Ano atual</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">💰 Receita: R$ {resumo.receita.toLocaleString()}</div>
        <div className="card">💸 Despesas: R$ {resumo.despesa.toLocaleString()}</div>
        <div className="card">📈 Saldo: R$ {resumo.saldo.toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Receitas vs Despesas" type="bar" data={graficoResumo} />
        <ChartCard title="Evolução do Saldo" type="line" data={graficoSaldo} />
      </div>
    </div>
  )
}

export default Home
