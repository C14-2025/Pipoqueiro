import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { UsuarioLogin } from '../types';
import { logSuccess, logError, logDatabase } from '../middleware/logger';

export class UserController {
  private JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

  private parseGenerosFavoritos(value: any): string[] {
    try {
      if (value && typeof value === 'string') {
        return JSON.parse(value);
      }
      return [];
    } catch {
      return [];
    }
  }

  async registrarUsuario(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios'
        });
      }

      logDatabase('SELECT id FROM usuarios WHERE email = ?', [email]);
      const [existingUser] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if ((existingUser as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);

      logDatabase(
        'INSERT INTO usuarios (nome, email, senha_hash, bio, foto_perfil, generos_favoritos, data_nascimento) VALUES (?, ?, ?, NULL, NULL, NULL, NULL)',
        [nome, email, '***HASH***']
      );

      const [result] = await pool.execute(
        `INSERT INTO usuarios (nome, email, senha_hash, bio, foto_perfil, generos_favoritos, data_nascimento)
         VALUES (?, ?, ?, NULL, NULL, NULL, NULL)`,
        [nome, email, senha_hash]
      );

      const userId = (result as any).insertId;
      const token = jwt.sign({ userId, email }, this.JWT_SECRET);

      logSuccess(`Usuário registrado: ${nome} (ID ${userId})`);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          token,
          user: {
            id: userId,
            nome,
            email,
            bio: null,
            foto_perfil: null,
            generos_favoritos: null
          }
        }
      });
    } catch (error) {
      logError('Erro ao registrar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async loginUsuario(req: Request, res: Response) {
    try {
      const { email, senha }: UsuarioLogin = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      logDatabase('SELECT * FROM usuarios WHERE email = ?', [email]);
      const [rows] = await pool.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );

      const users = rows as any[];

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const user = users[0];
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.JWT_SECRET
      );

      const generosFavoritos = this.parseGenerosFavoritos(user.generos_favoritos);

      logSuccess(`Login realizado: ${user.nome} (ID ${user.id})`);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            bio: user.bio,
            foto_perfil: user.foto_perfil,
            generos_favoritos: generosFavoritos
          }
        }
      });
    } catch (error) {
      logError('Erro ao fazer login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async obterPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const [rows] = await pool.execute(
        'SELECT id, nome, email, bio, foto_perfil, generos_favoritos, data_nascimento, created_at FROM usuarios WHERE id = ?',
        [userId]
      );

      const users = rows as any[];

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const user = users[0];
      user.generos_favoritos = this.parseGenerosFavoritos(user.generos_favoritos);

      res.json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: user
      });
    } catch (error) {
      logError('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async atualizarPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { nome, bio, foto_perfil, generos_favoritos, data_nascimento } = req.body;

      const [result] = await pool.execute(
        `UPDATE usuarios
         SET nome = COALESCE(?, nome),
             bio = COALESCE(?, bio),
             foto_perfil = COALESCE(?, foto_perfil),
             generos_favoritos = COALESCE(?, generos_favoritos),
             data_nascimento = COALESCE(?, data_nascimento),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          nome || null,
          bio || null,
          foto_perfil || null,
          generos_favoritos ? JSON.stringify(generos_favoritos) : null,
          data_nascimento || null,
          userId
        ]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      logSuccess(`Perfil atualizado: usuário ${userId}`);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      logError('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async obterEstatisticasUsuario(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const [reviewStats] = await pool.execute(
        `SELECT
          COUNT(*) as total_reviews,
          AVG(nota) as nota_media,
          COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas
         FROM avaliacoes WHERE usuario_id = ?`,
        [userId]
      );

      const [watchlistStats] = await pool.execute(
        'SELECT JSON_LENGTH(lista_quero_ver) as filmes_na_lista FROM usuarios WHERE id = ?',
        [userId]
      );

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: {
          reviews: (reviewStats as any[])[0],
          watchlist: { filmes_na_lista: (watchlistStats as any[])[0]?.filmes_na_lista || 0 }
        }
      });
    } catch (error) {
      logError('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async excluirConta(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const [result] = await pool.execute(
        'DELETE FROM usuarios WHERE id = ?',
        [userId]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      logSuccess(`Conta excluída: usuário ${userId}`);

      res.json({
        success: true,
        message: 'Conta excluída com sucesso'
      });
    } catch (error) {
      logError('Erro ao excluir conta:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
