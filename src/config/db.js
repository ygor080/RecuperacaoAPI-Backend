/**
 * Configuração da conexão com o banco de dados PostgreSQL.
 * Utiliza um pool de conexões via `pg` e Prepared Statements
 * (pool.query com placeholders $1, $2, ...) para prevenir SQL Injection
 * em toda a aplicação.
 *
 * Aceita tanto uma `DATABASE_URL` única (formato usado por Neon, Aiven
 * e Render) quanto variáveis de conexão separadas (DB_HOST, DB_PORT, etc.).
 */
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === 'false'
          ? false
          : { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 10,
      idleTimeoutMillis: 30000,
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined
    });

// Registra erros inesperados em conexões ociosas do pool (ex: perda de rede
// com o banco), para que falhas de infraestrutura não passem silenciosas em
// produção. O pool descarta a conexão com problema e cria uma nova sozinho
// na próxima query — não é necessário reiniciar o processo aqui.
pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões PostgreSQL:', err);
});

module.exports = pool;
