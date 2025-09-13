import axios from 'axios';
import { movieService, authService, systemService, reviewService } from '../services/api';

// Mocka o módulo axios
jest.mock('axios');

// Mocka o localStorage para o teste de logout
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: jest.fn((key) => { delete store[key]; }), // Usamos jest.fn() para espionar a chamada
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('API Services', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Testes de MovieService ---

  it('deve buscar filmes populares', async () => {
    const mockResults = [{ id: 1, title: 'Super Mario Bros.' }];
    axios.get.mockResolvedValueOnce({ data: { data: mockResults } });
    
    const movies = await movieService.getPopular();
    
    expect(axios.get).toHaveBeenCalledWith('/movies/popular', { params: { page: 1 } });
    expect(movies).toEqual(mockResults);
  });

  it('deve buscar filmes por um termo de pesquisa', async () => {
    const mockResults = [{ id: 2, title: 'The Matrix' }];
    axios.get.mockResolvedValueOnce({ data: { data: mockResults } });
    
    const movies = await movieService.searchMovies('Matrix');
    
    expect(axios.get).toHaveBeenCalledWith('/movies/search', { params: { query: 'Matrix', page: 1 } });
    expect(movies).toEqual(mockResults);
  });

  it('deve buscar os detalhes de um filme', async () => {
    const mockDetails = { id: 123, title: 'Filme Detalhado' };
    axios.get.mockResolvedValueOnce({ data: { data: mockDetails } });

    const details = await movieService.getMovieDetails(123);

    expect(axios.get).toHaveBeenCalledWith('/movies/123');
    expect(details).toEqual(mockDetails);
  });

  // --- Testes de AuthService ---

  it('deve realizar o login do usuário', async () => {
    const mockResponse = { token: 'fake-jwt-token' };
    axios.post.mockResolvedValueOnce({ data: mockResponse });
    
    const result = await authService.login('test@user.com', 'password123');
    
    expect(axios.post).toHaveBeenCalledWith('/users/login', { email: 'test@user.com', senha: 'password123' });
    expect(result).toEqual(mockResponse);
  });

  it('deve registrar um novo usuário', async () => {
    const userData = { name: 'Novo Usuário', email: 'novo@teste.com', password: '321' };
    const mockUser = { id: 2, name: 'Novo Usuário' };
    axios.post.mockResolvedValueOnce({ data: { user: mockUser } });

    const result = await authService.register(userData);
    
    expect(axios.post).toHaveBeenCalledWith('/users/register', userData);
    expect(result).toEqual(mockUser);
  });

  it('deve buscar o perfil do usuário', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    axios.get.mockResolvedValueOnce({ data: { user: mockUser } });

    const profile = await authService.getProfile();
    
    expect(axios.get).toHaveBeenCalledWith('/users/profile');
    expect(profile).toEqual(mockUser);
  });
  
  it('deve atualizar o perfil do usuário', async () => {
    const userData = { name: 'Usuário Atualizado' };
    const mockUser = { id: 1, name: 'Usuário Atualizado' };
    axios.put.mockResolvedValueOnce({ data: { user: mockUser } });
    
    const result = await authService.updateProfile(userData);

    expect(axios.put).toHaveBeenCalledWith('/users/profile', userData);
    expect(result).toEqual(mockUser);
  });

  it('deve realizar o logout do usuário', () => {
    authService.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  // --- Testes de ReviewService ---
  
  it('deve buscar as avaliações de um filme', async () => {
    const mockReviews = [{ id: 1, comment: 'Ótimo!' }];
    axios.get.mockResolvedValueOnce({ data: { reviews: mockReviews } });
    
    const reviews = await reviewService.getMovieReviews(123);

    expect(axios.get).toHaveBeenCalledWith('/reviews/movie/123');
    expect(reviews).toEqual(mockReviews);
  });
  
  // --- Testes de SystemService ---

  it('deve verificar a saúde do sistema', async () => {
    const mockStatus = { status: 'ok' };
    axios.get.mockResolvedValueOnce({ data: mockStatus });

    const health = await systemService.checkHealth();

    expect(axios.get).toHaveBeenCalledWith('/health');
    expect(health).toEqual(mockStatus);
  });

});