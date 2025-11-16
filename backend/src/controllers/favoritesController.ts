// src/controllers/favoritesController.ts

import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class FavoritesController {
  private tmdbService = new TMDbService();

  // GET /api/favorites - Obter lista de favoritos
  async getFavorites(req: Request, res: Response) {
    try {
      logInfo('BUSCANDO FAVORITOS DO USUÁRIO');
      const userId = (req as any).user.userId;

      // 1. Busca o array de IDs da coluna 'favoritos'
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('favoritos')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        logError('Usuário não encontrado ao buscar favoritos');
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      const tmdbIds: number[] = userData.favoritos || [];
      logInfo(`Encontrados ${tmdbIds.length} IDs nos favoritos`);

      if (tmdbIds.length === 0) {
        return res.json({
          success: true,
          message: 'Lista de favoritos obtida com sucesso',
          data: []
        });
      }

      // 2. Para cada ID, busca os detalhes no TMDB
      const favoritesWithDetails = await Promise.all(
        tmdbIds.map(async (id) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(id);
            return {
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path)
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme TMDB ID ${id}:`, error);
            return { tmdb_id: id, title: 'Filme não encontrado', poster_url: null };
          }
        })
      );

      logSuccess(`Favoritos carregados com ${favoritesWithDetails.length} filmes`);
      res.json({
        success: true,
        message: 'Lista de favoritos obtida com sucesso',
        data: favoritesWithDetails
      });

    } catch (error) {
      logError('ERRO AO BUSCAR FAVORITOS:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // POST /api/favorites - Adicionar filme aos favoritos
  async addToFavorites(req: Request, res: Response) {
    try {
      logInfo('ADICIONANDO FILME AOS FAVORITOS');
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.body;

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({ success: false, message: 'TMDB ID é obrigatório' });
      }

      logDatabase('supabase.rpc(add_to_favorites)', [userId, tmdb_id]);

      // Chama a função RPC para adicionar o ID
      const { data, error } = await supabase.rpc('add_to_favorites', {
        p_user_id: userId,
        p_tmdb_id: tmdb_id
      });

      if (error) {
        logError('Erro ao chamar RPC add_to_favorites', error);
        throw error;
      }

      logSuccess('FILME ADICIONADO AOS FAVORITOS', { tmdb_id });
      res.status(201).json({
        success: true,
        message: 'Filme adicionado aos favoritos com sucesso',
        data: { nova_lista: data }
      });

    } catch (error: any) {
      logError('ERRO AO ADICIONAR AOS FAVORITOS:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // DELETE /api/favorites/:tmdb_id - Remover filme dos favoritos
  async removeFromFavorites(req: Request, res: Response) {
    try {
      logInfo('REMOVENDO FILME DOS FAVORITOS');
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({ success: false, message: 'TMDB ID é obrigatório' });
      }

      logDatabase('supabase.rpc(remove_from_favorites)', [userId, tmdb_id]);

      // Chama a função RPC para remover o ID
      const { data, error } = await supabase.rpc('remove_from_favorites', {
        p_user_id: userId,
        p_tmdb_id: parseInt(tmdb_id, 10)
      });

      if (error) {
        logError('Erro ao chamar RPC remove_from_favorites', error);
        throw error;
      }

      logSuccess('FILME REMOVIDO DOS FAVORITOS', { tmdb_id });
      res.json({
        success: true,
        message: 'Filme removido dos favoritos com sucesso',
        data: { nova_lista: data }
      });

    } catch (error) {
      logError('ERRO AO REMOVER DOS FAVORITOS:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}