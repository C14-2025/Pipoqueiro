import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { auth } from '../utils/auth';

const router = Router();
const reviewController = new ReviewController();

router.post('/', auth, reviewController.criarReview.bind(reviewController));
router.get('/filme/:tmdb_id', reviewController.obterReviews.bind(reviewController));
router.get('/minhas', auth, reviewController.obterMinhasReviews.bind(reviewController));
router.put('/:id', auth, reviewController.atualizarReview.bind(reviewController));
router.delete('/:id', auth, reviewController.excluirReview.bind(reviewController));
router.post('/:id/curtir', reviewController.curtirReview.bind(reviewController));

export default router;
