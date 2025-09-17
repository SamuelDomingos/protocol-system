const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const messagesController = require('../controllers/messages.controller');

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Envia uma mensagem/sugestão para outro usuário
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId, message]
 *             properties:
 *               receiverId:
 *                 type: integer
 *               subject:
 *                 type: string
 *                 example: Dúvida sobre aplicação
 *               message:
 *                 type: string
 *                 example: Olá, gostaria de sugerir um novo protocolo!
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 */
router.post('/', auth, role(), messagesController.sendMessage);

/**
 * @swagger
 * /messages/inbox:
 *   get:
 *     summary: Retorna a caixa de entrada do usuário logado
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensagens recebidas
 */
router.get('/inbox', auth, role(), messagesController.getInbox);

/**
 * @swagger
 * /messages/{id}/read:
 *   patch:
 *     summary: Marca uma mensagem como lida
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mensagem marcada como lida
 *       404:
 *         description: Mensagem não encontrada ou sem permissão
 *       500:
 *         description: Erro interno
 */
router.patch('/:id/read', auth, role(), messagesController.markAsRead);

module.exports = router;
