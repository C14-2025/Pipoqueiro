
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from '../Pages/SearchPage';
import * as api from '../services/api';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../services/api');

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
// Testes automatizados para a página de busca de filmes
// Cada teste cobre um aspecto visual ou de interação da SearchPage
// Os testes usam React Testing Library e Jest
};

  // Testa se o input de busca aceita digitação normalmente
describe('SearchPage', () => {
  beforeEach(() => {
    api.movieService = {
      searchMovies: jest.fn(),
    };
  });

  test('input de busca está presente e pode ser preenchido', () => {
    renderWithRouter(<SearchPage />);
    const input = screen.getByPlaceholderText(/digite o nome do filme/i);
    fireEvent.change(input, { target: { value: 'Teste' } });
    expect(input.value).toBe('Teste');
  });

  // Testa se o título "Buscar Filmes" aparece na página
  test('renderiza título da página de busca', () => {
    renderWithRouter(<SearchPage />);
    expect(screen.getByText(/buscar filmes/i)).toBeInTheDocument();
  });

  // Testa se o subtítulo "Encontre qualquer filme no catálogo" aparece na página
  test('renderiza subtítulo da página de busca', () => {
    renderWithRouter(<SearchPage />);
    expect(screen.getByText(/encontre qualquer filme no catálogo/i)).toBeInTheDocument();
  });

  // Testa se a mensagem de "nenhum resultado" não aparece sem busca
  test('não renderiza resultados se não houver busca', () => {
    renderWithRouter(<SearchPage />);
    expect(screen.queryByText(/nenhum resultado encontrado/i)).not.toBeInTheDocument();
  });

  // Testa se o botão de submit está desabilitado quando o input está vazio
  test('botão de submit está desabilitado sem texto', () => {
    renderWithRouter(<SearchPage />);
    const btn = screen.getByRole('button', { name: '' });
    expect(btn).toBeDisabled();
  });

  // Testa se ao digitar no input, o botão de submit é habilitado
  test('ao digitar, botão de submit habilita', () => {
    renderWithRouter(<SearchPage />);
    const input = screen.getByPlaceholderText(/digite o nome do filme/i);
    const btn = screen.getByRole('button', { name: '' });
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(btn).not.toBeDisabled();
  });


  // Testa se o input de busca está visível na tela
  test('exibe input de busca', () => {
  renderWithRouter(<SearchPage />);
    expect(screen.getByPlaceholderText(/digite o nome do filme/i)).toBeInTheDocument();
  });

});
