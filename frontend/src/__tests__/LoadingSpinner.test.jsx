import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../components/LoadingSpinner';

describe('Componente: LoadingSpinner', () => {
  it('deve ser renderizado na tela', () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('deve aplicar a classe de tamanho correta baseada na prop "size"', () => {
    const { getByTestId, rerender } = render(<LoadingSpinner size="sm" />);
    
    const spinnerDiv = getByTestId('loading-spinner').firstChild;
    expect(spinnerDiv).toHaveClass('h-8 w-8');

    rerender(<LoadingSpinner size="lg" />);
    expect(spinnerDiv).toHaveClass('h-16 w-16');
  });
});