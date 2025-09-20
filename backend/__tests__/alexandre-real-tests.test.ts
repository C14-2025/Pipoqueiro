// TESTES REAIS DO ALEXANDRE - Backend Controllers
// Testes unitários que fazem sentido para o sistema!

import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { describe, test, expect, beforeAll, jest, beforeEach } from '@jest/globals';
import { auth } from '../src/utils/auth';

describe('🔥 ALEXANDRE - TESTES UNITÁRIOS DO BACKEND', () => {

  // ==================== USER CONTROLLER - 8 TESTES ====================
  describe('👤 USER CONTROLLER - Funcionalidade Real', () => {

    test('deve registrar usuário e retornar JWT token', async () => {
      const userData = {
        nome: 'Alexandre Teste',
        email: `test${Date.now()}@test.com`,
        senha: 'senha123',
        bio: 'Desenvolvedor backend',
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      const response = await request(app)
        .post('/api/users/registrar')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuário criado com sucesso');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.nome).toBe(userData.nome);
      expect(response.body.data.user.email).toBe(userData.email);
      
      // Verificar se o token JWT é válido
      const decoded = jwt.verify(response.body.data.token, 'pipoqueiro_secret_123') as any;
      expect(decoded.email).toBe(userData.email);
    });

    test('deve rejeitar registro com email duplicado', async () => {
      const userData = {
        nome: 'User 1',
        email: 'duplicate@test.com',
        senha: 'senha123',
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      // Primeiro registro
      await request(app)
        .post('/api/users/registrar')
        .send(userData)
        .expect(201);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/users/registrar')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email já cadastrado');
    });

    test('deve fazer login com credenciais válidas', async () => {
      const userData = {
        nome: 'Login User',
        email: `login${Date.now()}@test.com`,
        senha: 'minhasenha123',
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      // Primeiro registrar
      await request(app)
        .post('/api/users/registrar')
        .send(userData);

      // Agora fazer login
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          senha: userData.senha
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.message).toBe('Login realizado com sucesso');
      expect(loginResponse.body.data.token).toBeDefined();
      expect(loginResponse.body.data.user.email).toBe(userData.email);
    });

    test('deve rejeitar login com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'inexistente@test.com',
          senha: 'senhaerrada'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciais inválidas');
    });

    test('deve obter perfil do usuário autenticado', async () => {
      // Registrar usuário
      const userData = {
        nome: 'Profile User',
        email: `profile${Date.now()}@test.com`,
        senha: 'senha123',
        bio: 'Minha bio teste',
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      const registerResponse = await request(app)
        .post('/api/users/registrar')
        .send(userData);

      const token = registerResponse.body.data.token;

      // Obter perfil
      const profileResponse = await request(app)
        .get('/api/users/perfil')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.nome).toBe(userData.nome);
      expect(profileResponse.body.data.email).toBe(userData.email);
      expect(profileResponse.body.data.bio).toBe(userData.bio);
    });

    test('deve obter estatísticas do usuário', async () => {
      // Registrar usuário
      const userData = {
        nome: 'Stats User',
        email: `stats${Date.now()}@test.com`,
        senha: 'senha123',
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      const registerResponse = await request(app)
        .post('/api/users/registrar')
        .send(userData);

      const token = registerResponse.body.data.token;

      // Obter estatísticas
      const statsResponse = await request(app)
        .get('/api/users/estatisticas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.message).toBe('Estatísticas obtidas com sucesso');
      expect(statsResponse.body.data.reviews).toBeDefined();
      expect(statsResponse.body.data.watchlist).toBeDefined();
    });

    test('deve validar campos obrigatórios no registro', async () => {
      const response = await request(app)
        .post('/api/users/registrar')
        .send({
          nome: 'Teste'
          // email e senha faltando
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Nome, email e senha são obrigatórios');
    });

    test('deve criptografar senha com bcrypt de forma segura', async () => {
      const senha = 'minhasenhasecreta';
      const hash = await bcrypt.hash(senha, 10);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(senha);
      expect(hash.length).toBeGreaterThan(50);
      
      // Verificar se a comparação funciona
      const isValid = await bcrypt.compare(senha, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('senhaerrada', hash);
      expect(isInvalid).toBe(false);
    });
  });

  // ==================== REVIEW CONTROLLER - 6 TESTES ====================
  describe('⭐ REVIEW CONTROLLER - Funcionalidade Real', () => {

    let userToken: string;

    beforeAll(async () => {
      // Criar usuário para os testes de review
      const userData = {
        nome: 'Review User',
        email: `reviewer${Date.now()}@test.com`,
        senha: 'senha123',
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      const response = await request(app)
        .post('/api/users/registrar')
        .send(userData);

      userToken = response.body.data.token;
    });

    test('deve criar review de filme com dados válidos', async () => {
      const reviewData = {
        tmdb_id: 550, // Fight Club
        nota: 5,
        titulo_review: 'Filme incrível!',
        comentario: 'Uma obra-prima do cinema.',
        spoiler: false
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review criada com sucesso');
      expect(response.body.data.id).toBeDefined();
    });

    test('deve validar nota entre 1 e 5', async () => {
      const reviewData = {
        tmdb_id: 123,
        nota: 6, // Nota inválida
        titulo_review: 'Teste',
        comentario: 'Teste'
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Nota deve estar entre 1 e 5');
    });

    test('deve validar campos obrigatórios na review', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          titulo_review: 'Teste'
          // tmdb_id e nota faltando
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('TMDB ID e nota são obrigatórios');
    });

    test('deve obter reviews de um filme específico', async () => {
      const tmdbId = 550; // Fight Club
      
      // Obter reviews do filme usando rota que existe: /filme/:tmdb_id
      const response = await request(app)
        .get(`/api/reviews/filme/${tmdbId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('deve obter reviews do usuário logado', async () => {
      // Usar rota que existe: /minhas
      const response = await request(app)
        .get('/api/reviews/minhas')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('deve rejeitar acesso a reviews sem token', async () => {
      const response = await request(app)
        .get('/api/reviews/minhas')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== MOVIE CONTROLLER - 4 TESTES ====================
  describe('🎬 MOVIE CONTROLLER - Funcionalidade Real', () => {

    test('deve obter filmes populares da TMDb', async () => {
      const response = await request(app)
        .get('/api/movies/popular')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Filmes populares obtidos com sucesso');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Verificar estrutura dos dados
      const firstMovie = response.body.data[0];
      expect(firstMovie.id).toBeDefined();
      expect(firstMovie.title).toBeDefined();
      expect(firstMovie.poster_url).toBeDefined();
      expect(firstMovie.nossa_stats).toBeDefined();
    });

    test('deve buscar filmes por termo de pesquisa', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ query: 'batman' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Busca realizada com sucesso');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('deve rejeitar busca sem parâmetro query obrigatório', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Parâmetro de busca é obrigatório');
    });

    test('deve obter detalhes de filme específico', async () => {
      const tmdbId = 550; // Fight Club
      
      const response = await request(app)
        .get(`/api/movies/${tmdbId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Detalhes do filme obtidos com sucesso');
      expect(response.body.data.id).toBe(tmdbId);
      expect(response.body.data.title).toBeDefined();
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.poster_url).toBeDefined();
      expect(response.body.data.reviews).toBeInstanceOf(Array);
      expect(response.body.data.stats).toBeDefined();
    });
  });

  // ==================== TESTES DE SEGURANÇA ====================
  describe('🔐 SEGURANÇA - Testes Críticos', () => {

    test('deve rejeitar acesso sem token JWT', async () => {
      const response = await request(app)
        .get('/api/users/perfil')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('deve rejeitar token JWT inválido', async () => {
      const response = await request(app)
        .get('/api/users/perfil')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOVO TESTE COM MOCK - Middleware de autenticação JWT
    test('deve validar e decodificar token JWT com mock do middleware', async () => {
      // Mock do jwt.verify para simular diferentes cenários
      const jwtVerifySpy = jest.spyOn(jwt, 'verify');

      // Cenário 1: Token válido com mock
      const mockPayload = {
        id: 123,
        email: 'teste@mock.com',
        nome: 'Usuário Mock',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      jwtVerifySpy.mockReturnValueOnce(mockPayload as any);

      // Simula uma requisição com token válido mockado
      const validToken = 'mock.valid.token';
      const mockReq = {
        header: jest.fn().mockReturnValue(`Bearer ${validToken}`)
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const mockNext = jest.fn();

      // Testa o middleware diretamente
      auth(mockReq as any, mockRes as any, mockNext);

      // Verifica se o next() foi chamado (token válido)
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual(mockPayload);
      expect(jwtVerifySpy).toHaveBeenCalledWith(validToken, 'pipoqueiro_secret_123');

      // Cenário 2: Token expirado com mock
      jwtVerifySpy.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });

      const expiredReq = {
        header: jest.fn().mockReturnValue('Bearer expired.token')
      };
      const expiredRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const expiredNext = jest.fn();

      auth(expiredReq as any, expiredRes as any, expiredNext);

      // Verifica se retornou 401 para token expirado
      expect(expiredRes.status).toHaveBeenCalledWith(401);
      expect(expiredRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido'
      });
      expect(expiredNext).not.toHaveBeenCalled();

      // Cenário 3: Sem token
      const noTokenReq = {
        header: jest.fn().mockReturnValue(undefined)
      };
      const noTokenRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const noTokenNext = jest.fn();

      auth(noTokenReq as any, noTokenRes as any, noTokenNext);

      expect(noTokenRes.status).toHaveBeenCalledWith(401);
      expect(noTokenRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token não fornecido'
      });
      expect(noTokenNext).not.toHaveBeenCalled();

      // Restaura o mock
      jwtVerifySpy.mockRestore();
    });
  });

  // ==================== HEALTH CHECK ====================
  describe('🏥 HEALTH CHECK - Sistema', () => {

    test('deve responder ao health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API Pipoqueiro funcionando!');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});