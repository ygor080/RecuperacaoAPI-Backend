/**
 * Middleware genérico que verifica o resultado das validações do
 * express-validator aplicadas nas rotas e sanitiza a entrada,
 * interrompendo a requisição com 400 caso existam erros.
 */
const { validationResult } = require('express-validator');

/**
 * Verifica o resultado das validações do express-validator registradas
 * na rota. Se houver erros, responde 400 com a lista de problemas e
 * interrompe a requisição; caso contrário, repassa ao próximo middleware.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros.array() });
  }
  return next();
}

module.exports = { validar };
