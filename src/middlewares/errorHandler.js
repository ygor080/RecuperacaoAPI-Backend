/**
 * Middleware global de tratamento de exceções.
 * Deve ser o último middleware registrado no server.js.
 * Evita o vazamento de stack traces para o cliente em produção.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const emProducao = process.env.NODE_ENV === 'production';

  res.status(status).json({
    erro: err.publicMessage || 'Erro interno no servidor.',
    ...(emProducao ? {} : { detalhe: err.message, stack: err.stack })
  });
}

/**
 * Middleware para rotas não encontradas (404).
 */
function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

module.exports = { errorHandler, rotaNaoEncontrada };
