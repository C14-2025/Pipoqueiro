USE pipoqueiro;

-- ==================== ÍNDICES PARA PERFORMANCE ====================
CREATE INDEX idx_avaliacoes_tmdb ON avaliacoes(tmdb_id);
CREATE INDEX idx_avaliacoes_usuario ON avaliacoes(usuario_id);
CREATE INDEX idx_avaliacoes_nota ON avaliacoes(nota);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ==================== VIEWS PARA ESTATÍSTICAS ====================

-- View para estatísticas dos filmes
CREATE VIEW estatisticas_filmes AS
SELECT
    tmdb_id,
    COUNT(*) as total_avaliacoes,
    AVG(nota) as nota_media,
    COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas,
    COUNT(CASE WHEN spoiler = TRUE THEN 1 END) as reviews_com_spoiler
FROM avaliacoes
GROUP BY tmdb_id;

-- View para usuários mais ativos
CREATE VIEW usuarios_ativos AS
SELECT
    u.id,
    u.nome,
    COUNT(a.id) as total_reviews,
    AVG(a.nota) as nota_media_usuario,
    COALESCE(JSON_LENGTH(u.lista_quero_ver), 0) as filmes_na_lista,
    COALESCE(JSON_LENGTH(u.favoritos), 0) as filmes_favoritos
FROM usuarios u
LEFT JOIN avaliacoes a ON u.id = a.usuario_id
GROUP BY u.id, u.nome, u.lista_quero_ver, u.favoritos;

-- ==================== INSERÇÃO DE USUÁRIOS ====================
INSERT INTO usuarios (nome, email, senha_hash, bio, generos_favoritos, data_nascimento) VALUES
('João Cinéfilo Silva', 'joao.cineasta@email.com', '$2b$10$hash1...',
 'Apaixonado por filmes desde os 8 anos. Especialista em ficção científica e terror psicológico.',
 '["ficção científica", "terror", "thriller"]', '1995-03-15'),

('Maria Santos Crítica', 'maria.critica@email.com', '$2b$10$hash2...',
 'Jornalista cultural há 15 anos. Defensora do cinema nacional e independente.',
 '["drama", "comédia", "nacional"]', '1987-08-22'),

('Pedro Blockbuster Fan', 'pedro.acao@email.com', '$2b$10$hash3...',
 'Adoro explosões, perseguições e heróis salvando o mundo! 🎬💥',
 '["ação", "aventura", "super-herói"]', '2000-12-10'),

('Ana Clássicos Forever', 'ana.classicos@email.com', '$2b$10$hash4...',
 'Hitchcock, Kubrick, Scorsese... Os verdadeiros mestres do cinema.',
 '["clássico", "drama", "suspense"]', '1978-05-30');

-- ==================== INSERÇÃO DE REVIEWS ====================
INSERT INTO avaliacoes (usuario_id, tmdb_id, nota, titulo_review, comentario, spoiler) VALUES
-- Clube da Luta (tmdb_id: 550)
(1, 550, 5, 'Obra-prima perturbadora!',
 'Fincher entrega uma crítica feroz ao consumismo com uma narrativa não-linear brilhante. Ed Norton e Brad Pitt em estado de graça. O final te deixa questionando tudo.', FALSE),

(2, 550, 4, 'Bom, mas superestimado',
 'Filme tecnicamente impecável, mas o culto em torno dele é exagerado. A mensagem é válida, porém entregue de forma pretenciosa em alguns momentos.', FALSE),

-- Forrest Gump (tmdb_id: 13)
(3, 13, 5, 'Emociona do início ao fim',
 'Tom Hanks simplesmente perfeito! Uma jornada pela história americana através dos olhos de um homem simples e bondoso. Chorei litros! 😭', FALSE),

(4, 13, 3, 'Piegas demais para mim',
 'Reconheço a qualidade técnica e a atuação do Hanks, mas o filme forçou demais na emotividade. Prefiro dramas mais sutis.', FALSE),

-- Interestelar (tmdb_id: 157336)
(1, 157336, 5, 'Ficção científica no seu melhor!',
 'Nolan conseguiu equilibrar ciência real com emoção humana. A trilha sonora do Hans Zimmer é transcendental. IMAX obrigatório!', FALSE),

(2, 157336, 4, 'Lindo, mas confuso',
 'Visualmente deslumbrante e emocionalmente poderoso, mas Nolan se perdeu um pouco na complexidade temporal. Ainda assim, vale cada minuto.', FALSE),

-- Parasita (tmdb_id: 496243)
(2, 496243, 5, 'Revolução no cinema!',
 'Bong Joon-ho entrega uma obra-prima sobre desigualdade social. Mistura gêneros de forma genial. Mereceu todos os Oscars que ganhou!', FALSE),

