/**
 * TESTES UNITÁRIOS - BACKEND PIPOQUEIRO
 *
 * Testes com mocks completos - não requer banco de dados real.
 * Todas as queries Supabase (PostgreSQL) são simuladas usando jest.fn().
 *
 * Cobertura:
 * - UserController: 10 testes (registro, login, perfil, estatísticas, CRUD)
 * - ReviewController: 10 testes (CRUD completo, validações, curtidas)
 * - FavoritesController: 7 testes (adicionar, remover, verificar)
 * - WatchlistController: 6 testes (adicionar, remover, listar)
 * - Segurança: 3 testes (JWT, autenticação)
 * - Health Check: 1 teste
 *
 * Total: 51 testes
 *
 * Para rodar: npm test
 */

import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { describe, test, expect, beforeAll, beforeEach, jest } from '@jest/globals';
import { auth } from '../src/utils/auth';
import { mockSupabaseFrom, mockSupabaseRpc, mockSupabaseOperation } from './setup';

describe('ALEXANDRE - TESTES UNITÁRIOS DO BACKEND (COM MOCKS)', () => {

  // ==================== USER CONTROLLER - 10 TESTES ====================
  describe('USER CONTROLLER - Funcionalidade Real', () => {

    beforeEach(() => {
      // Reset dos mocks antes de cada teste
      jest.clearAllMocks();
    });

    test('deve registrar usuário e retornar JWT token', async () => {
      // Mock: Email não existe no banco
      mockSupabaseOperation([], null);

      // Mock: INSERT do novo usuário
      mockSupabaseOperation(
        { id: 1, nome: 'Alexandre Teste', email: 'teste@test.com', bio: null, foto_perfil: null, generos_favoritos: null },
        null
      );

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
      mockSupabaseOperation([{ id: 1 }], null);

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
      mockSupabaseOperation([{
        id: 1,
        nome: 'Login User',
        email: 'login@test.com',
        senha_hash: senhaHash,
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
      }], null);

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
      mockSupabaseOperation([], null);

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
      mockSupabaseOperation([{
        id: 1,
        nome: 'Profile User',
        email: 'profile@test.com',
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null,
        created_at: new Date(),
      }], null);

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
      mockSupabaseOperation([{
        total_reviews: 5,
        nota_media: 4.2,
        reviews_positivas: 3
      }], null);

      // Mock: Estatísticas de watchlist
      mockSupabaseOperation([{ filmes_na_lista: 10 }], null);

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

    test('deve atualizar perfil do usuário', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'update@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );

      // Mock: Update bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .put('/api/users/perfil')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Nome Atualizado',
          bio: 'Nova bio',
          generos_favoritos: ['ação', 'ficção']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Perfil atualizado com sucesso');
    });

    test('deve excluir conta do usuário', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'delete@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );

      // Mock: Delete bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .delete('/api/users/conta')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Conta excluída com sucesso');
    });
  });

  // ==================== REVIEW CONTROLLER - 10 TESTES ====================
  describe('REVIEW CONTROLLER - Funcionalidade Real', () => {

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
      // Mock: INSERT bem-sucedido retornando o ID
      mockSupabaseOperation({ id: 1 }, null);

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
      mockSupabaseOperation([{
        id: 1,
        usuario_id: 1,
        tmdb_id: 550,
        nota: 5,
        titulo_review: 'Excelente!',
        comentario: 'Muito bom',
        spoiler: false,
        nome: 'Alexandre',
        foto_perfil: null,
      }], null);

      const response = await request(app)
        .get(`/api/reviews/filme/${tmdbId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('deve obter reviews do usuário logado', async () => {
      // Mock: Retornar reviews do usuário
      mockSupabaseOperation([{
        id: 1,
        usuario_id: 1,
        tmdb_id: 550,
        nota: 5,
        titulo_review: 'Minha review',
        comentario: 'Gostei muito',
        spoiler: false,
      }], null);

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

    test('deve atualizar review existente', async () => {
      // Mock: Update bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .put('/api/reviews/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nota: 4,
          titulo_review: 'Review atualizada',
          comentario: 'Comentário atualizado'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review atualizada com sucesso');
    });

    test('deve rejeitar atualização de review inexistente', async () => {
      // Mock: Nenhuma linha afetada (update retorna null)
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .put('/api/reviews/999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nota: 4 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Review não encontrada ou você não tem permissão');
    });

    test('deve excluir review', async () => {
      // Mock: Delete bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .delete('/api/reviews/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review excluída com sucesso');
    });

    test('deve curtir review', async () => {
      // Mock: Update de curtidas bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .post('/api/reviews/1/curtir')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review curtida com sucesso');
    });
  });

  // ==================== FAVORITES CONTROLLER - 7 TESTES ====================
  describe('FAVORITES CONTROLLER - Funcionalidade Real', () => {

    let userToken: string;

    beforeAll(() => {
      userToken = jwt.sign(
        { userId: 1, email: 'favorites@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('deve adicionar filme aos favoritos', async () => {
      // Mock: Verificação se já existe (retorna vazio)
      mockSupabaseOperation([], null);

      // Mock: INSERT do favorito
      mockSupabaseOperation({ id: 1, usuario_id: 1, tmdb_id: 550 }, null);

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ tmdb_id: 550 })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Filme adicionado aos favoritos com sucesso');
      expect(response.body.data.tmdb_id).toBe(550);
      expect(response.body.data.data_adicao).toBeDefined();
    });

    test('deve rejeitar filme duplicado nos favoritos', async () => {
      // Mock: Usuário já tem o filme nos favoritos
      mockSupabaseOperation([{ id: 1, usuario_id: 1, tmdb_id: 550 }], null);

      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ tmdb_id: 550 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Filme já está nos seus favoritos');
    });

    test('deve validar tmdb_id obrigatório ao adicionar', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('TMDB ID é obrigatório');
    });

    test('deve obter lista de favoritos vazia', async () => {
      // Mock: Retorna array vazio de favoritos
      mockSupabaseOperation([], null);

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Filmes favoritos obtidos com sucesso');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    test('deve remover filme dos favoritos', async () => {
      // Mock: DELETE bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .delete('/api/favorites/550')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Filme removido dos favoritos com sucesso');
    });

    test('deve retornar erro ao remover filme inexistente dos favoritos', async () => {
      // Mock: Nenhum registro afetado pelo DELETE
      mockSupabaseOperation(null, { code: 'PGRST116', message: 'No rows deleted' });

      const response = await request(app)
        .delete('/api/favorites/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Filme não encontrado nos seus favoritos');
    });

    test('deve verificar se filme está nos favoritos', async () => {
      // Mock: Retorna um favorito com esse tmdb_id
      mockSupabaseOperation([{ id: 1, usuario_id: 1, tmdb_id: 550, created_at: '2025-01-01' }], null);

      const response = await request(app)
        .get('/api/favorites/check/550')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_favorite).toBe(true);
    });
  });

  // ==================== WATCHLIST CONTROLLER - 6 TESTES ====================
  describe('WATCHLIST CONTROLLER - Funcionalidade Real', () => {

    let userToken: string;

    beforeAll(() => {
      userToken = jwt.sign(
        { userId: 1, email: 'watchlist@test.com' },
        process.env.JWT_SECRET || 'test_jwt_secret_key'
      );
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('deve adicionar filme à watchlist', async () => {
      // Mock: Verificação se já existe (retorna vazio)
      mockSupabaseOperation([], null);

      // Mock: INSERT na watchlist
      mockSupabaseOperation({ id: 1, usuario_id: 1, tmdb_id: 550 }, null);

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ tmdb_id: 550 })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Filme adicionado à lista "Quero Ver" com sucesso');
      expect(response.body.data.tmdb_id).toBe(550);
      expect(response.body.data.data_adicao).toBeDefined();
    });

    test('deve rejeitar filme duplicado na watchlist', async () => {
      // Mock: Usuário já tem o filme na watchlist
      mockSupabaseOperation([{ id: 1, usuario_id: 1, tmdb_id: 550 }], null);

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ tmdb_id: 550 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Filme já está na sua lista "Quero Ver"');
    });

    test('deve validar tmdb_id obrigatório ao adicionar', async () => {
      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('TMDB ID é obrigatório');
    });

    test('deve obter watchlist vazia', async () => {
      // Mock: Retorna array vazio de watchlist
      mockSupabaseOperation([], null);

      const response = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Lista quero ver obtida com sucesso');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    test('deve remover filme da watchlist', async () => {
      // Mock: DELETE bem-sucedido
      mockSupabaseOperation(null, null);

      const response = await request(app)
        .delete('/api/watchlist/550')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Filme removido da lista "Quero Ver" com sucesso');
    });

    test('deve retornar erro ao remover filme inexistente da watchlist', async () => {
      // Mock: Nenhum registro afetado pelo DELETE
      mockSupabaseOperation(null, { code: 'PGRST116', message: 'No rows deleted' });

      const response = await request(app)
        .delete('/api/watchlist/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Filme não encontrado na sua lista "Quero Ver"');
    });
  });

  // ==================== TESTES DE SEGURANÇA ====================
  describe('SEGURANÇA - Testes Críticos', () => {

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
  describe('HEALTH CHECK - Sistema', () => {

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
