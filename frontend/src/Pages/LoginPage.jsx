import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../services/api'; // Certifique-se que o caminho está correto

const LoginPage = () => {
  const [searchParams] = useSearchParams();

  // --- Estados da UI ---
  const [activeTab, setActiveTab] = useState('cadastro');
  const [showPasswordCadastro, setShowPasswordCadastro] = useState(false);
  const [showConfirmPasswordCadastro, setShowConfirmPasswordCadastro] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  // --- Estados de Lógica e Dados ---
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [registerData, setRegisterData] = useState({ nome: '', email: '', senha: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'favorite') {
      setInfoMessage('Você precisa estar logado para favoritar um filme!');
    }
  }, [searchParams]);

  // --- Handlers de Mudança nos Inputs ---
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- Handlers de Submissão dos Formulários ---
  const [loginTouched, setLoginTouched] = useState({ email: false, senha: false });
  const [registerTouched, setRegisterTouched] = useState({ nome: false, email: false, senha: false, confirmPassword: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, senha: true });
    if (!loginData.email || !loginData.senha) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const result = await authService.login(loginData.email, loginData.senha);
      if (result?.token) {
        navigate('/'); // Redireciona para a home após o login
      } else {
        setError('Erro no login. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      const errorMessage = err.response?.status === 401
        ? 'Email ou senha incorretos.'
        : 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterTouched({ nome: true, email: true, senha: true, confirmPassword: true });
    if (!registerData.nome || !registerData.email || !registerData.senha || !registerData.confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    if (registerData.senha !== registerData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // Remove confirmPassword antes de enviar
      const { confirmPassword, ...dataToRegister } = registerData;
      const result = await authService.register(dataToRegister);

      if (result?.token) {
        // Registro já faz login automaticamente no backend
        navigate('/'); // Redireciona para a home
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao criar a conta. Verifique os dados ou tente outro email.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center min-h-[calc(100vh-160px)]">
      <div className="bg-[#FFFFFF] rounded-3xl shadow-lg p-8 sm:p-10 md:p-12 w-full max-w-md text-center">
        
        <h1 className="text-4xl font-bold text-[#2D3748] mb-2">
          {activeTab === 'cadastro' ? 'Crie sua conta' : 'Bem-vindo de volta!'}
        </h1>
        <p className="text-[#A0AEC0] mb-8">
          {activeTab === 'cadastro' ? 'Rápido, fácil e grátis!' : 'Acesse sua conta para continuar.'}
        </p>

        <div className="flex bg-[#F4F6F8] rounded-full p-1 mb-8">
          <button
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 
                        ${activeTab === 'cadastro' ? 'bg-[#00B5AD] text-white' : 'text-[#2D3748] hover:bg-gray-200'}`}
            onClick={() => { setActiveTab('cadastro'); setError(''); }}
          >
            Cadastre-se
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 
                        ${activeTab === 'login' ? 'bg-[#00B5AD] text-white' : 'text-[#2D3748] hover:bg-gray-200'}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Já tenho conta
          </button>
        </div>

        {/* Exibição de Mensagem Informativa */}
        {infoMessage && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                <span className="block sm:inline">{infoMessage}</span>
            </div>
        )}

        {/* Exibição de Erro */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Formulário de Cadastro */}
        {activeTab === 'cadastro' && (
          <form className="space-y-4" onSubmit={handleRegister}>
            <input 
              type="text" 
              name="nome"
              placeholder="Nome completo" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8]" 
              value={registerData.nome}
              onChange={handleRegisterChange}
              onBlur={() => setRegisterTouched(t => ({ ...t, nome: true }))}
              disabled={loading}
              required
            />
            {registerTouched.nome && !registerData.nome && <span style={{color: 'red', fontSize: 12}}>Campo obrigatório</span>}
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8]" 
              value={registerData.email}
              onChange={handleRegisterChange}
              onBlur={() => setRegisterTouched(t => ({ ...t, email: true }))}
              disabled={loading}
              required
            />
            {registerTouched.email && !registerData.email && <span style={{color: 'red', fontSize: 12}}>Campo obrigatório</span>}
            <div className="relative">
              <input 
                type={showPasswordCadastro ? "text" : "password"} 
                name="senha"
                placeholder="Senha" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] pr-10" 
                value={registerData.senha}
                onChange={handleRegisterChange}
                onBlur={() => setRegisterTouched(t => ({ ...t, senha: true }))}
                disabled={loading}
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#A0AEC0] hover:text-[#2D3748]" onClick={() => setShowPasswordCadastro(!showPasswordCadastro)}>
                {showPasswordCadastro ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            {registerTouched.senha && !registerData.senha && <span style={{color: 'red', fontSize: 12}}>Campo obrigatório</span>}
            <div className="relative">
              <input 
                type={showConfirmPasswordCadastro ? "text" : "password"} 
                name="confirmPassword"
                placeholder="Confirmar Senha" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] pr-10" 
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                onBlur={() => setRegisterTouched(t => ({ ...t, confirmPassword: true }))}
                disabled={loading}
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#A0AEC0] hover:text-[#2D3748]" onClick={() => setShowConfirmPasswordCadastro(!showConfirmPasswordCadastro)}>
                {showConfirmPasswordCadastro ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            {registerTouched.confirmPassword && !registerData.confirmPassword && <span style={{color: 'red', fontSize: 12}}>Campo obrigatório</span>}
            <button 
              type="submit" 
              className="w-full bg-[#FF8C42] text-white font-bold py-3 px-6 rounded-full hover:opacity-80 transition-opacity duration-300 cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar-se'}
            </button>
            <p className="text-[#A0AEC0] text-xs mt-4">
              Ao se cadastrar, você concorda com nossos <br/>
              <Link to="/termos-de-servico" className="text-[#00B5AD] hover:underline">Termos de Serviço</Link> e 
              <Link to="/politica-de-privacidade" className="text-[#00B5AD] hover:underline"> Política de Privacidade</Link>.
            </p>
          </form>
        )}

        {/* Formulário de Login */}
        {activeTab === 'login' && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8]" 
              value={loginData.email}
              onChange={handleLoginChange}
              onBlur={() => setLoginTouched(t => ({ ...t, email: true }))}
              disabled={loading}
              required
            />
            {loginTouched.email && !loginData.email && <span style={{color: 'red', fontSize: 12}}>Campo obrigatório</span>}
            <div className="relative">
              <input 
                type={showPasswordLogin ? "text" : "password"} 
                name="senha"
                placeholder="Senha" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5AD] bg-[#F4F6F8] pr-10" 
                value={loginData.senha}
                onChange={handleLoginChange}
                onBlur={() => setLoginTouched(t => ({ ...t, senha: true }))}
                disabled={loading}
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#A0AEC0] hover:text-[#2D3748]" onClick={() => setShowPasswordLogin(!showPasswordLogin)}>
                {showPasswordLogin ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            {loginTouched.senha && !loginData.senha && <span style={{color: 'red', fontSize: 12}}>Campo obrigatório</span>}
            <Link to="/esqueci-senha" className="text-[#00B5AD] text-sm hover:underline block text-right">Esqueceu a senha?</Link>
            <button 
              type="submit" 
              className="w-full bg-[#FF8C42] text-white font-bold py-3 px-6 rounded-full hover:opacity-80 transition-opacity duration-300 cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <p className="text-[#A0AEC0] text-sm mt-4">
              Não tem uma conta?{' '}
              <button 
                type="button" 
                onClick={() => { setActiveTab('cadastro'); setError(''); }} 
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