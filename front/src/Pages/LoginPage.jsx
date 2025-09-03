import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [showPasswordCadastro, setShowPasswordCadastro] = useState(false);
  const [showConfirmPasswordCadastro, setShowConfirmPasswordCadastro] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center min-h-[calc(100vh-160px)]">
      <div className="bg-[#FFFFFF] rounded-3xl shadow-lg p-8 sm:p-10 md:p-12 w-full max-w-md text-center">
        
        <h1 className="text-4xl font-bold text-[#2D3748] mb-2">Crie sua conta</h1>
        <p className="text-[#A0AEC0] mb-8">Rápido, fácil e grátis!</p>

        <div className="flex bg-[#F4F6F8] rounded-full p-1 mb-8">
          <button
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 
                        ${activeTab === 'cadastro' ? 'bg-[#00B5AD] text-white' : 'text-[#2D3748] hover:bg-gray-200'}`}
            onClick={() => setActiveTab('cadastro')}
          >
            Cadastre-se
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 
                        ${activeTab === 'login' ? 'bg-[#00B5AD] text-white' : 'text-[#2D3748] hover:bg-gray-200'}`}
            onClick={() => setActiveTab('login')}
          >
            Já tenho conta
          </button>
        </div>

        {activeTab === 'cadastro' && (
          <form className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome completo" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8]" 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8]" 
            />
            <div className="relative">
              <input 
                type={showPasswordCadastro ? "text" : "password"} 
                placeholder="Senha" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] pr-10" 
              />
              <span 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#A0AEC0] hover:text-[#2D3748]"
                onClick={() => setShowPasswordCadastro(!showPasswordCadastro)}
              >
                {showPasswordCadastro ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <div className="relative">
              <input 
                type={showConfirmPasswordCadastro ? "text" : "password"} 
                placeholder="Confirmar Senha" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] pr-10" 
              />
              <span 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#A0AEC0] hover:text-[#2D3748]"
                onClick={() => setShowConfirmPasswordCadastro(!showConfirmPasswordCadastro)}
              >
                {showConfirmPasswordCadastro ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#FF8C42] text-white font-bold py-3 px-6 rounded-full hover:opacity-80 transition-opacity duration-300 cursor-pointer mt-6"
            >
              Cadastrar-se
            </button>
            <p className="text-[#A0AEC0] text-xs mt-4">
              Ao se cadastrar, você concorda com nossos <br/>
              <Link to="/termos-de-servico" className="text-[#00B5AD] hover:underline">Termos de Serviço</Link> e 
              <Link to="/politica-de-privacidade" className="text-[#00B5AD] hover:underline"> Política de Privacidade</Link>.
            </p>
          </form>
        )}

        {activeTab === 'login' && (
          <form className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8]" 
            />
            <div className="relative">
              <input 
                type={showPasswordLogin ? "text" : "password"} 
                placeholder="Senha" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] pr-10" 
              />
              <span 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#A0AEC0] hover:text-[#2D3748]"
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
              >
                {showPasswordLogin ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <Link to="/esqueci-senha" className="text-[#00B5AD] text-sm hover:underline block text-right">Esqueceu a senha?</Link>
            <button 
              type="submit" 
              className="w-full bg-[#FF8C42] text-white font-bold py-3 px-6 rounded-full hover:opacity-80 transition-opacity duration-300 cursor-pointer mt-6"
            >
              Entrar
            </button>
            <p className="text-[#A0AEC0] text-sm mt-4">
              Não tem uma conta?{' '}
              <button 
                type="button" 
                onClick={() => setActiveTab('cadastro')} 
                className="text-[#00B5AD] font-semibold hover:underline"
              >
                Cadastre-se aqui
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;