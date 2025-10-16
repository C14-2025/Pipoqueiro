import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';
import { useUserLists } from '../context/UserListsContext';

jest.mock('../context/UserListsContext');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), 
  useNavigate: () => jest.fn(), 
}));

describe('Componente: Header', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('quando o usuário não está autenticado', () => {
    beforeEach(() => {
      useUserLists.mockReturnValue({ isLoggedIn: false });
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
    });

    it('deve exibir o botão de "Login / Registrar-se"', () => {
      expect(screen.getByRole('button', { name: /login \/ registrar-se/i })).toBeInTheDocument();
    });

    it('NÃO deve exibir o botão de "Meu Perfil"', () => {
      expect(screen.queryByRole('button', { name: /meu perfil/i })).not.toBeInTheDocument();
    });
  });

  describe('quando o usuário está autenticado', () => {
    beforeEach(() => {
      useUserLists.mockReturnValue({ isLoggedIn: true });
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
    });

    it('deve exibir o botão de "Meu Perfil"', () => {
      expect(screen.getByRole('button', { name: /meu perfil/i })).toBeInTheDocument();
    });

    it('NÃO deve exibir o botão de "Login / Registrar-se"', () => {
      expect(screen.queryByRole('button', { name: /login \/ registrar-se/i })).not.toBeInTheDocument();
    });
  });
});