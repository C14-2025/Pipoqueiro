import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer 
      className="bg-[#FFFFFF] border-t border-gray-300 mt-12 rounded-t-lg shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-[#2D3748]">
          <a href="#" className="hover:text-[#00B5AD] hover:underline underline-offset-4 transition-all duration-300">Sobre Nós</a>
          <a href="#" className="hover:text-[#00B5AD] hover:underline underline-offset-4 transition-all duration-300">Contato</a>
          <a href="#" className="hover:text-[#00B5AD] hover:underline underline-offset-4 transition-all duration-300">Política de Privacidade</a>
          <a href="#" className="hover:text-[#00B5AD] hover:underline underline-offset-4 transition-all duration-300">Termos de Uso</a>
        </div>
        
        <div className="flex space-x-5">
          <a href="#" aria-label="Facebook" className="text-[#00B5AD] hover:opacity-70 transform hover:-translate-y-1 transition-all duration-300">
            <FaFacebookF size={22} />
          </a>
          <a href="#" aria-label="Twitter" className="text-[#00B5AD] hover:opacity-70 transform hover:-translate-y-1 transition-all duration-300">
            <FaTwitter size={22} />
          </a>
          <a href="#" aria-label="Instagram" className="text-[#00B5AD] hover:opacity-70 transform hover:-translate-y-1 transition-all duration-300">
            <FaInstagram size={22} />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;