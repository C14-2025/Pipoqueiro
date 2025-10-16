import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MoviesListPage from '../Pages/MoviesListPage';
import { movieService } from '../services/api';

jest.mock('../services/api');

const mockMovies = [
  { id: 1, title: 'Um Sonho de Liberdade', release_date: '1994-09-23', runtime: 142, vote_average: 8.7 },
  { id: 2, title: 'O Poderoso Chefão', release_date: '1972-03-14', runtime: 175, vote_average: 8.7 },
  { id: 3, title: 'Batman: O Cavaleiro das Trevas', release_date: '2008-07-18', runtime: 152, vote_average: 8.5 },
  { id: 4, title: 'O Poderoso Chefão II', release_date: '1974-12-20', runtime: 202, vote_average: 8.5 },
  { id: 5, title: '12 Homens e uma Sentença', release_date: '1957-04-10', runtime: 96, vote_average: 8.5 },
];

describe('Página: MoviesListPage', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a lista de filmes inicial ordenada por rank', async () => {
    movieService.getPopular.mockResolvedValue(mockMovies);
    
    render(<BrowserRouter><MoviesListPage /></BrowserRouter>);

    const movieTitles = await screen.findAllByRole('heading', { level: 2 });
    
    expect(movieTitles[0]).toHaveTextContent('1. Um Sonho de Liberdade');
    expect(movieTitles[4]).toHaveTextContent('5. 12 Homens e uma Sentença');
  });

  it('deve reordenar a lista ao clicar nos botões de visualização', async () => {
    movieService.getPopular.mockResolvedValue(mockMovies);
    movieService.getRanking.mockResolvedValue(mockMovies);
    
    render(<BrowserRouter><MoviesListPage /></BrowserRouter>);

    expect(await screen.findByText(/1. Um Sonho de Liberdade/i)).toBeInTheDocument();

    const rankingButton = screen.getByRole('button', { name: /ranking/i });
    fireEvent.click(rankingButton);

    expect(await screen.findByRole('heading', { name: 'Ranking da Comunidade' })).toBeInTheDocument();
    expect(movieService.getRanking).toHaveBeenCalledTimes(1);
    const movieTitlesAfterClick = await screen.findAllByRole('heading', { level: 2 });
    expect(movieTitlesAfterClick[0]).toHaveTextContent('1. Um Sonho de Liberdade'); 
  });
});