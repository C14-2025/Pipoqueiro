import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlistController';
import { auth } from '../utils/auth';

const router = Router();
const watchlistController = new WatchlistController();

// Obter lista "quero ver" do usuário (autenticado)
router.get('/', auth, watchlistController.getWatchlist.bind(watchlistController));

// Adicionar filme à lista "quero ver" (autenticado)
router.post('/', auth, watchlistController.addToWatchlist.bind(watchlistController));

// Remover filme da lista "quero ver" (autenticado)
router.delete('/:tmdb_id', auth, watchlistController.removeFromWatchlist.bind(watchlistController));

export default router;