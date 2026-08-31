/**
 * Ponto de entrada da HelpDesk API.
 * Sistema de Gestão de Chamados e Suporte Técnico - Arquitetura REST desacoplada.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./src/config/swagger');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const chamadoRoutes = require('./src/routes/chamadoRoutes');
const comentarioRoutes = require('./src/routes/comentarioRoutes');
const { errorHandler, rotaNaoEncontrada } = require('./src/middlewares/errorHandler');

const app = express();

// --- Middlewares globais ---
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // aceita requisições apenas do front-end configurado
    credentials: true
  })
);
app.use(express.json());

// --- Documentação interativa (Swagger UI) ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Rota de health-check ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', servico: 'HelpDesk API', docs: '/api-docs' });
});

// --- Rotas da aplicação ---
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/chamados', chamadoRoutes);
app.use('/api/chamados/:chamadoId/comentarios', comentarioRoutes);

// --- Tratamento de erros (sempre por último) ---
app.use(rotaNaoEncontrada);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HelpDesk API rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em /api-docs`);
});

module.exports = app;
