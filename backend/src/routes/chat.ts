import { Router } from 'express';
import { chatController } from '../controllers/chatController';


const router = Router();

//Rota pública
router.post('/chat', chatController.sendMessage);

export default router;
