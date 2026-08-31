const { Router } = require('express');
const { body, param, query } = require('express-validator');
const chamadoController = require('../controllers/chamadoController');
const { verificarToken, apenasTecnico } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');
const { STATUS_CHAMADO } = require('../utils/constants');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NovoChamado:
 *       type: object
 *       required: [titulo, descricao]
 *       properties:
 *         titulo: { type: string, example: "Impressora não imprime" }
 *         descricao: { type: string, example: "A impressora do setor financeiro não liga." }
 *     AtualizacaoStatus:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [Aberto, "Em Atendimento", "Concluído"] }
 *     Chamado:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         titulo: { type: string }
 *         descricao: { type: string }
 *         status: { type: string }
 *         usuario_id: { type: integer }
 *         tecnico_id: { type: integer, nullable: true }
 *         nome_cliente: { type: string }
 *         nome_tecnico: { type: string, nullable: true }
 *         criado_em: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/chamados:
 *   post:
 *     summary: Abre um novo chamado de suporte
 *     tags: [Chamados]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NovoChamado' }
 *     responses:
 *       201: { description: Chamado criado com sucesso }
 *       400: { description: Dados inválidos }
 *   get:
 *     summary: Lista os chamados (técnicos veem todos; clientes veem os próprios)
 *     tags: [Chamados]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Aberto, "Em Atendimento", "Concluído"] }
 *         description: Filtra os chamados pelo status
 *     responses:
 *       200:
 *         description: Lista de chamados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Chamado' }
 *       400: { description: Status de filtro inválido }
 */
router
  .route('/')
  .post(
    verificarToken,
    [
      body('titulo').trim().notEmpty().withMessage('Título é obrigatório.'),
      body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória.')
    ],
    validar,
    chamadoController.criarChamado
  )
  .get(
    verificarToken,
    [
      query('status')
        .optional()
        .trim()
        .isIn(STATUS_CHAMADO)
        .withMessage(`Status inválido. Use um de: ${STATUS_CHAMADO.join(', ')}`)
    ],
    validar,
    chamadoController.listarChamados
  );

/**
 * @swagger
 * /api/chamados/{id}:
 *   get:
 *     summary: Busca um chamado pelo id
 *     tags: [Chamados]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Chamado encontrado }
 *       403: { description: Sem permissão para visualizar este chamado }
 *       404: { description: Chamado não encontrado }
 *   delete:
 *     summary: Remove um chamado
 *     tags: [Chamados]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Chamado removido com sucesso }
 *       403: { description: Sem permissão para remover este chamado }
 *       404: { description: Chamado não encontrado }
 */
router
  .route('/:id')
  .get(verificarToken, [param('id').isInt()], validar, chamadoController.buscarChamado)
  .delete(verificarToken, [param('id').isInt()], validar, chamadoController.removerChamado);

/**
 * @swagger
 * /api/chamados/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um chamado (restrito a técnicos)
 *     tags: [Chamados]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AtualizacaoStatus' }
 *     responses:
 *       200: { description: Status atualizado com sucesso }
 *       400: { description: Status inválido }
 *       403: { description: Acesso restrito a técnicos }
 *       404: { description: Chamado não encontrado }
 */
router.patch(
  '/:id/status',
  verificarToken,
  apenasTecnico,
  [
    param('id').isInt(),
    body('status')
      .trim()
      .isIn(STATUS_CHAMADO)
      .withMessage(`Status inválido. Use um de: ${STATUS_CHAMADO.join(', ')}`)
  ],
  validar,
  chamadoController.atualizarStatusChamado
);

module.exports = router;
