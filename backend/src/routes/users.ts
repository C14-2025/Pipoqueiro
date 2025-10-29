import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { auth } from '../utils/auth';

const router = Router();
const userController = new UserController();

router.post('/registrar', userController.registrarUsuario.bind(userController));
router.post('/login', userController.loginUsuario.bind(userController));
router.get('/perfil', auth, userController.obterPerfil.bind(userController));
router.put('/perfil', auth, userController.atualizarPerfil.bind(userController));
router.get('/estatisticas', auth, userController.obterEstatisticasUsuario.bind(userController));
router.delete('/conta', auth, userController.excluirConta.bind(userController));

export default router;
