import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { UsuarioInput, UsuarioLogin, AuthPayload } from '../types';

export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    // Apenas campos obrigatórios no registro
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se email já existe
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

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    // Inserir usuário apenas com campos obrigatórios
    // Campos opcionais ficam NULL para serem preenchidos no perfil depois
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, bio, foto_perfil, generos_favoritos, data_nascimento)
       VALUES (?, ?, ?, NULL, NULL, NULL, NULL)`,
      [nome, email, senha_hash]
    );

    const userId = (result as any).insertId;

    // Gerar JWT
    const token = jwt.sign(
      { userId, email },
      'pipoqueiro_secret_123'
    );

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
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, senha }: UsuarioLogin = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
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

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'pipoqueiro_secret_123'
    );

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
          generos_favoritos: JSON.parse(user.generos_favoritos || '[]')
        }
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterPerfil = async (req: Request, res: Response) => {
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
    user.generos_favoritos = JSON.parse(user.generos_favoritos || '[]');

    res.json({
      success: true,
      message: 'Perfil obtido com sucesso',
      data: user
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const atualizarPerfil = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { nome, bio, foto_perfil, generos_favoritos, data_nascimento } = req.body;

    // Tratar campos opcionais - converter undefined para null
    const nomeValue = nome || null;
    const bioValue = bio || null;
    const fotoPerfilValue = foto_perfil || null;
    const generosFavoritosValue = generos_favoritos ? JSON.stringify(generos_favoritos) : null;
    const dataNascimentoValue = data_nascimento || null;

    const [result] = await pool.execute(
      `UPDATE usuarios
       SET nome = COALESCE(?, nome),
           bio = COALESCE(?, bio),
           foto_perfil = COALESCE(?, foto_perfil),
           generos_favoritos = COALESCE(?, generos_favoritos),
           data_nascimento = COALESCE(?, data_nascimento),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nomeValue, bioValue, fotoPerfilValue, generosFavoritosValue, dataNascimentoValue, userId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterEstatisticasUsuario = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Estatísticas de reviews
    const [reviewStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(nota) as nota_media,
        COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas
       FROM avaliacoes WHERE usuario_id = ?`,
      [userId]
    );

    // Filmes na lista "quero ver"
    const [watchlistStats] = await pool.execute(
      'SELECT COUNT(*) as filmes_na_lista FROM lista_quero_ver WHERE usuario_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: {
        reviews: (reviewStats as any[])[0],
        watchlist: (watchlistStats as any[])[0]
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};