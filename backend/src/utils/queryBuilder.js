const { Op } = require('sequelize');

const buildAdvancedFilters = (queryParams, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    startDate,
    endDate,
    ...filters
  } = queryParams;

  const {
    searchFields = [],
    filterFields = [],
    includes = [],
    defaultSort = [['createdAt', 'DESC']]
  } = options;

  // Construir WHERE clause
  const where = {};

  // Filtros específicos
  filterFields.forEach(field => {
    if (filters[field] !== undefined && filters[field] !== '') {
      if (typeof filters[field] === 'string' && filters[field].includes(',')) {
        // Múltiplos valores separados por vírgula
        where[field] = { [Op.in]: filters[field].split(',') };
      } else {
        where[field] = filters[field];
      }
    }
  });

  // Busca textual
  if (search && searchFields.length > 0) {
    where[Op.or] = searchFields.map(field => ({
      [field]: { [Op.like]: `%${search}%` }
    }));
  }

  // Filtros de data
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  // Ordenação
  let order = defaultSort;
  if (sortBy && ['name', 'createdAt', 'updatedAt', 'title', 'location', 'status'].includes(sortBy)) {
    order = [[sortBy, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];
  }

  // Paginação
  const offset = (parseInt(page) - 1) * parseInt(limit);

  return {
    where,
    order,
    limit: parseInt(limit),
    offset,
    include: includes
  };
};

const formatPaginatedResponse = (result, page, limit, dataKey = 'data') => {
  const { count, rows } = result;
  
  return {
    [dataKey]: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < Math.ceil(count / limit),
      hasPrevPage: parseInt(page) > 1
    }
  };
};

module.exports = {
  buildAdvancedFilters,
  formatPaginatedResponse
};