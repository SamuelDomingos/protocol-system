// controllers/clientsController.js
const Client = require('../models/Client');
const clientSchema = require('../validation/clientSchema');
const { Op } = require('sequelize');

exports.createClient = async (req, res) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Só verifica duplicidade se o CPF não for vazio
    if (value.cpf && value.cpf.trim() !== '') {
      const exists = await Client.findOne({ where: { cpf: value.cpf } });
      if (exists) return res.status(400).json({ message: 'CPF already registered' });
    }

    const newClient = await Client.create(value);
    res.status(201).json(newClient);
  } catch (err) {
    console.error('❌ Error creating client:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (err) {
    console.error('❌ Error fetching clients:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = clientSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Só verifica duplicidade se o CPF não for vazio
    if (value.cpf && value.cpf.trim() !== '') {
      const duplicate = await Client.findOne({
        where: {
          cpf: value.cpf,
          id: { [Op.ne]: id }
        }
      });
      if (duplicate) return res.status(400).json({ message: 'CPF already in use by another client' });
    }

    await client.update(value);
    res.status(200).json(client);
  } catch (err) {
    console.error('❌ Error updating client:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    await client.destroy();
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting client:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    // Se não houver termo de busca, retorna uma lista vazia
    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(200).json([]);
    }

    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { cpf: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      limit: 10,
      order: [['name', 'ASC']]
    });

    res.status(200).json(clients);
  } catch (err) {
    console.error('❌ Error searching clients:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

