import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { useUserLists } from '../context/UserListsContext';

const ChatBot = () => {
  const { isLoggedIn } = useUserLists();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente do Pipoqueiro. Como posso te ajudar com recomendações de filmes hoje?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Substitua sua função handleSendMessage por esta:

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Adiciona a nova mensagem ao estado local
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 1. PEGAR O TOKEN (do localStorage)
      // !!! MUITO IMPORTANTE !!!
      // Se você salvou seu token com um nome diferente no localStorage
      // (ex: 'jwt_token' ou 'user_token'), MUDE A LINHA ABAIXO.
      const token = localStorage.getItem('token');

      if (!token) {
        // Se não houver token, exibe um erro
        throw new Error("Token de autenticação não encontrado. Faça o login novamente.");
      }

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 2. ADICIONAR O CABEÇALHO DE AUTORIZAÇÃO
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // 3. MUDAR 'message' PARA 'prompt'
          prompt: userMessage,
          // 4. Enviar o histórico para dar contexto ao IA
          historico: messages
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
      } else {
        // Se o token for inválido (expirado), o backend pode retornar 401
        if (response.status === 401) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sua sessão expirou. Por favor, faça o login novamente.'
          }]);
          // TODO: Deslogar o usuário
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.message || 'Desculpe, tive um problema ao processar sua mensagem.'
          }]);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.message || 'Ops! Não consegui me conectar ao servidor.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#00B5AD] text-white p-4 rounded-full shadow-lg hover:bg-[#009A92] transition-all duration-300 hover:scale-110 z-50"
          aria-label="Abrir chat"
        >
          <FiMessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-200">
          <div className="bg-[#00B5AD] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <FiMessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Assistente Pipoqueiro</h3>
                <p className="text-xs text-white/80">Sempre online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Fechar chat"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F6F8]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-[#00B5AD] text-white rounded-br-none'
                    : 'bg-white text-[#2D3748] rounded-bl-none shadow-sm'
                    }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#2D3748] p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#00B5AD] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#00B5AD] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#00B5AD] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1 bg-[#F4F6F8] border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B5AD] focus:border-transparent text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#00B5AD] text-white p-3 rounded-full hover:bg-[#009A92] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensagem"
              >
                <FiSend size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;