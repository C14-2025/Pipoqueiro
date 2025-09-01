CREATE DATABASE pipoqueiro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pipoqueiro;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,                    -- "João Silva"
    email VARCHAR(100) UNIQUE NOT NULL,            -- Login único  
    senha_hash VARCHAR(255) NOT NULL,              -- Senha criptografada (NUNCA em texto)
    bio TEXT,                                      -- "Amo filmes de terror desde criança"
    foto_perfil VARCHAR(500),                      -- URL da foto (pode ser NULL)
    generos_favoritos JSON,                        -- ["ação", "terror", "comédia"]
    data_nascimento DATE,                          -- Para recomendar filmes por idade
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,                       -- Quem fez a review
    tmdb_id INT NOT NULL,                          -- Qual filme (ID da TMDb)
    nota INT CHECK (nota >= 1 AND nota <= 5),     -- 1 a 5 estrelas obrigatório
    titulo_review VARCHAR(200),                    -- "Obra prima do cinema!"
    comentario TEXT,                               -- Review completa (opcional)
    spoiler BOOLEAN DEFAULT FALSE,                 -- Tem spoiler? (para ocultar)
    curtidas INT DEFAULT 0,                        -- Quantos curtiram a review
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie (usuario_id, tmdb_id)  -- Usuário só pode avaliar 1x
);

CREATE TABLE lista_quero_ver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,                       -- De quem é a lista
    tmdb_id INT NOT NULL,                          -- Qual filme quer ver
    prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',  -- Quão ansioso está
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notificar_lancamento BOOLEAN DEFAULT TRUE,     -- Avisar quando sair no cinema?
    onde_assistir VARCHAR(500),                    -- "Netflix, Amazon Prime"
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie_watchlist (usuario_id, tmdb_id)  -- Não duplicar filme
);