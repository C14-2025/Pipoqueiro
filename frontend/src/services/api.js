import axios from 'axios';

// Base URL do backend (fornecida pelo Alexandre/Otávio)
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token de autenticação automaticamente em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funções relacionadas a filmes
export const movieService = {
  /**
   * Busca os filmes populares.
   * Corresponde a: GET /api/movies/popular
   */
  async getPopular(page = 1) {
    const response = await api.get('/movies/popular', { params: { page } });
    return response.data.data;
  },

  /**
   * Busca o ranking dos filmes da comunidade.
   * Corresponde a: GET /api/movies/ranking
   */
  async getRanking(minReviews = 1) {
    const response = await api.get('/movies/ranking', { params: { min_reviews: minReviews } });
    return response.data.data;
  },

  /**
   * Busca filmes por um termo de pesquisa.
   * Corresponde a: GET /api/movies/search
   */
  async searchMovies(query, page = 1) {
    const response = await api.get('/movies/search', { params: { query, page } });
    return response.data.data;
  },

  /**
   * Busca os detalhes completos de um filme específico.
   * Corresponde a: GET /api/movies/:tmdbId
   */
  async getMovieDetails(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}`);
    return response.data.data;
  },

  /**
   * Busca os vídeos/trailers de um filme.
   * Corresponde a: GET /api/movies/:tmdbId/videos
   */
  async getMovieVideos(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}/videos`);
    return response.data.data;
  },

  /**
   * Busca os créditos (elenco e equipe) de um filme.
   * Corresponde a: GET /api/movies/:tmdbId/credits
   */
  async getMovieCredits(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}/credits`);
    return response.data.data;
  },

  /**
   * Busca filmes similares.
   * Corresponde a: GET /api/movies/:tmdbId/similar
   */
  async getSimilarMovies(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}/similar`);
    return response.data.data;
  }
};

// Funções relacionadas a autenticação e usuários
export const authService = {
  /**
   * Realiza o login do usuário.
   * Corresponde a: POST /api/users/login
   */
  async login(email, senha) {
    const response = await api.post('/users/login', { email, senha });
    // Backend retorna { success: true, data: { token, user } }
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // Dispara evento para atualizar header na mesma aba
      window.dispatchEvent(new Event('storage'));
    }
    return response.data.data;
  },

  /**
   * Registra um novo usuário.
   * Corresponde a: POST /api/users/registrar
   */
  async register(userData) {
    const response = await api.post('/users/registrar', userData);
    // Backend retorna { success: true, data: { token, user } }
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // Dispara evento para atualizar header na mesma aba
      window.dispatchEvent(new Event('storage'));
    }
    return response.data.data;
  },

  /**
   * Busca os dados do perfil do usuário logado.
   * Corresponde a: GET /api/users/perfil
   */
  async getProfile() {
    const response = await api.get('/users/perfil');
    // Backend retorna { success: true, data: user }
    return response.data.data;
  },

  /**
   * Atualiza os dados do perfil do usuário logado.
   * Corresponde a: PUT /api/users/perfil
   */
  async updateProfile(userData) {
    const response = await api.put('/users/perfil', userData);
    // Backend retorna { success: true, data: user }
    return response.data.data;
  },

  /**
   * Remove o token, deslogando o usuário.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispara evento para atualizar header na mesma aba
    window.dispatchEvent(new Event('storage'));
  },

  /**
   * Verifica se existe um token, indicando que o usuário está logado.
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Exclui a conta do usuário.
   * Corresponde a: DELETE /api/users/conta
   */
  async deleteAccount() {
    const response = await api.delete('/users/conta');
    // Após excluir com sucesso, remove dados locais
    if (response.data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
    }
    return response.data;
  }
};

// Funções relacionadas a avaliações (reviews)
export const reviewService = {
  /**
   * Busca todas as avaliações de um filme específico.
   * Corresponde a: GET /api/reviews/filme/:tmdb_id
   */
  async getMovieReviews(tmdbId) {
    const response = await api.get(`/reviews/filme/${tmdbId}`);
    // Backend retorna { success: true, data: [...] }
    return response.data.data;
  },

  /**
   * Busca todas as avaliações feitas pelo usuário logado.
   * Corresponde a: GET /api/reviews/minhas
   */
  async getMyReviews() {
    const response = await api.get('/reviews/minhas');
    // Backend retorna { success: true, data: [...] }
    return response.data.data;
  },

  /**
   * Cria uma nova avaliação.
   * Corresponde a: POST /api/reviews
   */
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    // Backend retorna { success: true, data: { id } }
    return response.data.data;
  },

  /**
   * Atualiza uma avaliação existente.
   * Corresponde a: PUT /api/reviews/:id
   */
  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    // Backend retorna { success: true, message }
    return response.data;
  },

  /**
   * Exclui uma avaliação.
   * Corresponde a: DELETE /api/reviews/:id
   */
  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    // Backend retorna { success: true, message }
    return response.data;
  },

  /**
   * Curte uma avaliação.
   * Corresponde a: POST /api/reviews/:id/curtir
   */
  async likeReview(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/curtir`);
    // Backend retorna { success: true, message }
    return response.data;
  }
};


// ----------------------------------------------------------------------
// --- ADICIONADO: Serviço de Watchlist (Quero Ver) ---
// ----------------------------------------------------------------------
export const watchlistService = {
  /**
   * Obter lista "Quero Ver" do usuário.
   * Corresponde a: GET /api/watchlist
   */
  async getWatchlist() {
    const response = await api.get('/watchlist');
    return response.data.data;
  },

  /**
   * Adiciona um filme à lista "Quero Ver".
   * Corresponde a: POST /api/watchlist
   */
  async addToWatchlist(tmdbId) {
    // Envia o tmdb_id no corpo da requisição (presumindo que o backend espera isso)
    const response = await api.post('/watchlist', { tmdb_id: tmdbId });
    return response.data;
  },

  /**
   * Remove um filme da lista "Quero Ver".
   * Corresponde a: DELETE /api/watchlist/:tmdb_id
   */
  async removeFromWatchlist(tmdbId) {
    const response = await api.delete(`/watchlist/${tmdbId}`);
    return response.data;
  }
};

// ----------------------------------------------------------------------
// --- ADICIONADO: Serviço de Favorites ---
// ----------------------------------------------------------------------
export const favoritesService = {
  /**
   * Obter lista de favoritos.
   * Corresponde a: GET /api/favorites
   */
  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data.data;
  },

  /**
   * Adicionar filme aos favoritos.
   * Corresponde a: POST /api/favorites
   */
  async addToFavorites(tmdbId) {
    const response = await api.post('/favorites', { tmdb_id: tmdbId });
    return response.data;
  },

  /**
   * Remover filme dos favoritos.
   * Corresponde a: DELETE /api/favorites/:tmdb_id
   */
  async removeFromFavorites(tmdbId) {
    const response = await api.delete(`/favorites/${tmdbId}`);
    return response.data;
  },

  /**
   * Verificar se um filme está nos favoritos.
   * Corresponde a: GET /api/favorites/check/:tmdb_id
   */
  async checkIfFavorite(tmdbId) {
    const response = await api.get(`/favorites/check/${tmdbId}`);
    return response.data.data;
  }
};


// Funções do sistema (ex: verificar saúde da API)
export const systemService = {
  /**
   * Verifica se o backend está rodando e respondendo.
   * Corresponde a: GET /api/health
   */
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
