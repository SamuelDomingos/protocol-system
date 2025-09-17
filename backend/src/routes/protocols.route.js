const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
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
router.post('/', auth, role(), checkPermission('protocols', 'create'), protocolsController.createProtocol);

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
router.put('/:id', auth, role(), checkPermission('protocols', 'update'), protocolsController.updateProtocol);

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
router.delete('/:id', auth, role(), checkPermission('protocols', 'delete'), protocolsController.deleteProtocol);

/**
 * @swagger
 * /protocols:
 *   get:
 *     summary: Lista todos os protocolos com seus estágios
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: template
 *         in: query
 *         description: Se true, retorna apenas os modelos (isTemplate=true)
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de protocolos
 *       500:
 *         description: Erro interno
 */
router.get('/', auth, role(), checkPermission('protocols', 'read'), protocolsController.getAllProtocols);

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
router.get('/:id', auth, role(), checkPermission('protocols', 'read'), protocolsController.getProtocolById);

module.exports = router;