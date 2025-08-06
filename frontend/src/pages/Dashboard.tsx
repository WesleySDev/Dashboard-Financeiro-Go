import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth/useAuth";
const Dashboard = () => {
  const { usuario } = useAuth();
  const [salario, setSalario] = useState(0);
  const [gasto, setGasto] = useState(0);
  const [custo, setCusto] = useState(0);
  const [gastos, setGastos] = useState<string[]>([]);
  const [novoGasto, setNovoGasto] = useState("");
  const [dadosSalvos, setDadosSalvos] = useState(false);

  const salarioLiquido = salario - gasto - custo;
  const data = [
    { name: "Disponível", value: salarioLiquido },
    { name: "Gastos", value: gasto },
    { name: "Custos", value: custo },
  ];

  const COLORS = ["#10a37f", "#f97316", "#3b82f6"];

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        const response = await api.get('/transacoes/dashboard');
        if (response.data) {
          setSalario(response.data.salario || 0);
          setGasto(response.data.gasto || 0);
          setCusto(response.data.custo || 0);
          setGastos(response.data.gastos || []);
          setDadosSalvos(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Carregar dados do localStorage como fallback
        const dadosSalvos = localStorage.getItem(`dashboard_${usuario?.id}`);
        if (dadosSalvos) {
          const dados = JSON.parse(dadosSalvos);
          setSalario(dados.salario || 0);
          setGasto(dados.gasto || 0);
          setCusto(dados.custo || 0);
          setGastos(dados.gastos || []);
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
        gastos
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
  }, [salario, gasto, custo, gastos, usuario, dadosSalvos]);

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

  return (
    <div className="bg-[#0d1117] text-white p-6">
      <Link to="/usuarios" className="text-blue-500 hover:underline">
        Ir para aba de Usuários
      </Link>

      <div className="bg-[#0d1117] min-h-screen text-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Gráfico Financeiro</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Formulário */}
        <div className="bg-[#161b22] p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Inserir Dados</h2>
          <input
            type="number"
            placeholder="Salário"
            value={salario === 0 ? "" : salario}
            onChange={(e) => setSalario(+e.target.value)}
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
      </div>
    </div>
  );
};

export default Dashboard;
