-- Tabela de Usuários 
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  foto_perfil VARCHAR(500),
  generos_favoritos JSON DEFAULT '[]',
  data_nascimento DATE,
  favoritos JSON DEFAULT '[]',
  lista_quero_ver JSON DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Avaliações 
CREATE TABLE avaliacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  tmdb_id INT NOT NULL,
  nota INT CHECK (nota >= 1 AND nota <= 5),
  titulo_review VARCHAR(200),
  comentario TEXT,
  spoiler BOOLEAN DEFAULT FALSE,
  curtidas INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE (usuario_id, tmdb_id)
);