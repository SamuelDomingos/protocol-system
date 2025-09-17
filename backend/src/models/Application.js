const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  stageId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nurseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clientPhoto: {
    type: DataTypes.TEXT('long'), // Base64 string ou path
    allowNull: false
  },
  clientSignature: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  nurseSignature: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'applied'),
    defaultValue: 'applied'
  }
});

module.exports = Application;
