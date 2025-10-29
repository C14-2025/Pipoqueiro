import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();
const chatController = new ChatController();

router.post('/chat', chatController.sendMessage.bind(chatController));

export default router;
