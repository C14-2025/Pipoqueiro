import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MediaDetailsPage from '../Pages/MediaDetailsPage';
import { movieService, reviewService } from '../services/api'; 
import { useUserLists } from '../context/UserListsContext'; 

jest.mock('../services/api');
jest.mock('../context/UserListsContext');

describe('Página: MediaDetailsPage', () => {
  it('deve buscar e exibir os detalhes do filme com base no ID da URL', async () => {
    useUserLists.mockReturnValue({
      isMovieInWatchlist: jest.fn().mockReturnValue(false),
      toggleWatchlist: jest.fn(),
      isMovieInFavorites: jest.fn().mockReturnValue(false),
      toggleFavorites: jest.fn(),
      isLoggedIn: false,
    });

    const mockDetails = {
      id: 157336,
      title: 'Interestelar',
      original_title: 'Interstellar',
      release_date: '2014-11-05',
      vote_average: 8.3,
      overview: 'As reservas naturais da Terra estão chegando ao fim...',
      genres: [{ id: 1, name: 'Ficção Científica' }],
      poster_url: 'url_do_poster.jpg' 
    };
    movieService.getMovieDetails.mockResolvedValue(mockDetails);

    reviewService.getMovieReviews.mockResolvedValue([]);
    movieService.getMovieVideos.mockResolvedValue([]);
    movieService.getSimilarMovies.mockResolvedValue([]);
    movieService.getMovieCredits.mockResolvedValue({
        cast: [{ id: 10, name: 'Matthew McConaughey', character: 'Cooper' }]
    });

    render(
      <MemoryRouter initialEntries={['/filme/157336']}>
        <Routes>
          <Route path="/filme/:id" element={<MediaDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Interestelar/i })).toBeInTheDocument();
    });
    
    expect(movieService.getMovieDetails).toHaveBeenCalledWith(157336);
    expect(screen.getByText(/As reservas naturais da Terra/i)).toBeInTheDocument();
    expect(screen.getByText('Matthew McConaughey')).toBeInTheDocument();
  });
});