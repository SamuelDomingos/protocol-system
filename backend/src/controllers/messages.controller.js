const { Message, User } = require('../models');

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
    const inbox = await Message.findAll({
      where: { receiverId: req.user.id },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(inbox);
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

