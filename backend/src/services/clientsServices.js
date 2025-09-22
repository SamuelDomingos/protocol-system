const Client = require('../models/Client');
const { Op } = require('sequelize');
const { buildAdvancedFilters } = require('../utils/queryBuilder');

exports.create = async (data) => {
  return Client.create(data);
};

exports.findAllPaginated = async (query) => {
  const filterOptions = {
    searchFields: ['name', 'phone', 'cpf', 'observation'],
    filterFields: [],
    includes: [],
    defaultSort: [['createdAt', 'DESC']]
  };

  const { where, order, limit, offset, include } = buildAdvancedFilters(query, filterOptions);

  return Client.findAndCountAll({ where, include, order, limit, offset });
};

exports.findById = async (id) => {
  return Client.findByPk(id);
};

exports.update = async (id, data) => {
  const client = await Client.findByPk(id);
  if (!client) return null;
  return client.update(data);
};

exports.delete = async (id) => {
  const client = await Client.findByPk(id);
  if (!client) return false;
  await client.destroy();
  return true;
};

exports.search = async (term) => {
  if (!term || term.trim() === '') return [];
  return Client.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${term}%` } },
        { cpf:  { [Op.like]: `%${term}%` } }
      ]
    },
    limit: 10,
    order: [['name', 'ASC']]
  });
};
