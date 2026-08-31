/**
 * Controller responsável por expor dados do usuário autenticado.
 */
const usuarioModel = require('../models/usuarioModel');

/**
 * Retorna os dados do usuário atualmente autenticado (via token JWT).
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function meuPerfil(req, res, next) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.status(200).json(usuario);
  } catch (err) {
    return next(err);
  }
}

module.exports = { meuPerfil };
