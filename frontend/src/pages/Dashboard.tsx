import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2 } from "lucide-react";

const Dashboard = () => {
  const [salario, setSalario] = useState(0);
  const [gasto, setGasto] = useState(0);
  const [custo, setCusto] = useState(0);
  const [gastos, setGastos] = useState<string[]>([]);
  const [novoGasto, setNovoGasto] = useState("");

  const salarioLiquido = salario - gasto - custo;
  const data = [
    { name: "Disponível", value: salarioLiquido },
    { name: "Gastos", value: gasto },
    { name: "Custos", value: custo },
  ];

  const COLORS = ["#10a37f", "#f97316", "#3b82f6"];

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
            className="w-full p-3 rounded bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
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
  );
};

export default Dashboard;
