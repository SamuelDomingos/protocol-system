const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // para clientPhoto

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const applicationsController = require('../controllers/applications.controller');

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Registra uma nova aplicação para um estágio
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - stageId
 *               - appliedAt
 *               - clientPhoto
 *               - clientSignature
 *               - nurseSignature
 *             properties:
 *               stageId:
 *                 type: integer
 *                 example: 12
 *               appliedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-04-10T14:00:00.000Z"
 *               clientPhoto:
 *                 type: string
 *                 format: binary
 *               clientSignature:
 *                 type: string
 *                 example: data:image/png;base64,iVBORw0KGgo...
 *               nurseSignature:
 *                 type: string
 *                 example: data:image/png;base64,iVBORw0KGgo...
 *     responses:
 *       201:
 *         description: Aplicação registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */
router.post(
  '/',
  auth,
  role(),
  checkPermission('applications', 'create'),
  upload.single('clientPhoto'),
  applicationsController.createApplication
);

/**
 * @swagger
 * /applications/{id}:
 *   put:
 *     summary: Atualiza uma aplicação existente
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appliedAt:
 *                 type: string
 *                 format: date-time
 *               clientSignature:
 *                 type: string
 *               nurseSignature:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [applied, pending]
 *     responses:
 *       200:
 *         description: Aplicação atualizada
 *       404:
 *         description: Aplicação não encontrada
 *       500:
 *         description: Erro interno
 */
router.put('/:id', auth, role(), checkPermission('applications', 'update'), applicationsController.updateApplication);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Remove uma aplicação
 *     tags: [Applications]
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
 *         description: Aplicação deletada com sucesso
 *       404:
 *         description: Aplicação não encontrada
 *       500:
 *         description: Erro interno
 */
router.delete('/:id', auth, role(), checkPermission('applications', 'delete'), applicationsController.deleteApplication);

/**
 * @swagger
 * /applications/stage/{stageId}:
 *   get:
 *     summary: Lista todas as aplicações de um estágio
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: stageId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do estágio
 *     responses:
 *       200:
 *         description: Lista de aplicações retornada
 *       404:
 *         description: Estágio não encontrado
 *       500:
 *         description: Erro interno
 */
router.get('/stage/:stageId', auth, role(), checkPermission('applications', 'read'), applicationsController.getApplicationsByStage);

/**
 * @swagger
 * /permissions/{userId}/force-complete:
 *   post:
 *     summary: Concede permissão para conclusão forçada de aplicações
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
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
 *             properties:
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissão de conclusão forçada concedida
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/:userId/force-complete', 
  auth, 
  role(), 
  checkPermission('permissions', 'update'),
  applicationsController.completeApplication
);

module.exports = router;
