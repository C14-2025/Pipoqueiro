import { Request, Response } from 'express';
import pool from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';
import { FavoritoItem, AddFavoritoInput } from '../types';

export class FavoritesController {
  private tmdbService = new TMDbService();

  async getFavorites(req: Request, res: Response) {
    try {
      logInfo('⭐ BUSCANDO FILMES FAVORITOS DO USUÁRIO');

      const userId = (req as any).user.userId;

      logDatabase('SELECT favoritos FROM usuarios WHERE id = ?', [userId]);

      const [rows] = await pool.execute(
        'SELECT favoritos FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      const favorites: FavoritoItem[] = user?.favoritos || [];

      logInfo(`Encontrados ${favorites.length} filmes favoritos`);

      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(favorite.tmdb_id);
            return {
              tmdb_id: favorite.tmdb_id,
              data_adicao: favorite.data_adicao,
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
              backdrop_url: movieDetails.backdrop_path ?
                `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme favorito ${favorite.tmdb_id}:`, error);
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

      logSuccess(`🎉 Favoritos carregados com ${favoritesWithDetails.length} filmes`);

      res.json({
        success: true,
        message: 'Filmes favoritos obtidos com sucesso',
        data: favoritesWithDetails
      });

    } catch (error) {
      logError('❌ ERRO AO BUSCAR FAVORITOS:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async addToFavorites(req: Request, res: Response) {
    try {
      logInfo('💖 ADICIONANDO FILME AOS FAVORITOS');

      const userId = (req as any).user.userId;
      const { tmdb_id }: AddFavoritoInput = req.body;

      logInfo('Dados recebidos', { userId, tmdb_id });

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({
          success: false,
          message: 'TMDB ID é obrigatório'
        });
      }

      logDatabase('SELECT favoritos FROM usuarios WHERE id = ?', [userId]);

      const [rows] = await pool.execute(
        'SELECT favoritos FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      const favorites: FavoritoItem[] = user?.favoritos || [];

      if (favorites.some(fav => fav.tmdb_id === tmdb_id)) {
        logError('Filme já está nos favoritos');
        return res.status(400).json({
          success: false,
          message: 'Filme já está nos seus favoritos'
        });
      }

      try {
        await this.tmdbService.getMovieDetails(tmdb_id);
        logInfo('Filme validado no TMDB');
      } catch (error) {
        logError('Filme não encontrado no TMDB');
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

      logDatabase(
        'UPDATE usuarios SET favoritos = ? WHERE id = ?',
        [JSON.stringify(favorites), userId]
      );

      await pool.execute(
        'UPDATE usuarios SET favoritos = ? WHERE id = ?',
        [JSON.stringify(favorites), userId]
      );

      logSuccess('🎉 FILME ADICIONADO AOS FAVORITOS!', { tmdb_id });

      res.status(201).json({
        success: true,
        message: 'Filme adicionado aos favoritos com sucesso',
        data: newFavorite
      });

    } catch (error) {
      logError('❌ ERRO AO ADICIONAR AOS FAVORITOS:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async removeFromFavorites(req: Request, res: Response) {
    try {
      logInfo('💔 REMOVENDO FILME DOS FAVORITOS');

      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;
      const tmdbId = parseInt(tmdb_id);

      logInfo('Removendo filme dos favoritos', { userId, tmdb_id: tmdbId });

      logDatabase('SELECT favoritos FROM usuarios WHERE id = ?', [userId]);

      const [rows] = await pool.execute(
        'SELECT favoritos FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      const favorites: FavoritoItem[] = user?.favoritos || [];

      const filteredFavorites = favorites.filter(fav => fav.tmdb_id !== tmdbId);

      if (filteredFavorites.length === favorites.length) {
        logError('Filme não encontrado nos favoritos');
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado nos seus favoritos'
        });
      }

      logDatabase(
        'UPDATE usuarios SET favoritos = ? WHERE id = ?',
        [JSON.stringify(filteredFavorites), userId]
      );

      await pool.execute(
        'UPDATE usuarios SET favoritos = ? WHERE id = ?',
        [JSON.stringify(filteredFavorites), userId]
      );

      logSuccess('🎉 FILME REMOVIDO DOS FAVORITOS!', { tmdb_id: tmdbId });

      res.json({
        success: true,
        message: 'Filme removido dos favoritos com sucesso'
      });

    } catch (error) {
      logError('❌ ERRO AO REMOVER DOS FAVORITOS:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async checkIfFavorite(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;
      const tmdbId = parseInt(tmdb_id);

      const [rows] = await pool.execute(
        'SELECT favoritos FROM usuarios WHERE id = ?',
        [userId]
      );

      const user = (rows as any[])[0];
      const favorites: FavoritoItem[] = user?.favoritos || [];

      const isFavorite = favorites.some(fav => fav.tmdb_id === tmdbId);

      res.json({
        success: true,
        data: { is_favorite: isFavorite }
      });

    } catch (error) {
      logError('❌ ERRO AO VERIFICAR FAVORITO:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
