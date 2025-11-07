import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { TMDbService } from '../services/tmdbService';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class WatchlistController {
  private tmdbService = new TMDbService();

  // GET /api/watchlist - Obter lista "quero ver" do usuário
  async getWatchlist(req: Request, res: Response) {
    try {
      logInfo('📋 BUSCANDO LISTA QUERO VER DO USUÁRIO');

      const userId = (req as any).user.userId;

      logDatabase('supabase.from("lista_quero_ver").select()...', [userId]);

      // A query do Supabase para replicar a ordenação:
      // 1. 'prioridade' DESC (coloca 'alta' primeiro, depois 'media', depois 'baixa')
      // 2. 'data_adicao' DESC (desempate pela data)
      const { data: watchlistItems, error } = await supabase
        .from('lista_quero_ver')
        .select('*')
        .eq('usuario_id', userId)
        .order('prioridade', { ascending: false }) // 'alta', 'media', 'baixa'
        .order('data_adicao', { ascending: false }); // Data mais recente

      if (error) throw error;

      logInfo(`Encontrados ${watchlistItems.length} itens na lista quero ver`);

      // Para cada item, buscar dados do TMDB (esta lógica permanece a mesma)
      const watchlistWithDetails = await Promise.all(
        watchlistItems.map(async (item) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(item.tmdb_id);
            return {
              // Dados do nosso DB
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

      // Não precisamos mais verificar antes.
      // A constraint UNIQUE (unique_user_movie_watchlist) no Supabase
      // já nos protege. Vamos inserir e tratar o erro se ele ocorrer.

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
        // Código 23505 = Violação de constraint de unicidade
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
      logSuccess('🎉 FILME ADICIONADO À LISTA QUERO VER!', { itemId, tmdb_id, prioridade });

      res.status(201).json({
        success: true,
        message: 'Filme adicionado à lista "Quero Ver" com sucesso',
        data: { id: itemId }
      });

    } catch (error: any) {
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
      logDatabase('supabase.from("lista_quero_ver").delete()', [userId, tmdb_id]);

      const { data, error } = await supabase
        .from('lista_quero_ver')
        .delete()
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)
        .select('id'); // Pede para retornar o que foi deletado

      if (error) throw error;

      // Se 'data' for nulo ou vazio, nada foi deletado (não encontrou)
      if (!data || data.length === 0) {
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

      // Cria um objeto dinâmico apenas com os campos que foram enviados
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
        .select('id'); // Pede para retornar o que foi atualizado

      if (error) throw error;

      // Se 'data' for nulo ou vazio, nada foi atualizado (não encontrou)
      if (!data || data.length === 0) {
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
