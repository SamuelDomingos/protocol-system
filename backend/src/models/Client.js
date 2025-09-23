const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    observation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "clients",
    // Remove os indexes problemáticos
  }
);

Client.associate = (models) => {
  Client.hasMany(models.Protocol, {
    foreignKey: "clientId",
    as: "protocols",
  });
};

module.exports = Client;
