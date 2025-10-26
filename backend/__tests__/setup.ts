/// <reference types="node" />
// Setup para testes com mocks completos - SEM BANCO DE DADOS REAL
import { jest } from '@jest/globals';

// IMPORTANTE: Configurar variáveis de ambiente ANTES de qualquer import
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
process.env.TMDB_API_KEY = process.env.TMDB_API_KEY || 'mock_tmdb_key';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'mock_openai_key';

// Mock completo do pool de conexões MySQL
const mockExecute = jest.fn();
const mockGetConnection = jest.fn();
const mockEnd = jest.fn();
const mockQuery = jest.fn();

const mockPool = {
  execute: mockExecute,
  getConnection: mockGetConnection,
  end: mockEnd,
  query: mockQuery,
};

// Mock do módulo mysql2/promise ANTES de qualquer outro import
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => mockPool),
  default: {
    createPool: jest.fn(() => mockPool),
  },
}), { virtual: true });

// Mock do TMDbService para evitar chamadas reais à API
// @ts-ignore - Mock para testes
jest.mock('../src/services/tmdbService', () => ({
  TMDbService: jest.fn().mockImplementation(() => ({
    getPopularMovies: jest.fn().mockResolvedValue([
      {
        id: 550,
        title: 'Fight Club',
        poster_path: '/poster.jpg',
        vote_average: 8.4,
        vote_count: 1000,
      },
    ] as never),
    searchMovies: jest.fn().mockResolvedValue([
      {
        id: 268896,
        title: 'The Dark Knight',
        poster_path: '/batman.jpg',
        vote_average: 9.0,
        vote_count: 2000,
      },
    ] as never),
    getMovieDetails: jest.fn().mockResolvedValue({
      id: 550,
      title: 'Fight Club',
      overview: 'A great movie',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.4,
      vote_count: 1000,
    } as never),
    getMovieVideos: jest.fn().mockResolvedValue([] as never),
    getMovieCredits: jest.fn().mockResolvedValue({ cast: [], crew: [] } as never),
    getSimilarMovies: jest.fn().mockResolvedValue([] as never),
    formatPosterURL: jest.fn((path: string | null) => path ? `https://image.tmdb.org/t/p/w500${path}` : null),
  })),
}));

// Exportar mockPool e funções mock para uso nos testes
export { mockPool, mockExecute, mockGetConnection, mockEnd, mockQuery };
