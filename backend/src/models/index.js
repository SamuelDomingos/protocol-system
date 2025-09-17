// models/index.js
const sequelize = require('../config/database');

// Importa todos os modelos
const User = require('./User');
const Client = require('./Client');
const Protocol = require('./Protocol');
const Stage = require('./Stage');
const Application = require('./Application');
const Permission = require('./Permission');
const Message = require('./Message');

// 📌 RELACIONAMENTOS

// 1. Protocolos têm vários estágios
Protocol.hasMany(Stage, { foreignKey: 'protocolId', as: 'stages' });
Stage.belongsTo(Protocol, { foreignKey: 'protocolId' });

// 2. Cliente tem vários protocolos
Client.hasMany(Protocol, { foreignKey: 'clientId' });
Protocol.belongsTo(Client, { foreignKey: 'clientId' });

// 3. Usuário (fechamento) cria protocolos
User.hasMany(Protocol, { foreignKey: 'createdBy' });
Protocol.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// 4. Etapa tem aplicação
Stage.hasMany(Application, { foreignKey: 'stageId' });
Application.belongsTo(Stage, { foreignKey: 'stageId' });

// 5. Usuário (técnico) faz aplicação
User.hasMany(Application, { foreignKey: 'nurseId' });
Application.belongsTo(User, { foreignKey: 'nurseId', as: 'nurse' });

// 6. Usuário tem várias permissões
User.hasMany(Permission, { foreignKey: 'userId' });
Permission.belongsTo(User, { foreignKey: 'userId' });

// Um usuário pode enviar várias mensagens
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
// Um usuário pode receber várias mensagens
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Associar remetente e destinatário
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected!');

    // sequelize.sync({ alter: true })
    
  } catch (err) {
    console.error('❌ DB init error:', err);
    throw err;
  }
};

module.exports = {
  sequelize,
  initDB,
  User,
  Client,
  Protocol,
  Stage,
  Application,
  Permission,
  Message
};
