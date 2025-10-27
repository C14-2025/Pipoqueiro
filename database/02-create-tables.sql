USE pipoqueiro;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    foto_perfil VARCHAR(500),
    generos_favoritos JSON,
    data_nascimento DATE,
    favoritos JSON DEFAULT '[]',
    lista_quero_ver JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tmdb_id INT NOT NULL,
    nota INT CHECK (nota >= 1 AND nota <= 5),
    titulo_review VARCHAR(200),
    comentario TEXT,
    spoiler BOOLEAN DEFAULT FALSE,
    curtidas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie (usuario_id, tmdb_id)
);
