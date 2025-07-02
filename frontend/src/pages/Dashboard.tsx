import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [salario, setSalario] = useState(0);
  const [gasto, setGasto] = useState(0);
  const [custo, setCusto] = useState(0);
  const [gastos, setGastos] = useState<string[]>([]);
  const [novoGasto, setNovoGasto] = useState("");

  const data = [
    { name: "Salário", value: salario },
    { name: "Gastos", value: gasto },
    { name: "Custos", value: custo },
  ];
  const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoGasto.trim()) {
      setGastos([...gastos, novoGasto]);
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

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-black min-h-screen text-white">
      {/* Gráfico */}
      <div className="bg-white text-black p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Gráfico Financeiro</h2>
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

      {/* Inputs */}
      <div className="bg-white text-black p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Inserir Dados</h2>
        <input
          type="number"
          placeholder="Salário"
          value={salario}
          onChange={(e) => setSalario(+e.target.value)}
          className="mb-2 w-full p-3 border rounded focus:ring-2 focus:ring-green-600"
        />
        <input
          type="number"
          placeholder="Gastos"
          value={gasto}
          onChange={(e) => setGasto(+e.target.value)}
          className="mb-2 w-full p-3 border rounded focus:ring-2 focus:ring-green-600"
        />
        <input
          type="number"
          placeholder="Custos"
          value={custo}
          onChange={(e) => setCusto(+e.target.value)}
          className="mb-4 w-full p-3 border rounded focus:ring-2 focus:ring-green-600"
        />
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={novoGasto}
            onChange={(e) => setNovoGasto(e.target.value)}
            placeholder="Adicionar item de gasto"
            className="w-full p-3 border rounded mb-2 focus:ring-2 focus:ring-green-600"
          />
          <button className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition-all">
            Adicionar
          </button>
        </form>
      </div>

      {/* Lista de Gastos */}
      <div className="bg-white text-black p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Gastos</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="gastos">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {gastos.map((item, index) => (
                  <Draggable key={item} draggableId={item} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-100 text-black p-3 rounded mb-2 shadow cursor-move"
                      >
                        {item}
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
