import { Router } from 'express';
import { MovieController } from '../controllers/movieController';

const router = Router();
const movieController = new MovieController();

/**
 * @swagger
 * /api/movies/popular:
 *   get:
 *     summary: Obter filmes populares
 *     tags: [Filmes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de filmes populares com estatísticas da comunidade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Filme'
 */
router.get('/popular', movieController.getPopular.bind(movieController));

/**
 * @swagger
 * /api/movies/ranking:
 *   get:
 *     summary: Ranking dos melhores filmes da comunidade Pipoqueiro
 *     tags: [Filmes]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de filmes
 *       - in: query
 *         name: min_reviews
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Mínimo de reviews necessárias
 *     responses:
 *       200:
 *         description: Ranking dos filmes mais bem avaliados
 */
router.get('/ranking', movieController.getRanking.bind(movieController));

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Buscar filmes por nome
 *     tags: [Filmes]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Resultados da busca
 *       400:
 *         description: Parâmetro de busca não fornecido
 */
router.get('/search', movieController.search.bind(movieController));

/**
 * @swagger
 * /api/movies/{tmdbId}/videos:
 *   get:
 *     summary: Obter vídeos (trailers) do filme
 *     tags: [Filmes]
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme no TMDB
 *     responses:
 *       200:
 *         description: Lista de vídeos do filme
 */
router.get('/:tmdbId/videos', movieController.getVideos.bind(movieController));

/**
 * @swagger
 * /api/movies/{tmdbId}/credits:
 *   get:
 *     summary: Obter elenco e equipe do filme
 *     tags: [Filmes]
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Créditos do filme (cast e crew)
 */
router.get('/:tmdbId/credits', movieController.getCredits.bind(movieController));

/**
 * @swagger
 * /api/movies/{tmdbId}/similar:
 *   get:
 *     summary: Obter filmes similares
 *     tags: [Filmes]
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de filmes similares (filtrados por nota >= 3.0)
 */
router.get('/:tmdbId/similar', movieController.getSimilar.bind(movieController));

/**
 * @swagger
 * /api/movies/{tmdbId}:
 *   get:
 *     summary: Obter detalhes completos do filme
 *     tags: [Filmes]
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme no TMDB
 *     responses:
 *       200:
 *         description: Detalhes completos do filme com reviews da comunidade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Filme'
 *                     - type: object
 *                       properties:
 *                         reviews:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Review'
 *                         stats:
 *                           type: object
 */
router.get('/:tmdbId', movieController.getDetails.bind(movieController));

export default router;
