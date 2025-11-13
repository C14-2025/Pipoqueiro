import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { auth } from '../utils/auth';

const router = Router();
const controller = new ChatController();

// POST /api/chat
router.post('/', auth, controller.handleChatMessage.bind(controller));

export default router;