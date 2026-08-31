const { Router } = require('express');
const { body, param } = require('express-validator');
const comentarioController = require('../controllers/comentarioController');
const { verificarToken } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');

// mergeParams permite acessar :chamadoId definido no router pai (chamadoRoutes)
const router = Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     NovoComentario:
 *       type: object
 *       required: [comentario]
 *       properties:
 *         comentario: { type: string, example: "Já verificamos o cabo de energia, testando a placa lógica." }
 */

/**
 * @swagger
 * /api/chamados/{chamadoId}/comentarios:
 *   post:
 *     summary: Adiciona um comentário a um chamado
 *     tags: [Comentários]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chamadoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NovoComentario' }
 *     responses:
 *       201: { description: Comentário adicionado com sucesso }
 *       404: { description: Chamado não encontrado ou acesso não permitido }
 *   get:
 *     summary: Lista os comentários de um chamado
 *     tags: [Comentários]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chamadoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de comentários do chamado }
 *       404: { description: Chamado não encontrado ou acesso não permitido }
 */
router
  .route('/')
  .post(
    verificarToken,
    [param('chamadoId').isInt(), body('comentario').trim().notEmpty().withMessage('Comentário não pode ser vazio.')],
    validar,
    comentarioController.adicionarComentario
  )
  .get(verificarToken, [param('chamadoId').isInt()], validar, comentarioController.listarComentarios);

module.exports = router;
