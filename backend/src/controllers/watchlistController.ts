import { Request, Response } from 'express';
import pool from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class WatchlistController {
  private tmdbService = new TMDbService();

  // GET /api/watchlist - Obter lista "quero ver" do usuário
  async getWatchlist(req: Request, res: Response) {
    try {
      logInfo('📋 BUSCANDO LISTA QUERO VER DO USUÁRIO');

      const userId = (req as any).user.userId;

      logDatabase('SELECT * FROM lista_quero_ver WHERE usuario_id = ? ORDER BY data_adicao DESC', [userId]);

      const [rows] = await pool.execute(
        `SELECT * FROM lista_quero_ver
         WHERE usuario_id = ?
         ORDER BY
           CASE prioridade
             WHEN 'alta' THEN 1
             WHEN 'media' THEN 2
             WHEN 'baixa' THEN 3
           END,
           data_adicao DESC`,
        [userId]
      );

      const watchlistItems = rows as any[];
      logInfo(`Encontrados ${watchlistItems.length} itens na lista quero ver`);

      // Para cada item, buscar dados do TMDB
      const watchlistWithDetails = await Promise.all(
        watchlistItems.map(async (item) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(item.tmdb_id);
            return {
              id: item.id,
              tmdb_id: item.tmdb_id,
              prioridade: item.prioridade,
              data_adicao: item.data_adicao,
              notificar_lancamento: item.notificar_lancamento,
              onde_assistir: item.onde_assistir,
              // Dados do filme do TMDB
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path)
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme ${item.tmdb_id}:`, error);
            return {
              id: item.id,
              tmdb_id: item.tmdb_id,
              prioridade: item.prioridade,
              data_adicao: item.data_adicao,
              title: 'Filme não encontrado',
              poster_url: null
            };
          }
        })
      );

      logSuccess(`🎉 Lista quero ver carregada com ${watchlistWithDetails.length} filmes`);

      res.json({
        success: true,
        message: 'Lista quero ver obtida com sucesso',
        data: watchlistWithDetails
      });

    } catch (error) {
      logError('❌ ERRO AO BUSCAR LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/watchlist - Adicionar filme à lista "quero ver"
  async addToWatchlist(req: Request, res: Response) {
    try {
      logInfo('➕ ADICIONANDO FILME À LISTA QUERO VER');

      const userId = (req as any).user.userId;
      const { tmdb_id, prioridade = 'media', onde_assistir, notificar_lancamento = true } = req.body;

      logInfo('Dados recebidos', { userId, tmdb_id, prioridade, onde_assistir, notificar_lancamento });

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({
          success: false,
          message: 'TMDB ID é obrigatório'
        });
      }

      // Verificar se já existe na lista
      logDatabase('SELECT id FROM lista_quero_ver WHERE usuario_id = ? AND tmdb_id = ?', [userId, tmdb_id]);

      const [existing] = await pool.execute(
        'SELECT id FROM lista_quero_ver WHERE usuario_id = ? AND tmdb_id = ?',
        [userId, tmdb_id]
      );

      if ((existing as any[]).length > 0) {
        logError('Filme já está na lista quero ver');
        return res.status(400).json({
          success: false,
          message: 'Filme já está na sua lista "Quero Ver"'
        });
      }

      // Inserir na lista
      logDatabase(
        'INSERT INTO lista_quero_ver (usuario_id, tmdb_id, prioridade, onde_assistir, notificar_lancamento) VALUES (?, ?, ?, ?, ?)',
        [userId, tmdb_id, prioridade, onde_assistir, notificar_lancamento]
      );

      const [result] = await pool.execute(
        `INSERT INTO lista_quero_ver
         (usuario_id, tmdb_id, prioridade, onde_assistir, notificar_lancamento)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, tmdb_id, prioridade, onde_assistir || null, notificar_lancamento]
      );

      const itemId = (result as any).insertId;
      logSuccess('🎉 FILME ADICIONADO À LISTA QUERO VER!', { itemId, tmdb_id, prioridade });

      res.status(201).json({
        success: true,
        message: 'Filme adicionado à lista "Quero Ver" com sucesso',
        data: { id: itemId }
      });

    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        logError('Tentativa de adicionar filme duplicado');
        return res.status(400).json({
          success: false,
          message: 'Filme já está na sua lista "Quero Ver"'
        });
      }

      logError('❌ ERRO AO ADICIONAR À LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // DELETE /api/watchlist/:tmdb_id - Remover filme da lista "quero ver"
  async removeFromWatchlist(req: Request, res: Response) {
    try {
      logInfo('🗑️ REMOVENDO FILME DA LISTA QUERO VER');

      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;

      logInfo('Removendo filme', { userId, tmdb_id });

      logDatabase('DELETE FROM lista_quero_ver WHERE usuario_id = ? AND tmdb_id = ?', [userId, tmdb_id]);

      const [result] = await pool.execute(
        'DELETE FROM lista_quero_ver WHERE usuario_id = ? AND tmdb_id = ?',
        [userId, tmdb_id]
      );

      if ((result as any).affectedRows === 0) {
        logError('Filme não encontrado na lista quero ver');
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado na sua lista "Quero Ver"'
        });
      }

      logSuccess('🎉 FILME REMOVIDO DA LISTA QUERO VER!', { tmdb_id });

      res.json({
        success: true,
        message: 'Filme removido da lista "Quero Ver" com sucesso'
      });

    } catch (error) {
      logError('❌ ERRO AO REMOVER DA LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // PUT /api/watchlist/:tmdb_id - Atualizar prioridade/dados de um item
  async updateWatchlistItem(req: Request, res: Response) {
    try {
      logInfo('✏️ ATUALIZANDO ITEM DA LISTA QUERO VER');

      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;
      const { prioridade, onde_assistir, notificar_lancamento } = req.body;

      logInfo('Atualizando item', { userId, tmdb_id, prioridade, onde_assistir, notificar_lancamento });

      logDatabase(
        'UPDATE lista_quero_ver SET prioridade = ?, onde_assistir = ?, notificar_lancamento = ? WHERE usuario_id = ? AND tmdb_id = ?',
        [prioridade, onde_assistir, notificar_lancamento, userId, tmdb_id]
      );

      const [result] = await pool.execute(
        `UPDATE lista_quero_ver
         SET prioridade = COALESCE(?, prioridade),
             onde_assistir = COALESCE(?, onde_assistir),
             notificar_lancamento = COALESCE(?, notificar_lancamento)
         WHERE usuario_id = ? AND tmdb_id = ?`,
        [prioridade || null, onde_assistir || null, notificar_lancamento, userId, tmdb_id]
      );

      if ((result as any).affectedRows === 0) {
        logError('Item não encontrado na lista quero ver');
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado na sua lista "Quero Ver"'
        });
      }

      logSuccess('🎉 ITEM DA LISTA QUERO VER ATUALIZADO!', { tmdb_id });

      res.json({
        success: true,
        message: 'Item da lista "Quero Ver" atualizado com sucesso'
      });

    } catch (error) {
      logError('❌ ERRO AO ATUALIZAR ITEM DA LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}