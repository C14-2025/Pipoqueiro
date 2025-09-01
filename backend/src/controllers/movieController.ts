import { Request, Response } from 'express';
import { TMDbService } from '../services/tmdbService';
import pool from '../config/database';

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
}
