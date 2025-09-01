import { Router } from 'express';
import { 
  criarReview, 
  obterReviews, 
  obterMinhasReviews, 
  atualizarReview, 
  excluirReview, 
  curtirReview 
} from '../controllers/reviewController';
import { auth } from '../utils/auth';

const router = Router();

// Criar nova review (autenticado)
router.post('/', auth, criarReview);

// Obter reviews de um filme específico (público)
router.get('/filme/:tmdb_id', obterReviews);

// Obter minhas reviews (autenticado)
router.get('/minhas', auth, obterMinhasReviews);

// Atualizar review (autenticado)
router.put('/:id', auth, atualizarReview);

// Excluir review (autenticado)
router.delete('/:id', auth, excluirReview);

// Curtir review (público)
router.post('/:id/curtir', curtirReview);

export default router;