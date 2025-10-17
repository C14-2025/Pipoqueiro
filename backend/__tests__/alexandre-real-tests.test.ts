// TESTES UNITÁRIOS COM MOCKS - SEM BANCO DE DADOS REAL
// Testes unitários que cobrem funcionalidades sem precisar de MySQL

import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { describe, test, expect, beforeAll, beforeEach, jest } from '@jest/globals';
import { auth } from '../src/utils/auth';
import { mockExecute } from './setup';

describe('🔥 ALEXANDRE - TESTES UNITÁRIOS DO BACKEND (COM MOCKS)', () => {

  // ==================== USER CONTROLLER - 8 TESTES ====================
  describe('👤 USER CONTROLLER - Funcionalidade Real', () => {

    beforeEach(() => {
      // Reset dos mocks antes de cada teste
      jest.clearAllMocks();
    });

    test('deve registrar usuário e retornar JWT token', async () => {
      // Mock: Email não existe no banco
      (mockExecute as any)
        .mockResolvedValueOnce([[], []]) // SELECT para verificar email existente
        .mockResolvedValueOnce([{ insertId: 1 }, []]); // INSERT do novo usuário

      const userData = {
        nome: 'Alexandre Teste',
        email: 'teste@test.com',
        senha: 'senha123',
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
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET || 'test_jwt_secret_key') as any;
      expect(decoded.email).toBe(userData.email);
    });

    test('deve rejeitar registro com email duplicado', async () => {
      // Mock: Email já existe no banco
      (mockExecute as any).mockResolvedValueOnce([[{ id: 1 }], []]);

      const userData = {
        nome: 'User 1',
        email: 'duplicate@test.com',
        senha: 'senha123',
      };

      const response = await request(app)
        .post('/api/users/registrar')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email já cadastrado');
    });

    test('deve fazer login com credenciais válidas', async () => {
      const senha = 'minhasenha123';
      const senhaHash = await bcrypt.hash(senha, 10);

      // Mock: Usuário existe no banco
      (mockExecute as any).mockResolvedValueOnce([
        [{
          id: 1,
          nome: 'Login User',
          email: 'login@test.com',
          senha_hash: senhaHash,
          bio: null,
          foto_perfil: null,
          generos_favoritos: null,
        }],
        []
      ]);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@test.com',
          senha: senha
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login realizado com sucesso');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('login@test.com');
    });

    test('deve rejeitar login com credenciais inválidas', async () => {
      // Mock: Usuário não existe
      (mockExecute as any).mockResolvedValueOnce([[], []]);

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
      // Criar token válido
      const token = jwt.sign(
        { userId: 1, email: 'profile@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );

      // Mock: Retornar dados do usuário
      (mockExecute as any).mockResolvedValueOnce([
        [{
          id: 1,
          nome: 'Profile User',
          email: 'profile@test.com',
          bio: null,
          foto_perfil: null,
          generos_favoritos: null,
          data_nascimento: null,
          created_at: new Date(),
        }],
        []
      ]);

      const profileResponse = await request(app)
        .get('/api/users/perfil')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.nome).toBe('Profile User');
      expect(profileResponse.body.data.email).toBe('profile@test.com');
      expect(profileResponse.body.data.bio).toBe(null);
    });

    test('deve obter estatísticas do usuário', async () => {
      // Criar token válido
      const token = jwt.sign(
        { userId: 1, email: 'stats@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );

      // Mock: Estatísticas de reviews
      (mockExecute as any)
        .mockResolvedValueOnce([
          [{
            total_reviews: 5,
            nota_media: 4.2,
            reviews_positivas: 3
          }],
          []
        ])
        .mockResolvedValueOnce([
          [{ filmes_na_lista: 10 }],
          []
        ]);

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

    beforeAll(() => {
      // Criar token para os testes
      userToken = jwt.sign(
        { userId: 1, email: 'reviewer@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('deve criar review de filme com dados válidos', async () => {
      // Mock: INSERT bem-sucedido
      (mockExecute as any).mockResolvedValueOnce([{ insertId: 1 }, []]);

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
      const tmdbId = 550;

      // Mock: Retornar reviews do filme
      (mockExecute as any).mockResolvedValueOnce([
        [{
          id: 1,
          usuario_id: 1,
          tmdb_id: 550,
          nota: 5,
          titulo_review: 'Excelente!',
          comentario: 'Muito bom',
          spoiler: false,
          nome: 'Alexandre',
          foto_perfil: null,
        }],
        []
      ]);

      const response = await request(app)
        .get(`/api/reviews/filme/${tmdbId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('deve obter reviews do usuário logado', async () => {
      // Mock: Retornar reviews do usuário
      (mockExecute as any).mockResolvedValueOnce([
        [{
          id: 1,
          usuario_id: 1,
          tmdb_id: 550,
          nota: 5,
          titulo_review: 'Minha review',
          comentario: 'Gostei muito',
          spoiler: false,
        }],
        []
      ]);

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

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('deve obter filmes populares da TMDb', async () => {
      // Mock: Estatísticas dos filmes
      (mockExecute as any).mockResolvedValue([
        [{
          total_reviews: 10,
          nota_media: 4.5,
          reviews_positivas: 8
        }],
        []
      ]);

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
      // Mock: Estatísticas dos filmes
      (mockExecute as any).mockResolvedValue([
        [{
          total_reviews: 5,
          nota_media: 4.0
        }],
        []
      ]);

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

      // Mock: Reviews e estatísticas do filme
      (mockExecute as any)
        .mockResolvedValueOnce([
          [{
            id: 1,
            usuario_id: 1,
            tmdb_id: 550,
            nota: 5,
            titulo_review: 'Excelente',
            comentario: 'Obra-prima',
            spoiler: false,
            nome: 'Alexandre',
            foto_perfil: null,
          }],
          []
        ])
        .mockResolvedValueOnce([
          [{
            total_reviews: 10,
            nota_media: 4.8,
            reviews_positivas: 9,
            reviews_com_spoiler: 2
          }],
          []
        ]);

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
      const mockReq: any = {
        header: jest.fn().mockReturnValue(`Bearer ${validToken}`)
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const mockNext: any = jest.fn();

      // Testa o middleware diretamente
      auth(mockReq, mockRes, mockNext);

      // Verifica se o next() foi chamado (token válido)
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(mockPayload);
      expect(jwtVerifySpy).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET || 'test_jwt_secret_key');

      // Cenário 2: Token expirado com mock
      jwtVerifySpy.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });

      const expiredReq: any = {
        header: jest.fn().mockReturnValue('Bearer expired.token')
      };
      const expiredRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const expiredNext: any = jest.fn();

      auth(expiredReq, expiredRes, expiredNext);

      // Verifica se retornou 401 para token expirado
      expect(expiredRes.status).toHaveBeenCalledWith(401);
      expect(expiredRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido'
      });
      expect(expiredNext).not.toHaveBeenCalled();

      // Cenário 3: Sem token
      const noTokenReq: any = {
        header: jest.fn().mockReturnValue(undefined)
      };
      const noTokenRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const noTokenNext: any = jest.fn();

      auth(noTokenReq, noTokenRes, noTokenNext);

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
