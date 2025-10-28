import { Request, Response } from 'express';
import pool from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logSuccess, logError, logDatabase } from '../middleware/logger';
import { ListaQueroVerItem, AddListaQueroVerInput } from '../types';

export class WatchlistController {
  private tmdbService = new TMDbService();

  private async getUserWatchlist(userId: number): Promise<ListaQueroVerItem[]> {
    logDatabase('SELECT lista_quero_ver FROM usuarios WHERE id = ?', [userId]);
    const [rows] = await pool.execute(
      'SELECT lista_quero_ver FROM usuarios WHERE id = ?',
      [userId]
    );
    return (rows as any[])[0]?.lista_quero_ver || [];
  }

  private async saveUserWatchlist(userId: number, watchlist: ListaQueroVerItem[]): Promise<void> {
    logDatabase('UPDATE usuarios SET lista_quero_ver = ? WHERE id = ?', [JSON.stringify(watchlist), userId]);
    await pool.execute(
      'UPDATE usuarios SET lista_quero_ver = ? WHERE id = ?',
      [JSON.stringify(watchlist), userId]
    );
  }

  async getWatchlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      let watchlist = await this.getUserWatchlist(userId);

      watchlist = watchlist.sort((a, b) => {
        return new Date(b.data_adicao).getTime() - new Date(a.data_adicao).getTime();
      });

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
            logError(`Erro ao buscar filme ${item.tmdb_id}:`, error);
            return {
              tmdb_id: item.tmdb_id,
              data_adicao: item.data_adicao,
              title: 'Filme não encontrado',
              poster_url: null
            };
          }
        })
      );

      logSuccess(`Lista quero ver carregada: ${watchlistWithDetails.length} filmes`);

      res.json({
        success: true,
        message: 'Lista quero ver obtida com sucesso',
        data: watchlistWithDetails
      });
    } catch (error) {
      logError('Erro ao buscar lista quero ver:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async addToWatchlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tmdb_id }: AddListaQueroVerInput = req.body;

      if (!tmdb_id) {
        return res.status(400).json({
          success: false,
          message: 'TMDB ID é obrigatório'
        });
      }

      const watchlist = await this.getUserWatchlist(userId);

      if (watchlist.some(item => item.tmdb_id === tmdb_id)) {
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
      await this.saveUserWatchlist(userId, watchlist);

      logSuccess(`Filme ${tmdb_id} adicionado à lista quero ver`);

      res.status(201).json({
        success: true,
        message: 'Filme adicionado à lista "Quero Ver" com sucesso',
        data: newItem
      });
    } catch (error) {
      logError('Erro ao adicionar à lista quero ver:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const tmdbId = parseInt(req.params.tmdb_id);

      const watchlist = await this.getUserWatchlist(userId);
      const movieIndex = watchlist.findIndex(item => item.tmdb_id === tmdbId);

      if (movieIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado na sua lista "Quero Ver"'
        });
      }

      watchlist.splice(movieIndex, 1);
      await this.saveUserWatchlist(userId, watchlist);

      logSuccess(`Filme ${tmdbId} removido da lista quero ver`);

      res.json({
        success: true,
        message: 'Filme removido da lista "Quero Ver" com sucesso'
      });
    } catch (error) {
      logError('Erro ao remover da lista quero ver:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
