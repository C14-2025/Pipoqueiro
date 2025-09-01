CREATE INDEX idx_avaliacoes_tmdb ON avaliacoes(tmdb_id);
CREATE INDEX idx_avaliacoes_usuario ON avaliacoes(usuario_id);  
CREATE INDEX idx_avaliacoes_nota ON avaliacoes(nota);
CREATE INDEX idx_lista_usuario ON lista_quero_ver(usuario_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

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
    COUNT(lqv.id) as filmes_na_lista
FROM usuarios u
LEFT JOIN avaliacoes a ON u.id = a.usuario_id
LEFT JOIN lista_quero_ver lqv ON u.id = lqv.usuario_id
GROUP BY u.id, u.nome;

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
 
 INSERT INTO lista_quero_ver (usuario_id, tmdb_id, prioridade, onde_assistir) VALUES
-- João quer ver filmes de arte
(1, 475557, 'alta', 'Amazon Prime'),      -- Joker
(1, 438631, 'alta', 'HBO Max'),           -- Duna  
(1, 530385, 'media', 'Netflix'),          -- Midsommar

-- Maria quer dramas nacionais
(2, 619592, 'alta', 'Globoplay'),         -- Bacurau
(2, 581389, 'media', 'Netflix'),          -- A Vida Invisível

-- Pedro quer ação
(3, 634649, 'alta', 'Disney+'),           -- Homem-Aranha
(3, 370172, 'alta', 'Amazon Prime'),      -- No Time to Die

-- Ana quer clássicos que perdeu
(4, 603, 'media', 'Netflix'),             -- Matrix
(4, 680, 'baixa', 'Criterion Channel');   -- Pulp Fiction


-- Verificação final
SELECT 'Usuários criados:' as status, COUNT(*) as total FROM usuarios;
SELECT 'Reviews criadas:' as status, COUNT(*) as total FROM avaliacoes;  
SELECT 'Filmes na watchlist:' as status, COUNT(*) as total FROM lista_quero_ver;

-- Teste de relacionamentos
SELECT 
    u.nome,
    COUNT(a.id) as total_reviews,
    AVG(a.nota) as nota_media
FROM usuarios u 
LEFT JOIN avaliacoes a ON u.id = a.usuario_id 
GROUP BY u.id, u.nome;
