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

// Detalhes do filme
router.get('/:tmdbId', movieController.getDetails.bind(movieController));

export default router;
