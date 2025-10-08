import { Router } from 'express';
import { MovieController } from '../controllers/movieController';

const router = Router();
const movieController = new MovieController();

// Filmes populares
router.get('/popular', movieController.getPopular.bind(movieController));

// Ranking da comunidade Pipoqueiro
router.get('/ranking', movieController.getRanking.bind(movieController));

// Buscar filmes
router.get('/search', movieController.search.bind(movieController));

// Vídeos do filme
router.get('/:tmdbId/videos', movieController.getVideos.bind(movieController));

// Créditos do filme
router.get('/:tmdbId/credits', movieController.getCredits.bind(movieController));

// Provedores de streaming
router.get('/:tmdbId/watch-providers', movieController.getWatchProviders.bind(movieController));

// Filmes similares
router.get('/:tmdbId/similar', movieController.getSimilar.bind(movieController));

// Detalhes do filme (IMPORTANTE: manter por último)
router.get('/:tmdbId', movieController.getDetails.bind(movieController));

export default router;
