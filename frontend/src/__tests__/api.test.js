import axios from 'axios';
import { movieService, authService, systemService, reviewService } from '../services/api';

// Mocka o módulo axios
jest.mock('axios');

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'dispatchEvent', { value: jest.fn() });


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

  // --- Testes de AuthService ---

  it('deve realizar o login do usuário', async () => {
    const mockData = { token: 'fake-jwt-token', user: { id: 1, name: 'Test User' } };
    axios.post.mockResolvedValueOnce({ data: { data: mockData } });
    
    const result = await authService.login('test@user.com', 'password123');
    
    expect(axios.post).toHaveBeenCalledWith('/users/login', { email: 'test@user.com', senha: 'password123' });
    expect(result).toEqual(mockData);
  });

  it('deve registrar um novo usuário', async () => {
    const userData = { name: 'Novo Usuário', email: 'novo@teste.com', password: '321' };
    const mockData = { token: 'fake-jwt-token-2', user: { id: 2, name: 'Novo Usuário' } };
    axios.post.mockResolvedValueOnce({ data: { data: mockData } });

    const result = await authService.register(userData);
    
    expect(axios.post).toHaveBeenCalledWith('/users/registrar', userData);
    expect(result).toEqual(mockData);
  });

  it('deve buscar o perfil do usuário', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    axios.get.mockResolvedValueOnce({ data: { data: mockUser } });

    const profile = await authService.getProfile();
    
    expect(axios.get).toHaveBeenCalledWith('/users/perfil');
    expect(profile).toEqual(mockUser);
  });
  
  it('deve atualizar o perfil do usuário', async () => {
    const userData = { name: 'Usuário Atualizado' };
    const mockUser = { id: 1, name: 'Usuário Atualizado' };
    axios.put.mockResolvedValueOnce({ data: { data: mockUser } });
    
    const result = await authService.updateProfile(userData);

    expect(axios.put).toHaveBeenCalledWith('/users/perfil', userData);
    expect(result).toEqual(mockUser);
  });

  it('deve realizar o logout do usuário', () => {
    authService.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  // --- Testes de ReviewService ---
  
  it('deve buscar as avaliações de um filme', async () => {
    const mockReviews = [{ id: 1, comment: 'Ótimo!' }];
    axios.get.mockResolvedValueOnce({ data: { data: mockReviews } });
    
    const reviews = await reviewService.getMovieReviews(123);

    expect(axios.get).toHaveBeenCalledWith('/reviews/filme/123');
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