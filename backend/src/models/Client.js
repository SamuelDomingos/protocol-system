// models/Client.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  observation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Client;
