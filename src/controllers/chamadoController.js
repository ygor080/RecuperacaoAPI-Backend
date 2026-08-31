/**
 * Controller responsável pelas operações de abertura, listagem,
 * atualização de status e encerramento de chamados de suporte.
 */
const chamadoModel = require('../models/chamadoModel');
const { STATUS_CHAMADO: STATUS_VALIDOS } = require('../utils/constants');

/**
 * Cria um novo chamado em nome do usuário autenticado (cliente).
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function criarChamado(req, res, next) {
  try {
    const { titulo, descricao } = req.body;
    const id = await chamadoModel.criar({ titulo, descricao, usuarioId: req.usuario.id });
    const chamado = await chamadoModel.buscarPorId(id);
    return res.status(201).json(chamado);
  } catch (err) {
    return next(err);
  }
}

/**
 * Lista chamados. Técnicos visualizam todos os chamados; clientes
 * visualizam apenas os chamados que abriram. Suporta filtro por status
 * via query string (?status=Aberto).
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function listarChamados(req, res, next) {
  try {
    const { status } = req.query;
    if (status && !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use um de: ${STATUS_VALIDOS.join(', ')}` });
    }
    const chamados = await chamadoModel.listar({ usuario: req.usuario, status });
    return res.status(200).json(chamados);
  } catch (err) {
    return next(err);
  }
}

/**
 * Busca um chamado específico pelo id, validando se o usuário
 * autenticado tem permissão para visualizá-lo.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function buscarChamado(req, res, next) {
  try {
    const chamado = await chamadoModel.buscarPorId(req.params.id);
    if (!chamado) {
      return res.status(404).json({ erro: 'Chamado não encontrado.' });
    }
    if (req.usuario.tipo !== 'tecnico' && chamado.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para visualizar este chamado.' });
    }
    return res.status(200).json(chamado);
  } catch (err) {
    return next(err);
  }
}

/**
 * Atualiza o status de um chamado (restrito a técnicos). Se o chamado
 * ainda não tiver um técnico responsável, o técnico autenticado é
 * vinculado automaticamente; se já tiver, a responsabilidade é mantida
 * (ver chamadoModel.atualizarStatus).
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function atualizarStatusChamado(req, res, next) {
  try {
    const { status } = req.body;
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use um de: ${STATUS_VALIDOS.join(', ')}` });
    }

    const chamado = await chamadoModel.buscarPorId(req.params.id);
    if (!chamado) {
      return res.status(404).json({ erro: 'Chamado não encontrado.' });
    }

    await chamadoModel.atualizarStatus(req.params.id, { status, tecnicoId: req.usuario.id });
    const chamadoAtualizado = await chamadoModel.buscarPorId(req.params.id);
    return res.status(200).json(chamadoAtualizado);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove um chamado. Permitido ao cliente que o abriu ou a um técnico.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 * @throws {Error} repassado ao errorHandler em caso de falha inesperada
 */
async function removerChamado(req, res, next) {
  try {
    const chamado = await chamadoModel.buscarPorId(req.params.id);
    if (!chamado) {
      return res.status(404).json({ erro: 'Chamado não encontrado.' });
    }
    if (req.usuario.tipo !== 'tecnico' && chamado.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para remover este chamado.' });
    }
    await chamadoModel.remover(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  criarChamado,
  listarChamados,
  buscarChamado,
  atualizarStatusChamado,
  removerChamado
};
