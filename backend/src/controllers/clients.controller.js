const asyncHandler = require('../utils/asyncHandler');
const clientService = require('../services/clientsServices');
const { formatPaginatedResponse } = require('../utils/queryBuilder');

exports.createClient = asyncHandler(async (req, res) => {
  const newClient = await clientService.create(req.validatedBody);
  res.status(201).json(newClient);
});

exports.getAllClients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await clientService.findAllPaginated(req.query);
  const response = formatPaginatedResponse(result, page, limit, 'clients');
  res.json(response);
});

exports.updateClient = asyncHandler(async (req, res) => {
  const updated = await clientService.update(req.params.id, req.validatedBody);
  if (!updated) return res.status(404).json({ message: 'Client not found' });
  res.json(updated);
});

exports.deleteClient = asyncHandler(async (req, res) => {
  const ok = await clientService.delete(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Client not found' });
  res.json({ message: 'Client deleted successfully' });
});

exports.searchClients = asyncHandler(async (req, res) => {
  const clients = await clientService.search(req.query.q);
  res.json(clients);
});