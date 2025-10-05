import { Request, Response } from 'express';
import pool from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class FavoritesController {
  private tmdbService = new TMDbService();

  // GET /api/favorites - Obter filmes favoritos do usuário
  async getFavorites(req: Request, res: Response) {
    try {
      logInfo('⭐ BUSCANDO FILMES FAVORITOS DO USUÁRIO');

      const userId = (req as any).user.userId;

      logDatabase('SELECT * FROM favoritos WHERE usuario_id = ? ORDER BY created_at DESC', [userId]);

      const [rows] = await pool.execute(
        'SELECT * FROM favoritos WHERE usuario_id = ? ORDER BY created_at DESC',
        [userId]
      );

      const favorites = rows as any[];
      logInfo(`Encontrados ${favorites.length} filmes favoritos`);

      // Para cada favorito, buscar dados do TMDB
      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(favorite.tmdb_id);
            return {
              id: favorite.id,
              tmdb_id: favorite.tmdb_id,
              created_at: favorite.created_at,
              comentario_favorito: favorite.comentario_favorito,
              // Dados do filme do TMDB
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
              backdrop_url: movieDetails.backdrop_path ?
                `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme favorito ${favorite.tmdb_id}:`, error);
            return {
              id: favorite.id,
              tmdb_id: favorite.tmdb_id,
              created_at: favorite.created_at,
              comentario_favorito: favorite.comentario_favorito,
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

  // POST /api/favorites - Adicionar filme aos favoritos
  async addToFavorites(req: Request, res: Response) {
    try {
      logInfo('💖 ADICIONANDO FILME AOS FAVORITOS');

      const userId = (req as any).user.userId;
      const { tmdb_id, comentario_favorito } = req.body;

      logInfo('Dados recebidos', { userId, tmdb_id, comentario_favorito });

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({
          success: false,
          message: 'TMDB ID é obrigatório'
        });
      }

      // Verificar se já existe nos favoritos
      logDatabase('SELECT id FROM favoritos WHERE usuario_id = ? AND tmdb_id = ?', [userId, tmdb_id]);

      const [existing] = await pool.execute(
        'SELECT id FROM favoritos WHERE usuario_id = ? AND tmdb_id = ?',
        [userId, tmdb_id]
      );

      if ((existing as any[]).length > 0) {
        logError('Filme já está nos favoritos');
        return res.status(400).json({
          success: false,
          message: 'Filme já está nos seus favoritos'
        });
      }

      // Verificar se o filme existe no TMDB (opcional, para validação)
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

      // Inserir nos favoritos
      logDatabase(
        'INSERT INTO favoritos (usuario_id, tmdb_id, comentario_favorito) VALUES (?, ?, ?)',
        [userId, tmdb_id, comentario_favorito]
      );

      const [result] = await pool.execute(
        'INSERT INTO favoritos (usuario_id, tmdb_id, comentario_favorito) VALUES (?, ?, ?)',
        [userId, tmdb_id, comentario_favorito || null]
      );

      const favoriteId = (result as any).insertId;
      logSuccess('🎉 FILME ADICIONADO AOS FAVORITOS!', { favoriteId, tmdb_id });

      res.status(201).json({
        success: true,
        message: 'Filme adicionado aos favoritos com sucesso',
        data: { id: favoriteId }
      });

    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        logError('Tentativa de adicionar filme duplicado aos favoritos');
        return res.status(400).json({
          success: false,
          message: 'Filme já está nos seus favoritos'
        });
      }

      logError('❌ ERRO AO ADICIONAR AOS FAVORITOS:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // DELETE /api/favorites/:tmdb_id - Remover filme dos favoritos
  async removeFromFavorites(req: Request, res: Response) {
    try {
      logInfo('💔 REMOVENDO FILME DOS FAVORITOS');

      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;

      logInfo('Removendo filme dos favoritos', { userId, tmdb_id });

      logDatabase('DELETE FROM favoritos WHERE usuario_id = ? AND tmdb_id = ?', [userId, tmdb_id]);

      const [result] = await pool.execute(
        'DELETE FROM favoritos WHERE usuario_id = ? AND tmdb_id = ?',
        [userId, tmdb_id]
      );

      if ((result as any).affectedRows === 0) {
        logError('Filme não encontrado nos favoritos');
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado nos seus favoritos'
        });
      }

      logSuccess('🎉 FILME REMOVIDO DOS FAVORITOS!', { tmdb_id });

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

  // PUT /api/favorites/:tmdb_id - Atualizar comentário do favorito
  async updateFavoriteComment(req: Request, res: Response) {
    try {
      logInfo('✏️ ATUALIZANDO COMENTÁRIO DO FAVORITO');

      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;
      const { comentario_favorito } = req.body;

      logInfo('Atualizando comentário', { userId, tmdb_id, comentario_favorito });

      logDatabase(
        'UPDATE favoritos SET comentario_favorito = ? WHERE usuario_id = ? AND tmdb_id = ?',
        [comentario_favorito, userId, tmdb_id]
      );

      const [result] = await pool.execute(
        'UPDATE favoritos SET comentario_favorito = ? WHERE usuario_id = ? AND tmdb_id = ?',
        [comentario_favorito || null, userId, tmdb_id]
      );

      if ((result as any).affectedRows === 0) {
        logError('Favorito não encontrado');
        return res.status(404).json({
          success: false,
          message: 'Favorito não encontrado'
        });
      }

      logSuccess('🎉 COMENTÁRIO DO FAVORITO ATUALIZADO!', { tmdb_id });

      res.json({
        success: true,
        message: 'Comentário do favorito atualizado com sucesso'
      });

    } catch (error) {
      logError('❌ ERRO AO ATUALIZAR COMENTÁRIO DO FAVORITO:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/favorites/check/:tmdb_id - Verificar se filme está nos favoritos
  async checkIfFavorite(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;

      const [rows] = await pool.execute(
        'SELECT id FROM favoritos WHERE usuario_id = ? AND tmdb_id = ?',
        [userId, tmdb_id]
      );

      const isFavorite = (rows as any[]).length > 0;

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