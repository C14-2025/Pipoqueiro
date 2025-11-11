// src/routes/chat.routes.ts

import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
// CORREÇÃO: Importando 'auth' do caminho correto
import { auth } from '../utils/auth';

const router = Router();
const controller = new ChatController();

// POST /api/chat
// Protegido: O usuário deve estar logado para usar o chat.
// Agora usa o 'auth' importado do caminho certo.
router.post('/', auth, controller.handleChatMessage.bind(controller));

export default router;