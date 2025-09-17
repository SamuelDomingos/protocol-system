const { Protocol, Stage, Client, User } = require('../models');
const protocolSchema = require('../validation/protocolSchema');
const sequelize = require('../config/database');

exports.createProtocol = async (req, res) => {
  const { error, value } = protocolSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { clientId, title, stages, isTemplate } = value;

  try {
    // Verificar cliente apenas se não for um template
    if (!isTemplate) {
      const client = await Client.findByPk(clientId);
      if (!client) return res.status(400).json({ message: 'Client not found' });
    }

    const result = await sequelize.transaction(async (t) => {
      const protocol = await Protocol.create({
        title,
        clientId: isTemplate ? null : clientId,
        createdBy: req.user.id,
        isTemplate
      }, { transaction: t });

      const stagesWithOrder = stages.map((stage, index) => ({
        ...stage,
        order: index + 1,
        protocolId: protocol.id
      }));

      const createdStages = await Stage.bulkCreate(stagesWithOrder, { transaction: t });

      return { protocol, stages: createdStages };
    });

    res.status(201).json({
      ...result.protocol.toJSON(),
      stages: result.stages
    });

  } catch (err) {
    console.error('❌ Error creating protocol:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProtocol = async (req, res) => {
  const { id } = req.params;
  const { error, value } = protocolSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { clientId, title, stages, isTemplate } = value;

  try {
    const protocol = await Protocol.findByPk(id);
    if (!protocol) return res.status(404).json({ message: 'Protocol not found' });

    // Verificar cliente apenas se não for um template
    if (!isTemplate) {
      const client = await Client.findByPk(clientId);
      if (!client) return res.status(400).json({ message: 'Client not found' });
    }

    await sequelize.transaction(async (t) => {
      // Atualiza os dados principais do protocolo
      await protocol.update({ 
        clientId: isTemplate ? null : clientId, 
        title, 
        isTemplate 
      }, { transaction: t });

      // Remove estágios antigos
      await Stage.destroy({ where: { protocolId: protocol.id }, transaction: t });

      // Cria novos estágios
      const stagesWithOrder = stages.map((stage, index) => ({
        ...stage,
        order: index + 1,
        protocolId: protocol.id
      }));

      await Stage.bulkCreate(stagesWithOrder, { transaction: t });
    });

    // Retorna protocolo atualizado com estágios
    const updatedStages = await Stage.findAll({ where: { protocolId: id } });

    res.status(200).json({
      ...protocol.toJSON(),
      stages: updatedStages
    });
  } catch (err) {
    console.error('❌ Error updating protocol:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProtocol = async (req, res) => {
  const { id } = req.params;

  try {
    const protocol = await Protocol.findByPk(id);
    if (!protocol) return res.status(404).json({ message: 'Protocol not found' });

    await sequelize.transaction(async (t) => {
      await Stage.destroy({ where: { protocolId: id }, transaction: t });
      await protocol.destroy({ transaction: t });
    });

    res.status(200).json({ message: 'Protocol deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting protocol:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllProtocols = async (req, res) => {
  try {
    const protocols = await Protocol.findAll({
      include: [
        {
          model: Stage,
          as: 'stages',
          order: [['order', 'ASC']]
        },
        {
          model: Client,
          attributes: ['id', 'name', 'cpf']
        }
      ]
    });

    res.status(200).json(protocols);
  } catch (err) {
    console.error('❌ Error fetching protocols:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProtocolById = async (req, res) => {
  try {
    const { id } = req.params;

    const protocol = await Protocol.findByPk(id, {
      include: [
        {
          model: Stage,
          as: 'stages',
          order: [['order', 'ASC']]
        },
        {
          model: Client,
          attributes: ['id', 'name', 'cpf', 'phone', 'observation']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    if (!protocol) {
      return res.status(404).json({ message: 'Protocol not found' });
    }

    res.status(200).json(protocol);
  } catch (err) {
    console.error('❌ Error fetching protocol by id:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
