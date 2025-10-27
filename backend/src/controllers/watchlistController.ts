import { Request, Response } from 'express';
import pool from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';
import { ListaQueroVerItem, AddListaQueroVerInput } from '../types';

export class WatchlistController {
  private tmdbService = new TMDbService();

  async getWatchlist(req: Request, res: Response) {
    try {
      logInfo('📋 BUSCANDO LISTA QUERO VER DO USUÁRIO');

      const userId = (req as any).user.userId;

      logDatabase('SELECT lista_quero_ver FROM usuarios WHERE id = ?', [userId]);

      const [rows] = await pool.execute(
        'SELECT lista_quero_ver FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      let watchlist: ListaQueroVerItem[] = user?.lista_quero_ver || [];

      watchlist = watchlist.sort((a, b) => {
        return new Date(b.data_adicao).getTime() - new Date(a.data_adicao).getTime();
      });

      logInfo(`Encontrados ${watchlist.length} itens na lista quero ver`);

      const watchlistWithDetails = await Promise.all(
        watchlist.map(async (item) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(item.tmdb_id);
            return {
              tmdb_id: item.tmdb_id,
              data_adicao: item.data_adicao,
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path)
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme ${item.tmdb_id}:`, error);
            return {
              tmdb_id: item.tmdb_id,
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

  async addToWatchlist(req: Request, res: Response) {
    try {
      logInfo('➕ ADICIONANDO FILME À LISTA QUERO VER');

      const userId = (req as any).user.userId;
      const { tmdb_id }: AddListaQueroVerInput = req.body;

      logInfo('Dados recebidos', { userId, tmdb_id });

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({
          success: false,
          message: 'TMDB ID é obrigatório'
        });
      }

      logDatabase('SELECT lista_quero_ver FROM usuarios WHERE id = ?', [userId]);

      const [rows] = await pool.execute(
        'SELECT lista_quero_ver FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      const watchlist: ListaQueroVerItem[] = user?.lista_quero_ver || [];

      if (watchlist.some(item => item.tmdb_id === tmdb_id)) {
        logError('Filme já está na lista quero ver');
        return res.status(400).json({
          success: false,
          message: 'Filme já está na sua lista "Quero Ver"'
        });
      }

      const newItem: ListaQueroVerItem = {
        tmdb_id,
        data_adicao: new Date().toISOString().split('T')[0]
      };

      watchlist.push(newItem);

      logDatabase(
        'UPDATE usuarios SET lista_quero_ver = ? WHERE id = ?',
        [JSON.stringify(watchlist), userId]
      );

      await pool.execute(
        'UPDATE usuarios SET lista_quero_ver = ? WHERE id = ?',
        [JSON.stringify(watchlist), userId]
      );

      logSuccess('🎉 FILME ADICIONADO À LISTA QUERO VER!', { tmdb_id });

      res.status(201).json({
        success: true,
        message: 'Filme adicionado à lista "Quero Ver" com sucesso',
        data: newItem
      });

    } catch (error) {
      logError('❌ ERRO AO ADICIONAR À LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      logInfo('🗑️ REMOVENDO FILME DA LISTA QUERO VER');

      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;
      const tmdbId = parseInt(tmdb_id);

      logInfo('Removendo filme', { userId, tmdb_id: tmdbId });

      logDatabase('SELECT lista_quero_ver FROM usuarios WHERE id = ?', [userId]);

      const [rows] = await pool.execute(
        'SELECT lista_quero_ver FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      const watchlist: ListaQueroVerItem[] = user?.lista_quero_ver || [];

      const filteredWatchlist = watchlist.filter(item => item.tmdb_id !== tmdbId);

      if (filteredWatchlist.length === watchlist.length) {
        logError('Filme não encontrado na lista quero ver');
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado na sua lista "Quero Ver"'
        });
      }

      logDatabase(
        'UPDATE usuarios SET lista_quero_ver = ? WHERE id = ?',
        [JSON.stringify(filteredWatchlist), userId]
      );

      await pool.execute(
        'UPDATE usuarios SET lista_quero_ver = ? WHERE id = ?',
        [JSON.stringify(filteredWatchlist), userId]
      );

      logSuccess('🎉 FILME REMOVIDO DA LISTA QUERO VER!', { tmdb_id: tmdbId });

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

}
