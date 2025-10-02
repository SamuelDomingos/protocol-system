const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const checkPermission = require('../../middlewares/checkPermission');
const role = require('../../middlewares/roleMiddleware');
const {authenticate} = require('../Auth/authMiddleware');

/**
 * @swagger
 * /permissions/{userId}:
 *   get:
 *     summary: Lista todas as permissões de um usuário
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de permissões retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissions:
 *                   type: object
 *                   properties:
 *                     clients:
 *                       type: object
 *                       properties:
 *                         canCreate:
 *                           type: boolean
 *                         canRead:
 *                           type: boolean
 *                         canUpdate:
 *                           type: boolean
 *                         canDelete:
 *                           type: boolean
 *                         allowedPages:
 *                           type: array
 *                           items:
 *                             type: string
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Nenhuma permissão encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:userId', authenticate, permissionController.listPermissions);

/**
 * @swagger
 * /permissions/{userId}:
 *   put:
 *     summary: Atualiza as permissões de um usuário
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     module:
 *                       type: string
 *                     canCreate:
 *                       type: boolean
 *                     canRead:
 *                       type: boolean
 *                     canUpdate:
 *                       type: boolean
 *                     canDelete:
 *                       type: boolean
 *                     allowedPages:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Permissões atualizadas com sucesso
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:userId', authenticate, role(), checkPermission('permissions', 'update'), permissionController.updatePermissions);

/**
 * @swagger
 * /permissions/{userId}/{module}:
 *   delete:
 *     summary: Remove uma permissão específica de um usuário
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *       - name: module
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do módulo
 *     responses:
 *       200:
 *         description: Permissão removida com sucesso
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Permissão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:userId/:module', authenticate, role(), checkPermission('permissions', 'delete'), permissionController.removePermission);


module.exports = router;