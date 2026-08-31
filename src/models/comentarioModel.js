/**
 * Model responsável pelo acesso à tabela `comentarios_chamado`.
 * Todas as queries usam Prepared Statements (pool.query com
 * placeholders posicionais $1, $2, ...).
 */
const pool = require('../config/db');

/**
 * Adiciona um comentário a um chamado existente.
 * @async
 * @param {{chamadoId: number, usuarioId: number, comentario: string}} dados
 * @returns {Promise<number>} id do comentário criado
 */
async function criar({ chamadoId, usuarioId, comentario }) {
  const resultado = await pool.query(
    'INSERT INTO comentarios_chamado (chamado_id, usuario_id, comentario) VALUES ($1, $2, $3) RETURNING id',
    [chamadoId, usuarioId, comentario]
  );
  return resultado.rows[0].id;
}

/**
 * Lista os comentários de um chamado, ordenados do mais antigo para o mais recente.
 * @async
 * @param {number} chamadoId
 * @returns {Promise<object[]>}
 */
async function listarPorChamado(chamadoId) {
  const resultado = await pool.query(
    `SELECT cc.*, u.nome AS nome_autor, u.tipo AS tipo_autor
     FROM comentarios_chamado cc
     JOIN usuarios u ON u.id = cc.usuario_id
     WHERE cc.chamado_id = $1
     ORDER BY cc.criado_em ASC`,
    [chamadoId]
  );
  return resultado.rows;
}

module.exports = { criar, listarPorChamado };
