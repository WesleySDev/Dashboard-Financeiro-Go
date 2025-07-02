import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          senha: form.password,
        }),
      });

      if (!response.ok) throw new Error("Credenciais inválidas");

      const data = await response.json();
      auth.login(data.token); // Atualiza o estado
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-gray-900 text-light">
      <div className="bg-white text-black p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Usuário"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
          <button
            type="submit"
            className="w-full bg-accent text-black py-2 rounded hover:brightness-110 transition-all"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
