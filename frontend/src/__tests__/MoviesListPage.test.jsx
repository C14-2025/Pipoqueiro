import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MoviesListPage from '../Pages/MoviesListPage';

describe('Página: MoviesListPage', () => {
  beforeEach(() => {
    render(<BrowserRouter><MoviesListPage /></BrowserRouter>);
  });

  it('deve renderizar a lista de filmes inicial ordenada por rank', () => {
    const movieTitles = screen.getAllByRole('heading', { level: 2 });
    expect(movieTitles[0]).toHaveTextContent('1. Um Sonho de Liberdade');
    expect(movieTitles[4]).toHaveTextContent('5. 12 Homens e uma Sentença');
  });

  it('deve reordenar a lista ao clicar nos botões de classificação', () => {
    const sortByYearButton = screen.getByRole('button', { name: /ano/i });
    fireEvent.click(sortByYearButton);

    let movieTitles = screen.getAllByRole('heading', { level: 2 });
    expect(movieTitles[0]).toHaveTextContent('5. 12 Homens e uma Sentença');

    const sortOrderButton = screen.getByRole('button', { name: /crescente/i });
    fireEvent.click(sortOrderButton);

    movieTitles = screen.getAllByRole('heading', { level: 2 });
    expect(movieTitles[0]).toHaveTextContent('3. Batman: O Cavaleiro das Trevas');
  });
});