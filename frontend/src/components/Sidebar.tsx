import React, { useState, useRef } from 'react';
import { useAuth } from '../auth/useAuth';

const Sidebar = () => {
  const { usuario, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(usuario?.nome || '');
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleSaveChanges = async () => {
    try {
      // Atualizar o nome do usuário
      updateUserData({ nome: userName });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUserImage(result);
        
        // Atualizar no localStorage
        // Atualizar a imagem do usuário
        updateUserData({ imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#161b22] h-full min-h-screen w-16 fixed left-0 top-0 flex flex-col items-center py-4 transition-all duration-300 hover:w-64 group z-10">
      <div className="mt-4 relative w-full flex flex-col items-center">
        <div 
          className="relative cursor-pointer group"
          onClick={() => setShowOptions(!showOptions)}
        >
          <div className="w-10 h-10 rounded-full bg-[#10a37f] flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#6366f1] transition-all">
            {userImage || usuario?.imageUrl ? (
              <img 
                src={userImage || usuario?.imageUrl} 
                alt="Foto do usuário" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold">
                {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          <div className="hidden group-hover:block absolute -top-1 -right-1 bg-[#10a37f] rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
            <span>+</span>
          </div>
        </div>
        
        <div className="hidden group-hover:block mt-2 text-center">
          <p className="text-white font-semibold truncate w-56 px-2">{usuario?.nome || 'Usuário'}</p>
          <p className="text-gray-400 text-xs truncate w-56 px-2">@{usuario?.username}</p>
        </div>

        {showOptions && (
          <div className="absolute top-12 left-16 w-64 bg-[#1e293b] p-4 rounded-lg shadow-xl animate-fadeIn z-20">
            <h3 className="text-white font-bold mb-3">Perfil do Usuário</h3>
            
            <div className="mb-4 flex flex-col items-center">
              <div 
                onClick={handleImageClick} 
                className="w-20 h-20 rounded-full bg-[#10a37f] flex items-center justify-center mb-2 cursor-pointer overflow-hidden hover:opacity-80 transition-all"
              >
                {userImage || usuario?.imageUrl ? (
                  <img 
                    src={userImage || usuario?.imageUrl} 
                    alt="Foto do usuário" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-gray-400 text-xs mb-2">Clique para alterar a foto</p>
            </div>
            
            {isEditing ? (
              <div className="mb-4">
                <label className="text-white text-sm block mb-1">Nome</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={handleNameChange} 
                  className="w-full p-2 rounded bg-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] text-sm"
                />
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleSaveChanges} 
                    className="flex-1 bg-[#10a37f] text-white font-semibold py-1 rounded hover:bg-[#0f8e6b] transition-all text-sm"
                  >
                    Salvar
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setUserName(usuario?.nome || '');
                    }} 
                    className="flex-1 bg-[#30363d] text-white font-semibold py-1 rounded hover:bg-[#4a5568] transition-all text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-gray-400 text-xs block">Nome</label>
                    <p className="text-white">{usuario?.nome || 'Usuário'}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="text-[#6366f1] hover:text-[#4f46e5] text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="text-gray-400 text-xs block">Usuário</label>
              <p className="text-white">@{usuario?.username}</p>
            </div>
            
            <button 
              onClick={() => setShowOptions(false)} 
              className="w-full bg-[#30363d] text-white font-semibold py-2 rounded hover:bg-[#4a5568] transition-all text-sm"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;