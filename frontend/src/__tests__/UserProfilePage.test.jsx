import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserProfilePage from '../Pages/UserProfilePage';

describe('Página: UserProfilePage', () => {
  beforeEach(() => {
    render(<BrowserRouter><UserProfilePage /></BrowserRouter>);
  });

  it('deve exibir o nome e o email do usuário', () => {
    expect(screen.getByRole('heading', { name: 'Jordan Santos' })).toBeInTheDocument();
    expect(screen.getByText('jordan.santos@exemplo.com')).toBeInTheDocument();
  });

  it('deve exibir as estatísticas do usuário', () => {
    const reviewsCount = screen.getByText('Críticas Publicadas').previousSibling;
    expect(reviewsCount).toHaveTextContent('3');

    const averageRating = screen.getByText('Nota Média').previousSibling;
    expect(averageRating).toHaveTextContent('4.7');
  });

  it('deve renderizar a lista de avaliações do usuário', () => {
    expect(screen.getByText('Duna')).toBeInTheDocument();
    expect(screen.getByText(/Final controverso, mas a jornada foi épica./i)).toBeInTheDocument();
  });
});