import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'SUA_CHAVE_AQUI';
const BASE_URL = 'https://api.themoviedb.org/3';

export class TMDbService {
  private api = axios.create({
    baseURL: BASE_URL,
    params: {
      api_key: TMDB_API_KEY,
      language: 'pt-BR'
    }
  });

  // Filmes populares
  async getPopularMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/popular', { params: { page } });
      return response.data.results;
    } catch (error) {
      throw new Error('Erro ao buscar filmes populares');
    }
  }

  // Buscar filmes
  async searchMovies(query: string, page = 1) {
    try {
      const response = await this.api.get('/search/movie', {
        params: { query, page }
      });
      return response.data.results;
    } catch (error) {
      throw new Error('Erro ao buscar filmes');
    }
  }

  // Detalhes do filme
  async getMovieDetails(tmdbId: number) {
    try {
      const response = await this.api.get(`/movie/${tmdbId}`);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar detalhes');
    }
  }

  // Formatar URL do poster
  formatPosterURL(path: string | null) {
    if (!path) return 'https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster';
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  // Buscar vídeos do filme
  async getMovieVideos(tmdbId: number) {
    try {
      const response = await this.api.get(`/movie/${tmdbId}/videos`);
      return response.data.results;
    } catch (error) {
      throw new Error('Erro ao buscar vídeos do filme');
    }
  }

  // Buscar créditos do filme (elenco e equipe)
  async getMovieCredits(tmdbId: number) {
    try {
      const response = await this.api.get(`/movie/${tmdbId}/credits`);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar créditos do filme');
    }
  }

  // Buscar filmes similares
  async getSimilarMovies(tmdbId: number, page = 1) {
    try {
      const response = await this.api.get(`/movie/${tmdbId}/similar`, {
        params: { page }
      });
      return response.data.results;
    } catch (error) {
      throw new Error('Erro ao buscar filmes similares');
    }
  }
}
