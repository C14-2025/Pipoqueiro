import { Request, Response } from 'express'
import { supabase } from '../config/database'
import { TMDbService } from '../services/tmdbService'
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger'

export class FavoritesController {
  private tmdbService = new TMDbService()

  // 🔹 GET /api/favorites — Buscar filmes favoritos do usuário
  async getFavorites(req: Request, res: Response) {
    try {
      logInfo('⭐ BUSCANDO FILMES FAVORITOS DO USUÁRIO')

      const userId = (req as any).user.userId

      logDatabase('SELECT * FROM favoritos WHERE usuario_id = ?', [userId])

      const { data: favorites, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      logInfo(`Encontrados ${favorites?.length || 0} filmes favoritos`)

      const favoritesWithDetails = await Promise.all(
        (favorites || []).map(async (favorite) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(favorite.tmdb_id)
            return {
              ...favorite,
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
              backdrop_url: movieDetails.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`
                : null,
            }
          } catch (error) {
            logError(`Erro ao buscar dados do TMDB para ${favorite.tmdb_id}:`, error)
            return {
              ...favorite,
              title: 'Filme não encontrado',
              poster_url: null,
              backdrop_url: null,
            }
          }
        })
      )

      logSuccess(`🎉 Favoritos carregados com ${favoritesWithDetails.length} filmes`)

      res.json({
        success: true,
        message: 'Filmes favoritos obtidos com sucesso',
        data: favoritesWithDetails,
      })
    } catch (error) {
      logError('❌ ERRO AO BUSCAR FAVORITOS:', error)
      res.status(500).json({ success: false, message: 'Erro interno do servidor' })
    }
  }

  // 🔹 POST /api/favorites — Adicionar filme aos favoritos
  async addToFavorites(req: Request, res: Response) {
    try {
      logInfo('💖 ADICIONANDO FILME AOS FAVORITOS')

      const userId = (req as any).user.userId
      const { tmdb_id, comentario_favorito } = req.body

      if (!tmdb_id) {
        logError('TMDB ID não fornecido')
        return res.status(400).json({ success: false, message: 'TMDB ID é obrigatório' })
      }

      // Verifica se já existe
      const { data: existing } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)

      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Filme já está nos seus favoritos',
        })
      }

      // Valida filme no TMDB
      try {
        await this.tmdbService.getMovieDetails(tmdb_id)
        logInfo('Filme validado no TMDB')
      } catch {
        return res.status(404).json({ success: false, message: 'Filme não encontrado' })
      }

      // Insere no Supabase
      const { data, error } = await supabase
        .from('favoritos')
        .insert([{ usuario_id: userId, tmdb_id, comentario_favorito: comentario_favorito || null }])
        .select()

      if (error) throw error

      logSuccess('🎉 FILME ADICIONADO AOS FAVORITOS!', { tmdb_id })

      res.status(201).json({
        success: true,
        message: 'Filme adicionado aos favoritos com sucesso',
        data: data?.[0],
      })
    } catch (error) {
      logError('❌ ERRO AO ADICIONAR AOS FAVORITOS:', error)
      res.status(500).json({ success: false, message: 'Erro interno do servidor' })
    }
  }

  // 🔹 DELETE /api/favorites/:tmdb_id — Remover filme dos favoritos
  async removeFromFavorites(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId
      const { tmdb_id } = req.params

      const { error, count } = await supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)

      if (error) throw error
      if (!count) {
        return res.status(404).json({ success: false, message: 'Filme não encontrado nos favoritos' })
      }

      res.json({ success: true, message: 'Filme removido dos favoritos com sucesso' })
    } catch (error) {
      logError('❌ ERRO AO REMOVER FAVORITO:', error)
      res.status(500).json({ success: false, message: 'Erro interno do servidor' })
    }
  }

  // 🔹 PUT /api/favorites/:tmdb_id — Atualizar comentário
  async updateFavoriteComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId
      const { tmdb_id } = req.params
      const { comentario_favorito } = req.body

      const { error, data } = await supabase
        .from('favoritos')
        .update({ comentario_favorito: comentario_favorito || null })
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: 'Favorito não encontrado' })
      }

      res.json({
        success: true,
        message: 'Comentário do favorito atualizado com sucesso',
      })
    } catch (error) {
      logError('❌ ERRO AO ATUALIZAR COMENTÁRIO DO FAVORITO:', error)
      res.status(500).json({ success: false, message: 'Erro interno do servidor' })
    }
  }

  // 🔹 GET /api/favorites/check/:tmdb_id — Verificar se filme é favorito
  async checkIfFavorite(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId
      const { tmdb_id } = req.params

      const { data, error } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', userId)
        .eq('tmdb_id', tmdb_id)

      if (error) throw error

      const isFavorite = !!(data && data.length > 0)
      res.json({ success: true, data: { is_favorite: isFavorite } })
    } catch (error) {
      logError('❌ ERRO AO VERIFICAR FAVORITO:', error)
      res.status(500).json({ success: false, message: 'Erro interno do servidor' })
    }
  }
}