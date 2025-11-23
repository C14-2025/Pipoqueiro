import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlistController';
import { auth } from '../utils/auth';

const router = Router();
const watchlistController = new WatchlistController();

// GET /api/watchlist
router.get('/', auth, watchlistController.getWatchlist.bind(watchlistController));

// POST /api/watchlist
router.post('/', auth, watchlistController.addToWatchlist.bind(watchlistController));

// DELETE /api/watchlist/:tmdb_id
router.delete('/:tmdb_id', auth, watchlistController.removeFromWatchlist.bind(watchlistController));

export default router;