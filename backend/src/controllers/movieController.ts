import { Request, Response } from 'express';
import { TMDbService } from '../services/tmdbService';
import { supabase } from '../config/database';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class MovieController {
  private tmdbService = new TMDbService();

  // GET /api/movies/popular
  async getPopular(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      // 1. Busca filmes no TMDB
      const tmdbMovies = await this.tmdbService.getPopularMovies(page);

      // 2. Para cada filme, busca estatísticas no Supabase
      const moviesWithStats = await Promise.all(
        tmdbMovies.map(async (movie: any) => {

          // Usa a função RPC 'get_movie_details_stats' que você criou
          const { data: statsData, error } = await supabase
            .rpc('get_movie_details_stats', { p_tmdb_id: movie.id });

          if (error) {
            logError(`Erro RPC get_movie_details_stats (popular) para tmdb_id ${movie.id}`, error);
            return {
              ...movie,
              poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
              nossa_stats: { total_reviews: 0, nota_media: null, reviews_positivas: 0 }
            };
          }

          const stats = (statsData && statsData.length > 0)
            ? statsData[0]
            : { total_reviews: 0, nota_media: null, reviews_positivas: 0 };

          // 3. Combina os dados do TMDB com os dados do Supabase
          return {
            ...movie,
            poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
            nossa_stats: {
              total_reviews: stats.total_reviews,
              nota_media: stats.nota_media,
              reviews_positivas: stats.reviews_positivas
            }
          };
        })
      );

      res.json({
        success: true,
        message: 'Filmes populares obtidos com sucesso',
        data: moviesWithStats
      });

    } catch (error) {
      console.error('Erro ao obter filmes populares:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filmes populares'
      });
    }
  }

  // GET /api/movies/:tmdbId/videos
  // (Não mexe com o Supabase, apenas TMDB)
  async getVideos(req: Request, res: Response) {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      const videos = await this.tmdbService.getMovieVideos(tmdbId);

      res.json({
        success: true,
        message: 'Vídeos obtidos com sucesso',
        data: videos
      });
    } catch (error) {
      console.error('Erro ao obter vídeos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos do filme'
      });
    }
  }

  // GET /api/movies/:tmdbId/credits
  // (Não mexe com o Supabase, apenas TMDB)
  async getCredits(req: Request, res: Response) {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      const credits = await this.tmdbService.getMovieCredits(tmdbId);

      res.json({
        success: true,
        message: 'Créditos obtidos com sucesso',
        data: credits
      });
    } catch (error) {
      console.error('Erro ao obter créditos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar créditos do filme'
      });
    }
  }

  // GET /api/movies/:tmdbId/similar
  // (Não mexe com o Supabase, apenas TMDB)
  async getSimilar(req: Request, res: Response) {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      const page = parseInt(req.query.page as string) || 1;
      const similar = await this.tmdbService.getSimilarMovies(tmdbId, page);

      const filteredAndSorted = similar
        .filter((movie: any) => movie.vote_average >= 6.0 && movie.vote_count >= 100)
        .sort((a: any, b: any) => {
          const scoreA = a.vote_average * Math.log(a.vote_count + 1);
          const scoreB = b.vote_average * Math.log(b.vote_count + 1);
          return scoreB - scoreA;
        });

      res.json({
        success: true,
        message: 'Filmes similares obtidos com sucesso',
        data: filteredAndSorted
      });
    } catch (error) {
      console.error('Erro ao obter filmes similares:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filmes similares'
      });
    }
  }

  // GET /api/movies/search
  async search(req: Request, res: Response) {
    try {
      const { query, page = 1 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca é obrigatório'
        });
      }

      // 1. Busca filmes no TMDB
      const tmdbMovies = await this.tmdbService.searchMovies(query as string, parseInt(page as string));

      // 2. Para cada filme, busca estatísticas no Supabase
      const moviesWithStats = await Promise.all(
        tmdbMovies.map(async (movie: any) => {

          // Usa a função RPC 'get_movie_search_stats' que você criou
          const { data: statsData, error } = await supabase
            .rpc('get_movie_search_stats', { p_tmdb_id: movie.id });

          if (error) {
            logError(`Erro RPC get_movie_search_stats para tmdb_id ${movie.id}`, error);
            return {
              ...movie,
              poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
              nossa_stats: { total_reviews: 0, nota_media: null }
            };
          }

          const stats = (statsData && statsData.length > 0)
            ? statsData[0]
            : { total_reviews: 0, nota_media: null };

          // 3. Combina os dados
          return {
            ...movie,
            poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
            nossa_stats: stats
          };
        })
      );

      res.json({
        success: true,
        message: 'Busca realizada com sucesso',
        data: moviesWithStats
      });

    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filmes'
      });
    }
  }

  // GET /api/movies/:tmdbId
  async getDetails(req: Request, res: Response) {
    try {
      const { tmdbId } = req.params;

      // 1. Busca detalhes do filme no TMDB
      const movieDetails = await this.tmdbService.getMovieDetails(parseInt(tmdbId));

      // 2. Busca reviews do filme no Supabase (com JOIN em 'usuarios')
      // Isto funciona por causa da Foreign Key `avaliacoes.usuario_id -> usuarios.id`
      const { data: reviews, error: reviewsError } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          usuarios ( nome, foto_perfil )
        `) // Pega 'nome' e 'foto_perfil' da tabela 'usuarios'
        .eq('tmdb_id', tmdbId)
        .order('created_at', { ascending: false }); // Ordena pela coluna 'created_at'

      if (reviewsError) {
        logError(`Erro ao buscar reviews (join) para tmdb_id ${tmdbId}`, reviewsError);
        throw reviewsError;
      }

      // 3. Busca estatísticas do filme no Supabase
      // Usa a função RPC 'get_movie_details_stats'
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_movie_details_stats', { p_tmdb_id: parseInt(tmdbId) });

      if (statsError) {
        logError(`Erro RPC get_movie_details_stats (details) para tmdb_id ${tmdbId}`, statsError);
        throw statsError;
      }

      const stats = (statsData && statsData.length > 0)
        ? statsData[0]
        : { total_reviews: 0, nota_media: null, reviews_positivas: 0, reviews_com_spoiler: 0 };

      // 4. Combina tudo
      res.json({
        success: true,
        message: 'Detalhes do filme obtidos com sucesso',
        data: {
          ...movieDetails,
          poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
          backdrop_url: movieDetails.backdrop_path ?
            `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null,
          reviews: reviews || [],
          stats: stats
        }
      });

    } catch (error) {
      console.error('Erro ao obter detalhes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar detalhes do filme'
      });
    }
  }

  // GET /api/movies/ranking
  async getRanking(req: Request, res: Response) {
    try {
      logInfo('🏆 BUSCANDO RANKING DOS FILMES DA COMUNIDADE PIPOQUEIRO');

      const limit = parseInt(req.query.limit as string) || 50;
      const minReviews = parseInt(req.query.min_reviews as string) || 3;

      logInfo('Parâmetros de ranking', { limit, minReviews });

      // 1. Busca o ranking (lista de tmdb_id e stats) do Supabase
      // Usa a função RPC 'get_movie_ranking'
      logDatabase('Chamando RPC: get_movie_ranking', [minReviews, limit]);
      const { data: rankingMovies, error: rankingError } = await supabase
        .rpc('get_movie_ranking', {
          p_min_reviews: minReviews,
          p_limit: limit
        });

      if (rankingError) {
        logError('Erro RPC get_movie_ranking', rankingError);
        throw rankingError;
      }

      logInfo(`Encontrados ${rankingMovies.length} filmes no ranking`);

      if (rankingMovies.length === 0) {
        return res.json({
          success: true,
          message: 'Ranking obtido com sucesso',
          data: []
        });
      }

      // 2. Para cada filme do ranking, busca os detalhes completos no TMDB
      const rankingWithDetails = await Promise.all(
        rankingMovies.map(async (movieStats: any, index: number) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(movieStats.tmdb_id);

            logInfo(`Processando filme ${index + 1}/${rankingMovies.length}`, {
              tmdb_id: movieStats.tmdb_id,
              title: movieDetails.title,
              nota_media: parseFloat(movieStats.nota_media).toFixed(1)
            });

            // 3. Combina os dados do TMDB com as estatísticas do Supabase
            return {
              rank: index + 1,
              tmdb_id: movieStats.tmdb_id,
              ...movieDetails, // Dados do TMDB
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
              backdrop_url: movieDetails.backdrop_path ?
                `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null,
              nossa_stats: { // Dados do Supabase (da RPC)
                total_avaliacoes: movieStats.total_avaliacoes,
                nota_media: parseFloat(movieStats.nota_media).toFixed(1),
                avaliacoes_positivas: movieStats.avaliacoes_positivas,
                percentual_positivo: Math.round((movieStats.avaliacoes_positivas / movieStats.total_avaliacoes) * 100)
              }
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme ${movieStats.tmdb_id}:`, error);
            // Objeto de fallback caso o TMDB falhe para um ID específico
            return {
              rank: index + 1,
              tmdb_id: movieStats.tmdb_id,
              title: 'Filme não encontrado',
              poster_url: null,
              backdrop_url: null,
              nossa_stats: {
                total_avaliacoes: movieStats.total_avaliacoes,
                nota_media: parseFloat(movieStats.nota_media).toFixed(1),
                avaliacoes_positivas: movieStats.avaliacoes_positivas,
                percentual_positivo: Math.round((movieStats.avaliacoes_positivas / movieStats.total_avaliacoes) * 100)
              }
            };
          }
        })
      );

      logSuccess(`🎉 RANKING CARREGADO COM ${rankingWithDetails.length} FILMES!`);

      res.json({
        success: true,
        message: `Top ${rankingWithDetails.length} filmes da comunidade Pipoqueiro`,
        data: rankingWithDetails,
        meta: {
          total_filmes: rankingWithDetails.length,
          min_reviews_required: minReviews,
          ordenacao: 'nota_media DESC, total_avaliacoes DESC'
        }
      });

    } catch (error) {
      logError('❌ ERRO AO BUSCAR RANKING DA COMUNIDADE:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar ranking dos filmes'
      });
    }
  }
}