import { Router } from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obterPerfil,
  atualizarPerfil,
  obterEstatisticasUsuario,
  excluirConta
} from '../controllers/userController';
import { auth } from '../utils/auth';

const router = Router();

// Registrar usuário (público)
router.post('/registrar', registrarUsuario);

// Login usuário (público)
router.post('/login', loginUsuario);

// Obter perfil (autenticado)
router.get('/perfil', auth, obterPerfil);

// Atualizar perfil (autenticado)
router.put('/perfil', auth, atualizarPerfil);

// Obter estatísticas do usuário (autenticado)
router.get('/estatisticas', auth, obterEstatisticasUsuario);

// Excluir conta (autenticado)
router.delete('/conta', auth, excluirConta);

export default router;