# HelpDesk API

API REST para o **Sistema de Gestão de Chamados e Suporte Técnico (HelpDesk)**.
Ecossistema desacoplado: esta API expõe endpoints JSON para abertura, listagem,
atualização de status e encerramento de chamados, consumidos por um front-end
dinâmico separado (`helpdesk-web`).

## Arquitetura

```
helpdesk-api/
├── server.js                # ponto de entrada
├── src/
│   ├── config/
│   │   ├── db.js            # pool de conexão PostgreSQL (pg)
│   │   └── swagger.js       # configuração do OpenAPI/Swagger
│   ├── middlewares/
│   │   ├── auth.js          # verificação de JWT e checagem de papel (técnico)
│   │   ├── errorHandler.js  # tratamento central de exceções
│   │   └── validate.js      # validação/sanitização de entrada (express-validator)
│   ├── models/               # acesso a dados via Prepared Statements
│   ├── controllers/          # regras de negócio (documentadas com JSDoc)
│   ├── routes/                # definição de rotas + anotações Swagger
│   ├── utils/
│   │   └── constants.js     # constantes compartilhadas (ex: status válidos de chamado)
│   └── database/
│       └── schema.sql       # script único de criação das tabelas + índices
```

## Modelo de dados

- **usuarios**: clientes e técnicos (`tipo`: `cliente` | `tecnico`), senha sempre em hash (bcrypt).
- **chamados**: título, descrição, `status` (`Aberto`, `Em Atendimento`, `Concluído`), cliente que abriu e técnico responsável.
  O campo `atualizado_em` é mantido pela própria aplicação (em `chamadoModel.atualizarStatus`), e não por trigger/função PL/pgSQL — um bloco `CREATE FUNCTION ... $$ ... $$` contém `;` dentro do corpo, o que quebra em editores de query web que dividem o script em statements por `;` (ex: console da Aiven). Isso mantém o `schema.sql` 100% compatível com qualquer console SQL, sem exceções.
  Além disso, o técnico só é atribuído automaticamente (`tecnico_id`) na primeira vez que alguém atualiza o status de um chamado ainda sem responsável; se o chamado já tem um técnico, outro técnico pode mudar o status sem "roubar" a atribuição.
- **comentarios_chamado**: histórico de comentários trocados em cada chamado.

## Autenticação

Autenticação via **JWT**. Após o login, envie o token em todas as rotas protegidas:

```
Authorization: Bearer <token>
```

- Rotas de `chamados` e `comentarios`: exigem token válido.
- Atualização de status (`PATCH /api/chamados/:id/status`): restrita a usuários com `tipo = tecnico`.
- Clientes só visualizam/alteram os próprios chamados; técnicos têm acesso a todos.

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de variáveis de ambiente e preencha com seus dados:
   ```bash
   cp .env.example .env
   ```
3. Crie as tabelas no seu banco PostgreSQL (já criado previamente na Neon/Aiven). O `schema.sql` é composto só de `CREATE TABLE`/`CREATE INDEX` simples (sem função/trigger PL/pgSQL), então pode ser executado de qualquer uma destas formas:
   - **Via `psql`** (roda tudo de uma vez):
     ```bash
     psql "$DATABASE_URL" -f src/database/schema.sql
     ```
   - **Via editor de queries web** (ex: console SQL da Aiven/Neon): cole o conteúdo inteiro de `schema.sql` e rode — são só 6 statements, dentro do limite de qualquer editor com limite de comandos por execução.
4. Inicie a aplicação:
   ```bash
   npm run dev   # com reload automático (nodemon)
   # ou
   npm start
   ```
5. Acesse a documentação interativa em `http://localhost:3000/api-docs`.

## Variáveis de ambiente (`.env`)

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da aplicação |
| `NODE_ENV` | `development` ou `production` |
| `DATABASE_URL` | Connection string completa do PostgreSQL (recomendado — usada por Neon/Aiven/Render) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Alternativa a `DATABASE_URL`: credenciais do banco PostgreSQL separadas |
| `DB_SSL` | `true` para exigir SSL/TLS ao usar as variáveis separadas (recomendado em nuvem) |
| `JWT_SECRET` | Segredo usado para assinar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (ex: `8h`) |
| `CORS_ORIGIN` | URL pública do front-end autorizado a consumir a API |
| `API_PUBLIC_URL` | URL pública da própria API, usada pelo Swagger para montar o servidor exibido em `/api-docs` |

Veja `.env.example` para o modelo completo.

## Principais endpoints

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| POST | `/api/auth/registrar` | Cadastra cliente ou técnico | Pública |
| POST | `/api/auth/login` | Autentica e retorna JWT | Pública |
| GET | `/api/usuarios/me` | Dados do usuário autenticado | JWT |
| POST | `/api/chamados` | Abre um novo chamado | JWT |
| GET | `/api/chamados?status=` | Lista chamados (com filtro opcional) | JWT |
| GET | `/api/chamados/:id` | Detalha um chamado | JWT |
| PATCH | `/api/chamados/:id/status` | Atualiza status do chamado | JWT (técnico) |
| DELETE | `/api/chamados/:id` | Remove um chamado | JWT |
| POST | `/api/chamados/:chamadoId/comentarios` | Adiciona comentário | JWT |
| GET | `/api/chamados/:chamadoId/comentarios` | Lista comentários | JWT |

A especificação completa (schemas, exemplos e testes interativos) está em `/api-docs`.

## Deploy em produção (Render + Neon/Aiven)

1. **Banco de dados**: crie uma instância PostgreSQL gratuita na [Neon](https://neon.tech/) (ou na [Aiven](https://aiven.io/)) e copie a `DATABASE_URL` fornecida para o `.env`. Rode o `schema.sql` completo nela — via `psql` ou colando o conteúdo direto no editor de queries web do provedor (não há função/trigger PL/pgSQL, então funciona em qualquer um deles).
2. **API**: crie um *Web Service* no [Render](https://render.com/) apontando para este repositório.
   - Build command: `npm install`
   - Start command: `npm start`
   - Configure as mesmas variáveis do `.env` no painel do Render (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, etc.).
   - Defina `CORS_ORIGIN` com a URL final do front-end publicado no Vercel/Netlify.
   - Defina `API_PUBLIC_URL` com a URL final da própria API no Render (ex: `https://sua-api.onrender.com`), para que o Swagger exiba o servidor correto em `/api-docs`.
3. Após o deploy, teste `https://<sua-api>.onrender.com/api-docs` em uma aba anônima.

## Segurança implementada

- Senhas com hash `bcryptjs` (nunca em texto puro).
- Prepared Statements (`pool.query` com placeholders `$1, $2, ...`) em 100% das queries — sem concatenação de strings.
- JWT para rotas privadas, com verificação de papel (`tecnico`) onde necessário.
- `cors` restrito à origem do front-end configurada em `CORS_ORIGIN`.
- Tratamento de exceções via `try/catch` + middleware central, sem vazar stack trace em produção.
- Validação e sanitização de entrada com `express-validator` em todas as rotas, incluindo o enum de `status` do chamado (`.isIn(STATUS_CHAMADO)`, definido em `src/utils/constants.js`).
- Pool de conexões com PostgreSQL usa `ssl: { rejectUnauthorized: false }`, compatível com os certificados gerenciados da Neon e da Aiven.
