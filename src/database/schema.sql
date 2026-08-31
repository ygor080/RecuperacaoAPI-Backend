-- ============================================================
-- Schema do banco de dados - HelpDesk API
-- Compatível com PostgreSQL 13+ (Neon / Aiven)
--
-- Este arquivo assume que o banco (ex: defaultdb2) já foi criado
-- e que você está conectado nele.
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'tecnico')),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chamados (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Aberto'
    CHECK (status IN ('Aberto', 'Em Atendimento', 'Concluído')),
  usuario_id INTEGER NOT NULL,
  tecnico_id INTEGER NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chamado_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_chamado_tecnico FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comentarios_chamado (
  id SERIAL PRIMARY KEY,
  chamado_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  comentario TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comentario_chamado FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
  CONSTRAINT fk_comentario_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices auxiliares para as consultas mais comuns da API
CREATE INDEX IF NOT EXISTS idx_chamados_usuario_id ON chamados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_comentarios_chamado_id ON comentarios_chamado(chamado_id);
