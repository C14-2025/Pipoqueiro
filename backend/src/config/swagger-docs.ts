/**
 * Documentação Swagger para todas as rotas restantes
 * Este arquivo contém a documentação inline para Reviews, Favoritos, Watchlist e Chat
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Criar nova review de filme
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tmdb_id
 *               - nota
 *             properties:
 *               tmdb_id:
 *                 type: integer
 *                 example: 550
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               titulo_review:
 *                 type: string
 *                 example: Obra-prima do cinema
 *               comentario:
 *                 type: string
 *                 example: Um dos melhores filmes que já vi
 *               spoiler:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Review criada com sucesso
 *       400:
 *         description: Dados inválidos ou nota fora do intervalo 1-5
 *       401:
 *         description: Não autenticado
 *
 * /api/reviews/minhas:
 *   get:
 *     summary: Obter reviews do usuário logado
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reviews do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *
 * /api/reviews/filme/{tmdb_id}:
 *   get:
 *     summary: Obter todas as reviews de um filme específico
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: tmdb_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme no TMDB
 *     responses:
 *       200:
 *         description: Lista de reviews do filme
 *
 * /api/reviews/{id}:
 *   put:
 *     summary: Atualizar review existente
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da review
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               titulo_review:
 *                 type: string
 *               comentario:
 *                 type: string
 *               spoiler:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Review atualizada com sucesso
 *       404:
 *         description: Review não encontrada ou sem permissão
 *   delete:
 *     summary: Excluir review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review excluída com sucesso
 *       404:
 *         description: Review não encontrada ou sem permissão
 *
 * /api/reviews/{id}/curtir:
 *   post:
 *     summary: Curtir uma review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da review
 *     responses:
 *       200:
 *         description: Review curtida com sucesso
 *
 * /api/favorites:
 *   get:
 *     summary: Obter lista de filmes favoritos do usuário
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de filmes favoritos com detalhes do TMDB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Filme'
 *   post:
 *     summary: Adicionar filme aos favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tmdb_id
 *             properties:
 *               tmdb_id:
 *                 type: integer
 *                 example: 550
 *     responses:
 *       201:
 *         description: Filme adicionado aos favoritos
 *       400:
 *         description: TMDB ID obrigatório ou filme já está nos favoritos
 *
 * /api/favorites/{tmdb_id}:
 *   delete:
 *     summary: Remover filme dos favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdb_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme no TMDB
 *     responses:
 *       200:
 *         description: Filme removido dos favoritos
 *       404:
 *         description: Filme não encontrado nos favoritos
 *
 * /api/watchlist:
 *   get:
 *     summary: Obter lista "Quero Ver" do usuário
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de filmes que o usuário quer ver
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Filme'
 *   post:
 *     summary: Adicionar filme à lista "Quero Ver"
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tmdb_id
 *             properties:
 *               tmdb_id:
 *                 type: integer
 *                 example: 550
 *     responses:
 *       201:
 *         description: Filme adicionado à lista "Quero Ver"
 *       400:
 *         description: TMDB ID obrigatório ou filme já está na lista
 *
 * /api/watchlist/{tmdb_id}:
 *   delete:
 *     summary: Remover filme da lista "Quero Ver"
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdb_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme no TMDB
 *     responses:
 *       200:
 *         description: Filme removido da lista "Quero Ver"
 *       404:
 *         description: Filme não encontrado na lista
 *
 * /api/chat:
 *   post:
 *     summary: Enviar mensagem para o chat com IA (Pipoqueiro Assistant)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: Me recomende filmes de ficção científica
 *               historico:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *                 description: Histórico da conversa (opcional)
 *     responses:
 *       200:
 *         description: Resposta da IA gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resposta gerada
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       example: Aqui estão minhas recomendações de ficção científica...
 *       400:
 *         description: Mensagem não fornecida
 *       401:
 *         description: Não autenticado
 *
 * /api/health:
 *   get:
 *     summary: Health check da API
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API Pipoqueiro funcionando!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

export {}; // Para tornar este arquivo um módulo
