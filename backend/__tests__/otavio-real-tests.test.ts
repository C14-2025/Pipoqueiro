import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { TMDbService } from '../src/services/tmdbService';
import axios, { AxiosResponse, AxiosInstance } from 'axios';

// Mock completo do axios
jest.mock('axios', () => ({
  create: jest.fn()
}));

// Tipagem correta do mock
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('🎬 OTÁVIO - TESTES UNITÁRIOS DO SERVIÇO TMDB', () => {
  let tmdbService: TMDbService;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Cria mock da instância do axios com tipagem correta
    mockAxiosInstance = {
      get: jest.fn() as AxiosInstance['get'],
      post: jest.fn() as AxiosInstance['post'],
      put: jest.fn() as AxiosInstance['put'],
      delete: jest.fn() as AxiosInstance['delete'],
      patch: jest.fn() as AxiosInstance['patch'],
      head: jest.fn() as AxiosInstance['head'],
      options: jest.fn() as AxiosInstance['options'],
      request: jest.fn() as AxiosInstance['request'],
      getUri: jest.fn() as AxiosInstance['getUri'],
      defaults: {} as any,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      } as any
    };
    
    // Configura axios.create para retornar nossa instância mockada
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Cria nova instância do service
    tmdbService = new TMDbService();
  });

  // Test 1: Filmes populares da TMDb
  test('testGetPopularMovies - deve retornar lista de filmes populares', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        results: [
          { id: 1, title: 'Filme 1' },
          { id: 2, title: 'Filme 2' }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const movies = await tmdbService.getPopularMovies();
    expect(Array.isArray(movies)).toBe(true);
    expect(movies).toHaveLength(2);
    expect(movies[0]).toHaveProperty('title', 'Filme 1');
    
    // Verifica se a chamada foi feita corretamente
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular', { params: { page: 1 } });
  });

  // Test 2: Paginação dos filmes populares
  test('testGetPopularMoviesPaginacao - deve retornar filmes paginados', async () => {
    const mockResponse1: AxiosResponse = {
      data: {
        page: 1,
        results: [{ id: 1, title: 'Filme da página 1' }]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    const mockResponse2: AxiosResponse = {
      data: {
        page: 2,
        results: [{ id: 2, title: 'Filme da página 2' }]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    // Simula página 1
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse1);
    const page1 = await tmdbService.getPopularMovies(1);
    expect(page1[0]).toHaveProperty('title', 'Filme da página 1');

    // Simula página 2
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse2);
    const page2 = await tmdbService.getPopularMovies(2);
    expect(page2[0]).toHaveProperty('title', 'Filme da página 2');
    expect(page1).not.toEqual(page2);
  });

  // Test 3: Busca por query na TMDb
  test('testSearchMovies - deve retornar resultados da busca', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        results: [
          { id: 1, title: 'Batman' },
          { id: 2, title: 'Batman Returns' }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const results = await tmdbService.searchMovies('Batman');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(2);
    expect(results[0].title).toContain('Batman');
    
    // Verifica se a chamada foi feita corretamente
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', { 
      params: { query: 'Batman', page: 1 } 
    });
  });

  // Test 4: Query vazia ou sem resultado
  test('testSearchMoviesVazia - deve lidar com buscas vazias', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        results: []
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const results = await tmdbService.searchMovies('');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  // Test 5: Caracteres especiais na busca
  test('testSearchMoviesEspeciais - deve lidar com caracteres especiais', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        results: [{ id: 1, title: 'João e Maria' }]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const results = await tmdbService.searchMovies('João e María');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('João e Maria');
  });

  // Test 6: Detalhes do filme
  test('testGetMovieDetails - deve retornar detalhes do filme', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        id: 550,
        title: 'Fight Club',
        overview: 'Filme do Fight Club',
        release_date: '1999-10-15'
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const movie = await tmdbService.getMovieDetails(550);
    expect(movie).toHaveProperty('title', 'Fight Club');
    expect(movie).toHaveProperty('overview');
    expect(movie).toHaveProperty('release_date');
    
    // Verifica se a chamada foi feita corretamente
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/550');
  });

  // Test 7: ID de filme inválido
  test('testGetMovieDetailsInvalido - deve lidar com ID inexistente', async () => {
    mockAxiosInstance.get.mockRejectedValue(new Error('Filme não encontrado'));

    await expect(tmdbService.getMovieDetails(99999999))
      .rejects.toThrow('Erro ao buscar detalhes');
  });

  // Test 8: URLs de poster corretas
  test('testFormatPosterURL - deve formatar URLs de poster corretamente', () => {
    const path = '/test/poster.jpg';
    const url = tmdbService.formatPosterURL(path);
    expect(url).toBe(`https://image.tmdb.org/t/p/w500${path}`);
  });

  // Test 9: Placeholder para poster nulo
  test('testFormatPosterURLNulo - deve retornar placeholder quando null', () => {
    const url = tmdbService.formatPosterURL(null);
    expect(url).toBe('https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster');
  });

  // Test 10: Teste de conectividade
  test('testConexaoApiTmdb - deve verificar conectividade com API', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        results: [
          { id: 1, title: 'Filme Teste' }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const movies = await tmdbService.getPopularMovies();
    expect(movies).toBeDefined();
    expect(Array.isArray(movies)).toBe(true);
  });

  // Test 11: Tratamento de erro da API
  test('testTratamentoErroApi - deve lidar com erros da API', async () => {
    mockAxiosInstance.get.mockRejectedValue(new Error('Service Unavailable'));

    await expect(tmdbService.getPopularMovies())
      .rejects.toThrow('Erro ao buscar filmes populares');
  });

  // Test 12: Configuração da API key
  test('testConfiguracaoApiKey - deve usar configuração correta', async () => {
    const mockResponse: AxiosResponse = {
      data: { results: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      request: {}
    };

    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    await tmdbService.getPopularMovies();
    
    // Verifica se axios.create foi chamado com as configurações corretas
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.themoviedb.org/3',
      params: {
        api_key: expect.any(String),
        language: 'pt-BR'
      }
    });
  });
});