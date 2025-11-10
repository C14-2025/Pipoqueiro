import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { UsuarioInput, UsuarioLogin, AuthPayload } from '../types';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'pipoqueiro_secret_123_fallback';

export class UserController {

  // POST /api/users/register
  async registrarUsuario(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;
      logInfo('Validando campos obrigatórios', { nome, email, senhaPresente: !!senha });

      if (!nome || !email || !senha) {
        logError('Campos obrigatórios não fornecidos');
        return res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios'
        });
      }

      logInfo('Verificando se email já existe', { email });
      logDatabase('supabase.from("usuarios").select("id").eq("email")', [email]);

      const { data: existingUser, error: selectError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email);

      if (selectError) throw selectError;

      logInfo('Resultado da verificação de email', { emailJaExiste: existingUser.length > 0 });

      if (existingUser.length > 0) {
        logError('Email já cadastrado no sistema');
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      logInfo('Gerando hash da senha');
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);
      logSuccess('Hash da senha gerado com sucesso');

      const newUser = {
        nome,
        email,
        senha_hash,
        bio: null,
        foto_perfil: null,
        generos_favoritos: null,
        data_nascimento: null
      };

      logInfo('Inserindo usuário no banco de dados Supabase');
      logDatabase('supabase.from("usuarios").insert()', [nome, email, '***HASH***']);

      const { data: createdUser, error: insertError } = await supabase
        .from('usuarios')
        .insert(newUser)
        .select('id, nome, email, bio, foto_perfil, generos_favoritos')
        .single();

      if (insertError) throw insertError;

      const userId = createdUser.id;
      logSuccess('Usuário inserido no banco', { userId });

      logInfo('Gerando token JWT');
      const token = jwt.sign(
        { userId, email },
        JWT_SECRET
      );
      logSuccess('Token JWT gerado com sucesso');

      logSuccess('USUÁRIO REGISTRADO COM SUCESSO!', { ...createdUser, tokenGerado: !!token });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          token,
          user: createdUser
        }
      });

    } catch (error) {
      logError('ERRO AO REGISTRAR USUÁRIO:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/users/login
  async loginUsuario(req: Request, res: Response) {
    try {

      const { email, senha }: UsuarioLogin = req.body;
      logInfo('Validando credenciais', { email, senhaPresente: !!senha });

      if (!email || !senha) {
        logError('Email ou senha não fornecidos');
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      logInfo('Buscando usuário no banco', { email });
      logDatabase('supabase.from("usuarios").select("*").eq("email").single()', [email]);

      const { data: user, error: findError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (findError || !user) {
        logError('Usuário não encontrado ou erro na busca');
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      logInfo('Usuário encontrado', { id: user.id, nome: user.nome, email: user.email });

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

      logInfo('Gerando token JWT para login');
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET
      );
      logSuccess('Token JWT gerado com sucesso');

      const generosFavoritos = user.generos_favoritos || [];

      logSuccess('LOGIN REALIZADO COM SUCESSO!', {
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
      logError('ERRO AO FAZER LOGIN:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/users/profile
  async obterPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, bio, foto_perfil, generos_favoritos, data_nascimento, created_at')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      user.generos_favoritos = user.generos_favoritos || [];

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

  // PUT /api/users/profile
  async atualizarPerfil(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { nome, bio, foto_perfil, generos_favoritos, data_nascimento } = req.body;

      const updates: any = {};
      if (nome !== undefined) updates.nome = nome;
      if (bio !== undefined) updates.bio = bio;
      if (foto_perfil !== undefined) updates.foto_perfil = foto_perfil;
      if (generos_favoritos !== undefined) updates.generos_favoritos = generos_favoritos;
      if (data_nascimento !== undefined) updates.data_nascimento = data_nascimento;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
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
      logError('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/users/stats
  async obterEstatisticasUsuario(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      logDatabase('supabase.rpc("get_user_stats")', [userId]);

      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: userId });

      if (error) throw error;

      res.json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: data
      });

    } catch (error) {
      logError('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // DELETE /api/users/account
  async excluirConta(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      logDatabase('supabase.from("usuarios").delete()', [userId]);

      const { data, error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
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
      logError('Erro ao excluir conta:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}