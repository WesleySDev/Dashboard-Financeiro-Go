import React from "react";

const Usuarios: React.FC = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Informações do Usuário</h2>
      <div className="bg-white shadow-md p-4 rounded-md">
        <p><strong>Nome:</strong> {usuario.nome}</p>
        <p><strong>Username:</strong> {usuario.username}</p>
        <p><strong>ID:</strong> {usuario.id}</p>
      </div>
    </div>
  );
};

export default Usuarios;