const { Message, User } = require('../models');
const { buildAdvancedFilters, formatPaginatedResponse } = require('../utils/queryBuilder');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, message } = req.body;

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Usuário destino não encontrado' });

    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      subject,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err);
    res.status(500).json({ message: 'Erro interno ao enviar mensagem' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filterOptions = {
      searchFields: ['subject', 'message'],
      filterFields: ['isRead'],
      includes: [{ 
        model: User, 
        as: 'sender', 
        attributes: ['id', 'name', 'role'] 
      }],
      defaultSort: [['createdAt', 'DESC']]
    };

    const { where, order, limit: queryLimit, offset, include } = buildAdvancedFilters(
      { ...req.query, receiverId: req.user.id }, 
      filterOptions
    );

    // Adicionar filtro obrigatório do receiverId
    where.receiverId = req.user.id;

    const result = await Message.findAndCountAll({
      where,
      include,
      order,
      limit: queryLimit,
      offset
    });

    const response = formatPaginatedResponse(result, page, limit, 'messages');
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Erro ao buscar mensagens:', err);
    res.status(500).json({ message: 'Erro interno ao buscar mensagens' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findOne({
      where: {
        id,
        receiverId: req.user.id // só quem recebeu pode marcar como lida
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada ou não pertence a você' });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ message: 'Mensagem marcada como lida' });
  } catch (err) {
    console.error('❌ Erro ao marcar mensagem como lida:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
};

// Novo método para listar todas as mensagens (enviadas e recebidas) com filtros avançados
exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filterOptions = {
      searchFields: ['subject', 'message'],
      filterFields: ['isRead', 'senderId', 'receiverId'],
      includes: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ],
      defaultSort: [['createdAt', 'DESC']]
    };

    const { where, order, limit: queryLimit, offset, include } = buildAdvancedFilters(
      req.query, 
      filterOptions
    );

    const result = await Message.findAndCountAll({
      where,
      include,
      order,
      limit: queryLimit,
      offset
    });

    const response = formatPaginatedResponse(result, page, limit, 'messages');
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Erro ao buscar todas as mensagens:', err);
    res.status(500).json({ message: 'Erro interno ao buscar mensagens' });
  }
};

