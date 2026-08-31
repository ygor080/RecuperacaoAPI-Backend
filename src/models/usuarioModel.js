/**
 * Model responsável pelo acesso à tabela `usuarios`.
 * Todas as queries usam Prepared Statements (pool.query com
 * placeholders $1, $2, ...) para prevenir SQL Injection.
 */
const pool = require('../config/db');

/**
 * Cria um novo usuário no banco de dados.
 * @async
 * @param {{nome: string, email: string, senhaHash: string, tipo: 'cliente'|'tecnico'}} dados
 * @returns {Promise<number>} id do usuário criado
 */
async function criar({ nome, email, senhaHash, tipo }) {
  const resultado = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES ($1, $2, $3, $4) RETURNING id',
    [nome, email, senhaHash, tipo]
  );
  return resultado.rows[0].id;
}

/**
 * Busca um usuário pelo e-mail.
 * @async
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function buscarPorEmail(email) {
  const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return resultado.rows[0] || null;
}

/**
 * Busca um usuário pelo id.
 * @async
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function buscarPorId(id) {
  const resultado = await pool.query(
    'SELECT id, nome, email, tipo, criado_em FROM usuarios WHERE id = $1',
    [id]
  );
  return resultado.rows[0] || null;
}

module.exports = { criar, buscarPorEmail, buscarPorId };
