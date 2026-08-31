/**
 * Controller responsável pelos comentários trocados em um chamado
 * entre cliente e técnico durante o atendimento.
 */
const chamadoModel = require('../models/chamadoModel');
const comentarioModel = require('../models/comentarioModel');

/**
 * Verifica se o usuário autenticado pode interagir com o chamado informado.
 * @async
 * @param {object} usuario
 * @param {number} chamadoId
 * @returns {Promise<object|null>} o chamado, ou null se não encontrado/sem permissão
 */
async function chamadoPermitido(usuario, chamadoId) {
  const chamado = await chamadoModel.buscarPorId(chamadoId);
  if (!chamado) return null;
  if (usuario.tipo !== 'tecnico' && chamado.usuario_id !== usuario.id) return null;
  return chamado;
}

/**
 * Adiciona um comentário a um chamado existente.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function adicionarComentario(req, res, next) {
  try {
    const { comentario } = req.body;
    const chamado = await chamadoPermitido(req.usuario, req.params.chamadoId);
    if (!chamado) {
      return res.status(404).json({ erro: 'Chamado não encontrado ou acesso não permitido.' });
    }

    const id = await comentarioModel.criar({
      chamadoId: req.params.chamadoId,
      usuarioId: req.usuario.id,
      comentario
    });

    return res.status(201).json({ id, chamadoId: Number(req.params.chamadoId), comentario });
  } catch (err) {
    return next(err);
  }
}

/**
 * Lista os comentários de um chamado em ordem cronológica.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function listarComentarios(req, res, next) {
  try {
    const chamado = await chamadoPermitido(req.usuario, req.params.chamadoId);
    if (!chamado) {
      return res.status(404).json({ erro: 'Chamado não encontrado ou acesso não permitido.' });
    }

    const comentarios = await comentarioModel.listarPorChamado(req.params.chamadoId);
    return res.status(200).json(comentarios);
  } catch (err) {
    return next(err);
  }
}

module.exports = { adicionarComentario, listarComentarios };
