import { Router } from 'express';
import { FavoritesController } from '../controllers/favoritesController';
import { auth } from '../utils/auth';

const router = Router();
const favoritesController = new FavoritesController();

// Obter filmes favoritos do usuário (autenticado)
router.get('/', auth, favoritesController.getFavorites.bind(favoritesController));

// Adicionar filme aos favoritos (autenticado)
router.post('/', auth, favoritesController.addToFavorites.bind(favoritesController));

// Atualizar comentário do favorito (autenticado)
router.put('/:tmdb_id', auth, favoritesController.updateFavoriteComment.bind(favoritesController));

// Remover filme dos favoritos (autenticado)
router.delete('/:tmdb_id', auth, favoritesController.removeFromFavorites.bind(favoritesController));

// Verificar se filme está nos favoritos (autenticado)
router.get('/check/:tmdb_id', auth, favoritesController.checkIfFavorite.bind(favoritesController));

export default router;