const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./User");
const Client = require("./Client");
const Protocol = require("./Protocol");
const Stage = require("./Stage");
const Application = require("./Application");
const Permission = require("./Permission");
const Message = require("./Message");
const StockLocation = require("./stock/StockLocation");
const { StockMovement } = require("./stock/StockMovement");
const Product = require("./stock/Product");

const models = {
  User,
  Client,
  Protocol,
  Stage,
  Application,
  Permission,
  Message,
  StockLocation,
  StockMovement,
};

const SYNC_ORDER = [
  ["User", "Client", "StockLocation"],
  ["Protocol", "Permission", "Message"],
  ["Stage"],
  ["Application", "StockMovement"],
];

const setupAssociations = () => {
  User.hasMany(Protocol, { foreignKey: "createdBy", as: "createdProtocols" });
  User.hasMany(Application, { foreignKey: "nurseId", as: "applications" });
  User.hasMany(Permission, { foreignKey: "userId", as: "permissions" });
  User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
  User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });
  User.hasMany(StockMovement, { foreignKey: "userId", as: "stockMovements" });

  Client.hasMany(Protocol, { foreignKey: "clientId", as: "protocols" });

  Protocol.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
  Protocol.belongsTo(Client, { foreignKey: "clientId", as: "client" });
  Protocol.hasMany(Stage, { foreignKey: "protocolId", as: "stages" });

  Stage.belongsTo(Protocol, { foreignKey: "protocolId", as: "protocol" });
  Stage.hasMany(Application, { foreignKey: "stageId", as: "applications" });

  Application.belongsTo(Stage, { foreignKey: "stageId", as: "stage" });
  Application.belongsTo(User, { foreignKey: "nurseId", as: "nurse" });

  Permission.belongsTo(User, { foreignKey: "userId", as: "user" });

  Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

  StockLocation.hasMany(StockMovement, {
    foreignKey: "locationId",
    as: "movements",
  });
  StockLocation.hasMany(StockMovement, {
    foreignKey: "fromLocationId",
    as: "movementsFrom",
  });
  StockLocation.hasMany(StockMovement, {
    foreignKey: "toLocationId",
    as: "movementsTo",
  });

  StockMovement.belongsTo(StockLocation, {
    foreignKey: "locationId",
    as: "location",
  });
  StockMovement.belongsTo(StockLocation, {
    foreignKey: "fromLocationId",
    as: "fromLocation",
  });
  StockMovement.belongsTo(StockLocation, {
    foreignKey: "toLocationId",
    as: "toLocation",
  });
  StockMovement.belongsTo(User, { foreignKey: "userId", as: "user" });

  Product.hasMany(StockLocation, {
    foreignKey: "productId",
    as: "stockLocations",
  });

  Product.hasMany(StockMovement, {
    foreignKey: "productId",
    as: "stockMovements",
  });
};

const syncModelsInOrder = async (options = {}) => {
  const { force = false, alter = false } = options;

  if (force) {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  }

  for (const [index, level] of SYNC_ORDER.entries()) {
    await Promise.all(
      level.map((modelName) =>
        models[modelName].sync({ force: force, alter: alter })
      )
    );
  }

  if (force) {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
};

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    setupAssociations();

    await syncModelsInOrder({ alter: false });

    console.log("🎉 Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

const resetDB = async () => {
  try {
    setupAssociations();
    await syncModelsInOrder({ force: true });

    console.log("🆕 Database reset completed");
    return true;
  } catch (error) {
    console.error("❌ Database reset failed:", error.message);
    throw error;
  }
};

const closeDB = async () => {
  try {
    await sequelize.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  Sequelize,

  ...models,

  initDB,
  resetDB,
  closeDB,

  setupAssociations,
  syncModelsInOrder,
};
