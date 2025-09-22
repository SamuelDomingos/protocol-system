const sequelize = require('../config/database');

const User = require('./User');
const Client = require('./Client');
const Protocol = require('./Protocol');
const Stage = require('./Stage');
const Application = require('./Application');
const Permission = require('./Permission');
const Message = require('./Message');
const StockLocation = require('./StockLocation');
const { StockMovement } = require('./StockMovement'); 

Protocol.hasMany(Stage, { foreignKey: 'protocolId', as: 'stages' });
Stage.belongsTo(Protocol, { foreignKey: 'protocolId' });

Client.hasMany(Protocol, { foreignKey: 'clientId' });
Protocol.belongsTo(Client, { foreignKey: 'clientId' });

User.hasMany(Protocol, { foreignKey: 'createdBy' });
Protocol.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Stage.hasMany(Application, { foreignKey: 'stageId' });
Application.belongsTo(Stage, { foreignKey: 'stageId' });

User.hasMany(Application, { foreignKey: 'nurseId' });
Application.belongsTo(User, { foreignKey: 'nurseId', as: 'nurse' });

User.hasMany(Permission, { foreignKey: 'userId' });
Permission.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

StockLocation.hasMany(StockMovement, { foreignKey: 'locationId' });
StockMovement.belongsTo(StockLocation, { foreignKey: 'locationId', as: 'location' });

StockLocation.hasMany(StockMovement, { foreignKey: 'fromLocationId' });
StockMovement.belongsTo(StockLocation, { foreignKey: 'fromLocationId', as: 'fromLocation' });

StockLocation.hasMany(StockMovement, { foreignKey: 'toLocationId' });
StockMovement.belongsTo(StockLocation, { foreignKey: 'toLocationId', as: 'toLocation' });

User.hasMany(StockMovement, { foreignKey: 'userId' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected!');

    // Sincroniza modelos com o banco
    await sequelize.sync({ alter: false }); 
    // ⚠️ alter: true -> adapta tabelas sem apagar dados
    // ⚠️ force: true -> recria tabelas (APAGA tudo!)

    console.log('🔄 Models synchronized with database!');
    
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
  Message,
  StockLocation,
  StockMovement
};
