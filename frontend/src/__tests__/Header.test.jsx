import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { authService } from '../services/api';

// Mock completo do react-router-dom e api
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../services/api');

describe('Componente: Header', () => {
  
  describe('quando o usuário não está autenticado', () => {
    beforeEach(() => {
      authService.isAuthenticated.mockReturnValue(false);
      render(<BrowserRouter><Header /></BrowserRouter>);
    });

    it('deve exibir o link de "Login / Registrar-se"', () => {
      expect(screen.getByRole('button', { name: /login \/ registrar-se/i })).toBeInTheDocument();
    });

    it('NÃO deve exibir o link de "Meu Perfil" e o botão "Sair"', () => {
      expect(screen.queryByRole('link', { name: /meu perfil/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
    });
  });

  describe('quando o usuário está autenticado', () => {
    beforeEach(() => {
      authService.isAuthenticated.mockReturnValue(true);
      render(<BrowserRouter><Header /></BrowserRouter>);
    });

    it('deve exibir o link de "Meu Perfil" e o botão "Sair"', () => {
      expect(screen.getByRole('link', { name: /meu perfil/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
    });

    it('deve chamar a função de logout e navegar para a home ao clicar em "Sair"', () => {
      const logoutButton = screen.getByRole('button', { name: /sair/i });
      fireEvent.click(logoutButton);

      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});