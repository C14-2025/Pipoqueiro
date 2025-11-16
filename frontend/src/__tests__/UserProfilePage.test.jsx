import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserProfilePage from '../Pages/UserProfilePage';
import { authService, reviewService, favoritesService, movieService } from '../services/api';

jest.mock('../services/api');

const mockProfileData = {
  nome: 'Jordan Santos',
  email: 'jordan.santos@exemplo.com',
  created_at: new Date().toISOString(),
  data_nascimento: '1990-01-01T00:00:00.000Z',
  generos_favoritos: ['ação', 'drama', 'comédia'],
  bio: 'Esta é uma bio de teste.',
};

const mockReviewsData = [
  { id: 1, tmdb_id: 550, nota: 5, comentario: 'Final controverso, mas a jornada foi épica.', filme: { title: 'Duna' } },
  { id: 2, tmdb_id: 671, nota: 4, comentario: 'Ótima trilha sonora.', filme: { title: 'Harry Potter' } },
  { id: 3, tmdb_id: 157336, nota: 5, comentario: 'Obra-prima da ficção científica.', filme: { title: 'Interestelar' } },
];

const mockMovieDetails = {
  title: 'Filme Mockado',
  poster_url: 'https://via.placeholder.com/90x135?text=Mock',
};

describe('Página: UserProfilePage', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();

    authService.isAuthenticated.mockReturnValue(true);
    
    authService.getProfile.mockResolvedValue(mockProfileData);
    reviewService.getMyReviews.mockResolvedValue(mockReviewsData);
    favoritesService.getFavorites.mockResolvedValue([]); 
    movieService.getMovieDetails.mockResolvedValue(mockMovieDetails);
  });

  it('deve exibir o nome e o email do usuário', async () => {
    render(<BrowserRouter><UserProfilePage /></BrowserRouter>);

    expect(await screen.findByRole('heading', { name: 'Jordan Santos' })).toBeInTheDocument();
    expect(screen.getByText('jordan.santos@exemplo.com')).toBeInTheDocument();
  });

  it('deve exibir as estatísticas do usuário', async () => {
    render(<BrowserRouter><UserProfilePage /></BrowserRouter>);

    const reviewsLabel = await screen.findByText('Críticas Publicadas');
    
    expect(reviewsLabel.previousSibling).toHaveTextContent(mockReviewsData.length.toString()); 
    const averageRatingLabel = screen.getByText('Nota Média');
    const expectedAverage = ((5 + 4 + 5) / 3).toFixed(1); 
    expect(averageRatingLabel.previousSibling).toHaveTextContent(expectedAverage);
  });

  it('deve renderizar a lista de avaliações do usuário', async () => {
    render(<BrowserRouter><UserProfilePage /></BrowserRouter>);

    expect(await screen.findByText(/Final controverso, mas a jornada foi épica./i)).toBeInTheDocument();
    expect(screen.getByText(/Ótima trilha sonora./i)).toBeInTheDocument();
    expect(screen.getByText(/Obra-prima da ficção científica./i)).toBeInTheDocument();
  });
});