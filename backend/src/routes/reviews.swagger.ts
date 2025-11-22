/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Criar nova review
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
 *         description: Dados inválidos
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
 *
 * /api/reviews/{id}:
 *   put:
 *     summary: Atualizar review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Review atualizada
 *       404:
 *         description: Review não encontrada
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
 *         description: Review excluída
 *       404:
 *         description: Review não encontrada
 */
