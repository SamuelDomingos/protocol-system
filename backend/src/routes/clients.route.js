const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const clientsController = require('../controllers/clients.controller');

// Criar cliente
/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: João da Silva
 *               phone:
 *                 type: string
 *                 example: (11) 91234-5678
 *               cpf:
 *                 type: string
 *                 example: 403.973.345-54
 *               observation:
 *                 type: string
 *                 example: Cliente com alergia a penicilina
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/', auth, role(), checkPermission('clients', 'create'), clientsController.createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Lista todos os clientes cadastrados
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   cpf:
 *                     type: string
 *                   observation:
 *                     type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 */
router.get('/', auth, role(), checkPermission('clients', 'read'), clientsController.getAllClients);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Atualiza as informações de um cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               cpf:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno
 */
router.put('/:id', auth, role(), checkPermission('clients', 'update'), clientsController.updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Remove um cliente do sistema
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente a ser removido
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete('/:id', auth, role(), checkPermission('clients', 'delete'), clientsController.deleteClient);

/**
 * @swagger
 * /clients/search:
 *   get:
 *     summary: Busca clientes por nome ou CPF
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Termo de busca (nome ou CPF)
 *     responses:
 *       200:
 *         description: Lista de clientes encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   cpf:
 *                     type: string
 *                   observation:
 *                     type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno
 */
router.get('/search', auth, role(), checkPermission('clients', 'read'), clientsController.searchClients);

module.exports = router;
