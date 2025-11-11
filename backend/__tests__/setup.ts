/// <reference types="node" />
import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.TMDB_API_KEY = 'mock_tmdb_key';
process.env.OPENAI_API_KEY = 'mock_openai_key';
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_KEY = 'mock_supabase_key';

// Mock do Supabase com chainable methods
const createMockSupabaseQuery = (mockData: any = [], mockError: any = null) => {
  const mockQuery = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
  };

  // IMPORTANTE: Configurar os métodos para serem chainable E retornar promises
  // Cada método retorna `this` para permitir encadeamento
  mockQuery.select.mockImplementation(() => mockQuery);
  mockQuery.insert.mockImplementation(() => mockQuery);
  mockQuery.update.mockImplementation(() => mockQuery);
  mockQuery.delete.mockImplementation(() => mockQuery);
  mockQuery.eq.mockImplementation(() => mockQuery);
  mockQuery.order.mockImplementation(() => mockQuery);
  mockQuery.limit.mockImplementation(() => mockQuery);

  // single() retorna Promise com o primeiro elemento do array, ou o objeto diretamente
  mockQuery.single.mockImplementation(() => {
    let singleData;
    let singleError;

    if (Array.isArray(mockData)) {
      singleData = mockData.length > 0 ? mockData[0] : null;
      singleError = mockData.length === 0 ? { code: 'PGRST116', message: 'No rows found' } : mockError;
    } else {
      // Se mockData não é array, é um objeto único (como resultado de INSERT)
      singleData = mockData;
      singleError = mockError;
    }

    return Promise.resolve({ data: singleData, error: singleError });
  });

  // Métodos finais que retornam Promise (quando não há .single() no final)
  // eq(), order() e limit() também podem ser finais na cadeia, então retornam Promises
  const finalPromise = Promise.resolve({ data: mockData, error: mockError });

  // Configurar para que quando await for usado diretamente (sem .single()), retorne os dados
  mockQuery.then = finalPromise.then.bind(finalPromise);
  mockQuery.catch = finalPromise.catch.bind(finalPromise);
  mockQuery.finally = finalPromise.finally.bind(finalPromise);

  return mockQuery;
};

// Função auxiliar para mockar operação do Supabase
const mockSupabaseOperation = (data: any = null, error: any = null) => {
  const query = createMockSupabaseQuery(data, error);
  (mockSupabaseFrom as any).mockReturnValueOnce(query);
  return query;
};

const mockSupabaseFrom = jest.fn();
const mockSupabaseRpc = jest.fn().mockResolvedValue({ data: null, error: null });

const mockSupabaseClient = {
  from: mockSupabaseFrom,
  rpc: mockSupabaseRpc,
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

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
    formatBackdropURL: jest.fn((path: string | null) => path ? `https://image.tmdb.org/t/p/w1280${path}` : null),
  })),
}));

export {
  mockSupabaseFrom,
  mockSupabaseRpc,
  mockSupabaseClient,
  createMockSupabaseQuery,
  mockSupabaseOperation
};
