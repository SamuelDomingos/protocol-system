const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/authMiddleware');
const stockMovementsController = require('../controllers/stockMovements.controller');

/**
 * @swagger
 * /stock-movements:
 *   post:
 *     summary: Cria um novo movimento de estoque
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - type
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [in, out, transfer]
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *               locationId:
 *                 type: string
 *               fromLocationId:
 *                 type: string
 *               toLocationId:
 *                 type: string
 *               unitCost:
 *                 type: number
 *               batchNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Movimento de estoque criado com sucesso
 *       400:
 *         description: Dados inválidos ou usuário não autenticado
 *       401:
 *         description: Não autorizado
 */
router.post('/', authenticate, stockMovementsController.createStockMovement);

/**
 * @swagger
 * /stock-movements:
 *   get:
 *     summary: Lista movimentos de estoque com paginação e filtros
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: ID do produto
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [in, out, transfer]
 *         description: Tipo de movimento
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         description: ID da localização
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por motivo ou número do lote
 *     responses:
 *       200:
 *         description: Lista de movimentos de estoque com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stockMovements:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 */
router.get('/', authenticate, stockMovementsController.getAllStockMovements);

/**
 * @swagger
 * /stock-movements/{id}:
 *   get:
 *     summary: Busca um movimento de estoque pelo ID
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do movimento de estoque
 *     responses:
 *       200:
 *         description: Movimento de estoque encontrado
 *       404:
 *         description: Movimento de estoque não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', authenticate, stockMovementsController.getStockMovementById);

/**
 * @swagger
 * /stock-movements/{id}:
 *   put:
 *     summary: Atualiza um movimento de estoque
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do movimento de estoque
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unitCost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Movimento de estoque atualizado com sucesso
 *       404:
 *         description: Movimento de estoque não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', authenticate, stockMovementsController.updateStockMovement);

/**
 * @swagger
 * /stock-movements/{id}:
 *   delete:
 *     summary: Remove um movimento de estoque
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do movimento de estoque
 *     responses:
 *       200:
 *         description: Movimento de estoque removido com sucesso
 *       404:
 *         description: Movimento de estoque não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', authenticate, stockMovementsController.deleteStockMovement);

module.exports = router;