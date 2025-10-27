import { Request, Response } from 'express';
import pool from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';
import { FavoritoItem, AddFavoritoInput } from '../types';

export class FavoritesController {
  private tmdbService = new TMDbService();

  private async getUserFavorites(userId: number): Promise<FavoritoItem[]> {
    logDatabase('SELECT favoritos FROM usuarios WHERE id = ?', [userId]);
    const [rows] = await pool.execute(
      'SELECT favoritos FROM usuarios WHERE id = ?',
      [userId]
    );
    return (rows as any[])[0]?.favoritos || [];
  }

  private async saveUserFavorites(userId: number, favorites: FavoritoItem[]): Promise<void> {
    logDatabase('UPDATE usuarios SET favoritos = ? WHERE id = ?', [JSON.stringify(favorites), userId]);
    await pool.execute(
      'UPDATE usuarios SET favoritos = ? WHERE id = ?',
      [JSON.stringify(favorites), userId]
    );
  }

  async getFavorites(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const favorites = await this.getUserFavorites(userId);

      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(favorite.tmdb_id);
            return {
              tmdb_id: favorite.tmdb_id,
              data_adicao: favorite.data_adicao,
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
              backdrop_url: this.tmdbService.formatBackdropURL(movieDetails.backdrop_path)
            };
          } catch (error) {
            logError(`Erro ao buscar filme ${favorite.tmdb_id}:`, error);
            return {
              tmdb_id: favorite.tmdb_id,
              data_adicao: favorite.data_adicao,
              title: 'Filme não encontrado',
              poster_url: null,
              backdrop_url: null
            };
          }
        })
      );

      logSuccess(`Favoritos carregados: ${favoritesWithDetails.length} filmes`);

      res.json({
        success: true,
        message: 'Filmes favoritos obtidos com sucesso',
        data: favoritesWithDetails
      });
    } catch (error) {
      logError('Erro ao buscar favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async addToFavorites(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tmdb_id }: AddFavoritoInput = req.body;

      if (!tmdb_id) {
        return res.status(400).json({
          success: false,
          message: 'TMDB ID é obrigatório'
        });
      }

      const favorites = await this.getUserFavorites(userId);

      if (favorites.some(fav => fav.tmdb_id === tmdb_id)) {
        return res.status(400).json({
          success: false,
          message: 'Filme já está nos seus favoritos'
        });
      }

      try {
        await this.tmdbService.getMovieDetails(tmdb_id);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado'
        });
      }

      const newFavorite: FavoritoItem = {
        tmdb_id,
        data_adicao: new Date().toISOString().split('T')[0]
      };

      favorites.push(newFavorite);
      await this.saveUserFavorites(userId, favorites);

      logSuccess(`Filme ${tmdb_id} adicionado aos favoritos`);

      res.status(201).json({
        success: true,
        message: 'Filme adicionado aos favoritos com sucesso',
        data: newFavorite
      });
    } catch (error) {
      logError('Erro ao adicionar aos favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async removeFromFavorites(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const tmdbId = parseInt(req.params.tmdb_id);

      const favorites = await this.getUserFavorites(userId);
      const movieIndex = favorites.findIndex(fav => fav.tmdb_id === tmdbId);

      if (movieIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado nos seus favoritos'
        });
      }

      favorites.splice(movieIndex, 1);
      await this.saveUserFavorites(userId, favorites);

      logSuccess(`Filme ${tmdbId} removido dos favoritos`);

      res.json({
        success: true,
        message: 'Filme removido dos favoritos com sucesso'
      });
    } catch (error) {
      logError('Erro ao remover dos favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async checkIfFavorite(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const tmdbId = parseInt(req.params.tmdb_id);

      const favorites = await this.getUserFavorites(userId);
      const isFavorite = favorites.some(fav => fav.tmdb_id === tmdbId);

      res.json({
        success: true,
        data: { is_favorite: isFavorite }
      });
    } catch (error) {
      logError('Erro ao verificar favorito:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
