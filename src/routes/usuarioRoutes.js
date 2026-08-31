const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

/**
 * @swagger
 * /api/usuarios/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Usuários]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dados do usuário autenticado }
 *       401: { description: Token ausente ou inválido }
 */
router.get('/me', verificarToken, usuarioController.meuPerfil);

module.exports = router;
