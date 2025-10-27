import { Request, Response } from 'express';
import pool from '../config/database';
import { AvaliacaoInput } from '../types';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export const criarReview = async (req: Request, res: Response) => {
  try {
    logInfo('⭐ INICIANDO CRIAÇÃO DE REVIEW');

    const { tmdb_id, nota, titulo_review, comentario, spoiler = false }: AvaliacaoInput = req.body;
    const usuario_id = (req as any).user.userId;

    logInfo('Dados da review recebidos', {
      usuario_id,
      tmdb_id,
      nota,
      titulo_review,
      temComentario: !!comentario,
      spoiler
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

    // Tratar campos opcionais - converter undefined para null
    const tituloReviewValue = titulo_review || null;
    const comentarioValue = comentario || null;
    const spoilerValue = spoiler || false;

    logInfo('Inserindo review no banco de dados');
    logDatabase(
      'INSERT INTO avaliacoes (usuario_id, tmdb_id, nota, titulo_review, comentario, spoiler) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, tmdb_id, nota, tituloReviewValue, comentarioValue, spoilerValue]
    );

    const [result] = await pool.execute(
      `INSERT INTO avaliacoes (usuario_id, tmdb_id, nota, titulo_review, comentario, spoiler)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, tmdb_id, nota, tituloReviewValue, comentarioValue, spoilerValue]
    );

    const reviewId = (result as any).insertId;
    logSuccess('🎉 REVIEW CRIADA COM SUCESSO!', { reviewId, usuario_id, tmdb_id, nota });

    res.status(201).json({
      success: true,
      message: 'Review criada com sucesso',
      data: { id: reviewId }
    });

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      logError('Tentativa de criar review duplicada');
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este filme'
      });
    }

    logError('❌ ERRO AO CRIAR REVIEW:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterReviews = async (req: Request, res: Response) => {
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
    console.error('Erro ao obter reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterMinhasReviews = async (req: Request, res: Response) => {
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
    console.error('Erro ao obter minhas reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const atualizarReview = async (req: Request, res: Response) => {
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

    // Tratar campos opcionais - converter undefined para null
    const notaValue = nota || null;
    const tituloReviewValue = titulo_review || null;
    const comentarioValue = comentario || null;
    const spoilerValue = spoiler !== undefined ? spoiler : null;

    const [result] = await pool.execute(
      `UPDATE avaliacoes
       SET nota = COALESCE(?, nota),
           titulo_review = COALESCE(?, titulo_review),
           comentario = COALESCE(?, comentario),
           spoiler = COALESCE(?, spoiler),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND usuario_id = ?`,
      [notaValue, tituloReviewValue, comentarioValue, spoilerValue, id, usuario_id]
    );

    if ((result as any).affectedRows === 0) {
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
    console.error('Erro ao atualizar review:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const excluirReview = async (req: Request, res: Response) => {
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

    res.json({
      success: true,
      message: 'Review excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir review:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const curtirReview = async (req: Request, res: Response) => {
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
    console.error('Erro ao curtir review:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};