/**
 * Model responsável pelo acesso à tabela `chamados`.
 * Todas as queries usam Prepared Statements (pool.query com
 * placeholders posicionais $1, $2, ...).
 */
const pool = require('../config/db');

/**
 * Cria um novo chamado de suporte.
 * @async
 * @param {{titulo: string, descricao: string, usuarioId: number}} dados
 * @returns {Promise<number>} id do chamado criado
 */
async function criar({ titulo, descricao, usuarioId }) {
  const resultado = await pool.query(
    'INSERT INTO chamados (titulo, descricao, usuario_id) VALUES ($1, $2, $3) RETURNING id',
    [titulo, descricao, usuarioId]
  );
  return resultado.rows[0].id;
}

/**
 * Lista chamados. Técnicos veem todos os chamados; clientes veem apenas os próprios.
 * Aceita filtro opcional por status.
 * @async
 * @param {{usuario: {id: number, tipo: string}, status?: string}} filtro
 * @returns {Promise<object[]>}
 */
async function listar({ usuario, status }) {
  const condicoes = [];
  const parametros = [];

  if (usuario.tipo !== 'tecnico') {
    parametros.push(usuario.id);
    condicoes.push(`c.usuario_id = $${parametros.length}`);
  }

  if (status) {
    parametros.push(status);
    condicoes.push(`c.status = $${parametros.length}`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const resultado = await pool.query(
    `SELECT c.*, u.nome AS nome_cliente, t.nome AS nome_tecnico
     FROM chamados c
     JOIN usuarios u ON u.id = c.usuario_id
     LEFT JOIN usuarios t ON t.id = c.tecnico_id
     ${where}
     ORDER BY c.criado_em DESC`,
    parametros
  );
  return resultado.rows;
}

/**
 * Busca um chamado pelo id.
 * @async
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function buscarPorId(id) {
  const resultado = await pool.query(
    `SELECT c.*, u.nome AS nome_cliente, t.nome AS nome_tecnico
     FROM chamados c
     JOIN usuarios u ON u.id = c.usuario_id
     LEFT JOIN usuarios t ON t.id = c.tecnico_id
     WHERE c.id = $1`,
    [id]
  );
  return resultado.rows[0] || null;
}

/**
 * Atualiza o status de um chamado e mantém `atualizado_em` em dia.
 *
 * O técnico informado só é gravado como responsável se o chamado AINDA
 * não tiver um técnico atribuído (COALESCE(tecnico_id, $2)): assim, o
 * primeiro técnico que mexer em um chamado "aberto" assume a
 * responsabilidade, mas um chamado já atribuído a um colega não é
 * reatribuído silenciosamente só porque outro técnico atualizou o status.
 * @async
 * @param {number} id
 * @param {{status: string, tecnicoId?: number}} dados
 * @returns {Promise<boolean>}
 */
async function atualizarStatus(id, { status, tecnicoId }) {
  const resultado = await pool.query(
    `UPDATE chamados
     SET status = $1,
         tecnico_id = COALESCE(tecnico_id, $2),
         atualizado_em = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [status, tecnicoId ?? null, id]
  );
  return resultado.rowCount > 0;
}

/**
 * Remove um chamado pelo id.
 * @async
 * @param {number} id
 * @returns {Promise<boolean>}
 */
async function remover(id) {
  const resultado = await pool.query('DELETE FROM chamados WHERE id = $1', [id]);
  return resultado.rowCount > 0;
}

module.exports = { criar, listar, buscarPorId, atualizarStatus, remover };
