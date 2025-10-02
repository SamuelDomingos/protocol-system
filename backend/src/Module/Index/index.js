const { Sequelize } = require("sequelize");
const sequelize = require("../../config/database");

const User = require("../User/User");
const Client = require("../Client/Client");
const Protocol = require("../Protocol/Protocol");
const Stage = require("../Stage/Stage");
const Application = require("../Application/Application");
const Permission = require("../Permission/Permission");
const Message = require("../Message/Message");
<<<<<<< HEAD
const StockLocation = require("../Stock/models/StockLocation");
const { StockMovement } = require("../Stock/models/StockMovement");
const Product = require("../Product/Product");
const Supplier = require("../Supplier/Supplier");
const Kit = require("../Kit/models/Kit");
const KitProduct = require("../Kit/models/KitProduct");
=======
const StockLocation = require("../Stock/StockLocation");
const { StockMovement } = require("../Stock/StockMovement");
const Product = require("../Product/Product");
const Supplier = require("../Supplier/Supplier");
const Kit = require("../Kit/Kit");
const KitProduct = require("../Kit/KitProduct");
>>>>>>> 662c9195f1552aabe09dd68a6ae35cbb357ea64d

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
  Product,
  Supplier,
  Kit,
  KitProduct,
};

const SYNC_ORDER = [
  ["User", "Client"],
  ["Product"],
  ["Supplier"],
  ["Protocol"],
  ["Kit"],
  ["KitProduct"],
  ["Stage", "Permission", "Message"],
  ["StockLocation"],
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

  StockMovement.belongsTo(User, { foreignKey: "userId", as: "user" });
  StockMovement.belongsTo(Product, { foreignKey: "productId", as: "product" });

  StockLocation.belongsTo(Supplier, {
    foreignKey: "location",
    as: "supplierLocation",
  });
  StockLocation.belongsTo(Product, { foreignKey: "productId", as: "product" });

  Supplier.hasMany(StockLocation, {
    foreignKey: "location",
    as: "stockLocations",
  });

  Product.hasMany(StockLocation, {
    foreignKey: "productId",
    as: "stockLocations",
  });
  Product.hasMany(StockMovement, {
    foreignKey: "productId",
    as: "stockMovements",
  });

  Kit.belongsToMany(Product, {
    through: KitProduct,
    foreignKey: "kitId",
    as: "products",
  });
  Product.belongsToMany(Kit, {
    through: KitProduct,
    foreignKey: "productId",
    as: "kits",
  });
};

const syncModelsInOrder = async (options = {}) => {
  const { force = false, alter = false } = options;

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
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.drop(); // Drop all tables
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

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
