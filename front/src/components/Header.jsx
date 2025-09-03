import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?query=${searchTerm.trim()}`);
      setSearchTerm('');
    }
  };

  const baseLinkClass = "font-semibold pb-1 transition-all duration-150";
  const activeLinkClass = "text-[#00B5AD] border-b-4 border-[#00B5AD]";
  const inactiveLinkClass = "text-[#2D3748] hover:text-[#00B5AD] hover:border-b-4 hover:border-[#00B5AD]";

  return (
    <header 
      className="bg-[#FFFFFF] sticky top-0 z-50 rounded-b-lg shadow-[0_5px_15px_-5px_rgba(0,0,0,0.07)] border-b-2 border-gray-300"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-28">
        
        <div className="flex items-center space-x-8">
          <Link to="/">
            <img src="/Logo2.png" alt="Pipoqueiro Logo" className="h-[95px] w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-7">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              Início
            </NavLink>
            <NavLink 
              to="/filmes"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              Filmes
            </NavLink>
            <NavLink 
              to="/perfil"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              Meu Perfil
            </NavLink>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="bg-[#F4F6F8] border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#00B5AD] transition w-full text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-[#A0AEC0]" />
            </div>
          </form>
          
          <Link to="/login">
             <button className="bg-[#FF8C42] text-white font-bold py-2 px-6 rounded-full hover:opacity-80 transition-opacity duration-300 whitespace-nowrap cursor-pointer">
               Login / Registrar-se
             </button>
           </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;