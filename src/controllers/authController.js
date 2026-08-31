/**
 * Controller responsável pelo registro e autenticação de usuários
 * (clientes e técnicos) do HelpDesk.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const SALT_ROUNDS = 10;

/**
 * Registra um novo usuário, aplicando hash bcrypt na senha antes de persistir.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function registrar(req, res, next) {
  try {
    const { nome, email, senha, tipo } = req.body;

    const usuarioExistente = await usuarioModel.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Já existe um usuário cadastrado com este e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const tipoFinal = tipo === 'tecnico' ? 'tecnico' : 'cliente';

    const id = await usuarioModel.criar({ nome, email, senhaHash, tipo: tipoFinal });

    return res.status(201).json({ id, nome, email, tipo: tipoFinal });
  } catch (err) {
    return next(err);
  }
}

/**
 * Autentica um usuário e retorna um token JWT válido por JWT_EXPIRES_IN.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    return res.status(200).json({ token, usuario: payload });
  } catch (err) {
    return next(err);
  }
}

module.exports = { registrar, login };
