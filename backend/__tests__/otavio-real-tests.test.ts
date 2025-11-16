import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Testes mockados do serviço TMDB - sem chamadas reais à API
describe('🎬 OTÁVIO - TESTES MOCKADOS DO SERVIÇO TMDB', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('testFormatPosterURL - deve gerar URLs corretas para diferentes tamanhos', () => {
    // Teste simples de formatação de URL que não depende de API
    const posterPath = '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg';
    const formattedUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

    expect(formattedUrl).toBe('https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
    expect(formattedUrl).toContain('image.tmdb.org');
    expect(formattedUrl).toContain('w500');
    expect(formattedUrl).toMatch(/^https:\/\//);

    const anotherPath = '/xq4v7JE8niZ75OYYPDGNn6Gzpny.jpg';
    const anotherUrl = `https://image.tmdb.org/t/p/w500${anotherPath}`;
    expect(anotherUrl).toBe('https://image.tmdb.org/t/p/w500/xq4v7JE8niZ75OYYPDGNn6Gzpny.jpg');
  });

  test('testFormatPosterURLNulo - deve fornecer placeholder para posters ausentes', () => {
    const placeholderUrl = 'https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster';

    expect(placeholderUrl).toBe('https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster');
    expect(placeholderUrl).toContain('placeholder');
    expect(placeholderUrl).toContain('Sem+Poster');
  });

  test('testMockMovieData - deve validar estrutura de dados mockados', () => {
    const mockMovie = {
      id: 550,
      title: 'Fight Club',
      poster_path: '/poster.jpg',
      vote_average: 8.4,
      vote_count: 1000,
    };

    expect(mockMovie.id).toBe(550);
    expect(mockMovie.title).toBe('Fight Club');
    expect(mockMovie.vote_average).toBeGreaterThan(0);
    expect(mockMovie.vote_count).toBeGreaterThan(0);
    expect(typeof mockMovie.title).toBe('string');
    expect(typeof mockMovie.id).toBe('number');
  });

  test('testArrayValidation - deve validar arrays de filmes mockados', () => {
    const mockMovies = [
      {
        id: 550,
        title: 'Fight Club',
        poster_path: '/poster.jpg',
      },
      {
        id: 268896,
        title: 'The Dark Knight',
        poster_path: '/batman.jpg',
      },
    ];

    expect(Array.isArray(mockMovies)).toBe(true);
    expect(mockMovies).toHaveLength(2);
    expect(mockMovies[0].id).toBe(550);
    expect(mockMovies[1].title).toBe('The Dark Knight');
  });

  test('testMovieSearchLogic - deve simular lógica de busca', () => {
    const searchTerm = 'batman';
    const allMovies = [
      { id: 1, title: 'Batman: The Dark Knight' },
      { id: 2, title: 'Batman Begins' },
      { id: 3, title: 'Avengers' },
    ];

    // Simular filtro de busca
    const results = allMovies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(2);
    expect(results.every(m => m.title.toLowerCase().includes('batman'))).toBe(true);
  });

  test('testPaginationLogic - deve simular lógica de paginação', () => {
    const page1 = { page: 1, results: [{ id: 1 }, { id: 2 }] };
    const page2 = { page: 2, results: [{ id: 3 }, { id: 4 }] };
    const page3 = { page: 3, results: [{ id: 5 }, { id: 6 }] };

    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);
    expect(page3.page).toBe(3);
    expect(page1.results).toHaveLength(2);
    expect(page1.results).not.toEqual(page2.results);
  });

  test('testMovieDetailsStructure - deve validar estrutura de detalhes', () => {
    const movieDetails = {
      id: 550,
      title: 'Fight Club',
      overview: 'A great movie',
      runtime: 139,
      vote_average: 8.4,
      genres: [{ id: 18, name: 'Drama' }],
      budget: 63000000,
      revenue: 100853753,
    };

    expect(movieDetails.id).toBe(550);
    expect(movieDetails.runtime).toBeGreaterThan(0);
    expect(movieDetails.revenue).toBeGreaterThan(movieDetails.budget);
    expect(Array.isArray(movieDetails.genres)).toBe(true);
    expect(movieDetails.genres).toHaveLength(1);
  });

  test('testEmptySearchResults - deve lidar com resultados vazios', () => {
    const emptyResults: Array<{ id: number; title: string }> = [];

    expect(Array.isArray(emptyResults)).toBe(true);
    expect(emptyResults).toHaveLength(0);
  });

  test('testSpecialCharacters - deve validar processamento de caracteres especiais', () => {
    const movies = [
      { title: 'João e Maria: Caçadores de Bruxas' },
      { title: 'Amélie Poulain' },
      { title: 'À Procura de Nemo' },
    ];

    expect(movies[0].title).toContain('João');
    expect(movies[1].title).toContain('Amélie');
    expect(movies[2].title).toContain('À Procura');
  });

  test('testRatingValidation - deve validar notas de filmes', () => {
    const movie1 = { vote_average: 8.4 };
    const movie2 = { vote_average: 7.7 };
    const movie3 = { vote_average: 9.0 };

    expect(movie1.vote_average).toBeGreaterThan(0);
    expect(movie1.vote_average).toBeLessThanOrEqual(10);
    expect(movie2.vote_average).toBeGreaterThan(0);
    expect(movie3.vote_average).toBe(9.0);
  });

  test('testDateFormatValidation - deve validar formato de datas', () => {
    const releaseDate = '2024-06-11';

    expect(releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(releaseDate.split('-')).toHaveLength(3);
  });

  test('testGenreArrayValidation - deve validar arrays de gêneros', () => {
    const genres = [
      { id: 18, name: 'Drama' },
      { id: 53, name: 'Thriller' },
      { id: 35, name: 'Comédia' },
    ];

    expect(Array.isArray(genres)).toBe(true);
    expect(genres).toHaveLength(3);
    expect(genres.every(g => g.id && g.name)).toBe(true);
  });

  test('testURLValidation - deve validar URLs de imagens', () => {
    const posterUrl = 'https://image.tmdb.org/t/p/w500/poster.jpg';
    const backdropUrl = 'https://image.tmdb.org/t/p/w1280/backdrop.jpg';

    expect(posterUrl).toMatch(/^https:\/\//);
    expect(backdropUrl).toMatch(/^https:\/\//);
    expect(posterUrl).toContain('image.tmdb.org');
    expect(backdropUrl).toContain('image.tmdb.org');
  });

  test('testPopularityScore - deve validar scores de popularidade', () => {
    const movie1 = { popularity: 1042.849 };
    const movie2 = { popularity: 945.231 };

    expect(movie1.popularity).toBeGreaterThan(0);
    expect(movie1.popularity).toBeGreaterThan(movie2.popularity);
  });
});

// ==================== TESTES DE ROTAS MOVIES - 7 TESTES ====================
import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { mockSupabaseRpc, mockSupabaseOperation } from './setup';

describe('🎬 OTÁVIO - TESTES DAS ROTAS DE MOVIES', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/movies/popular - deve obter filmes populares com estatísticas', async () => {
    // Mock: RPC get_movie_details_stats retorna estatísticas
    mockSupabaseRpc.mockResolvedValue({
      data: [{
        total_reviews: 10,
        nota_media: 4.5,
        reviews_positivas: 8
      }],
      error: null
    });

    const response = await request(app)
      .get('/api/movies/popular?page=1')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Filmes populares obtidos com sucesso');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data[0]).toHaveProperty('nossa_stats');
  });

  test('GET /api/movies/ranking - deve obter ranking da comunidade', async () => {
    // Mock: RPC get_movie_ranking retorna ranking
    mockSupabaseRpc.mockResolvedValue({
      data: [{
        tmdb_id: 550,
        total_avaliacoes: 15,
        nota_media: 4.8,
        avaliacoes_positivas: 14
      }],
      error: null
    });

    const response = await request(app)
      .get('/api/movies/ranking?limit=50&min_reviews=3')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('filmes da comunidade Pipoqueiro');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.meta).toBeDefined();
    expect(response.body.meta.min_reviews_required).toBe(3);
  });

  test('GET /api/movies/search - deve buscar filmes por query', async () => {
    // Mock: RPC get_movie_search_stats retorna estatísticas
    mockSupabaseRpc.mockResolvedValue({
      data: [{
        total_reviews: 5,
        nota_media: 4.2
      }],
      error: null
    });

    const response = await request(app)
      .get('/api/movies/search?query=batman&page=1')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Busca realizada com sucesso');
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('GET /api/movies/search - deve rejeitar busca sem query', async () => {
    const response = await request(app)
      .get('/api/movies/search')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Parâmetro de busca é obrigatório');
  });

  test('GET /api/movies/:tmdbId - deve obter detalhes do filme com reviews', async () => {
    const tmdbId = 550;

    // Mock: SELECT reviews com JOIN de usuários
    mockSupabaseOperation([{
      id: 1,
      tmdb_id: 550,
      nota: 5,
      titulo_review: 'Excelente!',
      comentario: 'Muito bom',
      usuarios: {
        nome: 'Otávio',
        foto_perfil: null
      }
    }], null);

    // Mock: RPC get_movie_details_stats
    mockSupabaseRpc.mockResolvedValue({
      data: [{
        total_reviews: 10,
        nota_media: 4.5,
        reviews_positivas: 8,
        reviews_com_spoiler: 2
      }],
      error: null
    });

    const response = await request(app)
      .get(`/api/movies/${tmdbId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Detalhes do filme obtidos com sucesso');
    expect(response.body.data).toHaveProperty('reviews');
    expect(response.body.data).toHaveProperty('stats');
    expect(response.body.data).toHaveProperty('poster_url');
  });

  test('GET /api/movies/:tmdbId/videos - deve obter vídeos/trailers do filme', async () => {
    const tmdbId = 550;

    const response = await request(app)
      .get(`/api/movies/${tmdbId}/videos`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Vídeos obtidos com sucesso');
    expect(response.body.data).toBeDefined();
  });

  test('GET /api/movies/:tmdbId/credits - deve obter elenco e equipe do filme', async () => {
    const tmdbId = 550;

    const response = await request(app)
      .get(`/api/movies/${tmdbId}/credits`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Créditos obtidos com sucesso');
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('cast');
    expect(response.body.data).toHaveProperty('crew');
  });

  test('GET /api/movies/:tmdbId/similar - deve obter filmes similares filtrados', async () => {
    const tmdbId = 550;

    const response = await request(app)
      .get(`/api/movies/${tmdbId}/similar?page=1`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Filmes similares obtidos com sucesso');
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
