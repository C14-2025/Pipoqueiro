import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { UsuarioLogin } from '../types';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    logInfo('🆕 INICIANDO REGISTRO DE USUÁRIO');

    // Apenas campos obrigatórios no registro
    const { nome, email, senha } = req.body;

    logInfo('Validando campos obrigatórios', { nome, email, senhaPresente: !!senha });

    if (!nome || !email || !senha) {
      logError('Campos obrigatórios não fornecidos');
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se email já existe
    logInfo('Verificando se email já existe', { email });
    logDatabase('SELECT id FROM usuarios WHERE email = ?', [email]);

    const [existingUser] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    logInfo('Resultado da verificação de email', { emailJaExiste: (existingUser as any[]).length > 0 });

    if ((existingUser as any[]).length > 0) {
      logError('Email já cadastrado no sistema');
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    logInfo('Gerando hash da senha');
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);
    logSuccess('Hash da senha gerado com sucesso');

    // Inserir usuário apenas com campos obrigatórios
    // Campos opcionais ficam NULL para serem preenchidos no perfil depois
    logInfo('Inserindo usuário no banco de dados');
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
    logSuccess('Usuário inserido no banco', { userId });

    // Gerar JWT
    logInfo('Gerando token JWT');
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'default_secret_key'
    );
    logSuccess('Token JWT gerado com sucesso');

    logSuccess('🎉 USUÁRIO REGISTRADO COM SUCESSO!', {
      userId,
      nome,
      email,
      tokenGerado: !!token
    });

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
    logError('❌ ERRO AO REGISTRAR USUÁRIO:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    logInfo('🔐 INICIANDO LOGIN DE USUÁRIO');

    const { email, senha }: UsuarioLogin = req.body;

    logInfo('Validando credenciais', { email, senhaPresente: !!senha });

    if (!email || !senha) {
      logError('Email ou senha não fornecidos');
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    logInfo('Buscando usuário no banco', { email });
    logDatabase('SELECT * FROM usuarios WHERE email = ?', [email]);

    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    const users = rows as any[];
    logInfo('Resultado da busca do usuário', { usuarioEncontrado: users.length > 0 });

    if (users.length === 0) {
      logError('Usuário não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = users[0];
    logInfo('Usuário encontrado', { id: user.id, nome: user.nome, email: user.email });

    // Verificar senha
    logInfo('Verificando senha');
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    logInfo('Resultado da verificação da senha', { senhaValida });

    if (!senhaValida) {
      logError('Senha inválida');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT
    logInfo('Gerando token JWT para login');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key'
    );
    logSuccess('Token JWT gerado com sucesso');

    // Debug: verificar o campo generos_favoritos
    logInfo('Debugando generos_favoritos', {
      valorOriginal: user.generos_favoritos,
      tipo: typeof user.generos_favoritos,
      ehNull: user.generos_favoritos === null,
      ehString: typeof user.generos_favoritos === 'string'
    });

    // Processar generos_favoritos com segurança
    let generosFavoritos = [];
    try {
      if (user.generos_favoritos && typeof user.generos_favoritos === 'string') {
        generosFavoritos = JSON.parse(user.generos_favoritos);
      }
      logSuccess('generos_favoritos processado com sucesso', { resultado: generosFavoritos });
    } catch (parseError: any) {
      logError('Erro ao fazer parse de generos_favoritos', {
        valor: user.generos_favoritos,
        erro: parseError?.message || 'Erro desconhecido'
      });
      generosFavoritos = []; // Fallback para array vazio
    }

    logSuccess('🎉 LOGIN REALIZADO COM SUCESSO!', {
      userId: user.id,
      nome: user.nome,
      email: user.email,
      tokenGerado: !!token
    });

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
    logError('❌ ERRO AO FAZER LOGIN:', error);
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

    // Processar generos_favoritos com segurança
    try {
      if (user.generos_favoritos && typeof user.generos_favoritos === 'string') {
        user.generos_favoritos = JSON.parse(user.generos_favoritos);
      } else {
        user.generos_favoritos = [];
      }
    } catch (parseError) {
      console.error('Erro ao fazer parse de generos_favoritos no perfil:', parseError);
      user.generos_favoritos = []; // Fallback para array vazio
    }

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

export const excluirConta = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Excluir todas as avaliações do usuário primeiro (devido às constraints de FK)
    await pool.execute(
      'DELETE FROM avaliacoes WHERE usuario_id = ?',
      [userId]
    );

    // Excluir da lista "quero ver" se existir
    await pool.execute(
      'DELETE FROM lista_quero_ver WHERE usuario_id = ?',
      [userId]
    );

    // Excluir o usuário
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

    res.json({
      success: true,
      message: 'Conta excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};