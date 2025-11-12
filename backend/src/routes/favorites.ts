import { Router } from 'express';
import { FavoritesController } from '../controllers/favoritesController';
import { auth } from '../utils/auth';

const router = Router();
const favoritesController = new FavoritesController();

// Obter filmes favoritos do usuário (autenticado)
router.get('/', auth, favoritesController.getFavorites.bind(favoritesController));

// Adicionar filme aos favoritos (autenticado)
router.post('/', auth, favoritesController.addToFavorites.bind(favoritesController));

// Remover filme dos favoritos (autenticado)
router.delete('/:tmdb_id', auth, favoritesController.removeFromFavorites.bind(favoritesController));


export default router;