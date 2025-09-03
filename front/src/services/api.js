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
    // Salva o token no localStorage para manter o usuário logado
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Registra um novo usuário.
   * Corresponde a: POST /api/users/register
   */
  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response.data.user;
  },

  /**
   * Busca os dados do perfil do usuário logado.
   * Corresponde a: GET /api/users/profile
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  /**
   * Atualiza os dados do perfil do usuário logado.
   * Corresponde a: PUT /api/users/profile
   */
  async updateProfile(userData) {
    const response = await api.put('/users/profile', userData);
    return response.data.user;
  },

  /**
   * Remove o token, deslogando o usuário.
   */
  logout() {
    localStorage.removeItem('token');
  },

  /**
   * Verifica se existe um token, indicando que o usuário está logado.
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

// Funções relacionadas a avaliações (reviews)
export const reviewService = {
  /**
   * Busca todas as avaliações de um filme específico.
   * Corresponde a: GET /api/reviews/movie/:tmdbId
   */
  async getMovieReviews(tmdbId) {
    const response = await api.get(`/reviews/movie/${tmdbId}`);
    return response.data.reviews;
  },

  /**
   * Busca todas as avaliações feitas por um usuário específico.
   * Corresponde a: GET /api/reviews/user/:userId
   */
  async getUserReviews(userId) {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data.reviews;
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