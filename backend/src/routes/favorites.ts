import { Router } from 'express';
import { FavoritesController } from '../controllers/favoritesController';
import { auth } from '../utils/auth';

const router = Router();
const favoritesController = new FavoritesController();

// GET /api/favorites
router.get('/', auth, favoritesController.getFavorites.bind(favoritesController));

// POST /api/favorites
router.post('/', auth, favoritesController.addToFavorites.bind(favoritesController));

// DELETE /api/favorites/:tmdb_id
router.delete('/:tmdb_id', auth, favoritesController.removeFromFavorites.bind(favoritesController));


export default router;