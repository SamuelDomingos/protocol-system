const express = require('express');
const router = express.Router();
const { 
  getAllStages, 
  getStageById, 
  findByProtocolId, 
  createStage, 
  updateStage, 
  deleteStage, 
  reorderStages 
} = require('./stages.controller');
const { authenticate } = require('../Auth/authMiddleware');

router.use(authenticate);

router.get('/', getAllStages);
router.get('/:id', getStageById);
router.get('/protocol/:protocolId', findByProtocolId);
router.post('/', createStage);
router.put('/:id', updateStage);
router.delete('/:id', deleteStage);
router.post('/protocol/:protocolId/reorder', reorderStages);

module.exports = router;