(4, 496243, 5, 'Cinema coreano dominando',
 'Thriller psicológico perfeito que funciona também como crítica social afiada. A cinematografia é de outro mundo.', FALSE),

-- Vingadores: Ultimato (tmdb_id: 299534)
(3, 299534, 4, 'Fechamento épico!',
 'Fan service do melhor tipo! 3 horas que passam voando. Algumas partes meio forçadas, mas a emoção compensa tudo.', TRUE),

(1, 299534, 3, 'Espetáculo vazio',
 'Tecnicamente impressionante, mas falta alma. Muito barulho para pouco desenvolvimento de personagem.', FALSE);

-- ==================== ATUALIZAR WATCHLIST (LISTA QUERO VER) ====================
-- João quer ver filmes de arte
UPDATE usuarios SET lista_quero_ver = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 475557, 'data_adicao', '2025-01-15'),  -- Joker
    JSON_OBJECT('tmdb_id', 438631, 'data_adicao', '2025-01-15'),  -- Duna
    JSON_OBJECT('tmdb_id', 530385, 'data_adicao', '2025-01-16')   -- Midsommar
) WHERE id = 1;

-- Maria quer dramas nacionais
UPDATE usuarios SET lista_quero_ver = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 619592, 'data_adicao', '2025-01-15'),  -- Bacurau
    JSON_OBJECT('tmdb_id', 581389, 'data_adicao', '2025-01-16')   -- A Vida Invisível
) WHERE id = 2;

-- Pedro quer ação
UPDATE usuarios SET lista_quero_ver = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 634649, 'data_adicao', '2025-01-15'),  -- Homem-Aranha
    JSON_OBJECT('tmdb_id', 370172, 'data_adicao', '2025-01-15')   -- No Time to Die
) WHERE id = 3;

-- Ana quer clássicos que perdeu
UPDATE usuarios SET lista_quero_ver = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 603, 'data_adicao', '2025-01-16'),     -- Matrix
    JSON_OBJECT('tmdb_id', 680, 'data_adicao', '2025-01-17')      -- Pulp Fiction
) WHERE id = 4;

-- ==================== ATUALIZAR FAVORITOS ====================
-- João marca Clube da Luta e Interestelar como favoritos (filmes que ele deu nota 5)
UPDATE usuarios SET favoritos = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 550, 'data_adicao', '2025-01-10'),
    JSON_OBJECT('tmdb_id', 157336, 'data_adicao', '2025-01-12')
) WHERE id = 1;

-- Maria marca seus filmes favoritos
UPDATE usuarios SET favoritos = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 496243, 'data_adicao', '2025-01-11')
) WHERE id = 2;

-- Pedro marca Forrest Gump
UPDATE usuarios SET favoritos = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 13, 'data_adicao', '2025-01-09')
) WHERE id = 3;

-- Ana marca Parasita
UPDATE usuarios SET favoritos = JSON_ARRAY(
    JSON_OBJECT('tmdb_id', 496243, 'data_adicao', '2025-01-11')
) WHERE id = 4;

-- ==================== VERIFICAÇÃO FINAL ====================
SELECT 'Usuários criados:' as status, COUNT(*) as total FROM usuarios;
SELECT 'Reviews criadas:' as status, COUNT(*) as total FROM avaliacoes;
SELECT 'Filmes na watchlist:' as status, SUM(JSON_LENGTH(lista_quero_ver)) as total FROM usuarios;
SELECT 'Filmes favoritos:' as status, SUM(JSON_LENGTH(favoritos)) as total FROM usuarios;

-- ==================== TESTE DE RELACIONAMENTOS ====================
SELECT
    u.nome,
    COUNT(a.id) as total_reviews,
    ROUND(AVG(a.nota), 2) as nota_media,
    JSON_LENGTH(u.lista_quero_ver) as filmes_quero_ver,
    JSON_LENGTH(u.favoritos) as filmes_favoritos
FROM usuarios u
LEFT JOIN avaliacoes a ON u.id = a.usuario_id
GROUP BY u.id, u.nome, u.lista_quero_ver, u.favoritos
ORDER BY total_reviews DESC;

-- ==================== TESTE DAS VIEWS ====================
SELECT 'Estatísticas dos filmes mais avaliados:' as info;
SELECT * FROM estatisticas_filmes ORDER BY total_avaliacoes DESC LIMIT 5;

SELECT 'Usuários mais ativos:' as info;
SELECT * FROM usuarios_ativos ORDER BY total_reviews DESC;
