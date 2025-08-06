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
      console.log('Tentando login com:', { username: form.username });
      
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          senha: form.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta do login:', errorData);
        throw new Error(errorData.erro || "Credenciais inválidas");
      }

      const data = await response.json();
      console.log('Resposta do login:', data);
      
      if (!data.token) {
        throw new Error("Token não recebido do servidor");
      }
      
      // Obter dados do usuário após login bem-sucedido
      console.log('Buscando dados do usuário com token:', data.token);
      const userResponse = await fetch("http://localhost:3000/me", {
        headers: {
          "Authorization": `Bearer ${data.token}`,
        },
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error('Erro ao obter dados do usuário:', errorData);
        throw new Error(errorData.erro || "Erro ao obter dados do usuário");
      }
      
      const userData = await userResponse.json();
      console.log('Dados do usuário recebidos:', userData);
      
      // Salvar token e dados do usuário
      const userInfo = {
        token: data.token,
        id: userData.id,
        nome: userData.nome,
        username: userData.username
      };
      
      console.log('Salvando dados do usuário:', userInfo);
      auth.login(userInfo);
      
      navigate("/dashboard");
    } catch (err) {
      console.error('Erro durante o login:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
            Entrar
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          Ainda não tem conta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-400 hover:underline"
          >
            Crie uma
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
