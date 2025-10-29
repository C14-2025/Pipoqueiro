import { Request, Response } from 'express';
import { TMDbService } from '../services/tmdbService';
import pool from '../config/database';
import { logInfo, logSuccess, logError, logDatabase } from '../middleware/logger';

export class MovieController {
  private tmdbService = new TMDbService();

  // GET /api/movies/popular
  async getPopular(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const tmdbMovies = await this.tmdbService.getPopularMovies(page);
      
      // Para cada filme, buscar nossas estatísticas
      const moviesWithStats = await Promise.all(
        tmdbMovies.map(async (movie: any) => {
          const [stats] = await pool.execute(
            `SELECT 
              COUNT(*) as total_reviews,
              AVG(nota) as nota_media,
              COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas
             FROM avaliacoes WHERE tmdb_id = ?`,
            [movie.id]
          );

          return {
            ...movie,
            poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
            nossa_stats: (stats as any[])[0]
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
  async getSimilar(req: Request, res: Response) {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      const page = parseInt(req.query.page as string) || 1;
      const similar = await this.tmdbService.getSimilarMovies(tmdbId, page);

      // Filtra e ordena por melhor avaliação e popularidade
      const filteredAndSorted = similar
        .filter((movie: any) => movie.vote_average >= 6.0 && movie.vote_count >= 100)
        .sort((a: any, b: any) => {
          // Ordena por vote_average * popularidade
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

      const tmdbMovies = await this.tmdbService.searchMovies(query as string, parseInt(page as string));
      
      const moviesWithStats = await Promise.all(
        tmdbMovies.map(async (movie: any) => {
          const [stats] = await pool.execute(
            `SELECT 
              COUNT(*) as total_reviews,
              AVG(nota) as nota_media
             FROM avaliacoes WHERE tmdb_id = ?`,
            [movie.id]
          );

          return {
            ...movie,
            poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
            nossa_stats: (stats as any[])[0]
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
      
      const movieDetails = await this.tmdbService.getMovieDetails(parseInt(tmdbId));
      
      // Buscar reviews do filme
      const [reviews] = await pool.execute(
        `SELECT a.*, u.nome, u.foto_perfil 
         FROM avaliacoes a 
         JOIN usuarios u ON a.usuario_id = u.id 
         WHERE a.tmdb_id = ? 
         ORDER BY a.created_at DESC`,
        [tmdbId]
      );

      // Buscar estatísticas
      const [stats] = await pool.execute(
        `SELECT 
          COUNT(*) as total_reviews,
          AVG(nota) as nota_media,
          COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas,
          COUNT(CASE WHEN spoiler = TRUE THEN 1 END) as reviews_com_spoiler
         FROM avaliacoes WHERE tmdb_id = ?`,
        [tmdbId]
      );

      res.json({
        success: true,
        message: 'Detalhes do filme obtidos com sucesso',
        data: {
          ...movieDetails,
          poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
          backdrop_url: movieDetails.backdrop_path ? 
            `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null,
          reviews: reviews,
          stats: (stats as any[])[0]
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

  // GET /api/movies/ranking - Ranking dos filmes melhor avaliados pela comunidade
  async getRanking(req: Request, res: Response) {
    try {
      logInfo('🏆 BUSCANDO RANKING DOS FILMES DA COMUNIDADE PIPOQUEIRO');

      const limit = parseInt(req.query.limit as string) || 50;
      const minReviews = parseInt(req.query.min_reviews as string) || 3;

      logInfo('Parâmetros de ranking', { limit, minReviews });

      // Buscar filmes com mais avaliações e melhores notas da nossa comunidade
      logDatabase(`
        SELECT
          tmdb_id,
          COUNT(*) as total_avaliacoes,
          AVG(nota) as nota_media,
          COUNT(CASE WHEN nota >= 4 THEN 1 END) as avaliacoes_positivas
        FROM avaliacoes
        GROUP BY tmdb_id
        HAVING COUNT(*) >= ?
        ORDER BY nota_media DESC, total_avaliacoes DESC
        LIMIT ${limit}
      `, [minReviews]);

      const [rows] = await pool.execute(`
        SELECT
          tmdb_id,
          COUNT(*) as total_avaliacoes,
          AVG(nota) as nota_media,
          COUNT(CASE WHEN nota >= 4 THEN 1 END) as avaliacoes_positivas
        FROM avaliacoes
        GROUP BY tmdb_id
        HAVING COUNT(*) >= ?
        ORDER BY nota_media DESC, total_avaliacoes DESC
        LIMIT ${limit}
      `, [minReviews]);

      const rankingMovies = rows as any[];
      logInfo(`Encontrados ${rankingMovies.length} filmes no ranking`);

      if (rankingMovies.length === 0) {
        logInfo('Nenhum filme encontrado com avaliações suficientes');
        return res.json({
          success: true,
          message: 'Ranking obtido com sucesso',
          data: []
        });
      }

      // Para cada filme, buscar dados completos do TMDB
      const rankingWithDetails = await Promise.all(
        rankingMovies.map(async (movieStats, index) => {
          try {
            const movieDetails = await this.tmdbService.getMovieDetails(movieStats.tmdb_id);

            logInfo(`Processando filme ${index + 1}/${rankingMovies.length}`, {
              tmdb_id: movieStats.tmdb_id,
              title: movieDetails.title,
              nota_media: parseFloat(movieStats.nota_media).toFixed(1)
            });

            return {
              rank: index + 1,
              tmdb_id: movieStats.tmdb_id,
              // Dados do TMDB
              ...movieDetails,
              poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
              backdrop_url: movieDetails.backdrop_path ?
                `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null,
              // Estatísticas da nossa comunidade
              nossa_stats: {
                total_avaliacoes: movieStats.total_avaliacoes,
                nota_media: parseFloat(movieStats.nota_media).toFixed(1),
                avaliacoes_positivas: movieStats.avaliacoes_positivas,
                percentual_positivo: Math.round((movieStats.avaliacoes_positivas / movieStats.total_avaliacoes) * 100)
              }
            };
          } catch (error) {
            logError(`Erro ao buscar dados do filme ${movieStats.tmdb_id}:`, error);
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
