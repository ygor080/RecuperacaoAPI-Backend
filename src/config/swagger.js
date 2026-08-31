/**
 * Configuração do Swagger UI (OpenAPI 3.0) para a rota /api-docs.
 * Documenta todas as rotas da API HelpDesk e define o esquema de
 * autenticação Bearer (JWT) reutilizável nos endpoints protegidos.
 */
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HelpDesk API',
      version: '1.0.0',
      description:
        'API REST para o Sistema de Gestão de Chamados e Suporte Técnico (HelpDesk). ' +
        'Permite cadastro de usuários (clientes e técnicos), abertura, acompanhamento, ' +
        'atualização de status e comentários em chamados de suporte.'
    },
    servers: [
      {
        url: process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor da API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);
