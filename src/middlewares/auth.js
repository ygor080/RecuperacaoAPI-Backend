/**
 * Middleware de autenticação e autorização via JSON Web Token (JWT).
 * Protege rotas privadas exigindo o cabeçalho Authorization: Bearer <token>.
 */
const jwt = require('jsonwebtoken');

/**
 * Verifica se o token JWT enviado é válido e anexa os dados do usuário
 * autenticado em req.usuario.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nome, email, tipo }
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

/**
 * Restringe o acesso a uma rota apenas a usuários do tipo "tecnico".
 * Deve ser usado sempre após verificarToken.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function apenasTecnico(req, res, next) {
  if (!req.usuario || req.usuario.tipo !== 'tecnico') {
    return res.status(403).json({ erro: 'Acesso restrito a técnicos de suporte.' });
  }
  return next();
}

module.exports = { verificarToken, apenasTecnico };
