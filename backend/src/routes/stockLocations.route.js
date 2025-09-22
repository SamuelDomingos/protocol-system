const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const stockLocationsController = require('../controllers/stockLocations.controller');

/**
 * @swagger
 * /stock-locations:
 *   post:
 *     summary: Cria um novo local de estoque
 *     tags: [Stock Locations]
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
 *               - location
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               location:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 0
 *               price:
 *                 type: number
 *               sku:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Local de estoque criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', authenticate, stockLocationsController.createStockLocation);

/**
 * @swagger
 * /stock-locations:
 *   get:
 *     summary: Lista locais de estoque com paginação e filtros
 *     tags: [Stock Locations]
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
 *         name: location
 *         schema:
 *           type: string
 *         description: Nome da localização
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por localização ou SKU
 *     responses:
 *       200:
 *         description: Lista de locais de estoque com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stockLocations:
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
router.get('/', authenticate, stockLocationsController.getAllStockLocations);

/**
 * @swagger
 * /stock-locations/{id}:
 *   get:
 *     summary: Busca um local de estoque pelo ID
 *     tags: [Stock Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do local de estoque
 *     responses:
 *       200:
 *         description: Local de estoque encontrado
 *       404:
 *         description: Local de estoque não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', authenticate, stockLocationsController.getStockLocationById);

/**
 * @swagger
 * /stock-locations/{id}:
 *   put:
 *     summary: Atualiza um local de estoque
 *     tags: [Stock Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do local de estoque
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               sku:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Local de estoque atualizado com sucesso
 *       404:
 *         description: Local de estoque não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', authenticate, stockLocationsController.updateStockLocation);

/**
 * @swagger
 * /stock-locations/{id}:
 *   delete:
 *     summary: Remove um local de estoque
 *     tags: [Stock Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do local de estoque
 *     responses:
 *       200:
 *         description: Local de estoque removido com sucesso
 *       404:
 *         description: Local de estoque não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', authenticate, stockLocationsController.deleteStockLocation);

module.exports = router;