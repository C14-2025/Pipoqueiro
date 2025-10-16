import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { movieService } from '../services/api';

jest.mock('../services/api');

window.scrollTo = jest.fn();

describe('Componente: App', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a página inicial corretamente na rota "/"', async () => {
    movieService.getPopular.mockResolvedValueOnce([{ id: 1, title: 'Filme Mockado' }]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Top Filmes do Momento/i)).toBeInTheDocument();
  });

  it('deve renderizar a página de login ao navegar para "/login"', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Crie sua conta/i)).toBeInTheDocument();
  });
});