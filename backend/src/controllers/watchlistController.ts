import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class WatchlistController {
  private tmdbService = new TMDbService();

  // GET /api/watchlist
  async getWatchlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      logDatabase('supabase.from("lista_quero_ver").select()...', [userId]);

      const { data: watchlistItems, error } = await supabase
        .from('lista_quero_ver')
        .select('*')
        .eq('usuario_id', userId)
        .order('prioridade', { ascending: false })
        .order('data_adicao', { ascending: false });

      if (error) throw error;

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

      res.json({
        success: true,
        message: 'Lista quero ver obtida com sucesso',
        data: watchlistWithDetails
      });

    } catch (error) {
      logError('ERRO AO BUSCAR LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/watchlist
  async addToWatchlist(req: Request, res: Response) {
    try {
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

      const newItem = {
        usuario_id: userId,
        tmdb_id,
        prioridade,
        onde_assistir: onde_assistir || null,
        notificar_lancamento
      };

      logDatabase('supabase.from("lista_quero_ver").insert()', [newItem]);

      const { data, error } = await supabase
        .from('lista_quero_ver')
        .insert(newItem)
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          logError('Filme já está na lista quero ver (erro de duplicidade)');
          return res.status(400).json({
            success: false,
            message: 'Filme já está na sua lista "Quero Ver"'
          });
        }
        throw error;
      }

      const itemId = data.id;

      res.status(201).json({
        success: true,
        message: 'Filme adicionado à lista "Quero Ver" com sucesso',
        data: { id: itemId }
      });

    } catch (error: any) {
      logError('ERRO AO ADICIONAR À LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // DELETE /api/watchlist/:tmdb_id
  async removeFromWatchlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;

      logInfo('Removendo filme', { userId, tmdb_id });
      logDatabase('supabase.from("lista_quero_ver").delete()', [userId, tmdb_id]);

      const { data, error } = await supabase
        .from('lista_quero_ver')
        .delete()
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        logError('Filme não encontrado na lista quero ver');
        return res.status(404).json({
          success: false,
          message: 'Filme não encontrado na sua lista "Quero Ver"'
        });
      }

      logSuccess('FILME REMOVIDO DA LISTA QUERO VER!', { tmdb_id });

      res.json({
        success: true,
        message: 'Filme removido da lista "Quero Ver" com sucesso'
      });

    } catch (error) {
      logError('ERRO AO REMOVER DA LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // PUT /api/watchlist/:tmdb_id
  async updateWatchlistItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tmdb_id } = req.params;
      const { prioridade, onde_assistir, notificar_lancamento } = req.body;

      logInfo('Atualizando item', { userId, tmdb_id, prioridade, onde_assistir, notificar_lancamento });

      const updates: any = {};
      if (prioridade !== undefined) updates.prioridade = prioridade;
      if (onde_assistir !== undefined) updates.onde_assistir = onde_assistir;
      if (notificar_lancamento !== undefined) updates.notificar_lancamento = notificar_lancamento;

      logDatabase('supabase.from("lista_quero_ver").update()', updates);

      const { data, error } = await supabase
        .from('lista_quero_ver')
        .update(updates)
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        logError('Item não encontrado na lista quero ver');
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado na sua lista "Quero Ver"'
        });
      }

      res.json({
        success: true,
        message: 'Item da lista "Quero Ver" atualizado com sucesso'
      });

    } catch (error) {
      logError('ERRO AO ATUALIZAR ITEM DA LISTA QUERO VER:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
