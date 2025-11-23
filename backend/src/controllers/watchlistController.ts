// src/controllers/watchlistController.ts

import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class WatchlistController {
  private tmdbService = new TMDbService();

  async getWatchlist(req: Request, res: Response) {
    try {
      logInfo('BUSCANDO LISTA QUERO VER DO USUÁRIO');
      const userId = (req as any).user.userId;

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('lista_quero_ver')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        logError('Usuário não encontrado ao buscar watchlist');
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      const tmdbIds: number[] = userData.lista_quero_ver || [];
      logInfo(`Encontrados ${tmdbIds.length} IDs na lista quero ver`);

      if (tmdbIds.length === 0) {
        return res.json({
          success: true,
          message: 'Lista quero ver obtida com sucesso',
          data: []
        });
      }

      const watchlistWithDetails = await Promise.all(
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

      logSuccess(`Lista quero ver carregada com ${watchlistWithDetails.length} filmes`);
      res.json({
        success: true,
        message: 'Lista quero ver obtida com sucesso',
        data: watchlistWithDetails
      });

    } catch (error) {
      logError('ERRO AO BUSCAR LISTA QUERO VER:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  async addToWatchlist(req: Request, res: Response) {
    try {
      logInfo('ADICIONANDO FILME À LISTA QUERO VER');
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.body;

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({ success: false, message: 'TMDB ID é obrigatório' });
      }

      logDatabase('supabase.rpc(add_to_watchlist)', [userId, tmdb_id]);

      const { data, error } = await supabase.rpc('add_to_watchlist', {
        p_user_id: userId,
        p_tmdb_id: tmdb_id
      });

      if (error) {
        logError('Erro ao chamar RPC add_to_watchlist', error);
        throw error;
      }

      logSuccess('FILME ADICIONADO À LISTA QUERO VER', { tmdb_id });
      res.status(201).json({
        success: true,
        message: 'Filme adicionado à lista "Quero Ver" com sucesso',
        data: { nova_lista: data }
      });

    } catch (error: any) {
      logError('ERRO AO ADICIONAR À LISTA QUERO VER:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      logInfo('REMOVENDO FILME DA LISTA QUERO VER');
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;

      if (!tmdb_id) {
        logError('TMDB ID não fornecido');
        return res.status(400).json({ success: false, message: 'TMDB ID é obrigatório' });
      }

      logDatabase('supabase.rpc(remove_from_watchlist)', [userId, tmdb_id]);

      const { data, error } = await supabase.rpc('remove_from_watchlist', {
        p_user_id: userId,
        p_tmdb_id: parseInt(tmdb_id, 10)
      });

      if (error) {
        logError('Erro ao chamar RPC remove_from_watchlist', error);
        throw error;
      }

      logSuccess('FILME REMOVIDO DA LISTA QUERO VER', { tmdb_id });
      res.json({
        success: true,
        message: 'Filme removido da lista "Quero Ver" com sucesso',
        data: { nova_lista: data }
      });

    } catch (error) {
      logError('ERRO AO REMOVER DA LISTA QUERO VER:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}