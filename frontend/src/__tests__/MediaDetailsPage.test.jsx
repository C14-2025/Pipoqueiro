import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MediaDetailsPage from '../Pages/MediaDetailsPage';
import { movieService } from '../services/api';

jest.mock('../services/api');

describe('Página: MediaDetailsPage', () => {
  it('deve buscar e exibir os detalhes do filme com base no ID da URL', async () => {
    const mockDetails = {
      title: 'Interestelar',
      original_title: 'Interstellar',
      release_date: '2014-11-05',
      vote_average: 8.3,
      overview: 'As reservas naturais da Terra estão chegando ao fim...',
      genres: [{ id: 1, name: 'Ficção Científica' }],
      cast: [{ id: 10, name: 'Matthew McConaughey', character: 'Cooper' }],
    };
    movieService.getMovieDetails.mockResolvedValue(mockDetails);

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