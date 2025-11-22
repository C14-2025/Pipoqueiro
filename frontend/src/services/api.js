import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Erro 401: Token inválido. Deslogando usuário.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?message=sessao-expirada';
      }
    }
    return Promise.reject(error);
  }
);

export const movieService = {
  async getPopular(page = 1) {
    const response = await api.get('/movies/popular', { params: { page } });
    return response.data.data;
  },

  async getRanking(minReviews = 1) {
    const response = await api.get('/movies/ranking', {
      params: { min_reviews: minReviews },
    });
    return response.data.data;
  },

  async searchMovies(query, page = 1) {
    const response = await api.get('/movies/search', { params: { query, page } });
    return response.data.data;
  },

  async getMovieDetails(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}`);
    return response.data.data;
  },

  async getMovieVideos(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}/videos`);
    return response.data.data;
  },

  async getMovieCredits(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}/credits`);
    return response.data.data;
  },

  async getSimilarMovies(tmdbId) {
    const response = await api.get(`/movies/${tmdbId}/similar`);
    return response.data.data;
  },
};

export const authService = {
  async login(email, senha) {
    const response = await api.post('/users/login', { email, senha });
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      window.dispatchEvent(new Event('storage'));
    }
    return response.data.data;
  },

  async register(userData) {
    const response = await api.post('/users/registrar', userData);
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      window.dispatchEvent(new Event('storage'));
    }
    return response.data.data;
  },

  async getProfile() {
    const response = await api.get('/users/perfil');
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/perfil', profileData);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/users/estatisticas');
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async deleteAccount() {
    const response = await api.delete('/users/conta');
    if (response.data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
    }
    return response.data;
  },
};

export const reviewService = {
  async getMovieReviews(tmdbId, includeSpoilers = false) {
    const response = await api.get(`/reviews/filme/${tmdbId}`, {
      params: { spoiler: includeSpoilers }
    });
    return response.data.data;
  },

  async getMyReviews() {
    const response = await api.get('/reviews/minhas');
    return response.data.data;
  },

  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data.data;
  },

  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export const watchlistService = {
  async getWatchlist() {
    const response = await api.get('/watchlist');
    return response.data.data;
  },

  async addToWatchlist(tmdbId) {
    const response = await api.post('/watchlist', { tmdb_id: tmdbId });
    return response.data;
  },

  async removeFromWatchlist(tmdbId) {
    const response = await api.delete(`/watchlist/${tmdbId}`);
    return response.data;
  },
};

export const favoritesService = {
  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data.data;
  },

  async addToFavorites(tmdbId) {
    const response = await api.post('/favorites', { tmdb_id: tmdbId });
    return response.data;
  },

  async removeFromFavorites(tmdbId) {
    const response = await api.delete(`/favorites/${tmdbId}`);
    return response.data;
  },
};

export const systemService = {
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;