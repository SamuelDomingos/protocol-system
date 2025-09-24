const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Protocol = sequelize.define('Protocol', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'protocols',
  timestamps: true
});

module.exports = Protocol;
