import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.username,
          username: form.username,
          senha: form.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }

      alert("Usuário cadastrado com sucesso!");
      navigate("/login");
    } catch (err) {
      alert("Falha no cadastro");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Usuário"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#6366f1] text-white font-semibold py-2 rounded hover:bg-[#4f46e5] transition-all"
          >
            Cadastrar
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          já possui uma conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-400 hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
