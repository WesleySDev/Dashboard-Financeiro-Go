import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2, Plus, Calendar } from "lucide-react";
import api from "../api";
import { useAuth } from "../auth/useAuth";
import Sidebar from "../components/Sidebar";

interface Conta {
  id: string;
  tipo: string;
  valor: number;
  dataPagamento: string;
  pago: boolean;
}
const Dashboard = () => {
  const { usuario } = useAuth();
  const [salario, setSalario] = useState(0);
  const [gasto, setGasto] = useState(0);
  const [custo, setCusto] = useState(0);
  const [gastos, setGastos] = useState<string[]>([]);
  const [novoGasto, setNovoGasto] = useState("");
  const [dadosSalvos, setDadosSalvos] = useState(false);
  
  // Novos estados para ganhos mensais e contas
  const [ganhosMensais, setGanhosMensais] = useState(0);
  const [contas, setContas] = useState<Conta[]>([]);
  const [novaConta, setNovaConta] = useState({ tipo: "", valor: "", data: "" });
  const [mostrarFormConta, setMostrarFormConta] = useState(false);
  
  // Calcular total de contas pagas no mês atual
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const contasPagasMes = contas.filter(conta => {
    const dataConta = new Date(conta.dataPagamento);
    return conta.pago && dataConta.getMonth() === mesAtual && dataConta.getFullYear() === anoAtual;
  });
  const totalContasPagas = contasPagasMes.reduce((total, conta) => total + conta.valor, 0);

  // Dados para o gráfico baseados nos ganhos mensais
  const saldoDisponivel = Math.max(0, ganhosMensais - totalContasPagas - gasto - custo);
  const data = [
    { name: "Saldo Disponível", value: saldoDisponivel },
    { name: "Contas Pagas", value: totalContasPagas },
    { name: "Gastos Extras", value: gasto },
    { name: "Custos Fixos", value: custo },
  ].filter(item => item.value > 0); // Remove itens com valor zero

  const COLORS = ["#10a37f", "#ef4444", "#f97316", "#3b82f6"];

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        const response = await api.get('/transacoes/dashboard');
        if (response.data) {
          const salarioCarregado = response.data.salario || 0;
          const ganhosMensaisCarregados = response.data.ganhosMensais || 0;
          
          setSalario(salarioCarregado);
          setGasto(response.data.gasto || 0);
          setCusto(response.data.custo || 0);
          setGastos(response.data.gastos || []);
          
          // Se ganhos mensais não estiver definido, usar o salário como base
          setGanhosMensais(ganhosMensaisCarregados || salarioCarregado);
          setContas(response.data.contas || []);
          setDadosSalvos(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Carregar dados do localStorage como fallback
        const dadosSalvos = localStorage.getItem(`dashboard_${usuario?.id}`);
        if (dadosSalvos) {
          const dados = JSON.parse(dadosSalvos);
          const salarioCarregado = dados.salario || 0;
          const ganhosMensaisCarregados = dados.ganhosMensais || 0;
          
          setSalario(salarioCarregado);
          setGasto(dados.gasto || 0);
          setCusto(dados.custo || 0);
          setGastos(dados.gastos || []);
          
          // Se ganhos mensais não estiver definido, usar o salário como base
          setGanhosMensais(ganhosMensaisCarregados || salarioCarregado);
          setContas(dados.contas || []);
        }
      }
    };

    if (usuario?.id) {
      carregarDadosUsuario();
    }
  }, [usuario]);

  // Salvar dados quando houver alterações
  useEffect(() => {
    const salvarDados = async () => {
      if (!usuario?.id || !dadosSalvos) return;
      
      const dadosDashboard = {
        salario,
        gasto,
        custo,
        gastos,
        ganhosMensais,
        contas
      };
      
      // Salvar no localStorage como backup
      localStorage.setItem(`dashboard_${usuario.id}`, JSON.stringify(dadosDashboard));
      
      try {
        await api.post('/transacoes/dashboard', dadosDashboard);
      } catch (error) {
        console.error('Erro ao salvar dados do dashboard:', error);
      }
    };
    
    salvarDados();
  }, [salario, gasto, custo, gastos, ganhosMensais, contas, usuario, dadosSalvos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoGasto.trim()) {
      setGastos([...gastos, novoGasto]);
      const valor = parseFloat(novoGasto);
      if (!isNaN(valor)) setGasto(gasto + valor);
      setNovoGasto("");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(gastos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setGastos(items);
  };

  const deletarGasto = (index: number) => {
    const itemRemovido = gastos[index];
    const novoArray = [...gastos];
    novoArray.splice(index, 1);
    setGastos(novoArray);
    const valor = parseFloat(itemRemovido);
    if (!isNaN(valor)) setGasto(gasto - valor);
  };

  // Funções para gerenciar contas
  const adicionarConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaConta.tipo && novaConta.valor && novaConta.data) {
      const conta: Conta = {
        id: Date.now().toString(),
        tipo: novaConta.tipo,
        valor: parseFloat(novaConta.valor),
        dataPagamento: novaConta.data,
        pago: false
      };
      setContas([...contas, conta]);
      setNovaConta({ tipo: "", valor: "", data: "" });
      setMostrarFormConta(false);
    }
  };

  const marcarContaPaga = (id: string) => {
    setContas(contas.map(conta => 
      conta.id === id ? { ...conta, pago: !conta.pago } : conta
    ));
  };

  const deletarConta = (id: string) => {
    setContas(contas.filter(conta => conta.id !== id));
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="bg-[#0d1117] text-white p-6 ml-16 w-full">
        {/* Seção de Ganhos Mensais */}
        <div className="mb-6">
          <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-[#10a37f]" size={20} />
              Resumo Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            
            {/* Linha principal de ganhos */}
            <div className="mb-4">
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <label className="text-gray-400 text-sm block mb-1">💰 Ganhos Totais do Mês</label>
                <input
                  type="number"
                  placeholder="Digite seus ganhos mensais"
                  value={ganhosMensais === 0 ? "" : ganhosMensais}
                  onChange={(e) => setGanhosMensais(+e.target.value)}
                  className="w-full bg-transparent text-[#10a37f] text-2xl font-bold focus:outline-none placeholder-gray-500"
                />
                {salario > 0 && ganhosMensais !== salario && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Salário base: {formatarMoeda(salario)} 
                    <button 
                      onClick={() => setGanhosMensais(salario)}
                      className="ml-2 text-[#10a37f] hover:underline"
                    >
                      usar como base
                    </button>
                  </p>
                )}
              </div>
            </div>
            
            {/* Grid de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  🧾 Contas Pagas ({contasPagasMes.length})
                </p>
                <p className="text-red-400 text-xl font-bold">{formatarMoeda(totalContasPagas)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {contas.filter(c => !c.pago).length} pendentes
                </p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  💸 Gastos Extras ({gastos.length})
                </p>
                <p className="text-orange-400 text-xl font-bold">{formatarMoeda(gasto)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  + custos: {formatarMoeda(custo)}
                </p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                <p className="text-gray-400 text-sm">💵 Saldo Disponível</p>
                <p className={`text-xl font-bold ${ganhosMensais - totalContasPagas - gasto - custo >= 0 ? 'text-[#10a37f]' : 'text-red-400'}`}>
                  {formatarMoeda(ganhosMensais - totalContasPagas - gasto - custo)}
                </p>
                {ganhosMensais > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {((ganhosMensais - totalContasPagas - gasto - custo) / ganhosMensais * 100).toFixed(1)}% dos ganhos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0d1117] min-h-screen text-white p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Gráfico */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">📊 Distribuição Financeira Mensal</h2>
          {ganhosMensais === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>💡 Defina seus ganhos mensais para ver a distribuição</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          )}
          </div>

        {/* Formulário */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Inserir Dados</h2>
          <input
            type="number"
            placeholder="Salário Base"
            value={salario === 0 ? "" : salario}
            onChange={(e) => {
              const novoSalario = +e.target.value;
              setSalario(novoSalario);
              // Se ganhos mensais ainda não foi definido, sincronizar com salário
              if (ganhosMensais === 0) {
                setGanhosMensais(novoSalario);
              }
            }}
            className="mb-2 w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          />
          <input
            type="number"
            placeholder="Custos"
            value={custo === 0 ? "" : custo}
            onChange={(e) => setCusto(+e.target.value)}
            className="mb-2 w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          />
          <input
            type="number"
            placeholder="Gastos extras"
            value={gasto === 0 ? "" : gasto}
            onChange={(e) => setGasto(+e.target.value)}
            className="mb-4 w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          />
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={novoGasto}
              onChange={(e) => setNovoGasto(e.target.value)}
              placeholder="Adicionar gasto"
              className="w-full p-3 rounded bg-[#0d2117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
            />
            <button className="w-full mt-3 bg-[#10a37f] text-white font-semibold py-2 rounded hover:bg-[#0f8e6b] transition-all">
              Adicionar
            </button>
          </form>
        </div>

        {/* Lista de Gastos */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Gastos</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gastos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {gastos.map((item, index) => (
                    <Draggable
                      key={item + index}
                      draggableId={item + index}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-[#0d1117] text-white flex justify-between items-center p-3 rounded mb-2 border border-[#30363d] shadow"
                        >
                          {item}
                          <button onClick={() => deletarGasto(index)}>
                            <Trash2
                              className="text-red-400 hover:text-red-500 transition"
                              size={18}
                            />
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Tabela de Contas */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Contas do Mês</h2>
            <button
              onClick={() => setMostrarFormConta(!mostrarFormConta)}
              className="bg-[#10a37f] text-white p-2 rounded-lg hover:bg-[#0f8e6b] transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Nova Conta
            </button>
          </div>

          {mostrarFormConta && (
            <form onSubmit={adicionarConta} className="mb-4 p-4 bg-[#0d1117] rounded-lg border border-[#30363d]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Tipo de conta (ex: Luz)"
                  value={novaConta.tipo}
                  onChange={(e) => setNovaConta({...novaConta, tipo: e.target.value})}
                  className="p-2 rounded bg-[#161b22] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  required
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={novaConta.valor}
                  onChange={(e) => setNovaConta({...novaConta, valor: e.target.value})}
                  className="p-2 rounded bg-[#161b22] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  required
                />
                <input
                  type="date"
                  value={novaConta.data}
                  onChange={(e) => setNovaConta({...novaConta, data: e.target.value})}
                  className="p-2 rounded bg-[#161b22] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#10a37f] text-white px-4 py-2 rounded hover:bg-[#0f8e6b] transition-all"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormConta(false)}
                  className="bg-[#30363d] text-white px-4 py-2 rounded hover:bg-[#4a5568] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="max-h-64 overflow-y-auto">
            {contas.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma conta cadastrada</p>
            ) : (
              <div className="space-y-2">
                {contas.map((conta) => (
                  <div
                    key={conta.id}
                    className={`p-3 rounded-lg border transition-all ${
                      conta.pago 
                        ? 'bg-[#0d1117] border-[#10a37f] border-opacity-50' 
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={conta.pago}
                            onChange={() => marcarContaPaga(conta.id)}
                            className="w-4 h-4 text-[#10a37f] bg-[#161b22] border-[#30363d] rounded focus:ring-[#10a37f]"
                          />
                          <div>
                            <p className={`font-medium ${
                              conta.pago ? 'text-gray-400 line-through' : 'text-white'
                            }`}>
                              {conta.tipo}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatarData(conta.dataPagamento)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${
                          conta.pago ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {formatarMoeda(conta.valor)}
                        </span>
                        <button
                          onClick={() => deletarConta(conta.id)}
                          className="text-red-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
