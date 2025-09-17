const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Protocol = sequelize.define('Protocol', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Protocol;
