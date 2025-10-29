import { Request, Response } from 'express';
import pool from '../config/database';
import { AvaliacaoInput } from '../types';
import { logSuccess, logError, logDatabase } from '../middleware/logger';

export class ReviewController {
  private validateRating(nota: number): boolean {
    return nota >= 1 && nota <= 5;
  }

  async criarReview(req: Request, res: Response) {
    try {
      const { tmdb_id, nota, titulo_review, comentario, spoiler = false }: AvaliacaoInput = req.body;
      const usuario_id = (req as any).user.userId;

      if (!tmdb_id || !nota) {
        return res.status(400).json({
          success: false,
          message: 'TMDB ID e nota são obrigatórios'
        });
      }

      if (!this.validateRating(nota)) {
        return res.status(400).json({
          success: false,
          message: 'Nota deve estar entre 1 e 5'
        });
      }

      logDatabase(
        'INSERT INTO avaliacoes (usuario_id, tmdb_id, nota, titulo_review, comentario, spoiler) VALUES (?, ?, ?, ?, ?, ?)',
        [usuario_id, tmdb_id, nota, titulo_review || null, comentario || null, spoiler]
      );

      const [result] = await pool.execute(
        `INSERT INTO avaliacoes (usuario_id, tmdb_id, nota, titulo_review, comentario, spoiler)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [usuario_id, tmdb_id, nota, titulo_review || null, comentario || null, spoiler]
      );

      const reviewId = (result as any).insertId;
      logSuccess(`Review criada: ID ${reviewId} para filme ${tmdb_id}`);

      res.status(201).json({
        success: true,
        message: 'Review criada com sucesso',
        data: { id: reviewId }
      });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Você já avaliou este filme'
        });
      }

      logError('Erro ao criar review:', error);
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

      let query = `
        SELECT a.*, u.nome, u.foto_perfil
        FROM avaliacoes a
        JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.tmdb_id = ?
      `;

      const params: any[] = [tmdb_id];

      if (spoiler === 'false') {
        query += ' AND a.spoiler = FALSE';
      }

      query += ' ORDER BY a.created_at DESC';

      const [rows] = await pool.execute(query, params);

      res.json({
        success: true,
        message: 'Reviews obtidas com sucesso',
        data: rows
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

      const [rows] = await pool.execute(
        `SELECT * FROM avaliacoes WHERE usuario_id = ? ORDER BY created_at DESC`,
        [usuario_id]
      );

      res.json({
        success: true,
        message: 'Reviews obtidas com sucesso',
        data: rows
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

      if (nota && !this.validateRating(nota)) {
        return res.status(400).json({
          success: false,
          message: 'Nota deve estar entre 1 e 5'
        });
      }

      const [result] = await pool.execute(
        `UPDATE avaliacoes
         SET nota = COALESCE(?, nota),
             titulo_review = COALESCE(?, titulo_review),
             comentario = COALESCE(?, comentario),
             spoiler = COALESCE(?, spoiler),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND usuario_id = ?`,
        [nota || null, titulo_review || null, comentario || null, spoiler !== undefined ? spoiler : null, id, usuario_id]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review não encontrada ou você não tem permissão'
        });
      }

      logSuccess(`Review ${id} atualizada`);

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

      const [result] = await pool.execute(
        'DELETE FROM avaliacoes WHERE id = ? AND usuario_id = ?',
        [id, usuario_id]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review não encontrada ou você não tem permissão'
        });
      }

      logSuccess(`Review ${id} excluída`);

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

  async curtirReview(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'UPDATE avaliacoes SET curtidas = curtidas + 1 WHERE id = ?',
        [id]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Review curtida com sucesso'
      });
    } catch (error) {
      logError('Erro ao curtir review:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
