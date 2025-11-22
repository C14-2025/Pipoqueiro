import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { AvaliacaoInput } from '../types';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class ReviewController {

  async criarReview(req: Request, res: Response) {
    try {
      logInfo('INICIANDO CRIAÇÃO DE REVIEW');

      const { tmdb_id, nota, titulo_review, comentario, spoiler = false }: AvaliacaoInput = req.body;
      const usuario_id = (req as any).user.userId;

      logInfo('Dados da review recebidos', {
        usuario_id, tmdb_id, nota, titulo_review, temComentario: !!comentario, spoiler
      });

      if (!tmdb_id || !nota) {
        logError('Campos obrigatórios não fornecidos para review');
        return res.status(400).json({
          success: false,
          message: 'TMDB ID e nota são obrigatórios'
        });
      }

      if (nota < 1 || nota > 5) {
        logError('Nota fora do intervalo válido', { nota });
        return res.status(400).json({
          success: false,
          message: 'Nota deve estar entre 1 e 5'
        });
      }

      const reviewData = {
        usuario_id,
        tmdb_id,
        nota,
        titulo_review: titulo_review || null,
        comentario: comentario || null,
        spoiler: spoiler || false,
      };

      logInfo('Inserindo review no banco de dados Supabase');
      logDatabase('supabase.from("avaliacoes").insert()', [reviewData]); // Corrigido para array

      const { data, error } = await supabase
        .from('avaliacoes')
        .insert(reviewData)
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          logError('Tentativa de criar review duplicada');
          return res.status(400).json({
            success: false,
            message: 'Você já avaliou este filme'
          });
        }
        logError('ERRO AO CRIAR REVIEW NO SUPABASE:', error);
        throw error;
      }

      const reviewId = data.id;
      logSuccess('REVIEW CRIADA COM SUCESSO!', { reviewId, usuario_id, tmdb_id, nota });

      res.status(201).json({
        success: true,
        message: 'Review criada com sucesso',
        data: { id: reviewId }
      });

    } catch (error: any) {
      logError('ERRO AO CRIAR REVIEW:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async obterReviews(req: Request, res: Response) {
    try {
      const { tmdb_id } = req.params;
      const { spoiler = 'false' } = req.query;

      logDatabase('supabase.from("avaliacoes").select(JOIN ...)', [tmdb_id, spoiler]); // Corrigido

      let query = supabase
        .from('avaliacoes')
        .select(`
          *,
          usuarios ( nome, foto_perfil )
        `)
        .eq('tmdb_id', tmdb_id);

      if (spoiler === 'false') {
        query = query.eq('spoiler', false);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      res.json({
        success: true,
        message: 'Reviews obtidas com sucesso',
        data: data
      });

    } catch (error) {
      logError('Erro ao obter reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async obterMinhasReviews(req: Request, res: Response) {
    try {
      const usuario_id = (req as any).user.userId;

      logDatabase('supabase.from("avaliacoes").select(my_reviews)', [usuario_id]); // Corrigido

      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('usuario_id', usuario_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        message: 'Reviews obtidas com sucesso',
        data: data
      });

    } catch (error) {
      logError('Erro ao obter minhas reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async atualizarReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nota, titulo_review, comentario, spoiler } = req.body;
      const usuario_id = (req as any).user.userId;

      if (nota && (nota < 1 || nota > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Nota deve estar entre 1 e 5'
        });
      }

      const updates: any = {};
      if (nota !== undefined) updates.nota = nota;
      if (titulo_review !== undefined) updates.titulo_review = titulo_review;
      if (comentario !== undefined) updates.comentario = comentario;
      if (spoiler !== undefined) updates.spoiler = spoiler;
      updates.updated_at = new Date().toISOString();

      logDatabase('supabase.from("avaliacoes").update()', [id, usuario_id, updates]); // Corrigido

      const { data, error } = await supabase
        .from('avaliacoes')
        .update(updates)
        .eq('id', id)
        .eq('usuario_id', usuario_id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review não encontrada ou você não tem permissão'
        });
      }

      res.json({
        success: true,
        message: 'Review atualizada com sucesso'
      });

    } catch (error) {
      logError('Erro ao atualizar review:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async excluirReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario_id = (req as any).user.userId;

      logDatabase('supabase.from("avaliacoes").delete()', [id, usuario_id]); // Corrigido

      const { data, error } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', id)
        .eq('usuario_id', usuario_id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review não encontrada ou você não tem permissão'
        });
      }

      res.json({
        success: true,
        message: 'Review excluída com sucesso'
      });

    } catch (error) {
      logError('Erro ao excluir review:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
} // Fim da classe