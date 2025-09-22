const express = require('express');
const router = express.Router();

const {authenticate} = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const checkPermission = require('../middlewares/checkPermission');
const protocolsController = require('../controllers/protocols.controller');

/**
 * @swagger
 * /protocols:
 *   post:
 *     summary: Cria um novo protocolo com estágios
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, stages]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Protocolo Detox Completo
 *               clientId:
 *                 type: integer
 *                 example: 3
 *               isTemplate:
 *                 type: boolean
 *                 example: false
 *               stages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name, value, intervalDays]
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Dose 1 - Detox
 *                     value:
 *                       type: number
 *                       example: 0
 *                     intervalDays:
 *                       type: integer
 *                       example: 7
 *     responses:
 *       201:
 *         description: Protocolo criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */
router.post('/', authenticate, role(), checkPermission('protocols', 'create'), protocolsController.createProtocol);

/**
 * @swagger
 * /protocols/{id}:
 *   put:
 *     summary: Atualiza um protocolo e seus estágios
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, stages]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Novo Protocolo Detox
 *               clientId:
 *                 type: integer
 *                 example: 3
 *               isTemplate:
 *                 type: boolean
 *                 example: false
 *               stages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name, value, intervalDays]
 *                   properties:
 *                     name:
 *                       type: string
 *                     value:
 *                       type: number
 *                     intervalDays:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Protocolo atualizado com sucesso
 *       404:
 *         description: Protocolo não encontrado
 *       500:
 *         description: Erro interno
 */
router.put('/:id', authenticate, role(), checkPermission('protocols', 'update'), protocolsController.updateProtocol);

/**
 * @swagger
 * /protocols/{id}:
 *   delete:
 *     summary: Remove um protocolo e seus estágios
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Protocolo removido com sucesso
 *       404:
 *         description: Protocolo não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete('/:id', authenticate, role(), checkPermission('protocols', 'delete'), protocolsController.deleteProtocol);

/**
 * @swagger
 * /protocols:
 *   get:
 *     summary: Lista todos os protocolos com paginação e filtros
 *     tags: [Protocols]
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título ou nome do cliente
 *     responses:
 *       200:
 *         description: Lista de protocolos com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 protocols:
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
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/', authenticate, role(), checkPermission('protocols', 'read'), protocolsController.getAllProtocols);

/**
 * @swagger
 * /protocols/{id}:
 *   get:
 *     summary: Retorna um protocolo específico com estágios, cliente e criador
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do protocolo
 *     responses:
 *       200:
 *         description: Protocolo retornado
 *       404:
 *         description: Protocolo não encontrado
 *       500:
 *         description: Erro interno
 */
router.get('/:id', authenticate, role(), checkPermission('protocols', 'read'), protocolsController.getProtocolById);

module.exports = router;