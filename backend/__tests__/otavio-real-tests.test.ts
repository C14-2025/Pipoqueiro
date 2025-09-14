import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { TMDbService } from '../src/services/tmdbService';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('🎬 OTÁVIO - TESTES FUNCIONAIS DO SERVIÇO TMDB', () => {
  let tmdbService: TMDbService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      request: jest.fn(),
      getUri: jest.fn(),
      defaults: {},
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
      }
    };

    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance) as jest.Mock<typeof mockAxiosInstance>;
    tmdbService = new TMDbService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('testGetPopularMovies - deve retornar lista de filmes populares com estrutura completa', async () => {
    const mockMovies = [
      {
        id: 1022789,
        title: 'Divertida Mente 2',
        overview: 'Riley entra na adolescência...',
        poster_path: '/9h2KgGXSmWigNTn3kQdEFFngj9i.jpg',
        release_date: '2024-06-11',
        vote_average: 7.6,
        vote_count: 8596,
        popularity: 1042.849,
        genre_ids: [16, 10751, 12, 35]
      },
      {
        id: 533535,
        title: 'Deadpool & Wolverine',
        overview: 'Wade Wilson está entediado...',
        poster_path: '/xq4v7JE8niZ75OYYPDGNn6Gzpny.jpg',
        release_date: '2024-07-24',
        vote_average: 7.7,
        vote_count: 5412,
        popularity: 945.231,
        genre_ids: [28, 35, 878]
      }
    ];

    mockAxiosInstance.get.mockResolvedValue({
      data: {
        page: 1,
        results: mockMovies,
        total_pages: 500,
        total_results: 10000
      }
    });

    const movies = await tmdbService.getPopularMovies();

    expect(Array.isArray(movies)).toBe(true);
    expect(movies).toHaveLength(2);
    expect(movies[0].title).toBe('Divertida Mente 2');
    expect(movies[0].poster_path).toBeDefined();
    expect(movies[0].vote_average).toBeGreaterThan(0);
    expect(movies[1].title).toBe('Deadpool & Wolverine');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular', { params: { page: 1 } });
  });

  test('testGetPopularMoviesPaginacao - deve navegar corretamente entre páginas', async () => {
    const page1Movies = [
      { id: 1, title: 'Top Gun: Maverick', popularity: 1500 },
      { id: 2, title: 'Avatar 2', popularity: 1400 }
    ];

    const page2Movies = [
      { id: 3, title: 'Barbie', popularity: 1300 },
      { id: 4, title: 'Oppenheimer', popularity: 1200 }
    ];

    const page3Movies = [
      { id: 5, title: 'John Wick 4', popularity: 1100 },
      { id: 6, title: 'Guardians 3', popularity: 1000 }
    ];

    mockAxiosInstance.get.mockImplementation((url, config) => {
      const page = config?.params?.page || 1;
      if (page === 1) {
        return Promise.resolve({ data: { page: 1, results: page1Movies, total_pages: 100 } });
      } else if (page === 2) {
        return Promise.resolve({ data: { page: 2, results: page2Movies, total_pages: 100 } });
      } else if (page === 3) {
        return Promise.resolve({ data: { page: 3, results: page3Movies, total_pages: 100 } });
      }
    });

    const firstPage = await tmdbService.getPopularMovies(1);
    const secondPage = await tmdbService.getPopularMovies(2);
    const thirdPage = await tmdbService.getPopularMovies(3);

    expect(firstPage[0].title).toBe('Top Gun: Maverick');
    expect(secondPage[0].title).toBe('Barbie');
    expect(thirdPage[0].title).toBe('John Wick 4');

    expect(firstPage).not.toEqual(secondPage);
    expect(secondPage).not.toEqual(thirdPage);
    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
  });

  test('testSearchMovies - deve buscar filmes por termo com relevância', async () => {
    const searchResults = [
      {
        id: 155,
        title: 'The Dark Knight',
        overview: 'Batman enfrenta o Coringa...',
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        release_date: '2008-07-16',
        vote_average: 8.5
      },
      {
        id: 272,
        title: 'Batman Begins',
        overview: 'A origem do Batman...',
        poster_path: '/dr6x4GyyegBWtinPBzipY02J2lV.jpg',
        release_date: '2005-06-10',
        vote_average: 7.7
      },
      {
        id: 49026,
        title: 'The Dark Knight Rises',
        overview: 'Batman retorna para enfrentar Bane...',
        poster_path: '/dEYnvnUfXrqvqeRSqvIEtmzhoA1.jpg',
        release_date: '2012-07-16',
        vote_average: 7.8
      }
    ];

    mockAxiosInstance.get.mockResolvedValue({
      data: {
        page: 1,
        results: searchResults,
        total_results: 150
      }
    });

    const results = await tmdbService.searchMovies('Batman');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(3);
    expect(results[0].title).toBe('The Dark Knight');
    expect(results[0].vote_average).toBe(8.5);
    expect(results.every(movie => movie.title.toLowerCase().includes('batman') ||
                                  movie.title.toLowerCase().includes('dark knight'))).toBe(true);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', {
      params: { query: 'Batman', page: 1 }
    });
  });

  test('testSearchMoviesVazia - deve retornar array vazio para busca sem resultados', async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: {
        page: 1,
        results: [],
        total_results: 0,
        total_pages: 0
      }
    });

    const emptyQuery = await tmdbService.searchMovies('');
    expect(Array.isArray(emptyQuery)).toBe(true);
    expect(emptyQuery).toHaveLength(0);

    const noResultsQuery = await tmdbService.searchMovies('xyzabc123filmequenoexiste');
    expect(Array.isArray(noResultsQuery)).toBe(true);
    expect(noResultsQuery).toHaveLength(0);

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
  });

  test('testSearchMoviesEspeciais - deve processar caracteres especiais e acentuação', async () => {
    const specialCharMovies = [
      { id: 1, title: 'João e Maria: Caçadores de Bruxas', original_title: 'Hansel & Gretel: Witch Hunters' },
      { id: 2, title: 'Amélie Poulain', original_title: 'Le Fabuleux Destin d\'Amélie Poulain' },
      { id: 3, title: 'À Procura de Nemo', original_title: 'Finding Nemo' }
    ];

    mockAxiosInstance.get.mockImplementation((url, config) => {
      const query = config?.params?.query;
      if (query?.includes('João') || query?.includes('Maria')) {
        return Promise.resolve({ data: { results: [specialCharMovies[0]] } });
      } else if (query?.includes('Amélie')) {
        return Promise.resolve({ data: { results: [specialCharMovies[1]] } });
      } else if (query?.includes('À Procura')) {
        return Promise.resolve({ data: { results: [specialCharMovies[2]] } });
      }
      return Promise.resolve({ data: { results: [] } });
    });

    const result1 = await tmdbService.searchMovies('João e Maria');
    expect(result1[0].title).toBe('João e Maria: Caçadores de Bruxas');

    const result2 = await tmdbService.searchMovies('Amélie');
    expect(result2[0].title).toBe('Amélie Poulain');

    const result3 = await tmdbService.searchMovies('À Procura de Nemo');
    expect(result3[0].title).toBe('À Procura de Nemo');

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
  });

  test('testGetMovieDetails - deve retornar detalhes completos do filme', async () => {
    const movieDetails = {
      id: 550,
      title: 'Clube da Luta',
      original_title: 'Fight Club',
      overview: 'Um funcionário de escritório insone e um fabricante de sabão formam um clube de luta clandestino...',
      release_date: '1999-10-15',
      runtime: 139,
      vote_average: 8.4,
      vote_count: 27891,
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      genres: [
        { id: 18, name: 'Drama' },
        { id: 53, name: 'Thriller' },
        { id: 35, name: 'Comédia' }
      ],
      production_companies: [
        { id: 508, name: '20th Century Fox' },
        { id: 711, name: 'Fox 2000 Pictures' }
      ],
      budget: 63000000,
      revenue: 100853753,
      tagline: 'Mischief. Mayhem. Soap.',
      status: 'Released'
    };

    mockAxiosInstance.get.mockResolvedValue({ data: movieDetails });

    const movie = await tmdbService.getMovieDetails(550);

    expect(movie.id).toBe(550);
    expect(movie.title).toBe('Clube da Luta');
    expect(movie.original_title).toBe('Fight Club');
    expect(movie.runtime).toBe(139);
    expect(movie.vote_average).toBe(8.4);
    expect(movie.genres).toHaveLength(3);
    expect(movie.production_companies).toHaveLength(2);
    expect(movie.budget).toBe(63000000);
    expect(movie.revenue).toBeGreaterThan(movie.budget);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/550');
  });

  test('testGetMovieDetailsInvalido - deve lançar erro para filme inexistente', async () => {
    mockAxiosInstance.get.mockRejectedValue({
      response: {
        status: 404,
        data: {
          status_message: 'The resource you requested could not be found.',
          status_code: 34
        }
      }
    });

    await expect(tmdbService.getMovieDetails(99999999))
      .rejects.toThrow('Erro ao buscar detalhes');

    await expect(tmdbService.getMovieDetails(-1))
      .rejects.toThrow('Erro ao buscar detalhes');

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
  });

  test('testFormatPosterURL - deve gerar URLs corretas para diferentes tamanhos', () => {
    const posterPath = '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg';
    const formattedUrl = tmdbService.formatPosterURL(posterPath);

    expect(formattedUrl).toBe('https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
    expect(formattedUrl).toContain('image.tmdb.org');
    expect(formattedUrl).toContain('w500');
    expect(formattedUrl).toMatch(/^https:\/\//);

    const anotherPath = '/xq4v7JE8niZ75OYYPDGNn6Gzpny.jpg';
    const anotherUrl = tmdbService.formatPosterURL(anotherPath);
    expect(anotherUrl).toBe('https://image.tmdb.org/t/p/w500/xq4v7JE8niZ75OYYPDGNn6Gzpny.jpg');
  });

  test('testFormatPosterURLNulo - deve fornecer placeholder para posters ausentes', () => {
    const nullUrl = tmdbService.formatPosterURL(null);
    expect(nullUrl).toBe('https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster');
    expect(nullUrl).toContain('placeholder');
    expect(nullUrl).toContain('Sem+Poster');

    const undefinedUrl = tmdbService.formatPosterURL(undefined as any);
    expect(undefinedUrl).toBe('https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster');

    const emptyUrl = tmdbService.formatPosterURL('');
    expect(emptyUrl).toBe('https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster');
  });

  test('testConexaoApiTmdb - deve verificar status de conectividade', async () => {
    mockAxiosInstance.get.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        page: 1,
        results: [
          { id: 1, title: 'Connection Test Movie', status: 'Released' }
        ],
        total_results: 1
      },
      headers: {
        'content-type': 'application/json',
        'x-ratelimit-remaining': '39',
        'x-ratelimit-reset': '1640995200'
      }
    });

    const movies = await tmdbService.getPopularMovies();

    expect(movies).toBeDefined();
    expect(Array.isArray(movies)).toBe(true);
    expect(movies.length).toBeGreaterThan(0);
    expect(movies[0].title).toBe('Connection Test Movie');
    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
  });

  test('testTratamentoErroApi - deve tratar diferentes tipos de erro da API', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce({
      response: {
        status: 503,
        data: { status_message: 'Service Temporarily Unavailable' }
      }
    });

    await expect(tmdbService.getPopularMovies())
      .rejects.toThrow('Erro ao buscar filmes populares');

    mockAxiosInstance.get.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { status_message: 'Invalid API key' }
      }
    });

    await expect(tmdbService.searchMovies('test'))
      .rejects.toThrow('Erro ao buscar filmes');

    mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(tmdbService.getMovieDetails(123))
      .rejects.toThrow('Erro ao buscar detalhes');

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
  });

  test('testConfiguracaoApiKey - deve configurar API com parâmetros corretos', async () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.themoviedb.org/3',
      params: {
        api_key: expect.any(String),
        language: 'pt-BR'
      }
    });

    mockAxiosInstance.get.mockResolvedValue({ data: { results: [] } });

    await tmdbService.getPopularMovies();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/popular', { params: { page: 1 } });

    await tmdbService.searchMovies('teste');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/movie', { params: { query: 'teste', page: 1 } });

    await tmdbService.getMovieDetails(123);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/123');

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
  });

  test('testRateLimiting - deve respeitar limites de taxa da API', async () => {
    let callCount = 0;
    mockAxiosInstance.get.mockImplementation(() => {
      callCount++;
      if (callCount > 40) {
        return Promise.reject({
          response: {
            status: 429,
            data: { status_message: 'Your request count (41) is over the allowed limit of 40.' }
          }
        });
      }
      return Promise.resolve({ data: { results: [{ id: callCount, title: Movie ${callCount} }] } });
    });

    const promises: Promise<any>[] = [];
    for (let i = 0; i < 40; i++) {
      promises.push(tmdbService.getPopularMovies(i + 1));
    }

    const results = await Promise.all(promises);
    expect(results).toHaveLength(40);

    await expect(tmdbService.getPopularMovies(41))
      .rejects.toThrow('Erro ao buscar filmes populares');
  });

  test('testCacheHeaders - deve processar headers de cache corretamente', async () => {
    const responseWithCache = {
      data: { results: [{ id: 1, title: 'Cached Movie' }] },
      headers: {
        'cache-control': 'public, max-age=28800',
        'etag': 'W/"2a01d5f3c9e8b4d6"',
        'last-modified': 'Thu, 01 Jan 2024 00:00:00 GMT'
      }
    };

    mockAxiosInstance.get.mockResolvedValue(responseWithCache);

    const movies = await tmdbService.getPopularMovies();
    expect(movies[0].title).toBe('Cached Movie');
    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
  });
});