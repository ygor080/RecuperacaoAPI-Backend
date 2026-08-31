const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validar } = require('../middlewares/validate');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NovoUsuario:
 *       type: object
 *       required: [nome, email, senha]
 *       properties:
 *         nome: { type: string, example: "Maria Souza" }
 *         email: { type: string, example: "maria@empresa.com" }
 *         senha: { type: string, example: "SenhaForte123" }
 *         tipo: { type: string, enum: [cliente, tecnico], example: "cliente" }
 *     Credenciais:
 *       type: object
 *       required: [email, senha]
 *       properties:
 *         email: { type: string, example: "maria@empresa.com" }
 *         senha: { type: string, example: "SenhaForte123" }
 */

/**
 * @swagger
 * /api/auth/registrar:
 *   post:
 *     summary: Cadastra um novo usuário (cliente ou técnico)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NovoUsuario' }
 *     responses:
 *       201: { description: Usuário criado com sucesso }
 *       400: { description: Dados inválidos }
 *       409: { description: E-mail já cadastrado }
 */
router.post(
  '/registrar',
  [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').trim().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres.'),
    body('tipo').optional().isIn(['cliente', 'tecnico'])
  ],
  validar,
  authController.registrar
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Credenciais' }
 *     responses:
 *       200: { description: Login realizado com sucesso, retorna o token }
 *       401: { description: E-mail ou senha inválidos }
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha é obrigatória.')
  ],
  validar,
  authController.login
);

module.exports = router;
